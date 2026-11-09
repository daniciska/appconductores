// Acciones del panel. Escriben en los datos compartidos de la demo (useDemo.setState): el navegador los
// guarda en la misma clave que la demo del conductor, así que la otra pestaña ve los cambios en vivo.
// Antes vivían en la tienda común (src/datos/tienda.ts); ahí ya no queda nada del panel.
//
// Cada acción revisa el permiso del rol de esta pestaña (permisos.ts): la interfaz no ofrece lo que el
// rol no puede hacer, y esto es un segundo resguardo. Todo queda en el registro de acciones, firmado por
// rol (registro.ts). Las que pueden no hacerse devuelven un Resultado, para no mostrar un aviso de éxito falso.
import { ajustesIniciales, reglasIniciales } from '@/datos/estado';
import * as sel from '@/datos/selectores';
import { ahoraISO, cambiarDocumento, docAprobado, extraAlAprobar, nuevoId, useDemo, type Resultado } from '@/datos/tienda';
import type { Ajustes, CodigoRegla, DocumentoUsuario, MotivoRechazoId, Reporte, RolEquipo, TipoDocumentoId, UsoRegla } from '@/datos/tipos';

import { firmaDe, puede, type Permiso } from '../permisos';
import { rolActual } from '../sesion';
import { NOMBRE_DOC_CON_ARTICULO } from './lecturas';
import { escribirEnRegistro, registrarConEspera as registrarConEsperaEnRegistro } from './registro';

const permitido = (p: Permiso) => puede(rolActual(), p);

// ---------------------------------------------------------------------------
// Registro de acciones
// ---------------------------------------------------------------------------

/** Cómo firma ahora la persona que usa esta pestaña ("Tú (revisor)"). */
const firmaActual = () => firmaDe(rolActual());

/** Agrega una línea al registro de acciones del equipo, firmada con el rol de esta pestaña. */
export function registrarAccion(que: string): void {
  escribirEnRegistro(firmaActual(), que);
}

/** Deja en el registro algo que el equipo vio (abrir un archivo, ver un RUN, leer una conversación reportada). */
export function registrarLectura(que: string): void {
  registrarAccion(que);
}

/** Como registrarAccion, pero solo el último de varios cambios seguidos (ver registro.ts). La firma es la de ahora. */
function registrarConEspera(clave: string, que: () => string, ms = 900): void {
  registrarConEsperaEnRegistro(clave, firmaActual(), que, ms);
}

// ---------------------------------------------------------------------------
// Documentos (revisor y administrador)
// ---------------------------------------------------------------------------

function nombreDueno(duenoId: string): string {
  const s = useDemo.getState();
  if (duenoId === sel.ID_USUARIO) return sel.nombreCompleto(s.cuenta) || 'el conductor de la demo';
  const c = s.conductores.find((x) => x.id === duenoId);
  return c ? sel.nombreCompleto(c) : duenoId;
}

function documentoDe(duenoId: string, tipo: TipoDocumentoId): DocumentoUsuario | undefined {
  const s = useDemo.getState();
  if (duenoId === sel.ID_USUARIO) return s.documentos[tipo];
  return s.conductores.find((c) => c.id === duenoId)?.documentos[tipo];
}

const YA_NO_ESPERA = 'Este documento ya no espera revisión.';

/** Aprueba un documento que espera a una persona. duenoId: 'yo' (conductor de la demo) o un ficticio. */
export function aprobarDocumento(duenoId: string, tipo: TipoDocumentoId): Resultado {
  if (!permitido('decidir_documentos')) return { ok: false, error: 'Tu rol no puede decidir documentos.' };
  // Si mientras tanto cambió (lo aprobó "Aprobar ahora", lo subió de nuevo…), no se pisa.
  if (documentoDe(duenoId, tipo)?.estado !== 'en_revision') return { ok: false, error: YA_NO_ESPERA };
  const r = cambiarDocumento(useDemo.getState(), duenoId, tipo, (d) => docAprobado(d, 'persona'), extraAlAprobar(tipo));
  useDemo.setState(r.cambios);
  registrarAccion(`Aprobó ${NOMBRE_DOC_CON_ARTICULO[tipo]} de ${nombreDueno(duenoId)}`);
  return { ok: true };
}

/** No aprueba un documento, con su motivo (el conductor lo ve en su app). */
export function rechazarDocumento(duenoId: string, tipo: TipoDocumentoId, motivo: MotivoRechazoId): Resultado {
  if (!permitido('decidir_documentos')) return { ok: false, error: 'Tu rol no puede decidir documentos.' };
  if (documentoDe(duenoId, tipo)?.estado !== 'en_revision') return { ok: false, error: YA_NO_ESPERA };
  const r = cambiarDocumento(useDemo.getState(), duenoId, tipo, (d) => ({
    ...d,
    estado: 'rechazado',
    etapa: null,
    revisadoEn: ahoraISO(),
    venceEn: null,
    quienDecidio: 'persona',
    motivo,
  }));
  useDemo.setState(r.cambios);
  const nombreMotivo = useDemo.getState().catalogos.motivosRechazo.find((m) => m.id === motivo)?.nombre ?? motivo;
  registrarAccion(`No aprobó ${NOMBRE_DOC_CON_ARTICULO[tipo]} de ${nombreDueno(duenoId)} (${nombreMotivo})`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Reportes y cuentas (revisor y administrador)
// ---------------------------------------------------------------------------

const SOLO_ADMINISTRADOR: Resultado = { ok: false, error: 'Solo un administrador puede cambiar esto.' };
const SIN_PERMISO_REPORTES: Resultado = { ok: false, error: 'Tu rol no puede resolver reportes.' };

/** Suspende o reactiva una cuenta (titular o conductor ficticio) y lo anota con el nombre. */
export function cambiarSuspension(personaId: string, nombre: string, suspendido: boolean): Resultado {
  if (!permitido('suspender_cuentas')) return { ok: false, error: 'Tu rol no puede suspender cuentas.' };
  useDemo.setState((s) => ({
    titulares: s.titulares.map((t) => (t.id === personaId ? { ...t, suspendido } : t)),
    conductores: s.conductores.map((c) => (c.id === personaId ? { ...c, suspendido } : c)),
  }));
  registrarAccion(`${suspendido ? 'Suspendió' : 'Reactivó'} la cuenta de ${nombre}`);
  return { ok: true };
}

// Lo que puede hacer el equipo al resolver un reporte (R18): ocultar mensajes o suspender la cuenta.
export type QueSeHizo = 'sin_accion' | 'mensaje_oculto' | 'suspender';

export const OPCIONES_RESOLUCION: { clave: QueSeHizo; titulo: string; descripcion: string }[] = [
  { clave: 'sin_accion', titulo: 'Sin acción', descripcion: 'No infringe las reglas.' },
  { clave: 'mensaje_oculto', titulo: 'Ocultar los mensajes', descripcion: 'Quien reportó deja de verlos.' },
  { clave: 'suspender', titulo: 'Suspender la cuenta', descripcion: 'Sale de los matches y no puede escribir.' },
];

/**
 * Oculta, en la conversación del conductor de la demo, los mensajes reportados de la persona reportada
 * (los de la copia del reporte). Las conversaciones entre personas ficticias no tienen pantalla: ahí
 * queda solo lo anotado en el reporte.
 */
function ocultarMensajesReportados(reporte: Reporte): void {
  if (!reporte.busquedaId) return;
  const conductorDeLaDemo = reporte.quienReporta.id === sel.ID_USUARIO || reporte.reportado.id === sel.ID_USUARIO;
  if (!conductorDeLaDemo) return;
  const autor = reporte.reportado.rol;
  const ids = new Set(reporte.conversacion.filter((m) => m.autor === autor).map((m) => m.id));
  const busquedaId = reporte.busquedaId;
  useDemo.setState((s) => {
    const lista = s.mensajes[busquedaId];
    if (!lista) return {};
    return { mensajes: { ...s.mensajes, [busquedaId]: lista.map((m) => (ids.has(m.id) ? { ...m, oculto: true } : m)) } };
  });
}

/** Resuelve un reporte. Si se elige suspender, suspende la cuenta reportada (no la del conductor de la demo). */
export function resolverReporteCon(reporte: Reporte, opcion: QueSeHizo, nota: string): Resultado {
  if (!permitido('resolver_reportes')) return SIN_PERMISO_REPORTES;
  if (useDemo.getState().reportes.find((r) => r.id === reporte.id)?.estado !== 'abierto') return { ok: false, error: 'Este reporte ya está resuelto.' };
  if (opcion === 'suspender') {
    if (reporte.reportado.id === sel.ID_USUARIO) return { ok: false, error: 'En la demo no se suspende al conductor de la demo.' };
    const r = cambiarSuspension(reporte.reportado.id, reporte.reportado.nombre, true);
    if (!r.ok) return r;
  }
  if (opcion === 'mensaje_oculto') ocultarMensajesReportados(reporte);
  const texto = opcion === 'suspender' ? 'Cuenta suspendida' : opcion === 'mensaje_oculto' ? 'Mensajes ocultados' : 'Sin acción';
  const queSeHizo = nota.trim() ? `${texto}. ${nota.trim()}` : texto;
  useDemo.setState((s) => ({
    reportes: s.reportes.map((r) => (r.id === reporte.id ? { ...r, estado: 'resuelto', queSeHizo, resueltoEl: ahoraISO() } : r)),
  }));
  registrarAccion(`Resolvió un reporte: ${queSeHizo}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Reglas del match (solo administrador)
// ---------------------------------------------------------------------------

/** Umbral del match (0 a 100) desde el control deslizante: cambia en vivo y se registra al soltar. */
export function fijarUmbral(valor: number): void {
  if (!permitido('cambiar_reglas')) return;
  const umbral = Math.min(100, Math.max(0, Math.round(valor)));
  useDemo.setState((s) => ({ reglas: { ...s.reglas, umbral } }));
  registrarConEspera('umbral', () => `Cambió el umbral del match a ${useDemo.getState().reglas.umbral} %`);
}

/** Peso de una variable del % (0 a 10). */
export function fijarPeso(codigo: CodigoRegla, peso: number): void {
  if (!permitido('cambiar_reglas')) return;
  const valor = Math.max(0, Math.min(10, Math.round(peso)));
  useDemo.setState((s) => ({
    reglas: { ...s.reglas, reglas: s.reglas.reglas.map((r) => (r.codigo === codigo ? { ...r, peso: valor } : r)) },
  }));
  registrarConEspera(`peso-${codigo}`, () => {
    const r = useDemo.getState().reglas.reglas.find((x) => x.codigo === codigo);
    return `Cambió el peso de ${r?.nombre ?? codigo} a ${r?.peso ?? valor}`;
  });
}

/** Cómo cuenta una regla (filtro, variable del % o apagada), con su nombre en el registro. */
export function fijarUsoRegla(codigo: CodigoRegla, uso: UsoRegla): void {
  if (!permitido('cambiar_reglas')) return;
  useDemo.setState((s) => ({ reglas: { ...s.reglas, reglas: s.reglas.reglas.map((r) => (r.codigo === codigo ? { ...r, uso } : r)) } }));
  const r = useDemo.getState().reglas.reglas.find((x) => x.codigo === codigo);
  const texto = uso === 'filtro' ? 'filtro obligatorio' : uso === 'variable' ? 'variable del %' : 'apagada';
  registrarAccion(`Dejó «${r?.nombre ?? codigo}» como ${texto}`);
}

export function restablecerReglas(): void {
  if (!permitido('cambiar_reglas')) return;
  useDemo.setState({ reglas: reglasIniciales() });
  registrarAccion('Restableció las reglas del match');
}

// ---------------------------------------------------------------------------
// Catálogos (solo administrador)
// ---------------------------------------------------------------------------

export function cambiarNegocioActivo(negocioId: string, activo: boolean): void {
  if (!permitido('cambiar_catalogos')) return;
  const s = useDemo.getState();
  const n = s.catalogos.negocios.find((x) => x.id === negocioId);
  useDemo.setState({
    catalogos: { ...s.catalogos, negocios: s.catalogos.negocios.map((x) => (x.id === negocioId ? { ...x, activo } : x)) },
  });
  registrarAccion(`${activo ? 'Activó' : 'Apagó'} el negocio ${n?.nombre ?? negocioId}`);
}

export function renombrarNegocio(negocioId: string, nombre: string): Resultado {
  if (!permitido('cambiar_catalogos')) return SOLO_ADMINISTRADOR;
  const limpio = nombre.trim();
  if (!limpio) return { ok: false, error: 'Escribe un nombre.' };
  const s = useDemo.getState();
  useDemo.setState({
    catalogos: { ...s.catalogos, negocios: s.catalogos.negocios.map((x) => (x.id === negocioId ? { ...x, nombre: limpio } : x)) },
  });
  registrarAccion(`Cambió el nombre del negocio a ${limpio}`);
  return { ok: true };
}

export function cambiarIndustriaActiva(industriaId: string, activo: boolean): void {
  if (!permitido('cambiar_catalogos')) return;
  const s = useDemo.getState();
  const i = s.catalogos.industrias.find((x) => x.id === industriaId);
  useDemo.setState({
    catalogos: { ...s.catalogos, industrias: s.catalogos.industrias.map((x) => (x.id === industriaId ? { ...x, activo } : x)) },
  });
  registrarAccion(`${activo ? 'Activó' : 'Apagó'} la industria ${i?.nombre ?? industriaId}`);
}

/** Cambia el nombre de un tipo de vehículo (categoría de experiencia del Paso 3). */
export function renombrarTamano(tamanoId: string, nombre: string): Resultado {
  if (!permitido('cambiar_catalogos')) return SOLO_ADMINISTRADOR;
  const limpio = nombre.trim();
  if (!limpio) return { ok: false, error: 'Escribe un nombre.' };
  useDemo.setState((s) => ({
    catalogos: { ...s.catalogos, tamanos: s.catalogos.tamanos.map((t) => (t.id === tamanoId ? { ...t, nombre: limpio } : t)) },
  }));
  registrarAccion(`Cambió el nombre de un tipo de vehículo a ${limpio}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Zonas y comunas (solo administrador)
// ---------------------------------------------------------------------------

export function renombrarZona(zonaId: string, nombre: string): Resultado {
  if (!permitido('cambiar_zonas')) return SOLO_ADMINISTRADOR;
  const limpio = nombre.trim();
  if (!limpio) return { ok: false, error: 'Escribe un nombre.' };
  const s = useDemo.getState();
  useDemo.setState({ catalogos: { ...s.catalogos, zonas: s.catalogos.zonas.map((z) => (z.id === zonaId ? { ...z, nombre: limpio } : z)) } });
  registrarAccion(`Cambió el nombre de una zona a ${limpio}`);
  return { ok: true };
}

/** La comuna solo puede ir a una zona de su misma región. */
export function moverComunaAZona(comunaId: string, zonaId: string): Resultado {
  if (!permitido('cambiar_zonas')) return SOLO_ADMINISTRADOR;
  const s = useDemo.getState();
  const comuna = s.catalogos.comunas.find((c) => c.id === comunaId);
  const zona = s.catalogos.zonas.find((z) => z.id === zonaId);
  if (!comuna || !zona) return { ok: false, error: 'No encontramos la comuna o la zona.' };
  if (comuna.regionId !== zona.regionId) return { ok: false, error: 'La comuna solo puede ir a una zona de su región.' };
  useDemo.setState({ catalogos: { ...s.catalogos, comunas: s.catalogos.comunas.map((c) => (c.id === comunaId ? { ...c, zonaId } : c)) } });
  registrarAccion(`Movió ${comuna.nombre} a la zona ${zona.nombre}`);
  return { ok: true };
}

export function crearZona(regionId: string, nombre: string): string | null {
  if (!permitido('cambiar_zonas')) return null;
  const s = useDemo.getState();
  const limpio = nombre.trim() || 'Zona nueva';
  const orden = s.catalogos.zonas.filter((z) => z.regionId === regionId).reduce((m, z) => Math.max(m, z.orden), 0) + 1;
  const id = `${regionId}-z${orden}-${Date.now().toString(36)}`;
  useDemo.setState({ catalogos: { ...s.catalogos, zonas: [...s.catalogos.zonas, { id, regionId, nombre: limpio, orden }] } });
  registrarAccion(`Creó la zona ${limpio}`);
  return id;
}

// ---------------------------------------------------------------------------
// Ajustes (solo administrador)
// ---------------------------------------------------------------------------

/** Cambia un ajuste con un texto legible en el registro ("Días para reconfirmar disponibilidad: 45"). */
export function fijarAjuste<K extends keyof Ajustes>(clave: K, valor: Ajustes[K], etiqueta: string): void {
  if (!permitido('cambiar_ajustes')) return;
  useDemo.setState((s) => ({ ajustes: { ...s.ajustes, [clave]: valor } }));
  registrarConEspera(
    `ajuste-${String(clave)}`,
    () => {
      const v = useDemo.getState().ajustes[clave];
      const texto = typeof v === 'boolean' ? (v ? 'encendido' : 'apagado') : String(v);
      return `Cambió "${etiqueta}" a ${texto}`;
    },
    typeof valor === 'boolean' ? 0 : 900,
  );
}

export function restablecerAjustes(): void {
  if (!permitido('cambiar_ajustes')) return;
  useDemo.setState({ ajustes: ajustesIniciales() });
  registrarAccion('Restableció los ajustes');
}

// ---------------------------------------------------------------------------
// Equipo (solo administrador; nunca sobre su propia fila)
// ---------------------------------------------------------------------------

const textoRol = (rol: RolEquipo) => (rol === 'administrador' ? 'Administrador' : 'Revisor');

export function agregarMiembro({ nombre, celular, rol }: { nombre: string; celular: string; rol: RolEquipo }): Resultado {
  if (!permitido('gestionar_equipo')) return SOLO_ADMINISTRADOR;
  const limpio = nombre.trim();
  if (!limpio) return { ok: false, error: 'Escribe su nombre.' };
  useDemo.setState((s) => ({
    equipo: [...s.equipo, { id: nuevoId('e'), nombre: limpio, celular: celular.trim(), rol, activo: true, agregadoEl: ahoraISO() }],
  }));
  registrarAccion(`Agregó a ${limpio} como ${textoRol(rol)}`);
  return { ok: true };
}

export function cambiarRolMiembro(miembroId: string, rol: RolEquipo): Resultado {
  if (!permitido('gestionar_equipo')) return SOLO_ADMINISTRADOR;
  const m = useDemo.getState().equipo.find((x) => x.id === miembroId);
  useDemo.setState((s) => ({ equipo: s.equipo.map((x) => (x.id === miembroId ? { ...x, rol } : x)) }));
  registrarAccion(`Dejó a ${m?.nombre ?? 'una persona del equipo'} como ${textoRol(rol)}`);
  return { ok: true };
}

export function alternarMiembroActivo(miembroId: string): Resultado {
  if (!permitido('gestionar_equipo')) return SOLO_ADMINISTRADOR;
  const m = useDemo.getState().equipo.find((x) => x.id === miembroId);
  useDemo.setState((s) => ({ equipo: s.equipo.map((x) => (x.id === miembroId ? { ...x, activo: !x.activo } : x)) }));
  registrarAccion(`${m?.activo ? 'Quitó' : 'Devolvió'} el acceso al panel a ${m?.nombre ?? 'una persona del equipo'}`);
  return { ok: true };
}

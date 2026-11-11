// Implementación REAL de la interfaz de datos del conductor: Supabase (Auth + base de datos).
// Las pantallas son las mismas de la demo (aplicacion/src/pantallas); aquí está todo lo que cambia:
// pedir y verificar el código, leer los catálogos y el perfil propio, y guardar cada paso con su
// plan de escritura (./escrituras.ts), siempre armado sobre el perfil al día (./guardado.ts).
// La sesión: ./sesion.ts (token rechazado por la base, cerrar sesión sin conexión) y los avisos de
// Auth (otra pestaña cerró la sesión o entró otra persona). Especificación: docs/especificacion-app-conductor-v1.md.
import { useMemo, type ReactNode } from 'react';

import { configurarBorradores } from '@/datos/borradores';
import { ProveedorConductor, type ImplementacionPuerto } from '@/datos/puerto/contexto';
import { negocioPermitidoPorDeclaradas, negociosPorIndustria } from '@/datos/puerto/derivados';
import type {
  AccionesConductor,
  DestinoIngreso,
  Entorno,
  Resultado,
  VistaConductor,
} from '@/datos/puerto/tipos';

import { CONFIG } from '../config';
import { almacenSesion, supabase } from '../supabase';

import { mapearCatalogos } from './catalogos';
import { TEXTO, esErrorDeRed, textoErrorPedirCodigo, textoErrorVerificar } from './errores';
import {
  ejecutarPlan,
  planAutorizaciones,
  planConfirmarDisponibilidad,
  planDisponible,
  planPaso1,
  planPaso2,
  planPaso3,
  planPaso4,
  textosParaAceptar,
  type Plan,
  type ResultadoPlan,
} from './escrituras';
import { guardarAlDia } from './guardado';
import { leerCatalogos, leerPerfil } from './lecturas';
import { celularParaAuth, mapearPerfil, textosParaA4 } from './perfil';
import { cerrarSesionEnEsteEquipo, leerConSesion } from './sesion';
import {
  asegurarDuenoBorradores,
  avisarCambioDeSesion,
  guardarIngreso,
  leerIngreso,
  limpiarSesion,
  useTiendaReal,
  type EstadoReal,
} from './tiendaReal';

// Los borradores de la app real viven en su propia clave (la demo usa otra).
configurarBorradores('dale-app-borradores');

const OK: Resultado = { ok: true, valor: undefined };
const fallo = (error: string): Resultado<never> => ({ ok: false, error });
const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Segundos entre dos códigos al mismo número (Auth: Sms.MaxFrequency). */
const ESPERA_REENVIO_S = 60;

// ---------------------------------------------------------------------------
// Sesión y carga
// ---------------------------------------------------------------------------

/** Mientras se verifica un código: el aviso SIGNED_IN de Auth lo maneja verificarCodigo. */
let verificando = false;
/** Mientras esta pestaña cierra la sesión: el aviso SIGNED_OUT lo maneja quien la cierra. */
let cerrandoAqui = false;
let escuchando = false;
/**
 * ¿El perfil en la tienda es lo que hay en la base? Deja de serlo si un guardado falla a medias o si no
 * se pudo volver a leer; entonces el siguiente guardado lee primero (./guardado.ts).
 */
let perfilAlDia = true;

type ConSesion<T> = Resultado<T> | { ok: false; error: string; vencida: true };

/** Cierra la sesión solo en este equipo (también sin conexión) y deja la tienda sin sesión ni borradores. */
async function cerrarEnEsteEquipo(): Promise<void> {
  cerrandoAqui = true;
  try {
    // No se espera el aviso al servidor: la sesión ya quedó cerrada en este equipo.
    await cerrarSesionEnEsteEquipo(supabase, almacenSesion);
  } finally {
    cerrandoAqui = false;
  }
  limpiarSesion();
}

let expulsando: Promise<void> | null = null;
/** La base ya no acepta la sesión y no se pudo renovar: se cierra y se lleva a la persona a entrar de nuevo. */
function expulsar(): Promise<void> {
  expulsando ??= (async () => {
    const habia = !!useTiendaReal.getState().uid;
    guardarIngreso(null);
    await cerrarEnEsteEquipo();
    if (habia && useTiendaReal.getState().fase === 'listo') avisarCambioDeSesion(TEXTO.sesionVencida);
  })().finally(() => {
    expulsando = null;
  });
  return expulsando;
}

/** Lee el perfil propio y lo deja en la tienda. Devuelve si hay fila en cuentas. */
async function cargarPerfil(uid: string): Promise<ConSesion<{ hayCuenta: boolean }>> {
  const r = await leerConSesion(supabase, () => leerPerfil(supabase, uid));
  if (r.error) {
    perfilAlDia = false;
    if (r.vencida) {
      await expulsar();
      return { ok: false, error: TEXTO.sesionVencida, vencida: true };
    }
    return fallo(esErrorDeRed(r.error) ? TEXTO.guardarConexion : TEXTO.guardar);
  }
  // Si los borradores de esta pestaña son de otra persona, se borran antes de mostrar nada.
  asegurarDuenoBorradores(uid);
  const e = useTiendaReal.getState();
  const p = mapearPerfil(r.datos, e.mapas, e.textos);
  useTiendaReal.setState({
    uid,
    vista: { ...e.vista, cuenta: p.cuenta, conductor: p.conductor, ingreso: null, textosAutorizacion: p.textosAutorizacion },
    aceptados: p.aceptados,
    autorizacionesCompletas: p.autorizacionesCompletas,
  });
  perfilAlDia = true;
  return { ok: true, valor: { hayCuenta: !!r.datos.cuenta } };
}

function escucharSesion() {
  if (escuchando) return;
  escuchando = true;
  supabase.auth.onAuthStateChange((evento, sesion) => {
    // Dentro de este aviso no se llama a Supabase con await (la documentación advierte que puede
    // trabarse): lo que haga falta se agenda para después.
    if (evento === 'SIGNED_OUT') {
      // Se cerró fuera de esta pestaña (otra pestaña, o Auth ya no la renueva): se limpia la tienda y
      // los borradores, y el layout lleva a la Bienvenida.
      if (cerrandoAqui) return;
      setTimeout(() => {
        const habia = !!useTiendaReal.getState().uid;
        limpiarSesion();
        if (habia && useTiendaReal.getState().fase === 'listo') avisarCambioDeSesion(TEXTO.sesionCerrada);
      }, 0);
      return;
    }
    const e = useTiendaReal.getState();
    if (evento === 'SIGNED_IN' && sesion && !verificando && e.fase === 'listo' && sesion.user.id !== e.uid) {
      // Entró otra persona en otra pestaña del mismo navegador (la sesión es una sola por navegador).
      setTimeout(() => {
        void cargarPerfil(sesion.user.id).then((p) => {
          if (p.ok) avisarCambioDeSesion(null);
        });
      }, 0);
    }
  });
}

/**
 * Carga inicial (la llama la Puerta): catálogos y, si hay sesión guardada, el perfil propio.
 * Sin conexión, la Puerta muestra "No pudimos conectarnos" con "Reintentar".
 */
export async function iniciarAppReal(): Promise<void> {
  useTiendaReal.setState({ fase: 'cargando' });
  escucharSesion();
  const [primera, ses] = await Promise.all([leerConSesion(supabase, () => leerCatalogos(supabase)), supabase.auth.getSession()]);
  let cat = primera;
  if (primera.vencida) {
    // La base no acepta la sesión guardada y no se pudo renovar: se cierra y se leen sin sesión.
    await cerrarEnEsteEquipo();
    cat = await leerCatalogos(supabase);
  }
  if (cat.error) {
    useTiendaReal.setState({ fase: 'sin_conexion' });
    return;
  }
  const c = mapearCatalogos(cat.datos);
  const e = useTiendaReal.getState();
  useTiendaReal.setState({
    mapas: c.mapas,
    textos: c.textos,
    diasReconfirmar: c.diasReconfirmar,
    vista: { ...e.vista, catalogos: c.catalogos, textosAutorizacion: textosParaA4(c.textos, e.aceptados) },
  });
  const sesion = primera.vencida ? null : ses.data.session;
  if (sesion) {
    const p = await cargarPerfil(sesion.user.id);
    if (!p.ok && !('vencida' in p)) {
      useTiendaReal.setState({ fase: 'sin_conexion' });
      return;
    }
    if (p.ok && !p.valor.hayCuenta) {
      // La cuenta no existe (o la base no la deja ver): se cierra la sesión de este equipo.
      await cerrarEnEsteEquipo();
    }
  } else {
    limpiarSesion();
  }
  useTiendaReal.setState({ fase: 'listo' });
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

/**
 * Corre el plan que arma `armar` (sobre el perfil al día) y vuelve a leer el perfil: la base manda
 * (por ejemplo, si quitó negocios). Si la base ya no acepta la sesión, se cierra.
 */
async function guardar(armar: (e: EstadoReal) => Plan): Promise<Resultado> {
  const uid = useTiendaReal.getState().uid;
  if (!uid) return fallo(TEXTO.sesionVencida);
  const r = await guardarAlDia(
    {
      alDia: () => perfilAlDia,
      marcarDesactualizado: () => {
        perfilAlDia = false;
      },
      releer: async (): Promise<ResultadoPlan> => {
        const p = await cargarPerfil(uid);
        return p.ok ? OK : p;
      },
      ejecutar: (plan) => ejecutarPlan(supabase, plan),
    },
    () => armar(useTiendaReal.getState()),
  );
  if (!r.ok && 'vencida' in r) await expulsar();
  return r.ok ? OK : fallo(r.error);
}

const ahora = () => new Date().toISOString();
const digitos = (t: string) => t.replace(/\D/g, '');

function destinoTrasIngresar(): DestinoIngreso {
  const e = useTiendaReal.getState();
  if (e.vista.conductor.registrado) return 'inicio';
  if (e.autorizacionesCompletas) return 'paso1';
  return 'autorizaciones';
}

const acciones: AccionesConductor = {
  async pedirCodigo(celular8, canal, opciones) {
    const ocho = digitos(celular8).slice(-8);
    if (!opciones?.reenvio) {
      // Volvió de A3 a revisar su número y lo envía igual antes de los 60 s: el código que ya le llegó
      // sirve, así que se sigue a A3 (con la espera que queda) sin pedir otro.
      const previo = leerIngreso();
      if (previo && digitos(previo.celular) === ocho && Date.now() - previo.pedidoEn < ESPERA_REENVIO_S * 1000) return OK;
      // Ya entró con ese número (por ejemplo, salió de A3 mientras se verificaba): no hace falta otro
      // código; al pasar a A3, la guardia la lleva a donde corresponde.
      const sesion = (await supabase.auth.getSession()).data.session;
      if (sesion && digitos(sesion.user.phone ?? '').endsWith('569' + ocho)) return OK;
    }
    const { error } = await supabase.auth.signInWithOtp({ phone: celularParaAuth(celular8), options: { channel: canal } });
    if (error) return fallo(textoErrorPedirCodigo(error, CONFIG.codigosDePrueba));
    guardarIngreso({ celular: `${ocho.slice(0, 4)} ${ocho.slice(4)}`, canal, pedidoEn: Date.now() });
    return OK;
  },

  async verificarCodigo(codigo) {
    const ingreso = leerIngreso();
    if (!ingreso) return fallo('Vuelve a pedir el código.');
    const telefono = celularParaAuth(ingreso.celular);
    verificando = true;
    try {
      // Si un intento anterior ya verificó el código pero no alcanzó a leer el perfil, se sigue desde ahí.
      const previa = (await supabase.auth.getSession()).data.session;
      let uid = previa && digitos(previa.user.phone ?? '') === digitos(telefono) ? previa.user.id : null;
      if (!uid) {
        const { data, error } = await supabase.auth.verifyOtp({ phone: telefono, token: codigo, type: 'sms' });
        if (error || !data.session) return fallo(textoErrorVerificar(error ?? {}));
        uid = data.session.user.id;
      }
      // La cuenta la crea la base al confirmarse el código. Si no aparece, se reintenta una vez.
      let p = await cargarPerfil(uid);
      if (p.ok && !p.valor.hayCuenta) {
        await esperar(1000);
        p = await cargarPerfil(uid);
      }
      if (!p.ok) return fallo('vencida' in p ? p.error : TEXTO.conexion);
      if (!p.valor.hayCuenta) {
        await cerrarEnEsteEquipo();
        return fallo(TEXTO.sinCuenta);
      }
      guardarIngreso(null);
      return { ok: true, valor: destinoTrasIngresar() };
    } finally {
      verificando = false;
    }
  },

  async aceptarAutorizaciones(marcas) {
    // Las casillas de A4 salen de esta misma lista (vista.textosAutorizacion): una por texto obligatorio
    // vigente. Se registran solo las versiones que faltan (las ya aceptadas no se duplican).
    const textos = textosParaAceptar(marcas, useTiendaReal.getState().textos);
    if (!textos.ok) return textos;
    const r = await guardar((e) => planAutorizaciones(e.uid ?? '', textos.valor, e.aceptados));
    if (!r.ok) return r;
    return useTiendaReal.getState().autorizacionesCompletas ? OK : fallo(TEXTO.sinTextos);
  },

  async guardarPaso1(d) {
    const primeraVez = !useTiendaReal.getState().vista.conductor.registrado;
    const r = await guardar((e) =>
      planPaso1(e.uid ?? '', d, { registrado: e.vista.conductor.registrado, clasesDeclaradas: e.vista.conductor.clasesDeclaradas }, e.mapas, ahora()),
    );
    return r.ok ? { ok: true, valor: { primeraVez } } : r;
  },

  async guardarPaso2(d) {
    if (!d.comunaId) return fallo('Elige tu comuna de la lista.');
    const comunaId = d.comunaId;
    return guardar((e) => planPaso2(e.uid ?? '', { comunaId, tieneEstacionamiento: d.tieneEstacionamiento }));
  },

  async guardarPaso3(d) {
    return guardar((e) => planPaso3(e.uid ?? '', d, { experiencia: e.vista.conductor.experiencia, idiomas: e.vista.conductor.idiomas }, e.mapas));
  },

  async guardarPaso4(d) {
    return guardar((e) => {
      const v = e.vista;
      const visibles = negociosPorIndustria(v, true).flatMap((g) => g.negocios.map((n) => n.id));
      const permitidos = d.negocios.filter((id) => negocioPermitidoPorDeclaradas(v, id));
      const actual = { negocios: v.conductor.negocios, turnos: v.conductor.turnos, dias: v.conductor.dias };
      return planPaso4(e.uid ?? '', { ...d, negocios: permitidos }, actual, visibles, e.mapas);
    });
  },

  cambiarDisponible: (v) => guardar((e) => planDisponible(e.uid ?? '', v, ahora())),
  confirmarDisponibilidad: () => guardar((e) => planConfirmarDisponibilidad(e.uid ?? '', ahora())),

  async cerrarSesion() {
    // Solo en este equipo, también sin conexión (./sesion.ts). Se borran el celular pendiente y los borradores.
    guardarIngreso(null);
    await cerrarEnEsteEquipo();
  },
};

// ---------------------------------------------------------------------------
// Entorno y proveedor
// ---------------------------------------------------------------------------

const TEXTO_LEGAL_PRUEBA =
  'Los Términos y la Política de privacidad están en preparación con un abogado. Esta es una versión de prueba para el equipo.';

function useEntornoReal(): Entorno {
  const diasReconfirmar = useTiendaReal((s) => s.diasReconfirmar);
  return useMemo<Entorno>(
    () => ({
      esDemo: false,
      validarObligatorios: true,
      diasReconfirmar,
      esperaReenvioSegundos: ESPERA_REENVIO_S,
      notaCodigo: CONFIG.codigosDePrueba ? 'Versión de prueba: usa el código que te dio el equipo.' : null,
      pestanas: 2,
      ejemplo: null,
      textosLegales: { terminos: TEXTO_LEGAL_PRUEBA, privacidad: TEXTO_LEGAL_PRUEBA, nota: null, perfil: TEXTO_LEGAL_PRUEBA },
      textoCerrarSesion: 'Para volver a entrar usarás tu celular y un código.',
      volverDesdeAutorizaciones: 'cerrarSesion',
    }),
    [diasReconfirmar],
  );
}

const IMPLEMENTACION_REAL: ImplementacionPuerto = {
  useVista: <T,>(selector: (v: VistaConductor) => T) => useTiendaReal((s) => selector(s.vista)),
  useVistaCompleta: () => useTiendaReal((s) => s.vista),
  useEntorno: useEntornoReal,
  acciones,
};

export function ProveedorReal({ children }: { children: ReactNode }) {
  return <ProveedorConductor implementacion={IMPLEMENTACION_REAL}>{children}</ProveedorConductor>;
}

export { acciones as accionesReales };

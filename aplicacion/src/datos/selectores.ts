// Lecturas derivadas del estado de la demo (funciones puras: reciben el estado y devuelven datos).
// En pantallas, usa los hooks de ./hooks (memorizados) en vez de llamar estas funciones dentro de
// useDemo(selector): un selector que devuelve un arreglo nuevo en cada llamada hace re-render infinito.
import type { DatosDemo } from './estado';
import { textoDias, textoTurnos, edad } from './formato';
import {
  evaluarMatch,
  habilitaNegocio,
  visibleEnBolsa,
  cumplePerfilesBolsa,
  type CatalogoMatch,
  type ConductorParaMatch,
  type Precondicion,
  type ResultadoMatch,
} from './match';
import type {
  Busqueda,
  Comuna,
  ConductorFicticio,
  Dia,
  DocumentoUsuario,
  EntregaDatos,
  Industria,
  Mensaje,
  Negocio,
  PerfilesBolsa,
  Plan,
  Postulacion,
  Region,
  SeccionPerfil,
  TipoDocumentoId,
  Titular,
  Turno,
  VisibilidadBolsa,
  Zona,
} from './tipos';

/** Id con que el usuario de la demo aparece en postulaciones y reportes. */
export const ID_USUARIO = 'yo';

export const SECCIONES: { id: SeccionPerfil; paso: number; nombre: string }[] = [
  { id: 'datos', paso: 1, nombre: 'Tus datos' },
  { id: 'direccion', paso: 2, nombre: 'Dónde vives' },
  { id: 'experiencia', paso: 3, nombre: 'Tu experiencia' },
  { id: 'trabajo', paso: 4, nombre: '¿Qué trabajo buscas?' },
  { id: 'documentos', paso: 5, nombre: 'Tus documentos' },
];

export const TIPOS_DOC_ORDEN: TipoDocumentoId[] = ['cedula', 'licencia', 'hoja_vida', 'antecedentes'];

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

export const negocioPorId = (s: DatosDemo, id: string): Negocio | undefined =>
  s.catalogos.negocios.find((n) => n.id === id);
export const industriaPorId = (s: DatosDemo, id: string): Industria | undefined =>
  s.catalogos.industrias.find((i) => i.id === id);
export const comunaPorId = (s: DatosDemo, id: string | null | undefined): Comuna | undefined =>
  id ? s.catalogos.comunas.find((c) => c.id === id) : undefined;
export const zonaPorId = (s: DatosDemo, id: string | null | undefined): Zona | undefined =>
  id ? s.catalogos.zonas.find((z) => z.id === id) : undefined;
export const regionPorId = (s: DatosDemo, id: string | null | undefined): Region | undefined =>
  id ? s.catalogos.regiones.find((r) => r.id === id) : undefined;
export const titularPorId = (s: DatosDemo, id: string): Titular | undefined => s.titulares.find((t) => t.id === id);
export const busquedaPorId = (s: DatosDemo, id: string): Busqueda | undefined => s.busquedas.find((b) => b.id === id);
export const conductorFicticioPorId = (s: DatosDemo, id: string): ConductorFicticio | undefined =>
  s.conductores.find((c) => c.id === id);
export const tipoDocumentoPorId = (s: DatosDemo, id: TipoDocumentoId) =>
  s.catalogos.tiposDocumento.find((t) => t.id === id)!;
export const planPorId = (s: DatosDemo, id: string): Plan | undefined => s.catalogos.planes.find((p) => p.id === id);

/** ¿El negocio y su industria están activos? */
export function negocioActivo(s: DatosDemo, negocioId: string): boolean {
  const n = negocioPorId(s, negocioId);
  if (!n || !n.activo) return false;
  const i = industriaPorId(s, n.industriaId);
  return !!i && i.activo;
}

/** Negocios activos (negocio e industria activos), en orden. */
export function negociosActivos(s: DatosDemo): Negocio[] {
  return s.catalogos.negocios.filter((n) => negocioActivo(s, n.id)).sort((a, b) => a.orden - b.orden);
}

/** Negocios agrupados por industria. Con soloActivos (por defecto), solo lo que la app muestra. */
export function negociosPorIndustria(
  s: DatosDemo,
  soloActivos = true,
): { industria: Industria; negocios: Negocio[] }[] {
  return [...s.catalogos.industrias]
    .sort((a, b) => a.orden - b.orden)
    .filter((i) => !soloActivos || i.activo)
    .map((industria) => ({
      industria,
      negocios: s.catalogos.negocios
        .filter((n) => n.industriaId === industria.id && (!soloActivos || n.activo))
        .sort((a, b) => a.orden - b.orden),
    }))
    .filter((g) => g.negocios.length > 0);
}

export const zonasDeRegion = (s: DatosDemo, regionId: string): Zona[] =>
  s.catalogos.zonas.filter((z) => z.regionId === regionId).sort((a, b) => a.orden - b.orden);
export const comunasDeZona = (s: DatosDemo, zonaId: string): Comuna[] =>
  s.catalogos.comunas.filter((c) => c.zonaId === zonaId);
export const comunasDeRegion = (s: DatosDemo, regionId: string): Comuna[] =>
  s.catalogos.comunas.filter((c) => c.regionId === regionId);

/** Comuna, zona y región de una comuna. */
export function lugar(s: DatosDemo, comunaId: string | null | undefined) {
  const comuna = comunaPorId(s, comunaId);
  return { comuna, zona: zonaPorId(s, comuna?.zonaId), region: regionPorId(s, comuna?.regionId) };
}

// ---------------------------------------------------------------------------
// Textos
// ---------------------------------------------------------------------------

/** Lo que ve el conductor: razón social (empresa) o nombre (persona). */
export const nombreTitular = (t: Titular | undefined): string => (t ? (t.razonSocial ?? t.nombre) : 'Titular');
/** Insignia del titular: "Empresa revisada en SII" o "Cédula revisada". */
export const insigniaTitular = (t: Titular | undefined): string =>
  t?.tipo === 'empresa' ? 'Empresa revisada en SII' : 'Cédula revisada';

export function nombreCompleto(p: { nombres: string; apellido1: string; apellido2: string }): string {
  return [p.nombres, p.apellido1, p.apellido2].filter((x) => x && x.trim()).join(' ');
}

/** Nombre corto para saludar: primer nombre. */
export function primerNombre(s: DatosDemo): string {
  return s.cuenta.nombres.trim().split(/\s+/)[0] || 'Conductor';
}

/** "Retiro en Providencia · Día · Lu a Sá" */
export function textoCondiciones(s: DatosDemo, b: Busqueda): string {
  const comuna = comunaPorId(s, b.comunaId)?.nombre ?? 'comuna';
  return `Retiro en ${comuna} · ${textoTurnos(b.turnos)} · ${textoDias(b.dias)}`;
}

// ---------------------------------------------------------------------------
// Match del usuario
// ---------------------------------------------------------------------------

export function catalogoMatch(s: DatosDemo): CatalogoMatch {
  const c = s.catalogos;
  return { negocios: c.negocios, industrias: c.industrias, clases: c.clases, comunas: c.comunas };
}

export function conductorUsuarioParaMatch(s: DatosDemo): ConductorParaMatch {
  const c = s.conductor;
  return {
    estadoPerfil: c.estadoPerfil,
    estadoVerificacion: c.estadoVerificacion,
    disponible: c.disponible,
    suspendido: false,
    comunaId: c.comunaId,
    tieneEstacionamiento: c.tieneEstacionamiento,
    clasesRevisadas: c.clasesRevisadas,
    experiencia: c.experiencia,
    negocios: c.negocios,
    turnos: c.turnos,
    dias: c.dias,
  };
}

export const conductorFicticioParaMatch = (c: ConductorFicticio): ConductorParaMatch => ({ ...c });

/** Evalúa una búsqueda para el usuario de la demo. */
export function resultadoParaUsuario(s: DatosDemo, b: Busqueda): ResultadoMatch {
  const titular = titularPorId(s, b.titularId);
  return evaluarMatch({
    conductor: conductorUsuarioParaMatch(s),
    busqueda: b,
    catalogo: catalogoMatch(s),
    reglas: s.reglas,
    bloqueado: s.bloqueos.includes(b.titularId),
    titularSuspendido: titular?.suspendido,
  });
}

export interface MatchUsuario {
  /** Es el id de la búsqueda (sirve para /conductor/matches/[id] y /conductor/mensajes/[id]). */
  id: string;
  busqueda: Busqueda;
  titular: Titular;
  negocio: Negocio;
  comuna: Comuna | undefined;
  zona: Zona | undefined;
  resultado: ResultadoMatch;
  /** Automático (cálculo) o Postulación (el titular respondió desde la bolsa). */
  origen: 'automatico' | 'postulacion';
  /** false si dejó de cumplirse (se oculta de la lista, pero la conversación se conserva). */
  vigente: boolean;
  favorito: boolean;
  /** Fecha en que el titular compartió su contacto, o null. */
  contactoCompartidoEl: string | null;
  direccionCompartidaEl: string | null;
  noLeidos: number;
  condiciones: string;
}

function armarMatch(s: DatosDemo, b: Busqueda): MatchUsuario | null {
  const titular = titularPorId(s, b.titularId);
  const negocio = negocioPorId(s, b.negocioId);
  if (!titular || !negocio) return null;
  const resultado = resultadoParaUsuario(s, b);
  const porPostulacion = s.matchesPorPostulacion.includes(b.id);
  const bloqueado = s.bloqueos.includes(b.titularId);
  const { comuna, zona } = lugar(s, b.comunaId);
  return {
    id: b.id,
    busqueda: b,
    titular,
    negocio,
    comuna,
    zona,
    resultado,
    origen: resultado.hayMatch || !porPostulacion ? 'automatico' : 'postulacion',
    vigente: !bloqueado && (resultado.hayMatch || porPostulacion),
    favorito: s.favoritos.includes(b.id),
    contactoCompartidoEl: s.contactoCompartido[b.id] ?? null,
    direccionCompartidaEl: s.direccionCompartida[b.id] ?? null,
    noLeidos: (s.mensajes[b.id] ?? []).filter((m) => !m.leido && m.autor !== 'conductor').length,
    condiciones: textoCondiciones(s, b),
  };
}

/** Lista de matches vigentes del usuario, ordenados por % de coincidencia. */
export function matchesDelUsuario(s: DatosDemo): MatchUsuario[] {
  return s.busquedas
    .map((b) => armarMatch(s, b))
    .filter((m): m is MatchUsuario => !!m && m.vigente)
    .sort((a, b) => b.resultado.porcentaje - a.resultado.porcentaje || a.busqueda.id.localeCompare(b.busqueda.id));
}

/** Un match por id (aunque ya no esté vigente, para no romper un enlace abierto). */
export function matchDelUsuario(s: DatosDemo, busquedaId: string): MatchUsuario | null {
  const b = busquedaPorId(s, busquedaId);
  return b ? armarMatch(s, b) : null;
}

// ---------------------------------------------------------------------------
// Perfil, documentos y diagnóstico del usuario
// ---------------------------------------------------------------------------

export function avancePerfil(s: DatosDemo) {
  const faltantes = SECCIONES.filter((x) => !s.conductor.pasosListos[x.id]);
  const listos = SECCIONES.length - faltantes.length;
  return {
    listos,
    total: SECCIONES.length,
    porcentaje: Math.round((listos / SECCIONES.length) * 100),
    faltantes,
    /** Primer paso que falta (1 a 5), o null si está completo. */
    siguientePaso: faltantes[0]?.paso ?? null,
  };
}

/** ¿Vence en los próximos `dias` días? */
export function documentoVencePronto(doc: DocumentoUsuario, dias = 30, ahora = Date.now()): boolean {
  if (doc.estado !== 'aprobado' || !doc.venceEn) return false;
  const faltan = (new Date(doc.venceEn).getTime() - ahora) / (24 * 60 * 60 * 1000);
  return faltan <= dias;
}

export function resumenDocumentos(docs: Record<TipoDocumentoId, DocumentoUsuario>) {
  const lista = TIPOS_DOC_ORDEN.map((t) => docs[t]);
  return {
    total: lista.length,
    aprobados: lista.filter((d) => d.estado === 'aprobado').length,
    enRevision: lista.filter((d) => d.estado === 'en_revision').length,
    rechazados: lista.filter((d) => d.estado === 'rechazado').length,
    subidos: lista.filter((d) => d.estado === 'subido').length,
    faltan: lista.filter((d) => d.estado === 'falta').length,
    vencenPronto: lista.filter((d) => documentoVencePronto(d)).length,
    /** Todos tienen archivo (subido, en revisión, aprobado o rechazado). */
    todosConArchivo: lista.every((d) => d.estado !== 'falta'),
  };
}

export type EstadoInicio = 'incompleto' | 'en_revision' | 'con_observaciones' | 'verificado' | 'sin_matches';

/**
 * Qué muestra la pestaña Inicio del conductor:
 * B6 incompleto · C3 en revisión (o con observaciones) · C5 verificado con matches · C6 sin matches.
 */
export function estadoInicio(s: DatosDemo): EstadoInicio {
  const c = s.conductor;
  if (c.estadoPerfil !== 'completo') return 'incompleto';
  if (c.estadoVerificacion === 'con_observaciones') return 'con_observaciones';
  if (c.estadoVerificacion !== 'verificado') return 'en_revision';
  return matchesDelUsuario(s).length > 0 ? 'verificado' : 'sin_matches';
}

/** Por qué el usuario no tiene matches: condición previa que falla y conteo de búsquedas por motivo. */
export function diagnosticoMatches(s: DatosDemo) {
  const resultados = s.busquedas.map((b) => resultadoParaUsuario(s, b));
  const precondiciones = new Map<Precondicion, number>();
  const filtros = new Map<string, number>();
  let bajoUmbral = 0;
  for (const r of resultados) {
    if (r.precondicionFallida) {
      precondiciones.set(r.precondicionFallida, (precondiciones.get(r.precondicionFallida) ?? 0) + 1);
    } else if (r.filtrosFallidos.length > 0) {
      for (const f of r.filtrosFallidos) filtros.set(f, (filtros.get(f) ?? 0) + 1);
    } else if (!r.hayMatch) bajoUmbral += 1;
  }
  const c = s.conductor;
  let precondicion: Precondicion | null = null;
  if (c.estadoPerfil !== 'completo') precondicion = 'perfil_incompleto';
  else if (c.estadoVerificacion !== 'verificado') precondicion = 'no_verificado';
  else if (!c.disponible) precondicion = 'no_disponible';
  return {
    precondicion,
    busquedasEvaluadas: resultados.length,
    matches: resultados.filter((r) => r.hayMatch).length,
    porFiltro: Object.fromEntries(filtros) as Record<string, number>,
    bajoUmbral,
  };
}

/** ¿Las clases DECLARADAS permiten el negocio? (Paso 4: los que no, en gris con "Pide licencia X"). */
export function negocioPermitidoPorDeclaradas(s: DatosDemo, negocioId: string): boolean {
  const n = negocioPorId(s, negocioId);
  return !!n && habilitaNegocio(s.conductor.clasesDeclaradas, n, null, s.catalogos.clases);
}

/** Debe reconfirmar disponibilidad (pasaron diasReconfirmar desde la última confirmación). */
export function debeReconfirmarDisponibilidad(s: DatosDemo, ahora = Date.now()): boolean {
  const ultima = s.conductor.disponibilidadConfirmadaEn;
  if (!ultima) return false;
  return ahora - new Date(ultima).getTime() >= s.ajustes.diasReconfirmar * 24 * 60 * 60 * 1000;
}

/** Fecha de la próxima confirmación de disponibilidad. */
export function proximaReconfirmacion(s: DatosDemo): string | null {
  const ultima = s.conductor.disponibilidadConfirmadaEn;
  if (!ultima) return null;
  return new Date(new Date(ultima).getTime() + s.ajustes.diasReconfirmar * 24 * 60 * 60 * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// Mensajes
// ---------------------------------------------------------------------------

export interface ConversacionResumen {
  busquedaId: string;
  titular: Titular;
  negocio: Negocio;
  ultimo: Mensaje | null;
  noLeidos: number;
  escribiendo: boolean;
  contactoCompartido: boolean;
  bloqueado: boolean;
}

/** Conversaciones con al menos un mensaje, la más reciente primero. */
export function conversacionesDelUsuario(s: DatosDemo): ConversacionResumen[] {
  const salida: ConversacionResumen[] = [];
  for (const [busquedaId, lista] of Object.entries(s.mensajes)) {
    if (!lista || lista.length === 0) continue;
    const b = busquedaPorId(s, busquedaId);
    const titular = b ? titularPorId(s, b.titularId) : undefined;
    const negocio = b ? negocioPorId(s, b.negocioId) : undefined;
    if (!b || !titular || !negocio) continue;
    salida.push({
      busquedaId,
      titular,
      negocio,
      ultimo: lista[lista.length - 1] ?? null,
      noLeidos: lista.filter((m) => !m.leido && m.autor !== 'conductor').length,
      escribiendo: !!s.titularEscribiendo[busquedaId],
      contactoCompartido: !!s.contactoCompartido[busquedaId],
      bloqueado: s.bloqueos.includes(b.titularId),
    });
  }
  return salida.sort((a, b) => (b.ultimo?.hora ?? '').localeCompare(a.ultimo?.hora ?? ''));
}

export function mensajesNoLeidos(s: DatosDemo): number {
  let n = 0;
  for (const lista of Object.values(s.mensajes)) n += lista.filter((m) => !m.leido && m.autor !== 'conductor').length;
  return n;
}

// ---------------------------------------------------------------------------
// Bolsa de trabajo (conductor)
// ---------------------------------------------------------------------------

export interface OfertaBolsa {
  id: string;
  busqueda: Busqueda;
  titular: Titular;
  negocio: Negocio;
  comuna: Comuna | undefined;
  esMatch: boolean;
  porcentaje: number;
  destacada: boolean;
  postulacion: Postulacion | null;
  condiciones: string;
}

export const estaDestacada = (b: Busqueda, ahora = Date.now()): boolean =>
  !!b.destacadaHasta && new Date(b.destacadaHasta).getTime() > ahora;

/** Ofertas que el usuario ve en la bolsa (R29): destacadas primero, después las más nuevas. */
export function ofertasBolsaDelUsuario(s: DatosDemo): OfertaBolsa[] {
  const conductor = conductorUsuarioParaMatch(s);
  const clases = s.conductor.clasesRevisadas.length > 0 ? s.conductor.clasesRevisadas : s.conductor.clasesDeclaradas;
  const salida: OfertaBolsa[] = [];
  for (const b of s.busquedas) {
    const titular = titularPorId(s, b.titularId);
    const negocio = negocioPorId(s, b.negocioId);
    if (!titular || !negocio) continue;
    const entrada = {
      conductor,
      busqueda: b,
      catalogo: catalogoMatch(s),
      reglas: s.reglas,
      bloqueado: s.bloqueos.includes(b.titularId),
      titularSuspendido: titular.suspendido,
      bolsaActiva: s.ajustes.bolsaActiva,
      enBolsa: b.enBolsa,
      visibilidad: b.visibilidadBolsa,
      perfiles: b.perfilesBolsa,
    };
    if (!visibleEnBolsa(entrada, clases)) continue;
    const r = evaluarMatch(entrada);
    salida.push({
      id: b.id,
      busqueda: b,
      titular,
      negocio,
      comuna: comunaPorId(s, b.comunaId),
      esMatch: r.hayMatch,
      porcentaje: r.porcentaje,
      destacada: estaDestacada(b),
      postulacion: s.postulaciones.find((p) => p.busquedaId === b.id && p.conductorId === ID_USUARIO) ?? null,
      condiciones: textoCondiciones(s, b),
    });
  }
  return salida.sort(
    (a, b) =>
      Number(b.destacada) - Number(a.destacada) ||
      (b.busqueda.publicadaBolsaEl ?? '').localeCompare(a.busqueda.publicadaBolsaEl ?? ''),
  );
}

export interface PostulacionUsuario {
  postulacion: Postulacion;
  busqueda: Busqueda;
  titular: Titular;
  negocio: Negocio;
  condiciones: string;
}

export function postulacionesDelUsuario(s: DatosDemo): PostulacionUsuario[] {
  return s.postulaciones
    .filter((p) => p.conductorId === ID_USUARIO)
    .map((p) => {
      const busqueda = busquedaPorId(s, p.busquedaId);
      const titular = busqueda ? titularPorId(s, busqueda.titularId) : undefined;
      const negocio = busqueda ? negocioPorId(s, busqueda.negocioId) : undefined;
      if (!busqueda || !titular || !negocio) return null;
      return { postulacion: p, busqueda, titular, negocio, condiciones: textoCondiciones(s, busqueda) };
    })
    .filter((x): x is PostulacionUsuario => !!x)
    .sort((a, b) => b.postulacion.postuloEl.localeCompare(a.postulacion.postuloEl));
}

export function entregasDelUsuario(s: DatosDemo): EntregaDatos[] {
  return [...s.entregasDatos].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---------------------------------------------------------------------------
// Conductores (vista común para titular y panel)
// ---------------------------------------------------------------------------

export interface ConductorVista {
  /** 'yo' o el id del conductor ficticio. */
  id: string;
  esUsuario: boolean;
  nombre: string;
  nombres: string;
  edad: number | null;
  celular: string;
  correo: string;
  comuna: Comuna | undefined;
  zona: Zona | undefined;
  region: Region | undefined;
  clasesDeclaradas: string[];
  clasesRevisadas: string[];
  experiencia: Record<string, number>;
  idiomas: string[];
  negocios: string[];
  turnos: Turno[];
  dias: Dia[];
  tieneEstacionamiento: boolean;
  disponible: boolean;
  estadoPerfil: ConductorFicticio['estadoPerfil'];
  estadoVerificacion: ConductorFicticio['estadoVerificacion'];
  documentos: Record<TipoDocumentoId, DocumentoUsuario>;
  registradoEl: string | null;
  suspendido: boolean;
  /** Dirección: solo para el equipo y para titulares a quienes el conductor la compartió. */
  direccion: string;
}

export function conductorVista(s: DatosDemo, id: string): ConductorVista | null {
  if (id === ID_USUARIO) {
    const c = s.conductor;
    const l = lugar(s, c.comunaId);
    return {
      id,
      esUsuario: true,
      nombre: nombreCompleto(s.cuenta) || 'Tú (demo)',
      nombres: s.cuenta.nombres || 'Tú',
      edad: edad(c.fechaNacimiento),
      celular: s.cuenta.celular ? `+56 9 ${s.cuenta.celular}` : '',
      correo: s.cuenta.correo,
      ...l,
      clasesDeclaradas: c.clasesDeclaradas,
      clasesRevisadas: c.clasesRevisadas,
      experiencia: c.experiencia,
      idiomas: c.idiomas,
      negocios: c.negocios,
      turnos: c.turnos,
      dias: c.dias,
      tieneEstacionamiento: c.tieneEstacionamiento,
      disponible: c.disponible,
      estadoPerfil: c.estadoPerfil,
      estadoVerificacion: c.estadoVerificacion,
      documentos: s.documentos,
      registradoEl: c.registradoEl,
      suspendido: false,
      direccion: [c.direccion, c.depto].filter(Boolean).join(', '),
    };
  }
  const c = conductorFicticioPorId(s, id);
  if (!c) return null;
  return {
    id,
    esUsuario: false,
    nombre: nombreCompleto(c),
    nombres: c.nombres,
    edad: edad(c.fechaNacimiento),
    celular: c.celular,
    correo: c.correo,
    ...lugar(s, c.comunaId),
    clasesDeclaradas: c.clasesDeclaradas,
    clasesRevisadas: c.clasesRevisadas,
    experiencia: c.experiencia,
    idiomas: c.idiomas,
    negocios: c.negocios,
    turnos: c.turnos,
    dias: c.dias,
    tieneEstacionamiento: c.tieneEstacionamiento,
    disponible: c.disponible,
    estadoPerfil: c.estadoPerfil,
    estadoVerificacion: c.estadoVerificacion,
    documentos: c.documentos,
    registradoEl: c.registradoEl,
    suspendido: c.suspendido,
    direccion: c.direccion,
  };
}

/** Todos los conductores: los ficticios y, si ya se registró, el usuario de la demo (primero). */
export function todosLosConductores(s: DatosDemo): ConductorVista[] {
  const ids = [...(s.conductor.registrado ? [ID_USUARIO] : []), ...s.conductores.map((c) => c.id)];
  return ids.map((id) => conductorVista(s, id)).filter((c): c is ConductorVista => !!c);
}

function paraMatch(s: DatosDemo, id: string): ConductorParaMatch | null {
  if (id === ID_USUARIO) return conductorUsuarioParaMatch(s);
  const c = conductorFicticioPorId(s, id);
  return c ? conductorFicticioParaMatch(c) : null;
}

/** Evalúa cualquier conductor (usuario o ficticio) contra cualquier búsqueda (simulador del panel). */
export function simularMatch(s: DatosDemo, conductorId: string, busquedaId: string): ResultadoMatch | null {
  const c = paraMatch(s, conductorId);
  const b = busquedaPorId(s, busquedaId);
  if (!c || !b) return null;
  const titular = titularPorId(s, b.titularId);
  return evaluarMatch({
    conductor: c,
    busqueda: b,
    catalogo: catalogoMatch(s),
    reglas: s.reglas,
    bloqueado: conductorId === ID_USUARIO && s.bloqueos.includes(b.titularId),
    titularSuspendido: titular?.suspendido,
  });
}

/** Conductores que hacen match con una búsqueda (para el titular: adelanto anónimo y fichas). */
export function conductoresQueCalzan(
  s: DatosDemo,
  busquedaId: string,
): { conductor: ConductorVista; resultado: ResultadoMatch }[] {
  return todosLosConductores(s)
    .map((conductor) => ({ conductor, resultado: simularMatch(s, conductor.id, busquedaId) }))
    .filter((x): x is { conductor: ConductorVista; resultado: ResultadoMatch } => !!x.resultado?.hayMatch)
    .sort((a, b) => b.resultado.porcentaje - a.resultado.porcentaje);
}

/** ¿Un conductor cumple las condiciones de "Conductores que tú elijas"? (vista previa de BT2) */
export function cumplePerfiles(s: DatosDemo, conductorId: string, negocioId: string, perfiles: PerfilesBolsa): boolean {
  const c = paraMatch(s, conductorId);
  const n = negocioPorId(s, negocioId);
  return !!c && !!n && cumplePerfilesBolsa(c, perfiles, n, s.catalogos.comunas);
}

// ---------------------------------------------------------------------------
// Titular de la demo
// ---------------------------------------------------------------------------

export const titularDeLaDemo = (s: DatosDemo): Titular => titularPorId(s, s.titularDemo.titularId)!;

export function planDeLaDemo(s: DatosDemo): Plan | null {
  return s.titularDemo.plan === 'sin_plan' ? null : (planPorId(s, s.titularDemo.plan) ?? null);
}

export function puedeElegirVisibilidad(s: DatosDemo, v: VisibilidadBolsa): boolean {
  const plan = planDeLaDemo(s);
  return !!plan && plan.visibilidades.includes(v);
}

export interface BusquedaTitular {
  busqueda: Busqueda;
  negocio: Negocio;
  comuna: Comuna | undefined;
  zona: Zona | undefined;
  /** Conductores verificados que hacen match (adelanto anónimo si no hay plan). */
  coinciden: number;
  postulantes: number;
  postulantesNuevos: number;
  destacada: boolean;
  condiciones: string;
}

export function busquedasDelTitularDemo(s: DatosDemo): BusquedaTitular[] {
  return s.busquedas
    .filter((b) => b.titularId === s.titularDemo.titularId)
    .map((b) => {
      const negocio = negocioPorId(s, b.negocioId)!;
      const post = s.postulaciones.filter((p) => p.busquedaId === b.id && p.estado !== 'descartada');
      return {
        busqueda: b,
        negocio,
        ...lugar(s, b.comunaId),
        coinciden: conductoresQueCalzan(s, b.id).length,
        postulantes: post.length,
        postulantesNuevos: post.filter((p) => p.estado === 'enviada').length,
        destacada: estaDestacada(b),
        condiciones: textoCondiciones(s, b),
      };
    })
    .sort((a, b) => b.busqueda.publicadaEl.localeCompare(a.busqueda.publicadaEl));
}

/** Postulantes de una búsqueda (sin los descartados), los nuevos primero. */
export function postulantesDeBusqueda(
  s: DatosDemo,
  busquedaId: string,
  incluirDescartados = false,
): { postulacion: Postulacion; conductor: ConductorVista }[] {
  const orden: Record<Postulacion['estado'], number> = { enviada: 0, vista: 1, te_escribio: 2, descartada: 3 };
  return s.postulaciones
    .filter((p) => p.busquedaId === busquedaId && (incluirDescartados || p.estado !== 'descartada'))
    .map((postulacion) => ({ postulacion, conductor: conductorVista(s, postulacion.conductorId) }))
    .filter((x): x is { postulacion: Postulacion; conductor: ConductorVista } => !!x.conductor)
    .sort(
      (a, b) =>
        orden[a.postulacion.estado] - orden[b.postulacion.estado] ||
        b.postulacion.postuloEl.localeCompare(a.postulacion.postuloEl),
    );
}

export function ofertasEnBolsaDelTitular(s: DatosDemo): number {
  return s.busquedas.filter((b) => b.titularId === s.titularDemo.titularId && b.enBolsa).length;
}

export function busquedasActivasDelTitular(s: DatosDemo): number {
  return s.busquedas.filter((b) => b.titularId === s.titularDemo.titularId && b.estado === 'activa').length;
}

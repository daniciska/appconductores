// Forma del estado de la demo (solo datos) y cómo se crea al empezar o al reiniciar.
import {
  CLASES_LICENCIA,
  COMUNAS,
  DIAS,
  IDIOMAS,
  INDUSTRIAS,
  MOTIVOS_RECHAZO,
  MOTIVOS_REPORTE,
  NEGOCIOS,
  PLANES,
  REGIONES,
  REGLAS_MATCH,
  TAMANOS_VEHICULO,
  TIPOS_DOCUMENTO,
  TURNOS,
  UMBRAL_MATCH,
  ZONAS,
  conductorInicial,
  crearFicticios,
  cuentaInicial,
  documentosVacios,
} from './semilla';
import type {
  AccionEquipo,
  Ajustes,
  Busqueda,
  Catalogos,
  ConductorFicticio,
  ConductorUsuario,
  CuentaUsuario,
  DocumentoUsuario,
  EntregaDatos,
  Mensaje,
  MiembroEquipo,
  PlanTitular,
  Postulacion,
  ReglasMatch,
  Reporte,
  Rol,
  TareaSimulada,
  TipoDocumentoId,
  Titular,
} from './tipos';

/** Sube este número si cambia la forma del estado: los navegadores con datos viejos parten de cero. */
export const VERSION_ESTADO = 2;
/** Clave en el almacenamiento del navegador (localStorage). */
export const CLAVE_ALMACENAMIENTO = 'dale-demo-v1';

export interface TitularDemo {
  /** El titular que maneja quien entra con "Ver como titular". */
  titularId: string;
  plan: PlanTitular;
  /** Destacadas usadas este mes (el plan define cuántas puede). */
  destacadasUsadas: number;
}

export interface DatosDemo {
  version: number;
  /** Con qué rol se está viendo la demo. */
  rol: Rol | null;

  // --- Usuario de la demo (conductor) ---
  cuenta: CuentaUsuario;
  conductor: ConductorUsuario;
  documentos: Record<TipoDocumentoId, DocumentoUsuario>;
  /** Ids de búsqueda marcadas como favoritas por el conductor (el id del match es el de la búsqueda). */
  favoritos: string[];
  /** Conversaciones del conductor, por id de búsqueda. */
  mensajes: Record<string, Mensaje[]>;
  /** Mientras la simulación prepara la respuesta del titular ("escribiendo…"). */
  titularEscribiendo: Record<string, boolean>;
  /** Fecha en que el titular compartió su contacto, por id de búsqueda. */
  contactoCompartido: Record<string, string>;
  /** Fecha en que el conductor compartió su dirección, por id de búsqueda. */
  direccionCompartida: Record<string, string>;
  /** Búsquedas cuyo titular respondió una postulación del conductor (match con origen "Postulación"). */
  matchesPorPostulacion: string[];
  /** "Quién recibió mis datos". */
  entregasDatos: EntregaDatos[];
  /** Titulares bloqueados por el conductor. */
  bloqueos: string[];
  /** Búsquedas donde la simulación ya hizo que el titular abriera la ficha. */
  fichasAbiertas: string[];

  // --- Titular de la demo ---
  titularDemo: TitularDemo;
  /** Conductores marcados como favoritos por el titular de la demo. */
  favoritosTitular: string[];

  // --- Mundo ficticio ---
  titulares: Titular[];
  busquedas: Busqueda[];
  conductores: ConductorFicticio[];
  /** De conductores ficticios y del usuario ('yo'). */
  postulaciones: Postulacion[];
  reportes: Reporte[];

  // --- Configuración (panel) ---
  catalogos: Catalogos;
  reglas: ReglasMatch;
  ajustes: Ajustes;
  equipo: MiembroEquipo[];
  accionesEquipo: AccionEquipo[];

  // --- Simulación ---
  pendientes: TareaSimulada[];
}

export function catalogosIniciales(): Catalogos {
  const copia = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
  return {
    regiones: copia(REGIONES),
    zonas: copia(ZONAS),
    comunas: copia(COMUNAS),
    clases: copia(CLASES_LICENCIA),
    industrias: copia(INDUSTRIAS),
    tamanos: copia(TAMANOS_VEHICULO),
    negocios: copia(NEGOCIOS),
    turnos: copia(TURNOS),
    dias: copia(DIAS),
    idiomas: copia(IDIOMAS),
    tiposDocumento: copia(TIPOS_DOCUMENTO),
    motivosRechazo: copia(MOTIVOS_RECHAZO),
    motivosReporte: copia(MOTIVOS_REPORTE),
    planes: copia(PLANES),
  };
}

export function reglasIniciales(): ReglasMatch {
  return { umbral: UMBRAL_MATCH, reglas: REGLAS_MATCH.map((r) => ({ ...r })) };
}

export function ajustesIniciales(): Ajustes {
  return {
    bolsaActiva: true,
    validarObligatorios: false,
    diasReconfirmar: 30,
    diasAntiguedadPdf: 30,
    segundosPrerevision: 3,
  };
}

export function crearEstadoInicial(ahora = Date.now()): DatosDemo {
  const f = crearFicticios(ahora);
  return {
    version: VERSION_ESTADO,
    rol: null,
    cuenta: cuentaInicial(),
    conductor: conductorInicial(),
    documentos: documentosVacios(),
    favoritos: [],
    mensajes: {},
    titularEscribiendo: {},
    contactoCompartido: {},
    direccionCompartida: {},
    matchesPorPostulacion: [],
    entregasDatos: [],
    bloqueos: [],
    fichasAbiertas: [],
    titularDemo: { titularId: 't01', plan: 'flota_chica', destacadasUsadas: 0 },
    favoritosTitular: ['c02'],
    titulares: f.titulares,
    busquedas: f.busquedas,
    conductores: f.conductores,
    postulaciones: f.postulaciones,
    reportes: f.reportes,
    catalogos: catalogosIniciales(),
    reglas: reglasIniciales(),
    ajustes: ajustesIniciales(),
    equipo: f.equipo,
    accionesEquipo: f.accionesEquipo,
    pendientes: [],
  };
}

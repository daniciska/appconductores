// Tipos de la demo de Dale Contacto.
// Siguen docs/modelo-datos.json, simplificados para una demo que vive en el navegador.
// Este archivo solo tiene tipos: lo pueden importar la app, las pruebas y la semilla.

// ---------------------------------------------------------------------------
// Catálogos (iguales a la base de datos: supabase/migrations/*_etapa1_datos_iniciales.sql)
// ---------------------------------------------------------------------------

export interface Region {
  id: string; // 'r01'…'r16'
  nombre: string;
  orden: number;
}

export interface Zona {
  id: string; // 'r07-z3'
  regionId: string;
  nombre: string;
  orden: number;
}

export interface Comuna {
  id: string; // slug del nombre: 'nunoa', 'las-condes'
  nombre: string;
  regionId: string;
  zonaId: string;
  alternativos: string[];
}

export interface ClaseLicencia {
  codigo: string; // 'A1', 'B', 'A1 antigua'…
  nombre: string;
  esAntigua: boolean;
  /** Si la clase permite manejar lo mismo que la B (en la tabla de negocios, 'B' incluye a estas). */
  habilitaClaseB: boolean;
  orden: number;
}

export interface Industria {
  id: string; // 'pasajeros' | 'carga'
  nombre: string;
  orden: number;
  activo: boolean;
}

export interface TamanoVehiculo {
  id: string; // 'moto', 'liviano', 'van', 'bus', 'camion', 'articulado', 'maquinaria'
  nombre: string;
  ayuda: string;
  orden: number;
}

export interface RespuestaVehiculo {
  clave: string;
  texto: string;
  /** Clases que habilitan esta respuesta. 'B' incluye a las clases con habilitaClaseB. */
  clases: string[];
}

export interface PreguntaVehiculo {
  pregunta: string;
  respuestas: RespuestaVehiculo[];
}

export interface Negocio {
  id: string; // 'taxi', 'taxi_ejecutivo'…
  industriaId: string;
  nombre: string;
  /** Ejemplo en gris, sin marcas. null = sin ejemplo. */
  ejemplo: string | null;
  orden: number;
  activo: boolean;
  nota: string | null;
  /** Solo en los negocios donde la licencia depende del vehículo. */
  pregunta: PreguntaVehiculo | null;
  /** Clases que habilitan el negocio (filtro F2). 'B' incluye a las clases con habilitaClaseB. */
  clases: string[];
  /** Categorías de experiencia que cuentan para los años (M4). */
  tamanos: string[];
}

export interface OpcionLista {
  clave: string;
  nombre: string;
  corto?: string;
}

export type Turno = 'dia' | 'noche';
export type Dia = 'lu' | 'ma' | 'mi' | 'ju' | 'vi' | 'sa' | 'do';

// ---------------------------------------------------------------------------
// Documentos
// ---------------------------------------------------------------------------

export type TipoDocumentoId = 'cedula' | 'licencia' | 'hoja_vida' | 'antecedentes';

export interface TipoDocumento {
  id: TipoDocumentoId;
  nombre: string;
  /** Nombre corto para listas y la cola del panel. */
  corto: string;
  /** Texto bajo el nombre en el Paso 5 ("Foto del frente"). */
  ayuda: string;
  formato: 'foto' | 'pdf';
  /** Si el agente de IA puede aprobarlo solo cuando el caso es claro (en la demo: cédula y licencia). */
  prerevisionAutomatica: boolean;
  /** Antigüedad máxima del PDF al subirlo, en días (null = no aplica). */
  antiguedadMaximaDias: number | null;
  orden: number;
}

export type EstadoDocumento = 'falta' | 'subido' | 'en_revision' | 'aprobado' | 'rechazado';

export type MotivoRechazoId = 'ilegible' | 'no_coincide' | 'vencido' | 'otro_documento' | 'folio' | 'run_duplicado';

export interface MotivoRechazo {
  id: MotivoRechazoId;
  nombre: string;
  /** Lo que ve la persona en "Qué puedes hacer". */
  queHacer: string;
}

export interface DocumentoUsuario {
  tipo: TipoDocumentoId;
  estado: EstadoDocumento;
  /** Nombre del archivo elegido (en la demo no se sube nada: solo se guarda el nombre). */
  nombreArchivo: string | null;
  subidoEl: string | null;
  enviadoEl: string | null;
  /** En revisión: 'ia' = pre-revisión automática; 'equipo' = esperando a una persona en el panel. */
  etapa: 'ia' | 'equipo' | null;
  revisadoEn: string | null;
  venceEn: string | null;
  quienDecidio: 'ia' | 'persona' | null;
  motivo: MotivoRechazoId | null;
  /** Fecha en que pidió otra revisión ("No estoy de acuerdo"). */
  otraRevisionEl: string | null;
}

// ---------------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------------

export type Rol = 'conductor' | 'titular' | 'admin';
export type EstadoPerfil = 'incompleto' | 'completo';
export type EstadoVerificacion = 'sin_documentos' | 'en_revision' | 'verificado' | 'con_observaciones';
/** Las 5 secciones del perfil del conductor (pasos 1 a 5). */
export type SeccionPerfil = 'datos' | 'direccion' | 'experiencia' | 'trabajo' | 'documentos';

export interface Autorizaciones {
  terminos: boolean;
  privacidad: boolean;
  compartirFicha: boolean;
  recordatoriosWhatsapp: boolean;
}

export interface CuentaUsuario {
  /** Solo los 8 dígitos después de +56 9, con o sin espacios ("1234 5678"). */
  celular: string;
  celularVerificado: boolean;
  correo: string;
  nombres: string;
  apellido1: string;
  apellido2: string;
  creadaEl: string | null;
  autorizaciones: Autorizaciones;
  autorizacionesEl: string | null;
}

/** Perfil de trabajo de un conductor (el usuario de la demo o uno ficticio). */
export interface PerfilConductor {
  fechaNacimiento: string; // 'dd/mm/aaaa'
  direccion: string;
  depto: string;
  comunaId: string | null;
  tieneEstacionamiento: boolean;
  clasesDeclaradas: string[];
  /** Solo estas cuentan para el filtro de licencia (F2). Las copia la revisión de la licencia. */
  clasesRevisadas: string[];
  idiomas: string[];
  /** Años manejando cada tipo de vehículo: { liviano: 6 }. Ausente o 0 = no marcado. */
  experiencia: Record<string, number>;
  negocios: string[];
  turnos: Turno[];
  dias: Dia[];
  disponible: boolean;
  disponibilidadConfirmadaEn: string | null;
  estadoPerfil: EstadoPerfil;
  estadoVerificacion: EstadoVerificacion;
}

export interface ConductorUsuario extends PerfilConductor {
  /** true desde que guardó el Paso 1. */
  registrado: boolean;
  registradoEl: string | null;
  pasosListos: Record<SeccionPerfil, boolean>;
  /** Último paso abierto (1 a 5), para volver donde quedó. */
  pasoActual: number;
}

export interface ConductorFicticio extends PerfilConductor {
  id: string; // 'c01'…
  nombres: string;
  apellido1: string;
  apellido2: string;
  celular: string;
  correo: string;
  registradoEl: string;
  suspendido: boolean;
  documentos: Record<TipoDocumentoId, DocumentoUsuario>;
}

export type TipoTitular = 'persona' | 'empresa';

export interface Titular {
  id: string; // 't01'…
  tipo: TipoTitular;
  /** Nombre de la persona (o de quien administra la cuenta de la empresa). */
  nombre: string;
  /** Solo empresa: es el nombre que ve el conductor. */
  razonSocial: string | null;
  /** Insignia: 'Cédula revisada' (persona) o 'Empresa revisada en SII'. */
  revisado: boolean;
  telefono: string; // ficticio
  correo: string; // ficticio
  suspendido: boolean;
  creadoEl: string;
}

// ---------------------------------------------------------------------------
// Búsquedas (ofertas) y bolsa de trabajo
// ---------------------------------------------------------------------------

export type EstadoBusqueda = 'activa' | 'pausada' | 'cubierta';
export type VisibilidadBolsa = 'match' | 'perfiles' | 'todos';

/** Condiciones de "Conductores que tú elijas" (funcionan como filtros). */
export interface PerfilesBolsa {
  zonas: string[]; // vacío = cualquier zona de la región
  aniosMinimos: number;
  turnos: Turno[]; // vacío = cualquiera
  dias: Dia[]; // vacío = cualquiera; si no, al menos uno en común
  estacionamiento: boolean; // true = debe tenerlo
}

export interface Busqueda {
  id: string; // 'b01'…
  titularId: string;
  negocioId: string;
  /** Respuesta a la pregunta del negocio (clave), solo si el negocio la tiene. */
  respuestaVehiculo: string | null;
  comunaId: string;
  turnos: Turno[];
  dias: Dia[];
  aniosMinimos: number;
  exigeEstacionamiento: boolean;
  /** Máximo 300 caracteres. */
  detalle: string;
  detalleOculto: boolean;
  estado: EstadoBusqueda;
  publicadaEl: string;
  enBolsa: boolean;
  visibilidadBolsa: VisibilidadBolsa;
  perfilesBolsa: PerfilesBolsa | null;
  publicadaBolsaEl: string | null;
  destacadaHasta: string | null;
}

export type EstadoPostulacion = 'enviada' | 'vista' | 'te_escribio' | 'descartada';

export interface Postulacion {
  id: string;
  busquedaId: string;
  /** 'yo' = el usuario de la demo; si no, el id de un conductor ficticio. */
  conductorId: string;
  estado: EstadoPostulacion;
  postuloEl: string;
  vistaEl: string | null;
  cambioEl: string;
}

// ---------------------------------------------------------------------------
// Matches, mensajes y privacidad
// ---------------------------------------------------------------------------

export interface Mensaje {
  id: string;
  autor: 'conductor' | 'titular' | 'sistema';
  texto: string;
  hora: string; // ISO
  leido: boolean;
}

export type QueSeEntrego = 'ficha' | 'telefono' | 'correo' | 'direccion';
export type DesdeDondeEntrega = 'apertura_ficha' | 'conversacion' | 'postulacion';

/** "Quién recibió mis datos": cada vez que datos del conductor de la demo llegan a un titular. */
export interface EntregaDatos {
  id: string;
  busquedaId: string;
  titularId: string;
  /** Nombre guardado en ese momento. */
  nombreTitular: string;
  negocioId: string;
  que: QueSeEntrego[];
  desde: DesdeDondeEntrega;
  fecha: string;
}

export type MotivoReporteId = 'spam' | 'acoso' | 'dinero' | 'falsa' | 'otro';

export interface MotivoReporte {
  id: MotivoReporteId;
  nombre: string;
}

export interface PersonaRef {
  /** 'yo', id de conductor ficticio ('c01') o de titular ('t01'). */
  id: string;
  nombre: string;
  rol: 'conductor' | 'titular';
}

export interface Reporte {
  id: string;
  busquedaId: string | null;
  quienReporta: PersonaRef;
  reportado: PersonaRef;
  motivo: MotivoReporteId;
  detalle: string;
  estado: 'abierto' | 'resuelto';
  queSeHizo: string | null;
  reportadoEl: string;
  resueltoEl: string | null;
  /** Copia de la conversación reportada (solo esa la puede leer el equipo). */
  conversacion: Mensaje[];
}

// ---------------------------------------------------------------------------
// Configuración (panel de administración)
// ---------------------------------------------------------------------------

export type CodigoRegla = 'F1' | 'F2' | 'F3' | 'M2' | 'M3' | 'M4' | 'M6' | 'M7';
export type UsoRegla = 'filtro' | 'variable' | 'apagado';

export interface ReglaMatch {
  codigo: CodigoRegla;
  nombre: string;
  /** Cómo se compara, en palabras (para el panel). */
  comoCompara: string;
  uso: UsoRegla;
  peso: number;
  /** Lo que se muestra cuando no coincide ("otra zona", "sin estacionamiento"). */
  textoNoCoincide: string;
  orden: number;
}

export interface ReglasMatch {
  /** Porcentaje mínimo (0 a 100). Hay match si suma(peso×valor)×100 ≥ umbral×suma(pesos). */
  umbral: number;
  reglas: ReglaMatch[];
}

export interface Ajustes {
  /** Muestra la pestaña Bolsa y las ofertas publicadas. En la demo parte encendida. */
  bolsaActiva: boolean;
  /** Si los formularios exigen los campos con *. En la demo parte apagado (pedido de la dueña). */
  validarObligatorios: boolean;
  /** Cada cuántos días se pide reconfirmar "Disponible para trabajar". */
  diasReconfirmar: number;
  /** Antigüedad máxima (días) de la Hoja de Vida y el certificado de antecedentes. */
  diasAntiguedadPdf: number;
  /** Segundos que tarda la pre-revisión simulada del agente de IA. */
  segundosPrerevision: number;
}

export type PlanId = 'basico' | 'flota_chica' | 'flota';
export type PlanTitular = 'sin_plan' | PlanId;

export interface Plan {
  id: PlanId;
  nombre: string;
  busquedasActivas: number;
  ofertasBolsa: number;
  visibilidades: VisibilidadBolsa[];
  destacadasMes: number;
  vePostulantes: boolean;
  /** Por definir: null = "Por definir". */
  precioMensual: number | null;
  recomendado: boolean;
  orden: number;
}

export type RolEquipo = 'revisor' | 'administrador';

export interface MiembroEquipo {
  id: string;
  nombre: string;
  celular: string;
  rol: RolEquipo;
  activo: boolean;
  agregadoEl: string;
}

export interface AccionEquipo {
  id: string;
  quien: string;
  que: string;
  fecha: string;
}

export interface Catalogos {
  regiones: Region[];
  zonas: Zona[];
  comunas: Comuna[];
  clases: ClaseLicencia[];
  industrias: Industria[];
  tamanos: TamanoVehiculo[];
  negocios: Negocio[];
  turnos: OpcionLista[];
  dias: OpcionLista[];
  idiomas: OpcionLista[];
  tiposDocumento: TipoDocumento[];
  motivosRechazo: MotivoRechazo[];
  motivosReporte: MotivoReporte[];
  planes: Plan[];
}

// ---------------------------------------------------------------------------
// Simulación (tareas programadas que sobreviven a cambiar de pantalla y a recargar)
// ---------------------------------------------------------------------------

export type TareaSimulada =
  | { id: string; tipo: 'prerevision'; venceEn: number; documento: TipoDocumentoId }
  | { id: string; tipo: 'respuesta_titular'; venceEn: number; busquedaId: string }
  | { id: string; tipo: 'abre_ficha'; venceEn: number; busquedaId: string }
  | { id: string; tipo: 'postulacion_vista'; venceEn: number; postulacionId: string }
  | { id: string; tipo: 'postulacion_respuesta'; venceEn: number; postulacionId: string };

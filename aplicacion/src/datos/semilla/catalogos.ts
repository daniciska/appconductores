// Catálogos de la demo, IDÉNTICOS a los de la base de datos
// (supabase/migrations/20261102120100_etapa1_datos_iniciales.sql).
// Si cambia la base, cambia aquí. Los ids son cortos y estables para la demo.
import type {
  ClaseLicencia,
  Industria,
  MotivoRechazo,
  MotivoReporte,
  Negocio,
  OpcionLista,
  Plan,
  ReglaMatch,
  TamanoVehiculo,
  TipoDocumento,
  TipoDocumentoId,
} from '../tipos.ts';

// Que las clases A y las antiguas habiliten lo de la B: según ChileAtiende y CONASET [verificar].
export const CLASES_LICENCIA: ClaseLicencia[] = [
  { codigo: 'A1', nombre: 'Clase A1', esAntigua: false, habilitaClaseB: true, orden: 1 },
  { codigo: 'A2', nombre: 'Clase A2', esAntigua: false, habilitaClaseB: true, orden: 2 },
  { codigo: 'A3', nombre: 'Clase A3', esAntigua: false, habilitaClaseB: true, orden: 3 },
  { codigo: 'A4', nombre: 'Clase A4', esAntigua: false, habilitaClaseB: true, orden: 4 },
  { codigo: 'A5', nombre: 'Clase A5', esAntigua: false, habilitaClaseB: true, orden: 5 },
  { codigo: 'B', nombre: 'Clase B', esAntigua: false, habilitaClaseB: true, orden: 6 },
  { codigo: 'C', nombre: 'Clase C', esAntigua: false, habilitaClaseB: false, orden: 7 },
  { codigo: 'D', nombre: 'Clase D', esAntigua: false, habilitaClaseB: false, orden: 8 },
  { codigo: 'A1 antigua', nombre: 'A1 antigua (antes de 1997)', esAntigua: true, habilitaClaseB: true, orden: 9 },
  { codigo: 'A2 antigua', nombre: 'A2 antigua (antes de 1997)', esAntigua: true, habilitaClaseB: true, orden: 10 },
];

// En el lanzamiento, carga parte apagada.
export const INDUSTRIAS: Industria[] = [
  { id: 'pasajeros', nombre: 'Transporte de pasajeros', orden: 1, activo: true },
  { id: 'carga', nombre: 'Transporte de carga', orden: 2, activo: false },
];

export const TAMANOS_VEHICULO: TamanoVehiculo[] = [
  { id: 'moto', nombre: 'Moto', ayuda: 'moto, scooter', orden: 1 },
  { id: 'liviano', nombre: 'Vehículo liviano', ayuda: 'auto, SUV, camioneta', orden: 2 },
  { id: 'van', nombre: 'Van o minibús', ayuda: 'van, furgón, minibús', orden: 3 },
  { id: 'bus', nombre: 'Bus', ayuda: 'bus o micro', orden: 4 },
  { id: 'camion', nombre: 'Camión', ayuda: '3/4, camión simple, grúa de autos', orden: 5 },
  { id: 'articulado', nombre: 'Camión articulado', ayuda: 'tracto con rampla', orden: 6 },
  { id: 'maquinaria', nombre: 'Maquinaria', ayuda: 'grúa horquilla, retroexcavadora', orden: 7 },
];

const PREGUNTA_PESO_CARGA = {
  pregunta: '¿Qué vehículo es?',
  respuestas: [
    { clave: 'hasta_3500', texto: 'Hasta 3.500 kg', clases: ['B'] },
    { clave: 'mas_de_3500', texto: 'Más de 3.500 kg', clases: ['A4', 'A5', 'A2 antigua'] },
    { clave: 'tracto', texto: 'Tracto con rampla', clases: ['A5'] },
  ],
};

const PREGUNTA_PESO = {
  pregunta: '¿Cuánto pesa?',
  respuestas: [
    { clave: 'hasta_3500', texto: 'Hasta 3.500 kg', clases: ['B'] },
    { clave: 'mas_de_3500', texto: 'Más de 3.500 kg', clases: ['A4', 'A5', 'A2 antigua'] },
  ],
};

// En el lanzamiento solo Taxi y Taxi ejecutivo están activos.
export const NEGOCIOS: Negocio[] = [
  {
    id: 'taxi',
    industriaId: 'pasajeros',
    nombre: 'Taxi',
    ejemplo: null,
    orden: 1,
    activo: true,
    nota: 'A1 antigua: asignación provisional [verificar].',
    pregunta: null,
    clases: ['A1', 'A2', 'A3', 'A1 antigua'],
    tamanos: ['liviano'],
  },
  {
    id: 'taxi_colectivo',
    industriaId: 'pasajeros',
    nombre: 'Taxi colectivo',
    ejemplo: 'recorrido fijo',
    orden: 2,
    activo: false,
    nota: 'A1 antigua: asignación provisional [verificar].',
    pregunta: null,
    clases: ['A1', 'A2', 'A3', 'A1 antigua'],
    tamanos: ['liviano', 'van'],
  },
  {
    id: 'taxi_ejecutivo',
    industriaId: 'pasajeros',
    nombre: 'Taxi ejecutivo',
    ejemplo: 'radiotaxi, aeropuerto',
    orden: 3,
    activo: true,
    nota: 'A1 antigua: asignación provisional [verificar].',
    pregunta: null,
    clases: ['A1', 'A2', 'A3', 'A1 antigua'],
    tamanos: ['liviano'],
  },
  {
    id: 'aplicacion',
    industriaId: 'pasajeros',
    nombre: 'Transporte por aplicación',
    ejemplo: 'apps de pasajeros',
    orden: 4,
    activo: false,
    nota: 'Hoy basta la B (y las clases que habilitan B). Con la Ley 21.553 se exigirá licencia profesional [verificar].',
    pregunta: null,
    clases: ['B'],
    tamanos: ['liviano'],
  },
  {
    id: 'turismo',
    industriaId: 'pasajeros',
    nombre: 'Van o bus de turismo',
    ejemplo: 'tours, traslados, eventos',
    orden: 5,
    activo: false,
    nota: 'La licencia depende de los pasajeros. A1 antigua: provisional [verificar].',
    pregunta: {
      pregunta: '¿Cuántos pasajeros?',
      respuestas: [
        { clave: 'hasta_9', texto: 'Hasta 9', clases: ['B'] },
        { clave: 'de_10_a_17', texto: '10 a 17', clases: ['A2', 'A3', 'A1 antigua'] },
        { clave: 'de_18_a_32', texto: '18 a 32', clases: ['A3', 'A1 antigua'] },
        { clave: 'mas_de_32', texto: 'Más de 32', clases: ['A3', 'A1 antigua'] },
      ],
    },
    clases: ['B', 'A2', 'A3', 'A1 antigua'],
    tamanos: ['van', 'bus'],
  },
  {
    id: 'bus_interurbano',
    industriaId: 'pasajeros',
    nombre: 'Bus interurbano',
    ejemplo: 'viajes entre ciudades',
    orden: 6,
    activo: false,
    nota: 'A1 antigua: provisional [verificar].',
    pregunta: null,
    clases: ['A3', 'A1 antigua'],
    tamanos: ['bus'],
  },
  {
    id: 'carga_interurbano',
    industriaId: 'carga',
    nombre: 'Camión de carga interurbano',
    ejemplo: 'entre ciudades',
    orden: 7,
    activo: false,
    nota: 'La licencia depende del peso; tracto con rampla: A5 [verificar].',
    pregunta: PREGUNTA_PESO_CARGA,
    clases: ['B', 'A4', 'A5', 'A2 antigua'],
    tamanos: ['camion', 'articulado'],
  },
  {
    id: 'carga_urbano',
    industriaId: 'carga',
    nombre: 'Camión de carga urbano',
    ejemplo: 'reparto dentro de la ciudad',
    orden: 8,
    activo: false,
    nota: 'La licencia depende del peso; tracto con rampla: A5 [verificar].',
    pregunta: PREGUNTA_PESO_CARGA,
    clases: ['B', 'A4', 'A5', 'A2 antigua'],
    tamanos: ['camion'],
  },
  {
    id: 'furgon',
    industriaId: 'carga',
    nombre: 'Reparto en furgón',
    ejemplo: 'última milla, paquetes',
    orden: 9,
    activo: false,
    nota: 'La licencia depende del peso [verificar].',
    pregunta: PREGUNTA_PESO,
    clases: ['B', 'A4', 'A5', 'A2 antigua'],
    tamanos: ['van', 'liviano'],
  },
  {
    id: 'grua',
    industriaId: 'carga',
    nombre: 'Grúa de autos',
    ejemplo: 'rescate y traslado de vehículos',
    orden: 10,
    activo: false,
    nota: 'La licencia depende del peso. No incluye camión pluma ni grúa horquilla [verificar].',
    pregunta: PREGUNTA_PESO,
    clases: ['B', 'A4', 'A5', 'A2 antigua'],
    tamanos: ['camion'],
  },
  {
    id: 'moto_delivery',
    industriaId: 'carga',
    nombre: 'Moto delivery',
    ejemplo: 'comercios, farmacias',
    orden: 11,
    activo: false,
    nota: null,
    pregunta: null,
    clases: ['C'],
    tamanos: ['moto'],
  },
];

export const TURNOS: OpcionLista[] = [
  { clave: 'dia', nombre: 'Día' },
  { clave: 'noche', nombre: 'Noche' },
];

export const DIAS: OpcionLista[] = [
  { clave: 'lu', nombre: 'Lunes', corto: 'Lu' },
  { clave: 'ma', nombre: 'Martes', corto: 'Ma' },
  { clave: 'mi', nombre: 'Miércoles', corto: 'Mi' },
  { clave: 'ju', nombre: 'Jueves', corto: 'Ju' },
  { clave: 'vi', nombre: 'Viernes', corto: 'Vi' },
  { clave: 'sa', nombre: 'Sábado', corto: 'Sá' },
  { clave: 'do', nombre: 'Domingo', corto: 'Do' },
];

// Propuesta (2-nov), se cambian desde el panel.
export const IDIOMAS: OpcionLista[] = [
  { clave: 'es', nombre: 'Español' },
  { clave: 'en', nombre: 'Inglés' },
  { clave: 'pt', nombre: 'Portugués' },
  { clave: 'fr', nombre: 'Francés' },
  { clave: 'ht', nombre: 'Criollo haitiano' },
];

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  {
    id: 'cedula',
    nombre: 'Cédula de identidad',
    corto: 'Cédula',
    ayuda: 'Foto del frente',
    formato: 'foto',
    prerevisionAutomatica: true,
    antiguedadMaximaDias: null,
    orden: 1,
  },
  {
    id: 'licencia',
    nombre: 'Licencia de conducir',
    corto: 'Licencia',
    ayuda: 'Foto donde se vean las clases',
    formato: 'foto',
    prerevisionAutomatica: true,
    antiguedadMaximaDias: null,
    orden: 2,
  },
  {
    id: 'hoja_vida',
    nombre: 'Hoja de Vida del Conductor',
    corto: 'Hoja de Vida',
    ayuda: 'PDF del Registro Civil, de 30 días o menos',
    formato: 'pdf',
    prerevisionAutomatica: false,
    antiguedadMaximaDias: 30,
    orden: 3,
  },
  {
    id: 'antecedentes',
    nombre: 'Certificado de antecedentes',
    corto: 'Antecedentes',
    ayuda: 'Para fines especiales, PDF de 30 días o menos',
    formato: 'pdf',
    prerevisionAutomatica: false,
    antiguedadMaximaDias: 30,
    orden: 4,
  },
];

const TODOS_LOS_DOCUMENTOS: TipoDocumentoId[] = ['cedula', 'licencia', 'hoja_vida', 'antecedentes'];

export const MOTIVOS_RECHAZO: MotivoRechazo[] = [
  {
    id: 'ilegible',
    nombre: 'Ilegible',
    aplicaA: TODOS_LOS_DOCUMENTOS,
    queHacer: 'Sube una foto nueva, con buena luz y sin reflejos.',
    queHacerPdf: 'Descárgalo de nuevo desde el Registro Civil y súbelo tal como lo descargaste.',
  },
  {
    id: 'no_coincide',
    nombre: 'El nombre o el RUN no coinciden',
    aplicaA: TODOS_LOS_DOCUMENTOS,
    queHacer: 'Revisa que el documento sea tuyo y que tus nombres estén escritos como en tu cédula.',
  },
  {
    id: 'vencido',
    nombre: 'Vencido o emitido fuera de plazo',
    aplicaA: TODOS_LOS_DOCUMENTOS,
    queHacer: 'Sube una foto de tu documento vigente.',
    queHacerPdf: 'Sube un PDF sacado hace {dias} días o menos.',
  },
  {
    id: 'otro_documento',
    nombre: 'No es el documento pedido',
    aplicaA: TODOS_LOS_DOCUMENTOS,
    queHacer: 'Sube el documento que se pide en este paso.',
  },
  {
    id: 'folio',
    nombre: 'Folio no verificable',
    aplicaA: ['hoja_vida', 'antecedentes'],
    queHacer: 'Descarga el PDF de nuevo desde el Registro Civil y súbelo tal como lo descargaste.',
  },
  {
    id: 'run_duplicado',
    nombre: 'RUN ya registrado en otra cuenta',
    aplicaA: TODOS_LOS_DOCUMENTOS,
    queHacer: 'Escríbenos desde el Centro de ayuda para revisar tu caso.',
  },
];

export const MOTIVOS_REPORTE: MotivoReporte[] = [
  { id: 'spam', nombre: 'Spam o publicidad' },
  { id: 'acoso', nombre: 'Ofensivo o acoso' },
  { id: 'dinero', nombre: 'Pide dinero o datos bancarios' },
  { id: 'falsa', nombre: 'La oferta parece falsa' },
  { id: 'otro', nombre: 'Otro motivo' },
];

// Propuesta aceptada (búsquedas 1/5/20). Ofertas en la bolsa, visibilidades y destacadas: propuesta por definir.
export const PLANES: Plan[] = [
  {
    id: 'basico',
    nombre: 'Básico',
    busquedasActivas: 1,
    ofertasBolsa: 1,
    visibilidades: ['match'],
    destacadasMes: 0,
    vePostulantes: true,
    precioMensual: null,
    recomendado: false,
    orden: 1,
  },
  {
    id: 'flota_chica',
    nombre: 'Flota chica',
    busquedasActivas: 5,
    ofertasBolsa: 3,
    visibilidades: ['match', 'perfiles'],
    destacadasMes: 0,
    vePostulantes: true,
    precioMensual: null,
    recomendado: true,
    orden: 2,
  },
  {
    id: 'flota',
    nombre: 'Flota',
    busquedasActivas: 20,
    ofertasBolsa: 10,
    visibilidades: ['match', 'perfiles', 'todos'],
    destacadasMes: 2,
    vePostulantes: true,
    precioMensual: null,
    recomendado: false,
    orden: 3,
  },
];

// Reglas del match (CLAUDE.md, R4 y R5). El modo de contrato (M1) y la garantía (M5) no existen en la demo.
export const REGLAS_MATCH: ReglaMatch[] = [
  {
    codigo: 'F1',
    nombre: 'Negocio',
    comoCompara: 'El negocio de la búsqueda está entre los que marcó el conductor',
    uso: 'filtro',
    peso: 1,
    textoNoCoincide: 'otro negocio',
    orden: 1,
  },
  {
    codigo: 'F2',
    nombre: 'Licencia',
    comoCompara: 'Alguna clase de licencia revisada habilita el negocio',
    uso: 'filtro',
    peso: 1,
    textoNoCoincide: 'sin la licencia que pide',
    orden: 2,
  },
  {
    codigo: 'F3',
    nombre: 'Región',
    comoCompara: 'La comuna del conductor y la de retiro están en la misma región',
    uso: 'filtro',
    peso: 1,
    textoNoCoincide: 'otra región',
    orden: 3,
  },
  {
    codigo: 'M3',
    nombre: 'Turno',
    comoCompara: 'Al menos un turno en común (Día o Noche)',
    uso: 'filtro',
    peso: 1,
    textoNoCoincide: 'otro turno',
    orden: 4,
  },
  {
    codigo: 'M2',
    nombre: 'Zona',
    comoCompara: 'La comuna de retiro está en la misma zona que la del conductor',
    uso: 'variable',
    peso: 1,
    textoNoCoincide: 'otra zona',
    orden: 5,
  },
  {
    codigo: 'M4',
    nombre: 'Años de experiencia',
    comoCompara: 'La categoría relacionada con el negocio con más años alcanza el mínimo',
    uso: 'variable',
    peso: 1,
    textoNoCoincide: 'menos años de los pedidos',
    orden: 6,
  },
  {
    codigo: 'M6',
    nombre: 'Estacionamiento',
    comoCompara: 'Si la búsqueda lo exige, el conductor debe tenerlo',
    uso: 'variable',
    peso: 1,
    textoNoCoincide: 'sin estacionamiento',
    orden: 7,
  },
  {
    codigo: 'M7',
    nombre: 'Días de trabajo',
    comoCompara: 'Proporcional: días en común ÷ días pedidos',
    uso: 'variable',
    peso: 1,
    textoNoCoincide: 'no todos los días',
    orden: 8,
  },
];

export const UMBRAL_MATCH = 66;

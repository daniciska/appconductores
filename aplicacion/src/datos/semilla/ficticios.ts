// Datos FICTICIOS de la demo: titulares, búsquedas, conductores y postulaciones.
// Nombres inventados, sin marcas ni empresas reales. Teléfonos +56 9 5555 xxxx y correos
// @demo.dalecontacto.cl para que no se confundan con datos reales.
//
// Con el conductor de ejemplo (Ñuñoa, A2 y B, 5 años en vehículo liviano, Taxi y Taxi ejecutivo,
// turno día, lunes a sábado, con estacionamiento) salen 5 matches: b01, b02, b03, b07 y b14.
// Las demás búsquedas no calzan por región (b08, b09, b10), turno (b04, b11), porcentaje
// (b05, b06, b13) o porque están pausadas (b12).
import type {
  ConductorFicticio,
  CuentaUsuario,
  ConductorUsuario,
  Dia,
  DocumentoUsuario,
  EstadoDocumento,
  Postulacion,
  Titular,
  Busqueda,
  TipoDocumentoId,
} from '../tipos.ts';

const DIA_MS = 24 * 60 * 60 * 1000;
const HORA_MS = 60 * 60 * 1000;

const LU_VI: Dia[] = ['lu', 'ma', 'mi', 'ju', 'vi'];
const LU_SA: Dia[] = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa'];
const TODOS: Dia[] = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];

/** Documento vacío ("Falta"). */
export function documentoVacio(tipo: TipoDocumentoId): DocumentoUsuario {
  return {
    tipo,
    estado: 'falta',
    nombreArchivo: null,
    subidoEl: null,
    enviadoEl: null,
    etapa: null,
    revisadoEn: null,
    venceEn: null,
    quienDecidio: null,
    motivo: null,
    otraRevisionEl: null,
  };
}

export function documentosVacios(): Record<TipoDocumentoId, DocumentoUsuario> {
  return {
    cedula: documentoVacio('cedula'),
    licencia: documentoVacio('licencia'),
    hoja_vida: documentoVacio('hoja_vida'),
    antecedentes: documentoVacio('antecedentes'),
  };
}

const ARCHIVO: Record<TipoDocumentoId, string> = {
  cedula: 'cedula-frente.jpg',
  licencia: 'licencia-clases.jpg',
  hoja_vida: 'hoja-de-vida.pdf',
  antecedentes: 'certificado-antecedentes.pdf',
};

/** Fecha de vencimiento de ejemplo por tipo de documento. */
export function venceEnEjemplo(tipo: TipoDocumentoId, desde: number): string {
  const anios = tipo === 'cedula' ? 6 : tipo === 'licencia' ? 3 : 1;
  return new Date(desde + anios * 365 * DIA_MS).toISOString();
}

export interface DatosFicticios {
  titulares: Titular[];
  busquedas: Busqueda[];
  conductores: ConductorFicticio[];
  postulaciones: Postulacion[];
}

/** Cuenta del usuario de la demo al empezar: todo vacío salvo lo que la maqueta trae marcado. */
export function cuentaInicial(): CuentaUsuario {
  return {
    celular: '',
    celularVerificado: false,
    correo: '',
    nombres: '',
    apellido1: '',
    apellido2: '',
    creadaEl: null,
    autorizaciones: { terminos: false, privacidad: false, compartirFicha: false, recordatoriosWhatsapp: false },
    autorizacionesEl: null,
  };
}

/**
 * Conductor de la demo al empezar. Los textos parten vacíos; las selecciones parten como en las
 * maquetas (A2 y B; 5 años en vehículo liviano y 2 en van; Español; Taxi y Taxi ejecutivo; Día;
 * lunes a sábado; con estacionamiento; disponible), para que la demo funcione aunque no se toque nada.
 */
export function conductorInicial(): ConductorUsuario {
  return {
    registrado: false,
    registradoEl: null,
    pasosListos: { datos: false, direccion: false, experiencia: false, trabajo: false, documentos: false },
    pasoActual: 1,
    fechaNacimiento: '',
    direccion: '',
    depto: '',
    comunaId: null,
    tieneEstacionamiento: true,
    clasesDeclaradas: ['A2', 'B'],
    clasesRevisadas: [],
    idiomas: ['es'],
    experiencia: { liviano: 5, van: 2 },
    negocios: ['taxi', 'taxi_ejecutivo'],
    turnos: ['dia'],
    dias: [...LU_SA],
    disponible: true,
    disponibilidadConfirmadaEn: null,
    estadoPerfil: 'incompleto',
    estadoVerificacion: 'sin_documentos',
  };
}

/** Datos de ejemplo para rellenar (atajo "conductor ya verificado" o botón "Usar datos de ejemplo"). */
export const EJEMPLO_USUARIO = {
  celular: '5555 0123',
  correo: 'daniel.munoz@demo.dalecontacto.cl',
  nombres: 'Daniel Alejandro',
  apellido1: 'Muñoz',
  apellido2: 'Tapia',
  fechaNacimiento: '14/03/1988',
  direccion: 'Los Jazmines 1420',
  depto: 'Depto 402',
  comunaId: 'nunoa',
} as const;

export function crearFicticios(ahora: number): DatosFicticios {
  const hace = (dias: number, horas = 0) => new Date(ahora - dias * DIA_MS - horas * HORA_MS).toISOString();
  const en = (dias: number) => new Date(ahora + dias * DIA_MS).toISOString();

  const doc = (
    tipo: TipoDocumentoId,
    estado: EstadoDocumento,
    diasAtras: number,
    extra: Partial<DocumentoUsuario> = {},
  ): DocumentoUsuario => {
    const base = documentoVacio(tipo);
    if (estado === 'falta') return base;
    const subido = hace(diasAtras, 2);
    return {
      ...base,
      estado,
      nombreArchivo: ARCHIVO[tipo],
      subidoEl: subido,
      enviadoEl: estado === 'subido' ? null : hace(diasAtras, 1),
      etapa: estado === 'en_revision' ? 'equipo' : null,
      revisadoEn: estado === 'aprobado' || estado === 'rechazado' ? hace(diasAtras) : null,
      venceEn: estado === 'aprobado' ? venceEnEjemplo(tipo, ahora - diasAtras * DIA_MS) : null,
      quienDecidio:
        estado === 'aprobado'
          ? tipo === 'cedula' || tipo === 'licencia'
            ? 'ia'
            : 'persona'
          : estado === 'rechazado'
            ? 'persona'
            : null,
      ...extra,
    };
  };

  const aprobados = (diasAtras: number): Record<TipoDocumentoId, DocumentoUsuario> => ({
    cedula: doc('cedula', 'aprobado', diasAtras),
    licencia: doc('licencia', 'aprobado', diasAtras),
    hoja_vida: doc('hoja_vida', 'aprobado', diasAtras),
    antecedentes: doc('antecedentes', 'aprobado', diasAtras),
  });

  // -------------------------------------------------------------------------
  // Titulares (t01 es el titular de la demo: "Ver como titular")
  // -------------------------------------------------------------------------
  const titulares: Titular[] = [
    {
      id: 't01',
      tipo: 'empresa',
      nombre: 'Carolina Méndez Ruiz',
      razonSocial: 'Transportes Los Aromos SpA',
      revisado: true,
      telefono: '+56 9 5555 0101',
      correo: 'contacto.aromos@demo.dalecontacto.cl',
      suspendido: false,
      creadoEl: hace(40),
    },
    {
      id: 't02',
      tipo: 'empresa',
      nombre: 'Felipe Araya Correa',
      razonSocial: 'Ejecutivos Cordillera SpA',
      revisado: true,
      telefono: '+56 9 5555 0102',
      correo: 'flota.cordillera@demo.dalecontacto.cl',
      suspendido: false,
      creadoEl: hace(35),
    },
    {
      id: 't03',
      tipo: 'persona',
      nombre: 'Rodrigo Pizarro Gallardo',
      razonSocial: null,
      revisado: true,
      telefono: '+56 9 5555 0103',
      correo: 'rodrigo.pizarro@demo.dalecontacto.cl',
      suspendido: false,
      creadoEl: hace(21),
    },
    {
      id: 't04',
      tipo: 'persona',
      nombre: 'Mónica Sepúlveda Riquelme',
      razonSocial: null,
      revisado: true,
      telefono: '+56 9 5555 0104',
      correo: 'monica.sepulveda@demo.dalecontacto.cl',
      suspendido: false,
      creadoEl: hace(18),
    },
    {
      id: 't05',
      tipo: 'empresa',
      nombre: 'Andrés Lagos Vera',
      razonSocial: 'Taxis Bahía Azul Ltda.',
      revisado: true,
      telefono: '+56 9 5555 0105',
      correo: 'bahia.azul@demo.dalecontacto.cl',
      suspendido: false,
      creadoEl: hace(30),
    },
    {
      id: 't06',
      tipo: 'persona',
      nombre: 'Jorge Alarcón Bustos',
      razonSocial: null,
      revisado: true,
      telefono: '+56 9 5555 0106',
      correo: 'jorge.alarcon@demo.dalecontacto.cl',
      suspendido: false,
      creadoEl: hace(12),
    },
    {
      id: 't07',
      tipo: 'persona',
      nombre: 'Claudio Espinoza Navarro',
      razonSocial: null,
      revisado: true,
      telefono: '+56 9 5555 0107',
      correo: 'claudio.espinoza@demo.dalecontacto.cl',
      suspendido: false,
      creadoEl: hace(9),
    },
  ];

  // -------------------------------------------------------------------------
  // Búsquedas (solo Taxi y Taxi ejecutivo, los negocios activos al lanzar)
  // -------------------------------------------------------------------------
  const base = {
    respuestaVehiculo: null,
    detalleOculto: false,
    estado: 'activa' as const,
    enBolsa: false,
    visibilidadBolsa: 'match' as const,
    perfilesBolsa: null,
    publicadaBolsaEl: null,
    destacadaHasta: null,
  };
  const busquedas: Busqueda[] = [
    {
      ...base,
      id: 'b01',
      titularId: 't01',
      negocioId: 'taxi',
      comunaId: 'providencia',
      turnos: ['dia'],
      dias: [...LU_SA],
      aniosMinimos: 3,
      exigeEstacionamiento: true,
      detalle:
        'Sedán 2021 con mantenciones al día y seguro pagado. Retiro a las 7:00. La bencina es del conductor; el TAG lo pagamos nosotros.',
      publicadaEl: hace(6),
      enBolsa: true,
      visibilidadBolsa: 'match',
      publicadaBolsaEl: hace(5),
    },
    {
      ...base,
      id: 'b02',
      titularId: 't02',
      negocioId: 'taxi_ejecutivo',
      comunaId: 'las-condes',
      turnos: ['dia', 'noche'],
      dias: [...LU_VI],
      aniosMinimos: 5,
      exigeEstacionamiento: false,
      detalle:
        'Flota de sedanes ejecutivos 2023. Traslados al aeropuerto y a empresas. Buscamos buen trato con pasajeros y puntualidad.',
      publicadaEl: hace(4),
    },
    {
      ...base,
      id: 'b03',
      titularId: 't03',
      negocioId: 'taxi',
      comunaId: 'santiago',
      turnos: ['dia'],
      dias: [...TODOS],
      aniosMinimos: 2,
      exigeEstacionamiento: true,
      detalle: 'Taxi 2020 con taxímetro nuevo. Retiro en el centro, cerca del metro. Entrega diaria conversable.',
      publicadaEl: hace(3),
    },
    {
      ...base,
      id: 'b04',
      titularId: 't02',
      negocioId: 'taxi_ejecutivo',
      comunaId: 'macul',
      turnos: ['noche'],
      dias: [...LU_VI],
      aniosMinimos: 2,
      exigeEstacionamiento: false,
      detalle: 'Turno de noche para traslados de empresas y aeropuerto. Vehículo 2022.',
      publicadaEl: hace(8),
    },
    {
      ...base,
      id: 'b05',
      titularId: 't01',
      negocioId: 'taxi',
      comunaId: 'maipu',
      turnos: ['dia'],
      dias: [...LU_VI],
      aniosMinimos: 8,
      exigeEstacionamiento: true,
      detalle: 'Taxi 2019 en buen estado. Buscamos conductor con experiencia y estacionamiento en la comuna o cerca.',
      publicadaEl: hace(10),
      enBolsa: true,
      visibilidadBolsa: 'match',
      publicadaBolsaEl: hace(9),
    },
    {
      ...base,
      id: 'b06',
      titularId: 't01',
      negocioId: 'taxi',
      comunaId: 'la-florida',
      turnos: ['dia'],
      dias: [...LU_VI],
      aniosMinimos: 10,
      exigeEstacionamiento: true,
      detalle: 'Sedán 2022 a gas, de bajo consumo. Preferimos conductores que vivan en la zona sur.',
      publicadaEl: hace(7),
      enBolsa: true,
      visibilidadBolsa: 'perfiles',
      perfilesBolsa: { zonas: ['r07-z5'], aniosMinimos: 3, turnos: ['dia'], dias: [], estacionamiento: true },
      publicadaBolsaEl: hace(7),
    },
    {
      ...base,
      id: 'b07',
      titularId: 't04',
      negocioId: 'taxi_ejecutivo',
      comunaId: 'nunoa',
      turnos: ['dia', 'noche'],
      dias: ['sa', 'do'],
      aniosMinimos: 1,
      exigeEstacionamiento: false,
      detalle: 'Auto ejecutivo 2021 para fines de semana. Ideal para complementar ingresos.',
      publicadaEl: hace(2),
    },
    {
      ...base,
      id: 'b08',
      titularId: 't05',
      negocioId: 'taxi',
      comunaId: 'vina-del-mar',
      turnos: ['dia'],
      dias: [...LU_SA],
      aniosMinimos: 2,
      exigeEstacionamiento: false,
      detalle: 'Taxi 2020, retiro en Viña del Mar. Las mantenciones son a cargo del dueño.',
      publicadaEl: hace(5),
      enBolsa: true,
      visibilidadBolsa: 'todos',
      publicadaBolsaEl: hace(5),
    },
    {
      ...base,
      id: 'b09',
      titularId: 't06',
      negocioId: 'taxi_ejecutivo',
      comunaId: 'concepcion',
      turnos: ['noche'],
      dias: [...TODOS],
      aniosMinimos: 3,
      exigeEstacionamiento: true,
      detalle: 'Traslados al aeropuerto en turno de noche. Vehículo 2023 con todo al día.',
      publicadaEl: hace(4),
      enBolsa: true,
      visibilidadBolsa: 'todos',
      publicadaBolsaEl: hace(4),
    },
    {
      ...base,
      id: 'b10',
      titularId: 't05',
      negocioId: 'taxi',
      comunaId: 'valparaiso',
      turnos: ['noche'],
      dias: [...LU_VI],
      aniosMinimos: 0,
      exigeEstacionamiento: false,
      detalle: 'Turno de noche en Valparaíso. Taxi 2018 con revisión técnica al día.',
      publicadaEl: hace(11),
    },
    {
      ...base,
      id: 'b11',
      titularId: 't07',
      negocioId: 'taxi',
      comunaId: 'puente-alto',
      turnos: ['noche'],
      dias: [...TODOS],
      aniosMinimos: 1,
      exigeEstacionamiento: false,
      detalle: 'Taxi 2021 para turno de noche. Días de descanso a convenir.',
      publicadaEl: hace(1),
      enBolsa: true,
      visibilidadBolsa: 'todos',
      publicadaBolsaEl: hace(1),
    },
    {
      ...base,
      id: 'b12',
      titularId: 't01',
      negocioId: 'taxi_ejecutivo',
      comunaId: 'vitacura',
      turnos: ['dia'],
      dias: [...LU_VI],
      aniosMinimos: 4,
      exigeEstacionamiento: false,
      detalle: 'Sedán ejecutivo 2023. Traslados corporativos en horario de oficina.',
      estado: 'pausada',
      publicadaEl: hace(15),
    },
    {
      ...base,
      id: 'b13',
      titularId: 't02',
      negocioId: 'taxi',
      comunaId: 'quilicura',
      turnos: ['dia'],
      dias: [...LU_VI],
      aniosMinimos: 7,
      exigeEstacionamiento: false,
      detalle:
        'Taxis 2024 con aire acondicionado. Retiro en Quilicura, cerca de la autopista. Buscamos conductores con experiencia.',
      publicadaEl: hace(2),
      enBolsa: true,
      visibilidadBolsa: 'todos',
      publicadaBolsaEl: hace(2),
      destacadaHasta: en(5),
    },
    {
      ...base,
      id: 'b14',
      titularId: 't02',
      negocioId: 'taxi_ejecutivo',
      comunaId: 'lo-barnechea',
      turnos: ['dia'],
      dias: [...LU_VI],
      aniosMinimos: 2,
      exigeEstacionamiento: false,
      detalle: 'Traslados ejecutivos en el sector oriente. Auto 2023, horario de oficina.',
      publicadaEl: hace(1, 5),
      enBolsa: true,
      visibilidadBolsa: 'perfiles',
      perfilesBolsa: { zonas: ['r07-z3'], aniosMinimos: 2, turnos: ['dia'], dias: [], estacionamiento: false },
      publicadaBolsaEl: hace(1, 4),
    },
  ];

  // -------------------------------------------------------------------------
  // Conductores ficticios (para la cola del panel, los postulantes y los conteos del titular)
  // -------------------------------------------------------------------------
  const perfilBase = {
    direccion: '',
    depto: '',
    idiomas: ['es'],
    disponible: true,
    disponibilidadConfirmadaEn: hace(3),
    estadoPerfil: 'completo' as const,
    estadoVerificacion: 'verificado' as const,
    suspendido: false,
  };
  const conductores: ConductorFicticio[] = [
    {
      ...perfilBase,
      id: 'c01',
      nombres: 'Marcela',
      apellido1: 'Ortiz',
      apellido2: 'Fuenzalida',
      celular: '+56 9 5555 0201',
      correo: 'marcela.ortiz@demo.dalecontacto.cl',
      fechaNacimiento: '22/07/1985',
      comunaId: 'providencia',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A2', 'B'],
      clasesRevisadas: ['A2', 'B'],
      experiencia: { liviano: 8 },
      negocios: ['taxi'],
      turnos: ['dia'],
      dias: [...LU_SA],
      registradoEl: hace(25),
      documentos: aprobados(20),
    },
    {
      ...perfilBase,
      id: 'c02',
      nombres: 'Luis',
      apellido1: 'Henríquez',
      apellido2: 'Parra',
      celular: '+56 9 5555 0202',
      correo: 'luis.henriquez@demo.dalecontacto.cl',
      fechaNacimiento: '03/11/1979',
      comunaId: 'las-condes',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A1', 'B'],
      clasesRevisadas: ['A1', 'B'],
      idiomas: ['es', 'en'],
      experiencia: { liviano: 12, van: 3 },
      negocios: ['taxi', 'taxi_ejecutivo'],
      turnos: ['dia', 'noche'],
      dias: [...TODOS],
      registradoEl: hace(28),
      documentos: aprobados(22),
    },
    {
      ...perfilBase,
      id: 'c03',
      nombres: 'Pedro',
      apellido1: 'Valenzuela',
      apellido2: 'Rojas',
      celular: '+56 9 5555 0203',
      correo: 'pedro.valenzuela@demo.dalecontacto.cl',
      fechaNacimiento: '09/05/1990',
      comunaId: 'maipu',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A2', 'B'],
      clasesRevisadas: ['A2', 'B'],
      experiencia: { liviano: 6 },
      negocios: ['taxi'],
      turnos: ['dia'],
      dias: [...LU_VI],
      estadoVerificacion: 'en_revision',
      registradoEl: hace(2),
      documentos: {
        cedula: doc('cedula', 'aprobado', 1),
        licencia: doc('licencia', 'aprobado', 1),
        hoja_vida: doc('hoja_vida', 'en_revision', 1),
        antecedentes: doc('antecedentes', 'aprobado', 1),
      },
    },
    {
      ...perfilBase,
      id: 'c04',
      nombres: 'Rosa',
      apellido1: 'Carrasco',
      apellido2: 'Vidal',
      celular: '+56 9 5555 0204',
      correo: 'rosa.carrasco@demo.dalecontacto.cl',
      fechaNacimiento: '17/01/1983',
      comunaId: 'la-florida',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A2', 'B'],
      clasesRevisadas: ['A2', 'B'],
      experiencia: { liviano: 11 },
      negocios: ['taxi'],
      turnos: ['dia'],
      dias: [...LU_VI],
      registradoEl: hace(19),
      documentos: aprobados(15),
    },
    {
      ...perfilBase,
      id: 'c05',
      nombres: 'Jean-Baptiste',
      apellido1: 'Pierre',
      apellido2: '',
      celular: '+56 9 5555 0205',
      correo: 'jb.pierre@demo.dalecontacto.cl',
      fechaNacimiento: '30/09/1991',
      comunaId: 'estacion-central',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A2', 'B'],
      clasesRevisadas: ['A2', 'B'],
      idiomas: ['es', 'fr', 'ht'],
      experiencia: { liviano: 9 },
      negocios: ['taxi'],
      turnos: ['dia'],
      dias: [...LU_VI],
      registradoEl: hace(14),
      documentos: aprobados(10),
    },
    {
      ...perfilBase,
      id: 'c06',
      nombres: 'Andrés',
      apellido1: 'Figueroa',
      apellido2: 'Lillo',
      celular: '+56 9 5555 0206',
      correo: 'andres.figueroa@demo.dalecontacto.cl',
      fechaNacimiento: '12/12/1987',
      comunaId: 'san-miguel',
      tieneEstacionamiento: false,
      clasesDeclaradas: ['A2', 'B'],
      clasesRevisadas: [],
      experiencia: { liviano: 4 },
      negocios: ['taxi', 'taxi_ejecutivo'],
      turnos: ['noche'],
      dias: [...TODOS],
      estadoVerificacion: 'con_observaciones',
      registradoEl: hace(6),
      documentos: {
        cedula: doc('cedula', 'aprobado', 4),
        licencia: doc('licencia', 'rechazado', 4, { motivo: 'ilegible' }),
        hoja_vida: doc('hoja_vida', 'aprobado', 4),
        antecedentes: doc('antecedentes', 'aprobado', 4),
      },
    },
    {
      ...perfilBase,
      id: 'c07',
      nombres: 'Valentina',
      apellido1: 'Muñoz',
      apellido2: 'Araya',
      celular: '+56 9 5555 0207',
      correo: 'valentina.munoz@demo.dalecontacto.cl',
      fechaNacimiento: '05/04/1995',
      comunaId: 'renca',
      tieneEstacionamiento: false,
      clasesDeclaradas: ['A1', 'B'],
      clasesRevisadas: [],
      experiencia: { liviano: 3 },
      negocios: ['taxi'],
      turnos: ['dia'],
      dias: [...LU_VI],
      estadoPerfil: 'incompleto',
      estadoVerificacion: 'sin_documentos',
      disponibilidadConfirmadaEn: null,
      registradoEl: hace(1),
      documentos: documentosVacios(),
    },
    {
      ...perfilBase,
      id: 'c08',
      nombres: 'Héctor',
      apellido1: 'Saavedra',
      apellido2: 'Pinto',
      celular: '+56 9 5555 0208',
      correo: 'hector.saavedra@demo.dalecontacto.cl',
      fechaNacimiento: '21/08/1976',
      comunaId: 'recoleta',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A3', 'B'],
      clasesRevisadas: ['A3', 'B'],
      experiencia: { liviano: 15, bus: 6 },
      negocios: ['taxi', 'taxi_ejecutivo'],
      turnos: ['dia'],
      dias: [...LU_SA],
      estadoVerificacion: 'en_revision',
      registradoEl: hace(1, 6),
      documentos: {
        cedula: doc('cedula', 'aprobado', 0),
        licencia: doc('licencia', 'aprobado', 0),
        hoja_vida: doc('hoja_vida', 'en_revision', 0),
        antecedentes: doc('antecedentes', 'en_revision', 0),
      },
    },
    {
      ...perfilBase,
      id: 'c09',
      nombres: 'Patricio',
      apellido1: 'Leiva',
      apellido2: 'Contreras',
      celular: '+56 9 5555 0209',
      correo: 'patricio.leiva@demo.dalecontacto.cl',
      fechaNacimiento: '14/02/1989',
      comunaId: 'vina-del-mar',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A2', 'B'],
      clasesRevisadas: ['A2', 'B'],
      experiencia: { liviano: 7 },
      negocios: ['taxi'],
      turnos: ['dia'],
      dias: [...LU_SA],
      registradoEl: hace(16),
      documentos: aprobados(12),
    },
    {
      ...perfilBase,
      id: 'c10',
      nombres: 'Gabriela',
      apellido1: 'Rojas',
      apellido2: 'Ibáñez',
      celular: '+56 9 5555 0210',
      correo: 'gabriela.rojas@demo.dalecontacto.cl',
      fechaNacimiento: '28/06/1993',
      comunaId: 'concepcion',
      tieneEstacionamiento: true,
      clasesDeclaradas: ['A1', 'B'],
      clasesRevisadas: [],
      experiencia: { liviano: 5 },
      negocios: ['taxi_ejecutivo'],
      turnos: ['noche'],
      dias: [...TODOS],
      estadoVerificacion: 'en_revision',
      registradoEl: hace(0, 8),
      documentos: {
        cedula: doc('cedula', 'en_revision', 0),
        licencia: doc('licencia', 'en_revision', 0),
        hoja_vida: doc('hoja_vida', 'en_revision', 0),
        antecedentes: doc('antecedentes', 'en_revision', 0),
      },
    },
  ];

  // -------------------------------------------------------------------------
  // Postulaciones a las ofertas del titular de la demo (t01)
  // -------------------------------------------------------------------------
  const postulaciones: Postulacion[] = [
    { id: 'p01', busquedaId: 'b01', conductorId: 'c02', estado: 'te_escribio', postuloEl: hace(3), vistaEl: hace(2, 20), cambioEl: hace(2, 18) },
    { id: 'p02', busquedaId: 'b01', conductorId: 'c01', estado: 'vista', postuloEl: hace(1, 3), vistaEl: hace(0, 20), cambioEl: hace(0, 20) },
    { id: 'p03', busquedaId: 'b01', conductorId: 'c05', estado: 'enviada', postuloEl: hace(0, 2), vistaEl: null, cambioEl: hace(0, 2) },
    { id: 'p04', busquedaId: 'b05', conductorId: 'c05', estado: 'enviada', postuloEl: hace(0, 5), vistaEl: null, cambioEl: hace(0, 5) },
    { id: 'p05', busquedaId: 'b06', conductorId: 'c04', estado: 'vista', postuloEl: hace(2), vistaEl: hace(1, 10), cambioEl: hace(1, 10) },
  ];

  return { titulares, busquedas, conductores, postulaciones };
}

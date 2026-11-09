// Tienda de la demo (zustand + persist): todo lo que pasa en la demo vive aquí y se guarda en el
// navegador (localStorage, clave "dale-demo-datos"; ver almacenamiento.ts). Nada sale del navegador.
//
// Uso en pantallas:
//   const nombres = useDemo((s) => s.cuenta.nombres);          // un valor simple
//   const guardarPaso1 = useDemo((s) => s.guardarPaso1);        // una acción
//   const matches = useMatchesDelUsuario();                     // listas: hooks de ./hooks
// Fuera de React: useDemo.getState().alternarFavorito('b01').
// Cada grupo puede escribir acciones propias con useDemo.setState(...) en su carpeta. Otra app del mismo
// sitio puede crear su propia tienda con este módulo y escribir con useDemo.setState: comparten lo
// guardado en el navegador (misma clave y misma versión), no el código.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { crearAlmacenDemo } from './almacenamiento';
import { avisar } from './avisos';
import { borrarTodosLosBorradores } from './borradores';
import {
  CLAVE_ALMACENAMIENTO,
  CLAVE_ALMACENAMIENTO_ANTERIOR,
  VERSION_ESTADO,
  crearEstadoInicial,
  migrarEstado,
  type DatosDemo,
} from './estado';
import { reiniciarRevisionManual } from './revisionManual';
import { EJEMPLO_USUARIO, conductorInicial, cuentaInicial, documentoVacio, documentosVacios, venceEnEjemplo } from './semilla';
import {
  ID_USUARIO,
  TIPOS_DOC_ORDEN,
  busquedaPorId,
  matchesDelUsuario,
  nombreCompleto,
  nombreTitular,
  planDeLaDemo,
  titularPorId,
} from './selectores';
import type {
  Autorizaciones,
  ConductorFicticio,
  CuentaUsuario,
  Dia,
  DocumentoUsuario,
  EntregaDatos,
  EstadoBusqueda,
  EstadoVerificacion,
  Mensaje,
  MotivoReporteId,
  PerfilConductor,
  PerfilesBolsa,
  PlanTitular,
  QueSeEntrego,
  Rol,
  TareaSimulada,
  TipoDocumentoId,
  Turno,
  VisibilidadBolsa,
} from './tipos';

export type { DatosDemo } from './estado';

/** Resultado de una acción que puede no permitirse (por ejemplo, por el plan). */
export interface Resultado {
  ok: boolean;
  error?: string;
}

/** Lo que ve el titular de la demo si el equipo suspendió su cuenta (R18: sale del match y no puede escribir). */
export const TEXTO_CUENTA_SUSPENDIDA = 'Tu cuenta está suspendida: tus búsquedas no salen en los matches y no puedes escribir.';

/** Cuánto tarda la persona del equipo (simulada) en revisar un documento que no aprobó la IA. */
export const SEGUNDOS_REVISION_EQUIPO = 12;

export interface DatosPaso1 {
  nombres: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento: string;
  correo: string;
  clasesDeclaradas: string[];
  disponible: boolean;
}

export interface DatosPaso2 {
  direccion: string;
  depto: string;
  comunaId: string | null;
  tieneEstacionamiento: boolean;
}

export interface DatosPaso3 {
  experiencia: Record<string, number>;
  idiomas: string[];
}

export interface DatosPaso4 {
  negocios: string[];
  turnos: Turno[];
  dias: Dia[];
}

export interface AccionesDemo {
  // --- General ---
  elegirRol: (rol: Rol | null) => void;
  /** Vuelve todo a como estaba al abrir la demo por primera vez (y vuelve la revisión simulada). */
  reiniciarDemo: () => void;
  /** Atajo: deja al usuario como conductor con perfil completo y verificado, con 2 conversaciones. */
  prepararConductorVerificado: () => void;
  /**
   * Atajo: perfil completo con la Hoja de Vida no aprobada (PDF vencido) y los otros 3 documentos
   * aprobados. Sirve para ver "Documento no aprobado" (C4) y todo lo que depende de ese estado.
   */
  prepararDocumentoNoAprobado: () => void;

  // --- Ingreso (A2–A4) ---
  guardarCelular: (celular: string) => void;
  verificarCelular: () => void;
  aceptarAutorizaciones: (a: Partial<Autorizaciones>) => void;
  actualizarCuenta: (parcial: Partial<Pick<CuentaUsuario, 'correo' | 'nombres' | 'apellido1' | 'apellido2' | 'celular'>>) => void;

  // --- Registro (B1–B5) ---
  /** Guarda el Paso 1: desde aquí el conductor queda registrado. */
  guardarPaso1: (d: DatosPaso1) => void;
  guardarPaso2: (d: DatosPaso2) => void;
  guardarPaso3: (d: DatosPaso3) => void;
  guardarPaso4: (d: DatosPaso4) => void;
  irAPaso: (paso: number) => void;
  /** Cambia datos del perfil sin marcar pasos (ediciones desde Perfil). */
  actualizarConductor: (parcial: Partial<PerfilConductor>) => void;

  // --- Documentos (B5, C1–C4, E2) ---
  /** Elige un archivo (en la demo solo se guarda el nombre). Queda "Subido". */
  subirDocumento: (tipo: TipoDocumentoId, nombreArchivo?: string) => void;
  quitarDocumento: (tipo: TipoDocumentoId) => void;
  /** Envía a revisión los documentos subidos (o los indicados). Empieza la pre-revisión simulada. */
  enviarDocumentosARevision: (tipos?: TipoDocumentoId[]) => void;
  /** "No estoy de acuerdo: pedir otra revisión". */
  pedirOtraRevision: (tipo: TipoDocumentoId) => void;
  /** Atajo de la demo ("Aprobar ahora"): el equipo simulado aprueba ya los documentos en revisión. */
  aprobarPendientesDemo: () => void;
  /** La usa la simulación: el agente de IA aprueba un documento claro del usuario. */
  aprobarPorAgenteIA: (tipo: TipoDocumentoId) => void;
  /** La usa la simulación: una persona del equipo (simulada) aprueba un documento del usuario. */
  aprobarPorEquipo: (tipo: TipoDocumentoId) => void;

  // --- Disponibilidad (E4) y cuenta (E5) ---
  cambiarDisponible: (disponible: boolean) => void;
  confirmarDisponibilidad: () => void;
  eliminarCuenta: () => void;

  // --- Matches y mensajes (D1–D5) ---
  alternarFavorito: (busquedaId: string) => void;
  enviarMensaje: (busquedaId: string, texto: string) => void;
  marcarConversacionLeida: (busquedaId: string) => void;
  compartirMiDireccion: (busquedaId: string) => void;
  reportarConversacion: (d: { busquedaId: string; motivo: MotivoReporteId; detalle?: string }) => void;
  bloquearTitular: (titularId: string) => void;
  desbloquearTitular: (titularId: string) => void;

  // --- Bolsa: conductor (BC1–BC3) ---
  postular: (busquedaId: string) => Resultado;

  // --- Bolsa: titular de la demo (BT1–BT5) ---
  /**
   * Cambia el plan del titular de la demo y aplica sus límites: con un plan menor quita las destacadas
   * (solo Flota), baja la visibilidad a la más alta que permite, saca de la bolsa las ofertas que
   * sobran y pausa las búsquedas que pasan del límite (primero las más antiguas). Devuelve qué cambió.
   */
  cambiarPlanTitular: (plan: PlanTitular) => string[];
  publicarEnBolsa: (busquedaId: string, d: { visibilidad: VisibilidadBolsa; perfiles?: PerfilesBolsa | null }) => Resultado;
  quitarDeBolsa: (busquedaId: string) => void;
  destacarOferta: (busquedaId: string) => Resultado;
  quitarDestacado: (busquedaId: string) => void;
  cambiarEstadoBusqueda: (busquedaId: string, estado: EstadoBusqueda) => Resultado;
  verPostulacion: (postulacionId: string) => void;
  /** El titular le escribe a un postulante (no puede si su cuenta está suspendida: R18). */
  escribirAPostulante: (postulacionId: string, texto: string) => Resultado;
  descartarPostulacion: (postulacionId: string) => void;
  alternarFavoritoTitular: (conductorId: string) => void;
}

export type EstadoDemo = DatosDemo & AccionesDemo;

// ---------------------------------------------------------------------------
// Ayudas internas
// ---------------------------------------------------------------------------

export const ahoraISO = () => new Date().toISOString();
let contador = 0;
export const nuevoId = (prefijo: string) => `${prefijo}${Date.now().toString(36)}${(contador++).toString(36)}`;

/** Estado de verificación según los 4 documentos. */
export function calcularVerificacion(docs: Record<TipoDocumentoId, DocumentoUsuario>): EstadoVerificacion {
  const lista = TIPOS_DOC_ORDEN.map((t) => docs[t]);
  if (lista.some((d) => d.estado === 'rechazado')) return 'con_observaciones';
  if (lista.every((d) => d.estado === 'aprobado')) return 'verificado';
  if (lista.some((d) => d.estado === 'en_revision' || d.estado === 'aprobado')) return 'en_revision';
  return 'sin_documentos';
}

/** Recalcula pasos, estado del perfil y de verificación del usuario. */
export function recalcularUsuario(s: DatosDemo): Pick<DatosDemo, 'conductor'> {
  const docs = s.documentos;
  const enviados = TIPOS_DOC_ORDEN.every((t) => docs[t].estado !== 'falta' && docs[t].estado !== 'subido');
  const pasosListos = { ...s.conductor.pasosListos, documentos: s.conductor.pasosListos.documentos || enviados };
  const completo = Object.values(pasosListos).every(Boolean);
  return {
    conductor: {
      ...s.conductor,
      pasosListos,
      estadoPerfil: completo ? 'completo' : 'incompleto',
      estadoVerificacion: calcularVerificacion(docs),
    },
  };
}

/** El documento aprobado ahora, por el agente de IA o por una persona del equipo. */
export function docAprobado(doc: DocumentoUsuario, quien: 'ia' | 'persona'): DocumentoUsuario {
  const ahora = Date.now();
  return {
    ...doc,
    estado: 'aprobado',
    etapa: null,
    revisadoEn: new Date(ahora).toISOString(),
    venceEn: venceEnEjemplo(doc.tipo, ahora),
    quienDecidio: quien,
    motivo: null,
  };
}

function mensajeSistema(texto: string): Mensaje {
  return { id: nuevoId('m'), autor: 'sistema', texto, hora: ahoraISO(), leido: true };
}

function nuevaEntrega(s: DatosDemo, busquedaId: string, que: QueSeEntrego[], desde: EntregaDatos['desde']): EntregaDatos | null {
  const b = busquedaPorId(s, busquedaId);
  const t = b ? titularPorId(s, b.titularId) : undefined;
  if (!b || !t) return null;
  return {
    id: nuevoId('ed'),
    busquedaId,
    titularId: t.id,
    nombreTitular: nombreTitular(t),
    negocioId: b.negocioId,
    que,
    desde,
    fecha: ahoraISO(),
  };
}

/** Tareas de la simulación que dependen de lo que hizo el usuario (se descartan con los atajos). */
const TAREAS_DEL_USUARIO = new Set<TareaSimulada['tipo']>(['prerevision', 'revision_equipo', 'respuesta_titular', 'abre_ficha']);

/**
 * Conductor de ejemplo con el perfil completo y los 4 documentos aprobados hace un día (la cédula y
 * la licencia por la IA; la Hoja de Vida y los antecedentes por una persona). Base de los atajos.
 */
function conductorDeEjemplo(ahora: number): Pick<DatosDemo, 'cuenta' | 'conductor' | 'documentos'> {
  const hace = (min: number) => new Date(ahora - min * 60 * 1000).toISOString();
  const documentos = documentosVacios();
  for (const t of TIPOS_DOC_ORDEN) {
    documentos[t] = {
      ...docAprobado(
        {
          ...documentoVacio(t),
          estado: 'en_revision',
          nombreArchivo: t === 'cedula' || t === 'licencia' ? `${t}.jpg` : `${t.replace('_', '-')}.pdf`,
          subidoEl: hace(60 * 26),
          enviadoEl: hace(60 * 26),
        },
        t === 'cedula' || t === 'licencia' ? 'ia' : 'persona',
      ),
      revisadoEn: hace(60 * 24),
    };
  }
  const base = conductorInicial();
  const conductor = {
    ...base,
    registrado: true,
    registradoEl: hace(60 * 27),
    pasosListos: { datos: true, direccion: true, experiencia: true, trabajo: true, documentos: true },
    pasoActual: 5,
    fechaNacimiento: EJEMPLO_USUARIO.fechaNacimiento,
    direccion: EJEMPLO_USUARIO.direccion,
    depto: EJEMPLO_USUARIO.depto,
    comunaId: EJEMPLO_USUARIO.comunaId,
    clasesRevisadas: [...base.clasesDeclaradas],
    disponibilidadConfirmadaEn: hace(60 * 24),
    estadoPerfil: 'completo' as const,
    estadoVerificacion: 'verificado' as const,
  };
  const cuenta: CuentaUsuario = {
    ...cuentaInicial(),
    celular: EJEMPLO_USUARIO.celular,
    celularVerificado: true,
    correo: EJEMPLO_USUARIO.correo,
    nombres: EJEMPLO_USUARIO.nombres,
    apellido1: EJEMPLO_USUARIO.apellido1,
    apellido2: EJEMPLO_USUARIO.apellido2,
    creadaEl: hace(60 * 27),
    autorizaciones: { terminos: true, privacidad: true, compartirFicha: true, recordatoriosWhatsapp: true },
    autorizacionesEl: hace(60 * 27),
  };
  return { cuenta, conductor, documentos };
}

/** Programa que algunos titulares con match "abran la ficha" del conductor recién verificado. */
export function tareasAlVerificar(s: DatosDemo): TareaSimulada[] {
  const ahora = Date.now();
  return matchesDelUsuario(s)
    .filter((m) => !s.fichasAbiertas.includes(m.id))
    .slice(0, 2)
    .map((m, i) => ({ id: nuevoId('t'), tipo: 'abre_ficha' as const, venceEn: ahora + 7000 + i * 9000, busquedaId: m.id }));
}

/**
 * Cambia un documento del usuario ('yo') o de un conductor ficticio y recalcula su verificación.
 * No guarda nada: devuelve los cambios para useDemo.setState y si el usuario quedó verificado recién
 * (en ese caso ya van programadas las tareas de tareasAlVerificar).
 */
export function cambiarDocumento(
  s: DatosDemo,
  duenoId: string,
  tipo: TipoDocumentoId,
  cambio: (d: DocumentoUsuario) => DocumentoUsuario,
  extra?: (c: { clasesDeclaradas: string[] }) => Partial<PerfilConductor>,
): { cambios: Partial<DatosDemo>; quedoVerificado: boolean } {
  if (duenoId === ID_USUARIO) {
    const antes = s.conductor.estadoVerificacion;
    const documentos = { ...s.documentos, [tipo]: cambio(s.documentos[tipo]) };
    const conductor = { ...s.conductor, ...(extra ? extra(s.conductor) : {}) };
    const siguiente = { ...s, documentos, conductor };
    const rec = recalcularUsuario(siguiente);
    const quedoVerificado = antes !== 'verificado' && rec.conductor.estadoVerificacion === 'verificado';
    return {
      cambios: {
        documentos,
        ...rec,
        pendientes: quedoVerificado ? [...s.pendientes, ...tareasAlVerificar({ ...siguiente, ...rec })] : s.pendientes,
      },
      quedoVerificado,
    };
  }
  return {
    cambios: {
      conductores: s.conductores.map((c): ConductorFicticio => {
        if (c.id !== duenoId) return c;
        const documentos = { ...c.documentos, [tipo]: cambio(c.documentos[tipo]) };
        return { ...c, ...(extra ? extra(c) : {}), documentos, estadoVerificacion: calcularVerificacion(documentos) };
      }),
    },
    quedoVerificado: false,
  };
}

/** La licencia aprobada copia las clases declaradas a revisadas. */
export const extraAlAprobar = (tipo: TipoDocumentoId) =>
  tipo === 'licencia' ? (c: { clasesDeclaradas: string[] }) => ({ clasesRevisadas: [...c.clasesDeclaradas] }) : undefined;

// ---------------------------------------------------------------------------
// Tienda
// ---------------------------------------------------------------------------

export const useDemo = create<EstadoDemo>()(
  persist(
    (setOriginal, get) => {
      // persist hace que setState devuelva una promesa; las acciones devuelven siempre void para que
      // se puedan llamar dentro de useEffect sin que React confunda la promesa con una limpieza.
      const set = ((...args: unknown[]) => {
        (setOriginal as (...a: unknown[]) => unknown)(...args);
      }) as typeof setOriginal;
      /** Cambia un documento del usuario (ver cambiarDocumento) y avisa si quedó verificado. */
      const cambiarDocumentoDe = (
        duenoId: string,
        tipo: TipoDocumentoId,
        cambio: (d: DocumentoUsuario) => DocumentoUsuario,
        extra?: (c: { clasesDeclaradas: string[] }) => Partial<PerfilConductor>,
      ) => {
        const r = cambiarDocumento(get(), duenoId, tipo, cambio, extra);
        set(r.cambios);
        if (r.quedoVerificado) avisar('¡Listo! Tus 4 documentos están aprobados.', 'exito');
      };

      return {
        ...crearEstadoInicial(),

        // ------------------------------------------------------------------ General
        elegirRol: (rol) => set({ rol }),

        reiniciarDemo: () => {
          borrarTodosLosBorradores();
          // Si alguien revisaba los documentos a mano en este navegador, vuelve la revisión simulada
          // (y las demás pestañas del sitio se enteran del reinicio).
          reiniciarRevisionManual();
          set({ ...crearEstadoInicial() });
        },

        prepararConductorVerificado: () => {
          borrarTodosLosBorradores();
          const s = get();
          const ahora = Date.now();
          const hace = (min: number) => new Date(ahora - min * 60 * 1000).toISOString();
          const { cuenta, conductor, documentos: aprobados } = conductorDeEjemplo(ahora);
          // Como en las maquetas E1 y E2: la Hoja de Vida vence en 20 días (dentro del aviso de 30),
          // para ver "Vence pronto", "Renuévala antes del…" y "Subir nueva".
          const documentos = {
            ...aprobados,
            hoja_vida: { ...aprobados.hoja_vida, venceEn: new Date(ahora + 20 * 24 * 60 * 60 * 1000).toISOString() },
          };
          const m = (autor: Mensaje['autor'], texto: string, min: number, leido = true): Mensaje => ({
            id: nuevoId('m'),
            autor,
            texto,
            hora: hace(min),
            leido,
          });
          const mensajes: Record<string, Mensaje[]> = {
            b01: [
              m('conductor', 'Hola, vi tu búsqueda. ¿El vehículo se retira en la mañana?', 60 * 5),
              m('titular', 'Hola Daniel, sí, desde las 7:00 en Providencia. ¿Desde cuándo podrías partir?', 60 * 4 + 40),
              m('conductor', 'Podría partir el lunes. Tengo estacionamiento en mi casa.', 60 * 4 + 30),
              m('sistema', 'Transportes Los Aromos SpA compartió su contacto contigo.', 60 * 4),
              m('titular', 'Perfecto. Te dejé mi contacto para coordinar.', 60 * 4),
            ],
            b02: [
              m('conductor', 'Hola, me interesa el taxi ejecutivo. Tengo 5 años manejando.', 60 * 2),
              m('titular', 'Hola, gracias por escribir. ¿Tienes experiencia con traslados al aeropuerto?', 25, false),
            ],
          };
          set({
            rol: 'conductor',
            cuenta,
            conductor,
            documentos,
            mensajes,
            titularEscribiendo: {},
            favoritos: ['b01'],
            contactoCompartido: { b01: hace(60 * 4) },
            direccionCompartida: {},
            entregasDatos: [
              {
                id: nuevoId('ed'),
                busquedaId: 'b01',
                titularId: 't01',
                nombreTitular: 'Transportes Los Aromos SpA',
                negocioId: 'taxi',
                que: ['ficha', 'telefono', 'correo'],
                desde: 'apertura_ficha',
                fecha: hace(60 * 6),
              },
              {
                id: nuevoId('ed'),
                busquedaId: 'b02',
                titularId: 't02',
                nombreTitular: 'Ejecutivos Cordillera SpA',
                negocioId: 'taxi_ejecutivo',
                que: ['ficha', 'telefono', 'correo'],
                desde: 'apertura_ficha',
                fecha: hace(60 * 3),
              },
            ],
            fichasAbiertas: ['b01', 'b02'],
            bloqueos: [],
            matchesPorPostulacion: [],
            postulaciones: s.postulaciones.filter((p) => p.conductorId !== ID_USUARIO),
            pendientes: s.pendientes.filter((t) => t.tipo !== 'prerevision' && t.tipo !== 'revision_equipo' && t.tipo !== 'respuesta_titular'),
          });
        },

        prepararDocumentoNoAprobado: () => {
          borrarTodosLosBorradores();
          const s = get();
          const base = conductorDeEjemplo(Date.now());
          // La Hoja de Vida no se aprobó: el PDF se sacó hace más de los días permitidos. Todo rechazo
          // lo decide una persona del equipo. Los otros 3 documentos quedan aprobados.
          const documentos = {
            ...base.documentos,
            hoja_vida: {
              ...base.documentos.hoja_vida,
              estado: 'rechazado' as const,
              venceEn: null,
              quienDecidio: 'persona' as const,
              motivo: 'vencido' as const,
            },
          };
          set({
            rol: 'conductor',
            cuenta: base.cuenta,
            conductor: { ...base.conductor, estadoVerificacion: calcularVerificacion(documentos) },
            documentos,
            // Nunca llegó a estar verificado: sin matches, conversaciones ni entregas de datos.
            mensajes: {},
            titularEscribiendo: {},
            favoritos: [],
            contactoCompartido: {},
            direccionCompartida: {},
            entregasDatos: [],
            fichasAbiertas: [],
            bloqueos: [],
            matchesPorPostulacion: [],
            postulaciones: s.postulaciones.filter((p) => p.conductorId !== ID_USUARIO),
            pendientes: s.pendientes.filter((t) => !TAREAS_DEL_USUARIO.has(t.tipo)),
          });
        },

        // ------------------------------------------------------------------ Ingreso
        guardarCelular: (celular) => set((s) => ({ cuenta: { ...s.cuenta, celular } })),

        verificarCelular: () =>
          set((s) => ({ cuenta: { ...s.cuenta, celularVerificado: true, creadaEl: s.cuenta.creadaEl ?? ahoraISO() } })),

        aceptarAutorizaciones: (a) =>
          set((s) => ({
            cuenta: { ...s.cuenta, autorizaciones: { ...s.cuenta.autorizaciones, ...a }, autorizacionesEl: ahoraISO() },
          })),

        actualizarCuenta: (parcial) => set((s) => ({ cuenta: { ...s.cuenta, ...parcial } })),

        // ------------------------------------------------------------------ Registro
        guardarPaso1: (d) => {
          const s = get();
          const cuenta = {
            ...s.cuenta,
            nombres: d.nombres.trim(),
            apellido1: d.apellido1.trim(),
            apellido2: d.apellido2.trim(),
            correo: d.correo.trim(),
          };
          const conductor = {
            ...s.conductor,
            fechaNacimiento: d.fechaNacimiento.trim(),
            clasesDeclaradas: d.clasesDeclaradas,
            disponible: d.disponible,
            disponibilidadConfirmadaEn: s.conductor.disponibilidadConfirmadaEn ?? ahoraISO(),
            registrado: true,
            registradoEl: s.conductor.registradoEl ?? ahoraISO(),
            pasosListos: { ...s.conductor.pasosListos, datos: true },
            pasoActual: Math.max(s.conductor.pasoActual, 2),
          };
          set({ cuenta, ...recalcularUsuario({ ...s, cuenta, conductor }) });
        },

        guardarPaso2: (d) => {
          const s = get();
          const conductor = {
            ...s.conductor,
            direccion: d.direccion.trim(),
            depto: d.depto.trim(),
            comunaId: d.comunaId,
            tieneEstacionamiento: d.tieneEstacionamiento,
            pasosListos: { ...s.conductor.pasosListos, direccion: true },
            pasoActual: Math.max(s.conductor.pasoActual, 3),
          };
          set(recalcularUsuario({ ...s, conductor }));
        },

        guardarPaso3: (d) => {
          const s = get();
          const experiencia = Object.fromEntries(Object.entries(d.experiencia).filter(([, v]) => v > 0));
          const conductor = {
            ...s.conductor,
            experiencia,
            idiomas: d.idiomas,
            pasosListos: { ...s.conductor.pasosListos, experiencia: true },
            pasoActual: Math.max(s.conductor.pasoActual, 4),
          };
          set(recalcularUsuario({ ...s, conductor }));
        },

        guardarPaso4: (d) => {
          const s = get();
          const conductor = {
            ...s.conductor,
            negocios: d.negocios,
            turnos: d.turnos,
            dias: d.dias,
            pasosListos: { ...s.conductor.pasosListos, trabajo: true },
            pasoActual: Math.max(s.conductor.pasoActual, 5),
          };
          set(recalcularUsuario({ ...s, conductor }));
        },

        irAPaso: (paso) => set((s) => ({ conductor: { ...s.conductor, pasoActual: Math.min(5, Math.max(1, paso)) } })),

        actualizarConductor: (parcial) => {
          const s = get();
          set(recalcularUsuario({ ...s, conductor: { ...s.conductor, ...parcial } }));
        },

        // ------------------------------------------------------------------ Documentos
        subirDocumento: (tipo, nombreArchivo) => {
          const s = get();
          const ext = s.catalogos.tiposDocumento.find((t) => t.id === tipo)?.formato === 'pdf' ? 'pdf' : 'jpg';
          const doc: DocumentoUsuario = {
            ...documentoVacio(tipo),
            estado: 'subido',
            nombreArchivo: nombreArchivo ?? `${tipo.replace('_', '-')}.${ext}`,
            subidoEl: ahoraISO(),
          };
          const documentos = { ...s.documentos, [tipo]: doc };
          set({ documentos, ...recalcularUsuario({ ...s, documentos }) });
        },

        quitarDocumento: (tipo) => {
          const s = get();
          const documentos = { ...s.documentos, [tipo]: documentoVacio(tipo) };
          set({ documentos, ...recalcularUsuario({ ...s, documentos }) });
        },

        enviarDocumentosARevision: (tipos) => {
          const s = get();
          const lista = (tipos ?? TIPOS_DOC_ORDEN).filter((t) => s.documentos[t].estado === 'subido');
          if (lista.length === 0) return;
          const ahora = Date.now();
          const documentos = { ...s.documentos };
          const tareas: TareaSimulada[] = [];
          lista.forEach((t, i) => {
            documentos[t] = { ...documentos[t], estado: 'en_revision', etapa: 'ia', enviadoEl: new Date(ahora).toISOString() };
            tareas.push({
              id: nuevoId('t'),
              tipo: 'prerevision',
              venceEn: ahora + s.ajustes.segundosPrerevision * 1000 + i * 600,
              documento: t,
            });
          });
          set({ documentos, pendientes: [...s.pendientes, ...tareas], ...recalcularUsuario({ ...s, documentos }) });
        },

        pedirOtraRevision: (tipo) => {
          const s = get();
          const d = s.documentos[tipo];
          const documentos = {
            ...s.documentos,
            [tipo]: { ...d, estado: 'en_revision' as const, etapa: 'equipo' as const, otraRevisionEl: ahoraISO() },
          };
          set({ documentos, ...recalcularUsuario({ ...s, documentos }) });
        },

        aprobarPendientesDemo: () => {
          for (const t of TIPOS_DOC_ORDEN) {
            if (get().documentos[t].estado === 'en_revision') get().aprobarPorEquipo(t);
          }
        },

        aprobarPorAgenteIA: (tipo) => cambiarDocumentoDe(ID_USUARIO, tipo, (d) => docAprobado(d, 'ia'), extraAlAprobar(tipo)),

        aprobarPorEquipo: (tipo) => cambiarDocumentoDe(ID_USUARIO, tipo, (d) => docAprobado(d, 'persona'), extraAlAprobar(tipo)),

        // ------------------------------------------------------------------ Disponibilidad y cuenta
        cambiarDisponible: (disponible) =>
          set((s) => ({
            conductor: {
              ...s.conductor,
              disponible,
              disponibilidadConfirmadaEn: disponible ? ahoraISO() : s.conductor.disponibilidadConfirmadaEn,
            },
          })),

        confirmarDisponibilidad: () =>
          set((s) => ({ conductor: { ...s.conductor, disponible: true, disponibilidadConfirmadaEn: ahoraISO() } })),

        eliminarCuenta: () => {
          borrarTodosLosBorradores();
          set((s) => ({
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
            postulaciones: s.postulaciones.filter((p) => p.conductorId !== ID_USUARIO),
            pendientes: [],
          }));
        },

        // ------------------------------------------------------------------ Matches y mensajes
        alternarFavorito: (busquedaId) =>
          set((s) => ({
            favoritos: s.favoritos.includes(busquedaId)
              ? s.favoritos.filter((x) => x !== busquedaId)
              : [...s.favoritos, busquedaId],
          })),

        enviarMensaje: (busquedaId, texto) => {
          const limpio = texto.trim();
          if (!limpio) return;
          const s = get();
          const b = busquedaPorId(s, busquedaId);
          if (!b || s.bloqueos.includes(b.titularId)) return;
          const nuevo: Mensaje = { id: nuevoId('m'), autor: 'conductor', texto: limpio, hora: ahoraISO(), leido: true };
          const yaProgramada = s.pendientes.some((t) => t.tipo === 'respuesta_titular' && t.busquedaId === busquedaId);
          set({
            mensajes: { ...s.mensajes, [busquedaId]: [...(s.mensajes[busquedaId] ?? []), nuevo] },
            pendientes: yaProgramada
              ? s.pendientes
              : [
                  ...s.pendientes,
                  { id: nuevoId('t'), tipo: 'respuesta_titular', venceEn: Date.now() + 2000 + Math.round(Math.random() * 2000), busquedaId },
                ],
          });
        },

        marcarConversacionLeida: (busquedaId) => {
          const s = get();
          const lista = s.mensajes[busquedaId];
          if (!lista || lista.every((m) => m.leido)) return;
          set({ mensajes: { ...s.mensajes, [busquedaId]: lista.map((m) => (m.leido ? m : { ...m, leido: true })) } });
        },

        compartirMiDireccion: (busquedaId) => {
          const s = get();
          if (s.direccionCompartida[busquedaId]) return;
          const b = busquedaPorId(s, busquedaId);
          const t = b ? titularPorId(s, b.titularId) : undefined;
          const entrega = nuevaEntrega(s, busquedaId, ['direccion'], 'conversacion');
          set({
            direccionCompartida: { ...s.direccionCompartida, [busquedaId]: ahoraISO() },
            mensajes: {
              ...s.mensajes,
              [busquedaId]: [...(s.mensajes[busquedaId] ?? []), mensajeSistema(`Compartiste tu dirección con ${nombreTitular(t)}.`)],
            },
            entregasDatos: entrega ? [...s.entregasDatos, entrega] : s.entregasDatos,
          });
        },

        reportarConversacion: ({ busquedaId, motivo, detalle }) => {
          const s = get();
          const b = busquedaPorId(s, busquedaId);
          const t = b ? titularPorId(s, b.titularId) : undefined;
          if (!b || !t) return;
          set({
            reportes: [
              ...s.reportes,
              {
                id: nuevoId('r'),
                busquedaId,
                quienReporta: { id: ID_USUARIO, nombre: nombreCompleto(s.cuenta) || 'Conductor de la demo', rol: 'conductor' },
                reportado: { id: t.id, nombre: nombreTitular(t), rol: 'titular' },
                motivo,
                detalle: detalle?.trim() ?? '',
                estado: 'abierto',
                queSeHizo: null,
                reportadoEl: ahoraISO(),
                resueltoEl: null,
                conversacion: (s.mensajes[busquedaId] ?? []).map((m) => ({ ...m })),
              },
            ],
          });
        },

        bloquearTitular: (titularId) =>
          set((s) => ({ bloqueos: s.bloqueos.includes(titularId) ? s.bloqueos : [...s.bloqueos, titularId] })),

        desbloquearTitular: (titularId) => set((s) => ({ bloqueos: s.bloqueos.filter((x) => x !== titularId) })),

        // ------------------------------------------------------------------ Bolsa: conductor
        postular: (busquedaId) => {
          const s = get();
          if (s.postulaciones.some((p) => p.busquedaId === busquedaId && p.conductorId === ID_USUARIO)) {
            return { ok: false, error: 'Ya postulaste a esta oferta.' };
          }
          const b = busquedaPorId(s, busquedaId);
          if (!b) return { ok: false, error: 'La oferta ya no está disponible.' };
          const ahora = Date.now();
          const id = nuevoId('p');
          const tareas: TareaSimulada[] = [];
          const delUsuario = s.postulaciones.filter((p) => p.conductorId === ID_USUARIO).length;
          if (b.titularId !== s.titularDemo.titularId) {
            tareas.push({ id: nuevoId('t'), tipo: 'postulacion_vista', venceEn: ahora + 6000, postulacionId: id });
            // Una de cada dos postulaciones recibe respuesta del titular (para ver los distintos estados).
            if (delUsuario % 2 === 0) {
              tareas.push({ id: nuevoId('t'), tipo: 'postulacion_respuesta', venceEn: ahora + 14000, postulacionId: id });
            }
          }
          set({
            postulaciones: [
              ...s.postulaciones,
              {
                id,
                busquedaId,
                conductorId: ID_USUARIO,
                estado: 'enviada',
                postuloEl: new Date(ahora).toISOString(),
                vistaEl: null,
                cambioEl: new Date(ahora).toISOString(),
              },
            ],
            pendientes: [...s.pendientes, ...tareas],
          });
          return { ok: true };
        },

        // ------------------------------------------------------------------ Bolsa: titular
        cambiarPlanTitular: (plan) => {
          const s = get();
          const titularId = s.titularDemo.titularId;
          const nuevo = plan === 'sin_plan' ? null : (s.catalogos.planes.find((p) => p.id === plan) ?? null);
          const cambios: string[] = [];
          let busquedas = s.busquedas;
          const delTitular = () => busquedas.filter((b) => b.titularId === titularId);
          const cambiar = (ids: Set<string>, cambio: Partial<(typeof busquedas)[number]>) => {
            busquedas = busquedas.map((b) => (ids.has(b.id) ? { ...b, ...cambio } : b));
          };
          const ahora = Date.now();

          // 1. Destacar ofertas: solo en planes con destacadas (Flota).
          if (!nuevo || nuevo.destacadasMes <= 0) {
            const destacadas = new Set(
              delTitular()
                .filter((b) => b.destacadaHasta && new Date(b.destacadaHasta).getTime() > ahora)
                .map((b) => b.id),
            );
            if (destacadas.size > 0) {
              cambiar(destacadas, { destacadaHasta: null });
              cambios.push(destacadas.size === 1 ? 'la oferta dejó de estar destacada' : `${destacadas.size} ofertas dejaron de estar destacadas`);
            }
          }

          if (nuevo) {
            // 2. Búsquedas activas: se pausan las más antiguas que pasan del límite.
            const activas = delTitular()
              .filter((b) => b.estado === 'activa')
              .sort((a, b) => a.publicadaEl.localeCompare(b.publicadaEl));
            const sobranActivas = activas.length - nuevo.busquedasActivas;
            if (sobranActivas > 0) {
              cambiar(new Set(activas.slice(0, sobranActivas).map((b) => b.id)), { estado: 'pausada' });
              cambios.push(`${sobranActivas === 1 ? '1 búsqueda quedó' : `${sobranActivas} búsquedas quedaron`} en pausa`);
            }

            // 3. Ofertas en la bolsa: sobran primero las pausadas y después las más antiguas.
            const enBolsa = delTitular()
              .filter((b) => b.enBolsa)
              .sort(
                (a, b) =>
                  Number(a.estado === 'activa') - Number(b.estado === 'activa') ||
                  (a.publicadaBolsaEl ?? a.publicadaEl).localeCompare(b.publicadaBolsaEl ?? b.publicadaEl),
              );
            const sobranBolsa = enBolsa.length - nuevo.ofertasBolsa;
            if (sobranBolsa > 0) {
              cambiar(new Set(enBolsa.slice(0, sobranBolsa).map((b) => b.id)), { enBolsa: false, publicadaBolsaEl: null, destacadaHasta: null });
              cambios.push(`${sobranBolsa === 1 ? '1 oferta salió' : `${sobranBolsa} ofertas salieron`} de la bolsa`);
            }

            // 4. Visibilidad de las que quedan en la bolsa: la más alta que permite el plan.
            const ORDEN: VisibilidadBolsa[] = ['match', 'perfiles', 'todos'];
            const maxima = [...ORDEN].reverse().find((v) => nuevo.visibilidades.includes(v)) ?? 'match';
            const bajan = new Set(delTitular().filter((b) => b.enBolsa && !nuevo.visibilidades.includes(b.visibilidadBolsa)).map((b) => b.id));
            if (bajan.size > 0) {
              cambiar(bajan, { visibilidadBolsa: maxima });
              const texto = maxima === 'match' ? 'solo match' : maxima === 'perfiles' ? 'conductores que elijas' : 'todos';
              cambios.push(`${bajan.size === 1 ? '1 oferta' : `${bajan.size} ofertas`} ahora se ve${bajan.size === 1 ? '' : 'n'} con «${texto}»`);
            }
          }

          set({ titularDemo: { ...s.titularDemo, plan }, busquedas });
          return cambios;
        },

        publicarEnBolsa: (busquedaId, { visibilidad, perfiles }) => {
          const s = get();
          const plan = planDeLaDemo(s);
          if (!plan) return { ok: false, error: 'Elige un plan para publicar en la bolsa.' };
          if (!plan.visibilidades.includes(visibilidad)) {
            return { ok: false, error: `Tu plan ${plan.nombre} no incluye esa visibilidad.` };
          }
          const b = busquedaPorId(s, busquedaId);
          if (!b) return { ok: false, error: 'No encontramos la búsqueda.' };
          const publicadas = s.busquedas.filter((x) => x.titularId === b.titularId && x.enBolsa && x.id !== busquedaId).length;
          if (publicadas >= plan.ofertasBolsa) {
            return { ok: false, error: `Tu plan permite ${plan.ofertasBolsa} ${plan.ofertasBolsa === 1 ? 'oferta' : 'ofertas'} en la bolsa.` };
          }
          set({
            busquedas: s.busquedas.map((x) =>
              x.id === busquedaId
                ? {
                    ...x,
                    enBolsa: true,
                    visibilidadBolsa: visibilidad,
                    perfilesBolsa: visibilidad === 'perfiles' ? (perfiles ?? x.perfilesBolsa) : x.perfilesBolsa,
                    publicadaBolsaEl: x.publicadaBolsaEl ?? ahoraISO(),
                  }
                : x,
            ),
          });
          return { ok: true };
        },

        quitarDeBolsa: (busquedaId) =>
          set((s) => ({
            busquedas: s.busquedas.map((x) =>
              x.id === busquedaId ? { ...x, enBolsa: false, publicadaBolsaEl: null, destacadaHasta: null } : x,
            ),
          })),

        destacarOferta: (busquedaId) => {
          const s = get();
          const plan = planDeLaDemo(s);
          if (!plan || plan.destacadasMes <= 0) return { ok: false, error: 'Destacar ofertas está en el plan Flota.' };
          if (s.titularDemo.destacadasUsadas >= plan.destacadasMes) {
            return { ok: false, error: `Ya usaste tus ${plan.destacadasMes} destacadas de este mes.` };
          }
          set({
            busquedas: s.busquedas.map((x) =>
              x.id === busquedaId ? { ...x, destacadaHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : x,
            ),
            titularDemo: { ...s.titularDemo, destacadasUsadas: s.titularDemo.destacadasUsadas + 1 },
          });
          return { ok: true };
        },

        quitarDestacado: (busquedaId) =>
          set((s) => ({ busquedas: s.busquedas.map((x) => (x.id === busquedaId ? { ...x, destacadaHasta: null } : x)) })),

        cambiarEstadoBusqueda: (busquedaId, estado) => {
          const s = get();
          const b = busquedaPorId(s, busquedaId);
          if (!b) return { ok: false, error: 'No encontramos la búsqueda.' };
          if (estado === 'activa' && b.estado !== 'activa' && b.titularId === s.titularDemo.titularId) {
            const plan = planDeLaDemo(s);
            const limite = plan?.busquedasActivas ?? 0;
            const activas = s.busquedas.filter((x) => x.titularId === b.titularId && x.estado === 'activa').length;
            if (activas >= limite) {
              return { ok: false, error: plan ? `Tu plan permite ${limite} búsquedas activas.` : 'Elige un plan para activar búsquedas.' };
            }
          }
          set({ busquedas: s.busquedas.map((x) => (x.id === busquedaId ? { ...x, estado } : x)) });
          return { ok: true };
        },

        verPostulacion: (postulacionId) => {
          const s = get();
          const p = s.postulaciones.find((x) => x.id === postulacionId);
          if (!p || p.estado !== 'enviada') return;
          const entrega = p.conductorId === ID_USUARIO ? nuevaEntrega(s, p.busquedaId, ['ficha', 'telefono', 'correo'], 'postulacion') : null;
          set({
            postulaciones: s.postulaciones.map((x) =>
              x.id === postulacionId ? { ...x, estado: 'vista', vistaEl: ahoraISO(), cambioEl: ahoraISO() } : x,
            ),
            entregasDatos: entrega ? [...s.entregasDatos, entrega] : s.entregasDatos,
          });
        },

        escribirAPostulante: (postulacionId, texto) => {
          const s = get();
          const p = s.postulaciones.find((x) => x.id === postulacionId);
          if (!p) return { ok: false, error: 'No encontramos la postulación.' };
          const b = busquedaPorId(s, p.busquedaId);
          if (b && titularPorId(s, b.titularId)?.suspendido) return { ok: false, error: TEXTO_CUENTA_SUSPENDIDA };
          const cambios: Partial<DatosDemo> = {
            postulaciones: s.postulaciones.map((x) =>
              x.id === postulacionId
                ? { ...x, estado: 'te_escribio', vistaEl: x.vistaEl ?? ahoraISO(), cambioEl: ahoraISO() }
                : x,
            ),
          };
          if (p.conductorId === ID_USUARIO) {
            const nuevo: Mensaje = { id: nuevoId('m'), autor: 'titular', texto: texto.trim(), hora: ahoraISO(), leido: false };
            cambios.mensajes = { ...s.mensajes, [p.busquedaId]: [...(s.mensajes[p.busquedaId] ?? []), nuevo] };
            cambios.matchesPorPostulacion = s.matchesPorPostulacion.includes(p.busquedaId)
              ? s.matchesPorPostulacion
              : [...s.matchesPorPostulacion, p.busquedaId];
          }
          set(cambios);
          return { ok: true };
        },

        descartarPostulacion: (postulacionId) =>
          set((s) => ({
            postulaciones: s.postulaciones.map((x) =>
              x.id === postulacionId ? { ...x, estado: 'descartada', cambioEl: ahoraISO() } : x,
            ),
          })),

        alternarFavoritoTitular: (conductorId) =>
          set((s) => ({
            favoritosTitular: s.favoritosTitular.includes(conductorId)
              ? s.favoritosTitular.filter((x) => x !== conductorId)
              : [...s.favoritosTitular, conductorId],
          })),
      };
    },
    {
      name: CLAVE_ALMACENAMIENTO,
      version: VERSION_ESTADO,
      // Lee una sola vez lo guardado por la versión anterior y no pisa lo de una versión más nueva.
      storage: crearAlmacenDemo<DatosDemo>(AsyncStorage, {
        claveAnterior: CLAVE_ALMACENAMIENTO_ANTERIOR,
        version: VERSION_ESTADO,
        alQuedarVieja: () =>
          avisar('Hay una versión nueva de la demo. Recarga la página para seguir.', 'info', 12000),
      }),
      // Solo se guardan los datos (las acciones no se serializan).
      partialize: (s) => {
        const datos: Partial<EstadoDemo> = {};
        for (const [k, v] of Object.entries(s)) if (typeof v !== 'function') (datos as Record<string, unknown>)[k] = v;
        return datos as DatosDemo;
      },
      // Si cambió la versión del estado: ver migrarEstado (src/datos/estado.ts).
      migrate: (guardado, version) => migrarEstado(guardado, version) as unknown as EstadoDemo,
    },
  ),
);

/** ¿Ya se leyó lo guardado en el navegador? (el layout raíz espera esto antes de mostrar pantallas). */
export function demoHidratada(): boolean {
  return useDemo.persist.hasHydrated();
}

// Para las capturas automáticas y la depuración: en el navegador, window.__daleDemo es la tienda
// (ej. window.__daleDemo.getState().prepararConductorVerificado()).
if (typeof window !== 'undefined') {
  (window as unknown as { __daleDemo: typeof useDemo }).__daleDemo = useDemo;
  // Varias pestañas con la demo (ej. el conductor en una y el titular en otra): cuando otra pestaña guarda,
  // esta vuelve a leer lo guardado. Así todas muestran lo mismo y ninguna pisa los cambios de otra.
  // (En la web, AsyncStorage usa localStorage, que avisa a las demás pestañas con el evento "storage".)
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === CLAVE_ALMACENAMIENTO || e.key === null) void useDemo.persist.rehydrate();
    });
  }
}

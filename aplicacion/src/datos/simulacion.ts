// Simulación de lo que en la app real hacen otras personas o el servidor:
// (a) pre-revisión del "agente de IA": a los ~3 s la cédula y la licencia se aprueban solas
//     (caso claro; la licencia copia las clases declaradas a revisadas) y la Hoja de Vida y los
//     antecedentes quedan "En revisión", esperando a una persona del equipo.
// (a2) revisión de esa persona del equipo: el mockup no tiene panel de administración, así que
//     también se simula. A los ~12 s de quedar esperando (SEGUNDOS_REVISION_EQUIPO), el documento se
//     aprueba, con el mismo aviso de siempre. Pasa igual después de "pedir otra revisión". Para ver
//     un documento no aprobado está el atajo del menú de la demo (prepararDocumentoNoAprobado).
// (b) respuestas del titular en el chat: a los 2–4 s responde con frases de ejemplo; después del
//     segundo mensaje del conductor, el titular comparte su contacto (teléfono ficticio).
// (c) titulares con plan que abren la ficha del conductor recién verificado ("Quién recibió mis datos").
// (d) postulaciones de la bolsa: el titular la ve a los ~6 s y, a veces, escribe a los ~14 s.
//
// Las tareas se guardan en el estado (state.pendientes) con su hora de vencimiento, y un reloj
// (iniciarSimulacion, montado en el layout raíz) las ejecuta. Así sobreviven a cambiar de pantalla
// y a recargar la página.
import { avisar } from './avisos';
import { CLAVE_ALMACENAMIENTO, VERSION_ESTADO } from './estado';
import { ID_USUARIO, TIPOS_DOC_ORDEN, busquedaPorId, nombreTitular, primerNombre, titularPorId } from './selectores';
import { SEGUNDOS_REVISION_EQUIPO, ahoraISO, nuevoId, useDemo } from './tienda';
import type { DocumentoUsuario, EntregaDatos, Mensaje, TareaSimulada } from './tipos';

const RESPUESTAS_INICIALES = [
  'Hola {nombre}, gracias por escribir. ¿Desde cuándo podrías partir?',
  'Hola {nombre}. Sí, el vehículo sigue disponible. ¿Qué días te acomodan?',
  'Hola {nombre}, gusto en saludarte. ¿Tienes experiencia en {negocio}?',
];

const RESPUESTAS_SEGUNDAS = [
  'Perfecto. Te comparto mi contacto para coordinar una visita y que veas el auto.',
  'Me parece bien. Te dejo mi contacto para conversar por teléfono.',
];

const RESPUESTAS_SIGUIENTES = [
  'Dale, quedamos atentos. Cualquier duda me escribes.',
  'Buenísimo, nos vemos entonces.',
  'Gracias, lo reviso y te confirmo.',
];

const elegir = (lista: string[], semilla: number) => lista[Math.abs(semilla) % lista.length];

function procesarTarea(t: TareaSimulada): void {
  const demo = useDemo.getState();
  switch (t.tipo) {
    case 'prerevision': {
      const doc = demo.documentos[t.documento];
      if (doc.estado !== 'en_revision' || doc.etapa !== 'ia') return;
      const tipo = demo.catalogos.tiposDocumento.find((x) => x.id === t.documento);
      if (tipo?.prerevisionAutomatica) {
        // Caso claro: lo aprueba el agente de IA (la licencia copia las clases declaradas a revisadas).
        demo.aprobarPorAgenteIA(t.documento);
        avisar(t.documento === 'cedula' ? 'Tu cédula fue aprobada.' : 'Tu licencia fue aprobada.', 'exito');
      } else {
        // Pre-revisado: pasa a una persona del equipo (la programa asegurarRevisionDelEquipo).
        useDemo.setState({ documentos: { ...demo.documentos, [t.documento]: { ...doc, etapa: 'equipo' } } });
      }
      return;
    }

    case 'revision_equipo': {
      const doc = demo.documentos[t.documento];
      // Si mientras tanto cambió (lo aprobó "Aprobar ahora", lo subió de nuevo, un atajo…), no se toca.
      if (doc.estado !== 'en_revision' || doc.etapa !== 'equipo' || rondaDe(doc) !== t.ronda) return;
      demo.aprobarPorEquipo(t.documento);
      return;
    }

    case 'respuesta_titular': {
      const lista = demo.mensajes[t.busquedaId] ?? [];
      const b = busquedaPorId(demo, t.busquedaId);
      const titular = b ? titularPorId(demo, b.titularId) : undefined;
      if (!b || !titular || demo.bloqueos.includes(titular.id)) {
        useDemo.setState({ titularEscribiendo: { ...demo.titularEscribiendo, [t.busquedaId]: false } });
        return;
      }
      const delConductor = lista.filter((m) => m.autor === 'conductor').length;
      const delTitular = lista.filter((m) => m.autor === 'titular').length;
      const negocio = demo.catalogos.negocios.find((n) => n.id === b.negocioId)?.nombre.toLowerCase() ?? 'esto';
      const semilla = Number(t.busquedaId.replace(/\D/g, '')) || 0;
      let texto: string;
      if (delTitular === 0) texto = elegir(RESPUESTAS_INICIALES, semilla);
      else if (delConductor >= 2 && !demo.contactoCompartido[t.busquedaId]) texto = elegir(RESPUESTAS_SEGUNDAS, semilla);
      else texto = elegir(RESPUESTAS_SIGUIENTES, semilla + delTitular);
      texto = texto.replace('{nombre}', primerNombre(demo)).replace('{negocio}', negocio);

      const nuevos: Mensaje[] = [{ id: nuevoId('m'), autor: 'titular', texto, hora: ahoraISO(), leido: false }];
      const contactoCompartido = { ...demo.contactoCompartido };
      if (delConductor >= 2 && !contactoCompartido[t.busquedaId]) {
        contactoCompartido[t.busquedaId] = ahoraISO();
        nuevos.push({
          id: nuevoId('m'),
          autor: 'sistema',
          texto: `${nombreTitular(titular)} compartió su contacto contigo.`,
          hora: ahoraISO(),
          leido: false,
        });
      }
      useDemo.setState({
        mensajes: { ...demo.mensajes, [t.busquedaId]: [...lista, ...nuevos] },
        contactoCompartido,
        titularEscribiendo: { ...demo.titularEscribiendo, [t.busquedaId]: false },
      });
      return;
    }

    case 'abre_ficha': {
      if (demo.fichasAbiertas.includes(t.busquedaId)) return;
      const b = busquedaPorId(demo, t.busquedaId);
      const titular = b ? titularPorId(demo, b.titularId) : undefined;
      if (!b || !titular) return;
      const entrega: EntregaDatos = {
        id: nuevoId('ed'),
        busquedaId: b.id,
        titularId: titular.id,
        nombreTitular: nombreTitular(titular),
        negocioId: b.negocioId,
        que: ['ficha', 'telefono', 'correo'],
        desde: 'apertura_ficha',
        fecha: ahoraISO(),
      };
      useDemo.setState({ entregasDatos: [...demo.entregasDatos, entrega], fichasAbiertas: [...demo.fichasAbiertas, b.id] });
      return;
    }

    case 'postulacion_vista': {
      const p = demo.postulaciones.find((x) => x.id === t.postulacionId);
      if (!p || p.estado !== 'enviada') return;
      demo.verPostulacion(p.id);
      return;
    }

    case 'postulacion_respuesta': {
      const p = demo.postulaciones.find((x) => x.id === t.postulacionId);
      if (!p || p.conductorId !== ID_USUARIO || p.estado === 'te_escribio' || p.estado === 'descartada') return;
      const b = busquedaPorId(demo, p.busquedaId);
      const titular = b ? titularPorId(demo, b.titularId) : undefined;
      if (!b || !titular || demo.bloqueos.includes(titular.id)) return;
      demo.escribirAPostulante(
        p.id,
        `Hola ${primerNombre(demo)}, vimos tu postulación. ¿Podemos conversar sobre la oferta?`,
      );
      avisar(`${nombreTitular(titular)} te escribió.`, 'info');
      return;
    }
  }
}

/** Qué envío del documento se está revisando (cambia al subirlo de nuevo o al pedir otra revisión). */
function rondaDe(doc: DocumentoUsuario): string {
  return `${doc.enviadoEl ?? ''}|${doc.otraRevisionEl ?? ''}`;
}

/**
 * Cada documento del usuario que espera a una persona del equipo tiene programada su revisión
 * (a los SEGUNDOS_REVISION_EQUIPO). Sirve para los que acaban de salir de la pre-revisión, para
 * "pedir otra revisión" y para lo guardado de antes, cuando los revisaba el panel.
 */
function asegurarRevisionDelEquipo(ahora: number): void {
  const { documentos, pendientes } = useDemo.getState();
  const nuevas: TareaSimulada[] = [];
  for (const tipo of TIPOS_DOC_ORDEN) {
    const doc = documentos[tipo];
    if (doc.estado !== 'en_revision' || doc.etapa !== 'equipo') continue;
    const ronda = rondaDe(doc);
    const yaProgramada = pendientes.some((t) => t.tipo === 'revision_equipo' && t.documento === tipo && t.ronda === ronda);
    if (!yaProgramada) {
      // Si hay dos esperando, la segunda llega un poco después (como en la pre-revisión).
      const venceEn = ahora + SEGUNDOS_REVISION_EQUIPO * 1000 + nuevas.length * 600;
      nuevas.push({ id: nuevoId('t'), tipo: 'revision_equipo', venceEn, documento: tipo, ronda });
    }
  }
  if (nuevas.length > 0) useDemo.setState({ pendientes: [...pendientes, ...nuevas] });
}

/** Ejecuta las tareas vencidas. Devuelve cuántas ejecutó. */
export function procesarPendientes(ahora = Date.now()): number {
  asegurarRevisionDelEquipo(ahora);
  const { pendientes } = useDemo.getState();
  const vencidas = pendientes.filter((t) => t.venceEn <= ahora);
  if (vencidas.length === 0) {
    // Marca "escribiendo…" mientras haya una respuesta programada.
    const escribiendo: Record<string, boolean> = {};
    for (const t of pendientes) if (t.tipo === 'respuesta_titular' && t.venceEn - ahora < 2500) escribiendo[t.busquedaId] = true;
    const actual = useDemo.getState().titularEscribiendo;
    const cambia = Object.keys(escribiendo).some((k) => !actual[k]);
    if (cambia) useDemo.setState({ titularEscribiendo: { ...actual, ...escribiendo } });
    return 0;
  }
  // Primero se sacan de la lista, para no ejecutarlas dos veces.
  const ids = new Set(vencidas.map((t) => t.id));
  useDemo.setState({ pendientes: pendientes.filter((t) => !ids.has(t.id)) });
  for (const t of vencidas.sort((a, b) => a.venceEn - b.venceEn)) {
    try {
      procesarTarea(t);
    } catch (e) {
      console.warn('Simulación: no se pudo procesar', t, e);
    }
  }
  // Lo que la pre-revisión acaba de dejar esperando al equipo queda programado ya, no en la vuelta siguiente.
  asegurarRevisionDelEquipo(ahora);
  return vencidas.length;
}

let reloj: ReturnType<typeof setInterval> | null = null;

// Con la demo abierta en varias pestañas, solo una ejecuta las tareas (la que las tome primero y
// esté a la vista); las demás reciben el resultado por el evento "storage" (ver tienda.ts).
// El turno es por clave de datos y por versión del estado: una pestaña con otra versión de la demo
// (por ejemplo, la publicada antes, que usaba 'dale-demo-lider') no le quita el turno a esta.
const CLAVE_LIDER = `${CLAVE_ALMACENAMIENTO}-lider-v${VERSION_ESTADO}`;
const ID_PESTANA = Math.random().toString(36).slice(2);

function soyLaPestanaQueSimula(ahora: number): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return true;
  try {
    const crudo = window.localStorage.getItem(CLAVE_LIDER);
    const lider = crudo ? (JSON.parse(crudo) as { id: string; hasta: number }) : null;
    const mia = lider?.id === ID_PESTANA;
    const vigente = !!lider && lider.hasta >= ahora;
    if (vigente && !mia) return false;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      // Una pestaña oculta termina su turno sin renovarlo y espera un poco antes de tomar otro,
      // para que lo tome una pestaña a la vista si la hay.
      if (mia && vigente) return true;
      if (lider && ahora - lider.hasta < 1500) return false;
    }
    window.localStorage.setItem(CLAVE_LIDER, JSON.stringify({ id: ID_PESTANA, hasta: ahora + 2500 }));
    return true;
  } catch {
    return true;
  }
}

/** Enciende el reloj de la simulación (idempotente). Devuelve una función para apagarlo. */
export function iniciarSimulacion(intervaloMs = 500): () => void {
  if (!reloj)
    reloj = setInterval(() => {
      if (soyLaPestanaQueSimula(Date.now())) procesarPendientes();
    }, intervaloMs);
  return () => {
    if (reloj) clearInterval(reloj);
    reloj = null;
  };
}

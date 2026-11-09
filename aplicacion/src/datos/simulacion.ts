// Simulación de lo que en la app real hacen otras personas o el servidor:
// (a) pre-revisión del "agente de IA": a los ~3 s la cédula y la licencia se aprueban solas
//     (caso claro; la licencia copia las clases declaradas a revisadas) y la Hoja de Vida y los
//     antecedentes quedan "En revisión", esperando a una persona del equipo.
// (a2) revisión de esa persona del equipo: también se simula. A los ~12 s de quedar esperando
//     (SEGUNDOS_REVISION_EQUIPO), el documento se aprueba, con el mismo aviso de siempre. Pasa igual
//     después de "pedir otra revisión". Para ver un documento no aprobado está el atajo del menú de la
//     demo (prepararDocumentoNoAprobado). Mientras una persona del equipo revisa a mano en este mismo
//     navegador (revisionManual.ts), no se simula: los documentos esperan su decisión.
// (b) respuestas del titular en el chat: a los 2–4 s responde con frases de ejemplo; después del
//     segundo mensaje del conductor, el titular comparte su contacto (teléfono ficticio).
// (c) titulares con plan que abren la ficha del conductor recién verificado ("Quién recibió mis datos").
// (d) postulaciones de la bolsa: el titular la ve a los ~6 s y, a veces, escribe a los ~14 s.
//
// Las tareas se guardan en el estado (state.pendientes) con su hora de vencimiento, y un reloj
// (iniciarSimulacion, montado en el layout raíz) las ejecuta. Así sobreviven a cambiar de pantalla
// y a recargar la página. Otra app del mismo sitio puede montar el reloj de respaldo, para que las
// tareas avancen aunque la demo del conductor no esté abierta (ver OpcionesSimulacion).
import { avisar } from './avisos';
import { CLAVE_ALMACENAMIENTO, VERSION_ESTADO } from './estado';
import { planificarRevisionEquipo, rondaDe } from './revisionEquipo';
import { leerRevisionManual } from './revisionManual';
import { ID_USUARIO, TIPOS_DOC_ORDEN, busquedaPorId, nombreTitular, primerNombre, titularPorId } from './selectores';
import { SEGUNDOS_REVISION_EQUIPO, ahoraISO, cambiarDocumento, docAprobado, extraAlAprobar, nuevoId, useDemo } from './tienda';
import type { EntregaDatos, Mensaje, TareaSimulada } from './tipos';

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

/**
 * La pestaña simula solo de respaldo (otra app del mismo sitio, ver iniciarSimulacion): ahí no se
 * muestran los avisos del conductor. Si la demo del conductor está abierta en otra pestaña, los
 * cambios le llegan igual (avisosEntrePestanas.ts).
 */
let deRespaldo = false;
const avisarConductor: typeof avisar = (...args) => {
  if (!deRespaldo) avisar(...args);
};

const AVISO_VERIFICADO = '¡Listo! Tus 4 documentos están aprobados.';

function procesarTarea(t: TareaSimulada): void {
  const demo = useDemo.getState();
  switch (t.tipo) {
    case 'prerevision': {
      const doc = demo.documentos[t.documento];
      if (doc.estado !== 'en_revision' || doc.etapa !== 'ia') return;
      const tipo = demo.catalogos.tiposDocumento.find((x) => x.id === t.documento);
      if (tipo?.prerevisionAutomatica) {
        // Caso claro: lo aprueba el agente de IA (la licencia copia las clases declaradas a revisadas).
        const r = cambiarDocumento(demo, ID_USUARIO, t.documento, (d) => docAprobado(d, 'ia'), extraAlAprobar(t.documento));
        useDemo.setState(r.cambios);
        avisarConductor(t.documento === 'cedula' ? 'Tu cédula fue aprobada.' : 'Tu licencia fue aprobada.', 'exito');
        if (r.quedoVerificado) avisarConductor(AVISO_VERIFICADO, 'exito');
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
      // Una persona del equipo lo revisa a mano en este navegador: decide ella.
      if (leerRevisionManual()) return;
      const r = cambiarDocumento(demo, ID_USUARIO, t.documento, (d) => docAprobado(d, 'persona'), extraAlAprobar(t.documento));
      useDemo.setState(r.cambios);
      if (r.quedoVerificado) avisarConductor(AVISO_VERIFICADO, 'exito');
      return;
    }

    case 'respuesta_titular': {
      const lista = demo.mensajes[t.busquedaId] ?? [];
      const b = busquedaPorId(demo, t.busquedaId);
      const titular = b ? titularPorId(demo, b.titularId) : undefined;
      // Un titular bloqueado o con la cuenta suspendida no responde.
      if (!b || !titular || demo.bloqueos.includes(titular.id) || titular.suspendido) {
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
      if (!b || !titular || demo.bloqueos.includes(titular.id) || titular.suspendido) return;
      demo.escribirAPostulante(
        p.id,
        `Hola ${primerNombre(demo)}, vimos tu postulación. ¿Podemos conversar sobre la oferta?`,
      );
      avisarConductor(`${nombreTitular(titular)} te escribió.`, 'info');
      return;
    }
  }
}

/** Programa (o quita, con revisión manual) la revisión simulada de la persona del equipo. */
function asegurarRevisionDelEquipo(ahora: number): void {
  const { documentos, pendientes } = useDemo.getState();
  const nuevas = planificarRevisionEquipo({
    documentos,
    pendientes,
    tipos: TIPOS_DOC_ORDEN,
    ahora,
    manual: leerRevisionManual(),
    segundos: SEGUNDOS_REVISION_EQUIPO,
    nuevoId: () => nuevoId('t'),
  });
  if (nuevas) useDemo.setState({ pendientes: nuevas });
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
// Una pestaña de respaldo (otra app del mismo sitio) toma el turno solo si ninguna pestaña de la demo
// del conductor lo lleva hace un rato, y se lo devuelve en cuanto aparece una.
const CLAVE_LIDER = `${CLAVE_ALMACENAMIENTO}-lider-v${VERSION_ESTADO}`;
const ID_PESTANA = Math.random().toString(36).slice(2);
/** Cuánto espera una pestaña de respaldo, desde que venció el último turno, antes de tomarlo. */
const ESPERA_RESPALDO_MS = 4000;

interface Turno {
  id: string;
  hasta: number;
  /** Lo lleva una pestaña de respaldo. */
  respaldo?: boolean;
}

function leerTurno(clave: string): Turno | null {
  const crudo = window.localStorage.getItem(clave);
  const v = crudo ? (JSON.parse(crudo) as Turno | null) : null;
  return v && typeof v.id === 'string' && typeof v.hasta === 'number' ? v : null;
}

function tomarTurno(ahora: number): void {
  const turno: Turno = deRespaldo ? { id: ID_PESTANA, hasta: ahora + 2500, respaldo: true } : { id: ID_PESTANA, hasta: ahora + 2500 };
  window.localStorage.setItem(CLAVE_LIDER, JSON.stringify(turno));
}

function soyLaPestanaQueSimula(ahora: number): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return true;
  try {
    const lider = leerTurno(CLAVE_LIDER);
    const mia = lider?.id === ID_PESTANA;
    const vigente = !!lider && lider.hasta >= ahora;
    if (deRespaldo) {
      if (vigente && !mia) return false;
      if (!mia && lider && ahora - lider.hasta < ESPERA_RESPALDO_MS) return false;
      tomarTurno(ahora);
      return true;
    }
    if (vigente && !mia) {
      if (!lider.respaldo) return false;
      // La demo del conductor tiene prioridad: toma el turno ahora y simula desde la vuelta siguiente,
      // cuando la pestaña de respaldo ya lo vio (así nunca simulan las dos a la vez).
      tomarTurno(ahora);
      return false;
    }
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      // Una pestaña oculta termina su turno sin renovarlo y espera un poco antes de tomar otro,
      // para que lo tome una pestaña a la vista si la hay.
      if (mia && vigente) return true;
      if (lider && ahora - lider.hasta < 1500) return false;
    }
    tomarTurno(ahora);
    return true;
  } catch {
    return true;
  }
}

// Una pestaña abierta con una versión anterior de la demo (desde la 3) ya no guarda (almacenamiento.ts),
// pero su simulación seguiría "aprobando" documentos en su propia pantalla. Mientras haya una pestaña con
// esta versión, se le deja tomado su turno (su clave de turno), con un plazo largo: así no simula.
const VERSION_MAS_ANTIGUA_CON_TURNO = 3;
const ID_VERSION_NUEVA = 'version-nueva';
const PLAZO_TURNO_VIEJO_MS = 120_000;

function retenerTurnosDeVersionesAnteriores(ahora: number): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  for (let v = VERSION_MAS_ANTIGUA_CON_TURNO; v < VERSION_ESTADO; v++) {
    const clave = `${CLAVE_ALMACENAMIENTO}-lider-v${v}`;
    try {
      const turno = leerTurno(clave);
      // Se renueva una vez por minuto, no en cada vuelta.
      if (turno?.id === ID_VERSION_NUEVA && turno.hasta - ahora > PLAZO_TURNO_VIEJO_MS / 2) continue;
      window.localStorage.setItem(clave, JSON.stringify({ id: ID_VERSION_NUEVA, hasta: ahora + PLAZO_TURNO_VIEJO_MS }));
    } catch {
      // Sin almacenamiento: no hay otras pestañas con las que coordinar.
    }
  }
}

export interface OpcionesSimulacion {
  intervaloMs?: number;
  /**
   * De respaldo (la usa otra app del mismo sitio): simula solo si la demo del conductor no está abierta
   * en otra pestaña, y sin mostrar los avisos del conductor.
   */
  respaldo?: boolean;
}

/** Enciende el reloj de la simulación (idempotente). Devuelve una función para apagarlo. */
export function iniciarSimulacion({ intervaloMs = 500, respaldo = false }: OpcionesSimulacion = {}): () => void {
  deRespaldo = respaldo;
  if (!reloj)
    reloj = setInterval(() => {
      const ahora = Date.now();
      retenerTurnosDeVersionesAnteriores(ahora);
      if (soyLaPestanaQueSimula(ahora)) procesarPendientes(ahora);
    }, intervaloMs);
  return () => {
    if (reloj) clearInterval(reloj);
    reloj = null;
  };
}

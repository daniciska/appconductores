// Simulación de lo que en la app real hacen otras personas o el servidor:
// (a) pre-revisión del "agente de IA": a los ~3 s la cédula y la licencia se aprueban solas
//     (caso claro; la licencia copia las clases declaradas a revisadas) y la Hoja de Vida y los
//     antecedentes quedan esperando a una persona en el panel (/admin/documentos).
// (b) respuestas del titular en el chat: a los 2–4 s responde con frases de ejemplo; después del
//     segundo mensaje del conductor, el titular comparte su contacto (teléfono ficticio).
// (c) titulares con plan que abren la ficha del conductor recién verificado ("Quién recibió mis datos").
// (d) postulaciones de la bolsa: el titular la ve a los ~6 s y, a veces, escribe a los ~14 s.
//
// Las tareas se guardan en el estado (state.pendientes) con su hora de vencimiento, y un reloj
// (iniciarSimulacion, montado en el layout raíz) las ejecuta. Así sobreviven a cambiar de pantalla
// y a recargar la página.
import { avisar } from './avisos';
import { ID_USUARIO, busquedaPorId, nombreTitular, primerNombre, titularPorId } from './selectores';
import { ahoraISO, nuevoId, useDemo } from './tienda';
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
        // Pre-revisado: pasa a la cola de una persona del equipo.
        useDemo.setState({ documentos: { ...demo.documentos, [t.documento]: { ...doc, etapa: 'equipo' } } });
      }
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

/** Ejecuta las tareas vencidas. Devuelve cuántas ejecutó. */
export function procesarPendientes(ahora = Date.now()): number {
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
  return vencidas.length;
}

let reloj: ReturnType<typeof setInterval> | null = null;

// Con la demo abierta en varias pestañas, solo una ejecuta las tareas (la que las tome primero y
// esté a la vista); las demás reciben el resultado por el evento "storage" (ver tienda.ts).
const CLAVE_LIDER = 'dale-demo-lider';
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

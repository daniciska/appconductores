// Acciones propias del grupo "bolsa" (BC1–BC3 y BT1–BT5) que no están en la tienda común.
// Escriben en la misma tienda (useDemo.setState), así que todo queda guardado en el navegador.
import { ID_USUARIO } from '@/datos/selectores';
import { ahoraISO, useDemo, type Resultado } from '@/datos/tienda';
import type { EstadoPostulacion, PerfilesBolsa } from '@/datos/tipos';

/**
 * "Retirar postulación" (BC2): borra la postulación del usuario y las respuestas simuladas que
 * tenía programadas. Solo se puede mientras el titular no le haya escrito.
 */
export function retirarPostulacion(postulacionId: string): { ok: boolean; error?: string } {
  const s = useDemo.getState();
  const p = s.postulaciones.find((x) => x.id === postulacionId);
  if (!p || p.conductorId !== ID_USUARIO) return { ok: false, error: 'No encontramos tu postulación.' };
  if (p.estado === 'te_escribio') return { ok: false, error: 'El titular ya te escribió: sigue la conversación en Mensajes.' };
  useDemo.setState({
    postulaciones: s.postulaciones.filter((x) => x.id !== postulacionId),
    pendientes: s.pendientes.filter(
      (t) => !((t.tipo === 'postulacion_vista' || t.tipo === 'postulacion_respuesta') && t.postulacionId === postulacionId),
    ),
  });
  return { ok: true };
}

/**
 * "Guardar condiciones" (BT2): guarda los perfiles que elige el titular en la búsqueda, sin cambiar
 * si está en la bolsa ni su visibilidad (eso se decide en BT1 al publicar).
 */
export function guardarPerfilesBolsa(busquedaId: string, perfiles: PerfilesBolsa) {
  useDemo.setState((s) => ({
    busquedas: s.busquedas.map((b) => (b.id === busquedaId ? { ...b, perfilesBolsa: { ...perfiles } } : b)),
  }));
}

/** "Deshacer" después de descartar un postulante (BT3): vuelve al estado que tenía. */
export function restaurarPostulacion(postulacionId: string, estado: EstadoPostulacion) {
  useDemo.setState((s) => ({
    postulaciones: s.postulaciones.map((p) => (p.id === postulacionId ? { ...p, estado, cambioEl: ahoraISO() } : p)),
  }));
}

/**
 * "Escribir" a un postulante (BT3): si aún no la abría, primero cuenta como vista (queda en
 * "Quién recibió mis datos" si es el usuario de la demo) y después le escribe. Si el postulante es
 * el usuario de la demo, se crea el match con origen "Postulación" y la conversación aparece en sus Mensajes.
 */
export function escribirAPostulanteDesdeBolsa(postulacionId: string, texto: string): Resultado {
  const s = useDemo.getState();
  const p = s.postulaciones.find((x) => x.id === postulacionId);
  if (!p) return { ok: false, error: 'No encontramos la postulación.' };
  if (p.estado === 'enviada') s.verPostulacion(postulacionId);
  return useDemo.getState().escribirAPostulante(postulacionId, texto);
}

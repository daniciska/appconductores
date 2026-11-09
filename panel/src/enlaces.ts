// Enlaces del panel. El panel es otra app del mismo sitio que la demo del conductor: se publica con
// la base '/panel' (app.json, experiments.baseUrl), así que '/documentos' aquí es /panel/documentos.
import type { Href } from 'expo-router';

export type SeccionPanel =
  | 'resumen'
  | 'documentos'
  | 'conductores'
  | 'reportes'
  | 'match'
  | 'catalogos'
  | 'zonas'
  | 'ajustes'
  | 'equipo';

/** Enlace a una sección del panel (la portada, con la elección de rol, es '/'). */
export function rutaPanel(seccion: SeccionPanel): Href {
  return `/${seccion}` as Href;
}

/** Sección activa a partir de la ruta actual (para marcarla en el menú). */
export function seccionDeRuta(ruta: string): string {
  return ruta.replace(/^\/+/, '').split('/')[0] || 'resumen';
}

/**
 * Abre la demo del conductor (raíz del sitio) en otra pestaña, siempre la misma. Comparte lo guardado
 * en el navegador con el panel, así que muestra en vivo lo que se cambia aquí. Ej.: '/conductor/inicio'.
 */
export function abrirDemoConductor(ruta = '/'): void {
  if (typeof window === 'undefined') return;
  window.open(`${window.location.origin}${ruta}`, 'dale-demo-conductor');
}

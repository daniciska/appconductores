// Enlaces entre las secciones del panel guardado (ver src/panel/README.md).
// El panel ya no tiene rutas en el mockup, así que sus enlaces no pueden ir escritos como texto con
// tipos de expo-router ('/admin/…' dejó de existir). Se arman aquí: si el panel vuelve a ser rutas
// (en el mockup o en su propia app), basta con cambiar PREFIJO_PANEL.
import type { Href } from 'expo-router';

/** Dónde vivía el panel en el mockup. En una app propia del panel sería ''. */
export const PREFIJO_PANEL = '/admin';

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

/** Enlace a una sección del panel ('resumen' es la portada). */
export function rutaPanel(seccion: SeccionPanel): Href {
  const ruta = seccion === 'resumen' ? PREFIJO_PANEL || '/' : `${PREFIJO_PANEL}/${seccion}`;
  return ruta as Href;
}

/** Sección activa a partir de la ruta actual (para marcarla en el menú). */
export function seccionDeRuta(ruta: string): string {
  const resto = ruta.startsWith(PREFIJO_PANEL) ? ruta.slice(PREFIJO_PANEL.length) : ruta;
  return resto.replace(/^\/+/, '').split('/')[0] || 'resumen';
}

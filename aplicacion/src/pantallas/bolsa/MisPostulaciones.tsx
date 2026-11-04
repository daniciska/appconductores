// BC3 · Mis postulaciones
// Ruta: /conductor/bolsa/postulaciones
// Maqueta: docs/maqueta/BolsaPostulaciones.dc.html
// La lista vive en la segunda pestaña de la Bolsa (BC1), como en la maqueta. Esta ruta (por ejemplo,
// desde un aviso) abre la Bolsa con "Mis postulaciones" ya elegido.
import { Redirect } from 'expo-router';

export default function MisPostulaciones() {
  return <Redirect href={{ pathname: '/conductor/bolsa', params: { vista: 'postulaciones' } }} />;
}

// BC3 · Mis postulaciones
// Ruta: /conductor/bolsa/postulaciones
// Maqueta: docs/maqueta/BolsaPostulaciones.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function MisPostulaciones() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="BC3" titulo="Mis postulaciones" />
    </Pantalla>
  );
}

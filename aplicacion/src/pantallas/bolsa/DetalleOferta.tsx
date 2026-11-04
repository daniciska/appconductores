// BC2 · Detalle de la oferta
// Ruta: /conductor/bolsa/[id]
// Maqueta: docs/maqueta/BolsaDetalle.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function DetalleOferta() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="BC2" titulo="Detalle de la oferta" />
    </Pantalla>
  );
}

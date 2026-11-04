// D2 · Detalle del match
// Ruta: /conductor/matches/[id]
// Maqueta: docs/maqueta/CondDetalleMatch.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function DetalleMatch() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="D2" titulo="Detalle del match" />
    </Pantalla>
  );
}

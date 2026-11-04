// BT5 · Planes con la bolsa
// Ruta: /titular/planes
// Maqueta: docs/maqueta/BolsaPlanes.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Planes() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="BT5" titulo="Planes con la bolsa" />
    </Pantalla>
  );
}

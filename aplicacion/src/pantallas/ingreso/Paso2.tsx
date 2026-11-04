// B2 · Paso 2: dónde vives
// Ruta: /conductor/registro/2
// Maqueta: docs/maqueta/CondPaso2.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Paso2() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="B2" titulo="Paso 2: dónde vives" />
    </Pantalla>
  );
}

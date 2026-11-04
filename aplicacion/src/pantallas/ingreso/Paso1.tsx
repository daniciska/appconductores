// B1 · Paso 1: tus datos
// Ruta: /conductor/registro/1
// Maqueta: docs/maqueta/CondPaso1.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Paso1() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="B1" titulo="Paso 1: tus datos" />
    </Pantalla>
  );
}

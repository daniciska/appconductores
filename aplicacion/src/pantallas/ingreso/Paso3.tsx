// B3 · Paso 3: experiencia
// Ruta: /conductor/registro/3
// Maqueta: docs/maqueta/CondPaso3.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Paso3() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="B3" titulo="Paso 3: experiencia" />
    </Pantalla>
  );
}

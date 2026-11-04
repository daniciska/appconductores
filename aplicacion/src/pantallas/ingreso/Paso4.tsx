// B4 · Paso 4: qué trabajo buscas
// Ruta: /conductor/registro/4
// Maqueta: docs/maqueta/CondPaso4.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Paso4() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="B4" titulo="Paso 4: qué trabajo buscas" />
    </Pantalla>
  );
}

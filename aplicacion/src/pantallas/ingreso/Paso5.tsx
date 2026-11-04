// B5 · Paso 5: documentos
// Ruta: /conductor/registro/5
// Maqueta: docs/maqueta/CondPaso5.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Paso5() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="B5" titulo="Paso 5: documentos" />
    </Pantalla>
  );
}

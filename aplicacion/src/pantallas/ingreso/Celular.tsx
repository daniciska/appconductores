// A2 · Celular
// Ruta: /conductor/celular
// Maqueta: docs/maqueta/CondCelular.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Celular() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="A2" titulo="Celular" />
    </Pantalla>
  );
}

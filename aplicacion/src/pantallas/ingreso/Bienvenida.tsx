// A1 · Bienvenida
// Ruta: /conductor/bienvenida
// Maqueta: docs/maqueta/CondBienvenida.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Bienvenida() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="A1" titulo="Bienvenida" />
    </Pantalla>
  );
}

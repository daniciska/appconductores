// A3 · Código (WhatsApp o SMS)
// Ruta: /conductor/codigo
// Maqueta: docs/maqueta/CondCodigo.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Codigo() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="A3" titulo="Código (WhatsApp o SMS)" />
    </Pantalla>
  );
}

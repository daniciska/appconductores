// D4 · Conversación
// Ruta: /conductor/mensajes/[id]
// Maqueta: docs/maqueta/CondConversacion.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Conversacion() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="D4" titulo="Conversación" />
    </Pantalla>
  );
}

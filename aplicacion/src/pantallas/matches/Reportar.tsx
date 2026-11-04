// D5 · Reportar o bloquear
// Ruta: /conductor/mensajes/[id]/reportar
// Maqueta: docs/maqueta/CondReportar.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Reportar() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="D5" titulo="Reportar o bloquear" />
    </Pantalla>
  );
}

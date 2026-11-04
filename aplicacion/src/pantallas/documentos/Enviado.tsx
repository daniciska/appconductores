// C2 · Enviado a revisión
// Ruta: /conductor/documentos/enviado
// Maqueta: docs/maqueta/CondEnviado.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Enviado() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="C2" titulo="Enviado a revisión" />
    </Pantalla>
  );
}

// C1 · Subir documento
// Ruta: /conductor/documentos/subir/[tipo]
// Maqueta: docs/maqueta/CondSubirDoc.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function SubirDocumento() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="C1" titulo="Subir documento" />
    </Pantalla>
  );
}

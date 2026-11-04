// E2 · Mis documentos
// Ruta: /conductor/perfil/documentos
// Maqueta: docs/maqueta/CondMisDocumentos.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function MisDocumentos() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="E2" titulo="Mis documentos" />
    </Pantalla>
  );
}

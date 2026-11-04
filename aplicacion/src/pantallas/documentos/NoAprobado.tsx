// C4 · Documento no aprobado
// Ruta: /conductor/documentos/[tipo]/no-aprobado
// Maqueta: docs/maqueta/CondDocRechazado.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function NoAprobado() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="C4" titulo="Documento no aprobado" />
    </Pantalla>
  );
}

// A4 · Autorizaciones
// Ruta: /conductor/autorizaciones
// Maqueta: docs/maqueta/CondConsentimientos.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Autorizaciones() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="A4" titulo="Autorizaciones" />
    </Pantalla>
  );
}

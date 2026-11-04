// BT2 · Conductores que tú elijas
// Ruta: /titular/bolsa/[busqueda]/perfiles
// Maqueta: docs/maqueta/BolsaPerfiles.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Perfiles() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="BT2" titulo="Conductores que tú elijas" />
    </Pantalla>
  );
}

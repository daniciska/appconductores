// E5 · Eliminar cuenta
// Ruta: /conductor/eliminar-cuenta
// Maqueta: docs/maqueta/CondEliminarCuenta.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function EliminarCuenta() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="E5" titulo="Eliminar cuenta" />
    </Pantalla>
  );
}

// E4 · Confirmar disponibilidad
// Ruta: /conductor/disponibilidad
// Maqueta: docs/maqueta/CondDisponibilidad.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Disponibilidad() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="E4" titulo="Confirmar disponibilidad" />
    </Pantalla>
  );
}

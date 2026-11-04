// E3 · Quién recibió mis datos
// Ruta: /conductor/perfil/quien-recibio
// Maqueta: docs/maqueta/CondQuienVio.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function QuienRecibio() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="E3" titulo="Quién recibió mis datos" />
    </Pantalla>
  );
}

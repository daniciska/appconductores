// BC1 · Bolsa de trabajo
// Ruta: /conductor/bolsa
// Maqueta: docs/maqueta/BolsaLista.dc.html
import { EnConstruccion, Pantalla } from '@/ui';

export default function BolsaConductor() {
  return (
    <Pantalla inferior={24}>
      <EnConstruccion codigo="BC1" titulo="Bolsa de trabajo" />
    </Pantalla>
  );
}

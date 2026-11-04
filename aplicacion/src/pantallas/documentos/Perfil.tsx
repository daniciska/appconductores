// E1 · Perfil
// Ruta: /conductor/perfil
// Maqueta: docs/maqueta/CondPerfil.dc.html
import { EnConstruccion, Pantalla } from '@/ui';

export default function Perfil() {
  return (
    <Pantalla inferior={24}>
      <EnConstruccion codigo="E1" titulo="Perfil" />
    </Pantalla>
  );
}

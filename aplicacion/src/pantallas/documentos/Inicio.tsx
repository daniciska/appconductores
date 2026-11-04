// B6 · C3 · C5 · C6 · Inicio del conductor
// Ruta: /conductor/inicio
// Maqueta: docs/maqueta/CondInicioIncompleto.dc.html, CondInicioRevision.dc.html, CondInicioActivo.dc.html, CondSinMatches.dc.html
import { EnConstruccion, Pantalla } from '@/ui';

export default function Inicio() {
  return (
    <Pantalla inferior={24}>
      <EnConstruccion codigo="B6 · C3 · C5 · C6" titulo="Inicio del conductor" />
    </Pantalla>
  );
}

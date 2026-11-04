// BT3 · BT4 · Postulantes
// Ruta: /titular/bolsa/[busqueda]/postulantes
// Maqueta: docs/maqueta/BolsaPostulantes.dc.html, BolsaPostulantesSinPlan.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Postulantes() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="BT3 · BT4" titulo="Postulantes" />
    </Pantalla>
  );
}

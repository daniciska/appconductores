// BT1 · Publicar en la bolsa
// Ruta: /titular/bolsa/[busqueda]/publicar
// Maqueta: docs/maqueta/BolsaPublicar.dc.html
import { Encabezado, EnConstruccion, Pantalla } from '@/ui';

export default function Publicar() {
  return (
    <Pantalla>
      <Encabezado volverA="/" />
      <EnConstruccion codigo="BT1" titulo="Publicar en la bolsa" />
    </Pantalla>
  );
}

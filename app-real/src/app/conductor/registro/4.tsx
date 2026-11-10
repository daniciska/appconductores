// /conductor/registro/4 · B4 · Paso 4: qué trabajo buscas (pantalla compartida con la demo).
// En la v1 no hay Paso 5 (documentos): "Continuar" lleva a Inicio con un aviso.
import Paso4 from '@/pantallas/ingreso/Paso4';
import { irAInicioConductor } from '@/pantallas/ingreso/acciones';
import { mostrarToast } from '@/ui';

export default function RutaPaso4() {
  return (
    <Paso4
      alTerminar={() => {
        irAInicioConductor();
        setTimeout(() => mostrarToast('Listo, tus datos quedaron guardados.', 'exito'), 50);
      }}
    />
  );
}

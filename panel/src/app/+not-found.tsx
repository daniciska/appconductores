// Ruta desconocida dentro del panel (/panel/…): vuelve a la portada del panel.
import { View } from 'react-native';

import { EstadoVacio, color } from '@/ui';
import { Compass } from '@/ui/iconos';

export default function NoEncontradaPanel() {
  return (
    <View style={{ flex: 1, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <View style={{ width: '100%', maxWidth: 440 }}>
        <EstadoVacio
          icono={Compass}
          titulo="Esta página del panel no existe"
          texto="Puede que el enlace esté incompleto."
          accion={{ titulo: 'Ir al inicio del panel', href: '/' }}
        />
      </View>
    </View>
  );
}

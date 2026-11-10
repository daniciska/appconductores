// Puerta de la app real (va en el layout raíz): mientras se leen los catálogos, la sesión guardada y el
// perfil, muestra "Cargando"; si no hay conexión, lo dice con "Reintentar". Recién después se ven las
// pantallas (así ninguna pantalla se dibuja con catálogos vacíos).
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import WifiOff from 'lucide-react-native/icons/wifi-off';

import { Cargando, EstadoVacio, MarcoCelular, Pantalla, color } from '@/ui';

import { iniciarAppReal } from '../datos/puertoReal';
import { useTiendaReal } from '../datos/tiendaReal';

export function Puerta({ children }: { children: ReactNode }) {
  const fase = useTiendaReal((s) => s.fase);
  useEffect(() => {
    void iniciarAppReal();
  }, []);

  if (fase === 'listo') return <>{children}</>;
  return (
    <MarcoCelular>
      {fase === 'sin_conexion' ? (
        <Pantalla>
          <View style={{ flexGrow: 1, justifyContent: 'center' }}>
            <EstadoVacio
              icono={WifiOff}
              titulo="No pudimos conectarnos"
              texto="Revisa tu internet e inténtalo de nuevo."
              accion={{ titulo: 'Reintentar', onPress: () => void iniciarAppReal() }}
            />
          </View>
        </Pantalla>
      ) : (
        <Cargando style={{ backgroundColor: color.fondo }} />
      )}
    </MarcoCelular>
  );
}

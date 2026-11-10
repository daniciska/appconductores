// Layout raíz de la app real: carga las fuentes, monta la Puerta (catálogos, sesión y perfil desde
// Supabase), la interfaz de datos real (<ProveedorReal>) y los avisos. Sin clave de demo, sin
// simulación y sin datos de ejemplo. Las pantallas no tienen encabezado nativo (usan <Encabezado>).
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Cargando, HostAvisos, color } from '@/ui';
import { FUENTES } from '@/ui/fuentes';

import { ProveedorReal } from '@real/datos/puertoReal';
import { Puerta } from '@real/pantallas/Puerta';

export default function LayoutRaiz() {
  const [fuentesListas, errorFuentes] = useFonts(FUENTES);
  const listo = fuentesListas || !!errorFuentes;

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = 'Dale Contacto';
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {listo ? (
        <ProveedorReal>
          <Puerta>
            <View style={{ flex: 1 }}>
              <Stack
                screenOptions={{ headerShown: false, title: 'Dale Contacto', contentStyle: { backgroundColor: color.fondoEscritorio } }}
              />
              <HostAvisos />
            </View>
          </Puerta>
        </ProveedorReal>
      ) : (
        <Cargando style={{ backgroundColor: color.fondo }} />
      )}
    </SafeAreaProvider>
  );
}

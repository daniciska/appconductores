// Layout raíz: carga las fuentes, espera lo guardado en el navegador, enciende la simulación
// y monta los avisos. Las pantallas no tienen encabezado nativo (cada una usa <Encabezado>).
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useDemoHidratada } from '@/datos/hooks';
import { iniciarSimulacion } from '@/datos/simulacion';
import { Cargando, HostAvisos, color } from '@/ui';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

// Fuentes copiadas en assets/fuentes (de @expo-google-fonts; licencia OFL al lado). Se cargan desde
// la carpeta del proyecto y no desde node_modules porque Netlify no publica carpetas node_modules.
const FUENTES = {
  Sora_600SemiBold: require('../../assets/fuentes/Sora_600SemiBold.ttf'),
  Sora_700Bold: require('../../assets/fuentes/Sora_700Bold.ttf'),
  PlusJakartaSans_400Regular: require('../../assets/fuentes/PlusJakartaSans_400Regular.ttf'),
  PlusJakartaSans_500Medium: require('../../assets/fuentes/PlusJakartaSans_500Medium.ttf'),
  PlusJakartaSans_600SemiBold: require('../../assets/fuentes/PlusJakartaSans_600SemiBold.ttf'),
  PlusJakartaSans_700Bold: require('../../assets/fuentes/PlusJakartaSans_700Bold.ttf'),
};

export default function LayoutRaiz() {
  const [fuentesListas, errorFuentes] = useFonts(FUENTES);
  const hidratada = useDemoHidratada();
  const listo = (fuentesListas || !!errorFuentes) && hidratada;

  useEffect(() => iniciarSimulacion(), []);
  useEffect(() => {
    if (listo) SplashScreen.hideAsync().catch(() => undefined);
  }, [listo]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {listo ? (
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              title: 'Dale Contacto · Demo',
              contentStyle: { backgroundColor: color.fondoEscritorio },
            }}
          />
          <HostAvisos />
        </View>
      ) : (
        <Cargando style={{ backgroundColor: color.fondo }} />
      )}
    </SafeAreaProvider>
  );
}

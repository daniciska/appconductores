// Layout raíz: carga las fuentes, espera lo guardado en el navegador, enciende la simulación
// y monta los avisos (también los de cambios que llegan desde otra pestaña). Las pantallas no tienen
// encabezado nativo (cada una usa <Encabezado>). Las pantallas compartidas con la app real leen y
// escriben por la interfaz de datos: aquí se monta su implementación demo (<ProveedorDemo>).
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { iniciarAvisosEntrePestanas } from '@/datos/avisosEntrePestanas';
import { ProveedorDemo } from '@/datos/demo/puertoDemo';
import { useDemoHidratada } from '@/datos/hooks';
import { iniciarSimulacion } from '@/datos/simulacion';
import { Cargando, HostAvisos, color } from '@/ui';
import { FUENTES } from '@/ui/fuentes';
import { PuertaClave } from '@/pantallas/ingreso/PuertaClave';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function LayoutRaiz() {
  const [fuentesListas, errorFuentes] = useFonts(FUENTES);
  const hidratada = useDemoHidratada();
  const listo = (fuentesListas || !!errorFuentes) && hidratada;

  useEffect(() => iniciarSimulacion(), []);
  useEffect(() => iniciarAvisosEntrePestanas(), []);
  useEffect(() => {
    if (listo) SplashScreen.hideAsync().catch(() => undefined);
  }, [listo]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {listo ? (
        <PuertaClave>
          <ProveedorDemo>
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
          </ProveedorDemo>
        </PuertaClave>
      ) : (
        <Cargando style={{ backgroundColor: color.fondo }} />
      )}
    </SafeAreaProvider>
  );
}

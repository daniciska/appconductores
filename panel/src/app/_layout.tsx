// Layout raíz del panel (app aparte, publicada en /panel del mismo sitio que la demo del conductor):
// carga las fuentes, espera lo guardado en el navegador, monta los avisos y mantiene la sesión de esta
// pestaña (su marca de revisión a mano: ver sesion.ts).
// La simulación de la demo (pre-revisión de la IA, respuestas de titulares…) va de respaldo: la lleva la
// demo del conductor si está abierta en otra pestaña (ahí se ven sus avisos); si no, la lleva el panel,
// para que los documentos lleguen igual a la cola.
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useDemoHidratada } from '@/datos/hooks';
import { iniciarSimulacion } from '@/datos/simulacion';
import { Cargando, HostAvisos, color } from '@/ui';
import { FUENTES } from '@/ui/fuentes';
import { PuertaClave } from '@/pantallas/ingreso/PuertaClave';

import { iniciarSesionPanel } from '@panel/sesion';

export default function LayoutRaizPanel() {
  const [fuentesListas, errorFuentes] = useFonts(FUENTES);
  const hidratada = useDemoHidratada();
  const listo = (fuentesListas || !!errorFuentes) && hidratada;

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = 'Panel · Dale Contacto';
  }, []);
  useEffect(() => iniciarSesionPanel(), []);
  // Recién con lo guardado ya leído, para no simular sobre los datos iniciales.
  useEffect(() => (hidratada ? iniciarSimulacion({ respaldo: true }) : undefined), [hidratada]);

  return (
    <SafeAreaProvider>
      {listo ? (
        <PuertaClave>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false, title: 'Panel · Dale Contacto', contentStyle: { backgroundColor: color.fondo } }} />
            <HostAvisos />
          </View>
        </PuertaClave>
      ) : (
        <Cargando style={{ backgroundColor: color.fondo }} />
      )}
    </SafeAreaProvider>
  );
}

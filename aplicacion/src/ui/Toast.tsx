// Avisos breves (toasts). Muéstralos con mostrarToast('Guardado', 'exito') desde cualquier parte.
// <HostAvisos /> ya está montado en el layout raíz.
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { avisar, useAvisos, type Aviso } from '../datos/avisos';
import { Check, CircleAlert, Info } from './iconos';
import { ANCHO_CELULAR, color, duracion, fuente, radio, sombra } from './tokens';

/** Muestra un aviso breve abajo. tipo: 'info' | 'exito' | 'error'. */
export const mostrarToast = avisar;

function UnAviso({ aviso }: { aviso: Aviso }) {
  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrada, { toValue: 1, duration: duracion.normal, useNativeDriver: false }).start();
  }, [entrada]);
  const Icono = aviso.tipo === 'exito' ? Check : aviso.tipo === 'error' ? CircleAlert : Info;
  const tinta = aviso.tipo === 'exito' ? '#7FD3A5' : aviso.tipo === 'error' ? '#FF9B90' : color.acento;
  return (
    <Animated.View
      role={aviso.tipo === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: color.oscuro,
          borderRadius: radio.campo,
          paddingHorizontal: 16,
          paddingVertical: 12,
          opacity: entrada,
          transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
        sombra.flotante,
      ]}>
      <Icono size={18} color={tinta} strokeWidth={2.4} />
      <Text style={[fuente(600), { flex: 1, fontSize: 14, lineHeight: 19, color: color.blanco }]}>{aviso.texto}</Text>
    </Animated.View>
  );
}

/** Contenedor de avisos (abajo, sobre la barra de pestañas). */
export function HostAvisos() {
  const avisos = useAvisos((s) => s.avisos);
  const insets = useSafeAreaInsets();
  if (avisos.length === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 96 + insets.bottom, alignItems: 'center', paddingHorizontal: 16, zIndex: 100 }}>
      <View style={{ width: '100%', maxWidth: ANCHO_CELULAR - 32, gap: 8 }}>
        {avisos.map((a) => (
          <UnAviso key={a.id} aviso={a} />
        ))}
      </View>
    </View>
  );
}

// Avisos breves (toasts). Muéstralos con mostrarToast('Guardado', 'exito') desde cualquier parte.
// <HostAvisos /> ya está montado en el layout raíz.
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { avisar, useAvisos, type Aviso } from '../datos/avisos';
import { Check, CircleAlert, Info } from './iconos';
import { ANCHO_CELULAR, color, duracion, fuente, radio, sombra } from './tokens';

/** Muestra un aviso breve arriba de la pantalla. tipo: 'info' | 'exito' | 'error'. */
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
          paddingHorizontal: 14,
          // Compacto: con 2 líneas mide 50 px y cabe en la franja libre de arriba (56 px).
          paddingVertical: 7,
          opacity: entrada,
          transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
        },
        sombra.flotante,
      ]}>
      <Icono size={18} color={tinta} strokeWidth={2.4} />
      <Text style={[fuente(600), { flex: 1, fontSize: 14, lineHeight: 18, color: color.blanco }]}>{aviso.texto}</Text>
    </Animated.View>
  );
}

/**
 * Contenedor de avisos: arriba, en la franja libre de 56 px que tiene cada pantalla sobre el botón
 * Volver, el nombre de Perfil o el saludo de Inicio (S13). Un aviso de 1 o 2 líneas cabe en esa franja,
 * así que no tapa casillas, errores, títulos, el botón de abajo ni los botones de un diálogo.
 */
export function HostAvisos() {
  const avisos = useAvisos((s) => s.avisos);
  const insets = useSafeAreaInsets();
  if (avisos.length === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 3 + insets.top, alignItems: 'center', paddingHorizontal: 12, zIndex: 100 }}>
      <View style={{ width: '100%', maxWidth: ANCHO_CELULAR - 24, gap: 6 }}>
        {avisos.map((a) => (
          <UnAviso key={a.id} aviso={a} />
        ))}
      </View>
    </View>
  );
}

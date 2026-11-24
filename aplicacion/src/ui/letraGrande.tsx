// Interruptor "Letra grande" (pedido de Daniela, 24-nov): en la Bienvenida (tono oscuro) y en Perfil
// (tono claro). Lo elegido se recuerda en este equipo (ver ./escala.tsx).
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { FilaInterruptor, ZonaInterruptor } from './controles';
import { Text, useLetraGrande, useMedidas } from './escala';
import { ALargeSmall } from './iconos';
import { color, radio, tipo } from './tokens';

export const TITULO_LETRA_GRANDE = 'Letra grande';

export function InterruptorLetraGrande({ tono = 'claro', style }: { tono?: 'claro' | 'oscuro'; style?: StyleProp<ViewStyle> }) {
  const grande = useLetraGrande((s) => s.grande);
  const cambiar = useLetraGrande((s) => s.cambiar);
  const m = useMedidas();
  if (tono === 'claro') {
    return <FilaInterruptor titulo={TITULO_LETRA_GRANDE} ayuda="Textos y botones más grandes." valor={grande} onCambiar={cambiar} style={style} />;
  }
  const cuadro = m.grande ? 40 : 32;
  return (
    <ZonaInterruptor
      valor={grande}
      onCambiar={cambiar}
      etiquetaAccesible={TITULO_LETRA_GRANDE}
      style={[
        {
          backgroundColor: '#1D1D1D',
          borderWidth: 1,
          borderColor: '#2E2E2E',
          borderRadius: radio.campo,
          paddingHorizontal: 14,
          paddingVertical: 8,
          gap: 12,
        },
        style,
      ]}>
      <View
        aria-hidden
        style={{ width: cuadro, height: cuadro, borderRadius: radio.icono, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' }}>
        <ALargeSmall size={m.icono(18)} color={color.blanco} strokeWidth={2} />
      </View>
      <Text style={[tipo.fuerte, { flex: 1, minWidth: 0, color: color.blanco }]}>{TITULO_LETRA_GRANDE}</Text>
    </ZonaInterruptor>
  );
}

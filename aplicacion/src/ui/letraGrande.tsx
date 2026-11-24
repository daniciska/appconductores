// Interruptor "Letra grande" (pedido de Daniela, 24-nov): en la Bienvenida (tono oscuro) y en Perfil
// (tono claro). Dice lo mismo en los dos lugares: ícono "Aa", título y ayuda. Lo elegido se recuerda en
// este equipo (ver ./escala.tsx).
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { ZonaInterruptor } from './controles';
import { Text, useLetraGrande, useMedidas } from './escala';
import { ALargeSmall } from './iconos';
import { color, radio, tipo } from './tokens';

export const TITULO_LETRA_GRANDE = 'Letra grande';
/** Corta para que quepa en una línea al lado del interruptor, también con letra grande a 360 px. */
export const AYUDA_LETRA_GRANDE = 'Agranda toda la app.';

export function InterruptorLetraGrande({
  tono = 'claro',
  compacto,
  style,
}: {
  tono?: 'claro' | 'oscuro';
  /**
   * Versión de una línea para la cabecera (A2, la pantalla del celular): mismo borde, ícono "Aa", título e
   * interruptor, sin la ayuda. Va arriba, al lado de "Volver", para que el teclado (que se abre solo al entrar)
   * no la tape y para no bajar "Enviar código" en celulares chicos.
   */
  compacto?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const grande = useLetraGrande((s) => s.grande);
  const cambiar = useLetraGrande((s) => s.cambiar);
  const m = useMedidas();
  const oscuro = tono === 'oscuro';
  if (compacto) {
    return (
      <ZonaInterruptor
        valor={grande}
        onCambiar={cambiar}
        etiquetaAccesible={TITULO_LETRA_GRANDE}
        style={[
          {
            flexShrink: 1,
            backgroundColor: color.superficie,
            borderWidth: 1,
            borderColor: color.borde,
            borderRadius: radio.campo,
            minHeight: m.tactil,
            paddingLeft: 10,
            paddingRight: 6,
            gap: 8,
          },
          style,
        ]}>
        <View aria-hidden>
          <ALargeSmall size={m.icono(18)} color={color.texto} strokeWidth={2} />
        </View>
        <Text style={[tipo.fuerte, { flexShrink: 1, color: color.texto }]}>{TITULO_LETRA_GRANDE}</Text>
      </ZonaInterruptor>
    );
  }
  return (
    <ZonaInterruptor
      valor={grande}
      onCambiar={cambiar}
      etiquetaAccesible={TITULO_LETRA_GRANDE}
      style={[
        {
          backgroundColor: oscuro ? color.oscuroElevado : color.superficie,
          borderWidth: 1,
          borderColor: oscuro ? color.bordeSobreOscuro : color.borde,
          borderRadius: radio.campo,
          // En Perfil, como las otras filas con interruptor; en la Bienvenida, más baja (tiene que caber
          // todo sobre el pliegue en un celular común).
          minHeight: oscuro ? m.tactil : m.opcion,
          paddingHorizontal: oscuro ? 14 : 16,
          paddingVertical: oscuro ? (m.grande ? 8 : 4) : 12,
          gap: 12,
        },
        style,
      ]}>
      <View
        aria-hidden
        style={{
          width: m.iconoFila,
          height: m.iconoFila,
          borderRadius: radio.icono,
          backgroundColor: oscuro ? color.iconoSobreOscuro : color.fondo,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ALargeSmall size={m.icono(18)} color={oscuro ? color.blanco : color.texto} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[tipo.fuerte, { color: oscuro ? color.blanco : color.texto }]}>{TITULO_LETRA_GRANDE}</Text>
        <Text style={[tipo.ayuda, { color: oscuro ? color.textoSobreOscuro : color.textoSecundario }]}>{AYUDA_LETRA_GRANDE}</Text>
      </View>
    </ZonaInterruptor>
  );
}

// Piezas visuales propias del grupo "matches" (D1–D3), con las medidas de las maquetas.
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Linking, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/ui/escala';

import { useDemo } from '@/datos/tienda';
import { BotonIcono, Presionable, Titulo, color, duracion, fuente, mostrarToast, radio, tipo } from '@/ui';
import { Mail, MessageCircle, Phone, Star, type LucideIcon } from '@/ui/iconos';

/** Título de pestaña (h1 con 4 px de sangría, como en las maquetas D1 y D3). */
export function TituloPestana({ children }: { children: ReactNode }) {
  return <Titulo style={{ paddingHorizontal: 4 }}>{children}</Titulo>;
}

/** Estrella de favorito (44 px). Amarilla y rellena si está marcada. */
export function BotonFavorito({
  busquedaId,
  favorito,
  nombre,
  variante = 'suave',
  style,
}: {
  busquedaId: string;
  favorito: boolean;
  /** Para el aviso y la etiqueta accesible (ej. "Taxi de Transportes Los Aromos"). */
  nombre?: string;
  /** Cómo se ve sin marcar: 'suave' gris (en tarjetas blancas) o 'borde' blanco (sobre el fondo gris). */
  variante?: 'suave' | 'borde';
  style?: StyleProp<ViewStyle>;
}) {
  const alternar = useDemo((s) => s.alternarFavorito);
  const escala = useRef(new Animated.Value(1)).current;
  const tocar = () => {
    alternar(busquedaId);
    if (!favorito) mostrarToast('Guardado en favoritos.', 'exito');
    Animated.sequence([
      Animated.timing(escala, { toValue: 0.86, duration: 90, useNativeDriver: false }),
      Animated.spring(escala, { toValue: 1, friction: 4, tension: 160, useNativeDriver: false }),
    ]).start();
  };
  return (
    <Animated.View style={[{ transform: [{ scale: escala }] }, style]}>
      <BotonIcono
        icono={Star}
        etiquetaAccesible={favorito ? `Quitar de favoritos${nombre ? `: ${nombre}` : ''}` : `Marcar como favorito${nombre ? `: ${nombre}` : ''}`}
        variante={favorito ? 'acento' : variante}
        relleno={favorito}
        colorIcono={favorito ? undefined : color.textoSecundario}
        onPress={tocar}
      />
    </Animated.View>
  );
}

/** Aparece suave (sube 6 px). Para tarjetas nuevas. */
export function Aparecer({ children, retraso = 0, style }: { children: ReactNode; retraso?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: duracion.normal, delay: retraso, useNativeDriver: false }).start();
  }, [v, retraso]);
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

/** Nota corta bajo un valor que no coincide ("Vives en otra zona"). */
export function NotaNoCoincide({ texto }: { texto: string }) {
  return <Text style={[tipo.pequeno, fuente(600), { color: color.amarilloTexto, textAlign: 'right' }]}>{texto}</Text>;
}

/** Solo los dígitos de un teléfono chileno, con 56 adelante (para tel: y WhatsApp). */
function digitosTelefono(telefono: string): string {
  const d = telefono.replace(/\D/g, '');
  if (d.startsWith('56')) return d;
  if (d.length === 9) return `56${d}`;
  if (d.length === 8) return `569${d}`;
  return d;
}

function AccionContacto({ etiqueta, icono: Icono, url }: { etiqueta: string; icono: LucideIcon; url: string }) {
  return (
    <Presionable
      role="link"
      aria-label={etiqueta}
      efecto="escala"
      onPress={() => Linking.openURL(url).catch(() => mostrarToast('No pudimos abrirlo en este teléfono.', 'error'))}
      style={{
        flex: 1,
        minHeight: 64,
        borderRadius: radio.campo,
        backgroundColor: color.fondo,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
      }}>
      <Icono size={20} color={color.texto} strokeWidth={2} />
      <Text style={[tipo.pequeno, fuente(600), { color: color.texto }]}>{etiqueta}</Text>
    </Presionable>
  );
}

/**
 * Contacto de la otra persona (teléfono y correo) con Llamar, WhatsApp y Correo. La usan el detalle del
 * match del conductor (cuando el titular le mostró su contacto) y las fichas del titular.
 */
export function TarjetaContacto({ titulo = 'Contacto', telefono, correo }: { titulo?: string; telefono: string; correo: string }) {
  const tel = telefono ? digitosTelefono(telefono) : '';
  return (
    <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, padding: 18, gap: 12 }}>
      <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto }]}>
        {titulo}
      </Text>
      <View style={{ gap: 4 }}>
        {telefono ? <Text selectable style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{telefono}</Text> : null}
        {correo ? <Text selectable style={[tipo.secundario, { color: color.textoSecundario }]}>{correo}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {tel ? <AccionContacto etiqueta="Llamar" icono={Phone} url={`tel:+${tel}`} /> : null}
        {tel ? <AccionContacto etiqueta="WhatsApp" icono={MessageCircle} url={`https://wa.me/${tel}`} /> : null}
        {correo ? <AccionContacto etiqueta="Correo" icono={Mail} url={`mailto:${correo}`} /> : null}
      </View>
    </View>
  );
}

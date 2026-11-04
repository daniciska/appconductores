// Piezas visuales propias del grupo "matches" (D1–D5), con las medidas de las maquetas.
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDemo } from '@/datos/tienda';
import { Boton, BotonIcono, Titulo, color, duracion, fuente, mostrarToast, radio, tipo } from '@/ui';
import { Ban, Star } from '@/ui/iconos';

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

/** Aparece suave (sube 6 px). Para tarjetas y mensajes nuevos. */
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

/** Pastilla gris centrada del chat ("Hicieron match · 4 nov", avisos del sistema). */
export function ChipSistema({ texto, icono }: { texto: string; icono?: ReactNode }) {
  return (
    <View
      style={{
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        maxWidth: '90%',
        backgroundColor: color.superficieHundida,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}>
      {icono}
      <Text style={[fuente(500), { fontSize: 12, lineHeight: 16, color: color.textoSecundario, textAlign: 'center', flexShrink: 1 }]}>
        {texto}
      </Text>
    </View>
  );
}

/** Nota corta bajo un valor que no coincide ("Vives en otra zona"). */
export function NotaNoCoincide({ texto }: { texto: string }) {
  return <Text style={[tipo.pequeno, fuente(600), { color: color.amarilloTexto, textAlign: 'right' }]}>{texto}</Text>;
}

/** Aviso de titular bloqueado, con el botón para deshacerlo debajo (D2 y D4). */
export function AvisoBloqueado({ nombre, onDesbloquear }: { nombre: string; onDesbloquear: () => void }) {
  return (
    <View role="status" style={{ backgroundColor: color.errorFondo, borderRadius: radio.campo, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          aria-hidden
          style={{ width: 36, height: 36, borderRadius: radio.icono, backgroundColor: color.superficie, alignItems: 'center', justifyContent: 'center' }}>
          <Ban size={18} color={color.error} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={[tipo.etiqueta, { color: color.error }]}>Bloqueaste a {nombre}</Text>
          <Text style={[tipo.ayuda, { lineHeight: 18, color: color.textoSuave }]}>No podrá escribirte y no aparece en tus matches.</Text>
        </View>
      </View>
      <Boton titulo="Desbloquear" variante="contorno" tamano="mediano" anchoCompleto onPress={onDesbloquear} />
    </View>
  );
}

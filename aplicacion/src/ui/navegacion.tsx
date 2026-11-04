// Navegación: barra inferior de pestañas y botón "Demo" (vuelve al selector).
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { router, useNavigation, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Presionable } from './controles';
import { RotateCcw, type LucideIcon } from './iconos';
import { color, fuente } from './tokens';

export interface PestanaBarra {
  clave: string;
  etiqueta: string;
  icono: LucideIcon;
  href: Href;
  /** Punto amarillo (ej. mensajes sin leer). */
  punto?: boolean;
  /** Para lectores de pantalla, ej. "Mensajes, 1 nuevo". */
  etiquetaAccesible?: string;
}

export interface PropsBarraInferior {
  pestanas: PestanaBarra[];
  activa: string;
  /** Si no se da, navega al href de la pestaña. */
  onElegir?: (p: PestanaBarra) => void;
}

/** Barra inferior blanca con ícono y nombre, como en las maquetas (4 o 5 pestañas). */
export function BarraInferior({ pestanas, activa, onElegir }: PropsBarraInferior) {
  const insets = useSafeAreaInsets();
  return (
    <View
      role="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: color.superficie,
        borderTopWidth: 1,
        borderTopColor: color.borde,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 10) + 4,
      }}>
      {pestanas.map((p) => {
        const sel = p.clave === activa;
        const Icono = p.icono;
        const tinta = sel ? color.texto : color.textoSecundario;
        return (
          <Presionable
            key={p.clave}
            role="tab"
            aria-selected={sel}
            aria-label={p.etiquetaAccesible ?? p.etiqueta}
            onPress={() => (onElegir ? onElegir(p) : router.navigate(p.href))}
            efecto="opacidad"
            style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <View>
              <Icono size={22} color={tinta} strokeWidth={2} />
              {p.punto ? (
                <View
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: color.acento,
                    borderWidth: 2,
                    borderColor: color.superficie,
                  }}
                />
              ) : null}
            </View>
            <Text style={[fuente(sel ? 700 : 500), { fontSize: 12, lineHeight: 16, color: tinta }]}>{p.etiqueta}</Text>
          </Presionable>
        );
      })}
    </View>
  );
}

/**
 * Botón discreto "Demo" (arriba a la derecha) que vuelve al selector de la demo.
 * Va en los layouts de /conductor, /titular y /admin: saca esa sección de la pila raíz y vuelve a "/"
 * (si "/" no estaba en la pila, por ejemplo al abrir un enlace directo, lo agrega).
 */
export function BotonDemo({ style }: { style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const irAlMenu = () => {
    try {
      navigation.dispatch({ type: 'POP_TO', payload: { name: 'index', params: undefined, merge: false } });
    } catch {
      router.replace('/');
    }
  };
  return (
    <View pointerEvents="box-none" style={[{ position: 'absolute', top: insets.top + 12, right: 12, zIndex: 50 }, style]}>
      <Presionable
        role="button"
        aria-label="Menú de la demo"
        onPress={irAlMenu}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          height: 26,
          paddingHorizontal: 10,
          borderRadius: 13,
          backgroundColor: 'rgba(255,255,255,0.88)',
          borderWidth: 1,
          borderColor: color.borde,
        }}>
        <RotateCcw size={11} color={color.textoSecundario} strokeWidth={2.4} />
        <Text style={[fuente(700), { fontSize: 11, color: color.textoSecundario, letterSpacing: 0.2 }]}>Demo</Text>
      </Presionable>
    </View>
  );
}

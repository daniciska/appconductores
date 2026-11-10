// Piezas que solo usa la demo (el mockup): el botón "Demo" que vuelve al menú y el marcador de pantallas
// en construcción. No se exportan desde '@/ui' para que la app real no las lleve en su paquete:
// se importan desde '@/ui/demo'.
import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Presionable } from './controles';
import { Insignia } from './info';
import { RotateCcw } from './iconos';
import { Texto, Titulo } from './texto';
import { color, fuente } from './tokens';

/**
 * Botón discreto "Demo" (arriba a la derecha) que vuelve al selector de la demo.
 * Va en los layouts de /conductor y /titular: saca esa sección de la pila raíz y vuelve a "/"
 * (si "/" no estaba en la pila, por ejemplo al abrir un enlace directo, lo agrega).
 * Zona táctil de 44 px; en conductor y titular va sobre la franja fija de Pantalla (MarcoCelular bandaDemo).
 * Con `enLinea` no flota (para ponerlo dentro de una barra o una lista).
 */
export function BotonDemo({ style, enLinea = false }: { style?: StyleProp<ViewStyle>; enLinea?: boolean }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const irAlMenu = () => {
    try {
      navigation.dispatch({ type: 'POP_TO', payload: { name: 'index', params: undefined, merge: false } });
    } catch {
      router.replace('/');
    }
  };
  const boton = (
    <Presionable
      role="button"
      aria-label="Menú de la demo"
      onPress={irAlMenu}
      style={{ minHeight: 44, minWidth: 44, paddingHorizontal: enLinea ? 0 : 6, justifyContent: 'center', alignItems: enLinea ? 'flex-start' : 'center' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: enLinea ? 6 : 4,
          height: enLinea ? 32 : 26,
          paddingHorizontal: enLinea ? 12 : 10,
          borderRadius: enLinea ? 16 : 13,
          backgroundColor: enLinea ? color.superficie : 'rgba(255,255,255,0.88)',
          borderWidth: 1,
          borderColor: color.borde,
        }}>
        <RotateCcw size={enLinea ? 13 : 11} color={color.textoSecundario} strokeWidth={2.4} />
        <Text style={[fuente(700), { fontSize: enLinea ? 12 : 11, color: color.textoSecundario, letterSpacing: 0.2 }]}>
          {enLinea ? 'Menú de la demo' : 'Demo'}
        </Text>
      </View>
    </Presionable>
  );
  if (enLinea) return <View style={style}>{boton}</View>;
  return (
    <View pointerEvents="box-none" style={[{ position: 'absolute', top: insets.top, right: 6, zIndex: 50 }, style]}>
      {boton}
    </View>
  );
}

// ---------------------------------------------------------------------------
// EnConstruccion (marcador para pantallas que aún no se construyen)
// ---------------------------------------------------------------------------

export function EnConstruccion({ codigo, titulo, children }: { codigo: string; titulo?: string; children?: ReactNode }) {
  return (
    <View style={{ gap: 12, paddingVertical: 24 }}>
      <Insignia texto={`En construcción: ${codigo}`} tono="amarilla" icono={null} />
      {titulo ? <Titulo>{titulo}</Titulo> : null}
      <Texto variante="parrafo" tono="secundario">
        Esta pantalla de la demo todavía se está armando.
      </Texto>
      {children}
    </View>
  );
}

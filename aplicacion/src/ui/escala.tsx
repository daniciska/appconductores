// "Letra grande": la preferencia (se recuerda en este equipo) y los textos que la respetan.
//
// - useLetraGrande: { grande, cambiar }. En la web se lee de localStorage al cargar (sin parpadeo) y se
//   sigue entre pestañas; en el celular (etapa de tiendas), de AsyncStorage.
// - useMedidas(): alturas de botones, campos, casillas e interruptor (normales o grandes).
// - Text y TextInput: los mismos de React Native, pero con letra grande escalan su tamaño y alto de
//   línea con la escala de escalaTipos.ts. Todas las pantallas usan estos (no los de react-native).
//   Con letra normal pasan el estilo tal cual: la app se ve exactamente igual que antes.
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, Text as TextoRN, TextInput as CampoRN, type StyleProp, type TextStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { CLAVE_LETRA_GRANDE, MARCADOR_GRANDE, MEDIDAS_GRANDES, MEDIDAS_NORMALES, escalarEstiloTexto, type Medidas } from './escalaTipos';
import { color } from './tokens';

export { CLAVE_LETRA_GRANDE, MEDIDAS_GRANDES, MEDIDAS_NORMALES, type Medidas } from './escalaTipos';

const web = Platform.OS === 'web';

function almacenWeb(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null; // navegador con el almacenamiento bloqueado
  }
}

function leerWeb(): boolean {
  try {
    return almacenWeb()?.getItem(CLAVE_LETRA_GRANDE) === '1';
  } catch {
    return false;
  }
}

function guardar(grande: boolean) {
  const valor = grande ? '1' : '0';
  if (web) {
    try {
      almacenWeb()?.setItem(CLAVE_LETRA_GRANDE, valor);
    } catch {
      // sin almacenamiento: vale para esta visita
    }
    return;
  }
  AsyncStorage.setItem(CLAVE_LETRA_GRANDE, valor).catch(() => undefined);
}

/** El panel de administración no usa "Letra grande" (ver fijarLetraNormal). */
let fija = false;

interface EstadoLetra {
  grande: boolean;
  cambiar: (grande: boolean) => void;
}

export const useLetraGrande = create<EstadoLetra>((set) => ({
  grande: web ? leerWeb() : false,
  cambiar: (grande) => {
    if (fija) return;
    set({ grande });
    guardar(grande);
  },
}));

if (web) {
  // Otra pestaña lo cambió: esta lo sigue.
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (e) => {
      if (e.key === CLAVE_LETRA_GRANDE && !fija) useLetraGrande.setState({ grande: e.newValue === '1' });
    });
  }
} else {
  AsyncStorage.getItem(CLAVE_LETRA_GRANDE)
    .then((v) => {
      if (v === '1' && !fija) useLetraGrande.setState({ grande: true });
    })
    .catch(() => undefined);
}

/**
 * Deja la letra normal siempre, aunque este equipo tenga elegida la grande. Lo usa el panel de
 * administración (comparte el navegador con la demo del conductor en /panel): se llama una vez, antes de
 * dibujar.
 */
export function fijarLetraNormal() {
  fija = true;
  useLetraGrande.setState({ grande: false });
}

/** ¿Está activa la letra grande? */
export function useGrande(): boolean {
  return useLetraGrande((s) => s.grande);
}

/** Medidas de los controles según la letra elegida. */
export function useMedidas(): Medidas {
  return useGrande() ? MEDIDAS_GRANDES : MEDIDAS_NORMALES;
}

/** Estilo de texto con letra grande (aplanado). Con letra normal devuelve el mismo estilo. */
export function estiloTextoGrande(estilo: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const plano = StyleSheet.flatten(estilo);
  if (!plano) return estilo;
  return escalarEstiloTexto(plano as Record<string, unknown>) as TextStyle;
}

/** Text de React Native que respeta "Letra grande". */
export function Text(props: ComponentProps<typeof TextoRN>) {
  const grande = useGrande();
  if (!grande) return <TextoRN {...props} />;
  return <TextoRN {...props} style={estiloTextoGrande(props.style)} />;
}

/** TextInput de React Native que respeta "Letra grande" (texto más grande y placeholder más legible, sin parecer un dato). */
export function TextInput(props: ComponentProps<typeof CampoRN>) {
  const grande = useGrande();
  if (!grande) return <CampoRN {...props} />;
  return (
    <CampoRN
      {...props}
      style={estiloTextoGrande(props.style)}
      placeholderTextColor={props.placeholderTextColor === color.textoDeshabilitado || !props.placeholderTextColor ? MARCADOR_GRANDE : props.placeholderTextColor}
    />
  );
}

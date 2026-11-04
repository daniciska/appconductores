// Textos: Titulo (Sora) y Texto (Plus Jakarta Sans). Úsalos siempre en vez de <Text> directo,
// para que todas las pantallas tengan la misma tipografía.
import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { color, fuente, tipo, type Peso } from './tokens';

export type TonoTexto = 'normal' | 'suave' | 'secundario' | 'deshabilitado' | 'exito' | 'error' | 'blanco' | 'acento';

const COLOR_TONO: Record<TonoTexto, string> = {
  normal: color.texto,
  suave: color.textoSuave,
  secundario: color.textoSecundario,
  deshabilitado: color.textoDeshabilitado,
  exito: color.exitoTexto,
  error: color.error,
  blanco: color.blanco,
  acento: color.acento,
};

export interface PropsTitulo {
  children: ReactNode;
  /** 'hero' 34 px (bienvenida) · 1 = 26 px (título de pantalla) · 2 = 20 px · 'tarjeta' = 17 px negrita. */
  nivel?: 'hero' | 1 | 2 | 'tarjeta';
  tono?: TonoTexto;
  centrado?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

/** Título de pantalla (Sora). El nivel 1 es el h1 de las maquetas: 26 px, -0,4 de espaciado. */
export function Titulo({ children, nivel = 1, tono = 'normal', centrado, numberOfLines, style }: PropsTitulo) {
  const base = nivel === 'hero' ? tipo.hero : nivel === 1 ? tipo.h1 : nivel === 2 ? tipo.h2 : tipo.tituloTarjeta;
  return (
    <Text
      role="heading"
      aria-level={nivel === 'hero' || nivel === 1 ? 1 : 2}
      numberOfLines={numberOfLines}
      style={[base, { color: COLOR_TONO[tono] }, centrado && { textAlign: 'center' }, style]}>
      {children}
    </Text>
  );
}

export type VarianteTexto =
  | 'cuerpo' // 15 regular
  | 'parrafo' // 15, alto 1,5 (subtítulos bajo el h1, suele ir en tono secundario)
  | 'fuerte' // 15 negrita
  | 'etiqueta' // 14 negrita (etiquetas de campo)
  | 'secundario' // 14
  | 'ayuda' // 13 (ayudas bajo un campo)
  | 'pequeno' // 12
  | 'seccion'; // 12 MAYÚSCULAS (grupos: "TRANSPORTE DE PASAJEROS")

export interface PropsTexto extends Omit<TextProps, 'style'> {
  children: ReactNode;
  variante?: VarianteTexto;
  tono?: TonoTexto;
  /** Cambia el peso (usa la familia correcta). */
  peso?: Peso;
  tamano?: number;
  centrado?: boolean;
  subrayado?: boolean;
  style?: StyleProp<TextStyle>;
}

/** Texto de la app. Ej.: <Texto variante="parrafo" tono="secundario">…</Texto> */
export function Texto({
  children,
  variante = 'cuerpo',
  tono,
  peso,
  tamano,
  centrado,
  subrayado,
  style,
  ...resto
}: PropsTexto) {
  const tonoFinal: TonoTexto =
    tono ?? (variante === 'ayuda' || variante === 'seccion' || variante === 'pequeno' ? 'secundario' : 'normal');
  return (
    <Text
      {...resto}
      style={[
        tipo[variante],
        { color: COLOR_TONO[tonoFinal] },
        peso !== undefined && fuente(peso),
        tamano !== undefined && { fontSize: tamano, lineHeight: Math.round(tamano * 1.4) },
        centrado && { textAlign: 'center' },
        subrayado && { textDecorationLine: 'underline' },
        style,
      ]}>
      {children}
    </Text>
  );
}

/** Título de un grupo de filas, como "Mi perfil" o "Seguridad y privacidad" en E1. */
export function TituloSeccion({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text role="heading" aria-level={2} style={[tipo.etiqueta, { color: color.textoSecundario, paddingHorizontal: 4 }, style]}>
      {children}
    </Text>
  );
}

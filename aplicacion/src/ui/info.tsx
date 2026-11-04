// Información: Insignia, Aviso, EstadoVacio, Cargando, Avatar y EnConstruccion.
import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Href } from 'expo-router';

import { Boton } from './controles';
import { Check, CircleAlert, Info, Lock, Sparkles, type LucideIcon } from './iconos';
import { Texto, Titulo } from './texto';
import { color, fuente, radio, tipo } from './tokens';

// ---------------------------------------------------------------------------
// Insignia
// ---------------------------------------------------------------------------

export type TonoInsignia = 'verde' | 'gris' | 'amarilla' | 'roja' | 'oscura' | 'acento';

const TONOS: Record<TonoInsignia, { fondo: string; texto: string; icono: string }> = {
  verde: { fondo: color.exitoFondo, texto: color.exitoTexto, icono: color.exito },
  gris: { fondo: color.grisInsignia, texto: color.textoSuave, icono: color.textoSecundario },
  amarilla: { fondo: color.amarilloFondo, texto: color.amarilloTexto, icono: color.amarilloTexto },
  roja: { fondo: color.errorFondo, texto: color.error, icono: color.error },
  oscura: { fondo: color.oscuro, texto: color.blanco, icono: color.acento },
  acento: { fondo: color.acento, texto: color.texto, icono: color.texto },
};

export interface PropsInsignia {
  texto: string;
  /** verde (Revisado, Verificado) · gris (Enviada) · amarilla (vence pronto) · roja (No aprobado) · oscura · acento. */
  tono?: TonoInsignia;
  /** 'check' (por defecto en verde), un ícono de lucide o null para ninguno. */
  icono?: 'check' | LucideIcon | null;
  /** 'normal' 12 px · 'grande' 13 px (ej. "Coincide 88 %"). */
  tamano?: 'normal' | 'grande';
  style?: StyleProp<ViewStyle>;
}

export function Insignia({ texto, tono = 'verde', icono, tamano = 'normal', style }: PropsInsignia) {
  const t = TONOS[tono];
  const grande = tamano === 'grande';
  const elegido = icono === undefined ? (tono === 'verde' ? 'check' : null) : icono;
  const Icono = elegido === 'check' ? Check : elegido;
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 4,
          backgroundColor: t.fondo,
          borderRadius: grande ? radio.icono : radio.insignia,
          paddingHorizontal: 9,
          paddingVertical: 5,
        },
        style,
      ]}>
      {Icono ? <Icono size={grande ? 14 : 12} color={t.icono} strokeWidth={elegido === 'check' ? 2.8 : 2.2} /> : null}
      <Text style={[{ ...fuente(700), fontSize: grande ? 13 : 12, lineHeight: grande ? 17 : 16 }, { color: t.texto }]}>{texto}</Text>
    </View>
  );
}

/** Punto amarillo de aviso (mensajes nuevos). */
export function PuntoAviso({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      aria-hidden
      style={[{ width: 10, height: 10, borderRadius: 6, backgroundColor: color.acento, borderWidth: 2, borderColor: color.blanco }, style]}
    />
  );
}

// ---------------------------------------------------------------------------
// Aviso (caja gris con ícono, como "El contacto del titular está oculto…")
// ---------------------------------------------------------------------------

export interface PropsAviso {
  children?: ReactNode;
  texto?: string;
  titulo?: string;
  /** 'info' · 'candado' · 'alerta' · 'chispa' o un ícono de lucide. */
  icono?: 'info' | 'candado' | 'alerta' | 'chispa' | LucideIcon;
  /** 'neutro' gris · 'exito' verde · 'error' rojo · 'acento' amarillo claro. */
  tono?: 'neutro' | 'exito' | 'error' | 'acento';
  /** Algo a la derecha o debajo (ej. un botón). */
  accion?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Aviso({ children, texto, titulo, icono = 'info', tono = 'neutro', accion, style }: PropsAviso) {
  const Icono: LucideIcon =
    icono === 'info' ? Info : icono === 'candado' ? Lock : icono === 'alerta' ? CircleAlert : icono === 'chispa' ? Sparkles : icono;
  const fondo = tono === 'exito' ? color.exitoFondo : tono === 'error' ? color.errorFondo : tono === 'acento' ? color.acentoSuave : color.superficieHundida;
  const colorTexto = tono === 'exito' ? color.exitoTexto : tono === 'error' ? color.error : color.textoSuave;
  return (
    <View
      role={tono === 'error' ? 'alert' : undefined}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: fondo, borderRadius: radio.campo, paddingHorizontal: 16, paddingVertical: 14 }, style]}>
      <View style={{ width: 36, height: 36, borderRadius: radio.icono, backgroundColor: color.superficie, alignItems: 'center', justifyContent: 'center' }}>
        <Icono size={18} color={tono === 'error' ? color.error : tono === 'exito' ? color.exito : color.texto} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        {titulo ? <Text style={[tipo.etiqueta, { color: tono === 'neutro' ? color.texto : colorTexto }]}>{titulo}</Text> : null}
        {texto ? <Text style={[tipo.ayuda, { lineHeight: 19, color: colorTexto }]}>{texto}</Text> : null}
        {children}
      </View>
      {accion}
    </View>
  );
}

// ---------------------------------------------------------------------------
// EstadoVacio
// ---------------------------------------------------------------------------

export interface PropsEstadoVacio {
  icono: LucideIcon;
  titulo: string;
  texto?: string;
  accion?: { titulo: string; onPress?: () => void; href?: Href };
  style?: StyleProp<ViewStyle>;
}

export function EstadoVacio({ icono: Icono, titulo, texto, accion, style }: PropsEstadoVacio) {
  return (
    <View style={[{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16, gap: 12 }, style]}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, alignItems: 'center', justifyContent: 'center' }}>
        <Icono size={28} color={color.texto} strokeWidth={1.8} />
      </View>
      <Titulo nivel="tarjeta" centrado>
        {titulo}
      </Titulo>
      {texto ? (
        <Texto variante="secundario" tono="secundario" centrado style={{ maxWidth: 300 }}>
          {texto}
        </Texto>
      ) : null}
      {accion ? (
        <Boton titulo={accion.titulo} onPress={accion.onPress} href={accion.href} variante="oscuro" tamano="mediano" style={{ alignSelf: 'center', marginTop: 4 }} />
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Cargando
// ---------------------------------------------------------------------------

export function Cargando({ texto, style }: { texto?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }, style]}>
      <ActivityIndicator color={color.texto} />
      {texto ? <Texto variante="ayuda">{texto}</Texto> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Avatar (iniciales)
// ---------------------------------------------------------------------------

export interface PropsAvatar {
  /** Iniciales (usa iniciales() de src/datos/formato). */
  texto: string;
  /** 64 (perfil), 48 (titular en el match), 40 (listas). */
  tamano?: number;
  forma?: 'circulo' | 'cuadrado';
  tono?: 'oscuro' | 'claro' | 'acento';
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ texto, tamano = 48, forma = 'cuadrado', tono = 'oscuro', style }: PropsAvatar) {
  const fondo = tono === 'oscuro' ? color.oscuro : tono === 'acento' ? color.acento : color.superficieHundida;
  const letra = tono === 'oscuro' ? color.blanco : color.texto;
  return (
    <View
      aria-hidden
      style={[
        {
          width: tamano,
          height: tamano,
          borderRadius: forma === 'circulo' ? tamano / 2 : Math.round(tamano * 0.29),
          backgroundColor: fondo,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Text style={{ ...fuente(700), fontSize: Math.round(tamano * 0.31), color: letra }}>{texto}</Text>
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

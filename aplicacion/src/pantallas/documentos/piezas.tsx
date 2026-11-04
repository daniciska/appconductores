// Piezas visuales propias del grupo "documentos" (Inicio, Perfil y pantallas de documentos).
// Replican medidas de las maquetas que el sistema de diseño no trae tal cual.
import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  Avatar,
  Insignia,
  ZonaInterruptor,
  Presionable,
  Texto,
  Titulo,
  color,
  duracion,
  fuente,
  radio,
  tipo,
  type LucideIcon,
  type PropsInsignia,
} from '@/ui';
import { Check } from '@/ui/iconos';

/** Gris claro sobre fondo oscuro (textos secundarios en la tarjeta negra). */
export const GRIS_SOBRE_OSCURO = '#BDBDBD';
/** Fondo de la barra de avance sobre la tarjeta negra. */
export const PISTA_OSCURA = '#3D3D3D';

// ---------------------------------------------------------------------------
// Saludo: "Hola, Daniel" + insignia + avatar (Inicio)
// ---------------------------------------------------------------------------

export function Saludo({
  nombre,
  iniciales,
  insignia,
  onAvatar,
}: {
  nombre: string;
  iniciales: string;
  insignia?: PropsInsignia;
  onAvatar?: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: insignia ? 'flex-start' : 'center', justifyContent: 'space-between', paddingHorizontal: 4, gap: 12 }}>
      <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 2 }}>
        <Texto variante="secundario" tono="secundario">
          Hola,
        </Texto>
        <Text
          role="heading"
          aria-level={1}
          numberOfLines={1}
          style={{ fontFamily: 'Sora_700Bold', fontSize: 24, lineHeight: 30, letterSpacing: -0.3, color: color.texto }}>
          {nombre}
        </Text>
        {insignia ? <Insignia {...insignia} style={[{ marginTop: 6 }, insignia.style]} /> : null}
      </View>
      <Presionable role="button" aria-label="Mi perfil" onPress={onAvatar} disabled={!onAvatar} style={{ marginTop: insignia ? 2 : 0 }}>
        <Avatar texto={iniciales} tamano={48} forma="circulo" />
      </Presionable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta negra y barra de avance
// ---------------------------------------------------------------------------

export function TarjetaOscura({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: color.oscuro, borderRadius: radio.tarjeta, padding: 20, gap: 14 }, style]}>{children}</View>
  );
}

/** Barra de 6 px que se llena con una animación suave. */
export function BarraAvance({
  valor,
  etiqueta,
  maximo,
  actual,
  pista = PISTA_OSCURA,
}: {
  /** 0 a 1. */
  valor: number;
  etiqueta: string;
  maximo: number;
  actual: number;
  pista?: string;
}) {
  const ancho = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(ancho, { toValue: Math.max(0, Math.min(1, valor)), duration: duracion.lenta, useNativeDriver: false }).start();
  }, [valor, ancho]);
  return (
    <View
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={maximo}
      aria-valuenow={actual}
      style={{ height: 6, borderRadius: 3, backgroundColor: pista, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: color.acento,
          width: ancho.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta "Disponible para trabajar" (Inicio y Perfil)
// ---------------------------------------------------------------------------

export function FilaDisponible({
  valor,
  onCambiar,
  diasReconfirmar,
}: {
  valor: boolean;
  onCambiar: (v: boolean) => void;
  diasReconfirmar: number;
}) {
  return (
    <ZonaInterruptor
      valor={valor}
      onCambiar={onCambiar}
      etiquetaAccesible="Disponible para trabajar"
      style={{ justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[fuente(700), { fontSize: 16, lineHeight: 22, color: color.texto }]}>Disponible para trabajar</Text>
        <Texto variante="ayuda">
          {valor ? `Te pediremos confirmarlo cada ${diasReconfirmar} días.` : 'En pausa: no apareces en los matches.'}
        </Texto>
      </View>
    </ZonaInterruptor>
  );
}

export function TarjetaDisponible(props: { valor: boolean; onCambiar: (v: boolean) => void; diasReconfirmar: number }) {
  return (
    <View
      style={{
        backgroundColor: color.superficie,
        borderWidth: 1,
        borderColor: color.borde,
        borderRadius: radio.tarjeta,
        paddingVertical: 16,
        paddingHorizontal: 18,
      }}>
      <FilaDisponible {...props} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta blanca simple y cuadro con ícono
// ---------------------------------------------------------------------------

export function Caja({
  children,
  style,
  padding = 18,
  gap = 12,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  gap?: number;
}) {
  return (
    <View style={[{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, padding, gap }, style]}>
      {children}
    </View>
  );
}

export function CuadroIcono({
  icono: Icono,
  fondo = color.fondo,
  colorIcono = color.texto,
  tamano = 40,
  redondo,
  tamanoIcono = 20,
  grosor = 2,
}: {
  icono: LucideIcon;
  fondo?: string;
  colorIcono?: string;
  tamano?: number;
  redondo?: boolean;
  tamanoIcono?: number;
  grosor?: number;
}) {
  return (
    <View
      aria-hidden
      style={{
        width: tamano,
        height: tamano,
        borderRadius: redondo ? tamano / 2 : 12,
        backgroundColor: fondo,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
      <Icono size={tamanoIcono} color={colorIcono} strokeWidth={grosor} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pasos numerados ("Cómo obtenerla", "Qué pasa ahora")
// ---------------------------------------------------------------------------

export interface PasoNumerado {
  texto: string;
  /** Se pinta en verde con un check (para pasos que ya ocurrieron). */
  hecho?: boolean;
}

function CirculoPaso({ n, hecho }: { n: number; hecho?: boolean }) {
  const fundido = useRef(new Animated.Value(hecho ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(fundido, { toValue: hecho ? 1 : 0, duration: duracion.normal, useNativeDriver: false }).start();
  }, [hecho, fundido]);
  return (
    <Animated.View
      aria-hidden
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: fundido.interpolate({ inputRange: [0, 1], outputRange: [color.oscuro, color.exitoFondo] }),
      }}>
      {hecho ? (
        <Check size={15} color={color.exito} strokeWidth={2.8} />
      ) : (
        <Text style={[fuente(700), { fontSize: 13, color: color.blanco }]}>{n}</Text>
      )}
    </Animated.View>
  );
}

export function PasosNumerados({ titulo, pasos }: { titulo: string; pasos: PasoNumerado[] }) {
  return (
    <Caja gap={16} style={{ paddingBottom: 20 }}>
      <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 17, lineHeight: 22, color: color.texto }]}>
        {titulo}
      </Text>
      <View role="list" style={{ gap: 14 }}>
        {pasos.map((p, i) => (
          <View
            key={i}
            role="listitem"
            aria-label={p.hecho ? `Listo: ${p.texto}` : undefined}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <CirculoPaso n={i + 1} hecho={p.hecho} />
            <Text style={[tipo.cuerpo, { flex: 1, lineHeight: 22, color: color.textoSuave, paddingTop: 3 }]}>{p.texto}</Text>
          </View>
        ))}
      </View>
    </Caja>
  );
}

// ---------------------------------------------------------------------------
// Nota corta con ícono (candado, info, campana)
// ---------------------------------------------------------------------------

export function Nota({
  icono: Icono,
  children,
  centrada,
  tono = 'secundario',
  style,
}: {
  icono: LucideIcon;
  children: ReactNode;
  centrada?: boolean;
  tono?: 'secundario' | 'suave';
  style?: StyleProp<ViewStyle>;
}) {
  const tinta = tono === 'suave' ? color.textoSuave : color.textoSecundario;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 4 }, centrada && { justifyContent: 'center' }, style]}>
      <View style={{ paddingTop: 1 }}>
        <Icono size={16} color={tono === 'suave' ? color.textoSuave : color.textoSecundario} strokeWidth={2} />
      </View>
      <Text style={[tipo.ayuda, { lineHeight: 19, color: tinta, flexShrink: 1 }]}>{children}</Text>
    </View>
  );
}

/** Caja amarilla clara con ícono (requisito del documento: "Debe tener 30 días o menos…"). */
export function AvisoAmarillo({ icono: Icono, texto }: { icono: LucideIcon; texto: string }) {
  return (
    <View style={{ backgroundColor: color.amarilloFondo, borderRadius: radio.campo, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icono size={20} color={color.amarilloTexto} strokeWidth={2} />
      <Text style={[fuente(600), { flex: 1, fontSize: 14, lineHeight: 20, color: color.amarilloTexto }]}>{texto}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Encabezado de pantalla con título grande y subtítulo (E2, E3, C1, C4, E5)
// ---------------------------------------------------------------------------

export function TituloPantalla({ titulo, subtitulo, arriba }: { titulo: string; subtitulo?: ReactNode; arriba?: ReactNode }) {
  return (
    <View style={{ marginTop: 8, gap: 6, alignItems: 'flex-start' }}>
      {arriba}
      <Titulo>{titulo}</Titulo>
      {subtitulo ? (
        <Texto variante="parrafo" tono="secundario">
          {subtitulo}
        </Texto>
      ) : null}
    </View>
  );
}

/** Pastilla gris 13 px ("Documento 3 de 4"). */
export function Pastilla({ texto }: { texto: string }) {
  return (
    <View style={{ backgroundColor: color.superficieHundida, borderRadius: radio.insignia, paddingHorizontal: 9, paddingVertical: 5 }}>
      <Text style={[fuente(700), { fontSize: 13, lineHeight: 17, color: color.textoSuave }]}>{texto}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Botón rojo sólido (E5 "Eliminar mi cuenta"): el sistema trae "peligro" en rojo claro.
// ---------------------------------------------------------------------------

export function BotonRojo({ titulo, onPress, cargando }: { titulo: string; onPress: () => void; cargando?: boolean }) {
  return (
    <Presionable
      role="button"
      aria-label={titulo}
      aria-busy={cargando}
      disabled={cargando}
      efecto="escala"
      onPress={onPress}
      style={{ minHeight: 56, borderRadius: radio.boton, backgroundColor: color.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
      {cargando ? <ActivityIndicator color={color.blanco} /> : <Text style={[tipo.boton, { color: color.blanco }]}>{titulo}</Text>}
    </Presionable>
  );
}

/** Botón de texto en negrita sin subrayado ("Cancelar" bajo un botón grande). */
export function BotonTextoSimple({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  return (
    <Presionable role="button" aria-label={titulo} onPress={onPress} style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[fuente(700), { fontSize: 15, color: color.texto }]}>{titulo}</Text>
    </Presionable>
  );
}

/**
 * Botón con borde negro cuyo texto puede ocupar dos líneas (el Boton del sistema corta a una línea),
 * como "No estoy de acuerdo: pedir otra revisión" (15 px en la maqueta).
 */
export function BotonContornoLargo({ titulo, onPress, cargando, deshabilitado }: { titulo: string; onPress: () => void; cargando?: boolean; deshabilitado?: boolean }) {
  const apagado = cargando || deshabilitado;
  return (
    <Presionable
      role="button"
      aria-label={titulo}
      aria-busy={cargando}
      aria-disabled={apagado}
      disabled={apagado}
      efecto="escala"
      onPress={onPress}
      style={{
        minHeight: 56,
        borderRadius: radio.boton,
        backgroundColor: color.superficie,
        borderWidth: 1.5,
        borderColor: deshabilitado ? color.bordeCampo : color.bordeFuerte,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}>
      {cargando ? (
        <ActivityIndicator color={color.texto} />
      ) : (
        <Text style={[fuente(700), { fontSize: 15, lineHeight: 20, textAlign: 'center', color: deshabilitado ? color.textoDeshabilitado : color.texto }]}>{titulo}</Text>
      )}
    </Presionable>
  );
}

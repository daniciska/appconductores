// Controles: botones, campos, chips, casillas, radios, interruptor, stepper y control segmentado.
import { useEffect, useRef, useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { router, type Href } from 'expo-router';

import { Check, Minus, Plus, type LucideIcon } from './iconos';
import { Texto } from './texto';
import { alto, color, duracion, fuente, radio, tipo } from './tokens';

type EstadoPresion = PressableStateCallbackType & { hovered?: boolean };

// ---------------------------------------------------------------------------
// Presionable: Pressable con respuesta sutil al tocar (y al pasar el mouse en web)
// ---------------------------------------------------------------------------

export interface PropsPresionable extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle> | ((estado: EstadoPresion) => StyleProp<ViewStyle>);
  children?: ReactNode | ((estado: EstadoPresion) => ReactNode);
  /** 'opacidad' (por defecto), 'escala' (botones grandes) o 'ninguno'. */
  efecto?: 'opacidad' | 'escala' | 'ninguno';
  /** Navega a esta ruta al tocar (si no hay onPress). */
  href?: Href;
}

export function Presionable({ style, children, efecto = 'opacidad', disabled, href, onPress, ...resto }: PropsPresionable) {
  return (
    <Pressable
      {...resto}
      disabled={disabled}
      onPress={onPress ?? (href ? () => router.push(href) : undefined)}
      style={(estado: EstadoPresion) => {
        const propio = typeof style === 'function' ? style(estado) : style;
        const activo = !disabled && efecto !== 'ninguno';
        return [
          propio,
          activo && estado.hovered && !estado.pressed && { opacity: 0.92 },
          activo && estado.pressed && (efecto === 'escala' ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : { opacity: 0.7 }),
        ];
      }}>
      {children as PressableProps['children']}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Boton
// ---------------------------------------------------------------------------

export type VarianteBoton = 'principal' | 'oscuro' | 'contorno' | 'suave' | 'texto' | 'peligro';

export interface PropsBoton {
  titulo: string;
  onPress?: () => void;
  /** Navega a esta ruta (si no hay onPress). */
  href?: Href;
  /**
   * 'principal' amarillo (acción destacada, ej. "Escribir mensaje") · 'oscuro' casi negro ("Continuar") ·
   * 'contorno' borde negro ("Guardar y terminar después") · 'suave' gris claro · 'texto' sin fondo · 'peligro' rojo.
   */
  variante?: VarianteBoton;
  /** 'grande' 56 px (ancho completo) · 'mediano' 44 px (ej. "Ver >"). */
  tamano?: 'grande' | 'mediano';
  icono?: LucideIcon;
  iconoDerecha?: LucideIcon;
  deshabilitado?: boolean;
  cargando?: boolean;
  anchoCompleto?: boolean;
  etiquetaAccesible?: string;
  style?: StyleProp<ViewStyle>;
}

const ESTILO_BOTON: Record<VarianteBoton, { fondo: string; texto: string; borde?: string }> = {
  principal: { fondo: color.acento, texto: color.texto },
  oscuro: { fondo: color.oscuro, texto: color.blanco },
  contorno: { fondo: color.superficie, texto: color.texto, borde: color.bordeFuerte },
  suave: { fondo: color.superficieHundida, texto: color.texto },
  texto: { fondo: 'transparent', texto: color.texto },
  peligro: { fondo: color.errorFondo, texto: color.error },
};

export function Boton({
  titulo,
  onPress,
  href,
  variante = 'oscuro',
  tamano = 'grande',
  icono: Icono,
  iconoDerecha: IconoDerecha,
  deshabilitado,
  cargando,
  anchoCompleto,
  etiquetaAccesible,
  style,
}: PropsBoton) {
  const e = ESTILO_BOTON[variante];
  const grande = tamano === 'grande';
  const apagado = deshabilitado || cargando;
  const colorTexto = deshabilitado && variante !== 'texto' ? color.textoDeshabilitado : e.texto;
  return (
    <Presionable
      role="button"
      aria-label={etiquetaAccesible ?? titulo}
      aria-disabled={apagado}
      aria-busy={cargando}
      disabled={apagado}
      onPress={onPress}
      href={href}
      efecto={grande ? 'escala' : 'opacidad'}
      style={[
        estilos.boton,
        {
          minHeight: grande ? alto.boton : alto.tactil,
          borderRadius: grande ? radio.boton : radio.boton44,
          paddingHorizontal: grande ? 20 : 18,
          backgroundColor: deshabilitado && variante !== 'texto' ? color.superficieHundida : e.fondo,
          borderWidth: e.borde ? 1.5 : 0,
          borderColor: deshabilitado ? color.bordeCampo : e.borde,
          alignSelf: anchoCompleto === false || (!grande && anchoCompleto !== true) ? 'flex-start' : 'stretch',
        },
        style,
      ]}>
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <>
          {Icono && <Icono size={grande ? 18 : 16} color={colorTexto} strokeWidth={2.2} />}
          <Text
            numberOfLines={1}
            style={[
              grande ? tipo.boton : tipo.botonChico,
              { color: colorTexto },
              variante === 'texto' && { textDecorationLine: 'underline' },
            ]}>
            {titulo}
          </Text>
          {IconoDerecha && <IconoDerecha size={grande ? 18 : 16} color={colorTexto} strokeWidth={2.2} />}
        </>
      )}
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// BotonIcono (volver, favorito, cerrar)
// ---------------------------------------------------------------------------

export interface PropsBotonIcono {
  icono: LucideIcon;
  etiquetaAccesible: string;
  onPress?: () => void;
  href?: Href;
  /** 'borde' blanco con borde (volver) · 'suave' gris claro · 'acento' amarillo claro (favorito marcado) · 'oscuro'. */
  variante?: 'borde' | 'suave' | 'acento' | 'oscuro' | 'transparente';
  /** Rellena el ícono (la estrella del favorito). */
  relleno?: boolean;
  colorIcono?: string;
  tamano?: number;
  style?: StyleProp<ViewStyle>;
}

export function BotonIcono({
  icono: Icono,
  etiquetaAccesible,
  onPress,
  href,
  variante = 'borde',
  relleno,
  colorIcono,
  tamano = 44,
  style,
}: PropsBotonIcono) {
  const fondo =
    variante === 'borde'
      ? color.superficie
      : variante === 'suave'
        ? color.fondo
        : variante === 'acento'
          ? color.acentoSuave
          : variante === 'oscuro'
            ? color.oscuro
            : 'transparent';
  const trazo =
    colorIcono ?? (variante === 'acento' ? color.acentoTrazo : variante === 'oscuro' ? color.blanco : color.texto);
  return (
    <Presionable
      role="button"
      aria-label={etiquetaAccesible}
      onPress={onPress}
      href={href}
      style={[
        {
          width: tamano,
          height: tamano,
          borderRadius: radio.boton44,
          backgroundColor: fondo,
          borderWidth: variante === 'borde' ? 1 : 0,
          borderColor: color.borde,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Icono size={20} color={trazo} strokeWidth={relleno ? 1.6 : 2} fill={relleno ? color.acento : 'none'} />
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// Campo de texto
// ---------------------------------------------------------------------------

export interface PropsCampo extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText' | 'editable'> {
  etiqueta?: string;
  /** Muestra el asterisco rojo. */
  obligatorio?: boolean;
  /** Texto gris junto a la etiqueta, ej. "(si tienes)" u "(opcional)". */
  notaEtiqueta?: string;
  valor: string;
  onCambiar: (texto: string) => void;
  /** Ayuda gris bajo el campo. */
  ayuda?: string;
  /** Mensaje de error (borde rojo + texto rojo). `true` marca en rojo sin texto. */
  error?: string | boolean;
  /** Texto fijo a la izquierda, ej. "+56 9". */
  prefijo?: string;
  icono?: LucideIcon;
  /** Algo a la derecha dentro del campo (ej. un botón). */
  derecha?: ReactNode;
  multilinea?: boolean;
  deshabilitado?: boolean;
  /** Muestra "n/max" bajo el campo cuando hay maxLength. */
  contador?: boolean;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
  style?: StyleProp<ViewStyle>;
}

export function Campo({
  etiqueta,
  obligatorio,
  notaEtiqueta,
  valor,
  onCambiar,
  ayuda,
  error,
  prefijo,
  icono: Icono,
  derecha,
  multilinea,
  deshabilitado,
  contador,
  inputRef,
  style,
  maxLength,
  onFocus,
  onBlur,
  ...resto
}: PropsCampo) {
  const [foco, setFoco] = useState(false);
  const hayError = !!error;
  const borde = hayError
    ? { borderWidth: 1.5, borderColor: color.error }
    : foco
      ? { borderWidth: 1.5, borderColor: color.bordeFuerte }
      : { borderWidth: 1, borderColor: color.bordeCampo };
  return (
    <View style={[{ gap: 8 }, style]}>
      {etiqueta ? (
        <Text style={[tipo.etiqueta, { color: color.texto }]}>
          {etiqueta}
          {notaEtiqueta ? <Text style={[fuente(500), { color: color.textoSecundario }]}> {notaEtiqueta}</Text> : null}
          {obligatorio ? (
            <Text aria-hidden style={{ color: color.error }}>
              {' '}
              *
            </Text>
          ) : null}
        </Text>
      ) : null}
      <View
        style={[
          estilos.campo,
          borde,
          multilinea && { minHeight: 112, alignItems: 'flex-start', paddingVertical: 12 },
          deshabilitado && { backgroundColor: color.fondo },
        ]}>
        {Icono ? <Icono size={20} color={color.texto} strokeWidth={2} /> : null}
        {prefijo ? <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{prefijo}</Text> : null}
        <TextInput
          ref={inputRef}
          {...resto}
          value={valor}
          onChangeText={onCambiar}
          editable={!deshabilitado}
          multiline={multilinea}
          maxLength={maxLength}
          aria-label={resto['aria-label'] ?? etiqueta}
          aria-required={obligatorio}
          aria-invalid={hayError}
          placeholderTextColor={color.textoDeshabilitado}
          onFocus={(e) => {
            setFoco(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            onBlur?.(e);
          }}
          style={[
            tipo.cuerpo,
            {
              flex: 1,
              minWidth: 0,
              color: deshabilitado ? color.textoSecundario : color.texto,
              paddingVertical: 0,
              minHeight: multilinea ? 88 : 48,
              textAlignVertical: multilinea ? 'top' : 'center',
            },
            { outlineStyle: 'none' } as object,
          ]}
        />
        {derecha}
      </View>
      {typeof error === 'string' && error ? (
        <Text role="alert" style={[tipo.ayuda, fuente(600), { color: color.error }]}>
          {error}
        </Text>
      ) : null}
      {ayuda && !(typeof error === 'string' && error) ? <Texto variante="ayuda">{ayuda}</Texto> : null}
      {contador && maxLength ? (
        <Texto variante="pequeno" style={{ textAlign: 'right' }}>
          {valor.length}/{maxLength}
        </Texto>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Chip (pastilla seleccionable con check) — clases de licencia, idiomas, zonas, filtros
// ---------------------------------------------------------------------------

export interface PropsChip {
  etiqueta: string;
  seleccionado: boolean;
  onPress?: () => void;
  /** Segunda línea gris (como en "Tu experiencia"). */
  subtitulo?: string;
  deshabilitado?: boolean;
  /** 'pastilla' redonda (por defecto) · 'cuadrado' (días: Lu Ma Mi…). */
  forma?: 'pastilla' | 'cuadrado';
  /** Para elección única (filtros) usa 'radio'; por defecto 'checkbox'. */
  rol?: 'checkbox' | 'radio' | 'button';
  etiquetaAccesible?: string;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  etiqueta,
  seleccionado,
  onPress,
  subtitulo,
  deshabilitado,
  forma = 'pastilla',
  rol = 'checkbox',
  etiquetaAccesible,
  style,
}: PropsChip) {
  const cuadrado = forma === 'cuadrado';
  return (
    <Presionable
      role={rol}
      aria-checked={rol === 'button' ? undefined : seleccionado}
      aria-pressed={rol === 'button' ? seleccionado : undefined}
      aria-label={etiquetaAccesible ?? etiqueta}
      aria-disabled={deshabilitado}
      disabled={deshabilitado}
      onPress={onPress}
      style={[
        {
          minHeight: cuadrado ? 48 : subtitulo ? 52 : alto.tactil,
          minWidth: cuadrado ? 0 : 52,
          borderRadius: cuadrado ? radio.campo : subtitulo ? 26 : radio.pastilla,
          paddingHorizontal: cuadrado ? 0 : seleccionado ? 14 : 16,
          paddingVertical: subtitulo ? 7 : 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: cuadrado ? 'center' : 'flex-start',
          gap: 6,
          borderWidth: 1,
          borderColor: seleccionado ? color.oscuro : color.bordeCampo,
          backgroundColor: deshabilitado ? color.fondo : seleccionado ? color.oscuro : color.superficie,
        },
        style,
      ]}>
      {seleccionado && !cuadrado ? <Check size={14} color={color.blanco} strokeWidth={2.8} /> : null}
      <View style={{ minWidth: 0, flexShrink: 1 }}>
        <Text
          style={[
            cuadrado ? tipo.botonChico : { ...fuente(seleccionado ? 700 : 600), fontSize: subtitulo ? 15 : 14, lineHeight: 19 },
            { color: deshabilitado ? color.textoDeshabilitado : seleccionado ? color.blanco : color.texto },
            cuadrado && { textAlign: 'center' },
          ]}>
          {etiqueta}
        </Text>
        {subtitulo ? (
          <Text style={[tipo.pequeno, { color: seleccionado ? '#CFCFCF' : color.textoSecundario }]}>{subtitulo}</Text>
        ) : null}
      </View>
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// Casilla y FilaCheck (fila con casilla, como los negocios del Paso 4)
// ---------------------------------------------------------------------------

export function Casilla({ marcada, deshabilitada }: { marcada: boolean; deshabilitada?: boolean }) {
  return (
    <View
      aria-hidden
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: marcada ? 0 : 1.5,
        borderColor: deshabilitada ? color.bordeCampo : '#8A8A8A',
        backgroundColor: marcada ? color.oscuro : deshabilitada ? color.fondo : color.superficie,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {marcada ? <Check size={14} color={color.blanco} strokeWidth={3} /> : null}
    </View>
  );
}

export interface PropsFilaCheck {
  titulo: string;
  /** Ejemplo en gris entre paréntesis, ej. "radiotaxi, aeropuerto". */
  ejemplo?: string | null;
  descripcion?: string;
  marcada: boolean;
  onPress?: () => void;
  deshabilitada?: boolean;
  /** Pastilla gris a la derecha cuando está deshabilitada, ej. "Pide licencia A3". */
  nota?: string;
  style?: StyleProp<ViewStyle>;
}

export function FilaCheck({ titulo, ejemplo, descripcion, marcada, onPress, deshabilitada, nota, style }: PropsFilaCheck) {
  return (
    <Presionable
      role="checkbox"
      aria-checked={marcada}
      aria-disabled={deshabilitada}
      aria-label={ejemplo ? `${titulo} (${ejemplo})` : titulo}
      disabled={deshabilitada}
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: alto.campo,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: radio.campo,
          backgroundColor: deshabilitada ? color.fondo : color.superficie,
          borderWidth: marcada ? 1.5 : 1,
          borderColor: marcada ? color.bordeFuerte : color.borde,
        },
        style,
      ]}>
      <Casilla marcada={marcada} deshabilitada={deshabilitada} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text
          style={[
            tipo.cuerpo,
            fuente(marcada ? 600 : 500),
            { color: deshabilitada ? color.textoDeshabilitado : color.texto },
          ]}>
          {titulo}
          {ejemplo ? (
            <Text style={[fuente(500), { color: deshabilitada ? color.textoDeshabilitadoSuave : color.textoSecundario }]}>
              {' '}
              ({ejemplo})
            </Text>
          ) : null}
        </Text>
        {descripcion ? <Texto variante="ayuda">{descripcion}</Texto> : null}
      </View>
      {nota ? (
        <View style={{ backgroundColor: color.superficieHundida, borderRadius: radio.insignia, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={[tipo.pequeno, fuente(700), { color: color.textoSecundario }]}>{nota}</Text>
        </View>
      ) : null}
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// FilaRadio (elección única con descripción, como "Quién ve tu oferta")
// ---------------------------------------------------------------------------

export interface PropsFilaRadio {
  titulo: string;
  descripcion?: string;
  seleccionada: boolean;
  onPress?: () => void;
  deshabilitada?: boolean;
  /** Algo a la derecha o debajo (ej. una insignia "Plan Flota"). */
  extra?: ReactNode;
  /** Contenido que aparece debajo cuando está seleccionada (ej. las condiciones de "Conductores que tú elijas"). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function FilaRadio({ titulo, descripcion, seleccionada, onPress, deshabilitada, extra, children, style }: PropsFilaRadio) {
  return (
    <View
      style={[
        {
          borderRadius: radio.boton,
          backgroundColor: deshabilitada ? color.fondo : color.superficie,
          borderWidth: seleccionada ? 1.5 : 1,
          borderColor: seleccionada ? color.bordeFuerte : color.borde,
          overflow: 'hidden',
        },
        style,
      ]}>
      <Presionable
        role="radio"
        aria-checked={seleccionada}
        aria-disabled={deshabilitada}
        disabled={deshabilitada}
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
        <View
          aria-hidden
          style={{
            width: 22,
            height: 22,
            marginTop: 1,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: seleccionada ? color.oscuro : color.interruptorApagado,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: seleccionada ? color.oscuro : 'transparent' }} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text
            style={[
              tipo.cuerpo,
              fuente(seleccionada ? 700 : 600),
              { color: deshabilitada ? color.textoSecundario : color.texto },
            ]}>
            {titulo}
          </Text>
          {descripcion ? <Texto variante="ayuda">{descripcion}</Texto> : null}
          {extra}
        </View>
      </Presionable>
      {seleccionada && children ? <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>{children}</View> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// OpcionIcono (tarjeta con ícono, como los turnos Día / Noche)
// ---------------------------------------------------------------------------

export interface PropsOpcionIcono {
  titulo: string;
  icono: LucideIcon;
  seleccionada: boolean;
  onPress?: () => void;
  subtitulo?: string;
  style?: StyleProp<ViewStyle>;
}

export function OpcionIcono({ titulo, icono: Icono, seleccionada, onPress, subtitulo, style }: PropsOpcionIcono) {
  return (
    <Presionable
      role="checkbox"
      aria-checked={seleccionada}
      aria-label={titulo}
      onPress={onPress}
      style={[
        {
          flex: 1,
          minHeight: 64,
          borderRadius: radio.campo,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: color.superficie,
          borderWidth: seleccionada ? 1.5 : 1,
          borderColor: seleccionada ? color.bordeFuerte : color.borde,
        },
        style,
      ]}>
      <View
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: radio.icono,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: seleccionada ? color.oscuro : color.fondo,
        }}>
        <Icono size={20} color={seleccionada ? color.acento : color.textoSecundario} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[tipo.cuerpo, fuente(seleccionada ? 700 : 500), { color: color.texto }]}>{titulo}</Text>
        {subtitulo ? <Texto variante="pequeno">{subtitulo}</Texto> : null}
      </View>
      {seleccionada ? <Check size={18} color={color.texto} strokeWidth={2.6} /> : null}
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// Interruptor (52 × 32, verde encendido)
// ---------------------------------------------------------------------------

export interface PropsInterruptor {
  valor: boolean;
  onCambiar: (valor: boolean) => void;
  etiquetaAccesible: string;
  deshabilitado?: boolean;
  /** Solo el dibujo (sin zona táctil propia): lo usa ZonaInterruptor, donde toda la fila se toca. */
  soloVisual?: boolean;
}

function DibujoInterruptor({ valor, deshabilitado }: { valor: boolean; deshabilitado?: boolean }) {
  const pos = useRef(new Animated.Value(valor ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(pos, { toValue: valor ? 1 : 0, duration: duracion.rapida, useNativeDriver: false }).start();
  }, [valor, pos]);
  return (
    <Animated.View
      style={{
        width: 52,
        height: 32,
        borderRadius: 16,
        opacity: deshabilitado ? 0.5 : 1,
        backgroundColor: pos.interpolate({ inputRange: [0, 1], outputRange: [color.interruptorApagado, color.exito] }),
      }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 3,
          left: pos.interpolate({ inputRange: [0, 1], outputRange: [3, 23] }),
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: color.blanco,
        }}
      />
    </Animated.View>
  );
}

/** Interruptor de 52 × 32 con zona táctil de 52 × 44 (sin cambiar el espacio que ocupa). */
export function Interruptor({ valor, onCambiar, etiquetaAccesible, deshabilitado, soloVisual }: PropsInterruptor) {
  if (soloVisual) {
    return (
      <View aria-hidden>
        <DibujoInterruptor valor={valor} deshabilitado={deshabilitado} />
      </View>
    );
  }
  return (
    <Pressable
      role="switch"
      aria-checked={valor}
      aria-label={etiquetaAccesible}
      aria-disabled={deshabilitado}
      disabled={deshabilitado}
      onPress={() => onCambiar(!valor)}
      style={{ paddingVertical: 6, marginVertical: -6 }}>
      <DibujoInterruptor valor={valor} deshabilitado={deshabilitado} />
    </Pressable>
  );
}

/**
 * Fila entera que prende y apaga: el texto también se puede tocar. El interruptor va al final.
 * Ej.: <ZonaInterruptor valor={v} onCambiar={set} etiquetaAccesible="Disponible para trabajar" style={...}>{textos}</ZonaInterruptor>
 */
export function ZonaInterruptor({
  valor,
  onCambiar,
  etiquetaAccesible,
  deshabilitado,
  style,
  children,
}: {
  valor: boolean;
  onCambiar: (v: boolean) => void;
  etiquetaAccesible: string;
  deshabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <Presionable
      role="switch"
      aria-checked={valor}
      aria-label={etiquetaAccesible}
      aria-disabled={deshabilitado}
      disabled={deshabilitado}
      efecto="ninguno"
      onPress={() => onCambiar(!valor)}
      style={[{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }, style]}>
      {children}
      <Interruptor soloVisual valor={valor} onCambiar={onCambiar} etiquetaAccesible={etiquetaAccesible} deshabilitado={deshabilitado} />
    </Presionable>
  );
}

/** Tarjeta con título, ayuda e interruptor (ej. "Disponible para trabajar"). Toda la tarjeta se puede tocar. */
export function FilaInterruptor({
  titulo,
  ayuda,
  valor,
  onCambiar,
  deshabilitado,
  style,
}: {
  titulo: string;
  ayuda?: string;
  valor: boolean;
  onCambiar: (v: boolean) => void;
  deshabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ZonaInterruptor
      valor={valor}
      onCambiar={onCambiar}
      etiquetaAccesible={titulo}
      deshabilitado={deshabilitado}
      style={[
        {
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.campo,
          minHeight: 64,
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        },
        style,
      ]}>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[tipo.fuerte, { color: color.texto }]}>{titulo}</Text>
        {ayuda ? <Texto variante="ayuda">{ayuda}</Texto> : null}
      </View>
    </ZonaInterruptor>
  );
}

// ---------------------------------------------------------------------------
// Stepper (− n +)
// ---------------------------------------------------------------------------

export interface PropsStepper {
  valor: number;
  onCambiar: (valor: number) => void;
  min?: number;
  max?: number;
  deshabilitado?: boolean;
  /** Para lectores de pantalla, ej. "años en Vehículo liviano". */
  etiquetaAccesible: string;
  sufijo?: string;
}

export function Stepper({ valor, onCambiar, min = 0, max = 50, deshabilitado, etiquetaAccesible, sufijo }: PropsStepper) {
  const boton = (signo: 'menos' | 'mas') => {
    const bloqueado = deshabilitado || (signo === 'menos' ? valor <= min : valor >= max);
    const Icono = signo === 'menos' ? Minus : Plus;
    return (
      <Presionable
        role="button"
        aria-label={`${signo === 'menos' ? 'Restar' : 'Sumar'} uno: ${etiquetaAccesible}`}
        aria-disabled={bloqueado}
        disabled={bloqueado}
        onPress={() => onCambiar(Math.min(max, Math.max(min, valor + (signo === 'menos' ? -1 : 1))))}
        style={{
          width: 44,
          height: 44,
          borderRadius: radio.boton44,
          borderWidth: 1,
          // Como en las maquetas B3 y BT2: activo gris claro con borde #DDDDDD; bloqueado aún más claro.
          borderColor: bloqueado ? color.separador : color.bordeCampo,
          backgroundColor: bloqueado ? '#FAFAFA' : color.fondo,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icono size={18} color={bloqueado ? color.iconoDeshabilitado : color.texto} strokeWidth={2} />
      </Presionable>
    );
  };
  return (
    <View style={{ width: sufijo ? 156 : 132, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {boton('menos')}
      <Text
        aria-live="polite"
        style={[
          { ...fuente(700), fontSize: 17, textAlign: 'center', minWidth: 36 },
          { color: deshabilitado ? color.iconoDeshabilitado : color.texto },
        ]}>
        {valor}
        {sufijo ? <Text style={[tipo.pequeno, { color: color.textoSecundario }]}> {sufijo}</Text> : null}
      </Text>
      {boton('mas')}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Control segmentado ("Todos · 3 | Favoritos · 1")
// ---------------------------------------------------------------------------

export interface PropsSegmentado<T extends string> {
  opciones: { clave: T; etiqueta: string }[];
  valor: T;
  onCambiar: (clave: T) => void;
  etiquetaAccesible?: string;
  style?: StyleProp<ViewStyle>;
}

export function ControlSegmentado<T extends string>({ opciones, valor, onCambiar, etiquetaAccesible, style }: PropsSegmentado<T>) {
  return (
    <View
      role="tablist"
      aria-label={etiquetaAccesible}
      style={[
        { flexDirection: 'row', gap: 4, backgroundColor: color.segmentado, borderRadius: radio.campo, padding: 4 },
        style,
      ]}>
      {opciones.map((o) => {
        const activa = o.clave === valor;
        return (
          <Presionable
            key={o.clave}
            role="tab"
            aria-selected={activa}
            onPress={() => onCambiar(o.clave)}
            style={[
              { flex: 1, minHeight: 40, borderRadius: radio.icono, alignItems: 'center', justifyContent: 'center' },
              activa && { backgroundColor: color.superficie },
              activa && { boxShadow: '0 1px 2px rgba(17,17,17,0.06)' } as object,
            ]}>
            <Text style={[tipo.botonChico, fuente(activa ? 700 : 600), { color: activa ? color.texto : color.textoSecundario }]}>
              {o.etiqueta}
            </Text>
          </Presionable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: alto.campo,
    borderRadius: radio.campo,
    backgroundColor: color.superficie,
    paddingHorizontal: 16,
  },
});

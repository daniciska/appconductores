// Estructura de pantalla: columna de celular, Pantalla, Encabezado, BarraPasos, Tarjeta y listas.
import { Children, Fragment, isValidElement, useEffect, useRef, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonIcono, Presionable } from './controles';
import { ChevronLeft, ChevronRight, type LucideIcon } from './iconos';
import { Texto } from './texto';
import { ANCHO_CELULAR, alto, color, duracion, espacio, fuente, radio, sombra, tipo } from './tokens';

// ---------------------------------------------------------------------------
// MarcoCelular: en escritorio centra una columna de ~430 px (ya lo usan los layouts de conductor y titular)
// ---------------------------------------------------------------------------

export function MarcoCelular({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const ancho = width > ANCHO_CELULAR + 16;
  return (
    <View style={{ flex: 1, backgroundColor: ancho ? color.fondoEscritorio : color.fondo, alignItems: 'center' }}>
      <View
        style={[
          { flex: 1, width: '100%', maxWidth: ANCHO_CELULAR, backgroundColor: color.fondo, overflow: 'hidden' },
          ancho && sombra.columna,
        ]}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

export interface PropsPantalla {
  children: ReactNode;
  /** Con scroll (por defecto). Para que el botón final quede abajo, dale style={{ marginTop: 'auto' }}. */
  scroll?: boolean;
  /** Zona fija abajo, fuera del scroll (ej. barra para escribir un mensaje o un botón que siempre se ve). */
  pie?: ReactNode;
  /** Zona fija arriba, fuera del scroll (ej. encabezado de una conversación). Si se usa, el espacio superior va en ella. */
  cabecera?: ReactNode;
  fondo?: string;
  /** Espacio entre bloques (16 por defecto, como en las maquetas). */
  separacion?: number;
  /** Espacio superior (56 por defecto, como en las maquetas). */
  superior?: number;
  /** Espacio inferior del contenido (32 por defecto; usa 24 en pestañas). */
  inferior?: number;
  /** Margen lateral (20 por defecto). Usa 0 para contenido de borde a borde. */
  lateral?: number;
  /** Anima la entrada (sube 8 px y aparece). */
  animar?: boolean;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
  propsScroll?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
  style?: StyleProp<ViewStyle>;
}

export function Pantalla({
  children,
  scroll = true,
  pie,
  cabecera,
  fondo = color.fondo,
  separacion = espacio.bloque,
  superior = espacio.superior,
  inferior = espacio.enorme,
  lateral = espacio.lateral,
  animar = true,
  scrollRef,
  propsScroll,
  style,
}: PropsPantalla) {
  const insets = useSafeAreaInsets();
  const entrada = useRef(new Animated.Value(animar ? 0 : 1)).current;
  useEffect(() => {
    if (animar) Animated.timing(entrada, { toValue: 1, duration: duracion.normal, useNativeDriver: false }).start();
  }, [animar, entrada]);

  const animado = {
    opacity: entrada,
    transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
  };
  const arriba = cabecera ? 0 : superior + insets.top;
  const contenido = (
    <Animated.View style={[{ flexGrow: 1, gap: separacion }, animado]}>{children}</Animated.View>
  );

  return (
    <View style={[{ flex: 1, width: '100%', maxWidth: ANCHO_CELULAR, alignSelf: 'center', backgroundColor: fondo }, style]}>
      {cabecera ? <View style={{ paddingTop: superior + insets.top, paddingHorizontal: lateral }}>{cabecera}</View> : null}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...propsScroll}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: arriba,
            paddingHorizontal: lateral,
            paddingBottom: (pie ? espacio.xl : inferior) + (pie ? 0 : insets.bottom),
          }}>
          {contenido}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: arriba, paddingHorizontal: lateral, paddingBottom: pie ? 0 : inferior }}>
          {contenido}
        </View>
      )}
      {pie ? (
        <View style={{ paddingHorizontal: lateral, paddingTop: espacio.l, paddingBottom: espacio.xxl + insets.bottom, gap: 10 }}>
          {pie}
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Encabezado (volver + título o "Paso n de 5" + barra de pasos)
// ---------------------------------------------------------------------------

export interface PropsEncabezado {
  /** Qué hacer al volver. Por defecto: atrás en el historial o, si no hay, ir a `volverA`. */
  onVolver?: () => void;
  /** Ruta de respaldo si no hay historial (ej. al abrir un enlace directo). */
  volverA?: Href;
  sinVolver?: boolean;
  /** Título corto centrado en la fila (ej. "Mis documentos"). */
  titulo?: string;
  /** Paso actual: muestra "Paso n de total" a la derecha y la barra de pasos debajo. */
  paso?: number;
  totalPasos?: number;
  /** Algo a la derecha (ej. el botón de favorito). */
  derecha?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function volver(volverA: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(volverA);
}

export function Encabezado({ onVolver, volverA, sinVolver, titulo, paso, totalPasos = 5, derecha, style }: PropsEncabezado) {
  return (
    <View style={[{ gap: 20 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: alto.tactil, gap: 12 }}>
        {sinVolver ? (
          <View style={{ width: 44 }} />
        ) : (
          <BotonIcono icono={ChevronLeft} etiquetaAccesible="Volver" onPress={onVolver ?? (() => volver(volverA))} />
        )}
        {titulo ? (
          <Text role="heading" aria-level={1} numberOfLines={1} style={[tipo.fuerte, { fontSize: 16, flex: 1, textAlign: 'center', color: color.texto }]}>
            {titulo}
          </Text>
        ) : null}
        {paso !== undefined ? (
          <Text style={[tipo.secundario, fuente(600), { color: color.textoSecundario }]}>
            Paso {paso} de {totalPasos}
          </Text>
        ) : (
          (derecha ?? <View style={{ width: 44 }} />)
        )}
      </View>
      {paso !== undefined ? <BarraPasos actual={paso} total={totalPasos} /> : null}
    </View>
  );
}

/** Barra de 5 segmentos: los pasos hechos y el actual en negro. */
export function BarraPasos({ actual, total = 5 }: { actual: number; total?: number }) {
  return (
    <View aria-hidden style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < actual ? color.oscuro : color.bordeCampo }} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta y listas
// ---------------------------------------------------------------------------

export interface PropsTarjeta {
  children: ReactNode;
  onPress?: () => void;
  href?: Href;
  /** Borde amarillo suave (oferta destacada). */
  destacada?: boolean;
  /** Fondo gris (ej. postulación cerrada). */
  apagada?: boolean;
  padding?: number;
  separacion?: number;
  etiquetaAccesible?: string;
  style?: StyleProp<ViewStyle>;
}

export function Tarjeta({ children, onPress, href, destacada, apagada, padding = 16, separacion = 12, etiquetaAccesible, style }: PropsTarjeta) {
  const estilo: StyleProp<ViewStyle> = [
    {
      backgroundColor: apagada ? color.fondo : color.superficie,
      borderWidth: destacada ? 1.5 : 1,
      borderColor: destacada ? color.acentoBorde : color.borde,
      borderRadius: radio.tarjeta,
      padding,
      gap: separacion,
    },
    style,
  ];
  if (onPress || href) {
    return (
      <Presionable role="button" aria-label={etiquetaAccesible} onPress={onPress} href={href} style={estilo}>
        {children}
      </Presionable>
    );
  }
  return <View style={estilo}>{children}</View>;
}

export function Separador({ sangria = 0, style }: { sangria?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: color.separador, marginLeft: sangria }, style]} />;
}

/** Intercala separadores entre los hijos (ignora los nulos). */
export function Separado({ children, sangria = 0 }: { children: ReactNode; sangria?: number }) {
  const hijos = Children.toArray(children).filter((h) => isValidElement(h));
  return (
    <>
      {hijos.map((h, i) => (
        <Fragment key={i}>
          {i > 0 ? <Separador sangria={sangria} /> : null}
          {h}
        </Fragment>
      ))}
    </>
  );
}

/** Tarjeta con filas separadas por líneas (como "Mi perfil" en E1). Sangría 44 si las filas tienen ícono. */
export function GrupoLista({ children, sangria = 44, style }: { children: ReactNode; sangria?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        { backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingHorizontal: 16, paddingVertical: 4 },
        style,
      ]}>
      <Separado sangria={sangria}>{children}</Separado>
    </View>
  );
}

export interface PropsFilaLista {
  titulo: string;
  subtitulo?: string;
  icono?: LucideIcon;
  /** Algo antes de la flecha (ej. <Insignia texto="1 vence pronto" tono="amarilla" />). */
  derecha?: ReactNode;
  onPress?: () => void;
  href?: Href;
  /** Rojo (ej. "Eliminar mi cuenta"). */
  peligro?: boolean;
  /** Muestra la flecha (por defecto, si se puede tocar). */
  flecha?: boolean;
  deshabilitada?: boolean;
}

export function FilaLista({ titulo, subtitulo, icono: Icono, derecha, onPress, href, peligro, flecha, deshabilitada }: PropsFilaLista) {
  const tocable = !!(onPress || href) && !deshabilitada;
  const contenido = (
    <>
      {Icono ? (
        <View
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: radio.icono,
            backgroundColor: peligro ? color.errorFondo : color.fondo,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icono size={18} color={peligro ? color.error : color.texto} strokeWidth={2} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[tipo.cuerpo, fuente(600), { color: peligro ? color.error : deshabilitada ? color.textoDeshabilitado : color.texto }]}>
          {titulo}
        </Text>
        {subtitulo ? <Texto variante="ayuda">{subtitulo}</Texto> : null}
      </View>
      {derecha}
      {(flecha ?? tocable) ? <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} /> : null}
    </>
  );
  const estilo: ViewStyle = { minHeight: alto.fila, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 };
  if (tocable) {
    return (
      <Presionable role="button" aria-label={titulo} onPress={onPress} href={href} style={estilo}>
        {contenido}
      </Presionable>
    );
  }
  return <View style={estilo}>{contenido}</View>;
}

/** Fila "etiqueta … valor" (como las Condiciones del match). */
export function FilaDato({ etiqueta, valor, tono }: { etiqueta: string; valor: ReactNode; tono?: 'normal' | 'exito' | 'error' }) {
  return (
    <View style={{ minHeight: alto.fila, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 8 }}>
      <Texto variante="secundario" tono="secundario">
        {etiqueta}
      </Texto>
      {typeof valor === 'string' || typeof valor === 'number' ? (
        <Text
          style={[
            tipo.cuerpo,
            fuente(600),
            { textAlign: 'right', flexShrink: 1, color: tono === 'exito' ? color.exitoTexto : tono === 'error' ? color.error : color.texto },
          ]}>
          {valor}
        </Text>
      ) : (
        valor
      )}
    </View>
  );
}

/** Empuja lo que viene después hasta el fondo de la pantalla (útil para el botón final). */
export function Empujar() {
  return <View style={{ marginTop: 'auto' }} />;
}

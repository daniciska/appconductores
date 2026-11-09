// Piezas comunes de las pantallas del panel (src/pantallas).
import { useCallback, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { ConductorVista } from '@/datos/selectores';
import {
  ANCHO_ESCRITORIO,
  BotonIcono,
  Chip,
  Insignia,
  Presionable,
  Texto,
  Titulo,
  color,
  duracion,
  fuente,
  radio,
  sombra,
  tipo,
  type LucideIcon,
} from '@/ui';
import { ChevronLeft, Hourglass, Search, X } from '@/ui/iconos';

/** Escritorio (barra lateral) y dos columnas (lista + detalle). */
export function useAnchoPanel() {
  const { width } = useWindowDimensions();
  return { escritorio: width >= ANCHO_ESCRITORIO, dosColumnas: width >= 1120, ancho: width };
}

// ---------------------------------------------------------------------------
// Tarjeta con cabecera
// ---------------------------------------------------------------------------

export function TarjetaPanel({
  titulo,
  descripcion,
  derecha,
  children,
  padding = 20,
  separacion = 16,
  style,
}: {
  titulo?: string;
  descripcion?: string;
  derecha?: ReactNode;
  children?: ReactNode;
  padding?: number;
  separacion?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        { backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, padding, gap: separacion },
        style,
      ]}>
      {titulo || derecha ? (
        <View style={{ flexDirection: 'row', alignItems: descripcion ? 'flex-start' : 'center', gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            {titulo ? <Titulo nivel="tarjeta">{titulo}</Titulo> : null}
            {descripcion ? <Texto variante="ayuda">{descripcion}</Texto> : null}
          </View>
          {derecha}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Código corto de una regla o documento (F1, M7). */
export function Codigo({ texto, oscuro }: { texto: string; oscuro?: boolean }) {
  return (
    <View
      style={{
        minWidth: 34,
        height: 26,
        paddingHorizontal: 7,
        borderRadius: radio.insignia,
        backgroundColor: oscuro ? color.oscuro : color.fondo,
        borderWidth: oscuro ? 0 : 1,
        borderColor: color.borde,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={[fuente(700), { fontSize: 12, color: oscuro ? color.acento : color.texto, letterSpacing: 0.3 }]}>{texto}</Text>
    </View>
  );
}

/** Estado del conductor en el panel. */
export function InsigniaConductor({ c }: { c: Pick<ConductorVista, 'estadoPerfil' | 'estadoVerificacion' | 'suspendido'> }) {
  if (c.suspendido) return <Insignia texto="Suspendido" tono="oscura" icono={null} />;
  switch (c.estadoVerificacion) {
    case 'verificado':
      return <Insignia texto="Verificado" tono="verde" />;
    case 'en_revision':
      return <Insignia texto="En revisión" tono="amarilla" icono={Hourglass} />;
    case 'con_observaciones':
      return <Insignia texto="Con observaciones" tono="roja" icono={null} />;
    default:
      return <Insignia texto={c.estadoPerfil === 'incompleto' ? 'Perfil incompleto' : 'Sin documentos'} tono="gris" icono={null} />;
  }
}

/** Etiqueta pequeña sobre un valor (detalle de solo lectura). */
export function Dato({ etiqueta, children, ancho = 200 }: { etiqueta: string; children: ReactNode; ancho?: number }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: ancho, minWidth: 0, gap: 4 }}>
      <Texto variante="pequeno">{etiqueta}</Texto>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Texto variante="cuerpo" peso={600}>
          {children}
        </Texto>
      ) : (
        children
      )}
    </View>
  );
}

/** Fila de datos que se reparte en columnas y baja de línea en pantallas angostas. */
export function GrillaDatos({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 16 }}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Lista + detalle
// ---------------------------------------------------------------------------

/**
 * Dos columnas en pantallas anchas (lista a la izquierda, detalle a la derecha).
 * En pantallas angostas muestra la lista o, si hay algo elegido, el detalle con "Volver".
 */
export function ListaDetalle({
  lista,
  detalle,
  hayElegido,
  onVolver,
  textoVolver = 'Volver a la lista',
  anchoLista = 380,
}: {
  lista: ReactNode;
  detalle: ReactNode;
  hayElegido: boolean;
  onVolver: () => void;
  textoVolver?: string;
  anchoLista?: number;
}) {
  const { dosColumnas } = useAnchoPanel();
  if (dosColumnas) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 20 }}>
        <View style={{ width: anchoLista, gap: 10 }}>{lista}</View>
        <View style={{ flex: 1, minWidth: 0, gap: 16 }}>{detalle}</View>
      </View>
    );
  }
  if (hayElegido) {
    return (
      <View style={{ gap: 16 }}>
        <Presionable
          role="button"
          aria-label={textoVolver}
          onPress={onVolver}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start', paddingRight: 8 }}>
          <ChevronLeft size={18} color={color.texto} strokeWidth={2.2} />
          <Texto variante="etiqueta">{textoVolver}</Texto>
        </Presionable>
        {detalle}
      </View>
    );
  }
  return <View style={{ gap: 10 }}>{lista}</View>;
}

/** Fila elegible de una lista (tarjeta blanca; negra a la izquierda si está elegida). */
export function FilaElegible({
  elegida,
  onPress,
  children,
  etiquetaAccesible,
}: {
  elegida: boolean;
  onPress: () => void;
  children: ReactNode;
  etiquetaAccesible: string;
}) {
  return (
    <Presionable
      role="button"
      aria-label={etiquetaAccesible}
      aria-pressed={elegida}
      onPress={onPress}
      style={{
        backgroundColor: color.superficie,
        borderWidth: elegida ? 1.5 : 1,
        borderColor: elegida ? color.oscuro : color.borde,
        borderRadius: radio.tarjeta - 4,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 64,
      }}>
      {children}
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// Filtros y búsqueda
// ---------------------------------------------------------------------------

export function Filtros<T extends string>({
  opciones,
  valor,
  onCambiar,
  etiquetaAccesible,
}: {
  opciones: { clave: T; etiqueta: string; cantidad?: number }[];
  valor: T;
  onCambiar: (v: T) => void;
  etiquetaAccesible: string;
}) {
  return (
    <View role="radiogroup" aria-label={etiquetaAccesible} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {opciones.map((o) => (
        <Chip
          key={o.clave}
          rol="radio"
          etiqueta={o.cantidad === undefined ? o.etiqueta : `${o.etiqueta} · ${o.cantidad}`}
          seleccionado={o.clave === valor}
          onPress={() => onCambiar(o.clave)}
        />
      ))}
    </View>
  );
}

/** Campo de búsqueda compacto. */
export function CampoBusqueda({ valor, onCambiar, placeholder }: { valor: string; onCambiar: (t: string) => void; placeholder: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 44,
        borderRadius: radio.campo,
        borderWidth: 1,
        borderColor: color.bordeCampo,
        backgroundColor: color.superficie,
        paddingLeft: 14,
        paddingRight: 6,
      }}>
      <Search size={18} color={color.textoSecundario} strokeWidth={2} />
      <TextInputBusqueda valor={valor} onCambiar={onCambiar} placeholder={placeholder} />
      {valor ? (
        <BotonIcono icono={X} etiquetaAccesible="Borrar búsqueda" variante="transparente" tamano={36} onPress={() => onCambiar('')} />
      ) : null}
    </View>
  );
}

function TextInputBusqueda({ valor, onCambiar, placeholder }: { valor: string; onCambiar: (t: string) => void; placeholder: string }) {
  return (
    <TextInput
      value={valor}
      onChangeText={onCambiar}
      placeholder={placeholder}
      aria-label={placeholder}
      placeholderTextColor={color.textoDeshabilitado}
      style={[tipo.cuerpo, { flex: 1, minWidth: 0, minHeight: 42, color: color.texto }, { outlineStyle: 'none' } as object]}
    />
  );
}

// ---------------------------------------------------------------------------
// Control deslizante (umbral del match)
// ---------------------------------------------------------------------------

/**
 * Control deslizante con el estilo de la app. En la web usa un <input type="range"> invisible encima,
 * así funciona con mouse, toque y teclado (flechas) y lo leen los lectores de pantalla.
 */
export function Deslizador({
  valor,
  min = 0,
  max = 100,
  paso = 1,
  onCambiar,
  etiquetaAccesible,
  marca,
  soloLectura,
}: {
  valor: number;
  min?: number;
  max?: number;
  paso?: number;
  onCambiar: (v: number) => void;
  etiquetaAccesible: string;
  /** Valor marcado con una rayita (ej. el umbral inicial). */
  marca?: number;
  /** Solo muestra el valor (sin poder moverlo). */
  soloLectura?: boolean;
}) {
  const frac = (Math.min(max, Math.max(min, valor)) - min) / (max - min || 1);
  const pct = `${frac * 100}%` as const;
  return (
    <View
      style={{ height: 44, justifyContent: 'center', opacity: soloLectura ? 0.75 : 1 }}
      role={soloLectura ? 'img' : undefined}
      aria-label={soloLectura ? `${etiquetaAccesible}: ${valor}` : undefined}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: color.segmentado, overflow: 'hidden' }}>
        <View style={{ width: pct, height: 6, backgroundColor: color.oscuro }} />
      </View>
      {marca !== undefined ? (
        <View
          aria-hidden
          style={{
            position: 'absolute',
            left: `${((marca - min) / (max - min || 1)) * 100}%`,
            top: 13,
            width: 2,
            height: 18,
            marginLeft: -1,
            borderRadius: 1,
            backgroundColor: color.acento,
          }}
        />
      ) : null}
      <View
        aria-hidden
        style={[
          {
            position: 'absolute',
            left: pct,
            marginLeft: -13,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: color.superficie,
            borderWidth: 2,
            borderColor: color.oscuro,
          },
          sombra.suave,
        ]}
      />
      {Platform.OS === 'web' && !soloLectura ? (
        <input
          type="range"
          min={min}
          max={max}
          step={paso}
          value={valor}
          aria-label={etiquetaAccesible}
          onChange={(e) => onCambiar(Number(e.currentTarget.value))}
          style={{ position: 'absolute', left: -13, right: -13, top: 0, bottom: 0, width: 'calc(100% + 26px)', height: '100%', margin: 0, opacity: 0, cursor: 'pointer' }}
        />
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Ventana (modal centrado, más ancho que el Dialogo de la app)
// ---------------------------------------------------------------------------

export function VentanaPanel({
  visible,
  onCerrar,
  titulo,
  descripcion,
  children,
  pie,
  ancho = 520,
}: {
  visible: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
  pie?: ReactNode;
  ancho?: number;
}) {
  const [montado, setMontado] = useState(visible);
  const valor = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const { height } = useWindowDimensions();
  useEffect(() => {
    if (visible) setMontado(true);
    Animated.timing(valor, { toValue: visible ? 1 : 0, duration: duracion.normal, useNativeDriver: false }).start(({ finished }) => {
      if (finished && !visible) setMontado(false);
    });
  }, [visible, valor]);
  if (!montado) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onCerrar} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.velo, opacity: valor }}>
          <Pressable aria-label="Cerrar" style={{ flex: 1 }} onPress={onCerrar} />
        </Animated.View>
        <Animated.View
          role="dialog"
          aria-modal
          aria-label={titulo}
          style={[
            {
              width: '100%',
              maxWidth: ancho,
              maxHeight: height * 0.9,
              backgroundColor: color.superficie,
              borderRadius: radio.tarjeta,
              paddingTop: 20,
              paddingBottom: 20,
              opacity: valor,
              transform: [{ scale: valor.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
            },
            sombra.flotante,
          ]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingBottom: 12 }}>
            <View style={{ flex: 1, gap: 4, paddingTop: 6 }}>
              <Titulo nivel={2}>{titulo}</Titulo>
              {descripcion ? (
                <Texto variante="secundario" tono="secundario">
                  {descripcion}
                </Texto>
              ) : null}
            </View>
            <BotonIcono icono={X} etiquetaAccesible="Cerrar" variante="suave" onPress={onCerrar} />
          </View>
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4, gap: 10 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {pie ? <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 10 }}>{pie}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Otros
// ---------------------------------------------------------------------------

/** Ícono en un cuadrito gris (filas del resumen). */
export function IconoCuadro({ icono: Icono, tono = 'neutro', tamano = 36 }: { icono: LucideIcon; tono?: 'neutro' | 'acento' | 'exito' | 'error'; tamano?: number }) {
  const fondo = tono === 'acento' ? color.acentoSuave : tono === 'exito' ? color.exitoFondo : tono === 'error' ? color.errorFondo : color.fondo;
  const trazo = tono === 'acento' ? color.amarilloTexto : tono === 'exito' ? color.exito : tono === 'error' ? color.error : color.texto;
  return (
    <View aria-hidden style={{ width: tamano, height: tamano, borderRadius: radio.icono, backgroundColor: fondo, alignItems: 'center', justifyContent: 'center' }}>
      <Icono size={18} color={trazo} strokeWidth={2} />
    </View>
  );
}

/** Encabezado de columnas de una tabla (solo escritorio). */
export function CabeceraTabla({ columnas }: { columnas: { titulo: string; flex: number; alinear?: 'right' | 'left' }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 8 }}>
      {columnas.map((c) => (
        <Texto key={c.titulo} variante="seccion" style={{ flex: c.flex, textAlign: c.alinear ?? 'left' }}>
          {c.titulo}
        </Texto>
      ))}
    </View>
  );
}

/**
 * Marca un punto de la página y devuelve una función que la desplaza hasta ahí (solo web), por ejemplo
 * para mostrar el detalle recién elegido o el aviso del resultado. Solo se mueve si el punto no se ve.
 */
export function useIrA() {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const ir = useCallback((siempre = false) => {
    if (Platform.OS !== 'web') return;
    const el = ref.current as unknown as { getBoundingClientRect?: () => { top: number }; scrollIntoView?: (o: object) => void } | null;
    if (!el?.getBoundingClientRect || !el.scrollIntoView) return;
    const arriba = el.getBoundingClientRect().top;
    if (siempre || arriba < 0 || arriba > (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 600)) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  return { ref, ir };
}

/** Cifra del resumen (como Metrica de @/ui, pero entran 2 por fila en celular). */
export function Cifra({ etiqueta, valor, detalle, onPress }: { etiqueta: string; valor: string | number; detalle?: string; onPress?: () => void }) {
  const { escritorio } = useAnchoPanel();
  return (
    <Presionable
      role={onPress ? 'link' : undefined}
      aria-label={onPress ? `${etiqueta}: ${valor}` : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={{
        flexGrow: 1,
        flexBasis: escritorio ? 180 : '45%',
        backgroundColor: color.superficie,
        borderWidth: 1,
        borderColor: color.borde,
        borderRadius: radio.tarjeta,
        padding: escritorio ? 16 : 14,
        gap: 6,
      }}>
      <Texto variante="ayuda" peso={600}>
        {etiqueta}
      </Texto>
      <Text style={[tipo.h1, { color: color.texto }]}>{valor}</Text>
      {detalle ? <Texto variante="pequeno">{detalle}</Texto> : null}
    </Presionable>
  );
}

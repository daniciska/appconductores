// Tokens del sistema de diseño de Dale Contacto, tomados de las maquetas (docs/maqueta/*.dc.html).
// Casi negro sobre blanco, grises neutros, mucho espacio y UN solo acento (amarillo).
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const color = {
  // Texto
  texto: '#111111',
  textoSuave: '#3D3D3D', // párrafos dentro de tarjetas, nombres secundarios
  textoSecundario: '#6B6B6B', // ayudas, subtítulos, etiquetas de sección
  textoDeshabilitado: '#9A9A9A',
  textoDeshabilitadoSuave: '#ABABAB',
  blanco: '#FFFFFF',

  // Superficies
  fondo: '#F6F6F6', // fondo de pantalla
  fondoEscritorio: '#ECECEC', // alrededor de la columna de celular en escritorio
  superficie: '#FFFFFF', // tarjetas, campos
  superficieHundida: '#EEEEEE', // avisos neutros, pastilla "Pide licencia"
  segmentado: '#EAEAEA', // fondo del control segmentado
  oscuro: '#111111', // botón oscuro, chips marcados, bienvenida

  // Bordes
  borde: '#ECECEC', // tarjetas
  bordeCampo: '#DDDDDD', // campos y chips sin marcar
  separador: '#F0F0F0', // líneas dentro de tarjetas
  bordeFuerte: '#111111', // seleccionado / foco

  // Acento (uno solo)
  acento: '#F5B400',
  acentoSuave: '#FFF6D6', // fondo de favorito
  acentoTrazo: '#B88500', // borde de la estrella
  acentoBorde: '#F0DFA0', // borde de oferta destacada
  amarilloFondo: '#FFF4DB', // insignia "vence pronto"
  amarilloTexto: '#8A5300',

  // Estados
  exitoFondo: '#E3F4EA',
  exitoTexto: '#145F3B',
  exito: '#17784A', // íconos de check, interruptor encendido
  errorFondo: '#FDECEA',
  error: '#A3261B',
  grisInsignia: '#F0F0F0',
  interruptorApagado: '#C4C4C4',
  iconoDeshabilitado: '#C4C4C4',

  velo: 'rgba(17,17,17,0.45)', // fondo detrás de hojas y diálogos
} as const;

/** Familias cargadas en el layout raíz (expo-font). Usa `fuente(peso)` o los componentes Texto/Titulo. */
export const familia = {
  titulo: 'Sora_700Bold',
  tituloSemi: 'Sora_600SemiBold',
  regular: 'PlusJakartaSans_400Regular',
  medio: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  negrita: 'PlusJakartaSans_700Bold',
} as const;

export type Peso = 400 | 500 | 600 | 700;

/** Familia de Plus Jakarta Sans según el peso (en web y celular, el peso va en la familia). */
export function fuente(peso: Peso = 400): TextStyle {
  const f = peso >= 700 ? familia.negrita : peso >= 600 ? familia.semi : peso >= 500 ? familia.medio : familia.regular;
  return { fontFamily: f };
}

/** Escala tipográfica (tamaño y alto de línea) de las maquetas. */
export const tipo = {
  hero: { fontFamily: familia.titulo, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  h1: { fontFamily: familia.titulo, fontSize: 26, lineHeight: 31, letterSpacing: -0.4 },
  h2: { fontFamily: familia.titulo, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  tituloTarjeta: { ...fuente(700), fontSize: 17, lineHeight: 22 },
  fuerte: { ...fuente(700), fontSize: 15, lineHeight: 21 },
  cuerpo: { ...fuente(400), fontSize: 15, lineHeight: 22 },
  parrafo: { ...fuente(400), fontSize: 15, lineHeight: 22.5 },
  etiqueta: { ...fuente(700), fontSize: 14, lineHeight: 19 },
  secundario: { ...fuente(400), fontSize: 14, lineHeight: 20 },
  ayuda: { ...fuente(400), fontSize: 13, lineHeight: 18 },
  pequeno: { ...fuente(500), fontSize: 12, lineHeight: 16 },
  seccion: { ...fuente(700), fontSize: 12, lineHeight: 16, letterSpacing: 0.4, textTransform: 'uppercase' as const },
  boton: { ...fuente(700), fontSize: 16, lineHeight: 20 },
  botonChico: { ...fuente(700), fontSize: 14, lineHeight: 18 },
} satisfies Record<string, TextStyle>;

/** Espaciado (px). La pantalla usa 20 a los lados y 16 entre bloques. */
export const espacio = {
  xxs: 2,
  xs: 4,
  s: 6,
  m: 8,
  ml: 10,
  l: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  enorme: 32,
  /** Margen lateral de las pantallas del conductor y titular. */
  lateral: 20,
  /** Espacio superior de las pantallas (como en las maquetas, incluye la barra de estado). */
  superior: 56,
  /** Espacio entre bloques de una pantalla. */
  bloque: 16,
} as const;

export const radio = {
  insignia: 8,
  icono: 10, // cuadritos de 32–36 px con ícono
  boton44: 12, // botones de 44 px (volver, ver)
  campo: 14, // campos, filas con casilla, avisos, chips cuadrados
  boton: 16, // botón grande de 56 px
  tarjeta: 20,
  pastilla: 22, // chips de 44 px
  total: 999,
} as const;

/** Alturas mínimas: toda zona táctil mide al menos 44 px. */
export const alto = {
  tactil: 44,
  campo: 52,
  fila: 52,
  boton: 56,
  pestanas: 64,
} as const;

/** Ancho máximo de la columna de celular en escritorio. */
export const ANCHO_CELULAR = 430;
/** Desde este ancho, el panel muestra la barra lateral. */
export const ANCHO_ESCRITORIO = 900;

const sombraWeb = (css: string): ViewStyle => ({ boxShadow: css }) as ViewStyle;

export const sombra = {
  ninguna: {} as ViewStyle,
  suave: Platform.select<ViewStyle>({
    web: sombraWeb('0 1px 2px rgba(17,17,17,0.04), 0 8px 24px rgba(17,17,17,0.06)'),
    default: { shadowColor: '#111', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  }),
  flotante: Platform.select<ViewStyle>({
    web: sombraWeb('0 12px 40px rgba(17,17,17,0.16)'),
    default: { shadowColor: '#111', shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  }),
  columna: Platform.select<ViewStyle>({
    web: sombraWeb('0 0 0 1px rgba(17,17,17,0.04), 0 24px 64px rgba(17,17,17,0.10)'),
    default: {},
  }),
};

/** Duraciones de animación (ms): sutiles. */
export const duracion = { rapida: 140, normal: 220, lenta: 320 } as const;

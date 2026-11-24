// "Letra grande" (pedido de Daniela, 24-nov): las medidas del modo grande del sistema de diseño.
// No es un zoom: los textos chicos crecen más que los títulos (como el tamaño de texto del celular),
// y botones, casillas y zonas para tocar pasan a medir al menos 56 px.
//
// No importa nada de React Native, para poder probarlo con Node (tests/escala.test.ts).

/** Clave donde se recuerda la preferencia en este equipo ("1" = letra grande). */
export const CLAVE_LETRA_GRANDE = 'dale-letra-grande';

/** Desde este tamaño se considera título: crece 2 px. Lo más chico crece 3 px. */
const DESDE_TITULO = 24;

/**
 * Tamaño de letra en el modo grande.
 * 12→15 · 13→16 · 14→17 · 15→18 · 16→19 · 17→20 · 20→23 · 26→28 · 34→36.
 */
export function tamanoGrande(tamano: number): number {
  return tamano < DESDE_TITULO ? tamano + 3 : tamano + 2;
}

/** Alto de línea en el modo grande: misma proporción que en el tamaño normal. */
export function altoLineaGrande(altoLinea: number, tamano: number): number {
  return Math.round((altoLinea * tamanoGrande(tamano)) / tamano);
}

/**
 * Grises que en el modo grande se oscurecen para leer mejor (contraste AA, 4,5:1 o más, sobre
 * blanco y sobre el fondo #F6F6F6). Son los grises de "deshabilitado" (opciones que la licencia no
 * permite, placeholders), que con letra normal quedan más claros.
 */
export const GRIS_MAS_OSCURO: Readonly<Record<string, string>> = {
  '#9A9A9A': '#6B6B6B',
  '#ABABAB': '#6B6B6B',
};

export interface EstiloTextoPlano {
  fontSize?: number;
  lineHeight?: number;
  color?: unknown;
  [clave: string]: unknown;
}

/** Devuelve el estilo (ya aplanado) de un texto con las medidas del modo grande. No lo modifica. */
export function escalarEstiloTexto<T extends EstiloTextoPlano>(estilo: T): T {
  const fuera: EstiloTextoPlano = { ...estilo };
  const tamano = typeof estilo.fontSize === 'number' ? estilo.fontSize : undefined;
  if (tamano !== undefined) {
    fuera.fontSize = tamanoGrande(tamano);
    if (typeof estilo.lineHeight === 'number') fuera.lineHeight = altoLineaGrande(estilo.lineHeight, tamano);
  } else if (typeof estilo.lineHeight === 'number') {
    // Hereda el tamaño del texto de afuera (15 px casi siempre): sube en la misma proporción.
    fuera.lineHeight = altoLineaGrande(estilo.lineHeight, 15);
  }
  if (typeof estilo.color === 'string') {
    const oscuro = GRIS_MAS_OSCURO[estilo.color.toUpperCase()];
    if (oscuro) fuera.color = oscuro;
  }
  return fuera as T;
}

/** Medidas de controles: con letra normal (las de las maquetas) y con letra grande (56 px o más). */
export interface Medidas {
  grande: boolean;
  /** Zona mínima para tocar. */
  tactil: number;
  campo: number;
  fila: number;
  boton: number;
  /** Chips de días (Lu Ma Mi…). */
  chipCuadrado: number;
  /** Chip con segunda línea. */
  chipConSubtitulo: number;
  /** Tarjetas con ícono (Día / Noche) y filas con interruptor. */
  opcion: number;
  /** Casilla y radio (el dibujo; la zona para tocar es toda la fila). */
  casilla: number;
  radioOpcion: number;
  /** Interruptor: ancho, alto y bolita. */
  interruptor: { ancho: number; alto: number; bola: number };
  /** Cuadrito de ícono en filas de lista y avisos. */
  iconoFila: number;
  /** Ancho del stepper (− n +), sin y con sufijo. */
  stepper: { sin: number; con: number };
  /** Multiplica el tamaño de los íconos dentro de los controles. */
  icono: (tamano: number) => number;
}

export const MEDIDAS_NORMALES: Medidas = {
  grande: false,
  tactil: 44,
  campo: 52,
  fila: 52,
  boton: 56,
  chipCuadrado: 48,
  chipConSubtitulo: 52,
  opcion: 64,
  casilla: 20,
  radioOpcion: 22,
  interruptor: { ancho: 52, alto: 32, bola: 26 },
  iconoFila: 32,
  stepper: { sin: 132, con: 156 },
  icono: (t) => t,
};

export const MEDIDAS_GRANDES: Medidas = {
  grande: true,
  tactil: 56,
  campo: 60,
  fila: 60,
  boton: 64,
  chipCuadrado: 56,
  chipConSubtitulo: 64,
  opcion: 72,
  casilla: 28,
  radioOpcion: 28,
  interruptor: { ancho: 60, alto: 36, bola: 30 },
  iconoFila: 40,
  stepper: { sin: 172, con: 200 },
  icono: (t) => Math.round(t * 1.25),
};

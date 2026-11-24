// Los textos de "Antes de empezar" (A4), sus casillas y cómo se dibujan. Puro (solo texto y reglas): lo
// usan la pantalla, la app real y las pruebas.
//
// - La demo muestra las 4 casillas de la maqueta (TEXTOS_AUTORIZACION): la versión de prueba 'prueba-1',
//   igual a la guardada en la base (supabase/migrations/20261110120000_app_conductor_v1_textos_prueba.sql;
//   lo revisa app-real/tests/autorizaciones.test.ts).
// - La app real muestra UNA casilla por cada texto obligatorio vigente de la base, en su orden, y
//   registra la aceptación de esos mismos. Así, cuando lleguen los definitivos del abogado o una
//   autorización nueva (una 5.ª clave), basta con cargarlos en la base: la app los muestra sin publicar
//   otra versión. Cada casilla parte marcada SOLO si la persona ya aceptó esa misma versión.
import type { CasillaAutorizacion, MarcasAutorizacion, TextoAutorizacion } from '../../datos/puerto/tipos.ts';

/** Texto completo de cada casilla (lo que la persona acepta), igual al guardado en la base ('prueba-1'). */
export const TEXTOS_AUTORIZACION: Record<CasillaAutorizacion, string> = {
  terminos: 'Acepto los Términos y la Política de privacidad, y declaro ser mayor de 18 años.',
  compartir: 'Autorizo que, cuando haga match, se compartan mi ficha y mi contacto (teléfono y email) con ese titular.',
  revision:
    'Revisión de mis documentos: un sistema automático los revisa primero; las dudas y los rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.',
  mensajes: 'Mensajes: me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y bloquear.',
};

/** Las 4 casillas de la maqueta, en su orden. */
export const CASILLAS_MAQUETA: CasillaAutorizacion[] = ['terminos', 'compartir', 'revision', 'mensajes'];

/** La casilla de la maqueta que tiene exactamente este texto (para dibujarla como en la maqueta), o null. */
export function casillaDeLaMaqueta(texto: string): CasillaAutorizacion | null {
  return CASILLAS_MAQUETA.find((c) => TEXTOS_AUTORIZACION[c] === texto) ?? null;
}

// ---------------------------------------------------------------------------
// Casillas de A4
// ---------------------------------------------------------------------------

/** Una casilla de A4. */
export interface CasillaA4 {
  /** Clave de su marca: en la demo, la casilla ('terminos'…); en la app real, el id de esa versión del texto. */
  id: string;
  /** Lo que la persona acepta. */
  texto: string;
  /** Ya la aceptó: parte marcada. */
  aceptada: boolean;
}

/**
 * Las casillas de A4.
 * - App real (`deLaBase`): una por cada texto obligatorio vigente, en su orden, marcada solo si la
 *   persona ya aceptó ESA versión (nunca por deducción de otras claves).
 * - Demo (sin textos de la base): las 4 de la maqueta, como siempre (marcadas si ya las aceptó en la demo).
 */
export function casillasA4(deLaBase: readonly TextoAutorizacion[] | null | undefined, aceptadasEnLaDemo: boolean): CasillaA4[] {
  if (deLaBase) return deLaBase.map((t) => ({ id: t.id, texto: t.texto, aceptada: t.aceptado }));
  return CASILLAS_MAQUETA.map((c) => ({ id: c, texto: TEXTOS_AUTORIZACION[c], aceptada: aceptadasEnLaDemo }));
}

/** Cómo parten las marcas: solo lo ya aceptado. */
export function marcasIniciales(casillas: readonly CasillaA4[]): MarcasAutorizacion {
  return Object.fromEntries(casillas.map((c) => [c.id, c.aceptada]));
}

/** Las casillas sin marcar (con la validación encendida, "Continuar" no avanza mientras haya alguna). */
export function faltanEnA4(casillas: readonly CasillaA4[], marcas: MarcasAutorizacion): CasillaA4[] {
  return casillas.filter((c) => !marcas[c.id]);
}

/** Alerta de A4 cuando falta marcar alguna. */
export function textoMarcaTodas(n: number): string {
  return n === 1 ? 'Marca la autorización para continuar.' : `Marca las ${n} autorizaciones para continuar.`;
}

/** Ya aceptó todas (hay al menos una): la guardia de la app real solo así la deja salir de A4. */
export function alDiaEnA4(casillas: readonly CasillaA4[]): boolean {
  return casillas.length > 0 && casillas.every((c) => c.aceptada);
}

/**
 * "Volver" en A4.
 * - Demo (`modo` 'codigo'): al código (A3), como siempre.
 * - App real: a Inicio solo si la guardia la deja ir (registrada y con todos los textos vigentes ya
 *   aceptados); si no, Inicio la devolvería a A4 (o al Paso 1, que vuelve a A4) y daría vueltas, así
 *   que ofrece cerrar sesión.
 */
export function volverDeA4(
  modo: 'codigo' | 'cerrarSesion',
  registrado: boolean,
  casillas: readonly CasillaA4[],
): 'codigo' | 'inicio' | 'cerrarSesion' {
  if (modo === 'codigo') return 'codigo';
  return registrado && alDiaEnA4(casillas) ? 'inicio' : 'cerrarSesion';
}

// ---------------------------------------------------------------------------
// Cómo se dibuja un texto
// ---------------------------------------------------------------------------

/** Las ventanas que abren los enlaces de una casilla. */
export type DocumentoLegal = 'terminos' | 'privacidad';

export type ParteTexto = { tipo: 'texto'; texto: string } | { tipo: 'negrita'; texto: string };

/**
 * Cómo se dibuja la frase de una casilla, como en la maqueta: lo que va antes de ":" al comienzo, en
 * negrita ("Mensajes:"), y el resto como texto normal. Los nombres de los documentos quedan como texto
 * normal: sus enlaces van en una línea aparte (enlacesDeLaCasilla). Sirve para cualquier texto de la base.
 */
export function partesTexto(texto: string): ParteTexto[] {
  const titulo = /^([^:.\n]{1,60}:)(?=\s)/.exec(texto);
  if (!titulo) return [{ tipo: 'texto', texto }];
  const resto = texto.slice(titulo[1].length);
  return resto ? [{ tipo: 'negrita', texto: titulo[1] }, { tipo: 'texto', texto: resto }] : [{ tipo: 'negrita', texto: titulo[1] }];
}

/** Un enlace de la línea bajo la frase de una casilla. */
export interface EnlaceCasilla {
  documento: DocumentoLegal;
  /** Lo que dice el enlace. */
  titulo: string;
}

const NOMBRE_DOCUMENTO: Record<string, DocumentoLegal> = { Términos: 'terminos', 'Política de privacidad': 'privacidad' };

/**
 * S13 (decidido el 24-nov): los enlaces a los documentos que nombra la frase ("Términos", "Política de
 * privacidad"), en el orden en que aparecen y una vez cada uno. Van aparte, bajo la frase ("Leer
 * Términos" y "Leer Política de privacidad", uno bajo el otro), para que cada uno tenga 44 px para tocar
 * y tocar la frase siempre marque la casilla. Sirve para cualquier texto que llegue de la base.
 */
export function enlacesDeLaCasilla(texto: string): EnlaceCasilla[] {
  const enlaces: EnlaceCasilla[] = [];
  for (const m of texto.matchAll(/Términos|Política de privacidad/g)) {
    const documento = NOMBRE_DOCUMENTO[m[0]];
    if (!enlaces.some((e) => e.documento === documento)) enlaces.push({ documento, titulo: `Leer ${m[0]}` });
  }
  return enlaces;
}

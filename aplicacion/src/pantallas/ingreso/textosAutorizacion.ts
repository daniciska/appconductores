// Los 4 textos de "Antes de empezar" (A4) y cómo se dibujan. Puro (solo texto): lo usan la pantalla,
// la app real y las pruebas.
//
// - La demo muestra TEXTOS_AUTORIZACION: la versión de prueba 'prueba-1', igual a la guardada en la base
//   (supabase/migrations/20261110120000_app_conductor_v1_textos_prueba.sql; lo revisa
//   app-real/tests/autorizaciones.test.ts).
// - La app real muestra los textos vigentes que lee de la base y registra la aceptación de esos mismos.
//   Así, cuando lleguen los definitivos del abogado, basta con cargarlos en la base: la app los muestra
//   sin publicar otra versión. Si a la base le falta el texto de una casilla, la pantalla muestra el de
//   aquí y no deja continuar ("Faltan los textos de autorización").
import type { CasillaAutorizacion } from '../../datos/puerto/tipos.ts';

/** Texto completo de cada casilla (lo que la persona acepta), igual al guardado en la base ('prueba-1'). */
export const TEXTOS_AUTORIZACION: Record<CasillaAutorizacion, string> = {
  terminos: 'Acepto los Términos y la Política de privacidad, y declaro ser mayor de 18 años.',
  compartir: 'Autorizo que, cuando haga match, se compartan mi ficha y mi contacto (teléfono y email) con ese titular.',
  revision:
    'Revisión de mis documentos: un sistema automático los revisa primero; las dudas y los rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.',
  mensajes: 'Mensajes: me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y bloquear.',
};

/** Las ventanas que abren los enlaces del texto. */
export type DocumentoLegal = 'terminos' | 'privacidad';

export type ParteTexto =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'negrita'; texto: string }
  | { tipo: 'enlace'; texto: string; documento: DocumentoLegal };

const ENLACES: Record<string, DocumentoLegal> = { Términos: 'terminos', 'Política de privacidad': 'privacidad' };

/**
 * Cómo se dibuja un texto de A4, como en la maqueta: lo que va antes de ":" al comienzo, en negrita
 * ("Mensajes:"), y la primera vez que aparecen "Términos" y "Política de privacidad", como enlaces a sus
 * ventanas. Sirve para cualquier texto que llegue de la base.
 */
export function partesTexto(texto: string): ParteTexto[] {
  const partes: ParteTexto[] = [];
  let resto = texto;
  const titulo = /^([^:.\n]{1,60}:)(?=\s)/.exec(resto);
  if (titulo) {
    partes.push({ tipo: 'negrita', texto: titulo[1] });
    resto = resto.slice(titulo[1].length);
  }
  const usados = new Set<DocumentoLegal>();
  const patron = /Términos|Política de privacidad/g;
  let desde = 0;
  for (let m = patron.exec(resto); m; m = patron.exec(resto)) {
    const documento = ENLACES[m[0]];
    if (usados.has(documento)) continue;
    usados.add(documento);
    if (m.index > desde) partes.push({ tipo: 'texto', texto: resto.slice(desde, m.index) });
    partes.push({ tipo: 'enlace', texto: m[0], documento });
    desde = m.index + m[0].length;
  }
  if (desde < resto.length) partes.push({ tipo: 'texto', texto: resto.slice(desde) });
  return partes;
}

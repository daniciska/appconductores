// Buscador de comunas del Paso 2 temporal (app real v1: la comuna se elige de una lista mientras no
// exista la cuenta de Google Cloud). Puro: se prueba con Node.
import type { Comuna } from '../../datos/tipos.ts';

/** "Ñuñoa" → "nunoa" (sin tildes, en minúsculas y sin espacios a los lados). */
export const sinTildes = (t: string): string =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Desde cuántas letras se sugieren comunas y cuántas como máximo. */
export const MINIMO_LETRAS = 2;
export const MAXIMO_SUGERENCIAS = 6;

/**
 * Comunas que calzan con lo escrito, sin tildes y también por sus nombres alternativos: primero las
 * que empiezan así (la exacta antes) y después las que lo contienen, en orden alfabético.
 */
export function buscarComunas(texto: string, comunas: Comuna[], maximo = MAXIMO_SUGERENCIAS): Comuna[] {
  const buscado = sinTildes(texto);
  if (buscado.length < MINIMO_LETRAS) return [];
  const nombres = (c: Comuna) => [c.nombre, ...c.alternativos].map(sinTildes);
  const alfabetico = (a: Comuna, b: Comuna) => a.nombre.localeCompare(b.nombre, 'es');
  const exactas = comunas.filter((c) => nombres(c).some((n) => n === buscado));
  const empiezan = comunas.filter((c) => !exactas.includes(c) && nombres(c).some((n) => n.startsWith(buscado)));
  const contienen = comunas.filter(
    (c) => !exactas.includes(c) && !empiezan.includes(c) && nombres(c).some((n) => n.includes(buscado)),
  );
  return [...exactas.sort(alfabetico), ...empiezan.sort(alfabetico), ...contienen.sort(alfabetico)].slice(0, maximo);
}

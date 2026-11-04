// Sugerencias de dirección SIMULADAS para el Paso 2 (en la app real vienen de Google Maps Places).
// La persona escribe calle y número (y, si quiere, la comuna después de una coma). Se proponen
// direcciones completas con comunas del catálogo que coinciden con lo escrito; si no nombra
// ninguna, se usan comunas frecuentes de Santiago.
import type { Comuna } from '@/datos/tipos';

export interface Sugerencia {
  /** "Los Jazmines 1420" (se guarda en `direccion`). */
  direccion: string;
  comunaId: string;
  comuna: string;
  regionId: string;
}

const FRECUENTES = ['nunoa', 'providencia', 'la-florida', 'maipu', 'santiago', 'las-condes', 'puente-alto'];

export const sinTildes = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const nombresDe = (c: Comuna) => [c.nombre, ...c.alternativos].map(sinTildes);

/** "los jazmines 1420" → "Los Jazmines 1420" (respeta lo que ya viene con mayúsculas). */
function ordenarCalle(calle: string): string {
  const limpia = calle.replace(/\s+/g, ' ').trim();
  return limpia
    .split(' ')
    .map((p, i) => {
      if (/^\d/.test(p) || p !== p.toLowerCase()) return p;
      const menor = ['de', 'del', 'la', 'las', 'los', 'el', 'y'];
      if (i > 0 && menor.includes(p)) return p;
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(' ');
}

export function sugerirDireccionesDemo(texto: string, comunas: Comuna[], maximo = 3): Sugerencia[] {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (limpio.length < 3) return [];

  const [antes, ...despues] = limpio.split(',');
  let calle = antes.trim();
  const resto = sinTildes(despues.join(' ').replace(/,/g, ' '));
  let elegidas: Comuna[] = [];

  if (resto.length >= 2) {
    // Escribió la comuna después de una coma: las que empiezan así y después las que la contienen.
    const empiezan = comunas.filter((c) => nombresDe(c).some((n) => n.startsWith(resto)));
    const contienen = comunas.filter((c) => !empiezan.includes(c) && nombresDe(c).some((n) => n.includes(resto)));
    elegidas = [...empiezan.sort((a, b) => a.nombre.length - b.nombre.length), ...contienen];
  } else {
    // ¿Nombró una comuna sin coma? ("Los Jazmines 1420 Ñuñoa")
    const buscado = sinTildes(limpio);
    const nombradas = comunas
      .filter((c) => nombresDe(c).some((n) => n.length >= 4 && buscado.endsWith(' ' + n)))
      .sort((a, b) => b.nombre.length - a.nombre.length);
    if (nombradas.length > 0) {
      const n = nombradas[0];
      const sinComuna = calle.slice(0, calle.length - n.nombre.length).trim();
      if (sinComuna.length >= 2) calle = sinComuna;
      elegidas = [n];
    }
  }

  // Completa con comunas frecuentes (como hace Google cuando no hay comuna escrita).
  if (resto.length < 2) {
    for (const id of FRECUENTES) {
      const c = comunas.find((x) => x.id === id);
      if (c && !elegidas.includes(c)) elegidas.push(c);
    }
  }

  const direccion = ordenarCalle(calle);
  return elegidas.slice(0, maximo).map((c) => ({ direccion, comunaId: c.id, comuna: c.nombre, regionId: c.regionId }));
}

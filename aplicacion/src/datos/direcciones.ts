// Sugerencias de dirección SIMULADAS (en la app real vienen de Google Maps Places).
// Devuelve la calle escrita en 3 comunas: las que se nombren en el texto o, si no, comunas de Santiago.
import type { Comuna } from './tipos';

export interface SugerenciaDireccion {
  /** "Los Jazmines 1420" */
  direccion: string;
  comunaId: string;
  /** "Ñuñoa, Región Metropolitana de Santiago" */
  detalle: string;
}

const COMUNAS_FRECUENTES = ['nunoa', 'providencia', 'santiago', 'maipu', 'la-florida', 'puente-alto', 'las-condes'];

const sinTildes = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Sugerencias para el campo "Tu dirección" (Paso 2).
 * @param texto lo que escribió la persona (ej. "Los Jazmines 1420" o "Av. Grecia 2140, Macul")
 * @param comunas catálogo de comunas (state.catalogos.comunas)
 * @param nombreRegion función que da el nombre de la región por id
 */
export function sugerirDirecciones(
  texto: string,
  comunas: Comuna[],
  nombreRegion: (regionId: string) => string,
): SugerenciaDireccion[] {
  const limpio = texto.trim();
  if (limpio.length < 3) return [];
  const [calleParte, ...resto] = limpio.split(',');
  const calle = calleParte.trim().replace(/\s+/g, ' ');
  const buscado = sinTildes(resto.join(' ').trim() || limpio);

  const nombradas = comunas
    .filter((c) => {
      const nombres = [c.nombre, ...c.alternativos].map(sinTildes);
      return nombres.some((n) => n.length >= 4 && buscado.includes(n));
    })
    .sort((a, b) => b.nombre.length - a.nombre.length);

  const elegidas: Comuna[] = [...nombradas];
  for (const id of COMUNAS_FRECUENTES) {
    if (elegidas.length >= 3) break;
    const c = comunas.find((x) => x.id === id);
    if (c && !elegidas.includes(c)) elegidas.push(c);
  }
  const calleSinComuna = nombradas.length > 0 && resto.length === 0 ? calle.replace(new RegExp(nombradas[0].nombre, 'i'), '').trim() : calle;
  const capital = calleSinComuna.charAt(0).toUpperCase() + calleSinComuna.slice(1);
  return elegidas.slice(0, 3).map((c) => ({
    direccion: capital || calle,
    comunaId: c.id,
    detalle: `${c.nombre}, Región ${nombreRegion(c.regionId)}`,
  }));
}

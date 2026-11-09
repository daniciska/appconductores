// Rutas de las pantallas de documentos del conductor (typed routes de expo-router).
// Van aparte de textos.ts para que los textos se puedan usar fuera de esta app sin arrastrar sus rutas.
import type { Href } from 'expo-router';

import type { TipoDocumentoId } from '@/datos/tipos';

/** Rutas de los pasos del registro (typed routes: cada paso es su propio archivo). */
export const RUTA_PASO: Record<number, Href> = {
  1: '/conductor/registro/1',
  2: '/conductor/registro/2',
  3: '/conductor/registro/3',
  4: '/conductor/registro/4',
  5: '/conductor/registro/5',
};

export function rutaSubir(tipo: TipoDocumentoId): Href {
  return { pathname: '/conductor/documentos/subir/[tipo]', params: { tipo } };
}

export function rutaNoAprobado(tipo: TipoDocumentoId): Href {
  return { pathname: '/conductor/documentos/[tipo]/no-aprobado', params: { tipo } };
}

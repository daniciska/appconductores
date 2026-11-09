// Revisión de documentos a mano: mientras alguien del equipo revisa documentos en una pestaña de este
// mismo navegador, la demo no simula esa revisión (los documentos esperan su decisión). "Aprobar ahora"
// sigue funcionando.
//
// Cada pestaña que revisa deja su propia marca en el navegador (PREFIJO_REVISION_MANUAL + un id de la
// pestaña) con un plazo, y la renueva cada pocos segundos. Al cerrarse la pestaña, la marca se quita;
// si el navegador la cierra sin avisar, vence sola (PLAZO_REVISION_MANUAL_MS) y vuelve la revisión
// simulada. Así nunca queda una marca olvidada que detenga la demo.
// La marca solo dice hasta cuándo vale: no dice quién revisa ni con qué rol.
//
// Este módulo solo lee las marcas y las borra al reiniciar la demo. Quien las escribe es otra app del
// mismo sitio. No importa nada de React Native, para poder probarlo con Node (tests/revision-equipo.test.ts).
import { useSyncExternalStore } from 'react';

/** Cada pestaña que revisa guarda su marca en una clave que empieza así. */
export const PREFIJO_REVISION_MANUAL = 'dale-demo-revision-manual:';
/** Cuánto vale una marca sin renovarse. Cubre a una pestaña oculta, que el navegador despierta 1 vez por minuto. */
export const PLAZO_REVISION_MANUAL_MS = 90_000;
/** Cada cuánto renueva su marca la pestaña que revisa. */
export const RENOVAR_REVISION_MANUAL_MS = 5_000;
/** "Reiniciar demo" escribe aquí la hora: las demás pestañas del sitio se enteran y vuelven a empezar. */
export const CLAVE_REINICIO = 'dale-demo-reinicio';

type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

function almacen(): Almacen | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
}

/** ¿Una marca (texto guardado) sigue vigente? Lo que no se entiende no cuenta. */
export function marcaVigente(crudo: string | null, ahora: number): boolean {
  if (!crudo) return false;
  try {
    const v = JSON.parse(crudo) as { hasta?: unknown } | null;
    return !!v && typeof v.hasta === 'number' && v.hasta >= ahora;
  } catch {
    return false;
  }
}

/** Las claves de todas las marcas guardadas (vigentes o no). */
export function clavesDeMarcas(a: Almacen | null = almacen()): string[] {
  const claves: string[] = [];
  if (!a) return claves;
  try {
    for (let i = 0; i < a.length; i++) {
      const k = a.key(i);
      if (k && k.startsWith(PREFIJO_REVISION_MANUAL)) claves.push(k);
    }
  } catch {
    return [];
  }
  return claves;
}

/** ¿Hay alguien del equipo revisando a mano en este navegador ahora? */
export function leerRevisionManual(ahora = Date.now(), a: Almacen | null = almacen()): boolean {
  if (!a) return false;
  try {
    return clavesDeMarcas(a).some((k) => marcaVigente(a.getItem(k), ahora));
  } catch {
    return false;
  }
}

const oyentes = new Set<() => void>();
const avisarOyentes = () => oyentes.forEach((o) => o());

/**
 * "Reiniciar demo": avisa a las demás pestañas (CLAVE_REINICIO) y borra todas las marcas, así la
 * revisión simulada vuelve de inmediato aunque una pestaña que revisaba esté dormida.
 */
export function reiniciarRevisionManual(ahora = Date.now(), a: Almacen | null = almacen()): void {
  if (!a) return;
  try {
    a.setItem(CLAVE_REINICIO, String(ahora));
    for (const k of clavesDeMarcas(a)) a.removeItem(k);
  } catch {
    // Sin almacenamiento: no hay marcas que borrar.
  }
  avisarOyentes();
}

// Las demás pestañas se enteran con el evento "storage" (solo llega a las otras pestañas).
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIJO_REVISION_MANUAL)) avisarOyentes();
  });
}

function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente);
  // Una marca puede vencer sin que nadie escriba (la pestaña se cerró sin avisar): se mira cada tanto.
  const reloj = setInterval(oyente, RENOVAR_REVISION_MANUAL_MS);
  return () => {
    oyentes.delete(oyente);
    clearInterval(reloj);
  };
}

/** ¿Alguien del equipo revisa a mano en este navegador? (se actualiza solo, también desde otras pestañas). */
export function useRevisionManual(): boolean {
  return useSyncExternalStore(suscribir, () => leerRevisionManual(), () => false);
}

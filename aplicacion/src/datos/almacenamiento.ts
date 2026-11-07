// Cómo guarda la tienda de la demo (tienda.ts) sus datos en el navegador.
//
// Cuida que dos pestañas con versiones distintas de la demo no se borren el progreso una a la otra.
// Pasaba al tener abierta la versión publicada el 4-nov (con panel, versión 2 del estado) y la nueva
// (versión 3) a la vez: cada una llevaba lo guardado a su versión, lo guardaba, y la otra lo volvía
// a cambiar, sin parar. Por eso:
// 1. Clave nueva: hasta la versión 2 todo se guardaba en `claveAnterior` ('dale-demo-v1'). Lo que haya
//    ahí se lee una sola vez, cuando la clave nueva todavía está vacía; la tienda lo lleva a la versión
//    actual (migrarEstado), lo guarda en la clave nueva y la clave anterior se borra. Una pestaña vieja
//    que siga abierta sigue con su clave y no toca la nueva.
// 2. Una pestaña con código más viejo que lo guardado no escribe: si otra pestaña ya guardó con una
//    versión más nueva del estado, esta deja de guardar (y avisa que hay que recargar) en vez de pisarlo.
//    Así, la próxima vez que suba VERSION_ESTADO no hace falta cambiar de clave.
//
// No importa nada de React Native, para poder probarlo con Node (tests/almacenamiento.test.ts).
import type { PersistStorage, StateStorage, StorageValue } from 'zustand/middleware';

/** La clave donde se guarda la demo es el `name` de persist (CLAVE_ALMACENAMIENTO). */
export interface OpcionesAlmacen {
  /** Clave de versiones anteriores del mockup: se lee una sola vez, si la clave nueva está vacía. */
  claveAnterior?: string;
  /** Versión del estado que entiende este código (VERSION_ESTADO). */
  version: number;
  /** Se llama una sola vez, al descubrir que otra pestaña guardó con una versión más nueva. */
  alQuedarVieja?: () => void;
}

/** Versión de un texto guardado por zustand ({"state":…,"version":N}), sin leer todo el JSON. */
export function versionGuardada(crudo: string | null): number | null {
  if (!crudo) return null;
  const m = /"version":(\d+)\}\s*$/.exec(crudo.slice(-40));
  return m ? Number(m[1]) : null;
}

export function crearAlmacenDemo<S>(base: StateStorage, o: OpcionesAlmacen): PersistStorage<S, Promise<void>> {
  /** Otra pestaña guardó con una versión más nueva: esta ya no guarda (hasta que se recargue). */
  let vieja = false;
  /** Se leyó lo de la clave anterior: se borra después de guardarlo en la clave nueva. */
  let borrarAnterior = false;

  const quedarVieja = () => {
    if (vieja) return;
    vieja = true;
    o.alQuedarVieja?.();
  };

  return {
    getItem: async (nombre) => {
      let crudo = await base.getItem(nombre);
      if (crudo === null && o.claveAnterior) {
        crudo = await base.getItem(o.claveAnterior);
        if (crudo !== null) borrarAnterior = true;
      }
      if (crudo === null) return null;
      let valor: StorageValue<S>;
      try {
        valor = JSON.parse(crudo) as StorageValue<S>;
      } catch {
        return null;
      }
      if (typeof valor?.version === 'number' && valor.version > o.version) {
        // No se "migra hacia atrás": la pestaña sigue con lo que ya muestra y deja de guardar.
        quedarVieja();
        return null;
      }
      return valor;
    },

    setItem: async (nombre, valor) => {
      if (vieja) return;
      const guardada = versionGuardada(await base.getItem(nombre));
      if (guardada !== null && guardada > o.version) {
        quedarVieja();
        return;
      }
      await base.setItem(nombre, JSON.stringify({ state: valor.state, version: valor.version }));
      if (borrarAnterior && o.claveAnterior) {
        borrarAnterior = false;
        await base.removeItem(o.claveAnterior);
      }
    },

    removeItem: async (nombre) => {
      await base.removeItem(nombre);
    },
  };
}

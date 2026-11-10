// Borradores: lo que la persona escribió y todavía no guardó o envió (un mensaje a medias, un paso
// del registro sin guardar). Viven en esta pestaña del navegador (sessionStorage): sobreviven a
// cambiar de pantalla y a recargar, y se borran al guardar o enviar. No van en la tienda de la demo
// porque no son datos de la demo, solo una ayuda para no perder lo escrito.
//
// Claves: 'chat:<busquedaId>' (D4) y 'paso:<n>' (B1–B4).
// Cada app elige dónde se guardan con configurarBorradores(nombre) al cargar (la demo y la app real
// usan nombres distintos); hasta entonces viven solo en memoria.
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

interface EstadoBorradores {
  datos: Record<string, unknown>;
}

const memoria: Record<string, string> = {};
const enMemoria: StateStorage = {
  getItem: (k) => memoria[k] ?? null,
  setItem: (k, v) => {
    memoria[k] = v;
  },
  removeItem: (k) => {
    delete memoria[k];
  },
};

function almacen(): StateStorage {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
  } catch {
    // Sin acceso a sessionStorage (modo privado estricto): solo en memoria.
  }
  return enMemoria;
}

export const useBorradores = create<EstadoBorradores>()(
  persist(() => ({ datos: {} }), {
    name: 'borradores',
    storage: createJSONStorage(almacen),
    // Nada se lee ni se escribe en el navegador hasta que la app diga dónde (configurarBorradores).
    skipHydration: true,
  }),
);

let configurado = false;

/**
 * Dónde se guardan los borradores de esta app (clave de sessionStorage) y los lee. Se llama una vez,
 * al cargar la app, antes de mostrar pantallas. Con sessionStorage la lectura es inmediata.
 */
export function configurarBorradores(nombre: string): void {
  if (configurado && useBorradores.persist.getOptions().name === nombre) return;
  configurado = true;
  useBorradores.persist.setOptions({ name: nombre });
  void useBorradores.persist.rehydrate();
}

/** Lee un borrador (o undefined si no hay). */
export function leerBorrador<T>(clave: string): T | undefined {
  return useBorradores.getState().datos[clave] as T | undefined;
}

/** Guarda (o reemplaza) un borrador. Un texto vacío lo borra. */
export function guardarBorrador(clave: string, valor: unknown): void {
  if (valor === '' || valor === undefined || valor === null) {
    borrarBorrador(clave);
    return;
  }
  useBorradores.setState((s) => ({ datos: { ...s.datos, [clave]: valor } }));
}

export function borrarBorrador(clave: string): void {
  if (!(clave in useBorradores.getState().datos)) return;
  useBorradores.setState((s) => {
    const datos = { ...s.datos };
    delete datos[clave];
    return { datos };
  });
}

/** Al reiniciar la demo o eliminar la cuenta, se borran todos. */
export function borrarTodosLosBorradores(): void {
  useBorradores.setState({ datos: {} });
}

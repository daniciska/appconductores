// Sesión del panel en esta demo: con qué rol se entró. No hay pantalla de ingreso (celular, código y
// segundo paso siguen por decidir): se elige el rol en la portada.
//
// - El rol es de cada pestaña (sessionStorage): sobrevive a recargar la página, y otra pestaña del panel
//   parte en la portada. Así se pueden ver el administrador y el revisor lado a lado, y cambiar de rol
//   o salir en una pestaña no toca a las demás.
// - Mientras una pestaña tiene un rol, deja su marca de "revisión a mano" en el navegador (código común:
//   src/datos/revisionManual.ts) y la renueva cada pocos segundos: la demo del conductor, abierta en otra
//   pestaña, deja de aprobar sola. Al salir del panel o cerrar la pestaña, la marca se quita; si el
//   navegador la cierra sin avisar, vence sola. Entonces vuelve la revisión simulada.
// - "Reiniciar demo" en la demo del conductor devuelve a la portada a todas las pestañas del panel.
import { useSyncExternalStore } from 'react';

import {
  CLAVE_REINICIO,
  PLAZO_REVISION_MANUAL_MS,
  PREFIJO_REVISION_MANUAL,
  RENOVAR_REVISION_MANUAL_MS,
} from '@/datos/revisionManual';
import { useDemo } from '@/datos/tienda';
import type { RolEquipo } from '@/datos/tipos';
import { mostrarToast } from '@/ui/Toast';

import { vaciarRegistroPendiente } from './datos/registro';
import { IDS_REPORTES_DE_EJEMPLO, reportesDeEjemplo, semillaEquipo } from './datos/semillaPanel';
import { puede, type Permiso } from './permisos';

interface SesionPanel {
  rol: RolEquipo;
  /** Desde cuándo (ISO). */
  desde: string;
  /** Último "Reiniciar demo" que conocía esta pestaña al entrar (CLAVE_REINICIO). */
  reinicio: string | null;
}

const CLAVE_SESION = 'dale-panel-sesion';

function almacenDeLaPestana(): Storage | null {
  try {
    return (globalThis as { sessionStorage?: Storage }).sessionStorage ?? null;
  } catch {
    return null;
  }
}

function almacenCompartido(): Storage | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
}

function cargarSesion(): SesionPanel | null {
  try {
    const crudo = almacenDeLaPestana()?.getItem(CLAVE_SESION);
    const v = crudo ? (JSON.parse(crudo) as Partial<SesionPanel> | null) : null;
    if (!v || (v.rol !== 'administrador' && v.rol !== 'revisor') || typeof v.desde !== 'string') return null;
    return { rol: v.rol, desde: v.desde, reinicio: typeof v.reinicio === 'string' ? v.reinicio : null };
  } catch {
    return null;
  }
}

let sesion: SesionPanel | null = cargarSesion();
const oyentes = new Set<() => void>();

function fijarSesion(v: SesionPanel | null): void {
  sesion = v;
  try {
    const a = almacenDeLaPestana();
    if (v) a?.setItem(CLAVE_SESION, JSON.stringify(v));
    else a?.removeItem(CLAVE_SESION);
  } catch {
    // Sin almacenamiento de la pestaña: el rol dura hasta recargar.
  }
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

/** Rol con el que se usa el panel en esta pestaña (null: en la portada). */
export function useRolPanel(): RolEquipo | null {
  return useSyncExternalStore(
    suscribir,
    () => sesion?.rol ?? null,
    () => null,
  );
}

/** Rol vigente en esta pestaña, fuera de React (para las acciones). */
export function rolActual(): RolEquipo | null {
  return sesion?.rol ?? null;
}

export function usePuede(permiso: Permiso): boolean {
  return puede(useRolPanel(), permiso);
}

// ---------------------------------------------------------------------------
// Marca de revisión a mano (la lee la demo del conductor)
// ---------------------------------------------------------------------------

const ID_PESTANA = Math.random().toString(36).slice(2);
const CLAVE_MARCA = `${PREFIJO_REVISION_MANUAL}${ID_PESTANA}`;

const leerReinicio = (): string | null => {
  try {
    return almacenCompartido()?.getItem(CLAVE_REINICIO) ?? null;
  } catch {
    return null;
  }
};

function quitarMarca(): void {
  try {
    almacenCompartido()?.removeItem(CLAVE_MARCA);
  } catch {
    // Sin almacenamiento: no hay marca.
  }
}

/** Se reinició la demo desde otra pestaña: esta vuelve a la portada. */
function terminarPorReinicio(): void {
  fijarSesion(null);
  quitarMarca();
  mostrarToast('Se reinició la demo. Elige de nuevo con qué rol entrar.', 'info');
}

/** Renueva la marca de esta pestaña (o la quita, si no tiene rol). */
function renovarMarca(ahora = Date.now()): void {
  if (!sesion) {
    quitarMarca();
    return;
  }
  if (leerReinicio() !== sesion.reinicio) {
    terminarPorReinicio();
    return;
  }
  try {
    almacenCompartido()?.setItem(CLAVE_MARCA, JSON.stringify({ hasta: ahora + PLAZO_REVISION_MANUAL_MS }));
  } catch {
    // Sin almacenamiento: la demo del conductor sigue con la revisión simulada.
  }
}

/** Prepara lo que el panel necesita en los datos compartidos (sin escribir si no hace falta). */
export function prepararDatosDelPanel(): void {
  const s = useDemo.getState();
  const sinEquipo = s.equipo.length === 0 && s.accionesEquipo.length === 0;
  const sinReportesDeEjemplo = !s.reportes.some((r) => IDS_REPORTES_DE_EJEMPLO.includes(r.id));
  // Las revisiones simuladas ya programadas se quitan: ahora decide la persona del panel.
  const simuladas = s.pendientes.some((t) => t.tipo === 'revision_equipo');
  if (!sinEquipo && !sinReportesDeEjemplo && !simuladas) return;
  useDemo.setState({
    ...(sinEquipo ? semillaEquipo() : {}),
    ...(sinReportesDeEjemplo ? { reportes: [...reportesDeEjemplo(), ...s.reportes] } : {}),
    ...(simuladas ? { pendientes: s.pendientes.filter((t) => t.tipo !== 'revision_equipo') } : {}),
  });
}

/** Entra al panel (o cambia de rol) en esta pestaña: desde ahora la demo del conductor no aprueba sola. */
export function entrarComo(rol: RolEquipo): void {
  // Lo que esperaba para el registro queda firmado con el rol anterior.
  vaciarRegistroPendiente();
  fijarSesion({ rol, desde: sesion?.desde ?? new Date().toISOString(), reinicio: sesion?.reinicio ?? leerReinicio() });
  renovarMarca();
  prepararDatosDelPanel();
}

/** Sale del panel en esta pestaña: vuelve a la portada y, si no queda otra pestaña revisando, vuelve la revisión simulada. */
export function salirDelPanel(): void {
  vaciarRegistroPendiente();
  fijarSesion(null);
  quitarMarca();
}

/**
 * Mantiene la marca mientras la pestaña está abierta y la quita al cerrarla. La enciende el layout
 * raíz del panel. Devuelve una función para apagarla.
 */
export function iniciarSesionPanel(): () => void {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return () => undefined;
  renovarMarca();
  const reloj = setInterval(() => renovarMarca(), RENOVAR_REVISION_MANUAL_MS);
  // Al cerrar la pestaña (o recargarla): se escribe lo que esperaba para el registro y se quita la marca.
  const alOcultarPagina = () => {
    vaciarRegistroPendiente();
    quitarMarca();
  };
  // Al volver (por ejemplo, desde el historial del navegador o a la vista): se renueva.
  const alMostrarPagina = () => renovarMarca();
  const alCambiarVisibilidad = () => {
    if (document.visibilityState === 'visible') renovarMarca();
  };
  const alCambiarAlmacenamiento = (e: StorageEvent) => {
    if ((e.key === CLAVE_REINICIO || e.key === null) && sesion && leerReinicio() !== sesion.reinicio) terminarPorReinicio();
  };
  window.addEventListener('pagehide', alOcultarPagina);
  window.addEventListener('pageshow', alMostrarPagina);
  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  window.addEventListener('storage', alCambiarAlmacenamiento);
  return () => {
    clearInterval(reloj);
    window.removeEventListener('pagehide', alOcultarPagina);
    window.removeEventListener('pageshow', alMostrarPagina);
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    window.removeEventListener('storage', alCambiarAlmacenamiento);
  };
}

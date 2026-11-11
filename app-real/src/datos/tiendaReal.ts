// Estado de la app real en memoria (zustand SIN guardar en el navegador): fase de carga, sesión, la vista
// que leen las pantallas (VistaConductor) y los catálogos con sus mapas de ids.
// La base es la única fuente de verdad: después de cada guardado se vuelve a leer el perfil completo.
// En el navegador quedan solo la sesión de Supabase (localStorage, sb-<ref>-auth-token) y, en
// sessionStorage, el celular que se está verificando y los borradores de la pestaña. Los borradores se
// borran cada vez que la sesión termina (de cualquier forma) y cuando entra otra persona: son de quien
// los escribió y no deben aparecer en otra cuenta.
import { create } from 'zustand';

import { borrarTodosLosBorradores } from '@/datos/borradores';
import type { IngresoPendiente, VistaConductor } from '@/datos/puerto/tipos';

import { catalogosVacios, type MapasCatalogo, type TextoVigente } from './catalogos';
import { perfilVacio } from './perfil';

export type Fase = 'cargando' | 'listo' | 'sin_conexion';

export interface EstadoReal {
  fase: Fase;
  /** Id del usuario con sesión (o null). */
  uid: string | null;
  vista: VistaConductor;
  mapas: MapasCatalogo;
  textos: TextoVigente[];
  /** Ids de textos aceptados y vigentes. */
  aceptados: number[];
  autorizacionesCompletas: boolean;
  diasReconfirmar: number;
  /**
   * La sesión terminó o cambió de persona fuera del ingreso y del "Cerrar sesión" de esta pestaña
   * (en otra pestaña, o la base ya no la acepta). El layout del conductor lleva a la entrada que
   * corresponde, con el aviso `texto`. `n` cuenta las veces.
   */
  cambioDeSesion: { n: number; texto: string | null };
}

// ---------------------------------------------------------------------------
// Celular que se está verificando (sessionStorage): una recarga en A3 no pierde el número ni la espera.
// ---------------------------------------------------------------------------

export const CLAVE_INGRESO = 'dale-app-ingreso';

function almacenSesion(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

export function leerIngreso(): IngresoPendiente | null {
  try {
    const crudo = almacenSesion()?.getItem(CLAVE_INGRESO);
    if (!crudo) return null;
    const v = JSON.parse(crudo) as Partial<IngresoPendiente>;
    if (typeof v.celular !== 'string' || (v.canal !== 'whatsapp' && v.canal !== 'sms') || typeof v.pedidoEn !== 'number') return null;
    return { celular: v.celular, canal: v.canal, pedidoEn: v.pedidoEn };
  } catch {
    return null;
  }
}

export function guardarIngreso(i: IngresoPendiente | null): void {
  try {
    const s = almacenSesion();
    if (!s) return;
    if (i) s.setItem(CLAVE_INGRESO, JSON.stringify(i));
    else s.removeItem(CLAVE_INGRESO);
  } catch {
    // Sin almacenamiento: queda solo en memoria.
  }
  useTiendaReal.setState((e) => ({
    vista: {
      ...e.vista,
      ingreso: i,
      // Sin sesión, el celular que muestra A2/A3 es el que se está verificando.
      cuenta: e.uid ? e.vista.cuenta : { ...e.vista.cuenta, celular: i?.celular ?? e.vista.cuenta.celular },
    },
  }));
}

// ---------------------------------------------------------------------------
// Tienda
// ---------------------------------------------------------------------------

function estadoInicial(): EstadoReal {
  const c = catalogosVacios();
  const ingreso = leerIngreso();
  const p = perfilVacio(c.mapas, c.textos, ingreso?.celular ?? '');
  return {
    fase: 'cargando',
    uid: null,
    vista: { cuenta: p.cuenta, conductor: p.conductor, catalogos: c.catalogos, ingreso, textosAutorizacion: p.textosAutorizacion },
    mapas: c.mapas,
    textos: c.textos,
    aceptados: [],
    autorizacionesCompletas: false,
    diasReconfirmar: c.diasReconfirmar,
    cambioDeSesion: { n: 0, texto: null },
  };
}

export const useTiendaReal = create<EstadoReal>()(() => estadoInicial());

// ---------------------------------------------------------------------------
// Dueño de los borradores (sessionStorage): si entra otra persona en esta pestaña, se borran.
// ---------------------------------------------------------------------------

export const CLAVE_DUENO_BORRADORES = 'dale-app-borradores-de';

/** Llamar al leer el perfil de `uid`: si los borradores son de otra persona (o de nadie), se borran. */
export function asegurarDuenoBorradores(uid: string): void {
  let dueno: string | null = null;
  try {
    dueno = almacenSesion()?.getItem(CLAVE_DUENO_BORRADORES) ?? null;
  } catch {
    dueno = null;
  }
  if (dueno === uid) return;
  borrarTodosLosBorradores();
  try {
    almacenSesion()?.setItem(CLAVE_DUENO_BORRADORES, uid);
  } catch {
    // Sin almacenamiento: los borradores viven solo en memoria y ya se borraron.
  }
}

/** Deja la tienda sin sesión (conserva los catálogos ya leídos) y borra los borradores. */
export function limpiarSesion(): void {
  borrarTodosLosBorradores();
  try {
    almacenSesion()?.removeItem(CLAVE_DUENO_BORRADORES);
  } catch {
    // Sin almacenamiento.
  }
  const e = useTiendaReal.getState();
  const ingreso = leerIngreso();
  const p = perfilVacio(e.mapas, e.textos, ingreso?.celular ?? '');
  useTiendaReal.setState({
    uid: null,
    vista: { ...e.vista, cuenta: p.cuenta, conductor: p.conductor, ingreso, textosAutorizacion: p.textosAutorizacion },
    aceptados: [],
    autorizacionesCompletas: false,
  });
}

/** Avisa al layout del conductor que la sesión terminó o cambió (ver `cambioDeSesion`). */
export function avisarCambioDeSesion(texto: string | null): void {
  useTiendaReal.setState((e) => ({ cambioDeSesion: { n: e.cambioDeSesion.n + 1, texto } }));
}

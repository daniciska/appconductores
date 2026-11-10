// La sesión de Supabase Auth en la app real: qué hacer cuando la base rechaza el token y cómo cerrar
// la sesión en este equipo aunque no haya conexión. Recibe el cliente: lo prueba tests/sesion.test.ts
// con el supabase-js de verdad y el Supabase simulado.
//
// - La base rechaza el token (PGRST301, "JWT expired"; por ejemplo, si se cambian las claves de firma o
//   el reloj del teléfono está muy adelantado): se renueva la sesión UNA vez y se repite. Si no se puede
//   renovar porque no hay red, es un error de conexión; si el servidor no la renueva, la sesión venció y
//   hay que volver a entrar (especificación, sección 10).
// - Cerrar sesión: primero en este equipo y después, si se puede, en el servidor. supabase-js, en cambio,
//   primero intenta renovar un token vencido: sin conexión se demora unos 25 s y al final NO borra la
//   sesión guardada (la pestaña estuvo más de 1 hora sin red o en segundo plano). Por eso la app borra
//   la sesión guardada, llama a signOut (ya sin sesión: termina al instante y avisa SIGNED_OUT a las
//   otras pestañas) y, si el token seguía vigente, avisa al servidor con ese token (sin esperar).
//   Si en ese momento supabase-js estaba renovando el token, descarta lo renovado (la sesión guardada
//   ya no está: "commit guard" de auth-js).
import type { SupabaseClient } from '@supabase/supabase-js';

import { esErrorDeRed, esSesionVencida, type ErrorSupabase } from './errores.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any>;

export type Lectura<T> = { datos: T; error: null } | { datos: null; error: ErrorSupabase };

/** 'renovada' · 'sin_conexion' (se puede reintentar) · 'vencida' (hay que volver a entrar). */
export type Renovacion = 'renovada' | 'sin_conexion' | 'vencida';

export async function renovarSesion(cliente: Cliente): Promise<Renovacion> {
  const { error } = await cliente.auth.refreshSession();
  if (!error) return 'renovada';
  return esErrorDeRed(error) ? 'sin_conexion' : 'vencida';
}

const SIN_RED: ErrorSupabase = { name: 'AuthRetryableFetchError', message: 'Failed to fetch', status: 0 };

/**
 * Corre una lectura; si la base rechaza el token, renueva la sesión una vez y la repite.
 * `vencida`: no se pudo renovar (quien llama cierra la sesión).
 */
export async function leerConSesion<T>(cliente: Cliente, leer: () => Promise<Lectura<T>>): Promise<Lectura<T> & { vencida?: true }> {
  const r = await leer();
  if (!r.error || !esSesionVencida(r.error)) return r;
  const renovacion = await renovarSesion(cliente);
  if (renovacion === 'renovada') return leer();
  if (renovacion === 'sin_conexion') return { datos: null, error: SIN_RED };
  return { ...r, vencida: true };
}

/** Lo que la app necesita de la sesión guardada para avisar al servidor. */
export interface SesionGuardada {
  access_token: string;
  /** Segundos desde 1970. */
  expires_at?: number;
}

/** Cómo leer y borrar la sesión guardada en este equipo (en la web, localStorage; ver supabase.ts). */
export interface AlmacenSesion {
  leer: () => Promise<SesionGuardada | null>;
  /** Borra la sesión guardada; devuelve si había una. */
  borrar: () => Promise<boolean>;
}

/**
 * Cierra la sesión solo en este equipo (scope 'local'; 'global' la cerraría en todos), también sin
 * conexión y sin esperar a la red. Devuelve el aviso al servidor (para las pruebas; la app no lo espera):
 * true si el servidor anuló la sesión, false si no se pudo o el token ya había vencido.
 */
export async function cerrarSesionEnEsteEquipo(cliente: Cliente, almacen: AlmacenSesion): Promise<{ avisoAlServidor: Promise<boolean> }> {
  const guardada = await almacen.leer();
  await almacen.borrar();
  // Ya sin sesión guardada, signOut no usa la red. Puede tardar si supabase-js está renovando el token
  // (tiene el candado): no se lo espera más de 1,5 s; la sesión ya no está en este equipo.
  await Promise.race([cliente.auth.signOut({ scope: 'local' }), new Promise((r) => setTimeout(r, 1500))]);
  const vigente = !!guardada?.access_token && (guardada.expires_at ?? 0) * 1000 > Date.now() + 10_000;
  const avisoAlServidor = vigente
    ? cliente.auth.admin.signOut(guardada!.access_token, 'local').then(
        (r) => !r.error,
        () => false,
      )
    : Promise.resolve(false);
  return { avisoAlServidor };
}

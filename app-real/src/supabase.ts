// Cliente único de Supabase de la app real (sigue la guía oficial de Supabase para Expo y React Native).
// - Sesión: en la web, localStorage (clave sb-<ref>-auth-token); en el celular (etapa de tiendas),
//   AsyncStorage. El token dura 1 hora y se renueva solo.
// - El ingreso por celular no usa enlaces: detectSessionInUrl apagado.
// - Cada llamada tiene un tiempo máximo de 15 s: sin red, la app avisa en vez de quedarse esperando.
// - Solo la clave publicable (ver config.ts). Nunca la service_role.
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { CONFIG } from './config';
import type { AlmacenSesion, SesionGuardada } from './datos/sesion';
import type { Database } from './tiposBd';

/** Tiempo máximo de cada llamada a Supabase. */
export const TIEMPO_MAXIMO_MS = 15_000;

const fetchConTiempo: typeof fetch = (url, opciones) => {
  const control = new AbortController();
  const externo = opciones?.signal;
  if (externo) {
    if (externo.aborted) control.abort();
    else externo.addEventListener('abort', () => control.abort(), { once: true });
  }
  const t = setTimeout(() => control.abort(), TIEMPO_MAXIMO_MS);
  return fetch(url, { ...opciones, signal: control.signal }).finally(() => clearTimeout(t));
};

export const supabase = createClient<Database>(CONFIG.url, CONFIG.clavePublica, {
  auth: {
    // En la web, supabase-js usa localStorage y coordina las pestañas con su propio candado.
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: { fetch: fetchConTiempo },
});

// En el celular (etapa de tiendas): renovar el token solo con la app abierta. En la web ya es automático.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (s) => {
    if (s === 'active') void supabase.auth.startAutoRefresh();
    else void supabase.auth.stopAutoRefresh();
  });
}

/** Nombre de la sesión guardada en el navegador (para borrarla en las pruebas o al cerrar sesión). */
export const CLAVE_SESION = `sb-${CONFIG.ref}-auth-token`;

const CLAVES_SESION = [CLAVE_SESION, `${CLAVE_SESION}-user`, `${CLAVE_SESION}-code-verifier`];

/**
 * La sesión guardada en este equipo (para cerrarla sin esperar a la red: ver datos/sesion.ts). Leer y
 * borrar son las mismas claves que usa supabase-js.
 */
export const almacenSesion: AlmacenSesion = {
  async leer() {
    try {
      const crudo = Platform.OS === 'web' ? (typeof localStorage === 'undefined' ? null : localStorage.getItem(CLAVE_SESION)) : await AsyncStorage.getItem(CLAVE_SESION);
      if (!crudo) return null;
      const s = JSON.parse(crudo) as Partial<SesionGuardada>;
      return typeof s.access_token === 'string' ? { access_token: s.access_token, expires_at: s.expires_at } : null;
    } catch {
      return null;
    }
  },
  async borrar() {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage === 'undefined') return false;
        const habia = localStorage.getItem(CLAVE_SESION) !== null;
        for (const k of CLAVES_SESION) localStorage.removeItem(k);
        return habia;
      }
      const habia = (await AsyncStorage.getItem(CLAVE_SESION)) !== null;
      await AsyncStorage.multiRemove(CLAVES_SESION);
      return habia;
    } catch {
      return false;
    }
  },
};

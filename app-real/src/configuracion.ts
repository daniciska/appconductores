// Revisión de la configuración pública de la app real (pura: la prueban tests/config.test.ts y
// scripts/exportar.mjs antes de armar). La lectura de las variables está en ./config.ts.
//
// Reglas: la dirección tiene que ser de un proyecto de Supabase (https://<ref>.supabase.co) y la clave
// tiene que ser PUBLICABLE: sb_publishable_… o la anon antigua (un JWT con rol anon). Cualquier otra se
// rechaza, y con eso cualquier clave secreta. (Los textos no nombran las claves secretas a propósito: así
// la revisión del export puede exigir que esos nombres no aparezcan en el paquete.)

export interface Configuracion {
  url: string;
  /** Clave publicable (sb_publishable_…) o, si no hay otra, la anon antigua (JWT con rol anon). */
  clavePublica: string;
  /** Mientras solo entren los números de prueba del equipo (cambia dos textos de ingreso). */
  codigosDePrueba: boolean;
  /** Referencia del proyecto (zflalaqimacsnlvurzeb): nombre de la sesión guardada en el navegador. */
  ref: string;
}

export interface VariablesConfiguracion {
  url?: string;
  clave?: string;
  codigosDePrueba?: string;
}

function rolDeJwt(clave: string): string | null {
  const partes = clave.split('.');
  if (partes.length !== 3) return null;
  try {
    const b64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const relleno = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const texto = typeof atob === 'function' ? atob(relleno) : '';
    const datos = JSON.parse(texto) as { role?: unknown };
    return typeof datos.role === 'string' ? datos.role : '';
  } catch {
    return '';
  }
}

/** Revisa las variables y devuelve la configuración. Lanza un error con el motivo si algo no sirve. */
export function revisarConfiguracion(v: VariablesConfiguracion): Configuracion {
  const url = (v.url ?? '').trim().replace(/\/+$/, '');
  const clave = (v.clave ?? '').trim();
  if (!url) throw new Error('Falta EXPO_PUBLIC_SUPABASE_URL (la dirección del proyecto de Supabase).');
  const m = /^https:\/\/([a-z0-9]{20})\.supabase\.co$/.exec(url);
  if (!m) throw new Error(`EXPO_PUBLIC_SUPABASE_URL no parece de un proyecto de Supabase: ${url}`);
  if (!clave) throw new Error('Falta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (la clave publicable).');
  const rol = rolDeJwt(clave);
  const publicable = rol !== null ? rol === 'anon' : /^sb_publishable_[A-Za-z0-9_-]+$/.test(clave);
  if (!publicable) {
    throw new Error('La clave no es la publicable (sb_publishable_…). Una clave secreta nunca va en la app: usa la publicable.');
  }
  return { url, clavePublica: clave, codigosDePrueba: (v.codigosDePrueba ?? '').trim() === '1', ref: m[1] };
}

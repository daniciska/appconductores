// Clave de entrada de la demo (decisión de la dueña, 9-nov): el sitio de Netlify queda público y la
// demo pide una clave una vez por navegador. Es la misma para la demo del conductor y para /panel
// (mismo sitio, mismo localStorage). Protección liviana: alguien técnico podría saltársela; está bien
// porque todo es de ejemplo.
//
// La clave NO está escrita en el repositorio: solo su SHA-256. Para cambiarla, poner aquí el SHA-256
// de la nueva (en minúsculas y sin espacios al inicio ni al final), por ejemplo:
//   printf '%s' 'nueva-clave' | sha256sum
// Al cambiarla, todos los navegadores la vuelven a pedir (lo guardado deja de coincidir).

/** SHA-256 de la clave vigente. */
export const HASH_CLAVE_DEMO = 'd950af57714f1e1fed4eecadfebc9c2f99c43c0170a6125cc4a5a07b6343a146';

/** Dónde recuerda el navegador que ya se ingresó la clave (guarda el hash, no la clave). */
export const CLAVE_ACCESO = 'dale-demo-acceso';

/** Lo que escribió la persona, como se compara: sin espacios a los lados y en minúsculas. */
export function normalizarClave(texto: string): string {
  return texto.trim().toLowerCase();
}

/** SHA-256 en hexadecimal, con Web Crypto (navegador con https o localhost, y Node 20+). */
export async function sha256Hex(texto: string): Promise<string | null> {
  const sutil = globalThis.crypto?.subtle;
  if (!sutil) return null;
  const datos = new TextEncoder().encode(texto);
  const resumen = await sutil.digest('SHA-256', datos);
  return Array.from(new Uint8Array(resumen), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** true si la clave es la correcta; null si este navegador no puede comprobarla (sin Web Crypto). */
export async function esClaveCorrecta(texto: string, hash = HASH_CLAVE_DEMO): Promise<boolean | null> {
  const calculado = await sha256Hex(normalizarClave(texto));
  if (calculado === null) return null;
  return calculado === hash;
}

function almacen(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Si este navegador ya ingresó la clave vigente. Sin almacenamiento disponible, se pide cada vez. */
export function accesoRecordado(hash = HASH_CLAVE_DEMO): boolean {
  try {
    return almacen()?.getItem(CLAVE_ACCESO) === hash;
  } catch {
    return false;
  }
}

/** Recuerda en este navegador que ya se ingresó la clave. */
export function recordarAcceso(hash = HASH_CLAVE_DEMO): void {
  try {
    almacen()?.setItem(CLAVE_ACCESO, hash);
  } catch {
    // Sin almacenamiento (modo privado estricto): se volverá a pedir al recargar.
  }
}

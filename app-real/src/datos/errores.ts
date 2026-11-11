// Traduce los errores de Supabase (Auth, PostgREST y red) a textos cortos para la pantalla.
// Puro: lo prueba tests/errores.test.ts.

/** Lo que importa de un error de supabase-js (AuthApiError, PostgrestError o un error de red). */
export interface ErrorSupabase {
  name?: string;
  code?: string;
  message?: string;
  status?: number;
  details?: string;
}

export const TEXTO = {
  conexion: 'Revisa tu conexión e inténtalo de nuevo.',
  guardarConexion: 'No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.',
  guardar: 'No pudimos guardar. Inténtalo de nuevo.',
  soloEquipo: 'Por ahora solo pueden entrar los celulares del equipo.',
  noSeEnvio: 'No pudimos enviar el código. Inténtalo de nuevo.',
  sinCelular: 'El ingreso con celular no está disponible. Avísale al equipo.',
  demasiados: 'Demasiados intentos. Espera unos minutos.',
  numero: 'Revisa tu número: son 9 dígitos y empieza con 9.',
  codigo: 'El código no es correcto o ya venció.',
  noVerifico: 'No pudimos verificar el código. Inténtalo de nuevo.',
  sinCuenta: 'No pudimos crear tu cuenta. Avísale al equipo.',
  cuentaNoEncontrada: 'No encontramos tu cuenta. Vuelve a entrar.',
  sinPermiso: 'No tienes permiso para hacer esto.',
  opcionNoDisponible: 'Esa opción ya no está disponible. Vuelve a abrir la pantalla.',
  sinTextos: 'Faltan los textos de autorización. Avísale al equipo.',
  /** A4 sin marcar todas (la pantalla ya lo impide; es el resguardo de la acción). */
  marcarTodas: 'Marca todas las autorizaciones para continuar.',
  sesionVencida: 'Tu sesión venció. Vuelve a entrar.',
  /** Se cerró fuera de esta pestaña (en otra pestaña, o la base ya no la acepta). */
  sesionCerrada: 'Tu sesión se cerró. Vuelve a entrar.',
  /** El plan se guardó, pero no se pudo volver a leer el perfil (el próximo intento lo lee primero). */
  guardadoSinReleer: 'Se guardó, pero se cortó la conexión. Inténtalo de nuevo.',
} as const;

/** ¿Es un problema de red o de tiempo (no llegó respuesta del servidor)? */
export function esErrorDeRed(e: ErrorSupabase | null | undefined): boolean {
  if (!e) return false;
  const nombre = e.name ?? '';
  const mensaje = e.message ?? '';
  if (nombre === 'AuthRetryableFetchError' || nombre === 'AbortError' || nombre === 'TypeError') return true;
  if (e.status === 0) return true;
  return /^(TypeError|AbortError|FetchError|TimeoutError)\b|Failed to fetch|NetworkError|Load failed|signal is aborted|aborted a request/i.test(mensaje);
}

/** "…only request this after 37 seconds." → 37 (o 60 si no se puede leer). */
export function segundosDeEspera(mensaje: string | undefined): number {
  const m = /(\d+)\s*(segundos?|seconds?|s\b)/i.exec(mensaje ?? '');
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 && n <= 3600 ? n : 60;
}

export const textoEspera = (mensaje: string | undefined) => `Espera ${segundosDeEspera(mensaje)} segundos para pedir otro código.`;

/** Error al pedir el código (A2 y "Reenviar…" de A3). */
export function textoErrorPedirCodigo(e: ErrorSupabase, codigosDePrueba: boolean): string {
  if (esErrorDeRed(e)) return TEXTO.conexion;
  switch (e.code) {
    case 'sms_send_failed':
      // Con números de prueba, el proveedor es de relleno: un número que no está en la lista no recibe nada.
      return codigosDePrueba ? TEXTO.soloEquipo : TEXTO.noSeEnvio;
    case 'signup_disabled':
    case 'otp_disabled':
      return codigosDePrueba ? TEXTO.soloEquipo : TEXTO.sinCelular;
    case 'over_sms_send_rate_limit':
      return textoEspera(e.message);
    case 'phone_provider_disabled':
    case 'sms_provider_disabled':
      return TEXTO.sinCelular;
    case 'over_request_rate_limit':
      return TEXTO.demasiados;
    case 'validation_failed':
      return TEXTO.numero;
  }
  if (e.status === 429) return TEXTO.demasiados;
  return TEXTO.noSeEnvio;
}

/** Error al verificar el código (A3). */
export function textoErrorVerificar(e: ErrorSupabase): string {
  if (esErrorDeRed(e)) return TEXTO.conexion;
  if (e.code === 'otp_expired' || e.code === 'invalid_credentials' || e.status === 403) return TEXTO.codigo;
  if (e.code === 'over_sms_send_rate_limit') return textoEspera(e.message);
  if (e.code === 'over_request_rate_limit' || e.status === 429) return TEXTO.demasiados;
  return TEXTO.noVerifico;
}

/** ¿El token venció o no sirve? (se intenta renovar la sesión una vez). */
export function esSesionVencida(e: ErrorSupabase | null | undefined): boolean {
  if (!e) return false;
  return e.code === 'PGRST301' || e.code === 'PGRST303' || /JWT expired|invalid JWT/i.test(e.message ?? '');
}

/** Error al guardar (PostgREST): el texto que ve la persona. */
export function textoErrorGuardar(e: ErrorSupabase): string {
  if (esErrorDeRed(e)) return TEXTO.guardarConexion;
  // Las reglas de la base vienen en español y se muestran tal cual ("Tienes que tener 18 años o más.").
  if (e.code === '23514' && e.message) return e.message;
  if (e.code === '42501' || /row-level security/i.test(e.message ?? '')) return TEXTO.sinPermiso;
  if (e.code === '23503') return TEXTO.opcionNoDisponible;
  if (esSesionVencida(e)) return TEXTO.sesionVencida;
  return TEXTO.guardar;
}

// Guardia de rutas de la app real (pura: la prueba tests/guardia.test.ts).
//
// | Estado                                         | Puede ver                         | Si no, va a                |
// |------------------------------------------------|-----------------------------------|----------------------------|
// | Sin sesión                                     | bienvenida, celular, código (*)   | /conductor/bienvenida      |
// | Con sesión y sin las autorizaciones vigentes   | autorizaciones                    | /conductor/autorizaciones  |
// | Con autorizaciones y sin registrarse (Paso 1)  | autorizaciones, registro/1        | /conductor/registro/1      |
// | Registrado                                     | todo lo demás                     | /conductor/inicio          |
// (*) El código, solo si hay un código pedido; si no, vuelve a /conductor/celular.

export type RutaApp =
  | '/conductor'
  | '/conductor/bienvenida'
  | '/conductor/celular'
  | '/conductor/codigo'
  | '/conductor/autorizaciones'
  | '/conductor/registro/1'
  | '/conductor/inicio';

export interface EstadoGuardia {
  conSesion: boolean;
  autorizacionesCompletas: boolean;
  registrado: boolean;
  /** Hay un código pedido y sin verificar. */
  codigoPedido: boolean;
}

/** A dónde debe ir cada persona al entrar a /conductor. */
export function rutaDeEntrada(e: EstadoGuardia): RutaApp {
  if (!e.conSesion) return '/conductor/bienvenida';
  if (!e.autorizacionesCompletas) return '/conductor/autorizaciones';
  if (!e.registrado) return '/conductor/registro/1';
  return '/conductor/inicio';
}

/** null si puede ver la ruta; si no, a dónde llevarla. */
export function destinoGuardia(ruta: string, e: EstadoGuardia): RutaApp | null {
  const r = ruta.replace(/\/+$/, '') || '/';
  if (r === '/' || r === '/conductor') return null; // las entradas deciden solas
  const ingreso = ['/conductor/bienvenida', '/conductor/celular', '/conductor/codigo'];
  if (!e.conSesion) {
    if (r === '/conductor/codigo' && !e.codigoPedido) return '/conductor/celular';
    return ingreso.includes(r) ? null : '/conductor/bienvenida';
  }
  if (!e.autorizacionesCompletas) return r === '/conductor/autorizaciones' ? null : '/conductor/autorizaciones';
  if (!e.registrado) return r === '/conductor/autorizaciones' || r === '/conductor/registro/1' ? null : '/conductor/registro/1';
  return ingreso.includes(r) ? '/conductor/inicio' : null;
}

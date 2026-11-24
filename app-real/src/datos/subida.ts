// Subir un documento (Paso 5) con supabase-js: el archivo al espacio PRIVADO "documentos" de Storage
// y después la fila en public.documentos. Recibe el cliente: lo prueba tests/subida.test.ts con el
// supabase-js de verdad y el Supabase simulado (Storage incluido).
//
// Orden y por qué:
//   1. El archivo va a '<uid>/<uuid>.<ext>' (la base y Storage exigen esa forma; nadie elige el nombre).
//      Cada subida usa un nombre nuevo: nunca se pisa un archivo (no hay UPDATE en Storage).
//   2. La fila en documentos: la base revisa el archivo (que exista, sea suyo y del formato pedido),
//      la autorización de revisión y las fechas; después corre el método de validación.
//   3. Si se cortó la red al guardar la fila, se pregunta si quedó (la respuesta pudo perderse).
//      Si la fila no se pudo guardar, se borra el archivo recién subido (Storage solo deja borrar
//      archivos que ningún documento vigente usa: si la fila sí quedó y solo se perdió la respuesta,
//      el borrado no pasa y el documento queda bien).
//   4. Limpieza: los archivos de la carpeta propia que ya no usa ningún documento (los reemplazados y
//      las subidas que no terminaron) se borran. Si falla, se intenta la próxima vez.
import type { SupabaseClient } from '@supabase/supabase-js';

import { archivosSobrantes, rutaArchivo, type DocumentoReal } from './documentos.ts';
import { TEXTO, esErrorDeRed, esSesionVencida, textoErrorGuardar, type ErrorSupabase } from './errores.ts';
import { renovarSesion } from './sesion.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any>;

export const ESPACIO = 'documentos';

export const TEXTO_SUBIDA = {
  conexion: 'No pudimos subir el archivo. Revisa tu conexión e inténtalo de nuevo.',
  pesado: 'El archivo pesa más de 10 MB. Elige otro.',
  formato: 'Ese tipo de archivo no se acepta. Elige una foto o un PDF.',
  subir: 'No pudimos subir el archivo. Inténtalo de nuevo.',
} as const;

export interface PedidoSubida {
  uid: string;
  tipoId: number;
  archivo: Blob;
  mime: string;
  /** Nombre del archivo en el espacio (uuid). */
  uuid: string;
  emitidoEn: string | null;
  venceEn: string | null;
}

export type ResultadoSubida = { ok: true; valor: { id: number; ruta: string } } | { ok: false; error: string; vencida?: true };

/** Error de Storage → texto para la pantalla. */
export function textoErrorStorage(e: (ErrorSupabase & { statusCode?: string | number; error?: string }) | null | undefined): string {
  if (!e) return TEXTO_SUBIDA.subir;
  if (esErrorDeRed(e) || e.name === 'StorageUnknownError') return TEXTO_SUBIDA.conexion;
  const codigo = String(e.statusCode ?? e.status ?? '');
  const texto = `${e.error ?? ''} ${e.message ?? ''}`;
  if (codigo === '413' || /too large|exceeded the maximum allowed size|Payload too large/i.test(texto)) return TEXTO_SUBIDA.pesado;
  if (codigo === '415' || /mime type|invalid_mime_type/i.test(texto)) return TEXTO_SUBIDA.formato;
  if (/row-level security|Unauthorized/i.test(texto) || codigo === '403') return TEXTO.sinPermiso;
  return TEXTO_SUBIDA.subir;
}

/** Corre `fn`; si la base rechaza el token, renueva la sesión UNA vez y la repite. */
async function conSesion<T extends { error: ErrorSupabase | null }>(cliente: Cliente, fn: () => Promise<T>): Promise<T | { vencida: true } | { sinConexion: true }> {
  const r = await fn();
  // PostgREST: PGRST301 / "JWT expired". Storage: 'InvalidJWT' / '"exp" claim timestamp check failed'.
  const jwt = r.error && (esSesionVencida(r.error) || /jwt|"?exp"? claim/i.test(r.error.message ?? ''));
  if (!jwt) return r;
  const renovacion = await renovarSesion(cliente);
  if (renovacion === 'sin_conexion') return { sinConexion: true };
  if (renovacion === 'vencida') return { vencida: true };
  return fn();
}

export async function subirDocumento(cliente: Cliente, p: PedidoSubida): Promise<ResultadoSubida> {
  const ruta = rutaArchivo(p.uid, p.uuid, p.mime);
  const espacio = cliente.storage.from(ESPACIO);

  // Se envía como bytes con su tipo en la cabecera: así Storage guarda exactamente ese tipo (con un
  // Blob, supabase-js arma un formulario y el tipo sería el que traiga el archivo, a veces vacío).
  let bytes: ArrayBuffer;
  try {
    bytes = await p.archivo.arrayBuffer();
  } catch {
    return { ok: false, error: 'No pudimos leer el archivo. Elige otro.' };
  }
  const subida = await conSesion(cliente, async () => {
    const r = await espacio.upload(ruta, bytes, { contentType: p.mime, upsert: false, cacheControl: '3600' });
    return { error: r.error as ErrorSupabase | null };
  });
  if ('vencida' in subida) return { ok: false, error: TEXTO.sesionVencida, vencida: true };
  if ('sinConexion' in subida) return { ok: false, error: TEXTO_SUBIDA.conexion };
  if (subida.error) {
    if (/row-level security|jwt/i.test(subida.error.message ?? '')) console.warn('Dale Contacto: Storage no dejó subir', subida.error.message);
    return { ok: false, error: textoErrorStorage(subida.error) };
  }

  const fila = {
    cuenta_id: p.uid,
    tipo_documento_id: p.tipoId,
    archivo_ruta: ruta,
    archivo_tipo: p.mime,
    archivo_bytes: bytes.byteLength,
    emitido_en: p.emitidoEn,
    vence_en: p.venceEn,
  };
  const insercion = await conSesion(cliente, async () => {
    const r = await cliente.from('documentos').insert(fila).select('id');
    return { error: r.error ? { ...r.error, status: r.status } : null, data: r.data as { id: number }[] | null };
  });
  if ('vencida' in insercion) return { ok: false, error: TEXTO.sesionVencida, vencida: true };
  const sinRespuesta = 'sinConexion' in insercion || (insercion.error && esErrorDeRed(insercion.error));
  if (sinRespuesta) {
    // Se cortó la red: la fila pudo quedar guardada y solo perderse la respuesta. Se pregunta antes
    // de decir que no se guardó (si no, la persona vuelve a subir y reemplaza su propio documento).
    const ya = await filaGuardada(cliente, ruta);
    if (ya) return { ok: true, valor: { id: ya, ruta } };
  }
  if ('sinConexion' in insercion || insercion.error || !insercion.data?.[0]) {
    // No quedó la fila: el archivo no lo usa nadie y se borra (si quedó y solo se perdió la respuesta,
    // Storage no deja borrarlo). Sin esperar a que termine: lo que no se borre lo limpia la próxima subida.
    void espacio.remove([ruta]).catch(() => undefined);
    if ('sinConexion' in insercion) return { ok: false, error: TEXTO.guardarConexion };
    if (insercion.error) {
      if (insercion.error.code === '42501') console.warn('Dale Contacto: la base no dejó guardar el documento', insercion.error.message);
      return { ok: false, error: textoErrorGuardar(insercion.error) };
    }
    return { ok: false, error: TEXTO.guardar };
  }
  return { ok: true, valor: { id: insercion.data[0].id, ruta } };
}

/** El id del documento guardado con ese archivo, o null (si no está o no se pudo preguntar). */
async function filaGuardada(cliente: Cliente, ruta: string): Promise<number | null> {
  try {
    const r = await cliente.from('documentos').select('id').eq('archivo_ruta', ruta).limit(1);
    const fila = (r.data as { id: number }[] | null)?.[0];
    return !r.error && fila ? fila.id : null;
  } catch {
    return null;
  }
}

/** Borra los archivos de la carpeta propia que ningún documento vigente usa. Devuelve cuántos borró. */
export async function limpiarArchivosSobrantes(cliente: Cliente, uid: string, documentos: DocumentoReal[]): Promise<number> {
  const espacio = cliente.storage.from(ESPACIO);
  const lista = await espacio.list(uid, { limit: 1000 });
  if (lista.error || !lista.data) return 0;
  const nombres = lista.data.map((x) => x.name).filter((n) => n && !n.startsWith('.'));
  const sobrantes = archivosSobrantes(nombres, uid, documentos);
  if (sobrantes.length === 0) return 0;
  const r = await espacio.remove(sobrantes);
  return r.error ? 0 : (r.data?.length ?? 0);
}

/** Un nombre único para el archivo (uuid v4). */
export function nuevoUuid(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

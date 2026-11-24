// Documentos del conductor (Paso 5) en la app real: catálogo, estado de cada tipo, avisos de
// vencimiento y las reglas del formulario (las mismas de la base: supabase/migrations/
// 20261124150000_documentos_conductor.sql). Puro: lo prueba tests/documentos.test.ts.
//
// Cómo se decide (lo hace la base; aquí solo se muestra):
//   - Cada subida es una fila nueva. La anterior del mismo tipo queda "reemplazada" (si estaba
//     aprobada, sigue valiendo hasta que se apruebe la nueva).
//   - El método de validación corre en la base. Hoy aprueba todo; mañana puede dejarlos "en revisión"
//     o "no aprobado": la app muestra cualquiera de esos estados sin cambiar.
//   - Un documento aprobado vale hasta su fecha de vencimiento (cédula y licencia). Desde N meses antes
//     (ajuste meses_aviso_vencimiento_documentos) se avisa dentro de la app.

export type FormatoDocumento = 'foto' | 'pdf';
export type FechaPedida = 'vencimiento' | 'emision' | 'ninguna';
export type EstadoDocumentoBase = 'en_revision' | 'aprobado' | 'no_aprobado' | 'vencido' | 'reemplazado';

export interface TipoDocumentoReal {
  id: number;
  /** 'cedula', 'licencia', 'hoja_vida', 'antecedentes'… (identifica su guía y su ruta). */
  clave: string;
  nombre: string;
  corto: string;
  ayuda: string;
  formato: FormatoDocumento;
  fechaPedida: FechaPedida;
  etiquetaFecha: string | null;
  antiguedadMaximaDias: number | null;
  enlace: string | null;
  obligatorio: boolean;
  orden: number;
}

export interface DocumentoReal {
  id: number;
  tipoId: number;
  estado: EstadoDocumentoBase;
  /** ISO. */
  subidoEn: string;
  /** 'aaaa-mm-dd'. */
  emitidoEn: string | null;
  venceEn: string | null;
  revisadoEn: string | null;
  archivoTipo: string;
  ruta: string;
}

export interface FilaTipoDocumento {
  id: number;
  clave: string;
  nombre: string;
  corto: string;
  ayuda: string | null;
  para_quien: string;
  obligatorio: boolean;
  formato: string;
  fecha_pedida: string;
  etiqueta_fecha: string | null;
  antiguedad_maxima_dias: number | null;
  enlace_obtener: string | null;
  orden: number;
  activo: boolean;
}

export interface FilaDocumento {
  id: number;
  tipo_documento_id: number;
  estado: string;
  subido_en: string;
  emitido_en: string | null;
  vence_en: string | null;
  revisado_en: string | null;
  archivo_tipo: string;
  archivo_ruta: string;
}

/** Meses de aviso si el ajuste no se puede leer. */
export const MESES_AVISO_POR_DEFECTO = 3;
/** Tamaño máximo de un archivo (el mismo límite del espacio documentos de Storage). */
export const BYTES_MAXIMOS = 10 * 1024 * 1024;
/** Clave del texto de autorización que se pide antes de subir el primer documento. */
export const CLAVE_TEXTO_REVISION = 'revision_documentos';

const ESTADOS: EstadoDocumentoBase[] = ['en_revision', 'aprobado', 'no_aprobado', 'vencido', 'reemplazado'];
const FECHAS: FechaPedida[] = ['vencimiento', 'emision', 'ninguna'];

/** Los tipos que pide el conductor, activos y en orden. */
export function mapearTiposDocumento(filas: FilaTipoDocumento[]): TipoDocumentoReal[] {
  return filas
    .filter((t) => t.activo && t.para_quien === 'conductor' && (t.formato === 'foto' || t.formato === 'pdf'))
    .sort((a, b) => a.orden - b.orden)
    .map((t) => ({
      id: t.id,
      clave: t.clave,
      nombre: t.nombre,
      corto: t.corto,
      ayuda: t.ayuda ?? '',
      formato: t.formato as FormatoDocumento,
      fechaPedida: FECHAS.includes(t.fecha_pedida as FechaPedida) ? (t.fecha_pedida as FechaPedida) : 'ninguna',
      etiquetaFecha: t.etiqueta_fecha,
      antiguedadMaximaDias: t.antiguedad_maxima_dias,
      enlace: t.enlace_obtener,
      obligatorio: t.obligatorio,
      orden: t.orden,
    }));
}

export function mapearDocumentos(filas: FilaDocumento[]): DocumentoReal[] {
  return filas
    .filter((d) => ESTADOS.includes(d.estado as EstadoDocumentoBase))
    .map((d) => ({
      id: d.id,
      tipoId: d.tipo_documento_id,
      estado: d.estado as EstadoDocumentoBase,
      subidoEn: d.subido_en,
      emitidoEn: d.emitido_en,
      venceEn: d.vence_en,
      revisadoEn: d.revisado_en,
      archivoTipo: d.archivo_tipo,
      ruta: d.archivo_ruta,
    }));
}

/** Meses de aviso leídos del ajuste (entero entre 1 y 24; si no, 3). */
export function mesesAviso(valor: unknown): number {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 1 && n <= 24 ? n : MESES_AVISO_POR_DEFECTO;
}

// ---------------------------------------------------------------------------
// Fechas (como la base: el día de hoy en Chile)
// ---------------------------------------------------------------------------

/** Hoy en Chile, 'aaaa-mm-dd'. */
export function hoyEnChile(ms = Date.now()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}

/** 'aaaa-mm-dd' + n meses (el último día del mes si no existe: 31-ene + 1 = 28/29-feb, como Postgres). */
export function sumarMeses(iso: string, meses: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  const total = a * 12 + (m - 1) + meses;
  const anio = Math.floor(total / 12);
  const mes = (total % 12) + 1;
  const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  return `${anio}-${String(mes).padStart(2, '0')}-${String(Math.min(d, ultimo)).padStart(2, '0')}`;
}

export function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** 'aaaa-mm-dd' → 'dd/mm/aaaa'. */
export function fechaCorta(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** 'dd/mm/aaaa' → 'aaaa-mm-dd' (o null si no es una fecha real). */
export function fechaDeTexto(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const f = new Date(Date.UTC(a, mes - 1, d));
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d || a < 1900) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/**
 * Error de la fecha que se anota al subir (o null si está bien). Las mismas reglas que la base:
 * vencimiento hoy o después (y no más de 20 años); emisión no futura y, si el tipo lo pide, de N días o menos.
 */
export function errorFechaDocumento(texto: string, tipo: Pick<TipoDocumentoReal, 'fechaPedida' | 'antiguedadMaximaDias' | 'etiquetaFecha'>, hoy: string): string | null {
  if (tipo.fechaPedida === 'ninguna') return null;
  const t = texto.trim();
  if (!t) return tipo.fechaPedida === 'vencimiento' ? 'Anota la fecha de vencimiento.' : 'Anota la fecha de emisión.';
  const iso = fechaDeTexto(t);
  if (!iso) return 'Revisa la fecha.';
  if (tipo.fechaPedida === 'vencimiento') {
    if (iso < hoy) return 'Ese documento ya venció. Sube uno vigente.';
    if (iso > sumarMeses(hoy, 240)) return 'Revisa la fecha.';
    return null;
  }
  if (iso > hoy) return 'La fecha de emisión no puede ser futura.';
  if (tipo.antiguedadMaximaDias !== null && iso < sumarDias(hoy, -tipo.antiguedadMaximaDias)) {
    return `Debe tener ${tipo.antiguedadMaximaDias} días o menos. Saca uno nuevo.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Estado de cada tipo (lo que ve el conductor)
// ---------------------------------------------------------------------------

export type EstadoTipo =
  /** Nunca lo subió. */
  | 'falta'
  /** Espera la revisión (sin uno aprobado vigente). */
  | 'en_revision'
  | 'aprobado'
  /** Aprobado y vence dentro del plazo de aviso. */
  | 'vence_pronto'
  /** Aprobado, y ya subió uno nuevo que espera revisión. */
  | 'renovacion_en_revision'
  | 'vencido'
  | 'no_aprobado';

export interface VistaTipo {
  tipo: TipoDocumentoReal;
  estado: EstadoTipo;
  /** El documento que manda: el aprobado vigente o, si no hay, el último. */
  documento: DocumentoReal | null;
  /** Cuenta para el perfil completo (aprobado y vigente). */
  listo: boolean;
}

const masNuevo = (a: DocumentoReal, b: DocumentoReal) => (a.subidoEn === b.subidoEn ? b.id - a.id : b.subidoEn.localeCompare(a.subidoEn));

export function vistaTipo(tipo: TipoDocumentoReal, documentos: DocumentoReal[], hoy: string, meses: number): VistaTipo {
  const propios = documentos.filter((d) => d.tipoId === tipo.id && d.estado !== 'reemplazado').sort(masNuevo);
  const ultimo = propios[0] ?? null;
  const vigente = propios.find((d) => d.estado === 'aprobado' && (d.venceEn === null || d.venceEn >= hoy)) ?? null;
  if (vigente) {
    if (ultimo && ultimo !== vigente && ultimo.estado === 'en_revision') return { tipo, estado: 'renovacion_en_revision', documento: vigente, listo: true };
    const pronto = vigente.venceEn !== null && vigente.venceEn <= sumarMeses(hoy, meses);
    return { tipo, estado: pronto ? 'vence_pronto' : 'aprobado', documento: vigente, listo: true };
  }
  if (!ultimo) return { tipo, estado: 'falta', documento: null, listo: false };
  if (ultimo.estado === 'en_revision') return { tipo, estado: 'en_revision', documento: ultimo, listo: false };
  if (ultimo.estado === 'no_aprobado') return { tipo, estado: 'no_aprobado', documento: ultimo, listo: false };
  // Vencido (por la tarea diaria, o aprobado con la fecha ya pasada).
  return { tipo, estado: 'vencido', documento: ultimo, listo: false };
}

export interface ResumenDocumentos {
  tipos: VistaTipo[];
  /** Obligatorios aprobados y vigentes, de cuántos. */
  listos: number;
  total: number;
  /** Cuántos tienen archivo (cualquier estado). */
  subidos: number;
  /** Están todos los obligatorios aprobados y vigentes (y hay al menos uno). */
  completos: boolean;
  /** Para avisar dentro de la app: los que vencen pronto o ya vencieron (en orden de fecha). */
  avisos: VistaTipo[];
}

export function resumenDocumentos(tipos: TipoDocumentoReal[], documentos: DocumentoReal[], hoy: string, meses: number): ResumenDocumentos {
  const vistas = tipos.map((t) => vistaTipo(t, documentos, hoy, meses));
  const obligatorios = vistas.filter((v) => v.tipo.obligatorio);
  const avisos = vistas
    .filter((v) => v.estado === 'vence_pronto' || (v.estado === 'vencido' && v.documento?.venceEn))
    .sort((a, b) => (a.documento?.venceEn ?? '').localeCompare(b.documento?.venceEn ?? ''));
  return {
    tipos: vistas,
    listos: obligatorios.filter((v) => v.listo).length,
    total: obligatorios.length,
    subidos: vistas.filter((v) => v.estado !== 'falta').length,
    completos: obligatorios.length > 0 && obligatorios.every((v) => v.listo),
    avisos,
  };
}

// ---------------------------------------------------------------------------
// Textos
// ---------------------------------------------------------------------------

/** Para concordar ("aprobada"/"aprobado"). Los tipos nuevos, en masculino ("documento"). */
const FEMENINO: Record<string, boolean> = { cedula: true, licencia: true, hoja_vida: true, antecedentes: false };
/** "Tu cédula", "Tu certificado de antecedentes"… */
const TU: Record<string, string> = {
  cedula: 'Tu cédula',
  licencia: 'Tu licencia',
  hoja_vida: 'Tu Hoja de Vida',
  antecedentes: 'Tu certificado de antecedentes',
};

export const esFemenino = (t: Pick<TipoDocumentoReal, 'clave'>) => FEMENINO[t.clave] ?? false;
export const fem = (t: Pick<TipoDocumentoReal, 'clave'>, f: string, m: string) => (esFemenino(t) ? f : m);
export const tuDocumento = (t: Pick<TipoDocumentoReal, 'clave' | 'nombre'>) => TU[t.clave] ?? `Tu ${t.nombre.charAt(0).toLowerCase()}${t.nombre.slice(1)}`;

/** "Tu licencia vence el 10/02/2027. Renuévala y súbela de nuevo." (o "venció el…"). */
export function textoAviso(v: VistaTipo): string {
  const t = v.tipo;
  const fecha = fechaCorta(v.documento?.venceEn);
  if (v.estado === 'vencido') return `${tuDocumento(t)} venció el ${fecha}. ${fem(t, 'Súbela', 'Súbelo')} de nuevo.`;
  return `${tuDocumento(t)} vence el ${fecha}. ${fem(t, 'Renuévala y súbela', 'Renuévalo y súbelo')} de nuevo.`;
}

/** Texto corto del estado (insignias y filas). */
export function textoEstado(v: VistaTipo): string {
  const t = v.tipo;
  switch (v.estado) {
    case 'falta':
      return 'Falta';
    case 'en_revision':
      return 'En revisión';
    case 'aprobado':
      return fem(t, 'Aprobada', 'Aprobado');
    case 'vence_pronto':
      return 'Vence pronto';
    case 'renovacion_en_revision':
      return fem(t, 'Aprobada · la nueva, en revisión', 'Aprobado · el nuevo, en revisión');
    case 'vencido':
      return fem(t, 'Vencida', 'Vencido');
    case 'no_aprobado':
      return fem(t, 'No aprobada', 'No aprobado');
  }
}

/** Línea gris bajo el estado: la fecha que importa. */
export function lineaFecha(v: VistaTipo): string {
  const d = v.documento;
  if (!d) return v.tipo.ayuda;
  if (v.estado === 'no_aprobado') return `${fem(v.tipo, 'Súbela', 'Súbelo')} de nuevo.`;
  if (v.estado === 'en_revision') return `${fem(v.tipo, 'Subida', 'Subido')} el ${fechaCorta(d.subidoEn)}`;
  if (d.venceEn) {
    if (v.estado === 'vencido') return `Venció el ${fechaCorta(d.venceEn)}`;
    return v.tipo.clave === 'licencia' ? `Próximo control el ${fechaCorta(d.venceEn)}` : `Vence el ${fechaCorta(d.venceEn)}`;
  }
  if (d.emitidoEn) return `Emitido el ${fechaCorta(d.emitidoEn)}`;
  return `${fem(v.tipo, 'Subida', 'Subido')} el ${fechaCorta(d.subidoEn)}`;
}

/** El mensaje tras subir, según lo que decidió el método de validación. */
export function textoTrasSubir(tipo: TipoDocumentoReal, estado: EstadoDocumentoBase | null): string {
  if (estado === 'aprobado') return `${tipo.corto}: ${fem(tipo, 'aprobada', 'aprobado')}.`;
  if (estado === 'no_aprobado') return `${tipo.corto}: ${fem(tipo, 'no aprobada', 'no aprobado')}. ${fem(tipo, 'Súbela', 'Súbelo')} de nuevo.`;
  return `${tipo.corto}: ${fem(tipo, 'enviada', 'enviado')} a revisión.`;
}

// ---------------------------------------------------------------------------
// Archivo
// ---------------------------------------------------------------------------

const MIME_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const EXT_POR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
};
const MIME_POR_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
};

/** El tipo del archivo (algunos celulares no lo dicen: se deduce de la extensión). */
export function mimeDeArchivo(nombre: string, tipoDeclarado: string): string | null {
  const t = (tipoDeclarado || '').toLowerCase();
  if (EXT_POR_MIME[t]) return t;
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  return MIME_POR_EXT[ext] ?? null;
}

/** Error del archivo elegido (o null): formato pedido y tamaño. */
export function errorArchivo(mime: string | null, bytes: number, formato: FormatoDocumento): string | null {
  if (formato === 'pdf' && mime !== 'application/pdf') return 'Elige un archivo PDF.';
  if (formato === 'foto' && (!mime || !MIME_FOTO.includes(mime))) return 'Elige una foto (JPG o PNG).';
  if (bytes <= 0) return 'El archivo está vacío. Elige otro.';
  if (bytes > BYTES_MAXIMOS) return 'El archivo pesa más de 10 MB. Elige otro.';
  return null;
}

/**
 * Peso del archivo para mostrar: "20 KB", "1,7 MB". Nunca "0,0 MB" (un archivo chico se ve en KB) y
 * los MB se redondean hacia arriba, para que un archivo de 10,01 MB no diga "10,0 MB" junto al error
 * "pesa más de 10 MB".
 */
export function pesoLegible(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1000) return `${Math.max(1, Math.ceil(kb))} KB`;
  const mb = Math.ceil((bytes / (1024 * 1024)) * 10) / 10;
  return `${mb.toFixed(1).replace('.', ',')} MB`;
}

/** "Subir cédula", "Subir licencia", "Subir Hoja de Vida" (un nombre propio queda con sus mayúsculas). */
export function tituloBotonSubir(corto: string): string {
  const palabras = corto.trim().split(/\s+/);
  const nombrePropio = palabras.slice(1).some((p) => /^[A-ZÁÉÍÓÚÑ]/.test(p));
  const texto = nombrePropio ? corto.trim() : `${corto.charAt(0).toLowerCase()}${corto.trim().slice(1)}`;
  return `Subir ${texto}`;
}

/**
 * Inicio con los pasos listos y todos los documentos subidos, pero alguno vencido o no aprobado (por
 * ejemplo, un conductor verificado al que se le venció la licencia): qué decirle. null si no es el caso.
 */
export function textoDocumentosPorRenovar(r: ResumenDocumentos): { texto: string; tipo: TipoDocumentoReal | null } | null {
  const malos = r.tipos.filter((v) => v.tipo.obligatorio && (v.estado === 'vencido' || v.estado === 'no_aprobado'));
  const faltan = r.tipos.some((v) => v.tipo.obligatorio && v.estado === 'falta');
  if (malos.length === 0 || faltan) return null;
  if (malos.length > 1) return { texto: 'Sube de nuevo los documentos marcados para aparecer en los matches.', tipo: null };
  const v = malos[0];
  const tu = tuDocumento(v.tipo);
  const suyo = `${tu.charAt(0).toLowerCase()}${tu.slice(1)}`;
  return v.estado === 'vencido'
    ? { texto: `Sube de nuevo ${suyo} para volver a aparecer en los matches.`, tipo: v.tipo }
    : { texto: `Sube de nuevo ${suyo} para aparecer en los matches.`, tipo: v.tipo };
}

/** Ruta en el espacio documentos: '<uid>/<uuid>.<ext>' (la base y Storage exigen esta forma). */
export function rutaArchivo(uid: string, uuid: string, mime: string): string {
  return `${uid}/${uuid}.${EXT_POR_MIME[mime] ?? 'bin'}`;
}

/** Archivos de la carpeta propia que ningún documento vigente usa (subidas que no terminaron, reemplazados). */
export function archivosSobrantes(nombresEnCarpeta: string[], uid: string, documentos: DocumentoReal[]): string[] {
  const usados = new Set(documentos.filter((d) => d.estado !== 'reemplazado').map((d) => d.ruta));
  return nombresEnCarpeta.map((n) => `${uid}/${n}`).filter((r) => !usados.has(r));
}

/** Hay un texto vigente de "Revisión de mis documentos" (sin él, la base no recibe documentos). */
export function hayTextoRevision<T extends { clave: string }>(textos: T[]): boolean {
  return textos.some((x) => x.clave === CLAVE_TEXTO_REVISION);
}

/** Lo que se muestra si no hay texto vigente de la revisión (falta configurarlo en el panel). */
export const TEXTO_SIN_REVISION = 'Por ahora no podemos recibir documentos. Inténtalo más tarde.';

/** Hay un texto vigente de "Revisión de mis documentos" que la persona no ha aceptado. */
export function textoRevisionPendiente<T extends { id: number; clave: string }>(textos: T[], aceptados: number[]): T | null {
  const t = textos.find((x) => x.clave === CLAVE_TEXTO_REVISION) ?? null;
  return t && !aceptados.includes(t.id) ? t : null;
}

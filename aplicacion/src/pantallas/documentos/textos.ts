// Textos del grupo "documentos": guías para obtener cada documento, motivos de rechazo en palabras
// simples y el estado de cada documento tal como lo ve el conductor.

import type { DocumentoUsuario, MotivoRechazo, MotivoRechazoId, TipoDocumentoId } from '@/datos/tipos';

export const TIPOS_DOCUMENTO: TipoDocumentoId[] = ['cedula', 'licencia', 'hoja_vida', 'antecedentes'];

export function esTipoDocumento(x: unknown): x is TipoDocumentoId {
  return typeof x === 'string' && (TIPOS_DOCUMENTO as string[]).includes(x);
}

/** Para concordar: "Aprobada" (cédula, licencia, Hoja de Vida) o "Aprobado" (certificado). */
export const FEMENINO: Record<TipoDocumentoId, boolean> = {
  cedula: true,
  licencia: true,
  hoja_vida: true,
  antecedentes: false,
};

/** "Tu cédula", "Tu certificado"… */
export const TU_DOCUMENTO: Record<TipoDocumentoId, string> = {
  cedula: 'Tu cédula',
  licencia: 'Tu licencia',
  hoja_vida: 'Tu Hoja de Vida',
  antecedentes: 'Tu certificado de antecedentes',
};

/** "Cédula subida", "Certificado subido". */
export const SUBIDO: Record<TipoDocumentoId, string> = {
  cedula: 'Cédula subida.',
  licencia: 'Licencia subida.',
  hoja_vida: 'Hoja de Vida subida.',
  antecedentes: 'Certificado subido.',
};

export const fem = (tipo: TipoDocumentoId, f: string, m: string) => (FEMENINO[tipo] ? f : m);

/** "A2 y B", "A1, A2 y B". */
export function listaY(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

export interface GuiaDocumento {
  descripcion: string;
  tituloPasos: string;
  pasos: string[];
  /** Aviso amarillo (requisito principal). */
  aviso: (diasPdf: number, clases: string[]) => string;
  /** Quién lo ve (nota con candado). */
  privacidad: string;
  /** Botón para elegir el archivo. */
  boton: string;
  /** Tipos de archivo que acepta el selector del navegador. */
  acepta: string;
  esPdf: boolean;
  /** Nombre del archivo de ejemplo de la demo. */
  ejemplo: string;
  enlace?: { titulo: string; url: string };
}

const REGISTRO_CIVIL = { titulo: 'Ir a registrocivil.cl', url: 'https://www.registrocivil.cl' };

export const GUIAS: Record<TipoDocumentoId, GuiaDocumento> = {
  cedula: {
    descripcion: 'Una foto del frente de tu cédula de identidad.',
    tituloPasos: 'Cómo tomar la foto',
    pasos: [
      'Pon tu cédula sobre una superficie lisa y oscura.',
      'Toma la foto de frente, con buena luz y sin reflejos.',
      'Revisa que se lean tu nombre y tu RUN.',
    ],
    aviso: () => 'Debe estar vigente.',
    privacidad: 'Solo nuestro equipo de verificación la ve. Nunca se muestra a los titulares.',
    boton: 'Elegir foto',
    acepta: 'image/*',
    esPdf: false,
    ejemplo: 'cedula-frente.jpg',
  },
  licencia: {
    descripcion: 'Una foto de tu licencia donde se vean tus clases.',
    tituloPasos: 'Cómo tomar la foto',
    pasos: [
      'Usa el lado donde aparecen tus clases.',
      'Toma la foto de frente, con buena luz y sin reflejos.',
      'Revisa que se lean las clases y la fecha de control.',
    ],
    aviso: (_d, clases) => (clases.length > 0 ? `Debe estar vigente y mostrar tus clases ${listaY(clases)}.` : 'Debe estar vigente.'),
    privacidad: 'Solo nuestro equipo de verificación la ve. Nunca se muestra a los titulares.',
    boton: 'Elegir foto',
    acepta: 'image/*',
    esPdf: false,
    ejemplo: 'licencia-clases.jpg',
  },
  hoja_vida: {
    descripcion: 'Es el certificado del Registro Civil con tu historial como conductor.',
    tituloPasos: 'Cómo obtenerla (gratis)',
    pasos: [
      'Entra a registrocivil.cl o a la app Civil Digital con tu ClaveÚnica.',
      'Descarga la Hoja de Vida del Conductor.',
      'Súbela aquí en PDF, tal como la descargaste.',
    ],
    aviso: (dias) => `Debe tener ${dias} días o menos desde que la sacaste.`,
    privacidad: 'Solo nuestro equipo de verificación la ve. Nunca se muestra a los titulares.',
    boton: 'Elegir PDF',
    acepta: 'application/pdf,.pdf',
    esPdf: true,
    ejemplo: 'hoja-de-vida.pdf',
    enlace: REGISTRO_CIVIL,
  },
  antecedentes: {
    descripcion: 'Es el certificado para fines especiales que entrega el Registro Civil.',
    tituloPasos: 'Cómo obtenerlo (gratis)',
    pasos: [
      'Entra a registrocivil.cl con tu ClaveÚnica.',
      'Pide el certificado de antecedentes para fines especiales.',
      'Súbelo aquí en PDF, tal como lo descargaste.',
    ],
    aviso: (dias) => `Debe tener ${dias} días o menos desde que lo sacaste.`,
    privacidad: 'Solo nuestro equipo de verificación lo ve. Nunca se muestra a los titulares.',
    boton: 'Elegir PDF',
    acepta: 'application/pdf,.pdf',
    esPdf: true,
    ejemplo: 'certificado-antecedentes.pdf',
    enlace: REGISTRO_CIVIL,
  },
};

/** Motivo del rechazo en palabras simples (lo que ve el conductor), para una foto y para un PDF. */
const MOTIVO_SIMPLE: Record<MotivoRechazoId, { foto: string; pdf?: string }> = {
  ilegible: { foto: 'La foto no se lee bien.', pdf: 'El PDF no se lee bien.' },
  no_coincide: { foto: 'El nombre o el RUN no coinciden con tu cédula.' },
  vencido: { foto: 'El documento está vencido.', pdf: 'El PDF se sacó hace más de {dias} días.' },
  otro_documento: { foto: 'No es el documento que pedimos.' },
  folio: { foto: 'No pudimos verificar el folio del PDF.' },
  run_duplicado: { foto: 'Tu RUN ya está registrado en otra cuenta.' },
};

const conDias = (texto: string, dias: number) => texto.replace('{dias}', String(dias));

/** "La foto no se lee bien." / "El PDF no se lee bien.", según el documento. */
export function motivoSimple(motivo: MotivoRechazoId, tipo: TipoDocumentoId, diasPdf = 30): string {
  const m = MOTIVO_SIMPLE[motivo];
  return conDias((GUIAS[tipo].esPdf ? m.pdf : undefined) ?? m.foto, diasPdf);
}

/** "Qué puedes hacer" según el documento (los PDF tienen su propio texto). */
export function queHacerMotivo(motivo: MotivoRechazo | undefined, tipo: TipoDocumentoId, diasPdf = 30): string | null {
  if (!motivo) return null;
  return conDias((GUIAS[tipo].esPdf ? motivo.queHacerPdf : undefined) ?? motivo.queHacer, diasPdf);
}

/** Motivos que se pueden usar para un documento (ej. "Folio no verificable", solo en los PDF). */
export function motivosPara<T extends { aplicaA?: TipoDocumentoId[] }>(motivos: T[], tipo: TipoDocumentoId): T[] {
  return motivos.filter((m) => !m.aplicaA || m.aplicaA.includes(tipo));
}

export type TonoEstado = 'exito' | 'error' | 'amarillo' | 'gris';

/** Estado de un documento en palabras, para las filas de Inicio (C3) y Mis documentos (E2). */
export function estadoDocumento(doc: DocumentoUsuario): { texto: string; tono: TonoEstado } {
  const t = doc.tipo;
  switch (doc.estado) {
    case 'aprobado':
      return { texto: fem(t, 'Aprobada', 'Aprobado'), tono: 'exito' };
    case 'rechazado':
      return { texto: fem(t, 'No aprobada', 'No aprobado'), tono: 'error' };
    case 'en_revision':
      if (doc.otraRevisionEl) return { texto: 'Otra revisión pedida', tono: 'amarillo' };
      return { texto: doc.etapa === 'ia' ? 'Revisión automática…' : 'En revisión', tono: 'amarillo' };
    case 'subido':
      return { texto: fem(t, 'Subida, sin enviar', 'Subido, sin enviar'), tono: 'gris' };
    default:
      return { texto: 'Falta', tono: 'gris' };
  }
}

// Cuándo la demo simula la revisión de una persona del equipo (funciones puras, sin la tienda).
// La usa simulacion.ts en cada vuelta del reloj. Se prueba con Node (tests/revision-equipo.test.ts).
import type { DocumentoUsuario, TareaSimulada, TipoDocumentoId } from './tipos';

/** Qué envío del documento se está revisando (cambia al subirlo de nuevo o al pedir otra revisión). */
export function rondaDe(doc: Pick<DocumentoUsuario, 'enviadoEl' | 'otraRevisionEl'>): string {
  return `${doc.enviadoEl ?? ''}|${doc.otraRevisionEl ?? ''}`;
}

export interface EntradaRevisionEquipo {
  documentos: Record<TipoDocumentoId, DocumentoUsuario>;
  pendientes: TareaSimulada[];
  /** En qué orden se revisan los documentos. */
  tipos: TipoDocumentoId[];
  ahora: number;
  /** Una persona del equipo revisa a mano en este navegador (ver revisionManual.ts). */
  manual: boolean;
  /** Cuánto tarda la persona simulada (SEGUNDOS_REVISION_EQUIPO). */
  segundos: number;
  nuevoId: () => string;
}

/**
 * Las tareas pendientes después de revisar la revisión simulada, o null si no cambia nada.
 * - Con revisión manual: se quitan las revisiones simuladas programadas (los documentos esperan a la persona).
 * - Sin revisión manual: cada documento que espera a una persona (en revisión, etapa "equipo") tiene su
 *   revisión programada a los `segundos`. Sirve para los que salen de la pre-revisión, para "pedir otra
 *   revisión", para lo guardado de antes y para cuando termina la revisión manual.
 */
export function planificarRevisionEquipo(e: EntradaRevisionEquipo): TareaSimulada[] | null {
  if (e.manual) {
    const quedan = e.pendientes.filter((t) => t.tipo !== 'revision_equipo');
    return quedan.length === e.pendientes.length ? null : quedan;
  }
  const nuevas: TareaSimulada[] = [];
  for (const tipo of e.tipos) {
    const doc = e.documentos[tipo];
    if (!doc || doc.estado !== 'en_revision' || doc.etapa !== 'equipo') continue;
    const ronda = rondaDe(doc);
    const yaProgramada = e.pendientes.some((t) => t.tipo === 'revision_equipo' && t.documento === tipo && t.ronda === ronda);
    if (!yaProgramada) {
      // Si hay dos esperando, la segunda llega un poco después (como en la pre-revisión).
      const venceEn = e.ahora + e.segundos * 1000 + nuevas.length * 600;
      nuevas.push({ id: e.nuevoId(), tipo: 'revision_equipo', venceEn, documento: tipo, ronda });
    }
  }
  return nuevas.length > 0 ? [...e.pendientes, ...nuevas] : null;
}

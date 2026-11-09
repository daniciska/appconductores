// Pre-revisión simulada del agente de IA para la cola del panel (solo la demo).
// En la app real, el agente lee el documento y devuelve códigos (nunca copia anotaciones ni datos de salud).
// Aquí se arma una lectura FICTICIA y estable a partir de lo que declaró el conductor.
// Solo se muestra lo que la lista cerrada de R13 permite guardar: de la cédula, el RUN, si el nombre
// coincide y el vencimiento (nunca la fecha de nacimiento); de la licencia, las clases y el próximo
// control; de la Hoja de Vida y los antecedentes, la fecha de emisión, si el folio es válido y el resultado.
// El RUN aparece tapado: verlo queda en el registro de acciones (R26).
import { EJEMPLO_USUARIO } from '@/datos/semilla';
import type { ConductorVista } from '@/datos/selectores';
import type { DocumentoUsuario, MotivoRechazoId, TipoDocumentoId } from '@/datos/tipos';
import { fechaLarga } from '@/datos/formato';

const DIA_MS = 24 * 60 * 60 * 1000;

export type ResultadoIA = 'dudas' | 'persona' | 'otra_revision' | 'no_coincide';

export interface LecturaIA {
  dato: string;
  /** Lo que leyó el agente en el documento. */
  leyo: string;
  /** Lo que declaró el conductor (o con qué se compara). */
  declarado: string;
  /** true coincide · false no coincide · null solo informativo o lectura dudosa. */
  coincide: boolean | null;
  nota?: string;
  /** El RUN: se muestra tapado hasta "Ver RUN", que queda en el registro (R26). */
  esRun?: boolean;
}

export interface Prerevision {
  resultado: ResultadoIA;
  titulo: string;
  razon: string;
  lecturas: LecturaIA[];
  /** Motivo que propondría para "No aprobar" (la persona decide). */
  propuesta: MotivoRechazoId | null;
}

/** Número estable a partir de un texto (para que la lectura no cambie entre pantallas). */
function semilla(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** RUN ficticio con dígito verificador válido (módulo 11). Solo lo ve el equipo. */
export function runFicticio(id: string): string {
  const cuerpo = 12_000_000 + (semilla(`run-${id}`) % 13_000_000);
  let suma = 0;
  let factor = 2;
  for (const d of String(cuerpo).split('').reverse()) {
    suma += Number(d) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const dv = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return `${String(cuerpo).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

/** El RUN tapado, para mostrarlo sin verlo (ej.: ••.•••.•••-•). */
export function runTapado(run: string): string {
  return run.replace(/[0-9Kk?]/g, '•');
}

/** RUN leído a medias (cuando la foto tiene reflejos). */
function runDudoso(run: string): string {
  return run.replace(/\d/g, (d, i: number) => (i % 3 === 1 ? '?' : d));
}

function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export interface EntradaPrerevision {
  conductor: ConductorVista;
  /** Nombre tal como lo escribió la persona (vacío si no lo escribió). */
  nombreDeclarado: string;
  tipo: TipoDocumentoId;
  documento: DocumentoUsuario;
  diasAntiguedadPdf: number;
}

/** Fecha de emisión ficticia de un PDF: algunos días antes de subirlo. */
export function emisionPdf(id: string, tipo: TipoDocumentoId, subidoEl: string | null): { fecha: string; dias: number } {
  const dias = 2 + (semilla(`${id}-${tipo}-emision`) % 19);
  const base = subidoEl ? new Date(subidoEl).getTime() : Date.now();
  return { fecha: new Date(base - dias * DIA_MS).toISOString(), dias };
}

export function prerevisar(e: EntradaPrerevision): Prerevision {
  const { conductor: c, tipo, documento: d } = e;
  const run = runFicticio(c.esUsuario ? 'yo' : c.id);
  const nombreLeido = e.nombreDeclarado.trim()
    ? e.nombreDeclarado.trim()
    : `${EJEMPLO_USUARIO.nombres} ${EJEMPLO_USUARIO.apellido1} ${EJEMPLO_USUARIO.apellido2}`;
  const nombreCoincide = !!e.nombreDeclarado.trim() && normalizar(nombreLeido) === normalizar(e.nombreDeclarado);
  const lecturaNombre: LecturaIA = {
    dato: 'Nombre',
    leyo: nombreLeido,
    declarado: e.nombreDeclarado.trim() || 'Sin dato',
    coincide: nombreCoincide,
  };
  const lecturas: LecturaIA[] = [lecturaNombre];
  const subido = d.subidoEl ? new Date(d.subidoEl).getTime() : Date.now();
  let dudosa = false;
  let fueraDePlazo = false;

  if (tipo === 'cedula') {
    dudosa = true;
    lecturas.push({ dato: 'RUN', leyo: runDudoso(run), declarado: 'Se obtiene de la cédula', coincide: null, nota: 'Lectura dudosa', esRun: true });
    lecturas.push({ dato: 'Vence', leyo: fechaLarga(new Date(subido + 4 * 365 * DIA_MS).toISOString()), declarado: 'Vigente', coincide: true });
  } else if (tipo === 'licencia') {
    dudosa = true;
    const clases = c.clasesDeclaradas;
    const leidas = clases.length > 1 ? `${clases.slice(0, -1).join(', ')} y ¿${clases[clases.length - 1]}?` : clases.join(', ') || 'Sin lectura';
    lecturas.push({ dato: 'Clases', leyo: leidas, declarado: clases.join(', ') || 'Sin dato', coincide: null, nota: 'Lectura dudosa' });
    lecturas.push({
      dato: 'Próximo control',
      leyo: fechaLarga(new Date(subido + 2 * 365 * DIA_MS).toISOString()),
      declarado: 'Vigente',
      coincide: true,
    });
  } else {
    lecturas.push({ dato: 'RUN', leyo: run, declarado: 'Igual al de la cédula', coincide: true, esRun: true });
    if (tipo === 'antecedentes') {
      lecturas.push({ dato: 'Tipo', leyo: 'Para fines especiales', declarado: 'Para fines especiales', coincide: true });
    }
    const em = emisionPdf(c.id, tipo, d.subidoEl);
    fueraDePlazo = em.dias > e.diasAntiguedadPdf;
    lecturas.push({
      dato: 'Emitido el',
      leyo: fechaLarga(em.fecha),
      declarado: `${e.diasAntiguedadPdf} días o menos`,
      coincide: !fueraDePlazo,
      nota: `${em.dias} ${em.dias === 1 ? 'día' : 'días'} al subirlo`,
    });
    lecturas.push({ dato: 'Folio', leyo: 'Leído', declarado: 'Comprobar en el Registro Civil', coincide: null });
  }

  const propuesta: MotivoRechazoId | null = !nombreCoincide
    ? 'no_coincide'
    : fueraDePlazo
      ? 'vencido'
      : dudosa
        ? 'ilegible'
        : null;

  if (d.otraRevisionEl) {
    return {
      resultado: 'otra_revision',
      titulo: 'Pidió otra revisión',
      razon: 'No estuvo de acuerdo con la decisión anterior. La decide otra persona del equipo.',
      lecturas,
      propuesta,
    };
  }
  if (!nombreCoincide || fueraDePlazo) {
    return {
      resultado: 'no_coincide',
      titulo: !nombreCoincide ? 'Los datos no coinciden' : 'Fuera de plazo',
      razon: !nombreCoincide
        ? 'El nombre del documento no coincide con lo declarado.'
        : `El PDF tiene más de ${e.diasAntiguedadPdf} días.`,
      lecturas,
      propuesta,
    };
  }
  if (dudosa) {
    return {
      resultado: 'dudas',
      titulo: 'Tiene dudas',
      razon: tipo === 'cedula' ? 'La foto tiene reflejos: no leyó el RUN con seguridad.' : 'No pudo leer bien todas las clases.',
      lecturas,
      propuesta,
    };
  }
  return {
    resultado: 'persona',
    titulo: 'Lo decide una persona',
    razon: 'Los datos coinciden. Este documento siempre lo decide alguien del equipo.',
    lecturas,
    propuesta,
  };
}

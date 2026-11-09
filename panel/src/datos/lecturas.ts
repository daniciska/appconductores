// Lecturas derivadas propias del panel (funciones puras sobre el estado compartido de la demo; úsalas
// con useDerivado o con los hooks de ./hooks). Antes vivían en src/datos/selectores.ts de la demo.
import type { DatosDemo } from '@/datos/tienda';
import * as sel from '@/datos/selectores';
import type { ResultadoMatch } from '@/datos/match';
import type { Busqueda, DocumentoUsuario, Negocio, TipoDocumentoId, Titular } from '@/datos/tipos';

export const clavedoc = (duenoId: string, tipo: TipoDocumentoId) => `${duenoId}:${tipo}`;

export const NOMBRE_DOC_CON_ARTICULO: Record<TipoDocumentoId, string> = {
  cedula: 'la cédula',
  licencia: 'la licencia',
  hoja_vida: 'la Hoja de Vida',
  antecedentes: 'el certificado de antecedentes',
};

export interface DocumentoDecidido {
  clave: string;
  duenoId: string;
  nombre: string;
  esUsuario: boolean;
  tipo: TipoDocumentoId;
  documento: DocumentoUsuario;
}

/** Documentos ya decididos (aprobados o no), los más recientes primero. */
export function decididosRecientes(s: DatosDemo, limite = 30): DocumentoDecidido[] {
  const salida: DocumentoDecidido[] = [];
  for (const c of sel.todosLosConductores(s)) {
    for (const tipo of sel.TIPOS_DOC_ORDEN) {
      const d = c.documentos[tipo];
      if ((d.estado === 'aprobado' || d.estado === 'rechazado') && d.revisadoEn) {
        salida.push({ clave: clavedoc(c.id, tipo), duenoId: c.id, nombre: c.nombre, esUsuario: c.esUsuario, tipo, documento: d });
      }
    }
  }
  return salida.sort((a, b) => (b.documento.revisadoEn ?? '').localeCompare(a.documento.revisadoEn ?? '')).slice(0, limite);
}

export interface MatchDeConductor {
  busqueda: Busqueda;
  negocio: Negocio | undefined;
  titular: Titular | undefined;
  comuna: string;
  resultado: ResultadoMatch;
}

/** Matches vigentes de un conductor (usuario o ficticio) contra todas las búsquedas. */
export function matchesDeConductor(s: DatosDemo, conductorId: string): MatchDeConductor[] {
  const salida: MatchDeConductor[] = [];
  for (const b of s.busquedas) {
    const r = sel.simularMatch(s, conductorId, b.id);
    if (r?.hayMatch) {
      salida.push({
        busqueda: b,
        negocio: sel.negocioPorId(s, b.negocioId),
        titular: sel.titularPorId(s, b.titularId),
        comuna: sel.comunaPorId(s, b.comunaId)?.nombre ?? '',
        resultado: r,
      });
    }
  }
  return salida.sort((a, b) => b.resultado.porcentaje - a.resultado.porcentaje);
}

/** Por qué un conductor no entra al match (la primera condición previa que falla), o null. */
export function precondicionDeConductor(s: DatosDemo, conductorId: string): ResultadoMatch['precondicionFallida'] {
  const activa = s.busquedas.find((b) => b.estado === 'activa' && sel.negocioActivo(s, b.negocioId));
  if (!activa) return null;
  const r = sel.simularMatch(s, conductorId, activa.id);
  if (!r) return null;
  // El bloqueo y la búsqueda no activa no dependen del conductor.
  return r.precondicionFallida === 'bloqueado' || r.precondicionFallida === 'busqueda_no_activa' ? null : r.precondicionFallida;
}

/** Cuántos matches tiene cada conductor (para la tabla). */
export function conteoMatches(s: DatosDemo): Record<string, number> {
  const salida: Record<string, number> = {};
  for (const c of sel.todosLosConductores(s)) {
    let n = 0;
    for (const b of s.busquedas) if (sel.simularMatch(s, c.id, b.id)?.hayMatch) n += 1;
    salida[c.id] = n;
  }
  return salida;
}

export interface Distribucion {
  /** Pares conductor–búsqueda que cumplen las condiciones previas y los filtros. */
  pasanFiltros: number;
  /** De esos, cuántos llegan al umbral. */
  hacenMatch: number;
  /** Cantidad de pares por tramo de 10 % (11 tramos: 0–9 … 90–99 y 100). */
  tramos: number[];
  /** Cuántos pares hay con cada % exacto (solo los que pasan los filtros). */
  valores: { porcentaje: number; cantidad: number }[];
  /** Matches del usuario de la demo. */
  matchesUsuario: number;
}

/** Cómo se reparten los % de coincidencia con la configuración actual (vista previa de Reglas del match). */
export function distribucionMatch(s: DatosDemo): Distribucion {
  const tramos = Array.from({ length: 11 }, () => 0);
  let pasanFiltros = 0;
  let hacenMatch = 0;
  const porValor = new Map<number, number>();
  for (const c of sel.todosLosConductores(s)) {
    for (const b of s.busquedas) {
      const r = sel.simularMatch(s, c.id, b.id);
      if (!r || r.precondicionFallida || r.filtrosFallidos.length > 0) continue;
      pasanFiltros += 1;
      if (r.hayMatch) hacenMatch += 1;
      tramos[Math.min(10, Math.floor(r.porcentaje / 10))] += 1;
      porValor.set(r.porcentaje, (porValor.get(r.porcentaje) ?? 0) + 1);
    }
  }
  const valores = [...porValor.entries()].map(([porcentaje, cantidad]) => ({ porcentaje, cantidad })).sort((a, b) => a.porcentaje - b.porcentaje);
  return { pasanFiltros, hacenMatch, tramos, valores, matchesUsuario: sel.matchesDelUsuario(s).length };
}

/** Conductores y búsquedas que usan cada negocio (para Catálogos). */
export function usoNegocios(s: DatosDemo): Record<string, { conductores: number; busquedas: number }> {
  const salida: Record<string, { conductores: number; busquedas: number }> = {};
  for (const n of s.catalogos.negocios) salida[n.id] = { conductores: 0, busquedas: 0 };
  for (const c of sel.todosLosConductores(s)) for (const n of c.negocios) if (salida[n]) salida[n].conductores += 1;
  for (const b of s.busquedas) if (salida[b.negocioId]) salida[b.negocioId].busquedas += 1;
  return salida;
}

/** Conductores y búsquedas por zona (para Zonas). */
export function usoZonas(s: DatosDemo): Record<string, { conductores: number; busquedas: number }> {
  const salida: Record<string, { conductores: number; busquedas: number }> = {};
  const sumar = (comunaId: string | null | undefined, campo: 'conductores' | 'busquedas') => {
    const zona = sel.comunaPorId(s, comunaId)?.zonaId;
    if (!zona) return;
    salida[zona] = salida[zona] ?? { conductores: 0, busquedas: 0 };
    salida[zona][campo] += 1;
  };
  for (const c of sel.todosLosConductores(s)) sumar(c.comuna?.id, 'conductores');
  for (const b of s.busquedas) sumar(b.comunaId, 'busquedas');
  return salida;
}

// ---------------------------------------------------------------------------
// Cola de documentos, reportes y cifras del resumen
// ---------------------------------------------------------------------------

export interface DocumentoEnCola {
  duenoId: string;
  nombre: string;
  tipo: TipoDocumentoId;
  documento: DocumentoUsuario;
  /** Clases que declaró (para comparar con la licencia). */
  clasesDeclaradas: string[];
  pidioOtraRevision: boolean;
}

/** Documentos que esperan a una persona (etapa 'equipo'), los más antiguos primero. */
export function colaDocumentos(s: DatosDemo, incluirEnPrerevision = false): DocumentoEnCola[] {
  const salida: DocumentoEnCola[] = [];
  for (const c of sel.todosLosConductores(s)) {
    for (const tipo of sel.TIPOS_DOC_ORDEN) {
      const d = c.documentos[tipo];
      if (d.estado !== 'en_revision') continue;
      if (d.etapa !== 'equipo' && !incluirEnPrerevision) continue;
      salida.push({
        duenoId: c.id,
        nombre: c.nombre,
        tipo,
        documento: d,
        clasesDeclaradas: c.clasesDeclaradas,
        pidioOtraRevision: !!d.otraRevisionEl,
      });
    }
  }
  return salida.sort((a, b) => (a.documento.enviadoEl ?? '').localeCompare(b.documento.enviadoEl ?? ''));
}

export const reportesAbiertos = (s: DatosDemo) =>
  s.reportes.filter((r) => r.estado === 'abierto').sort((a, b) => a.reportadoEl.localeCompare(b.reportadoEl));

/** Total de matches vigentes entre todos los conductores y todas las búsquedas. */
export function totalMatches(s: DatosDemo): number {
  let n = 0;
  for (const c of sel.todosLosConductores(s)) for (const b of s.busquedas) if (sel.simularMatch(s, c.id, b.id)?.hayMatch) n += 1;
  return n;
}

/** Con los pesos actuales: cuántas variables del % pueden fallar y aun así haber match. */
export function variablesQuePuedenFallar(s: DatosDemo): number {
  const variables = s.reglas.reglas.filter((r) => r.uso === 'variable');
  const total = variables.reduce((a, r) => a + Math.max(0, r.peso), 0);
  if (total === 0) return 0;
  const pesos = variables.map((r) => Math.max(0, r.peso)).sort((a, b) => a - b);
  let pierde = 0;
  let fallan = 0;
  for (const p of pesos) {
    if ((total - pierde - p) * 100 + 1e-9 >= s.reglas.umbral * total) {
      pierde += p;
      fallan += 1;
    } else break;
  }
  return fallan;
}

export function resumenPanel(s: DatosDemo) {
  const conductores = sel.todosLosConductores(s);
  return {
    conductores: conductores.length,
    verificados: conductores.filter((c) => c.estadoVerificacion === 'verificado').length,
    incompletos: conductores.filter((c) => c.estadoPerfil === 'incompleto').length,
    documentosEnCola: colaDocumentos(s).length,
    reportesAbiertos: reportesAbiertos(s).length,
    titulares: s.titulares.length,
    busquedasActivas: s.busquedas.filter((b) => b.estado === 'activa').length,
    ofertasEnBolsa: s.busquedas.filter((b) => b.enBolsa && b.estado === 'activa').length,
    matches: totalMatches(s),
  };
}

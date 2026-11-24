// Motor del match de Dale Contacto (puro: sin React, sin tienda; se prueba con `npm run test:match`).
//
// Reglas (CLAUDE.md "Decisiones tomadas" y docs/modelo-datos.json R3, R4, R5, R21 y R29):
// 1. Condiciones previas (R3): perfil completo, verificado, disponible, cuentas activas,
//    negocio e industria activos, búsqueda activa y sin bloqueo.
// 2. Filtros obligatorios (R4): F1 negocio, F2 licencia (clases REVISADAS), F3 región y M3 turno.
// 3. Porcentaje (R5): M2 zona, M4 años, M6 estacionamiento y M7 días (proporcional).
//    Hay match si suma(peso × valor) × 100 ≥ umbral × suma(pesos).
// Cada regla puede usarse como filtro, como variable del % o apagarse desde el panel.
// Como filtro, una regla se cumple si su valor es mayor que 0 (en M7: al menos un día en común).
//
// Solo importa tipos, para que Node lo pueda ejecutar directo en las pruebas.
import type {
  ClaseLicencia,
  CodigoRegla,
  Comuna,
  Dia,
  EstadoBusqueda,
  EstadoPerfil,
  EstadoVerificacion,
  Industria,
  Negocio,
  PerfilesBolsa,
  ReglaMatch,
  ReglasMatch,
  Turno,
  UsoRegla,
  VisibilidadBolsa,
} from './tipos.ts';

export interface ConductorParaMatch {
  estadoPerfil: EstadoPerfil;
  estadoVerificacion: EstadoVerificacion;
  disponible: boolean;
  suspendido?: boolean;
  comunaId: string | null;
  tieneEstacionamiento: boolean;
  clasesRevisadas: string[];
  experiencia: Record<string, number>;
  negocios: string[];
  turnos: Turno[];
  dias: Dia[];
}

export interface BusquedaParaMatch {
  negocioId: string;
  respuestaVehiculo: string | null;
  comunaId: string;
  turnos: Turno[];
  dias: Dia[];
  aniosMinimos: number;
  exigeEstacionamiento: boolean;
  estado: EstadoBusqueda;
}

export interface CatalogoMatch {
  negocios: Negocio[];
  industrias: Industria[];
  clases: ClaseLicencia[];
  comunas: Comuna[];
}

export interface EntradaMatch {
  conductor: ConductorParaMatch;
  busqueda: BusquedaParaMatch;
  catalogo: CatalogoMatch;
  reglas: ReglasMatch;
  /** Alguno bloqueó al otro. */
  bloqueado?: boolean;
  titularSuspendido?: boolean;
}

export type Precondicion =
  | 'perfil_incompleto'
  | 'no_verificado'
  | 'no_disponible'
  | 'cuenta_suspendida'
  | 'negocio_inactivo'
  | 'busqueda_no_activa'
  | 'bloqueado';

export const TEXTO_PRECONDICION: Record<Precondicion, string> = {
  perfil_incompleto: 'Perfil incompleto',
  no_verificado: 'Documentos sin verificar',
  no_disponible: 'No disponible para trabajar',
  cuenta_suspendida: 'Cuenta suspendida',
  negocio_inactivo: 'Negocio apagado',
  busqueda_no_activa: 'Búsqueda pausada o cubierta',
  bloqueado: 'Bloqueado',
};

export interface DetalleRegla {
  codigo: CodigoRegla;
  nombre: string;
  uso: UsoRegla;
  peso: number;
  /** De 0 a 1. Las reglas de sí/no valen 0 o 1; M7 es proporcional. */
  valor: number;
  /** Filtro: valor > 0. Variable: valor = 1. Apagada: true. */
  cumple: boolean;
  textoNoCoincide: string;
}

export interface ResultadoMatch {
  hayMatch: boolean;
  precondicionFallida: Precondicion | null;
  filtrosFallidos: CodigoRegla[];
  /** Porcentaje redondeado (0 a 100). */
  porcentaje: number;
  /** suma(peso × valor) de las variables del %. */
  puntaje: number;
  /** suma(pesos) de las variables del %. */
  pesoTotal: number;
  /** Variables del % que coinciden por completo (la N de "N de M"). */
  coinciden: number;
  /** Cantidad de variables del % (la M de "N de M"). */
  evaluadas: number;
  /** Variables del % que no coinciden por completo. */
  noCoinciden: CodigoRegla[];
  /** Textos para mostrar: "otra zona", "sin estacionamiento"… */
  textosNoCoinciden: string[];
  /** Textos de los filtros obligatorios que no se cumplen: "otra región", "otro turno"… */
  textosFiltrosFallidos: string[];
  detalle: DetalleRegla[];
}

// ---------------------------------------------------------------------------
// Ayudas de licencia y experiencia (también las usan las pantallas)
// ---------------------------------------------------------------------------

/** Expande 'B' a todas las clases que habilitan lo de la B (A1…A5, antiguas y la propia B). */
export function expandirClases(lista: string[], clases: ClaseLicencia[]): string[] {
  const salida = new Set<string>();
  for (const codigo of lista) {
    if (codigo === 'B') {
      for (const c of clases) if (c.habilitaClaseB) salida.add(c.codigo);
      salida.add('B');
    } else {
      salida.add(codigo);
    }
  }
  return [...salida];
}

/** Clases que pide el negocio (sin expandir), según la respuesta sobre el vehículo si corresponde. */
export function clasesQuePide(negocio: Negocio, respuestaVehiculo: string | null): string[] {
  if (negocio.pregunta && respuestaVehiculo) {
    const r = negocio.pregunta.respuestas.find((x) => x.clave === respuestaVehiculo);
    if (r) return r.clases;
  }
  return negocio.clases;
}

/** Clases que habilitan el negocio, ya expandidas. */
export function clasesQueHabilitan(
  negocio: Negocio,
  respuestaVehiculo: string | null,
  clases: ClaseLicencia[],
): string[] {
  return expandirClases(clasesQuePide(negocio, respuestaVehiculo), clases);
}

/** ¿Alguna de estas clases habilita el negocio? (F2 usa las clases revisadas; el Paso 4, las declaradas). */
export function habilitaNegocio(
  clasesDelConductor: string[],
  negocio: Negocio,
  respuestaVehiculo: string | null,
  clases: ClaseLicencia[],
): boolean {
  const habilitan = clasesQueHabilitan(negocio, respuestaVehiculo, clases);
  return clasesDelConductor.some((c) => habilitan.includes(c));
}

/** Texto "Pide licencia A3" / "Pide licencia A1, A2 o A3" para los negocios en gris del Paso 4. */
export function textoPideLicencia(negocio: Negocio, respuestaVehiculo: string | null = null): string {
  const pide = clasesQuePide(negocio, respuestaVehiculo).filter((c) => !c.includes('antigua'));
  if (pide.length === 0) return 'Pide otra licencia';
  if (pide.length === 1) return `Pide licencia ${pide[0]}`;
  return `Pide licencia ${pide.slice(0, -1).join(', ')} o ${pide[pide.length - 1]}`;
}

/** Años de la categoría relacionada con el negocio que tenga más años (M4). */
export function aniosEnNegocio(experiencia: Record<string, number>, negocio: Negocio): number {
  let max = 0;
  for (const t of negocio.tamanos) max = Math.max(max, experiencia[t] ?? 0);
  return max;
}

function interseccion<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => b.includes(x));
}

// ---------------------------------------------------------------------------
// Valor de cada regla (0 a 1)
// ---------------------------------------------------------------------------

function valorRegla(codigo: CodigoRegla, e: EntradaMatch, negocio: Negocio | undefined): number {
  const { conductor: c, busqueda: b, catalogo } = e;
  const comunaC = c.comunaId ? catalogo.comunas.find((x) => x.id === c.comunaId) : undefined;
  const comunaB = catalogo.comunas.find((x) => x.id === b.comunaId);
  switch (codigo) {
    case 'F1':
      return c.negocios.includes(b.negocioId) ? 1 : 0;
    case 'F2':
      return negocio && habilitaNegocio(c.clasesRevisadas, negocio, b.respuestaVehiculo, catalogo.clases) ? 1 : 0;
    case 'F3':
      return comunaC && comunaB && comunaC.regionId === comunaB.regionId ? 1 : 0;
    case 'M2':
      return comunaC && comunaB && comunaC.zonaId === comunaB.zonaId ? 1 : 0;
    case 'M3':
      if (b.turnos.length === 0) return 1; // lo que el titular no exige, coincide
      return interseccion(b.turnos, c.turnos).length > 0 ? 1 : 0;
    case 'M4':
      if (b.aniosMinimos <= 0) return 1;
      return negocio && aniosEnNegocio(c.experiencia, negocio) >= b.aniosMinimos ? 1 : 0;
    case 'M6':
      if (!b.exigeEstacionamiento) return 1;
      return c.tieneEstacionamiento ? 1 : 0;
    case 'M7':
      if (b.dias.length === 0) return 1;
      return interseccion(b.dias, c.dias).length / b.dias.length;
    default:
      return 0;
  }
}

function precondicion(e: EntradaMatch, negocio: Negocio | undefined): Precondicion | null {
  const { conductor: c, busqueda: b, catalogo } = e;
  if (c.suspendido || e.titularSuspendido) return 'cuenta_suspendida';
  if (e.bloqueado) return 'bloqueado';
  if (c.estadoPerfil !== 'completo') return 'perfil_incompleto';
  if (c.estadoVerificacion !== 'verificado') return 'no_verificado';
  if (!c.disponible) return 'no_disponible';
  const industria = negocio ? catalogo.industrias.find((i) => i.id === negocio.industriaId) : undefined;
  if (!negocio || !negocio.activo || !industria || !industria.activo) return 'negocio_inactivo';
  if (b.estado !== 'activa') return 'busqueda_no_activa';
  return null;
}

/** Calcula todas las reglas sin mirar las condiciones previas (sirve también para el simulador del panel). */
export function evaluarReglas(e: EntradaMatch): Omit<ResultadoMatch, 'precondicionFallida' | 'hayMatch'> & {
  pasaFiltrosYUmbral: boolean;
} {
  const negocio = e.catalogo.negocios.find((n) => n.id === e.busqueda.negocioId);
  const reglas: ReglaMatch[] = [...e.reglas.reglas].sort((a, b) => a.orden - b.orden);
  const detalle: DetalleRegla[] = [];
  const filtrosFallidos: CodigoRegla[] = [];
  const noCoinciden: CodigoRegla[] = [];
  const textosNoCoinciden: string[] = [];
  const textosFiltrosFallidos: string[] = [];
  let puntaje = 0;
  let pesoTotal = 0;
  let coinciden = 0;
  let evaluadas = 0;

  for (const r of reglas) {
    const valor = valorRegla(r.codigo, e, negocio);
    let cumple = true;
    if (r.uso === 'filtro') {
      cumple = valor > 0;
      if (!cumple) {
        filtrosFallidos.push(r.codigo);
        textosFiltrosFallidos.push(r.textoNoCoincide);
      }
    } else if (r.uso === 'variable') {
      const peso = Math.max(0, r.peso);
      puntaje += peso * valor;
      pesoTotal += peso;
      evaluadas += 1;
      cumple = valor >= 1;
      if (cumple) coinciden += 1;
      else {
        noCoinciden.push(r.codigo);
        textosNoCoinciden.push(r.textoNoCoincide);
      }
    }
    detalle.push({
      codigo: r.codigo,
      nombre: r.nombre,
      uso: r.uso,
      peso: r.peso,
      valor,
      cumple,
      textoNoCoincide: r.textoNoCoincide,
    });
  }

  const porcentaje = pesoTotal > 0 ? Math.round((puntaje / pesoTotal) * 100) : 100;
  // Se compara como en la base: puntaje × 100 ≥ umbral × pesoTotal (con margen para decimales).
  const llegaAlUmbral = pesoTotal === 0 || puntaje * 100 + 1e-9 >= e.reglas.umbral * pesoTotal;
  return {
    filtrosFallidos,
    porcentaje,
    puntaje,
    pesoTotal,
    coinciden,
    evaluadas,
    noCoinciden,
    textosNoCoinciden,
    textosFiltrosFallidos,
    detalle,
    pasaFiltrosYUmbral: filtrosFallidos.length === 0 && llegaAlUmbral,
  };
}

/** Resultado completo del match entre un conductor y una búsqueda. */
export function evaluarMatch(e: EntradaMatch): ResultadoMatch {
  const negocio = e.catalogo.negocios.find((n) => n.id === e.busqueda.negocioId);
  const pre = precondicion(e, negocio);
  const { pasaFiltrosYUmbral, ...resto } = evaluarReglas(e);
  return { ...resto, precondicionFallida: pre, hayMatch: pre === null && pasaFiltrosYUmbral };
}

// ---------------------------------------------------------------------------
// Bolsa de trabajo (R29): quién ve cada oferta
// ---------------------------------------------------------------------------

export interface EntradaBolsa extends EntradaMatch {
  bolsaActiva: boolean;
  enBolsa: boolean;
  visibilidad: VisibilidadBolsa;
  perfiles: PerfilesBolsa | null;
}

/** ¿El conductor cumple las condiciones de "Conductores que tú elijas"? */
export function cumplePerfilesBolsa(
  c: ConductorParaMatch,
  p: PerfilesBolsa,
  negocio: Negocio,
  comunas: Comuna[],
): boolean {
  const comuna = c.comunaId ? comunas.find((x) => x.id === c.comunaId) : undefined;
  if (p.zonas.length > 0 && (!comuna || !p.zonas.includes(comuna.zonaId))) return false;
  if (p.aniosMinimos > 0 && aniosEnNegocio(c.experiencia, negocio) < p.aniosMinimos) return false;
  if (p.turnos.length > 0 && interseccion(p.turnos, c.turnos).length === 0) return false;
  if (p.dias.length > 0 && interseccion(p.dias, c.dias).length === 0) return false;
  if (p.estacionamiento && !c.tieneEstacionamiento) return false;
  return true;
}

/**
 * ¿La oferta aparece en la bolsa de este conductor? (R29)
 * Siempre: bolsa activa, oferta publicada y activa, negocio e industria activos, sin bloqueo,
 * alguna clase de licencia habilita el negocio y misma región. Además, según la visibilidad:
 * 'match' = hay match vigente; 'perfiles' = cumple las condiciones elegidas; 'todos' = nada más.
 * Para ver la bolsa, la demo usa las clases revisadas o, si aún no las hay, las declaradas.
 */
export function visibleEnBolsa(e: EntradaBolsa, clasesParaLicencia?: string[]): boolean {
  if (!e.bolsaActiva || !e.enBolsa) return false;
  if (e.bloqueado || e.titularSuspendido || e.conductor.suspendido) return false;
  if (e.busqueda.estado !== 'activa') return false;
  const negocio = e.catalogo.negocios.find((n) => n.id === e.busqueda.negocioId);
  if (!negocio || !negocio.activo) return false;
  const industria = e.catalogo.industrias.find((i) => i.id === negocio.industriaId);
  if (!industria || !industria.activo) return false;
  const clases = clasesParaLicencia ?? e.conductor.clasesRevisadas;
  if (!habilitaNegocio(clases, negocio, e.busqueda.respuestaVehiculo, e.catalogo.clases)) return false;
  const comunaC = e.conductor.comunaId ? e.catalogo.comunas.find((x) => x.id === e.conductor.comunaId) : undefined;
  const comunaB = e.catalogo.comunas.find((x) => x.id === e.busqueda.comunaId);
  if (!comunaC || !comunaB || comunaC.regionId !== comunaB.regionId) return false;
  if (e.visibilidad === 'match') return evaluarMatch(e).hayMatch;
  if (e.visibilidad === 'perfiles') {
    return e.perfiles ? cumplePerfilesBolsa(e.conductor, e.perfiles, negocio, e.catalogo.comunas) : true;
  }
  return true;
}

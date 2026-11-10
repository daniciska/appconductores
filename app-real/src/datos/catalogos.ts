// Catálogos de la base → los tipos que ya usan las pantallas (los mismos de la demo).
// Puro: lo prueba tests/mapeo.test.ts. Las consultas están en ./lecturas.ts.
//
// En la base los ids son números; en la app, texto (String(id)). Las clases de licencia se identifican
// por su código ('A2', 'B'…) igual que en la demo. Lo inactivo se oculta, salvo los negocios y las
// industrias: las pantallas filtran por `activo` (y así lo guardado de un negocio apagado no se toca).
import type { CasillaAutorizacion, CatalogosRegistro } from '@/datos/puerto/tipos';
import type { Negocio, OpcionLista, PreguntaVehiculo } from '@/datos/tipos';

export interface FilasCatalogo {
  regiones: { id: number; nombre: string; orden: number }[];
  zonas: { id: number; region_id: number; nombre: string; orden: number; activa: boolean }[];
  comunas: { id: number; nombre: string; nombres_alternativos: string[] | null; region_id: number; zona_id: number; activa: boolean }[];
  clases: { id: number; codigo: string; nombre: string | null; es_antigua: boolean; habilita_clase_b: boolean; orden: number; activa: boolean }[];
  industrias: { id: number; nombre: string; orden: number; activo: boolean }[];
  tamanos: { id: number; nombre: string; ayuda: string | null; orden: number; activo: boolean }[];
  negocios: {
    id: number;
    industria_id: number;
    nombre: string;
    ejemplo: string | null;
    pregunta_vehiculo: unknown;
    nota: string | null;
    orden: number;
    activo: boolean;
    negocio_clases_licencia: { clase_licencia_id: number }[] | null;
    negocio_tamanos: { tamano_vehiculo_id: number }[] | null;
  }[];
  listas: {
    clave: string;
    opciones: { id: number; clave: string; nombre: string; nombre_corto: string | null; orden: number; activa: boolean }[] | null;
  }[];
  textos: { id: number; clave: string; version: string; obligatoria: boolean; texto: string }[];
  /** Valor de ajustes.dias_reconfirmar_disponibilidad (null si no se pudo leer). */
  diasReconfirmar: unknown;
}

/** Listas de opciones que usa el conductor (turnos, días, idiomas). */
export type ListaConductor = 'turno' | 'dia_semana' | 'idioma';
export const LISTAS: ListaConductor[] = ['turno', 'dia_semana', 'idioma'];

/** Para escribir y leer: de la clave de la app al id de la base y al revés. */
export interface MapasCatalogo {
  claseIdPorCodigo: Record<string, number>;
  claseCodigoPorId: Record<number, string>;
  /** Solo opciones activas. */
  opcionIdPorClave: Record<ListaConductor, Record<string, number>>;
  /** Todas las opciones de las 3 listas (también las inactivas, para leer lo guardado). */
  opcionPorId: Record<number, { lista: ListaConductor; clave: string }>;
}

/** Casilla de "Antes de empezar" (A4) → clave del texto en la base (textos_autorizacion.clave). */
export const CLAVE_TEXTO = {
  terminos: 'terminos_privacidad',
  compartir: 'compartir_ficha',
  revision: 'revision_documentos',
  mensajes: 'normas_mensajes',
} as const;

/** Un texto de "Antes de empezar" vigente para el conductor. */
export interface TextoVigente {
  id: number;
  clave: string;
  version: string;
  obligatoria: boolean;
  /** Lo que dice: es lo que muestra A4 (y lo que la persona acepta). */
  texto: string;
}

/** Texto vigente de cada casilla de A4 (las que la base no tiene quedan fuera: A4 usa el suyo y no deja continuar). */
export function textosDeCasillas(textos: TextoVigente[]): Partial<Record<CasillaAutorizacion, string>> {
  const r: Partial<Record<CasillaAutorizacion, string>> = {};
  for (const [casilla, clave] of Object.entries(CLAVE_TEXTO) as [CasillaAutorizacion, string][]) {
    const t = textos.find((x) => x.clave === clave);
    if (t?.texto.trim()) r[casilla] = t.texto.trim();
  }
  return r;
}

export interface CatalogosLeidos {
  catalogos: CatalogosRegistro;
  mapas: MapasCatalogo;
  textos: TextoVigente[];
  diasReconfirmar: number;
}

/** Días entre confirmaciones si el ajuste no se puede leer. */
export const DIAS_RECONFIRMAR_POR_DEFECTO = 30;

const porOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden;

function pregunta(json: unknown): PreguntaVehiculo | null {
  if (!json || typeof json !== 'object') return null;
  const p = json as { pregunta?: unknown; respuestas?: unknown };
  if (typeof p.pregunta !== 'string' || !Array.isArray(p.respuestas)) return null;
  return {
    pregunta: p.pregunta,
    respuestas: p.respuestas
      .filter((r): r is { clave: string; texto: string; clases: string[] } => !!r && typeof r === 'object' && typeof (r as { clave?: unknown }).clave === 'string')
      .map((r) => ({ clave: r.clave, texto: String(r.texto ?? ''), clases: Array.isArray(r.clases) ? r.clases.map(String) : [] })),
  };
}

export function mapearCatalogos(f: FilasCatalogo): CatalogosLeidos {
  const claseCodigoPorId: Record<number, string> = {};
  const claseIdPorCodigo: Record<string, number> = {};
  for (const c of f.clases) {
    claseCodigoPorId[c.id] = c.codigo;
    claseIdPorCodigo[c.codigo] = c.id;
  }

  const opcionIdPorClave: MapasCatalogo['opcionIdPorClave'] = { turno: {}, dia_semana: {}, idioma: {} };
  const opcionPorId: MapasCatalogo['opcionPorId'] = {};
  const listas: Record<ListaConductor, OpcionLista[]> = { turno: [], dia_semana: [], idioma: [] };
  for (const l of f.listas) {
    if (!LISTAS.includes(l.clave as ListaConductor)) continue;
    const lista = l.clave as ListaConductor;
    for (const o of [...(l.opciones ?? [])].sort(porOrden)) {
      opcionPorId[o.id] = { lista, clave: o.clave };
      if (!o.activa) continue;
      opcionIdPorClave[lista][o.clave] = o.id;
      listas[lista].push(o.nombre_corto ? { clave: o.clave, nombre: o.nombre, corto: o.nombre_corto } : { clave: o.clave, nombre: o.nombre });
    }
  }

  const negocios: Negocio[] = [...f.negocios].sort(porOrden).map((n) => ({
    id: String(n.id),
    industriaId: String(n.industria_id),
    nombre: n.nombre,
    ejemplo: n.ejemplo,
    orden: n.orden,
    activo: n.activo,
    nota: n.nota,
    pregunta: pregunta(n.pregunta_vehiculo),
    clases: (n.negocio_clases_licencia ?? []).map((x) => claseCodigoPorId[x.clase_licencia_id]).filter((c): c is string => !!c),
    tamanos: (n.negocio_tamanos ?? []).map((x) => String(x.tamano_vehiculo_id)),
  }));

  const dias = Number(f.diasReconfirmar);
  return {
    catalogos: {
      regiones: [...f.regiones].sort(porOrden).map((r) => ({ id: String(r.id), nombre: r.nombre, orden: r.orden })),
      zonas: f.zonas.filter((z) => z.activa).map((z) => ({ id: String(z.id), regionId: String(z.region_id), nombre: z.nombre, orden: z.orden })),
      comunas: f.comunas
        .filter((c) => c.activa)
        .map((c) => ({ id: String(c.id), nombre: c.nombre, regionId: String(c.region_id), zonaId: String(c.zona_id), alternativos: c.nombres_alternativos ?? [] })),
      clases: f.clases
        .filter((c) => c.activa)
        .sort(porOrden)
        .map((c) => ({ codigo: c.codigo, nombre: c.nombre ?? `Clase ${c.codigo}`, esAntigua: c.es_antigua, habilitaClaseB: c.habilita_clase_b, orden: c.orden })),
      industrias: [...f.industrias].sort(porOrden).map((i) => ({ id: String(i.id), nombre: i.nombre, orden: i.orden, activo: i.activo })),
      tamanos: f.tamanos
        .filter((t) => t.activo)
        .sort(porOrden)
        .map((t) => ({ id: String(t.id), nombre: t.nombre, ayuda: t.ayuda ?? '', orden: t.orden })),
      negocios,
      turnos: listas.turno,
      dias: listas.dia_semana,
      idiomas: listas.idioma,
    },
    mapas: { claseIdPorCodigo, claseCodigoPorId, opcionIdPorClave, opcionPorId },
    textos: f.textos.map((t) => ({ id: t.id, clave: t.clave, version: t.version, obligatoria: t.obligatoria, texto: t.texto })),
    diasReconfirmar: Number.isInteger(dias) && dias > 0 ? dias : DIAS_RECONFIRMAR_POR_DEFECTO,
  };
}

/** Catálogos vacíos (antes de leer la base). */
export function catalogosVacios(): CatalogosLeidos {
  return mapearCatalogos({
    regiones: [],
    zonas: [],
    comunas: [],
    clases: [],
    industrias: [],
    tamanos: [],
    negocios: [],
    listas: [],
    textos: [],
    diasReconfirmar: null,
  });
}

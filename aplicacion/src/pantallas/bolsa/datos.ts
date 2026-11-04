// Lecturas propias del grupo "bolsa" (funciones puras sobre el estado). En pantallas se usan con
// useDerivado(...) para no caer en el re-render infinito.
import type { DatosDemo } from '@/datos/estado';
import { aniosEnNegocio, visibleEnBolsa } from '@/datos/match';
import {
  ID_USUARIO,
  busquedaPorId,
  catalogoMatch,
  conductorFicticioParaMatch,
  conductorUsuarioParaMatch,
  negocioPorId,
  planDeLaDemo,
  titularPorId,
} from '@/datos/selectores';
import type { Busqueda, Negocio, PerfilesBolsa, Postulacion, VisibilidadBolsa } from '@/datos/tipos';

// ---------------------------------------------------------------------------
// Textos
// ---------------------------------------------------------------------------

export const TEXTO_VISIBILIDAD: Record<VisibilidadBolsa, string> = {
  match: 'solo quienes hacen match',
  perfiles: 'conductores que tú elijas',
  todos: 'todos los conductores',
};

/** Lo que agrega cada visibilidad en la tabla de planes (BT5). */
export const TEXTO_VISIBILIDAD_PLAN: Record<VisibilidadBolsa, string> = {
  match: 'Solo match',
  perfiles: '+ Conductores que elijas',
  todos: '+ Todos los conductores',
};

/** Aviso al cambiar de plan: "Plan de la demo: Básico. 2 búsquedas quedaron en pausa y 2 ofertas salieron de la bolsa." */
export function textoCambioPlan(inicio: string, cambios: string[]): string {
  if (cambios.length === 0) return `${inicio}.`;
  const lista = cambios.length === 1 ? cambios[0] : `${cambios.slice(0, -1).join(', ')} y ${cambios[cambios.length - 1]}`;
  return `${inicio}. ${lista.charAt(0).toUpperCase()}${lista.slice(1)}.`;
}

/** Primera letra en mayúscula ("hace 5 días" → "Hace 5 días"). */
export const mayuscula = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

/** Nombre de los tipos de vehículo que cuentan para los años del negocio ("vehículo liviano"). */
export function textoTamanos(s: DatosDemo, negocio: Negocio | undefined): string {
  if (!negocio) return 'el vehículo';
  const nombres = negocio.tamanos
    .map((t) => s.catalogos.tamanos.find((x) => x.id === t)?.nombre)
    .filter((x): x is string => !!x)
    .map((x) => x.toLowerCase());
  if (nombres.length === 0) return 'el vehículo';
  if (nombres.length === 1) return nombres[0];
  return `${nombres.slice(0, -1).join(', ')} o ${nombres[nombres.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Conductor: estado de una postulación y si puede postular
// ---------------------------------------------------------------------------

/** Estado que ve el conductor: "Cerrada" si el titular la descartó o la búsqueda ya no está activa. */
export type EstadoVisto = 'enviada' | 'vista' | 'te_escribio' | 'cerrada';

export function estadoVisto(p: Postulacion, b: Busqueda | undefined): EstadoVisto {
  if (p.estado === 'te_escribio') return 'te_escribio';
  if (p.estado === 'descartada' || !b || b.estado !== 'activa') return 'cerrada';
  return p.estado;
}

export type MotivoNoPostula = 'incompleto' | 'en_revision' | 'con_observaciones' | 'no_disponible';

/** Propuesta MD45: para postular hay que estar verificado y "Disponible para trabajar". */
export function motivoNoPostula(s: DatosDemo): MotivoNoPostula | null {
  const c = s.conductor;
  if (!c.registrado || c.estadoPerfil !== 'completo') return 'incompleto';
  if (c.estadoVerificacion === 'con_observaciones') return 'con_observaciones';
  if (c.estadoVerificacion !== 'verificado') return 'en_revision';
  if (!c.disponible) return 'no_disponible';
  return null;
}

// ---------------------------------------------------------------------------
// Titular: cuántos conductores verían la oferta
// ---------------------------------------------------------------------------

/** Conductores (ficticios y el usuario, si se registró) que verían la oferta con esa visibilidad (R29). */
export function conductoresQueVerian(
  s: DatosDemo,
  busquedaId: string,
  visibilidad: VisibilidadBolsa,
  perfiles: PerfilesBolsa | null,
): number {
  const b = busquedaPorId(s, busquedaId);
  if (!b) return 0;
  const titular = titularPorId(s, b.titularId);
  const catalogo = catalogoMatch(s);
  const busqueda: Busqueda = { ...b, estado: 'activa' };
  const lista = [
    ...(s.conductor.registrado ? [{ id: ID_USUARIO, c: conductorUsuarioParaMatch(s) }] : []),
    ...s.conductores.map((c) => ({ id: c.id, c: conductorFicticioParaMatch(c) })),
  ];
  let n = 0;
  for (const { id, c } of lista) {
    const visible = visibleEnBolsa({
      conductor: c,
      busqueda,
      catalogo,
      reglas: s.reglas,
      bloqueado: id === ID_USUARIO && s.bloqueos.includes(b.titularId),
      titularSuspendido: titular?.suspendido,
      bolsaActiva: true,
      enBolsa: true,
      visibilidad,
      perfiles,
    });
    if (visible) n += 1;
  }
  return n;
}

/** Condiciones de "Conductores que tú elijas" para empezar, si la búsqueda aún no tiene. */
export function perfilesIniciales(s: DatosDemo, b: Busqueda): PerfilesBolsa {
  if (b.perfilesBolsa) return b.perfilesBolsa;
  const zona = s.catalogos.comunas.find((c) => c.id === b.comunaId)?.zonaId;
  return {
    zonas: zona ? [zona] : [],
    aniosMinimos: b.aniosMinimos,
    turnos: [...b.turnos],
    dias: [],
    estacionamiento: false,
  };
}

/** Resumen corto de las condiciones: "Zona Oriente · 2 años o más · Día". */
export function resumenPerfiles(s: DatosDemo, p: PerfilesBolsa): string {
  const partes: string[] = [];
  if (p.zonas.length === 0) partes.push('Toda la región');
  else if (p.zonas.length === 1) partes.push(s.catalogos.zonas.find((z) => z.id === p.zonas[0])?.nombre ?? '1 zona');
  else partes.push(`${p.zonas.length} zonas`);
  if (p.aniosMinimos > 0) partes.push(`${p.aniosMinimos} ${p.aniosMinimos === 1 ? 'año' : 'años'} o más`);
  if (p.turnos.length === 1) partes.push(p.turnos[0] === 'dia' ? 'Día' : 'Noche');
  if (p.dias.length > 0 && p.dias.length < 7) partes.push(`${p.dias.length} ${p.dias.length === 1 ? 'día' : 'días'}`);
  if (p.estacionamiento) partes.push('Con estacionamiento');
  return partes.join(' · ');
}

/** Ofertas del titular de la demo en la bolsa, y el máximo de su plan. */
export function cupoBolsa(s: DatosDemo) {
  const plan = planDeLaDemo(s);
  const usadas = s.busquedas.filter((b) => b.titularId === s.titularDemo.titularId && b.enBolsa).length;
  return { usadas, maximo: plan?.ofertasBolsa ?? 0, plan };
}

/** Años del conductor en el negocio de la búsqueda (para "5 años en vehículo liviano"). */
export function aniosParaBusqueda(s: DatosDemo, experiencia: Record<string, number>, negocioId: string): number {
  const n = negocioPorId(s, negocioId);
  return n ? aniosEnNegocio(experiencia, n) : 0;
}

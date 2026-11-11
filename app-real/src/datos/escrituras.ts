// Qué escribe la app real en cada pantalla, como "plan de escritura": una lista ordenada de operaciones
// (puras, las prueban tests/planes.test.ts) que después corre un ejecutor con supabase-js.
//
// Reglas (especificación de la app real v1, sección 9):
// - Todo con la sesión del conductor (rol authenticated) y SIEMPRE filtrado por su propio id.
// - Cada operación se puede repetir sin duplicar nada: si un paso falla a la mitad, la persona reintenta.
// - Nunca se manda `id` en consentimientos ni en experiencia_conductor (el INSERT es por columnas).
// - Clases de licencia: primero se agregan las nuevas y después se quitan las desmarcadas (al quitar una
//   clase, la base quita los negocios que ya no habilita ninguna clase declarada).
// - disponibilidad_confirmada_en va solo en el primer guardado del Paso 1 y al encender "Disponible";
//   la fecha la pone el servidor.
// - De las opciones (turnos, días, idiomas) se tocan solo las de la lista que corresponde, y de los
//   negocios solo los que hoy se muestran (lo guardado de un negocio apagado no se toca).
import type { SupabaseClient } from '@supabase/supabase-js';

import type { DatosPaso1, DatosPaso2Comuna, DatosPaso3, DatosPaso4, MarcasAutorizacion, Resultado } from '@/datos/puerto/tipos';

import { textosObligatorios, type ListaConductor, type MapasCatalogo, type TextoVigente } from './catalogos.ts';
import { TEXTO, esSesionVencida, textoErrorGuardar, type ErrorSupabase } from './errores.ts';
import { fechaParaLaBase } from './perfil.ts';
import { renovarSesion } from './sesion.ts';

export type Tabla =
  | 'cuentas'
  | 'conductores'
  | 'conductor_licencias'
  | 'conductor_negocios'
  | 'conductor_opciones'
  | 'experiencia_conductor'
  | 'consentimientos';

type Valor = string | number | boolean | null;
type Fila = Record<string, Valor>;

export type Operacion =
  /** UPDATE … WHERE id = uid. Si no cambia ninguna fila, falla con `sinFila`. */
  | { tipo: 'actualizar'; tabla: 'cuentas' | 'conductores'; id: string; valores: Fila; sinFila: string }
  /** INSERT del conductor; si ya existe (23505, quedó de un intento a medias), UPDATE con `siExiste`. */
  | { tipo: 'crear_conductor'; valores: Fila; siExiste: Fila }
  /** INSERT … ON CONFLICT (por las columnas indicadas): DO NOTHING o DO UPDATE. */
  | { tipo: 'agregar'; tabla: Tabla; filas: Fila[]; conflicto: string; siExiste: 'ignorar' | 'actualizar' }
  /** INSERT simple; un 23505 (ya estaba) se ignora. */
  | { tipo: 'insertar'; tabla: Tabla; filas: Fila[] }
  /** DELETE … WHERE (todas las igualdades) AND columna IN (valores). */
  | { tipo: 'quitar'; tabla: Tabla; donde: Fila; columna: string; valores: (string | number)[] };

export type Plan = Operacion[];

const sinRepetir = <T,>(l: T[]) => [...new Set(l)];
const menos = <T,>(a: T[], b: T[]) => a.filter((x) => !b.includes(x));

// ---------------------------------------------------------------------------
// Planes
// ---------------------------------------------------------------------------

/**
 * A4: los textos que se aceptan son los obligatorios vigentes, los mismos de las casillas de la pantalla
 * (vista.textosAutorizacion sale de esta misma lista; cada casilla, por el id de su texto). Hay que
 * marcarlos todos: si falta alguno, o la base no tiene textos, no se registra nada.
 */
export function textosParaAceptar(marcas: MarcasAutorizacion, vigentes: TextoVigente[]): Resultado<TextoVigente[]> {
  const obligatorios = textosObligatorios(vigentes);
  if (obligatorios.length === 0) return { ok: false, error: TEXTO.sinTextos };
  if (obligatorios.some((t) => !marcas[String(t.id)])) return { ok: false, error: TEXTO.marcarTodas };
  return { ok: true, valor: obligatorios };
}

/** A4: se agregan solo los textos que todavía no están aceptados (esa versión): las ya aceptadas no se duplican. */
export function planAutorizaciones(uid: string, textosMarcados: TextoVigente[], aceptados: number[]): Plan {
  const faltan = textosMarcados.filter((t) => !aceptados.includes(t.id));
  if (faltan.length === 0) return [];
  return [{ tipo: 'insertar', tabla: 'consentimientos', filas: faltan.map((t) => ({ cuenta_id: uid, texto_autorizacion_id: t.id })) }];
}

export function planPaso1(
  uid: string,
  d: DatosPaso1,
  actual: { registrado: boolean; clasesDeclaradas: string[] },
  mapas: MapasCatalogo,
  ahoraISO: string,
): Plan {
  const plan: Plan = [
    {
      tipo: 'actualizar',
      tabla: 'cuentas',
      id: uid,
      valores: {
        email: d.correo.trim(),
        nombres: d.nombres.trim(),
        primer_apellido: d.apellido1.trim(),
        segundo_apellido: d.apellido2.trim() || null,
      },
      sinFila: TEXTO.cuentaNoEncontrada,
    },
  ];
  const fecha = fechaParaLaBase(d.fechaNacimiento);
  if (!actual.registrado) {
    plan.push({
      tipo: 'crear_conductor',
      valores: { id: uid, fecha_nacimiento: fecha, disponible: d.disponible, disponibilidad_confirmada_en: ahoraISO },
      siExiste: { fecha_nacimiento: fecha, disponible: d.disponible },
    });
  } else {
    plan.push({ tipo: 'actualizar', tabla: 'conductores', id: uid, valores: { fecha_nacimiento: fecha, disponible: d.disponible }, sinFila: TEXTO.cuentaNoEncontrada });
  }
  const marcadas = sinRepetir(d.clasesDeclaradas).filter((c) => mapas.claseIdPorCodigo[c] !== undefined);
  const nuevas = menos(marcadas, actual.clasesDeclaradas);
  const quitadas = menos(actual.clasesDeclaradas, marcadas).filter((c) => mapas.claseIdPorCodigo[c] !== undefined);
  if (nuevas.length > 0) {
    plan.push({
      tipo: 'agregar',
      tabla: 'conductor_licencias',
      filas: nuevas.map((c) => ({ conductor_id: uid, clase_licencia_id: mapas.claseIdPorCodigo[c], origen: 'declarada' })),
      conflicto: 'conductor_id,clase_licencia_id,origen',
      siExiste: 'ignorar',
    });
  }
  if (quitadas.length > 0) {
    plan.push({
      tipo: 'quitar',
      tabla: 'conductor_licencias',
      donde: { conductor_id: uid, origen: 'declarada' },
      columna: 'clase_licencia_id',
      valores: quitadas.map((c) => mapas.claseIdPorCodigo[c]),
    });
  }
  return plan;
}

/** Paso 2 temporal: la comuna elegida de la lista y el estacionamiento; la dirección queda vacía. */
export function planPaso2(uid: string, d: DatosPaso2Comuna): Plan {
  return [
    {
      tipo: 'actualizar',
      tabla: 'conductores',
      id: uid,
      valores: {
        comuna_id: Number(d.comunaId),
        tiene_estacionamiento: d.tieneEstacionamiento,
        direccion: null,
        direccion_detalle: null,
        google_place_id: null,
      },
      sinFila: TEXTO.cuentaNoEncontrada,
    },
  ];
}

/** Agregar y quitar opciones de UNA lista (turno, dia_semana o idioma). */
function planOpciones(uid: string, listas: ListaConductor[], marcadas: string[], guardadas: string[], mapas: MapasCatalogo): Plan {
  const idDe = (clave: string) => {
    for (const l of listas) {
      const id = mapas.opcionIdPorClave[l][clave];
      if (id !== undefined) return id;
    }
    return undefined;
  };
  const idGuardado = (clave: string) => {
    for (const [id, o] of Object.entries(mapas.opcionPorId)) if (listas.includes(o.lista) && o.clave === clave) return Number(id);
    return undefined;
  };
  const nuevas = menos(sinRepetir(marcadas), guardadas)
    .map(idDe)
    .filter((x): x is number => x !== undefined);
  const quitadas = menos(guardadas, marcadas)
    .map(idGuardado)
    .filter((x): x is number => x !== undefined);
  const plan: Plan = [];
  if (nuevas.length > 0) {
    plan.push({
      tipo: 'agregar',
      tabla: 'conductor_opciones',
      filas: nuevas.map((opcion_id) => ({ conductor_id: uid, opcion_id })),
      conflicto: 'conductor_id,opcion_id',
      siExiste: 'ignorar',
    });
  }
  if (quitadas.length > 0) {
    plan.push({ tipo: 'quitar', tabla: 'conductor_opciones', donde: { conductor_id: uid }, columna: 'opcion_id', valores: quitadas });
  }
  return plan;
}

export function planPaso3(
  uid: string,
  d: DatosPaso3,
  actual: { experiencia: Record<string, number>; idiomas: string[] },
  mapas: MapasCatalogo,
): Plan {
  const plan: Plan = [];
  const marcados = Object.entries(d.experiencia).filter(([, anos]) => anos > 0);
  if (marcados.length > 0) {
    plan.push({
      tipo: 'agregar',
      tabla: 'experiencia_conductor',
      filas: marcados.map(([t, anos]) => ({ conductor_id: uid, tamano_vehiculo_id: Number(t), anos: Math.max(1, Math.min(50, Math.round(anos))) })),
      conflicto: 'conductor_id,tamano_vehiculo_id',
      siExiste: 'actualizar',
    });
  }
  const desmarcados = menos(Object.keys(actual.experiencia), marcados.map(([t]) => t));
  if (desmarcados.length > 0) {
    plan.push({ tipo: 'quitar', tabla: 'experiencia_conductor', donde: { conductor_id: uid }, columna: 'tamano_vehiculo_id', valores: desmarcados.map(Number) });
  }
  plan.push(...planOpciones(uid, ['idioma'], d.idiomas, actual.idiomas, mapas));
  return plan;
}

export function planPaso4(
  uid: string,
  d: DatosPaso4,
  actual: { negocios: string[]; turnos: string[]; dias: string[] },
  /** Negocios que hoy se muestran (activos, con industria activa) y que la licencia declarada permite. */
  visibles: string[],
  mapas: MapasCatalogo,
): Plan {
  const plan: Plan = [];
  const nuevos = menos(sinRepetir(d.negocios).filter((n) => visibles.includes(n)), actual.negocios);
  const quitados = menos(actual.negocios.filter((n) => visibles.includes(n)), d.negocios);
  if (nuevos.length > 0) {
    plan.push({
      tipo: 'agregar',
      tabla: 'conductor_negocios',
      filas: nuevos.map((n) => ({ conductor_id: uid, negocio_id: Number(n) })),
      conflicto: 'conductor_id,negocio_id',
      siExiste: 'ignorar',
    });
  }
  if (quitados.length > 0) {
    plan.push({ tipo: 'quitar', tabla: 'conductor_negocios', donde: { conductor_id: uid }, columna: 'negocio_id', valores: quitados.map(Number) });
  }
  plan.push(...planOpciones(uid, ['turno'], d.turnos, actual.turnos, mapas));
  plan.push(...planOpciones(uid, ['dia_semana'], d.dias, actual.dias, mapas));
  return plan;
}

/** Encender (con fecha de confirmación) o apagar "Disponible para trabajar". */
export function planDisponible(uid: string, disponible: boolean, ahoraISO: string): Plan {
  return [
    {
      tipo: 'actualizar',
      tabla: 'conductores',
      id: uid,
      valores: disponible ? { disponible: true, disponibilidad_confirmada_en: ahoraISO } : { disponible: false },
      sinFila: TEXTO.cuentaNoEncontrada,
    },
  ];
}

/** E4 "Sí, sigo disponible": la fecha la pone el servidor. */
export const planConfirmarDisponibilidad = (uid: string, ahoraISO: string): Plan => planDisponible(uid, true, ahoraISO);

// ---------------------------------------------------------------------------
// Ejecutor
// ---------------------------------------------------------------------------

type Respuesta = { error: (ErrorSupabase & { code?: string }) | null; data?: unknown; status?: number };

/** Resultado de correr un plan. `vencida`: la base rechazó el token y no se pudo renovar (hay que volver a entrar). */
export type ResultadoPlan = Resultado | { ok: false; error: string; vencida: true };

// Las tablas se eligen en tiempo de ejecución: supabase-js no puede tipar cada combinación. Las columnas
// y valores están fijados por los planes de arriba (probados contra la base en supabase/pruebas).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any>;

async function correr(cliente: Cliente, op: Operacion): Promise<Respuesta & { sinFila?: boolean }> {
  switch (op.tipo) {
    case 'actualizar': {
      const r = await cliente.from(op.tabla).update(op.valores).eq('id', op.id).select('id');
      if (!r.error && (!Array.isArray(r.data) || r.data.length === 0)) return { error: null, sinFila: true };
      return { error: r.error, status: r.status };
    }
    case 'crear_conductor': {
      const r = await cliente.from('conductores').insert(op.valores).select('id');
      if (r.error?.code === '23505') {
        const u = await cliente.from('conductores').update(op.siExiste).eq('id', String(op.valores.id)).select('id');
        return { error: u.error, status: u.status };
      }
      return { error: r.error, status: r.status };
    }
    case 'agregar': {
      const r = await cliente
        .from(op.tabla)
        .upsert(op.filas, { onConflict: op.conflicto, ignoreDuplicates: op.siExiste === 'ignorar' });
      return { error: r.error, status: r.status };
    }
    case 'insertar': {
      const r = await cliente.from(op.tabla).insert(op.filas);
      if (r.error?.code === '23505') return { error: null };
      return { error: r.error, status: r.status };
    }
    case 'quitar': {
      let q = cliente.from(op.tabla).delete();
      for (const [col, val] of Object.entries(op.donde)) q = q.eq(col, val as string);
      const r = await q.in(op.columna, op.valores);
      return { error: r.error, status: r.status };
    }
  }
}

/**
 * Corre el plan en orden. Se detiene en el primer error y devuelve el texto para la pantalla.
 * Si la base rechaza el token, intenta renovar la sesión UNA vez y repite la operación (sin red, es un
 * error de conexión; si el servidor no la renueva, `vencida`).
 */
export async function ejecutarPlan(cliente: Cliente, plan: Plan): Promise<ResultadoPlan> {
  for (const op of plan) {
    let r = await correr(cliente, op);
    if (r.error && esSesionVencida(r.error)) {
      const renovacion = await renovarSesion(cliente);
      if (renovacion === 'sin_conexion') return { ok: false, error: TEXTO.guardarConexion };
      if (renovacion === 'vencida') return { ok: false, error: TEXTO.sesionVencida, vencida: true };
      r = await correr(cliente, op);
    }
    if (r.error) {
      const e = { ...r.error, status: r.status };
      if (e.code === '42501' || /row-level security/i.test(e.message ?? '')) console.warn('Dale Contacto: la base no dejó guardar', op.tipo, e.message);
      return { ok: false, error: textoErrorGuardar(e) };
    }
    if (r.sinFila && op.tipo === 'actualizar') return { ok: false, error: op.sinFila };
  }
  return { ok: true, valor: undefined };
}

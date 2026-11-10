// Lecturas de la base: catálogos (los puede leer cualquiera, también sin sesión) y el perfil propio
// (SIEMPRE filtrado por el propio id: alguien del equipo ve por RLS las filas de todos).
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../tiposBd.ts';

import { LISTAS, type FilasCatalogo } from './catalogos.ts';
import type { ErrorSupabase } from './errores.ts';
import type { FilasPerfil } from './perfil.ts';
import type { Lectura } from './sesion.ts';

type Cliente = SupabaseClient<Database>;

function fallo(r: { error: ErrorSupabase | null; status?: number }): ErrorSupabase | null {
  return r.error ? { ...r.error, status: r.status } : null;
}

/** Los 9 catálogos en paralelo (≈ 350 comunas: bajo el límite de 1.000 filas de la API). */
export async function leerCatalogos(cliente: Cliente): Promise<Lectura<FilasCatalogo>> {
  const [regiones, zonas, comunas, clases, industrias, tamanos, negocios, listas, textos, ajuste] = await Promise.all([
    cliente.from('regiones').select('id,nombre,orden').order('orden'),
    cliente.from('zonas').select('id,region_id,nombre,orden,activa'),
    cliente.from('comunas').select('id,nombre,nombres_alternativos,region_id,zona_id,activa'),
    cliente.from('clases_licencia').select('id,codigo,nombre,es_antigua,habilita_clase_b,orden,activa').order('orden'),
    cliente.from('industrias').select('id,nombre,orden,activo'),
    cliente.from('tamanos_vehiculo').select('id,nombre,ayuda,orden,activo').order('orden'),
    cliente
      .from('negocios')
      .select('id,industria_id,nombre,ejemplo,pregunta_vehiculo,nota,orden,activo,negocio_clases_licencia(clase_licencia_id),negocio_tamanos(tamano_vehiculo_id)'),
    cliente.from('listas').select('clave,opciones(id,clave,nombre,nombre_corto,orden,activa)').in('clave', LISTAS),
    // El filtro es explícito: alguien del equipo ve también las versiones anteriores.
    cliente
      .from('textos_autorizacion')
      .select('id,clave,version,obligatoria,texto')
      .eq('vigente', true)
      .in('para_quien', ['conductor', 'todos'])
      .order('orden'),
    cliente.from('ajustes').select('id,valor').eq('id', 'dias_reconfirmar_disponibilidad').maybeSingle(),
  ]);
  for (const r of [regiones, zonas, comunas, clases, industrias, tamanos, negocios, listas, textos]) {
    const e = fallo(r);
    if (e) return { datos: null, error: e };
  }
  return {
    datos: {
      regiones: regiones.data ?? [],
      zonas: zonas.data ?? [],
      comunas: comunas.data ?? [],
      clases: clases.data ?? [],
      industrias: industrias.data ?? [],
      tamanos: tamanos.data ?? [],
      negocios: (negocios.data ?? []) as FilasCatalogo['negocios'],
      listas: (listas.data ?? []) as FilasCatalogo['listas'],
      textos: textos.data ?? [],
      // Si el ajuste no se puede leer, la app usa 30 días (no corta la entrada por esto).
      diasReconfirmar: ajuste.error ? null : (ajuste.data?.valor ?? null),
    },
    error: null,
  };
}

/** Las 7 lecturas del perfil propio, en paralelo. */
export async function leerPerfil(cliente: Cliente, uid: string): Promise<Lectura<FilasPerfil>> {
  const [cuenta, conductor, licencias, experiencia, negocios, opciones, consentimientos] = await Promise.all([
    cliente
      .from('cuentas')
      .select('id,celular,celular_verificado_en,creado_en,email,nombres,primer_apellido,segundo_apellido,estado')
      .eq('id', uid)
      .maybeSingle(),
    cliente
      .from('conductores')
      .select('id,fecha_nacimiento,comuna_id,tiene_estacionamiento,disponible,disponibilidad_confirmada_en,estado_perfil,estado_verificacion,creado_en')
      .eq('id', uid)
      .maybeSingle(),
    cliente.from('conductor_licencias').select('clase_licencia_id,origen').eq('conductor_id', uid),
    cliente.from('experiencia_conductor').select('tamano_vehiculo_id,anos').eq('conductor_id', uid),
    cliente.from('conductor_negocios').select('negocio_id').eq('conductor_id', uid),
    cliente.from('conductor_opciones').select('opcion_id').eq('conductor_id', uid),
    cliente.from('consentimientos').select('texto_autorizacion_id').eq('cuenta_id', uid).is('revocado_en', null),
  ]);
  for (const r of [cuenta, conductor, licencias, experiencia, negocios, opciones, consentimientos]) {
    const e = fallo(r);
    if (e) return { datos: null, error: e };
  }
  return {
    datos: {
      cuenta: cuenta.data ?? null,
      conductor: conductor.data ?? null,
      licencias: licencias.data ?? [],
      experiencia: experiencia.data ?? [],
      negocios: negocios.data ?? [],
      opciones: opciones.data ?? [],
      consentimientos: consentimientos.data ?? [],
    },
    error: null,
  };
}

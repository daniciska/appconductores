-- =====================================================================
-- app_conductor_v1_postgrest.sql — la app real del conductor v1, con el SQL
-- que arma PostgREST para cada pedido de la app (app-real/src/datos/
-- escrituras.ts y lecturas.ts), como authenticated y con sus permisos.
--
-- Complementa app_conductor_v1_pruebas.sql (que prueba las reglas). Aquí se
-- prueban las FORMAS que podrían fallar por permisos aunque la regla esté
-- bien:
--   * upsert de experiencia con ON CONFLICT … DO UPDATE SET de TODAS las
--     columnas enviadas (incluidas conductor_id y tamano_vehiculo_id);
--   * INSERT … RETURNING id (select('id')) y UPDATE … RETURNING id;
--   * INSERT por columnas sin id (consentimientos y experiencia);
--   * ON CONFLICT … DO NOTHING (ignorar repetidos) en licencias y opciones;
--   * los ids de los catálogos que usan las pruebas de la app (Ñuñoa = 94,
--     Taxi = 1, Taxi ejecutivo = 3, opciones 1 a 14) son los de la base.
--
-- Orden en local: después de app_conductor_v1_pruebas.sql (ver
-- supabase/README.md). Todo termina en ROLLBACK.
-- =====================================================================

\set ON_ERROR_STOP 1
set client_min_messages = notice;

begin;

create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.usuarios (alias text primary key, id uuid not null, celular text not null);
grant select on pruebas.usuarios to public;
insert into pruebas.usuarios values
  ('c', 'cccccccc-1111-4000-8000-00000000000c', '56990000011'),
  ('d', 'dddddddd-1111-4000-8000-00000000000d', '56990000012');

create function pruebas.id(p_alias text) returns uuid
language sql stable as $$ select id from pruebas.usuarios where alias = p_alias $$;

create function pruebas.como(p_quien text) returns void
language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  if p_quien in ('anon', 'service_role', 'supabase_auth_admin') then
    execute format('set local role %I', p_quien);
  elsif p_quien <> 'postgres' then
    perform set_config('request.jwt.claim.sub', pruebas.id(p_quien)::text, true);
    set local role authenticated;
  end if;
end $$;

create function pruebas.ok(p_condicion boolean, p_nombre text) returns void
language plpgsql as $$
begin
  if p_condicion is distinct from true then
    raise exception 'FALLA: %', p_nombre;
  end if;
  raise notice 'OK  %', p_nombre;
end $$;

create function pruebas.falla(p_sql text, p_patron text, p_nombre text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlerrm ~* p_patron then
      raise notice 'OK  % — %', p_nombre, sqlerrm;
      return;
    end if;
    raise exception 'FALLA: % — error distinto del esperado: % [%]', p_nombre, sqlerrm, sqlstate;
  end;
  raise exception 'FALLA: % — se esperaba un error y no lo hubo', p_nombre;
end $$;

grant execute on all functions in schema pruebas to public;

-- Las dos personas entran (piden y confirman el código).
do $$
declare u record;
begin
  perform pruebas.como('supabase_auth_admin');
  for u in select * from pruebas.usuarios loop
    insert into auth.users (id, phone, phone_confirmed_at) values (u.id, u.celular, now());
  end loop;
end $$;


-- =====================================================================
-- CI. Ids de los catálogos que usan las pruebas de la app (simulador)
-- =====================================================================
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select id from public.comunas where nombre = 'Ñuñoa') = 94
                 and (select zona_id from public.comunas where nombre = 'Ñuñoa') = 26,
    '[CI1] Ñuñoa es la comuna 94, en la zona 26');
  perform pruebas.ok((select array_agg(id order by id) from public.negocios where activo) = array[1, 3]::bigint[],
    '[CI2] los negocios activos son el 1 (Taxi) y el 3 (Taxi ejecutivo)');
  perform pruebas.ok((select array_agg(o.clave order by o.id) from public.opciones o join public.listas l on l.id = o.lista_id
                       where l.clave in ('turno', 'dia_semana', 'idioma'))
                     = array['dia','noche','lu','ma','mi','ju','vi','sa','do','es','en','pt','fr','ht']
                 and (select min(o.id) from public.opciones o) = 1,
    '[CI3] opciones 1 a 14: turnos, días e idiomas en ese orden');
  perform pruebas.ok((select count(*) from public.ajustes) = 1, '[CI4] sin sesión se lee el ajuste público de días');
end $$;


-- =====================================================================
-- PR. Las formas de PostgREST, como authenticated
-- =====================================================================
do $$
declare
  v_id uuid;
  n bigint;
begin
  perform pruebas.como('c');

  -- A4: insert por columnas (sin id), return=minimal.
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('c'), t.id from public.textos_autorizacion t where t.vigente;
  perform pruebas.ok((select count(*) from public.consentimientos where revocado_en is null) = 4,
    '[PR1] "Antes de empezar": insert por columnas sin id');

  -- Paso 1: PATCH cuentas … select=id → UPDATE … RETURNING id.
  update public.cuentas set email = 'c@ejemplo.cl', nombres = 'Ce', primer_apellido = 'Prueba', segundo_apellido = null
   where id = pruebas.id('c') returning id into v_id;
  perform pruebas.ok(v_id = pruebas.id('c'), '[PR2] update de cuentas con RETURNING id');

  -- Paso 1: POST conductores … select=id → INSERT … RETURNING id.
  insert into public.conductores (id, fecha_nacimiento, disponible, disponibilidad_confirmada_en)
  values (pruebas.id('c'), '1990-03-14', true, '2000-01-01') returning id into v_id;
  perform pruebas.ok(v_id = pruebas.id('c'), '[PR3] insert de conductores con RETURNING id');

  -- Paso 1: clases con ON CONFLICT DO NOTHING (resolution=ignore-duplicates).
  insert into public.conductor_licencias (clase_licencia_id, conductor_id, origen)
  values (2, pruebas.id('c'), 'declarada'), (6, pruebas.id('c'), 'declarada')
  on conflict (conductor_id, clase_licencia_id, origen) do nothing;
  insert into public.conductor_licencias (clase_licencia_id, conductor_id, origen)
  values (2, pruebas.id('c'), 'declarada')
  on conflict (conductor_id, clase_licencia_id, origen) do nothing;
  perform pruebas.ok((select count(*) from public.conductor_licencias) = 2, '[PR4] licencias: repetir no duplica');

  -- Paso 2: PATCH conductores … select=id.
  update public.conductores set comuna_id = 94, tiene_estacionamiento = true, direccion = null, direccion_detalle = null, google_place_id = null
   where id = pruebas.id('c') returning id into v_id;
  perform pruebas.ok(v_id = pruebas.id('c'), '[PR5] Paso 2: update con RETURNING id');

  -- Paso 3: upsert de experiencia como lo arma PostgREST (resolution=merge-duplicates):
  -- DO UPDATE SET de todas las columnas enviadas, también las de la llave.
  insert into public.experiencia_conductor (anos, conductor_id, tamano_vehiculo_id)
  values (5, pruebas.id('c'), 2), (2, pruebas.id('c'), 3)
  on conflict (conductor_id, tamano_vehiculo_id) do update
     set anos = excluded.anos, conductor_id = excluded.conductor_id, tamano_vehiculo_id = excluded.tamano_vehiculo_id;
  insert into public.experiencia_conductor (anos, conductor_id, tamano_vehiculo_id)
  values (6, pruebas.id('c'), 2)
  on conflict (conductor_id, tamano_vehiculo_id) do update
     set anos = excluded.anos, conductor_id = excluded.conductor_id, tamano_vehiculo_id = excluded.tamano_vehiculo_id;
  perform pruebas.ok((select anos from public.experiencia_conductor where tamano_vehiculo_id = 2) = 6
                 and (select count(*) from public.experiencia_conductor) = 2,
    '[PR6] Paso 3: upsert de años con DO UPDATE SET de todas las columnas (como PostgREST)');
  perform pruebas.falla($q$insert into public.experiencia_conductor (id, anos, conductor_id, tamano_vehiculo_id)
                          overriding system value values (999, 1, pruebas.id('c'), 4)$q$,
    'permission denied', '[PR7] Paso 3: mandar id no se puede (por eso la app no lo manda)');

  -- Paso 3 y 4: opciones con ON CONFLICT DO NOTHING y DELETE … IN.
  insert into public.conductor_opciones (conductor_id, opcion_id)
  values (pruebas.id('c'), 10), (pruebas.id('c'), 11), (pruebas.id('c'), 1), (pruebas.id('c'), 3), (pruebas.id('c'), 4)
  on conflict (conductor_id, opcion_id) do nothing;
  delete from public.conductor_opciones where conductor_id = pruebas.id('c') and opcion_id in (11);
  get diagnostics n = row_count;
  perform pruebas.ok(n = 1 and (select count(*) from public.conductor_opciones) = 4, '[PR8] opciones: agregar ignorando repetidas y quitar con IN');

  -- Paso 4: negocios.
  insert into public.conductor_negocios (conductor_id, negocio_id)
  values (pruebas.id('c'), 1), (pruebas.id('c'), 3)
  on conflict (conductor_id, negocio_id) do nothing;
  perform pruebas.ok((select count(*) from public.conductor_negocios) = 2, '[PR9] Paso 4: negocios ignorando repetidos');

  -- Lo de otra persona no se toca aunque la app se equivocara de id (RLS): 0 filas.
  update public.conductores set disponible = false where id = pruebas.id('d') returning id into v_id;
  perform pruebas.ok(v_id is null, '[PR10] un update con el id de otra persona no cambia nada (la app muestra "No encontramos tu cuenta")');
  perform pruebas.falla($q$insert into public.conductor_opciones (conductor_id, opcion_id) values (pruebas.id('d'), 1)$q$,
    'row-level security', '[PR11] nadie escribe en el perfil de otra persona');
end $$;

do $$ begin raise notice 'FIN: todas las pruebas de las formas de PostgREST de la app v1 pasaron.'; end $$;

rollback;

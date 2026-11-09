-- =====================================================================
-- app_conductor_v1_pruebas.sql — pruebas de la app real del conductor v1.
--
-- Orden en local (Postgres 16), en una base nueva:
--   auth_simulado.sql → etapa1_esquema → etapa1_datos_iniciales →
--   etapa1_pruebas.sql (termina en ROLLBACK) →
--   app_conductor_v1_textos_prueba → app_conductor_v1_ajustes_publicos →
--   este archivo.
-- etapa1_pruebas.sql va ANTES de las migraciones nuevas porque comprueba el
-- estado exacto de la Etapa 1 (0 textos, 1 ajuste, anon sin permisos en
-- ajustes).
--
-- Reproduce en SQL, como authenticated, lo que la app hace en cada pantalla
-- (el "plan de escritura" de la especificación). Todo termina en ROLLBACK.
-- Cada prueba escribe "OK  [código] ..." o corta todo con "FALLA: ...".
-- =====================================================================

\set ON_ERROR_STOP 1
set client_min_messages = notice;

begin;

create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.usuarios (alias text primary key, id uuid not null, celular text not null);
grant select on pruebas.usuarios to public;
insert into pruebas.usuarios values
  ('a',      'aaaaaaaa-1111-4000-8000-00000000000a', '56990000001'),  -- se registra en la prueba
  ('b',      'bbbbbbbb-1111-4000-8000-00000000000b', '56990000002'),  -- otro conductor
  ('admin',  'eeeeeeee-1111-4000-8000-00000000000e', '56990000003');  -- del equipo y también conductor

create function pruebas.id(p_alias text) returns uuid
language sql stable as $$ select id from pruebas.usuarios where alias = p_alias $$;
create function pruebas.clase(p_codigo text) returns bigint
language sql stable as $$ select id from public.clases_licencia where codigo = p_codigo $$;
create function pruebas.negocio(p_nombre text) returns bigint
language sql stable as $$ select id from public.negocios where nombre = p_nombre $$;
create function pruebas.opcion(p_lista text, p_clave text) returns bigint
language sql stable as $$
  select o.id from public.opciones o join public.listas l on l.id = o.lista_id
   where l.clave = p_lista and o.clave = p_clave $$;
create function pruebas.tamano(p_nombre text) returns bigint
language sql stable as $$ select id from public.tamanos_vehiculo where nombre = p_nombre $$;

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

create function pruebas.filas(p_sql text) returns bigint
language plpgsql as $$
declare n bigint;
begin
  execute p_sql;
  get diagnostics n = row_count;
  return n;
end $$;

grant execute on all functions in schema pruebas to public;


-- =====================================================================
-- T. Textos de autorización de prueba
-- =====================================================================
do $$
begin
  perform pruebas.ok((select count(*) from public.textos_autorizacion where vigente) = 4
                 and (select array_agg(clave order by orden) from public.textos_autorizacion where vigente)
                     = array['terminos_privacidad', 'compartir_ficha', 'revision_documentos', 'normas_mensajes'],
    '[T1] 4 textos vigentes, en el orden de la pantalla A4');
  perform pruebas.ok(not exists (select 1 from public.textos_autorizacion
                                  where vigente and (version <> 'prueba-1' or para_quien <> 'conductor'
                                                     or not obligatoria or vigente_desde is null
                                                     or exige_aceptar_de_nuevo or enlace is not null)),
    '[T2] todos: versión prueba-1, para el conductor, obligatorios, con vigente_desde y sin enlace');
  perform pruebas.ok((select texto from public.textos_autorizacion where clave = 'terminos_privacidad')
                     = 'Acepto los Términos y la Política de privacidad, y declaro ser mayor de 18 años.',
    '[T3] el texto de Términos es el de la maqueta');
  perform pruebas.como('anon');
  perform pruebas.ok((select count(*) from public.textos_autorizacion) = 4, '[T4] anon lee los 4 textos vigentes');
end $$;


-- =====================================================================
-- I. Ingreso: pedir el código y confirmarlo (lo hace Supabase Auth)
-- =====================================================================
do $$
declare u record;
begin
  perform pruebas.como('supabase_auth_admin');
  for u in select * from pruebas.usuarios loop
    insert into auth.users (id, phone) values (u.id, u.celular);
  end loop;
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from public.cuentas) = 0, '[I1] pedir el código no crea la cuenta');

  perform pruebas.como('supabase_auth_admin');
  update auth.users set phone_confirmed_at = now();
  perform pruebas.como('postgres');
  perform pruebas.ok((select celular from public.cuentas where id = pruebas.id('a')) = '+56990000001'
                 and (select count(*) from public.cuentas) = 3,
    '[I2] confirmar el código crea la cuenta con el celular en formato +569');
  insert into public.miembros_equipo (id, rol) values (pruebas.id('admin'), 'administrador');

  -- Lo primero que lee la app después de verifyOtp.
  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.cuentas where id = pruebas.id('a')) = 1
                 and (select count(*) from public.conductores where id = pruebas.id('a')) = 0
                 and (select count(*) from public.consentimientos
                       where cuenta_id = pruebas.id('a') and revocado_en is null) = 0,
    '[I3] tras verificar: hay cuenta, sin conductor y sin autorizaciones → va a "Antes de empezar"');
end $$;


-- =====================================================================
-- A. "Antes de empezar": se insertan solo las que faltan
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id, aceptado_en)
  select pruebas.id('a'), t.id, '2000-01-01'
    from public.textos_autorizacion t
   where t.vigente and t.obligatoria and t.para_quien in ('conductor', 'todos');
  perform pruebas.ok((select count(*) from public.consentimientos
                       where cuenta_id = pruebas.id('a') and revocado_en is null
                         and aceptado_en > now() - interval '1 minute') = 4,
    '[A1] acepta las 4; la fecha la pone el servidor');
  perform pruebas.falla($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
                          select pruebas.id('a'), id from public.textos_autorizacion where clave = 'compartir_ficha'$q$,
    'consentimientos_una_activa', '[A2] aceptar de nuevo una ya vigente da 23505 (la app la ignora y vuelve a leer)');
  perform pruebas.falla($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
                          select pruebas.id('b'), id from public.textos_autorizacion where clave = 'compartir_ficha'$q$,
    'row-level security', '[A3] nadie acepta por otra persona');

  perform pruebas.como('b');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('b'), id from public.textos_autorizacion where vigente;
  perform pruebas.como('admin');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('admin'), id from public.textos_autorizacion where vigente;
end $$;


-- =====================================================================
-- P1. Paso 1: update cuentas → insert conductores → clases
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  perform pruebas.ok(pruebas.filas($q$update public.cuentas
       set email = 'equipo.a@ejemplo.cl', nombres = 'Ana María', primer_apellido = 'Prueba', segundo_apellido = null
     where id = pruebas.id('a')$q$) = 1, '[P1] guarda nombres, apellidos y correo en cuentas');

  perform pruebas.falla($q$insert into public.conductores (id, fecha_nacimiento, disponible)
                          values (pruebas.id('a'), (now() at time zone 'America/Santiago')::date - interval '17 years', true)$q$,
    '18 años', '[P2] menor de 18: la base devuelve el mensaje en español');

  insert into public.conductores (id, fecha_nacimiento, disponible, disponibilidad_confirmada_en)
  values (pruebas.id('a'), '1990-03-14', true, '2000-01-01');
  perform pruebas.ok((select estado_perfil = 'incompleto' and estado_verificacion = 'sin_documentos'
                             and disponibilidad_confirmada_en > now() - interval '1 minute'
                        from public.conductores where id = pruebas.id('a')),
    '[P3] primer guardado: perfil incompleto y disponibilidad confirmada ahora (fecha del servidor)');
  perform pruebas.falla($q$insert into public.conductores (id, fecha_nacimiento) values (pruebas.id('a'), '1990-03-14')$q$,
    'conductores_pkey', '[P4] un segundo insert da 23505: la app pasa a update');

  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('a'), pruebas.clase('A2'), 'declarada'), (pruebas.id('a'), pruebas.clase('B'), 'declarada')
  on conflict (conductor_id, clase_licencia_id, origen) do nothing;
  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('a'), pruebas.clase('B'), 'declarada')
  on conflict (conductor_id, clase_licencia_id, origen) do nothing;
  perform pruebas.ok((select count(*) from public.conductor_licencias where conductor_id = pruebas.id('a')) = 2,
    '[P5] clases con "insertar ignorando repetidas" (upsert ignoreDuplicates): repetir no duplica');

  -- Edición: sin mandar disponibilidad_confirmada_en, la fecha no cambia.
  update public.conductores set fecha_nacimiento = '1990-03-15', disponible = true where id = pruebas.id('a');
  perform pruebas.ok((select fecha_nacimiento = '1990-03-15' from public.conductores where id = pruebas.id('a')),
    '[P6] editar el Paso 1 es un update simple');
  perform pruebas.falla($q$update public.conductores set estado_perfil = 'completo' where id = pruebas.id('a')$q$,
    'No puedes cambiar', '[P7] la app no marca el perfil como completo');
end $$;


-- =====================================================================
-- P2. Paso 2 temporal: comuna elegida de la lista, sin dirección
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  perform pruebas.ok(pruebas.filas($q$update public.conductores
       set comuna_id = (select id from public.comunas where nombre = 'Ñuñoa'),
           tiene_estacionamiento = false, direccion = null, direccion_detalle = null, google_place_id = null
     where id = pruebas.id('a')$q$) = 1, '[P8] guarda la comuna y el estacionamiento con la dirección vacía');
  perform pruebas.ok((select z.region_id = c.region_id
                        from public.conductores d join public.comunas c on c.id = d.comuna_id
                        join public.zonas z on z.id = c.zona_id where d.id = pruebas.id('a')),
    '[P9] zona y región salen de la comuna (no se guardan en conductores)');
end $$;


-- =====================================================================
-- P3. Paso 3: experiencia (upsert por conductor y tamaño) e idiomas
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos)
  values (pruebas.id('a'), pruebas.tamano('Vehículo liviano'), 5), (pruebas.id('a'), pruebas.tamano('Van o minibús'), 2)
  on conflict (conductor_id, tamano_vehiculo_id) do update set anos = excluded.anos;
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos)
  values (pruebas.id('a'), pruebas.tamano('Vehículo liviano'), 6)
  on conflict (conductor_id, tamano_vehiculo_id) do update set anos = excluded.anos;
  delete from public.experiencia_conductor
   where conductor_id = pruebas.id('a') and tamano_vehiculo_id in (pruebas.tamano('Van o minibús'));
  perform pruebas.ok((select array_agg(anos) from public.experiencia_conductor where conductor_id = pruebas.id('a'))
                     = array[6::smallint],
    '[P10] el upsert cambia los años y el delete quita el desmarcado');

  insert into public.conductor_opciones (conductor_id, opcion_id)
  values (pruebas.id('a'), pruebas.opcion('idioma', 'es')), (pruebas.id('a'), pruebas.opcion('idioma', 'en'))
  on conflict (conductor_id, opcion_id) do nothing;
  delete from public.conductor_opciones
   where conductor_id = pruebas.id('a') and opcion_id in (pruebas.opcion('idioma', 'en'));
  perform pruebas.ok((select count(*) from public.conductor_opciones where conductor_id = pruebas.id('a')) = 1,
    '[P11] idiomas: agregar ignorando repetidos y quitar los desmarcados');
end $$;


-- =====================================================================
-- P4. Paso 4: negocios, turno y días
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  insert into public.conductor_negocios (conductor_id, negocio_id)
  values (pruebas.id('a'), pruebas.negocio('Taxi')), (pruebas.id('a'), pruebas.negocio('Taxi ejecutivo'))
  on conflict (conductor_id, negocio_id) do nothing;
  perform pruebas.falla($q$insert into public.conductor_negocios (conductor_id, negocio_id)
                          values (pruebas.id('a'), pruebas.negocio('Taxi colectivo'))$q$,
    'no está disponible', '[P12] un negocio apagado no se puede elegir');
  insert into public.conductor_opciones (conductor_id, opcion_id)
  select pruebas.id('a'), o from unnest(array[pruebas.opcion('turno', 'dia'),
                                              pruebas.opcion('dia_semana', 'lu'), pruebas.opcion('dia_semana', 'ma')]) o
  on conflict (conductor_id, opcion_id) do nothing;
  perform pruebas.ok((select count(*) from public.conductor_negocios where conductor_id = pruebas.id('a')) = 2
                 and (select count(*) from public.conductor_opciones co join public.opciones o on o.id = co.opcion_id
                        join public.listas l on l.id = o.lista_id
                       where co.conductor_id = pruebas.id('a') and l.clave in ('turno', 'dia_semana')) = 3,
    '[P13] Paso 4 guardado: 2 negocios, 1 turno y 2 días');
  perform pruebas.ok((select estado_perfil from public.conductores where id = pruebas.id('a')) = 'incompleto',
    '[P14] sin documentos el perfil sigue incompleto (lo calcula el sistema en la Etapa 3)');

  -- Quitar la A2 en el Paso 1 (primero se agregan las nuevas, después se quitan las desmarcadas).
  delete from public.conductor_licencias
   where conductor_id = pruebas.id('a') and origen = 'declarada' and clase_licencia_id in (pruebas.clase('A2'));
  perform pruebas.ok((select count(*) from public.conductor_negocios where conductor_id = pruebas.id('a')) = 0,
    '[P15] quitar la única clase que habilita los taxis los quita del Paso 4 (la app vuelve a leer)');
end $$;


-- =====================================================================
-- D. Disponible para trabajar
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  update public.conductores set disponible = false where id = pruebas.id('a');
  update public.conductores set disponible = true, disponibilidad_confirmada_en = '1999-01-01' where id = pruebas.id('a');
  perform pruebas.ok((select disponible and disponibilidad_confirmada_en > now() - interval '1 minute'
                        from public.conductores where id = pruebas.id('a')),
    '[D1] pausar y volver: la fecha de confirmación la pone el servidor');
end $$;


-- =====================================================================
-- L. Lecturas: la app SIEMPRE filtra por su propio id
-- =====================================================================
do $$
begin
  perform pruebas.como('postgres');
  insert into public.conductores (id, fecha_nacimiento) values (pruebas.id('b'), '1985-01-01'), (pruebas.id('admin'), '1980-01-01');
  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('b'), pruebas.clase('B'), 'declarada'), (pruebas.id('admin'), pruebas.clase('A1'), 'declarada');

  perform pruebas.como('admin');
  perform pruebas.ok((select count(distinct conductor_id) from public.conductor_licencias) = 3,
    '[L1] alguien del equipo SIN filtro ve las clases de todos (por eso la app filtra)');
  perform pruebas.ok((select count(*) from public.conductor_licencias where conductor_id = pruebas.id('admin')) = 1
                 and (select count(*) from public.cuentas where id = pruebas.id('admin')) = 1,
    '[L2] con el filtro por su id, ve solo lo suyo');

  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.conductor_licencias) = 1
                 and (select count(*) from public.cuentas) = 1,
    '[L3] un conductor ve solo lo suyo aunque no filtre');
end $$;


-- =====================================================================
-- J. Ajustes públicos (migración recomendada)
-- =====================================================================
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select array_agg(id) from public.ajustes) = array['dias_reconfirmar_disponibilidad']
                 and (select valor from public.ajustes) = '30'::jsonb,
    '[J1] anon lee solo los ajustes públicos');
  perform pruebas.falla($q$update public.ajustes set valor = '5'$q$, 'permission denied', '[J2] anon no cambia ajustes');

  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.ajustes) = 1, '[J3] un conductor lee solo los públicos');
  perform pruebas.ok(pruebas.filas($q$update public.ajustes set valor = '5'$q$) = 0, '[J4] un conductor no cambia ajustes');

  perform pruebas.como('admin');
  perform pruebas.ok((select count(*) from public.ajustes) = 2, '[J5] el equipo lee todos');
end $$;


-- =====================================================================
-- E. Estructura: nada nuevo fuera de lo previsto
-- =====================================================================
do $$
begin
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                       where n.nspname = 'public' and c.relkind = 'r') = 21
                 and not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                                  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
    '[E1] siguen las 21 tablas, todas con RLS');
  perform pruebas.ok((select array_agg(p.proname::text order by p.proname)
                        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                       where n.nspname = 'privado' and has_function_privilege('authenticated', p.oid, 'EXECUTE'))
                     = array['columnas_cambiadas', 'columnas_cambiadas_salvo', 'es_admin', 'es_equipo', 'es_sistema',
                             'licencia_habilita_negocio'],
    '[E2] sin funciones nuevas ejecutables por authenticated');
  perform pruebas.ok(not has_table_privilege('anon', 'public.ajustes', 'INSERT')
                 and not has_table_privilege('anon', 'public.ajustes', 'UPDATE')
                 and not has_table_privilege('anon', 'public.ajustes', 'DELETE'),
    '[E3] anon solo tiene SELECT en ajustes');
end $$;

do $$ begin raise notice 'FIN: todas las pruebas de la app del conductor v1 pasaron.'; end $$;

rollback;

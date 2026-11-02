-- =====================================================================
-- etapa1_pruebas.sql — pruebas de datos y seguridad (RLS) de la Etapa 1.
--
-- Se corre en local después de auth_simulado.sql y de las dos migraciones,
-- como postgres y con psql -v ON_ERROR_STOP=1. Todo va dentro de una
-- transacción que termina en ROLLBACK: no deja datos.
--
-- Cada prueba escribe "OK  [código] ..." o corta todo con "FALLA: ...".
-- Cada bloque va entre savepoint y rollback to savepoint, así una prueba
-- no cambia el punto de partida de la siguiente.
-- =====================================================================

\set ON_ERROR_STOP 1
set client_min_messages = notice;

begin;

-- ---------------------------------------------------------------------
-- Herramientas de prueba (esquema pruebas, desaparece con el rollback)
-- ---------------------------------------------------------------------
create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.usuarios (alias text primary key, id uuid not null);
grant select on pruebas.usuarios to public;
insert into pruebas.usuarios values
  ('a',       'aaaaaaaa-0000-4000-8000-00000000000a'),  -- conductor A
  ('b',       'bbbbbbbb-0000-4000-8000-00000000000b'),  -- conductor B
  ('c',       'cccccccc-0000-4000-8000-00000000000c'),  -- recién registrado, sin perfil
  ('revisor', 'dddddddd-0000-4000-8000-00000000000d'),
  ('admin',   'eeeeeeee-0000-4000-8000-00000000000e'),
  ('sin_cel', 'ffffffff-0000-4000-8000-00000000000f'),  -- usuario sin celular
  ('dup',     '99999999-0000-4000-8000-000000000099');  -- celular repetido

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

-- Cambia de identidad: 'anon', 'service_role', 'postgres' o el alias de un usuario.
create function pruebas.como(p_quien text) returns void
language plpgsql as $$
begin
  if p_quien = 'postgres' then
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
  elsif p_quien in ('anon', 'service_role', 'supabase_auth_admin') then
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    execute format('set local role %I', p_quien);
  else
    reset role;
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

-- Ejecuta p_sql y exige que falle con un mensaje que calce con p_patron (regex).
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

-- Ejecuta p_sql y devuelve cuántas filas tocó o leyó.
create function pruebas.filas(p_sql text) returns bigint
language plpgsql as $$
declare
  n bigint;
begin
  execute p_sql;
  get diagnostics n = row_count;
  return n;
end $$;

-- Patrones de error
-- sin permiso de tabla:  'permission denied'
-- RLS:                   'row-level security'
-- trigger de columnas:   'No puedes cambiar'


-- =====================================================================
-- E. Estructura (lo que revisan los avisos de seguridad de Supabase)
-- =====================================================================
do $$
begin
  perform pruebas.ok(not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
    '[E1] RLS activado en todas las tablas de public');

  perform pruebas.ok((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                       where n.nspname = 'public' and c.relkind = 'r') = 21,
    '[E1b] public tiene las 21 tablas de la Etapa 1');

  perform pruebas.ok(not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'privado'
       and not coalesce('search_path=""' = any (p.proconfig), false)),
    '[E2] todas las funciones de privado tienen search_path vacío');

  perform pruebas.ok(not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'),
    '[E2b] no hay funciones en public (la API no expone ninguna)');

  perform pruebas.ok((
    select array_agg(p.proname::text order by p.proname)
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'privado' and p.prosecdef)
    = array['es_admin', 'es_equipo', 'sincronizar_cuenta_desde_auth'],
    '[E2c] SECURITY DEFINER solo en es_admin, es_equipo y el trigger de auth.users');

  -- Cada llave foránea tiene un índice cuyas primeras columnas son las de la llave.
  perform pruebas.ok(not exists (
    select 1
      from pg_constraint f
      join pg_namespace n on n.oid = f.connamespace
     where f.contype = 'f' and n.nspname = 'public'
       and not exists (
         select 1 from pg_index i
          where i.indrelid = f.conrelid
            and (i.indkey::int2[])[0:cardinality(f.conkey) - 1] @> f.conkey
            and (i.indkey::int2[])[0:cardinality(f.conkey) - 1] <@ f.conkey)),
    '[E3] todas las llaves foráneas tienen índice');

  perform pruebas.ok(not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
     cross join unnest(array['anon', 'authenticated']) as r(rol)
     cross join unnest(array['TRUNCATE', 'REFERENCES', 'TRIGGER']) as p(priv)
     where n.nspname = 'public' and c.relkind = 'r'
       and has_table_privilege(r.rol, c.oid, p.priv)),
    '[E4] anon y authenticated sin TRUNCATE, REFERENCES ni TRIGGER');

  perform pruebas.ok(not exists (
    select 1
      from unnest(array['ajustes', 'cuentas', 'miembros_equipo', 'consentimientos', 'conductores',
                        'conductor_licencias', 'conductor_negocios', 'conductor_opciones',
                        'experiencia_conductor']) as t(tabla)
     cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) as p(priv)
     where has_table_privilege('anon', 'public.' || t.tabla, p.priv)),
    '[E5] anon no tiene ningún permiso en tablas de personas ni en ajustes');

  perform pruebas.ok(not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     cross join unnest(array['anon', 'authenticated']) as r(rol)
     where n.nspname = 'privado'
       and p.prorettype = 'trigger'::regtype
       and has_function_privilege(r.rol, p.oid, 'EXECUTE')),
    '[E6] nadie de la app puede ejecutar las funciones de triggers');

  perform pruebas.ok(not has_table_privilege('authenticated', 'public.conductor_licencias', 'UPDATE')
                 and not has_table_privilege('authenticated', 'public.conductor_negocios', 'UPDATE')
                 and not has_table_privilege('authenticated', 'public.conductor_opciones', 'UPDATE')
                 and not has_table_privilege('authenticated', 'public.cuentas', 'INSERT')
                 and not has_table_privilege('authenticated', 'public.cuentas', 'DELETE')
                 and not has_table_privilege('authenticated', 'public.conductores', 'DELETE')
                 and not has_table_privilege('authenticated', 'public.consentimientos', 'DELETE'),
    '[E7] sin UPDATE en tablas de pares ni INSERT/DELETE donde la app no los usa');
end $$;


-- =====================================================================
-- D. Datos iniciales
-- =====================================================================
do $$
begin
  perform pruebas.ok((select count(*) from public.regiones) = 16, '[D1] 16 regiones');
  perform pruebas.ok((select count(*) from public.zonas) = 81, '[D1] 81 zonas');
  perform pruebas.ok((select count(*) from public.comunas) = 346, '[D1] 346 comunas');
  perform pruebas.ok((select array_agg(orden order by orden) from public.regiones)
                     = (select array_agg(g) from generate_series(1, 16) g), '[D1] regiones con orden 1..16');
  perform pruebas.ok(exists (select 1 from public.regiones
                              where nombre = 'Libertador General Bernardo O''Higgins' and orden = 8),
    '[D1] O''Higgins con apóstrofo y en el lugar 8');
  perform pruebas.ok(not exists (select 1 from public.comunas c join public.zonas z on z.id = c.zona_id
                                  where z.region_id <> c.region_id),
    '[D1] cada comuna está en una zona de su misma región');
  perform pruebas.ok((select count(*) from public.comunas where cardinality(nombres_alternativos) > 0) = 3
                 and (select nombres_alternativos from public.comunas where nombre = 'Paiguano') = array['Paihuano']
                 and (select nombres_alternativos from public.comunas where nombre = 'Llaillay') = array['Llay-Llay']
                 and (select nombres_alternativos from public.comunas where nombre = 'Calera') = array['La Calera'],
    '[D1] nombres alternativos solo en Paiguano, Llaillay y Calera');
  perform pruebas.ok(not exists (select 1 from public.regiones where codigo_cut is not null)
                 and not exists (select 1 from public.comunas where codigo_cut is not null),
    '[D1] codigo_cut vacío (se llena después desde SUBDERE)');
  perform pruebas.ok((select count(*) from public.zonas z join public.regiones r on r.id = z.region_id
                       where r.nombre = 'Metropolitana de Santiago') > 0
                 and not exists (select 1 from public.zonas z1 join public.zonas z2
                                   on z1.region_id = z2.region_id and z1.orden = z2.orden and z1.id <> z2.id),
    '[D1] zonas con orden único dentro de su región');

  perform pruebas.ok((select count(*) from public.clases_licencia) = 10, '[D2] 10 clases de licencia');
  perform pruebas.ok((select array_agg(codigo order by orden) from public.clases_licencia)
                     = array['A1','A2','A3','A4','A5','B','C','D','A1 antigua','A2 antigua'],
    '[D2] clases en orden');
  perform pruebas.ok((select array_agg(codigo order by codigo) from public.clases_licencia where es_antigua)
                     = array['A1 antigua','A2 antigua']
                 and (select nombre from public.clases_licencia where codigo = 'A1 antigua') = 'A1 antigua (antes de 1997)',
    '[D2] solo las dos antiguas son antiguas');
  perform pruebas.ok((select array_agg(codigo order by codigo) from public.clases_licencia where not habilita_clase_b)
                     = array['C','D'],
    '[D2] todas habilitan B salvo C y D');

  perform pruebas.ok((select count(*) from public.industrias) = 2
                 and (select array_agg(nombre) from public.industrias where activo) = array['Transporte de pasajeros'],
    '[D3] 2 industrias, solo pasajeros activa');

  perform pruebas.ok((select array_agg(nombre || ' (' || ayuda || ')' order by orden) from public.tamanos_vehiculo where activo)
                     = array['Moto (moto, scooter)', 'Vehículo liviano (auto, SUV, camioneta)',
                             'Van o minibús (van, furgón, minibús)', 'Bus (bus o micro)',
                             'Camión (3/4, camión simple, grúa de autos)', 'Camión articulado (tracto con rampla)',
                             'Maquinaria (grúa horquilla, retroexcavadora)'],
    '[D4] 7 categorías de experiencia, activas y en orden');

  perform pruebas.ok((select count(*) from public.negocios) = 11, '[D5] 11 negocios');
  perform pruebas.ok((select array_agg(nombre order by orden) from public.negocios where activo)
                     = array['Taxi', 'Taxi ejecutivo'], '[D5] solo Taxi y Taxi ejecutivo activos');
  perform pruebas.ok((select count(*) from public.negocios n join public.industrias i on i.id = n.industria_id
                       where i.nombre = 'Transporte de pasajeros') = 6
                 and (select count(*) from public.negocios n join public.industrias i on i.id = n.industria_id
                       where i.nombre = 'Transporte de carga') = 5,
    '[D5] 6 negocios de pasajeros y 5 de carga');
  perform pruebas.ok((select ejemplo from public.negocios where nombre = 'Taxi') is null
                 and (select ejemplo from public.negocios where nombre = 'Taxi ejecutivo') = 'radiotaxi, aeropuerto'
                 and (select ejemplo from public.negocios where nombre = 'Moto delivery') = 'comercios, farmacias',
    '[D5] ejemplos en gris');
  perform pruebas.ok((select array_agg(nombre order by orden) from public.negocios where pregunta_vehiculo is not null)
                     = array['Van o bus de turismo', 'Camión de carga interurbano', 'Camión de carga urbano',
                             'Reparto en furgón', 'Grúa de autos']
                 and not exists (select 1 from public.negocios where pregunta_vehiculo is not null
                                    and nota not ilike '%texto de la pregunta provisional%'),
    '[D5] pregunta del vehículo solo donde la licencia depende de él, con nota de texto provisional');
  perform pruebas.ok((select pregunta_vehiculo -> 'respuestas' -> 2 -> 'clases' from public.negocios
                       where nombre = 'Camión de carga interurbano') = '["A5"]'::jsonb
                 and jsonb_array_length((select pregunta_vehiculo -> 'respuestas' from public.negocios
                                          where nombre = 'Van o bus de turismo')) = 4,
    '[D5] respuestas de la pregunta con sus clases');
  perform pruebas.ok(not exists (
      select 1 from public.negocios n
       cross join lateral jsonb_path_query(n.pregunta_vehiculo, '$.respuestas[*].clases[*]') as c
       where not exists (select 1 from public.clases_licencia cl where cl.codigo = c #>> '{}')),
    '[D5] toda clase nombrada en una pregunta existe');

  perform pruebas.ok((select count(*) from public.negocio_clases_licencia) = 36, '[D6] 36 pares negocio-clase');
  perform pruebas.ok((select array_agg(c.codigo order by c.orden) from public.negocio_clases_licencia x
                        join public.clases_licencia c on c.id = x.clase_licencia_id
                       where x.negocio_id = pruebas.negocio('Taxi')) = array['A1','A2','A3','A1 antigua']
                 and (select array_agg(c.codigo) from public.negocio_clases_licencia x
                        join public.clases_licencia c on c.id = x.clase_licencia_id
                       where x.negocio_id = pruebas.negocio('Moto delivery')) = array['C'],
    '[D6] Taxi: A1, A2, A3, A1 antigua; Moto delivery: C');
  perform pruebas.ok((select count(*) from public.negocio_tamanos) = 15, '[D6] 15 pares negocio-categoría');

  perform pruebas.ok((select array_agg(clave order by clave) from public.listas) = array['dia_semana','modo_contrato','turno'],
    '[D7] 3 listas');
  perform pruebas.ok((select array_agg(o.nombre order by o.orden) from public.opciones o join public.listas l on l.id = o.lista_id
                       where l.clave = 'turno') = array['Día', 'Noche'], '[D7] turnos Día y Noche');
  perform pruebas.ok((select array_agg(o.nombre_corto order by o.orden) from public.opciones o join public.listas l on l.id = o.lista_id
                       where l.clave = 'dia_semana' and o.activa) = array['Lu','Ma','Mi','Ju','Vi','Sá','Do'],
    '[D7] 7 días de lunes a domingo');
  perform pruebas.ok((select count(*) from public.opciones o join public.listas l on l.id = o.lista_id
                       where l.clave = 'modo_contrato' and not o.activa) = 3
                 and not exists (select 1 from public.opciones o join public.listas l on l.id = o.lista_id
                                  where l.clave = 'modo_contrato' and o.activa),
    '[D7] 3 modos de contrato, todos inactivos');
  perform pruebas.ok(not exists (select 1 from public.listas where clave = 'tramo_garantia'),
    '[D7] la lista tramo_garantia no se carga');

  perform pruebas.ok((select valor from public.ajustes where id = 'umbral_match') = '66'::jsonb
                 and (select count(*) from public.ajustes) = 1, '[D8] ajuste umbral_match = 66');
  perform pruebas.ok((select count(*) from public.textos_autorizacion) = 0, '[D8] sin textos de autorización');
end $$;


-- =====================================================================
-- Datos de prueba (se quedan hasta el rollback final)
-- =====================================================================
do $$
begin
  -- Usuarios creados como lo hace Supabase Auth (rol supabase_auth_admin).
  perform pruebas.como('supabase_auth_admin');
  insert into auth.users (id, phone, phone_confirmed_at) values
    (pruebas.id('a'),       '56911111111',  '2026-10-01 10:00-03'),
    (pruebas.id('b'),       '56922222222',  '2026-10-02 10:00-03'),
    (pruebas.id('c'),       '56955555555',  null),
    (pruebas.id('revisor'), '56933333333',  '2026-10-03 10:00-03'),
    (pruebas.id('admin'),   '+56944444444', '2026-10-04 10:00-03'),
    (pruebas.id('sin_cel'), null,           null);
  perform pruebas.como('postgres');

  -- Equipo: el primer administrador se crea a mano con SQL de servicio.
  insert into public.miembros_equipo (id, rol) values
    (pruebas.id('revisor'), 'revisor'),
    (pruebas.id('admin'),   'administrador');

  update public.cuentas set email = 'a@ejemplo.cl', email_confirmado_en = '2026-10-05', nombres = 'Ana'
   where id = pruebas.id('a');

  -- Perfiles de A y B con fechas viejas, para ver que el servidor las cambia.
  insert into public.conductores (id, creado_en, actualizado_en) values
    (pruebas.id('a'), '2020-01-01', '2020-01-01'),
    (pruebas.id('b'), '2020-01-01', '2020-01-01');
  insert into public.conductor_licencias values (pruebas.id('b'), pruebas.clase('A1'), 'declarada');
  insert into public.conductor_negocios values (pruebas.id('b'), pruebas.negocio('Taxi'));
  insert into public.conductor_opciones values (pruebas.id('b'), pruebas.opcion('turno', 'noche'));
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos, actualizado_en)
    values (pruebas.id('b'), pruebas.tamano('Vehículo liviano'), 5, '2020-01-01'),
           (pruebas.id('a'), pruebas.tamano('Moto'), 2, '2020-01-01');

  -- Textos de autorización de prueba: v1 ya no vigente, v2 vigente.
  insert into public.textos_autorizacion (clave, nombre, texto, version, para_quien, obligatoria, vigente) values
    ('terminos_privacidad', 'Términos y privacidad', 'Texto de prueba v1', 'v1', 'todos', true, false),
    ('terminos_privacidad', 'Términos y privacidad', 'Texto de prueba v2', 'v2', 'todos', true, true);
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
    select pruebas.id('b'), id from public.textos_autorizacion where version = 'v2';
end $$;


-- =====================================================================
-- A. Trigger de auth.users -> cuentas
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.ok((select celular from public.cuentas where id = pruebas.id('a')) = '+56911111111'
                 and (select celular_verificado_en from public.cuentas where id = pruebas.id('a')) = '2026-10-01 10:00-03',
    '[A1] la cuenta nace sola con +56… y la fecha de confirmación');
  perform pruebas.ok((select celular from public.cuentas where id = pruebas.id('admin')) = '+56944444444',
    '[A2] un número que ya trae + no queda con ++');
  perform pruebas.ok((select celular_verificado_en from public.cuentas where id = pruebas.id('c')) = now(),
    '[A3] sin fecha de confirmación se usa la hora del servidor');
  perform pruebas.ok(not exists (select 1 from public.cuentas where id = pruebas.id('sin_cel')),
    '[A4] un usuario sin celular no crea cuenta');

  perform pruebas.como('supabase_auth_admin');
  update auth.users set phone = '56966666666' where id = pruebas.id('sin_cel');
  update auth.users set phone = '56977777777', phone_confirmed_at = '2026-10-20 09:00-03' where id = pruebas.id('b');
  update auth.users set phone_confirmed_at = '2026-10-21 09:00-03' where id = pruebas.id('c');
  perform pruebas.como('postgres');
  perform pruebas.ok((select celular from public.cuentas where id = pruebas.id('sin_cel')) = '+56966666666',
    '[A5] al agregar el celular después, se crea la cuenta');
  perform pruebas.ok((select celular from public.cuentas where id = pruebas.id('b')) = '+56977777777'
                 and (select celular_verificado_en from public.cuentas where id = pruebas.id('b')) = '2026-10-20 09:00-03',
    '[A6] el cambio de número se copia a la cuenta');
  perform pruebas.ok((select celular_verificado_en from public.cuentas where id = pruebas.id('c')) = '2026-10-21 09:00-03',
    '[A7] al confirmar el código se anota la fecha de confirmación');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  -- Supabase guarda el número sin "+": "+56911111111" es otro valor para auth,
  -- pero para cuentas es el mismo celular. El registro no debe romperse.
  perform pruebas.como('supabase_auth_admin');
  insert into auth.users (id, phone) values (pruebas.id('dup'), '+56911111111');
  perform pruebas.como('postgres');
  perform pruebas.ok(exists (select 1 from auth.users where id = pruebas.id('dup'))
                 and not exists (select 1 from public.cuentas where id = pruebas.id('dup')),
    '[A8] si la cuenta no se puede crear, el registro en auth.users sigue (solo queda un aviso)');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  perform pruebas.como('supabase_auth_admin');
  delete from auth.users where id = pruebas.id('a');
  perform pruebas.como('postgres');
  perform pruebas.ok(not exists (select 1 from public.cuentas where id = pruebas.id('a'))
                 and not exists (select 1 from public.conductores where id = pruebas.id('a'))
                 and not exists (select 1 from public.experiencia_conductor where conductor_id = pruebas.id('a')),
    '[A9] borrar el usuario borra en cascada su cuenta, perfil y experiencia');
  perform pruebas.como('supabase_auth_admin');
  perform pruebas.falla(format('delete from auth.users where id = %L', pruebas.id('b')),
    'foreign key', '[A10] no se borra en cascada a quien tiene autorizaciones (lo decide el abogado, R19)');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  -- Quien quedó anotado como autor de un cambio no impide borrar su cuenta.
  update public.ajustes set actualizado_por = pruebas.id('c') where id = 'umbral_match';
  insert into public.miembros_equipo (id, rol, creado_por) values (pruebas.id('b'), 'revisor', pruebas.id('c'));
  perform pruebas.como('supabase_auth_admin');
  delete from auth.users where id = pruebas.id('c');
  perform pruebas.como('postgres');
  perform pruebas.ok((select actualizado_por from public.ajustes where id = 'umbral_match') is null
                 and (select creado_por from public.miembros_equipo where id = pruebas.id('b')) is null,
    '[A11] al borrar una cuenta, "actualizado por" y "creado por" quedan vacíos');
end $$;
rollback to savepoint t;


-- =====================================================================
-- N. Visitante sin sesión (anon)
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select count(*) from public.regiones) = 16
                 and (select count(*) from public.comunas) = 346
                 and (select count(*) from public.negocios) = 11
                 and (select count(*) from public.opciones) = 12
                 and (select count(*) from public.negocio_clases_licencia) = 36,
    '[N1] anon lee los catálogos');
  perform pruebas.falla('select * from public.cuentas', 'permission denied', '[N2] anon no lee cuentas');
  perform pruebas.falla('select * from public.conductores', 'permission denied', '[N2] anon no lee conductores');
  perform pruebas.falla('select * from public.conductor_licencias', 'permission denied', '[N2] anon no lee licencias');
  perform pruebas.falla('select * from public.experiencia_conductor', 'permission denied', '[N2] anon no lee experiencia');
  perform pruebas.falla('select * from public.consentimientos', 'permission denied', '[N2] anon no lee autorizaciones');
  perform pruebas.falla('select * from public.miembros_equipo', 'permission denied', '[N2] anon no lee el equipo');
  perform pruebas.falla('select * from public.ajustes', 'permission denied', '[N2] anon no lee ajustes');
  perform pruebas.falla($q$insert into public.regiones (nombre) values ('Nueva')$q$, 'permission denied',
    '[N3] anon no escribe catálogos');
  perform pruebas.falla($q$update public.negocios set activo = true$q$, 'permission denied',
    '[N3] anon no cambia negocios');
  perform pruebas.ok((select count(*) from public.textos_autorizacion) = 1
                 and (select version from public.textos_autorizacion) = 'v2',
    '[N4] anon ve solo la versión vigente de los textos');
end $$;
rollback to savepoint t;


-- =====================================================================
-- C. Cuentas
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.cuentas) = 1
                 and (select id from public.cuentas) = pruebas.id('a'), '[C1] el conductor ve solo su cuenta');
  perform pruebas.ok(pruebas.filas(format(
      $q$update public.cuentas set nombres = 'Ana María', primer_apellido = 'Rojas', tokens_avisos = '{"web": "x"}' where id = %L$q$,
      pruebas.id('a'))) = 1, '[C2] el conductor cambia su nombre');
  perform pruebas.falla(format($q$update public.cuentas set estado = 'suspendida' where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: estado', '[C3] no cambia su estado');
  perform pruebas.falla(format($q$update public.cuentas set celular = '+56900000000' where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: celular', '[C3] no cambia su celular');
  perform pruebas.falla(format($q$update public.cuentas set celular_verificado_en = now() where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: celular_verificado_en', '[C3] no cambia la fecha de verificación del celular');
  perform pruebas.falla(format($q$update public.cuentas set email_confirmado_en = now() where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: email_confirmado_en', '[C3] no confirma su correo por su cuenta');
  perform pruebas.falla(format($q$update public.cuentas set creado_en = '2000-01-01' where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: creado_en', '[C3] no cambia su fecha de creación');
  perform pruebas.falla(format($q$update public.cuentas set id = %L where id = %L$q$, pruebas.id('c'), pruebas.id('a')),
    'No puedes cambiar|row-level security', '[C3] no cambia su id');
  perform pruebas.ok(pruebas.filas(format($q$update public.cuentas set nombres = 'X' where id = %L$q$, pruebas.id('b'))) = 0,
    '[C4] no cambia la cuenta de otro');
  perform pruebas.falla(format($q$insert into public.cuentas (id, celular, celular_verificado_en) values (%L, '+56900000001', now())$q$,
      pruebas.id('sin_cel')), 'permission denied', '[C5] no crea cuentas');
  perform pruebas.falla(format($q$delete from public.cuentas where id = %L$q$, pruebas.id('a')),
    'permission denied', '[C5] no borra su cuenta desde la app');
  perform pruebas.falla(format($q$insert into auth.users (id, phone) values (%L, '56900000002')$q$, gen_random_uuid()),
    'permission denied', '[C5] no escribe en auth.users');

  perform pruebas.como('postgres');
  perform pruebas.ok((select nombres from public.cuentas where id = pruebas.id('b')) is null
                 and (select estado from public.cuentas where id = pruebas.id('a')) = 'activa',
    '[C4] la cuenta de B y el estado de A siguen igual');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  perform pruebas.como('a');
  update public.cuentas set email = 'nuevo@ejemplo.cl' where id = pruebas.id('a');
  perform pruebas.como('postgres');
  perform pruebas.ok((select email_confirmado_en from public.cuentas where id = pruebas.id('a')) is null,
    '[C6] al cambiar el correo, queda sin confirmar');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  perform pruebas.como('revisor');
  perform pruebas.ok((select count(*) from public.cuentas) >= 5, '[C7] el equipo ve todas las cuentas');
  perform pruebas.ok(pruebas.filas(format($q$update public.cuentas set estado = 'suspendida' where id = %L$q$,
      pruebas.id('a'))) = 1, '[C7] el equipo puede suspender una cuenta');
end $$;
rollback to savepoint t;


-- =====================================================================
-- K. Perfil del conductor
-- =====================================================================
savepoint t;
do $$
declare
  r public.conductores;
begin
  perform pruebas.como('c');
  insert into public.conductores (id, estado_perfil, perfil_completo_en, estado_verificacion,
                                  creado_en, actualizado_en, disponibilidad_confirmada_en)
  values (pruebas.id('c'), 'completo', '2026-01-01', 'verificado', '2000-01-01', '2000-01-01', '2099-01-01');
  select * into r from public.conductores where id = pruebas.id('c');
  perform pruebas.ok(r.estado_perfil = 'incompleto' and r.perfil_completo_en is null
                 and r.estado_verificacion = 'sin_documentos'
                 and r.creado_en = now() and r.actualizado_en = now()
                 and r.disponibilidad_confirmada_en = now() and r.disponible,
    '[K1] al registrarse, estados y fechas los pone el servidor');
  perform pruebas.falla(format($q$insert into public.conductores (id) values (%L)$q$, pruebas.id('sin_cel')),
    'row-level security', '[K2] no crea el perfil de otra cuenta');
end $$;
rollback to savepoint t;

savepoint t;
do $$
declare
  r public.conductores;
begin
  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.conductores) = 1, '[K3] el conductor ve solo su perfil');
  perform pruebas.ok(pruebas.filas(format(
      $q$update public.conductores set direccion = 'Calle 1', tiene_estacionamiento = true, disponible = false,
                                      comuna_id = (select id from public.comunas where nombre = 'Ñuñoa'),
                                      datos_extra = '{"campo": 1}', disponibilidad_confirmada_en = '2099-01-01'
        where id = %L$q$, pruebas.id('a'))) = 1, '[K3] el conductor edita su perfil');
  select * into r from public.conductores where id = pruebas.id('a');
  perform pruebas.ok(r.actualizado_en = now() and r.disponibilidad_confirmada_en = now() and r.direccion = 'Calle 1',
    '[K3] actualizado_en y la fecha de "sigo disponible" las pone el servidor');
  perform pruebas.falla(format($q$update public.conductores set estado_perfil = 'completo' where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: estado_perfil', '[K4] no cambia estado_perfil');
  perform pruebas.falla(format($q$update public.conductores set estado_verificacion = 'verificado' where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: estado_verificacion', '[K4] no cambia estado_verificacion');
  perform pruebas.falla(format($q$update public.conductores set perfil_completo_en = now() where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: perfil_completo_en', '[K4] no cambia perfil_completo_en');
  perform pruebas.falla(format($q$update public.conductores set creado_en = '2000-01-01' where id = %L$q$, pruebas.id('a')),
    'No puedes cambiar: creado_en', '[K4] no cambia creado_en');
  perform pruebas.falla(format($q$update public.conductores set datos_extra = '[]' where id = %L$q$, pruebas.id('a')),
    'check constraint', '[K4] datos_extra tiene que ser un objeto');
  perform pruebas.ok((select count(*) from public.conductores where id = pruebas.id('b')) = 0,
    '[K5] no lee el perfil de otro conductor');
  perform pruebas.ok(pruebas.filas(format($q$update public.conductores set direccion = 'Otra' where id = %L$q$,
      pruebas.id('b'))) = 0, '[K5] no edita el perfil de otro conductor');
  perform pruebas.falla(format($q$delete from public.conductores where id = %L$q$, pruebas.id('a')),
    'permission denied', '[K6] no borra su perfil desde la app');
  perform pruebas.falla(format($q$update public.conductores set tramo_garantia_id = %s where id = %L$q$,
      pruebas.opcion('turno', 'dia'), pruebas.id('a')),
    'tramo de garantía no es válido', '[K7] la garantía queda bloqueada (opción de otra lista)');

  perform pruebas.como('postgres');
  perform pruebas.falla(format($q$update public.conductores set tramo_garantia_id = %s where id = %L$q$,
      pruebas.opcion('modo_contrato', 'arriendo_fijo'), pruebas.id('a')),
    'tramo de garantía no es válido', '[K7] la garantía queda bloqueada también para el sistema');
  perform pruebas.ok((select direccion from public.conductores where id = pruebas.id('b')) is null,
    '[K5] el perfil de B sigue igual');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  perform pruebas.como('revisor');
  perform pruebas.ok((select count(*) from public.conductores) = 2, '[K8] el equipo ve todos los perfiles');
  perform pruebas.ok(pruebas.filas(format($q$update public.conductores set estado_verificacion = 'en_revision' where id = %L$q$,
      pruebas.id('a'))) = 1, '[K8] el equipo cambia el estado de verificación');
  perform pruebas.como('service_role');
  perform pruebas.ok(pruebas.filas(format(
      $q$update public.conductores set estado_perfil = 'completo', perfil_completo_en = now() where id = %L$q$,
      pruebas.id('a'))) = 1, '[K9] el sistema (service_role) marca el perfil completo');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  -- Saltarse los triggers con "insert ... on conflict do update" (upsert).
  update public.conductores set estado_verificacion = 'con_observaciones' where id = pruebas.id('a');
  perform pruebas.como('a');
  perform pruebas.falla(format(
      $q$insert into public.conductores (id, estado_verificacion) values (%L, 'verificado')
         on conflict (id) do update set estado_verificacion = 'verificado'$q$, pruebas.id('a')),
    'No puedes cambiar: estado_verificacion', '[K10] un upsert no cambia el estado de verificación');
  perform pruebas.falla(format(
      $q$insert into public.conductores (id) values (%L)
         on conflict (id) do update set estado_verificacion = excluded.estado_verificacion$q$, pruebas.id('a')),
    'No puedes cambiar: estado_verificacion', '[K10] un upsert no "reinicia" el estado con los valores por defecto');
  perform pruebas.falla(format(
      $q$insert into public.conductores (id) values (%L) on conflict (id) do update set direccion = 'hackeada'$q$,
      pruebas.id('b')), 'row-level security', '[K10] un upsert no edita el perfil de otro');
  perform pruebas.como('postgres');
  perform pruebas.ok((select direccion from public.conductores where id = pruebas.id('b')) is null
                 and (select estado_verificacion from public.conductores where id = pruebas.id('a')) = 'con_observaciones',
    '[K10] los perfiles siguen igual');
end $$;
rollback to savepoint t;


-- =====================================================================
-- L. Licencias del conductor
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('A1'), 'declarada');
  perform pruebas.ok(true, '[L1] el conductor declara una clase');
  perform pruebas.falla(format($q$insert into public.conductor_licencias values (%L, %s, 'revisada')$q$,
      pruebas.id('a'), pruebas.clase('A2')), 'row-level security', '[L2] no puede insertar licencias revisadas');
  perform pruebas.falla(format($q$insert into public.conductor_licencias values (%L, %s, 'declarada')$q$,
      pruebas.id('b'), pruebas.clase('A2')), 'row-level security', '[L3] no declara licencias de otro');
  perform pruebas.falla(format($q$update public.conductor_licencias set origen = 'revisada' where conductor_id = %L$q$,
      pruebas.id('a')), 'permission denied', '[L4] no puede pasar una declarada a revisada');
  perform pruebas.ok((select count(*) from public.conductor_licencias where conductor_id = pruebas.id('b')) = 0,
    '[L5] no ve las licencias de otro');

  perform pruebas.como('revisor');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('A1'), 'revisada');
  perform pruebas.ok(true, '[L6] el equipo anota una clase revisada');

  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.conductor_licencias) = 2, '[L6] el conductor ve sus clases declaradas y revisadas');
  perform pruebas.ok(pruebas.filas(format($q$delete from public.conductor_licencias where conductor_id = %L and origen = 'revisada'$q$,
      pruebas.id('a'))) = 0, '[L7] no borra sus clases revisadas');
  perform pruebas.ok(pruebas.filas(format($q$delete from public.conductor_licencias where conductor_id = %L and origen = 'declarada'$q$,
      pruebas.id('a'))) = 1, '[L7] sí borra sus clases declaradas');

  -- Borrar lo de otro conductor no toca nada.
  perform pruebas.ok(pruebas.filas(format($q$delete from public.conductor_licencias where conductor_id = %L$q$, pruebas.id('b'))) = 0
                 and pruebas.filas(format($q$delete from public.conductor_negocios where conductor_id = %L$q$, pruebas.id('b'))) = 0
                 and pruebas.filas(format($q$delete from public.conductor_opciones where conductor_id = %L$q$, pruebas.id('b'))) = 0,
    '[L8] no borra licencias, negocios ni opciones de otro');
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from public.conductor_licencias where conductor_id = pruebas.id('b')) = 1
                 and (select count(*) from public.conductor_negocios where conductor_id = pruebas.id('b')) = 1
                 and (select count(*) from public.conductor_opciones where conductor_id = pruebas.id('b')) = 1,
    '[L8] lo de B sigue ahí');
end $$;
rollback to savepoint t;


-- =====================================================================
-- G. Negocios del conductor
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('B'), 'declarada'),
                                                (pruebas.id('a'), pruebas.clase('C'), 'declarada');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('a'), pruebas.negocio('Taxi')), 'no habilita', '[G1] con B no puede marcar Taxi');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('a'), pruebas.negocio('Moto delivery')), 'no está disponible', '[G2] no puede marcar Moto delivery (apagado)');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('a'), pruebas.negocio('Transporte por aplicación')), 'no está disponible',
    '[G2] no puede marcar un negocio apagado aunque su licencia sirva');

  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('A1'), 'declarada');
  insert into public.conductor_negocios values (pruebas.id('a'), pruebas.negocio('Taxi')),
                                              (pruebas.id('a'), pruebas.negocio('Taxi ejecutivo'));
  perform pruebas.ok((select count(*) from public.conductor_negocios) = 2, '[G3] con A1 sí marca Taxi y Taxi ejecutivo');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('b'), pruebas.negocio('Taxi ejecutivo')), 'row-level security|no habilita',
    '[G4] no marca negocios en el perfil de otro');
  perform pruebas.falla(format($q$update public.conductor_negocios set negocio_id = %s where conductor_id = %L$q$,
      pruebas.negocio('Moto delivery'), pruebas.id('a')), 'permission denied',
    '[G5] no puede saltarse la validación cambiando la fila');
  perform pruebas.ok((select count(*) from public.conductor_negocios where conductor_id = pruebas.id('b')) = 0,
    '[G4] no ve los negocios de otro');

  -- Un administrador apaga Taxi: lo ya guardado se conserva.
  perform pruebas.como('admin');
  update public.negocios set activo = false where nombre = 'Taxi';
  perform pruebas.como('a');
  perform pruebas.ok(exists (select 1 from public.conductor_negocios where negocio_id = pruebas.negocio('Taxi')),
    '[G6] si se apaga el negocio, la fila guardada se conserva');
  perform pruebas.ok(pruebas.filas(format($q$delete from public.conductor_negocios where conductor_id = %L and negocio_id = %s$q$,
      pruebas.id('a'), pruebas.negocio('Taxi'))) = 1, '[G6] el conductor quita un negocio');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('a'), pruebas.negocio('Taxi')), 'no está disponible', '[G6] y ya no lo puede volver a marcar');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  -- Habilitación por "también habilita B": A2 sirve para Transporte por aplicación (pide B).
  perform pruebas.como('admin');
  update public.negocios set activo = true where nombre = 'Transporte por aplicación';
  perform pruebas.como('a');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('D'), 'declarada');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('a'), pruebas.negocio('Transporte por aplicación')), 'no habilita', '[G7] con D no habilita lo que pide B');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('A2'), 'declarada');
  insert into public.conductor_negocios values (pruebas.id('a'), pruebas.negocio('Transporte por aplicación'));
  perform pruebas.ok(true, '[G7] con A2 (habilita B) marca Transporte por aplicación');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  -- Industria apagada: el negocio no se puede marcar aunque esté activo.
  perform pruebas.como('admin');
  update public.negocios set activo = true where nombre = 'Moto delivery';
  perform pruebas.como('a');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('C'), 'declarada');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('a'), pruebas.negocio('Moto delivery')), 'no está disponible', '[G8] negocio activo con industria apagada no se marca');
  perform pruebas.como('admin');
  update public.industrias set activo = true where nombre = 'Transporte de carga';
  perform pruebas.como('a');
  insert into public.conductor_negocios values (pruebas.id('a'), pruebas.negocio('Moto delivery'));
  perform pruebas.ok(true, '[G8] con la industria encendida y clase C, sí se marca');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  -- Habilitación por la pregunta del vehículo (sin clases directas en el negocio).
  perform pruebas.como('admin');
  update public.negocios set activo = true,
         pregunta_vehiculo = '{"pregunta": "¿Prueba?", "respuestas": [{"clave": "x", "texto": "X", "clases": ["A3"]}]}'
   where nombre = 'Bus interurbano';
  delete from public.negocio_clases_licencia where negocio_id = pruebas.negocio('Bus interurbano');
  perform pruebas.falla($q$update public.negocios set pregunta_vehiculo = '{"respuestas": 1}' where nombre = 'Taxi'$q$,
    'check constraint', '[G9] la pregunta del vehículo tiene que tener pregunta y respuestas');
  perform pruebas.como('a');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('A2'), 'declarada');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('a'), pruebas.negocio('Bus interurbano')), 'no habilita', '[G9] A2 no está en ninguna respuesta');
  insert into public.conductor_licencias values (pruebas.id('a'), pruebas.clase('A3'), 'declarada');
  insert into public.conductor_negocios values (pruebas.id('a'), pruebas.negocio('Bus interurbano'));
  perform pruebas.ok(true, '[G9] A3 habilita por una respuesta de la pregunta del vehículo');
end $$;
rollback to savepoint t;


-- =====================================================================
-- O. Turnos y días del conductor
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  insert into public.conductor_opciones values (pruebas.id('a'), pruebas.opcion('turno', 'noche')),
                                              (pruebas.id('a'), pruebas.opcion('dia_semana', 'lu'));
  perform pruebas.ok((select count(*) from public.conductor_opciones) = 2, '[O1] el conductor marca turno y día');
  perform pruebas.falla(format($q$insert into public.conductor_opciones values (%L, %s)$q$,
      pruebas.id('a'), pruebas.opcion('modo_contrato', 'arriendo_fijo')), 'no se puede elegir',
    '[O2] no marca modos de contrato');
  perform pruebas.falla(format($q$insert into public.conductor_opciones values (%L, %s)$q$,
      pruebas.id('b'), pruebas.opcion('turno', 'dia')), 'row-level security', '[O3] no marca opciones de otro');
  perform pruebas.ok((select count(*) from public.conductor_opciones where conductor_id = pruebas.id('b')) = 0,
    '[O3] no ve las opciones de otro');
  perform pruebas.falla(format($q$update public.conductor_opciones set opcion_id = %s where conductor_id = %L$q$,
      pruebas.opcion('modo_contrato', 'arriendo_fijo'), pruebas.id('a')), 'permission denied',
    '[O4] no puede saltarse la validación cambiando la fila');

  perform pruebas.como('admin');
  update public.opciones set activa = true where clave = 'arriendo_fijo';
  update public.opciones set activa = false where clave = 'do';
  perform pruebas.como('a');
  perform pruebas.falla(format($q$insert into public.conductor_opciones values (%L, %s)$q$,
      pruebas.id('a'), pruebas.opcion('modo_contrato', 'arriendo_fijo')), 'no se puede elegir',
    '[O2] tampoco si alguien activa la opción (la lista está en espera)');
  perform pruebas.falla(format($q$insert into public.conductor_opciones values (%L, %s)$q$,
      pruebas.id('a'), pruebas.opcion('dia_semana', 'do')), 'no se puede elegir', '[O5] no marca opciones inactivas');
end $$;
rollback to savepoint t;


-- =====================================================================
-- X. Experiencia del conductor
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos, actualizado_en)
    values (pruebas.id('a'), pruebas.tamano('Vehículo liviano'), 4, '2000-01-01');
  perform pruebas.ok((select actualizado_en from public.experiencia_conductor
                       where conductor_id = pruebas.id('a') and tamano_vehiculo_id = pruebas.tamano('Vehículo liviano')) = now(),
    '[X1] al agregar experiencia, la fecha la pone el servidor');
  perform pruebas.ok(pruebas.filas(format($q$update public.experiencia_conductor set anos = 3 where conductor_id = %L
      and tamano_vehiculo_id = %s$q$, pruebas.id('a'), pruebas.tamano('Moto'))) = 1,
    '[X2] el conductor cambia sus años');
  perform pruebas.ok((select actualizado_en from public.experiencia_conductor
                       where conductor_id = pruebas.id('a') and tamano_vehiculo_id = pruebas.tamano('Moto')) = now(),
    '[X2] al cambiar los años se actualiza la fecha');
  perform pruebas.falla(format($q$insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos) values (%L, %s, 51)$q$,
      pruebas.id('a'), pruebas.tamano('Bus')), 'check constraint', '[X3] no más de 50 años');
  perform pruebas.falla(format($q$insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos) values (%L, %s, -1)$q$,
      pruebas.id('a'), pruebas.tamano('Bus')), 'check constraint', '[X3] no menos de 0 años');
  perform pruebas.falla(format($q$insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos) values (%L, %s, 1)$q$,
      pruebas.id('a'), pruebas.tamano('Moto')), 'duplicate key', '[X4] una sola fila por categoría');
  perform pruebas.falla(format($q$insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos) values (%L, %s, 1)$q$,
      pruebas.id('b'), pruebas.tamano('Bus')), 'row-level security', '[X5] no agrega experiencia a otro');
  perform pruebas.ok((select count(*) from public.experiencia_conductor where conductor_id = pruebas.id('b')) = 0,
    '[X5] no ve la experiencia de otro');
  perform pruebas.ok(pruebas.filas(format($q$update public.experiencia_conductor set anos = 40 where conductor_id = %L$q$,
      pruebas.id('b'))) = 0, '[X5] no cambia la experiencia de otro');
  perform pruebas.falla(format($q$update public.experiencia_conductor set conductor_id = %L where conductor_id = %L$q$,
      pruebas.id('b'), pruebas.id('a')), 'row-level security', '[X5] no pasa su experiencia a otro');
  perform pruebas.ok(pruebas.filas(format($q$delete from public.experiencia_conductor where conductor_id = %L$q$,
      pruebas.id('b'))) = 0, '[X5] no borra la experiencia de otro');

  perform pruebas.como('revisor');
  perform pruebas.ok((select count(*) from public.experiencia_conductor) = 3, '[X6] el equipo ve toda la experiencia');
end $$;
rollback to savepoint t;


-- =====================================================================
-- Q. Equipo (roles)
-- =====================================================================
savepoint t;
do $$
declare
  m public.miembros_equipo;
begin
  perform pruebas.como('a');
  perform pruebas.falla(format($q$insert into public.miembros_equipo (id, rol) values (%L, 'administrador')$q$,
      pruebas.id('a')), 'row-level security', '[Q1] un conductor no se puede nombrar administrador');
  perform pruebas.ok((select count(*) from public.miembros_equipo) = 0, '[Q1] un conductor no ve al equipo');
  perform pruebas.ok(not privado.es_equipo() and not privado.es_admin(), '[Q1] un conductor no es del equipo');

  perform pruebas.como('revisor');
  perform pruebas.ok((select count(*) from public.miembros_equipo) = 2, '[Q2] el revisor ve al equipo');
  perform pruebas.ok(privado.es_equipo() and not privado.es_admin(), '[Q2] el revisor es del equipo pero no administrador');
  perform pruebas.ok(pruebas.filas(format($q$update public.miembros_equipo set rol = 'administrador' where id = %L$q$,
      pruebas.id('revisor'))) = 0, '[Q2] el revisor no se sube a administrador');
  perform pruebas.falla(format($q$insert into public.miembros_equipo (id, rol) values (%L, 'revisor')$q$,
      pruebas.id('a')), 'row-level security', '[Q2] el revisor no agrega miembros');

  perform pruebas.como('admin');
  insert into public.miembros_equipo (id, rol, creado_por, creado_en)
    values (pruebas.id('b'), 'revisor', pruebas.id('revisor'), '2000-01-01');
  select * into m from public.miembros_equipo where id = pruebas.id('b');
  perform pruebas.ok(m.creado_por = pruebas.id('admin') and m.creado_en = now(),
    '[Q3] al agregar un miembro, quién y cuándo los pone el servidor');
  perform pruebas.falla(format($q$update public.miembros_equipo set creado_por = %L where id = %L$q$,
      pruebas.id('revisor'), pruebas.id('b')), 'No puedes cambiar: creado_por', '[Q3] no se cambia quién lo agregó');
  perform pruebas.ok(pruebas.filas(format($q$update public.miembros_equipo set activo = false where id = %L$q$,
      pruebas.id('admin'))) = 0
                 and pruebas.filas(format($q$delete from public.miembros_equipo where id = %L$q$, pruebas.id('admin'))) = 0,
    '[Q4] un administrador no cambia ni borra su propia fila');
  perform pruebas.ok(pruebas.filas(format($q$update public.miembros_equipo set activo = false where id = %L$q$,
      pruebas.id('revisor'))) = 1, '[Q5] un administrador desactiva a un revisor');

  perform pruebas.como('revisor');
  perform pruebas.ok(not privado.es_equipo() and (select count(*) from public.cuentas) = 1
                 and (select count(*) from public.miembros_equipo) = 0,
    '[Q5] un miembro desactivado pierde el acceso de inmediato');
end $$;
rollback to savepoint t;


-- =====================================================================
-- Z. Catálogos
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  perform pruebas.ok(pruebas.filas($q$update public.negocios set activo = true$q$) = 0,
    '[Z1] un conductor no edita negocios');
  perform pruebas.falla($q$insert into public.negocios (industria_id, nombre) select id, 'Nuevo' from public.industrias limit 1$q$,
    'row-level security', '[Z1] un conductor no agrega negocios');
  perform pruebas.ok(pruebas.filas($q$delete from public.negocio_clases_licencia$q$) = 0,
    '[Z1] un conductor no borra la tabla de licencias por negocio');
  perform pruebas.ok(pruebas.filas($q$update public.clases_licencia set habilita_clase_b = true$q$) = 0,
    '[Z1] un conductor no cambia qué clases habilitan B');

  perform pruebas.como('revisor');
  perform pruebas.ok(pruebas.filas($q$update public.negocios set activo = true$q$) = 0,
    '[Z2] un revisor (no administrador) no edita negocios');
  perform pruebas.ok(pruebas.filas($q$update public.ajustes set valor = '10'$q$) = 0,
    '[Z2] un revisor no cambia ajustes');

  perform pruebas.como('admin');
  perform pruebas.ok(pruebas.filas($q$update public.negocios set activo = true where nombre = 'Taxi colectivo'$q$) = 1,
    '[Z3] un administrador enciende un negocio');
  insert into public.zonas (region_id, nombre, orden)
    select id, 'Zona de prueba', 99 from public.regiones where nombre = 'Maule';
  perform pruebas.ok(pruebas.filas($q$delete from public.zonas where nombre = 'Zona de prueba'$q$) = 1,
    '[Z3] un administrador agrega y borra una zona');
  perform pruebas.falla($q$insert into public.comunas (nombre, region_id, zona_id)
      select 'Comuna cruzada', (select id from public.regiones where nombre = 'Maule'),
             (select z.id from public.zonas z join public.regiones r on r.id = z.region_id
               where r.nombre = 'Ñuble' limit 1)$q$,
    'foreign key', '[Z4] una comuna no puede quedar en una zona de otra región');
end $$;
rollback to savepoint t;


-- =====================================================================
-- J. Ajustes
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.ajustes) = 0, '[J1] un conductor no lee ajustes');
  perform pruebas.como('revisor');
  perform pruebas.ok((select count(*) from public.ajustes) = 1, '[J2] el equipo lee ajustes');
  perform pruebas.como('admin');
  update public.ajustes set valor = '70', actualizado_por = pruebas.id('revisor'), actualizado_en = '2000-01-01'
   where id = 'umbral_match';
  perform pruebas.ok((select valor = '70'::jsonb and actualizado_por = pruebas.id('admin') and actualizado_en = now()
                        from public.ajustes where id = 'umbral_match'),
    '[J3] un administrador cambia un ajuste y queda registrado quién y cuándo');
end $$;
rollback to savepoint t;


-- =====================================================================
-- T. Textos de autorización
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.falla($q$insert into public.textos_autorizacion (clave, nombre, texto, version, para_quien, obligatoria, vigente)
      values ('terminos_privacidad', 'x', 'x', 'v3', 'todos', true, true)$q$,
    'textos_autorizacion_una_vigente', '[T1] solo una versión vigente por autorización');
  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.textos_autorizacion) = 1, '[T2] el conductor ve solo la versión vigente');
  perform pruebas.falla($q$insert into public.textos_autorizacion (clave, nombre, texto, version, para_quien, obligatoria)
      values ('x', 'x', 'x', 'v1', 'todos', true)$q$, 'row-level security', '[T3] el conductor no agrega textos');
  perform pruebas.ok(pruebas.filas($q$update public.textos_autorizacion set texto = 'cambiado'$q$) = 0,
    '[T3] el conductor no cambia textos');
  perform pruebas.como('revisor');
  perform pruebas.ok((select count(*) from public.textos_autorizacion) = 2, '[T2] el equipo ve todas las versiones');
end $$;
rollback to savepoint t;

savepoint t;
do $$
begin
  -- B aceptó la v2 (datos de prueba): su contenido ya no se puede cambiar.
  perform pruebas.como('admin');
  perform pruebas.falla($q$update public.textos_autorizacion set texto = 'otro texto' where version = 'v2'$q$,
    'ya fue aceptado', '[T4] un texto ya aceptado no cambia de contenido');
  perform pruebas.falla($q$update public.textos_autorizacion set version = 'v2b' where version = 'v2'$q$,
    'ya fue aceptado', '[T4] ni de versión');
  perform pruebas.ok(pruebas.filas($q$update public.textos_autorizacion set texto = 'v1 corregido' where version = 'v1'$q$) = 1,
    '[T4] un texto que nadie aceptó sí se corrige');
  perform pruebas.falla($q$delete from public.textos_autorizacion where version = 'v2'$q$,
    'foreign key', '[T4] un texto aceptado no se borra');

  -- Publicar una versión nueva: vigente_desde lo pone el servidor.
  update public.textos_autorizacion set vigente = false, orden = 5 where version = 'v2';
  insert into public.textos_autorizacion (clave, nombre, texto, version, para_quien, obligatoria, vigente, vigente_desde)
    values ('terminos_privacidad', 'Términos y privacidad', 'Texto v3', 'v3', 'todos', true, true, '2000-01-01');
  perform pruebas.ok((select vigente_desde from public.textos_autorizacion where version = 'v3') = now()
                 and (select orden from public.textos_autorizacion where version = 'v2') = 5,
    '[T5] al publicar una versión, vigente_desde la pone el servidor (y lo demás se puede ordenar)');
end $$;
rollback to savepoint t;


-- =====================================================================
-- S. Autorizaciones aceptadas (consentimientos)
-- =====================================================================
savepoint t;
do $$
declare
  v_v1 bigint := (select id from public.textos_autorizacion where version = 'v1');
  v_v2 bigint := (select id from public.textos_autorizacion where version = 'v2');
  v_id bigint;
  c public.consentimientos;
begin
  perform pruebas.como('a');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id, aceptado_en, revocado_en)
    values (pruebas.id('a'), v_v2, '2000-01-01', '2000-01-02')
    returning id into v_id;
  select * into c from public.consentimientos where id = v_id;
  perform pruebas.ok(c.aceptado_en = now() and c.revocado_en is null,
    '[S1] al aceptar, la fecha la pone el servidor y no nace retirada');
  perform pruebas.falla(format($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id) values (%L, %s)$q$,
      pruebas.id('b'), v_v2), 'row-level security', '[S2] no acepta a nombre de otro');
  perform pruebas.falla(format($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id) values (%L, %s)$q$,
      pruebas.id('a'), v_v1), 'row-level security', '[S3] no acepta una versión que no está vigente');
  perform pruebas.falla(format($q$update public.consentimientos set texto_autorizacion_id = %s where id = %s$q$, v_v1, v_id),
    'no se modifica', '[S4] no cambia el texto aceptado');
  perform pruebas.falla(format($q$update public.consentimientos set aceptado_en = '2000-01-01' where id = %s$q$, v_id),
    'no se modifica', '[S4] no cambia la fecha de aceptación');

  update public.consentimientos set revocado_en = '2000-01-01' where id = v_id;
  perform pruebas.ok((select revocado_en from public.consentimientos where id = v_id) = now(),
    '[S5] la retira y la fecha la pone el servidor');
  perform pruebas.falla(format($q$update public.consentimientos set revocado_en = null where id = %s$q$, v_id),
    'ya fue retirada', '[S6] no puede deshacer el retiro');
  perform pruebas.falla(format($q$update public.consentimientos set revocado_en = '2030-01-01' where id = %s$q$, v_id),
    'ya fue retirada', '[S6] no cambia la fecha de retiro');
  perform pruebas.falla(format($q$delete from public.consentimientos where id = %s$q$, v_id),
    'permission denied', '[S7] no borra autorizaciones');
  perform pruebas.ok((select count(*) from public.consentimientos where cuenta_id = pruebas.id('b')) = 0,
    '[S8] no ve las autorizaciones de otro');
  perform pruebas.ok(pruebas.filas(format($q$update public.consentimientos set revocado_en = now() where cuenta_id = %L$q$,
      pruebas.id('b'))) = 0, '[S8] no retira las autorizaciones de otro');

  -- Para volver a aceptar se agrega otra fila.
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id) values (pruebas.id('a'), v_v2);
  perform pruebas.ok((select count(*) from public.consentimientos) = 2, '[S9] vuelve a aceptar con una fila nueva');
  perform pruebas.falla(format($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id) values (%L, %s)$q$,
      pruebas.id('a'), v_v2), 'consentimientos_una_activa', '[S11] no acepta dos veces la misma versión sin haberla retirado');

  perform pruebas.como('revisor');
  perform pruebas.ok((select count(*) from public.consentimientos) = 3, '[S10] el equipo ve todas las autorizaciones');
  perform pruebas.ok(pruebas.filas(format($q$update public.consentimientos set revocado_en = now() where cuenta_id = %L$q$,
      pruebas.id('b'))) = 0, '[S10] el equipo no retira autorizaciones de otros');
end $$;
rollback to savepoint t;


-- =====================================================================
-- V. Intentos de saltarse las reglas
-- =====================================================================
savepoint t;
do $$
begin
  perform pruebas.como('a');
  perform pruebas.falla('select privado.conductores_proteger()', 'permission denied|trigger',
    '[V1] no se puede llamar a una función de trigger');
  perform pruebas.falla($q$create function public.x() returns int language sql security definer as 'select 1'$q$,
    'permission denied', '[V3] authenticated no crea funciones en public');
  perform pruebas.falla($q$create function privado.x() returns int language sql security definer as 'select 1'$q$,
    'permission denied', '[V3] authenticated no crea funciones en privado');
  perform pruebas.falla('set session_replication_role = replica', 'permission denied',
    '[V5] authenticated no apaga los triggers (session_replication_role)');
  perform pruebas.falla('alter table public.conductores disable trigger proteger', 'must be owner',
    '[V6] authenticated no desactiva triggers');
  perform pruebas.falla('alter table public.conductores disable row level security', 'must be owner',
    '[V6] authenticated no desactiva RLS');
  -- Aunque el cliente mande el "sub" de otro, solo sirve si el token lo firma Supabase;
  -- aquí se comprueba que el sub de otro no da más que lo de ese otro.
  perform set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000000', true);
  perform pruebas.ok((select count(*) from public.cuentas) = 0 and not privado.es_equipo(),
    '[V4] un sub desconocido no ve nada');
end $$;
rollback to savepoint t;


do $$ begin raise notice 'FIN: todas las pruebas de la Etapa 1 pasaron.'; end $$;

rollback;

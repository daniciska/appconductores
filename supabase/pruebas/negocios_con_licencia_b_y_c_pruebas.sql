-- =====================================================================
-- negocios_con_licencia_b_y_c_pruebas.sql — pruebas de la migración
-- 20261116120000_negocios_con_licencia_b_y_c.sql (16-nov): quien tiene solo
-- B o solo C ya puede elegir un negocio en el Paso 4.
--
-- Orden en local: después de esa migración (ver supabase/README.md).
-- Todo termina en ROLLBACK. Nunca se aplica en Supabase.
-- =====================================================================

\set ON_ERROR_STOP 1
set client_min_messages = notice;

begin;

create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.usuarios (alias text primary key, id uuid not null, celular text not null);
grant select on pruebas.usuarios to public;
insert into pruebas.usuarios values
  ('b', 'bbbbbbbb-2222-4000-8000-00000000000b', '56990000021'),
  ('c', 'cccccccc-2222-4000-8000-00000000000c', '56990000022');

create function pruebas.id(p_alias text) returns uuid
language sql stable as $$ select id from pruebas.usuarios where alias = p_alias $$;
create function pruebas.negocio(p_nombre text) returns bigint
language sql stable as $$ select id from public.negocios where nombre = p_nombre $$;
create function pruebas.clase(p_codigo text) returns bigint
language sql stable as $$ select id from public.clases_licencia where codigo = p_codigo $$;

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

do $$
declare u record;
begin
  perform pruebas.como('supabase_auth_admin');
  for u in select * from pruebas.usuarios loop
    insert into auth.users (id, phone, phone_confirmed_at) values (u.id, u.celular, now());
  end loop;
end $$;

-- NB. Lo que se ve sin sesión (como lo lee la app).
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select array_agg(nombre order by orden) from public.negocios where activo)
                     = array['Taxi', 'Taxi ejecutivo', 'Transporte por aplicación', 'Moto delivery'],
    '[NB1] negocios activos: Taxi, Taxi ejecutivo, Transporte por aplicación y Moto delivery');
  perform pruebas.ok((select array_agg(nombre order by orden) from public.industrias where activo)
                     = array['Transporte de pasajeros', 'Transporte de carga'],
    '[NB2] las dos industrias encendidas');
  perform pruebas.ok((select array_agg(ng.nombre) from public.negocios ng join public.industrias i on i.id = ng.industria_id
                       where i.nombre = 'Transporte de carga' and ng.activo) = array['Moto delivery'],
    '[NB3] en carga solo se ve Moto delivery');
end $$;

-- NB. Quien tiene solo B o solo C ya puede terminar el Paso 4.
do $$
begin
  perform pruebas.como('b');
  insert into public.conductores (id, fecha_nacimiento, disponible, disponibilidad_confirmada_en)
  values (pruebas.id('b'), '1990-03-14', true, now());
  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('b'), pruebas.clase('B'), 'declarada');
  insert into public.conductor_negocios values (pruebas.id('b'), pruebas.negocio('Transporte por aplicación'));
  perform pruebas.ok(true, '[NB4] con B marca Transporte por aplicación');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('b'), pruebas.negocio('Taxi')), 'no habilita', '[NB5] con B sigue sin poder marcar Taxi');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('b'), pruebas.negocio('Moto delivery')), 'no habilita', '[NB6] con B no marca Moto delivery (pide C)');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('b'), pruebas.negocio('Reparto en furgón')), 'no está disponible', '[NB7] Reparto en furgón sigue apagado');

  perform pruebas.como('c');
  insert into public.conductores (id, fecha_nacimiento, disponible, disponibilidad_confirmada_en)
  values (pruebas.id('c'), '1995-07-01', true, now());
  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('c'), pruebas.clase('C'), 'declarada');
  insert into public.conductor_negocios values (pruebas.id('c'), pruebas.negocio('Moto delivery'));
  perform pruebas.ok(true, '[NB8] con C marca Moto delivery');
  perform pruebas.falla(format($q$insert into public.conductor_negocios values (%L, %s)$q$,
      pruebas.id('c'), pruebas.negocio('Transporte por aplicación')), 'no habilita',
    '[NB9] con solo C no marca Transporte por aplicación (pide B)');
end $$;

do $$ begin raise notice 'FIN: todas las pruebas de los negocios con licencia B y C pasaron.'; end $$;

rollback;

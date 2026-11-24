-- =====================================================================
-- mejoras_conductor_24nov_pruebas.sql — pruebas de las migraciones del
-- 24-nov (mejoras aprobadas S07, S12 y S14 de la app del conductor):
--   20261124120000_experiencia_ejemplo_taxi.sql
--   20261124120100_autorizaciones_solo_dos.sql
--   20261124120200_ajuste_aviso_reconfirmar.sql
--
-- Orden en local: después de esas 3 migraciones (ver supabase/README.md).
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
  ('n', 'aaaaaaaa-3333-4000-8000-00000000000a', '56990000031'),  -- se registra después del cambio
  ('v', 'bbbbbbbb-3333-4000-8000-00000000000b', '56990000032');  -- ya había aceptado las 4

create function pruebas.id(p_alias text) returns uuid
language sql stable as $$ select id from pruebas.usuarios where alias = p_alias $$;
-- Como sistema: un conductor no ve los textos que no están vigentes.
create function pruebas.texto(p_clave text) returns bigint
language sql stable security definer set search_path = '' as $$
  select id from public.textos_autorizacion where clave = p_clave and version = 'prueba-1' $$;

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

do $$
declare u record;
begin
  perform pruebas.como('supabase_auth_admin');
  for u in select * from pruebas.usuarios loop
    insert into auth.users (id, phone, phone_confirmed_at) values (u.id, u.celular, now());
  end loop;
end $$;


-- =====================================================================
-- EJ. S07 · Ejemplo de "Vehículo liviano" con la palabra taxi
-- =====================================================================
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select ayuda from public.tamanos_vehiculo where nombre = 'Vehículo liviano') = 'auto, taxi, SUV, camioneta',
    '[EJ1] anon lee "auto, taxi, SUV, camioneta" en Vehículo liviano');
  perform pruebas.ok((select count(*) from public.tamanos_vehiculo where activo) = 7
                 and (select ayuda from public.tamanos_vehiculo where nombre = 'Moto') = 'moto, scooter',
    '[EJ2] siguen las 7 categorías y las demás no cambian');
end $$;


-- =====================================================================
-- AU. S12 · "Antes de empezar" pide solo 2 autorizaciones
-- =====================================================================
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select array_agg(clave order by orden) from public.textos_autorizacion
                       where vigente and obligatoria and para_quien in ('conductor', 'todos'))
                     = array['terminos_privacidad', 'compartir_ficha'],
    '[AU1] la app lee solo 2 textos obligatorios vigentes, en orden');
  perform pruebas.ok((select count(*) from public.textos_autorizacion) = 2,
    '[AU2] anon no ve los textos que dejaron de ofrecerse');

  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from public.textos_autorizacion where version = 'prueba-1') = 4
                 and (select bool_and(obligatoria) from public.textos_autorizacion) ,
    '[AU3] los 4 textos siguen en la base (no se borra nada ni cambia obligatoria)');

  -- Un conductor nuevo acepta las 2 y no puede aceptar las que ya no se ofrecen.
  perform pruebas.como('n');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('n'), t.id from public.textos_autorizacion t
   where t.vigente and t.obligatoria and t.para_quien in ('conductor', 'todos');
  perform pruebas.ok((select count(*) from public.consentimientos where cuenta_id = pruebas.id('n')) = 2,
    '[AU4] un conductor nuevo acepta las 2 y queda al día');
  perform pruebas.falla(format($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id) values (%L, %s)$q$,
      pruebas.id('n'), pruebas.texto('revision_documentos')), 'row-level security',
    '[AU5] no se puede aceptar "Revisión de mis documentos" mientras no se ofrezca');
end $$;

-- Quien aceptó las 4 antes del cambio: se simula volviendo a ofrecer los 2
-- textos, aceptando las 4 y repitiendo el cambio de la migración.
do $$
begin
  perform pruebas.como('postgres');
  update public.textos_autorizacion set vigente = true where clave in ('revision_documentos', 'normas_mensajes');
  perform pruebas.como('v');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('v'), id from public.textos_autorizacion where vigente;
  perform pruebas.ok((select count(*) from public.consentimientos where cuenta_id = pruebas.id('v')) = 4,
    '[AU6] (preparación) un conductor aceptó las 4');

  perform pruebas.como('postgres');
  perform pruebas.ok(pruebas.filas($q$update public.textos_autorizacion set vigente = false
                                     where clave in ('revision_documentos', 'normas_mensajes')$q$) = 2,
    '[AU7] el cambio de la migración se puede hacer aunque los textos ya tengan aceptaciones');

  perform pruebas.como('v');
  perform pruebas.ok((select count(*) from public.consentimientos where cuenta_id = pruebas.id('v') and revocado_en is null) = 4,
    '[AU8] sus 4 aceptaciones se conservan');
  perform pruebas.ok(not exists (
      select 1 from public.textos_autorizacion t
       where t.vigente and t.obligatoria and t.para_quien in ('conductor', 'todos')
         and not exists (select 1 from public.consentimientos c
                          where c.cuenta_id = pruebas.id('v') and c.texto_autorizacion_id = t.id and c.revocado_en is null)),
    '[AU9] quien ya aceptó las 4 está al día sin hacer nada');

  perform pruebas.como('postgres');
  perform pruebas.falla($q$update public.textos_autorizacion set obligatoria = false where clave = 'normas_mensajes'$q$,
    'ya fue aceptado', '[AU10] un texto aceptado no cambia de obligatoria (por eso se usa vigente)');
end $$;


-- =====================================================================
-- J. S14 · Ajuste público dias_aviso_reconfirmar
-- =====================================================================
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select array_agg(id order by id) from public.ajustes)
                     = array['dias_aviso_reconfirmar', 'dias_reconfirmar_disponibilidad']
                 and (select valor from public.ajustes where id = 'dias_aviso_reconfirmar') = '5'::jsonb
                 and (select valor from public.ajustes where id = 'dias_reconfirmar_disponibilidad') = '30'::jsonb,
    '[JA1] anon lee los 2 ajustes públicos: 5 y 30 días');
  perform pruebas.falla($q$update public.ajustes set valor = '1' where id = 'dias_aviso_reconfirmar'$q$,
    'permission denied', '[JA2] anon no cambia el ajuste');

  perform pruebas.como('n');
  perform pruebas.ok(pruebas.filas($q$update public.ajustes set valor = '1' where id = 'dias_aviso_reconfirmar'$q$) = 0,
    '[JA3] un conductor no cambia el ajuste');

  perform pruebas.como('postgres');
  perform pruebas.ok((select publico from public.ajustes where id = 'dias_aviso_reconfirmar')
                 and not (select publico from public.ajustes where id = 'umbral_match'),
    '[JA4] el ajuste nuevo es público y los demás siguen como estaban');
end $$;

do $$ begin raise notice 'FIN: todas las pruebas de las mejoras del conductor del 24-nov pasaron.'; end $$;

rollback;

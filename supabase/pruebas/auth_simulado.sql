-- =====================================================================
-- auth_simulado.sql — SOLO PARA PROBAR EN LOCAL. NUNCA SE APLICA EN SUPABASE.
--
-- Imita lo mínimo de Supabase que necesitan las migraciones:
--   * los roles anon, authenticated y service_role (este último salta RLS);
--   * el rol supabase_auth_admin, dueño de auth.users (es quien inserta
--     los usuarios cuando alguien confirma su celular);
--   * el esquema auth con auth.users y auth.uid();
--   * los permisos por defecto de Supabase en public (dan TODO a anon y
--     authenticated), para comprobar que las migraciones los recortan.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin nologin noinherit;
  end if;
end
$$;

create schema if not exists auth authorization supabase_auth_admin;
grant usage on schema auth to anon, authenticated, service_role;

create table if not exists auth.users (
  id                 uuid primary key,
  phone              text unique default null,
  email              text,
  phone_confirmed_at timestamptz,
  created_at         timestamptz default now()
);
alter table auth.users owner to supabase_auth_admin;

-- Igual que en Supabase: lee el "sub" del token (claim suelto o dentro de claims).
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ),
    ''
  )::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- Permisos por defecto de Supabase en public (las migraciones deben recortarlos).
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

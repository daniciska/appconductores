-- =====================================================================
-- storage_simulado.sql — SOLO PARA PROBAR EN LOCAL. NUNCA SE APLICA EN SUPABASE.
--
-- Imita lo mínimo de Supabase Storage que usa la migración de documentos
-- (20261124150000_documentos_conductor.sql):
--   * el esquema storage con storage.buckets y storage.objects (las columnas
--     que usan las políticas: bucket_id, name, owner_id y metadata);
--   * storage.foldername(name), igual que en Supabase ('a/b/c.pdf' → {a,b});
--   * RLS encendida en storage.objects y los permisos que da Supabase
--     (todo para anon y authenticated: las políticas deciden).
-- En Supabase, el servicio de Storage escribe la fila con el rol de quien
-- sube (owner_id = su id) y pone metadata->>'mimetype' y 'size'. En las
-- pruebas se hace con INSERT y DELETE como ese rol.
-- Va después de auth_simulado.sql.
-- =====================================================================

create schema if not exists storage;
grant usage on schema storage to anon, authenticated, service_role;

create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null unique,
  owner              uuid,
  public             boolean default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz default now()
);

create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text references storage.buckets (id),
  name       text,
  owner      uuid,
  owner_id   text,
  metadata   jsonb,
  created_at timestamptz default now(),
  unique (bucket_id, name)
);

alter table storage.objects enable row level security;
alter table storage.buckets enable row level security;
grant all on storage.objects to anon, authenticated, service_role;
grant all on storage.buckets to anon, authenticated, service_role;

-- Como en Supabase: las carpetas de la ruta, sin el nombre del archivo.
create or replace function storage.foldername(name text)
returns text[]
language plpgsql
immutable
as $$
declare
  _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1 : array_length(_parts, 1) - 1];
end
$$;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;

-- =====================================================================
-- Dale Contacto · Etapa 1 de la base de datos: esquema
--
-- Contiene: catálogos (regiones, zonas, comunas, licencias, industrias,
-- tipos de vehículo, negocios, listas de opciones, ajustes), personas
-- (cuentas, equipo, textos de autorización y autorizaciones aceptadas) y el
-- perfil del conductor. No contiene titulares, búsquedas, match,
-- documentos, mensajes ni cobro (etapas siguientes).
--
-- Seguridad: RLS en todas las tablas de public; nada abierto por defecto.
-- Las funciones auxiliares y de triggers viven en el esquema "privado",
-- que la API de Supabase no expone.
--
-- "Sistema" = cualquier rol que no sea anon ni authenticated (postgres,
-- service_role, funciones SECURITY DEFINER). El sistema y el equipo pueden
-- escribir columnas que la persona no puede tocar.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Esquema privado
-- ---------------------------------------------------------------------
create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to anon, authenticated, service_role;
comment on schema privado is 'Funciones auxiliares y de triggers de Dale Contacto. No se expone por la API.';


-- ---------------------------------------------------------------------
-- 1. Catálogos
-- ---------------------------------------------------------------------
create table public.regiones (
  id         bigint generated always as identity primary key,
  nombre     text not null unique,
  codigo_cut text unique,
  orden      integer not null default 0
);
comment on table public.regiones is 'Las 16 regiones de Chile, de norte a sur.';
comment on column public.regiones.codigo_cut is 'Código Único Territorial (SUBDERE). Se llena después desde la fuente oficial; no se escribe a mano.';

create table public.zonas (
  id        bigint generated always as identity primary key,
  region_id bigint not null references public.regiones (id),
  nombre    text not null,
  orden     integer not null default 0,
  activa    boolean not null default true,
  unique (region_id, nombre),
  unique (id, region_id)
);
comment on table public.zonas is 'Grupos de comunas cercanas dentro de una región (variable M2 del match).';

create table public.comunas (
  id                   bigint generated always as identity primary key,
  nombre               text not null,
  nombres_alternativos text[] not null default '{}',
  codigo_cut           text unique,
  region_id            bigint not null references public.regiones (id),
  zona_id              bigint not null,
  activa               boolean not null default true,
  unique (region_id, nombre),
  -- La zona tiene que ser de la misma región que la comuna.
  foreign key (zona_id, region_id) references public.zonas (id, region_id)
);
comment on table public.comunas is 'Las 346 comunas de Chile con su región y su zona.';
comment on column public.comunas.nombres_alternativos is 'Formas de uso común o de Google Maps (ej. Paihuano), para reconocer la comuna de la dirección.';
comment on column public.comunas.codigo_cut is 'Código Único Territorial (SUBDERE). Se llena después desde la fuente oficial; no se escribe a mano.';

create table public.clases_licencia (
  id               bigint generated always as identity primary key,
  codigo           text not null unique,
  nombre           text,
  es_antigua       boolean not null default false,
  habilita_clase_b boolean not null default false,
  orden            integer not null default 0,
  activa           boolean not null default true
);
comment on table public.clases_licencia is 'Clases de licencia de Chile, incluidas las antiguas A1 y A2 (antes de 1997).';
comment on column public.clases_licencia.habilita_clase_b is 'Si quien tiene esta clase puede manejar lo que pide la B. Según ChileAtiende y CONASET [verificar art. 12 Ley 18.290].';

create table public.industrias (
  id     bigint generated always as identity primary key,
  nombre text not null unique,
  orden  integer not null default 0,
  activo boolean not null default true
);
comment on table public.industrias is 'Agrupan los negocios. Si una industria se apaga, sus negocios dejan de mostrarse.';

create table public.tamanos_vehiculo (
  id     bigint generated always as identity primary key,
  nombre text not null unique,
  ayuda  text,
  orden  integer not null default 0,
  activo boolean not null default true
);
comment on table public.tamanos_vehiculo is 'Las categorías de vehículo con que se mide la experiencia del conductor (Paso 3).';

create table public.negocios (
  id                bigint generated always as identity primary key,
  industria_id      bigint not null references public.industrias (id),
  nombre            text not null unique,
  ejemplo           text,
  pregunta_vehiculo jsonb,
  habilitante_hasta jsonb,
  nota              text,
  orden             integer not null default 0,
  activo            boolean not null default true,
  constraint negocios_pregunta_vehiculo_forma check (
    pregunta_vehiculo is null
    or (jsonb_typeof(pregunta_vehiculo -> 'pregunta') = 'string'
        and jsonb_typeof(pregunta_vehiculo -> 'respuestas') = 'array')
  )
);
comment on table public.negocios is 'En qué quiere trabajar el conductor (Paso 4) y qué elige cada búsqueda. Solo se usan los activos con industria activa.';
comment on column public.negocios.pregunta_vehiculo is 'Solo donde la licencia depende del vehículo: {"pregunta": "...", "respuestas": [{"clave", "texto", "clases": ["B", ...]}]}.';

create table public.negocio_clases_licencia (
  negocio_id        bigint not null references public.negocios (id) on delete cascade,
  clase_licencia_id bigint not null references public.clases_licencia (id),
  primary key (negocio_id, clase_licencia_id)
);
comment on table public.negocio_clases_licencia is 'Clases que habilitan cada negocio (filtro F2). Si incluye B, también sirven las clases con habilita_clase_b.';

create table public.negocio_tamanos (
  negocio_id         bigint not null references public.negocios (id) on delete cascade,
  tamano_vehiculo_id bigint not null references public.tamanos_vehiculo (id),
  primary key (negocio_id, tamano_vehiculo_id)
);
comment on table public.negocio_tamanos is 'Qué categorías de experiencia cuentan para los años (M4) en cada negocio.';

create table public.listas (
  id     bigint generated always as identity primary key,
  clave  text not null unique,
  nombre text not null
);
comment on table public.listas is 'Listas simples de opciones (turno, día de la semana, modo de contrato...).';

create table public.opciones (
  id           bigint generated always as identity primary key,
  lista_id     bigint not null references public.listas (id),
  clave        text not null,
  nombre       text not null,
  nombre_corto text,
  descripcion  text,
  valor        numeric,
  orden        integer not null default 0,
  activa       boolean not null default true,
  unique (lista_id, clave)
);
comment on table public.opciones is 'Opciones de las listas simples. Se ocultan (activa = false) en vez de borrarse.';


-- ---------------------------------------------------------------------
-- 2. Personas
-- ---------------------------------------------------------------------
create table public.cuentas (
  id                    uuid primary key references auth.users (id) on delete cascade,
  celular               text not null unique,
  celular_verificado_en timestamptz not null,
  email                 text,
  email_confirmado_en   timestamptz,
  nombres               text,
  primer_apellido       text,
  segundo_apellido      text,
  estado                text not null default 'activa'
                        check (estado in ('activa', 'suspendida', 'eliminacion_en_curso')),
  tokens_avisos         jsonb,
  creado_en             timestamptz not null default now()
);
comment on table public.cuentas is 'Una fila por persona que entra con su celular. Se crea sola desde auth.users.';

create table public.miembros_equipo (
  id         uuid primary key references public.cuentas (id),
  rol        text not null check (rol in ('revisor', 'administrador')),
  activo     boolean not null default true,
  creado_por uuid references public.cuentas (id) on delete set null,
  creado_en  timestamptz not null default now()
);
comment on table public.miembros_equipo is 'Personas del equipo y su rol. El primer administrador se crea a mano con SQL de servicio.';

create table public.ajustes (
  id              text primary key,
  valor           jsonb not null,
  descripcion     text not null,
  actualizado_por uuid references public.cuentas (id) on delete set null,
  actualizado_en  timestamptz
);
comment on table public.ajustes is 'Números y reglas generales que cambia un administrador desde el panel.';

create table public.textos_autorizacion (
  id                     bigint generated always as identity primary key,
  clave                  text not null,
  nombre                 text not null,
  texto                  text not null,
  enlace                 text,
  version                text not null,
  para_quien             text not null check (para_quien in ('conductor', 'titular', 'todos')),
  obligatoria            boolean not null,
  exige_aceptar_de_nuevo boolean not null default false,
  vigente                boolean not null default false,
  vigente_desde          timestamptz,
  orden                  integer not null default 0,
  unique (clave, version)
);
comment on table public.textos_autorizacion is 'Cada autorización que se pide, en cada versión. Las anteriores no se borran.';
create unique index textos_autorizacion_una_vigente on public.textos_autorizacion (clave) where vigente;

create table public.consentimientos (
  id                    bigint generated always as identity primary key,
  -- Sin borrado en cascada: qué autorizaciones se conservan al borrar una
  -- cuenta lo decide el abogado (R19 / MD23).
  cuenta_id             uuid not null references public.cuentas (id),
  texto_autorizacion_id bigint not null references public.textos_autorizacion (id),
  aceptado_en           timestamptz not null default now(),
  revocado_en           timestamptz
);
comment on table public.consentimientos is 'Autorizaciones aceptadas. Nunca se modifican: retirar solo anota revocado_en.';
-- Una sola aceptación sin retirar por persona y versión.
create unique index consentimientos_una_activa
  on public.consentimientos (cuenta_id, texto_autorizacion_id) where revocado_en is null;


-- ---------------------------------------------------------------------
-- 3. Conductor
-- ---------------------------------------------------------------------
create table public.conductores (
  id                           uuid primary key references public.cuentas (id) on delete cascade,
  estado_perfil                text not null default 'incompleto'
                               check (estado_perfil in ('incompleto', 'completo')),
  perfil_completo_en           timestamptz,
  direccion                    text,
  google_place_id              text,
  direccion_detalle            text,
  comuna_id                    bigint references public.comunas (id),
  tiene_estacionamiento        boolean,
  tramo_garantia_id            bigint references public.opciones (id),  -- EN ESPERA (crecimiento futuro)
  disponible                   boolean not null default true,
  disponibilidad_confirmada_en timestamptz,
  estado_verificacion          text not null default 'sin_documentos'
                               check (estado_verificacion in ('sin_documentos', 'en_revision', 'verificado', 'con_observaciones')),
  datos_extra                  jsonb not null default '{}'::jsonb
                               check (jsonb_typeof(datos_extra) = 'object'),
  creado_en                    timestamptz not null default now(),
  actualizado_en               timestamptz not null default now()
);
comment on table public.conductores is 'Perfil de trabajo del conductor. Nombre y contacto están en cuentas.';
comment on column public.conductores.tramo_garantia_id is 'EN ESPERA: solo acepta opciones de la lista tramo_garantia, que no se carga todavía.';

create table public.conductor_licencias (
  conductor_id      uuid not null references public.conductores (id) on delete cascade,
  clase_licencia_id bigint not null references public.clases_licencia (id),
  origen            text not null check (origen in ('declarada', 'revisada')),
  primary key (conductor_id, clase_licencia_id, origen)
);
comment on table public.conductor_licencias is 'Clases declaradas por el conductor y clases revisadas por el equipo (solo estas cuentan para el match).';

create table public.conductor_negocios (
  conductor_id uuid not null references public.conductores (id) on delete cascade,
  negocio_id   bigint not null references public.negocios (id),
  primary key (conductor_id, negocio_id)
);
comment on table public.conductor_negocios is 'Negocios en que quiere trabajar el conductor (Paso 4).';

create table public.conductor_opciones (
  conductor_id uuid not null references public.conductores (id) on delete cascade,
  opcion_id    bigint not null references public.opciones (id),
  primary key (conductor_id, opcion_id)
);
comment on table public.conductor_opciones is 'Turnos y días de trabajo del conductor (a futuro, modos de contrato).';

create table public.experiencia_conductor (
  id                 bigint generated always as identity primary key,
  conductor_id       uuid not null references public.conductores (id) on delete cascade,
  tamano_vehiculo_id bigint not null references public.tamanos_vehiculo (id),
  anos               smallint not null check (anos between 0 and 50),
  actualizado_en     timestamptz not null default now(),
  unique (conductor_id, tamano_vehiculo_id)
);
comment on table public.experiencia_conductor is 'Años manejando cada categoría de vehículo (Paso 3).';


-- ---------------------------------------------------------------------
-- 4. Índices de llaves foráneas no cubiertas por una pk o unique
-- ---------------------------------------------------------------------
create index comunas_zona_id_region_id_idx              on public.comunas (zona_id, region_id);
create index negocios_industria_id_idx                  on public.negocios (industria_id);
create index negocio_clases_licencia_clase_idx          on public.negocio_clases_licencia (clase_licencia_id);
create index negocio_tamanos_tamano_idx                 on public.negocio_tamanos (tamano_vehiculo_id);
create index miembros_equipo_creado_por_idx             on public.miembros_equipo (creado_por);
create index ajustes_actualizado_por_idx                on public.ajustes (actualizado_por);
create index consentimientos_cuenta_id_idx              on public.consentimientos (cuenta_id);
create index consentimientos_texto_autorizacion_id_idx  on public.consentimientos (texto_autorizacion_id);
create index conductores_comuna_id_idx                  on public.conductores (comuna_id);
create index conductores_tramo_garantia_id_idx          on public.conductores (tramo_garantia_id);
create index conductor_licencias_clase_idx              on public.conductor_licencias (clase_licencia_id);
create index conductor_negocios_negocio_id_idx          on public.conductor_negocios (negocio_id);
create index conductor_opciones_opcion_id_idx           on public.conductor_opciones (opcion_id);
create index experiencia_conductor_tamano_idx           on public.experiencia_conductor (tamano_vehiculo_id);


-- ---------------------------------------------------------------------
-- 5. Funciones auxiliares (las usan las políticas y los triggers)
-- ---------------------------------------------------------------------

-- Sistema = quien no es anon ni authenticated. SECURITY INVOKER a propósito:
-- dentro de una SECURITY DEFINER current_user sería el dueño.
create or replace function privado.es_sistema()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user not in ('anon', 'authenticated')
$$;

create or replace function privado.es_equipo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.miembros_equipo m
     where m.id = (select auth.uid())
       and m.activo
  )
$$;

create or replace function privado.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.miembros_equipo m
     where m.id = (select auth.uid())
       and m.activo
       and m.rol = 'administrador'
  )
$$;

create or replace function privado.es_equipo_o_sistema()
returns boolean
language sql
stable
set search_path = ''
as $$
  select privado.es_sistema() or privado.es_equipo()
$$;

-- Devuelve cuáles de las columnas indicadas cambiaron entre old y new.
create or replace function privado.columnas_cambiadas(p_nuevo jsonb, p_viejo jsonb, p_columnas text[])
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(c order by c), '{}'::text[])
    from unnest(p_columnas) as c
   where p_nuevo -> c is distinct from p_viejo -> c
$$;


-- ---------------------------------------------------------------------
-- 6. Funciones de triggers
-- ---------------------------------------------------------------------

-- 6.1 auth.users -> cuentas. Crea la cuenta al registrarse y sigue los
-- cambios de número. Nunca rompe el registro: si algo falla, deja un aviso.
create or replace function privado.sincronizar_cuenta_desde_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_celular     text;
  v_verificado  timestamptz;
begin
  if new.phone is null or btrim(new.phone) = '' then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.phone is not distinct from old.phone then
    -- Mismo número: solo interesa cuando se confirma el código.
    if new.phone_confirmed_at is null
       or new.phone_confirmed_at is not distinct from old.phone_confirmed_at then
      return new;
    end if;
    v_verificado := new.phone_confirmed_at;
  elsif tg_op = 'UPDATE' and new.phone_confirmed_at is not distinct from old.phone_confirmed_at then
    -- Número nuevo sin fecha de confirmación nueva: se confirmó ahora.
    v_verificado := now();
  else
    v_verificado := coalesce(new.phone_confirmed_at, now());
  end if;

  v_celular := btrim(new.phone);
  if left(v_celular, 1) <> '+' then
    v_celular := '+' || v_celular;
  end if;

  begin
    insert into public.cuentas as c (id, celular, celular_verificado_en)
    values (new.id, v_celular, v_verificado)
    on conflict (id) do update
       set celular               = excluded.celular,
           celular_verificado_en = excluded.celular_verificado_en
     where c.celular is distinct from excluded.celular
        or c.celular_verificado_en is distinct from excluded.celular_verificado_en;
  exception when others then
    raise warning 'Dale Contacto: no se pudo crear o actualizar la cuenta del usuario % (%: %)',
      new.id, sqlstate, sqlerrm;
  end;

  return new;
end;
$$;

-- 6.2 Mantiene actualizado_en.
create or replace function privado.poner_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- 6.3 cuentas: la persona no cambia lo que escribe el sistema.
create or replace function privado.cuentas_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_cambios text[];
begin
  if not privado.es_equipo_o_sistema() then
    v_cambios := privado.columnas_cambiadas(
      to_jsonb(new), to_jsonb(old),
      array['id', 'celular', 'celular_verificado_en', 'email_confirmado_en', 'estado', 'creado_en']);
    if cardinality(v_cambios) > 0 then
      raise exception 'No puedes cambiar: %', array_to_string(v_cambios, ', ')
        using errcode = '42501';
    end if;
  end if;

  -- Un correo nuevo queda sin confirmar (salvo que el sistema lo confirme a la vez).
  if not privado.es_sistema()
     and new.email is distinct from old.email
     and new.email_confirmado_en is not distinct from old.email_confirmado_en then
    new.email_confirmado_en := null;
  end if;

  return new;
end;
$$;

-- 6.4 miembros_equipo: quién agregó y cuándo lo pone el servidor.
create or replace function privado.miembros_equipo_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_cambios text[];
begin
  if privado.es_sistema() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.creado_por := (select auth.uid());
    new.creado_en  := now();
    return new;
  end if;

  v_cambios := privado.columnas_cambiadas(
    to_jsonb(new), to_jsonb(old), array['id', 'creado_por', 'creado_en']);
  if cardinality(v_cambios) > 0 then
    raise exception 'No puedes cambiar: %', array_to_string(v_cambios, ', ')
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- 6.5 ajustes: quién cambió y cuándo lo pone el servidor.
create or replace function privado.ajustes_registrar_cambio()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  if not privado.es_sistema() then
    new.actualizado_por := (select auth.uid());
  end if;
  return new;
end;
$$;

-- 6.6 textos_autorizacion: un texto ya aceptado no cambia de contenido (se
-- crea una versión nueva) y vigente_desde lo pone el servidor.
create or replace function privado.textos_autorizacion_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_cambios text[];
begin
  if tg_op = 'INSERT' then
    if not privado.es_sistema() then
      new.vigente_desde := case when new.vigente then now() end;
    end if;
    return new;
  end if;

  v_cambios := privado.columnas_cambiadas(
    to_jsonb(new), to_jsonb(old),
    array['id', 'clave', 'nombre', 'texto', 'enlace', 'version', 'para_quien', 'obligatoria']);
  if cardinality(v_cambios) > 0 and exists (
    select 1 from public.consentimientos c where c.texto_autorizacion_id = old.id
  ) then
    raise exception 'Este texto ya fue aceptado; para cambiarlo crea una versión nueva.'
      using errcode = '42501';
  end if;

  if not privado.es_sistema() then
    new.vigente_desde := case
      when new.vigente and not old.vigente then now()
      else old.vigente_desde
    end;
  end if;
  return new;
end;
$$;

-- 6.7 consentimientos: fechas del servidor; solo se puede retirar una vez.
create or replace function privado.consentimientos_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_cambios text[];
begin
  if privado.es_equipo_o_sistema() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.aceptado_en := now();
    new.revocado_en := null;
    return new;
  end if;

  v_cambios := privado.columnas_cambiadas(
    to_jsonb(new), to_jsonb(old), array['id', 'cuenta_id', 'texto_autorizacion_id', 'aceptado_en']);
  if cardinality(v_cambios) > 0 then
    raise exception 'Una autorización no se modifica; solo se puede retirar.'
      using errcode = '42501';
  end if;

  if new.revocado_en is distinct from old.revocado_en then
    if old.revocado_en is not null then
      raise exception 'Esta autorización ya fue retirada. Para aceptarla de nuevo se agrega otra.'
        using errcode = '42501';
    end if;
    new.revocado_en := now();
  end if;
  return new;
end;
$$;

-- 6.8 conductores: estados y fechas los escribe el sistema.
create or replace function privado.conductores_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_cambios text[];
begin
  if privado.es_equipo_o_sistema() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.estado_perfil       := 'incompleto';
    new.perfil_completo_en  := null;
    new.estado_verificacion := 'sin_documentos';
    new.creado_en           := now();
    new.actualizado_en      := now();
    if new.disponibilidad_confirmada_en is not null then
      new.disponibilidad_confirmada_en := now();
    end if;
    return new;
  end if;

  v_cambios := privado.columnas_cambiadas(
    to_jsonb(new), to_jsonb(old),
    array['id', 'estado_perfil', 'perfil_completo_en', 'estado_verificacion', 'creado_en']);
  if cardinality(v_cambios) > 0 then
    raise exception 'No puedes cambiar: %', array_to_string(v_cambios, ', ')
      using errcode = '42501';
  end if;

  -- "¿Sigues buscando vehículo?": la fecha de la respuesta la pone el servidor.
  if new.disponibilidad_confirmada_en is distinct from old.disponibilidad_confirmada_en then
    new.disponibilidad_confirmada_en := now();
  end if;
  return new;
end;
$$;

-- 6.9 conductores.tramo_garantia_id: solo opciones de la lista tramo_garantia
-- (que no se carga: queda bloqueado mientras la garantía esté en espera).
create or replace function privado.conductores_validar_garantia()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.tramo_garantia_id is not null and not exists (
    select 1
      from public.opciones o
      join public.listas l on l.id = o.lista_id
     where o.id = new.tramo_garantia_id
       and l.clave = 'tramo_garantia'
  ) then
    raise exception 'El tramo de garantía no es válido.' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- 6.10 conductor_negocios: negocio activo (con industria activa) y que alguna
-- clase declarada del conductor lo habilite. Lo ya guardado se conserva si
-- después se apaga el negocio.
create or replace function privado.conductor_negocios_validar()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_disponible boolean;
  v_pregunta   jsonb;
  v_codigos    text[];
begin
  if privado.es_equipo_o_sistema() then
    return new;
  end if;

  select n.activo and i.activo, n.pregunta_vehiculo
    into v_disponible, v_pregunta
    from public.negocios n
    join public.industrias i on i.id = n.industria_id
   where n.id = new.negocio_id;

  if not coalesce(v_disponible, false) then
    raise exception 'Ese negocio no está disponible.' using errcode = '23514';
  end if;

  -- Clases que aceptan el negocio o alguna respuesta de su pregunta.
  select coalesce(array_agg(distinct s.codigo), '{}'::text[])
    into v_codigos
    from (
      select cl.codigo
        from public.negocio_clases_licencia ncl
        join public.clases_licencia cl on cl.id = ncl.clase_licencia_id
       where ncl.negocio_id = new.negocio_id
      union
      select r #>> '{}'
        from jsonb_path_query(v_pregunta, 'lax $.respuestas[*].clases[*]') as r
    ) as s;

  if not exists (
    select 1
      from public.conductor_licencias dl
      join public.clases_licencia c on c.id = dl.clase_licencia_id
     where dl.conductor_id = new.conductor_id
       and dl.origen = 'declarada'
       and (c.codigo = any (v_codigos)
            or (c.habilita_clase_b and 'B' = any (v_codigos)))
  ) then
    raise exception 'Tu licencia no habilita para ese negocio.' using errcode = '23514';
  end if;

  return new;
end;
$$;

-- 6.11 conductor_opciones: solo turnos y días (el modo de contrato está en
-- espera) y solo opciones activas.
create or replace function privado.conductor_opciones_validar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if privado.es_equipo_o_sistema() then
    return new;
  end if;

  if not exists (
    select 1
      from public.opciones o
      join public.listas l on l.id = o.lista_id
     where o.id = new.opcion_id
       and o.activa
       and l.clave in ('turno', 'dia_semana')
  ) then
    raise exception 'Esa opción no se puede elegir.' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- 6.12 experiencia_conductor: la fecha la pone el servidor.
create or replace function privado.experiencia_conductor_al_insertar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not privado.es_equipo_o_sistema() then
    new.actualizado_en := now();
  end if;
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 7. Triggers
-- ---------------------------------------------------------------------
create or replace trigger dale_contacto_sincronizar_cuenta
  after insert or update of phone, phone_confirmed_at on auth.users
  for each row execute function privado.sincronizar_cuenta_desde_auth();

create trigger proteger before update on public.cuentas
  for each row execute function privado.cuentas_proteger();

create trigger proteger before insert or update on public.miembros_equipo
  for each row execute function privado.miembros_equipo_proteger();

create trigger registrar_cambio before insert or update on public.ajustes
  for each row execute function privado.ajustes_registrar_cambio();

create trigger proteger before insert or update on public.textos_autorizacion
  for each row execute function privado.textos_autorizacion_proteger();

create trigger proteger before insert or update on public.consentimientos
  for each row execute function privado.consentimientos_proteger();

create trigger proteger before insert or update on public.conductores
  for each row execute function privado.conductores_proteger();
create trigger validar_garantia before insert or update of tramo_garantia_id on public.conductores
  for each row execute function privado.conductores_validar_garantia();
create trigger actualizado_en before update on public.conductores
  for each row execute function privado.poner_actualizado_en();

-- También en UPDATE, para que no se pueda saltar la validación cambiando la fila.
create trigger validar before insert or update on public.conductor_negocios
  for each row execute function privado.conductor_negocios_validar();

create trigger validar before insert or update on public.conductor_opciones
  for each row execute function privado.conductor_opciones_validar();

create trigger al_insertar before insert on public.experiencia_conductor
  for each row execute function privado.experiencia_conductor_al_insertar();
create trigger actualizado_en before update on public.experiencia_conductor
  for each row execute function privado.poner_actualizado_en();


-- ---------------------------------------------------------------------
-- 8. Permisos de funciones
-- ---------------------------------------------------------------------
revoke all on all functions in schema privado from public, anon, authenticated, service_role;
-- Las usan las políticas y los triggers que corren con el rol de quien escribe.
grant execute on function
  privado.es_sistema(),
  privado.es_equipo(),
  privado.es_admin(),
  privado.es_equipo_o_sistema(),
  privado.columnas_cambiadas(jsonb, jsonb, text[])
  to anon, authenticated, service_role;


-- ---------------------------------------------------------------------
-- 9. RLS y permisos de tablas
-- ---------------------------------------------------------------------

-- 9.1 Catálogos: todos leen; solo un administrador escribe.
do $$
declare
  t text;
begin
  foreach t in array array[
    'regiones', 'zonas', 'comunas', 'clases_licencia', 'industrias',
    'tamanos_vehiculo', 'negocios', 'negocio_clases_licencia',
    'negocio_tamanos', 'listas', 'opciones'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated, service_role', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on table public.%I to authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
    execute format('create policy leer on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy agregar_admin on public.%I for insert to authenticated
                      with check ((select privado.es_admin()))', t);
    execute format('create policy cambiar_admin on public.%I for update to authenticated
                      using ((select privado.es_admin())) with check ((select privado.es_admin()))', t);
    execute format('create policy borrar_admin on public.%I for delete to authenticated
                      using ((select privado.es_admin()))', t);
  end loop;
end
$$;

-- 9.2 Tablas de personas y ajustes: nada para anon; permisos mínimos para authenticated.
do $$
declare
  t text;
begin
  foreach t in array array[
    'ajustes', 'textos_autorizacion', 'cuentas', 'miembros_equipo', 'consentimientos',
    'conductores', 'conductor_licencias', 'conductor_negocios', 'conductor_opciones',
    'experiencia_conductor'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated, service_role', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end
$$;

-- ajustes: el equipo lee; un administrador escribe.
grant select, insert, update, delete on table public.ajustes to authenticated;
create policy leer_equipo on public.ajustes for select to authenticated
  using ((select privado.es_equipo()));
create policy agregar_admin on public.ajustes for insert to authenticated
  with check ((select privado.es_admin()));
create policy cambiar_admin on public.ajustes for update to authenticated
  using ((select privado.es_admin())) with check ((select privado.es_admin()));
create policy borrar_admin on public.ajustes for delete to authenticated
  using ((select privado.es_admin()));

-- textos_autorizacion: todos leen la versión vigente; el equipo ve todas; un administrador escribe.
grant select on table public.textos_autorizacion to anon;
grant select, insert, update, delete on table public.textos_autorizacion to authenticated;
create policy leer on public.textos_autorizacion for select to anon, authenticated
  using (vigente or (select privado.es_equipo()));
create policy agregar_admin on public.textos_autorizacion for insert to authenticated
  with check ((select privado.es_admin()));
create policy cambiar_admin on public.textos_autorizacion for update to authenticated
  using ((select privado.es_admin())) with check ((select privado.es_admin()));
create policy borrar_admin on public.textos_autorizacion for delete to authenticated
  using ((select privado.es_admin()));

-- cuentas: la propia o el equipo. Se crean solas (trigger) y no se borran desde la app.
grant select, update on table public.cuentas to authenticated;
create policy leer on public.cuentas for select to authenticated
  using (id = (select auth.uid()) or (select privado.es_equipo()));
create policy cambiar on public.cuentas for update to authenticated
  using (id = (select auth.uid()) or (select privado.es_equipo()))
  with check (id = (select auth.uid()) or (select privado.es_equipo()));

-- miembros_equipo: el equipo lee; un administrador escribe, pero nunca su propia fila.
grant select, insert, update, delete on table public.miembros_equipo to authenticated;
create policy leer_equipo on public.miembros_equipo for select to authenticated
  using ((select privado.es_equipo()));
create policy agregar_admin on public.miembros_equipo for insert to authenticated
  with check ((select privado.es_admin()) and id <> (select auth.uid()));
create policy cambiar_admin on public.miembros_equipo for update to authenticated
  using ((select privado.es_admin()) and id <> (select auth.uid()))
  with check ((select privado.es_admin()) and id <> (select auth.uid()));
create policy borrar_admin on public.miembros_equipo for delete to authenticated
  using ((select privado.es_admin()) and id <> (select auth.uid()));

-- consentimientos: los propios o el equipo; se agregan solo para uno mismo y
-- sobre un texto vigente; se retiran (trigger); no se borran.
grant select, insert, update on table public.consentimientos to authenticated;
create policy leer on public.consentimientos for select to authenticated
  using (cuenta_id = (select auth.uid()) or (select privado.es_equipo()));
create policy agregar_propio on public.consentimientos for insert to authenticated
  with check (
    cuenta_id = (select auth.uid())
    and exists (
      select 1 from public.textos_autorizacion t
       where t.id = texto_autorizacion_id and t.vigente
    )
  );
create policy retirar_propio on public.consentimientos for update to authenticated
  using (cuenta_id = (select auth.uid()))
  with check (cuenta_id = (select auth.uid()));

-- conductores: el propio o el equipo; no se borran desde la app.
grant select, insert, update on table public.conductores to authenticated;
create policy leer on public.conductores for select to authenticated
  using (id = (select auth.uid()) or (select privado.es_equipo()));
create policy agregar_propio on public.conductores for insert to authenticated
  with check (id = (select auth.uid()));
create policy cambiar on public.conductores for update to authenticated
  using (id = (select auth.uid()) or (select privado.es_equipo()))
  with check (id = (select auth.uid()) or (select privado.es_equipo()));

-- conductor_licencias: el conductor agrega y quita solo las declaradas propias;
-- las revisadas solo el equipo. Sin UPDATE (no se puede pasar de declarada a revisada).
grant select, insert, delete on table public.conductor_licencias to authenticated;
create policy leer on public.conductor_licencias for select to authenticated
  using (conductor_id = (select auth.uid()) or (select privado.es_equipo()));
create policy agregar on public.conductor_licencias for insert to authenticated
  with check ((conductor_id = (select auth.uid()) and origen = 'declarada') or (select privado.es_equipo()));
create policy quitar on public.conductor_licencias for delete to authenticated
  using ((conductor_id = (select auth.uid()) and origen = 'declarada') or (select privado.es_equipo()));

-- conductor_negocios y conductor_opciones: el conductor agrega y quita las suyas;
-- el equipo ve todo. Sin UPDATE (son solo pares; se quita y se agrega).
grant select, insert, delete on table public.conductor_negocios to authenticated;
create policy leer on public.conductor_negocios for select to authenticated
  using (conductor_id = (select auth.uid()) or (select privado.es_equipo()));
create policy agregar_propio on public.conductor_negocios for insert to authenticated
  with check (conductor_id = (select auth.uid()));
create policy quitar_propio on public.conductor_negocios for delete to authenticated
  using (conductor_id = (select auth.uid()));

grant select, insert, delete on table public.conductor_opciones to authenticated;
create policy leer on public.conductor_opciones for select to authenticated
  using (conductor_id = (select auth.uid()) or (select privado.es_equipo()));
create policy agregar_propio on public.conductor_opciones for insert to authenticated
  with check (conductor_id = (select auth.uid()));
create policy quitar_propio on public.conductor_opciones for delete to authenticated
  using (conductor_id = (select auth.uid()));

-- experiencia_conductor: el conductor maneja la suya; el equipo ve todo.
grant select, insert, update, delete on table public.experiencia_conductor to authenticated;
create policy leer on public.experiencia_conductor for select to authenticated
  using (conductor_id = (select auth.uid()) or (select privado.es_equipo()));
create policy agregar_propio on public.experiencia_conductor for insert to authenticated
  with check (conductor_id = (select auth.uid()));
create policy cambiar_propio on public.experiencia_conductor for update to authenticated
  using (conductor_id = (select auth.uid()))
  with check (conductor_id = (select auth.uid()));
create policy quitar_propio on public.experiencia_conductor for delete to authenticated
  using (conductor_id = (select auth.uid()));

-- 9.3 Secuencias de las columnas identity: nadie de la app las necesita
-- (insertar en una columna identity no pide permiso sobre la secuencia).
do $$
declare
  t text;
begin
  foreach t in array array[
    'regiones', 'zonas', 'comunas', 'clases_licencia', 'industrias', 'tamanos_vehiculo',
    'negocios', 'listas', 'opciones', 'textos_autorizacion', 'consentimientos',
    'experiencia_conductor'
  ] loop
    execute format('revoke all on sequence %s from anon, authenticated',
                   pg_get_serial_sequence('public.' || t, 'id'));
  end loop;
end
$$;

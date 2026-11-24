-- =====================================================================
-- Dale Contacto · Documentos del conductor (Paso 5), decidido el 24-nov.
--
-- QUÉ SE DECIDIÓ (Daniela, 24-nov):
--   * Se piden los 4 documentos: cédula, licencia, Hoja de Vida del
--     Conductor y certificado de antecedentes para fines especiales.
--   * Los revisa un "método de validación" que corre en la base. Su detalle
--     (IA, persona del equipo…) se define después; POR AHORA aprueba todo lo
--     que se sube. Es una pieza aparte: se cambia con el ajuste
--     metodo_validacion_documentos o reemplazando la función
--     privado.validar_documento, sin tocar la app.
--   * Los archivos se guardan en un espacio PRIVADO de Storage mientras la
--     cuenta esté activa; cuando un documento vence, se sube uno nuevo y el
--     anterior queda "reemplazado" (su archivo se puede borrar).
--   * La fecha de vencimiento (cédula, licencia) y la de emisión (Hoja de
--     Vida, antecedentes) quedan guardadas para avisar 3 meses antes
--     (meses_aviso_vencimiento_documentos). Hoy las anota la persona al
--     subir; fechas_anotadas_por deja listo que después las lea el método.
--   * Con los pasos 1, 2 y 4 listos y los documentos obligatorios aprobados
--     y vigentes, el perfil pasa a 'completo' (lo calcula la base).
--
-- QUÉ CREA:
--   1. tipos_documento (catálogo configurable, con los 4 del conductor).
--   2. documentos y revisiones_documento.
--   3. Ajustes: metodo_validacion_documentos = 'aprobar_todo' (solo equipo)
--      y meses_aviso_vencimiento_documentos = 3 (lo lee la app).
--   4. El método de validación, los estados del perfil y los vencimientos.
--   5. El espacio privado 'documentos' de Storage y sus políticas.
--   6. La autorización "Revisión de mis documentos" vigente (si no hay).
--   7. La tarea diaria que marca los documentos vencidos (si hay pg_cron).
--
-- [verificar con abogado, P1]: guardar los documentos mientras la cuenta
-- esté activa, la aprobación automática y los datos de antecedentes
-- (Ley 21.719 art. 25). Ver docs/terminos-y-privacidad.md.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tipos de documento
-- ---------------------------------------------------------------------
create table public.tipos_documento (
  id                     bigint generated always as identity primary key,
  clave                  text not null unique check (clave ~ '^[a-z_]+$'),
  nombre                 text not null,
  corto                  text not null,
  ayuda                  text,
  para_quien             text not null check (para_quien in ('conductor', 'titular', 'titular_empresa')),
  obligatorio            boolean not null default true,
  formato                text not null check (formato in ('foto', 'pdf')),
  fecha_pedida           text not null default 'ninguna' check (fecha_pedida in ('vencimiento', 'emision', 'ninguna')),
  etiqueta_fecha         text,
  antiguedad_maxima_dias integer check (antiguedad_maxima_dias > 0),
  renovar_cada_meses     integer check (renovar_cada_meses > 0),
  enlace_obtener         text,
  orden                  integer not null default 0,
  activo                 boolean not null default true,
  check (fecha_pedida = 'ninguna' or etiqueta_fecha is not null)
);
comment on table public.tipos_documento is 'Documentos que se piden y sus reglas. Se cambian desde el panel; se desactivan en vez de borrarse.';
comment on column public.tipos_documento.fecha_pedida is 'Qué fecha se anota al subirlo: vencimiento (cédula, próximo control de la licencia), emision (PDF del Registro Civil) o ninguna.';
comment on column public.tipos_documento.antiguedad_maxima_dias is 'PDF emitido hace N días o menos (propuesta 30, P16 pendiente). Vacío = no aplica.';
comment on column public.tipos_documento.renovar_cada_meses is 'Cada cuánto se vuelve a pedir un documento con fecha de emisión (vence = emisión + N meses). Vacío = no vence (pendiente, MD18).';

insert into public.tipos_documento
  (clave, nombre, corto, ayuda, para_quien, obligatorio, formato, fecha_pedida, etiqueta_fecha, antiguedad_maxima_dias, renovar_cada_meses, enlace_obtener, orden)
values
  ('cedula', 'Cédula de identidad', 'Cédula', 'Foto del frente',
   'conductor', true, 'foto', 'vencimiento', 'Fecha de vencimiento', null, null, null, 1),
  ('licencia', 'Licencia de conducir', 'Licencia', 'Foto donde se vean las clases',
   'conductor', true, 'foto', 'vencimiento', 'Fecha del próximo control', null, null, null, 2),
  ('hoja_vida', 'Hoja de Vida del Conductor', 'Hoja de Vida', 'PDF del Registro Civil, de 30 días o menos',
   'conductor', true, 'pdf', 'emision', 'Fecha de emisión', 30, null, 'https://www.registrocivil.cl', 3),
  ('antecedentes', 'Certificado de antecedentes', 'Antecedentes', 'Para fines especiales, PDF de 30 días o menos',
   'conductor', true, 'pdf', 'emision', 'Fecha de emisión', 30, null, 'https://www.registrocivil.cl', 4);


-- ---------------------------------------------------------------------
-- 2. Documentos y revisiones
-- ---------------------------------------------------------------------
create table public.documentos (
  id                       bigint generated always as identity primary key,
  -- Se borran con la cuenta (se guardan mientras la cuenta esté activa).
  cuenta_id                uuid not null references public.cuentas (id) on delete cascade,
  tipo_documento_id        bigint not null references public.tipos_documento (id),
  archivo_ruta             text not null unique,
  archivo_tipo             text not null,
  archivo_bytes            integer check (archivo_bytes > 0),
  estado                   text not null default 'en_revision'
                           check (estado in ('en_revision', 'aprobado', 'no_aprobado', 'vencido', 'reemplazado')),
  subido_en                timestamptz not null default now(),
  emitido_en               date,
  vence_en                 date,
  fechas_anotadas_por      text not null default 'persona' check (fechas_anotadas_por in ('persona', 'metodo', 'equipo')),
  revisado_en              timestamptz,
  aprobado_automaticamente boolean not null default false,
  motivo_rechazo_id        bigint references public.opciones (id),
  aviso_vencimiento_en     timestamptz
);
comment on table public.documentos is 'Cada documento que sube una persona y su estado. Cada subida es una fila nueva; la anterior del mismo tipo queda reemplazada.';
comment on column public.documentos.archivo_ruta is 'Ruta en el espacio privado documentos de Storage: <id de la cuenta>/<uuid>.<ext>. Solo la persona y (después, desde el panel) el equipo lo abren.';
comment on column public.documentos.estado is 'en_revision (esperando al método de validación), aprobado, no_aprobado, vencido (pasó vence_en) o reemplazado (hay uno más nuevo). Lo cambian solo el sistema y el método.';
comment on column public.documentos.vence_en is 'Vencimiento de la cédula, próximo control de la licencia, o emisión + renovar_cada_meses. El titular no lo ve.';
comment on column public.documentos.fechas_anotadas_por is 'Quién anotó emitido_en y vence_en: hoy la persona al subirlo; después, el método que lee el documento.';
comment on column public.documentos.aviso_vencimiento_en is 'Cuándo se le avisó por WhatsApp o correo que vence (lo anota quien envíe el aviso; dentro de la app el aviso se calcula solo).';

create index documentos_cuenta_tipo_idx on public.documentos (cuenta_id, tipo_documento_id, subido_en desc);
create index documentos_tipo_documento_id_idx on public.documentos (tipo_documento_id);
create index documentos_motivo_rechazo_id_idx on public.documentos (motivo_rechazo_id);
create index documentos_vence_en_idx on public.documentos (vence_en) where estado = 'aprobado';

create table public.revisiones_documento (
  id              bigint generated always as identity primary key,
  documento_id    bigint not null references public.documentos (id) on delete cascade,
  etapa           text not null check (etapa in ('automatica', 'persona', 'segunda')),
  resultado       text not null check (resultado in ('aprobar', 'dudas', 'no_aprobar')),
  metodo          text not null,
  motivo_id       bigint references public.opciones (id),
  detalle         text,
  revisor_id      uuid references public.cuentas (id) on delete set null,
  version_sistema text,
  creado_en       timestamptz not null default now()
);
comment on table public.revisiones_documento is 'Cada revisión de cada documento, en orden. Nunca se modifica. Hoy: la aprobación automática provisoria.';
comment on column public.revisiones_documento.metodo is 'Qué método revisó: aprobacion_automatica_provisoria (hoy), ia, equipo…';
create index revisiones_documento_documento_id_idx on public.revisiones_documento (documento_id);
create index revisiones_documento_motivo_id_idx on public.revisiones_documento (motivo_id);
create index revisiones_documento_revisor_id_idx on public.revisiones_documento (revisor_id);


-- ---------------------------------------------------------------------
-- 3. Ajustes
-- ---------------------------------------------------------------------
insert into public.ajustes (id, valor, descripcion, publico) values
  ('metodo_validacion_documentos', '"aprobar_todo"'::jsonb,
   'Cómo se revisan los documentos que se suben: aprobar_todo (provisorio, decidido el 24-nov: aprueba todo) o equipo (quedan en revisión para el equipo).',
   false),
  ('meses_aviso_vencimiento_documentos', '3'::jsonb,
   'Cuántos meses antes de que venza un documento (cédula, licencia…) se le avisa al conductor (decidido el 24-nov).',
   true);


-- ---------------------------------------------------------------------
-- 4. Funciones
-- ---------------------------------------------------------------------

-- 4.1 Al subir (antes de guardar): la persona solo anota el archivo y sus
-- fechas; el estado y las fechas del servidor los pone la base. Revisa que
-- el archivo sea suyo y del formato pedido, que haya aceptado la revisión
-- de documentos y que las fechas tengan sentido. SECURITY INVOKER a
-- propósito (usa privado.es_sistema()).
create or replace function privado.documentos_proteger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_hoy   date := (now() at time zone 'America/Santiago')::date;
  v_tipo  public.tipos_documento;
  v_texto bigint;
  v_meta  jsonb;
begin
  if privado.es_sistema() then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    raise exception 'Un documento subido no se modifica; sube uno nuevo.' using errcode = '42501';
  end if;
  -- Lo mismo que la política subir_propio, antes de revisar nada más.
  if new.cuenta_id is distinct from (select auth.uid()) then
    raise exception 'new row violates row-level security policy for table "documentos"' using errcode = '42501';
  end if;

  new.estado                   := 'en_revision';
  new.subido_en                := now();
  new.fechas_anotadas_por      := 'persona';
  new.revisado_en              := null;
  new.aprobado_automaticamente := false;
  new.motivo_rechazo_id        := null;
  new.aviso_vencimiento_en     := null;

  select * into v_tipo from public.tipos_documento t where t.id = new.tipo_documento_id;
  if v_tipo.id is null or not v_tipo.activo then
    raise exception 'Ese documento ya no se pide. Vuelve a abrir la pantalla.' using errcode = '23514';
  end if;
  if v_tipo.para_quien = 'conductor'
     and not exists (select 1 from public.conductores c where c.id = new.cuenta_id) then
    raise exception 'Primero guarda tus datos (Paso 1).' using errcode = '23514';
  end if;

  -- "Revisión de mis documentos": si hay un texto vigente, tiene que estar aceptado.
  select t.id into v_texto
    from public.textos_autorizacion t
   where t.clave = 'revision_documentos' and t.vigente
     and t.para_quien in (case when v_tipo.para_quien = 'conductor' then 'conductor' else 'titular' end, 'todos')
   limit 1;
  if v_texto is not null and not exists (
    select 1 from public.consentimientos c
     where c.cuenta_id = new.cuenta_id and c.texto_autorizacion_id = v_texto and c.revocado_en is null
  ) then
    raise exception 'Primero acepta la revisión de tus documentos.' using errcode = '23514';
  end if;

  -- El archivo: en su carpeta del espacio documentos, ya subido y del formato pedido.
  if new.archivo_ruta is null or split_part(new.archivo_ruta, '/', 1) <> new.cuenta_id::text then
    raise exception 'No encontramos el archivo. Vuelve a subirlo.' using errcode = '23514';
  end if;
  select o.metadata into v_meta
    from storage.objects o
   where o.bucket_id = 'documentos' and o.name = new.archivo_ruta and o.owner_id = new.cuenta_id::text;
  if not found then
    raise exception 'No encontramos el archivo. Vuelve a subirlo.' using errcode = '23514';
  end if;
  if v_meta ? 'mimetype' and nullif(v_meta ->> 'mimetype', '') is not null then
    new.archivo_tipo := v_meta ->> 'mimetype';
  end if;
  if v_meta ? 'size' and (v_meta ->> 'size') ~ '^\d+$' then
    new.archivo_bytes := (v_meta ->> 'size')::integer;
  end if;
  if v_tipo.formato = 'pdf' and new.archivo_tipo is distinct from 'application/pdf' then
    raise exception 'Sube el documento en PDF.' using errcode = '23514';
  end if;
  if v_tipo.formato = 'foto' and coalesce(new.archivo_tipo, '') not in ('image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif') then
    raise exception 'Sube una foto (JPG o PNG).' using errcode = '23514';
  end if;

  -- Las fechas.
  if v_tipo.fecha_pedida = 'vencimiento' then
    new.emitido_en := null;
    if new.vence_en is null then
      raise exception 'Anota la fecha de vencimiento.' using errcode = '23514';
    end if;
    if new.vence_en < v_hoy then
      raise exception 'Ese documento ya venció. Sube uno vigente.' using errcode = '23514';
    end if;
    if new.vence_en > v_hoy + interval '20 years' then
      raise exception 'Revisa la fecha.' using errcode = '23514';
    end if;
  elsif v_tipo.fecha_pedida = 'emision' then
    if new.emitido_en is null then
      raise exception 'Anota la fecha de emisión.' using errcode = '23514';
    end if;
    if new.emitido_en > v_hoy then
      raise exception 'La fecha de emisión no puede ser futura.' using errcode = '23514';
    end if;
    if v_tipo.antiguedad_maxima_dias is not null and new.emitido_en < v_hoy - v_tipo.antiguedad_maxima_dias then
      raise exception 'Debe tener % días o menos. Saca uno nuevo.', v_tipo.antiguedad_maxima_dias using errcode = '23514';
    end if;
    new.vence_en := case
      when v_tipo.renovar_cada_meses is null then null
      else (new.emitido_en + make_interval(months => v_tipo.renovar_cada_meses))::date
    end;
  else
    new.emitido_en := null;
    new.vence_en   := null;
  end if;
  return new;
end;
$$;

-- 4.2 EL MÉTODO DE VALIDACIÓN. Pieza aparte y reemplazable: decide qué pasa
-- con un documento recién subido según el ajuste metodo_validacion_documentos.
--   'aprobar_todo' (provisorio, 24-nov): lo aprueba y deja la revisión como
--                  "aprobación automática provisoria".
--   cualquier otro valor (por ejemplo 'equipo'): no decide; el documento
--                  queda en revisión para el equipo (o para el método que venga).
-- Para cambiar de método: cambiar el ajuste desde el panel, o reemplazar
-- esta función con una migración. La app solo muestra el estado.
create or replace function privado.validar_documento(p_documento bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_metodo text;
begin
  select a.valor #>> '{}' into v_metodo from public.ajustes a where a.id = 'metodo_validacion_documentos';
  if v_metodo = 'aprobar_todo' then
    insert into public.revisiones_documento (documento_id, etapa, resultado, metodo, version_sistema)
    values (p_documento, 'automatica', 'aprobar', 'aprobacion_automatica_provisoria', 'aprobar_todo-1');
    update public.documentos
       set estado = 'aprobado', revisado_en = now(), aprobado_automaticamente = true
     where id = p_documento and estado = 'en_revision';
  end if;
end;
$$;

-- 4.3 Estado del perfil y de la verificación de un conductor.
--   estado_verificacion: verificado (todos los obligatorios aprobados y
--     vigentes), con_observaciones (el último de alguno no fue aprobado o
--     venció), en_revision (alguno espera revisión) o sin_documentos.
--   estado_perfil: completo con los pasos 1, 2 y 4 listos y verificado
--     (el Paso 3 es opcional). Mismas reglas que la app (app-real/src/datos/perfil.ts).
create or replace function privado.recalcular_conductor(p_conductor uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hoy       date := (now() at time zone 'America/Santiago')::date;
  v_datos     boolean;
  v_direccion boolean;
  v_trabajo   boolean;
  v_total     integer;
  v_ok        integer;
  v_obs       integer;
  v_rev       integer;
  v_verif     text;
  v_perfil    text;
begin
  select d.comuna_id is not null and d.tiene_estacionamiento is not null
    into v_direccion
    from public.conductores d where d.id = p_conductor;
  if not found then
    return;
  end if;

  select nullif(btrim(c.nombres), '') is not null
     and nullif(btrim(c.primer_apellido), '') is not null
     and nullif(btrim(c.email), '') is not null
    into v_datos
    from public.cuentas c where c.id = p_conductor;
  v_datos := coalesce(v_datos, false) and exists (
    select 1 from public.conductor_licencias l where l.conductor_id = p_conductor and l.origen = 'declarada');

  v_trabajo := exists (select 1 from public.conductor_negocios n where n.conductor_id = p_conductor)
    and exists (select 1 from public.conductor_opciones co
                  join public.opciones o on o.id = co.opcion_id
                  join public.listas l on l.id = o.lista_id
                 where co.conductor_id = p_conductor and l.clave = 'turno')
    and exists (select 1 from public.conductor_opciones co
                  join public.opciones o on o.id = co.opcion_id
                  join public.listas l on l.id = o.lista_id
                 where co.conductor_id = p_conductor and l.clave = 'dia_semana');

  with tipos as (
    select t.id from public.tipos_documento t
     where t.activo and t.obligatorio and t.para_quien = 'conductor'
  ), por_tipo as (
    select exists (
             select 1 from public.documentos d
              where d.cuenta_id = p_conductor and d.tipo_documento_id = t.id
                and d.estado = 'aprobado' and (d.vence_en is null or d.vence_en >= v_hoy)
           ) as ok,
           (select d.estado from public.documentos d
             where d.cuenta_id = p_conductor and d.tipo_documento_id = t.id and d.estado <> 'reemplazado'
             order by d.subido_en desc, d.id desc limit 1) as ultimo
      from tipos t
  )
  select count(*),
         count(*) filter (where ok),
         count(*) filter (where not ok and ultimo in ('no_aprobado', 'vencido', 'aprobado')),
         count(*) filter (where not ok and ultimo = 'en_revision')
    into v_total, v_ok, v_obs, v_rev
    from por_tipo;

  v_verif := case
    when v_ok = v_total then 'verificado'
    when v_obs > 0 then 'con_observaciones'
    when v_rev > 0 then 'en_revision'
    else 'sin_documentos'
  end;
  v_perfil := case when v_datos and v_direccion and v_trabajo and v_verif = 'verificado' then 'completo' else 'incompleto' end;

  update public.conductores d
     set estado_verificacion = v_verif,
         estado_perfil       = v_perfil,
         perfil_completo_en  = case when v_perfil = 'completo' then coalesce(d.perfil_completo_en, now()) end
   where d.id = p_conductor
     and (d.estado_verificacion is distinct from v_verif or d.estado_perfil is distinct from v_perfil);
end;
$$;

-- 4.4 Después de subir: el anterior del mismo tipo que no estaba aprobado
-- queda reemplazado (uno aprobado sigue valiendo hasta que se apruebe el
-- nuevo), corre el método de validación y se recalcula el perfil.
create or replace function privado.documentos_al_subir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.documentos d
     set estado = 'reemplazado'
   where d.cuenta_id = new.cuenta_id and d.tipo_documento_id = new.tipo_documento_id
     and d.id <> new.id and d.estado in ('en_revision', 'no_aprobado', 'vencido');
  perform privado.validar_documento(new.id);
  perform privado.recalcular_conductor(new.cuenta_id);
  return null;
end;
$$;

-- 4.5 Cuando cambia el estado: al aprobarse uno, los anteriores del mismo
-- tipo quedan reemplazados. Siempre se recalcula el perfil.
create or replace function privado.documentos_al_cambiar_estado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.estado = 'aprobado' then
    update public.documentos d
       set estado = 'reemplazado'
     where d.cuenta_id = new.cuenta_id and d.tipo_documento_id = new.tipo_documento_id
       and d.id <> new.id and d.estado <> 'reemplazado'
       and (d.subido_en, d.id) < (new.subido_en, new.id);
  end if;
  perform privado.recalcular_conductor(new.cuenta_id);
  return null;
end;
$$;

-- 4.6 Cuando cambia algo de los pasos 1, 2 o 4, se recalcula el perfil.
create or replace function privado.recalcular_conductor_por_fila()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fila jsonb := to_jsonb(coalesce(new, old));
begin
  perform privado.recalcular_conductor(coalesce(v_fila ->> 'conductor_id', v_fila ->> 'id')::uuid);
  return null;
end;
$$;

-- 4.7 Si el panel cambia qué documentos se piden, se recalculan todos.
create or replace function privado.recalcular_todos_los_conductores()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  for v_id in select c.id from public.conductores c loop
    perform privado.recalcular_conductor(v_id);
  end loop;
  return null;
end;
$$;

-- 4.8 Tarea diaria: los aprobados cuya fecha pasó quedan vencidos (y se
-- recalcula el perfil de cada uno por el trigger 4.5). Devuelve cuántos.
create or replace function privado.marcar_documentos_vencidos()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  update public.documentos d
     set estado = 'vencido'
   where d.estado = 'aprobado'
     and d.vence_en < (now() at time zone 'America/Santiago')::date;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- 4.9 Para enviar después los avisos por WhatsApp o correo: los documentos
-- aprobados que vencen dentro del plazo del ajuste, sin aviso enviado y
-- sin uno nuevo subido. Quien envíe el aviso anota aviso_vencimiento_en
-- con privado.anotar_aviso_vencimiento.
create or replace function privado.documentos_por_avisar()
returns table (documento_id bigint, cuenta_id uuid, tipo text, nombre text, vence_en date, celular text, email text)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.cuenta_id, t.clave, t.nombre, d.vence_en, c.celular, c.email
    from public.documentos d
    join public.tipos_documento t on t.id = d.tipo_documento_id
    join public.cuentas c on c.id = d.cuenta_id
   where d.estado = 'aprobado'
     and d.aviso_vencimiento_en is null
     and c.estado = 'activa'
     and d.vence_en >= (now() at time zone 'America/Santiago')::date
     and d.vence_en <= ((now() at time zone 'America/Santiago')::date
                        + make_interval(months => coalesce((select (a.valor #>> '{}')::integer from public.ajustes a
                                                             where a.id = 'meses_aviso_vencimiento_documentos'), 3)))::date
     and not exists (
       select 1 from public.documentos n
        where n.cuenta_id = d.cuenta_id and n.tipo_documento_id = d.tipo_documento_id
          and n.id <> d.id and n.estado in ('en_revision', 'aprobado') and n.subido_en > d.subido_en)
   order by d.vence_en, d.id
$$;

create or replace function privado.anotar_aviso_vencimiento(p_documento bigint)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.documentos set aviso_vencimiento_en = now() where id = p_documento;
$$;

create trigger proteger before insert or update on public.documentos
  for each row execute function privado.documentos_proteger();
create trigger al_subir after insert on public.documentos
  for each row execute function privado.documentos_al_subir();
create trigger al_cambiar_estado after update of estado on public.documentos
  for each row when (old.estado is distinct from new.estado)
  execute function privado.documentos_al_cambiar_estado();

create trigger recalcular_perfil after update of nombres, primer_apellido, email on public.cuentas
  for each row execute function privado.recalcular_conductor_por_fila();
create trigger recalcular_perfil after update of comuna_id, tiene_estacionamiento on public.conductores
  for each row execute function privado.recalcular_conductor_por_fila();
create trigger recalcular_perfil after insert or delete on public.conductor_licencias
  for each row execute function privado.recalcular_conductor_por_fila();
create trigger recalcular_perfil after insert or delete on public.conductor_negocios
  for each row execute function privado.recalcular_conductor_por_fila();
create trigger recalcular_perfil after insert or delete on public.conductor_opciones
  for each row execute function privado.recalcular_conductor_por_fila();
create trigger recalcular_perfiles after insert or update or delete on public.tipos_documento
  for each statement execute function privado.recalcular_todos_los_conductores();

-- Permisos de funciones (README: cada función nueva se cierra a mano).
revoke all on function
  privado.documentos_proteger(),
  privado.validar_documento(bigint),
  privado.recalcular_conductor(uuid),
  privado.documentos_al_subir(),
  privado.documentos_al_cambiar_estado(),
  privado.recalcular_conductor_por_fila(),
  privado.recalcular_todos_los_conductores(),
  privado.marcar_documentos_vencidos(),
  privado.documentos_por_avisar(),
  privado.anotar_aviso_vencimiento(bigint)
  from public, anon, authenticated, service_role;
-- Para quien envíe los avisos o corra la tarea diaria con la clave de servicio.
grant execute on function
  privado.marcar_documentos_vencidos(),
  privado.documentos_por_avisar(),
  privado.anotar_aviso_vencimiento(bigint)
  to service_role;


-- ---------------------------------------------------------------------
-- 5. RLS y permisos de tablas
-- ---------------------------------------------------------------------

-- tipos_documento: catálogo (todos leen; un administrador escribe).
alter table public.tipos_documento enable row level security;
revoke all on table public.tipos_documento from anon, authenticated, service_role;
grant select on table public.tipos_documento to anon, authenticated;
grant insert, update, delete on table public.tipos_documento to authenticated;
grant select, insert, update, delete on table public.tipos_documento to service_role;
create policy leer on public.tipos_documento for select to anon, authenticated using (true);
create policy agregar_admin on public.tipos_documento for insert to authenticated
  with check ((select privado.es_admin()));
create policy cambiar_admin on public.tipos_documento for update to authenticated
  using ((select privado.es_admin())) with check ((select privado.es_admin()));
create policy borrar_admin on public.tipos_documento for delete to authenticated
  using ((select privado.es_admin()));

-- documentos: la persona ve los suyos y sube los suyos (INSERT por columnas:
-- no elige id, estado ni fechas del servidor). Nadie los cambia ni los borra
-- desde la app: eso lo hacen el sistema y el método de validación. El equipo
-- los ve (los decidirá desde el panel, con su propia migración).
alter table public.documentos enable row level security;
revoke all on table public.documentos from anon, authenticated, service_role;
grant select on table public.documentos to authenticated;
grant insert (cuenta_id, tipo_documento_id, archivo_ruta, archivo_tipo, archivo_bytes, emitido_en, vence_en)
  on table public.documentos to authenticated;
grant select, insert, update, delete on table public.documentos to service_role;
create policy leer on public.documentos for select to authenticated
  using (cuenta_id = (select auth.uid()) or (select privado.es_equipo()));
create policy subir_propio on public.documentos for insert to authenticated
  with check (cuenta_id = (select auth.uid()));

-- revisiones_documento: solo el equipo las ve; las escribe el sistema.
alter table public.revisiones_documento enable row level security;
revoke all on table public.revisiones_documento from anon, authenticated, service_role;
grant select on table public.revisiones_documento to authenticated;
grant select, insert, update, delete on table public.revisiones_documento to service_role;
create policy leer_equipo on public.revisiones_documento for select to authenticated
  using ((select privado.es_equipo()));

do $$
declare
  t text;
begin
  foreach t in array array['tipos_documento', 'documentos', 'revisiones_documento'] loop
    execute format('revoke all on sequence %s from anon, authenticated',
                   pg_get_serial_sequence('public.' || t, 'id'));
  end loop;
end
$$;


-- ---------------------------------------------------------------------
-- 6. Espacio privado de Storage para los archivos
-- ---------------------------------------------------------------------
-- Privado (public = false): no hay enlaces públicos. Hasta 10 MB, solo
-- fotos y PDF. Cada persona sube y lee solo su carpeta (<su id>/). Un
-- archivo solo se puede borrar si ningún documento vigente lo usa (los
-- reemplazados sí: así no quedan archivos viejos). Nadie los cambia
-- (no hay UPDATE). El equipo los leerá desde el panel con su propia
-- política, cuando se construya (con registro de cada apertura, R26).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'])
on conflict (id) do update
   set public = false,
       file_size_limit = excluded.file_size_limit,
       allowed_mime_types = excluded.allowed_mime_types;

create policy documentos_subir_propio on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|heic|heif|pdf)$'
  );
create policy documentos_leer_propio on storage.objects for select to authenticated
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy documentos_borrar_sin_uso on storage.objects for delete to authenticated
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (
      select 1 from public.documentos d
       where d.archivo_ruta = storage.objects.name and d.estado <> 'reemplazado')
  );


-- ---------------------------------------------------------------------
-- 7. "Revisión de mis documentos"
-- ---------------------------------------------------------------------
-- La app la pide antes de subir el primer documento si la persona no la
-- aceptó (y la base lo exige, 4.1). Si hoy la pide "Antes de empezar"
-- (versión prueba-1, obligatoria), no cambia nada. Si no hay ninguna
-- vigente (porque "Antes de empezar" quedó solo con 2, mejora S12), se
-- agrega la versión prueba-2, NO obligatoria al entrar: se pide en el
-- Paso 5. Mismo texto de prueba, hasta el definitivo del abogado.
-- OJO al integrar: si la migración de S12 (autorizaciones_solo_dos) se
-- aplica DESPUÉS que esta, hay que volver a correr este bloque (no
-- duplica nada).
insert into public.textos_autorizacion
  (clave, nombre, texto, enlace, version, para_quien, obligatoria, exige_aceptar_de_nuevo, vigente, vigente_desde, orden)
select 'revision_documentos', 'Revisión de documentos',
       'Revisión de mis documentos: un sistema automático los revisa primero; las dudas y los rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.',
       null, 'prueba-2', 'conductor', false, false, true, now(), 3
 where not exists (select 1 from public.textos_autorizacion where clave = 'revision_documentos' and vigente)
on conflict (clave, version) do update set vigente = true, vigente_desde = now();


-- ---------------------------------------------------------------------
-- 8. Tarea diaria de vencimientos (si el proyecto tiene pg_cron)
-- ---------------------------------------------------------------------
-- En Supabase pg_cron está disponible: se activa y se agenda todos los días
-- a las 04:15 UTC (de madrugada en Chile). En la base local de pruebas no
-- existe: se avisa y las pruebas llaman la función directo.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('dale-documentos-vencidos', '15 4 * * *', 'select privado.marcar_documentos_vencidos()');
  else
    raise notice 'pg_cron no está disponible: la tarea diaria de vencimientos no se agendó.';
  end if;
end
$$;

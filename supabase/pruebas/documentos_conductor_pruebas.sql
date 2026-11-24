-- =====================================================================
-- documentos_conductor_pruebas.sql — pruebas de la migración
-- 20261124150000_documentos_conductor.sql (24-nov): tipos de documento,
-- documentos, el método de validación (hoy aprueba todo), el espacio
-- privado de Storage, vencimientos y el perfil completo.
--
-- Orden en local: después de storage_simulado.sql y de esa migración (ver
-- supabase/README.md). Todo termina en ROLLBACK. Nunca se aplica en Supabase.
-- =====================================================================

\set ON_ERROR_STOP 1
set client_min_messages = notice;

begin;

create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.usuarios (alias text primary key, id uuid not null, celular text not null);
grant select on pruebas.usuarios to public;
insert into pruebas.usuarios values
  ('a', 'aaaaaaaa-3333-4000-8000-00000000000a', '56990000031'),
  ('b', 'bbbbbbbb-3333-4000-8000-00000000000b', '56990000032'),
  ('e', 'eeeeeeee-3333-4000-8000-00000000000e', '56990000033'),
  ('t', 'dddddddd-3333-4000-8000-00000000000d', '56990000034'),
  ('m', 'ffffffff-3333-4000-8000-00000000000f', '56990000035');

create table pruebas.memoria (clave text primary key, valor text);
grant all on pruebas.memoria to public;

create function pruebas.id(p_alias text) returns uuid
language sql stable as $$ select id from pruebas.usuarios where alias = p_alias $$;
create function pruebas.tipo(p_clave text) returns bigint
language sql stable as $$ select id from public.tipos_documento where clave = p_clave $$;
create function pruebas.hoy() returns date
language sql stable as $$ select (now() at time zone 'America/Santiago')::date $$;
create function pruebas.guardar(p_clave text, p_valor text) returns void
language sql as $$ insert into pruebas.memoria values (p_clave, p_valor) on conflict (clave) do update set valor = excluded.valor $$;
create function pruebas.leer(p_clave text) returns text
language sql stable as $$ select valor from pruebas.memoria where clave = p_clave $$;

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

-- Sube un archivo al espacio documentos como lo haría Storage (con el rol de quien sube).
-- Devuelve la ruta. p_carpeta permite probar carpetas ajenas.
create function pruebas.archivo(p_quien text, p_ext text, p_mime text, p_carpeta text default null) returns text
language plpgsql as $$
declare
  v_ruta text := coalesce(p_carpeta, pruebas.id(p_quien)::text) || '/' || gen_random_uuid() || '.' || p_ext;
begin
  perform pruebas.como(p_quien);
  insert into storage.objects (bucket_id, name, owner, owner_id, metadata)
  values ('documentos', v_ruta, pruebas.id(p_quien), pruebas.id(p_quien)::text,
          jsonb_build_object('mimetype', p_mime, 'size', 34567));
  return v_ruta;
end $$;

-- Sube un documento (archivo + fila), como la app. Devuelve el id.
create function pruebas.subir(p_quien text, p_tipo text, p_vence date default null, p_emitido date default null) returns bigint
language plpgsql as $$
declare
  v_pdf  boolean := p_tipo in ('hoja_vida', 'antecedentes');
  v_ruta text := pruebas.archivo(p_quien, case when v_pdf then 'pdf' else 'jpg' end,
                                 case when v_pdf then 'application/pdf' else 'image/jpeg' end);
  v_id   bigint;
begin
  perform pruebas.como(p_quien);
  insert into public.documentos (cuenta_id, tipo_documento_id, archivo_ruta, archivo_tipo, archivo_bytes, emitido_en, vence_en)
  values (pruebas.id(p_quien), pruebas.tipo(p_tipo), v_ruta,
          case when v_pdf then 'application/pdf' else 'image/jpeg' end, 34567, p_emitido, p_vence)
  returning id into v_id;
  return v_id;
end $$;

create function pruebas.subir_los_4(p_quien text) returns void
language plpgsql as $$
begin
  perform pruebas.subir(p_quien, 'cedula', pruebas.hoy() + 900);
  perform pruebas.subir(p_quien, 'licencia', pruebas.hoy() + 400);
  perform pruebas.subir(p_quien, 'hoja_vida', null, pruebas.hoy() - 3);
  perform pruebas.subir(p_quien, 'antecedentes', null, pruebas.hoy() - 1);
end $$;

create function pruebas.perfil(p_quien text) returns text
language sql stable security definer as $$
  select estado_perfil || '/' || estado_verificacion from public.conductores where id = pruebas.id(p_quien)
$$;

-- Pasos 1 a 4 del conductor (como los guarda la app), con todas las autorizaciones vigentes.
create function pruebas.registrar(p_quien text, p_aceptar boolean default true) returns void
language plpgsql as $$
declare
  v uuid := pruebas.id(p_quien);
begin
  perform pruebas.como(p_quien);
  update public.cuentas set nombres = 'Prueba', primer_apellido = 'Uno', email = p_quien || '@correo.cl' where id = v;
  if p_aceptar then
    insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
    select v, t.id from public.textos_autorizacion t where t.vigente and t.para_quien in ('conductor', 'todos');
  end if;
  insert into public.conductores (id, fecha_nacimiento, disponible) values (v, date '1990-03-14', true);
  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  select v, id, 'declarada' from public.clases_licencia where codigo = 'B';
  update public.conductores set comuna_id = (select id from public.comunas where nombre = 'Ñuñoa'), tiene_estacionamiento = true where id = v;
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos)
  select v, id, 5 from public.tamanos_vehiculo where nombre = 'Vehículo liviano';
  insert into public.conductor_negocios (conductor_id, negocio_id)
  select v, id from public.negocios where nombre = 'Transporte por aplicación';
  insert into public.conductor_opciones (conductor_id, opcion_id)
  select v, o.id from public.opciones o join public.listas l on l.id = o.lista_id
   where (l.clave = 'turno' and o.clave = 'dia') or (l.clave = 'dia_semana' and o.clave in ('lu', 'ma'));
end $$;

grant execute on all functions in schema pruebas to public;

do $$
declare u record;
begin
  perform pruebas.como('supabase_auth_admin');
  for u in select * from pruebas.usuarios loop
    insert into auth.users (id, phone, phone_confirmed_at) values (u.id, u.celular, now());
  end loop;
  perform pruebas.como('postgres');
  insert into public.miembros_equipo (id, rol) values (pruebas.id('e'), 'revisor');
  insert into public.miembros_equipo (id, rol) values (pruebas.id('m'), 'administrador');
end $$;


-- =====================================================================
-- DC1. Catálogo, ajustes y espacio de Storage
-- =====================================================================
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select array_agg(clave order by orden) from public.tipos_documento where para_quien = 'conductor' and activo and obligatorio)
                     = array['cedula', 'licencia', 'hoja_vida', 'antecedentes'],
    '[DC1] los 4 documentos del conductor, obligatorios y en orden (sin sesión también se leen)');
  perform pruebas.ok((select array_agg(fecha_pedida order by orden) from public.tipos_documento)
                     = array['vencimiento', 'vencimiento', 'emision', 'emision'],
    '[DC1] cédula y licencia piden vencimiento; Hoja de Vida y antecedentes, emisión');
  perform pruebas.ok((select array_agg(coalesce(antiguedad_maxima_dias, 0) order by orden) from public.tipos_documento) = array[0, 0, 30, 30]
                 and not exists (select 1 from public.tipos_documento where renovar_cada_meses is not null),
    '[DC1] los PDF de 30 días o menos; ninguno se renueva por plazo todavía (pendiente MD18)');
  perform pruebas.ok((select valor from public.ajustes where id = 'meses_aviso_vencimiento_documentos') = '3'::jsonb,
    '[DC1] meses_aviso_vencimiento_documentos = 3 y la app lo puede leer');
  perform pruebas.ok(not exists (select 1 from public.ajustes where id = 'metodo_validacion_documentos'),
    '[DC1] el método de validación no lo ve quien no es del equipo');
  perform pruebas.falla('select * from public.documentos', 'permission denied', '[DC1] anon no lee documentos');
  perform pruebas.falla('select * from public.revisiones_documento', 'permission denied', '[DC1] anon no lee revisiones');
  perform pruebas.ok((select count(*) from storage.objects) = 0, '[DC1] anon no ve archivos');

  perform pruebas.como('e');
  perform pruebas.ok((select valor from public.ajustes where id = 'metodo_validacion_documentos') = '"aprobar_todo"'::jsonb,
    '[DC1] el equipo ve metodo_validacion_documentos = aprobar_todo');

  perform pruebas.como('postgres');
  perform pruebas.ok((select not public and file_size_limit = 10485760
                             and allowed_mime_types @> array['image/jpeg', 'image/png', 'application/pdf']
                             and not ('image/gif' = any (allowed_mime_types))
                        from storage.buckets where id = 'documentos'),
    '[DC1] espacio documentos privado, hasta 10 MB, solo fotos y PDF');
  perform pruebas.ok((select array_agg(version || ':' || obligatoria::text) from public.textos_autorizacion
                       where clave = 'revision_documentos' and vigente) = array['prueba-2:false'],
    '[DC1] "Revisión de mis documentos": vigente solo la prueba-2, que no es obligatoria al entrar');
  perform pruebas.ok((select not vigente from public.textos_autorizacion where clave = 'revision_documentos' and version = 'prueba-1'),
    '[DC1] la prueba-1 (decía que una persona decide y que se puede pedir otra revisión) ya no se ofrece');
  perform pruebas.ok((select texto !~* 'persona|otra revisión|sistema automático' from public.textos_autorizacion
                       where clave = 'revision_documentos' and vigente),
    '[DC1] el texto vigente no promete una revisión que hoy no existe');
  perform pruebas.ok((select array_agg(clave order by orden) from public.textos_autorizacion where vigente and obligatoria)
                     = array['terminos_privacidad', 'compartir_ficha'],
    '[DC1] "Antes de empezar" queda con 2 obligatorios (con S12); la revisión se pide en el Paso 5');
  perform pruebas.ok((select valor from public.ajustes where id = 'maximo_archivos_documentos') = '12'::jsonb
                 and not (select publico from public.ajustes where id = 'maximo_archivos_documentos'),
    '[DC1] tope de 12 archivos por persona (ajuste del equipo)');
  perform pruebas.ok((select etiqueta_fecha from public.tipos_documento where clave = 'licencia') = 'Fecha de vencimiento (próximo control)',
    '[DC1] la licencia habla de vencimiento, como sus avisos');
end $$;


-- =====================================================================
-- DC2. Storage: cada uno solo su carpeta
-- =====================================================================
do $$
declare
  v_a text;
  n   integer;
begin
  v_a := pruebas.archivo('a', 'jpg', 'image/jpeg');
  perform pruebas.guardar('archivo_a', v_a);
  perform pruebas.ok(v_a like pruebas.id('a')::text || '/%', '[DC2] la persona sube a su carpeta');

  perform pruebas.falla(format($f$select pruebas.archivo('a', 'jpg', 'image/jpeg', %L)$f$, pruebas.id('b')::text),
    'row-level security', '[DC2] nadie sube a la carpeta de otra persona');
  perform pruebas.como('a');
  perform pruebas.falla(format($f$insert into storage.objects (bucket_id, name, owner_id) values ('documentos', %L, %L)$f$,
                                pruebas.id('a') || '/mi-cedula.jpg', pruebas.id('a')),
    'row-level security', '[DC2] el nombre del archivo lo arma la app (uuid), no la persona');
  perform pruebas.falla(format($f$insert into storage.objects (bucket_id, name, owner_id) values ('documentos', %L, %L)$f$,
                                pruebas.id('a') || '/' || gen_random_uuid() || '.exe', pruebas.id('a')),
    'row-level security', '[DC2] solo fotos y PDF por la extensión');

  perform pruebas.como('b');
  perform pruebas.ok((select count(*) from storage.objects where name = v_a) = 0, '[DC2] nadie lee el archivo de otra persona');
  update storage.objects set name = pruebas.id('b') || '/x.jpg' where name = v_a;
  get diagnostics n = row_count;
  perform pruebas.ok(n = 0, '[DC2] nadie mueve el archivo de otra persona');
  delete from storage.objects where name = v_a;
  get diagnostics n = row_count;
  perform pruebas.ok(n = 0, '[DC2] nadie borra el archivo de otra persona');

  perform pruebas.como('e');
  perform pruebas.ok((select count(*) from storage.objects where name = v_a) = 0,
    '[DC2] el equipo tampoco abre archivos todavía (lo hará el panel, con registro)');

  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from storage.objects where name = v_a) = 1, '[DC2] la persona lee su archivo');
  update storage.objects set metadata = '{}'::jsonb where name = v_a;
  get diagnostics n = row_count;
  perform pruebas.ok(n = 0, '[DC2] un archivo no se cambia (sin UPDATE)');
end $$;


-- =====================================================================
-- DC3. Subir: reglas de la base
-- =====================================================================
do $$
declare
  v_pdf text;
begin
  perform pruebas.registrar('a');
  perform pruebas.registrar('b', false);
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/sin_documentos', '[DC3] con los pasos 1 a 4 y sin documentos: incompleto');

  -- Sin la autorización de revisión de documentos.
  perform pruebas.falla($f$select pruebas.subir('b', 'cedula', pruebas.hoy() + 300)$f$,
    'Primero acepta la revisión de tus documentos', '[DC3] sin aceptar "Revisión de mis documentos" no se sube');
  -- Sin Paso 1.
  perform pruebas.falla($f$select pruebas.subir('t', 'cedula', pruebas.hoy() + 300)$f$,
    'Primero guarda tus datos', '[DC3] sin Paso 1 no se sube');

  perform pruebas.como('a');
  perform pruebas.falla(format($f$insert into public.documentos (cuenta_id, tipo_documento_id, archivo_ruta, archivo_tipo, vence_en)
                                  values (%L, %s, %L, 'image/jpeg', pruebas.hoy() + 300)$f$,
                                pruebas.id('a'), pruebas.tipo('cedula'), pruebas.id('a') || '/' || gen_random_uuid() || '.jpg'),
    'No encontramos el archivo', '[DC3] sin archivo subido no hay documento');
  perform pruebas.falla(format($f$insert into public.documentos (cuenta_id, tipo_documento_id, archivo_ruta, archivo_tipo, vence_en)
                                  values (%L, %s, %L, 'image/jpeg', pruebas.hoy() + 300)$f$,
                                pruebas.id('b'), pruebas.tipo('cedula'), pruebas.leer('archivo_a')),
    'row-level security', '[DC3] nadie sube un documento a nombre de otra persona');
  perform pruebas.falla(format($f$insert into public.documentos (cuenta_id, tipo_documento_id, archivo_ruta, archivo_tipo, estado, vence_en)
                                  values (%L, %s, %L, 'image/jpeg', 'aprobado', pruebas.hoy() + 300)$f$,
                                pruebas.id('a'), pruebas.tipo('cedula'), pruebas.leer('archivo_a')),
    'permission denied', '[DC3] la persona no elige el estado');

  v_pdf := pruebas.archivo('a', 'pdf', 'application/pdf');
  perform pruebas.como('a');
  perform pruebas.falla(format($f$insert into public.documentos (cuenta_id, tipo_documento_id, archivo_ruta, archivo_tipo, vence_en)
                                  values (%L, %s, %L, 'image/jpeg', pruebas.hoy() + 300)$f$,
                                pruebas.id('a'), pruebas.tipo('cedula'), v_pdf),
    'Sube una foto', '[DC3] la cédula es una foto (el tipo lo dice Storage, no la app)');
  perform pruebas.falla(format($f$insert into public.documentos (cuenta_id, tipo_documento_id, archivo_ruta, archivo_tipo, emitido_en)
                                  values (%L, %s, %L, 'application/pdf', pruebas.hoy())$f$,
                                pruebas.id('a'), pruebas.tipo('hoja_vida'), pruebas.leer('archivo_a')),
    'Sube el documento en PDF', '[DC3] la Hoja de Vida es un PDF');

  -- Fechas.
  perform pruebas.falla($f$select pruebas.subir('a', 'cedula')$f$, 'Anota la fecha de vencimiento', '[DC3] la cédula pide su vencimiento');
  perform pruebas.falla($f$select pruebas.subir('a', 'licencia', pruebas.hoy() - 1)$f$, 'ya venció', '[DC3] no se sube una licencia vencida');
  perform pruebas.falla($f$select pruebas.subir('a', 'cedula', pruebas.hoy() + 365 * 25)$f$, 'Revisa la fecha', '[DC3] un vencimiento absurdo se rechaza');
  perform pruebas.falla($f$select pruebas.subir('a', 'hoja_vida')$f$, 'Anota la fecha de emisión', '[DC3] la Hoja de Vida pide su emisión');
  perform pruebas.falla($f$select pruebas.subir('a', 'hoja_vida', null, pruebas.hoy() + 1)$f$, 'no puede ser futura', '[DC3] emisión futura no');
  perform pruebas.falla($f$select pruebas.subir('a', 'antecedentes', null, pruebas.hoy() - 31)$f$, 'Debe tener 30 días o menos',
    '[DC3] un PDF de más de 30 días no (antiguedad_maxima_dias)');
end $$;


-- =====================================================================
-- DC4. El método de validación provisorio aprueba todo
-- =====================================================================
do $$
declare
  v_id bigint;
  d    public.documentos;
  n    integer;
begin
  v_id := pruebas.subir('a', 'cedula', pruebas.hoy() + 900);
  perform pruebas.guardar('cedula_1', v_id::text);
  perform pruebas.como('a');
  select * into d from public.documentos where id = v_id;
  perform pruebas.ok(d.estado = 'aprobado' and d.aprobado_automaticamente and d.revisado_en is not null,
    '[DC4] la cédula queda aprobada al subirla (aprobación automática)');
  perform pruebas.ok(d.vence_en = pruebas.hoy() + 900 and d.emitido_en is null and d.fechas_anotadas_por = 'persona'
                 and d.archivo_tipo = 'image/jpeg' and d.archivo_bytes = 34567,
    '[DC4] queda su vencimiento, anotado por la persona, y el tipo y tamaño que dice Storage');
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/faltan_documentos', '[DC4] con 1 de 4: el perfil sigue incompleto y faltan documentos (no "sin documentos")');
  perform pruebas.ok((select count(*) from public.revisiones_documento) = 0, '[DC4] la persona no ve las revisiones');

  perform pruebas.falla(format($f$update public.documentos set estado = 'aprobado' where id = %s$f$, v_id), 'permission denied',
    '[DC4] la persona no cambia un documento (sin UPDATE)');
  perform pruebas.falla(format('delete from public.documentos where id = %s', v_id), 'permission denied', '[DC4] ni lo borra');

  perform pruebas.como('b');
  perform pruebas.ok((select count(*) from public.documentos where cuenta_id = pruebas.id('a')) = 0, '[DC4] nadie ve los documentos de otra persona');

  perform pruebas.como('e');
  perform pruebas.ok((select metodo = 'aprobacion_automatica_provisoria' and etapa = 'automatica' and resultado = 'aprobar' and revisor_id is null
                        from public.revisiones_documento where documento_id = v_id),
    '[DC4] queda la revisión como "aprobación automática provisoria" (la ve el equipo)');
  perform pruebas.ok((select count(*) from public.documentos where cuenta_id = pruebas.id('a')) = 1, '[DC4] el equipo ve los documentos');
  perform pruebas.falla(format($f$update public.documentos set estado = 'no_aprobado' where id = %s$f$, v_id), 'permission denied',
    '[DC4] el equipo no decide desde la app todavía (lo hará el panel)');

  perform pruebas.subir('a', 'licencia', pruebas.hoy() + 400);
  perform pruebas.subir('a', 'hoja_vida', null, pruebas.hoy() - 30);
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/faltan_documentos', '[DC4] con 3 de 4: incompleto, faltan documentos');
  v_id := pruebas.subir('a', 'antecedentes', null, pruebas.hoy());
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC4] con los 4 aprobados y los pasos listos: completo y verificado');
  perform pruebas.como('a');
  perform pruebas.ok((select perfil_completo_en is not null from public.conductores where id = pruebas.id('a')), '[DC4] perfil_completo_en anotado');
  perform pruebas.ok((select vence_en is null and emitido_en = pruebas.hoy() from public.documentos where id = v_id),
    '[DC4] antecedentes: queda la emisión; sin plazo de renovación no vence');
end $$;


-- =====================================================================
-- DC5. Reemplazar y borrar el archivo anterior
-- =====================================================================
do $$
declare
  v_viejo bigint := pruebas.leer('cedula_1')::bigint;
  v_ruta  text;
  v_nuevo bigint;
  n       integer;
begin
  perform pruebas.como('a');
  select archivo_ruta into v_ruta from public.documentos where id = v_viejo;
  delete from storage.objects where name = v_ruta;
  get diagnostics n = row_count;
  perform pruebas.ok(n = 0, '[DC5] el archivo de un documento vigente no se borra');

  v_nuevo := pruebas.subir('a', 'cedula', pruebas.hoy() + 2000);
  perform pruebas.como('a');
  perform pruebas.ok((select estado from public.documentos where id = v_viejo) = 'reemplazado'
                 and (select estado from public.documentos where id = v_nuevo) = 'aprobado',
    '[DC5] al subir otra cédula, la anterior queda reemplazada');
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC5] el perfil sigue completo');
  delete from storage.objects where name = v_ruta;
  get diagnostics n = row_count;
  perform pruebas.ok(n = 1, '[DC5] el archivo reemplazado sí se puede borrar');
  perform pruebas.ok((select count(*) from storage.objects where name = v_ruta) = 0, '[DC5] y ya no está');
  delete from storage.objects where name = pruebas.leer('archivo_a');
  get diagnostics n = row_count;
  perform pruebas.ok(n = 1, '[DC5] un archivo propio que ningún documento usa se puede borrar (subida que no terminó)');
end $$;


-- =====================================================================
-- DC6. El método de validación: solo uno que existe; uno futuro que deja
-- documentos en revisión se agrega reemplazando la función, sin tocar la app
-- =====================================================================
do $$
declare
  v_lic_vieja bigint;
  v_nueva     bigint;
  v_hv        bigint;
  n           integer;
begin
  -- El ajuste solo acepta métodos que existen (hoy, aprobar_todo) y no se borra.
  perform pruebas.como('m');
  perform pruebas.falla($f$update public.ajustes set valor = '"equipo"' where id = 'metodo_validacion_documentos'$f$,
    'no existe', '[DC6] un administrador no elige un método que no existe ("equipo")');
  perform pruebas.falla($f$update public.ajustes set valor = '"Aprobar_todo"' where id = 'metodo_validacion_documentos'$f$,
    'no existe', '[DC6] ni uno mal escrito');
  perform pruebas.falla($f$update public.ajustes set valor = '1' where id = 'metodo_validacion_documentos'$f$,
    'no existe', '[DC6] ni algo que no es un nombre');
  perform pruebas.falla($f$delete from public.ajustes where id = 'metodo_validacion_documentos'$f$,
    'no se puede borrar', '[DC6] el ajuste no se borra');
  perform pruebas.como('postgres');
  perform pruebas.falla($f$update public.ajustes set valor = '"equipo"' where id = 'metodo_validacion_documentos'$f$,
    'no existe', '[DC6] tampoco con SQL directo');
  perform pruebas.ok((select valor from public.ajustes where id = 'metodo_validacion_documentos') = '"aprobar_todo"'::jsonb,
    '[DC6] el método sigue en aprobar_todo');

  -- Un método futuro que deja los documentos en revisión (como sería la revisión por el equipo):
  -- se agrega con una migración que reemplaza la función. Aquí se reemplaza y después se devuelve.
  perform pruebas.guardar('def_validar', pg_get_functiondef('privado.validar_documento(bigint)'::regprocedure));
  create or replace function privado.validar_documento(p_documento bigint) returns void
  language plpgsql security definer set search_path = '' as $f$ begin return; end; $f$;

  select id into v_lic_vieja from public.documentos where cuenta_id = pruebas.id('a') and tipo_documento_id = pruebas.tipo('licencia') and estado = 'aprobado';
  v_nueva := pruebas.subir('a', 'licencia', pruebas.hoy() + 1500);
  perform pruebas.como('a');
  perform pruebas.ok((select estado from public.documentos where id = v_nueva) = 'en_revision'
                 and (select estado from public.documentos where id = v_lic_vieja) = 'aprobado',
    '[DC6] con un método que deja en revisión, la licencia nueva espera y la anterior sigue valiendo');
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC6] mientras tanto el perfil sigue completo');
  perform pruebas.como('e');
  perform pruebas.ok(not exists (select 1 from public.revisiones_documento where documento_id = v_nueva), '[DC6] sin revisión automática');

  -- El sistema (después, el panel) lo aprueba: la anterior queda reemplazada.
  perform pruebas.como('postgres');
  update public.documentos set estado = 'aprobado', revisado_en = now() where id = v_nueva;
  perform pruebas.ok((select estado from public.documentos where id = v_lic_vieja) = 'reemplazado', '[DC6] al aprobarse la nueva, la anterior queda reemplazada');

  -- Una no aprobada (sin otra aprobada) deja el perfil con observaciones.
  update public.documentos set estado = 'no_aprobado'
   where cuenta_id = pruebas.id('a') and tipo_documento_id = pruebas.tipo('hoja_vida') and estado = 'aprobado';
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/con_observaciones', '[DC6] un documento no aprobado: con observaciones e incompleto');
  v_hv := pruebas.subir('a', 'hoja_vida', null, pruebas.hoy());
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/en_revision', '[DC6] al subirlo de nuevo: en revisión (el no aprobado queda reemplazado)');
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from public.documentos where cuenta_id = pruebas.id('a') and tipo_documento_id = pruebas.tipo('hoja_vida') and estado = 'no_aprobado') = 0,
    '[DC6] el no aprobado quedó reemplazado');

  -- Se vuelve al método provisorio: al cambiar el ajuste, lo que esperaba pasa por el método.
  execute pruebas.leer('def_validar');
  update public.ajustes set valor = '"aprobar_todo"' where id = 'metodo_validacion_documentos';
  perform pruebas.ok((select estado from public.documentos where id = v_hv) = 'aprobado',
    '[DC6] al cambiar el método, los documentos que esperaban se revisan (no quedan en revisión para siempre)');
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC6] de vuelta en aprobar_todo: aprobado y completo');

  -- Si igual llegara un método desconocido (ajuste cambiado saltándose la regla), la subida falla a la vista.
  alter table public.ajustes disable trigger metodo_validacion_proteger;
  update public.ajustes set valor = '"otro"' where id = 'metodo_validacion_documentos';
  perform pruebas.falla($f$select pruebas.subir('a', 'hoja_vida', null, pruebas.hoy())$f$,
    'no podemos recibir documentos', '[DC6] con un método desconocido no se sube (nada queda esperando sin que nadie lo revise)');
  perform pruebas.como('postgres');
  update public.ajustes set valor = '"aprobar_todo"' where id = 'metodo_validacion_documentos';
  alter table public.ajustes enable trigger metodo_validacion_proteger;
  select count(*) into n from public.documentos where estado = 'en_revision';
  perform pruebas.ok(n = 0, '[DC6] no quedó ningún documento en revisión');
end $$;


-- =====================================================================
-- DC7. Vencimientos y avisos
-- =====================================================================
do $$
declare
  v_ced bigint;
  n     integer;
begin
  perform pruebas.como('postgres');
  select id into v_ced from public.documentos where cuenta_id = pruebas.id('a') and tipo_documento_id = pruebas.tipo('cedula') and estado = 'aprobado';
  update public.documentos set vence_en = pruebas.hoy() + 60 where id = v_ced;
  perform pruebas.ok((select count(*) from privado.documentos_por_avisar() where documento_id = v_ced) = 1,
    '[DC7] una cédula que vence en 2 meses está para avisar');
  perform pruebas.ok(not exists (select 1 from privado.documentos_por_avisar() where tipo = 'licencia' and cuenta_id = pruebas.id('a')),
    '[DC7] una licencia que vence en 4 años no');
  update public.documentos set vence_en = pruebas.hoy() + 100 where id = v_ced;
  perform pruebas.ok(not exists (select 1 from privado.documentos_por_avisar() where documento_id = v_ced),
    '[DC7] a más de 3 meses, no se avisa todavía');
  update public.ajustes set valor = '4' where id = 'meses_aviso_vencimiento_documentos';
  perform pruebas.ok(exists (select 1 from privado.documentos_por_avisar() where documento_id = v_ced),
    '[DC7] el plazo se cambia con el ajuste (4 meses)');
  perform privado.anotar_aviso_vencimiento(v_ced);
  perform pruebas.ok(not exists (select 1 from privado.documentos_por_avisar() where documento_id = v_ced),
    '[DC7] ya avisado, no se repite');
  update public.ajustes set valor = '3' where id = 'meses_aviso_vencimiento_documentos';

  update public.documentos set vence_en = pruebas.hoy() - 1 where id = v_ced;
  n := privado.marcar_documentos_vencidos();
  perform pruebas.ok(n = 1 and (select estado from public.documentos where id = v_ced) = 'vencido',
    '[DC7] la tarea diaria marca la cédula vencida');
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/con_observaciones', '[DC7] con un documento vencido: incompleto, con observaciones');
  perform pruebas.subir('a', 'cedula', pruebas.hoy() + 3000);
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC7] al subir la nueva: completo otra vez');
  perform pruebas.como('postgres');
  perform pruebas.ok((select estado from public.documentos where id = v_ced) = 'reemplazado', '[DC7] la vencida queda reemplazada');

  perform pruebas.como('service_role');
  perform pruebas.ok(privado.marcar_documentos_vencidos() = 0, '[DC7] la clave de servicio corre la tarea diaria');
  perform pruebas.como('a');
  perform pruebas.falla('select privado.marcar_documentos_vencidos()', 'permission denied', '[DC7] el conductor no');
  perform pruebas.falla('select * from privado.documentos_por_avisar()', 'permission denied', '[DC7] ni lee la lista de avisos');
end $$;


-- =====================================================================
-- DC8. El perfil completo sigue a los pasos 1 a 4 (el Paso 3 con al menos un vehículo, S07)
-- =====================================================================
do $$
declare
  v uuid := pruebas.id('a');
begin
  perform pruebas.como('a');
  delete from public.conductor_negocios where conductor_id = v;
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/verificado', '[DC8] sin negocio: incompleto (los documentos siguen verificados)');
  insert into public.conductor_negocios (conductor_id, negocio_id) select v, id from public.negocios where nombre = 'Transporte por aplicación';
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC8] con negocio otra vez: completo');
  update public.cuentas set email = '' where id = v;
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/verificado', '[DC8] sin correo: incompleto');
  update public.cuentas set email = 'a@correo.cl' where id = v;
  update public.conductores set tiene_estacionamiento = null where id = v;
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/verificado', '[DC8] sin responder estacionamiento: incompleto');
  update public.conductores set tiene_estacionamiento = false where id = v;
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC8] estacionamiento "no" también cuenta como respondido');
  delete from public.experiencia_conductor where conductor_id = v;
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/verificado', '[DC8] sin ningún vehículo manejado (Paso 3, S07): incompleto');
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos)
  select v, id, 2 from public.tamanos_vehiculo where nombre = 'Moto';
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC8] con un vehículo otra vez: completo');
  perform pruebas.falla(format($f$update public.conductores set estado_perfil = 'incompleto' where id = %L$f$, v),
    'No puedes cambiar', '[DC8] la persona no cambia su estado de perfil');
end $$;


-- =====================================================================
-- DC9. Configurable desde el panel: qué documentos se piden
-- =====================================================================
do $$
declare
  n integer;
begin
  perform pruebas.como('e');
  update public.tipos_documento set obligatorio = false where clave = 'antecedentes';
  get diagnostics n = row_count;
  perform pruebas.ok(n = 0, '[DC9] un revisor no cambia el catálogo');

  -- b sin documentos: si se agrega un 5.º obligatorio, a queda incompleto; si se quita, vuelve.
  perform pruebas.como('m');
  insert into public.tipos_documento (clave, nombre, corto, para_quien, formato, orden) values ('certificado_extra', 'Certificado extra', 'Extra', 'conductor', 'pdf', 5);
  perform pruebas.ok(pruebas.perfil('a') = 'incompleto/faltan_documentos', '[DC9] un documento obligatorio nuevo deja incompletos a todos (se recalcula)');
  update public.tipos_documento set activo = false where clave = 'certificado_extra';
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC9] al desactivarlo, vuelven a estar completos');
end $$;


-- =====================================================================
-- DC10. "Revisión de mis documentos": se pide la prueba-2 (también a quien
-- aceptó la prueba-1) y, sin texto vigente, no se recibe nada. Con
-- "Antes de empezar" de 2 textos (como quedaría con la mejora S12).
-- =====================================================================
do $$
declare
  v_texto bigint;
begin
  perform pruebas.como('postgres');
  select id into v_texto from public.textos_autorizacion where clave = 'revision_documentos' and vigente;
  -- t aceptó solo la prueba-1 (antes de esta migración).
  perform pruebas.registrar('t', false);
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('t'), id from public.textos_autorizacion where clave = 'revision_documentos' and version = 'prueba-1';
  perform pruebas.falla($f$select pruebas.subir('t', 'licencia', pruebas.hoy() + 500)$f$,
    'Primero acepta la revisión', '[DC10] quien aceptó la prueba-1 acepta la prueba-2 antes de subir');

  -- Como con S12: "Antes de empezar" con 2 y ningún texto vigente de documentos.
  perform pruebas.como('postgres');
  update public.textos_autorizacion set vigente = false where clave in ('revision_documentos', 'normas_mensajes') and vigente;
  perform pruebas.ok((select array_agg(clave order by orden) from public.textos_autorizacion where vigente and obligatoria)
                     = array['terminos_privacidad', 'compartir_ficha'],
    '[DC10] "Antes de empezar" con 2 obligatorios');
  perform pruebas.falla($f$select pruebas.subir('t', 'cedula', pruebas.hoy() + 500)$f$,
    'no podemos recibir documentos', '[DC10] sin texto vigente de documentos, no se sube nada');
  perform pruebas.falla($f$select pruebas.subir('a', 'antecedentes', null, pruebas.hoy() - 2)$f$,
    'no podemos recibir documentos', '[DC10] tampoco quien había aceptado la versión vigente antes');
  perform pruebas.como('postgres');
  perform pruebas.ok(not exists (select 1 from public.documentos where cuenta_id = pruebas.id('t')),
    '[DC10] sin texto vigente, no quedó ningún documento');

  -- Volver a correr el bloque 7 de la migración la deja vigente otra vez (sin duplicar).
  update public.textos_autorizacion set vigente = false where clave = 'revision_documentos' and vigente and version <> 'prueba-2';
  insert into public.textos_autorizacion
    (clave, nombre, texto, enlace, version, para_quien, obligatoria, exige_aceptar_de_nuevo, vigente, vigente_desde, orden)
  values ('revision_documentos', 'Revisión de documentos', 'x', null, 'prueba-2', 'conductor', false, false, true, now(), 3)
  on conflict (clave, version) do update set vigente = true, vigente_desde = now();
  perform pruebas.ok((select count(*) from public.textos_autorizacion where clave = 'revision_documentos' and vigente) = 1
                 and (select id from public.textos_autorizacion where clave = 'revision_documentos' and vigente) = v_texto,
    '[DC10] el bloque 7 se puede volver a correr: la misma prueba-2, una sola vigente');
  perform pruebas.ok((select texto <> 'x' from public.textos_autorizacion where id = v_texto), '[DC10] y no cambia su texto');

  perform pruebas.como('t');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id) values (pruebas.id('t'), v_texto);
  perform pruebas.subir('t', 'cedula', pruebas.hoy() + 500);
  perform pruebas.subir('t', 'licencia', pruebas.hoy() + 500);
  perform pruebas.como('t');
  perform pruebas.ok((select count(*) from public.documentos where estado = 'aprobado') = 2, '[DC10] aceptada, se sube y se aprueba');
  perform pruebas.ok(pruebas.perfil('t') = 'incompleto/faltan_documentos', '[DC10] con 2 de 4: faltan documentos');
end $$;


-- =====================================================================
-- DC12. Retirar la autorización: los documentos dejan de usarse
-- =====================================================================
do $$
declare
  v_ruta text;
  n      integer;
begin
  perform pruebas.como('t');
  select archivo_ruta into v_ruta from public.documentos where cuenta_id = pruebas.id('t') and tipo_documento_id = pruebas.tipo('cedula');
  update public.consentimientos set revocado_en = now()
   where cuenta_id = pruebas.id('t') and revocado_en is null
     and texto_autorizacion_id in (select id from public.textos_autorizacion where clave = 'revision_documentos');
  perform pruebas.ok((select array_agg(distinct estado) from public.documentos where cuenta_id = pruebas.id('t')) = array['retirado'],
    '[DC12] al retirar la autorización, sus documentos quedan retirados (ya no se usan)');
  perform pruebas.ok(pruebas.perfil('t') = 'incompleto/sin_documentos', '[DC12] y su perfil vuelve a no tener documentos');
  perform pruebas.falla($f$select pruebas.subir('t', 'cedula', pruebas.hoy() + 500)$f$,
    'Primero acepta la revisión', '[DC12] no sube nada nuevo sin aceptar otra vez');
  perform pruebas.como('t');
  delete from storage.objects where name = v_ruta;
  get diagnostics n = row_count;
  perform pruebas.ok(n = 1, '[DC12] el archivo de un documento retirado se puede borrar');
  perform pruebas.falla($f$update public.documentos set estado = 'aprobado' where cuenta_id = pruebas.id('t')$f$, 'permission denied',
    '[DC12] la persona no los vuelve a aprobar');

  -- Retirar otra autorización no toca los documentos.
  perform pruebas.como('a');
  update public.consentimientos set revocado_en = now()
   where cuenta_id = pruebas.id('a') and revocado_en is null
     and texto_autorizacion_id in (select id from public.textos_autorizacion where clave = 'normas_mensajes');
  perform pruebas.ok(pruebas.perfil('a') = 'completo/verificado', '[DC12] retirar otra autorización no cambia los documentos');

  -- Acepta otra vez y sube de nuevo.
  perform pruebas.como('t');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('t'), id from public.textos_autorizacion where clave = 'revision_documentos' and vigente;
  perform pruebas.subir('t', 'cedula', pruebas.hoy() + 500);
  perform pruebas.ok(pruebas.perfil('t') = 'incompleto/faltan_documentos', '[DC12] al aceptar otra vez, vuelve a subir');
end $$;


-- =====================================================================
-- DC13. Tope de archivos por persona en Storage
-- =====================================================================
do $$
declare
  i integer;
begin
  perform pruebas.como('postgres');
  update public.ajustes set valor = '3' where id = 'maximo_archivos_documentos';
  delete from storage.objects where owner_id = pruebas.id('b')::text;
  for i in 1..3 loop
    perform pruebas.archivo('b', 'jpg', 'image/jpeg');
  end loop;
  perform pruebas.falla($f$select pruebas.archivo('b', 'jpg', 'image/jpeg')$f$,
    'row-level security', '[DC13] con el tope lleno no se suben más archivos sin documento');
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from storage.objects where owner_id = pruebas.id('t')::text) < 3, '[DC13] t tiene menos de 3');
  perform pruebas.ok(pruebas.archivo('t', 'jpg', 'image/jpeg') is not null, '[DC13] el tope es por persona: t sí sube');
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from storage.objects where owner_id = pruebas.id('b')::text) = 3, '[DC13] b quedó con 3');
  perform pruebas.como('b');
  delete from storage.objects where name = (select name from storage.objects where owner_id = pruebas.id('b')::text limit 1);
  perform pruebas.ok(pruebas.archivo('b', 'jpg', 'image/jpeg') is not null, '[DC13] al borrar uno que sobra, puede subir otra vez');
  perform pruebas.como('postgres');
  update public.ajustes set valor = '12' where id = 'maximo_archivos_documentos';
end $$;


-- =====================================================================
-- DC11. Permisos de las funciones nuevas
-- =====================================================================
do $$
begin
  perform pruebas.como('postgres');
  perform pruebas.ok(not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) as a
     where n.nspname = 'privado' and a.grantee = 0 and a.privilege_type = 'EXECUTE'),
    '[DC11] ninguna función de privado la ejecuta PUBLIC');
  perform pruebas.ok((
    select array_agg(p.proname::text order by p.proname)
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'privado' and has_function_privilege('authenticated', p.oid, 'EXECUTE'))
    = array['columnas_cambiadas', 'columnas_cambiadas_salvo', 'es_admin', 'es_equipo', 'es_sistema', 'licencia_habilita_negocio',
            'puede_subir_archivo_documento'],
    '[DC11] authenticated solo ejecuta la del tope de archivos (la usa la política de Storage)');
  perform pruebas.ok(has_function_privilege('service_role', 'privado.documentos_por_avisar()', 'EXECUTE')
                 and not has_function_privilege('service_role', 'privado.validar_documento(bigint)', 'EXECUTE'),
    '[DC11] la clave de servicio solo corre la tarea diaria y los avisos');
  perform pruebas.ok((select relrowsecurity from pg_class where oid = 'public.documentos'::regclass)
                 and (select relrowsecurity from pg_class where oid = 'public.revisiones_documento'::regclass)
                 and (select relrowsecurity from pg_class where oid = 'public.tipos_documento'::regclass),
    '[DC11] RLS en las 3 tablas nuevas');
end $$;

rollback;

do $$ begin raise notice 'FIN: todas las pruebas de los documentos del conductor pasaron.'; end $$;

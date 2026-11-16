-- =====================================================================
-- Dale Contacto · Negocios para quienes no tienen licencia profesional
-- (aprobado por la dueña el 16-nov).
--
-- POR QUÉ: en el lanzamiento solo estaban Taxi y Taxi ejecutivo, que piden
-- licencia profesional (A1, A2 o A3). Quien tiene solo B o solo C no podía
-- elegir ningún negocio en el Paso 4 y no terminaba su registro.
--
-- QUÉ HACE: enciende "Transporte por aplicación" (pide B) y "Moto delivery"
-- (pide C). Para que Moto delivery se vea, enciende la industria
-- "Transporte de carga", pero sus otros negocios siguen apagados.
-- Ojo: la Ley 21.553 exigiría licencia profesional también para las apps
-- de pasajeros, con 12 meses de transición [verificar con abogado].
-- =====================================================================

do $$
declare
  n int;
begin
  update public.negocios set activo = true
   where nombre in ('Transporte por aplicación', 'Moto delivery') and not activo;
  get diagnostics n = row_count;
  if n <> 2 then
    raise exception 'Se esperaba encender 2 negocios y se encendieron %', n;
  end if;

  update public.industrias set activo = true
   where nombre = 'Transporte de carga' and not activo;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'Se esperaba encender la industria Transporte de carga y se encendieron %', n;
  end if;

  -- En carga, solo Moto delivery queda a la vista.
  if exists (
    select 1 from public.negocios ng join public.industrias i on i.id = ng.industria_id
     where i.nombre = 'Transporte de carga' and ng.activo and ng.nombre <> 'Moto delivery'
  ) then
    raise exception 'En Transporte de carga solo debe quedar encendido Moto delivery';
  end if;
end $$;

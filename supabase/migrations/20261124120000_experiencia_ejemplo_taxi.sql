-- =====================================================================
-- Dale Contacto · Paso 3: el taxista encuentra su vehículo (S07, aprobada
-- por los dueños el 24-nov).
--
-- POR QUÉ: en el Paso 3 el taxista busca "taxi" o "auto" y tiene que
-- deducir que su taxi es un "Vehículo liviano". Que aparezca la palabra que
-- usa le confirma que la app es para él.
--
-- QUÉ HACE: el ejemplo en gris de "Vehículo liviano" pasa de
-- "auto, SUV, camioneta" a "auto, taxi, SUV, camioneta". Solo el texto de
-- ayuda: la categoría, su id y lo ya guardado no cambian.
-- =====================================================================

do $$
declare
  n int;
begin
  update public.tamanos_vehiculo set ayuda = 'auto, taxi, SUV, camioneta'
   where nombre = 'Vehículo liviano' and ayuda = 'auto, SUV, camioneta';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'Se esperaba cambiar el ejemplo de Vehículo liviano y se cambiaron % filas', n;
  end if;
end $$;

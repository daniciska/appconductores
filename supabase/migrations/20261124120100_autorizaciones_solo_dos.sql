-- =====================================================================
-- Dale Contacto · "Antes de empezar": solo las 2 autorizaciones que se
-- usan hoy (S12, aprobada por los dueños el 24-nov).
--
-- POR QUÉ: antes de escribir su nombre, el conductor leía 4 textos y
-- marcaba 4 casillas. Dos ("Revisión de mis documentos" y "Mensajes") son
-- de funciones que la app todavía no tiene. Se pedirán justo cuando se
-- usen: la de documentos antes de subir el primero (Paso 5) y la de
-- mensajes antes del primer mensaje [verificar con abogado, P1].
--
-- QUÉ HACE: deja de ofrecer (vigente = false) las versiones 'prueba-1' de
-- revision_documentos y normas_mensajes. Siguen obligatorias y vigentes
-- terminos_privacidad y compartir_ficha. La app dibuja una casilla por
-- cada texto obligatorio vigente, así que muestra 2 sin cambiar el código.
--
-- POR QUÉ vigente = false y no obligatoria = false: un texto ya aceptado no
-- cambia de contenido ni de obligatoria (trigger proteger); vigente sí se
-- puede cambiar. Los textos no se borran: hay aceptaciones que los apuntan
-- y quedan como registro. Quien ya aceptó las 4 no tiene que hacer nada.
--
-- CUANDO SE CONSTRUYAN DOCUMENTOS O MENSAJES: se agrega para esa clave una
-- versión nueva con vigente = true (y la app la pide en ese momento).
-- =====================================================================

do $$
declare
  n int;
begin
  update public.textos_autorizacion set vigente = false
   where clave in ('revision_documentos', 'normas_mensajes') and vigente;
  get diagnostics n = row_count;
  if n <> 2 then
    raise exception 'Se esperaba dejar de ofrecer 2 textos y se cambiaron %', n;
  end if;

  if (select array_agg(clave order by orden) from public.textos_autorizacion
       where vigente and obligatoria and para_quien in ('conductor', 'todos'))
     is distinct from array['terminos_privacidad', 'compartir_ficha'] then
    raise exception 'Deben quedar vigentes y obligatorias solo terminos_privacidad y compartir_ficha';
  end if;
end $$;

-- =====================================================================
-- Dale Contacto · Perfil: "Confirmar ahora" solo cuando ya toca (S14,
-- aprobada por los dueños el 24-nov).
--
-- POR QUÉ: recién registrado, Perfil ofrecía "Confirmar ahora" con la
-- fecha de hoy, y parecía una tarea pendiente. La regla de reconfirmar cada
-- 30 días (dias_reconfirmar_disponibilidad) se mantiene.
--
-- QUÉ HACE: un ajuste público nuevo, dias_aviso_reconfirmar = 5: cuántos
-- días antes de cumplir el plazo vuelve a aparecer "Confirmar ahora" en
-- Perfil (con 30, desde el día 25). Antes se ve "Confirmado el dd/mm". Se
-- cambia desde el panel sin tocar la app. Si no se puede leer, la app usa 5.
-- =====================================================================

insert into public.ajustes (id, valor, descripcion, publico) values
  ('dias_aviso_reconfirmar', '5'::jsonb,
   'Cuántos días antes de cumplir el plazo de reconfirmar la disponibilidad vuelve a aparecer "Confirmar ahora" en el Perfil del conductor.',
   true);

-- =====================================================================
-- Dale Contacto · Quitar la tabla public.etmday_leads
--
-- POR QUÉ: apareció el 6-nov en el proyecto de Dale Contacto (migración
-- remota "etmday_leads_table", que no está en este repositorio). Es un
-- formulario de otro negocio (correo, intereses, metas, día). Estaba vacía,
-- nadie de afuera la podía leer, pero cualquiera podía escribir en ella.
-- La dueña no la reconoce y pidió borrarla (9-nov).
--
-- "if exists": en una base local creada desde este repositorio la tabla no
-- existe, y esta migración no debe fallar.
-- =====================================================================

drop table if exists public.etmday_leads;

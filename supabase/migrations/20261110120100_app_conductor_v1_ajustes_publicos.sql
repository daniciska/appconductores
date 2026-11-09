-- =====================================================================
-- Dale Contacto · App real del conductor v1 (pasos 1 a 4)
-- Ajustes que la app puede leer (RECOMENDADA, se puede aprobar aparte).
--
-- POR QUÉ: hoy public.ajustes solo la lee el equipo. El Paso 1, Inicio,
-- Perfil y "¿Sigues buscando trabajo?" muestran "cada N días"; sin esto,
-- N queda fijo en el código (30), contra la regla "todo configurable".
--
-- QUÉ HACE: una columna "publico" (por defecto false) y una política que
-- deja leer a anon y authenticated solo las filas marcadas. Escribir sigue
-- siendo solo del administrador. Nunca se marca público un ajuste sensible.
-- =====================================================================

alter table public.ajustes add column publico boolean not null default false;
comment on column public.ajustes.publico is
  'Si la app lo puede leer sin ser del equipo (también sin sesión). Nunca para ajustes sensibles.';

-- anon no tenía ningún permiso en ajustes; ahora lee, pero la RLS solo le
-- muestra las filas públicas. authenticated ya tenía select.
-- Una sola política de lectura (como en textos_autorizacion): dos políticas
-- permisivas para el mismo rol y acción las marca el asesor de rendimiento.
grant select on table public.ajustes to anon;
drop policy leer_equipo on public.ajustes;
create policy leer on public.ajustes for select to anon, authenticated
  using (publico or (select privado.es_equipo()));

insert into public.ajustes (id, valor, descripcion, publico) values
  ('dias_reconfirmar_disponibilidad', '30'::jsonb,
   'Cada cuántos días se le pide al conductor confirmar que sigue disponible para trabajar (propuesta).',
   true);

-- =====================================================================
-- Dale Contacto · App real del conductor v1 (pasos 1 a 4)
-- Textos de autorización de PRUEBA para la pantalla "Antes de empezar" (A4).
--
-- POR QUÉ: con public.textos_autorizacion vacía, la política
-- consentimientos.agregar_propio (exige un texto vigente) no deja guardar
-- ninguna autorización. Sin esto, la app no puede registrar lo que la
-- persona aceptó.
--
-- QUÉ SON: copia literal de las 4 casillas de la maqueta aprobada
-- (aplicacion/src/pantallas/ingreso/Autorizaciones.tsx, texto de cada
-- "etiqueta"). Versión 'prueba-1'. PROVISORIOS: el abogado no los revisó
-- (P1) y no existen todavía los Términos ni la Política de privacidad.
-- Solo para las pruebas internas de la dueña y su equipo.
--
-- CUANDO LLEGUEN LOS DEFINITIVOS (otra migración): para cada clave, poner
-- esta versión en vigente = false y agregar la versión 'v1' con
-- vigente = true y exige_aceptar_de_nuevo = true. Esta no se borra: hay
-- aceptaciones que la apuntan.
--
-- Corre como sistema (postgres): el trigger proteger no pone vigente_desde
-- para el sistema, por eso va a mano.
-- =====================================================================

insert into public.textos_autorizacion
  (clave, nombre, texto, enlace, version, para_quien, obligatoria, exige_aceptar_de_nuevo, vigente, vigente_desde, orden)
values
  ('terminos_privacidad', 'Términos y privacidad',
   'Acepto los Términos y la Política de privacidad, y declaro ser mayor de 18 años.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 1),
  ('compartir_ficha', 'Compartir ficha y contacto',
   'Autorizo que, cuando haga match, se compartan mi ficha y mi contacto (teléfono y email) con ese titular.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 2),
  ('revision_documentos', 'Revisión de documentos',
   'Revisión de mis documentos: un sistema automático los revisa primero; las dudas y los rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 3),
  ('normas_mensajes', 'Normas de los mensajes',
   'Mensajes: me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y bloquear.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 4);

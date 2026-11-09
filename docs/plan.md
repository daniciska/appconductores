# Plan de trabajo — Dale Contacto (nombre provisorio)

Actualizado: 9-nov-2026. Se actualiza a medida que avanzamos.

## Ya hecho

- [x] Reglas y decisiones del proyecto (`CLAUDE.md`).
- [x] Propuesta de campos (`docs/propuesta-campos.md`), propuesta de zonas (`docs/propuesta-zonas.md`) e investigación legal y de mercado (`docs/investigacion/`).
- [x] Maquetas generales y prototipo navegable de la experiencia del conductor (25 pantallas): https://claude.ai/artifact/N5JbJkK1ub26v14FpzhcAg
- [x] Bienvenida que le habla al conductor y al titular.

## Fase 1 — Diseño (en curso)

1. [ ] Pulir el prototipo del conductor (la dueña lo recorre y comenta).
2. [ ] **Modelo de datos interactivo**: tablas, campos y relaciones; la dueña marca cada campo "queda / cambiar / sacar". *(publicado, en revisión: https://claude.ai/artifact/1ACYaM3MWdn1yiMpe7pwkK)*
   - Se actualiza cada vez que cambia una pantalla de la maqueta; el porqué de cada cambio queda en `docs/modelo-datos-cambios.md`.
3. [ ] Prototipo del titular, con el mismo detalle (registro, verificación, búsquedas, resultados, planes y pago, mensajes, compartir contacto).
4. [ ] Maquetas del panel de administración (revisión de documentos, configuración de campos, catálogos —con activar o desactivar cada negocio—, reglas de match y zonas, reportes, usuarios).
5. [ ] Retomar lo que está en pausa: documentos, mensajes y zonas.
7. [x] **Mockup funcional** (4-nov): conductor completo y bolsa de trabajo, con datos de ejemplo, en Expo (`aplicacion/`). **Publicado** en https://dale-contacto-mockup.netlify.app (proyecto Netlify `dale-contacto-mockup`).
   - [x] **Sin panel de administración** (pedido de la dueña, 7-nov; publicado el 7-nov). Su código quedó guardado en `aplicacion/src/panel/`. En la demo, la revisión de la persona del equipo se simula sola (~12 s) y hay un atajo para ver un documento no aprobado.
   - [x] El panel será una **app aparte** con la misma tecnología, construida junto con el panel real (decidido el 9-nov; `docs/propuesta-panel-administracion.md`). Sin demo aparte del panel.
   - [ ] La dueña: registro DNS `mockup` (CNAME a `dale-contacto-mockup.netlify.app.`) en su hosting y agregar `mockup.dalecontacto.cl` en Netlify (Domain management).
   - [ ] Decidir quién puede verlo: solo su cuenta de Netlify (como está hoy), con contraseña o abierto.
   - [ ] Revisar las reglas que el mockup tuvo que inventar: qué pasa al bajar de plan, textos de rechazo de los PDF, si el equipo ve la dirección del conductor y el pie "Sugerencias de Google Maps".
   - Para actualizarlo: `npx expo export -p web` en `aplicacion/` y subir `dist/` a ese proyecto.
6. [ ] **Bolsa de trabajo** (pedida el 2-nov): maqueta del conductor y del titular, y modelo de datos. Después, decidir si sale en el lanzamiento y qué incluye cada plan (`docs/propuesta-bolsa-trabajo.md`).

## Para empezar a construir (revisado el 2-nov)

Se puede partir por la **base de datos y la app del conductor** mientras se termina el prototipo del titular. Para eso falta:

- [x] Visto bueno al prototipo del conductor: las pantallas del mockup, tal como están (9-nov).
- [ ] Revisar el modelo de datos, al menos las tablas del conductor y los catálogos.
- [x] Decisiones que cambian la base de datos y el match (2-nov): años por categoría, días proporcionales, negocios no permitidos en gris, modo de contrato como crecimiento futuro, pregunta de peso o pasajeros, lanzamiento con Taxi y Taxi ejecutivo.
- [x] Propuesta de zonas aprobada (2-nov).
- [x] Acceso a Supabase: conector conectado (2-nov).
- [x] Organización "Dale Contacto" y proyecto dale-contacto en São Paulo (2-nov).

Antes de construir la parte del titular: su prototipo, las reglas de mensajes (en pausa) y las maquetas del panel.

## Fase 2 — Construcción

6. [ ] Base de datos en Supabase (tablas y seguridad: quién ve qué).
   - [x] **Etapa 1** (2-nov): catálogos, cuentas, equipo, autorizaciones y perfil del conductor. Aplicada en dale-contacto, idéntica a lo probado en local (261 pruebas). Asesor de seguridad sin avisos.
   - [ ] Etapa 2: titulares, búsquedas y match. Etapa 3: documentos, mensajes, reportes y bloqueos. Etapa 4: planes y cobro. (Bolsa de trabajo: cuando se decida.)
   - [ ] Crear el primer administrador (a mano, después de que la dueña entre una vez con su celular; ver `supabase/README.md`).
7. [ ] **App del conductor** (en curso desde el 9-nov): conectada a Supabase, primera versión con los pasos 1 a 4; al inicio solo celulares de prueba de la dueña y su equipo; comuna de una lista hasta tener Google Maps. Documentos (paso 5) después, con la Etapa 3 y el abogado.
8. [ ] App del titular y cobro.
9. [ ] Panel de administración: **app web aparte** (Expo, mismo repositorio, comparte diseño, tipos y reglas del match; su propia dirección y su propio sitio de Netlify). Se construye junto con la Etapa 3 de la base (documentos). Antes: las decisiones abiertas de `docs/propuesta-panel-administracion.md`.
10. [ ] **Lanzamiento como app web** (decidido el 2-nov): dominio propio, alojamiento y pago web.
11. [ ] Después: prueba cerrada (Google exige 12 personas durante 14 días a cuentas personales) y publicación en App Store y Google Play, con el mismo código.

## Lo que depende de la dueña (en paralelo, cuanto antes)

- [ ] Abogado: antecedentes, Hoja de Vida, datos personales, términos y privacidad. **Bloquea el lanzamiento.**
- [ ] Cuentas de Apple Developer y Google Play (para la etapa de tiendas; ya no bloquean el lanzamiento web).
- [x] Dominio propio: dalecontacto.cl (NIC Chile). Hosting propio (confirmar proveedor y HTTPS).
- [ ] Precios de los planes.
- [x] Nombre: Dale Contacto. Falta registrar la marca en INAPI (recomendado).
- [ ] Juntar a las 12 personas de prueba (para la etapa de tiendas).
- [ ] Twilio para los SMS (puede esperar a la construcción).

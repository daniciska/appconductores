# Plan de trabajo — Dale Contacto (nombre provisorio)

Actualizado: 2-nov-2026. Se actualiza a medida que avanzamos.

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
6. [ ] **Bolsa de trabajo** (pedida el 2-nov): maqueta del conductor y del titular, y modelo de datos. Después, decidir si sale en el lanzamiento y qué incluye cada plan (`docs/propuesta-bolsa-trabajo.md`).

## Para empezar a construir (revisado el 2-nov)

Se puede partir por la **base de datos y la app del conductor** mientras se termina el prototipo del titular. Para eso falta:

- [ ] Visto bueno al prototipo del conductor (o la última lista de ajustes).
- [ ] Revisar el modelo de datos, al menos las tablas del conductor y los catálogos.
- [x] Decisiones que cambian la base de datos y el match (2-nov): años por categoría, días proporcionales, negocios no permitidos en gris, modo de contrato como crecimiento futuro, pregunta de peso o pasajeros, lanzamiento con Taxi y Taxi ejecutivo.
- [x] Propuesta de zonas aprobada (2-nov).
- [x] Acceso a Supabase: conector conectado (2-nov).
- [x] Organización "Dale Contacto" y proyecto dale-contacto en São Paulo (2-nov).

Antes de construir la parte del titular: su prototipo, las reglas de mensajes (en pausa) y las maquetas del panel.

## Fase 2 — Construcción

6. [ ] Base de datos en Supabase (tablas y seguridad: quién ve qué).
7. [ ] App del conductor.
8. [ ] App del titular y cobro.
9. [ ] Panel de administración.
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

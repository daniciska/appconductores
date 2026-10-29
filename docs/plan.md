# Plan de trabajo — Dale Contacto (nombre provisorio)

Actualizado: 29-oct-2026. Se actualiza a medida que avanzamos.

## Ya hecho

- [x] Reglas y decisiones del proyecto (`CLAUDE.md`).
- [x] Propuesta de campos (`docs/propuesta-campos.md`), propuesta de zonas (`docs/propuesta-zonas.md`) e investigación legal y de mercado (`docs/investigacion/`).
- [x] Maquetas generales y prototipo navegable de la experiencia del conductor (25 pantallas): https://claude.ai/artifact/N5JbJkK1ub26v14FpzhcAg
- [x] Bienvenida que le habla al conductor y al titular.

## Fase 1 — Diseño (en curso)

1. [ ] Pulir el prototipo del conductor (la dueña lo recorre y comenta).
2. [ ] **Modelo de datos interactivo**: tablas, campos y relaciones; la dueña marca cada campo "queda / cambiar / sacar". *(en curso)*
   - Se actualiza cada vez que cambia una pantalla de la maqueta; el porqué de cada cambio queda en `docs/modelo-datos-cambios.md`.
3. [ ] Prototipo del titular, con el mismo detalle (registro, verificación, búsquedas, resultados, planes y pago, mensajes, compartir contacto).
4. [ ] Maquetas del panel de administración (revisión de documentos, configuración de campos, catálogos, reglas de match y zonas, reportes, usuarios).
5. [ ] Retomar lo que está en pausa: documentos, mensajes y zonas.

## Fase 2 — Construcción

6. [ ] Base de datos en Supabase (tablas y seguridad: quién ve qué).
7. [ ] App del conductor.
8. [ ] App del titular y cobro.
9. [ ] Panel de administración.
10. [ ] Prueba cerrada (Google exige 12 personas durante 14 días a cuentas personales) y publicación en App Store y Google Play.

## Lo que depende de la dueña (en paralelo, cuanto antes)

- [ ] Abogado: antecedentes, Hoja de Vida, datos personales, términos y privacidad. **Bloquea el lanzamiento.**
- [ ] Cuentas de Apple Developer y Google Play.
- [ ] Precios de los planes.
- [ ] Nombre definitivo (INAPI, dominios, tiendas).
- [ ] Juntar a las 12 personas de prueba.
- [ ] Twilio para los SMS (puede esperar a la construcción).

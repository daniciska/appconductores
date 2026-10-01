# CLAUDE.md — App Conductores

Este archivo guía a Claude (y a cualquier colaborador) al trabajar en este repositorio.

## Reglas de trabajo con Claude

- **No inventar ni asumir.** Toda decisión de producto, negocio o técnica que no esté escrita en este archivo debe preguntarse a la dueña del proyecto antes de construir.
- **Preguntar antes de construir.** Antes de escribir código o crear estructura nueva, confirmar el alcance.
- **MVP = "Minimum Value Product".** Lo mínimo que ya sea **vendible** (que un titular pague por usarlo). Salir a las tiendas lo antes posible; cada funcionalidad debe justificar que ayuda a vender, a hacer match o que la exige la ley. Lo demás se anota como "futuro" y no se construye sin aprobación.
- **Todo configurable.** Los campos de perfil, opciones y catálogos (por ejemplo, modos de contrato) deben poder modificarse sin reescribir la app.
- Idioma de trabajo y documentación: español.
- Cuando se tome una decisión, se registra en la sección "Decisiones tomadas" de este archivo.

## Visión del producto

App móvil para publicar en **App Store** y **Google Play** que funciona como **punto de encuentro (match)** entre:

- **Conductores**, y
- **Titulares**: dueños de vehículos o empresas que buscan conductores para sus vehículos.

### Captación de conductores (canal de negocio, no funcionalidad de la app por ahora)

- Publicidad directa en sitios donde los conductores se publicitan a sí mismos.
- Captación activa.

## Alcance del MVP (lo definido hasta ahora)

1. **Perfil del Conductor** — perfil mínimo con:
   - Información personal
   - Experiencia
   - Modo de contrato
2. **Perfil del Titular / Empresa** — perfil mínimo con:
   - Información personal / de la empresa
   - Experiencia (lo que se busca/requiere — *por confirmar*)
   - Modo de contrato
3. **Match** entre conductores y titulares/empresas a partir de esos perfiles.

Los campos concretos de cada sección **no están definidos todavía** y deben ser configurables.

## Decisiones pendientes (preguntar antes de construir)

### Producto
- [ ] Con P4 aprobado quedan solo 3 variables en el % (M2 zona, M4 años, M6 estacionamiento): con 80% deben coincidir las 3. ¿Se mantiene así, se baja el umbral o alguna variable vuelve al %?
- [ ] P5–P7, P9, P12, P15, P16 de `docs/propuesta-campos.md`.
- [ ] Plazo comprometido de revisión de documentos.
- [ ] Precio de cada plan de suscripción.
- [ ] Nombre de la app / marca — *por definir* (`docs/propuesta-nombres.md`).

### Técnico
- [ ] Stack móvil (por ejemplo, multiplataforma vs. nativo).
- [ ] Backend / base de datos / autenticación.
- [ ] Método de registro e inicio de sesión.
- [ ] Crear cuentas de desarrollador de Apple y Google Play (no existen aún) — ¿a nombre de persona o de empresa?

### Legal
- [ ] Términos y condiciones, política de privacidad y tratamiento de datos personales según la normativa chilena.
- [ ] P1: consulta con abogado (Hoja de Vida, fotos de documentos, base legal, revisión automatizada por IA, transferencia internacional de datos).

## Decisiones tomadas

- **País de lanzamiento del MVP:** Chile.
- **Tipos de vehículo:** todos.
- **Modos de contrato (opciones iniciales, configurables):** arriendo fijo; % de ganancia; % sobre producción.
- **Match:** automático. Se calcula el % de variables que coinciden entre conductor y titular; si coinciden en **80% o más** hay match. El umbral es configurable.
- **Filtros obligatorios del match (P3):** tipo de vehículo (F1), licencia habilitante (F2) y misma región (F3) quedan **fuera del %**: si no se cumplen, no hay match.
- **Después del match:** sin chat interno en el MVP; siguen por fuera de la app.
- **Campos de perfil:** se aprueba por ahora la propuesta C1–C18 y T1–T19 de `docs/propuesta-campos.md` (sin correcciones).
- **Perfil titular (P2):** un solo perfil con selector "Persona natural / Empresa". Los bloques Experiencia y Contrato del titular van por **búsqueda** (un vehículo o grupo de vehículos iguales).
- **Filtros adicionales (P4):** modo de contrato (M1), turno (M3) y garantía (M5) también pasan a ser **filtros obligatorios**, fuera del %.
- **Revisión de documentos (P8):** sistema mixto. Un **agente de IA pre-revisa** (lee el documento y compara con lo declarado); los casos claros se aprueban automáticamente y las dudas y rechazos los decide una **persona** en el panel [verificar con abogado: decisiones automatizadas y transferencia internacional de datos].
- **Qué ve el conductor tras un match:** solo **cuántas veces ha hecho match** (o que no ha hecho). Qué más ve debe ser **configurable** desde el panel y se decide más adelante.
- **Contacto (P10):** por ahora **solo el titular ve el contacto del conductor**. El conductor no ve el contacto del titular.
- **Monetización MVP:** suscripción mensual que paga el titular/empresa. **El conductor usa la app gratis** (por ahora).
- **Planes (P13):** distintas suscripciones según volumen de búsquedas activas. Propuesta inicial aceptada (configurable): **Básico** 1 búsqueda, **Flota chica** 5, **Flota** 20. Precios por definir.
- **Titular sin suscripción (P11):** no ve perfiles ni contactos; sí ve un **adelanto anónimo** (ej. "hay 8 conductores verificados para tu búsqueda").
- **Cobro (P14):** **dentro y fuera de la app** (compra integrada de Apple/Google + pago web). Ver restricciones de tiendas en `docs/propuesta-campos.md` P14 [verificar].
- **Verificación de documentos:** sí, incluida en el MVP.
- **Configurable =** mediante un **panel de administración**.
- **Cuentas de desarrollador:** aún no existen (Apple ni Google).

## Documentos de referencia

- `docs/propuesta-campos.md` — propuesta de campos (C# conductor, T# titular, F# filtros, M# variables de match, D# documentos, P# preguntas). **Es una propuesta, no una decisión.**
- `docs/propuesta-nombres.md` — nombres candidatos con conflictos encontrados. **Propuesta.**
- `docs/investigacion/contexto-chile.md` — licencias, documentos verificables, Ley 21.719 / 19.628, Ley 21.553, modalidades de contrato.
- `docs/investigacion/mercado-avisos.md` — cómo se publicitan conductores/titulares hoy, competidores (Uber Match, Portal Conductores, etc.).

Lo marcado **[verificar]** en esos documentos no está confirmado y no debe tratarse como hecho.

## Estado del repositorio

Sin código todavía. Solo documentación y propuestas.

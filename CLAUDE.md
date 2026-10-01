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
- [ ] Campos exactos de cada perfil — *propuesta en revisión por la dueña* (`docs/propuesta-campos.md`).
- [ ] ¿Titular persona natural y empresa son el mismo tipo de perfil o dos distintos?
- [ ] Qué variables entran al cálculo de match y si alguna es filtro obligatorio.
- [ ] Qué documentos se verifican y cómo.
- [ ] Precio de la suscripción y medio de pago.
- [ ] Qué puede ver/hacer un titular sin suscripción activa (¿nada, o registrarse y ver un adelanto?).
- [ ] ¿El conductor usa la app gratis?
- [ ] Nombre de la app / marca — *propuestas en revisión*.

### Técnico
- [ ] Stack móvil (por ejemplo, multiplataforma vs. nativo).
- [ ] Backend / base de datos / autenticación.
- [ ] Método de registro e inicio de sesión.
- [ ] Crear cuentas de desarrollador de Apple y Google Play (no existen aún) — ¿a nombre de persona o de empresa?

### Legal
- [ ] Términos y condiciones, política de privacidad y tratamiento de datos personales según la normativa chilena.

## Decisiones tomadas

- **País de lanzamiento del MVP:** Chile.
- **Tipos de vehículo:** todos.
- **Modos de contrato (opciones iniciales, configurables):** arriendo fijo; % de ganancia; % sobre producción.
- **Match:** automático. Se calcula el % de variables que coinciden entre conductor y titular; si coinciden en **80% o más** hay match. El umbral es configurable.
- **Después del match:** se muestra el contacto (teléfono/email) y siguen por fuera de la app. Sin chat interno en el MVP.
- **Monetización MVP:** suscripción mensual que paga el titular/empresa. Sin pago no tiene acceso.
- **Verificación de documentos:** sí, incluida en el MVP.
- **Configurable =** mediante un **panel de administración**.
- **Cuentas de desarrollador:** aún no existen (Apple ni Google).

## Estado del repositorio

Repositorio recién creado. Sin código todavía.

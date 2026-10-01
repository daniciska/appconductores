# CLAUDE.md — App Conductores

Este archivo guía a Claude (y a cualquier colaborador) al trabajar en este repositorio.

## Reglas de trabajo con Claude

- **No inventar ni asumir.** Toda decisión de producto, negocio o técnica que no esté escrita en este archivo debe preguntarse a la dueña del proyecto antes de construir.
- **Preguntar antes de construir.** Antes de escribir código o crear estructura nueva, confirmar el alcance.
- **MVP primero.** El objetivo es salir a las tiendas lo antes posible; cualquier funcionalidad fuera del MVP se anota como "futuro" y no se construye sin aprobación.
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
- [ ] Campos exactos de "información personal", "información de empresa", "experiencia" y "modo de contrato".
- [ ] ¿Titular persona natural y empresa son el mismo tipo de perfil o dos distintos?
- [ ] ¿Cómo funciona el match? (búsqueda/filtros manuales, sugerencias automáticas, "me interesa" mutuo, etc.)
- [ ] ¿Qué pasa después del match? (chat en la app, mostrar contacto, nada más en el MVP)
- [ ] Tipos de vehículo considerados.
- [ ] País/es de lanzamiento.
- [ ] ¿Verificación de documentos (licencia, antecedentes) en el MVP o después?
- [ ] Modelo de monetización (gratis, suscripción, pago por contacto, etc.) y si aplica en el MVP.
- [ ] Nombre de la app / marca.

### Técnico
- [ ] Stack móvil (por ejemplo, multiplataforma vs. nativo).
- [ ] Backend / base de datos / autenticación.
- [ ] Método de registro e inicio de sesión.
- [ ] Qué significa "configurable": ¿desde un panel de administración, desde archivos de configuración, u otro?
- [ ] Cuentas de desarrollador de Apple y Google (¿existen ya?).

### Legal
- [ ] Términos y condiciones, política de privacidad y tratamiento de datos personales según el país de lanzamiento.

## Decisiones tomadas

_(vacío — se irá completando)_

## Estado del repositorio

Repositorio recién creado. Sin código todavía.

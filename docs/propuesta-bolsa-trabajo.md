# Propuesta: bolsa de trabajo

**Estado:** se diseña ahora en la maqueta y en el modelo de datos. **Si sale en el lanzamiento se decide después** (2-nov). Mientras no se decida, la bolsa queda **apagada desde el panel** (ajuste `bolsa_activa`).

## Qué pidió la dueña (2-nov)

Que los titulares o empresas puedan abrir sus ofertas (vehículos para trabajar) a una **bolsa de trabajo**. Según el plan, pueden dejar la oferta visible solo para ciertos perfiles o para todos.

## Lo que ya respondió (2-nov)

| Tema | Respuesta |
|---|---|
| ¿Cuándo? | Diseñar ahora y decidir después si sale en el lanzamiento. |
| ¿Qué hace el conductor con una oferta? | **Postular** ("Me interesa"). El titular recibe su ficha y decide si le escribe o le muestra su contacto. El titular mantiene el control. |
| ¿Quién puede ver una oferta? | Tres niveles, a elección del titular: **solo quienes hacen match** (como hoy), **los perfiles que él elige** y **todos los conductores**. **No** se publica en dalecontacto.cl para personas sin cuenta. |
| ¿Qué depende del plan? | **Nivel de visibilidad**, **cuántas ofertas** puede tener en la bolsa, **destacar** una oferta y **ver quién postuló**. Sin plan, el titular solo ve cuántos postularon, igual que el adelanto anónimo de hoy. |

## Cómo funcionaría (propuesta de Claude, por confirmar)

1. **Una oferta de la bolsa es una búsqueda publicada.** El titular crea su búsqueda como hoy y prende "Publicar en la bolsa de trabajo". No hay una segunda ficha que llenar.
2. **El titular elige quién la ve**, entre los niveles que permite su plan:
   - **Solo quienes hacen match:** pasan los filtros obligatorios y llegan al umbral (66 %).
   - **Perfiles que tú elijas:** el titular marca condiciones que funcionan como filtros, por ejemplo zonas, años mínimos, turno, días y estacionamiento. La licencia habilitante y la región se exigen siempre.
   - **Todos los conductores:** la ven todos los conductores cuya licencia permite ese negocio.
3. **El conductor ve la bolsa** en una pestaña nueva, "Bolsa". Ahí aparecen las ofertas que puede ver, con las destacadas primero. Si una oferta también hace match con él, lo indica.
4. **El conductor postula** con "Me interesa". El titular ve su ficha igual que en un match. En "Mis postulaciones" el conductor sigue el estado: Enviada, Vista, Te escribió, Cerrada.
5. **El titular responde desde "Postulantes":** ve la ficha, le escribe o lo descarta. Si le escribe, se abre una conversación igual a la de un match, con el mismo chat, favoritos y registro de "Quién recibió mis datos".
6. **Sin plan**, el titular ve "5 conductores postularon" y una invitación a elegir un plan.

## Planes (propuesta para decidir; números por definir)

| | Básico | Flota chica | Flota |
|---|---|---|---|
| Búsquedas activas (decidido) | 1 | 5 | 20 |
| Ofertas en la bolsa | [N] | [N] | [N] |
| Solo quienes hacen match | ✓ | ✓ | ✓ |
| Perfiles que tú elijas | — | ✓ | ✓ |
| Todos los conductores | — | — | ✓ |
| Destacar ofertas | — | — | [N] al mes |
| Ver fichas de quienes postularon | ✓ | ✓ | ✓ |

Cada valor se cambia desde el panel (tabla `planes`).

## Preguntas abiertas

Están en el modelo de datos como preguntas pendientes (MD).

- ¿Puede postular un conductor con el perfil incompleto o sin verificar? *Propuesta: solo verificado y "Disponible para trabajar", igual que para aparecer en los matches.*
- ¿Qué condiciones puede elegir el titular en "Perfiles que tú elijas"?
- ¿Qué incluye cada plan: visibilidad, cuántas ofertas, cuántas destacadas y por cuánto tiempo?
- ¿Un titular sin plan puede publicar en la bolsa, o solo ver el conteo de postulantes?
- Al postular, ¿el conductor puede escribir un mensaje corto, o solo toca "Me interesa"?
- ¿Hay un límite de postulaciones por día para evitar el spam?

## Impacto legal (para la consulta con el abogado)

Postular es entregar datos: el conductor manda su ficha a un titular con el que quizás no hay match. Hay que dejar constancia en "Quién recibió mis datos" y cubrirlo en los Términos y la Política de privacidad.

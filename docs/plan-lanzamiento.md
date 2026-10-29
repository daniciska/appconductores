# Plan para tener la app operativa en 2 semanas

> **Estado: propuesta para revisar con la dueña.** Nada de esto se construye hasta que confirme la sección 1 (qué significa "operativa") y las decisiones de la sección 7.
> Fecha de la propuesta: 29-oct-2026. Ventana: **lunes 2-nov a viernes 13-nov** (10 días hábiles), con jueves 29 y viernes 30-oct como "día 0" para cuentas y decisiones.

---

## 1. Qué significa "operativa" en 2 semanas (propuesta)

En 2 semanas **sí** se puede tener la app funcionando en celulares reales, con conductores y titulares reales, haciendo match. **No** se puede garantizar que esté publicada para cualquier persona en las dos tiendas, por razones que no dependen del código (sección 2).

Propongo esta meta para el viernes 13-nov:

| Meta | Qué incluye |
|---|---|
| **Piloto cerrado funcionando** | App instalada en iPhone (TestFlight) y Android (prueba cerrada de Google Play) de un grupo de conductores y titulares invitados. |
| **Flujo completo de punta a punta** | Registro con celular → perfil → documentos → revisión en el panel → match → el titular ve la ficha y el contacto del conductor. |
| **Panel web operativo** | Revisar documentos, ver usuarios, activar suscripciones, editar catálogos, zonas y la configuración del match. |
| **Envío a revisión de Apple** | Si la política de privacidad y los términos están listos (depende del abogado, P1). |

Lo que llega **después** del piloto (semanas 3-5): publicación abierta en Google Play, cobro integrado de Apple/Google, pago web, agente de IA para pre-revisar documentos.

---

## 2. Lo que imponen las tiendas y la ley (no depende de nosotros)

| Restricción | Efecto en el plazo |
|---|---|
| **Google Play, cuenta personal nueva:** antes de publicar en producción exige una **prueba cerrada con al menos 12 testers durante 14 días seguidos** [verificar la regla vigente al crear la cuenta]. | Publicación abierta en Android: **no antes de ~3 semanas** desde que la prueba cerrada parte. Por eso hay que conseguir los 12+ testers **ya**. Las cuentas de organización (empresa) no tienen esta regla, pero piden D-U-N-S y tardan más. |
| **Apple Developer (persona natural):** la inscripción tarda de horas a pocos días; la revisión de cada versión, 1 a 3 días [verificar]. | Crear la cuenta hoy. |
| **Política de privacidad publicada y botón "Eliminar mi cuenta"** (Apple 5.1.1; Google Play pide lo mismo y un enlace web de borrado [verificar]). | Sin el texto legal no hay envío a revisión. Depende de P1 (abogado). |
| **Compras dentro de la app (suscripción):** requieren contratos de pago, datos bancarios y tributarios en App Store Connect y Google Play Console, y aprobación del producto. | Lleva días de trámites. Para el piloto propongo **activar las suscripciones a mano desde el panel** (sección 3). |
| **Ley 21.719 rige desde el 1-dic-2026** (salvo que se apruebe la postergación [verificar]). | El lanzamiento abierto caería justo después. Refuerza la urgencia de P1. |
| **SMS reales:** los "números de prueba" de Supabase solo sirven para números fijados de antemano; **personas reales no pueden entrar con ellos**. | Para el piloto **hay que contratar un proveedor de SMS** (ej. Twilio). Esto adelanta una decisión que estaba "para después". |

---

## 3. Alcance de las 2 semanas

### Entra (piloto)

**App — Conductor** (según el prototipo "Experiencia del conductor"):
- Ingreso con celular + código SMS.
- Perfil en 5 pasos con los campos C1–C15 aprobados.
- Subida de documentos: cédula, licencia, Hoja de Vida y Certificado de Antecedentes. Estados: pendiente / aprobado / rechazado con motivo.
- Lista de matches (sin contacto del titular), favoritos.
- Pausar / reactivar disponibilidad, editar perfil, eliminar cuenta.

**App — Titular / Empresa:**
- Ingreso con celular + código SMS.
- Perfil con selector Persona natural / Empresa (T1–T7).
- Crear búsquedas (T8–T17), según el plan.
- Sin suscripción: adelanto anónimo ("hay N conductores verificados para tu búsqueda").
- Con suscripción: lista de conductores con match, ficha, contacto, favoritos.
- **Faltan maquetas del titular** → se diseñan y aprueban los días 1-3.

**Match:** automático, con filtros F1 vehículo, F2 licencia, F3 región, M1 modo, M3 turno y el % con M2 zona, M4 años, M6 estacionamiento; umbral 66 %. Todo leído desde la configuración del panel.

**Panel web:**
- Cola de revisión de documentos (aprobar / rechazar con motivo; borrar el archivo al decidir).
- Usuarios (conductores y titulares), con búsqueda.
- Suscripciones: activar / desactivar plan a mano (Básico 1, Flota chica 5, Flota 20).
- Configuración: catálogos (vehículos, licencias, modos de contrato, turnos), tabla vehículo → licencia, zonas, filtros, variables, pesos y umbral.
- Acceso solo para administradoras.

### Se simplifica para el piloto (propuesta, confirmar)

| Funcionalidad decidida | Versión piloto | Versión completa (después) |
|---|---|---|
| Cobro dentro y fuera de la app (P14) | Activación manual en el panel; el titular paga por transferencia o link de pago, o el piloto es gratis | Compra integrada Apple/Google + pago web |
| Revisión mixta IA + persona (P8) | Solo persona en el panel | Agente de IA pre-revisa; la persona decide dudas y rechazos |
| Mensajes conductor → titular | **Opción A:** fuera del piloto (el titular ya ve el contacto del conductor y puede llamarlo). **Opción B:** mensajes simples de texto, sin adjuntos, con reportar/bloquear | Mensajes + "revelar mi contacto" + reportar/bloquear |
| Notificaciones | Push básicas: nuevo match, documento revisado | Configurables, correo, recordatorios de vencimiento |

### Queda fuera (futuro, no se construye sin aprobación)

Agente de IA de documentos, pagos integrados, renovación automática de documentos, "quiénes recibieron mis datos" (pendiente de P1), estadísticas en el panel, identidad visual definitiva.

---

## 4. Estructura técnica

### Repositorio (un solo repo, varias partes)

```
appconductores/
├── apps/
│   ├── mobile/          App React Native + Expo (TypeScript) — conductor y titular en la misma app
│   └── admin/           Panel web (TypeScript)
├── packages/
│   └── shared/          Código común: tipos, validación de RUN/RUT, cálculo del match, textos
├── supabase/
│   ├── migrations/      Tablas, permisos (RLS) y funciones SQL
│   ├── functions/       Funciones de servidor (ej. recalcular matches, notificaciones)
│   └── seed/            Catálogos iniciales y zonas (desde docs/propuesta-zonas.csv)
├── docs/                Documentación y propuestas (lo que ya existe)
└── CLAUDE.md
```

Herramientas propuestas (confirmar): **pnpm** para manejar el repo, **Expo Router** para la navegación de la app, **EAS Build** para generar las versiones de iPhone y Android, y **Next.js en Vercel** para el panel web.

### Modelo de datos (resumen)

| Tabla | Para qué |
|---|---|
| `profiles` | Una fila por usuario: rol (conductor / titular / admin), teléfono, estado |
| `drivers` | Datos del conductor (C1–C15) |
| `owners` | Datos del titular / empresa (T1–T7) |
| `searches` | Búsquedas del titular (T8–T17) |
| `documents` | Documentos subidos, estado, motivo, fecha de revisión y vencimiento, quién revisó |
| `matches` | Resultado del match conductor ↔ búsqueda: % y variables que fallan |
| `favorites` | Favoritos de ambos lados |
| `subscriptions` | Plan, vigencia, búsquedas permitidas, origen (manual / Apple / Google / web) |
| `catalogs`, `catalog_items` | Listas configurables (vehículos, licencias, modos, turnos…) |
| `regions`, `communes`, `zones` | Geografía y zonas editables |
| `match_config` | Filtros activos, variables, pesos, umbral |
| `messages` | Solo si se elige la opción B de mensajes |

**Seguridad:** las reglas de acceso (RLS de Supabase) aseguran que el titular sin plan **nunca** reciba datos de conductores, que nadie vea el contacto del titular y que los archivos de documentos solo los vean las administradoras.

**Match:** se calcula en la base de datos cada vez que cambia un perfil, una búsqueda, un documento o la configuración, leyendo `match_config`. La lógica también vive en `packages/shared` para mostrar "coincide en N de M" y para probarla.

---

## 5. Plan día a día

### Día 0 — jue 29 y vie 30-oct (dueña, sin código)
- Crear cuentas **Apple Developer** y **Google Play Console** a nombre de la dueña.
- Dar acceso al proyecto de **Supabase** (o crear uno nuevo para la app).
- Confirmar la sección 1 y las decisiones de la sección 7.
- Empezar a reunir **12+ testers de Android** y un grupo piloto (conductores y titulares).
- Agendar al **abogado** (P1): política de privacidad, términos, consentimientos.

### Semana 1 — Base y conductor
| Día | Fecha | Trabajo |
|---|---|---|
| 1 | lun 2-nov | Estructura del repo, proyecto Expo, panel vacío, Supabase conectado. Sistema de diseño (colores, tipografía, componentes base) según las referencias aprobadas. |
| 2 | mar 3-nov | Tablas, permisos y catálogos iniciales (vehículos, licencias, comunas, zonas). Ingreso con celular + SMS. **Maquetas del titular para aprobar.** |
| 3 | mié 4-nov | Perfil del conductor en 5 pasos (C1–C15). |
| 4 | jue 5-nov | Documentos del conductor: subida, estados, avisos. Panel: inicio de sesión de admin y cola de revisión. |
| 5 | vie 6-nov | Cálculo del match + configuración en el panel. Pruebas del match con casos reales. **Primera versión instalable (TestFlight / prueba interna).** Revisión con la dueña. |

### Semana 2 — Titular, cierre y piloto
| Día | Fecha | Trabajo |
|---|---|---|
| 6 | lun 9-nov | Perfil del titular (persona / empresa) y búsquedas. |
| 7 | mar 10-nov | Vista del titular: adelanto anónimo, conductores con match, ficha y contacto, favoritos. Suscripción manual desde el panel. |
| 8 | mié 11-nov | Vista del conductor: lista de matches, favoritos, pausar, eliminar cuenta. Notificaciones push. Mensajes si se eligió la opción B. |
| 9 | jue 12-nov | Pulido visual, estados de carga / vacío / error, textos. Pruebas en iPhone y Android reales. Ficha de las tiendas (capturas, descripción). |
| 10 | vie 13-nov | **Arranca el piloto:** TestFlight + prueba cerrada de Google Play con los testers. Envío a revisión de Apple si el texto legal está listo. |

### Después del piloto (semanas 3-5, a confirmar)
- Correcciones según el piloto.
- Compra integrada Apple/Google y pago web.
- Agente de IA para pre-revisar documentos.
- Mensajes completos (si no entraron).
- Publicación abierta en Google Play al cumplir los 14 días de prueba cerrada.

---

## 6. Tareas de la dueña (en paralelo al desarrollo)

| Tarea | Para cuándo | Bloquea |
|---|---|---|
| Crear cuenta Apple Developer (USD 99/año) | 30-oct | Instalar en iPhone (día 5) |
| Crear cuenta Google Play Console (USD 25, verificación de identidad) | 30-oct | Prueba en Android y el conteo de 14 días |
| Acceso a Supabase | 30-oct | Todo |
| Cuenta Twilio (SMS ahora, WhatsApp después) | 2-nov | Que personas reales entren a la app |
| Cuenta Meta Business a su nombre + número dedicado para WhatsApp; iniciar verificación | 30-oct | Código por WhatsApp (puede tardar días) |
| Reunir 12+ testers Android y un piloto de conductores y titulares | 6-nov | Piloto y publicación en Google Play |
| Aprobar maquetas del titular | 4-nov | Días 6-7 |
| Abogado: política de privacidad, términos, consentimientos | 11-nov | Envío a Apple y publicación |
| Personas que revisarán documentos en el panel | 9-nov | Que haya conductores verificados en el piloto |
| Precios de los planes (o decidir piloto gratis) | 10-nov | Suscripción del titular |

---

## 7. Decisiones que necesito para empezar (bloquean el plan)

1. **¿Aceptas la meta de la sección 1** (piloto cerrado el 13-nov, publicación abierta después)?
2. **Cobro en el piloto:** ¿gratis, o pago por transferencia/link con activación manual en el panel?
3. **Mensajes:** ¿opción A (fuera del piloto) u opción B (mensajes simples)? Si es B, faltan las respuestas sobre mensajes que están en pausa (quién escribe primero, titular sin plan, reportar/bloquear).
4. **Documentos en el piloto:** ¿se piden los 4 (cédula, licencia, Hoja de Vida, antecedentes) aunque la consulta con el abogado no esté hecha? ¿Qué criterio usa la persona que revisa para rechazar? (hoy en pausa).
5. **Zonas:** ¿se carga la propuesta de `docs/propuesta-zonas.md` tal cual para el piloto (editable después)?
6. ~~**Proveedor de SMS**~~ — **Decidido (29-oct):** WhatsApp principal + SMS respaldo, vía Twilio; Meta Business a nombre de la dueña.
7. **Panel web:** ¿Next.js en Vercel está bien?
8. **Zona del piloto:** ¿todo Chile o partir captando en una región (ej. RM)? La app funciona igual; solo cambia dónde se buscan los testers.

---

## 8. Riesgos

| Riesgo | Cómo se reduce |
|---|---|
| El abogado no alcanza antes del 13-nov | El piloto cerrado puede partir igual (TestFlight y prueba cerrada no pasan revisión pública); el envío a Apple espera. |
| Pocos conductores verificados en el piloto | Captar conductores desde la semana 1; tener la cola de revisión al día. |
| Cambios de alcance durante las 2 semanas | Todo lo nuevo se anota como "futuro" y se evalúa al terminar el piloto. |
| Revisión de Apple rechaza la app | Cumplir desde el inicio: eliminar cuenta, reportar/bloquear si hay mensajes, política de privacidad, textos claros sobre la suscripción. |
| Prueba de 14 días de Google se retrasa | Cuenta creada el día 0 y testers reunidos antes del día 10. |

---

## 9. Cómo trabajamos

- **Una revisión corta con la dueña cada día** (o cada 2 días) con la versión instalada en su celular a partir del día 5.
- Cada funcionalidad se desarrolla en una rama, se revisa y se une a `main`.
- Toda decisión nueva se registra en `CLAUDE.md` ("Decisiones tomadas").
- Lo que no esté en este plan no se construye sin aprobación.

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
> **En pausa (8-oct):** por pedido de la dueña, las decisiones de documentos (criterios, renovación, alcance por tipo de vehículo), mensajes y zonas quedan en espera hasta revisar el prototipo completo de la experiencia del conductor.

- [ ] P5–P7, P9, P12, P15, P16 de `docs/propuesta-campos.md`.
- [ ] Plazo comprometido de revisión de documentos.
- [ ] Paso 4: si el conductor marca un negocio que su licencia no permite, ¿se deja marcar (y el match lo filtra por licencia) o se muestra en gris con la licencia que pide?
- [ ] Variable M4 (años) con experiencia por vehículo. *Propuesta:* comparar los años del conductor con el tipo de vehículo de la búsqueda contra el mínimo del titular. ¿O se mantiene también un total general de años?
- [ ] Recordatorios para completar el perfil: cada cuánto, cuántas veces y por qué canal primero (WhatsApp o correo).
- [ ] Criterios de rechazo de Hoja de Vida y antecedentes, y cada cuánto se renuevan.
- [ ] Mensajes: ¿el titular también puede escribir primero? ¿Un titular **sin plan** puede leer/responder mensajes? ¿Reportar/bloquear (exigido por las tiendas)? ¿Cuánto tiempo se guardan los mensajes?
- [ ] Zonas: revisar la propuesta de `docs/propuesta-zonas.md`.
- [ ] Precio de cada plan de suscripción.
- [ ] Nombre definitivo de la app / marca (hoy provisorio: **Dale Contacto**; falta revisar INAPI, dominios y tiendas).

### Técnico
- [ ] Cuenta de Google Cloud para Google Maps Places (sugerencias de dirección): costo por uso y condiciones de qué datos se pueden guardar [verificar].
- [ ] Proveedor para enviar el código por **WhatsApp y SMS** (ej. Twilio; confirmar que Supabase lo soporta [verificar]) — *se deja para después*; mientras tanto, números de prueba de Supabase.
- [ ] Crear cuentas Apple Developer y Google Play (a nombre de la dueña).
- [ ] Identidad visual (colores, tipografía, logo) — depende del nombre/marca.

### Legal
- [ ] Términos y condiciones, política de privacidad y tratamiento de datos personales según la normativa chilena. Lo que deben cubrir: `docs/terminos-y-privacidad.md`.
- [ ] P1: consulta con abogado (Hoja de Vida, fotos de documentos, base legal, revisión automatizada por IA, transferencia internacional de datos).

## Decisiones tomadas

- **País de lanzamiento del MVP:** Chile.
- **Tipos de vehículo:** todos.
- **Modos de contrato (opciones iniciales, configurables):** arriendo fijo; % de ganancia; % sobre producción.
- **Match:** automático. Se calcula el % de variables que coinciden entre conductor y titular. **Umbral inicial: 66%** (con las 3 variables actuales —M2 zona, M4 años, M6 estacionamiento— se acepta que falle 1). El umbral, las variables del %, los filtros y los pesos deben ser **configurables desde el panel**, porque se agregarán variables y el umbral cambiará.
- **Filtros obligatorios del match (P3):** tipo de vehículo (F1), licencia habilitante (F2) y misma región (F3) quedan **fuera del %**: si no se cumplen, no hay match.
- **Mensajes dentro de la app (cambia la decisión anterior de "sin chat"):** el conductor puede enviar un **mensaje privado** al titular/empresa de un match. El **contacto personal del titular/empresa no se muestra**, salvo que el titular lo **revele a un conductor en particular** con una función dentro de su perfil/conversación. La idea es conversar un poco antes de pasar a contacto fuera de la app.
- **Favoritos:** el conductor puede marcar como favoritos sus matches (búsquedas/titulares) y el titular/empresa puede marcar como favoritos a sus conductores.
- **Campos de perfil:** se aprueba por ahora la propuesta C1–C18 y T1–T19 de `docs/propuesta-campos.md` (sin correcciones).
- **Nombre del conductor (C1):** se pide en campos separados: **Nombres**, **Primer apellido** y **Segundo apellido (opcional)**.
- **RUN del conductor (C2):** **no se pide en el formulario**. Se obtiene de la foto de la cédula durante la verificación (el agente lo lee, la persona lo confirma) y solo lo ve el equipo. Sirve para verificar identidad y evitar cuentas duplicadas.
- **Email del conductor (C4):** ver "Correo electrónico (todos)". *Propuesta:* confirmarlo con un código o enlace al correo.
- **Contacto del conductor compartido tras el match:** **teléfono y correo** (los dos).
- **Registro mínimo del conductor (Paso 1):** celular verificado, correo, nombres y apellidos y **clases de licencia**. Al guardar, el conductor **ya queda registrado** y puede elegir **"Guardar y continuar"** o **"Guardar y terminar después"** (perfil incompleto). El resto (dónde vive, experiencia, cómo trabaja, documentos) se completa después. Con perfil incompleto **no entra al match**. Se le **recuerda por WhatsApp o correo** que complete su perfil (frecuencia por definir).
- **Dirección del conductor (Paso 2):** se pide la **dirección**, con **sugerencias de dirección completa desde Google Maps** (Places). De la dirección elegida se obtiene la **comuna verificada** (y su zona y región), que es la que se usa para el match. La dirección **no se muestra a nadie**; solo se entrega a un titular **si hay match y el conductor lo autoriza** ("Compartir mi dirección" en la conversación).
- **Textos en pantalla:** cortos; el detalle legal (privacidad, uso de datos) va en los Términos y la Política de privacidad, no en las pantallas.
- **Formularios (estilo):** los campos obligatorios se marcan con **asterisco (*)**, sin explicaciones largas debajo; si se intenta guardar sin un dato obligatorio, aparece una **alerta** y el campo se marca en rojo.
- **Zona del conductor:** se usa **solo la comuna de su dirección** (y su zona). Se eliminan las "otras comunas donde puede retirar" (C6) y la opción "cualquier comuna de mi región".
- **Experiencia del conductor (Paso 3):** mide su experticia según el **tamaño del vehículo** que ha manejado: "¿Qué vehículos has manejado?", con **selección múltiple** y **años con cada vehículo marcado**. Catálogo inicial (configurable): **Auto, Camioneta, Van, Camión 3/4, Grúa de autos, Moto, Bus, Camión pesado** (este último era "Camión + grande"; nombre por confirmar). Se eliminan el texto libre "Tu experiencia en pocas palabras" (C10) y el total general de años.
- **En qué quiere trabajar (antes C8, "vehículos que quiere manejar"):** es el **negocio** en el que el conductor quiere participar. No es experiencia. Va en el **Paso 4 "¿Cómo quieres trabajar?"** (junto con turnos y estacionamiento), con selección múltiple. Se muestran **todos** los negocios del catálogo (pedido de la dueña); qué pasa si marca uno que su licencia no permite está por definir. Catálogo inicial (configurable): **Taxi, Radiotaxi ejecutivo, Uber u otra app, Van o bus de turismo (pasajeros), Bus interurbano, Camión de carga interurbano, Camión de carga urbano (por confirmar), Moto delivery**.
- **Registro del conductor en 6 pasos:** 1 Tus datos · 2 Dónde vives · 3 Tu experiencia · 4 ¿Cómo quieres trabajar? (negocio, turnos, estacionamiento) · 5 **Modelo de contrato** (modos de contrato y garantía máxima opcional), en hoja separada por pedido de la dueña · 6 Documentos. Que la garantía vaya en el Paso 5 es interpretación de Claude, por confirmar.
- **Perfil titular (P2):** un solo perfil con selector "Persona natural / Empresa". Los bloques Experiencia y Contrato del titular van por **búsqueda** (un vehículo o grupo de vehículos iguales).
- **Filtros adicionales (P4):** modo de contrato (M1) y turno (M3) también son **filtros obligatorios**, fuera del %.
- **Garantía:** la dueña indica que en la práctica no existe → queda como **campo opcional** (C13 y T15). **No es filtro.** Por ahora tampoco entra al % (interpretación de Claude, por confirmar).
- **Zonas (M2):** se comparan por **zona = grupo de comunas** dentro de una región. Ejemplo de la dueña para la RM: zona Oriente, Poniente, Sur, Norte. Propuesta para todas las regiones en `docs/propuesta-zonas.md` (en revisión). Editables desde el panel.
- **Documentos obligatorios del conductor:** cédula, licencia, **Hoja de Vida del Conductor** y **Certificado de Antecedentes para fines especiales** (la dueña lo pide según la ley vigente y la que viene). Revisión: **agente de IA + persona** (ver P8). Riesgo legal por datos de infracciones penales (Ley 21.719 art. 25): ver `docs/investigacion/documentos-y-mensajes.md` [verificar con abogado].
- **Revisión de documentos (P8):** sistema mixto. Un **agente de IA pre-revisa** (lee el documento y compara con lo declarado); los casos claros se aprueban automáticamente y las dudas y rechazos los decide una **persona** en el panel [verificar con abogado: decisiones automatizadas y transferencia internacional de datos].
- **Qué ve el conductor tras un match:** con los mensajes y favoritos, el conductor necesita ver **la lista de sus matches** (tipo de vehículo, comuna, modo, turno, nombre del titular/empresa) **sin el contacto** del titular. *Propuesta en maquetas, por confirmar.* Debe ser configurable desde el panel.
- **Contacto (P10):** por ahora **solo el titular ve el contacto del conductor**. El conductor no ve el contacto del titular.
- **Monetización MVP:** suscripción mensual que paga el titular/empresa. **El conductor usa la app gratis** (por ahora).
- **Planes (P13):** distintas suscripciones según volumen de búsquedas activas. Propuesta inicial aceptada (configurable): **Básico** 1 búsqueda, **Flota chica** 5, **Flota** 20. Precios por definir.
- **Titular sin suscripción (P11):** no ve perfiles ni contactos; sí ve un **adelanto anónimo** (ej. "hay 8 conductores verificados para tu búsqueda").
- **Cobro (P14):** **dentro y fuera de la app** (compra integrada de Apple/Google + pago web). Ver restricciones de tiendas en `docs/propuesta-campos.md` P14 [verificar].
- **Verificación de documentos:** sí, incluida en el MVP.
- **Configurable =** mediante un **panel de administración**.
- **Cuentas de desarrollador:** aún no existen. Se crearán **a nombre de la dueña (persona natural)**, con la idea de pasarlas a una empresa más adelante.
- **App:** una sola app **multiplataforma** (iPhone y Android) con **React Native + Expo**, en TypeScript (mismo lenguaje para app, panel y funciones de servidor).
- **Calidad visual:** la dueña exige una app que se vea y funcione **profesional, de calidad, no ordinaria**. Diseño cuidado (sistema de diseño consistente, tipografía, espaciado, animaciones sutiles, estados de carga/vacío/error). Las pantallas se aprueban con maquetas antes de programarlas.
- **Cuenta Supabase:** ya existe (de la dueña).
- **Rama principal:** `main`.
- **Lenguaje de la app:** hablar de **vehículos** en general, no de taxis (la app cubre todos los tipos de vehículo).
- **Nombre provisorio:** **Dale Contacto** (para maquetas y desarrollo; fácil de cambiar).
- **Referencias visuales:** Fintual, Uber, apps minimalistas. Casi negro sobre blanco, grises neutros, mucho espacio y **un solo acento** (amarillo). Maquetas: https://claude.ai/artifact/N5JbJkK1ub26v14FpzhcAg (en revisión). Página **"Experiencia del conductor"**: prototipo navegable de 25 pantallas (A ingreso, B perfil en 5 pasos, C documentos y estados, D matches y mensajes, E perfil y cuenta), en revisión por la dueña.
- **Backend:** **Supabase** (base de datos, autenticación y archivos), por ahora.
- **Panel de administración:** **web**.
- **Inicio de sesión (todos: conductores, titulares y empresas):** **número de celular + código por WhatsApp**, con **SMS de respaldo** si no llega.
- **Correo electrónico (todos):** **obligatorio como dato de respaldo**, **no se usa para entrar**. Sirve para recuperar la cuenta, cambiar de número y recibir los comprobantes de pago.

## Documentos de referencia

- `docs/plan.md` — plan de trabajo por fases y lo que depende de la dueña. **Mantener actualizado.**
- `docs/terminos-y-privacidad.md` — lista de lo que deben cubrir los Términos y la Política de privacidad. **Agregar un punto cada vez que una decisión lo requiera.**
- `docs/propuesta-campos.md` — propuesta de campos (C# conductor, T# titular, F# filtros, M# variables de match, D# documentos, P# preguntas). **Es una propuesta, no una decisión.**
- `docs/propuesta-nombres.md` — nombres candidatos con conflictos encontrados. **Propuesta.**
- `docs/investigacion/contexto-chile.md` — licencias, documentos verificables, Ley 21.719 / 19.628, Ley 21.553, modalidades de contrato.
- `docs/propuesta-zonas.md` y `docs/propuesta-zonas.csv` — propuesta de zonas (81 zonas, 346 comunas). **Propuesta.**
- `docs/investigacion/documentos-y-mensajes.md` — Hoja de Vida y antecedentes (ley vigente y próxima, riesgo Ley 21.719 art. 25, revisión con IA, criterios de rechazo, renovación) y reglas de tiendas para mensajería.
- `docs/investigacion/mercado-avisos.md` — cómo se publicitan conductores/titulares hoy, competidores (Uber Match, Portal Conductores, etc.).

Lo marcado **[verificar]** en esos documentos no está confirmado y no debe tratarse como hecho.

## Estado del repositorio

Sin código todavía. Solo documentación y propuestas.

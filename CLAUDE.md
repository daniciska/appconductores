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

App que funciona como **punto de encuentro (match)** entre conductores y titulares. Se lanza **primero como app web** pensada para el celular, y después se publica en **App Store** y **Google Play** con el mismo código. Conecta a:

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
- [ ] Catálogos (resto de `docs/propuesta-catalogos.md`): ¿Quedan fuera por ahora escolar, ambulancia, chofer particular y maquinaria (ajusta "Tipos de vehículo: todos")? ¿Maquinaria queda solo como experiencia o se saca (MD43)?
- [ ] Enlaces directos del Registro Civil para la Hoja de Vida y el Certificado de antecedentes, y si son gratis en línea [verificar].
- [ ] Días: ¿se agrega "Festivos"? ¿El umbral de 66 % sigue sirviendo ahora que hay 4 variables en el %?
- [ ] Recordatorios para completar el perfil: cada cuánto, cuántas veces y por qué canal primero (WhatsApp o correo).
- [ ] Criterios de rechazo de Hoja de Vida y antecedentes, y cada cuánto se renuevan.
- [ ] Mensajes: ¿el titular también puede escribir primero? ¿Un titular **sin plan** puede leer/responder mensajes? ¿Reportar/bloquear (exigido por las tiendas)? ¿Cuánto tiempo se guardan los mensajes?
- [ ] Precio de cada plan de suscripción.
- [ ] Registrar la marca **Dale Contacto** en INAPI (recomendado) y revisar que el nombre esté libre en las tiendas.

### Técnico
- [ ] Cuenta de Google Cloud para Google Maps Places (sugerencias de dirección): costo por uso y condiciones de qué datos se pueden guardar [verificar].
- [ ] Proveedor para enviar el código por **WhatsApp y SMS** (ej. Twilio; confirmar que Supabase lo soporta [verificar]) — *se deja para después*; mientras tanto, números de prueba de Supabase.
- [ ] Crear cuentas Apple Developer y Google Play (a nombre de la dueña). Ya no bloquea el lanzamiento: se necesitan para la etapa de tiendas.
- [ ] Hosting de la dueña: confirmar el proveedor y que entregue HTTPS (la app web son archivos estáticos; la base de datos queda en Supabase).
- [ ] Identidad visual (colores, tipografía, logo) de Dale Contacto.
- [ ] Panel de administración, detalles abiertos (decisiones 4 a 10 y 12 de `docs/propuesta-panel-administracion.md`): dirección, quiénes lo usan, segundo paso para entrar, quién suma gente al equipo, si un revisor puede suspender (MD52), qué trae el primer panel real y presupuesto.

### Legal
- [ ] Términos y condiciones, política de privacidad y tratamiento de datos personales según la normativa chilena. Lo que deben cubrir: `docs/terminos-y-privacidad.md`.
- [ ] P1: consulta con abogado (Hoja de Vida, fotos de documentos, base legal, revisión automatizada por IA, transferencia internacional de datos).

## Decisiones tomadas

- **País de lanzamiento del MVP:** Chile.
- **Tipos de vehículo:** todos.
- **Búsqueda del titular:** elige un negocio y, solo en los negocios donde la licencia depende del vehículo, responde una pregunta más (carga: peso de más de 3.500 kg o tracto; pasajeros: cuántos pasajeros). Con eso se calcula la licencia exigida (2-nov).
- **Modos de contrato:** arriendo fijo; % de ganancia; % sobre producción. **Desligados del MVP (2-nov): quedan como crecimiento futuro**, no se piden ni se usan en el match.
- **Match:** automático. Se calcula el % de variables que coinciden entre conductor y titular. **Umbral inicial: 66%**. Variables del %: M2 zona, M4 años, M6 estacionamiento y **M7 días** (proporcional: mientras más días coincidan, mejor; 2-nov). **Años (M4):** se usa la categoría de experiencia relacionada con el negocio que tenga más años (2-nov). El umbral, las variables del %, los filtros y los pesos deben ser **configurables desde el panel**, porque se agregarán variables y el umbral cambiará.
- **Filtros obligatorios del match (P3):** tipo de vehículo (F1), licencia habilitante (F2) y misma región (F3) quedan **fuera del %**: si no se cumplen, no hay match.
- **Mensajes dentro de la app (cambia la decisión anterior de "sin chat"):** el conductor puede enviar un **mensaje privado** al titular/empresa de un match. El **contacto personal del titular/empresa no se muestra**, salvo que el titular lo **revele a un conductor en particular** con una función dentro de su perfil/conversación. La idea es conversar un poco antes de pasar a contacto fuera de la app.
- **Favoritos:** el conductor puede marcar como favoritos sus matches (búsquedas/titulares) y el titular/empresa puede marcar como favoritos a sus conductores.
- **Campos de perfil:** se aprueba por ahora la propuesta C1–C18 y T1–T19 de `docs/propuesta-campos.md` (sin correcciones).
- **Nombre del conductor (C1):** se pide en campos separados: **Nombres**, **Primer apellido** y **Segundo apellido (opcional)**.
- **Fecha de nacimiento e idiomas del conductor (2-nov):** solo al conductor. **Fecha de nacimiento**: obligatoria en el **Paso 1** (después de los apellidos); el titular ve solo la **edad** en la ficha, no la fecha; no es filtro ni variable del match [verificar con abogado: riesgo de discriminación por edad, consulta-abogado A16]. **Idiomas que habla**: opcional, selección múltiple en el **Paso 3**; el titular lo ve en la ficha; no cuenta en el match. Opciones de la lista por confirmar (MD51).
- **RUN del conductor (C2):** **no se pide en el formulario**. Se obtiene de la foto de la cédula durante la verificación (el agente lo lee, la persona lo confirma) y solo lo ve el equipo. Sirve para verificar identidad y evitar cuentas duplicadas.
- **Email del conductor (C4):** ver "Correo electrónico (todos)". *Propuesta:* confirmarlo con un código o enlace al correo.
- **Contacto del conductor compartido tras el match:** **teléfono y correo** (los dos).
- **Registro mínimo del conductor (Paso 1):** celular verificado, correo, nombres y apellidos, **fecha de nacimiento**, **clases de licencia** y **"Disponible para trabajar"** (interruptor, encendido por defecto; justo después de la licencia). Al guardar, el conductor **ya queda registrado** y puede elegir **"Guardar y continuar"** o **"Guardar y terminar después"** (perfil incompleto). El resto (dónde vive, experiencia, cómo trabaja, documentos) se completa después. Con perfil incompleto **no entra al match**. Se le **recuerda por WhatsApp o correo** que complete su perfil (frecuencia por definir).
- **Dirección del conductor (Paso 2):** se pide la **dirección**, con **sugerencias de dirección completa desde Google Maps** (Places). De la dirección elegida se obtiene la **comuna verificada** (y su zona y región), que es la que se usa para el match. *Temporal (9-nov): mientras no exista la cuenta de Google Cloud, la app real pide la comuna de una lista.* La dirección **no se muestra a nadie**; solo se entrega a un titular **si hay match y el conductor lo autoriza** ("Compartir mi dirección" en la conversación).
- **Textos en pantalla:** cortos; el detalle legal (privacidad, uso de datos) va en los Términos y la Política de privacidad, no en las pantallas.
- **Formularios (estilo):** los campos obligatorios se marcan con **asterisco (*)**, sin explicaciones largas debajo; si se intenta guardar sin un dato obligatorio, aparece una **alerta** y el campo se marca en rojo.
- **Zona del conductor:** se usa **solo la comuna de su dirección** (y su zona). Se eliminan las "otras comunas donde puede retirar" (C6) y la opción "cualquier comuna de mi región".
- **Experiencia del conductor (Paso 3):** mide su experticia según el **tipo de vehículo** que ha manejado: "¿Qué vehículos has manejado?", con **selección múltiple** y **años manejando** cada uno marcado (años en general, no solo con pago; decidido el 30-oct). Catálogo (configurable), **7 categorías acotadas que cubren todos los vehículos** (pedido de la dueña, 2-nov): **Moto** (moto, scooter), **Vehículo liviano** (auto, SUV, camioneta), **Van o minibús** (van, furgón, minibús), **Bus** (bus o micro), **Camión** (3/4, camión simple, grúa de autos), **Camión articulado** (tracto con rampla) y **Maquinaria** (grúa horquilla, retroexcavadora). Se eliminan el texto libre "Tu experiencia en pocas palabras" (C10) y el total general de años.
- **En qué quiere trabajar (antes C8, "vehículos que quiere manejar"):** es el **negocio** en el que el conductor quiere participar. No es experiencia. Va en el **Paso 4 "¿Qué trabajo buscas?"** (junto con turno y días), con selección múltiple. Se muestran **todos** los negocios activos; los que su licencia no permite aparecen **en gris con "Pide licencia X"** (2-nov). Catálogo (configurable, aprobado el 30-oct): **Taxi, Taxi colectivo, Taxi ejecutivo** (antes "Radiotaxi ejecutivo"), **Transporte por aplicación, Van o bus de turismo, Bus interurbano, Camión de carga interurbano, Camión de carga urbano, Reparto en furgón, Grúa de autos, Moto delivery**. Cada uno con un **ejemplo en gris, sin marcas** (ej. "apps de pasajeros", "comercios, farmacias"). Los negocios se agrupan en **2 industrias** (2-nov): **Transporte de pasajeros** (Taxi, Taxi colectivo, Taxi ejecutivo, Transporte por aplicación, Van o bus de turismo, Bus interurbano) y **Transporte de carga** (Camión de carga interurbano, Camión de carga urbano, Reparto en furgón, Grúa de autos, Moto delivery). **Cada negocio, y también cada industria completa, se activa o desactiva desde el panel de administración** (2-nov): en el **lanzamiento solo Taxi y Taxi ejecutivo** (2-nov; la industria de carga parte apagada); la app muestra y usa en el match solo los negocios activos cuya industria también está activa.
- **Turnos (M3):** se separan en **preferencia de turno** (Día, Noche; se pueden marcar los dos) y **días que puede trabajar** (los 7 días, de lunes a domingo, cada uno se marca). Se eliminan "Vehículo a cargo (24 h)" y "Solo fines de semana y festivos".
- **Registro del conductor en 5 pasos:** 1 Tus datos · 2 Dónde vives (dirección y estacionamiento seguro) · 3 Tu experiencia · 4 ¿Qué trabajo buscas? (negocio, turno y días) · 5 Documentos.
- **Modelo de contrato: crecimiento futuro (2-nov).** Se desliga del MVP: no se pide en el registro ni en la búsqueda y no se usa en el match. La pantalla se conserva en la página "En espera" de la maqueta.
- **Perfil titular (P2):** un solo perfil con selector "Persona natural / Empresa". Los bloques Experiencia y Contrato del titular van por **búsqueda** (un vehículo o grupo de vehículos iguales).
- **Filtros adicionales (P4):** turno (M3) también es **filtro obligatorio**, fuera del %. El modo de contrato (M1) ya no se usa (crecimiento futuro, 2-nov).
- **Garantía:** la dueña indica que en la práctica no existe → queda como **campo opcional** (C13 y T15). **No es filtro.** Por ahora tampoco entra al % (interpretación de Claude, por confirmar).
- **Zonas (M2):** se comparan por **zona = grupo de comunas** dentro de una región. **Aprobada la propuesta de `docs/propuesta-zonas.md` (81 zonas, 346 comunas, 2-nov)** como datos iniciales. Editables desde el panel.
- **Documentos obligatorios del conductor:** cédula, licencia, **Hoja de Vida del Conductor** y **Certificado de Antecedentes para fines especiales** (la dueña lo pide según la ley vigente y la que viene). Revisión: **agente de IA + persona** (ver P8). Riesgo legal por datos de infracciones penales (Ley 21.719 art. 25): ver `docs/investigacion/documentos-y-mensajes.md` [verificar con abogado].
- **Revisión de documentos (P8):** sistema mixto. Un **agente de IA pre-revisa** (lee el documento y compara con lo declarado); los casos claros se aprueban automáticamente y las dudas y rechazos los decide una **persona** en el panel [verificar con abogado: decisiones automatizadas y transferencia internacional de datos].
- **Qué ve el conductor tras un match:** con los mensajes y favoritos, el conductor necesita ver **la lista de sus matches** (negocio, comuna de retiro, turno, días, nombre del titular/empresa) **sin el contacto** del titular; en el detalle, el **% de coincidencia** y las condiciones (sin modo de contrato ni garantía, que son crecimiento futuro; 2-nov). *Propuesta en maquetas, por confirmar.* Debe ser configurable desde el panel. Mapa de todo lo que ve y hace después de registrarse: página "Después del registro" de la maqueta.
- **Bolsa de trabajo (2-nov):** se **diseña ahora** (maqueta y modelo), y **si sale en el lanzamiento se decide después**. Mientras tanto queda apagada desde el panel. El titular puede abrir sus ofertas a una bolsa. El conductor **postula** ("Me interesa"); el titular recibe su ficha y decide si le escribe o le muestra su contacto. **Visibilidad** a elección del titular: solo quienes hacen match, los perfiles que él elige o todos los conductores; **no** es pública para personas sin cuenta. **Depende del plan:** nivel de visibilidad, cuántas ofertas en la bolsa, destacar ofertas y ver quién postuló (sin plan, solo cuántos postularon). Detalle y preguntas abiertas: `docs/propuesta-bolsa-trabajo.md`. Maqueta: página "Bolsa de trabajo (por decidir)", con 3 pantallas del conductor (BC1–BC3) y 5 del titular (BT1–BT5).
- **Mockup funcional (4-nov):** una demo navegable en **mockup.dalecontacto.cl**, publicada en la **cuenta de Netlify de la dueña** (Claude la publica y actualiza; la dueña agrega una vez el registro DNS "mockup" en su hosting). Alcance de la primera versión: **conductor completo** (ingreso, registro en 5 pasos, documentos, matches, mensajes y perfil) y **bolsa de trabajo** (pantallas del conductor y del titular). **El panel de administración no se muestra en el mockup** (pedido de la dueña, 7-nov): el panel tiene su propia demo aparte, en /panel del mismo sitio (ver "Panel de administración"); en la demo, la revisión de la persona del equipo se simula sola. Funciona con **datos de ejemplo**: lo que escribe cada persona queda solo en su navegador; no envía códigos reales ni guarda datos personales en la base. Se construye con la **tecnología de la app (Expo + TypeScript)**, en la carpeta `aplicacion/`, para que las pantallas aprobadas pasen después a la app real. Copia de las maquetas de referencia en `docs/maqueta/`. **Publicada el 4-nov** en el proyecto de Netlify **dale-contacto-mockup** (id `74e48a73-8b23-4689-a968-69ab093d4d61`, https://dale-contacto-mockup.netlify.app). **Acceso (9-nov):** el plan Personal de Netlify solo permite privado (solo la dueña) o público; contraseña e invitaciones exigen Pro. La dueña eligió **sitio público con una clave dentro de la demo**: una pantalla de entrada pide la clave **una vez por navegador**, y es **la misma clave para el mockup y para /panel**. Es protección liviana (alguien técnico podría saltársela), aceptable porque todo es de ejemplo. La clave la propuso Claude y la tiene la dueña; en el repositorio solo queda su versión cifrada (SHA-256), nunca la clave. **Publicado así y abierto al público el 9-nov** (demo del conductor + demo del panel en /panel, con la clave).
- **Contacto (P10):** por ahora **solo el titular ve el contacto del conductor**. El conductor no ve el contacto del titular.
- **Monetización MVP:** suscripción mensual que paga el titular/empresa. **El conductor usa la app gratis** (por ahora).
- **Planes (P13):** distintas suscripciones según volumen de búsquedas activas. Propuesta inicial aceptada (configurable): **Básico** 1 búsqueda, **Flota chica** 5, **Flota** 20. Precios por definir.
- **Titular sin suscripción (P11):** no ve perfiles ni contactos; sí ve un **adelanto anónimo** (ej. "hay 8 conductores verificados para tu búsqueda").
- **Cobro (P14):** **dentro y fuera de la app** (compra integrada de Apple/Google + pago web). Con el lanzamiento web, al inicio el cobro es solo **pago web**; la compra integrada llega con las tiendas. Ver restricciones de tiendas en `docs/propuesta-campos.md` P14 [verificar].
- **Verificación de documentos:** sí, incluida en el MVP.
- **Configurable =** mediante un **panel de administración**.
- **Cuentas de desarrollador:** aún no existen. Se crearán **a nombre de la dueña (persona natural)**, con la idea de pasarlas a una empresa más adelante.
- **App:** una sola app **multiplataforma** (iPhone y Android) con **React Native + Expo**, en TypeScript (mismo lenguaje para app, panel y funciones de servidor).
- **Lanzamiento: primero app web** (decidido el 2-nov). Se construye con el mismo código de Expo y se publica como **app web pensada para el celular**, que se puede agregar a la pantalla de inicio. Las tiendas (App Store y Google Play) vienen después, con el mismo código. Así no hacen falta las cuentas de tiendas ni la prueba cerrada de Google para salir. Los avisos importantes van por **WhatsApp y correo**, porque en iPhone los avisos web solo llegan si la app está agregada a la pantalla de inicio [verificar]. Desde el inicio se eligen herramientas que funcionen en web y en celular.
- **Calidad visual:** la dueña exige una app que se vea y funcione **profesional, de calidad, no ordinaria**. Diseño cuidado (sistema de diseño consistente, tipografía, espaciado, animaciones sutiles, estados de carga/vacío/error). Las pantallas se aprueban con maquetas antes de programarlas.
- **Cuenta Supabase:** ya existe (de la dueña) y está conectada a Claude con el conector de Supabase (2-nov). Dale Contacto va en una **organización propia de Supabase**, separada de otros negocios de la dueña (así se puede pasar a una empresa después), con el proyecto en la región **São Paulo** (sa-east-1), la más cercana a Chile. Proyecto creado el 2-nov: **dale-contacto** (id `zflalaqimacsnlvurzeb`, São Paulo, plan Free). **Etapa 1 de la base de datos aplicada el 2-nov** (migraciones `etapa1_esquema` y `etapa1_datos_iniciales`: 21 tablas con RLS, catálogos cargados, 261 pruebas locales; asesor de seguridad de Supabase sin avisos). Código en `supabase/`. El proyecto "panel-creadores" es de otro negocio y no se toca. La tabla `etmday_leads`, que apareció el 6-nov en el proyecto de Dale Contacto y la dueña no reconoce, se **borró el 9-nov** a su pedido.
- **Rama principal:** `main`.
- **Lenguaje de la app:** hablar de **vehículos** en general, no de taxis (la app cubre todos los tipos de vehículo).
- **Nombre:** **Dale Contacto** (definitivo, 2-nov). Dominio **dalecontacto.cl**, comprado en NIC Chile (2-nov), a nombre de Mario, **socio de la dueña** (intencional). Falta configurarle los DNS del hosting. La dueña tiene un hosting propio.
- **Referencias visuales:** Fintual, Uber, apps minimalistas. Casi negro sobre blanco, grises neutros, mucho espacio y **un solo acento** (amarillo). Maquetas: https://claude.ai/artifact/N5JbJkK1ub26v14FpzhcAg (en revisión). Página **"Experiencia del conductor"**: prototipo navegable de 25 pantallas (A ingreso, B perfil en 5 pasos, C documentos y estados, D matches y mensajes, E perfil y cuenta), en revisión por la dueña.
- **Backend:** **Supabase** (base de datos, autenticación y archivos), por ahora.
- **Panel de administración:** **web**. **App aparte** de la de conductores y titulares (decidido el 9-nov, opción B de `docs/propuesta-panel-administracion.md`): otra app web en el mismo repositorio, con la **misma tecnología (Expo + TypeScript)**, que comparte diseño, tipos de datos y reglas del match, con su propia dirección y su propio sitio en la cuenta de Netlify de la dueña. La app de conductores y titulares (la que va a las tiendas) no lleva nada del panel. **Se construye junto con el panel real**, conectado a Supabase (etapa de documentos de la base); En la demo del conductor no se agregan interruptores para ver la bolsa apagada ni la alerta de campos obligatorios (9-nov). **Demo del panel (9-nov, pedido de la dueña; cambia el "sin demo aparte" de la misma mañana):** se construye ahora como **app aparte** (su propio código de pantallas y su propia publicación; la demo del conductor no lleva nada del panel), pero **conectada** con la demo del conductor: va en el **mismo sitio, en la dirección /panel** (sin enlace desde el menú de la demo del conductor) y comparte lo guardado en el navegador, así que lo que se aprueba o se cambia en el panel se ve en la demo del conductor abierta en el mismo navegador. Se entra **eligiendo rol** (administrador o revisor), sin pantalla de ingreso. Dirección corta: **panel-mockup.dalecontacto.cl**, que lleva a mockup.dalecontacto.cl/panel (la dueña agrega el registro DNS en su hosting). Funciona con datos de ejemplo, igual que la demo del conductor. El panel real (conectado a Supabase) se construye después.
- **App real del conductor (9-nov, pedido de la dueña: "construir la app para comenzar a llenar la base de datos"):** se construye **ya**, conectada a Supabase, en paralelo a la demo del panel. **Primeros datos: la dueña y su equipo, con celulares de prueba** (sin datos de terceros) mientras se resuelven el abogado y el proveedor de códigos. **Pantallas del conductor del mockup aprobadas tal como están** (visto bueno al prototipo del conductor, 9-nov). **Paso 2, temporal:** el conductor **elige su comuna de una lista**; la dirección con sugerencias de Google Maps se agrega cuando exista la cuenta de Google Cloud. **Primera versión: pasos 1 a 4** (lo que guarda la Etapa 1 de la base); los documentos (paso 5) vienen después, con la Etapa 3 de la base y la revisión del abogado. **Aprobado además (9-nov):** cargar los 4 textos de "Antes de empezar" como **versión de prueba** ('prueba-1') hasta los definitivos del abogado, y el ajuste **dias_reconfirmar_disponibilidad = 30** que la app puede leer (ambos aplicados en Supabase el 9-nov); **todas las adaptaciones de pantallas** de la sección 18 de `docs/especificacion-app-conductor-v1.md` (Paso 2 con buscador de comuna, se ocultan Matches, Mensajes, Bolsa, "Tengo vehículos" y "Eliminar mi cuenta", Inicio con "Tus documentos: próximamente", reenviar código a los 60 s, nada marcado de antemano); se publica en **app.dalecontacto.cl** (sitio nuevo de Netlify **dale-contacto-app**, abierto: solo entran los celulares de prueba). Especificación: `docs/especificacion-app-conductor-v1.md`.
- **Inicio de sesión (todos: conductores, titulares y empresas):** **número de celular + código por WhatsApp**, con **SMS de respaldo** si no llega.
- **Correo electrónico (todos):** **obligatorio como dato de respaldo**, **no se usa para entrar**. Sirve para recuperar la cuenta, cambiar de número y recibir los comprobantes de pago.

## Documentos de referencia

- `docs/plan.md` — plan de trabajo por fases y lo que depende de la dueña. **Mantener actualizado.**
- `docs/modelo-datos.json` — modelo de datos (36 tablas). Página interactiva para revisarlo: https://claude.ai/artifact/1ACYaM3MWdn1yiMpe7pwkK. **Se actualiza con cada cambio de la maqueta.**
- `docs/modelo-datos-cambios.md` — registro de qué cambió en el modelo y por qué.
- `docs/terminos-y-privacidad.md` — lista de lo que deben cubrir los Términos y la Política de privacidad. **Agregar un punto cada vez que una decisión lo requiera.**
- `docs/propuesta-campos.md` — propuesta de campos (C# conductor, T# titular, F# filtros, M# variables de match, D# documentos, P# preguntas). **Es una propuesta, no una decisión.**
- `docs/propuesta-nombres.md` — nombres candidatos con conflictos encontrados. **Propuesta.**
- `docs/investigacion/contexto-chile.md` — licencias, documentos verificables, Ley 21.719 / 19.628, Ley 21.553, modalidades de contrato.
- `docs/propuesta-catalogos.md` — propuesta de tamaños de vehículo y negocios con sus licencias. **Propuesta.**
- `docs/especificacion-app-conductor-v1.md` — especificación de construcción de la app real del conductor v1 (pasos 1 a 4, celulares de prueba): arquitectura, ingreso, campo por campo, base de datos, publicación y pasos de la dueña.
- `docs/propuesta-panel-administracion.md` — panel de administración como app aparte: opciones comparadas, recomendación y decisiones abiertas. **Decidido (9-nov): opción B, construida con el panel real.** Las demás decisiones del documento siguen siendo propuesta.
- `docs/propuesta-bolsa-trabajo.md` — bolsa de trabajo: respuestas de la dueña, cómo funcionaría, planes y preguntas abiertas. **Propuesta; si sale en el lanzamiento se decide después.**
- `docs/consulta-abogado.md` — pauta única de preguntas para la reunión con el abogado.
- `docs/propuesta-zonas.md` y `docs/propuesta-zonas.csv` — propuesta de zonas (81 zonas, 346 comunas). **Propuesta.**
- `docs/investigacion/documentos-y-mensajes.md` — Hoja de Vida y antecedentes (ley vigente y próxima, riesgo Ley 21.719 art. 25, revisión con IA, criterios de rechazo, renovación) y reglas de tiendas para mensajería.
- `docs/investigacion/mercado-avisos.md` — cómo se publicitan conductores/titulares hoy, competidores (Uber Match, Portal Conductores, etc.).

Lo marcado **[verificar]** en esos documentos no está confirmado y no debe tratarse como hecho.

## Estado del repositorio

Documentación, propuestas, la **Etapa 1 de la base de datos** en `supabase/` (aplicada en Supabase) y el **mockup funcional** en `aplicacion/` (Expo, datos de ejemplo).

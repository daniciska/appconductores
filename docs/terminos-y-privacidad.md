# Qué deben incluir los Términos y la Política de privacidad

Lista de trabajo para redactar los textos legales con el abogado. Se agrega un punto cada vez que una decisión del producto lo requiere. **No es el texto legal**: solo lo que debe quedar cubierto.

## Datos que se piden y para qué

- [ ] **Celular:** sirve para entrar a la app. El código llega por WhatsApp, con SMS de respaldo.
- [ ] **Correo electrónico (obligatorio):** se usa para recuperar la cuenta, cambiar de número y recibir los comprobantes de pago. No se usa para entrar.
- [ ] **Dirección del conductor:** se pide para obtener su comuna verificada (con sugerencias de Google Maps). Para el match solo se usa la comuna. La dirección es privada y solo se entrega a un titular si hay match y el conductor lo autoriza.
- [ ] **Nombres y apellidos, clases de licencia, experiencia, negocios en los que quiere trabajar, turnos, días y estacionamiento:** se usan para el match y se muestran al titular después del match. (El modo de contrato y la garantía quedaron como crecimiento futuro el 2-nov: no se piden.)
- [ ] **Fecha de nacimiento (conductor):** obligatoria. El titular solo ve la edad, no la fecha. [verificar con abogado: discriminación por edad]
- [ ] **Idiomas que habla (conductor, opcional):** se muestran al titular en la ficha.
- [ ] **RUN:** se obtiene de la cédula al verificarla. Solo lo ve el equipo de verificación.

## Con quién se comparten

- [ ] Tras un match, el titular ve la ficha del conductor y su contacto (**teléfono y correo**).
- [ ] El titular decide si comparte su propio contacto con un conductor en particular.
- [ ] Registro de quién recibió los datos de cada conductor (el conductor lo puede ver en la app).
- [ ] **Bolsa de trabajo** (si se lanza): al tocar "Me interesa", el conductor envía su ficha al titular de esa oferta aunque no haya match. Queda en "Quién recibió mis datos". Los titulares solo ven las ofertas según la visibilidad que eligieron; la bolsa no es pública para personas sin cuenta.

## Documentos y verificación

- [ ] Cédula, licencia, Hoja de Vida del Conductor y Certificado de antecedentes para fines especiales: para qué se piden, quién los ve (solo el equipo), cuánto tiempo se guardan y cuándo se borran. [verificar con abogado: Ley 21.719 art. 25]
- [ ] Revisión: un sistema automático pre-revisa y una persona decide cualquier rechazo; el conductor puede pedir otra revisión. [verificar con abogado: art. 8° bis]
- [ ] Uso de proveedores fuera de Chile (alojamiento, IA, Google Maps): transferencia internacional de datos. [verificar con abogado]

## Comunicaciones

- [ ] Recordatorios por WhatsApp o correo para completar el perfil.
- [ ] Mensajes dentro de la app: normas de trato, reportar y bloquear, cuánto tiempo se guardan.

## App web

- [ ] La app se lanza primero en la web: informar el uso de cookies o del almacenamiento del navegador (por ejemplo, para mantener la sesión abierta).

## Cuenta

- [ ] Cómo eliminar la cuenta y qué se borra.
- [ ] Derechos del titular de los datos: acceso, rectificación, supresión, oposición y portabilidad.

## Etapa de prueba con el equipo (desde el 9-nov)

- [ ] La dueña y su equipo aceptan en la app real los 4 textos de "Antes de empezar" en su **versión de prueba** ('prueba-1', copiados de la maqueta, sin revisión del abogado). Cuando lleguen los definitivos, todos deberán **aceptarlos de nuevo** (versión 'v1').
- [ ] **Desde el 24-nov (S12):** "Antes de empezar" pide solo **2** autorizaciones (Términos y Política de privacidad con mayoría de edad; compartir ficha y contacto tras el match). La de **revisión de documentos** se pedirá justo antes de subir el primer documento (Paso 5) y la de **normas de los mensajes** antes del primer mensaje. Confirmar con el abogado que pedir cada autorización cuando se usa cumple el consentimiento expreso y específico (P1).
- [ ] Se guardan **datos reales** del equipo (nombre, fecha de nacimiento, correo, celular, comuna y lo demás de los pasos 1 a 4) **antes** de tener los Términos y la Política aprobados. [verificar con abogado]
- [ ] Solo entran los **celulares de prueba** que la dueña anota en Supabase; no se envían mensajes. Cómo se borran estos datos de prueba antes del lanzamiento se decide aparte (hoy la base no deja borrar a quien aceptó autorizaciones).


## Documentos del conductor (desde el 24-nov)

- [ ] **Se guardan mientras la cuenta esté activa** (decisión de Daniela, 24-nov): la foto de la cédula y de la licencia, y los PDF de la Hoja de Vida y del certificado de antecedentes, en un espacio privado (solo la persona y, después, el equipo desde el panel). Cuando un documento se reemplaza (por ejemplo, porque venció), el archivo anterior se puede borrar y hoy lo borra la app desde el celular de la persona (al tiro, si el reemplazo se hizo en ese celular; o en una subida posterior). **Hoy no hay una tarea en el servidor que lo garantice:** si la app se cierra o pierde la red, el archivo viejo (por ejemplo, un PDF de antecedentes) puede quedar guardado hasta la próxima subida. Antes del lanzamiento conviene una tarea del servidor que borre los archivos sin uso [definir con el panel]. Esto cambia la propuesta anterior de borrar el archivo después de decidir: el abogado debe confirmar el plazo y la base legal. [verificar con abogado, P1 / MD20]
- [ ] **Aprobación automática provisoria:** hoy un "método de validación" aprueba todos los documentos que se suben, sin que nadie los mire; su detalle (IA, persona) se define después. Informar que hay una revisión automática y cómo pedir que la revise una persona (decisiones automatizadas). [verificar con abogado: art. 8° bis Ley 21.719]
- [ ] **"Perfil verificado" sin revisión:** con la aprobación automática el conductor queda "Perfil verificado" y la app le dice que los titulares solo ven conductores con sus documentos aprobados, aunque nadie los revisó. Antes de mostrarle a un titular una insignia de verificado, definir qué significa y qué se le informa (riesgo de publicidad engañosa y frente al titular si un documento es falso). [verificar con abogado: consulta A65, Ley 19.496]
- [ ] **Texto de la autorización acorde a lo que se hace:** la versión de prueba-1 ("un sistema automático los revisa primero; las dudas y los rechazos los decide una persona… Puedo pedir otra revisión") describía algo que hoy no ocurre. Desde el 24-nov deja de ofrecerse y queda vigente la prueba-2, que solo dice que los documentos se guardan mientras la cuenta esté activa y se revisan para verificar identidad, licencia y antecedentes; se pide en el Paso 5, antes del primer documento (también a quien aceptó la prueba-1). El texto definitivo debe describir el método real. [verificar con abogado: consulta A66]
- [ ] **Retirar la autorización:** si la persona retira "Revisión de mis documentos", sus documentos quedan "retirados": dejan de usarse, el perfil vuelve a incompleto (sale de los matches) y sus archivos se pueden borrar (hoy los borra la app en la próxima limpieza; no hay tarea del servidor). Hoy la app no tiene un botón para retirarla: la base ya lo soporta. ¿Hay que borrar los archivos al tiro? [verificar con abogado: consulta A67, Ley 21.719]
- [ ] **Tope de archivos:** cada persona puede tener hasta 12 archivos a la vez en el espacio de documentos (ajuste `maximo_archivos_documentos`), para que nadie llene el espacio.
- [ ] **Datos de antecedentes:** el certificado de antecedentes y la Hoja de Vida pueden traer datos de infracciones penales; guardarlos mientras la cuenta esté activa es un tratamiento sensible. [verificar con abogado: Ley 21.719 art. 25]
- [ ] **Fechas de vencimiento y de emisión:** se guardan para avisar al conductor 3 meses antes de que venza un documento (hoy dentro de la app; después por WhatsApp o correo). La persona las anota al subir; después podría leerlas el método automático.
- [ ] Al borrar una cuenta se borran sus documentos (filas), pero **los archivos de Storage no se borran solos** (la base no puede borrarlos con SQL). Hoy no hay forma de borrar una cuenta desde la app ("Eliminar mi cuenta" está oculto); el proceso que la borre (panel o función del servidor) debe borrar también su carpeta de Storage [definir con el panel]. Mientras eso no exista, no se puede prometer "se borra con la cuenta".
- [ ] Texto de "Revisión de mis documentos": se acepta antes de subir el primer documento (versión de prueba, falta el definitivo del abogado).

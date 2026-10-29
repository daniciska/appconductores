# Modelo de datos: registro de cambios

Cada vez que cambia una pantalla de la maqueta o una decisión, se anota aquí **qué cambió en los datos y por qué**. Lo más nuevo va arriba. El modelo completo está en `docs/modelo-datos.json` y en la página interactiva del modelo.

Origen: **Comentario** = comentario de la dueña en la maqueta · **Decisión** = decisión registrada en `CLAUDE.md`.

## 2026-10-29

| # | Cambio en los datos | Por qué | Origen |
|---|---|---|---|
| 15 | El perfil del conductor pasa de 5 a **6 secciones**: el **modelo de contrato** (modos de contrato y garantía máxima) se separa de "¿Cómo quieres trabajar?" (negocio, turnos y estacionamiento). El avance del perfil se cuenta sobre 6 secciones. No cambian las tablas. | La dueña pidió que el modelo de contrato vaya en una hoja separada. | Comentario |
| 14 | Paso 3: la experiencia se guarda como **años por cada tamaño**. Se marca el tamaño y luego se ingresan sus años; una fila sin marcar no guarda años. | La dueña pidió una tabla: vehículo a la izquierda y "Años de experiencia" a la derecha, activos solo en los vehículos marcados. | Comentario (dibujo) |
| 13 | Catálogo de tamaños: "Grúa" pasa a **"Grúa de autos"** y "Camión + grande" a **"Camión pesado"** (nombre por confirmar). | "Grúa" era ambiguo (grúa de autos, camión pluma o grúa horquilla, que pide otra licencia). La dueña pidió otro nombre para el camión grande. | Comentario |
| 12 | Nuevo catálogo **negocios** (en qué quiere trabajar el conductor): Taxi, Radiotaxi ejecutivo, Uber u otra app, Van o bus de turismo, Bus interurbano, Camión de carga interurbano, Camión de carga urbano (por confirmar), Moto delivery. Va con una tabla **negocio → clases de licencia**. Reemplaza a "tipos de vehículo" en los filtros F1 y F2. | Lo que el conductor quiere manejar es "el negocio en el que quiere participar", no la experiencia. | Comentario + Decisión |
| 11 | Nuevo catálogo **tamaños de vehículo**: Auto, Camioneta, Van, Camión 3/4, Grúa de autos, Moto, Bus, Camión pesado. Nueva tabla **experiencia del conductor** (conductor × tamaño, con años). | La experiencia mide la experticia según las dimensiones del vehículo, y se pueden marcar varios. | Comentario + Decisión |
| 10 | **M4 (años)**, propuesta pendiente: tabla **negocio → tamaños relacionados**, para comparar los años del conductor en esos tamaños contra el mínimo de la búsqueda. | Al pasar los años a "por tamaño", el match necesita saber qué tamaños cuentan para cada negocio. | Pendiente de la dueña |
| 9 | Se eliminan **C10** ("Tu experiencia en pocas palabras") y el **total general de años** (C9). | La dueña pidió eliminar el texto libre. El total queda reemplazado por los años por tamaño. | Comentario |
| 8 | "En qué quiere trabajar" pasa del Paso 3 al **Paso 4** ("¿Cómo quieres trabajar?"). No cambia la estructura de datos. | No es experiencia. | Comentario |
| 7 | Se eliminan **C6** ("otras comunas donde puede retirar") y la opción **"cualquier comuna de mi región"**. La zona del conductor sale solo de la comuna de su dirección. | La dueña indicó que no es relevante. | Comentario |
| 6 | **Dirección del conductor**: dirección elegida desde Google Maps, identificador del lugar [verificar qué permite guardar Google], depto/casa/block (opcional) y **comuna verificada** (de ella salen zona y región). Nuevo **registro de direcciones compartidas** (a qué titular y cuándo). | Así se obtiene la comuna exacta para el match. La dirección es privada y solo se entrega tras un match si el conductor lo autoriza ("Compartir mi dirección"). | Comentario + Decisión |
| 5 | **Estado del perfil** (incompleto / completo) y **registro de recordatorios** enviados (canal y fecha; frecuencia por definir). | El conductor queda registrado con el Paso 1 y puede terminar después. Con perfil incompleto no entra al match y se le recuerda por WhatsApp o correo. | Comentario + Decisión |
| 4 | Registro mínimo: celular verificado, correo, nombres y apellidos y **clases de licencia** (se piden en el Paso 1). | La dueña pidió poder registrarse con datos incompletos y captarlo después. | Comentario |
| 3 | **Correo obligatorio para todos** (conductores, titulares y empresas) como dato de respaldo. Propuesta: confirmarlo con código o enlace. **Entrada con celular y código por WhatsApp**, con SMS de respaldo. | Sirve para recuperar la cuenta, cambiar de número y recibir comprobantes de pago. No se usa para entrar. | Comentario + Decisión |
| 2 | **RUN**: no se pide en el formulario. Se lee de la cédula al verificarla y lo ve solo el equipo. Es único, para evitar cuentas duplicadas. | La dueña indicó que no es necesario pedirlo. | Comentario |
| 1 | Nombre en tres campos: **nombres, primer apellido y segundo apellido** (opcional). | La dueña pidió los campos por separado. | Comentario |
| 0 | Versión inicial del modelo a partir de la propuesta de campos C1–C18 y T1–T19 aprobada, con dos borradores (MVP simple y configurable desde el panel), una síntesis y dos revisiones (cobertura y privacidad). | Base para construir en Supabase. | Decisión |

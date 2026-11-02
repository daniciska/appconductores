# Consulta al abogado — Dale Contacto

Preparado el 2-nov-2026 con las notas del proyecto. Las fuentes son archivos de `docs/` y `docs/investigacion/`, más `CLAUDE.md` (decisiones vigentes). Lo marcado **[verificar]** no está confirmado.

## Contexto para el abogado

**Dale Contacto** es una app chilena que conecta a **conductores** con **titulares** (dueños de vehículos o empresas) que buscan conductor. Parte como app web para el celular, solo con Taxi y Taxi ejecutivo; después llega a App Store y Google Play. El titular paga una suscripción mensual; el conductor la usa gratis.
Al conductor se le pide: celular, correo, nombres y apellidos, fecha de nacimiento (el titular ve su edad), dirección (de ella sale su comuna), si tiene estacionamiento seguro, clases de licencia, experiencia, idiomas que habla (opcional), en qué negocio quiere trabajar, turnos y días. El RUN no se pide en el formulario: se lee de la foto de la cédula y solo lo ve el equipo. Y cuatro documentos: cédula, licencia, Hoja de Vida del Conductor y Certificado de Antecedentes para fines especiales. Un agente de IA los pre-revisa y una persona decide las dudas y los rechazos.
Al titular se le pide celular, correo y nombre (razón social y RUT si es empresa). Si también se le pedirá la cédula está por definir.
Tras un match, el titular con suscripción vigente ve la ficha y el contacto (teléfono y correo) del conductor; sin suscripción solo ve un adelanto anónimo. El conductor no ve el contacto del titular, salvo que este se lo revele, y puede escribirle un mensaje privado dentro de la app. La dirección del conductor solo se entrega si él la comparte. Proveedores fuera de Chile: Supabase (guarda los datos de la app, en São Paulo, Brasil), Google Maps (sugerencias de dirección) y un proveedor de IA.

> **Ojo:** la información legal de estas notas es al 8-oct-2026 (las novedades de la Ley 21.553 y del DS 212 de taxis llegan al 29-oct-2026, en propuesta-catalogos.md §4). Salió de resultados de búsqueda, no de los textos oficiales (los sitios oficiales estaban bloqueados). Puede haber cambiado.

## Lo más urgente (bloquea el lanzamiento)

La Ley 21.719 rige desde el **1-dic-2026**, salvo que se apruebe la postergación [verificar su estado antes de lanzar]. Sin estas respuestas no se puede lanzar la app web:

1. **Antecedentes y Hoja de Vida (A1–A13):** si la app puede pedirlos, revisarlos y guardar el resultado con el art. 25, qué certificado pedir y cada cuánto, y cuál de las opciones A–E usar.
2. **Revisión con IA + persona (A17–A21):** si cumple el art. 8° bis y qué hay que avisarle al conductor.
3. **Datos fuera de Chile y proveedores (A22–A24):** qué contrato o cláusulas firmar con Supabase (Brasil), el proveedor de IA, Google Maps y los demás proveedores, y cómo informarlo.
4. **Autorizaciones (A25–A30):** qué va con casilla de consentimiento y qué por "ejecución del contrato". Sin esto no se cierran las pantallas de registro.
5. **Términos, Política de privacidad y plazos de borrado (A31–A35 y A48–A56):** textos listos para publicar, con cuánto se guardan las fotos de documentos, los mensajes y las cuentas borradas.

## Preguntas

Cada pregunta tiene un número para que el abogado pueda responder, por ejemplo, "A3: sí, porque…".

### 1. Certificado de Antecedentes y Hoja de Vida (Ley 21.719, art. 25)

**Cómo funciona hoy** (decidido en `CLAUDE.md`; detalle en el modelo de datos, en revisión):
- El conductor saca la Hoja de Vida y el certificado él mismo en el Registro Civil y los sube a la app.
- Un agente de IA lee cada documento y lo compara con lo que declaró el conductor.
- Los casos claros y favorables se aprueban solos. Las dudas y los rechazos los decide una persona. El conductor puede pedir otra revisión.
- De estos dos documentos se guarda solo la fecha de emisión, si el folio es válido y el resultado. Nunca las anotaciones ni las condenas. El archivo se borra después (plazo por definir, A31).
- El titular nunca ve el archivo: solo una insignia (A12).

- **A1.** Con el art. 25 de la Ley 21.719, ¿puede una empresa privada que solo conecta a las partes pedir, revisar y guardar el Certificado de Antecedentes para fines especiales? ¿Sirve el consentimiento?
  *Por qué importa:* el art. 25 deja estos datos a organismos públicos y a casos que una ley prevé expresamente, y no menciona el consentimiento. Es el mayor riesgo del proyecto; las multas gravísimas llegan a 20.000 UTM. *Fuente:* documentos-y-mensajes.md §4.2 y "Qué confirmar con un abogado" 1; contexto-chile.md §4.
- **A2.** ¿Qué certificado conviene pedir: el "para fines especiales" o el "para fines particulares"? Según el DS 64 (art. 12), el de fines especiales trae copia íntegra del prontuario penal y se otorga cuando leyes especiales o reglamentos exigen acreditar la conducta anterior [verificar texto vigente]. ¿Puede el conductor sacarlo para presentarlo en una app que no está obligada por ley? ¿Pedirlo a todos es pedir más de lo necesario?
  *Por qué importa:* está decidido pedir el de fines especiales a todos los conductores. Según ChileAtiende, ese sirve para trámites ante una institución pública o privada, y el de fines particulares, por ejemplo, para buscar trabajo. Tampoco sabemos si el formulario en línea pide el motivo o la institución [verificar]. *Fuente:* documentos-y-mensajes.md §3 ("Diferencia con 'fines particulares'" y "Online y gratis") y §9 punto 1; `CLAUDE.md` (Documentos obligatorios del conductor).
- **A3.** ¿La Hoja de Vida del Conductor también cae en el art. 25?
  *Por qué importa:* trae infracciones de tránsito (administrativas) y a veces condenas penales. Si cae, el problema es el mismo para los dos documentos. *Fuente:* documentos-y-mensajes.md §3 y §4.2; propuesta-campos.md D3.
- **A4.** Si borramos el archivo y guardamos solo "verificado el dd/mm, cumple, vence el dd/mm", ¿eso sigue siendo tratar un dato sobre infracciones?
  *Por qué importa:* define si "verificar y borrar" (opción B) reduce el riesgo o no. *Fuente:* documentos-y-mensajes.md §4.2 y "Qué confirmar con un abogado" 2.
- **A5.** ¿Podemos apoyarnos en la Ley 21.733, que obliga a los operadores de taxis, colectivos y buses a pedir el certificado cada 6 meses, aunque el obligado sea el titular y no la app? ¿Alcanza a taxi y a taxi ejecutivo, los dos negocios del lanzamiento? ¿Y la Ley 21.553, cuando rija?
  *Por qué importa:* es la ley vigente más cercana a nuestro caso. *Fuente:* documentos-y-mensajes.md §1 y "Qué confirmar con un abogado" 1; `CLAUDE.md` (lanzamiento con Taxi y Taxi ejecutivo).
- **A6.** Si el titular de un taxi solo ve la insignia y nunca el certificado, ¿cumple su obligación de la Ley 21.733 de exigir el certificado a sus conductores cada 6 meses? ¿Podemos ofrecer la app como ayuda para cumplir esa obligación?
  *Por qué importa:* sería un argumento de venta para el lanzamiento con Taxi y Taxi ejecutivo, pero la investigación lo dejó como inferencia [verificar]. Y el diseño actual le muestra al titular solo una insignia (A12). *Fuente:* documentos-y-mensajes.md §1 (fila "Taxis, colectivos y buses" y "Qué significa para la app"); `CLAUDE.md` (lanzamiento con Taxi y Taxi ejecutivo).
- **A7.** ¿Puede la app actuar como **encargado** del titular, es decir, tratar los datos por cuenta de él? ¿Qué tendría que firmar cada parte?
  *Por qué importa:* si el obligado legal es el titular, esta podría ser la vía para que la app haga la revisión. *Fuente:* documentos-y-mensajes.md §4.4 (opción A).
- **A8.** Hoy está decidido pedir los cuatro documentos a todos los conductores. ¿Es más seguro pedir el certificado de antecedentes solo donde la ley lo exige (pasajeros, escolar y apps), configurable por negocio? ¿Y conviene seguir pidiendo la Hoja de Vida, que ninguna de esas normas exige directamente (tampoco en Taxi y Taxi ejecutivo, los negocios del lanzamiento)?
  *Por qué importa:* la Hoja de Vida no aparece como exigencia legal directa en ninguna norma revisada; las empresas la piden por costumbre. En carga, reparto, maquinaria y autos particulares no encontramos una ley que exija ninguno de los dos. *Fuente:* documentos-y-mensajes.md §0 punto 1 y §1 (fila "Taxis, colectivos y buses" y "Qué significa para la app"); modelo-datos.json (pendiente MD19).
- **A9.** ¿Cada cuánto podemos pedir de nuevo la Hoja de Vida y el certificado? Opciones: los dos cada 6 meses para todos, o cada 6 meses en pasajeros y apps y cada 12 en carga y reparto. ¿Pedirlos cada 6 meses donde ninguna ley lo exige es pedir más de lo necesario?
  *Por qué importa:* cada renovación vuelve a pedir y revisar datos sobre infracciones. Los plazos que mencionan las normas están en "Fechas clave". *Fuente:* documentos-y-mensajes.md §7; modelo-datos.json (pendiente MD18); `CLAUDE.md` (Decisiones pendientes).
- **A10.** ¿Cuál de estas opciones recomienda, o qué combinación?
  *Por qué importa:* define cómo se construye el paso de documentos. *Fuente:* documentos-y-mensajes.md §4.4; contexto-chile.md §4.

  | Opción | En qué consiste | Cuánto reduce el riesgo | Qué queda |
  |---|---|---|---|
  | **A. Solo donde lo exige la ley** | Pedir el certificado solo para pasajeros (Ley 21.733), escolar (RENASTRE) y apps (Ley 21.553), configurable por tipo de vehículo | Alto: hay una ley sectorial detrás | El obligado es el titular, no la app. ¿Puede la app ser su **encargado**? **[abogado]** |
  | **B. Verificar y borrar** | Se valida el folio, se guarda "verificado el dd/mm, cumple el criterio X, vence el dd/mm" y se borra el archivo en pocos días | Medio | Sigue siendo tratamiento, incluso el sí/no |
  | **C. Puente, sin procesar** | Tras el match, el conductor entrega folio y código al titular, que verifica por su cuenta | El más alto | Se pierde el sello "verificado" como valor de venta |
  | **D. Sin detalle para el titular** | El titular ve solo "verificado" o "no verificado", nunca las anotaciones | Evita comunicar datos penales a terceros | Complementa A o B |
  | **E. Consentimiento expreso separado** | Casilla específica, información clara y posibilidad de revocar | Sirve hoy (Ley 19.628) | Con la Ley 21.719 probablemente **no basta por sí sola [abogado]** |

- **A11.** Mientras rija la Ley 19.628, ¿basta un consentimiento expreso y por escrito para pedir estos documentos? ¿Qué cambia si se aprueba la postergación de la Ley 21.719?
  *Por qué importa:* según la investigación, hoy el tratamiento es más defendible que después. *Fuente:* documentos-y-mensajes.md §4.1 y §4.3.
- **A12.** ¿Qué puede ver el titular: una insignia por documento ("Hoja de Vida revisada"), una sola ("Documentos revisados") o ninguna? ¿La insignia ya comunica un dato de infracciones?
  *Por qué importa:* la insignia es lo que se vende, pero podría comunicar datos penales a un tercero. *Fuente:* modelo-datos.json (pendiente MD35); documentos-y-mensajes.md §4.4 (opción D).
- **A13.** ¿Qué debe significar "revisada": solo que el documento es auténtico, o también que no tiene anotaciones graves?
  *Por qué importa:* si el equipo juzga el contenido, la app decide con datos de infracciones; si solo mira la autenticidad, la insignia le dice poco al titular. *Fuente:* propuesta-campos.md P1 c) y D3.

### 2. Criterios de rechazo y discriminación arbitraria (Ley 20.609)

- **A14.** ¿Qué riesgo de discriminación arbitraria tiene cada criterio de rechazo? En el lanzamiento (Taxi y Taxi ejecutivo) está la Ley 21.733 (si alcanza a los dos, ver A5). ¿Y en negocios sin ley sectorial, como carga y reparto, que parten apagados? [verificar con abogado]
  *Por qué importa:* un rechazo sin justificación razonable se podría reclamar. Las opciones van desde "solo delitos sexuales de la Ley 21.733" (riesgo bajo) hasta "cualquier anotación" (alto); en la Hoja de Vida, desde "licencia no vigente" (bajo) hasta "causas pendientes" o "accidentes" (alto). *Fuente:* documentos-y-mensajes.md §6 (C1–C6 y H1–H7) y "Qué confirmar con un abogado" 5; `CLAUDE.md` (En qué quiere trabajar).
- **A15.** Si la Hoja de Vida o el certificado muestran una condena ya cumplida o prescrita (los tribunales a veces ordenan omitirlas de la Hoja de Vida), ¿podemos usarla para rechazar al conductor? Y como un certificado "sin anotaciones" puede omitir condenas, ¿qué debemos aclararle al titular sobre lo que significa la insignia?
  *Por qué importa:* según la investigación, con la Ley 21.719 estos datos no se pueden comunicar una vez cumplida o prescrita la pena. Además, "sin anotaciones" no significa "nunca condenado": se pueden omitir condenas cumplidas, prescritas o con penas sustitutivas (DS 64, art. 13; Ley 19.628, art. 21; Ley 18.216). *Fuente:* documentos-y-mensajes.md §3 ("'Sin anotaciones' no significa 'nunca condenado'" y "Hoja de Vida") y §4.2.
- **A16.** La app no pide sexo ni nacionalidad. Desde el 2-nov sí pide la **fecha de nacimiento** (obligatoria) y el titular ve la **edad** en la ficha, aunque no puede filtrar ni ordenar por edad. ¿Mostrar la edad crea un riesgo de discriminación por edad (Ley 20.609)? ¿Sería más seguro mostrar solo "mayor de 18" o nada? ¿Debemos impedir que un titular escriba requisitos como "mayor de 45 años"? ¿La prohibición de exigir edad del art. 2 del Código del Trabajo aplica también a un arriendo? [verificar]
  *Por qué importa:* esos requisitos aparecen en avisos reales, y mostrar la edad facilita descartar por edad. *Fuente:* propuesta-campos.md §5 y T16; mercado-avisos.md §4 ("Cuidados para el diseño de campos"); `CLAUDE.md` (Fecha de nacimiento, 2-nov).

### 3. Revisión automatizada con IA (Ley 21.719, art. 8° bis)

- **A17.** ¿Cumple el art. 8° bis el diseño mixto: la IA aprueba sola solo los casos claros y favorables, y una persona decide toda duda, anotación y rechazo?
  *Por qué importa:* la ley da derecho a no ser objeto de decisiones basadas solo en tratamiento automatizado que le produzcan efectos jurídicos o le afecten significativamente [verificar texto literal]. *Fuente:* documentos-y-mensajes.md §5.3 y "Qué confirmar con un abogado" 3; terminos-y-privacidad.md ("Documentos y verificación").
- **A18.** ¿Qué hay que informarle al conductor, y cómo? Por ejemplo: que hubo pre-revisión con IA, el motivo de la decisión y cómo pedir otra revisión. ¿Cómo demostramos que la revisión humana es real?
  *Por qué importa:* la persona conserva siempre el derecho a información, explicación, expresar su punto de vista, intervención humana y revisión [verificar texto literal]. *Fuente:* documentos-y-mensajes.md §5.3.
- **A19.** Para la Hoja de Vida y el certificado, ¿es preferible leer el PDF oficial con reglas fijas, sin enviarlo a una IA externa?
  *Por qué importa:* evita mandar datos penales a un tercero en el extranjero. *Fuente:* documentos-y-mensajes.md §5.1 y §5.4; "Qué tienes que decidir" 5.
- **A20.** Para confirmar que un documento es auténtico, ¿podemos usar el verificador del Registro Civil (una persona lo abre a mano)? ¿Y proveedores privados que lo consultan solos, como Verifik o MetaMap? ¿Con qué base legal lo hacen ellos? [verificar] ¿O conviene pedir un convenio al Registro Civil? Los convenios que encontramos son con organismos públicos, como el SII.
  *Por qué importa:* una IA no puede confirmar autenticidad solo leyendo. *Fuente:* documentos-y-mensajes.md §5.1 y §5.2.
- **A21.** ¿Hace falta una evaluación de impacto (EIPD) por revisar documentos de muchas personas? [verificar]
  *Por qué importa:* la Ley 21.719 la pide cuando el tratamiento es de alto riesgo. *Fuente:* propuesta-campos.md P1 g); contexto-chile.md §4.

### 4. Datos fuera de Chile y proveedores (transferencia internacional)

- **A22.** Los datos de la app se guardan en Supabase, en São Paulo (Brasil). ¿Es transferencia internacional? [verificar] ¿Usamos las cláusulas contractuales modelo publicadas el 19-dic-2025? ¿Qué rige si se aprueba la postergación?
  *Por qué importa:* todavía no hay países declarados "adecuados" (arts. 27 y 28 de la Ley 21.719). *Fuente:* documentos-y-mensajes.md §5.4 y "Qué confirmar con un abogado" 4; `CLAUDE.md` (Cuenta Supabase).
- **A23.** ¿Qué hay que exigirle por contrato al proveedor de IA? Por ejemplo: no entrenar con los datos, no guardarlos, cláusulas modelo o acuerdo de tratamiento de datos.
  *Por qué importa:* los documentos traen datos de identidad y de infracciones. *Fuente:* documentos-y-mensajes.md §5.4.
- **A24.** ¿Qué hay que informar o firmar con los demás proveedores? Google Maps (sugerencias de dirección), el proveedor que enviará los códigos por WhatsApp y SMS, los que envíen los avisos y recordatorios por WhatsApp y correo, la pasarela de pago web (Flow, Mercado Pago, Webpay u otra) y el hosting de la app web (de la dueña). Salvo Google Maps, todos están por definir o por confirmar.
  *Por qué importa:* la mayoría recibe datos de los usuarios (dirección, celular, correo, pagos); qué datos de Google se pueden guardar está por verificar. El hosting solo entrega los archivos de la app; los datos quedan en Supabase. *Fuente:* terminos-y-privacidad.md ("Documentos y verificación"); `CLAUDE.md` (Técnico y Lanzamiento); modelo-datos.json (pendiente MD25).

### 5. Autorizaciones y base legal ("ejecución de contrato")

- **A25.** ¿Cuáles de estos usos necesitan una casilla de consentimiento separada, y cuáles se informan como parte del servicio (ejecución del contrato)?
  - compartir la ficha y el contacto (teléfono y correo) del conductor con el titular tras el match;
  - revisar los documentos;
  - guardar el RUN leído de la cédula para verificar la identidad y evitar cuentas duplicadas (solo lo ve el equipo);
  - entregar la dirección del conductor cuando él toca "Compartir mi dirección";
  - recordatorios por WhatsApp o correo para completar el perfil.

  *Por qué importa:* con la Ley 21.719 el consentimiento tácito ya no vale. *Fuente:* propuesta-campos.md §4 ("Avisos y consentimientos") y P1 f); contexto-chile.md §4; `CLAUDE.md` (RUN del conductor, Dirección del conductor y Registro mínimo del conductor); terminos-y-privacidad.md ("Datos que se piden y para qué" y "Comunicaciones").
- **A26.** ¿Son obligatorias estas autorizaciones propuestas? Recordatorios por WhatsApp y por correo, opcionales y con baja [verificar política de WhatsApp Business]; compromiso del titular de usar los datos de conductores solo para contratar; y ampliar las normas de mensajes, que ya se aceptan al empezar, para informar el filtro automático y la lectura de las conversaciones reportadas (las aceptan conductor y titular). ¿Hace falta además una pantalla "Mis autorizaciones" para verlas y retirarlas?
  *Por qué importa:* cada autorización suma una casilla. *Fuente:* modelo-datos.json (pendiente MD32 y tabla "Texto de autorización").
- **A27.** ¿Hace falta la lista "Quién recibió mis datos" que ve el conductor? Que un titular con plan vea el nombre del conductor en su lista de resultados, ¿ya cuenta como entrega de datos?
  *Por qué importa:* el conductor no ve el contacto del titular, así que esa lista es su única forma de saber quién tiene su teléfono. *Fuente:* propuesta-campos.md §4 [verificar con abogado]; modelo-datos.json (pendiente MD33).
- **A28.** El titular sin plan ve solo un número ("8 conductores verificados coinciden con tu búsqueda"), sin saber quiénes son. ¿Eso cuenta como acceso o entrega de datos de los conductores? Hoy el diseño asume que no.
  *Por qué importa:* el match se calcula con los datos del conductor aunque el titular no pague, y el adelanto es lo que ayuda a vender la suscripción. *Fuente:* propuesta-campos.md P11; modelo-datos.json (regla R10); `CLAUDE.md` (Titular sin suscripción, P11).
- **A29.** ¿Qué responsabilidad tiene la app si un titular usa los teléfonos y correos de los conductores para otro fin? Por ejemplo, si cambia la comuna o el negocio de sus búsquedas para juntar contactos. ¿Basta con que los Términos del titular lo prohíban, o debemos poner límites (un máximo de conductores nuevos por mes y una alerta en el panel)? Una vez que el titular recibe los datos, ¿queda él como responsable de ellos?
  *Por qué importa:* cada match entrega el contacto del conductor a un tercero, y los planes dicen "contactos ilimitados". *Fuente:* modelo-datos.json (pendientes MD34 y MD32; regla R28); contexto-chile.md §4 ("En la práctica, para la app", punto 2).
- **A30.** Datos del titular: si se le pide la cédula para verificarlo (por definir, P12), ¿qué autorizaciones y avisos necesita? Cuando el titular es persona natural, ¿mostrarle su nombre al conductor en la lista de matches cuenta como entrega de datos que requiera autorización?
  *Por qué importa:* A25 a A27 cubren solo los datos del conductor, pero el titular persona natural también entrega datos personales (nombre, contacto y, si se verifica, RUN y cédula). *Fuente:* propuesta-campos.md (T2, T3, T18 y D4; P12); modelo-datos.json (pendientes MD8 y MD22; regla R7); `CLAUDE.md` ("Qué ve el conductor tras un match").

### 6. Plazos de conservación y borrado

- **A31.** Fotos de documentos: ¿cuánto tiempo después de decidir se borran? Opciones: apenas se decide; unos días (ej. 7) para atender una segunda revisión; un plazo distinto por documento.
  *Por qué importa:* las fotos traen foto, firma y RUN. *Fuente:* modelo-datos.json (pendiente MD20); propuesta-campos.md P1 d) y P16; contexto-chile.md §4.
- **A32.** ¿Qué lados de la cédula y de la licencia podemos pedir? La cédula trae la firma y quizás la huella (dato biométrico) [verificar]; la licencia muestra restricciones (posible dato de salud) y quizás el domicilio [verificar].
  *Por qué importa:* conviene pedir solo lo necesario. *Fuente:* propuesta-campos.md P1 d), D1 y D2.
- **A33.** Mensajes: ¿cuánto tiempo se guardan? Opciones: N meses desde el último mensaje (ej. 6 o 12), o mientras existan el match y las dos cuentas. Las conversaciones reportadas, hasta resolver el caso más un plazo.
  *Por qué importa:* no encontramos un plazo legal específico [verificar]; rige la proporcionalidad: hay que fijar un plazo por finalidad y borrar o anonimizar sin esperar a que el usuario lo pida. *Fuente:* documentos-y-mensajes.md §8 ("Datos personales"); modelo-datos.json (pendiente MD13).
- **A34.** Al borrar una cuenta, ¿qué debemos o podemos conservar, y por cuánto? Por ejemplo: autorizaciones, registro de entregas de datos, reportes abiertos y pagos (ley tributaria) [verificar con abogado y contador].
  *Por qué importa:* hoy la pantalla "Eliminar cuenta" dice que se borra todo. *Fuente:* modelo-datos.json (pendiente MD23).
- **A35.** ¿Qué plazos fijar para lo demás: matches que ya no están vigentes, conversaciones reportadas después de resolverse, reportes resueltos, recordatorios enviados, documentos reemplazados o rechazados, archivos que se subieron y nunca se enviaron a revisión, cuentas incompletas o inactivas (con aviso previo) y las copias de respaldo? ¿En cuántos días hay que responder un pedido de acceso, corrección, supresión, oposición o portabilidad? [verificar plazo legal con abogado]
  *Por qué importa:* la Política de privacidad debe decir cada plazo. *Fuente:* modelo-datos.json (pendiente MD38 y regla R14); terminos-y-privacidad.md ("Cuenta").

### 7. Relación laboral y lenguaje comercial

- **A36.** La app habla de "búsqueda", "oferta" y "condiciones", nunca de "vacante", "sueldo" o "jefe", y no redacta contratos. Eso reduce la apariencia de relación laboral, pero no la evita si en la práctica hay subordinación. ¿Qué más hace falta para que la app no aparezca como empleadora, y para que su diseño no haga que la relación entre titular y conductor se lea como laboral?
  *Por qué importa:* la Dirección del Trabajo ha dicho que hay relación laboral entre dueño y conductor cuando hay subordinación, diga lo que diga el papel [verificar con abogado]. *Fuente:* propuesta-campos.md ("Antes de leer las tablas") y P1 i); contexto-chile.md §6; mercado-avisos.md §4 punto 4.
- **A37.** Si la relación entre titular y conductor resulta laboral, ¿puede el titular exigir el certificado de antecedentes?
  *Por qué importa:* según la Dirección del Trabajo, por regla general no, salvo que sea indispensable para la idoneidad del cargo. Para conductores profesionales es plausible que sí lo sea, pero no encontramos un dictamen específico [verificar]. Para taxis, la Ley 21.733 obliga al operador a exigirlo cada 6 meses (si alcanza a Taxi y Taxi ejecutivo, los negocios del lanzamiento, es la pregunta A5). *Fuente:* documentos-y-mensajes.md §1 (filas "Relación laboral" y "Taxis, colectivos y buses").

### 8. Licencias y Ley 21.553 (apps de transporte o "EAT")

- **A38.** ¿Nos regula la Ley 21.553? Conectamos conductores con titulares, no pasajeros con conductores, así que en principio no seríamos una EAT [verificar con abogado].
  *Por qué importa:* si nos regulara, tendríamos obligaciones propias. *Fuente:* contexto-chile.md §5.
- **A39.** ¿Puede confirmar qué clases de licencia habilitan para manejar un taxi y un taxi ejecutivo? La propuesta es A1, A2, A3 y A1 antigua (anterior a 1997) [verificar]. ¿Las clases A y las antiguas A1 y A2 también habilitan para lo que permite la B (Ley 18.290, art. 12)? [verificar]
  *Por qué importa:* la licencia es un filtro obligatorio del match: queda fuera quien no tiene una clase habilitante. Si la tabla está mal, el titular paga por un conductor que legalmente no puede manejar su vehículo, o se deja fuera a uno habilitado. *Fuente:* modelo-datos.json (pendiente MD3); propuesta-catalogos.md §1 (nota "Grupo B") y §2; propuesta-campos.md §1.1 y §3 ("Por qué hay filtros").
- **A40.** Cuando rija, la licencia B dejaría de bastar para "Transporte por aplicación": se pediría licencia profesional (las fuentes no coinciden en la clase: A1, A2 o A3, o solo A2 [verificar]), y quienes ya trabajan en apps tendrían 12 meses para sacarla [verificar]. ¿Podemos seguir haciendo match con licencia B durante ese plazo? ¿Solo con quienes ya trabajaban en apps? La app hoy no pregunta eso. ¿Tenemos algún deber de avisar?
  *Por qué importa:* ese negocio no está activo en el lanzamiento, pero está en el catálogo aprobado y se puede encender desde el panel. *Fuente:* propuesta-catalogos.md §2 a §4; contexto-chile.md §5; documentos-y-mensajes.md §2; modelo-datos.json (fecha de término por clase, [verificar con abogado]).

### 9. Mensajes, reportes y bloqueo

- **A41.** ¿Cómo moderar los mensajes sin chocar con la inviolabilidad de las comunicaciones privadas (Constitución, art. 19 N°5)? Propuesta: un filtro automático, una persona lee solo las conversaciones reportadas y los términos lo informan con consentimiento expreso [verificar con abogado].
  *Por qué importa:* según el Tribunal Constitucional, una comunicación privada solo la conocen quienes participan en ella. *Fuente:* documentos-y-mensajes.md §8 y "Qué confirmar con un abogado" 6.
- **A42.** ¿Qué deben decir las normas de mensajes? Apple y Google piden reportar, bloquear y moderar, y que el usuario acepte los términos antes de escribir. En rechazos de Apple se ha pedido "tolerancia cero" y atender los reportes en 24 horas [verificar].
  *Por qué importa:* sin esto las tiendas rechazan la app. *Fuente:* documentos-y-mensajes.md §8.
- **A43.** "Compartir" el contacto (titular) y "Compartir mi dirección" (conductor): ¿basta con registrar a quién y cuándo, y avisar antes que no se puede deshacer? Todavía está pendiente qué comparte el titular (teléfono y correo, o solo teléfono), si vale solo para esa conversación y si el conductor puede dejar de compartir su dirección.
  *Por qué importa:* es comunicar datos a un tercero con el consentimiento de la persona. *Fuente:* documentos-y-mensajes.md §8; modelo-datos.json (pendiente MD16); `CLAUDE.md` (Mensajes y Dirección del conductor).

### 10. Cobro y tiendas

- **A44.** Al inicio se cobra solo por pago web. ¿Qué debemos cumplir al cobrar una suscripción mensual por la web? ¿Las empresas necesitan factura, y qué datos tributarios del titular habría que pedir? (puede ser con el contador)
  *Por qué importa:* las flotas, el segmento que más paga, suelen necesitar factura. *Fuente:* propuesta-campos.md P14; `CLAUDE.md` (Cobro).
- **A45.** En las tiendas, una suscripción que desbloquea contenido probablemente debe cobrarse con el sistema de Apple y Google (Apple, guía 3.1.1). ¿Aplica alguna excepción, como la guía 3.1.3, para seguir cobrando por la web? [verificar]
  *Por qué importa:* las tiendas cobran comisión y no emiten factura chilena. *Fuente:* propuesta-campos.md P14.

### 11. Marca (INAPI)

- **A46.** ¿Conviene registrar "Dale Contacto" en INAPI? ¿En qué clases? Probablemente 9 (software), 35 (intermediación) y 42 (servicios de plataforma) [verificar con INAPI o un abogado de marcas].
  *Por qué importa:* el nombre ya es definitivo y el dominio dalecontacto.cl está comprado. Los posibles conflictos se buscaron solo en la web: falta buscar marcas iguales o parecidas en INAPI y revisar el nombre en las tiendas. Existe "dale!", una billetera digital de Grupo Aval en Colombia, de otro rubro. *Fuente:* propuesta-nombres.md (tabla, fila "Dale Contacto", y "Antes de elegir"); `CLAUDE.md` (Nombre y Decisiones pendientes).
- **A47.** ¿A nombre de quién conviene registrar la marca? El dominio está a nombre de Mario, socio de la dueña (intencional), y las cuentas de las tiendas irán a nombre de la dueña, para pasarlas después a una empresa.
  *Por qué importa:* evita problemas al pasar todo a una empresa. *Fuente:* `CLAUDE.md` (Nombre y Cuentas de desarrollador).

### 12. Términos y Política de privacidad

- **A48.** ¿Puede redactar o revisar los Términos, la Política de privacidad y los textos de las autorizaciones? Lo que deben cubrir está en `terminos-y-privacidad.md`.
  *Por qué importa:* la Ley 21.719 obliga a publicar una política que informe finalidades, datos, destinatarios y seguridad, y la app se lanza primero en la web, antes que en las tiendas. En la etapa de tiendas, Apple también la exige (guía 5.1.1(i)) y Google Play igual [verificar]. *Fuente:* propuesta-campos.md P1 (introducción) y P1 j); contexto-chile.md §4; `CLAUDE.md` (Lanzamiento).
- **A49.** Mientras no exista una empresa, ¿quién figura como responsable de los datos? ¿Conviene crear la empresa antes de lanzar?
  *Por qué importa:* las cuentas parten a nombre de la dueña como persona natural, y Apple pide publicar los datos de contacto de quien publica la app. *Fuente:* `CLAUDE.md` (Cuentas de desarrollador); documentos-y-mensajes.md §8.
- **A50.** ¿Qué debemos aclarar sobre lo que garantiza una insignia "revisado"? La de la cédula no prueba que quien usa la cuenta sea su dueño, y una licencia puede suspenderse sin que la app se entere. ¿Cómo limitar la responsabilidad de la app si un acuerdo sale mal (por ejemplo, un vehículo no devuelto)?
  *Por qué importa:* los titulares pagan por la confianza, y hay casos de vehículos arrendados que no se devolvieron. *Fuente:* propuesta-campos.md D1 y D2; mercado-avisos.md §4 punto 2.
- **A51.** Si hay una filtración de datos, ¿en qué plazo hay que avisar? Una fuente dice 72 horas [verificar].
  *Por qué importa:* debe quedar en la política y en el plan del equipo. *Fuente:* contexto-chile.md §4.
- **A52.** ¿Qué medidas de seguridad exige la ley para estos datos, y bastan las que tenemos previstas? Lo previsto en el modelo de datos: archivos en un espacio privado que el equipo abre con enlaces de pocos minutos; el RUN en una tabla aparte que solo ve el equipo; y un registro, que no se puede modificar, de cada apertura de archivo, vista del RUN y lectura de una conversación reportada. Propuestas: cifrar cada archivo con su propia clave y un segundo factor para las cuentas del equipo.
  *Por qué importa:* la Ley 21.719 pide medidas de seguridad, y la Política de privacidad debe informarlas. Hasta ahora solo preguntamos por el aviso de filtraciones (A51). *Fuente:* contexto-chile.md §4 ("Bases legales y obligaciones"); modelo-datos.json (reglas R7, R14 y R26); propuesta-campos.md §4 ("Archivos").
- **A53.** App web: ¿qué hay que informar sobre las cookies o el almacenamiento del navegador (por ejemplo, para mantener la sesión abierta)?
  *Por qué importa:* la app se lanza primero en la web. *Fuente:* terminos-y-privacidad.md ("App web").
- **A54.** Borrado de cuenta: Apple exige poder borrarla desde la app y Google pide además un enlace web [verificar]. Si alguien paga por la tienda, ¿basta con avisarle que cancele allá la suscripción? [verificar]
  *Por qué importa:* es parte del derecho de supresión y de las reglas de las tiendas. *Fuente:* documentos-y-mensajes.md §8; propuesta-campos.md §4; modelo-datos.json (borrado de cuenta).
- **A55.** ¿Qué debe decir la Política sobre los derechos de acceso, rectificación, supresión, oposición y portabilidad, y cómo se piden?
  *Por qué importa:* la Ley 21.719 da estos derechos con plazos de respuesta; cuántos días está por verificar (A35). *Fuente:* terminos-y-privacidad.md ("Cuenta"); contexto-chile.md §4; modelo-datos.json (tabla "Solicitud sobre mis datos").
- **A56.** ¿Está bien la casilla "Términos, política de privacidad y declaro ser mayor de 18 años" como una sola, o deben ir separadas?
  *Por qué importa:* es la primera casilla del registro. *Fuente:* propuesta-campos.md §4 ("Avisos y consentimientos").

### 13. Captación de conductores

- **A57.** Para conseguir conductores se hará publicidad en los sitios donde ellos publican sus avisos, además de "captación activa". Si eso incluye escribirles al teléfono o al WhatsApp que pusieron en su aviso, ¿podemos hacerlo? ¿Con qué condiciones?
  *Por qué importa:* es el canal previsto para conseguir conductores, y las notas no lo analizan desde el punto de vista legal. *Fuente:* `CLAUDE.md` ("Captación de conductores"); mercado-avisos.md §1.

### 14. Para más adelante (no bloquea el lanzamiento)

- **A58.** Transporte escolar: la ley pide revisar las inhabilidades para trabajar con menores (Ley 20.594; DL 645, art. 6 bis), que también son datos sobre sanciones. ¿Puede la app incluirlo, o la consulta la debe hacer el titular?
  *Por qué importa:* es el primer negocio candidato para después. *Fuente:* propuesta-campos.md P15; documentos-y-mensajes.md §1; propuesta-catalogos.md §2.
- **A59.** Foto de rostro (selfie): si una persona la compara a ojo con la cédula, ¿igual es un dato biométrico?
  *Por qué importa:* es la primera medida si aparecen suplantaciones. *Fuente:* propuesta-campos.md §5; contexto-chile.md §4.
- **A60.** Garantía (cuando vuelva el modelo de contrato): ¿el tramo que puede pagar el conductor es un dato de "situación socioeconómica", o sea sensible? [verificar interpretación]
  *Por qué importa:* si lo es, necesita una autorización aparte. *Fuente:* propuesta-campos.md P1 e); modelo-datos.json (pendiente MD26); contexto-chile.md §4.
- **A61.** ¿Se puede sumar "Sueldo" como modo de contrato, u ofrecer plantillas de contrato, sin que la app parezca empleadora? [verificar con abogado]
  *Por qué importa:* el modelo de contrato quedó como crecimiento futuro. *Fuente:* propuesta-catalogos.md pregunta 10; propuesta-campos.md §5.

## Qué llevar a la reunión

- Este documento.
- `docs/terminos-y-privacidad.md`: la lista de lo que deben cubrir los textos legales.
- La lista de datos que se piden, quién ve cada uno y para qué: el modelo de datos (https://claude.ai/artifact/1ACYaM3MWdn1yiMpe7pwkK) y la sección "Datos que se piden y para qué" de `docs/terminos-y-privacidad.md`. `docs/propuesta-campos.md` va solo como antecedente: sus tablas son la versión original y todavía traen el modo de contrato y la garantía como obligatorios, el RUN en el formulario, "otras comunas" y revisión solo manual, todo ya cambiado.
- Las notas de investigación que se citan en cada "Fuente", con los enlaces a las fuentes legales: `docs/investigacion/documentos-y-mensajes.md` y `docs/investigacion/contexto-chile.md`. Si hace falta, también `docs/propuesta-catalogos.md`, `docs/propuesta-nombres.md` y `docs/investigacion/mercado-avisos.md`.
- El flujo de documentos (sección 1 de este documento) y el prototipo del conductor, con las pantallas de registro, documentos y mensajes (https://claude.ai/artifact/N5JbJkK1ub26v14FpzhcAg).
- Un ejemplo real de Hoja de Vida y de Certificado de Antecedentes para fines especiales (pueden ser los de la dueña), para ver qué datos traen.
- La lista de proveedores: Supabase (Brasil), Google Maps, proveedor de IA (por definir), WhatsApp, SMS y correo (por definir), pago web (por definir) y el hosting de la dueña donde se publica la app web (proveedor por confirmar).
- Los planes (Básico 1 búsqueda, Flota chica 5, Flota 20) y cómo se cobrará al inicio (solo pago web).
- Quién es quién: la dueña (cuentas de tiendas), Mario (dominio) y si se creará una empresa.

## Fechas clave

| Fecha | Qué pasa | Fuente |
|---|---|---|
| Hoy | Rige la **Ley 19.628** de datos personales. | contexto-chile.md §4 |
| 19-abr-2023 | Se publica la **Ley 21.553** (apps). No rige: entra en vigencia 30 días después de publicado su reglamento. | contexto-chile.md §5 |
| 13-dic-2024 | Se publica la **Ley 21.719** de datos personales. | contexto-chile.md §4 |
| 5-abr-2025 | Se publica la **Ley 21.733**: certificado para fines especiales para licencias A-1, A-2 y A-3, y control cada 6 meses por los operadores de pasajeros. Vigente. | documentos-y-mensajes.md §1 |
| 19-dic-2025 | Se publican en el Diario Oficial las **cláusulas contractuales modelo** para transferencias internacionales. | documentos-y-mensajes.md §5.4 |
| 1-sep-2026 | El Gobierno ingresa el **boletín 18.623-07** para postergar la Ley 21.719 al 1-dic-2027. Los senadores proponen 6 meses o por tramos. Al 5-oct no se había votado [verificar su estado antes de lanzar]. | contexto-chile.md §4; documentos-y-mensajes.md §4.3 |
| Sep-oct 2026 | El reglamento de la Ley 21.553 se reingresa a la Contraloría. Según la prensa (DF, octubre), la Contraloría aprobó el decreto; falta publicarlo [verificar en el Diario Oficial]. | documentos-y-mensajes.md §2; propuesta-catalogos.md §4 |
| **1-dic-2026** | **Entra en vigencia la Ley 21.719** (incluye el art. 25 y el art. 8° bis), salvo que se apruebe la postergación. | documentos-y-mensajes.md §4.2 y §4.3 |
| 1-dic-2027 | Nueva fecha si se aprueba la postergación de un año que pide el Gobierno (todavía no es ley). | contexto-chile.md §4 |

**Plazos que mencionan las normas** (sirven para decidir cada cuánto se renuevan los documentos):
- Cada 6 meses: certificado de antecedentes para operadores de pasajeros (Ley 21.733) y para apps (Ley 21.553, cuando rija) [verificar si los 6 meses de la Ley 21.553 están en la ley o solo en el reglamento].
- 60 días: plazo para validar un certificado en el verificador del Registro Civil (una nota de prensa habla de 90 días [conflicto]).
- 30 días: antigüedad máxima de los informes para trámites de licencia (Ley 18.290, art. 14).
- 12 meses: plazo para que quienes ya trabajan en apps saquen licencia profesional cuando rija la Ley 21.553.
- 4 años: control de la licencia profesional.

*Fuentes de los plazos:* documentos-y-mensajes.md §3 y §7; contexto-chile.md §1 y §5.

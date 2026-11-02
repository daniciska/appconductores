# Consulta al abogado — Dale Contacto

Preparado el 2-nov-2026 con las notas del proyecto. Las fuentes son archivos de `docs/` y `docs/investigacion/`, más `CLAUDE.md` (decisiones vigentes). Lo marcado **[verificar]** no está confirmado.

## Contexto para el abogado

**Dale Contacto** es una app chilena que conecta a **conductores** con **titulares** (dueños de vehículos o empresas) que buscan conductor. Parte como app web para el celular, solo con Taxi y Taxi ejecutivo; después llega a App Store y Google Play. El titular paga una suscripción mensual; el conductor la usa gratis.
Al conductor se le pide: celular, correo, nombres y apellidos, dirección (de ella sale su comuna), clases de licencia y experiencia. Y cuatro documentos: cédula, licencia, Hoja de Vida del Conductor y Certificado de Antecedentes para fines especiales. Un agente de IA los pre-revisa y una persona decide las dudas y los rechazos.
Tras un match, el titular ve la ficha y el contacto del conductor, y el conductor puede escribirle un mensaje privado dentro de la app. Proveedores fuera de Chile: Supabase (guarda los datos de la app, en São Paulo, Brasil), Google Maps (sugerencias de dirección) y un proveedor de IA.

> **Ojo:** la información legal de estas notas es al 8-oct-2026. Salió de resultados de búsqueda, no de los textos oficiales (los sitios oficiales estaban bloqueados). Puede haber cambiado.

## Lo más urgente (bloquea el lanzamiento)

La Ley 21.719 rige desde el **1-dic-2026**, salvo que se apruebe la postergación [verificar su estado antes de lanzar]. Sin estas respuestas no se puede lanzar la app web:

1. **Antecedentes y Hoja de Vida (A1–A10):** si la app puede pedirlos, revisarlos y guardar el resultado con el art. 25, y cuál de las opciones A–E usar.
2. **Revisión con IA + persona (A13–A17):** si cumple el art. 8° bis y qué hay que avisarle al conductor.
3. **Datos fuera de Chile (A18–A20):** qué contrato o cláusulas firmar con Supabase (Brasil), el proveedor de IA y Google Maps, y cómo informarlo.
4. **Autorizaciones (A21–A23):** qué va con casilla de consentimiento y qué por "ejecución del contrato". Sin esto no se cierran las pantallas de registro.
5. **Términos, Política de privacidad y plazos de borrado (A24–A28 y A40–A47):** textos listos para publicar, con cuánto se guardan las fotos de documentos, los mensajes y las cuentas borradas.

## Preguntas

Cada pregunta tiene un número para que el abogado pueda responder, por ejemplo, "A3: sí, porque…".

### 1. Certificado de Antecedentes y Hoja de Vida (Ley 21.719, art. 25)

**Cómo funciona hoy** (decidido en `CLAUDE.md`; detalle en el modelo de datos, en revisión):
- El conductor saca la Hoja de Vida y el certificado él mismo en el Registro Civil y los sube a la app.
- Un agente de IA lee cada documento y lo compara con lo que declaró el conductor.
- Los casos claros y favorables se aprueban solos. Las dudas y los rechazos los decide una persona. El conductor puede pedir otra revisión.
- De estos dos documentos se guarda solo la fecha de emisión, si el folio es válido y el resultado. Nunca las anotaciones ni las condenas. El archivo se borra después (plazo por definir, A24).
- El titular nunca ve el archivo: solo una insignia (A9).

- **A1.** Con el art. 25 de la Ley 21.719, ¿puede una empresa privada que solo conecta a las partes pedir, revisar y guardar el Certificado de Antecedentes para fines especiales? ¿Sirve el consentimiento?
  *Por qué importa:* el art. 25 deja estos datos a organismos públicos y a casos que una ley prevé expresamente, y no menciona el consentimiento. Es el mayor riesgo del proyecto; las multas gravísimas llegan a 20.000 UTM. *Fuente:* documentos-y-mensajes.md §4.2 y "Qué confirmar con un abogado" 1; contexto-chile.md §4.
- **A2.** ¿La Hoja de Vida del Conductor también cae en el art. 25?
  *Por qué importa:* trae infracciones de tránsito (administrativas) y a veces condenas penales. Si cae, el problema es el mismo para los dos documentos. *Fuente:* documentos-y-mensajes.md §3 y §4.2; propuesta-campos.md D3.
- **A3.** Si borramos el archivo y guardamos solo "verificado el dd/mm, cumple, vence el dd/mm", ¿eso sigue siendo tratar un dato sobre infracciones?
  *Por qué importa:* define si "verificar y borrar" (opción B) reduce el riesgo o no. *Fuente:* documentos-y-mensajes.md §4.2 y "Qué confirmar con un abogado" 2.
- **A4.** ¿Podemos apoyarnos en la Ley 21.733, que obliga a los operadores de taxis, colectivos y buses a pedir el certificado cada 6 meses, aunque el obligado sea el titular y no la app? ¿Alcanza a taxi y a taxi ejecutivo, los dos negocios del lanzamiento? ¿Y la Ley 21.553, cuando rija?
  *Por qué importa:* es la ley vigente más cercana a nuestro caso. *Fuente:* documentos-y-mensajes.md §1 y "Qué confirmar con un abogado" 1; `CLAUDE.md` (lanzamiento con Taxi y Taxi ejecutivo).
- **A5.** ¿Puede la app actuar como **encargado** del titular, es decir, tratar los datos por cuenta de él? ¿Qué tendría que firmar cada parte?
  *Por qué importa:* si el obligado legal es el titular, esta podría ser la vía para que la app haga la revisión. *Fuente:* documentos-y-mensajes.md §4.4 (opción A).
- **A6.** Hoy está decidido pedir los cuatro documentos a todos los conductores. ¿Es más seguro pedir la Hoja de Vida y el certificado solo donde la ley los exige (pasajeros, escolar y apps), configurable por negocio?
  *Por qué importa:* en carga, reparto, maquinaria y autos particulares no encontramos una ley que los exija. *Fuente:* documentos-y-mensajes.md §1 ("Qué significa para la app"); modelo-datos.json (pendiente MD19).
- **A7.** ¿Cuál de estas opciones recomienda, o qué combinación?
  *Por qué importa:* define cómo se construye el paso de documentos. *Fuente:* documentos-y-mensajes.md §4.4; contexto-chile.md §4.

  | Opción | En qué consiste | Cuánto reduce el riesgo | Qué queda |
  |---|---|---|---|
  | **A. Solo donde lo exige la ley** | Pedir el certificado solo para pasajeros (Ley 21.733), escolar (RENASTRE) y apps (Ley 21.553), configurable por tipo de vehículo | Alto: hay una ley sectorial detrás | El obligado es el titular, no la app. ¿Puede la app ser su **encargado**? **[abogado]** |
  | **B. Verificar y borrar** | Se valida el folio, se guarda "verificado el dd/mm, cumple el criterio X, vence el dd/mm" y se borra el archivo en pocos días | Medio | Sigue siendo tratamiento, incluso el sí/no |
  | **C. Puente, sin procesar** | Tras el match, el conductor entrega folio y código al titular, que verifica por su cuenta | El más alto | Se pierde el sello "verificado" como valor de venta |
  | **D. Sin detalle para el titular** | El titular ve solo "verificado" o "no verificado", nunca las anotaciones | Evita comunicar datos penales a terceros | Complementa A o B |
  | **E. Consentimiento expreso separado** | Casilla específica, información clara y posibilidad de revocar | Sirve hoy (Ley 19.628) | Con la Ley 21.719 probablemente **no basta por sí sola [abogado]** |

- **A8.** Mientras rija la Ley 19.628, ¿basta un consentimiento expreso y por escrito para pedir estos documentos? ¿Qué cambia si se aprueba la postergación de la Ley 21.719?
  *Por qué importa:* según la investigación, hoy el tratamiento es más defendible que después. *Fuente:* documentos-y-mensajes.md §4.1 y §4.3.
- **A9.** ¿Qué puede ver el titular: una insignia por documento ("Hoja de Vida revisada"), una sola ("Documentos revisados") o ninguna? ¿La insignia ya comunica un dato de infracciones?
  *Por qué importa:* la insignia es lo que se vende, pero podría comunicar datos penales a un tercero. *Fuente:* modelo-datos.json (pendiente MD35); documentos-y-mensajes.md §4.4 (opción D).
- **A10.** ¿Qué debe significar "revisada": solo que el documento es auténtico, o también que no tiene anotaciones graves?
  *Por qué importa:* si el equipo juzga el contenido, la app decide con datos de infracciones; si solo mira la autenticidad, la insignia le dice poco al titular. *Fuente:* propuesta-campos.md P1 c) y D3.

### 2. Criterios de rechazo y discriminación arbitraria (Ley 20.609)

- **A11.** ¿Qué riesgo de discriminación arbitraria tiene cada criterio de rechazo, sobre todo en negocios sin ley sectorial (carga, reparto, maquinaria)? [verificar con abogado]
  *Por qué importa:* un rechazo sin justificación razonable se podría reclamar. Las opciones van desde "solo delitos sexuales de la Ley 21.733" (riesgo bajo) hasta "cualquier anotación" (alto); en la Hoja de Vida, desde "licencia no vigente" (bajo) hasta "causas pendientes" o "accidentes" (alto). *Fuente:* documentos-y-mensajes.md §6 (C1–C6 y H1–H7) y "Qué confirmar con un abogado" 5.
- **A12.** La app no pide edad, sexo ni nacionalidad. ¿Debemos impedir que un titular escriba requisitos como "mayor de 45 años"? ¿La prohibición de exigir edad del art. 2 del Código del Trabajo aplica también a un arriendo? [verificar]
  *Por qué importa:* esos requisitos aparecen en avisos reales. *Fuente:* propuesta-campos.md §5 y T16; mercado-avisos.md §4 ("Cuidados para el diseño de campos").

### 3. Revisión automatizada con IA (Ley 21.719, art. 8° bis)

- **A13.** ¿Cumple el art. 8° bis el diseño mixto: la IA aprueba sola solo los casos claros y favorables, y una persona decide toda duda, anotación y rechazo?
  *Por qué importa:* la ley da derecho a no ser objeto de decisiones basadas solo en tratamiento automatizado que le produzcan efectos jurídicos o le afecten significativamente [verificar texto literal]. *Fuente:* documentos-y-mensajes.md §5.3 y "Qué confirmar con un abogado" 3; terminos-y-privacidad.md ("Documentos y verificación").
- **A14.** ¿Qué hay que informarle al conductor, y cómo? Por ejemplo: que hubo pre-revisión con IA, el motivo de la decisión y cómo pedir otra revisión. ¿Cómo demostramos que la revisión humana es real?
  *Por qué importa:* la persona conserva siempre el derecho a información, explicación, dar su punto de vista e intervención humana. *Fuente:* documentos-y-mensajes.md §5.3.
- **A15.** Para la Hoja de Vida y el certificado, ¿es preferible leer el PDF oficial con reglas fijas, sin enviarlo a una IA externa?
  *Por qué importa:* evita mandar datos penales a un tercero en el extranjero. *Fuente:* documentos-y-mensajes.md §5.1 y §5.4; "Qué tienes que decidir" 5.
- **A16.** Para confirmar que un documento es auténtico, ¿podemos usar el verificador del Registro Civil (una persona lo abre a mano)? ¿Y proveedores privados que lo consultan solos, como Verifik o MetaMap? ¿Con qué base legal lo hacen ellos? [verificar]
  *Por qué importa:* una IA no puede confirmar autenticidad solo leyendo. *Fuente:* documentos-y-mensajes.md §5.1 y §5.2.
- **A17.** ¿Hace falta una evaluación de impacto (EIPD) por revisar documentos de muchas personas? [verificar]
  *Por qué importa:* la Ley 21.719 la pide cuando el tratamiento es de alto riesgo. *Fuente:* propuesta-campos.md P1 g); contexto-chile.md §4.

### 4. Datos fuera de Chile (transferencia internacional)

- **A18.** Los datos de la app se guardan en Supabase, en São Paulo (Brasil). ¿Es transferencia internacional? [verificar] ¿Usamos las cláusulas contractuales modelo publicadas el 19-dic-2025? ¿Qué rige si se aprueba la postergación?
  *Por qué importa:* todavía no hay países declarados "adecuados" (arts. 27 y 28 de la Ley 21.719). *Fuente:* documentos-y-mensajes.md §5.4 y "Qué confirmar con un abogado" 4; `CLAUDE.md` (Cuenta Supabase).
- **A19.** ¿Qué hay que exigirle por contrato al proveedor de IA? Por ejemplo: no entrenar con los datos, no guardarlos, cláusulas modelo o acuerdo de tratamiento de datos.
  *Por qué importa:* los documentos traen datos de identidad y de infracciones. *Fuente:* documentos-y-mensajes.md §5.4.
- **A20.** ¿Qué hay que informar o firmar por Google Maps (sugerencias de dirección) y por el proveedor que enviará los códigos y avisos por WhatsApp y SMS (por definir)?
  *Por qué importa:* los dos reciben datos de los usuarios; qué datos de Google se pueden guardar está por verificar. *Fuente:* terminos-y-privacidad.md ("Documentos y verificación"); `CLAUDE.md` (Técnico).

### 5. Autorizaciones y base legal ("ejecución de contrato")

- **A21.** ¿Cuáles de estos usos necesitan una casilla de consentimiento separada, y cuáles se informan como parte del servicio (ejecución del contrato)?
  - compartir la ficha y el contacto (teléfono y correo) del conductor con el titular tras el match;
  - revisar los documentos;
  - entregar la dirección del conductor cuando él toca "Compartir mi dirección";
  - recordatorios por WhatsApp o correo para completar el perfil.

  *Por qué importa:* con la Ley 21.719 el consentimiento tácito ya no vale. *Fuente:* propuesta-campos.md §4 ("Avisos y consentimientos") y P1 f); contexto-chile.md §4.
- **A22.** ¿Son obligatorias estas autorizaciones propuestas? Recordatorios por WhatsApp y por correo, opcionales y con baja [verificar política de WhatsApp Business]; compromiso del titular de usar los datos de conductores solo para contratar; normas de mensajes; pantalla "Mis autorizaciones" para verlas y retirarlas.
  *Por qué importa:* cada una suma una casilla al registro. *Fuente:* modelo-datos.json (pendiente MD32).
- **A23.** ¿Hace falta la lista "Quién recibió mis datos" que ve el conductor? Que un titular con plan vea el nombre del conductor en su lista de resultados, ¿ya cuenta como entrega de datos?
  *Por qué importa:* el conductor no ve el contacto del titular, así que esa lista es su única forma de saber quién tiene su teléfono. *Fuente:* propuesta-campos.md §4 [verificar con abogado]; modelo-datos.json (pendiente MD33).

### 6. Plazos de conservación y borrado

- **A24.** Fotos de documentos: ¿cuánto tiempo después de decidir se borran? Opciones: apenas se decide; unos días (ej. 7) para atender una segunda revisión; un plazo distinto por documento.
  *Por qué importa:* las fotos traen foto, firma y RUN. *Fuente:* modelo-datos.json (pendiente MD20); propuesta-campos.md P1 d) y P16; contexto-chile.md §4.
- **A25.** ¿Qué lados de la cédula y de la licencia podemos pedir? La cédula trae la firma y quizás la huella (dato biométrico) [verificar]; la licencia muestra restricciones (posible dato de salud) y quizás el domicilio [verificar].
  *Por qué importa:* conviene pedir solo lo necesario. *Fuente:* propuesta-campos.md P1 d), D1 y D2.
- **A26.** Mensajes: ¿cuánto tiempo se guardan? Opciones: N meses desde el último mensaje (ej. 6 o 12), o mientras existan el match y las dos cuentas. Las conversaciones reportadas, hasta resolver el caso más un plazo.
  *Por qué importa:* no hay un plazo legal específico; rige la proporcionalidad. *Fuente:* documentos-y-mensajes.md §8 ("Datos personales"); modelo-datos.json (pendiente MD13).
- **A27.** Al borrar una cuenta, ¿qué debemos o podemos conservar, y por cuánto? Por ejemplo: autorizaciones, registro de entregas de datos, reportes abiertos y pagos (ley tributaria) [verificar con abogado y contador].
  *Por qué importa:* hoy la pantalla "Eliminar cuenta" dice que se borra todo. *Fuente:* modelo-datos.json (pendiente MD23).
- **A28.** ¿Qué plazos fijar para lo demás: matches que ya no están vigentes, reportes resueltos, recordatorios enviados, documentos reemplazados o rechazados, y cuentas incompletas o inactivas? ¿En cuántos días hay que responder un pedido de acceso, corrección, supresión, oposición o portabilidad? [verificar plazo legal con abogado]
  *Por qué importa:* la Política de privacidad debe decir cada plazo. *Fuente:* modelo-datos.json (pendiente MD38); terminos-y-privacidad.md ("Cuenta").

### 7. Relación laboral y lenguaje comercial

- **A29.** La app habla de "búsqueda", "oferta" y "condiciones", nunca de "vacante", "sueldo" o "jefe", y no redacta contratos. ¿Qué más hace falta para que la app no aparezca como empleadora?
  *Por qué importa:* la Dirección del Trabajo ha dicho que hay relación laboral entre dueño y conductor cuando hay subordinación, diga lo que diga el papel [verificar con abogado]. *Fuente:* propuesta-campos.md ("Antes de leer las tablas") y P1 i); contexto-chile.md §6; mercado-avisos.md §4 punto 4.
- **A30.** Si la relación entre titular y conductor resulta laboral, ¿puede el titular exigir el certificado de antecedentes?
  *Por qué importa:* según la Dirección del Trabajo, por regla general no, salvo que sea indispensable para la idoneidad del cargo. Para conductores no encontramos un dictamen específico [verificar]. *Fuente:* documentos-y-mensajes.md §1 (fila "Relación laboral").

### 8. Ley 21.553 (apps de transporte o "EAT")

- **A31.** ¿Nos regula la Ley 21.553? Conectamos conductores con titulares, no pasajeros con conductores, así que en principio no seríamos una EAT [verificar con abogado].
  *Por qué importa:* si nos regulara, tendríamos obligaciones propias. *Fuente:* contexto-chile.md §5.
- **A32.** Cuando rija, la licencia B dejaría de bastar para "Transporte por aplicación", con 12 meses de transición. ¿Podemos seguir haciendo match con licencia B durante ese plazo? ¿Tenemos algún deber de avisar?
  *Por qué importa:* ese negocio no está activo en el lanzamiento, pero ya está cargado. *Fuente:* propuesta-catalogos.md §3 y §4; modelo-datos.json (fecha de término por clase, [verificar con abogado]).

### 9. Mensajes, reportes y bloqueo

- **A33.** ¿Cómo moderar los mensajes sin chocar con la inviolabilidad de las comunicaciones privadas (Constitución, art. 19 N°5)? Propuesta: un filtro automático, una persona lee solo las conversaciones reportadas y los términos lo informan con consentimiento expreso [verificar con abogado].
  *Por qué importa:* según el Tribunal Constitucional, una comunicación privada solo la conocen quienes participan en ella. *Fuente:* documentos-y-mensajes.md §8 y "Qué confirmar con un abogado" 6.
- **A34.** ¿Qué deben decir las normas de mensajes? Apple y Google piden reportar, bloquear y moderar, y que el usuario acepte los términos antes de escribir. En rechazos de Apple se ha pedido "tolerancia cero" y atender los reportes en 24 horas [verificar].
  *Por qué importa:* sin esto las tiendas rechazan la app. *Fuente:* documentos-y-mensajes.md §8.
- **A35.** "Revelar mi contacto" (titular) y "Compartir mi dirección" (conductor): ¿basta con registrar a quién y cuándo, y avisar antes que no se puede deshacer?
  *Por qué importa:* es comunicar datos a un tercero con el consentimiento de la persona. *Fuente:* documentos-y-mensajes.md §8; `CLAUDE.md` (Mensajes y Dirección del conductor).

### 10. Cobro y tiendas

- **A36.** Al inicio se cobra solo por pago web. ¿Qué debemos cumplir al cobrar una suscripción mensual por la web? ¿Las empresas necesitan factura, y qué datos tributarios del titular habría que pedir? (puede ser con el contador)
  *Por qué importa:* las flotas, el segmento que más paga, suelen necesitar factura. *Fuente:* propuesta-campos.md P14; `CLAUDE.md` (Cobro).
- **A37.** En las tiendas, una suscripción que desbloquea contenido probablemente debe cobrarse con el sistema de Apple y Google (Apple, guía 3.1.1). ¿Aplica alguna excepción, como la guía 3.1.3, para seguir cobrando por la web? [verificar]
  *Por qué importa:* las tiendas cobran comisión y no emiten factura chilena. *Fuente:* propuesta-campos.md P14.

### 11. Marca (INAPI)

- **A38.** ¿Conviene registrar "Dale Contacto" en INAPI? ¿En qué clases? Probablemente 9 (software), 35 (intermediación) y 42 (servicios de plataforma) [verificar con INAPI o un abogado de marcas].
  *Por qué importa:* el nombre ya es definitivo y el dominio dalecontacto.cl está comprado. Existe "dale!", una billetera digital de Colombia, de otro rubro. *Fuente:* propuesta-nombres.md ("Antes de elegir"); `CLAUDE.md` (Nombre).
- **A39.** ¿A nombre de quién conviene registrar la marca? El dominio está a nombre de Mario, socio de la dueña (intencional), y las cuentas de las tiendas irán a nombre de la dueña, para pasarlas después a una empresa.
  *Por qué importa:* evita problemas al pasar todo a una empresa. *Fuente:* `CLAUDE.md` (Nombre y Cuentas de desarrollador).

### 12. Términos y Política de privacidad

- **A40.** ¿Puede redactar o revisar los Términos, la Política de privacidad y los textos de las autorizaciones? Lo que deben cubrir está en `terminos-y-privacidad.md`.
  *Por qué importa:* hace falta una política publicada para lanzar (Apple, guía 5.1.1(i); Google Play igual [verificar]), y la ley obliga a informar finalidades, datos, destinatarios y seguridad. *Fuente:* propuesta-campos.md P1 j); contexto-chile.md §4.
- **A41.** Mientras no exista una empresa, ¿quién figura como responsable de los datos? ¿Conviene crear la empresa antes de lanzar?
  *Por qué importa:* las cuentas parten a nombre de la dueña como persona natural, y Apple pide publicar los datos de contacto de quien publica la app. *Fuente:* `CLAUDE.md` (Cuentas de desarrollador); documentos-y-mensajes.md §8.
- **A42.** ¿Qué debemos aclarar sobre lo que garantiza una insignia "revisado"? La de la cédula no prueba que quien usa la cuenta sea su dueño, y una licencia puede suspenderse sin que la app se entere. ¿Cómo limitar la responsabilidad de la app si un acuerdo sale mal (por ejemplo, un vehículo no devuelto)?
  *Por qué importa:* los titulares pagan por la confianza, y hay casos de vehículos arrendados que no se devolvieron. *Fuente:* propuesta-campos.md D1 y D2; mercado-avisos.md §4 punto 2.
- **A43.** Si hay una filtración de datos, ¿en qué plazo hay que avisar? Una fuente dice 72 horas [verificar].
  *Por qué importa:* debe quedar en la política y en el plan del equipo. *Fuente:* contexto-chile.md §4.
- **A44.** App web: ¿qué hay que informar sobre las cookies o el almacenamiento del navegador (por ejemplo, para mantener la sesión abierta)?
  *Por qué importa:* la app se lanza primero en la web. *Fuente:* terminos-y-privacidad.md ("App web").
- **A45.** Borrado de cuenta: Apple exige poder borrarla desde la app y Google pide además un enlace web [verificar]. Si alguien paga por la tienda, ¿basta con avisarle que cancele allá la suscripción? [verificar]
  *Por qué importa:* es parte del derecho de supresión y de las reglas de las tiendas. *Fuente:* documentos-y-mensajes.md §8; propuesta-campos.md §4; modelo-datos.json (borrado de cuenta).
- **A46.** ¿Qué debe decir la Política sobre los derechos de acceso, rectificación, supresión, oposición y portabilidad, y cómo se piden?
  *Por qué importa:* la Ley 21.719 los da con plazos de respuesta. *Fuente:* terminos-y-privacidad.md ("Cuenta"); contexto-chile.md §4.
- **A47.** ¿Está bien la casilla "Términos, política de privacidad y declaro ser mayor de 18 años" como una sola, o deben ir separadas?
  *Por qué importa:* es la primera casilla del registro. *Fuente:* propuesta-campos.md §4 ("Avisos y consentimientos").

### 13. Para más adelante (no bloquea el lanzamiento)

- **A48.** Transporte escolar: la ley pide revisar las inhabilidades para trabajar con menores (Ley 20.594; DL 645, art. 6 bis), que también son datos sobre sanciones. ¿Puede la app incluirlo, o la consulta la debe hacer el titular?
  *Por qué importa:* es el primer negocio candidato para después. *Fuente:* propuesta-campos.md P15; documentos-y-mensajes.md §1; propuesta-catalogos.md §2.
- **A49.** Foto de rostro (selfie): si una persona la compara a ojo con la cédula, ¿igual es un dato biométrico?
  *Por qué importa:* es la primera medida si aparecen suplantaciones. *Fuente:* propuesta-campos.md §5; contexto-chile.md §4.
- **A50.** Garantía (cuando vuelva el modelo de contrato): ¿el tramo que puede pagar el conductor es un dato de "situación socioeconómica", o sea sensible? [verificar interpretación]
  *Por qué importa:* si lo es, necesita una autorización aparte. *Fuente:* propuesta-campos.md P1 e); modelo-datos.json (pendiente MD26); contexto-chile.md §4.
- **A51.** ¿Se puede sumar "Sueldo" como modo de contrato, u ofrecer plantillas de contrato, sin que la app parezca empleadora? [verificar con abogado]
  *Por qué importa:* el modelo de contrato quedó como crecimiento futuro. *Fuente:* propuesta-catalogos.md pregunta 10; propuesta-campos.md §5.

## Qué llevar a la reunión

- Este documento.
- `docs/terminos-y-privacidad.md`: la lista de lo que deben cubrir los textos legales.
- La lista de datos que se piden, quién ve cada uno y para qué: el modelo de datos (https://claude.ai/artifact/1ACYaM3MWdn1yiMpe7pwkK) y `docs/propuesta-campos.md`.
- El flujo de documentos (sección 1 de este documento) y el prototipo del conductor, con las pantallas de registro, documentos y mensajes (https://claude.ai/artifact/N5JbJkK1ub26v14FpzhcAg).
- Un ejemplo real de Hoja de Vida y de Certificado de Antecedentes para fines especiales (pueden ser los de la dueña), para ver qué datos traen.
- La lista de proveedores: Supabase (Brasil), Google Maps, proveedor de IA (por definir), WhatsApp y SMS (por definir) y pago web (por definir).
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
- Cada 6 meses: certificado de antecedentes para operadores de pasajeros (Ley 21.733) y para apps (Ley 21.553, cuando rija).
- 60 días: plazo para validar un certificado en el verificador del Registro Civil (una nota de prensa habla de 90 días [conflicto]).
- 30 días: antigüedad máxima de los informes para trámites de licencia (Ley 18.290, art. 14).
- 12 meses: plazo para que los conductores de apps saquen licencia profesional cuando rija la Ley 21.553.
- 4 años: control de la licencia profesional.

*Fuentes de los plazos:* documentos-y-mensajes.md §3 y §7; contexto-chile.md §1 y §5.

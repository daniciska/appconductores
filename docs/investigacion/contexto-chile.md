# Contexto chileno para definir campos y documentos (app conductores ↔ titulares)

> **Actualización 8-oct-2026:** ver correcciones en `documentos-y-mensajes.md` §9 (Ley 21.733, art. 25 incluye infracciones administrativas, estado de la Ley 21.553 y de la postergación de la Ley 21.719).

> **Nota de método.** Desde este entorno el proxy bloqueó el acceso directo a los sitios oficiales (chileatiende.gob.cl, bcn.cl, registrocivil.cl, sii.cl), así que no los pude abrir. Los datos salen de resultados de búsqueda que citan esas páginas y de medios y blogs chilenos. Antes de publicar, revisa en el sitio oficial todo lo marcado **[verificar]**. Fecha de corte: 1-oct-2026.

---

## 1. Clases de licencia de conducir (Ley 18.290, art. 12)

| Clase | Tipo | Qué vehículos permite conducir | Requisitos clave |
|---|---|---|---|
| **A1** | Profesional | Taxis | 20 años o más, 2 años con licencia B y curso en escuela de conductores profesionales |
| **A2** | Profesional | Taxis, ambulancias y transporte público o privado de personas de 10 a 17 asientos. Con 2 años de antigüedad, hasta 32 asientos si el vehículo mide ≤ 9 m | Igual que A1 |
| **A3** | Profesional | Taxis, **transporte escolar**, ambulancias y transporte de personas **sin límite de asientos** (buses) | Haber tenido A1 o A2 (algunas fuentes agregan A4 o A5) por 2 años, más curso con simulador **[verificar prerrequisito exacto]** |
| **A4** | Profesional | Carga en vehículos **simples** de más de 3.500 kg de peso bruto | 20 años o más, 2 años con licencia B y curso |
| **A5** | Profesional | Carga en vehículos simples **o articulados** (tracto, semirremolque) de más de 3.500 kg | Haber tenido A4 (otras fuentes dicen A2, A3 o A4) por 2 años, más curso con simulador **[verificar]** |
| **B** | No profesional | Vehículos de 3 o más ruedas para transporte particular, hasta 9 asientos sin contar al conductor, o carga de hasta 3.500 kg (auto, camioneta, furgón) | 18 años o más |
| **C** | No profesional | Motos, motonetas y bicimotos (2 o 3 ruedas) | — |
| **D** | Especial | Maquinaria automotriz: tractores, palas mecánicas y similares | — |
| **E** | Especial | Vehículos de tracción animal | — |
| **F** | Especial | Vehículos de las FF.AA., las policías y Bomberos | — |

Otros puntos:
- **Licencias "antiguas" A1 y A2**, emitidas antes del 8-mar-1997 (Ley 19.495), siguen vigentes. Tener la A1 antigua por 2 años permite postular a la A3, y la A2 antigua a la A5. Para transporte escolar se acepta **A3 o A1 antigua**.
- **Control y renovación:** la licencia B cada 6 años y las profesionales (A) cada 4 años. La fecha del próximo control conviene guardarla.
- **Licencia digital:** existe la app "Licencia Digital" de CONASET/MTT, con ingreso por ClaveÚnica y un **QR dinámico** que Carabineros e inspectores escanean. Se asigna de forma progresiva a medida que la gente renueva su licencia. No confirmé si un tercero, como la app, puede validar ese QR **[verificar]**.
- **Conductores extranjeros:** un residente (temporal o permanente) debe sacar licencia chilena. La licencia internacional sirve hasta 1 año y **no habilita para conducir de forma remunerada**. Hay convenios de homologación con España, Corea del Sur, Perú, Colombia y Ecuador **[verificar lista vigente]**.

**Qué implica para los campos:** clases de licencia como selección múltiple (incluyendo "A1 antigua" y "A2 antigua"), fecha de obtención de cada clase (sirve para medir antigüedad y experiencia), fecha del próximo control y restricciones. Conviene una tabla **tipo de vehículo → clase exigida**, editable desde el panel:

| Tipo de vehículo | Clase exigida |
|---|---|
| Auto particular o furgón ≤ 3.500 kg | B |
| Taxi o colectivo | A1, A2 o A3 |
| Minibús de 10 a 17 asientos | A2 o A3 |
| Bus | A3 (A2 si son hasta 32 asientos, ≤ 9 m y 2 años de antigüedad) |
| Transporte escolar | A3 o A1 antigua |
| Camión simple > 3.500 kg | A4 o A5 |
| Camión articulado o tracto | A5 |
| Moto de reparto | C |
| Maquinaria | D |
| Auto de aplicación | B hoy; profesional cuando rija la Ley 21.553 (ver §5) |

---

## 2. Documentos que se pueden verificar de un conductor

| Documento | Quién lo emite | ¿Online y gratis? | ¿Qué trae verificable? |
|---|---|---|---|
| **Cédula de identidad (RUN)** | Registro Civil | Hay consulta pública de vigencia | Con RUN, tipo de documento y número de documento o serie se consulta si la cédula está vigente (portal.sidiv.registrocivil.cl) **[verificar URL actual]**. El RUN tiene dígito verificador (algoritmo módulo 11), validable en el formulario. |
| **Licencia de conducir** | Dirección de Tránsito de la municipalidad. Queda inscrita en el Registro Nacional de Conductores, que administra el Registro Civil | — | Se verifica con la Hoja de Vida (muestra las clases) o con el QR de la licencia digital (ver §1). |
| **Hoja de Vida del Conductor** | Registro Civil | **Sí, gratis.** Web (Vehículos → Certificado hoja de vida del conductor), app Civil Digital u oficina. Se pide con RUN y **ClaveÚnica del propio conductor**, así que tiene que subirla él | **Folio y código de verificación**, que se validan en el verificador del Registro Civil hasta **60 días** después de emitida. Contiene licencias (clase, fecha y comuna de la primera y la última emisión), restricciones, anotaciones (solo infracciones graves y gravísimas), suspensiones, cancelaciones, causas pendientes en el Juzgado de Policía Local y accidentes. |
| **Certificado de Antecedentes** | Registro Civil, a partir del Registro General de Condenas | **Gratis** por web con ClaveÚnica, app Civil Digital o tótem. En oficina cuesta $1.050 | **Folio y código de verificación**, válidos por 60 días. Hay versión "fines particulares" (para buscar trabajo) y "fines especiales" (cuando lo exige una institución); según una fuente traen la misma información. Las anotaciones pueden estar omitidas o eliminadas. **Riesgo legal alto: ver §4.** |
| *Certificado de inhabilidades para trabajar con menores (Ley 20.594)* | Registro Civil | Consulta online (inhabilidades.srcei.cl) | Solo aplica a **transporte escolar**. |
| *Inscripción en RENASTRE (transporte escolar)* | MTT | — | Solo para escolares; lo menciono como referencia. |

Verificador de certificados del Registro Civil: https://www.registrocivil.cl/OficinaInternet/verificacion/verificacioncertificado.srcei

**Qué implica para los campos:** el flujo natural de verificación es que el conductor sube el PDF y escribe el folio y el código; un admin los valida en el verificador antes de que pasen 60 días. Se guarda la fecha de emisión, la fecha de validación y el estado (pendiente, verificado o rechazado). Además conviene pedir los documentos de nuevo cada cierto tiempo (periodicidad configurable).

---

## 3. Titular: persona natural, empresa y documentos del vehículo

**Titular persona natural:** los mismos datos de identidad que el conductor (RUN y nombre, más cédula si se verifica). Una persona natural con negocio usa su mismo RUT ante el SII.

**Titular empresa:**
- **RUT de empresa, razón social, giro (códigos de actividad económica) y fecha de inicio de actividades.** Todo se verifica **gratis** en el SII, en "Situación tributaria de terceros": basta el RUT y un captcha, sin clave. Muestra la razón social, el inicio de actividades y si está vigente, y las actividades económicas vigentes.
- **Vigencia de la sociedad:** si se constituyó en el Registro de Empresas y Sociedades ("Empresa en un Día"), el certificado es gratis y trae un **código de verificación electrónica (CVE)**, verificable en registrodeempresasysociedades.cl/VerificarCertificados.aspx. Si se constituyó por escritura pública, la vigencia la da el Conservador de Bienes Raíces (Registro de Comercio) **[verificar]**.
- Representante legal: nombre y RUN **[campo sugerido; no lo saqué de una fuente]**.

**Documentos del vehículo** (solo los menciono; no decido si van en el MVP):

| Documento | Emisor y notas |
|---|---|
| Padrón o Certificado de Inscripción (RVM) | Registro Civil. Es de porte obligatorio. |
| Certificado de Anotaciones Vigentes (CAV) | Registro Civil. Muestra dueños actuales y anteriores y limitaciones al dominio. Cuesta unos $1.560 y es válido por 60 días. |
| Permiso de circulación | Municipalidad, anual. Particulares pagan entre febrero y marzo; **taxis y buses en mayo**; carga pesada en septiembre. |
| Revisión técnica | Planta de Revisión Técnica (PRT). Se consulta gratis por patente. |
| SOAP | Aseguradora, anual. Se consulta gratis por patente en el portal de la AACH. |
| Registros sectoriales | RENASTRE para transporte escolar. Para taxis, colectivos y buses, inscripción en el Registro Nacional de Servicios de Transporte Público de Pasajeros **[verificar]**. |

---

## 4. Protección de datos personales (Ley 19.628 y Ley 21.719)

**Estado legal:**
- Hoy rige la **Ley 19.628**.
- La **Ley 21.719** se publicó el 13-dic-2024 y entra en vigencia el **1-dic-2026**.
- El 1-sep-2026 el Gobierno ingresó el **boletín 18.623-07** para postergarla al 1-dic-2027. Está en primer trámite en el Senado y **no es ley todavía**, así que hay que diseñar pensando en la 21.719.

**Datos sensibles (Ley 21.719, art. 2 letra g):** origen étnico, afiliación política, sindical o gremial, **situación socioeconómica**, convicciones, religión, salud, perfil biológico, **datos biométricos** y vida sexual.
- Una selfie comparada contra la foto de la cédula (reconocimiento facial) es un **dato biométrico, o sea sensible**: exige consentimiento explícito y medidas de seguridad reforzadas.
- Campos de ingresos o ganancias del conductor podrían caer en "situación socioeconómica" **[verificar interpretación]**.
- El **RUT** es un dato personal, pero no sensible.

**Antecedentes penales (punto crítico):** el art. 25 de la Ley 21.719 dice: *"Los datos personales relativos a la comisión y sanción de infracciones penales, civiles, administrativas y disciplinarias sólo pueden ser tratados por los organismos públicos para el cumplimiento de sus funciones legales… y en los casos expresamente previstos en la ley."*
- La Ley 21.553 sí lo prevé expresamente para las empresas de aplicación de transporte (EAT), pero **esta app no es una EAT**.
- Por eso, que la app **guarde o procese certificados de antecedentes es un riesgo legal**. Hay que consultarlo con un abogado antes de incluirlo **[verificar con abogado]**.
- Opciones a evaluar con el abogado:
  - **(a)** No pedirlo en la app y que el conductor lo muestre directamente al titular después del match.
  - **(b)** Verificarlo y borrar el PDF, guardando solo "verificado el dd/mm". Esto igual cuenta como tratamiento de datos.
- Hay criterio de la Dirección del Trabajo de que exigir antecedentes sin relación directa con la idoneidad para el cargo puede ser discriminatorio **[verificar]**.

**Fotos de documentos:** incluyen foto, firma y RUN. Lo prudente es pedir solo lo necesario, guardarlas en almacenamiento cifrado, fijar un plazo de retención y borrarlas cuando se cierra la cuenta.

**Bases legales y obligaciones (Ley 21.719):**
- **Bases de licitud:** el consentimiento es la regla (libre, informado, específico, previo e inequívoco; el tácito ya no vale). También se puede tratar datos sin consentimiento por ejecución de un contrato, obligación legal, interés legítimo o defensa en tribunales.
- **Deber de información:** publicar una política de tratamiento (finalidades, categorías de datos, destinatarios, medidas de seguridad).
- **Derechos del titular de los datos:** acceso, rectificación, supresión, oposición y portabilidad.
- **Seguridad y brechas:** medidas de seguridad, notificación de brechas (una fuente dice 72 h **[verificar]**) y evaluación de impacto (EIPD) cuando el tratamiento es de alto riesgo.
- **Multas:** hasta 5.000 UTM (leves), 10.000 UTM (graves) y 20.000 UTM (gravísimas). En reincidencia pueden llegar al 2 % o 4 % de los ingresos anuales.

**En la práctica, para la app:** checkboxes de consentimiento separados para:
1. Términos y política de privacidad.
2. **Compartir teléfono y email con la contraparte cuando hay match** (es comunicación de datos a un tercero).
3. Verificación de documentos.
4. Biometría, si se usa.

Hay que ofrecer una forma de ejercer los derechos (acceso, rectificación, supresión, etc.) y de eliminar la cuenta.

---

## 5. Ley 21.553 ("Ley EAT" o "Ley Uber")

**Estado al 1-oct-2026: no está vigente.**
- Se publicó el 19-abr-2023, pero entra en vigencia 30 días después de que se publique su reglamento en el Diario Oficial.
- La Contraloría tomó razón del reglamento original en 2025, pero nunca se publicó.
- En abril de 2026 el Gobierno anunció cambios: antigüedad del vehículo de hasta 5 años y eliminación de la cilindrada mínima de 1.400 cc.
- En junio de 2026 la Contraloría objetó el decreto modificatorio, y en septiembre de 2026 se reingresó **[verificar al lanzar]**.

**Qué exige a los conductores cuando entre en vigencia:**
- **Licencia profesional** para transporte de pasajeros, con el control vigente. Las fuentes no coinciden en la clase: unas dicen A1, A2 o A3 y otras solo A2 **[verificar]**.
- Quienes ya trabajan en apps tendrían **12 meses** para obtenerla.
- Las EAT inscriben a sus conductores y vehículos en un registro electrónico de la Subsecretaría de Transportes, dentro de 6 meses.
- **Certificado de antecedentes para fines especiales** sin delitos sexuales, infracciones a la Ley de Drogas ni conducción en estado de ebriedad o bajo efecto de drogas. Según el borrador de reglamento de 2023, se renovaría cada 6 meses **[verificar versión final]**.
- **Vehículos:** revisión técnica semestral y estándares mínimos equivalentes a los de un taxi básico.

**Aplicación a esta app:** la ley regula a las EAT (apps que conectan pasajeros con conductores). Esta app conecta conductores con titulares, así que **en principio no la regula directamente** **[verificar con abogado]**. Igual afecta los campos de los perfiles de "auto de aplicación": "tiene licencia profesional (sí/no y clase)" y, cuando exista el registro, "inscrito en el registro EAT". En el vehículo, guardar el año (la antigüedad máxima puede cambiar).

---

## 6. Cómo se usan en la práctica las tres modalidades de contrato

**1) Arriendo fijo o "renta diaria"**
- **Taxis y colectivos:** el conductor entrega al dueño una suma fija diaria (a veces pactada en otro plazo), se queda con el resto y **paga el combustible**. Según la Dirección del Trabajo, esto se acerca a un arriendo sin jornada laboral (fuente BCN).
- **Autos de aplicación:** el arriendo es **semanal**. En 2026 va de unos $62.800 (Uber Carflex) a $242.000 (GoCab), pagado por adelantado y con garantía (por ejemplo 3 UF en AUTO-CHECK). Algunos planes incluyen seguro, mantención, permiso de circulación e impuesto verde. **Casi siempre la bencina y el TAG los paga el conductor.** Tucar cobra una base más un variable por km.

**2) "% de ganancia" y 3) "% sobre producción"**
- **Taxis:** el conductor se queda con el **30 % a 50 % de la recaudación bruta diaria** y el **dueño paga el combustible**.
- **Colectivos:** las utilidades suelen repartirse **50/50** al día (fuente BCN).
- **Camiones:** es común un sueldo base más una **comisión como % del flete** (carga.cl) **[verificar]**.
- **Buses antiguos:** el pago por "boleto cortado" era del 15 % al 20 % de cada boleto (CEPAL), un esquema criticado porque incentivaba conducir de forma riesgosa.
- **Reparto:** no encontré una fuente sobre cómo se pacta **[verificar]**.
- **Ojo con los términos:** las fuentes hablan de "recaudación bruta" (que se parece a "producción") y de "utilidades" (que se parece a "ganancia"). La diferencia operativa sería si se descuentan los gastos antes de repartir. Hay que **definir cada término en la app** **[verificar uso local]**.

**Datos que se pactan en la práctica (insumo para los campos):**
- Modalidad.
- Monto y periodicidad (diaria, semanal o mensual).
- Garantía.
- Porcentaje y base sobre la que se calcula (bruto o neto).
- Quién paga cada gasto: combustible o carga, mantención, seguro, TAG, permiso. Las multas son una suposición mía **[sin fuente]**.
- Turno (día, noche o 24 h) y días por semana.
- Límite de kilometraje (sale del modelo de Tucar).

**Riesgo laboral:** si en los hechos hay subordinación y dependencia, se configura una relación laboral, sin importar lo que diga el papel (principio de primacía de la realidad). Conviene que los campos describan un acuerdo comercial y no usen lenguaje de empleo **[verificar con abogado]**.

---

## Fuentes

**§1 Licencias**
- https://www.chileatiende.gob.cl/fichas/20592-licencias-de-conducir
- https://www.chileatiende.gob.cl/fichas/24034-licencia-de-conducir-profesional-clase-a
- https://www.chileatiende.gob.cl/fichas/24065-licencia-de-conducir-no-profesional-clase-b
- https://iura.cl/18290/12
- https://www.temuco.cl/tramites-servicios/obtencion-licencia-de-conducir-profesional-clase-a-1-a-2-y-a-4-ley-19-495/
- https://www.autofact.cl/blog/mi-auto/licencias/licencia-a3
- https://practicatest.cl/blog/licencias-de-conducir/tipos-licencia-conducir-chile
- https://appcopecempresa.cl/blog/tipos-de-licencia-de-conducir/
- https://licenciadigital.conaset.cl/
- https://www.elmostrador.cl/datos-utiles/2026/07/30/tu-licencia-de-conducir-digital-ya-se-puede-descargar-la-duda-clave-sobre-si-debes-renovar-hoy/
- https://www.autofact.cl/blog/mi-auto/conduccion/licencia-conducir-extranjeros-chile
- https://practicatest.cl/blog/articulos-especiales/furgones-escolares-requisitos

**§2 Documentos del conductor**
- https://www.chileatiende.gob.cl/fichas/13661/1/pdf
- https://www.latercera.com/servicios/noticia/hoja-de-vida-del-conductor-conoce-como-obtener-el-documento-gratis/EPQZODRRKBFB7GKGMJE2VLLM5U/
- https://www.biobiochile.cl/noticias/servicios/explicado/2025/09/24/como-obtener-gratis-la-hoja-de-vida-del-conductor-y-que-hacer-para-borrar-anotaciones-por-infracciones.shtml
- https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes
- https://www.24horas.cl/te-sirve/registro-civil/registro-civil-como-pedir-un-certificado-de-antecedentes
- https://www.registrocivil.cl/OficinaInternet/verificacion/verificacioncertificado.srcei
- https://portal.sidiv.registrocivil.cl/
- https://dev.to/fdograph/como-validar-un-rut-chileno-5335
- https://www.24horas.cl/te-sirve/registro-civil/registro-civil-consulta-lista-inhabilitados-trabajar-menores-edad

**§3 Titular y vehículo**
- https://www.sii.cl/como_se_hace_para/situacion_trib_terceros.html
- https://www.chileatiende.gob.cl/fichas/3130-situacion-tributaria-de-terceros
- https://www.registrodeempresasysociedades.cl/VerificarCertificados.aspx
- https://www.chileatiende.gob.cl/fichas/3370/1/pdf
- https://www.autofact.cl/blog/comprar-auto/tramites/certificado-anotaciones-vigentes
- https://www.chileatiende.gob.cl/fichas/9611-permiso-de-circulacion
- https://www.chileatiende.gob.cl/fichas/86124-consultar-el-estado-de-la-revision-tecnica-de-un-vehiculo-motorizado
- https://portal.aach.cl/aach-educa/como-saber-si-mi-auto-tiene-soap-guia-paso-a-paso/
- https://www.autofact.cl/blog/mi-auto/seguros/documentos-obligatorios-auto

**§4 Protección de datos**
- https://www.bcn.cl/leychile/navegar?idNorma=1209272
- https://www.bcn.cl/leychile/navegar?idNorma=141599
- https://protecciondatosweb.cl/postergacion-de-la-ley-21719-al-2027/
- https://clya.cl/noticias/prorroga-ley-21719-proteccion-datos/
- https://alayiatrust.com/blog/datos-sensibles-ley-21719
- https://www.xmslatam.com/datos-sensibles-biometricos-ley-21719/
- https://blog.hackmetrix.com/bases-de-licitud-ley-21719-chile/
- https://preyproject.com/es/blog/multas-y-sanciones-ley-21719
- https://iura.cl/19628/21
- https://www.prieto.cl/en/en-el-marco-del-tratamiento-de-datos-personales-direccion-del-trabajo-establece-que-certificado-de-antecedentes-laborales-vulnera-el-derecho-a-la-no-discriminacion-2/

**§5 Ley 21.553**
- https://www.bcn.cl/leychile/navegar?idNorma=1191380
- https://vlex.cl/vid/ley-num-21553-publicada-929179260
- https://www.subtrans.gob.cl/wp-content/uploads/2023/09/Reglamento_Ley-N%C2%B021553_EAT_CONSULTA-P%C3%9ABLICA.pdf
- https://practicatest.cl/blog/articulos-especiales/ley-uber-chile-requisitos-conductores-vigencia
- https://www.elmostrador.cl/datos-utiles/2026/04/30/los-autos-de-uber-podran-ser-mas-viejos-y-los-taxis-colectivos-llevar-hasta-8-pasajeros-asi-cambia/
- https://www.lanacion.cl/ley-uber-contraloria-objeta-decreto-del-ministerio-de-transportes-que-flexibilizaba-requisitos-a-conductores-y-vehiculos/
- https://www.gob.cl/noticias/nuevo-reglamento-ley-uber-2026-flexibilizacion-barreras-entrada-contraloria/
- https://www.redimin.cl/conductores-de-uber-en-chile-deberan-contar-con-licencia-a2-y-cumplir-nuevos-requisitos-segun-la-ley-21-553

**§6 Modalidades de contrato**
- https://obtienearchivo.bcn.cl/obtienearchivo?id=repositorio%2F10221%2F36008%2F1%2Fconductores_Taxis_colectivos_y_Uber__2024.pdf
- https://naran.blog/arriendo-de-auto-uber-santiago/
- https://www.uber.com/cl/es/blog/uber-carflex/
- https://tucar.app/
- https://carga.cl/blog/sueldo-camionero-chile
- https://repositorio.cepal.org/server/api/core/bitstreams/bbfba085-dc3c-4a53-b89f-e10c7c432b1b/content
- https://www.dt.gob.cl/legislacion/1624/w3-article-115988.html
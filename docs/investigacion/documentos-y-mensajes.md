# Hoja de Vida y Certificado de Antecedentes como requisito, revisión con IA y mensajería (Chile, al 8 de octubre de 2026)

> **Cómo se hizo esta investigación.** El proxy volvió a bloquear los sitios oficiales (bcn.cl, diariooficial.interior.gob.cl, senado.cl y registrocivil.cl) y WebFetch no pudo abrir ninguna página. Por eso todo sale de resultados de búsqueda: extractos de BCN y ChileAtiende, prensa, estudios de abogados y documentación de las tiendas. Lo marcado **[verificar]** no está confirmado. No repito lo que ya está en `docs/investigacion/contexto-chile.md`, salvo para corregirlo; las correcciones están en la sección 9.

---

## 0. Resumen en 5 puntos

1. **Hoy no hay una ley que obligue a todos los conductores a tener Hoja de Vida o Certificado de Antecedentes.** El certificado para fines especiales sí es obligatorio en casos concretos:
   - para sacar licencia A-1, A-2 o A-3;
   - para los operadores de transporte público de pasajeros (taxis, colectivos y buses), que deben pedirlo cada 6 meses según la Ley 21.733, vigente desde abril de 2025;
   - para inscribir conductores de transporte escolar;
   - para las apps tipo Uber, cuando rija la Ley 21.553.

   La **Hoja de Vida no aparece como exigencia legal directa** en ninguna de esas normas. La usa el Estado para otorgar la licencia, y las empresas la piden por costumbre.
2. **La ley que viene (21.553, "Ley Uber") sigue sin regir.** Su reglamento se reingresó a la Contraloría en septiembre de 2026. No encontré ningún proyecto que vaya a exigir la Hoja de Vida.
3. **El mayor riesgo legal no es pedir los documentos, sino que la app los procese y los guarde.** Desde el 1 de diciembre de 2026, salvo que se apruebe la postergación, el art. 25 de la Ley 21.719 limita el tratamiento de datos sobre infracciones penales **y administrativas** a organismos públicos y a casos que la ley prevé expresamente. Probablemente alcanza **a los dos documentos**. Hay que verlo con un abogado antes de construir.
4. **¿Puede revisarlos un agente de IA? Técnicamente, sí.** Legalmente es defendible si se cumplen cuatro condiciones:
   - la IA solo propone;
   - una persona decide todo rechazo;
   - la autenticidad se confirma con el Registro Civil;
   - se evita, o se resguarda por contrato, el envío a una IA en el extranjero.
5. **Mensajería dentro de la app.** Apple y Google exigen reportar, bloquear y moderar, que el usuario acepte los términos antes de escribir y que pueda borrar su cuenta desde la app. En Chile, además, está la **inviolabilidad de las comunicaciones privadas**, que limita cómo se moderan los mensajes.

---

## 1. Lo que exige la ley vigente hoy

| Servicio o licencia | Qué exige | A quién | Fuente |
|---|---|---|---|
| **Toda licencia** (A, B, C, D) | La Dirección de Tránsito califica la "idoneidad moral" con el **Informe de Antecedentes** del Registro Civil y el informe del **Registro Nacional de Conductores** (de donde sale la Hoja de Vida), ambos emitidos hace menos de 30 días. Se consideran condenas de los últimos 5 años por: Ley de Tránsito, alcoholes y drogas; delitos con vehículo; delitos contra el orden de la familia y la moralidad pública; y conducir con licencia falsa. La licencia profesional repite el trámite **cada 4 años** y la B o C cada 6. | Al **conductor**, ante la municipalidad | [iura 18290/13](https://iura.cl/18290/13), [iura 18290/14](https://iura.cl/18290/14), [iura 18290/15](https://iura.cl/18290/15), [iura 18290/18](https://iura.cl/18290/18), [SUSESO](https://www.suseso.gob.cl/612/w3-propertyvalue-99413.html) |
| **Licencias A-1, A-2 y A-3** (pasajeros) | **Ley 21.733**, publicada el 5 de abril de 2025. Quien postula debe acreditar con el **certificado de antecedentes para fines especiales** que no tiene condenas por los delitos de los Párrafos 5, 6 y 6 bis del Título VII, Libro II del Código Penal (violación, estupro, delitos sexuales relacionados y explotación sexual de niños, niñas y adolescentes). Quien tenga esas condenas no puede trabajar "en ninguna modalidad" de transporte público de pasajeros, y si lo hace se le cancela la licencia. Algunas notas hablan de "clase A" en general **[verificar si alcanza a A-4 y A-5]**. | Al **conductor** | [BCN, art. 87 bis](https://www.bcn.cl/leychile/Navegar?idNorma=1007469&idParte=8795170&a_int_=True), [LeyChile Ley 21.733](https://www.leychile.cl/leychile/Navegar/imprimir?idNorma=1212334&idParte=10544424&idVersion=2025-04-05), [CNN Chile](https://www.cnnchile.com/pais/ley-que-prohibe-licencia-de-conducir-profesional-a-condenados-por-delitos-sexuales-fue-publicada-en-el-diario-oficial_20250412/), [Cámara](https://www.camara.cl/cms/2025/03/03/condenados-por-delitos-sexuales-no-podran-obtener-licencia-de-conducir-profesional/) |
| **Taxis, colectivos y buses** (transporte público inscrito en el RNSTP) | Misma Ley 21.733: los **operadores deben exigir a sus conductores, cada 6 meses**, el certificado para fines especiales. El Ministerio puede dar de baja la inscripción del conductor que no cumpla. En el DS 212 no encontré una lista de documentos del conductor. La ficha del RNSTP solo pide "antecedentes de los conductores" y formularios **[verificar]**. La Hoja de Vida **no es requisito legal**, aunque es habitual que se pida. | Al **operador**, es decir, al titular | [iura 87 bis](https://iura.cl/dfl-1-mtt-2009/87-bis), [ChileAtiende RNSTP](https://chileatiende.gob.cl/fichas/86134-incorporacion-eliminacion-o-modificacion-de-conductor-inscrito-en-el-registro-nacional-de-servicios-de-transporte-de-pasajeros-rnstp), [Practicatest taxi](https://practicatest.cl/blog/articulos-especiales/como-ser-chofer-taxi-chile), [Practicatest micro](https://practicatest.cl/blog/licencias-de-conducir/como-ser-chofer-micro-chile) |
| **Transporte escolar** | Para inscribirse en el RENASTRE (Ley 19.831 y DS 38) se adjunta, por cada conductor, la licencia y el **certificado para fines especiales**, según una resolución publicada en 2021 **[verificar versión vigente del DS 38]**. Además, el **art. 6 bis del DL 645** obliga a toda institución pública o privada a consultar el registro de inhabilidades **antes de contratar** a alguien para un cargo con relación directa y habitual con menores. Cualquier persona que se identifique puede hacer esa consulta, y su mal uso tiene multa de 2 a 10 UTM. | Al **transportista o empleador** (titular) | [Diario Oficial 2021](https://www.diariooficial.interior.gob.cl/publicaciones/2021/11/29/43115/01/2048216.pdf), [Ley 19.831](https://www.anac.cl/wp-content/uploads/2017/08/ley-19831-registro-transporte-escolar_v30-05-2014.pdf), [iura DL 645 art. 6 bis](https://iura.cl/dl-645-ministerio-de-justicia/6-bis) |
| **Carga (A-4, A-5), reparto (C), maquinaria (D) y auto particular (B)** | No encontré ninguna exigencia legal de certificado ni de Hoja de Vida aparte de la idoneidad moral que se revisa al sacar o renovar la licencia. | — | Mismas fuentes de Ley 18.290 |
| **Relación laboral** (Código del Trabajo, art. 2) | Según la Dirección del Trabajo, **por regla general no se puede exigir el certificado de antecedentes**. Solo cabe cuando es indispensable para la idoneidad del cargo, como en el Ord. 3840/194 de 2002 (trabajo con niños) y el Ord. 628 de 2017. Un dictamen de 2025 que "fija doctrina" agregó que los antecedentes penales no pueden condicionar el acceso al empleo salvo que formen parte de la idoneidad. Para conductores profesionales es plausible que sí formen parte, pero **no encontré un dictamen específico [verificar]**. | Al **empleador** | [DT consulta](https://www.dt.gob.cl/portal/1628/w3-article-60778.html), [DT Ord. 628](https://www.dt.gob.cl/legislacion/1624/w3-article-111120.html), [Diario Constitucional 2025](https://www.diarioconstitucional.cl/2025/08/19/no-discriminacion-empleadores-no-pueden-usar-antecedentes-medicos-financieros-o-judiciales-salvo-que-afecten-la-idoneidad-para-el-puesto/), [DOE](https://actualidadjuridica.doe.cl/dt-emite-dictamen-sobre-el-uso-del-certificado-de-antecedentes-laborales/) |

**Qué significa para la app:**
- Exigir los dos documentos a **todos** los conductores va más allá de la ley en carga, reparto, maquinaria y autos particulares.
- Donde la ley sí lo exige, el obligado es **el titular** (operador, transportista o EAT), **no la app**.
- Para los titulares de taxis, colectivos y buses, el control cada 6 meses es una obligación **actual**. La app puede venderse como ayuda para cumplirla. Esto es una inferencia mía **[verificar]**.
- Una licencia profesional vigente ya implica que la municipalidad revisó los antecedentes del conductor en los últimos 4 años o menos.

---

## 2. La ley que viene

**Estado de la Ley 21.553 (EAT) al 8 de octubre de 2026: no rige.**
- **Abril de 2025:** la Contraloría tomó razón del reglamento, pero el texto nunca se publicó.
- **Abril de 2026:** el gobierno anunció cambios a ese reglamento.
- **11 de junio de 2026:** la Contraloría no dio curso al Decreto 94/2026, que modifica el DS 212 de taxis y es necesario para implementar la ley. Faltaban fundamentos y consulta pública.
- **Septiembre de 2026:** el ministerio lo reingresó. El ministro espera tenerlo operativo "dentro de este año".
- La ley entra en vigencia 30 días después de que el reglamento se publique.
- Fuentes: [Cooperativa](https://www.cooperativa.cl/noticias/pais/transportes/ley-uber-contraloria-objeto-reglamento-ingresado-por-transportes/2026-06-11/104029.html), [Meganoticias](https://www.meganoticias.cl/nacional/524387-contraloria-rechaza-reglamento-ley-uber-cuestiona-cambios-de-grange-11-06-2026.html), [DF](https://www.df.cl/empresas/industria/de-grange-y-ley-uber-estamos-avanzando-a-una-velocidad-inferior-a-la-que), [Ladevi](https://chile.ladevi.info/actualidad/ley-uber-biministro-louis-grange-compromete-reglamento-antes-2027-n106362), [La Tercera](https://www.latercera.com/nacional/noticia/ley-uber-ministerio-de-transportes-reingresa-reglamento-por-tercera-vez-y-apps-reaccionan-con-malestar/).

**Qué exige a los conductores**, según BCN Ley Fácil y la prensa (no pude leer el texto oficial; probablemente es el art. 6 **[verificar n° y texto]**):
- **Licencia profesional con control vigente.** Según el reglamento de 2025, clase A2 ([El Mostrador](https://www.elmostrador.cl/datos-utiles/2025/05/25/licencia-requerida-por-ley-para-conductores-de-uber-en-chile/)). Quienes ya trabajan en apps tendrían 12 meses para obtenerla. La exigencia está en la ley, así que el reglamento no puede eliminarla ([Ex-Ante](https://www.ex-ante.cl/economia/ley-uber-cuales-son-los-cambios-definitivos-al-reglamento-antes-de-que-entre-en-vigencia/)).
- **Certificado de antecedentes para fines especiales** sin anotaciones por:
  - delitos sexuales;
  - delitos de la Ley 20.000 (drogas);
  - delitos de los **arts. 193, 195 y 196 de la Ley 18.290**: conducir bajo la influencia del alcohol, en estado de ebriedad o bajo drogas, y la omisión de auxilio o fuga en accidentes **[verificar lista exacta; las fuentes no coinciden]**.
- **La EAT debe pedir el certificado cada 6 meses.** El Ministerio de Transportes puede sacar al conductor del registro de todas las EAT.
- Fuentes: [BCN Ley Fácil](https://www.bcn.cl/portal/leyfacil/recurso/empresas-de-aplicaciones-de-transporte-remunerado-de-pasajeros), [CNN Chile](https://www.cnnchile.com/pais/ley-uber-reglamento-contraloria-conductores-usuarios/), [BioBio](https://www.biobiochile.cl/noticias/servicios/explicado/2025/04/08/amp/revisa-aqui-las-10-claves-mas-relevantes-de-la-ley-uber-como-afectara-a-conductores-y-pasajeros.shtml).
- **Hoja de Vida:** no aparece como requisito del registro EAT en ninguna fuente revisada. Era parte de una propuesta de 2018 ([Radio Agricultura](https://www.radioagricultura.cl/noticias/nacional/ley-uber-exigira-hoja-de-vida-a-conductores_20180720/)), pero no confirmé que haya quedado en la ley **[verificar]**.
- Los cambios de 2026 apuntan a los vehículos (antigüedad, cilindrada) y a la movilidad entre comunas. **No encontré cambios en los requisitos penales.**

**Otros proyectos y normas relevantes:**
- **"Ley Martín"** (transporte escolar, boletín 16.433 **[verificar sufijo]**). La inscripción en el RENASTRE se otorgaría solo sin antecedentes penales ni inhabilidades por delitos contra menores. A mayo de 2026 estaba aprobada en general en el Senado (segundo trámite), con plazo de indicaciones hasta el 4 de junio. No es ley todavía ([iJurídica 2026](https://www.portal.ijuridica.cl/2026/05/avanza-tramitacion-de-proyecto-de-ley-que-eleva-la-responsabilidad-de-los-transportistas-escolares/), [Senado](https://www.senado.cl/comunicaciones/noticias/avanza-sala-ley-martin-que-eleva-la-responsabilidad-de-los-conductores-de)).
- **Ley 21.797 "Ley Jacinta"** (publicada el 7 de febrero de 2026). Exige una declaración jurada de salud para sacar o renovar licencia. Depende de un reglamento con plazo hasta febrero de 2027, más 90 días. No toca los antecedentes ([24horas](https://www.24horas.cl/te-sirve/ley-jacinta-cambios-licencia-conducir), [El Mostrador](https://www.elmostrador.cl/datos-utiles/2026/02/26/licencia-de-conducir-cuales-son-los-nuevos-requisitos-con-la-ley-jacinta/)).
- **Licencia por puntos:** fue anunciada, pero no encontré un proyecto ingresado **[verificar]**.
- **Postergación de la Ley 21.719:** ver sección 4.

---

## 3. Qué es el certificado "para fines especiales"

- **Diferencia con "fines particulares".** El DS 64 de 1960, art. 12, distingue cuatro tipos de certificado; "fines particulares" es la letra c) y "fines especiales" la d). Según el texto citado, el de fines especiales contiene "copia íntegra del prontuario penal" y se otorga "cuando leyes especiales o reglamentos exijan" acreditar la conducta anterior **[verificar texto vigente]**. ChileAtiende dice que el de fines especiales sirve para trámites ante una institución pública o privada, y el de fines particulares, por ejemplo, para buscar trabajo. Fuentes: [DS 64 (Gendarmería)](https://html.gendarmeria.gob.cl/doc/transparencia/ley20285/doc_2009/normativa/doc/64.pdf), [iura DS 64](https://iura.cl/dto-64-ministerio-de-justicia/), [ChileAtiende 3442](https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes).
- **"Sin anotaciones" no significa "nunca condenado".** Los dos tipos de certificado pueden omitir anotaciones:
  - el art. 13 del DS 64 permite omitir condenas cumplidas en ambos ([iura art. 13](https://iura.cl/dto-64-ministerio-de-justicia/13));
  - el art. 21 de la Ley 19.628 lo permite para condenas cumplidas o prescritas. La Corte Suprema (rol 25.156-2024) constató omisiones en los dos certificados ([fallo](https://diarioconstitucional.cl/wp-content/uploads/2024/10/CS-25156-2024.pdf));
  - la Ley 18.216 (penas sustitutivas) también permite omitir ([Diario Constitucional](https://www.diarioconstitucional.cl/2025/11/13/corte-suprema-ordena-al-registro-civil-omitir-anotaciones-en-certificados-de-conductores-sometidos-a-penas-sustitutivas/)).
- **Quién lo saca.** La propia persona, o un tercero con **mandato o poder notarial específico**. El titular o la app no pueden sacarlo por el conductor; tiene que subirlo él ([ChileAtiende 3442](https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes)).
- **Online y gratis.** Sí: en la web del Registro Civil o en la app Civil Digital, con ClaveÚnica. En oficina cuesta $1.050. No encontré si el formulario online pide el motivo o la institución **[verificar]**.
- **Vigencia.** No hay un plazo legal único. Se puede **verificar online hasta 60 días** después de emitido ([ChileAtiende 49064](https://www.chileatiende.gob.cl/fichas/49064-certificado-de-antecedentes-para-chilenos-y-chilenas-en-el-extranjero)). Una nota de prensa habla de 90 días ([Meganoticias](https://www.meganoticias.cl/dato-util/501946-certificado-antecedentes-vigencia-dcv-08-10-2025.html)) **[conflicto]**. En la práctica, cada institución fija su propio plazo.
- **Folio y código.** Sí, los trae, y se validan en el verificador del Registro Civil. Proveedores privados (Verifik y MetaMap) ofrecen consultarlo por API con folio y código, y **devuelven una copia del certificado original**. Eso sirve para detectar un PDF adulterado ([Verifik](https://docs.verifik.co/background-check/chile-certificate-verify/), [MetaMap](https://docs.metamap.com/reference/govchecks-chile-criminal-certificate)).
- **Hoja de Vida** (datos que faltaban en el informe anterior):
  - En oficina, si la pide un tercero, se exige autorización notarial ([ChileAtiende 13661](https://www.chileatiende.gob.cl/fichas/13661-hoja-de-vida-del-conductor)).
  - Las anotaciones **graves** se pueden eliminar 2 años después de la última anotación de esa clase, y las **gravísimas** después de 3 años. Las condenas por ebriedad se eliminan primero del Registro General de Condenas ([ChileAtiende 13664](https://www.chileatiende.gob.cl/fichas/13664-pedir-la-eliminacion-de-anotaciones-en-el-registro-de-conductores)).
  - La Hoja de Vida **también puede mostrar condenas penales**, y los tribunales a veces ordenan omitirlas ([Corte de Iquique, septiembre de 2026](https://www.diarioconstitucional.cl/2026/09/10/corte-de-iquique-ordena-eliminar-condenas-cumplidas-de-hoja-de-vida-de-conductor/)).

---

## 4. Base legal para que la app pida, revise o guarde estos documentos

### 4.1 Hoy (Ley 19.628)
- Se pueden tratar datos personales con **autorización legal o consentimiento expreso y por escrito** (art. 4). Los antecedentes penales no están en su definición de datos sensibles. El art. 21 restringe a los **organismos públicos** comunicar condenas ya cumplidas ([BCN Ley 19.628](https://www.bcn.cl/leychile/navegar?idNorma=141599)).
- Con un consentimiento escrito y separado, el tratamiento es **más defendible hoy que después**. Igual hay que respetar la doctrina de la Dirección del Trabajo si la relación es laboral.

### 4.2 Desde el 1 de diciembre de 2026 (Ley 21.719)
- **Art. 25:** *"Los datos personales relativos a la comisión y sanción de infracciones penales, civiles, administrativas y disciplinarias sólo pueden ser tratados por los organismos públicos para el cumplimiento de sus funciones legales, dentro del ámbito de sus competencias y en los casos expresamente previstos en la ley."* Además, no se pueden comunicar una vez cumplida o prescrita la pena ([BCN Ley 21.719](https://www.bcn.cl/leychile/navegar?idNorma=1209272)).
- Mi lectura, que es una inferencia **[verificar con abogado]**:
  1. El artículo **no menciona el consentimiento como vía**. Un privado solo podría tratar estos datos con apoyo en una ley expresa.
  2. La **Hoja de Vida también caería en el art. 25**, porque contiene infracciones de tránsito (administrativas) y a veces condenas penales.
  3. Incluso guardar solo "sin anotaciones" o "rechazado por antecedentes" es tratamiento de un dato sobre infracciones.

### 4.3 La postergación (boletín 18.623-07)
- La fecha legal **sigue siendo el 1 de diciembre de 2026**.
- El gobierno pide un año más. Los senadores proponen 6 meses o una entrada en vigor por tramos.
- La Comisión de Constitución empezaría a discutirla la segunda semana de octubre. **No se ha votado.**
- Fuentes: [Pauta, 2 de octubre](https://www.pauta.cl/actualidad/2026/10/02/ley-de-datos-personales-senadores-proponen-prorroga-de-seis-meses-frente-al-ano-que-pide-el-gobierno.html), [Desenfoque, 5 de octubre](https://desenfoque.cl/2026/10/05/datos-personales-oposicion-cuestiona-plazo-de-un-ano-que-plantea-el-gobierno), [Carey](https://www.carey.cl/gobierno-ingresa-proyecto-de-ley-que-posterga-en-un-ano-entrada-en-vigor-de-la-ley-sobre-proteccion-de-datos-personales).

### 4.4 Opciones para reducir el riesgo (para revisar con el abogado)

| Opción | En qué consiste | Cuánto reduce el riesgo | Qué queda |
|---|---|---|---|
| **A. Solo donde lo exige la ley** | Pedir el certificado solo para pasajeros (Ley 21.733), escolar (RENASTRE) y apps (Ley 21.553), configurable por tipo de vehículo | Alto: hay una ley sectorial detrás | El obligado es el titular, no la app. ¿Puede la app actuar como **encargado** del titular (tratar los datos por cuenta de él)? **[abogado]** |
| **B. Verificar y borrar** | Se valida el folio, se guarda "verificado el dd/mm, cumple el criterio X, vence el dd/mm" y se borra el PDF en pocos días | Medio | Sigue siendo tratamiento, incluso el sí/no |
| **C. Puente, sin procesar** | Tras el match, el conductor entrega folio y código al titular, que verifica por su cuenta | El más alto | Se pierde el sello "verificado" como valor de venta |
| **D. Sin detalle para el titular** | El titular ve solo "verificado" o "no verificado", nunca las anotaciones | Evita comunicar datos penales a terceros | Complementa A o B |
| **E. Consentimiento expreso separado** | Casilla específica, información clara y posibilidad de revocar | Sirve hoy (Ley 19.628) | Bajo la Ley 21.719 probablemente **no basta por sí sola [abogado]** |

---

## 5. ¿Puede revisarlo un agente de IA?

### 5.1 Viabilidad técnica: sí
- **Datos que se pueden extraer:**
  - Del certificado: RUN, nombre, folio, código, fecha de emisión, tipo (particulares o especiales) y resultado (sin anotaciones o lista de anotaciones). El formato exacto del texto **[verificar]** con un certificado real.
  - De la Hoja de Vida: clases de licencia y sus fechas, restricciones, anotaciones graves y gravísimas, suspensiones, cancelaciones y causas pendientes.
- Con eso se compara contra lo que declaró el conductor (RUN, nombre, clase de licencia) y se detectan inconsistencias.
- Si se exige el **PDF oficial descargado** (no una foto), el texto se puede leer **con reglas fijas, sin un modelo de IA**. La IA solo haría falta para fotos o casos raros.
- **Una IA no puede confirmar autenticidad solo leyendo.** Para eso se necesita el verificador del Registro Civil, que devuelve el original, o validar la firma electrónica del PDF si la trae **[verificar si los certificados traen firma electrónica avanzada embebida]**.

### 5.2 Verificador del Registro Civil
- No encontré sus términos de uso ni si tiene captcha **[verificar]**.
- No hay una API oficial pública. Los convenios que encontré son con organismos públicos, como el SII ([Res. SII 195/2025](https://www.sii.cl/normativa_legislacion/resoluciones/2025/reso195.pdf)).
- Que existan APIs privadas (Verifik y MetaMap) muestra que se puede consultar de forma automática. Pero no sé con qué base legal acceden **[verificar]**, y usarlas suma otro tercero que trata los datos, posiblemente en el extranjero.
- **Alternativas:**
  1. Una persona en el panel abre el verificador (alrededor de 1 minuto por documento; razonable al inicio).
  2. Un proveedor externo.
  3. Pedir un convenio al Registro Civil.

### 5.3 Decisiones automatizadas (art. 8° bis, Ley 21.719)
- Toda persona tiene derecho a **no ser objeto de decisiones basadas únicamente en tratamiento automatizado** que le produzcan efectos jurídicos o le afecten significativamente. Hay tres excepciones: que sea necesario para un contrato, que haya consentimiento expreso o que lo diga una ley con salvaguardas.
- **En todos los casos** la persona conserva: información, explicación, expresar su punto de vista, intervención humana y revisión.
- Fuentes: [Diario Constitucional](https://www.diarioconstitucional.cl/2025/07/22/legalidad-y-revision-humana-estandar-constitucional-ante-decisiones-automatizadas-por-rodrigo-alvarez-seguel/), [ECIJA](https://www.ecija.com/actualidad-insights/que-pasa-cuando-una-decision-automatizada-produce-efectos-significativos-en-una-persona-el-caso-del-juez-argentino-y-el-contexto-que-el-algoritmo-no-ve/) **[verificar texto literal]**.
- **Cómo lo aborda el diseño mixto ya decidido:**
  - la IA aprueba sola **solo los casos favorables y claros**: sin anotaciones, datos coincidentes y verificador conforme;
  - **todo rechazo, toda duda y toda anotación** la decide una persona;
  - se le avisa al conductor que hubo pre-revisión con IA, se le explica el motivo y puede pedir revisión.
- La revisión humana tiene que ser real y no un timbre automático. Esa es la crítica que se le hace a la norma ([carta al director](https://www.diarioconstitucional.cl/cartas-al-director/inaplicabilidad-material-del-articulo-8-bis-de-la-ley-n-21-719-frente-a-sistemas-de-inteligencia-artificial-basados-en-deep-learning/)).

### 5.4 Enviar estos documentos a una IA en el extranjero
- Según la Ley 21.719 (arts. 27 y 28), la Agencia de Protección de Datos declarará qué países son "adecuados". Todavía no hay ninguno declarado, y para EE.UU. se ve difícil.
- Mientras tanto se usan las **cláusulas contractuales modelo**, aprobadas por la Subsecretaría de Economía y publicadas en el Diario Oficial el 19 de diciembre de 2025 ([Prieto](https://www.prieto.cl/ministerio-de-economia-aprueba-clausulas-contractuales-tipo-para-transferencias-internacionales-de-datos/), [AZ](https://www.az.cl/nuevo-hito-en-proteccion-de-datos-aprobadas-las-clausulas-contractuales-modelo-para-transferencias-internacionales/), [DOE](https://actualidadjuridica.doe.cl/oliver-ortiz-sobre-transferencias-internacionales-de-datos-la-adecuacion-de-una-jurisdiccion-requiere-un-pronunciamiento-de-la-autoridad/)).
- **Ojo:** alojar los datos en Supabase fuera de Chile también es una transferencia internacional.
- **Cómo reducir el riesgo:**
  - leer el PDF dentro de la propia infraestructura, sin modelo de IA externo;
  - si se usa IA externa, contratar con un proveedor que **no entrene con los datos** y ofrezca **retención cero**. Por ejemplo, Anthropic lo declara en sus [términos comerciales](https://www.anthropic.com/legal/commercial-terms) y en su [documentación de retención cero](https://platform.claude.com/docs/en/build-with-claude/zero-data-retention), aunque los archivos subidos con su Files API sí se guardan. Hay que verificar lo mismo con cualquier proveedor;
  - firmar cláusulas modelo o un acuerdo de tratamiento de datos (DPA);
  - informarlo en la política de privacidad y enviar el mínimo de datos.

---

## 6. Criterios de rechazo: opciones para que elijas

Todos deberían ser **configurables por tipo de vehículo**. Recomiendo además publicar los criterios y permitir apelar.

**Certificado de antecedentes**

| Opción | Criterio | Riesgo de discriminación |
|---|---|---|
| C1 | Solo los delitos sexuales de la Ley 21.733 (para pasajeros) | **Bajo**: hay ley |
| C2 | La lista de la Ley 21.553: sexuales, drogas y arts. 193, 195 y 196 de la Ley de Tránsito | **Bajo** en pasajeros y apps. **Medio** en carga y maquinaria (no hay ley, aunque manejar ebrio se relaciona directamente con la idoneidad para conducir) |
| C3 | Inhabilidad para trabajar con menores (registro del DL 645) | **Bajo**, solo para escolar. La consulta la hace el titular que contrata |
| C4 | Delitos violentos contra personas (sin ley que lo respalde) | **Medio a alto** **[verificar]** |
| C5 | Cualquier anotación | **Alto**: contradice la doctrina de la Dirección del Trabajo y el principio de proporcionalidad, y excluye por delitos que nada tienen que ver con conducir |
| C6 | Sin rechazo automático: toda anotación pasa a revisión humana caso a caso | Depende de cuán claros sean los criterios |

**Hoja de Vida**

| Opción | Criterio | Riesgo |
|---|---|---|
| H1 | Licencia no vigente, o clase que no habilita para el vehículo | **Bajo**: conducir así es ilegal |
| H2 | Suspensión o cancelación vigente | **Bajo** |
| H3 | Gravísimas en los últimos N años (la ventana natural es 3 años) | **Medio** |
| H4 | Más de N graves (la ventana natural es 2 años) | **Medio** |
| H5 | Condena por manejo en ebriedad | **Bajo a medio** (se superpone con C2) |
| H6 | Causas pendientes en el Juzgado de Policía Local | **Alto**: todavía no están resueltas |
| H7 | Accidentes registrados | **Alto**: no implican culpa |

Si el rechazo no tiene una justificación razonable, se podría reclamar como discriminación arbitraria (Ley 20.609) **[verificar con abogado]**.

---

## 7. Cada cuánto renovar

**Referencias legales:**
- Ley 21.733: **cada 6 meses** (operadores de pasajeros).
- Ley 21.553: **cada 6 meses** (apps).
- Control de licencia profesional: cada 4 años.
- Verificador del Registro Civil: 60 días.
- Ley 18.290, art. 14: informes de menos de 30 días para trámites de licencia.
- Las anotaciones de la Hoja de Vida se acumulan en cualquier momento y se eliminan a los 2 o 3 años.

**Opciones:**
- **A. Los dos documentos cada 6 meses, el mismo día, para todos.** Es simple, coincide con la ley de pasajeros y apps, y al conductor le cuesta poco (son gratis y online).
- **B. Cada 6 meses** para pasajeros, escolar y apps, y **cada 12 meses** para carga, reparto, maquinaria y particulares.

**Reglas que conviene agregar en cualquier caso:**
- aceptar solo documentos **emitidos hace 30 días o menos**, para que el equipo tenga al menos 30 días para validarlos dentro de la ventana de 60;
- pedirlos de nuevo cuando venza el control de la licencia;
- decidir qué pasa cuando vencen: por ejemplo, mostrar "verificación vencida" y sacar al conductor del match.

---

## 8. Mensajería dentro de la app

**Apple (guía 1.2)** exige a las apps con contenido de usuarios:
1. un filtro de material objetable;
2. una forma de reportar contenido, con respuesta oportuna;
3. bloquear usuarios abusivos;
4. publicar **los datos de contacto del desarrollador**. Ojo: esto se refiere a la empresa que publica la app, no a los usuarios.

**Otras exigencias de Apple:**
- La guía puede sacar de la tienda las apps de chat aleatorio o anónimo. **No es nuestro caso**: los mensajes son entre usuarios con match y verificados.
- En rechazos se ha pedido que los términos de uso digan "tolerancia cero" con el contenido objetable y que los reportes se atiendan en 24 horas. Esto sale de casos reportados en el foro de desarrolladores, no del texto publicado **[verificar]**.
- La guía 5.1.1(v) exige **borrar la cuenta desde la app**; desactivarla no basta.
- Fuentes: [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/), [foro de desarrolladores](https://developer.apple.com/forums/thread/807358), [5.1.1(v)](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion).

**Google Play** exige:
- que el usuario **acepte los términos** antes de escribir, y que esos términos definan qué contenido y conductas son objetables;
- una **moderación** continua;
- **bloqueo** de usuarios cuando hay mensajes 1 a 1;
- **reportar** contenido y usuarios, también en apps de usuarios verificados;
- actuar a tiempo sobre los reportes;
- responder con exactitud el cuestionario de clasificación de contenido;
- **borrado de cuenta en la app más un enlace web**, declarado en la sección de seguridad de datos.
- Fuentes: [Google Play UGC](https://support.google.com/googleplay/android-developer/answer/9876937), [consideraciones clave](https://support.google.com/googleplay/android-developer/answer/12923286), [borrado de cuenta](https://support.google.com/googleplay/android-developer/answer/13327111).

**Datos personales:**
- Los mensajes son datos personales. No encontré un plazo legal específico para conservarlos. Rige la **proporcionalidad**: hay que fijar un plazo por finalidad y borrar o anonimizar sin esperar a que el usuario lo pida ([Minuta REDIAC](https://www.minsegpres.gob.cl/wp-content/uploads/2025/11/Minuta-REDIAC.pdf)).
  - Ejemplo de opción: borrar N meses después del último mensaje.
  - Las conversaciones reportadas se guardan hasta resolver el caso, más un plazo.
  - Todo se borra junto con la cuenta.
- **Inviolabilidad de las comunicaciones privadas** (Constitución, art. 19 N°5). Según el Tribunal Constitucional, una comunicación privada solo la conocen quienes participan en ella ([Derechopedia](https://www.derechopedia.cl/Inviolabilidad_de_las_comunicaciones_privadas), [TC rol 2246-2012](https://lpderecho.pe/correos-electronicos-considerados-comunicaciones-documentos-privados-protegidos-derecho-inviolabilidad-comunicacion-privada-chile-rol-2246-2012/)). La forma prudente:
  - filtros automáticos;
  - que una persona lea **solo las conversaciones reportadas**;
  - consentimiento expreso para eso en los términos **[verificar con abogado]**.
- **"Revelar contacto"** es comunicar datos a un tercero con el consentimiento del titular. Conviene registrar la fecha y a quién se reveló, y avisar antes de confirmar que no se puede deshacer.
- Si los mensajes se guardan fuera de Chile, también es transferencia internacional (ver 5.4).

---

## 9. Correcciones a `contexto-chile.md`

1. **§2:** "fines particulares" y "fines especiales" **no son iguales en teoría** (DS 64, art. 12). Aun así, los dos pueden omitir anotaciones, así que "sin anotaciones" no significa "nunca condenado".
2. **Falta la Ley 21.733**, vigente desde abril de 2025: certificado para fines especiales al sacar licencias A-1, A-2 y A-3, y control cada 6 meses por los operadores de pasajeros. Es la exigencia **vigente** más importante para este tema.
3. **§4:** el art. 25 también cubre **infracciones administrativas**, así que probablemente alcanza a la Hoja de Vida. Además hay que actualizar el estado de la postergación: al 2 y 5 de octubre no hay votación.
4. **§4:** el criterio de la Dirección del Trabajo ya no es solo "[verificar]". Ahora tiene fuentes: Ord. 3840/194 de 2002, Ord. 628 de 2017 y el dictamen de 2025.
5. **§5:**
   - el control cada 6 meses del certificado estaría en la **ley**, no solo en el borrador del reglamento **[verificar]**;
   - hay que agregar los arts. 193, 195 y 196 de la Ley de Tránsito a la lista;
   - hay que actualizar el estado: Decreto 94/2026 objetado en junio y reingresado en septiembre.
6. **Falta el DL 645, art. 6 bis:** consulta obligatoria del registro de inhabilidades antes de contratar para trabajo con menores (transporte escolar).

---

## Qué tienes que decidir

1. ¿El requisito es para **todos** los tipos de vehículo, o solo donde la ley lo exige (pasajeros, escolar, apps), configurable por tipo?
2. ¿Qué modelo de verificación usar: A, B, C o una combinación (sección 4.4)? ¿El titular ve solo "verificado" o también el detalle?
3. ¿Qué criterios de rechazo aplicar para cada tipo de vehículo (sección 6)?
4. ¿Cada cuánto renovar (opción A o B) y qué pasa cuando vence?
5. Para estos dos documentos: ¿lectura con reglas fijas más revisión humana, o IA externa con contrato?
6. Mensajería:
   - ¿solo después del match?
   - ¿puede escribir un titular sin suscripción?
   - ¿cuánto tiempo se guardan los mensajes?
   - ¿se permiten adjuntos? Sugiero **no** en el MVP, para que no circulen certificados ni fotos de documentos.
   - ¿se filtran teléfonos y correos en los mensajes?

## Qué confirmar con un abogado

1. Con el art. 25 de la Ley 21.719, ¿puede una empresa privada intermediaria tratar el Certificado de Antecedentes y la Hoja de Vida? ¿Sirve el consentimiento? ¿Puede apoyarse en las Leyes 21.733 y 21.553 si el obligado es el titular? ¿Puede la app actuar como **encargado** del titular?
2. ¿La Hoja de Vida cae en el art. 25 (infracciones administrativas)? ¿Guardar solo "verificado el dd/mm" sigue siendo tratamiento de un dato penal?
3. ¿El diseño mixto (la IA aprueba los casos claros y una persona rechaza) cumple el art. 8° bis? ¿Qué hay que informarle al conductor?
4. ¿Qué mecanismo de transferencia internacional usar para el alojamiento (Supabase) y para un proveedor de IA (cláusulas modelo)? ¿Qué rige si se aprueba la postergación?
5. ¿Cuál es el riesgo de discriminación arbitraria de cada criterio de rechazo en los tipos de vehículo sin ley sectorial?
6. Mensajería: ¿cómo moderar sin chocar con la inviolabilidad de las comunicaciones (art. 19 N°5)? ¿Qué plazos de conservación fijar y qué cláusulas poner en los términos?
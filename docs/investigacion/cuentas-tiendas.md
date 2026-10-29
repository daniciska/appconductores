> Investigación del 29-oct-2026. Lo marcado [verificar] no está confirmado en fuente oficial.

# Cuentas de desarrollador Apple y Google Play: cuánto cuestan y cómo crearlas (persona natural en Chile)

**En resumen:** Apple cobra **USD 99 al año** y Google cobra **USD 25 una sola vez**. Con Google, el trámite más largo viene después de crear la cuenta: antes de publicar hay una prueba obligatoria de 14 días con 12 personas.

## 1. Costos y plazos

| | **Apple Developer Program** | **Google Play Console** |
|---|---|---|
| Costo | **USD 99 por año**, se paga cada año | **USD 25, una sola vez** |
| Precio en pesos chilenos | No aparece en ninguna fuente. Apple dice que se muestra "en moneda local donde esté disponible" y que se pueden sumar impuestos. Lo verá en la pantalla de pago [verificar] | No informado. Pago en USD |
| Medio de pago | Tarjeta de crédito **a su nombre**. Si la tarjeta es de otra persona, la inscripción se demora y Apple pide su documento de identidad | Tarjeta de crédito a su nombre. **No acepta tarjetas prepago** |
| Si se rechaza la cuenta | No informado | **No devuelven** los USD 25 si consideran inválida su identidad |
| Plazo de aprobación de la cuenta | **No hay plazo oficial.** Apple solo dice que, si en 24 horas no llega la confirmación, hay que escribir a Soporte. En los foros de 2026 hay casos de 2 a 7 semanas o más [verificar] | Verificación de identidad: unos **3 días hábiles**, según una página antigua de Google [verificar] |
| Antes de poder publicar | Revisión normal de la app | **Prueba cerrada: 12 testers durante 14 días seguidos**, y después una solicitud de acceso a producción. No hay plazo oficial para esa revisión; el dato de "7 días" que circula no está confirmado [verificar] |
| Comisión en suscripciones | **15%** si se inscribe en el *Small Business Program* (hay que postular). Si no, 30% el primer año de cada suscriptor y 15% después | **15%** en suscripciones con renovación automática |
| Mínimo para recibir pagos | USD 40 (regla general; Chile no tiene un monto propio) | USD 100 |

**Para planificar:** Google tarda como mínimo unas **3 a 4 semanas** desde que crea la cuenta hasta que la app puede estar en la tienda: verificación, 14 días de prueba y revisión. Apple puede tardar días o semanas solo en aprobar la cuenta. Conviene crear **ambas cuentas cuanto antes**, aunque la app no esté lista.

## 2. Apple Developer: paso a paso

**Qué tener listo antes:**
- Un Apple ID (cuenta Apple) con su **nombre legal exacto, igual que en la cédula**, sin apodos ni nombre de empresa. Un error aquí causa demoras.
- La **verificación en dos pasos** activada en ese Apple ID.
- Ser mayor de 18 años.
- Un email, un teléfono y una **dirección física** reales. No se aceptan casillas postales.
- Una **tarjeta de crédito a su nombre** que permita cargos en USD.

**Pasos:**
1. Entrar a **developer.apple.com/programs/enroll** e iniciar sesión con su Apple ID. Hay otra vía, la app "Apple Developer" en iPhone o iPad, que pide una foto de la cédula. Esa app funciona solo en "regiones seleccionadas" y **no pude confirmar si Chile está incluido** [verificar]. Si la app no ofrece la opción, use la web.
2. Elegir el tipo de cuenta **"Individual"**.
3. Revisar sus datos personales (nombre, dirección, teléfono) y aceptar el contrato de licencia.
4. Pagar los USD 99 (o el monto en pesos, si aparece).
5. Esperar el correo de confirmación. Si no llega en 24 horas, escriba a Soporte de Apple indicando su *Enrollment ID*. **No pague dos veces** ni abra varios casos.
6. **Renovación:** si se inscribe por la web, la renovación automática existe solo en algunos países (EE.UU., Reino Unido, Canadá, Australia, Alemania y otros). En Chile probablemente habrá que **renovar a mano** cada año; se puede hacer desde 30 días antes del vencimiento [verificar en su cuenta]. Si la membresía vence, la app deja de estar disponible para descargar y no se puede actualizar.

## 3. Google Play Console: paso a paso

**Qué tener listo antes:**
- Una cuenta de Google (Gmail), idealmente una dedicada a la app.
- Ser mayor de 18 años.
- La **cédula chilena** y un **comprobante de domicilio**. El nombre debe coincidir con los datos que ingrese.
- Una **tarjeta de crédito a su nombre** (no prepago).
- Un **teléfono Android físico**: con Android 10 o superior y sin modificaciones de sistema ("root").

**Pasos:**
1. Entrar a **play.google.com/console** y elegir el tipo de cuenta **"Personal"**.
2. Pagar los USD 25.
3. Verificar el teléfono y el correo de contacto.
4. Subir la cédula y el comprobante de domicilio para la verificación de identidad.
5. **Verificar el teléfono Android:** en la web de Play Console aparece la tarea "Verificar que tienes acceso a un dispositivo móvil Android". Se escanea un código QR, se instala la app Play Console, se inicia sesión y se toca "Verificar".
6. **Prueba cerrada obligatoria:** subir la app a "prueba cerrada" e invitar al menos a **12 testers**, que deben seguir inscritos **14 días seguidos**. Según guías de terceros, si en algún momento quedan menos de 12, el conteo puede volver a cero [verificar].
7. **Pedir acceso a producción** desde el Panel. Google hace preguntas sobre cómo se hizo la prueba, qué comentarios dieron los testers, qué se cambió con esos comentarios y por qué la app está lista. Según terceros, las respuestas vagas son la causa más común de rechazo.
8. Cuando Google aprueba, la app se puede publicar.

## 4. Lo que falta completar para cobrar suscripciones

**En Apple (dentro de App Store Connect, sección Business):**
1. **Firmar el contrato de apps pagadas** (*Paid Apps Agreement*). Solo puede hacerlo usted como titular de la cuenta. Sin este contrato no se pueden crear suscripciones.
2. **Llenar el formulario de impuestos de EE.UU.** Para una persona que no vive allá suele ser el **W-8BEN**, y la misma página hace preguntas para indicarle cuál corresponde. Ojo: después de enviarlo casi nada se puede cambiar. Existe un tratado contra la doble tributación entre Chile y EE.UU., vigente desde diciembre de 2023. Qué poner en la Parte II del formulario debe decidirlo su contador [verificar con contador].
3. **Ingresar la cuenta bancaria:** debe estar a su nombre, escrito exactamente igual que en el banco, y solo se puede registrar una. Apple paga dentro de 45 días desde el cierre de cada mes fiscal. La página oficial no trae instrucciones específicas para Chile y no confirma que una cuenta en pesos funcione sin problemas [verificar con su banco].
4. **Postular al *Small Business Program*** apenas firme el contrato. La comisión baja de 30% a **15% desde el primer día**. No es automático.
5. **Declaración DSA (Ley de Servicios Digitales de la Unión Europea):** todos deben declarar si son "comerciante" (*trader*). Si la app se distribuye en la UE, su **dirección, teléfono y email personales quedan publicados** en la App Store europea. Si se distribuye **solo en Chile**, Apple no publica esos datos.

**En Google Play:**
1. **Crear un perfil de pagos** (cuenta de comerciante) y vincularlo a Play Console. Chile está habilitado para vender.
2. **Formulario de impuestos de EE.UU.** (W-8BEN para persona natural) en la sección de información fiscal del perfil de pagos. Hay un número limitado de intentos, así que llénelo con cuidado.
3. **Cuenta bancaria:** Google paga a Chile por **transferencia internacional en dólares**. Le conviene una cuenta en USD si su banco la ofrece. El banco puede cobrar comisiones de entre USD 0 y 50 o más por transferencia, y hay que pedirle los datos SWIFT o del banco intermediario.
4. **Comisión:** 15% en suscripciones. La prensa informa que, tras un acuerdo de Google con Epic Games, bajaría a 10%, y que en Chile se aplicaría recién hacia **septiembre de 2027** [verificar; solo lo confirma la prensa].

## 5. Avisos importantes

- **Regla de los testers (Google):** solo aplica a cuentas **personales** creadas después del 13-nov-2023. Hay que conseguir 12 personas reales con teléfono Android **antes** de lanzar. Al principio eran 20 y bajó a 12 en diciembre de 2024. No encontré cambios en 2025-2026, pero no pude leer la página oficial, así que confirme el número en Play Console al crear la cuenta [verificar]. Las cuentas de organización no tienen este requisito.
- **Su nombre será público:**
  - En Apple, como cuenta individual, **su nombre legal aparece como vendedor** de la app en la App Store.
  - En Google, su nombre de desarrollador, email, teléfono y sitio web son públicos. Además, como la app cobra suscripciones, **Google exige mostrar la dirección completa de su perfil de pagos**, es decir, **su dirección personal**.
  - Es un punto a considerar antes de decidir entre cuenta personal y de empresa.
- **Pasar a empresa más adelante:**
  - **Apple:** no hay un trámite que usted pueda hacer sola; hay que escribir a Soporte de Apple y pedir la conversión. Necesitará una empresa constituida en Chile (SpA, EIRL o Ltda.; no sirven nombres de fantasía), un número D-U-N-S, un email con el dominio de la empresa y un sitio web. Según guías de terceros, el trámite no tiene costo y puede tardar unas 3 semanas [verificar]. **No se puede hacer mientras se renueva la membresía.**
  - **Google:** las fuentes no coincidieron. Una guía decía que el tipo de cuenta no se puede cambiar, pero la ayuda oficial (vista solo en resultados de búsqueda) indica que hoy se puede **convertir la cuenta personal en cuenta de organización sin crear una nueva**, en Cuenta de desarrollador > Acerca de ti > Cambiar tipo de cuenta. Requisitos: cuenta personal verificada, sitio web de la empresa verificado y un perfil de pagos de empresa con D-U-N-S [verificar]. Si no se pudiera, la alternativa es crear una cuenta nueva (otros USD 25) y transferir la app mediante Soporte. Los informes de ventas no se transfieren, así que hay que descargarlos antes.
- **D-U-N-S:** es un número de identificación de empresas que entrega la firma Dun & Bradstreet. **Como persona natural no lo necesita.** Lo necesitará solo cuando pase a empresa.
  - Es **gratis** si se pide a través de la herramienta de Apple.
  - Para Apple, tarda hasta 5 días hábiles más 2 días hábiles.
  - Para Google, terceros hablan de hasta 30 días [verificar].
  - El nombre y la dirección de la empresa deben coincidir exactamente con ese registro.
- **Exención de pago (Apple):** existe una exención de la cuota anual, pero no le aplica: es solo para organizaciones sin fines de lucro, instituciones educativas y entidades de gobierno.

## 6. Impuestos en Chile [verificar con contador]

- **IVA a sus clientes:** según prensa (no es fuente oficial), desde 2020 Apple aplica el **IVA de 19%** en Chile y lo descuenta de lo que recibe el desarrollador. Para Google Play, una guía de terceros dice que Google también calcula y paga el IVA chileno, pero **no está confirmado en fuente oficial** [verificar con contador].
- **Sus ingresos:** no encontré una norma del Servicio de Impuestos Internos (SII) específica para desarrolladores de apps.
  - Como referencia, la Resolución Ex. N°128 del SII (oct-2025) pide a los creadores de contenido que cobran de plataformas extranjeras hacer **inicio de actividades** y emitir **boleta de honorarios** a un RUT genérico. Las fuentes no coinciden en el porcentaje de retención (14,5%, 15,25% o 17%) [verificar con contador].
  - También podría aplicar la figura de **exportación de servicios**, exenta de IVA, pero no encontré cómo se aplica a ventas por Apple o Google [verificar con contador].
- **Recomendación:** antes de firmar los formularios de impuestos de EE.UU. y de recibir el primer pago, consulte con un contador cómo declarar estos ingresos, si le conviene emitir boletas de honorarios o constituir empresa, y cómo usar el tratado Chile-EE.UU.

**Dominios bloqueados en esta investigación:** no se pudieron abrir support.google.com, www.sii.cl ni extendsclass.com. Lo que se indica de Google y del SII viene de extractos en resultados de búsqueda, no de leer esas páginas completas.

**Fuentes:**
- [Apple: inscripción al Developer Program](https://developer.apple.com/programs/enroll/)
- [Apple: ayuda sobre la inscripción](https://developer.apple.com/support/enrollment/)
- [Apple: compra y activación](https://developer.apple.com/support/purchase-activation/)
- [Apple: inscripción con la app Apple Developer](https://developer.apple.com/support/app-account/)
- [Apple: inscripción al programa (ayuda de la cuenta)](https://developer.apple.com/help/account/membership/program-enrollment/)
- [Apple: renovación de la membresía](https://developer.apple.com/help/account/membership/renewal)
- [Apple: número D-U-N-S](https://developer.apple.com/help/account/membership/D-U-N-S/)
- [Apple: exención de la cuota (Fee Waiver)](https://developer.apple.com/help/account/membership/fee-waivers/)
- [Apple: firmar contratos (Paid Apps Agreement)](https://developer.apple.com/help/app-store-connect/manage-agreements/sign-and-update-agreements)
- [Apple: información de impuestos](https://developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information)
- [Apple: datos bancarios](https://developer.apple.com/help/app-store-connect/manage-banking-information/enter-banking-information)
- [Apple: cómo se reciben los pagos](https://developer.apple.com/help/app-store-connect/getting-paid/overview-of-receiving-payments/)
- [Apple: regiones y monedas de los reportes](https://developer.apple.com/help/app-store-connect/reference/financial-report-regions-and-currencies/)
- [Apple: umbral mínimo de pago](https://developer.apple.com/help/app-store-connect/reference/minimum-payment-threshold/)
- [Apple: suscripciones y comisión](https://developer.apple.com/app-store/subscriptions/)
- [Apple: Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- [Apple: requisitos de la DSA (Unión Europea)](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements)
- [Foro de Apple: plazos de aprobación en 2026](https://developer.apple.com/forums/thread/822540)
- [Foro de Apple: cobro de USD 103,85](https://developer.apple.com/forums/thread/711146)
- [Foro de Apple: problemas de pago](https://developer.apple.com/forums/thread/126314?page=29)
- [Comunidad Apple: tarjeta chilena](https://communities.apple.com/es/thread/254714766)
- [iMore: inscripción por app en más países (2021)](https://www.imore.com/apple-opens-app-developer-enrollment-people-7-new-countries)
- [AppleInsider: Apple Store Online en Chile](https://appleinsider.com/articles/23/10/17/apple-store-online-officially-launches-in-chile)
- [Median: pasar de Individual a Organización en Apple](https://median.co/blog/how-to-change-your-apple-developer-account-from-individual-to-organization)
- [9to5Mac: IVA en Chile en la App Store (2020)](https://9to5mac.com/2020/09/01/app-store-prices-increase-chile-mexico-saudi-arabia-turkey/)
- [BDO: tratado tributario Chile-EE.UU.](https://bdo.com/insights/tax/us-chile-income-tax-treaty-enters-into-force)
- [Google: registro en Play Console](https://support.google.com/googleplay/android-developer/answer/6112435)
- [Google: verificación de identidad](https://support.google.com/googleplay/android-developer/answer/14177239)
- [Google: verificación del dispositivo Android](https://support.google.com/googleplay/android-developer/answer/14316361)
- [Google: requisito de prueba cerrada](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google: cambiar el tipo de cuenta](https://support.google.com/googleplay/android-developer/answer/16260648)
- [Google: información pública del desarrollador](https://support.google.com/googleplay/android-developer/answer/13634081)
- [Google: transferir apps](https://support.google.com/googleplay/android-developer/contact/appt)
- [Google: países habilitados para vender](https://support.google.com/googleplay/android-developer/answer/9306917)
- [Google: pagos a desarrolladores](https://support.google.com/googleplay/android-developer/answer/2700656)
- [Google Payments: cuentas bancarias de comerciantes](https://support.google.com/paymentscenter/answer/7161440?hl=en)
- [Google: comisiones](https://support.google.com/googleplay/android-developer/answer/112622)
- [Google: información fiscal (W-8BEN)](https://support.google.com/googleplay/android-developer/answer/7163598)
- [Google: verificación de desarrolladores Android 2026](https://android-developers.googleblog.com/2026/03/android-developer-verification-rolling-out-to-all-developers.html)
- [Google: anuncio de verificación de desarrolladores](https://goo.gle/developer-verification)
- [TechCrunch: acuerdo Google-Epic](https://techcrunch.com/2026/03/04/google-settles-with-epic-games-drops-its-play-store-commissions-to-20/)
- [Android Authority: de 20 a 12 testers](https://androidauthority.com/google-play-app-testing-requirement-3510580)
- [Choicely: regla de los 12 testers](https://www.choicely.com/blog/google-play-12-tester-rule)
- [webtoapp.design: cómo hacer la prueba cerrada](https://webtoapp.design/blog/set-up-closed-test)
- [Level Up: continuidad de los 14 días](https://levelup.gitconnected.com/the-12-tester-tax-google-plays-closed-testing-rule-is-quietly-killing-solo-devs-2cea83c2e338)
- [Testers Community: cuestionario de acceso a producción](https://www.testerscommunity.com/de/guides/google-play-production-access-form-answers)
- [Testerbee: costo y plazo de verificación de Google Play](https://testerbee.com/blog/google-play-console-registration-fee-and-verification-time)
- [Magora: costo de la cuenta de Google Play](https://magora-systems.com/google-play-developer-account-cost/)
- [GoodBarber: registro en Google Play](https://www.goodbarber.com/help/publish-your-android-app-yourself-solo-r62/register-for-a-google-play-developer-account-a70/)
- [GoodBarber: transferir una app de Android](https://www.goodbarber.com/help/manage-developer-accounts-apple-google-r97/transfer-your-android-app-to-a-different-google-play-account-a221/)
- [Afternoon: impuestos en Google Play](https://www.afternoon.co/blog/google-play-sales-tax-guide)
- [The Register: verificación de desarrolladores Android](https://www.theregister.com/2025/08/26/android_developer_verification_sideloading)
- [SII: creadores de contenido digital (oct-2025)](https://www.sii.cl/noticias/2025/131025noti01smn.htm)
- [SII: factura de exportación de servicios](https://www.sii.cl/preguntas_frecuentes/factura_electronica/001_003_6293.htm)

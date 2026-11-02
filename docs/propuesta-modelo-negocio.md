# Propuesta: modelo de negocio de Dale Contacto

> **Es una propuesta, no una decisión.** Parte de las 4 ideas de la dueña (2-nov). Los precios son puntos de partida para validar, no números probados. Lo marcado **[verificar]** no está confirmado.
>
> **Choca con una decisión tomada:** hoy CLAUDE.md dice "el conductor usa la app gratis (por ahora)". Si se aprueba la idea 1, esa decisión cambia.

---

## Idea 1. Suscripción del conductor: $1.000 al mes

### Lo que funciona
- **Fundadores por invitación (primeros 1.000, 6 meses gratis):** la escasez ("solo por invitación") ayuda a que se inscriban y a que inviten. Es buena idea.
- **Referidos para los siguientes 1.000:** el conductor es el mejor canal para llegar a otros conductores (grupos de WhatsApp, paraderos, líneas de colectivo).

### Riesgos que hay que mirar antes de decidir
1. **Cobrarle al lado que todavía no recibe nada.** Si el conductor paga y no le llegan ofertas, se va y habla mal de la app. Al principio habrá pocos titulares (en el lanzamiento solo Taxi y Taxi ejecutivo). Los mercados de dos lados casi siempre dejan gratis al lado que hay que juntar primero. En el extranjero, las bolsas de conductores (Driverlink, Trucker Search) cobran a la empresa, no al conductor (ver Fuentes).
2. **Con $1.000 casi no queda margen.** Si el precio incluye IVA, quedan $840. A eso se le resta la comisión del medio de pago (en un cobro tan chico pesa mucho [verificar tarifas de Flow, Mercado Pago, Webpay]) y, cuando lleguen las tiendas, la comisión de Apple o Google (15 % a 30 % [verificar]).
3. **Medio de pago:** muchos conductores no tienen tarjeta de crédito. El cobro mensual automático con débito o prepago hay que confirmarlo con el proveedor [verificar].
4. **Fin de los 6 meses gratis:** si no se pide la tarjeta al inscribirse, mucha gente no va a pagar cuando termine el período gratis. Si se pide, se inscriben menos. Hay que elegir una de las dos.

### Lo que propongo
- **Entrar a la base y al match: gratis siempre.** Sin conductores no hay nada que venderle al titular.
- **Plan "Conductor Pro" a $1.000/mes (opcional),** que paga lo que de verdad le cuesta a la app y le sirve al conductor:
  - La **verificación de documentos** con insignia "Verificado" (revisarlos con IA + persona tiene un costo).
  - **Aparecer primero** en la lista de matches del titular.
  - **Beneficios colectivos** (idea 3).
  - Opción **anual a $9.990** (2 meses gratis): menos cobros y menos comisiones.
- **Fundadores:** los primeros 1.000, por invitación, con Pro gratis 6 meses y después **precio fundador congelado** ($1.000 para siempre, aunque el precio suba). Cada fundador recibe, por ejemplo, 3 invitaciones.

### Referidos: cómo pagarlos
- **Pagar con meses gratis, no con plata:** cada referido que paga = 1 mes gratis de Pro para quien lo invitó. Es lo más barato, no hay que hacer transferencias y es más simple con el SII [verificar con contador si pagar en plata obliga a boleta o retención].
- **Si se paga en plata:** $1.000 por referido, con un **tope de $20.000 al año por conductor** (20 referidos), pagado solo cuando el referido paga su **segundo mes** (así se evitan cuentas falsas). El RUN de la cédula (ya se pide en la verificación) evita que alguien se invite a sí mismo con otro número.
- **Que la promoción tenga fecha de término y bases escritas** (requisito de las promociones según la Ley del Consumidor [verificar]).

---

## Idea 2. "La primera base de datos de conductores de Chile y del mundo"

### Lo que encontré: **no se puede decir "la primera"**
- **En Chile:** ya existe **Portal Conductores** (portalconductores.cl), con perfiles de conductores profesionales que las empresas ven con una cuenta pagada. Uber tuvo **Uber Conecta** (2018) para unir dueños y conductores, y hoy tiene **Uber Match**. Ver `docs/investigacion/mercado-avisos.md`. Tampoco encontré un registro público y oficial de conductores profesionales; el más cercano es el registro de empresas de aplicación y sus conductores que crearía la Ley 21.553, todavía sin reglamento [verificar].
- **En el mundo:** existen hace años: Driverlink y Trucker Search (EE. UU., camioneros), Drive My Way (EE. UU.) y Road Ninja (Nueva Zelanda), entre otras.
- Decir "la primera" sin serlo puede contar como **publicidad engañosa** (Ley 19.496 [verificar con abogado]).

### Lo que sí se puede decir (y es más fuerte)
- "La red de **conductores verificados** de Chile": cédula, licencia, Hoja de Vida y antecedentes revisados. Ninguno de los competidores chilenos que encontré verifica documentos para el arriendo de un vehículo.
- "Conecta conductores con dueños de **taxi** y vehículos": no encontré a nadie que lo haga en Chile fuera de las apps de Uber y DiDi [verificar en las tiendas].

### Cuidado legal: "exponer y ofrecer la base de datos"
- **No se puede vender ni entregar la base de datos** a terceros. Desde el 1-dic-2026 rige la Ley 21.719 de datos personales [verificar con abogado].
- Lo que sí se puede hacer: que las empresas **paguen por buscar dentro de Dale Contacto**, y que cada conductor **acepte** aparecer en esas búsquedas (interruptor "Quiero que las empresas me encuentren").
- Esto cambia lo que está decidido hoy ("antes del match nadie ve a nadie"). Si se aprueba, sería una función nueva: el **buscador de conductores** para empresas (ver idea 4, plan Flota).

---

## Idea 3. Beneficios colectivos (ej. seguro de salud)

### Lo que hay que saber
- **Con $1.000 al mes no alcanza para pagar un seguro.** Un seguro complementario de salud colectivo cuesta bastante más por persona al mes [verificar cotización con un corredor]. Entonces el seguro **no puede venir incluido**: tiene que ser un **descuento opcional** que el conductor paga aparte, a precio de grupo.
- **Para ofrecer seguros hay que hacerlo con un corredor de seguros inscrito en la CMF.** Dale Contacto no puede venderlos directamente [verificar con abogado]. El modelo usual es que la app sea la "contratante" de una póliza colectiva y el conductor se adhiera voluntariamente, o que la app reciba una comisión del corredor.
- No encontré un seguro colectivo de salud negociado para conductores de taxi o colectivo en Chile. La Cámara de Diputados ha dicho que los cerca de 100 mil conductores de colectivo trabajan con poca o ninguna protección laboral. **Hay espacio para ofrecerlo.**

### Beneficios posibles (de más fácil a más difícil)
1. **Descuentos con comercios:** talleres, neumáticos, lavado, lubricentros, ópticas. No cuestan nada y los comercios ganan clientes.
2. **Cursos para la licencia profesional A2:** si la Ley Uber la llega a exigir a los conductores de apps, muchos la van a necesitar [verificar estado de la ley]. Convenio con escuelas de conductores.
3. **Seguro de accidentes personales y de vida:** es barato y fácil de armar como seguro colectivo.
4. **Seguro complementario de salud o dental:** el más valorado y el más difícil. Requiere un mínimo de personas inscritas para negociar.
5. **Ayuda para cotizar como independiente** (la ley de accidentes del trabajo, Ley 16.744, ya los cubre si cotizan).

### Otra fuente de ingresos
Los comercios, corredores de seguros y escuelas **pueden pagarle a Dale Contacto** por llegar a miles de conductores verificados (comisión por venta o pago por aparecer). Puede valer más que los $1.000 del conductor.

---

## Idea 4. Cómo cobrarle a los titulares y empresas

### El problema principal
El titular con **un solo taxi** busca conductor pocas veces al año. Si se le cobra una **suscripción mensual**, paga un mes, encuentra conductor y se da de baja. Por eso conviene tener **dos formas de pago**: una para quien busca de vez en cuando y otra para las flotas.

### Para darle un precio: lo que pierde el titular
Un taxi sin conductor deja de recibir **$16.000 a $20.000 al día** de entrega (avisos de Yapo y Rastro, ver `docs/investigacion/mercado-avisos.md`). Si Dale Contacto le cobra menos que **un día de auto parado**, el precio se explica solo: "te cuesta menos que un día sin conductor".

### Opciones de cobro (se pueden combinar)

| # | Modelo | Cómo funciona | Para quién | Ventaja | Riesgo |
|---|---|---|---|---|---|
| A | **Pase por búsqueda** | Paga una vez y tiene 30 días para ver sus matches y contactarlos | Titular con 1 vehículo | Se adapta a quien busca pocas veces | Ingreso irregular |
| B | **Suscripción por búsquedas activas** (lo que ya está decidido) | Básico 1, Flota chica 5, Flota 20 búsquedas a la vez | Flotas | Ingreso todos los meses | El titular chico se da de baja |
| C | **Pago por contacto** | Ve gratis el adelanto y paga por cada conductor que quiere contactar | Titular que duda | Paga solo si le gusta un conductor | Muchos pagos chicos |
| D | **Destacar la búsqueda** | La búsqueda aparece primero a los conductores y les llega un aviso | Quien tiene apuro | Extra fácil de vender | Necesita muchos conductores |
| E | **Buscador y filtros** (idea 2) | Busca en toda la red, con filtros extra (años, estacionamiento, garantía) y alertas cuando entra un conductor nuevo | Flotas y empresas | Es "la base de datos" que quieren vender | Requiere que el conductor acepte aparecer |
| F | **Plan empresa a medida** | Contrato anual, factura, varios usuarios, apoyo directo | Flotas grandes, buses, carga (Tucar y similares) | Pocos clientes, mucho ingreso | Venta uno a uno |
| G | **Cobro por éxito** | Paga solo si el conductor empieza a trabajar | — | Fácil de vender | **No recomendado:** no se puede saber si trabajaron juntos fuera de la app |

### Precios iniciales para probar (todos con IVA incluido, configurables desde el panel)

| Plan | Qué incluye | Precio propuesto |
|---|---|---|
| **Pase 30 días** (A) | 1 búsqueda, ver matches y contactarlos durante 30 días | $14.990 |
| **Básico** (B) | 1 búsqueda activa siempre, mensual | $9.990/mes |
| **Flota chica** (B) | 5 búsquedas activas | $29.990/mes |
| **Flota** (B + E) | 20 búsquedas + buscador y filtros + alertas | $79.990/mes |
| **Empresa** (F) | A medida | Cotización |
| **Destacar** (D, extra) | 7 días primero en la lista | $4.990 |

### Ofertas de lanzamiento para titulares
- **"Si no encuentras, no pagas":** si en 30 días no hay ningún match, se devuelve el dinero o se regala otro mes. Quita el miedo a pagar y no encontrar nada.
- **Adelanto gratis** (ya decidido, P11): "hay 8 conductores verificados para tu búsqueda". Es el gancho para pagar.
- **Primeros 100 titulares:** primer mes gratis o precio fundador congelado.
- **Descuento anual:** 2 meses gratis si paga el año.

### Lo que recomiendo para salir (MVP)
1. **Conductor:** gratis para entrar al match. Fundadores por invitación. Pro a $1.000 **después**, cuando haya titulares pagando (así se le cumple lo que se le promete).
2. **Titular:** solo **Pase 30 días** + **Flota chica** + **Flota**. Tres opciones, fácil de entender. "Destacar", pago por contacto y buscador, más adelante.
3. **Beneficios:** partir con **descuentos en comercios** (no cuestan) y conversar con un corredor de seguros cuando haya unos 1.000 conductores inscritos.

---

## Desglose de costos: conductor que paga $1.000 al mes

> Estimación para un conductor promedio. **Supuestos (todos [verificar]):** dólar a $950; precio con IVA incluido; pago web con tarjeta; inicia sesión 2 veces al mes; recibe 2 avisos por WhatsApp al mes; renueva documentos cada 6 meses; 30 % de los casos los revisa una persona.

### Costos de cada mes

| Concepto | Cálculo | $ al mes |
|---|---|---|
| **Precio que paga el conductor** | | **$1.000** |
| IVA (19 %) | $1.000 − $1.000 / 1,19 | −$160 |
| **Ingreso neto** | | **$840** |
| Comisión del medio de pago | Crédito ~2,95 % + IVA ≈ 3,5 % (débito ~1,3 %) [verificar Flow, Mercado Pago, Webpay] | −$35 |
| Códigos de entrada por WhatsApp | 2 × US$0,02 [verificar tarifa de Meta para Chile] | −$38 |
| SMS de respaldo | 10 % de los códigos × ~US$0,07 [verificar Twilio] | −$13 |
| Avisos por WhatsApp (matches, recordatorios) | 2 × US$0,02 | −$38 |
| Revisión de documentos con IA | ~$40 cada 6 meses (ver abajo) | −$7 |
| Revisión por una persona | 30 % de los casos × 3 min, a $5.000 la hora ≈ $75 cada 6 meses | −$13 |
| Google Maps (sugerencia de dirección) | ~US$0,02 una vez, repartido en 12 meses [verificar] | −$1 |
| Supabase Pro (base de datos y archivos) | US$25/mes ÷ 1.000 conductores (con 10.000 baja a $2) | −$24 |
| Correos (comprobantes, recuperar cuenta) | Plan gratis del proveedor hasta cierto volumen [verificar] | $0 |
| **Total de costos** | | **−$169** |
| **Margen por conductor** | | **≈ $670 al mes** (67 % del precio) |

### Si el cobro pasa por las tiendas (Apple / Google)
La tienda cobra ~15 % sobre el precio sin IVA (programas para empresas pequeñas [verificar]), unos $126, en vez de los $35 del pago web. **Margen: ≈ $580 al mes.** Por eso conviene que el conductor pague en la web.

### Costo de la revisión con IA (detalle)
Cédula y licencia por ambos lados, Hoja de Vida y antecedentes ≈ 6 imágenes ≈ 12.000 unidades de texto de entrada y ~1.000 de salida.
- **Modelo mediano (Claude Sonnet 5.5, US$2 / US$10 por millón):** ≈ US$0,04 ≈ **$40** por revisión.
- **Modelo chico (Claude Haiku 5.5, US$0,10 / US$0,50 por millón):** ≈ **$2** por revisión. Hay que probar si lee bien los documentos chilenos.
Precios de la lista de Anthropic de oct-2026 [verificar al contratar].

### Lo que cuestan las promociones
- **Fundador (6 meses gratis):** revisión inicial ~$130 + ~$110 al mes de avisos y servidor = **≈ $800 por fundador**. Los 1.000 fundadores cuestan **≈ $800.000** en 6 meses.
- **Referido pagado con $1.000 en plata:** se lleva más que el margen de un mes. Se recupera en el segundo mes del referido.
- **Referido pagado con 1 mes gratis:** cuesta solo los ~$135 de costos de ese mes (más el ingreso que no entra).

### Escala: 1.000 conductores pagando
- Ingreso neto: **$840.000 al mes**. Costos variables: ~$170.000. Margen: **≈ $670.000 al mes**.
- **No incluye costos fijos:** desarrollo y mantención de la app, sueldos, abogado, contador, publicidad, cuenta de Apple (US$99 al año) y de Google (US$25, una vez), ni el impuesto a la renta sobre las utilidades.

---

## Preguntas para la dueña

- **N1.** ¿El conductor paga para entrar al match, o entra gratis y paga solo el plan Pro con beneficios?
- **N2.** Si el conductor paga, ¿$1.000 incluye IVA? ¿Se ofrece plan anual?
- **N3.** Fundadores: ¿se pide la tarjeta al inscribirse o al terminar los 6 meses? ¿Precio congelado después? ¿Cuántas invitaciones por fundador?
- **N4.** Referidos: ¿se paga con meses gratis o en plata? Si es en plata, ¿cuál es el tope?
- **N5.** ¿Se aprueba el buscador para empresas, con el conductor eligiendo si aparece? (Cambia "antes del match nadie ve a nadie".)
- **N6.** ¿Qué frase se usa en la publicidad en vez de "la primera base de datos"?
- **N7.** Titulares: ¿se agrega el Pase 30 días a los planes Básico, Flota chica y Flota? ¿Qué precios?
- **N8.** ¿Se ofrece "si no encuentras, no pagas"?
- **N9.** Beneficios: ¿se parte con descuentos en comercios? ¿Hay un corredor de seguros conocido con quien conversar?

---

## Fuentes
- Competidores en Chile: `docs/investigacion/mercado-avisos.md` (Portal Conductores, Uber Match, Uber Conecta, DiDi Fleet, Tucar).
- Bolsas de conductores que cobran a la empresa: [FleetOwner – Driverlink](https://www.fleetowner.com/mag/fleet_drivers_job_site), [Trucknews – Trucker Search](https://www.trucknews.com/features/looking-for-a-new-job/), [Drive My Way](https://hiring.drivemyway.com/?p=6183), [Road Ninja (NZ)](https://nztrucking.co.nz/?p=136075).
- Registro de empresas de aplicación y conductores (Ley 21.553): [Cámara de Diputados, 2023](https://www.camara.cl/cms/noticias/2023/01/24/aplicaciones-de-transporte-publico-deberan-cumplir-exigencias-basicas-para-su-funcionamiento/).
- Protección de conductores de colectivo: [Cámara de Diputados, 2022](https://www.camara.cl/cms/2022/05/06/proponen-evaluar-medidas-previsionales-para-conductores-de-taxis-colectivos/), [Mintrab – seguro de accidentes para independientes](https://www.mintrab.gob.cl/pgm/CanalRegional/Atacama/trabajadores-independientes-de-taxis-colectivos-se-informan-sobre-seguro-de-accidentes-de-trabajo-y-enfermedades-profesionales/), [SUSESO](https://www.suseso.gob.cl/612/w3-propertyvalue-139248.html).

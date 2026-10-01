# Cómo se publicitan hoy conductores y titulares en Chile

## Nota de método
- No pude abrir los avisos uno por uno. El proxy de red de esta sesión bloqueó yapo.cl, rastro.com, computrabajo, mercadolibre, jooble, anuto, portalconductores.cl y bcn.cl. Todos los datos de avisos salen de **extractos del buscador**, no de la página completa.
- Las frecuencias son una **estimación cualitativa sobre unos 20–25 extractos de avisos**, no un conteo real. Para validarlas hay que revisar unos 50 avisos a mano [verificar].
- Los **grupos de Facebook no aparecen en el buscador** (son cerrados o no indexados). No pude confirmar nombres de grupos ni avisos de ahí [verificar].

---

## 1. Qué ponen los CONDUCTORES en sus avisos
Salen sobre todo de Yapo ("yo busco"/demandantes) y de Rastro.
- **Clase(s) de licencia**, casi siempre y a menudo varias: "A2, A3, A4, A5, B, D".
- **"Disponibilidad inmediata"**.
- **Experiencia**: años y rubro. Ejemplo: "más de 15 años", "transporte escolar", radiotaxi, apps.
- **Qué busca manejar**: taxi básico, colectivo, bus, Uber.
- **Papeles**: "documentos al día", "hoja de vida limpia", "sin antecedentes".
- **Comuna o zona** (ejemplo: "centro de Santiago", "Florida").
- A veces **"con garantía"**: el propio conductor ofrece pagar garantía.
- Contacto: teléfono o WhatsApp.

Fuentes: [yapo chofer-licencia-a2](https://www.yapo.cl/paginas/trabajos/chofer-licencia-a2), [yapo chofer-a2](https://www.yapo.cl/paginas/trabajos/chofer-a2), [rastro chofer-santiago](https://rastro.com/avisos/chofer-santiago/)

## 2. Qué ponen los TITULARES / EMPRESAS

**Avisos reales de ejemplo (según los extractos del buscador)**

| Vehículo / lugar | Modalidad y monto | Garantía | Requisitos | Fuente |
|---|---|---|---|---|
| Taxi básico, Santiago | Entrega $17.000/día, lunes a sábado | $120.000 | experiencia, documentos al día, a veces estacionamiento propio | [rastro](https://rastro.com/avisos/chofer-de-taxi/) |
| Taxi | Entrega $16.000/día, lunes a sábado, domingo libre | $100.000 | licencia profesional, hoja de vida | [yapo chofer-de-taxi](https://www.yapo.cl/paginas/trabajos/chofer-de-taxi) |
| Taxi, Lo Prado | Entrega $20.000/día, lunes a sábado | $150.000 | — | [yapo](https://www.yapo.cl/paginas/trabajos/chofer-de-taxi) |
| Taxi básico, Lo Prado | $20.000/día, lunes a viernes | — | ">45 años", vivir cerca, lugar seguro para guardar el auto | [yapo chofer-para-taxi](https://www.yapo.cl/paginas/trabajos/chofer-para-taxi) |
| Taxi Nissan Versa, Maipú | entrega ("listo para trabajar") | $110.000 | domicilio en Maipú acreditado, estacionamiento propio | [yapo](https://www.yapo.cl/paginas/trabajos/chofer-de-taxi) |
| Taxi | entrega semanal $110.000 | — | A2 o superior, hoja de vida, referencias | [yapo](https://www.yapo.cl/paginas/trabajos/chofer-para-taxi) |
| Taxi (requisitos típicos) | — | $120.000 | antecedentes, hoja de vida, comprobante de domicilio, A2, copia del carnet | [búsqueda yapo/rastro](https://rastro.com/avisos/chofer-de-taxi/) |
| Taxi básico, Iquique | — | — | "preferible adulto", clase A profesional, hoja de vida, antecedentes, comprobante de domicilio, fines de semana y festivos; contacto por WhatsApp | [anuto](https://cl.anuto.app/ad/se-necesita-chofer-para-taxi-basico-a-cargo-Zlcb9u4UgjZjNqKLWAgb) |
| Colectivo línea 21, Temuco | ~$100.000 (estimado), lunes a sábado | — | "licencia acorde", sin experiencia | [yapo 31048924](https://www.yapo.cl/empleos-ofertas-de-trabajos/chofer-para-taxi-colectivo/31048924) |
| Colectivo línea 911 | con vehículo | — | — | [rastro colectivo](https://rastro.com/avisos/chofer-colectivo/) |
| Auto para Uber, Región Metropolitana ("ofrezco auto") | $18.000 diario para el conductor, pago los jueves | — | >30 años, estacionamiento seguro propio, smartphone con plan, antecedentes, hoja de vida, comprobante de domicilio, licencia A o B, experiencia | [unmejorempleo](https://www.unmejorempleo.cl/empleo-en_metropolitana_de_santiago_conductor_para_uber_ofrezco_auto-3499792.html) |
| Flotas que arriendan autos para apps, Santiago | $90.000 a $242.000/semana | 3 UF a $350.000, en cuotas | cédula, licencia, antecedentes, hoja de vida, comprobante de domicilio; a veces exclusividad con una app (Tucar pide ≥50% de los km en Uber) | [naran.blog](https://naran.blog/arriendo-de-auto-uber-santiago/) |

**Cómo se cruza esto con los 3 modos de contrato**
- **Arriendo fijo**: es lo más común en taxi y auto para apps. En los avisos se dice "entrega diaria" o "cuota semanal" + "garantía".
- **% de ganancia**: en colectivos existe el reparto diario 50/50 de utilidades entre dueño y chofer, según la BCN ([Asesoría Técnica Parlamentaria, mayo 2024](https://obtienearchivo.bcn.cl/obtienearchivo?id=repositorio%2F10221%2F36008%2F1%2Fconductores_Taxis_colectivos_y_Uber__2024.pdf)). No pude leer el PDF completo [verificar texto exacto].
- **% sobre producción**: no encontré avisos indexados que lo nombren así [verificar en terreno]. Puede que se use en camiones o fletes, pero no lo confirmé.

## 3. Datos que más se repiten → candidatos a campos de match

| Campo | Frecuencia aprox. | Lo usan | Comentario para el match |
|---|---|---|---|
| Tipo de vehículo / servicio (taxi básico, colectivo y línea, auto para app, bus, camión) | Muy alta | ambos | Base del match |
| Clase de licencia (A1 antigua, A2, A3, A4, A5, B, D) | Muy alta | ambos | Lista de selección múltiple |
| Modalidad + monto (entrega $/día o $/semana; %) | Muy alta en titulares | titular | Rango de monto, no valor exacto |
| Días / turno (lunes a sábado, domingo libre, fines de semana, día/noche) | Alta | ambos | Selección múltiple |
| Hoja de vida del conductor | Alta | titular pide, conductor declara "limpia" | Mejor como **documento verificado** que como variable |
| Certificado de antecedentes | Alta | igual | Igual |
| Garantía (sí/no, monto) | Alta en taxi y apps | ambos | Titular: monto que exige; conductor: máximo que puede pagar |
| Comuna / cercanía | Media-alta | ambos | Comuna o radio |
| Estacionamiento propio/seguro | Media | titular | Sí/no |
| Comprobante de domicilio | Media | titular | Documento |
| Experiencia (años, rubro) | Media | ambos | Rango de años + rubros |
| Disponibilidad inmediata / fecha de inicio | Alta en conductores | conductor | Sí/no o fecha |
| Edad mínima (">30", ">45", "adulto") | Baja-media | titular | **No usar** (ver dolores) |
| Exclusividad de app (Uber/DiDi/Cabify) | Baja (flotas) | titular | Opcional |
| Contacto WhatsApp | Alta | ambos | Ya está decidido: se muestra tras el match |

**Fuera de los avisos clásicos**: en el antiguo Uber Conecta, el perfil del conductor mostraba tiempo en la plataforma, calificación, viajes completados y si tenía estacionamiento ([Uber blog 2018](https://www.uber.com/cl/es/blog/uber-conecta-2/)). Calificación y viajes en apps sirven como campo opcional de experiencia.

## 4. Dolores observados → qué haría la app vendible para el titular que paga

**Dolores con evidencia**
1. **Documentos falsos o suplantación de identidad**:
   - Un conductor de Uber con órdenes de detención por violación usaba la identidad de otro conductor ([BioBio, mar-2026](https://www.biobiochile.cl/noticias/nacional/region-metropolitana/2026/03/09/detienen-a-chofer-de-uber-que-tenia-antecedentes-de-violacion-suplanto-la-identidad-de-otro-conductor.shtml)).
   - Un certificado de antecedentes editado con Photoshop ([BioBio 2017](https://www.biobiochile.cl/noticias/ciencia-y-tecnologia/moviles-y-computacion/2017/12/11/las-vulnerabilidades-de-uber-destapadas-por-en-su-propia-trampa-y-como-protegerse.shtml)).
   - Certificados falsos con logo de CONASET ([conaset.cl](https://www.conaset.cl/certificados-conductor-falsos/)).
2. **Que no devuelvan el auto o no paguen**: hay casos de apropiación indebida de vehículos arrendados ([Diario de Antofagasta](https://www.diarioantofagasta.cl/regional/antofagasta/207323/arrendo-un-auto-y-no-lo-devolvio-recuperan-vehiculo-en-antofagasta-tras-apropiacion-indebida/), [Poder Judicial](https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/66300)). Por eso casi todos los titulares piden garantía, domicilio acreditado y que el conductor viva cerca.
3. **Filtrar a mano**: los avisos repiten la misma lista de requisitos, y el titular revisa cada papel por WhatsApp.
4. **Riesgo laboral**: la Dirección del Trabajo ha dicho en varios casos que existe relación laboral entre dueño y conductor cuando hay subordinación ([ORD. 4966](https://www.dt.gob.cl/legislacion/1624/w3-article-115988.html), [ORD. 4136](https://www.dt.gob.cl/legislacion/1624/w3-article-115750.html)) [verificar con abogado]. La app no debería redactar contratos ni presentarse como empleador.
5. **La regulación puede cambiar quién puede manejar**: la Ley 21.553 ("Ley Uber", 2023) exigiría licencia profesional (A2) a los conductores de apps. Su reglamento sigue sin publicarse y está en revisión a 2026 ([practicatest](https://practicatest.cl/blog/articulos-especiales/ley-uber-chile-requisitos-conductores-vigencia), [CNN Chile](https://www.cnnchile.com/pais/ley-uber-reglamento-contraloria-conductores-usuarios/)) [verificar estado actual].

**Qué haría vendible la suscripción (con fuentes oficiales que se pueden verificar)**
- **Insignia "Verificado" con fecha de vencimiento**, revisada a mano desde el panel de administración:
  - Antecedentes y hoja de vida del conductor: el Registro Civil permite validarlos con folio + código de verificación hasta 60 días después de emitidos ([ChileAtiende antecedentes](https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes), [ChileAtiende hoja de vida](https://www.chileatiende.gob.cl/fichas/13661-hoja-de-vida-del-conductor)).
  - Licencia: consulta de bloqueo por RUT en registrocivil.cl ([certificados.cl](https://www.certificados.cl/licencia-de-conducir-con-rut/)) [verificar cuánto revela esa consulta].
  - API de terceros para licencias chilenas: existe Verifik ([verifik.co](https://verifik.co/verifica-licencias-de-conducir-en-chile-al-instante-con-la-api-de-verifik/)) [verificar precio y cobertura].
- **Verificar también al titular**, para que el conductor confíe: si el taxi o colectivo está vigente en el Registro Nacional de Transporte de Pasajeros (consulta por patente, [apps.mtt.cl/consultaweb](https://apps.mtt.cl/consultaweb/), [ChileAtiende](https://www.chileatiende.gob.cl/fichas/44269-consulta-de-estado-de-un-vehiculo-escolar-o-publico-en-el-registro-nacional-de-transporte)) y el certificado de anotaciones vigentes del vehículo ([ChileAtiende](https://www.chileatiende.gob.cl/fichas/3370-certificado-de-anotaciones-vigentes-de-vehiculos-motorizados)).
- **Filtros que hoy el titular aplica a mano**: comuna o cercanía, estacionamiento propio, días/turno, garantía aceptada, clase de licencia.
- **Re-verificación periódica**: Uber pide antecedentes de máximo un mes y que se actualicen cada 6 meses ([Autofact](https://www.autofact.cl/blog/mi-auto/actividades/chofer-uber-requisitos)), así que tiene sentido que la insignia venza.

**Cuidados para el diseño de campos**
- **No poner edad ni sexo como campo de match.** El art. 2 del Código del Trabajo considera discriminación exigir una edad en ofertas de empleo ([DT](https://www.dt.gob.cl/portal/1628/w3-article-60781.html)). Si aplica también a un arriendo civil es dudoso [verificar], pero lo prudente es dejarlo fuera.
- **Antecedentes penales son dato sensible.** La Ley 21.719 de datos personales rige desde el 1-dic-2026 y trata expresamente los datos penales (art. 25) ([yourdevs](https://www.yourdevs.cl/blog/ley-21719-proteccion-datos-chile), [asentic](https://www.asentic.cl/blog/ley-21719-datos-personales/)) [verificar con abogado]. Sugerencia: guardar solo "verificado sí/no + fecha" y no el PDF, o borrarlo después de revisarlo.

## 5. Competidores confirmados

**Directos o cercanos**
- **Uber Match (Chile)**: el dueño publica su vehículo con precio semanal o mensual, depósito y contacto. Es gratis, pero solo sirve dentro de Uber y el vehículo ya debe estar activo en Uber ([Uber blog](https://www.uber.com/cl/es/blog/uber-match-chile-arrienda-tu-auto/)).
- **Uber Conecta (Chile, 2018)**: sitio para que dueños y conductores sin auto se encuentren, con perfiles que mostraban calificación, viajes y estacionamiento; integrado en la app Uber Fleet ([Uber blog](https://www.uber.com/cl/es/blog/uber-conecta-2/)). Si sigue activo o fue reemplazado por Uber Match [verificar].
- **DiDi Fleet**: en Chile sirve para administrar la flota (agregar conductores por teléfono) ([miracomosehace](https://miracomosehace.com/agregar-eliminar-conductor-flotilla-app-didi-fleet/)). En Colombia además conecta dueños con conductores que pasaron revisión de antecedentes y reconocimiento facial ([DiDi CO](https://web.didiglobal.com/co/didi-fleet/), [El Tiempo](https://www.eltiempo.com/economia/empresas/didi-fleet-la-aplicacion-que-le-permite-alquilar-su-carro-617036)). Si hay matching de DiDi en Chile [verificar].
- **Portal Conductores (portalconductores.cl)**: portal chileno de empleo para conductores profesionales, con ofertas por clase de licencia (A2, A5, B, C, D). Los datos completos del conductor solo se ven con cuenta de empresa ([sitio](https://portalconductores.cl/), [FAQ](https://portalconductores.cl/faq/)). Precio [verificar]. Es el competidor chileno más parecido, pero orientado a empleo formal, no a arriendo de vehículo ni %.

**Indirectos (los canales que se usan hoy)**
- Clasificados y portales de empleo: Yapo, Rastro, MercadoLibre, Anuto, Computrabajo, Laborum, Chiletrabajos, UnMejorEmpleo, Indeed, y agregadores como Jooble y Jobsora. Ninguno hace match ni verifica documentos.
- **Flotas que arriendan autos a conductores de apps**: Tucar ([tucar.app](https://tucar.app/), [DF](https://www.df.cl/df-lab/innovacion-y-startups/tucar-busca-cuadruplicar-su-flota-de-vehiculos-electricos-en-arriendo-y)), AUTO-CHECK ([auto-check.cl](https://auto-check.cl/)), GoCab [verificar], Uber Carflex ([Uber](https://www.uber.com/cl/es/blog/uber-carflex/)). Le compiten al titular particular, pero **también pueden ser titulares que paguen** (empresas que buscan conductores).

**Descartados**: Drivana (México) es arriendo de autos entre particulares, no conecta conductores con dueños ([Milenio](https://www.milenio.com/negocios/drivana-la-app-mexicana-de-renta-de-autos-se-prepara-para-el-mundial)).

**Espacio libre**: no encontré una app chilena que conecte dueños de **taxi o colectivo** (ni camión o furgón escolar) con conductores, ni una que funcione con varias apps a la vez [verificar en App Store y Google Play]. Uber Match y DiDi Fleet solo cubren su propia app.

---

## Fuentes principales
- Avisos: [rastro chofer-de-taxi](https://rastro.com/avisos/chofer-de-taxi/), [rastro colectivo](https://rastro.com/avisos/chofer-colectivo/), [yapo chofer-de-taxi](https://www.yapo.cl/paginas/trabajos/chofer-de-taxi), [yapo chofer-para-taxi](https://www.yapo.cl/paginas/trabajos/chofer-para-taxi), [yapo taxi-a-cargo](https://www.yapo.cl/paginas/trabajos/taxi-a-cargo), [yapo uber](https://www.yapo.cl/paginas/trabajos/uber), [yapo 31048924](https://www.yapo.cl/empleos-ofertas-de-trabajos/chofer-para-taxi-colectivo/31048924), [anuto](https://cl.anuto.app/ad/se-necesita-chofer-para-taxi-basico-a-cargo-Zlcb9u4UgjZjNqKLWAgb), [unmejorempleo](https://www.unmejorempleo.cl/empleo-en_metropolitana_de_santiago_conductor_para_uber_ofrezco_auto-3499792.html), [mercadolibre](https://listado.mercadolibre.cl/busco-chofer-para-uber), [naran.blog](https://naran.blog/arriendo-de-auto-uber-santiago/), [laborum](https://www.laborum.cl/en-region-metropolitana/santiago-de-chile/empleos-area-oficios-y-otros-subarea-transporte-de-pasajeros.html)
- Normativa y verificación: [BCN 2024](https://obtienearchivo.bcn.cl/obtienearchivo?id=repositorio%2F10221%2F36008%2F1%2Fconductores_Taxis_colectivos_y_Uber__2024.pdf), [DT ORD 4966](https://www.dt.gob.cl/legislacion/1624/w3-article-115988.html), [DT edad](https://www.dt.gob.cl/portal/1628/w3-article-60781.html), [ChileAtiende hoja de vida](https://www.chileatiende.gob.cl/fichas/13661-hoja-de-vida-del-conductor), [ChileAtiende antecedentes](https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes), [MTT consulta](https://apps.mtt.cl/consultaweb/)
- Competidores: [Uber Match](https://www.uber.com/cl/es/blog/uber-match-chile-arrienda-tu-auto/), [Uber Conecta](https://www.uber.com/cl/es/blog/uber-conecta-2/), [DiDi Fleet CO](https://web.didiglobal.com/co/didi-fleet/), [Portal Conductores](https://portalconductores.cl/), [Tucar](https://tucar.app/)
# Propuesta de campos MVP para corregir

> **Respuestas de la dueña (1-oct-2026)**
> - **P3:** sí → F1 (vehículo), F2 (licencia) y F3 (región) son filtros obligatorios, fuera del %.
> - **P8:** pregunta si la revisión de documentos puede hacerla un agente (IA). *En evaluación.*
> - **P10:** por ahora solo el titular ve el contacto del conductor. El conductor usa la app gratis.
> - **P11:** ok → el titular sin suscripción ve un adelanto anónimo.
> - **P13:** distintos planes de suscripción según volumen de búsquedas.
> - **P14:** cobro dentro y fuera de la app.
> - **P2:** sí → un solo perfil titular con selector; Experiencia/Contrato por búsqueda.
> - **P4:** sí → M1, M3 y M5 también son filtros obligatorios. Quedan 3 variables en el % (M2, M4, M6).
> - **P8:** sí → agente de IA pre-revisa; persona decide dudas y rechazos.
> - **P10 (ampliación):** el conductor ve cuántas veces ha hecho match; el resto, configurable más adelante.
> - **P13:** planes Básico (1), Flota chica (5), Flota (20). Precios por definir.
> - **Campos C#/T#:** sin correcciones por ahora.
> - **(8-oct) Garantía:** no es filtro; campo opcional (C13, T15). Ya no aplica "M5 como filtro".
> - **(8-oct) Zonas (M2/P6):** por grupos de comunas → ver `docs/propuesta-zonas.md`.
> - **(8-oct) Documentos:** Hoja de Vida (C18) pasa a **obligatoria** y se agrega el **Certificado de Antecedentes para fines especiales** (C19, obligatorio). Ya no está en "qué dejé fuera". Ver riesgos y opciones en `docs/investigacion/documentos-y-mensajes.md`.
> - **(8-oct) Nuevas funciones:** mensajes privados conductor ↔ titular dentro de la app (contacto del titular oculto salvo que lo revele) y favoritos en ambos lados.
> - **Las tablas de abajo son la versión original** (6 variables, 80 %). La versión vigente del match está en `CLAUDE.md`.
> - Pendientes: P1, P5, P7, P9, P12, P15, P16; nombre de la app.

**Cómo corregirla:** cada campo, filtro, variable, documento y pregunta tiene un código: C, T, F, M, D y P. Puedes contestar, por ejemplo, "C6 sacar", "T14 agregar opción Mañana", "M1 que sea filtro", "F3 sacar" o "P5: más de 80 %".

## Resumen

- **Conductor:** 15 campos, de los que 13 son obligatorios y 2 opcionales, más 2 documentos: cédula y licencia. Un tercer documento, la Hoja de Vida del Conductor, solo entra si lo aprueba un abogado (P1).
- **Titular:** propongo un solo perfil para persona natural y para empresa (P2). Tiene 7 campos de cuenta (2 son solo para empresa), 10 campos por cada **búsqueda** (uno de ellos se llena solo) y 2 verificaciones.
- **Match:** propongo 3 filtros que siempre deben cumplirse: tipo de vehículo, licencia y región (P3). Además hay 6 variables que valen lo mismo y forman el %.
- **Con 6 variables, 80 % significa 5 de 6 (83,3 %).** Da lo mismo leerlo como "más de 80 %" o como "80 % o más". Se acepta que falle 1 de las 6 variables. Qué variables pueden fallar y cuáles no, lo decides en P3 y P4.
- **El match se calcula siempre, pero la suscripción decide quién lo ve.** Si el titular no tiene la suscripción al día, nadie ve la ficha ni el contacto.

## Antes de leer las tablas

- **Todo se configura desde el panel de administración:**
  - campos y opciones de cada lista;
  - la tabla vehículo → licencia;
  - las zonas;
  - qué filtros y variables están activos, y sus pesos;
  - el umbral de 80 % y la regla "más de" u "o más";
  - los tramos de garantía y los plazos;
  - los documentos exigidos.

  Partir con pocos campos cuesta poco, porque agregar uno después no obliga a rehacer la app.
- **Búsqueda** (propuesta, P2): es lo que publica un titular para un vehículo o para un grupo de vehículos iguales. El match se calcula entre un conductor y una búsqueda. Así, una empresa con taxis y camiones usa una sola cuenta.
- **Admin:** la persona de tu equipo que usa el panel.
- **Antes del match nadie ve a nadie.** En el MVP no hay buscador de perfiles. Por eso las tablas solo muestran lo que cada parte ve **después** del match. Esto cambiaría solo si apruebas un adelanto anónimo para titulares sin suscripción (P11).
- **Lenguaje de acuerdo comercial:** la app habla de "búsqueda", "oferta" y "condiciones", y nunca de "vacante", "sueldo" o "jefe". Eso reduce la apariencia de relación laboral, pero no la evita si en la práctica hay subordinación [verificar con abogado, P1].
- **Columna "Uso en el match":**
  - **Filtro F#:** se tiene que cumplir sí o sí.
  - **Variable M#:** cuenta para el %.
  - **Condición previa:** sin ella no se calcula el match.
  - **No:** el campo no participa en el match.
- **Columna "Para qué":**
  - **Venta:** el titular paga por esto.
  - **Match:** lo usa el cálculo del match.
  - **Ley:** lo exige una ley; por ejemplo, la Ley 18.290 de Tránsito fija las clases de licencia.
  - **Verificación:** lo necesita la revisión de identidad o de documentos.

---

## 1. Perfil Conductor

| # | Bloque | Campo | Tipo | Opciones iniciales | Obligatorio | Uso en el match | Visible para el titular después del match | Para qué |
|---|---|---|---|---|---|---|---|---|
| C1 | Personal | Nombre y apellidos | texto | — | Sí | No | Sí | Venta y verificación: el titular sabe a quién llama. El admin lo compara con la cédula |
| C2 | Personal | RUN | texto. La app revisa que el RUN esté bien escrito (dígito verificador) | — | Sí | No | **No (solo el admin)** | Verificación: une la cuenta a la cédula. Es único por rol: no puede haber dos cuentas de conductor con el mismo RUN, pero la misma persona puede tener también una cuenta de titular |
| C3 | Personal | Teléfono celular (WhatsApp) | teléfono +56, confirmado con código SMS* | — | Sí | No | Sí | Venta: es lo que compra el titular |
| C4 | Personal | Email | email | — | Sí | No | Sí | Venta: segundo contacto y recuperación de la cuenta |
| C5 | Personal | Comuna donde vive | selección | Comunas de Chile, agrupadas por región | Sí | Filtro F3 y variable M2 | Sí | Match y venta: los titulares piden que el conductor "viva cerca" |
| C6 | Personal | Otras comunas donde puede retirar el vehículo | multiselección, hasta 3 | Mismo catálogo, más la opción "Cualquier comuna de mi región" | No | Filtro F3 y variable M2 | Sí | Match: amplía la zona sin usar GPS |
| C7 | Experiencia | Clases de licencia | multiselección | A1, A2, A3, A4, A5, B, C, D, A1 antigua (antes de 1997), A2 antigua (antes de 1997) | Sí | Filtro F2. Solo cuentan las clases revisadas (D2) | Sí, solo las revisadas | Ley y match: la Ley 18.290 exige la clase que corresponde a cada vehículo |
| C8 | Experiencia | Tipos de vehículo que quiere manejar | multiselección. Solo se ofrecen los tipos compatibles con sus clases | Catálogo de la tabla 1.1 | Sí | Filtro F1 | Sí | Match: es la base del match |
| C9 | Experiencia | Años manejando de forma remunerada | número entero (0 a 50) | — | Sí | Variable M4 | Sí, marcado "declarado" | Match y venta: aparece en casi todos los avisos |
| C10 | Experiencia | Tu experiencia en pocas palabras | texto, máximo 200 caracteres | Ejemplo: "8 años taxi básico, 2 años apps" | No | No | Sí | Venta: da el contexto que hoy el titular pide por WhatsApp |
| C11 | Contrato | Modos de contrato que acepta | multiselección; cada opción muestra su definición (P9) | Arriendo fijo; % de ganancia; % sobre producción | Sí | Variable M1 | Sí | Match |
| C12 | Contrato | Turnos disponibles | multiselección, con el texto guía "Marca solo los turnos que puedes cumplir completos" | Día, lunes a sábado; Noche, lunes a sábado; Vehículo a cargo (24 h); Solo fines de semana y festivos (día o noche) | Sí | Variable M3 | Sí | Match: los avisos repiten días y turnos. Cada opción ya incluye días y horario. Así, quien solo puede trabajar las noches de fin de semana no coincide con una búsqueda nocturna de lunes a sábado |
| C13 | Contrato | Garantía máxima que puede pagar | selección por tramos | No puedo pagar garantía; hasta $100.000; hasta $150.000; hasta $250.000; hasta $350.000; más de $350.000 | Sí | Variable M5 | No. Solo ve "cumple tu garantía: sí/no"** | Match y venta: casi todos los avisos de taxi y de autos para apps piden garantía |
| C14 | Contrato | ¿Tiene estacionamiento seguro para el vehículo? | sí / no | — | Sí | Variable M6 | Sí, marcado "declarado" | Match: requisito frecuente para cuidar el vehículo |
| C15 | Contrato | Estado | interruptor. La app pide reconfirmarlo cada 30 días; si el conductor no lo hace, lo pausa | Disponible; Pausado | Sí (parte en "Disponible") | Condición previa | No se muestra | Venta: el titular no paga por conductores que ya no buscan |
| C16 | Documentos | Cédula de identidad | archivo: foto del frente; el reverso solo si hace falta [verificar qué trae cada lado] | — | Sí | Condición previa (propuesta, P8) | El archivo nunca. Insignia "Cédula revisada el dd/mm/aaaa" | Verificación y venta: confirma que el nombre y el RUN corresponden a una cédula vigente. No prueba que quien usa la cuenta sea el dueño de la cédula (ver D1) |
| C17 | Documentos | Licencia de conducir | archivo: foto de los lados donde aparecen las clases y la fecha de control [verificar qué trae cada lado] | — | Sí | Condición previa (propuesta, P8). Confirma las clases de C7 | El archivo nunca. Insignia "Licencia revisada el dd/mm/aaaa · clases A2, B · próximo control mm/aaaa" | Ley, verificación y venta: confirma qué vehículos puede manejar |
| C18 | Documentos | Hoja de Vida del Conductor | archivo PDF, emitido hace 30 días o menos | — | **Condicional: solo si el abogado lo aprueba (P1)** | No | El archivo nunca. Insignia "Hoja de Vida revisada el dd/mm/aaaa". Qué significa "revisada" se define en P1 | Venta: es lo que más piden los titulares, pero tiene riesgo legal |

\* Solo si el método de inicio de sesión lo permite. Esa decisión técnica está pendiente. Aplica también a T6.
\*\* No se muestra el tramo por dos razones: no debilitar al conductor cuando negocia y pedir menos información sobre su situación económica [verificar con abogado si el tramo cuenta como dato sensible de "situación socioeconómica", P1].

### 1.1 Tipos de vehículo y licencias que habilitan (lo usan F2 y T9)

| Tipo de vehículo | Clases que habilitan |
|---|---|
| Auto o camioneta particular (chofer) | B [verificar si las clases A también habilitan para vehículos de clase B aunque la licencia no muestre la B; Ley 18.290, art. 12] |
| Auto para apps de transporte | Hoy B. Cuando rija la Ley 21.553, se cambia en el panel a licencia profesional (la clase exacta está por confirmar) [verificar] |
| Taxi (básico, ejecutivo o radiotaxi) | A1, A2, A3; A1 antigua (provisional) [verificar qué permiten las A1 y A2 antiguas] |
| Taxi colectivo | A1, A2, A3; A1 antigua (provisional) [verificar] |
| Transporte escolar | A3, A1 antigua |
| Minibús o van de pasajeros (10 a 17 asientos) | A2, A3 |
| Bus | A3. La A2 sirve hasta 32 asientos y 9 m, con 2 años de antigüedad; el MVP no distingue ese caso [verificar] |
| Ambulancia | A2, A3 |
| Furgón o camioneta de carga hasta 3.500 kg | B |
| Camión simple de más de 3.500 kg | A4, A5; A2 antigua (provisional) [verificar] |
| Camión articulado o tracto | A5 [verificar si la A2 antigua también habilita] |
| Moto de reparto | C |
| Maquinaria | D |

**Licencias antiguas:** se asignan de forma provisional. Según lo investigado, la A1 antigua sería de pasajeros y la A2 antigua de carga [verificar]. Si quedaran fuera de la tabla, el filtro F2 dejaría sin match justo a los conductores con más años de experiencia. Cuando se confirme, la tabla se corrige en el panel.

---

## 2. Perfil Titular

**Un solo perfil, con un selector "Persona natural / Empresa"** (propuesta, P2). Todo lo que entra al match es igual en los dos casos; solo cambian 2 campos (T4 y T5) y una verificación (T19). Así se construye y se mantiene un solo formulario.

**Búsquedas** (propuesta, P2). Los bloques Experiencia y Contrato del titular no van una sola vez en el perfil, sino en cada búsqueda. El titular sigue teniendo los 3 bloques: la cuenta tiene el bloque Personal / Empresa, y cada búsqueda tiene Experiencia y Contrato. El registro crea la primera búsqueda en el mismo flujo, así que quien tiene un solo vehículo no nota un paso extra.

En el titular, el bloque **Experiencia** es lo que le pide al conductor. En las notas del proyecto ese bloque figuraba "por confirmar".

| # | Bloque | Campo | Tipo | Opciones iniciales | Obligatorio | Uso en el match | Visible para el conductor después del match | Para qué |
|---|---|---|---|---|---|---|---|---|
| T1 | Personal / Empresa | Tipo de titular | selección | Persona natural; Empresa | Sí | No | Sí | Define qué campos se piden |
| T2 | Personal / Empresa | Nombre y apellidos de quien usa la cuenta | texto | — | Sí | No | Sí | Venta: el conductor sabe con quién habla |
| T3 | Personal / Empresa | RUN de quien usa la cuenta | texto, con revisión del dígito verificador | — | Sí | No | **No (solo el admin)** | Verificación: une la cuenta a una persona revisada. Es único por rol: la misma persona puede tener también una cuenta de conductor |
| T4 | Personal / Empresa | Razón social | texto | — | Solo empresa | No | Sí | Venta: el conductor sabe con qué empresa trata |
| T5 | Personal / Empresa | RUT de la empresa | texto, con revisión del dígito verificador | — | Solo empresa | No | Sí | Verificación y venta: el admin lo revisa en el SII, y el conductor también puede hacerlo |
| T6 | Personal / Empresa | Teléfono (WhatsApp) | teléfono +56, confirmado con código SMS* | — | Sí | No | Sí (depende de P10) | Contacto después del match |
| T7 | Personal / Empresa | Email | email | — | Sí | No | Sí (depende de P10) | Contacto, cuenta y cobro |
| T8 | Experiencia (por búsqueda) | Tipo de vehículo | selección única | Catálogo de la tabla 1.1 | Sí | Filtro F1 | Sí | Match: es la base del match |
| T9 | Experiencia (por búsqueda) | Licencia exigida | **automático**: sale de la tabla 1.1 y el titular no la llena | — | Automático | Filtro F2 | Sí | Ley: la Ley 18.290 fija qué clase exige cada vehículo; así el titular no se equivoca de clase |
| T10 | Experiencia (por búsqueda) | Años mínimos de experiencia | número (0 = sin mínimo; valor inicial 0) | — | Sí | Variable M4 | Sí | Match |
| T11 | Contrato (por búsqueda) | ¿Exige que el conductor tenga estacionamiento seguro? | sí / no | — | Sí | Variable M6 | Sí | Match: requisito frecuente |
| T12 | Contrato (por búsqueda) | Comuna donde se retira el vehículo | selección | Comunas de Chile, agrupadas por región | Sí | Filtro F3 y variable M2 | Sí | Match: zona |
| T13 | Contrato (por búsqueda) | Modos de contrato que ofrece | multiselección | Arriendo fijo; % de ganancia; % sobre producción | Sí | Variable M1 | Sí | Match |
| T14 | Contrato (por búsqueda) | Turnos | multiselección | Las mismas opciones de C12 | Sí | Variable M3 | Sí | Match |
| T15 | Contrato (por búsqueda) | Garantía exigida | número en pesos (0 = no exige) | — | Sí | Variable M5 | Sí | Match y venta: la piden casi todos los avisos de taxi y de apps |
| T16 | Contrato (por búsqueda) | Detalle de la oferta | texto, máximo 300 caracteres | Texto guía de ejemplo: "Nissan Versa 2022, entrega $17.000 diarios de lunes a sábado; bencina y TAG por cuenta del conductor" | Sí | No | Sí | Venta: el conductor necesita el monto para decidir. Reemplaza 5 o 6 campos (vehículo, monto, periodicidad, %, gastos); si prefieres el monto o el % en campos aparte, ver P7. El admin puede ocultar desde el panel textos discriminatorios que aparecen en avisos reales, como "mayor de 45 años" |
| T17 | Contrato (por búsqueda) | Estado de la búsqueda | selección | Activa; Pausada; Cubierta | Sí | Condición previa | No se muestra | Venta: no se entregan contactos para vehículos que ya tienen conductor |
| T18 | Documentos | Cédula de quien usa la cuenta | archivo: foto del frente; el reverso solo si hace falta [verificar qué trae cada lado] | — | Por definir (P12). Propuesta: sí | No | El archivo nunca. Insignia "Titular revisado el dd/mm/aaaa" | Verificación y venta: el conductor sabe que detrás de la búsqueda hay una persona real con cédula vigente. No prueba que el vehículo exista ni que sea suyo |
| T19 | Documentos | RUT de la empresa en el SII | **sin archivo**: el admin lo consulta | — | Solo empresa | No | Insignia "Empresa revisada en SII el dd/mm/aaaa" | Verificación: se revisa sin pedirle nada al cliente que paga |

---

## 3. Variables de match

**El match se decide en 3 pasos:**

1. **Condiciones previas.** Si falta una, no se calcula nada:
   - El conductor tiene la cédula y la licencia revisadas y vigentes (C16 y C17; propuesta, P8).
   - El conductor está "Disponible" (C15).
   - La búsqueda está "Activa" (T17).
2. **Filtros F1 a F3** (propuesta, P3). Un filtro es una condición que se cumple sí o sí. Si falla, no hay match aunque el resto dé 100 %.
3. **% con las 6 variables M1 a M6.** Hay match si el resultado llega al 80 %. Con 6 variables da lo mismo "más de 80 %" que "80 % o más" (P5).

**Cuándo se muestra el match.** El match se calcula siempre, pague o no el titular. La suscripción no decide si hay match, sino quién lo ve. Mientras el titular no tenga la suscripción al día, ninguna de las dos partes ve la ficha ni el contacto. Si el conductor sí los viera, podría contactar gratis a un titular que no paga. Si un titular sin suscripción ve o no un adelanto anónimo, lo decides en P11.

| # | Variable | Campo conductor ↔ Campo titular | Regla de coincidencia | Peso sugerido |
|---|---|---|---|---|
| F1 | Tipo de vehículo | C8 ↔ T8 | contiene: el tipo de la búsqueda está entre los que quiere manejar el conductor | Filtro |
| F2 | Licencia | C7 (solo clases revisadas) ↔ T9 | tienen al menos una clase en común | Filtro |
| F3 | Región | Región de C5 y C6 ↔ región de T12 | igual. Se calcula sola, sin campo extra | Filtro |
| M1 | Modo de contrato | C11 ↔ T13 | tienen al menos un modo en común | 1 |
| M2 | Zona | C5 + C6 ↔ T12 | la comuna de retiro está entre las comunas del conductor o en la misma zona que alguna de ellas. Si el conductor marcó "Cualquier comuna de mi región" (C6), siempre coincide | 1 |
| M3 | Turno | C12 ↔ T14 | tienen al menos un turno en común | 1 |
| M4 | Experiencia | C9 ↔ T10 | los años del conductor son iguales o mayores al mínimo (un mínimo de 0 siempre coincide) | 1 |
| M5 | Garantía | C13 ↔ T15 | la garantía exigida es igual o menor al tope del tramo del conductor. Una garantía exigida de $0 siempre coincide, y "más de $350.000" también | 1 |
| M6 | Estacionamiento | C14 ↔ T11 | si el titular lo exige, el conductor debe tenerlo; si no lo exige, coincide | 1 |

**Zonas (M2).** Comparar la comuna exacta haría fallar M2 en la mayoría de los casos. Por ejemplo, en la Región Metropolitana un conductor de Maipú no coincidiría con un vehículo en Cerrillos, que es una comuna vecina. Como solo se acepta 1 falla, M1, M3, M4, M5 y M6 tendrían que coincidir todas, y el titular que paga recibiría pocos matches.

Por eso propongo comparar por zona. Una zona es un grupo de comunas que se arma en el panel. Para partir, cada provincia sería una zona [verificar si en la Región Metropolitana conviene dividir la provincia de Santiago en zonas más chicas]. Lo decides en P6.

**Por qué hay filtros** (propuesta, P3). Con el 80 % siempre se puede fallar alguna variable, y esa podría ser justo la licencia. Por ejemplo, si la licencia fuera una séptima variable, un conductor con solo clase B que coincide en todo lo demás sacaría 6 de 7 (85,7 %) y haría match con un taxi, que exige clase A. El titular estaría pagando por un contacto que legalmente no puede manejar su vehículo. Lo mismo pasa con la región: sin el filtro, un conductor de Arica podría hacer match con un vehículo en Punta Arenas. Por eso propongo sacar del % lo que hace imposible o ilegal el acuerdo y dejar en el % lo que se puede negociar.

**Cuando la falla permitida es un "no".** Con el 80 % se acepta 1 falla. En algunas variables, que falle significa que una de las partes ya dijo que no:

- Si falla M1, el conductor no acepta ese modo de contrato.
- Si falla M5, el conductor no puede pagar la garantía, que es lo que protege al titular para que le devuelvan el vehículo.
- Si falla M3, el conductor no puede trabajar en ese turno.

En esos casos el titular paga por un contacto que no le sirve. En cambio, M2 (zona) y M4 (años) sí se pueden conversar. No lo decido aquí; lo defines en P4.

### Aritmética del 80 % con 6 variables de peso 1

El peso es cuánto vale cada variable dentro del %. Con peso 1 en todas, el cálculo es literalmente el "% de variables que coinciden".

| Coinciden | % | ¿Hay match con 80 %? |
|---|---|---|
| 6 de 6 | 100 % | Sí |
| 5 de 6 | 83,3 % | Sí |
| 4 de 6 | 66,7 % | No |

**Qué implica:**

1. **Se acepta que falle 1 de las 6 variables.** La ficha del match muestra cuál falla, por ejemplo "Coincide en 5 de 6 · no coincide: garantía", para que las partes conversen ese punto.
2. **Elegí 6 variables porque con 6 da lo mismo leer "más de 80 %" o "80 % o más".** Tú escribiste "más de un 80 %" y en las notas del proyecto quedó "80 % o más"; lo confirmas en P5. Con otras cantidades de variables, las dos reglas no siempre dan lo mismo:
   - **Con 5 variables:** "80 % o más" acepta 4 de 5, pero "más de 80 %" exige 5 de 5.
   - **Con 10 variables:** "80 % o más" acepta 2 fallas (8/10 = 80 %), pero "más de 80 %" solo 1.
   - **Con 4 variables o menos:** las dos reglas exigen que coincidan todas (por ejemplo, 3/4 = 75 %), y el % deja de servir. Esto importa si en P3 o P4 algunas variables pasan a ser filtro.
3. **Agregar variables no hace el match más flexible.** Con 7, 8 o 9 variables se sigue aceptando una sola falla. Para aceptar 2 fallas hay dos caminos:
   - Agregar variables: hacen falta 10 con "80 % o más" (8/10 = 80 %) u 11 con "más de 80 %" (9/11 = 81,8 %).
   - Bajar el umbral.
4. **El umbral avanza a saltos.** Con 6 variables:
   - Cualquier umbral entre 67 % y 83 % da exactamente el mismo resultado: se acepta 1 falla.
   - Un umbral mayor que 5/6 (83,33…%), por ejemplo 84 %, exige 6 de 6.
   - Para aceptar 2 fallas hay que bajar a 66 % o menos. Con 66,7 % no alcanza, porque 4/6 = 66,66…% queda justo debajo.

   Para que los decimales no engañen, el cálculo compara fracciones exactas: hay match si (peso de lo que coincide) × 100 ≥ umbral × (peso total). Si en P5 eliges "más de 80 %", la comparación es > en vez de ≥. El panel muestra el resultado como "N de M", con una frase como "con esta configuración se acepta que fallen N variables".
5. **Subir un peso vuelve obligatoria esa variable.** Con 6 variables, una variable que pesa más de 1,25 pasa a ser obligatoria en la práctica. Si en P5 eliges "más de 80 %", basta con que pese 1,25 o más. Por ejemplo, con la zona en peso 2:
   - Si falla la zona: 5/7 = 71 %, y no hay match.
   - Si falla otra variable: 6/7 = 86 %, y sí hay match.

   Si quieres que algo sea obligatorio, es más claro convertirlo en filtro. Por eso recomiendo peso 1 en todas.
6. **Lo que el titular no exige cuenta como coincidencia.** Es el caso de una garantía de $0, de no pedir un mínimo de años o de no exigir estacionamiento. El titular flexible recibe más matches; el exigente recibe menos, pero mejor filtrados.

---

## 4. Documentos a verificar en el MVP

**Método: revisión manual en el panel.** Una persona de tu equipo mira cada documento y lo aprueba o lo rechaza. No hay software de reconocimiento ni pagos a terceros.

**Flujo, igual para todos los documentos:**

1. El usuario sube el documento. Queda "pendiente" y entra a una cola en el panel, ordenada por antigüedad.
2. El admin lo ve junto a los datos que declaró el usuario. Lo aprueba, o lo rechaza eligiendo un motivo: ilegible; el nombre o el RUN no coinciden; vencido; otro. El usuario puede volver a subirlo.
3. Se guardan el estado, la fecha de revisión, la fecha de vencimiento y quién lo revisó, y se le avisa al usuario. La imagen se borra apenas se decide. El plazo por defecto es corto, es configurable y se define con el abogado (P1).
4. Cuando el documento vence, pasa a "vencido" y el conductor sale del match hasta renovarlo. Se le avisa unos días antes (P16).

**Conductor**

- **D1. Cédula (C16)**
  - Se pide solo el frente si trae el nombre, el RUN, el número de documento y el vencimiento. El reverso se pide solo si hace falta [verificar qué trae cada lado; si el reverso trae huella, sería un dato biométrico].
  - El admin compara el nombre y el RUN con C1 y C2.
  - Consulta la vigencia en el Registro Civil con el RUN y el número de documento (portal.sidiv.registrocivil.cl) [verificar URL actual].
  - Anota la fecha de vencimiento.
  - Resultado: insignia "Cédula revisada el dd/mm/aaaa". La insignia prueba que el nombre y el RUN corresponden a una cédula vigente, pero no que quien usa la cuenta sea el dueño de la cédula. Por eso, después del match, el titular ve el texto guía "Pide la cédula física al reunirte".
- **D2. Licencia (C17)**
  - El admin marca las clases que ve en la licencia. Las que el conductor declaró y no aparecen se borran de C7. Si la licencia es antigua, se aplica la asignación provisional de la tabla 1.1.
  - Anota la fecha del próximo control.
  - **No** anota las restricciones (por ejemplo, "usa lentes"), porque pueden ser un dato de salud. Como la foto sí las muestra, se pide solo el lado necesario y se borra apenas se decide [verificar qué lado trae las restricciones y si la licencia muestra el domicilio].
  - Resultado: insignia "Licencia revisada el dd/mm/aaaa · clases A2, B · próximo control mm/aaaa". La insignia no garantiza que la licencia siga vigente hasta el control: puede suspenderse o cancelarse antes, y la app no se enteraría.
  - **Límite:** es una revisión visual. Hay dos posibles vías gratis para validar la licencia en línea:
    - el QR de la licencia digital;
    - una consulta de bloqueo de licencia por RUT en registrocivil.cl [verificar ambas].

    Si la consulta por RUT sirve, el admin la repite cada 12 meses (configurable, P16). Si ninguna de las dos sirve, la mejora es D3.
- **D3. Hoja de Vida del Conductor (C18), solo si el abogado lo aprueba**
  - El conductor la saca gratis con su ClaveÚnica, en registrocivil.cl o en la app Civil Digital.
  - El admin lee el folio y el código del PDF y los valida en el verificador del Registro Civil (https://www.registrocivil.cl/OficinaInternet/verificacion/verificacioncertificado.srcei). El verificador funciona hasta 60 días después de la emisión; por eso se pide una Hoja de Vida emitida hace 30 días o menos.
  - **El criterio está por definir con el abogado (P1).** "Revisada" puede significar solo "es auténtica" o también "no tiene anotaciones graves":
    - Si el admin juzga el contenido, la app decide con datos de infracciones.
    - Si solo revisa la autenticidad, la insignia le dice poco al titular, que no ve el PDF.
  - Se guarda solo "revisada el dd/mm/aaaa" y se borra el PDF.
  - **Riesgo:** la Hoja de Vida trae infracciones graves y gravísimas, suspensiones y causas en el Juzgado de Policía Local. El art. 25 de la Ley 21.719 restringe el tratamiento de datos sobre infracciones penales, civiles, administrativas y disciplinarias [verificar con abogado].
  - **Alternativa sin ese riesgo para la app:** que el conductor le muestre la Hoja de Vida directamente al titular después del match, con el texto guía "Valida el folio y el código en registrocivil.cl". Es lo mismo que se propone para el certificado de antecedentes (sección 5).

**Titular**

- **D4. Cédula de quien usa la cuenta (T18):** se revisa igual que en D1. Resultado: insignia "Titular revisado el dd/mm/aaaa".
- **D5. Empresa (T19)**
  - El admin consulta el RUT en el SII, en "Situación tributaria de terceros". Es gratis y no pide clave; solo el RUT y un captcha.
  - Revisa que la razón social coincida y que la empresa tenga inicio de actividades.
  - El titular no sube ningún archivo.
  - Resultado: insignia "Empresa revisada en SII el dd/mm/aaaa".

**No se verifica en el MVP:** la experiencia (C9) y el estacionamiento (C14). Se muestran como "declarado".

**Archivos:** se guardan cifrados (protegidos con clave), solo los ve el admin y se borran apenas se decide. El plazo es configurable y se define con el abogado (P1).

**Avisos y consentimientos.** No son campos del perfil, pero son obligatorios. Van como casillas separadas. Falta verificar con el abogado cuáles son consentimientos y cuáles se informan como parte del servicio (base legal "ejecución de contrato") (P1).

1. Términos, política de privacidad y "declaro ser mayor de 18 años".
2. Compartir mi ficha y mi contacto con la contraparte cuando haya match. La ficha es todo lo que aparece en la columna "Visible … después del match".
3. Uso de mis documentos para revisarlos.

Además:

- **Lista "Quiénes recibieron mis datos"** en la cuenta del conductor, con los titulares que vieron su ficha. Sirve para el derecho a saber quiénes recibieron sus datos [verificar con abogado]. Si en P10 se decide que el conductor no ve el contacto del titular, es su única forma de saber quién tiene su teléfono.
- **Botón "Eliminar mi cuenta".**
  - Lo exige Apple (guía 5.1.1(v)).
  - Lo exige el derecho de supresión de la Ley 21.719.
  - Google Play además pediría un enlace web para solicitar el borrado [verificar].

La propuesta está pensada para la Ley 21.719, que rige desde el 1-dic-2026. El proyecto para postergarla (boletín 18.623-07) todavía no es ley [verificar su estado antes de lanzar].

---

## 5. Qué dejé fuera a propósito (para versiones futuras)

- **Certificado de antecedentes,** y el de inhabilidades para trabajar con menores en transporte escolar.
  - Tienen alto riesgo legal por el art. 25 de la Ley 21.719 [verificar con abogado].
  - En su lugar, después del match se muestra un texto guía: "Pídele su certificado de antecedentes y valida el folio y el código en registrocivil.cl". Así la app nunca toca ese dato.
- **Foto de rostro o selfie.**
  - Si se compara con software, es un dato biométrico, o sea sensible. Si la compara una persona a ojo, falta confirmar con el abogado si igual cuenta como biométrico.
  - Sin la foto, la insignia de la cédula solo dice "revisada", y el titular ve el texto guía "Pide la cédula física al reunirte".
  - Es el primer candidato a sumar si aparecen casos de suplantación.
- **Monto o % como variable de match**, es decir, comparar el máximo que paga el conductor con lo que ofrece el titular. Se mezclan pagos por día, semana y mes, y en la práctica se negocia. Por ahora va en T16; P7 pregunta si al menos se muestra como dato.
- **Campos detallados de la oferta:** marca, modelo y año; patente; monto y periodicidad; % ofrecido; quién paga cada gasto (combustible, TAG, mantención, seguro); límite de kilómetros; exclusividad con una app; días exactos; fecha de inicio. Por ahora todo va en T16.
- **Edad, fecha de nacimiento, sexo y nacionalidad.** Hay riesgo de discriminación: el art. 2 del Código del Trabajo considera discriminatorio exigir una edad en ofertas de empleo [verificar si aplica a un arriendo]. La mayoría de edad ya la cubren la licencia y la declaración.
- **Restricciones de la licencia:** pueden ser un dato de salud.
- **Comprobante de domicilio y dirección exacta.** La comuna basta para el match, y el titular puede pedirlos después.
- **Experiencia por tipo de vehículo, calificación y viajes en apps, y referencias.**
- **Documentos del vehículo:**
  - Padrón, certificado de anotaciones vigentes, revisión técnica, SOAP y permiso de circulación.
  - Inscripción en el registro del MTT para taxis, colectivos, buses y escolares.
  - Una patente que solo vea el admin permitiría probar que el vehículo existe. Se puede revisar gratis por la revisión técnica o el SOAP y, en taxis y colectivos, en el registro del MTT (apps.mtt.cl/consultaweb) [verificar].
- **Exigencias más finas del titular:** pedir clases más altas que el mínimo legal (por ejemplo, solo A2 para taxi) o indicar varias comunas de retiro por búsqueda.
- **Verificación automática:** por API de terceros, como Verifik [verificar precio y cobertura], o con el QR de la licencia digital [verificar si un tercero puede validarlo]. Conviene cuando haya más volumen del que se puede revisar a mano.
- **Match por distancia en kilómetros o GPS.**
- **Requisitos de la Ley 21.553,** como el registro de conductores de apps. La ley todavía no está vigente.
- **Lista de "casi match"** (entre 60 % y 79 %).
- **Chat, calificaciones entre las partes y plantillas de contrato.** Las plantillas tienen riesgo laboral, porque la app no debe aparecer como empleador.

---

## 6. Preguntas para la dueña

- **P1. Consulta al abogado.** Bloquea el lanzamiento, no solo C18: para publicar en las tiendas hace falta una política de privacidad publicada (Apple, guía 5.1.1(i); Google Play exige lo mismo [verificar]). Mientras tanto, la app se puede ir construyendo.
  - a) ¿La app puede tratar la Hoja de Vida (art. 25 de la Ley 21.719)? Si la respuesta es no, se lanza solo con cédula y licencia.
  - b) Si es sí, ¿se guarda solo el resultado y se borra el PDF?
  - c) ¿Qué significa "Hoja de Vida revisada": solo que es auténtica, o también que no tiene anotaciones graves? ¿O es mejor que el conductor se la muestre directamente al titular (alternativa de D3)?
  - d) Fotos de documentos: ¿cuánto tiempo se guardan y qué lados se piden? La licencia puede mostrar restricciones (dato de salud) y quizás el domicilio. La cédula trae la firma y quizás la huella (dato biométrico) [verificar].
  - e) ¿El tramo de garantía (C13) cuenta como dato socioeconómico?
  - f) Base legal: compartir la ficha y revisar documentos, ¿van por consentimiento o por "ejecución de contrato"? ¿Hace falta la lista "Quiénes recibieron mis datos"?
  - g) ¿Hace falta una evaluación de impacto (EIPD) por tratar documentos de forma masiva? [verificar]
  - h) ¿Hay transferencia internacional de datos si los servidores están fuera de Chile? [verificar]
  - i) El lenguaje de "acuerdo comercial" reduce la apariencia de relación laboral, pero no la evita si en la práctica hay subordinación. ¿Qué más hace falta?
  - j) Que revise los términos, la política de privacidad y los textos de los consentimientos.
- **P2. Perfil del titular y búsquedas.**
  - ¿Persona natural y empresa usan un solo perfil con selector, como propongo?
  - ¿Los bloques Experiencia y Contrato del titular van en cada búsqueda en vez de una vez en el perfil? Si dices que sí, el registro crea la primera búsqueda en el mismo flujo.
- **P3. Filtros:** ¿apruebas sacar del % el tipo de vehículo, la licencia y la región (F1 a F3)? ¿O prefieres que todo entre al %, aceptando casos como los ejemplos de la sección 3?
- **P4. ¿Qué variables se pueden negociar y cuáles impiden el acuerdo?** Propuesta de partida:
  - M2 (zona) y M4 (años) se pueden negociar.
  - M1 (modo de contrato), M3 (turno) y M5 (garantía) podrían ser filtros, porque si fallan suele ser un "no" explícito.

  Cada variable que pasa a filtro sale del %. Si quedan 5 variables, cambia lo que significa el 80 % (P5). Si quedan 4 o menos, el 80 % exige que coincidan todas.
- **P5. ¿"Más de 80 %" o "80 % o más"?** Tú escribiste "más de un 80 %". Con 6 variables da igual, pero importa si después se agregan o se quitan variables (ver sección 3).
- **P6. Zona (M2):** ¿se compara por comuna exacta o por zona? Si es por zona, ¿sirven las provincias como zonas iniciales, o prefieres armar otras (por ejemplo, dividir Santiago)?
- **P7. Monto o % de la oferta.** Hoy solo va en el texto libre T16, que el conductor ve después del match. ¿Agregamos al menos estos campos?
  - **Titular:** monto y periodicidad (día, semana o mes) si es arriendo fijo, o el "% para el conductor" si es un modo con %.
  - **Conductor (opcional):** el tope que acepta.

  Propuesta: al principio solo como dato visible en la ficha, no como variable, para no cambiar la aritmética.
- **P8. Verificación del conductor:**
  - ¿Solo entran al match los conductores con documentos revisados? Recomiendo que sí, porque eso es lo que se vende.
  - ¿Quién revisa los documentos y en qué plazo te comprometes (24 o 48 h)? Cada conductor requiere 2 revisiones manuales, o 3 si entra la Hoja de Vida.
- **P9. Definición de cada modo de contrato** (el texto que ve el usuario). Mi propuesta [verificar uso local]:
  - *Arriendo fijo:* el conductor paga un monto fijo por día, semana o mes y se queda con el resto.
  - *% de ganancia:* se reparte un % de lo recaudado **después** de descontar los gastos acordados.
  - *% sobre producción:* se reparte un % de lo recaudado **bruto**, antes de gastos.

  ¿El % es siempre lo que recibe el conductor?
- **P10. Contacto:**
  - Después del match, ¿el conductor también ve el teléfono y el email del titular (T6, T7), o solo el titular ve los del conductor?
  - ¿El conductor usa la app gratis?
- **P11. Titular sin suscripción.** El match se calcula igual, pero no se muestra. ¿El titular no ve nada, o ve un adelanto anónimo como "hay 8 conductores revisados para tu búsqueda"? El adelanto ayuda a vender y evita que alguien pague, encuentre 0 conductores en su zona y no renueve. Pero ¿cuenta como "acceso"?
- **P12. Verificación del titular (T18, T19):**
  - ¿Es obligatoria?
  - ¿Ve los contactos apenas paga (mi propuesta) o solo cuando ya está revisado?
  - ¿Se revisa antes de cobrar, para evitar reembolsos si se rechaza?
- **P13. ¿Cuántas búsquedas activas incluye la suscripción?** No es lo mismo una persona con un taxi que una flota de 20 autos. Esto define si las flotas pagan más.
- **P14. Cobro y factura.** Una suscripción que desbloquea contenido dentro de la app probablemente debe cobrarse con el sistema de pago de Apple y de Google (Apple, guía 3.1.1; política de pagos de Google Play) [verificar si aplica alguna excepción, como la guía 3.1.3]. Eso tiene dos efectos:
  - Las tiendas cobran comisión, y eso afecta el precio.
  - Las tiendas no piden RUT ni emiten factura chilena, y las flotas, que son el segmento que más paga, suelen necesitarla.

  ¿Se cobra dentro o fuera de la app? ¿Las empresas necesitan factura? Si la necesitan, hay que agregar el giro y la dirección tributaria al perfil del titular.
- **P15. Transporte escolar.** La ley exige revisar las inhabilidades para trabajar con menores (Ley 20.594; se consulta en inhabilidades.srcei.cl), y ese también es un dato sobre sanciones. ¿Se incluye desde el inicio, con un aviso para que lo revise el titular, o se espera la opinión del abogado?
- **P16. Plazos sugeridos** (todos editables en el panel):
  - Reconfirmar disponibilidad: 30 días.
  - Comunas extra del conductor: hasta 3.
  - Antigüedad máxima de la Hoja de Vida: 30 días.
  - Aviso antes de que venza un documento: 7 días.
  - Borrar las fotos de documentos después de decidir: plazo corto, a definir con el abogado (P1).
  - Repetir la consulta de bloqueo de licencia: cada 12 meses, si esa consulta existe (D2).
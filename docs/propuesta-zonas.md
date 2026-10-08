# Propuesta de zonas (grupos de comunas) para el match

> **Estado: PROPUESTA para revisión de la dueña.** Carga inicial; todo será editable desde el panel de administración.

**Qué es una zona.** Un grupo de comunas cercanas dentro de una misma región. En el match (variable M2), la zona del conductor (su comuna y sus comunas extra) se compara con la zona donde se retira el vehículo. La región ya es un filtro aparte (F3), así que las zonas nunca cruzan regiones.

**Cobertura.** 16 regiones · 81 zonas · 346 comunas (las 346 comunas de Chile; cada una en exactamente una zona, sin repetidas).

**Base.** En la Región Metropolitana se usan tus 4 zonas (Oriente, Poniente, Sur y Norte) más una Zona Centro y las provincias rurales. En el resto del país, en general, la conurbación de la capital regional es una zona y lo demás se agrupa por cercanía o provincia. Cada región trae sus dudas para que decidas.

**Cómo se armó.** Un agente propuso las zonas de cada grupo de regiones. Otro agente las verificó contra el listado oficial (conteo de comunas por región, pertenencia y escritura oficial) y después un script revisó los totales. La planilla con la misma información (región, zona, comuna) está en `docs/propuesta-zonas.csv`.

## Índice

- Arica y Parinacota (2 zonas)
- Tarapacá (2 zonas)
- Antofagasta (4 zonas)
- Atacama (3 zonas)
- Coquimbo (4 zonas)
- Valparaíso (8 zonas)
- Metropolitana de Santiago (9 zonas)
- Libertador General Bernardo O'Higgins (6 zonas)
- Maule (7 zonas)
- Ñuble (4 zonas)
- Biobío (6 zonas)
- La Araucanía (7 zonas)
- Los Ríos (4 zonas)
- Los Lagos (7 zonas)
- Aysén del General Carlos Ibáñez del Campo (4 zonas)
- Magallanes y de la Antártica Chilena (4 zonas)

## Arica y Parinacota

| Zona | Comunas | Criterio |
|---|---|---|
| **Arica y Camarones** | Arica, Camarones | Provincia de Arica. La ciudad de Arica concentra casi toda la población y casi todos los vehículos de la región. Camarones es rural, está al sur y se llega por la Ruta 5 desde Arica, así que el conductor que la atendería vive en Arica. |
| **Altiplano (Parinacota)** | Putre, General Lagos | Provincia de Parinacota. Son dos comunas del altiplano con poca población, conectadas entre sí y con Arica por la Ruta 11. Un conductor de la ciudad no iría a retirar un vehículo allá a diario, por eso quedan como zona aparte. |

**Dudas para decidir:**

- La región tiene solo 4 comunas y casi todo ocurre en Arica. ¿Prefieres una sola zona para toda la región, en lugar de separar el altiplano?
- ¿Camarones va con Arica (como está ahora) o con el altiplano? Es rural y está lejos de la ciudad, pero se llega por la Ruta 5 desde Arica.

## Tarapacá

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Iquique** | Iquique, Alto Hospicio | Conurbación de la capital regional: Iquique y Alto Hospicio forman una sola ciudad para efectos de traslado diario. |
| **Provincia del Tamarugal** | Pozo Almonte, Pica, Huara, Camiña, Colchane | Resto de la región, todo dentro de la provincia del Tamarugal: pampa (Pozo Almonte, Pica, Huara) y altiplano (Camiña, Colchane). Tiene poca población y se agrupa en una sola zona para no dejar zonas casi vacías. |

**Dudas para decidir:**

- ¿Separamos el altiplano (Colchane, Camiña) de la pampa (Pozo Almonte, Pica, Huara)? Están lejos entre sí, pero con dos zonas tan chicas habría muy pocos conductores en cada una.
- Pozo Almonte está relativamente cerca de Alto Hospicio y mucha gente se mueve a diario entre ambas. ¿La pasamos a Gran Iquique?

## Antofagasta

| Zona | Comunas | Criterio |
|---|---|---|
| **Antofagasta y alrededores** | Antofagasta, Mejillones, Sierra Gorda | Capital regional más las comunas cercanas de la provincia de Antofagasta: Mejillones por la costa al norte y Sierra Gorda, cuya localidad de Baquedano está más cerca de Antofagasta. Taltal se deja fuera porque está muy al sur. |
| **Calama y El Loa** | Calama, San Pedro de Atacama, Ollagüe | Provincia de El Loa. Calama es el centro urbano y minero del interior. San Pedro de Atacama y Ollagüe dependen de Calama para acceso y servicios. |
| **Tocopilla y María Elena** | Tocopilla, María Elena | Provincia de Tocopilla. Son dos comunas conectadas entre sí y lejos tanto de Antofagasta como de Calama. |
| **Taltal** | Taltal | Comuna aislada en el extremo sur de la región. Pertenece a la provincia de Antofagasta, pero está demasiado lejos de la capital para retirar un vehículo. Queda como zona propia. |

**Dudas para decidir:**

- Sierra Gorda tiene dos localidades separadas por unos 80 km: Baquedano (más cerca de Antofagasta) y Sierra Gorda pueblo (más cerca de Calama). La dejé con Antofagasta porque es su provincia. ¿La prefieres con Calama?
- ¿Taltal queda como zona propia (como está ahora) o se une a Antofagasta, aunque esté lejos?
- ¿Mejillones va con Antofagasta (como está ahora) o como zona propia?

## Atacama

| Zona | Comunas | Criterio |
|---|---|---|
| **Provincia de Copiapó** | Copiapó, Tierra Amarilla, Caldera | Capital regional, Tierra Amarilla (prácticamente pegada a Copiapó) y Caldera (en la costa, conectada a Copiapó por carretera). Es el área donde se mueve la mayoría de la población de la región. |
| **Provincia de Chañaral** | Chañaral, Diego de Almagro | Extremo norte de la región. Chañaral y Diego de Almagro (que incluye El Salvador) están lejos de Copiapó y conectados entre sí. |
| **Provincia de Huasco** | Vallenar, Freirina, Huasco, Alto del Carmen | Sur de la región, en torno a Vallenar. Huasco y Freirina están hacia la costa del mismo valle y Alto del Carmen hacia la cordillera, todos con acceso por Vallenar. |

**Dudas para decidir:**

- Caldera está en la costa y es también balneario. ¿Va con Copiapó (como está ahora) o en zona propia?
- ¿Alto del Carmen (rural, cordillerano) va con Vallenar o en zona aparte? Hoy está con Vallenar.

## Coquimbo

| Zona | Comunas | Criterio |
|---|---|---|
| **La Serena y Coquimbo** | La Serena, Coquimbo, La Higuera, Andacollo | Conurbación La Serena–Coquimbo, la principal de la región. Se suman La Higuera (al norte por la Ruta 5) y Andacollo (al interior), que dependen de la conurbación y se llega a ellas desde ahí. |
| **Valle de Elqui** | Vicuña, Paiguano | Interior de la provincia de Elqui, por la Ruta 41 desde La Serena. Vicuña es el centro del valle y Paiguano está más arriba en el mismo valle. |
| **Provincia de Limarí** | Ovalle, Monte Patria, Punitaqui, Río Hurtado, Combarbalá | Gira en torno a Ovalle, que es el centro de servicios. Monte Patria, Punitaqui, Río Hurtado y Combarbalá son rurales y se conectan con Ovalle. Se usa la provincia completa porque fuera de Ovalle hay poca población. |
| **Provincia de Choapa** | Illapel, Salamanca, Los Vilos, Canela | Sur de la región. Illapel y Salamanca forman el valle interior; Los Vilos y Canela, la costa junto a la Ruta 5. Se usa la provincia completa porque tiene poca población. |

**Dudas para decidir:**

- La Higuera y Andacollo son rurales y no forman parte de la conurbación. ¿Quedan con La Serena y Coquimbo (como está ahora) o en una zona rural aparte?
- Valle de Elqui tiene solo 2 comunas y Vicuña está relativamente cerca de La Serena. ¿Lo unimos a La Serena y Coquimbo?
- Combarbalá está lejos de Ovalle. ¿Lo dejamos en Limarí (su provincia, como está ahora) o en zona aparte?
- ¿Separamos Choapa en costa (Los Vilos, Canela) y valle interior (Illapel, Salamanca)? Los Vilos está sobre la Ruta 5 y queda más a mano para quien viaja por la carretera.
- Para la comuna de Elqui usé 'Paiguano', que es como aparece en el Código Único Territorial de la SUBDERE. La municipalidad y el uso común escriben 'Paihuano'. ¿Cuál mostramos en la app?

## Valparaíso

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Valparaíso** | Valparaíso, Viña del Mar, Concón, Quilpué, Villa Alemana, Casablanca | Conurbación de la capital regional, unida por la Troncal Sur, el Camino Troncal y el Merval: Valparaíso, Viña del Mar, Concón, Quilpué y Villa Alemana. Se suma Casablanca porque es de la Provincia de Valparaíso y llega por la Ruta 68. Es el mayor mercado de la región. |
| **Litoral Norte** | Quintero, Puchuncaví, Zapallar, Papudo | Comunas de la costa al norte de Concón, unidas por la ruta costera (Ventanas, Maitencillo, Cachagua, Zapallar, Papudo). Quintero y Puchuncaví quedan fuera de la conurbación, y además separarlas evita que a un conductor de Valparaíso o Quilpué le salgan vehículos a más de una hora. |
| **La Ligua y Petorca** | La Ligua, Cabildo, Petorca | Interior de la Provincia de Petorca (valles de La Ligua y Petorca). Son comunas rurales con poca población; La Ligua es su centro de servicios. |
| **Quillota y Limache** | Quillota, Calera, La Cruz, Hijuelas, Nogales, Limache, Olmué | Valle del Aconcagua bajo: Quillota con La Calera, La Cruz, Hijuelas y Nogales (unidas por la Ruta 5 y la Ruta 60), más Limache y Olmué, que quedan pegadas a Quillota aunque administrativamente pertenecen a Marga Marga. |
| **Aconcagua (San Felipe y Los Andes)** | San Felipe, Catemu, Llaillay, Panquehue, Putaendo, Santa María, Los Andes, Calle Larga, Rinconada, San Esteban | Valle del Aconcagua alto: provincias de San Felipe de Aconcagua y de Los Andes. San Felipe y Los Andes están muy cerca y funcionan como un solo polo (agroindustria, minería, paso a Argentina). |
| **Litoral Central (San Antonio)** | San Antonio, Cartagena, El Tabo, El Quisco, Algarrobo, Santo Domingo | Provincia de San Antonio completa: el puerto de San Antonio y los balnearios unidos por la costa (Cartagena, El Tabo, El Quisco, Algarrobo) más Santo Domingo. |
| **Isla de Pascua** | Isla de Pascua | Territorio insular sin conexión terrestre con el continente: tiene que ser una zona aparte. |
| **Juan Fernández** | Juan Fernández | Archipiélago sin conexión terrestre con el continente: tiene que ser una zona aparte. |

**Dudas para decidir:**

- Casablanca: ¿va en Gran Valparaíso (propuesta) o en Litoral Central (por cercanía con Algarrobo)? No pertenece a la conurbación.
- Quintero y Puchuncaví: ¿los dejamos en Litoral Norte (propuesta) o los pasamos a Gran Valparaíso, ya que mucha gente se mueve a diario hacia Concón y Viña del Mar?
- Zapallar y Papudo: ¿van en Litoral Norte (propuesta) o con La Ligua, completando la Provincia de Petorca? Papudo está muy cerca de La Ligua.
- Limache y Olmué: ¿con Quillota (propuesta) o con Gran Valparaíso? El Merval llega hasta Limache.
- Aconcagua: ¿una sola zona San Felipe + Los Andes (propuesta) o dos zonas, una por provincia?
- Isla de Pascua y Juan Fernández: ¿las dejamos activas en la app o desactivadas desde el panel hasta que haya demanda?
- Nombres oficiales distintos de los de uso común: en el listado SUBDERE/CUT figuran como 'Calera' (código 05502; se usa 'La Calera') y 'Llaillay' (código 05703; se usa 'Llay-Llay'). ¿Mostramos el nombre oficial o el de uso común? Recomiendo aceptar los dos en el buscador.

## Metropolitana de Santiago

| Zona | Comunas | Criterio |
|---|---|---|
| **Zona Centro** | Santiago | La comuna de Santiago (el centro histórico) queda sola porque no calza en ninguno de los cuatro puntos cardinales de la dueña y limita con todos. El conductor que vive en el centro puede agregar hasta 3 comunas extra (C6) y así coincidir con las zonas vecinas. Ver dudas. |
| **Zona Norte** | Conchalí, Huechuraba, Independencia, Quilicura, Recoleta, Renca | Comunas urbanas del Gran Santiago al norte del río Mapocho, que es como se entiende habitualmente el 'sector norte' de Santiago. No incluye Vitacura ni Lo Barnechea, que también quedan al norte del río pero son del sector oriente. Todas pertenecen a la provincia de Santiago y son contiguas. |
| **Zona Oriente** | La Reina, Las Condes, Lo Barnechea, Macul, Ñuñoa, Peñalolén, Providencia, Vitacura | Es el sector oriente/nororiente tradicional, al pie de la cordillera: Providencia, Las Condes, Vitacura, Lo Barnechea, La Reina, Ñuñoa y Peñalolén. Macul entra aquí porque limita con Ñuñoa y Peñalolén, aunque es una comuna de borde (ver dudas). Todas son urbanas y de la provincia de Santiago. |
| **Zona Poniente** | Cerrillos, Cerro Navia, Estación Central, Lo Prado, Maipú, Pudahuel, Quinta Normal | Es el sector poniente urbano del Gran Santiago, de Estación Central hacia Maipú y Pudahuel. Son comunas contiguas de la provincia de Santiago. |
| **Zona Sur** | El Bosque, La Cisterna, La Florida, La Granja, La Pintana, Lo Espejo, Pedro Aguirre Cerda, San Joaquín, San Miguel, San Ramón, Puente Alto, San Bernardo, Pirque, San José de Maipo | Junta el sector sur y el suroriente urbano del Gran Santiago. Incluye Puente Alto (provincia Cordillera) y San Bernardo (provincia de Maipo) porque están conurbadas con el resto del sur. Pirque y San José de Maipo se anexan aquí porque se llega a ellas por Puente Alto y, solas, serían una zona de dos comunas pequeñas con muy pocos matches. Es la zona más grande (14 comunas), así que habría que evaluar dividirla (ver dudas). |
| **Provincia de Chacabuco** | Colina, Lampa, Tiltil | La forman las 3 comunas completas de la provincia de Chacabuco, al norte del Gran Santiago. Quedan como zona aparte porque son periurbanas o rurales y tienen distancias mayores. Un conductor del Gran Santiago no siempre podría ir a Tiltil, y uno de Tiltil sí puede ir a Colina o Lampa. Quien viva aquí puede agregar comunas de la Zona Norte en C6. La alternativa de anexarlas a la Zona Norte está en dudas. |
| **Maipo Rural** | Buin, Paine, Calera de Tango | Son las comunas de la provincia de Maipo sin San Bernardo, que es urbana y quedó en la Zona Sur. Buin y Paine están en el eje de la Ruta 5 Sur. Calera de Tango se deja con ellas por ser de la misma provincia, aunque es un caso dudoso (ver dudas). |
| **Provincia de Talagante** | Talagante, El Monte, Isla de Maipo, Padre Hurtado, Peñaflor | La forman las 5 comunas completas de la provincia de Talagante, al surponiente del Gran Santiago. Están cerca entre sí y forman un grupo coherente fuera de la mancha urbana principal. Padre Hurtado y Peñaflor son casos de borde con Maipú (ver dudas). |
| **Provincia de Melipilla** | Melipilla, Alhué, Curacaví, María Pinto, San Pedro | La forman las 5 comunas completas de la provincia de Melipilla, en el extremo poniente. Es una de las provincias más rurales de la región y la segunda más extensa, después de Cordillera. Queda como una sola zona porque separarla dejaría zonas con muy pocos conductores. Curacaví es un caso dudoso (ver dudas). |

**Dudas para decidir:**

- Zona Centro: ¿se deja Santiago sola como 'Zona Centro', o prefieres sumarla a una de tus cuatro zonas? Otra opción es ampliar el Centro con comunas pericentrales, por ejemplo Estación Central, Independencia, Recoleta, San Miguel o Providencia. Una zona de una sola comuna da menos matches, aunque el conductor puede agregar comunas extra en C6.
- Zona Sur: quedó con 14 comunas. ¿La dividimos en 'Zona Sur' (San Miguel, San Joaquín, Pedro Aguirre Cerda, Lo Espejo, La Cisterna, El Bosque, San Ramón, La Granja, La Pintana, San Bernardo) y 'Zona Sur-Oriente' (La Florida, Puente Alto, Pirque, San José de Maipo)? En Santiago se suele hablar del 'sector suroriente'. Dividirla hace las distancias más razonables, pero reduce la cantidad de matches por zona.
- Macul: ¿va en Zona Oriente (limita con Ñuñoa y Peñalolén) o en Zona Sur (limita con San Joaquín y La Florida)? La propuse en Oriente.
- Pirque y San José de Maipo: las anexé a la Zona Sur porque se llega a ellas por Puente Alto. ¿Prefieres una zona aparte 'Cordillera' o 'Precordillera'? Serían solo dos comunas pequeñas.
- Provincia de Chacabuco: ¿se deja como zona aparte o se anexan Colina (Chicureo) y Lampa a la Zona Norte? En la práctica funcionan casi como parte del Gran Santiago. Tiltil está más lejos y la dejaría con ellas en cualquier caso.
- Maipo Rural: Calera de Tango está más cerca de San Bernardo que de Paine. ¿La movemos a la Zona Sur o a la provincia de Talagante? ¿Y Buin y Paine se dejan como zona propia o se anexan a la Zona Sur?
- Provincia de Talagante: Padre Hurtado y Peñaflor están casi conurbadas con Maipú. ¿Las movemos a la Zona Poniente o se quedan con Talagante?
- Provincia de Melipilla: Curacaví se conecta con Santiago por la Ruta 68 (lado Pudahuel) más que con la ciudad de Melipilla. ¿La dejamos con Melipilla o la anexamos a la Zona Poniente? Alhué y San Pedro son las comunas más rurales; confirmar que se quedan con Melipilla.
- General: para no tener que elegir entre zonas chicas (pocos matches) y zonas grandes (distancias largas), el panel podría definir 'zonas vecinas'. Por ejemplo, que Chacabuco también coincida con la Zona Norte. No está en el alcance aprobado: ¿te interesa evaluarlo o basta con las comunas extra del conductor (C6)?

## Libertador General Bernardo O'Higgins

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Rancagua** | Rancagua, Machalí, Graneros, Codegua, Mostazal, Olivar, Doñihue | Capital regional y comunas que viajan a diario a Rancagua: Machalí y Olivar (Gultro), que son conurbación, más Graneros, Codegua y Mostazal al norte por la Ruta 5 y Doñihue (Lo Miranda) al poniente. Corresponde al norte de la Provincia de Cachapoal. |
| **Cachapoal Sur (Rengo)** | Requínoa, Rengo, Malloa, Quinta de Tilcoco | Comunas al sur de Rancagua, en torno a Rengo y a la Ruta 5: Requínoa, Rengo, Malloa y Quinta de Tilcoco. |
| **Cachapoal Poniente (San Vicente–Peumo)** | Coinco, Coltauco, Las Cabras, Peumo, Pichidegua, San Vicente | Valle del Cachapoal hacia el poniente: comunas agrícolas en torno a San Vicente de Tagua Tagua y Peumo, más Coinco y Coltauco, que quedan en el camino hacia Rancagua. |
| **San Fernando** | San Fernando, Chimbarongo, Placilla, Nancagua | Oriente de la Provincia de Colchagua: San Fernando con las comunas cercanas en la Ruta 5 (Chimbarongo) y en el camino hacia Santa Cruz (Placilla, Nancagua). |
| **Valle de Colchagua (Santa Cruz)** | Santa Cruz, Chépica, Palmilla, Peralillo, Lolol, Pumanque | Poniente de la Provincia de Colchagua, con Santa Cruz como centro de servicios: valle vitivinícola y comunas rurales vecinas. |
| **Costa (Cardenal Caro)** | Pichilemu, Marchihue, La Estrella, Litueche, Navidad, Paredones | Provincia Cardenal Caro completa. Es costera, extensa y con poca población, con Pichilemu como centro; si se dividiera más, las zonas quedarían casi sin oferta. |

**Dudas para decidir:**

- Nancagua: ¿con San Fernando (propuesta) o con Santa Cruz? Está entre las dos.
- Coinco y Coltauco: ¿en Cachapoal Poniente (propuesta) o en Gran Rancagua? Son vecinas de Doñihue.
- San Vicente: ¿con Peumo y Pichidegua (propuesta) o con Rengo?
- Marchihue y Paredones: están en la Provincia Cardenal Caro, pero podrían quedar más cerca en la práctica de Peralillo, Lolol o Santa Cruz. ¿Las dejamos en Costa o las movemos al Valle de Colchagua?
- Mostazal: limita con Paine (RM) y mucha gente viaja a Santiago, pero la región es un filtro, así que no puede hacer match con la RM. ¿Aceptamos esa limitación?
- Nombres oficiales distintos de los de uso común: en el listado CUT figuran como 'Mostazal' (se usa 'San Francisco de Mostazal'), 'San Vicente' ('San Vicente de Tagua Tagua') y 'Marchihue' (código CUT 06204; la municipalidad y el uso local escriben 'Marchigüe'). ¿Qué nombre mostramos? Recomiendo aceptar las dos formas en el buscador.

## Maule

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Talca** | Talca, Maule, San Clemente, Pelarco, Pencahue, San Rafael, Río Claro | Capital regional: Talca y Maule (Culenar), que son conurbación, más las comunas cercanas desde donde se viaja a diario: San Clemente, Pelarco, Pencahue, San Rafael y Río Claro (Cumpeo). |
| **Costa de Talca (Constitución)** | Constitución, Empedrado, Curepto | Comunas costeras y del secano de la Provincia de Talca, con Constitución como centro. Están lejos de Talca (Curepto queda a unos 66 km por carretera), así que tiene sentido que sean una zona aparte. |
| **Gran Curicó** | Curicó, Molina, Teno, Romeral, Rauco, Sagrada Familia | Curicó y las comunas vecinas que se mueven hacia ella por la Ruta 5 o caminos cortos: Molina, Teno, Romeral, Rauco y Sagrada Familia. |
| **Costa de Curicó (Licantén)** | Hualañé, Licantén, Vichuquén | Valle bajo del Mataquito y la costa de la Provincia de Curicó (Hualañé, Licantén y Vichuquén con el lago Vichuquén e Iloca). Es rural y con poca población. |
| **Gran Linares** | Linares, Yerbas Buenas, Colbún, Longaví, Villa Alegre, San Javier | Linares y las comunas cercanas de su provincia: Yerbas Buenas, Colbún y Longaví, más San Javier y Villa Alegre al norte por la Ruta 5. |
| **Parral y Retiro** | Parral, Retiro | Sur de la Provincia de Linares, en torno a Parral por la Ruta 5. La separé de Linares para que la zona no se estire desde San Javier hasta Parral. |
| **Provincia de Cauquenes** | Cauquenes, Chanco, Pelluhue | Provincia completa: Cauquenes y la costa de Chanco y Pelluhue. Tiene poca población, así que dividirla dejaría zonas casi sin oferta. |

**Dudas para decidir:**

- Curepto: es de la Provincia de Talca y la dejé en Costa de Talca, pero no pude confirmar si queda más cerca en la práctica de Licantén (Costa de Curicó). ¿Dónde la ponemos?
- San Javier y Villa Alegre: quedan muy cerca de Talca y mucha gente viaja allá. ¿Las dejamos en Gran Linares (propuesta, por provincia) o las pasamos a Gran Talca?
- Río Claro: ¿con Gran Talca (propuesta) o con Gran Curicó por cercanía con Molina?
- Parral y Retiro: ¿las dejamos como zona aparte (propuesta) o las unimos a Gran Linares para que haya más oferta?
- Costa de Talca y Costa de Curicó: ¿las mantenemos separadas o las unimos en una sola 'Costa del Maule'?

## Ñuble

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Chillán** | Chillán, Chillán Viejo, Pinto, Coihueco | Capital regional: Chillán y Chillán Viejo, que son conurbación, más Pinto y Coihueco al oriente, que se mueven a diario hacia Chillán. Coihueco es de la Provincia de Punilla, pero queda más ligada a Chillán. |
| **Punilla (San Carlos)** | San Carlos, San Nicolás, Ñiquén, San Fabián | Provincia de Punilla en torno a San Carlos, sin Coihueco: San Nicolás, Ñiquén y San Fabián. |
| **Diguillín Sur (Bulnes–Yungay)** | Bulnes, Quillón, San Ignacio, El Carmen, Pemuco, Yungay | Resto de la Provincia de Diguillín, al sur y poniente de Chillán: Bulnes y San Ignacio, más cerca, y El Carmen, Pemuco, Yungay y Quillón. Son comunas rurales con poca población. |
| **Valle del Itata** | Quirihue, Cobquecura, Coelemu, Ninhue, Portezuelo, Ránquil, Treguaco | Provincia de Itata completa: secano interior y costa (Quirihue, Cobquecura, Coelemu, etc.). Es extensa, pero tiene poca población y poca oferta; partirla dejaría zonas casi vacías. |

**Dudas para decidir:**

- Bulnes y San Ignacio: quedan cerca de Chillán. ¿Las pasamos a Gran Chillán o las dejamos en Diguillín Sur (propuesta)?
- Quillón: ¿en Diguillín Sur (propuesta), en Valle del Itata (es vecina de Ránquil/Ñipas) o en Gran Chillán? Desde Quillón a Yungay hay bastante distancia.
- Coihueco: es de la Provincia de Punilla, pero la puse en Gran Chillán. ¿Está bien o la devolvemos a Punilla?
- Portezuelo: es de Itata pero queda cerca de Chillán. ¿La dejamos en Valle del Itata (propuesta) o la pasamos a Gran Chillán?
- ¿Partimos Diguillín Sur en dos ('Bulnes–Quillón' y 'Yungay–El Carmen–Pemuco') para acortar distancias, aunque cada zona tenga menos oferta?
- Nombre oficial: en el listado CUT figura como 'Treguaco' (código 16207), pero el municipio usa 'Trehuaco'. ¿Qué nombre mostramos? Recomiendo aceptar los dos en el buscador.

## Biobío

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Concepción** | Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Penco, Tomé, Hualqui, Coronel, Lota, Florida, Santa Juana | Conurbación de la capital regional (provincia de Concepción completa). Las 10 comunas del Gran Concepción están unidas por buses, Biotrén y autopistas. Florida y Santa Juana son rurales pero dependen de Concepción (unos 30 a 50 km; Santa Juana queda a unos 50 km) y no tienen otra comuna vecina más lógica. |
| **Arauco Norte** | Arauco, Curanilahue, Los Álamos, Lebu | Mitad norte de la provincia de Arauco: eje Arauco - Curanilahue - Los Álamos - Lebu (Ruta 160), a unos 25 a 40 km entre sí. |
| **Arauco Sur** | Cañete, Contulmo, Tirúa | Mitad sur de la provincia de Arauco, con Cañete como centro de servicios. Tirúa queda a más de 140 km de Arauco, por eso se separa del norte. |
| **Los Ángeles y alrededores** | Los Ángeles, Negrete, Nacimiento, Mulchén | Los Ángeles y las comunas a 20 a 35 km que dependen de ella por el sur y el poniente (Negrete, Nacimiento, Mulchén). |
| **Biobío Norte** | Cabrero, Yumbel, Laja, San Rosendo | Norte de la provincia de Biobío, en torno a la Ruta 5 y al río Laja: Cabrero, Yumbel, Laja y San Rosendo están a 15 a 30 km entre sí. |
| **Biobío Cordillera** | Tucapel, Antuco, Quilleco, Santa Bárbara, Quilaco, Alto Biobío | Precordillera y cordillera de la provincia de Biobío (Tucapel/Huépil, Antuco, Quilleco, Santa Bárbara, Quilaco, Alto Biobío). Es poco poblada y se accede desde Los Ángeles por los caminos hacia Antuco y el Alto Biobío. |

**Dudas para decidir:**

- Pregunta general para todas las regiones: ¿el conductor podrá marcar más de una zona (por ejemplo su zona y una vecina)? Si puede, las comunas limítrofes dejan de ser un problema y las zonas pueden ser más chicas.
- ¿Dividimos el Gran Concepción (cerca de 1 millón de habitantes) en 'Concepción Norte' (Talcahuano, Hualpén, Penco, Tomé) y 'Concepción Sur' (Concepción, Chiguayante, Hualqui, San Pedro de la Paz, Coronel, Lota), como en la RM? Hoy de Tomé a Lota hay unos 65 km.
- Florida y Santa Juana son rurales y quedan en lados opuestos (oriente y sur) del Gran Concepción. ¿Las dejamos en Gran Concepción o las sacamos?
- Los Álamos queda justo entre Lebu/Curanilahue y Cañete (unos 25 km de cada uno). Lo puse en Arauco Norte. ¿Te parece o lo prefieres en Arauco Sur? ¿O la provincia de Arauco debería ser una sola zona?
- Tucapel (Huépil) queda cerca de Cabrero (Biobío Norte) y también del camino a Antuco (Cordillera). Lo dejé en Cordillera. ¿Te parece?

## La Araucanía

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Temuco** | Temuco, Padre Las Casas, Lautaro, Perquenco, Cholchol, Galvarino, Freire | Conurbación Temuco - Padre Las Casas más las comunas cercanas que viajan a diario a Temuco por el norte y el poniente (Lautaro y Cholchol a unos 30 km, Perquenco a unos 43 km, Galvarino a unos 50 km) y por el sur (Freire, a unos 30 km). |
| **Costa Araucanía** | Nueva Imperial, Carahue, Saavedra, Teodoro Schmidt, Toltén | Costa de Cautín. Al norte, Nueva Imperial y Carahue son la puerta de entrada por el eje del río Imperial hacia Puerto Saavedra; al sur, Teodoro Schmidt y Toltén siguen la costa. A Toltén se llega desde Temuco por Pitrufquén (Ruta S-70), no por Nueva Imperial. |
| **Cautín Sur** | Pitrufquén, Gorbea, Loncoche | Eje de la Ruta 5 al sur de Temuco: Pitrufquén, Gorbea y Loncoche, a 15 a 25 km entre sí. |
| **Zona Lacustre** | Villarrica, Pucón, Curarrehue | Lagos Villarrica y Caburgua: Villarrica, Pucón y Curarrehue forman un solo eje turístico y de servicios. |
| **Precordillera** | Vilcún, Cunco, Melipeuco | Precordillera al oriente de Temuco (Vilcún, Cunco, Melipeuco), que se mueve hacia Temuco por caminos propios y no por la Ruta 5. |
| **Malleco Poniente** | Angol, Renaico, Los Sauces, Purén, Lumaco, Traiguén | Mitad poniente de la provincia de Malleco, con Angol como capital provincial: Renaico, Los Sauces, Purén, Lumaco y Traiguén. |
| **Malleco Oriente** | Victoria, Collipulli, Ercilla, Curacautín, Lonquimay | Mitad oriente de Malleco, en torno a Victoria y la Ruta 5 (Collipulli, Ercilla), más el eje cordillerano Curacautín - Lonquimay al que se llega desde Victoria. |

**Dudas para decidir:**

- Nueva Imperial está a unos 35 km de Temuco y mucha gente viaja a diario. La puse en Costa Araucanía por ser la puerta de la costa. ¿Prefieres que vaya en Gran Temuco?
- Galvarino está a unos 30 km de Traiguén (Malleco) y a unos 50 km de Temuco (pasando por Cholchol). Quedó en Gran Temuco. ¿Te parece?
- Freire podría ir en Gran Temuco (30 km) o en Cautín Sur, junto a Pitrufquén. Quedó en Gran Temuco. ¿Te parece?
- Loncoche está tanto en la Ruta 5 (Cautín Sur) como en el camino a Villarrica (Zona Lacustre). Quedó en Cautín Sur. ¿Te parece?
- Toltén se conecta con Temuco por Pitrufquén (Ruta S-70), no por Nueva Imperial ni Carahue. Quedó en Costa Araucanía por ser comuna costera. ¿Lo dejamos ahí o lo pasamos a Cautín Sur, junto a Pitrufquén?
- No tengo confirmado qué tan bien conectados están por camino Vilcún, Cunco y Melipeuco entre sí. Si Cunco se mueve más hacia Villarrica o hacia Temuco, la zona Precordillera podría desarmarse. ¿Lo revisas tú o alguien que conozca la zona?
- Traiguén está a unos 30 km de Victoria (Malleco Oriente) y a unos 50 a 68 km de Angol (Malleco Poniente), según la fuente; o sea, está más cerca de Victoria. Quedó en Malleco Poniente junto a sus vecinos Lumaco y Los Sauces. ¿Te parece o lo pasamos a Malleco Oriente?
- Son 7 zonas para una región de alrededor de 1 millón de habitantes. Si al principio hay pocos usuarios, ¿preferirías juntar zonas chicas (por ejemplo Cautín Sur con Gran Temuco, o Precordillera con Gran Temuco) para que haya más match?

## Los Ríos

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Valdivia** | Valdivia, Corral | Capital regional. A Corral solo se llega por Valdivia (camino o lancha), así que en la práctica forma parte del mismo mercado. |
| **Valdivia Norte** | Mariquina, Lanco, Máfil | Norte de la provincia de Valdivia, en torno a la Ruta 5 y San José de la Mariquina: Mariquina, Lanco y Máfil, a 20 a 35 km entre sí. |
| **Panguipulli y Los Lagos** | Panguipulli, Los Lagos | Zona de los lagos (Panguipulli, Riñihue) con Los Lagos como nudo en la Ruta 5. |
| **Ranco y Paillaco** | La Unión, Río Bueno, Futrono, Lago Ranco, Paillaco | Provincia del Ranco (La Unión, Río Bueno, Futrono, Lago Ranco) más Paillaco. Paillaco es de la provincia de Valdivia, pero queda en la Ruta 5 a unos 30 km de La Unión. |

**Dudas para decidir:**

- Paillaco está a unos 50 km de Valdivia, 25 km de Los Lagos y 30 km de La Unión. Lo puse con Ranco. ¿Prefieres que vaya con Gran Valdivia o con Los Lagos?
- Máfil podría ir con Valdivia Norte (Lanco) o con Los Lagos (25 km). Quedó en Valdivia Norte. ¿Te parece?
- Es una región chica (unos 400 mil habitantes) y algunas zonas tienen solo 2 comunas. ¿Prefieres menos zonas, por ejemplo 'Provincia de Valdivia' y 'Provincia del Ranco', o mantener estas 4?

## Los Lagos

| Zona | Comunas | Criterio |
|---|---|---|
| **Gran Puerto Montt** | Puerto Montt, Puerto Varas, Llanquihue, Frutillar, Cochamó | Puerto Montt con el eje del lago Llanquihue que viaja a diario a la ciudad (Puerto Varas a 20 km, Llanquihue y Frutillar). Al pueblo de Cochamó se llega por camino a través de Puerto Varas (Ensenada - Ralún); el sur de la comuna se une con Puerto Montt por la Carretera Austral y el transbordador Caleta La Arena - Caleta Puelche [verificar que Caleta Puelche pertenece a Cochamó]. |
| **Llanquihue Poniente** | Calbuco, Maullín, Los Muermos, Fresia | Poniente de la provincia de Llanquihue (Calbuco, Maullín, Los Muermos, Fresia): comunas rurales y costeras a 30 a 70 km de Puerto Montt y conectadas entre sí. |
| **Provincia de Osorno** | Osorno, San Pablo, San Juan de la Costa, Río Negro, Purranque, Puyehue, Puerto Octay | Provincia completa. Las 7 comunas giran en torno a Osorno, cuyas cabeceras están a 20 a 50 km de la ciudad, y la provincia tiene poca población fuera de Osorno. |
| **Chiloé Norte** | Ancud, Quemchi | Norte de la Isla Grande de Chiloé, en torno a Ancud (llegada desde el canal de Chacao). |
| **Chiloé Centro** | Castro, Dalcahue, Chonchi, Curaco de Vélez, Quinchao, Puqueldón | Castro y su entorno: Dalcahue y Chonchi por camino, y las islas Quinchao (Achao, Curaco de Vélez) y Lemuy (Puqueldón), a las que se llega en transbordador desde Dalcahue y Chonchi. |
| **Chiloé Sur** | Quellón, Queilén | Sur de la Isla Grande, en torno a Quellón (unos 90 km de Castro). |
| **Provincia de Palena** | Chaitén, Futaleufú, Palena, Hualaihué | Provincia completa (Chiloé continental). Es muy extensa y poco poblada, depende de transbordadores y la conexión entre comunas es difícil. Una sola zona evita zonas vacías. |

**Dudas para decidir:**

- Cochamó está lejos de Puerto Montt (unos 100 km por Ralún), pero no tiene un vecino mejor. ¿Lo dejamos en Gran Puerto Montt?
- Frutillar está a 45 km de Puerto Montt y a 60 km de Osorno. Lo dejé en Gran Puerto Montt. ¿Te parece? ¿O prefieres separar 'Puerto Montt' de 'Lago Llanquihue' (Puerto Varas, Llanquihue, Frutillar)?
- Calbuco tiene mucho movimiento diario con Puerto Montt (55 km). ¿Lo pasamos a Gran Puerto Montt?
- Hualaihué (Hornopirén) se conecta mejor con Puerto Montt (camino y transbordador corto) que con Chaitén. ¿Lo dejamos en Palena o lo pasamos a Gran Puerto Montt?
- Quemchi está a distancia parecida de Ancud y de Dalcahue/Castro. Queilén está a distancia parecida de Chonchi y de Quellón. ¿Te parece como quedaron?
- ¿La provincia de Osorno va como una sola zona o la dividimos (por ejemplo Osorno y alrededores / Purranque - Río Negro / Puyehue - Puerto Octay)?

## Aysén del General Carlos Ibáñez del Campo

| Zona | Comunas | Criterio |
|---|---|---|
| **Coyhaique y Puerto Aysén** | Coyhaique, Aysén | Eje urbano principal de la región (unos 65 km entre ambas ciudades, por camino pavimentado). Ahí vive la gran mayoría de la población. |
| **Aysén Norte** | Cisnes, Lago Verde, Guaitecas | Norte de la región (Carretera Austral norte y archipiélago): Cisnes (Puerto Cisnes, La Junta), Lago Verde y Guaitecas (Melinka, solo por mar). Son pocas personas y están dispersas. |
| **General Carrera** | Chile Chico, Río Ibáñez | Provincia de General Carrera, en torno al lago General Carrera (Chile Chico, y Puerto Ibáñez como puerto del transbordador). |
| **Capitán Prat** | Cochrane, O'Higgins, Tortel | Provincia de Capitán Prat, en el extremo sur de la Carretera Austral, con Cochrane como centro de servicios. |

**Dudas para decidir:**

- Río Ibáñez (Puerto Ibáñez, Villa Cerro Castillo) queda a unos 100 a 115 km de Coyhaique y también se conecta con Chile Chico por transbordador. Quedó en General Carrera. ¿Prefieres que vaya en Coyhaique?
- La región tiene alrededor de 100 mil habitantes. ¿Prefieres solo 2 zonas ('Coyhaique y Puerto Aysén' y 'Resto de Aysén') o 1 sola, para que el match no quede vacío?
- Escritura: uso 'Aysén' y 'Coyhaique'. Algunos listados públicos (CMF/SVS, SII) escriben 'Aisén' y 'Coihaique'. Hay que confirmar contra el listado oficial de SUBDERE al cargar los datos.

## Magallanes y de la Antártica Chilena

| Zona | Comunas | Criterio |
|---|---|---|
| **Punta Arenas** | Punta Arenas, Laguna Blanca, Río Verde, San Gregorio | Provincia de Magallanes completa. Punta Arenas concentra casi toda la población y las otras 3 comunas (Laguna Blanca, Río Verde, San Gregorio) son rurales, de estancias, y dependen de ella. |
| **Última Esperanza** | Natales, Torres del Paine | Provincia de Última Esperanza completa: Puerto Natales y Torres del Paine, a unos 250 km de Punta Arenas. |
| **Tierra del Fuego** | Porvenir, Primavera, Timaukel | Provincia de Tierra del Fuego completa (isla, se llega en transbordador). Porvenir es el centro. |
| **Antártica Chilena** | Cabo de Hornos, Antártica | Provincia Antártica Chilena: Cabo de Hornos (Puerto Williams) y Antártica. Están aisladas del resto y solo se puede llegar por mar o aire. |

**Dudas para decidir:**

- La comuna Antártica casi no tiene población civil permanente. ¿La dejamos cargada pero oculta en el selector, o visible?
- Las comunas rurales de Magallanes (Laguna Blanca, Río Verde, San Gregorio, Primavera, Timaukel) tienen muy pocos habitantes. ¿Mantenemos 4 zonas por provincia o juntamos todo lo que no es Punta Arenas o Natales?

## Correcciones hechas por el verificador

- Provincia de Melipilla (criterio): decía que es 'la más rural y extensa de la región', pero la más extensa es la provincia Cordillera, con unos 5.507 km² (San José de Maipo sola tiene unos 4.995 km²). Melipilla tiene unos 4.066 km² y queda segunda (censo 2017, según EcuRed: https://www.ecured.cu/Provincia_de_Melipilla y https://www.ecured.cu/Provincia_de_Cordillera). Ahora dice 'la segunda más extensa, después de Cordillera'. 'La más rural' se cambió a 'una de las provincias más rurales' porque no encontré datos que lo confirmen.
- Zona Norte (criterio): definía la zona como las comunas 'al norte del río Mapocho', pero Vitacura y Lo Barnechea también están al norte del río y quedaron en la Zona Oriente. Se agregó esa aclaración. No se movió ninguna comuna.
- Revisado sin cambios: hay 52 de 52 comunas, sin repetidas, sin inventadas y sin comunas de otra región. Por provincia: Santiago 32, Cordillera 3, Chacabuco 3, Maipo 4, Talagante 5 y Melipilla 5. La escritura (tildes y Ñ) coincide con el listado oficial, y todas las comunas están en una zona geográficamente razonable.
- Tiltil, revisado sin cambios: 'Tiltil' es la forma oficial vigente (INE/SUBDERE, código comunal 13303). 'Til Til' y 'Til-Til' son variantes de uso común o históricas y no se usan.
- Valparaíso / zona 'Litoral Norte': eliminé el campo 'name_hint' (vacío), que sobraba y no forma parte de la estructura de zona (nombre, criterio, comunas). No cambia ninguna comuna.
- O'Higgins / duda de nombres oficiales: reescribí la parte de Marchihue. El código CUT 06204 aparece como 'Marchihue' en los listados de códigos (Minagri, SINIM/INE); 'Marchigüe' es la forma que usan la municipalidad y algunas tablas (por ejemplo, la de SUSESO). Se mantiene 'Marchihue' en la zona y se agrega la recomendación de aceptar las dos formas en el buscador. Antes, la duda decía que las fuentes no coincidían.
- Valparaíso y Ñuble / dudas de nombres oficiales: agregué los códigos CUT que confirman los nombres oficiales: Calera 05502, Llaillay 05703 y Treguaco 16207 (SINIM y Banco Mundial). Las comunas siguen igual.
- Verificación sin otros cambios: la lista de comunas de cada provincia coincide con la división oficial. Valparaíso tiene 38 (Valparaíso 7, Isla de Pascua 1, Los Andes 4, Petorca 5, Quillota 5, San Antonio 6, San Felipe de Aconcagua 6, Marga Marga 4); O'Higgins, 33 (Cachapoal 17, Cardenal Caro 6, Colchagua 10); Maule, 30 (Talca 10, Cauquenes 3, Curicó 9, Linares 8); Ñuble, 21 (Diguillín 9, Itata 7, Punilla 5). No hay comunas repetidas, faltantes, inventadas ni de otra región. Las tildes y la Ñ están bien escritas. No encontré ninguna comuna claramente mal ubicada; los casos limítrofes ya están en 'dudas'. El dato 'Curepto a unos 66 km de Talca por carretera' coincide con Rome2Rio (66,4 km).
- Biobío / Gran Concepción (criterio): se cambió 'Florida y Santa Juana dependen de Concepción (35 a 45 km)' por 'unos 30 a 50 km; Santa Juana queda a unos 50 km'. Motivo: las fuentes ubican Santa Juana a unos 50 a 52 km de Concepción, no a 45 como máximo.
- La Araucanía / Gran Temuco (criterio): se quitó 'comunas a 25 a 35 km' y se puso la distancia de cada comuna: Lautaro, Cholchol y Freire a unos 30 km, Perquenco a unos 43 km y Galvarino a unos 50 km. Motivo: Perquenco y Galvarino quedan bastante más lejos que 35 km de Temuco. La comuna no se mueve; solo se corrige el dato.
- La Araucanía / Costa Araucanía (criterio): el texto decía que Nueva Imperial y Carahue eran la puerta de entrada a Teodoro Schmidt y Toltén por el eje del río Imperial. Se corrigió: ese eje solo lleva a Puerto Saavedra, y a Toltén se llega desde Temuco por Pitrufquén (Ruta S-70). Toltén sigue en la zona, porque agruparla con la costa es un criterio válido, y se agregó una duda para que la dueña decida si pasa a Cautín Sur.
- La Araucanía (duda sobre Galvarino): se agregó que Galvarino queda a unos 50 km de Temuco, además de los unos 30 km a Traiguén. Así la dueña puede comparar las dos opciones con los datos completos.
- La Araucanía (duda sobre Traiguén): se corrigió 'casi a igual distancia de Victoria y de Angol'. Según las fuentes, Traiguén está a unos 30 km de Victoria y a unos 50 a 68 km de Angol, o sea, más cerca de Victoria. Se mantiene en Malleco Poniente porque limita con Lumaco y Los Sauces, que también están en esa zona, así que no está claramente mal ubicado. La pregunta a la dueña queda con los datos correctos.
- La Araucanía (duda sobre el número de zonas): se corrigió la errata 'Son 7 zones' por 'Son 7 zonas'.
- Los Lagos / Gran Puerto Montt (criterio): se quitó 'Cochamó solo se conecta por camino a través de Puerto Varas'. Motivo: además de llegar por Ensenada - Ralún, la comuna se une con Puerto Montt por la Carretera Austral y el transbordador Caleta La Arena - Caleta Puelche, que lleva [verificar] porque no encontré una fuente oficial que confirme que Caleta Puelche pertenece a Cochamó. La comuna no se mueve.
- Verificado sin cambios: los conteos y la región de cada comuna coinciden con el listado oficial (Biobío 33, La Araucanía 32, Los Ríos 12, Los Lagos 30, Aysén 10, Magallanes 11). No hay comunas repetidas, faltantes, inventadas ni de otra región. Ojo: la comuna Los Lagos pertenece a la Región de Los Ríos y está bien ubicada ahí. La escritura usa las formas oficiales vigentes; las variantes son 'Alto Bío Bío' por Alto Biobío, 'Chol Chol' por Cholchol, 'Puerto Saavedra' por Saavedra, 'San José de la Mariquina' por Mariquina, 'Aisén/Coihaique' por Aysén/Coyhaique (en SII), 'Caleta Tortel' por Tortel, 'Puerto Natales' por Natales y 'Navarino' (antiguo) por Cabo de Hornos. También se confirmó que La Junta pertenece a la comuna de Cisnes, como dice el criterio de Aysén Norte.

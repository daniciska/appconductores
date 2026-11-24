# Registro de decisiones del proyecto

> Solo agregar al final. No reescribir lo anterior. Una decisión = pocas líneas.

Quiénes trabajan en el proyecto: **Daniela** y **Mario**, socios. Cada entrada lleva la fecha y el nombre de quien la registra.

## 2026-11-16 — Daniela
- Decisión: qué se decidió
- Por qué: la razón / qué alternativas se descartaron
- Impacto: qué archivos o partes del proyecto toca
- Pendiente: qué queda abierto

## 2026-11-16 — Daniela
- Decisión: el proyecto se trabaja entre dos personas (Daniela y Mario, socios), cada una con su propio Claude Code sobre el mismo repositorio. Al abrir se trae lo último de git; al cerrar ("hasta aquí por hoy", "ciérrate sésamo" o "terminamos") se registra lo relevante, se muestra qué se sube y se sube solo con OK.
- Por qué: para que los dos trabajen sin pisarse y cada uno sepa qué decidió el otro y por qué.
- Impacto: CLAUDE.md (sección "Trabajo compartido en equipo"), .claude/settings.json (hook al iniciar), docs/decisiones.md (este diario).
- Pendiente: nada.

## 2026-11-16 — Daniela
- Decisión: se trabaja siempre desde main y lo publicado en Netlify es main. Toda construcción nueva va en una rama aparte: construir, probar, simplificar, aprobar, mergear a main y publicar. Además hoy: se encendieron Transporte por aplicación (licencia B) y Moto delivery (licencia C); "entrar con clave" quedó pendiente; la construcción está en pausa hasta aprobar la carta Gantt.
- Por qué: main es siempre lo que está funcionando; lo nuevo se prueba aparte antes de llegar a la app real. Los negocios B y C evitan que quien no tiene licencia profesional quede sin poder terminar su registro.
- Impacto: CLAUDE.md, docs/plan.md, docs/carta-gantt.html, la base en Supabase (negocios activos) y los dos sitios de Netlify.
- Pendiente: aprobar la carta Gantt; preguntar al abogado por la Ley 21.553 (A40); definir las reglas de "entrar con clave".

## 2026-11-16 — Daniela
- Decisión: Daniela y Mario son dueños y socios. Cualquiera de los dos puede hacer y aprobar todos los cambios (decidir, aprobar maquetas, mergear a main y publicar), de forma independiente del otro.
- Por qué: para que ninguno quede esperando al otro para avanzar.
- Impacto: CLAUDE.md (reglas de trabajo, decisión "Dueños", ciclo de ramas, sección de trabajo en equipo y "la dueña" → "Daniela" en lo ya decidido).
- Pendiente: nada.

## 2026-11-17 — Daniela
- Decisión: un probador (dos conductores ficticios, Don Luis y Camila) y un simplificador recorrieron la app real del conductor. Salieron 14 propuestas de mejora con maquetas de antes y después, para decidir en https://claude.ai/artifact/KtNuX518aQZmU9YXjg4183 (Aprobar / Ajustar / No).
- Por qué: encontrar dónde se traban los conductores antes de abrir la app a personas reales; Don Luis necesitó 56 toques para llegar a Inicio.
- Impacto: ninguno en main ni en lo publicado. El código de las 14 queda en la rama mejoras-probador-simplificador.
- Pendiente: que Daniela o Mario decidan cada propuesta (S07 y S12 cambian decisiones; S05 tiene un problema en el teclado del celular). Después: dejar en la rama solo lo aprobado, probar de nuevo, mergear a main y publicar.

## 2026-11-24 — Daniela
- Decisión: la decisión de Trello de Mario (16-nov) y las ramas antiguas claude/bold-shannon-76cagx (29-oct) y claude/gifted-cori-hbgjz1 (2-nov) quedan en sus ramas, sin llevarlas a main por ahora.
- Por qué: se revisan más adelante; mientras tanto, lo vigente es lo que está en main.
- Impacto: ninguno en main. La regla de Trello no está en CLAUDE.md de main.
- Pendiente: decidir más adelante si se integran o se descartan.

## 2026-11-24 — Daniela y Mario
- Decisión: no hay mensajes entre conductores y titulares. Con el match, el titular **con plan** ve el contacto (teléfono y correo) de los conductores que calzan; **sin plan** solo ve cuántos le harían match. El conductor ve el contacto del titular solo si el titular decide mostrárselo. La bolsa se adapta: al postular, el titular con plan ve el contacto del postulante. Se puede **reportar en las dos direcciones** (conductor → titular y titular → conductor); se saca "Bloquear". Verificación del titular (P12): cédula de quien usa la cuenta y, si es empresa, revisión del RUT en el SII. Se construye ahora el **prototipo del titular en la demo** (datos de ejemplo), en rama aparte.
- Por qué: simplificar el producto y llevar al titular directo al contacto, que es lo que paga.
- Impacto: CLAUDE.md (se reemplaza "Mensajes dentro de la app", se ajusta P10, se agregan Reportar y verificación del titular), demo del conductor (sin Mensajes ni Bloquear), prototipo del titular en `aplicacion/` y, más adelante, la Etapa 3 de la base (sin tablas de mensajes).
- Pendiente: la sección de match del conductor, con tres opciones (no disponible / cualquier trabajo / solo ciertos trabajos con filtros como antigüedad, combustible, particular o empresa): qué filtros entran y si son obligatorios.

## 2026-11-24 — Daniela y Mario
- Decisión: flota del titular. Por cada vehículo se pide patente, tipo, marca y modelo, color, año, kilometraje, padrón, revisión técnica y SOAP. Cada búsqueda elige vehículos de la flota y sin vehículos no se publica. Revisa el equipo (documentos y patente en el registro del MTT). El conductor ve tipo, año, color y "revisado". Avisos antes de vencer; vencido, sale del match. Vehículos por plan configurables: 1, 5 y 20. Además: clave nueva de la demo y sitio de prueba `dale-contacto-prueba`.
- Por qué: dar confianza al conductor de que detrás de cada búsqueda hay un vehículo real y al día, y vender planes por tamaño de flota. La clave anterior se perdió.
- Impacto: demo del titular y del conductor, estado de la demo (versión 6), CLAUDE.md y documentos; más adelante, la Etapa 2 de la base (tabla de vehículos).
- Pendiente: límites definitivos por plan, lista completa de marcas, servicio pagado por patente (costo y legalidad), canal de los avisos de vencimiento y si el sitio de prueba queda público.

## 2026-11-24 — Daniela y Mario
- Decisión: el prototipo del titular, la flota y la clave nueva se aprobaron, se mergearon a `main` y el mockup se publicó desde `main`. El sitio `dale-contacto-prueba` queda público con la clave de la demo, para revisar las próximas ramas.
- Por qué: dejar lo aprobado publicado y tener dónde probar en el celular antes de aprobar.
- Impacto: el mockup y /panel piden la clave nueva; la anterior ya no sirve. La app real del conductor no cambió.
- Pendiente: probar y simplificar (siguiente paso, no empezado) y, después, la Etapa 2 de la base.

## 2026-11-24 — Daniela
- Decisión: se aprueban y juntan para pasar a main las 3 ramas del 24-nov: mejoras del probador y el simplificador (S01–S14 con sus ajustes y enlaces legales aparte), documentos (Paso 5 con Storage privado, método que aprueba todo, vencimientos, aviso 3 meses antes, "Antes de empezar" con 2 casillas y la autorización de documentos prueba-2 pedida en el Paso 5, tope de 12 archivos; el borrado del servidor queda para el panel) y "Letra grande". Además, "Letra grande" también va en la pantalla del celular (A2, primera del registro), con el mismo estilo que en la Bienvenida y Perfil.
- Por qué: dejar listo para el lanzamiento lo ya aprobado; quien necesita letra grande tiene que poder elegirla antes de escribir su número.
- Impacto: rama integracion-24nov (sin tocar main). Al juntarlas: la migración S12 solo apaga las versiones prueba-1 (así no puede apagar la prueba-2); Inicio sin el texto "pronto podrás subir aquí"; "Letra grande" en A2 va arriba, al lado de "Volver" (el teclado se abre solo al entrar y lo tapaba abajo); los días del Paso 4 pasan a 2 filas en celulares angostos (botones de 44 px o más). Ajustes de Claude al integrar, que no venían en las ramas aprobadas y quedan por confirmar por Daniela o Mario: (1) la base también exige el Paso 3 con al menos un vehículo para dar el perfil por completo, igual que la app desde S07 (antes la base lo daba por completo sin él); (2) en el Centro de ayuda de la app real vuelve "¿Quién ve mis documentos?" con la respuesta "Solo tú y el equipo de Dale Contacto. Los titulares nunca ven tus archivos." (no habla de una revisión de una persona, que hoy no ocurre); la pantalla para subir cada documento dice lo mismo: "Solo tú y el equipo de Dale Contacto ven este archivo. Nunca se muestra a los titulares." (la demo mantiene sus textos, porque simula esa revisión); (3) "Letra grande" en A2 va en una sola línea arriba, al lado de "Volver", con el mismo borde, el ícono "Aa" y el interruptor, pero sin la frase "Agranda toda la app.", para que el teclado no la tape.
- Pendiente: confirmar los 3 ajustes de Claude de arriba; revisar y mergear integracion-24nov a main; aplicar en Supabase, en este orden, 20261124120000_experiencia_ejemplo_taxi, 20261124120100_autorizaciones_solo_dos, 20261124120200_ajuste_aviso_reconfirmar y 20261124150000_documentos_conductor; publicar en Netlify desde main; abogado (Términos, Política, A63–A67).

## 2026-11-24 — Daniela
- Decisión: se pasó a main la integración del 24-nov: las mejoras aprobadas del probador y simplificador (S01–S14), los documentos del conductor (Paso 5: los 4 documentos, aprobación automática por ahora, fecha de vencimiento confirmada al subir y aviso 3 meses antes) y la Letra grande (también en la primera pantalla, junto a "Volver"). Se juntó con lo que Mario subió el mismo día (titular, flota, sin mensajes): en la demo sale la casilla de mensajes de "Antes de empezar", y las pantallas del titular respetan la Letra grande.
- Por qué: dejar funcionando y listo para el lanzamiento lo aprobado, sin perder el trabajo de ninguno de los dos.
- Impacto: main (commit 28549ee). El perfil completo exige el Paso 3 con al menos un vehículo. OJO: main todavía NO está publicado en Netlify, porque la app nueva necesita 4 migraciones que aún no se aplican en Supabase (la conexión de Supabase de esta sesión no ve el proyecto de Dale Contacto). Lo publicado sigue siendo la versión anterior y funciona normal. Mientras tanto, no publicar main en Netlify.
- Pendiente: reconectar Supabase con la cuenta dueña de Dale Contacto; aplicar las 4 migraciones en orden (experiencia_ejemplo_taxi, autorizaciones_solo_dos, ajuste_aviso_reconfirmar, documentos_conductor); publicar la app y el mockup; probar en vivo subiendo un documento. Decidir si "Antes de empezar" de la demo queda con 3 casillas o con 2. Después: el método real de revisión de documentos, los Términos con el abogado, probar en celulares reales y borrar los números y la cuenta de prueba antes del lanzamiento.

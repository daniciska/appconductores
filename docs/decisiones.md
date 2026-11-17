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

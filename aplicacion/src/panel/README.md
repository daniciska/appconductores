# Panel de administración (guardado, en espera)

**El panel no se muestra en el mockup** (pedido de la dueña, 7-nov). Su código queda guardado aquí, sin borrar, **hasta decidir si el panel será una app distinta** de la de conductores y titulares.

- No es parte de la demo publicada: nada fuera de esta carpeta lo importa y aquí no hay rutas de expo-router (las rutas viven solo en `src/app/`), así que no entra en el sitio exportado (`dist/`).
- Sigue compilando con el resto (`npm run typecheck`), para que no se eche a perder mientras espera.
- En la demo, lo que hacía una persona del equipo en el panel ahora se simula solo (`src/datos/simulacion.ts`): la Hoja de Vida y los antecedentes se aprueban a los ~12 s de quedar "En revisión". Para ver un documento no aprobado está el atajo "Documento no aprobado" en el menú de la demo.

## Qué hay

- `rutas/`: lo que antes era `src/app/admin/` (el layout con el menú y un envoltorio por sección). Hoy no son rutas.
- `pantallas/`: lo que antes era `src/pantallas/admin/` (Resumen, Documentos, Conductores, Reportes, Reglas del match, Catálogos, Zonas y comunas, Ajustes, Equipo).
- `marco.tsx`: el marco del panel (barra lateral o menú), que antes estaba en `src/ui/panel.tsx`.
- `enlaces.ts`: arma los enlaces entre secciones (`rutaPanel('documentos')`) con el prefijo `/admin`. Si el panel pasa a su propia app, se cambia ahí.

## Qué usa de afuera

Lee y cambia la tienda de la demo (`src/datos/tienda.ts`: las acciones de la sección "Panel de administración"), los selectores y hooks del panel (`colaDocumentos`, `resumenPanel`…), el motor del match, el sistema de diseño (`src/ui`) y los textos de documentos del conductor (`src/pantallas/documentos/textos.ts`). Tiene tres botones que abren la app del conductor ("Ver como conductor", "Abrir la app del conductor", "Ver en la app"): solo sirven dentro del mockup.

## Para volver a mostrarlo (si se decide)

- **Dentro del mockup:** mover `rutas/` a `src/app/admin/`, volver a exportar `marco.tsx` si se quiere desde `@/ui`, y poner otra vez la entrada en el menú de la demo (`src/pantallas/ingreso/SelectorDemo.tsx`).
- **Como app aparte:** otro proyecto Expo web que comparta `src/ui`, `src/datos` (tipos y motor del match) y estas pantallas, con `PREFIJO_PANEL = ''`. Ojo: en otro dominio no comparte lo guardado en el navegador con el mockup.
- **Panel real:** las acciones de la tienda pasan a consultas de Supabase con permisos (RLS) y el ingreso del equipo se revisa con `miembros_equipo` (Etapa 1 de la base).

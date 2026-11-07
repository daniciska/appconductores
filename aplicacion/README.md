# Dale Contacto · demo navegable

Mockup funcional de **Dale Contacto** para **mockup.dalecontacto.cl**: conductor completo (ingreso, registro en 5 pasos, documentos, matches, mensajes y perfil) y bolsa de trabajo (conductor y titular).

**El panel de administración no se muestra en el mockup** (pedido de la dueña, 7-nov). Su código queda guardado en `src/panel/` hasta decidir si será una app distinta. En la demo, la revisión que hacía una persona del equipo se simula sola: la Hoja de Vida y los antecedentes se aprueban unos 12 segundos después de quedar "En revisión". Para ver un documento no aprobado, usa el atajo "Documento no aprobado" del menú de la demo.

- Hecho con la tecnología de la app: **Expo + expo-router + TypeScript**, salida web de una sola página.
- Funciona con **datos de ejemplo**: lo que se escribe queda solo en el navegador (`localStorage`, clave `dale-demo-datos`; lo que había en la clave anterior, `dale-demo-v1`, se trae una sola vez). No envía códigos ni guarda datos en Supabase. Una pestaña abierta con una versión anterior de la demo no pisa lo de la nueva: sigue con lo suyo hasta que se recarga.
- Los catálogos (regiones, zonas, comunas, licencias, negocios…) son los mismos de la base de datos; titulares, búsquedas y conductores son ficticios.

## Correr

```bash
npm install
npm run web          # abre la demo en el navegador (modo desarrollo)
```

## Comprobar

```bash
npm run typecheck    # TypeScript sin errores
npm run test:match   # pruebas del motor del match y de cómo se guarda la demo
```

Las rutas tienen tipos (`.expo/types/router.d.ts`, se genera solo). Si mueves o borras una ruta, corre `npm run web` una vez antes de `typecheck`: si no, TypeScript no avisa de los enlaces que quedaron rotos.

## Exportar (para publicar)

```bash
npx expo export -p web          # deja el sitio estático en dist/
```

`dist/` incluye `_redirects` (todas las rutas sirven `index.html`) y `_headers` (`X-Robots-Tag: noindex`) para Netlify. Las fuentes están en `assets/fuentes/` (no en `node_modules`, que Netlify no publica).

## Dónde está cada cosa

- `src/app/`: rutas (envoltorios delgados) y layouts.
- `src/pantallas/<grupo>/`: las pantallas (ingreso, documentos, matches, bolsa).
- `src/panel/`: panel de administración guardado fuera del mockup (no se publica; no es ruta). Ver `src/panel/README.md`.
- `src/ui/`: sistema de diseño (tokens y componentes). Muestrario en `/componentes`.
- `src/datos/`: estado de la demo, datos de ejemplo, motor del match y simulación.
- `scripts/generar-semilla.mjs`: genera las zonas y comunas desde `docs/propuesta-zonas.csv` (`npm run semilla`).
- `GUIA-PANTALLAS.md`: guía detallada para construir pantallas.

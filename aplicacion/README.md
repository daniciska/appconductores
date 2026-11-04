# Dale Contacto · demo navegable

Mockup funcional de **Dale Contacto** para **mockup.dalecontacto.cl**: conductor completo (ingreso, registro en 5 pasos, documentos, matches, mensajes y perfil), bolsa de trabajo (conductor y titular) y panel de administración.

- Hecho con la tecnología de la app: **Expo + expo-router + TypeScript**, salida web de una sola página.
- Funciona con **datos de ejemplo**: lo que se escribe queda solo en el navegador (`localStorage`, clave `dale-demo-v1`). No envía códigos ni guarda datos en Supabase.
- Los catálogos (regiones, zonas, comunas, licencias, negocios…) son los mismos de la base de datos; titulares, búsquedas y conductores son ficticios.

## Correr

```bash
npm install
npm run web          # abre la demo en el navegador (modo desarrollo)
```

## Comprobar

```bash
npm run typecheck    # TypeScript sin errores
npm run test:match   # pruebas del motor del match
```

## Exportar (para publicar)

```bash
npx expo export -p web          # deja el sitio estático en dist/
```

`dist/` incluye `_redirects` (todas las rutas sirven `index.html`) y `_headers` (`X-Robots-Tag: noindex`) para Netlify. Las fuentes están en `assets/fuentes/` (no en `node_modules`, que Netlify no publica).

## Dónde está cada cosa

- `src/app/`: rutas (envoltorios delgados) y layouts.
- `src/pantallas/<grupo>/`: las pantallas (ingreso, documentos, matches, bolsa, admin).
- `src/ui/`: sistema de diseño (tokens y componentes). Muestrario en `/componentes`.
- `src/datos/`: estado de la demo, datos de ejemplo, motor del match y simulación.
- `scripts/generar-semilla.mjs`: genera las zonas y comunas desde `docs/propuesta-zonas.csv` (`npm run semilla`).
- `GUIA-PANTALLAS.md`: guía detallada para construir pantallas.

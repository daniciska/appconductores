# Dale Contacto · demo navegable

Mockup funcional de **Dale Contacto** para **mockup.dalecontacto.cl**: conductor completo (ingreso, registro en 5 pasos, documentos, matches, mensajes y perfil) y bolsa de trabajo (conductor y titular).

**El panel de administración es otra app** (decidido el 9-nov): vive en `../panel/` y se publica en `/panel` del mismo sitio, sin enlace desde el menú de esta demo. Esta app no lleva nada del panel (`npm run revisar:sin-panel` lo comprueba en el export). Las dos están **conectadas** por lo guardado en el navegador: lo que se aprueba o se cambia en el panel se ve aquí en vivo, en otra pestaña del mismo navegador.

La revisión de documentos de una persona del equipo se simula sola (la Hoja de Vida y los antecedentes se aprueban unos 12 segundos después de quedar "En revisión"), **salvo mientras el panel está abierto con un rol en otra pestaña del mismo navegador**: entonces los documentos esperan la decisión del panel y el Inicio dice "Demo: esperando la revisión del equipo.". "Aprobar ahora" sigue funcionando. Al salir del panel, al cerrar su pestaña o con "Reiniciar demo" vuelve la revisión simulada (si el navegador cierra la pestaña sin avisar, a los 90 s como máximo). Para ver un documento no aprobado sin el panel, usa el atajo "Documento no aprobado" del menú de la demo.

- Hecho con la tecnología de la app: **Expo + expo-router + TypeScript**, salida web de una sola página.
- Funciona con **datos de ejemplo**: lo que se escribe queda solo en el navegador (`localStorage`, clave `dale-demo-datos`, versión 4 del estado; lo que había en la clave anterior, `dale-demo-v1`, se trae una sola vez). No envía códigos ni guarda datos en Supabase. La demo pide una **clave de entrada** una vez por navegador (la misma para `/panel`): `src/pantallas/ingreso/PuertaClave.tsx`, con solo el SHA-256 de la clave en `src/datos/claveDemo.ts` (clave `dale-demo-acceso` del navegador). Una pestaña abierta con una versión anterior de la demo no pisa lo de la nueva: deja de guardar y pide recargar. Cada pestaña del panel con un rol deja su marca de "revisión a mano" en su propia clave (`dale-demo-revision-manual:<pestaña>`, con plazo); "Reiniciar demo" las borra y avisa en `dale-demo-reinicio`.
- Los catálogos (regiones, zonas, comunas, licencias, negocios…) son los mismos de la base de datos; titulares, búsquedas y conductores son ficticios.

## Correr

```bash
npm install
npm run web          # abre la demo en el navegador (modo desarrollo)
```

## Comprobar

```bash
npm run typecheck    # TypeScript sin errores
npm run test:match   # pruebas: motor del match, guardado, migración, revisión manual y revisor del export
```

Las rutas tienen tipos (`.expo/types/router.d.ts`, se genera solo). Si mueves o borras una ruta, corre `npm run web` una vez antes de `typecheck`: si no, TypeScript no avisa de los enlaces que quedaron rotos.

## Exportar (para publicar)

```bash
npm run export:web              # deja esta demo en dist/
npm run revisar:sin-panel       # revisa que dist/ no lleve textos ni direcciones del panel
```

`dist/` incluye `_redirects` (todas las rutas sirven `index.html`) y `_headers` (`X-Robots-Tag: noindex`) para Netlify. Las fuentes están en `assets/fuentes/` (no en `node_modules`, que Netlify no publica).

**Lo que se publica en Netlify es el sitio completo** (esta demo en la raíz y el panel en `/panel`), que arma un solo comando desde la carpeta del panel:

```bash
cd ../panel && npm run export:demo   # exporta las dos, revisa esta y deja todo en ../dist-demo
```

Publicar solo `dist/` dejaría `/panel` en "Esta pantalla no existe". Ver `../panel/README.md`.

## Dónde está cada cosa

- `src/app/`: rutas (envoltorios delgados) y layouts.
- `src/pantallas/<grupo>/`: las pantallas (ingreso, documentos, matches, bolsa).
- `src/ui/`: sistema de diseño (tokens y componentes). Muestrario en `/componentes`.
- `src/datos/`: estado de la demo, datos de ejemplo, motor del match y simulación. Es código común: el panel (`../panel`) lo usa con el alias `@/`, así que aquí no va nada propio del panel.
- `scripts/generar-semilla.mjs`: genera las zonas y comunas desde `docs/propuesta-zonas.csv` (`npm run semilla`).
- `scripts/revisar-export-sin-panel.mjs`: revisa que el export no lleve nada del panel (`npm run revisar:sin-panel`).
- **Dependencias:** las del panel también se instalan aquí (el panel usa este `node_modules`, una sola copia de React y Expo). Mientras el panel use solo librerías JavaScript, no cambia la app de las tiendas.
- `GUIA-PANTALLAS.md`: guía detallada para construir pantallas.

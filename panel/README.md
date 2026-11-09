# Dale Contacto · demo del panel de administración

Demo del panel que usa el equipo de Dale Contacto: revisar documentos, atender reportes, suspender cuentas y cambiar la configuración (negocios, zonas, reglas del match, ajustes, equipo). Funciona con **datos de ejemplo**, igual que la demo del conductor. El panel real, conectado a Supabase, se construye después.

- **App aparte** (decidido el 9-nov, opción B de `docs/propuesta-panel-administracion.md`): su propio proyecto Expo + expo-router + TypeScript, con sus propias rutas y su propio export. La demo del conductor (`../aplicacion`) no lleva nada del panel.
- **Mismo sitio, en `/panel`:** se publica junto a la demo del conductor (hoy https://dale-contacto-mockup.netlify.app/panel, después https://mockup.dalecontacto.cl/panel), **sin enlace** desde el menú de la demo del conductor. Dirección corta: `panel-mockup.dalecontacto.cl`, que lleva a `mockup.dalecontacto.cl/panel` (la dueña agrega el registro DNS).
- **Conectada:** comparte lo guardado en el navegador con la demo del conductor. Lo que se aprueba, rechaza, suspende o configura aquí se ve en vivo en la demo del conductor o del titular abierta en otra pestaña del mismo navegador, y lo que hace el conductor (registrarse, enviar documentos, reportar) aparece aquí.
- **Se entra eligiendo rol** en la portada: "Entrar como administrador" o "Entrar como revisor". No hay pantalla de ingreso (celular, código y segundo paso siguen por decidir).

## Dónde está cada cosa

```
panel/
  app.json                 base '/panel' (experiments.baseUrl), salida web "single"
  metro.config.js          compila también ../aplicacion/src y resuelve todo desde ../aplicacion/node_modules
  tsconfig.json            alias '@panel/*' → ./src/*  y  '@/*' → ../aplicacion/src/*
  public/index.html        página base (español, noindex)
  scripts/
    enlazar-dependencias.mjs   crea node_modules → ../aplicacion/node_modules
    tipos-rutas.cjs            genera .expo/types/router.d.ts (rutas tipadas) sin abrir el servidor
    armar-sitio-demo.mjs       arma el sitio completo para Netlify (ver "Publicar")
  src/
    app/                   rutas: index.tsx (portada), +not-found.tsx, _sitemap.tsx (tapa la página técnica de expo-router), (secciones)/… (una por sección)
    pantallas/             las 9 secciones (Resumen, Documentos, Conductores, Reportes, Match, Catalogos, Zonas, Ajustes, Equipo) y piezas.tsx
    datos/                 acciones.ts (todo lo que escribe el panel), registro.ts (registro de acciones), lecturas.ts y hooks.ts (cola, resumen…), prerevision.ts, semillaPanel.ts (equipo y reportes de ejemplo)
    marco.tsx              barra lateral (escritorio) o barra con menú (celular), rol actual, cambiar de rol y salir
    permisos.ts            qué puede hacer cada rol
    sesion.ts              rol de cada pestaña, entrar, cambiarlo y salir; marca de revisión a mano
    enlaces.ts             rutas del panel y abrirDemoConductor()
  tests/permisos.test.ts
```

**Código común, una sola copia.** El panel no copia nada de `../aplicacion`: importa con `@/` el sistema de diseño (`src/ui`), la tienda y los tipos de la demo (`src/datos`), el motor del match y los textos de documentos. Lo propio del panel (pantallas, acciones, lecturas, el equipo y los reportes de ejemplo) vive solo aquí, y `aplicacion/src` no importa nada de `panel/`.

**Una sola React.** El panel no instala dependencias: `node_modules` es un enlace a `../aplicacion/node_modules` (lo crea `npm run preparar`, que corren todos los comandos). Metro resuelve todo desde ahí, así que React, Expo, expo-router y zustand se cargan una sola vez. Si el panel necesita una librería nueva, se instala en `../aplicacion` (con `npx expo install` ahí). **No corras `npm install` en esta carpeta**: `.npmrc` lo deja sin efecto para no borrar el enlace. Si algún día el panel necesita una dependencia nativa, conviene pasar a workspaces de npm con una carpeta `comun/` (opción verificada con Expo 58, pero cambia versiones del lock).

## Correr y comprobar

```bash
npm run web          # panel en modo desarrollo, en la raíz del servidor (http://localhost:8081/, sin /panel)
npm run typecheck    # genera las rutas tipadas y corre TypeScript
npm test             # pruebas de permisos
```

En desarrollo Expo no aplica la base `/panel` (solo al exportar): el panel se abre en la raíz de su servidor. Además, cada app corre en su propio puerto, que para el navegador es otro sitio: no comparten lo guardado y los enlaces a la demo del conductor no funcionan. Para probar la conexión, arma el sitio (`npm run export:demo`) y sírvelo con las reglas de `_redirects` (por ejemplo, un servidor que sirva el archivo si existe y, si no, `/panel/index.html` para `/panel/*` y `/index.html` para lo demás).

## Publicar (un solo sitio)

```bash
npm run export:demo
```

1. Exporta la demo del conductor (`../aplicacion/dist`) y **revisa que no lleve nada del panel** (`../aplicacion/scripts/revisar-export-sin-panel.mjs`). Si encuentra un texto o una dirección del panel, se corta aquí.
2. Exporta el panel (`dist`, con la base `/panel`).
3. Arma **`../dist-demo/`** (en la raíz del repositorio, ignorada por git): la raíz es la demo del conductor y `/panel` es el panel.

`dist-demo/_redirects` (gana la primera regla que calza):

```
https://panel-mockup.dalecontacto.cl/*  https://mockup.dalecontacto.cl/panel/:splat  301!
http://panel-mockup.dalecontacto.cl/*   https://mockup.dalecontacto.cl/panel/:splat  301!
/panel     /panel/index.html  200
/panel/*   /panel/index.html  200
/* /index.html 200
```

Las reglas de `/panel` no llevan `!`: así los archivos reales (`/panel/_expo/…`, `/panel/assets/…`) se sirven directo. `dist-demo/_headers`: `X-Robots-Tag: noindex` para todo y, en `/panel` y `/panel/*`, `X-Frame-Options: DENY` y `Content-Security-Policy: frame-ancestors 'none'` (no se puede abrir dentro de otra página).

**Falta la pantalla de clave** que pide la decisión de acceso del 9-nov (CLAUDE.md, "Mockup funcional": la misma clave para el mockup y para `/panel`). Mientras no esté, esta carpeta no se publica en el sitio público.

Se publica **la carpeta `dist-demo` completa**, en el mismo sitio de Netlify del mockup. Publicar solo `aplicacion/dist` dejaría `/panel` en "Esta pantalla no existe". Las dos demos comparten la versión del estado: se publican siempre juntas. Para la dirección corta, en Netlify se agrega `panel-mockup.dalecontacto.cl` como dominio del mismo sitio y la dueña agrega el registro DNS en su hosting [verificar en Netlify].

## Roles

Se elige en la portada (`/panel`). El rol es **de cada pestaña** (`sessionStorage`): se recuerda al recargar, y otra pestaña del panel parte en la portada, así se pueden ver el administrador y el revisor lado a lado. Cambiar de rol o salir en una pestaña no toca a las demás. Desde el marco se ve el rol actual, se cambia con "Cambiar" y "Salir del panel" vuelve a la portada. Todo lo que se hace queda en el registro de acciones firmado como "Tú (administrador)" o "Tú (revisor)", con el rol del momento de la acción; lo que esperaba la pausa del registro (umbral, pesos, ajustes numéricos) se escribe antes de cambiar de rol, al salir y al cerrar la pestaña.

| | Revisor | Administrador | De dónde sale |
|---|---|---|---|
| Resumen | Sí, sin "Últimas acciones del equipo" | Sí | El registro de acciones lo ven solo los administradores (modelo de datos, propuesta) |
| Documentos: aprobar y no aprobar con motivo, ver el archivo y el RUN (los dos quedan registrados, R26) | Sí | Sí | Decidido: lo decide una persona del equipo (P8); la base deja cambiar estados a cualquiera del equipo |
| Conductores: lista y ficha | Solo ve | Solo ve | Decidido en la base: nadie corrige datos de otra persona (R31). La dirección no se muestra |
| Reportes: leer la conversación (queda registrado) y resolver: sin acción, ocultar los mensajes o suspender | Sí | Sí | Propuesta (R18); reportar y bloquear sigue pendiente |
| Suspender y reactivar conductores y titulares (desde un reporte) | Sí | Sí | Pendiente (MD52, decisión 8): la base hoy se lo permite a cualquiera del equipo, pero eso no lo decide; que el revisor lo haga es propuesta |
| Reglas del match, Catálogos, Zonas y comunas, Ajustes | Solo lectura | Cambia | Decidido en la base: solo el administrador escribe catálogos, zonas y ajustes (umbral incluido); pesos y filtros, propuesta (R22) |
| Equipo: agregar, cambiar rol, quitar acceso | Ve la lista | Sí (nunca su propia fila) | Decidido en la base |
| Registro de acciones | No | Sí | Propuesta (acciones_equipo: "Solo los administradores") |

Para el revisor, las secciones que no puede cambiar se muestran en **solo lectura** con la línea "Solo un administrador puede cambiar esto." (sin interruptores, deslizadores ni botones de cambio). Además, cada acción del panel revisa el permiso del rol (`permisos.ts`). En la demo, las clases de licencia son de solo lectura para todos (R22 propone que las cambie el administrador; la base ya lo permite).

## Conexión con la demo del conductor

- Las dos apps crean su propia tienda con el mismo código común (`aplicacion/src/datos/tienda.ts`): misma clave (`dale-demo-datos`) y misma versión del estado (4). Cuando una pestaña guarda, las otras vuelven a leer (evento "storage"), así que los cambios se ven sin recargar.
- Las acciones del panel están en `src/datos/acciones.ts` y escriben con `useDemo.setState` usando ayudas puras de la tienda común (`cambiarDocumento`, `docAprobado`). No pisan un documento que ya cambió (por ejemplo, si lo aprobó "Aprobar ahora").
- "Ver como conductor", "Abrir la demo del conductor" y "Ver en la demo" abren la demo del conductor en otra pestaña (siempre la misma), porque es otra app del mismo sitio.
- El equipo de ejemplo (Paula Vergara, Ignacio Toro, Camila Rojas) y los dos reportes de ejemplo entre personas ficticias los carga el panel al entrar si faltan (`src/datos/semillaPanel.ts`); la demo del conductor parte sin ellos.
- La simulación (pre-revisión de la IA, respuestas de titulares…) la lleva la demo del conductor si está abierta en otra pestaña, porque ahí se ven sus avisos. Si no lo está, la lleva el panel de respaldo (sin los avisos del conductor), así lo que el conductor envió llega igual a la cola. En cuanto se abre la demo del conductor, ella retoma el turno.
- Lo que se hace en el panel se ve en la demo del conductor: decidir documentos, suspender (el titular suspendido ve un aviso y no puede escribir), ocultar mensajes (en el chat del conductor queda "Mensaje oculto por el equipo.") y los cambios de configuración.

## Revisión manual y revisión simulada

- **Sin panel en uso**, la demo del conductor simula a la persona del equipo: lo que espera revisión se aprueba solo a los ~12 s.
- **Mientras una pestaña del panel tiene un rol**, deja en el navegador su propia marca de revisión a mano (`dale-demo-revision-manual:<id de la pestaña>`, aparte de los datos para que ninguna pestaña la pise al guardar lo suyo) con un plazo de 90 s, y la renueva cada 5 s. Mientras haya una marca vigente, la demo del conductor no programa ni ejecuta la revisión simulada (y quita la ya programada): los documentos esperan en la cola del panel. El conductor ve "Demo: esperando la revisión del equipo."; "Aprobar ahora" sigue funcionando. La marca no dice el rol: eso queda solo en el panel.
- **"Salir del panel" o cerrar la pestaña** quita su marca (al cerrar, con el evento `pagehide`). Si el navegador cierra la pestaña sin avisar, la marca vence sola a los 90 s (el plazo cubre a una pestaña oculta, que el navegador despierta una vez por minuto). Sin marcas vigentes vuelve la revisión simulada y lo que espera se aprueba ~12 s después.
- **"Reiniciar demo"** en la demo del conductor borra todas las marcas y avisa a las pestañas del panel (`dale-demo-reinicio`), que vuelven a su portada.
- La versión del estado subió a 4 (desde la 3 se conserva todo): una pestaña abierta con la demo publicada antes, que no conoce la revisión a mano, deja de guardar y pide recargar. Además, mientras haya una pestaña de esta versión, su simulación queda detenida (se le deja tomado su turno, `dale-demo-datos-lider-v3`), así tampoco "aprueba" en su propia pantalla.
- La segunda revisión ("pedir otra revisión") en la app real la decide otra persona del equipo (R13). En la demo hay una sola persona: el panel lo avisa y deja decidirla igual.

## Por confirmar con la dueña

- Si el revisor ve en solo lectura las secciones de configuración (así quedó) o no las ve.
- Que el revisor suspenda conductores y titulares (decisión 8 y MD52). Al resolver un reporte quedan las opciones de R18 (sin acción, ocultar los mensajes, suspender), sin ninguna marcada; "Enviar una advertencia" salió porque no está en el modelo de datos.
- Cómo ve el conductor un mensaje oculto ("Mensaje oculto por el equipo.") y qué ve un titular suspendido (aviso y sin poder escribir, según R18 y la propuesta de MD52).
- Si el equipo ve la dirección del conductor (hoy no se muestra) y si el administrador abre los archivos de documentos.
- El plazo de la marca de revisión a mano (90 s) cuando el navegador cierra la pestaña del panel sin avisar.
- Las direcciones de cada sección (`/panel/resumen`, `/panel/documentos`…), y que el revisor entre directo a Documentos y el administrador al Resumen.

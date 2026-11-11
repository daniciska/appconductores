# Dale Contacto · app real del conductor (v1)

App web real del conductor, conectada a **Supabase** (proyecto `dale-contacto`), para que la dueña y su equipo empiecen a llenar la base con **celulares de prueba**. Especificación aprobada el 9-nov: `docs/especificacion-app-conductor-v1.md` (incluidas las adaptaciones de su sección 18). Se publicará en **app.dalecontacto.cl** (sitio de Netlify aparte, `dale-contacto-app`); este repositorio solo la arma, no la publica.

- **Qué trae:** ingreso con celular y código (A1 sin "Tengo vehículos", A2, A3 con 60 s entre códigos, A4 "Antes de empezar" con una casilla por cada texto obligatorio vigente de la base), pasos 1 a 4 guardando en la base campo por campo (Paso 2 temporal: la comuna elegida de una lista), Inicio "perfil incompleto" con los documentos como "Próximamente", Perfil reducido, "¿Sigues buscando trabajo?" (E4) y editar cada paso desde Perfil.
- **Qué no trae:** titular, matches, mensajes, bolsa, documentos (Paso 5), quién recibió mis datos, bloqueos, eliminar cuenta, recordatorios ni Google Maps. Tampoco la clave de la demo, datos de ejemplo, el menú de la demo, la simulación ni nada del panel (`npm run revisar` lo comprueba).

## Cómo está armada

Igual que `../panel/`: **app Expo aparte** (Expo + expo-router + TypeScript, salida web de una sola página, base `/`) sin dependencias propias (`node_modules` es un enlace a `../aplicacion/node_modules`; `.npmrc` deja sin efecto un `npm install` aquí). Metro compila también `../aplicacion/src`.

**Las pantallas son las aprobadas del mockup, en una sola copia** (`aplicacion/src/pantallas`). Leen y escriben por una **interfaz de datos** (`aplicacion/src/datos/puerto/`) con dos implementaciones:

| | Demo (mockup) | App real (esta carpeta) |
|---|---|---|
| Implementación | `aplicacion/src/datos/demo/puertoDemo.tsx` (la tienda de la demo, en el navegador) | `src/datos/puertoReal.tsx` (Supabase) |
| Validación de obligatorios | ajuste de la demo (apagado) | siempre |
| Espera entre códigos | 30 s | 60 s, contados desde el último pedido |
| Atajos "Demo: …" | sí | no |
| Paso 2 | dirección con sugerencias (maqueta) | comuna de una lista (`Paso2Comuna.tsx`) |
| Casillas de A4 | las 4 de la pantalla (`prueba-1`) | una por cada texto obligatorio vigente de la base, en su orden (se registran esos mismos) |
| "Volver" en A4 | al código (A3) | a Inicio si la guardia la deja salir de A4; si no, ofrece cerrar sesión |

```
app-real/
  .env                     configuración PÚBLICA versionada: dirección de Supabase, clave publicable, números de prueba
  app.json                 "Dale Contacto", slug dale-contacto-app, salida web "single", rutas tipadas
  metro.config.js          compila ../aplicacion/src y resuelve todo desde ../aplicacion/node_modules
  tsconfig.json            '@/*' → ../aplicacion/src/*   ·   '@real/*' → ./src/*
  public/                  index.html (es, noindex), _redirects (SPA), _headers (noindex y seguridad)
  scripts/                 enlazar-dependencias, tipos-rutas, revisar-sin-demo, exportar
  src/
    config.ts              lee EXPO_PUBLIC_* (revisión en configuracion.ts: solo clave publicable)
    supabase.ts            cliente único (sesión en localStorage, 15 s máximo por llamada)
    tiposBd.ts             tipos generados de la base (generate_typescript_types)
    guardia.ts             qué ruta puede ver cada persona (sin sesión, sin autorizaciones, sin Paso 1, registrada)
    datos/
      catalogos.ts         catálogos de la base → tipos de las pantallas (puro)
      perfil.ts            perfil propio → cuenta y conductor, "pasos listos" (puro)
      escrituras.ts        plan de escritura de cada pantalla (puro) + ejecutor
      guardado.ts          guardar con el perfil al día (relee antes de armar el plan si el anterior falló)
      sesion.ts            token rechazado por la base (renovar una vez o cerrar) y cerrar sesión sin conexión
      lecturas.ts          consultas (siempre filtradas por el propio id)
      errores.ts           errores de Auth, PostgREST y red → textos cortos (puro)
      tiendaReal.ts        estado en memoria (sin guardar datos en el navegador)
      puertoReal.tsx       acciones, entorno y proveedor
    pantallas/             Puerta (carga y sin conexión), InicioV1
    app/                   rutas de la v1 (envoltorios delgados de las pantallas compartidas)
  tests/                   pruebas (node --test) y simulador/ (Supabase simulado para las pruebas)
```

## Correr y comprobar

```bash
npm run web          # modo desarrollo (contra el Supabase real: solo entran los números de prueba)
npm run typecheck    # genera las rutas tipadas y corre TypeScript (también revisa los enlaces de las pantallas compartidas)
npm test             # pruebas: configuración, errores, mapeo, planes, guardia, textos y versiones de A4, buscador de comunas,
                     # "sin demo", guardar con el perfil al día, la sesión y la capa real con supabase-js
                     # contra el Supabase simulado
npm run revisar      # desde las rutas no se llega a nada de la demo ni del panel
```

**Supabase simulado** (`tests/simulador/supabaseSimulado.mjs`): responde como Auth y PostgREST con las reglas de la base (cuenta al confirmar el código, cada uno ve lo suyo, permisos por columna, llaves únicas, 18 años, negocios activos y habilitados por la licencia, quitar una clase quita sus negocios). Los catálogos (`base-inicial.json`) salen de las migraciones y tienen los mismos ids que el proyecto real. Sirve para las pruebas de Node y para recorridos con Playwright (`page.route` sobre `https://zflalaqimacsnlvurzeb.supabase.co`). Las reglas de verdad se prueban en SQL: `supabase/pruebas/`.

## Armar para publicar

```bash
npm run export:web   # → app-real/dist (ignorada por git)
```

1. Revisa la configuración (`.env`): se niega si la clave no es la publicable.
2. Revisa que desde las rutas no se llegue a la demo ni al panel.
3. `expo export -p web` → `dist/` con `_redirects` (`/* /index.html 200`) y `_headers` (`X-Robots-Tag: noindex`, `X-Frame-Options`, `Content-Security-Policy` que solo deja conectarse a Supabase).
4. Revisa el export: sin textos de la demo ("Demo:", "Ingresa la clave", "Reiniciar demo"…), sin nombres de la semilla, sin textos del panel, sin `service_role` ni claves secretas.

Se publica **la carpeta `dist` completa** en el sitio de la app real (nunca en el del mockup). La publica Claude cuando la dueña lo apruebe.

## Lo que falta para usarla de verdad (lo hace la dueña)

Encender **Phone** en Supabase con Twilio de relleno y cargar los **números de prueba** (`569XXXXXXXX=NNNNNN`), como dice la sección 17 de la especificación. Mientras tanto, cualquier número recibe "Por ahora solo pueden entrar los celulares del equipo." (o el aviso de que el ingreso con celular no está disponible).

## Reglas

- La clave **publicable** puede ir en `.env` (es pública por diseño; la protege la RLS). **Nunca** la `service_role` ni una `sb_secret_…`.
- En el navegador solo quedan la sesión de Supabase (`localStorage`) y, en `sessionStorage`, el celular que se está verificando (`dale-app-ingreso`) y los borradores de la pestaña (`dale-app-borradores`, con su dueño en `dale-app-borradores-de`). Cerrar sesión borra todo, también sin conexión; los borradores se borran además cada vez que la sesión termina de otra forma y cuando entra otra persona.

## Cómo se comporta con la red y la sesión

- **Guardar:** cada paso es un plan de 1 a 5 llamadas que compara lo marcado con lo leído de la base. Si falla a mitad de camino, parte pudo quedar hecha: el siguiente intento vuelve a leer el perfil **antes** de armar su plan (así lo que se marca de nuevo sí se guarda). Si el plan sale bien pero no se puede volver a leer, dice "Se guardó, pero se cortó la conexión. Inténtalo de nuevo.".
- **Token rechazado por la base** (PGRST301, al leer o al guardar): se renueva la sesión una vez y se repite. Si no se puede renovar, se cierra la sesión y se va a la Bienvenida con "Tu sesión venció. Vuelve a entrar.". Sin red para renovar, es un error de conexión.
- **Cerrar sesión:** primero en este equipo (al instante, aunque no haya red ni el token esté vigente) y después, si el token sigue vigente, se avisa al servidor sin esperar.
- **Otra pestaña** cierra la sesión o entra otra persona: esta pestaña va a la entrada que corresponde con la pila limpia ("Tu sesión se cerró. Vuelve a entrar.").
- **Salir de una pantalla mientras espera** (código, verificación, guardado): no se navega después; lo guardado queda guardado.
- **A2 con el mismo número antes de 60 s** (volvió de A3 a revisarlo): sigue a A3 sin pedir otro código.
- **A4 "Antes de empezar":** una casilla por cada texto **obligatorio vigente** para el conductor (`para_quien` conductor o todos), en el orden de la columna `orden`, sea cual sea su clave. Con los 4 textos `prueba-1` se ve igual que la maqueta (mismo dibujo); cualquier otro texto se dibuja con las mismas reglas (lo que va antes de ":" en negrita; "Términos" y "Política de privacidad" como enlaces). Cuando lleguen los del abogado o una autorización nueva (una 5.ª clave), basta con cargarlos en la base: no hace falta publicar otra app.
  - Cada casilla parte marcada **solo si la persona ya aceptó esa misma versión** (su id). Una versión nueva parte sin marcar y hay que marcarla para continuar; se registran solo las versiones que faltan. Quien ya aceptó la versión anterior verá A4 una vez.
  - `exige_aceptar_de_nuevo` no se puede respetar todavía: la persona no puede leer las versiones viejas que aceptó (RLS), así que no sabe de qué clave eran. Por eso **cualquier versión nueva se pide de nuevo** (lo prudente).
  - "Volver" lleva a Inicio solo si la guardia la deja salir de A4 (registrada y al día); si no, ofrece "¿Cerrar sesión?" (así nunca da vueltas). Las reglas están en `aplicacion/src/pantallas/ingreso/textosAutorizacion.ts` y las prueban `tests/autorizaciones.test.ts` y `tests/a4-versiones.test.ts`.
- **iPhone:** en `public/index.html`, solo en Safari de iOS los campos usan 16 px (si no, Safari agranda la página al tocarlos).
- Cada pantalla compartida que cambie afecta también al mockup y a la demo del panel: antes de publicar cualquiera, revisar las tres.

# Especificación de construcción · App real del conductor v1 (Dale Contacto)

Fecha: 9-nov-2026. Fuente del código: commit `46ac95e`, leído en la copia de solo lectura `/tmp/claude-0/-home-user-appconductores/a49116f8-7c86-54b9-8624-19dd22438642/scratchpad/app-real/copia-head`, más la carpeta `panel/` que dejó el otro proceso en el árbol de trabajo (también leída en solo lectura). La base real (proyecto `zflalaqimacsnlvurzeb`) se revisó solo con SELECT.

**Estado del documento.** Es una propuesta que espera el visto bueno de la dueña. Lo que dice **[por confirmar]** es una decisión de Claude que no está escrita en CLAUDE.md: se construye así salvo que la dueña diga otra cosa (lista completa en la sección 18). Lo que dice **[verificar]** no está comprobado.

**Antes de empezar a construir:**
- Esperar a que termine la reorganización de `aplicacion/` y `panel/` que está haciendo el otro proceso.
- Leer el estado que deje: `aplicacion/AGENTS.md`, `aplicacion/README.md`, `aplicacion/GUIA-PANTALLAS.md` y `panel/README.md`. Las rutas de archivos de este documento son las del commit `46ac95e` y pueden haber cambiado; por ejemplo, ya existe `@/ui/fuentes`.
- No hacer commit ni push sin que la dueña lo pida.

---

## 0. En una página

- **Qué trae la v1:**
  - Ingreso con celular y código. Mientras no haya proveedor, solo entran los números de prueba de Supabase.
  - «Antes de empezar» (A4).
  - Pasos 1 a 4 del registro.
  - Inicio en versión «perfil incompleto».
  - Perfil reducido.
  - «¿Sigues buscando trabajo?» (E4).
  - Editar cada paso desde Perfil.
- **Qué no trae:** titular, matches, mensajes, bolsa, documentos (Paso 5), quién recibió mis datos, bloqueos, eliminar cuenta, recordatorios ni Google Maps.
- **Dónde va:**
  - Carpeta nueva `app-real/` [por confirmar el nombre], hermana de `panel/` y armada igual que ella: sin dependencias propias, con Metro apuntando a `../aplicacion`.
  - Las pantallas aprobadas siguen en **una sola copia**, en `aplicacion/src/pantallas`, y dejan de leer la tienda de la demo: usan una **interfaz de datos** que tiene dos implementaciones, la demo (zustand + localStorage, como hoy) y la real (Supabase).
- **Base de datos:**
  - Para guardar los pasos 1 a 4 alcanza la Etapa 1 tal como está.
  - Hace falta **1 migración** con los textos de prueba de A4. Se **recomienda 1 más**, con los ajustes que la app puede leer.
  - Las dos están escritas y probadas en Postgres 16 local, con 37 pruebas nuevas en verde. Las pruebas de la Etapa 1 siguen en verde.
- **La dueña:** configura «Phone» en Supabase con Twilio de relleno y números de prueba, aprueba esta especificación y, al final, agrega el DNS.

---

## 1. Alcance v1

| Pantalla (maqueta) | Ruta | En v1 | Notas |
|---|---|---|---|
| A1 Bienvenida | `/conductor/bienvenida` | Sí | Sin «Tengo vehículos» [por confirmar] |
| A2 Celular | `/conductor/celular` | Sí | `signInWithOtp` |
| A3 Código | `/conductor/codigo` | Sí | `verifyOtp`; espera de 60 s |
| A4 Antes de empezar | `/conductor/autorizaciones` | Sí | Necesita la migración de textos de prueba |
| B1 Paso 1 | `/conductor/registro/1` | Sí | `?editar=1` desde Perfil |
| B2 Paso 2 | `/conductor/registro/2` | Sí, **temporal**: comuna elegida de una lista | Componente nuevo `Paso2Comuna` |
| B3 Paso 3 | `/conductor/registro/3` | Sí | |
| B4 Paso 4 | `/conductor/registro/4` | Sí | «Continuar» lleva a Inicio |
| B5 Paso 5 (documentos) | — | No | Etapa 3 + abogado |
| Inicio (perfil incompleto) | `/conductor/inicio` | Sí | Vista nueva cuando solo faltan documentos |
| Perfil | `/conductor/perfil` | Sí, reducido | |
| E4 ¿Sigues buscando trabajo? | `/conductor/disponibilidad` | Sí | Funciona con la Etapa 1 |
| Matches, Mensajes, Bolsa, Documentos, Quién recibió, Eliminar cuenta, Titular | — | No | No tienen tablas en la Etapa 1 |

---

## 2. Arquitectura elegida y por qué

**Opciones comparadas:**

- **(a) Una sola app con un interruptor** `EXPO_PUBLIC_MODO=demo|real`. Ventaja: hay un solo árbol de rutas. Desventajas:
  - La app real cargaría todas las rutas de la demo (titular, bolsa, matches…) y habría que esconderlas una por una.
  - Su paquete llevaría los datos ficticios.
  - Si falta la variable al exportar, la app «real» quedaría en modo demo sin avisar, guardando en el navegador.
- **(b) Una carpeta aparte que importa las pantallas tal como están.** No funciona por sí sola, porque las pantallas leen `useDemo` directamente.
- **(c) ELEGIDA: (b) + interfaz de datos.** Una carpeta hermana `app-real/`, con sus propias rutas (solo las de la v1) y una interfaz con dos implementaciones. Por qué:
  - Sigue el patrón que el otro proceso ya dejó funcionando en `panel/`: app hermana, `node_modules` enlazado, `watchFolders` y alias `@/` hacia `../aplicacion/src`.
  - Cumple la decisión de CLAUDE.md: las pantallas aprobadas pasan a la app real sin copiarlas.
  - La app real lleva solo lo que trae la v1, y una prueba puede comprobar que no lleve nada de la demo.
  - La app de las tiendas no lleva nada del panel.

**Reglas fijas** (todas se comprueban con pruebas automáticas, sección 15):

1. Desde `app-real/src/app` **no se puede llegar** por imports a nada de lo siguiente:
   - `@/datos/tienda`, `@/datos/semilla`, `@/datos/simulacion`, `@/datos/hooks` y `@/datos/selectores` (los de la demo).
   - `@/pantallas/matches`, `@/pantallas/bolsa`, `@/pantallas/documentos/{MisDocumentos,SubirDocumento,Enviado,NoAprobado,QuienRecibio,EliminarCuenta,textos}`.
   - `@/panel`.
2. Las pantallas compartidas **no nombran rutas que la app real no tiene** (`/titular`, `/conductor/registro/5`, `/conductor/documentos/...`, `/conductor/matches/...`, `/conductor/perfil/...`, `/conductor/eliminar-cuenta`). Esas rutas llegan desde la ruta de la demo, como *prop* o como bloque extra. Así `npm run typecheck` de `app-real`, con rutas tipadas, detecta cualquier enlace roto.
3. El mockup tiene que verse y funcionar **idéntico** después del cambio. Se comprueba con capturas antes y después (sección 15).
4. La app real no guarda datos personales en `localStorage`. Lo único que queda en el navegador es la sesión de Supabase (`sb-zflalaqimacsnlvurzeb-auth-token`), y en `sessionStorage` el borrador de la pestaña y el celular que se está verificando. Las dos cosas se borran al cerrar sesión.
5. Nunca va en la app la clave `service_role` ni una `sb_secret_…`.

---

## 3. Estructura de carpetas

```
aplicacion/                       (demo del conductor y del titular: el mockup; sigue igual por fuera)
  package.json                    + "@supabase/supabase-js": "2.118.0", + "react-native-url-polyfill" (versión exacta)
  src/
    datos/
      puerto/                     NUEVO, común, sin imports de la demo
        tipos.ts                  VistaConductor, AccionesConductor, Entorno, Resultado, Datos de cada paso
        contexto.tsx              <ProveedorConductor>, useVista, useAcciones, useEntorno (error si falta el proveedor)
        derivados.ts              avancePerfil, negociosPorIndustria, negocioPermitidoPorDeclaradas (sobre VistaConductor)
      demo/
        puertoDemo.tsx            NUEVO: <ProveedorDemo> envuelve useDemo; acciones = las de hoy en Promise
      tienda.ts, selectores.ts…   (demo; selectores reexportan los de puerto/derivados donde coincidan)
    pantallas/
      ingreso/                    Celular, Codigo, Autorizaciones, Paso1–4 pasan a useVista/useAcciones/useEntorno
        Paso2Comuna.tsx           NUEVO: Paso 2 temporal (buscador de comuna)
        acciones.ts               RUTA_PASO solo 1–4; lo del Paso 5 y documentos pasa al lado de la demo
      documentos/
        VistaIncompleta.tsx       NUEVO: sale de Inicio.tsx, usa la interfaz; opción «documentos próximamente»
        PerfilBase.tsx            NUEVO: lo común de Perfil, con huecos para las secciones de la demo
        Inicio.tsx, Perfil.tsx    (demo) componen las piezas de arriba con sus vistas propias
  src/app/_layout.tsx             (demo) monta <ProveedorDemo>

panel/                            (sin cambios por esta tarea)

app-real/                         NUEVO (nombre por confirmar) · Dale Contacto, app web real del conductor
  package.json                    solo scripts (igual que panel/): preparar, web, tipos-rutas, typecheck, test, export:web, revisar
  .npmrc                          dry-run=true
  .gitignore                      node_modules, dist, .expo, expo-env.d.ts
  .env.example                    solo los nombres de las variables (se sube al repo)
  .env.local                      valores (ignorado por git: .env*.local)
  app.json                        name "Dale Contacto", slug "dale-contacto-app" [por confirmar], web.output "single", typedRoutes
  metro.config.js                 watchFolders → ../aplicacion; nodeModulesPaths → ../aplicacion/node_modules
  tsconfig.json                   '@/*' → ../aplicacion/src/*   ;  '@real/*' → ./src/*
  public/                         index.html (es, noindex), _headers, _redirects
  scripts/                        enlazar-dependencias.mjs, tipos-rutas.cjs (copiados de panel/), revisar-sin-demo.mjs
  src/
    config.ts                     lee EXPO_PUBLIC_*; se detiene si faltan o si la clave parece secreta
    supabase.ts                   cliente único
    tiposBd.ts                    generado con generate_typescript_types
    datos/
      tiendaReal.ts               zustand SIN persist: estado de carga, sesión, VistaConductor, ingreso
      catalogos.ts                lectura y mapeo de catálogos
      perfil.ts                   lectura y mapeo del perfil propio, pasos listos
      escrituras.ts               plan de escritura de cada acción (puro) + ejecutor
      auth.ts                     pedirCodigo, verificarCodigo, cerrarSesion, onAuthStateChange
      errores.ts                  traduce errores de Postgres, Auth y red a textos cortos
      puertoReal.tsx              <ProveedorReal> (tienda + acciones + entorno)
    pantallas/
      InicioV1.tsx                Saludo + VistaIncompleta (documentos «Próximamente»)
      Puerta.tsx                  cargando / sin conexión / error de cuenta
    app/                          solo rutas de la v1 (envoltorios delgados)
      _layout.tsx  index.tsx  +not-found.tsx
      conductor/_layout.tsx  conductor/index.tsx
      conductor/bienvenida.tsx  celular.tsx  codigo.tsx  autorizaciones.tsx  disponibilidad.tsx
      conductor/registro/1.tsx 2.tsx 3.tsx 4.tsx
      conductor/(pestanas)/_layout.tsx  inicio.tsx  perfil.tsx
  tests/                          node:test (sección 15)
```

Las URL de la app real son **las mismas que las del mockup** (`/conductor/...`). Así no cambian los enlaces que ya están dentro de las pantallas compartidas.

---

## 4. Interfaz de datos («puerto»)

```ts
// aplicacion/src/datos/puerto/tipos.ts
import type { Catalogos, ConductorUsuario, CuentaUsuario } from '@/datos/tipos';

export type CatalogosRegistro = Pick<Catalogos,
  'regiones' | 'zonas' | 'comunas' | 'clases' | 'industrias' | 'tamanos' | 'negocios' | 'turnos' | 'dias' | 'idiomas'>;

/** Lo que leen las pantallas de la v1. La tienda de la demo (DatosDemo) ya tiene esta forma. */
export interface VistaConductor {
  cuenta: CuentaUsuario;        // celular = 8 dígitos ("1234 5678"), como hoy
  conductor: ConductorUsuario;  // registrado, pasosListos, pasoActual: en la real se deducen (sección 8)
  catalogos: CatalogosRegistro;
}

export type Resultado<T = void> = { ok: true; valor: T } | { ok: false; error: string };
export type DestinoIngreso = 'inicio' | 'paso1' | 'autorizaciones';

export interface AccionesConductor {
  pedirCodigo(celular8: string, canal: 'whatsapp' | 'sms'): Promise<Resultado>;
  verificarCodigo(codigo: string): Promise<Resultado<DestinoIngreso>>;
  aceptarAutorizaciones(): Promise<Resultado>;
  guardarPaso1(d: DatosPaso1): Promise<Resultado<{ primeraVez: boolean }>>;
  guardarPaso2(d: DatosPaso2Comuna | DatosPaso2): Promise<Resultado>;
  guardarPaso3(d: DatosPaso3): Promise<Resultado>;
  guardarPaso4(d: DatosPaso4): Promise<Resultado>;
  cambiarDisponible(v: boolean): Promise<Resultado>;
  confirmarDisponibilidad(): Promise<Resultado>;
  cerrarSesion(): Promise<void>;
}

export interface Entorno {
  esDemo: boolean;
  validarObligatorios: boolean;      // demo: ajustes.validarObligatorios · real: siempre true
  diasReconfirmar: number;           // demo: ajustes · real: ajuste público o 30
  esperaReenvioSegundos: number;     // demo: 30 · real: 60
  notaCodigo: string | null;         // demo: 'Demo: cualquier código de 6 dígitos' · real con números de prueba: 'Versión de prueba: usa el código que te dio el equipo.'
  bolsaActiva: boolean;              // real: false
  documentosDisponibles: boolean;    // real v1: false → fila "Próximamente"
  ejemplo: EjemploUsuario | null;    // demo: EJEMPLO_USUARIO (botones "Demo: …") · real: null
  claveBorradores: string;           // demo: 'dale-demo-borradores' · real: 'dale-app-borradores'
  textoCerrarSesion: string;         // demo: texto de hoy · real: 'Para volver a entrar usarás tu celular y un código.'
  textoTerminos: string;             // ventana de Términos (A4 y Perfil)
}
```

- `DatosPaso1` a `DatosPaso4` salen de `tienda.ts` y pasan a `puerto/tipos.ts` sin cambios. `DatosPaso2Comuna = { comunaId: string; tieneEstacionamiento: boolean }`.
- `contexto.tsx` expone:
  - `useVista(selector)`, que llama al hook de la tienda que entrega el proveedor.
  - `useVistaDerivada(fn)`, el equivalente de `useDerivado`.
  - `useAcciones()` y `useEntorno()`.
  - **Si falta el proveedor, lanza un error.** Nunca cae en la demo sin avisar.
- **Implementación demo** (`puertoDemo.tsx`):
  - `useTienda = useDemo`.
  - Las acciones envuelven las de hoy y devuelven `Promise<{ ok: true }>`. Las pausas de 600 ms (A2) y 700 ms (A3) que hoy están en las pantallas pasan a estas acciones, para que el mockup se sienta igual.
  - `verificarCodigo` llama a `verificarCelular()` y calcula el destino con la misma regla de hoy (`rutaTrasVerificar`).
- **Implementación real** (`app-real/src/datos/puertoReal.tsx`): secciones 5 a 10.

### 4.1 Cambios en las pantallas compartidas (una sola copia)

| Archivo | Cambio |
|---|---|
| `ingreso/comunes.tsx` | `useValidarObligatorios` → `useEntorno().validarObligatorios`. `useBorradorPaso` usa `entorno.claveBorradores` (o `configurarBorradores()` en `datos/borradores.ts`) |
| `ingreso/acciones.ts` | `RUTA_PASO` queda con 1–4. `rutaTrasVerificar` y `volverDesdePaso` dejan de usar `useDemo.getState()`: el destino lo devuelve `verificarCodigo` y `useVolverDesdePaso(paso)` lee `registrado` con `useVista`. `enviarYMostrarEnviado` y la ruta del Paso 5 pasan a `documentos/` (lado demo) |
| `Celular.tsx` | `await acciones.pedirCodigo(celular, 'whatsapp')`. El botón muestra «cargando». Si hay error, aparece en el `error` del campo. `NotaDemo` solo si `entorno.ejemplo` |
| `Codigo.tsx` | `ESPERA_REENVIO` → `entorno.esperaReenvioSegundos`. `verificar`, «Reenviar por WhatsApp» y «Recibir el código por SMS» esperan la acción con `await`. Si hay error, se muestra en el texto de error que ya existe o en un aviso (toast). `NotaDemo` → `entorno.notaCodigo` |
| `Autorizaciones.tsx` | `await acciones.aceptarAutorizaciones()`. Los 4 textos pasan a una constante exportada `TEXTOS_AUTORIZACION` (los de `etiqueta`, tal cual), porque la prueba de la sección 15 los compara con la migración. Ventana de Términos: `entorno.textoTerminos` |
| `Paso1.tsx`, `Paso3.tsx`, `Paso4.tsx` | Lecturas con `useVista` y acciones con `await`. Mientras guarda, el botón muestra «cargando» y los botones quedan bloqueados. Si hay error, aparece `AlertaObligatorios texto={error}` y el borrador se conserva. «Rellenar con datos de ejemplo» solo si `entorno.ejemplo`. En el Paso 4, el destino de «Continuar» llega por *prop* (`alTerminar`): en la demo lleva al Paso 5 y en la real a Inicio |
| `Paso2.tsx` | Igual (sigue siendo el del mockup). `EJEMPLO_USUARIO` → `entorno.ejemplo` |
| `Paso2Comuna.tsx` (nuevo) | Sección 9.2 |
| `Bienvenida.tsx` | *Prop* opcional `alElegirTitular`: si no viene, no se dibuja «Tengo vehículos». La ruta de la demo la pasa con `router.push('/titular')` |
| `documentos/Inicio.tsx` | `VistaIncompleta` se mueve a su propio archivo y usa la interfaz. Recibe `documentos: 'activo' \| 'proximamente'`. El Inicio de la demo conserva sus otras vistas |
| `documentos/Perfil.tsx` | Se divide en `PerfilBase` (encabezado, Disponible + «Confirmar ahora», Mi perfil, Ayuda, Cerrar sesión) con *props* `seccionSeguridad?`, `filaEliminar?` y `alCerrarSesion`. La ruta de la demo los entrega |
| `documentos/Disponibilidad.tsx` | `useVista`, acciones con `await` y `entorno.bolsaActiva` |
| `hooks.ts` y `selectores.ts` (demo) | `avancePerfil`, `negociosPorIndustria` y `negocioPermitidoPorDeclaradas` pasan a `puerto/derivados.ts`, con parámetro `VistaConductor`. La demo los reexporta |

---

## 5. Cliente de Supabase y sesión

```ts
// app-real/src/supabase.ts
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';               // [verificar si hace falta con RN 0.88; en web no molesta]
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import type { Database } from './tiposBd';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config';

const fetchConTiempo: typeof fetch = (url, opciones) => {
  const control = new AbortController();
  const t = setTimeout(() => control.abort(), 15_000);
  return fetch(url, { ...opciones, signal: control.signal }).finally(() => clearTimeout(t));
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),  // web: localStorage por defecto
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,   // el ingreso por celular no usa enlaces
    lock: processLock,
  },
  global: { fetch: fetchConTiempo },
});

if (Platform.OS !== 'web') {      // solo en el celular (etapa de tiendas); en el navegador ya es automático
  AppState.addEventListener('change', (s) => (s === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()));
}
```

Este código sigue la guía oficial de React Native / Expo de Supabase (`examples/auth/quickstarts/react-native/lib/supabase.ts`), revisada hoy con `search_docs`.

- **`config.ts`** lee `process.env.EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `EXPO_PUBLIC_CODIGOS_DE_PRUEBA`. **Lanza un error** si falta alguna, si la clave empieza con `sb_secret_` o si es un JWT con `role: service_role`. Las variables se leen solo dentro de `app-real/src` [verificar que Metro las reemplace también en archivos de `watchFolders`; por eso no se leen allí].
- **Sesión:**
  - El access token dura 1 hora y se renueva solo.
  - `onAuthStateChange` alimenta la tienda: `SIGNED_IN` → leer el perfil; `SIGNED_OUT` → limpiar la tienda y los borradores e ir a la Bienvenida.
  - **Dentro del callback no se llama a Supabase con `await`**: se agenda con `setTimeout(..., 0)`, porque la documentación advierte que puede trabarse.
- **Cerrar sesión:**
  1. `supabase.auth.signOut({ scope: 'local' })`. El valor por defecto, `global`, cerraría la sesión en todos los dispositivos.
  2. `borrarTodosLosBorradores()` y borrar `sessionStorage['dale-app-ingreso']`.
  3. `router.replace('/conductor/bienvenida')`.
- **Celular perdido:** en el plan Free la sesión no vence. Cifrar la sesión (LargeSecureStore) queda para la etapa de tiendas.
- **Sin TanStack Query:** con zustand alcanza para 2 lecturas y unas 7 escrituras.

---

## 6. Ingreso

### 6.1 Configuración de Auth (la hace la dueña; sección 17)

Estado de hoy, leído en `/auth/v1/settings`:
- Phone apagado y registro abierto.
- `phone_autoconfirm=false`, es decir, confirmación del teléfono encendida.
- `sms_provider=twilio`.
- 0 usuarios.

Qué hay que configurar y por qué:
- **Hace falta un proveedor de SMS** aunque a los números de prueba no se les envíe nada (guía oficial `testing-auth-flows`). Se usa **Twilio con valores de relleno**: `NewTwilioProvider` solo revisa que los campos no estén vacíos, y a un número de prueba no se le llama al proveedor (código fuente de Auth, `internal_api_phone.go`). Que el panel en la nube acepte los valores de relleno está por verificar [verificar]. **Plan B:** una cuenta gratis de Twilio cuyas claves pega la dueña en el panel.
- **Efecto útil:** un número que **no** está en la lista no puede entrar. Twilio rechaza la credencial falsa y Auth responde 422 `sms_send_failed`.
- **WhatsApp:** el canal `whatsapp` solo pasa la validación con Twilio o Twilio Verify (`IsValidMessageChannel`), y eso vale también para los números de prueba.
- **Espera entre códigos:** 60 s entre dos códigos al mismo número (`Sms.MaxFrequency`). La espera se revisa **antes** que el número de prueba, así que también corre para ellos. Si no se respeta: 429 `over_sms_send_rate_limit`.
- **Número de prueba:** formato `569XXXXXXXX=NNNNNN`. El código no vence hasta la fecha «Valid Until».
- **Nunca apagar la confirmación del teléfono.** Con autoconfirm, el trigger crearía la cuenta sin que nadie revise el código.

### 6.2 A1 Bienvenida
No escribe nada. «Soy conductor» e «Ingresar» llevan a `/conductor/celular`. «Tengo vehículos» se oculta [por confirmar].

### 6.3 A2 Celular
- **Formato:** la persona escribe `9 1234 5678` (`celularValido` exige `/^9\d{8}$/`) y se envía `'+569' + 8 dígitos`.
- **Llamada:** `supabase.auth.signInWithOtp({ phone, options: { channel: 'whatsapp' } })`. Auth crea `auth.users` con `phone_confirmed_at` vacío; **todavía no hay fila en `cuentas`** (probado).
- **Si sale bien:** se guarda `{ celular, pedidoEn, canal }` en `sessionStorage['dale-app-ingreso']`, para que una recarga en A3 no pierda el número ni la cuenta regresiva, y se va a A3.
- **Errores** (por `error.code`):
  - `sms_send_failed`: con `EXPO_PUBLIC_CODIGOS_DE_PRUEBA=1`, «Por ahora solo pueden entrar los celulares del equipo.»; sin la variable, «No pudimos enviar el código. Inténtalo de nuevo.» [por confirmar].
  - `over_sms_send_rate_limit`: «Espera N segundos para pedir otro código.» (N sale del mensaje; si no se puede leer, 60).
  - `phone_provider_disabled`: «El ingreso con celular no está disponible. Avísale al equipo.»
  - `over_request_rate_limit`: «Demasiados intentos. Espera unos minutos.»
  - Error de red o tiempo agotado: «Revisa tu conexión e inténtalo de nuevo.»

### 6.4 A3 Código
- **Verificar:** `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`, con el mismo `type` para WhatsApp y SMS (código fuente de Auth). Con eso Auth anota `phone_confirmed_at` y el trigger `dale_contacto_sincronizar_cuenta`, que está encendido en el proyecto (`tgenabled='O'`), crea `cuentas(id, celular '+569…', celular_verificado_en)`.
- **Errores:**
  - `otp_expired` o 403: «El código no es correcto o ya venció.», en el texto de error de las cajas.
  - 429: el mismo mensaje de espera de A2.
- **«Reenviar por WhatsApp» y «Recibir el código por SMS»:** llaman a `signInWithOtp` con `whatsapp` o `sms`. La cuenta regresiva arranca en **60** (`entorno.esperaReenvioSegundos`), contada desde `pedidoEn`. El botón de SMS queda activo como en la maqueta: si se pulsa antes de los 60 s, llega el 429 y se muestra el aviso de espera.
- **Después de verificar** (la acción `verificarCodigo` devuelve el destino):
  1. Lee su fila de `cuentas`. Si no está, reintenta una vez tras 1 s. Si sigue sin estar: `signOut({ scope: 'local' })` y el mensaje «No pudimos crear tu cuenta. Avísale al equipo.» Esto pasa si el trigger falló, por ejemplo por un número que ya tiene otra cuenta: el trigger solo deja un aviso.
  2. Si hay fila en `conductores` → `'inicio'`.
  3. Si están aceptados todos los textos vigentes obligatorios → `'paso1'`.
  4. Si no → `'autorizaciones'`.
- Se borra `sessionStorage['dale-app-ingreso']` y se muestra el aviso «Celular verificado.», como hoy.

### 6.5 A4 Antes de empezar
- **Textos:** se leen con `textos_autorizacion` `select id, clave, version, obligatoria` filtrando `vigente = true` y `para_quien in ('conductor','todos')`. El filtro es explícito porque alguien del equipo ve todas las versiones.
- **Casilla → clave:**

| Casilla | Clave |
|---|---|
| `terminos` | `terminos_privacidad` |
| `compartir` | `compartir_ficha` |
| `revision` | `revision_documentos` |
| `mensajes` | `normas_mensajes` |

- **Validación encendida:** hay que marcar las 4 («Marca las 4 autorizaciones para continuar.»).
- **Guardar:**
  1. Se leen las propias vigentes: `consentimientos select texto_autorizacion_id .eq('cuenta_id', uid).is('revocado_en', null)`.
  2. Se **insertan solo las que faltan**: `insert([{ cuenta_id: uid, texto_autorizacion_id }])`, por columnas y sin `id`; `aceptado_en` lo pone el servidor.
  3. **No usar upsert:** `on_conflict=cuenta_id,texto_autorizacion_id` falla porque el índice único es parcial. Un 23505 (`consentimientos_una_activa`) se ignora y se vuelve a leer.
- **Si falta algún texto vigente** (migración no aplicada): «Faltan los textos de autorización. Avísale al equipo.», y no se avanza.
- **Destino:** si ya hay fila en `conductores`, Inicio; si no, Paso 1, como hoy.

### 6.6 Guardia de rutas (`app-real/src/app/conductor/_layout.tsx` + `index.tsx`)

| Estado | Puede ver | Si entra a otra ruta va a |
|---|---|---|
| Sin sesión | bienvenida, celular, codigo | `/conductor/bienvenida` |
| Con sesión y sin autorizaciones vigentes | autorizaciones | `/conductor/autorizaciones` |
| Con autorizaciones y sin fila en `conductores` | autorizaciones, registro/1 | `/conductor/registro/1` |
| Registrado | todo lo demás | (celular y codigo → `/conductor/inicio`) |

- `MarcoCelular` va **sin** `bandaDemo` y sin `BotonDemo`.
- `/` redirige a `/conductor`.

---

## 7. Catálogos: lectura y mapeo

- **Quién los lee:** `anon` o `authenticated` pueden leerlos (política `leer using (true)`). Se cargan al abrir la app, en paralelo con la sesión, con unas 8 consultas.
- **Sin caché en v1:** sin red no se puede entrar igual, y así hay menos piezas [por confirmar].
- **Si fallan:** la Puerta muestra «No pudimos conectarnos · Revisa tu internet e inténtalo de nuevo · Reintentar» (`EstadoVacio`).

```ts
supabase.from('regiones').select('id,nombre,orden').order('orden');
supabase.from('zonas').select('id,region_id,nombre,orden,activa');
supabase.from('comunas').select('id,nombre,nombres_alternativos,region_id,zona_id,activa');           // 346 < 1000 filas
supabase.from('clases_licencia').select('id,codigo,nombre,es_antigua,habilita_clase_b,orden,activa').order('orden');
supabase.from('industrias').select('id,nombre,orden,activo');
supabase.from('tamanos_vehiculo').select('id,nombre,ayuda,orden,activo').order('orden');
supabase.from('negocios').select('id,industria_id,nombre,ejemplo,pregunta_vehiculo,nota,orden,activo, negocio_clases_licencia(clase_licencia_id), negocio_tamanos(tamano_vehiculo_id)');
supabase.from('listas').select('clave, opciones(id,clave,nombre,nombre_corto,orden,activa)').in('clave', ['turno','dia_semana','idioma']);
supabase.from('ajustes').select('id,valor').eq('id','dias_reconfirmar_disponibilidad').maybeSingle(); // solo si se aprueba la migración 2; si no hay fila → 30
```

| Base | Tipo de la app (`datos/tipos.ts`) |
|---|---|
| `regiones(id,nombre,orden)` | `Region { id: String(id), nombre, orden }` |
| `zonas` activas | `Zona { id: String(id), regionId: String(region_id), nombre, orden }` |
| `comunas` activas | `Comuna { id: String(id), nombre, regionId, zonaId, alternativos: nombres_alternativos ?? [] }` |
| `clases_licencia` activas | `ClaseLicencia { codigo, nombre, esAntigua, habilitaClaseB, orden }` (el código es la clave en la app) |
| `industrias` | `Industria { id: String(id), nombre, orden, activo }` |
| `tamanos_vehiculo` activos | `TamanoVehiculo { id: String(id), nombre, ayuda: ayuda ?? '', orden }` |
| `negocios` (todos) | `Negocio { id: String(id), industriaId, nombre, ejemplo, orden, activo, nota, pregunta: pregunta_vehiculo, clases: códigos de negocio_clases_licencia, tamanos: ids de negocio_tamanos }` |
| opciones activas de `turno`, `dia_semana`, `idioma` | `OpcionLista { clave, nombre, corto: nombre_corto ?? undefined }`, en orden. Además se guardan **mapas** `clave → opcion_id` e `opcion_id → (lista, clave)` para escribir y leer |

- **Hoy hay en la base:** 10 clases (A1…D, «A1 antigua», «A2 antigua»), 7 tamaños, 11 negocios (solo Taxi y Taxi ejecutivo activos; los dos piden A1, A2, A3 o A1 antigua), 2 industrias (carga apagada), turno Día/Noche, días Lu…Do e idiomas es/en/pt/fr/ht.
- **Licencias:** `negocio_clases_licencia` ya incluye las clases de todas las respuestas de `pregunta_vehiculo`. Así, «Pide licencia X» (`textoPideLicencia`, con `respuestaVehiculo = null`) da lo mismo que `privado.licencia_habilita_negocio`. Si el panel llegara a cambiar las preguntas sin actualizar esa tabla, la base sigue mandando: el trigger rechaza y la app muestra su mensaje.
- **Inactivos:** se ocultan. Lo ya guardado de un negocio después apagado **no se toca** al guardar (sección 9.4).

---

## 8. Perfil propio: lectura y «pasos listos»

**Regla:** toda lectura de tablas de personas lleva **filtro explícito por el propio id**. Alguien del equipo (por ejemplo, la dueña como administradora) ve por RLS las filas de todos: prueba L1.

```ts
const uid = sesion.user.id;
cuentas:              select('id,celular,celular_verificado_en,email,nombres,primer_apellido,segundo_apellido,estado').eq('id', uid).maybeSingle()
conductores:          select('id,fecha_nacimiento,comuna_id,tiene_estacionamiento,direccion,disponible,disponibilidad_confirmada_en,estado_perfil,estado_verificacion,creado_en').eq('id', uid).maybeSingle()
conductor_licencias:  select('clase_licencia_id,origen').eq('conductor_id', uid)
experiencia_conductor:select('tamano_vehiculo_id,anos').eq('conductor_id', uid)
conductor_negocios:   select('negocio_id').eq('conductor_id', uid)
conductor_opciones:   select('opcion_id').eq('conductor_id', uid)
consentimientos:      select('texto_autorizacion_id').eq('cuenta_id', uid).is('revocado_en', null)
```

**Mapeo a `CuentaUsuario` / `ConductorUsuario`** (tipos de hoy, para no tocar las pantallas):

| Campo de la app | De la base |
|---|---|
| `cuenta.celular` | `'+56912345678'` → `'1234 5678'` (8 dígitos con espacio). Sin sesión: el número de `dale-app-ingreso` |
| `cuenta.celularVerificado` | `celular_verificado_en != null` |
| `cuenta.correo`, `nombres`, `apellido1`, `apellido2` | `email`, `nombres`, `primer_apellido`, `segundo_apellido` (null → `''`) |
| `cuenta.autorizaciones.{terminos,privacidad,compartirFicha}` | true si hay consentimiento vigente de `terminos_privacidad` (los dos primeros) y de `compartir_ficha` |
| `conductor.registrado` / `registradoEl` | existe fila / `creado_en` |
| `conductor.fechaNacimiento` | `'1990-03-14'` → `'14/03/1990'` |
| `conductor.clasesDeclaradas` / `clasesRevisadas` | códigos de las filas `origen='declarada'` / `'revisada'` |
| `conductor.comunaId` | `String(comuna_id)` o null |
| `conductor.direccion`, `depto` | `''` (no se usan en v1) |
| `conductor.tieneEstacionamiento` | `tiene_estacionamiento ?? false` |
| `conductor.experiencia` | `{ [String(tamano_vehiculo_id)]: anos }` |
| `conductor.idiomas` / `turnos` / `dias` | claves de `conductor_opciones` según su lista |
| `conductor.negocios` | `String(negocio_id)` |
| `conductor.disponible`, `disponibilidadConfirmadaEn` | igual |
| `conductor.estadoPerfil`, `estadoVerificacion` | igual (en v1 siempre `incompleto` / `sin_documentos`) |

**Pasos listos.** La base no los guarda ni calcula `estado_perfil` (solo lo escribe el sistema y en v1 queda `incompleto`). La app los deduce **solo para mostrar el avance**:

| Sección | Lista si… |
|---|---|
| `datos` (Paso 1) | hay fila en `conductores` **y** nombres, primer apellido y correo con texto **y** al menos una clase declarada |
| `direccion` (Paso 2) | `comuna_id` no nulo **y** `tiene_estacionamiento` no nulo |
| `experiencia` (Paso 3) | hay al menos 1 fila en `experiencia_conductor` **o** al menos 1 idioma **o** el Paso 4 está listo [por confirmar; MD36 pendiente] |
| `trabajo` (Paso 4) | al menos 1 negocio **y** 1 turno **y** 1 día |
| `documentos` | siempre `false` en v1 |

`pasoActual` es el primer paso que falta, entre 1 y 4.

**Después de cada guardado se vuelve a leer el perfil completo.** Son 7 consultas pequeñas en paralelo, y así la base es la única fuente de verdad: por ejemplo, si el trigger quitó negocios al quitar una clase, la app lo ve.

---

## 9. Pantalla por pantalla, campo por campo

`uid = auth.uid()`. Todas las escrituras se hacen con la sesión del conductor (rol `authenticated`). Cada acción se arma primero como un **plan de escritura puro** (lista ordenada de operaciones), que es lo que prueban las pruebas unitarias. Un **ejecutor** lo corre en orden con supabase-js.

- Las operaciones se pueden repetir sin dejar nada duplicado: si un paso falla a la mitad, la persona reintenta y queda bien.
- Si una operación falla, se detiene y se muestra el error. El borrador sigue en la pantalla.

### 9.1 Paso 1 · Tus datos

| Campo en pantalla | Validación de la app (siempre encendida) | Tabla.columna | Escritura |
|---|---|---|---|
| Nombres * | con texto | `cuentas.nombres` | `update` (trim) |
| Primer apellido * | con texto | `cuentas.primer_apellido` | `update` (trim) |
| Segundo apellido (si tienes) | — | `cuentas.segundo_apellido` | `update` (trim; vacío → `null`) |
| Fecha de nacimiento * `dd/mm/aaaa` | fecha real, no futura, 18 años o más (`errorFecha` de hoy) | `conductores.fecha_nacimiento` | `'dd/mm/aaaa'` → `'aaaa-mm-dd'` |
| Correo electrónico * | `RE_CORREO` de hoy | `cuentas.email` | `update` (trim). Queda sin confirmar (`email_confirmado_en` null, lo pone el trigger). **No** usar `auth.updateUser({ email })` |
| Clases de licencia * | al menos 1 | `conductor_licencias (conductor_id, clase_licencia_id, origen='declarada')` | agregar las nuevas → quitar las desmarcadas |
| Disponible para trabajar | — (encendido por defecto, decidido) | `conductores.disponible` | en el primer insert, más `disponibilidad_confirmada_en` |
| Celular verificado (solo lectura) | — | `cuentas.celular`, `celular_verificado_en` | no se escribe (el trigger lo bloquea) |

Plan, en este orden:

1. **Cuenta.** `supabase.from('cuentas').update({ email, nombres, primer_apellido, segundo_apellido }).eq('id', uid).select('id')`. Si vuelven 0 filas: «No encontramos tu cuenta. Vuelve a entrar.»
2. **Conductor.**
   - Si `!registrado`: `insert({ id: uid, fecha_nacimiento, disponible, disponibilidad_confirmada_en: new Date().toISOString() }).select('id')`. El servidor guarda `now()` en la fecha y fuerza `estado_perfil='incompleto'` (pruebas P3 y P7). Si da 23505 (`conductores_pkey`), porque quedó de un intento anterior a medias, se hace el update.
   - Si ya está registrado: `update({ fecha_nacimiento, disponible }).eq('id', uid)`, **sin** `disponibilidad_confirmada_en`. Si se manda un valor distinto, la base la reconfirma.
3. **Clases nuevas:**
   ```ts
   upsert(nuevas.map(c => ({ conductor_id: uid, clase_licencia_id: idDe(c), origen: 'declarada' })),
          { onConflict: 'conductor_id,clase_licencia_id,origen', ignoreDuplicates: true })
   ```
4. **Clases desmarcadas:** `delete().eq('conductor_id', uid).eq('origen','declarada').in('clase_licencia_id', quitadas)`. El trigger quita los negocios que ya no habilita ninguna clase declarada (prueba P15). Por eso las nuevas van **antes**.
5. Volver a leer el perfil.
6. **Navegación, como hoy:**
   - Editando: aviso «Cambios guardados.» y vuelta a Perfil.
   - «Guardar y continuar»: Paso 2.
   - «Guardar y terminar después»: Inicio.
   - Si es la primera vez, el aviso «Listo, ya quedaste registrado.».

Errores de la base que se muestran tal cual (vienen en español): «Tienes que tener 18 años o más.» y «La fecha de nacimiento no puede ser futura.» (23514). La base cuenta con la fecha de Chile y el teléfono con su propia hora: cerca de los 18 años puede rechazar algo que la app aceptó.

### 9.2 Paso 2 temporal · ¿Dónde vives? (`Paso2Comuna.tsx`)

**Qué se mantiene igual que el Paso 2 aprobado:**
- El encabezado («Paso 2 de 5») y el título «¿Dónde vives?».
- La lista desplegable con el mismo estilo, que se maneja con las flechas, Enter y Esc.
- La tarjeta de la comuna.
- El interruptor «Tengo estacionamiento seguro para el vehículo».
- El botón «Continuar» o «Guardar cambios».

**Qué cambia** [por confirmar]:

| Maqueta | v1 |
|---|---|
| Subtítulo «Con tu dirección sabemos tu comuna exacta y te mostramos vehículos cerca.» | «Con tu comuna te mostramos vehículos cerca.» |
| Campo «Tu dirección *» (calle y número), placeholder «Calle y número» | Campo «Tu comuna *», placeholder «Escribe tu comuna» |
| Sugerencias de direcciones + «Sugerencias de Google Maps» | Comunas activas que calzan con lo escrito: sin tildes (`sinTildes`), con `nombres_alternativos`, primero las que empiezan así y después las que lo contienen; hasta 6, desde 2 letras. Cada fila: «Ñuñoa» / «Región Metropolitana de Santiago» (`textoRegion`). Si no hay: «No encontramos esa comuna. Revisa cómo la escribiste.» |
| Ayuda «Escribe tu calle y número, y elige tu dirección de la lista.» | «Escribe tu comuna y elígela de la lista.» |
| Errores «Ingresa tu dirección.» / «Elige tu dirección de la lista.» | «Ingresa tu comuna.» / «Elige tu comuna de la lista.» |
| Campo «Depto, casa o block (opcional)» | No se muestra |
| Tarjeta «Tu comuna (se completa con tu dirección)» + insignia «Verificada» | «Tu comuna», con «Ñuñoa · zona» y la región, sin insignia |
| «Tu dirección es privada. Solo tú decides compartirla tras un match.» | No se muestra (no se pide dirección) |
| Interruptor de estacionamiento encendido (dato de ejemplo) | Parte apagado, o con el valor guardado [por confirmar] |

**Escritura:** `update({ comuna_id: Number(comunaId), tiene_estacionamiento, direccion: null, direccion_detalle: null, google_place_id: null }).eq('id', uid).select('id')`. Pruebas P8 y P9.

- La zona y la región **no** se guardan en `conductores`: salen de `comunas.zona_id` y `comunas.region_id`.
- Regla temporal, anotada en el modelo: **dirección vacía = comuna elegida de la lista, no verificada**.
- **Navegación:** Paso 3, o vuelta a Perfil si está editando.

### 9.3 Paso 3 · Tu experiencia

| Campo | Base | Escritura |
|---|---|---|
| ¿Qué vehículos has manejado? (7 categorías) + años de experiencia (1 a 50, parte en 1 al marcar, como en la maqueta) | `experiencia_conductor (conductor_id, tamano_vehiculo_id, anos)`, única por (conductor, tamaño) | `upsert(marcados.map(t => ({ conductor_id: uid, tamano_vehiculo_id: Number(t), anos })), { onConflict: 'conductor_id,tamano_vehiculo_id' })` sin `id` (el permiso de INSERT es por columnas); después `delete().eq('conductor_id', uid).in('tamano_vehiculo_id', desmarcados)` |
| Idiomas que hablas (opcional) | `conductor_opciones` con opciones de la lista `idioma` | agregar las nuevas con `upsert(..., { onConflict: 'conductor_id,opcion_id', ignoreDuplicates: true })`; quitar **solo** las de la lista idioma desmarcadas |

- Pruebas P10 y P11.
- La base acepta 0 años; la app nunca manda 0, porque mantiene el mínimo de 1 de la maqueta.
- **Valores iniciales:** sin nada marcado (la demo trae Vehículo liviano 5 y Van 2, y Español). Si «Español» viene marcado está pendiente (MD51) [por confirmar]; por defecto, no.
- **Navegación:** Paso 4, o Perfil si está editando.

### 9.4 Paso 4 · ¿Qué trabajo buscas?

| Campo | Base | Escritura |
|---|---|---|
| Negocio * (solo activos con industria activa; en gris «Pide licencia …» los que la licencia declarada no permite) | `conductor_negocios (conductor_id, negocio_id)` | nuevos = marcados ∩ permitidos ∩ visibles − guardados → `upsert(..., { onConflict: 'conductor_id,negocio_id', ignoreDuplicates: true })`; quitados = (guardados ∩ visibles) − marcados → `delete().in('negocio_id', ...)`. Lo guardado que **no** está visible (negocio apagado) no se toca |
| Preferencia de turno * (Día, Noche) | `conductor_opciones`, lista `turno` | igual que idiomas |
| Días que puedes trabajar * (Lu…Do) | `conductor_opciones`, lista `dia_semana` | igual que idiomas |

- Pruebas P12 a P14.
- Errores de la base que se muestran tal cual: «Tu licencia no habilita para ese negocio.» y «Ese negocio no está disponible.»
- Con solo Taxi y Taxi ejecutivo activos, quien declare solo clase B ve los dos en gris, junto al aviso que ya trae la maqueta («Con las clases que marcaste en el Paso 1 no puedes trabajar en estos negocios.»), y no completa el Paso 4. Es lo esperado.
- **Navegación (v1):**
  - «Continuar» → `irAInicioConductor()` + aviso «Listo, tus datos quedaron guardados.» [por confirmar].
  - Editando → Perfil.

### 9.5 Disponibilidad (Inicio, Perfil y E4)
- **Interruptor:**
  - Encender: `update({ disponible: true, disponibilidad_confirmada_en: new Date().toISOString() })`.
  - Apagar: `update({ disponible: false })`. Igual que `cambiarDisponible` de la demo.
- **E4 «Sí, sigo disponible»:** `update({ disponible: true, disponibilidad_confirmada_en: ahora })`. El servidor pone `now()` (prueba D1).
- **«Pausar por ahora»:** igual que apagar.
- **«Te pediremos confirmarlo cada N días»:** N sale de `entorno.diasReconfirmar`. No hay proceso diario que pause a quien no responde (Etapa futura). El aviso automático solo aparece en vistas de verificado, que en v1 no se alcanzan.

### 9.6 Perfil · editar
«Mis datos», «Dónde vivo», «Mi experiencia» y «El trabajo que busco» abren `registro/N?editar=1`. Hacen las mismas escrituras y no usan borradores (como hoy).

---

## 10. Errores, carga y sin conexión

- **Puerta (`app-real/src/pantallas/Puerta.tsx`, en el layout raíz):**
  - Mientras cargan las fuentes, se restaura la sesión, se leen los catálogos y, si hay sesión, el perfil, muestra `Cargando`.
  - Si no puede conectarse: `EstadoVacio` con «No pudimos conectarnos · Revisa tu internet e inténtalo de nuevo · Reintentar».
  - Si la cuenta falta: sección 6.4.
- **Tiempo máximo:** 15 s por llamada (`fetchConTiempo`).
- **Sin cola sin conexión:** si un guardado falla, aparece «No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.» y lo escrito sigue en pantalla.
- **`errores.ts` traduce:**

| Origen | Código | Texto |
|---|---|---|
| Postgres | `23514` | el mensaje de la base tal cual |
| Postgres | `42501`, o RLS «row-level security» | «No tienes permiso para hacer esto.» (y se anota en consola) |
| Postgres | `23505` | se maneja en cada caso: consentimientos y conductores |
| Postgres | `23503` (FK) | «Esa opción ya no está disponible. Vuelve a abrir la pantalla.» |
| PostgREST | `PGRST301` / JWT vencido | se intenta `refreshSession` una vez; si falla, cerrar sesión |
| Auth | (códigos de la sección 6) | (textos de la sección 6) |
| Red | `TypeError`, `AbortError` | texto de conexión |

- **Sin analítica de terceros.**

---

## 11. Lo que ve el conductor después del Paso 4 y lo que se oculta

**Inicio (`app-real/src/pantallas/InicioV1.tsx`):**
- Saludo con iniciales e insignia «Perfil incompleto» (amarilla, como hoy).
- Siempre `VistaIncompleta`, porque en v1 `estado_perfil` es `incompleto`, con `documentos='proximamente'`:
  - **Si falta algún paso de 1 a 4:** igual que la maqueta. La tarjeta oscura dice «Ya estás registrado» / «Aún no te registras», tiene la barra «N de 5 pasos listos · %» y el botón «Continuar mi perfil» lleva al primer paso que falta. Las filas de los pasos 1 a 4 llevan a su paso.
  - **Si solo faltan los documentos:**
    - Tarjeta: «Ya estás registrado» / «Ya guardaste tus datos. Falta un paso: tus documentos, que pronto podrás subir aquí.» [por confirmar].
    - Barra «4 de 5 pasos listos · 80%».
    - **Sin botón.**
  - **Fila «Tus documentos»:** estado «Próximamente», círculo punteado, sin flecha y sin enlace.
  - **Nota:** «Mientras tu perfil esté incompleto, no apareces en los matches.» Se quita «Te recordaremos por WhatsApp o correo…», porque no hay recordatorios en v1 [por confirmar].

**Barra inferior:** solo **Inicio** y **Perfil** [por confirmar]. Es un layout propio en `app-real/src/app/conductor/(pestanas)/_layout.tsx` con `BarraInferior`.

**Perfil (`PerfilBase`):**
- Encabezado con avatar, nombre e insignia «Perfil incompleto».
- Tarjeta «Disponible para trabajar» + «Confirmar ahora» → E4.
- «Mi perfil»: 4 filas.
- «Ayuda»: «Centro de ayuda» (las 4 preguntas de hoy) y «Términos y privacidad».
- «Cerrar sesión».
- **Se ocultan** [por confirmar]: el grupo «Seguridad y privacidad» (Mis documentos, Quién recibió mis datos, Conversaciones bloqueadas) y «Eliminar mi cuenta». La base no deja borrar a quien aceptó autorizaciones (R19/MD23), y cómo se borran los datos de prueba lo decide la dueña.

**Bienvenida:** sin «Tengo vehículos».

**Textos que cambian respecto de la maqueta (todos [por confirmar]):**

| Dónde | Maqueta | v1 |
|---|---|---|
| A3 nota sobre «Verificar» | «Demo: cualquier código de 6 dígitos» | «Versión de prueba: usa el código que te dio el equipo.» (solo con `EXPO_PUBLIC_CODIGOS_DE_PRUEBA=1`) |
| A3 cuenta regresiva | 0:30 | 1:00 |
| A2 nota | «Demo: Usar un número de ejemplo» | (no aparece) |
| Paso 1 y Paso 2 | «Demo: Rellenar con datos de ejemplo» / «Usar una dirección de ejemplo» | (no aparece) |
| A4 ventana de Términos y Política | «En la app real aquí van… En la demo no hay texto legal.» | «Los Términos y la Política de privacidad están en preparación con un abogado. Esta es una versión de prueba para el equipo.» |
| Perfil ventana «Términos y privacidad» | «…En la demo todavía no están.» | el mismo texto de arriba |
| Perfil diálogo «¿Cerrar sesión?» | «…En la demo, tus datos quedan guardados.» | «Para volver a entrar usarás tu celular y un código.» |
| Paso 2 | sección 9.2 | sección 9.2 |
| Paso 4 «Continuar» | va al Paso 5 | va a Inicio + aviso |
| Inicio | sección 11 | sección 11 |

**No hay franja «Versión de prueba»** arriba de la pantalla, para respetar las pantallas aprobadas. Es opcional si la dueña la quiere.

---

## 12. Cambios de base de datos

### 12.1 Para los pasos 1 a 4 y el ingreso: NINGUNO
La Etapa 1 ya guarda todo lo de la sección 9, con su RLS, sus permisos por columna y sus triggers. Está probado en local (sección 12.4). La cuenta nace sola con el trigger desde `auth.users`.

### 12.2 Migración 1 · NECESARIA · `supabase/migrations/20261110120000_app_conductor_v1_textos_prueba.sql`
Copia exacta: `/tmp/claude-0/-home-user-appconductores/a49116f8-7c86-54b9-8624-19dd22438642/scratchpad/app-real/espec/migrations/20261110120000_app_conductor_v1_textos_prueba.sql`

```sql
-- =====================================================================
-- Dale Contacto · App real del conductor v1 (pasos 1 a 4)
-- Textos de autorización de PRUEBA para la pantalla "Antes de empezar" (A4).
--
-- POR QUÉ: con public.textos_autorizacion vacía, la política
-- consentimientos.agregar_propio (exige un texto vigente) no deja guardar
-- ninguna autorización. Sin esto, la app no puede registrar lo que la
-- persona aceptó.
--
-- QUÉ SON: copia literal de las 4 casillas de la maqueta aprobada
-- (aplicacion/src/pantallas/ingreso/Autorizaciones.tsx, texto de cada
-- "etiqueta"). Versión 'prueba-1'. PROVISORIOS: el abogado no los revisó
-- (P1) y no existen todavía los Términos ni la Política de privacidad.
-- Solo para las pruebas internas de la dueña y su equipo.
--
-- CUANDO LLEGUEN LOS DEFINITIVOS (otra migración): para cada clave, poner
-- esta versión en vigente = false y agregar la versión 'v1' con
-- vigente = true y exige_aceptar_de_nuevo = true. Esta no se borra: hay
-- aceptaciones que la apuntan.
--
-- Corre como sistema (postgres): el trigger proteger no pone vigente_desde
-- para el sistema, por eso va a mano.
-- =====================================================================

insert into public.textos_autorizacion
  (clave, nombre, texto, enlace, version, para_quien, obligatoria, exige_aceptar_de_nuevo, vigente, vigente_desde, orden)
values
  ('terminos_privacidad', 'Términos y privacidad',
   'Acepto los Términos y la Política de privacidad, y declaro ser mayor de 18 años.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 1),
  ('compartir_ficha', 'Compartir ficha y contacto',
   'Autorizo que, cuando haga match, se compartan mi ficha y mi contacto (teléfono y email) con ese titular.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 2),
  ('revision_documentos', 'Revisión de documentos',
   'Revisión de mis documentos: un sistema automático los revisa primero; las dudas y los rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 3),
  ('normas_mensajes', 'Normas de los mensajes',
   'Mensajes: me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y bloquear.',
   null, 'prueba-1', 'conductor', true, false, true, now(), 4);
```

Las claves son las que ya propone `docs/modelo-datos.json` (descripción de `textos_autorizacion.clave`).

### 12.3 Migración 2 · RECOMENDADA · `supabase/migrations/20261110120100_app_conductor_v1_ajustes_publicos.sql`
Copia exacta: `/tmp/claude-0/-home-user-appconductores/a49116f8-7c86-54b9-8624-19dd22438642/scratchpad/app-real/espec/migrations/20261110120100_app_conductor_v1_ajustes_publicos.sql`

```sql
-- =====================================================================
-- Dale Contacto · App real del conductor v1 (pasos 1 a 4)
-- Ajustes que la app puede leer (RECOMENDADA, se puede aprobar aparte).
--
-- POR QUÉ: hoy public.ajustes solo la lee el equipo. El Paso 1, Inicio,
-- Perfil y "¿Sigues buscando trabajo?" muestran "cada N días"; sin esto,
-- N queda fijo en el código (30), contra la regla "todo configurable".
--
-- QUÉ HACE: una columna "publico" (por defecto false) y una política que
-- deja leer a anon y authenticated solo las filas marcadas. Escribir sigue
-- siendo solo del administrador. Nunca se marca público un ajuste sensible.
-- =====================================================================

alter table public.ajustes add column publico boolean not null default false;
comment on column public.ajustes.publico is
  'Si la app lo puede leer sin ser del equipo (también sin sesión). Nunca para ajustes sensibles.';

-- anon no tenía ningún permiso en ajustes; ahora lee, pero la RLS solo le
-- muestra las filas públicas. authenticated ya tenía select.
-- Una sola política de lectura (como en textos_autorizacion): dos políticas
-- permisivas para el mismo rol y acción las marca el asesor de rendimiento.
grant select on table public.ajustes to anon;
drop policy leer_equipo on public.ajustes;
create policy leer on public.ajustes for select to anon, authenticated
  using (publico or (select privado.es_equipo()));

insert into public.ajustes (id, valor, descripcion, publico) values
  ('dias_reconfirmar_disponibilidad', '30'::jsonb,
   'Cada cuántos días se le pide al conductor confirmar que sigue disponible para trabajar (propuesta).',
   true);
```

- **Si no se aprueba:** la app usa 30 fijo, y en las pruebas se quitan los bloques J y E3.
- **La migración no crea funciones,** así que no necesita `revoke` de EXECUTE (prueba E2).

### 12.4 Pruebas nuevas · `supabase/pruebas/app_conductor_v1_pruebas.sql`
Copia exacta: `/tmp/claude-0/-home-user-appconductores/a49116f8-7c86-54b9-8624-19dd22438642/scratchpad/app-real/espec/pruebas/app_conductor_v1_pruebas.sql` (texto completo en el Anexo A).

Repiten en SQL, como `authenticated`, el plan de escritura de cada pantalla. **37 pruebas, todas en verde** en Postgres 16 local (9-nov), en una base temporal que después se borró. El cluster `pruebas` quedó apagado otra vez.

| Bloque | Pruebas | Qué comprueba |
|---|---|---|
| T | T1–T4 | Textos de prueba |
| I | I1–I3 | Ingreso y cuenta |
| A | A1–A3 | Autorizaciones |
| P | P1–P15 | Pasos 1 a 4, con orden de clases y negocios |
| D | D1 | Disponibilidad |
| L | L1–L3 | La app filtra por su propio id |
| J | J1–J5 | Ajustes públicos |
| E | E1–E3 | Estructura |

**Orden para correrlas** (lo que se agrega a `supabase/README.md`). `etapa1_pruebas.sql` va **antes** de las migraciones nuevas, porque comprueba el estado exacto de la Etapa 1 (D8: 0 textos y 1 ajuste; E5 y N2: anon sin permisos en ajustes). Termina en ROLLBACK, así que no deja nada.

```bash
pg_ctlcluster 16 pruebas start && su postgres -c "createdb -p 5499 dale"
cat supabase/pruebas/auth_simulado.sql supabase/migrations/20261102120000_etapa1_esquema.sql \
    supabase/migrations/20261102120100_etapa1_datos_iniciales.sql \
  | su postgres -c "psql -p 5499 -d dale -X -q -v ON_ERROR_STOP=1"
su postgres -c "psql -p 5499 -d dale -X -q -v ON_ERROR_STOP=1" < supabase/pruebas/etapa1_pruebas.sql
cat supabase/migrations/20261110120000_app_conductor_v1_textos_prueba.sql \
    supabase/migrations/20261110120100_app_conductor_v1_ajustes_publicos.sql \
  | su postgres -c "psql -p 5499 -d dale -X -q -v ON_ERROR_STOP=1"
su postgres -c "psql -p 5499 -d dale -X -q -v ON_ERROR_STOP=1" < supabase/pruebas/app_conductor_v1_pruebas.sql
# Debe terminar en: FIN: todas las pruebas de la app del conductor v1 pasaron.
```

Los archivos se pasan por la entrada estándar porque el usuario `postgres` no lee la carpeta temporal del agente.

### 12.5 Cómo se aplican
1. Solo después del visto bueno de la dueña.
2. Se aplica con `apply_migration` del conector, cada migración por separado, y después `get_advisors` (seguridad y rendimiento) para confirmar que no hay avisos nuevos.
3. Supabase les pone su propio número de versión. Las de la Etapa 1 ya difieren (20261102172048 / 20261102180050), como avisa el README.
4. Después se regeneran los tipos con `generate_typescript_types` → `app-real/src/tiposBd.ts`.

### 12.6 Qué cambia en `docs/modelo-datos.json` (y `docs/modelo-datos-cambios.md`)
- `textos_autorizacion.version`: en la descripción, «en la etapa de prueba: 'prueba-1' (textos de la maqueta, sin revisión del abogado; se reemplazan por 'v1' con exige_aceptar_de_nuevo)».
- `ajustes`:
  - Campo nuevo `publico` (`si_no`, obligatorio, «Si la app lo puede leer sin ser del equipo»).
  - En la descripción de `id`, `dias_reconfirmar_disponibilidad` pasa a «cargado, 30, público (propuesta)». Solo si se aprueba la migración 2.
- `conductores.direccion`:
  - `obligatorio: false`, con la nota «Temporal (9-nov): vacía; el conductor elige la comuna de una lista hasta que exista la cuenta de Google Cloud».
  - `comuna_id`: «temporal: la elige el conductor de una lista (no verificada); con Google se completará desde la dirección».
  - Regla nueva: «direccion vacía = comuna elegida de la lista, no verificada».
- `conductores.estado_perfil`: nota «v1: la app calcula el avance solo para mostrarlo; en la base queda 'incompleto' hasta la Etapa 3».
- `cambios`: entrada `n: 40`, con la fecha del día en que se aplique, que resume lo anterior y el «Paso 2 temporal».
- `pendientes` MD36: nota «en v1 el Paso 3 cuenta como listo con experiencia o idiomas, o con el Paso 4 listo».
- **Además** (al aprobarse):
  - `docs/terminos-y-privacidad.md`: textos provisorios aceptados por el equipo, que deberán volver a aceptarse; datos reales del equipo guardados antes de los Términos; números de prueba.
  - `docs/plan.md`.
  - `supabase/README.md`: tabla de archivos y orden de las pruebas.
  - `CLAUDE.md`, «Decisiones tomadas».

### 12.7 Futuro (no ahora)
- Funciones `public.guardar_paso_1` a `guardar_paso_4` (`SECURITY INVOKER`, con `revoke` y `grant` explícitos), para guardar cada paso en una sola transacción. La capa real cambia por dentro y las pantallas no.
- Un marcador de «Paso 3 guardado» si se elige MD36 b.
- Un trigger que rechace comunas, tamaños o clases inactivas.
- El hook «Send SMS» cuando se elija proveedor. Ojo: el hook no recibe el canal [verificar].
- Recordar que cada tabla nueva de `public` nace con ALL para `anon` y `authenticated` (se ve en `etmday_leads`) y hay que recortarla.

---

## 13. Variables de entorno y claves

`app-real/.env.example` (se sube al repo):
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_CODIGOS_DE_PRUEBA=1
```

`app-real/.env.local` (no se sube; ya lo ignora `.env*.local` en el `.gitignore` raíz):
- `EXPO_PUBLIC_SUPABASE_URL=https://zflalaqimacsnlvurzeb.supabase.co`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_swZW3yseA95sHM33xLy9kw_7g0-k8yj`. Es la clave publicable `default`, activa. Es pública por diseño y la protege la RLS. Se confirma con `get_publishable_keys`.
- `EXPO_PUBLIC_CODIGOS_DE_PRUEBA=1` mientras se usen números de prueba.

Reglas:
- **No usar la clave anon antigua (JWT):** según Supabase funciona hasta fines de 2026.
- Todo lo que va en `EXPO_PUBLIC_` queda a la vista en el paquete.
- `npm run export:web` corre antes `scripts/revisar-sin-demo.mjs` y se detiene si falta una variable o si una parece secreta.
- Orden de carga de `.env` en SDK 58 [verificar].

---

## 14. Publicación

- **Sitio aparte**, que no es el del mockup (`dale-contacto-mockup`, id `74e48a73-…`):
  - Nombre propuesto en el Netlify de la dueña: `dale-contacto-app`.
  - Dirección propuesta: `app.dalecontacto.cl`, con un CNAME `app` hacia `dale-contacto-app.netlify.app` que agrega la dueña en su hosting.
  - [por confirmar las dos]
- **Armado:** `cd app-real && npm run export:web` (= preparar + revisar + `expo export -p web`) deja `app-real/dist`.
  - **El script se niega a publicar con el id del mockup.**
  - Publicar el mockup y el panel no cambia.
- **`public/_redirects`:** `/* /index.html 200`.
- **`public/_headers`** [verificar con el export: `index.html` trae un `<style>` en línea]:
  ```
  /*
    X-Robots-Tag: noindex
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Content-Security-Policy: default-src 'self'; connect-src 'self' https://zflalaqimacsnlvurzeb.supabase.co wss://zflalaqimacsnlvurzeb.supabase.co; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'
  ```
- **Protección:** [por confirmar] **sin** la protección de Netlify, para que el equipo entre desde su celular sin cuenta de Netlify.
  - Lo que impide entrar a otras personas es la lista de números de prueba: los demás números reciben `sms_send_failed`.
  - El sitio queda con noindex y sin enlaces desde otros sitios.
  - Si la dueña prefiere protección, cada persona podría necesitar un puesto en Netlify o un plan con contraseña [verificar].
- **Antes de cada publicación:** la sección 15 completa en verde. Las publica Claude cuando la dueña lo apruebe, como con el mockup.

---

## 15. Plan de pruebas

1. **Mockup intacto (antes de tocar las pantallas):**
   - Capturas con Playwright de A1–A4, B1–B5, Inicio, Perfil y E4 en 390×844, antes y después del cambio de interfaz. Tienen que salir iguales píxel a píxel, salvo animaciones.
   - `typecheck` y `test:match` de `aplicacion`; `typecheck`, `test` y `export:demo` de `panel`, con su revisión «sin panel».
2. **Unitarias** (`app-real/tests`, `node --test`, igual que hoy):
   - `mapeo.test.ts`: filas de la base → `VistaConductor`. Celular `+569…` → 8 dígitos, fecha ISO ↔ dd/mm/aaaa, ids ↔ claves, pasos listos (todos los casos de la sección 8, incluida la regla del Paso 3).
   - `planes.test.ts`: plan de escritura de cada acción.
     - Las clases nuevas van antes que las desmarcadas.
     - Los negocios no visibles no se tocan.
     - `disponibilidad_confirmada_en` va solo en el primer insert y al encender.
     - El segundo apellido vacío → `null`.
     - Solo se tocan opciones de la lista que corresponde.
   - `errores.test.ts`: cada código de la sección 10.
   - `autorizaciones.test.ts`: `TEXTOS_AUTORIZACION` de la pantalla = los textos de la migración 1, leyendo el `.sql`.
   - `config.test.ts`: rechaza `sb_secret_…` y JWT `service_role`.
3. **Contrato con la base:** `supabase/pruebas/app_conductor_v1_pruebas.sql` (sección 12.4). Si cambia el plan de escritura, se actualiza este archivo.
4. **Sin demo:**
   - `scripts/revisar-sin-demo.mjs` recorre los imports desde `app-real/src/app` y falla si llega a algo prohibido (sección 2).
   - Busca en `dist/` y falla si encuentra `dale-demo-datos`, `Demo:`, `EJEMPLO_USUARIO` o nombres de las personas ficticias de `semilla/ficticios.ts`.
5. **Recorrido Playwright local, con la red de Supabase interceptada** (`page.route('https://zflalaqimacsnlvurzeb.supabase.co/**')` con respuestas de ejemplo):
   - Bienvenida → celular → código → Antes de empezar → pasos 1 a 4 → Inicio «4 de 5» → Perfil → editar el Paso 1 → cerrar sesión.
   - Además revisa **la forma de cada pedido**: método, tabla, `on_conflict`, `Prefer: resolution=ignore-duplicates`, columnas enviadas, y que nunca se mande `id` en `consentimientos` ni en `experiencia_conductor`.
   - Casos de error: 429, `sms_send_failed`, `otp_expired`, 23514 con el mensaje de 18 años, y la red caída en mitad del Paso 1 con reintento.
   - En 390 px de ancho y en escritorio.
6. **Contra el Supabase real** (solo si la dueña agrega el número ficticio de Claude):
   - Un recorrido de punta a punta con datos inventados.
   - Después, SELECT para confirmar lo guardado y `get_advisors`.
   - Esa cuenta queda en la base: no se puede borrar a quien aceptó autorizaciones.
7. **Supabase `get_advisors`** después de aplicar cada migración.

---

## 16. Orden de trabajo

| Fase | Qué | Quién | Días [estimación] |
|---|---|---|---|
| F0 | Aprobar esta especificación y la lista «por confirmar»; configurar Phone y los números de prueba; aprobar las migraciones | Dueña | — |
| F1 | Esperar a que termine la reorganización del panel; leer el estado nuevo de `aplicacion/` y `panel/`; capturas «antes» del mockup | Claude | 0,25 |
| F2 | Interfaz de datos + implementación demo + cambios en las pantallas compartidas (sección 4.1), con el mockup idéntico | Claude | 1,5–2 |
| F3 | Carpeta `app-real/` (armado como `panel/`), rutas de la v1, guardia, `config.ts`, cliente, sesión e ingreso (A2, A3, A4) | Claude | 1 |
| F4 | Capa real: catálogos, perfil, planes de escritura, errores, Puerta; `Paso2Comuna`, `InicioV1`, `PerfilBase` | Claude | 2–2,5 |
| F5 | Aplicar las migraciones aprobadas (sección 12.5), tipos de la base, docs (modelo, cambios, README, términos y privacidad, plan, CLAUDE.md) | Claude | 0,5 |
| F6 | Pruebas de la sección 15 (unitarias, sin demo, Playwright interceptado; real si hay número) | Claude | 1,5–2 |
| F7 | Publicar el sitio nuevo; DNS `app`; comprobar con el celular de la dueña | Claude + dueña | 0,5 |
| **Total** | | | **≈ 7–9 días de trabajo** |

**Primera versión que el equipo puede usar:** al terminar F5 con las pruebas unitarias y de contrato (≈ 5 días).

---

## 17. Lo que debe hacer la dueña (sin mandar claves ni códigos por el chat)

1. Leer esta especificación y responder la lista «Por confirmar» (sección 18).
2. En Supabase, proyecto **dale-contacto**, ir a **Authentication → Sign In / Providers** y revisar que esté encendido «Allow new users to sign up» (hoy lo está).
3. Abrir **Phone** y encender «Enable Phone provider».
4. En «SMS provider» elegir **Twilio** y escribir los valores de relleno (no son claves reales):
   - Account SID `AC00000000000000000000000000000000`
   - Auth Token `00000000000000000000000000000000`
   - Message Service SID `MG00000000000000000000000000000000`

   Si el panel no los acepta, avisar. **Plan B:** abrir una cuenta gratis de Twilio y pegar ella misma sus claves en el panel, nunca en el chat.
5. Dejar **encendida** la confirmación del teléfono y no apagarla nunca. «SMS OTP Length» en 6.
6. En «Test Phone Numbers and OTPs», escribir una pareja por persona: `569XXXXXXXX=NNNNNN`.
   - Sin «+» ni espacios, separadas por coma.
   - Códigos de 6 dígitos al azar y distintos para cada persona.
   - Idealmente el celular propio de cada una.
7. En «Test OTPs Valid Until», poner una fecha de aquí a 2 o 3 meses y pulsar **Save**.
8. Dar a cada persona su código en privado y escribirme solo «listo». Yo compruebo desde afuera que el ingreso quedó encendido.
9. Opcional: apagar «Email» como forma de entrar (el correo no se usa para entrar). Confirmar antes.
10. Aprobar la migración 1 (necesaria) y la 2 (recomendada). Las aplico yo.
11. Opcional: agregar a la lista el número ficticio con código que yo le proponga, para la prueba de punta a punta. Tiene solo datos inventados y se quita antes del lanzamiento.
12. Elegir el nombre del sitio y la dirección (propuesta: `app.dalecontacto.cl`). Cuando el sitio exista, agregar el registro DNS «app» que yo le indique.
13. Revisar la tabla ajena `etmday_leads`, que está en el proyecto de Dale Contacto desde el 6-nov con inserción abierta a cualquiera, y decidir si se mueve a su propio proyecto.

---

## 18. Decidido sin estar escrito (por confirmar)

Ver también las marcas [por confirmar] del texto.

1. Arquitectura (c) y el nombre de la carpeta `app-real/`.
2. Textos de A4: 4 textos 'prueba-1', obligatorios y para el conductor. Cambia «esperan al abogado» [verificar con abogado].
3. Ajustes que la app puede leer + 30 días (si no, 30 fijo).
4. Paso 2 temporal: buscador de comuna y lo que se quita (sección 9.2).
5. El estacionamiento parte apagado y nada viene marcado de antemano (Español tampoco: MD51).
6. Regla del Paso 3 listo. Años desde 1.
7. Paso 4 → Inicio, con el aviso.
8. Se mantienen «Paso N de 5» y «N de 5 pasos», con documentos «Próximamente».
9. Inicio con los 4 pasos listos: sin botón y con texto nuevo. Nota sin la promesa de recordatorios.
10. Barra con solo Inicio y Perfil. Bienvenida sin «Tengo vehículos». Perfil sin documentos, quién recibió, bloqueos ni eliminar cuenta.
11. Textos de prueba de la sección 11 (Términos, cerrar sesión, nota del código, número no autorizado).
12. 60 s entre códigos. Se mantienen los botones de reenviar.
13. Se incluye la pantalla E4.
14. Sin franja «Versión de prueba».
15. Sitio `dale-contacto-app`, `app.dalecontacto.cl`, sin la protección de Netlify.
16. El correo se guarda sin confirmar. Sin caché de catálogos. La sesión se cierra solo en ese dispositivo.
17. 18 años o más (propuesta que ya está en la base).
18. Datos reales del equipo antes de los Términos [verificar con abogado].
19. Versiones: supabase-js 2.118.0 y react-native-url-polyfill, instalados en `aplicacion/` [verificar con Expo 58 y RN 0.88].
20. Slug `dale-contacto-app`: para las tiendas convendría que la app real se quede con `dale-contacto` y que el mockup pase a `dale-contacto-demo`.

---

## 19. Riesgos

- **Números de prueba:** quien sepa un número y su código entra como esa persona, y los códigos se ven en el panel de Supabase. Se baja con códigos al azar, una fecha corta, y borrando la lista antes del lanzamiento. Hay límite por IP, pero no bloqueo por intentos fallidos.
- **Twilio de relleno:** que el panel lo acepte no está comprobado [verificar]; está el plan B. Cuando venza «Valid Until», nadie podrá pedir un código nuevo; las sesiones abiertas siguen.
- **Guardado parcial:** cada paso son de 2 a 5 llamadas sin transacción. Se mitiga con operaciones que se pueden repetir, el orden de la sección 9 y una nueva lectura después de guardar. Más adelante, funciones RPC.
- **Los datos de prueba quedan:** no se puede borrar a quien aceptó autorizaciones (R19/MD23). Limpiar requiere una decisión.
- **Código compartido:** un cambio en `aplicacion/src` afecta al mockup, a la demo del panel y a la app real. Antes de publicar cualquiera, hay que revisar los tres. F2 se construye sobre lo que deje el otro proceso.
- **App hermana:** el patrón (`node_modules` enlazado y `watchFolders`) no es el estándar de Expo y puede fallar al actualizar Metro o Expo. Las dependencias nuevas quedan en `aplicacion/package.json` aunque el mockup no las use.
- **Plan Free:** Supabase pausa el proyecto tras días sin uso [verificar: 7 días]. La app mostraría «No pudimos conectarnos».
- **Con solo Taxi y Taxi ejecutivo activos,** quien declare solo clase B no completa el Paso 4.
- **Fecha cerca de los 18:** la app calcula con la hora del teléfono y la base con la de Chile. Se muestra el mensaje de la base.
- **Tabla ajena `etmday_leads`** con inserción anónima en el mismo proyecto [verificar si el asesor la marca].

---

## Anexo A · `supabase/pruebas/app_conductor_v1_pruebas.sql` (37 pruebas, en verde en local el 9-nov)

```sql
-- =====================================================================
-- app_conductor_v1_pruebas.sql — pruebas de la app real del conductor v1.
--
-- Orden en local (Postgres 16), en una base nueva:
--   auth_simulado.sql → etapa1_esquema → etapa1_datos_iniciales →
--   etapa1_pruebas.sql (termina en ROLLBACK) →
--   app_conductor_v1_textos_prueba → app_conductor_v1_ajustes_publicos →
--   este archivo.
-- etapa1_pruebas.sql va ANTES de las migraciones nuevas porque comprueba el
-- estado exacto de la Etapa 1 (0 textos, 1 ajuste, anon sin permisos en
-- ajustes).
--
-- Reproduce en SQL, como authenticated, lo que la app hace en cada pantalla
-- (el "plan de escritura" de la especificación). Todo termina en ROLLBACK.
-- Cada prueba escribe "OK  [código] ..." o corta todo con "FALLA: ...".
-- =====================================================================

\set ON_ERROR_STOP 1
set client_min_messages = notice;

begin;

create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.usuarios (alias text primary key, id uuid not null, celular text not null);
grant select on pruebas.usuarios to public;
insert into pruebas.usuarios values
  ('a',      'aaaaaaaa-1111-4000-8000-00000000000a', '56990000001'),  -- se registra en la prueba
  ('b',      'bbbbbbbb-1111-4000-8000-00000000000b', '56990000002'),  -- otro conductor
  ('admin',  'eeeeeeee-1111-4000-8000-00000000000e', '56990000003');  -- del equipo y también conductor

create function pruebas.id(p_alias text) returns uuid
language sql stable as $$ select id from pruebas.usuarios where alias = p_alias $$;
create function pruebas.clase(p_codigo text) returns bigint
language sql stable as $$ select id from public.clases_licencia where codigo = p_codigo $$;
create function pruebas.negocio(p_nombre text) returns bigint
language sql stable as $$ select id from public.negocios where nombre = p_nombre $$;
create function pruebas.opcion(p_lista text, p_clave text) returns bigint
language sql stable as $$
  select o.id from public.opciones o join public.listas l on l.id = o.lista_id
   where l.clave = p_lista and o.clave = p_clave $$;
create function pruebas.tamano(p_nombre text) returns bigint
language sql stable as $$ select id from public.tamanos_vehiculo where nombre = p_nombre $$;

create function pruebas.como(p_quien text) returns void
language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  if p_quien in ('anon', 'service_role', 'supabase_auth_admin') then
    execute format('set local role %I', p_quien);
  elsif p_quien <> 'postgres' then
    perform set_config('request.jwt.claim.sub', pruebas.id(p_quien)::text, true);
    set local role authenticated;
  end if;
end $$;

create function pruebas.ok(p_condicion boolean, p_nombre text) returns void
language plpgsql as $$
begin
  if p_condicion is distinct from true then
    raise exception 'FALLA: %', p_nombre;
  end if;
  raise notice 'OK  %', p_nombre;
end $$;

create function pruebas.falla(p_sql text, p_patron text, p_nombre text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlerrm ~* p_patron then
      raise notice 'OK  % — %', p_nombre, sqlerrm;
      return;
    end if;
    raise exception 'FALLA: % — error distinto del esperado: % [%]', p_nombre, sqlerrm, sqlstate;
  end;
  raise exception 'FALLA: % — se esperaba un error y no lo hubo', p_nombre;
end $$;

create function pruebas.filas(p_sql text) returns bigint
language plpgsql as $$
declare n bigint;
begin
  execute p_sql;
  get diagnostics n = row_count;
  return n;
end $$;

grant execute on all functions in schema pruebas to public;


-- =====================================================================
-- T. Textos de autorización de prueba
-- =====================================================================
do $$
begin
  perform pruebas.ok((select count(*) from public.textos_autorizacion where vigente) = 4
                 and (select array_agg(clave order by orden) from public.textos_autorizacion where vigente)
                     = array['terminos_privacidad', 'compartir_ficha', 'revision_documentos', 'normas_mensajes'],
    '[T1] 4 textos vigentes, en el orden de la pantalla A4');
  perform pruebas.ok(not exists (select 1 from public.textos_autorizacion
                                  where vigente and (version <> 'prueba-1' or para_quien <> 'conductor'
                                                     or not obligatoria or vigente_desde is null
                                                     or exige_aceptar_de_nuevo or enlace is not null)),
    '[T2] todos: versión prueba-1, para el conductor, obligatorios, con vigente_desde y sin enlace');
  perform pruebas.ok((select texto from public.textos_autorizacion where clave = 'terminos_privacidad')
                     = 'Acepto los Términos y la Política de privacidad, y declaro ser mayor de 18 años.',
    '[T3] el texto de Términos es el de la maqueta');
  perform pruebas.como('anon');
  perform pruebas.ok((select count(*) from public.textos_autorizacion) = 4, '[T4] anon lee los 4 textos vigentes');
end $$;


-- =====================================================================
-- I. Ingreso: pedir el código y confirmarlo (lo hace Supabase Auth)
-- =====================================================================
do $$
declare u record;
begin
  perform pruebas.como('supabase_auth_admin');
  for u in select * from pruebas.usuarios loop
    insert into auth.users (id, phone) values (u.id, u.celular);
  end loop;
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from public.cuentas) = 0, '[I1] pedir el código no crea la cuenta');

  perform pruebas.como('supabase_auth_admin');
  update auth.users set phone_confirmed_at = now();
  perform pruebas.como('postgres');
  perform pruebas.ok((select celular from public.cuentas where id = pruebas.id('a')) = '+56990000001'
                 and (select count(*) from public.cuentas) = 3,
    '[I2] confirmar el código crea la cuenta con el celular en formato +569');
  insert into public.miembros_equipo (id, rol) values (pruebas.id('admin'), 'administrador');

  -- Lo primero que lee la app después de verifyOtp.
  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.cuentas where id = pruebas.id('a')) = 1
                 and (select count(*) from public.conductores where id = pruebas.id('a')) = 0
                 and (select count(*) from public.consentimientos
                       where cuenta_id = pruebas.id('a') and revocado_en is null) = 0,
    '[I3] tras verificar: hay cuenta, sin conductor y sin autorizaciones → va a "Antes de empezar"');
end $$;


-- =====================================================================
-- A. "Antes de empezar": se insertan solo las que faltan
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id, aceptado_en)
  select pruebas.id('a'), t.id, '2000-01-01'
    from public.textos_autorizacion t
   where t.vigente and t.obligatoria and t.para_quien in ('conductor', 'todos');
  perform pruebas.ok((select count(*) from public.consentimientos
                       where cuenta_id = pruebas.id('a') and revocado_en is null
                         and aceptado_en > now() - interval '1 minute') = 4,
    '[A1] acepta las 4; la fecha la pone el servidor');
  perform pruebas.falla($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
                          select pruebas.id('a'), id from public.textos_autorizacion where clave = 'compartir_ficha'$q$,
    'consentimientos_una_activa', '[A2] aceptar de nuevo una ya vigente da 23505 (la app la ignora y vuelve a leer)');
  perform pruebas.falla($q$insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
                          select pruebas.id('b'), id from public.textos_autorizacion where clave = 'compartir_ficha'$q$,
    'row-level security', '[A3] nadie acepta por otra persona');

  perform pruebas.como('b');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('b'), id from public.textos_autorizacion where vigente;
  perform pruebas.como('admin');
  insert into public.consentimientos (cuenta_id, texto_autorizacion_id)
  select pruebas.id('admin'), id from public.textos_autorizacion where vigente;
end $$;


-- =====================================================================
-- P1. Paso 1: update cuentas → insert conductores → clases
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  perform pruebas.ok(pruebas.filas($q$update public.cuentas
       set email = 'equipo.a@ejemplo.cl', nombres = 'Ana María', primer_apellido = 'Prueba', segundo_apellido = null
     where id = pruebas.id('a')$q$) = 1, '[P1] guarda nombres, apellidos y correo en cuentas');

  perform pruebas.falla($q$insert into public.conductores (id, fecha_nacimiento, disponible)
                          values (pruebas.id('a'), (now() at time zone 'America/Santiago')::date - interval '17 years', true)$q$,
    '18 años', '[P2] menor de 18: la base devuelve el mensaje en español');

  insert into public.conductores (id, fecha_nacimiento, disponible, disponibilidad_confirmada_en)
  values (pruebas.id('a'), '1990-03-14', true, '2000-01-01');
  perform pruebas.ok((select estado_perfil = 'incompleto' and estado_verificacion = 'sin_documentos'
                             and disponibilidad_confirmada_en > now() - interval '1 minute'
                        from public.conductores where id = pruebas.id('a')),
    '[P3] primer guardado: perfil incompleto y disponibilidad confirmada ahora (fecha del servidor)');
  perform pruebas.falla($q$insert into public.conductores (id, fecha_nacimiento) values (pruebas.id('a'), '1990-03-14')$q$,
    'conductores_pkey', '[P4] un segundo insert da 23505: la app pasa a update');

  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('a'), pruebas.clase('A2'), 'declarada'), (pruebas.id('a'), pruebas.clase('B'), 'declarada')
  on conflict (conductor_id, clase_licencia_id, origen) do nothing;
  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('a'), pruebas.clase('B'), 'declarada')
  on conflict (conductor_id, clase_licencia_id, origen) do nothing;
  perform pruebas.ok((select count(*) from public.conductor_licencias where conductor_id = pruebas.id('a')) = 2,
    '[P5] clases con "insertar ignorando repetidas" (upsert ignoreDuplicates): repetir no duplica');

  -- Edición: sin mandar disponibilidad_confirmada_en, la fecha no cambia.
  update public.conductores set fecha_nacimiento = '1990-03-15', disponible = true where id = pruebas.id('a');
  perform pruebas.ok((select fecha_nacimiento = '1990-03-15' from public.conductores where id = pruebas.id('a')),
    '[P6] editar el Paso 1 es un update simple');
  perform pruebas.falla($q$update public.conductores set estado_perfil = 'completo' where id = pruebas.id('a')$q$,
    'No puedes cambiar', '[P7] la app no marca el perfil como completo');
end $$;


-- =====================================================================
-- P2. Paso 2 temporal: comuna elegida de la lista, sin dirección
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  perform pruebas.ok(pruebas.filas($q$update public.conductores
       set comuna_id = (select id from public.comunas where nombre = 'Ñuñoa'),
           tiene_estacionamiento = false, direccion = null, direccion_detalle = null, google_place_id = null
     where id = pruebas.id('a')$q$) = 1, '[P8] guarda la comuna y el estacionamiento con la dirección vacía');
  perform pruebas.ok((select z.region_id = c.region_id
                        from public.conductores d join public.comunas c on c.id = d.comuna_id
                        join public.zonas z on z.id = c.zona_id where d.id = pruebas.id('a')),
    '[P9] zona y región salen de la comuna (no se guardan en conductores)');
end $$;


-- =====================================================================
-- P3. Paso 3: experiencia (upsert por conductor y tamaño) e idiomas
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos)
  values (pruebas.id('a'), pruebas.tamano('Vehículo liviano'), 5), (pruebas.id('a'), pruebas.tamano('Van o minibús'), 2)
  on conflict (conductor_id, tamano_vehiculo_id) do update set anos = excluded.anos;
  insert into public.experiencia_conductor (conductor_id, tamano_vehiculo_id, anos)
  values (pruebas.id('a'), pruebas.tamano('Vehículo liviano'), 6)
  on conflict (conductor_id, tamano_vehiculo_id) do update set anos = excluded.anos;
  delete from public.experiencia_conductor
   where conductor_id = pruebas.id('a') and tamano_vehiculo_id in (pruebas.tamano('Van o minibús'));
  perform pruebas.ok((select array_agg(anos) from public.experiencia_conductor where conductor_id = pruebas.id('a'))
                     = array[6::smallint],
    '[P10] el upsert cambia los años y el delete quita el desmarcado');

  insert into public.conductor_opciones (conductor_id, opcion_id)
  values (pruebas.id('a'), pruebas.opcion('idioma', 'es')), (pruebas.id('a'), pruebas.opcion('idioma', 'en'))
  on conflict (conductor_id, opcion_id) do nothing;
  delete from public.conductor_opciones
   where conductor_id = pruebas.id('a') and opcion_id in (pruebas.opcion('idioma', 'en'));
  perform pruebas.ok((select count(*) from public.conductor_opciones where conductor_id = pruebas.id('a')) = 1,
    '[P11] idiomas: agregar ignorando repetidos y quitar los desmarcados');
end $$;


-- =====================================================================
-- P4. Paso 4: negocios, turno y días
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  insert into public.conductor_negocios (conductor_id, negocio_id)
  values (pruebas.id('a'), pruebas.negocio('Taxi')), (pruebas.id('a'), pruebas.negocio('Taxi ejecutivo'))
  on conflict (conductor_id, negocio_id) do nothing;
  perform pruebas.falla($q$insert into public.conductor_negocios (conductor_id, negocio_id)
                          values (pruebas.id('a'), pruebas.negocio('Taxi colectivo'))$q$,
    'no está disponible', '[P12] un negocio apagado no se puede elegir');
  insert into public.conductor_opciones (conductor_id, opcion_id)
  select pruebas.id('a'), o from unnest(array[pruebas.opcion('turno', 'dia'),
                                              pruebas.opcion('dia_semana', 'lu'), pruebas.opcion('dia_semana', 'ma')]) o
  on conflict (conductor_id, opcion_id) do nothing;
  perform pruebas.ok((select count(*) from public.conductor_negocios where conductor_id = pruebas.id('a')) = 2
                 and (select count(*) from public.conductor_opciones co join public.opciones o on o.id = co.opcion_id
                        join public.listas l on l.id = o.lista_id
                       where co.conductor_id = pruebas.id('a') and l.clave in ('turno', 'dia_semana')) = 3,
    '[P13] Paso 4 guardado: 2 negocios, 1 turno y 2 días');
  perform pruebas.ok((select estado_perfil from public.conductores where id = pruebas.id('a')) = 'incompleto',
    '[P14] sin documentos el perfil sigue incompleto (lo calcula el sistema en la Etapa 3)');

  -- Quitar la A2 en el Paso 1 (primero se agregan las nuevas, después se quitan las desmarcadas).
  delete from public.conductor_licencias
   where conductor_id = pruebas.id('a') and origen = 'declarada' and clase_licencia_id in (pruebas.clase('A2'));
  perform pruebas.ok((select count(*) from public.conductor_negocios where conductor_id = pruebas.id('a')) = 0,
    '[P15] quitar la única clase que habilita los taxis los quita del Paso 4 (la app vuelve a leer)');
end $$;


-- =====================================================================
-- D. Disponible para trabajar
-- =====================================================================
do $$
begin
  perform pruebas.como('a');
  update public.conductores set disponible = false where id = pruebas.id('a');
  update public.conductores set disponible = true, disponibilidad_confirmada_en = '1999-01-01' where id = pruebas.id('a');
  perform pruebas.ok((select disponible and disponibilidad_confirmada_en > now() - interval '1 minute'
                        from public.conductores where id = pruebas.id('a')),
    '[D1] pausar y volver: la fecha de confirmación la pone el servidor');
end $$;


-- =====================================================================
-- L. Lecturas: la app SIEMPRE filtra por su propio id
-- =====================================================================
do $$
begin
  perform pruebas.como('postgres');
  insert into public.conductores (id, fecha_nacimiento) values (pruebas.id('b'), '1985-01-01'), (pruebas.id('admin'), '1980-01-01');
  insert into public.conductor_licencias (conductor_id, clase_licencia_id, origen)
  values (pruebas.id('b'), pruebas.clase('B'), 'declarada'), (pruebas.id('admin'), pruebas.clase('A1'), 'declarada');

  perform pruebas.como('admin');
  perform pruebas.ok((select count(distinct conductor_id) from public.conductor_licencias) = 3,
    '[L1] alguien del equipo SIN filtro ve las clases de todos (por eso la app filtra)');
  perform pruebas.ok((select count(*) from public.conductor_licencias where conductor_id = pruebas.id('admin')) = 1
                 and (select count(*) from public.cuentas where id = pruebas.id('admin')) = 1,
    '[L2] con el filtro por su id, ve solo lo suyo');

  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.conductor_licencias) = 1
                 and (select count(*) from public.cuentas) = 1,
    '[L3] un conductor ve solo lo suyo aunque no filtre');
end $$;


-- =====================================================================
-- J. Ajustes públicos (migración recomendada)
-- =====================================================================
do $$
begin
  perform pruebas.como('anon');
  perform pruebas.ok((select array_agg(id) from public.ajustes) = array['dias_reconfirmar_disponibilidad']
                 and (select valor from public.ajustes) = '30'::jsonb,
    '[J1] anon lee solo los ajustes públicos');
  perform pruebas.falla($q$update public.ajustes set valor = '5'$q$, 'permission denied', '[J2] anon no cambia ajustes');

  perform pruebas.como('a');
  perform pruebas.ok((select count(*) from public.ajustes) = 1, '[J3] un conductor lee solo los públicos');
  perform pruebas.ok(pruebas.filas($q$update public.ajustes set valor = '5'$q$) = 0, '[J4] un conductor no cambia ajustes');

  perform pruebas.como('admin');
  perform pruebas.ok((select count(*) from public.ajustes) = 2, '[J5] el equipo lee todos');
end $$;


-- =====================================================================
-- E. Estructura: nada nuevo fuera de lo previsto
-- =====================================================================
do $$
begin
  perform pruebas.como('postgres');
  perform pruebas.ok((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                       where n.nspname = 'public' and c.relkind = 'r') = 21
                 and not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                                  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
    '[E1] siguen las 21 tablas, todas con RLS');
  perform pruebas.ok((select array_agg(p.proname::text order by p.proname)
                        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                       where n.nspname = 'privado' and has_function_privilege('authenticated', p.oid, 'EXECUTE'))
                     = array['columnas_cambiadas', 'columnas_cambiadas_salvo', 'es_admin', 'es_equipo', 'es_sistema',
                             'licencia_habilita_negocio'],
    '[E2] sin funciones nuevas ejecutables por authenticated');
  perform pruebas.ok(not has_table_privilege('anon', 'public.ajustes', 'INSERT')
                 and not has_table_privilege('anon', 'public.ajustes', 'UPDATE')
                 and not has_table_privilege('anon', 'public.ajustes', 'DELETE'),
    '[E3] anon solo tiene SELECT en ajustes');
end $$;

do $$ begin raise notice 'FIN: todas las pruebas de la app del conductor v1 pasaron.'; end $$;

rollback;
```

**Nota:** la prueba E1 cuenta 21 tablas en una base local nueva. En el proyecto real hay 22, por la tabla ajena `etmday_leads`. Si algún día se corre contra una copia del proyecto, hay que ajustarla.

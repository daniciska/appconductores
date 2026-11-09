# Guía para construir las pantallas de la demo

Demo navegable de **Dale Contacto** (mockup.dalecontacto.cl). Expo + expo-router + TypeScript estricto, salida web "single". Todo vive en el navegador con datos de ejemplo: no hay servidor ni Supabase.

El **panel de administración de la demo es otra app** (carpeta `panel/` del repositorio, publicada en `/panel` del mismo sitio; ver `panel/README.md`). Esta app no lo enlaza ni lo nombra: solo comparte con él lo guardado en el navegador.

Antes de empezar, lee en `/home/user/appconductores/CLAUDE.md` las **Decisiones tomadas**: mandan sobre todo lo demás.

## 1. Reglas de trabajo (importante)

- Cada grupo **solo edita `src/pantallas/<su-grupo>/`**. Puede crear archivos ahí (componentes propios, `acciones.ts`, etc.).
- **No se edita** `src/ui`, `src/datos` ni `src/app`. Si algo falta allí, se resuelve en la carpeta del grupo (componente propio, acción propia con `useDemo.setState`) y se avisa en el informe final.
- Cada pantalla ya existe como marcador `En construcción: <código>`. Reemplaza el contenido del archivo, **conserva el nombre del archivo y el `export default`**.
- Nada de `commit`, publicar ni usar Supabase real.
- Las maquetas son la fuente de verdad visual y de textos. Cambia los marcadores entre corchetes (`[Nombre]`, `[comuna]`, `[N]`) por datos del estado (ficticios) o por lo que escribió la persona.
- Todo en español de Chile. Textos cortos. Hablar de "vehículos", no de "taxis", salvo el nombre del negocio.
- **No existen en la demo:** modo de contrato ni garantía (crecimiento futuro). No mostrarlos.
- **Privacidad:** el conductor nunca ve el contacto del titular, salvo que el titular lo comparta (`contactoCompartido[busquedaId]`). La dirección del conductor es privada: solo se entrega si toca "Compartir mi dirección".
- **Obligatorios:** se marcan con asterisco (`<Campo obligatorio />`). La dueña pidió dejar la validación **apagada** en el mockup: si `ajustes.validarObligatorios` es `false` (por defecto), se puede guardar sin completar; si es `true`, al intentar guardar sin un obligatorio aparece la alerta "Completa los campos marcados con * para guardar." y el campo en rojo con su mensaje (ver `CondPaso1.dc.html`).
- Un solo acento: amarillo `#F5B400`. Verde solo para estados positivos.

## 2. Mapa de rutas

`[id]` y `[busqueda]` son ids de búsqueda (`b01`…`b14`). `[tipo]` es `cedula`, `licencia`, `hoja_vida` o `antecedentes`. Lee los parámetros con `const { id } = useLocalSearchParams<{ id: string }>();`.

| Grupo | Ruta | Código | Archivo de la pantalla | Maqueta (`docs/maqueta/`) |
|---|---|---|---|---|
| ingreso | `/` | Selector | `src/pantallas/ingreso/SelectorDemo.tsx` (ya hecho) | `CondBienvenida.dc.html` (estilo) |
| ingreso | `/conductor/bienvenida` | A1 | `src/pantallas/ingreso/Bienvenida.tsx` | `CondBienvenida.dc.html` |
| ingreso | `/conductor/celular` | A2 | `src/pantallas/ingreso/Celular.tsx` | `CondCelular.dc.html` |
| ingreso | `/conductor/codigo` | A3 | `src/pantallas/ingreso/Codigo.tsx` | `CondCodigo.dc.html` |
| ingreso | `/conductor/autorizaciones` | A4 | `src/pantallas/ingreso/Autorizaciones.tsx` | `CondConsentimientos.dc.html` |
| ingreso | `/conductor/registro/1` | B1 | `src/pantallas/ingreso/Paso1.tsx` | `CondPaso1.dc.html` |
| ingreso | `/conductor/registro/2` | B2 | `src/pantallas/ingreso/Paso2.tsx` | `CondPaso2.dc.html` |
| ingreso | `/conductor/registro/3` | B3 | `src/pantallas/ingreso/Paso3.tsx` | `CondPaso3.dc.html` |
| ingreso | `/conductor/registro/4` | B4 | `src/pantallas/ingreso/Paso4.tsx` | `CondPaso4.dc.html` |
| ingreso | `/conductor/registro/5` | B5 | `src/pantallas/ingreso/Paso5.tsx` | `CondPaso5.dc.html` |
| documentos | `/conductor/inicio` (pestaña) | B6 · C3 · C5 · C6 | `src/pantallas/documentos/Inicio.tsx` | `CondInicioIncompleto`, `CondInicioRevision`, `CondInicioActivo`, `CondSinMatches` |
| documentos | `/conductor/documentos/subir/[tipo]` | C1 | `src/pantallas/documentos/SubirDocumento.tsx` | `CondSubirDoc.dc.html` |
| documentos | `/conductor/documentos/enviado` | C2 | `src/pantallas/documentos/Enviado.tsx` | `CondEnviado.dc.html` |
| documentos | `/conductor/documentos/[tipo]/no-aprobado` | C4 | `src/pantallas/documentos/NoAprobado.tsx` | `CondDocRechazado.dc.html` |
| documentos | `/conductor/perfil` (pestaña) | E1 | `src/pantallas/documentos/Perfil.tsx` | `CondPerfil.dc.html` |
| documentos | `/conductor/perfil/documentos` | E2 | `src/pantallas/documentos/MisDocumentos.tsx` | `CondMisDocumentos.dc.html` |
| documentos | `/conductor/perfil/quien-recibio` | E3 | `src/pantallas/documentos/QuienRecibio.tsx` | `CondQuienVio.dc.html` |
| documentos | `/conductor/disponibilidad` | E4 | `src/pantallas/documentos/Disponibilidad.tsx` | `CondDisponibilidad.dc.html` |
| documentos | `/conductor/eliminar-cuenta` | E5 | `src/pantallas/documentos/EliminarCuenta.tsx` | `CondEliminarCuenta.dc.html` |
| matches | `/conductor/matches` (pestaña) | D1 | `src/pantallas/matches/Matches.tsx` | `CondMatches.dc.html` |
| matches | `/conductor/matches/[id]` | D2 | `src/pantallas/matches/DetalleMatch.tsx` | `CondDetalleMatch.dc.html` |
| matches | `/conductor/mensajes` (pestaña) | D3 | `src/pantallas/matches/Mensajes.tsx` | `CondMensajes.dc.html` |
| matches | `/conductor/mensajes/[id]` | D4 | `src/pantallas/matches/Conversacion.tsx` | `CondConversacion.dc.html` |
| matches | `/conductor/mensajes/[id]/reportar` | D5 | `src/pantallas/matches/Reportar.tsx` | `CondReportar.dc.html` |
| bolsa | `/conductor/bolsa` (pestaña) | BC1 | `src/pantallas/bolsa/BolsaConductor.tsx` | `BolsaLista.dc.html` |
| bolsa | `/conductor/bolsa/[id]` | BC2 | `src/pantallas/bolsa/DetalleOferta.tsx` | `BolsaDetalle.dc.html` |
| bolsa | `/conductor/bolsa/postulaciones` | BC3 | `src/pantallas/bolsa/MisPostulaciones.tsx` | `BolsaPostulaciones.dc.html` |
| bolsa | `/titular` | Titular | `src/pantallas/bolsa/InicioTitular.tsx` | `InicioTitular.dc.html` (referencia general) |
| bolsa | `/titular/bolsa/[busqueda]/publicar` | BT1 | `src/pantallas/bolsa/Publicar.tsx` | `BolsaPublicar.dc.html` |
| bolsa | `/titular/bolsa/[busqueda]/perfiles` | BT2 | `src/pantallas/bolsa/Perfiles.tsx` | `BolsaPerfiles.dc.html` |
| bolsa | `/titular/bolsa/[busqueda]/postulantes` | BT3 · BT4 | `src/pantallas/bolsa/Postulantes.tsx` | `BolsaPostulantes.dc.html`, `BolsaPostulantesSinPlan.dc.html` |
| bolsa | `/titular/planes` | BT5 | `src/pantallas/bolsa/Planes.tsx` | `BolsaPlanes.dc.html` |

Otras rutas (ya hechas, no se tocan): `/conductor` (redirige a Inicio si ya se registró; si no, a A1), `/componentes` (muestrario del sistema de diseño), `+not-found`.

**Panel de administración: otra app, en `/panel` (9-nov).** Esta app no tiene rutas del panel: `/admin` muestra "Esta pantalla no existe" y el menú de la demo no enlaza `/panel`. El panel vive en `panel/` (su propio proyecto Expo, publicado con la base `/panel` en el mismo sitio) y está **conectado** con esta demo por lo guardado en el navegador: lo que se aprueba o se cambia allá se ve aquí en vivo (otra pestaña del mismo navegador), y al revés. Ninguna pantalla de `aplicacion/` debe enlazarlo ni nombrarlo; `npm run revisar:sin-panel` lo revisa en el export (corta la publicación si encuentra algo).

Pantallas del panel (en `panel/src/`; se entra eligiendo rol en la portada, sin pantalla de ingreso):

| Ruta | Pantalla | Archivo | Revisor | Administrador |
|---|---|---|---|---|
| `/panel` | Portada: "Entrar como administrador" o "Entrar como revisor" | `app/index.tsx` | — | — |
| `/panel/resumen` | Resumen | `pantallas/Resumen.tsx` | Ve todo, sin "Últimas acciones del equipo" | Ve todo |
| `/panel/documentos` | Revisión de documentos | `pantallas/Documentos.tsx` | Aprueba o no aprueba (con motivo) | Igual |
| `/panel/conductores` | Conductores (lista y ficha) | `pantallas/Conductores.tsx` | Solo ve | Solo ve |
| `/panel/reportes` | Reportes | `pantallas/Reportes.tsx` | Resuelve, suspende y reactiva | Igual |
| `/panel/match` | Reglas del match | `pantallas/Match.tsx` | Solo lectura | Umbral, uso y pesos |
| `/panel/catalogos` | Catálogos | `pantallas/Catalogos.tsx` | Solo lectura | Enciende y apaga negocios e industrias, cambia nombres |
| `/panel/zonas` | Zonas y comunas | `pantallas/Zonas.tsx` | Solo lectura | Crea y renombra zonas, mueve comunas |
| `/panel/ajustes` | Ajustes | `pantallas/Ajustes.tsx` | Solo lectura | Bolsa, plazos y ajustes de la demo |
| `/panel/equipo` | Equipo | `pantallas/Equipo.tsx` | Ve la lista | Agrega, cambia rol y acceso; ve el registro de acciones |
| `/panel/<otra>` | "Esta página del panel no existe" | `app/+not-found.tsx` | | |

Mientras el panel está abierto con un rol en otra pestaña del navegador, esta demo **no aprueba sola** los documentos que esperan a una persona: esperan la decisión del panel (ver "Simulación").

**Editar desde Perfil:** E1 abre los pasos 1–4 con `?editar=1` (`useModoEdicion()` en `src/pantallas/ingreso/acciones.ts`). En ese modo no se muestra "Paso n de 5", el botón dice "Guardar cambios" y, al guardar, vuelve a Perfil. Desde Inicio, Matches o la Bolsa (completar el perfil) los pasos siguen en orden.

**Layouts (ya hechos):**

- `src/app/conductor/_layout.tsx`: columna de celular (`MarcoCelular`), pila de pantallas y botón "Demo" arriba a la derecha.
- `src/app/conductor/(pestanas)/_layout.tsx`: pestañas Inicio, Matches, Bolsa (solo si `ajustes.bolsaActiva`), Mensajes (punto amarillo si hay no leídos) y Perfil. Las pantallas de pestaña **no** dibujan la barra: ya está. Las demás rutas del conductor se abren encima, sin barra (como en las maquetas).
- `src/app/titular/_layout.tsx`: igual al del conductor, sin pestañas.

**Navegación:** `import { router } from 'expo-router'`. `router.push('/conductor/matches/b01')` abre encima; `router.replace(...)` cambia sin dejar historial (ej. al terminar el registro o al pasar de un paso a otro si no quieres apilar); `router.dismissTo('/conductor/inicio')` cierra lo que está encima hasta volver a Inicio (dentro de la misma sección). Ojo: en esta versión `router.navigate` **apila** una pantalla nueva aunque ya exista; no lo uses para "volver". Para ir al selector no navegues a `/`: ya está el botón "Demo" (etiqueta accesible "Menú de la demo"), que saca la sección de la pila. Las rutas tienen tipos (typed routes): una ruta mal escrita no compila.

**Ver una maqueta:** `node /home/user/appconductores/docs/maqueta/render.js <archivo.dc.html> <salida.png>` y abre la imagen con Read. Para leer textos exactos, abre el `.dc.html` (el script `DCLogic` al final tiene los estados).

## 3. Sistema de diseño (`src/ui`, importa desde `@/ui`)

Muestrario en vivo: ruta `/componentes`.

### Tokens (`src/ui/tokens.ts`)

- `color`: `texto #111111`, `textoSuave #3D3D3D`, `textoSecundario #6B6B6B`, `textoDeshabilitado #9A9A9A`, `fondo #F6F6F6`, `superficie #FFFFFF`, `superficieHundida #EEEEEE`, `segmentado #EAEAEA`, `oscuro #111111`, `borde #ECECEC`, `bordeCampo #DDDDDD`, `separador #F0F0F0`, `acento #F5B400`, `acentoSuave #FFF6D6`, `acentoTrazo #B88500`, `acentoBorde #F0DFA0`, `amarilloFondo #FFF4DB`, `amarilloTexto #8A5300`, `exitoFondo #E3F4EA`, `exitoTexto #145F3B`, `exito #17784A`, `errorFondo #FDECEA`, `error #A3261B`, `interruptorApagado #C4C4C4`, `velo`.
- `familia` (Sora 600/700 y Plus Jakarta Sans 400/500/600/700) y `fuente(peso)` → `{ fontFamily }`. **En web el peso va en la familia:** nunca uses `fontWeight` solo; usa `Texto`/`Titulo` o `fuente(700)`.
- `tipo`: estilos de texto listos (`hero`, `h1`, `h2`, `tituloTarjeta`, `fuerte`, `cuerpo`, `parrafo`, `etiqueta`, `secundario`, `ayuda`, `pequeno`, `seccion`, `boton`, `botonChico`).
- `espacio` (lateral 20, superior 56, bloque 16…), `radio` (insignia 8, icono 10, boton44 12, campo 14, boton 16, tarjeta 20, pastilla 22), `alto` (tactil 44, campo 52, fila 52, boton 56), `sombra` (suave, flotante), `duracion` (rapida 140, normal 220, lenta 320), `ANCHO_CELULAR` 430, `ANCHO_ESCRITORIO` 900 (lo usa el panel, otra app).

### Componentes

| Componente | Props principales | Uso |
|---|---|---|
| `Pantalla` | `children`, `scroll=true`, `pie?` (zona fija abajo), `cabecera?` (zona fija arriba), `fondo?`, `separacion=16`, `superior=56`, `inferior=32` (usa `24` en pestañas), `lateral=20`, `animar=true`, `scrollRef?` | Toda pantalla de conductor/titular. Entra con una animación sutil. Para dejar el botón final abajo: `style={{ marginTop: 'auto' }}` en el último bloque o `<Empujar />`. |
| `Encabezado` | `paso?` (+`totalPasos=5`: "Paso n de 5" y barra), `titulo?`, `derecha?`, `onVolver?`, `volverA?` (respaldo si no hay historial), `sinVolver?` | Fila superior con botón volver de 44 px. |
| `BarraPasos` | `actual`, `total=5` | 5 segmentos de 4 px. |
| `Titulo` | `nivel`: `'hero'` 34 · `1` 26 (h1) · `2` 20 · `'tarjeta'` 17 negrita; `tono`, `centrado` | Títulos (Sora). |
| `Texto` | `variante`: `cuerpo`, `parrafo`, `fuerte`, `etiqueta`, `secundario`, `ayuda`, `pequeno`, `seccion`; `tono`: `normal`, `suave`, `secundario`, `deshabilitado`, `exito`, `error`, `blanco`, `acento`; `peso`, `tamano`, `centrado`, `subrayado` | Todo texto. El subtítulo bajo un h1 es `variante="parrafo" tono="secundario"`. |
| `TituloSeccion` | `children` | "Mi perfil", "Seguridad y privacidad" (14 negrita gris). |
| `Boton` | `titulo`, `onPress?` o `href?`, `variante`: `principal` (amarillo), `oscuro` (por defecto), `contorno`, `suave`, `texto`, `peligro`; `tamano`: `grande` 56 · `mediano` 44; `icono?`, `iconoDerecha?`, `deshabilitado?`, `cargando?`, `anchoCompleto?` | "Continuar" = oscuro grande; "Escribir mensaje" = principal; "Guardar y terminar después" = contorno; "Ver >" = oscuro mediano con `iconoDerecha={ChevronRight}`. |
| `BotonIcono` | `icono`, `etiquetaAccesible`, `variante`: `borde` (volver) · `suave` · `acento` (favorito marcado) · `oscuro` · `transparente`; `relleno?` (estrella rellena), `colorIcono?`, `tamano=44` | Favorito: `<BotonIcono icono={Star} variante={fav ? 'acento' : 'suave'} relleno={fav} colorIcono={fav ? undefined : color.textoSecundario} />`. |
| `Presionable` | como `Pressable` + `efecto` (`opacidad`/`escala`/`ninguno`) y `href?` | Para tarjetas o filas tocables propias. |
| `Campo` | `etiqueta?`, `obligatorio?` (asterisco), `notaEtiqueta?` ("(si tienes)"), `valor`, `onCambiar`, `placeholder`, `ayuda?`, `error?` (texto o `true`), `prefijo?` ("+56 9"), `icono?`, `derecha?`, `multilinea?`, `maxLength`, `contador?`, `deshabilitado?`, `keyboardType`, `autoComplete`, `inputRef?` | Campo de 52 px, radio 14, borde negro al enfocar y rojo con error. |
| `Chip` | `etiqueta`, `seleccionado`, `onPress`, `subtitulo?`, `forma`: `pastilla` · `cuadrado` (días), `rol`: `checkbox`/`radio`/`button`, `deshabilitado?` | Clases de licencia, idiomas, días, zonas, filtros. Marcado = negro con check. |
| `FilaCheck` | `titulo`, `ejemplo?` (gris entre paréntesis), `descripcion?`, `marcada`, `onPress`, `deshabilitada?`, `nota?` ("Pide licencia A3") | Negocios del Paso 4. |
| `Casilla` | `marcada`, `deshabilitada?` | Casilla suelta (autorizaciones A4). |
| `FilaRadio` | `titulo`, `descripcion?`, `seleccionada`, `onPress`, `deshabilitada?`, `extra?`, `children?` (se muestra al elegirla) | "Quién ve tu oferta" (BT1). |
| `OpcionIcono` | `titulo`, `icono`, `seleccionada`, `onPress`, `subtitulo?` | Turnos Día (`Sun`) / Noche (`Moon`). Ponlas en una fila con `gap: 8`. |
| `Interruptor` | `valor`, `onCambiar`, `etiquetaAccesible`, `deshabilitado?` | 52 × 32, verde encendido. |
| `FilaInterruptor` | `titulo`, `ayuda?`, `valor`, `onCambiar` | "Disponible para trabajar", "Tengo estacionamiento seguro". |
| `Stepper` | `valor`, `onCambiar`, `min=0`, `max=50`, `deshabilitado?`, `etiquetaAccesible`, `sufijo?` | Años de experiencia (− n +). |
| `ControlSegmentado` | `opciones [{clave, etiqueta}]`, `valor`, `onCambiar` | "Todos · 3 / Favoritos · 1". |
| `Tarjeta` | `children`, `onPress?`/`href?`, `destacada?` (borde amarillo), `apagada?` (gris), `padding=16`, `separacion=12` | Tarjeta blanca, borde `#ECECEC`, radio 20. |
| `GrupoLista` | `children` (filas), `sangria=44` | Tarjeta con filas separadas por líneas (E1). |
| `FilaLista` | `titulo`, `subtitulo?`, `icono?`, `derecha?`, `onPress?`/`href?`, `peligro?`, `flecha?`, `deshabilitada?` | Filas de 52 px con ícono en cuadrito gris y flecha. |
| `FilaDato` | `etiqueta`, `valor`, `tono?` | "Retiro … Providencia · Zona Oriente". |
| `Separado` / `Separador` | `sangria` | Intercala líneas `#F0F0F0`. |
| `Insignia` | `texto`, `tono`: `verde` (check por defecto) · `gris` · `amarilla` · `roja` · `oscura` · `acento`; `icono?` (`'check'`, un ícono o `null`), `tamano`: `normal`/`grande` | "Revisado", "Coincide 88 %", "1 vence pronto", "Enviada". |
| `Aviso` | `texto?`/`children`, `titulo?`, `icono`: `info`/`candado`/`alerta`/`chispa`/ícono, `tono`: `neutro`/`exito`/`error`/`acento`, `accion?` | Caja gris con ícono ("El contacto del titular está oculto…"). Alerta de obligatorios: `tono="error" icono="alerta"`. |
| `EstadoVacio` | `icono`, `titulo`, `texto?`, `accion? {titulo, onPress/href}` | Listas vacías. |
| `Cargando` | `texto?` | Estado de carga. |
| `Avatar` | `texto` (iniciales), `tamano=48`, `forma`: `cuadrado`/`circulo`, `tono`: `oscuro`/`claro`/`acento` | "[E]" del titular, "[I]" del perfil. |
| `PuntoAviso` | — | Punto amarillo de no leído. |
| `HojaInferior` | `visible`, `onCerrar`, `titulo?`, `descripcion?`, `children`, `pie?` | Hoja que sube desde abajo (dentro de la columna). |
| `Dialogo` | `visible`, `titulo`, `texto?`, `children?`, `confirmar {titulo, onPress, peligro?}`, `cancelar? {titulo?, onPress}` | Confirmaciones ("No se puede deshacer"). |
| `mostrarToast(texto, tipo?)` | `tipo`: `info`/`exito`/`error` | Aviso breve abajo (ya montado en el layout raíz). No uses `alert()`. |
| `BarraInferior`, `BotonDemo`, `MarcoCelular` | — | Ya los usan los layouts. |
| `EnConstruccion` | `codigo`, `titulo?` | Marcador (bórralo al construir). |

`MarcoPanel`, `PaginaPanel` y `Metrica` no están en `@/ui`: son del panel (`panel/src/marco.tsx`). Las fuentes (`FUENTES`) están en `src/ui/fuentes.ts`, que usan los layouts raíz de las dos apps.

**Íconos:** `import { Star, MessageSquare } from '@/ui/iconos'` (lucide, trazo 2). Propios con el dibujo de las maquetas: `Volante`, `Llave` (logo), `AutoFrente` desde `@/ui`. Si falta un ícono, impórtalo en tu carpeta con `import Nombre from 'lucide-react-native/icons/nombre-en-kebab'`. **Nunca** `from 'lucide-react-native'` a secas (carga 2.000 íconos). Tamaños de las maquetas: 22 en la barra, 20 en botones de 44, 18 en filas, 14 en checks.

## 4. Datos (`src/datos`)

### Archivos

- `tipos.ts`: todos los tipos (`Busqueda`, `Titular`, `ConductorUsuario`, `DocumentoUsuario`, `Mensaje`, `Postulacion`, `ReglaMatch`, `Ajustes`, `Plan`…).
- `semilla/`: catálogos **idénticos a la base** (`geografia.ts` generado desde `docs/propuesta-zonas.csv` con `npm run semilla`: 16 regiones, 81 zonas, 346 comunas; `catalogos.ts`: clases de licencia, industrias, 7 tamaños, 11 negocios, turnos, días, idiomas, tipos de documento, motivos, planes, reglas del match) y **ficticios** (`ficticios.ts`).
- `estado.ts`: forma del estado (`DatosDemo`) y `crearEstadoInicial()`.
- `tienda.ts`: la tienda `useDemo` (zustand + persist en `localStorage`, clave `dale-demo-datos`) con las acciones de la demo del conductor y del titular. Exporta también ayudas puras (`cambiarDocumento`, `docAprobado`, `recalcularUsuario`, `tareasAlVerificar`) que usa el panel para escribir sus propias acciones (`panel/src/datos/acciones.ts`).
- `migracion.ts`: cómo se lleva lo guardado a la versión actual (desde la 3 se conserva todo; desde la 2 la configuración vuelve a sus valores iniciales). Probado en `tests/migracion.test.ts`.
- `revisionManual.ts`: lee las marcas "una persona del equipo revisa a mano en este navegador" (una por pestaña del panel, `dale-demo-revision-manual:<pestaña>`, con plazo: el panel las renueva y las quita al salir o al cerrar la pestaña; "Reiniciar demo" las borra). `useRevisionManual()` (`true` o `false`) para pantallas.
- `revisionEquipo.ts`: cuándo se programa (o se quita) la revisión simulada de la persona del equipo (puro, probado en `tests/revision-equipo.test.ts`).
- `avisosEntrePestanas.ts`: avisos al conductor ("Tu Hoja de Vida fue aprobada.") cuando el cambio llega desde otra pestaña (el panel).
- `almacenamiento.ts`: cómo se guarda la tienda. Trae una sola vez lo de la clave anterior (`dale-demo-v1`, versiones 1 y 2, con panel) y una pestaña con código más viejo que lo guardado deja de guardar en vez de pisarlo. Al subir `VERSION_ESTADO` no hace falta cambiar la clave. Probado en `tests/almacenamiento.test.ts`.
- `selectores.ts`: lecturas derivadas (funciones puras sobre el estado).
- `hooks.ts`: hooks memorizados para pantallas.
- `match.ts`: motor del match (puro y probado).
- `simulacion.ts`: lo que harían otras personas (IA, equipo, titulares).
- `formato.ts`: textos de fechas, días, turnos, iniciales, máscaras.
- `direcciones.ts`: sugerencias de dirección simuladas (Paso 2).
- `avisos.ts`: cola de toasts (`avisar`).

### Leer el estado (¡ojo con el re-render infinito!)

```tsx
import { useDemo } from '@/datos/tienda';
import { useMatchesDelUsuario, useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';

const nombres = useDemo((s) => s.cuenta.nombres);       // valor simple: OK
const documentos = useDemo((s) => s.documentos);        // objeto que ya existe en el estado: OK
const enviarMensaje = useDemo((s) => s.enviarMensaje);  // acción: OK
const matches = useMatchesDelUsuario();                 // listas derivadas: usa los hooks
const avance = useDerivado(sel.avancePerfil);           // cualquier selector, memorizado
```

**Nunca** `useDemo((s) => s.busquedas.filter(...))` ni `useDemo((s) => ({ a: s.a, b: s.b }))`: devuelven un objeto nuevo en cada llamada y React entra en un ciclo infinito. Usa `useDerivado(fn)` o `useShallow` de `zustand/react/shallow`.

### Estado (`DatosDemo`, en `src/datos/estado.ts`)

- `rol`: `'conductor' | 'titular' | null` (lo ponen los layouts). El rol del panel no está aquí: vive en `revisionManual.ts`.
- `cuenta`: `celular` (8 dígitos, "5555 0123"), `celularVerificado`, `correo`, `nombres`, `apellido1`, `apellido2`, `creadaEl`, `autorizaciones { terminos, privacidad, compartirFicha, recordatoriosWhatsapp }`.
- `conductor` (`ConductorUsuario`): `registrado`, `registradoEl`, `pasosListos { datos, direccion, experiencia, trabajo, documentos }`, `pasoActual`, `estadoPerfil` (`incompleto`/`completo`), `estadoVerificacion` (`sin_documentos`/`en_revision`/`verificado`/`con_observaciones`), `disponible`, `disponibilidadConfirmadaEn`, `fechaNacimiento` ('dd/mm/aaaa'), `direccion`, `depto`, `comunaId`, `tieneEstacionamiento`, `clasesDeclaradas`, `clasesRevisadas`, `idiomas`, `experiencia { liviano: 5 }`, `negocios`, `turnos`, `dias`.
  - Al empezar, los textos están vacíos y las selecciones vienen marcadas como en las maquetas (A2 y B; 5 años liviano y 2 van; Español; Taxi y Taxi ejecutivo; Día; lunes a sábado; con estacionamiento; disponible). Los formularios deben **partir con lo que hay en el estado** y guardar lo que la persona cambie. `EJEMPLO_USUARIO` (en `@/datos/semilla`) tiene datos de ejemplo por si quieres ofrecer "Usar datos de ejemplo".
- `documentos`: `{ cedula, licencia, hoja_vida, antecedentes }` → `DocumentoUsuario { estado: 'falta'|'subido'|'en_revision'|'aprobado'|'rechazado', nombreArchivo, subidoEl, enviadoEl, etapa: 'ia'|'equipo'|null, revisadoEn, venceEn, quienDecidio: 'ia'|'persona'|null, motivo, otraRevisionEl }`.
- `favoritos` (ids de búsqueda), `mensajes` (`{ [busquedaId]: Mensaje[] }`, `Mensaje { id, autor: 'conductor'|'titular'|'sistema', texto, hora, leido }`), `titularEscribiendo`, `contactoCompartido` y `direccionCompartida` (`{ [busquedaId]: fecha }`), `matchesPorPostulacion`, `entregasDatos` (Quién recibió mis datos), `bloqueos` (ids de titular).
- `titularDemo`: `{ titularId: 't01', plan: 'sin_plan'|'basico'|'flota_chica'|'flota' (parte en flota_chica), destacadasUsadas }`, `favoritosTitular`.
- `titulares` (7), `busquedas` (14), `conductores` (10 ficticios), `postulaciones`, `reportes`.
- `catalogos` (`negocios[].activo/nombre`, `industrias[].activo`, `zonas[].nombre`, `comunas[].zonaId`), `reglas` (`umbral` y `reglas[]` con `uso`: `filtro`/`variable`/`apagado` y `peso`), `ajustes` (`bolsaActiva: true`, `validarObligatorios: false`, `diasReconfirmar: 30`, `diasAntiguedadPdf: 30`, `segundosPrerevision: 3`), `equipo`, `accionesEquipo`. **Esta app solo los lee:** los cambia el panel de la demo (otra app, en `/panel`), y el cambio llega en vivo por el evento "storage". Parten como el lanzamiento: solo Taxi y Taxi ejecutivo, transporte de carga apagado, umbral 66 % y la bolsa encendida. `equipo` y `accionesEquipo` parten vacíos: los llena el panel al entrar. `VERSION_ESTADO` es 4 (9-nov): desde la 3 se conserva todo; lo guardado en la versión 2 (la demo del 4-nov, con el panel dentro) vuelve a los valores iniciales (`migracion.ts`).
- `pendientes`: tareas de la simulación (no tocar).

### Acciones (`useDemo((s) => s.accion)`; firmas exactas en `AccionesDemo`, `src/datos/tienda.ts`)

- **General:** `elegirRol(rol)`, `reiniciarDemo()`, `prepararConductorVerificado()` (atajo: perfil completo, verificado, 2 conversaciones, 1 favorito y 2 entregas de datos), `prepararDocumentoNoAprobado()` (atajo: perfil completo, la Hoja de Vida no aprobada por PDF vencido y los otros 3 documentos aprobados; sin matches ni conversaciones).
- **Ingreso:** `guardarCelular(celular)`, `verificarCelular()`, `aceptarAutorizaciones({ terminos, privacidad, compartirFicha, recordatoriosWhatsapp })`, `actualizarCuenta(parcial)`.
- **Registro:** `guardarPaso1({ nombres, apellido1, apellido2, fechaNacimiento, correo, clasesDeclaradas, disponible })` (desde aquí queda registrado), `guardarPaso2({ direccion, depto, comunaId, tieneEstacionamiento })`, `guardarPaso3({ experiencia, idiomas })`, `guardarPaso4({ negocios, turnos, dias })`, `irAPaso(n)`, `actualizarConductor(parcial)` (ediciones desde Perfil sin marcar pasos). El perfil queda `completo` solo cuando las 5 secciones están listas; la de documentos se marca sola al enviar los 4.
- **Documentos:** `subirDocumento(tipo, nombreArchivo?)` (queda "Subido"; en la demo no se sube nada), `quitarDocumento(tipo)`, `enviarDocumentosARevision(tipos?)` (empieza la pre-revisión), `pedirOtraRevision(tipo)`, `aprobarPendientesDemo()` (atajo "Aprobar ahora": el equipo simulado aprueba ya lo que está en revisión), `aprobarPorAgenteIA(tipo)` y `aprobarPorEquipo(tipo)` (las usa la simulación).
- **Disponibilidad y cuenta:** `cambiarDisponible(bool)`, `confirmarDisponibilidad()`, `eliminarCuenta()` (borra lo del usuario; después navega a `/`).
- **Matches y mensajes:** `alternarFavorito(busquedaId)`, `enviarMensaje(busquedaId, texto)`, `marcarConversacionLeida(busquedaId)` (llámala al abrir D4), `compartirMiDireccion(busquedaId)`, `reportarConversacion({ busquedaId, motivo, detalle? })`, `bloquearTitular(titularId)`, `desbloquearTitular(titularId)`.
- **Bolsa (conductor):** `postular(busquedaId) → { ok, error? }`.
- **Bolsa (titular):** `cambiarPlanTitular(plan)`, `publicarEnBolsa(busquedaId, { visibilidad, perfiles? }) → { ok, error? }` (respeta visibilidades y cupo del plan), `quitarDeBolsa(id)`, `destacarOferta(id) → { ok, error? }` (solo plan Flota), `quitarDestacado(id)`, `cambiarEstadoBusqueda(id, 'activa'|'pausada'|'cubierta') → { ok, error? }`, `verPostulacion(postulacionId)`, `escribirAPostulante(postulacionId, texto) → { ok, error? }` (no puede si la cuenta del titular está suspendida), `descartarPostulacion(postulacionId)`, `alternarFavoritoTitular(conductorId)`.
- **Panel:** sus acciones (aprobar o no aprobar documentos, negocios, zonas, reglas, ajustes, reportes, equipo y el registro de acciones) **no están en esta tienda**: viven en `panel/src/datos/acciones.ts` y escriben con `useDemo.setState`. Ninguna pantalla de esta app las usa.

**Acciones propias:** en tu carpeta, `src/pantallas/<grupo>/acciones.ts`:

```ts
import { useDemo, nuevoId, ahoraISO } from '@/datos/tienda';
export function marcarAlgo(id: string) {
  useDemo.setState((s) => ({ favoritos: [...s.favoritos, id] }));
}
```

Si cambias documentos del usuario a mano, recuerda que `estadoVerificacion` se calcula con `calcularVerificacion(documentos)` (exportada en `tienda.ts`).

### Selectores y hooks (`@/datos/selectores`, `@/datos/hooks`)

| Hook | Devuelve |
|---|---|
| `useMatchesDelUsuario()` | `MatchUsuario[]` vigentes, por % (`id` = id de búsqueda, `busqueda`, `titular`, `negocio`, `comuna`, `zona`, `resultado` (ver match.ts), `origen`, `favorito`, `contactoCompartidoEl`, `direccionCompartidaEl`, `noLeidos`, `condiciones` "Retiro en X · Día · Lu a Sá") |
| `useMatchDelUsuario(id)` | Un `MatchUsuario` (aunque ya no esté vigente: mira `vigente`) o `null` |
| `useEstadoInicio()` | `'incompleto' \| 'en_revision' \| 'con_observaciones' \| 'verificado' \| 'sin_matches'` (B6 / C3 / C3 con observaciones / C5 / C6) |
| `useAvancePerfil()` | `{ listos, total: 5, porcentaje, faltantes, siguientePaso }` |
| `useDiagnosticoMatches()` | Por qué no hay matches (`precondicion`, `porFiltro`, `bajoUmbral`) |
| `useResumenDocumentos()` | `{ aprobados, enRevision, rechazados, subidos, faltan, vencenPronto, todosConArchivo }` |
| `useConversaciones()` | `ConversacionResumen[]` (`busquedaId`, `titular`, `negocio`, `ultimo`, `noLeidos`, `escribiendo`, `contactoCompartido`, `bloqueado`) |
| `useMensajesNoLeidos()` | número |
| `useOfertasBolsa()` | `OfertaBolsa[]` que ve el usuario (R29): `busqueda`, `titular`, `negocio`, `comuna`, `esMatch`, `porcentaje`, `destacada`, `postulacion`, `condiciones` |
| `usePostulacionesDelUsuario()` | `{ postulacion, busqueda, titular, negocio, condiciones }[]` |
| `useEntregasDelUsuario()` | `EntregaDatos[]` (más recientes primero) |
| `useTitularDemo()`, `usePlanDemo()` | Titular `t01` y su `Plan` (o `null` sin plan) |
| `useBusquedasDelTitular()` | `BusquedaTitular[]` (`coinciden` = conductores verificados que hacen match: el adelanto anónimo, `postulantes`, `postulantesNuevos`, `destacada`, `condiciones`) |
| `usePostulantes(busquedaId)` | `{ postulacion, conductor: ConductorVista }[]` |
| `useConductoresQueCalzan(busquedaId)` | `{ conductor: ConductorVista, resultado }[]` |
| `useCatalogos()`, `useAjustes()`, `useNegociosActivos()`, `useNegociosPorIndustria(soloActivos?)` | Catálogos y ajustes |
| `useAhora(ms?)` | Fecha actual que se refresca (para "hace 5 min") |

Funciones útiles de `selectores.ts`: `nombreTitular(t)` (razón social o nombre), `insigniaTitular(t)` ("Empresa revisada en SII" / "Cédula revisada"), `nombreCompleto(p)`, `primerNombre(s)`, `textoCondiciones(s, b)`, `lugar(s, comunaId)` → `{ comuna, zona, region }`, `negocioPorId`, `titularPorId`, `busquedaPorId`, `comunaPorId`, `zonasDeRegion`, `comunasDeRegion`, `negocioPermitidoPorDeclaradas(s, negocioId)`, `debeReconfirmarDisponibilidad(s)`, `proximaReconfirmacion(s)`, `documentoVencePronto(doc)`, `simularMatch(s, conductorId, busquedaId)`, `cumplePerfiles(s, conductorId, negocioId, perfiles)`, `puedeElegirVisibilidad(s, v)`, `todosLosConductores(s)`, `SECCIONES`, `TIPOS_DOC_ORDEN`, `ID_USUARIO` (`'yo'`).

`formato.ts`: `textoDias(dias)` ("Lu a Sá", "Todos los días"), `textoTurnos(turnos)` ("Día y noche"), `fechaLarga` (dd/mm/aaaa), `fechaCorta` (dd/mm), `fechaConMes` ("4 nov"), `hora`, `cuandoCorto` (hora, "Ayer" o dd/mm), `haceCuanto`, `diasHasta`, `edad('dd/mm/aaaa')`, `mascaraFecha`, `mascaraCelular`, `celularCompleto`, `iniciales`, `plural`.

`direcciones.ts`: `sugerirDirecciones(texto, comunas, nombreRegion)` → 3 sugerencias `{ direccion, comunaId, detalle }` (las comunas nombradas en el texto o, si no, comunas de Santiago). Muestra "Sugerencias de Google Maps" como en la maqueta, pero es simulado.

### Motor del match (`match.ts`)

Puro, sin React. Lo usan los selectores con las reglas editables del estado; las pantallas casi nunca lo llaman directo.

- `evaluarMatch({ conductor, busqueda, catalogo, reglas, bloqueado?, titularSuspendido? }) → ResultadoMatch { hayMatch, precondicionFallida, filtrosFallidos, porcentaje, coinciden, evaluadas, noCoinciden, textosNoCoinciden, detalle[] }`.
- Condiciones previas: perfil completo, verificado, disponible, cuentas activas, negocio e industria activos, búsqueda activa, sin bloqueo (`TEXTO_PRECONDICION` las explica).
- Filtros: F1 negocio, F2 alguna clase **revisada** habilita el negocio ('B' incluye las clases con `habilitaClaseB`; según la respuesta sobre el vehículo si el negocio la tiene), F3 misma región, M3 al menos un turno en común.
- %: M2 misma zona, M4 años (categoría relacionada con más años ≥ mínimo), M6 estacionamiento (si se exige), M7 días (comunes ÷ pedidos). Hay match si `suma(peso × valor) × 100 ≥ umbral × suma(pesos)`. Lo que el titular no exige coincide.
- Ayudas: `habilitaNegocio(clases, negocio, respuesta, catalogoClases)`, `textoPideLicencia(negocio)` ("Pide licencia A3"), `aniosEnNegocio(experiencia, negocio)`, `visibleEnBolsa(...)`, `cumplePerfilesBolsa(...)`.
- En la pantalla de detalle: "Coincide {porcentaje} %"; si `noCoinciden` no está vacío, se puede mostrar `textosNoCoinciden` ("otra zona", "no todos los días").

### Simulación (`simulacion.ts`, ya encendida en el layout raíz)

- **Pre-revisión IA:** `enviarDocumentosARevision()` deja los 4 en revisión; a los ~3 s la cédula y la licencia se aprueban solas (`quienDecidio: 'ia'`; la licencia copia las clases declaradas a revisadas) y la Hoja de Vida y los antecedentes quedan con `etapa: 'equipo'` ("En revisión").
- **Revisión del equipo:** si nadie la hace a mano en el panel, se simula: cada documento con `etapa: 'equipo'` se aprueba solo a los ~12 s (`SEGUNDOS_REVISION_EQUIPO` en `tienda.ts`; `quienDecidio: 'persona'`). Lo mismo después de "No estoy de acuerdo: pedir otra revisión". "Aprobar ahora" (Inicio, C3) no espera. Con los 4 aprobados → `verificado` (toast "¡Listo! Tus 4 documentos están aprobados."). El equipo simulado no rechaza: para ver `con_observaciones` y C4 está el atajo "Documento no aprobado" del selector. Al quedar verificado, a los ~7 y ~16 s dos titulares "abren su ficha" (aparecen en Quién recibió mis datos).
- **Revisión a mano (panel en uso):** mientras el panel de la demo está en uso en el navegador (`useRevisionManual()` es `true`), no se programa la revisión simulada y se quitan las ya programadas: los documentos esperan la decisión del panel. Inicio (C3) dice "Demo: esperando la revisión del equipo." y "Aprobar ahora" sigue funcionando. Al salir del panel (o con "Reiniciar demo") vuelve la simulación: lo que espera se aprueba ~12 s después. Las decisiones del panel llegan por el evento "storage" y se avisan con un toast en las pantallas del conductor (`avisosEntrePestanas.ts`).
- La simulación corre en la pestaña de esta demo. El panel la enciende de respaldo (`iniciarSimulacion({ respaldo: true })`): la lleva solo si esta demo no está abierta y sin sus avisos; cuando se abre, esta demo retoma el turno.
- Una pestaña con la versión anterior de la demo (v3) no simula mientras haya una de esta versión: se le deja tomado su turno.
- Mensajes ocultos por el equipo (`oculto: true`, al resolver un reporte) se ven como "Mensaje oculto por el equipo.". Un titular suspendido no responde ni puede escribir (`escribirAPostulante` devuelve un error).
- **Chat:** `enviarMensaje()` programa la respuesta del titular a los 2–4 s (`titularEscribiendo[busquedaId]` es `true` durante los últimos ~2,5 s: muestra "escribiendo…"). Después del segundo mensaje del conductor, el titular comparte su contacto (mensaje de sistema y `contactoCompartido[busquedaId]`). El teléfono que se muestra es `titular.telefono` (ficticio).
- **Bolsa:** al postular a una oferta de otro titular, a los ~6 s queda "Vista" y (una de cada dos) a los ~14 s "Te escribió", con un mensaje nuevo y el match con origen "Postulación". Las postulaciones a ofertas de `t01` (el titular de la demo) cambian cuando alguien entra como titular y responde.
- Las tareas viven en `state.pendientes`: sobreviven a cambiar de pantalla y a recargar.

### Datos de ejemplo (quién es quién)

- **Titular de la demo:** `t01` Transportes Los Aromos SpA (empresa, plan Flota chica). Búsquedas `b01` (Taxi, Providencia, en la bolsa: solo match; 3 postulantes), `b05` (Taxi, Maipú, bolsa: solo match; 1 postulante), `b06` (Taxi, La Florida, bolsa: perfiles Zona Sur; 1 postulante), `b12` (Taxi ejecutivo, Vitacura, pausada).
- **Otros titulares:** `t02` Ejecutivos Cordillera SpA (b02, b04, b13 destacada en la bolsa para todos, b14 bolsa perfiles Zona Oriente), `t03` Rodrigo Pizarro (b03), `t04` Mónica Sepúlveda (b07), `t05` Taxis Bahía Azul Ltda. (Viña y Valparaíso: b08, b10), `t06` Jorge Alarcón (Concepción: b09), `t07` Claudio Espinoza (Puente Alto: b11).
- **Conductor de ejemplo** (Ñuñoa, A2 y B, 5 años liviano, Taxi y Taxi ejecutivo, día, lunes a sábado, con estacionamiento): **5 matches** `b01` 100 %, `b02` 100 %, `b14` 100 %, `b07` 88 %, `b03` 71 %. En la bolsa ve `b13` (destacada), `b11`, `b14` y, ya verificado, `b01` (que es "solo quienes hacen match"). Con una dirección en otra comuna de Santiago el número cambia (3–5); en Concepción no tiene matches (C6).
- **Conductores ficticios** `c01`…`c10`: verificados, uno con la licencia rechazada (`c06`), uno incompleto (`c07`) y tres con documentos esperando al equipo (`c03`, `c08`, `c10`: 7 documentos en total; nunca se aprueban solos: los decide el panel de la demo).
- **Reportes:** `r01` (pide dinero) y `r02` (spam), abiertos, con su conversación. Los resuelve el panel de la demo; un reporte del conductor queda abierto ("Nuestro equipo la está revisando") hasta que el panel lo resuelve.

## 5. Comandos y comprobación

Desde `/home/user/appconductores/aplicacion`. **Cada agente usa su propia carpeta temporal y su propio puerto** (hay agentes en paralelo):

```bash
export TMPDIR=/tmp/claude-0/-home-user-appconductores/a49116f8-7c86-54b9-8624-19dd22438642/scratchpad/mf/tmp-<tu-etiqueta>
mkdir -p "$TMPDIR"
npx tsc --noEmit                 # sin errores antes de terminar (si moviste o borraste rutas, corre antes `npm run web` una vez: regenera .expo/types y así tsc avisa de los enlaces rotos)
npm run test:match               # pruebas (58): motor del match, guardado, migración, revisión manual y revisor del export
CI=1 npx expo export -p web --output-dir /tmp/claude-0/-home-user-appconductores/a49116f8-7c86-54b9-8624-19dd22438642/scratchpad/mf/dist-<tu-etiqueta>
node scripts/revisar-export-sin-panel.mjs <esa carpeta>   # el export no lleva nada del panel
```

Para publicar el sitio completo (esta demo en la raíz y el panel en `/panel`): `cd ../panel && npm run export:demo` → `dist-demo/` en la raíz del repositorio (ver `panel/README.md`).

Servir y capturar (Playwright ya está instalado; `require('playwright')` funciona desde cualquier carpeta):

```bash
H=/tmp/claude-0/-home-user-appconductores/a49116f8-7c86-54b9-8624-19dd22438642/scratchpad/mf/herramientas
node $H/servidor.mjs <dist-tu-etiqueta> <puerto-único> &      # estático con fallback a index.html
node $H/capturar.mjs http://localhost:<puerto> <carpeta-salida> 390x844 /conductor/matches /conductor/matches/b01
node $H/capturar.mjs http://localhost:<puerto> <carpeta-salida> 1280x800 /titular
node $H/pagina-completa.mjs http://localhost:<puerto>/conductor/registro/4 salida.png 1600 [texto-a-tocar ...]
```

Para preparar el estado antes de capturar, la tienda está en `window.__daleDemo` (ej. en un script de Playwright: `await page.evaluate(() => window.__daleDemo.getState().prepararConductorVerificado())`, o `capturar.mjs` con la ruta `"/conductor/matches|js:window.__daleDemo.getState().prepararConductorVerificado()"`). El estado queda en `localStorage`; usa un contexto nuevo o `reiniciarDemo()` entre pruebas. Detén tus servidores al terminar.

Compara cada captura con la de la maqueta (`render.js`) y ajusta espaciados, tamaños y textos hasta que se vean iguales en espíritu.

## 6. Detalles que ahorran tiempo

- **Fuentes:** solo funcionan vía `Texto`, `Titulo`, `tipo.*` o `fuente(peso)`. Un `<Text>` suelto sale con la fuente del sistema.
- **Pantallas de pestaña:** `<Pantalla inferior={24}>` y sin `Encabezado` con volver (como las maquetas D1, D3, E1).
- **Pantallas encima de las pestañas** (detalle, conversación, subir documento…): `<Encabezado volverA="/conductor/…" />` para que el botón volver funcione también si se abrió el enlace directo.
- **Chat (D4):** usa `cabecera` para el encabezado fijo y `pie` para la barra de escribir; desplaza al final con `scrollRef` (`scrollToEnd`) cuando lleguen mensajes.
- **Botón final abajo:** `style={{ marginTop: 'auto' }}` en el contenedor de botones (la `Pantalla` estira el contenido al alto de la pantalla).
- **Accesibilidad:** zonas táctiles de 44 px como mínimo; usa `role`/`aria-*` (ya lo hacen los componentes); `etiquetaAccesible` en botones de solo ícono.
- **Estados:** cada lista con `EstadoVacio`; acciones lentas con `Boton cargando`; errores con `Aviso tono="error"` o `mostrarToast(..., 'error')`.
- **Animaciones:** sutiles. `Pantalla` ya anima la entrada; para más, `Animated` de React Native con `useNativeDriver: false` (web).
- **useEffect:** escribe el cuerpo entre llaves (`useEffect(() => { accion(); }, [...])`). Un efecto que devuelve algo que no es una función rompe la pantalla al salir.
- **Fechas:** guárdalas en ISO (`ahoraISO()` de `tienda.ts`) y muéstralas con `formato.ts`.
- **Escritorio:** conductor y titular ya se ven como columna de celular (máx. 430 px). No pongas anchos fijos mayores a 390 px en pantallas de celular.
- **Modales:** `HojaInferior` y `Dialogo` ya quedan dentro del ancho de la columna.

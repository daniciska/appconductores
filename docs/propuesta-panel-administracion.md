# Propuesta: panel de administración como app aparte

**Estado:** Propuesta, por decidir. Fecha: 7-nov-2026. Lo marcado **[verificar]** no está confirmado.

## Qué pidió la dueña (7-nov)

> "El panel de administración no debería mostrarse en el mockup. El panel de administración debería ser una app distinta (¿? decidámoslo antes)."

Son dos cosas:

1. **Sacar el panel de la demo.** Ya se hizo (ver abajo).
2. **Decidir si el panel es una app distinta** de la que usan conductores y titulares. Eso propone este documento.

**Qué es el panel:** la parte que usa el equipo de Dale Contacto para revisar documentos, atender reportes, suspender cuentas y cambiar la configuración (negocios activos, zonas, reglas del match, ajustes). Ya está decidido que es **web** y que todo lo configurable se cambia ahí.

## Lo que ya se hizo (7-nov)

- El panel salió de la demo. Su código **no se borró**: quedó guardado en `aplicacion/src/panel/`. Se sigue revisando junto con el resto para que no se eche a perder.
- En la demo, lo que hacía una persona del equipo ahora se simula solo: la Hoja de Vida y los antecedentes se aprueban unos 12 segundos después de quedar "En revisión". Se mantiene el atajo "Aprobar ahora" y se agrega uno para ver un documento no aprobado.
- **La demo ya se volvió a publicar sin el panel (7-nov).** Lo publicado no trae textos ni direcciones del panel, y /admin muestra "Esta pantalla no existe".

Sin el panel, en la demo ya no se pueden ver la bolsa apagada, la alerta de campos obligatorios, un reporte resuelto, un titular suspendido ni los cambios de negocios, zonas, reglas del match y plazos. Todo eso queda con sus valores iniciales.

## Opciones comparadas

| Opción | Cómo sería | Costo extra al mes | Esfuerzo | Puntaje (MVP · seguridad · mantención) |
|---|---|---|---|---|
| **A. Misma app** | El panel vive dentro de la app de conductores y titulares, en la dirección /admin. Solo entra el equipo. | US$0 | Bajo | 2 · 2 · 2 |
| **B. App aparte, misma tecnología** | Otra app web, en el mismo repositorio, hecha con Expo como la app. Comparte diseño, tipos de datos y reglas del match. Tiene su propia dirección. | US$0 | Medio | **5 · 5 · 5** |
| **C. App aparte, otra tecnología** | Otra app web hecha con herramientas solo web (Vite, Next.js o Refine). Comparte solo los tipos de datos y las reglas del match. | US$0 con Vite; más con Next.js [verificar] | Alto | 2 · 4 · 2 |
| **D1. Supabase Studio** | Usar el panel técnico de Supabase, que ya tienes. | US$0 (limitar roles: US$599/mes) | Bajo | 2 · 1 · 1 |
| **D2. Retool, Appsmith u otra en la nube** | Armar el panel en una herramienta externa conectada a la base. | Gratis hasta 5 personas; después US$5 a 18 por persona [verificar] | Bajo al inicio, alto para todo lo que pide el panel | 1 · 1 · 1 |
| **E. Un proyecto, dos publicaciones** | La misma carpeta `aplicacion/` publica dos sitios: uno sin panel y otro solo con el panel. | US$0 | Medio-bajo, pero frágil | 2 · 3 · 3 |

Puntaje de 1 a 5, de tres evaluaciones independientes: lo mínimo vendible (MVP), seguridad y mantención.

**Por qué no las otras:**

- **A:** va contra tu pedido. Además, el código del panel viajaría al celular de cada conductor y dentro de la app de las tiendas. Apple (regla 2.5.19) y Google piden que no haya funciones escondidas, así que habría que declarárselo a sus revisores [verificar si causaría rechazo]. Y cada cambio del panel obligaría a sacar una versión nueva de la app y a pasar otra vez la revisión de las tiendas.
- **C:** hay que rehacer las ~3.700 líneas del panel que ya existen y mantener a mano dos diseños parecidos. Gana en tablas grandes, que con pocos conductores al lanzar no hacen falta. La evaluación de seguridad le dio 4 porque, hecha como sitio sin servidor, aísla igual que B. Las otras dos la bajaron por el trabajo extra.
- **D1:** es para técnicos. Quien entra ve y cambia todo, sin diferencia entre revisor y administrador y sin registro de quién hizo qué. Sirve solo para emergencias tuyas y de Claude.
- **D2:** un tercero guardaría una llave con acceso a toda la base, y los datos pasarían por sus servidores (en el caso de Retool, en EE. UU.). Con la Hoja de Vida y los antecedentes de por medio, eso necesita revisión del abogado. Además cobra por persona y no reusa nada de lo hecho.
- **E:** Expo pide expresamente no cambiar la carpeta de pantallas y no da soporte a quien lo hace. Es fácil que se cuele código del panel en la app.

## Recomendación

**Opción B, por etapas.** Las tres evaluaciones eligieron la misma.

1. **Ahora:** no se construye nada nuevo. El panel queda guardado en `aplicacion/src/panel/`, fuera de la demo.
2. **Cuando se construya el panel real**, conectado a la base y junto con la etapa de documentos, se crea la app del panel en el mismo repositorio, con Expo y en su propia dirección.

**Por qué, en simple:**

- Cumple lo que pediste: el panel es otra app, con otra dirección.
- La app de conductores y titulares, que es la que va a las tiendas, no lleva nada del panel. Pesa menos y no hay nada escondido que explicarles a Apple o Google.
- Reusa casi todo lo ya hecho: las pantallas del panel, el diseño y las reglas del match.
- Mantiene una sola tecnología (Expo + TypeScript), como ya está decidido.
- El panel se corrige en minutos, sin pasar por las tiendas.
- No suma costo mensual.
- No se construye antes de tiempo. El panel de la demo usa datos de ejemplo, y el real igual tiene que conectarse a la base.

## Decisiones para ti

1. **¿El panel es una app aparte?**
   *Propuesta:* sí, con la opción B.
2. **¿Cuándo se construye?**
   *Propuesta:* junto con el panel real, cuando se haga la etapa de documentos de la base. Hasta entonces queda guardado y no se publica.
3. **¿Quieres ver el panel antes, en una demo aparte?**
   *Propuesta:* no hace falta; se revisa con el panel real. Si lo quieres ver antes, iría en otro sitio de tu Netlify, visible solo con tu cuenta y con sus propios datos de ejemplo. Costaría entre medio día y un día de trabajo [verificar estimación]. Ojo: dos direcciones distintas no comparten lo guardado en el navegador, así que lo que se apruebe en esa demo no se verá en la demo del conductor.
4. **¿En qué dirección va y quién la configura?**
   *Propuesta:* `panel.dalecontacto.cl`. Se parte con la dirección que da Netlify (algo.netlify.app) y el registro DNS se agrega después. El registro DNS es la línea que se agrega en tu hosting para que la dirección apunte al sitio. Lo agregas tú una sola vez (el dominio está a nombre de Mario).
5. **¿Quiénes usarán el panel al lanzar, cuántas personas y desde dónde?**
   *Propuesta:* lo tienes que decir tú, porque con eso se definen los roles. Mientras tanto, pensarlo para computador, como el de la demo, y que en el celular sirva para lo urgente.
6. **¿El equipo debe dar un segundo paso para entrar?**
   *Propuesta:* sí, obligatorio para todo el equipo, con una app de códigos en el celular (tipo Google Authenticator), que muestra un número que cambia cada 30 segundos. Es gratis. Protege si alguien consigue un duplicado del chip de una persona del equipo. Por SMS no: cuesta US$75/mes y no protege contra eso.
7. **¿Quién suma gente al equipo y cuántos administradores hay?**
   *Propuesta:* solo un administrador suma gente, con una invitación a su celular. Al menos dos administradores desde el inicio: si el único pierde su celular, hoy solo se recupera con un cambio técnico en la base.
8. **¿Un revisor puede suspender cuentas? ¿También a un administrador? (MD52)**
   *Propuesta:* un revisor puede suspender conductores y titulares. Solo un administrador puede suspender a alguien del equipo. Una cuenta suspendida pierde el acceso al panel.
9. **¿Alguien del equipo puede ser también conductor o titular con la misma cuenta?**
   *Propuesta:* sí. La base ya le aplica a sus propios datos las mismas reglas que a cualquiera, así que nadie aprueba sus propios documentos.
10. **¿Qué trae el primer panel real?**
    *Propuesta:* lo de todos los días: revisar documentos, atender reportes, suspender cuentas y encender o apagar negocios, industrias y la bolsa. Después vienen zonas, reglas del match, plazos y equipo. Mientras falten, Claude hace esos cambios en la base y quedan anotados en el repositorio. Ojo: ya está decidido que todo se configura desde el panel; esto solo cambia el orden.
11. **En la demo, ¿quieres poder ver la bolsa apagada y la alerta de campos obligatorios?**
    *Propuesta:* agregar dos interruptores en el menú de la demo, solo si quieres revisar esas pantallas. No son el panel: solo sirven para mirar.
12. **¿Cuánto se puede gastar al mes en el panel?**
    *Propuesta:* US$0 extra. Sin Netlify Pro (US$20/mes) y sin herramientas que cobran por persona.

**Relacionadas, siguen abiertas:** ¿el equipo ve la dirección del conductor? (está en `docs/plan.md`) y ¿el equipo puede corregir datos de una persona o solo cambiar estados, como hoy? (regla R31).

## Qué cambia si se aprueba

### Repositorio (la carpeta con todo el código del proyecto)

- **Hoy:** `aplicacion/` (la demo, con el panel guardado en `src/panel/`) y `supabase/` (la base de datos).
- **Con el panel real:** tres carpetas de código que comparten piezas (nombres por confirmar):
  - `aplicacion/`: conductores y titulares. Es la que va a la web y a las tiendas.
  - `panel/`: solo web y solo para el equipo.
  - `comun/`: lo que usan las dos, es decir, colores y botones, tipos de datos, reglas del match y textos de documentos.
- Las dos apps usan la misma versión de Expo y React y se actualizan juntas [verificar con Expo SDK 58].
- **Regla fija:** la app nunca usa nada del panel. Antes de cada publicación de la app, una prueba automática revisa que no lleve textos ni direcciones del panel.
- **"Todo configurable" vive en la base:** el panel escribe la configuración y la app solo la lee.

### Publicación y dirección

- Dos sitios en tu cuenta de Netlify: el de la app (hoy, la demo) y uno nuevo para el panel. Se publican por separado.
- El panel se actualiza sin pasar por las tiendas. Un cambio en `comun/` obliga a probar y publicar los dos.
- Dirección: `panel.dalecontacto.cl`, con un registro DNS más.
- El sitio del panel lleva protecciones propias: no aparece en buscadores, no se puede abrir dentro de otra página y no carga código de terceros (ni siquiera analítica).

### Acceso del equipo

- Se entra igual que todos: celular y código por WhatsApp, con SMS de respaldo. Solo pasa quien está en la lista del equipo (`miembros_equipo`, con rol revisor o administrador).
- Segundo paso obligatorio con app de códigos (ver decisión 6).
- El panel solo manda códigos a celulares del equipo, para que nadie cree cuentas ni gaste mensajes desde ahí [verificar cómo se hace en Supabase].
- Para sumar a alguien se usa una invitación por su celular, aunque esa persona no haya entrado nunca.
- La app de las tiendas no tiene nada del equipo. A los revisores de Apple y Google se les da una cuenta de prueba de conductor o titular, nunca una del equipo.

### Base de datos

- **Ahora no cambia nada.** La Etapa 1 ya limita al equipo con reglas dentro de la base (RLS, las reglas que deciden qué puede ver y cambiar cada persona), venga de la app que venga.
- **Con el panel real se agregan:**
  - El registro de acciones del equipo (`acciones_equipo`): quién abrió un documento, quién aprobó, suspendió o cambió algo. No se puede modificar.
  - Una función del servidor (un pequeño programa que corre en Supabase y no en el navegador) para abrir la Hoja de Vida, los antecedentes o la cédula. Primero anota quién los abre y después entrega un enlace que dura pocos minutos.
  - La base exige el segundo paso para dar permisos de equipo.
  - Una cuenta suspendida pierde el acceso al panel, y un revisor no puede suspender a un administrador (MD52).
  - Las invitaciones por celular.
- **Nunca** se usa la llave maestra de Supabase (la que se salta todas las reglas) en el panel ni en una herramienta externa.
- Supabase Studio y el conector de Supabase de Claude quedan solo para ti y para Claude: cambios de la base, el primer administrador y emergencias.

### Demo (mockup)

- Queda sin panel, con la revisión del equipo simulada. Publicada así el 7-nov.
- Si quieres una demo del panel, va aparte (ver decisión 3).

### Costo

- US$0 extra al mes: otro sitio en tu cuenta de Netlify, en el plan Personal [verificar que dos sitios no se coman los créditos del plan].
- Sin Netlify Pro, sin Retool ni Appsmith y sin segundo paso por SMS.

### Documentos del proyecto

- `CLAUDE.md`: anotar la decisión en "Decisiones tomadas".
- `docs/plan.md`: agregar el panel como app aparte en la fase de construcción (el punto 7 ya se corrigió el 7-nov: la demo no incluye el panel).
- `docs/modelo-datos.json`: ampliar la regla R26 (segundo paso, invitaciones, quién puede suspender).
- `docs/consulta-abogado.md`: agregar las preguntas de abajo.

## Preguntas para el abogado (agregar a la pauta)

- ¿Qué medidas mínimas exige la ley para que el equipo vea datos de infracciones penales (Ley 21.719, art. 25)? Por ejemplo: segundo paso para entrar, registro de cada apertura, mínimo de permisos, no revisar desde celulares personales. (Amplía A52.)
- Si los revisores no son empleados (por ejemplo, externos), ¿pueden ver los documentos? ¿Qué deben firmar?
- ¿Cuánto tiempo se guarda el registro de acciones del equipo y quién lo puede ver? ¿La persona puede pedir quién vio sus datos?
- Con datos reales, ¿está bien el acceso total de la dueña por Supabase Studio y el de Claude por el conector de Supabase? Ninguno de los dos respeta los permisos del equipo ni deja registro por persona. ¿Lo de Claude cuenta como otro encargado y otra transferencia internacional?
- Si las funciones del servidor corren fuera de Chile [verificar región], ¿cuenta como otra transferencia internacional, además de São Paulo? (Amplía A22.)
- Solo si algún día se considera una herramienta externa (Retool, Appsmith u otra): ¿es un nuevo encargado y una transferencia internacional? ¿Qué contrato exige? (Amplía A23 y A24.)

## Lo no confirmado

- Que Expo SDK 58 funcione con las tres carpetas en el mismo repositorio sin romper la demo [verificar].
- Cómo limitar en Supabase que el panel solo mande códigos a celulares del equipo [verificar].
- Que dos sitios en el plan Personal de Netlify no se coman los créditos [verificar].
- Si un panel por rol dentro de la app causaría rechazo en Apple o Google. Es una interpretación de sus reglas contra funciones escondidas [verificar].
- Que el editor de Supabase Studio trabaje con un rol que se salta las reglas de la base. Hay una fuente oficial parcial [verificar].
- Que con el ingreso por celular no haya que configurar direcciones de redirección en Supabase para el sitio nuevo [verificar].
- Las estimaciones de esfuerzo: demo del panel aparte, entre medio día y un día; panel real, de varios días a semanas [verificar].
- Los precios de Retool y Appsmith y dónde guarda los datos Appsmith [verificar] (solo si se vuelve a considerar D2).

## Cómo se armó

Primero hubo tres revisiones en paralelo: cómo estaba conectado el panel con la demo, qué permite hoy la base de datos (Etapa 1) y qué opciones hay, con sus precios y las reglas de las tiendas. Para esto se usaron fuentes oficiales de Expo, Apple, Google, Supabase y Netlify, y de OWASP, una guía de seguridad web muy usada. Después hubo tres evaluaciones independientes: lo mínimo vendible, seguridad y mantención. Las tres eligieron la opción B.

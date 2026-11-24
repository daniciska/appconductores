# Base de datos de Dale Contacto (Supabase)

Etapa 1: catálogos, cuentas, equipo, autorizaciones y perfil del conductor.
Desde el 9-nov, además: los textos de prueba de "Antes de empezar" y los ajustes que la app puede leer (app real del conductor v1).
Desde el 24-nov, además: las mejoras aprobadas de la app del conductor que cambian datos (S07, S12 y S14) y los documentos del conductor (Paso 5): tipos de documento, documentos, revisiones, el método de validación (hoy aprueba todo), el espacio privado de Storage, los vencimientos y el perfil completo.
Todavía no hay titulares, búsquedas, match, mensajes ni cobro.

## Qué hay en cada carpeta

| Carpeta / archivo | Qué es |
|---|---|
| `migrations/20261102120000_etapa1_esquema.sql` | Tablas, funciones auxiliares (esquema `privado`), triggers, seguridad por filas (RLS) y permisos. |
| `migrations/20261102120100_etapa1_datos_iniciales.sql` | Datos de partida: regiones, zonas, comunas, licencias, industrias, tipos de vehículo, negocios, listas y el umbral del match. |
| `migrations/20261109190000_quitar_etmday_leads.sql` | Borra `etmday_leads`, una tabla de otro negocio que apareció el 6-nov en el proyecto (la dueña pidió borrarla). |
| `migrations/20261110120000_app_conductor_v1_textos_prueba.sql` | Los 4 textos de "Antes de empezar" como versión `prueba-1` (sin abogado), para que la app pueda guardar lo que se acepta. |
| `migrations/20261110120100_app_conductor_v1_ajustes_publicos.sql` | Columna `publico` en `ajustes` (lo que la app puede leer) y `dias_reconfirmar_disponibilidad = 30`. |
| `pruebas/app_conductor_v1_pruebas.sql` | Pruebas de lo que escribe la app del conductor v1 en cada pantalla (37). Terminan en `ROLLBACK`. |
| `pruebas/app_conductor_v1_postgrest.sql` | La app real v1 con el SQL que arma PostgREST para sus pedidos (upsert con `DO UPDATE SET` de todas las columnas, `RETURNING id`, insert por columnas) y los ids de catálogo que usan sus pruebas (15). Terminan en `ROLLBACK`. |
| `migrations/20261116120000_negocios_con_licencia_b_y_c.sql` | Enciende Transporte por aplicación (B) y Moto delivery (C), y la industria de carga solo con Moto delivery (aprobado el 16-nov). |
| `pruebas/negocios_con_licencia_b_y_c_pruebas.sql` | Pruebas de esa migración: quien tiene solo B o solo C ya puede elegir un negocio (9). Terminan en `ROLLBACK`. |
| `migrations/20261124120000_experiencia_ejemplo_taxi.sql` | S07: el ejemplo de "Vehículo liviano" pasa a "auto, taxi, SUV, camioneta" (aprobado el 24-nov). |
| `migrations/20261124120100_autorizaciones_solo_dos.sql` | S12: "Antes de empezar" pide solo `terminos_privacidad` y `compartir_ficha`; `revision_documentos` y `normas_mensajes` quedan no vigentes (no se borran) hasta que se construyan documentos y mensajes (aprobado el 24-nov). |
| `migrations/20261124120200_ajuste_aviso_reconfirmar.sql` | S14: ajuste público `dias_aviso_reconfirmar = 5` (cuántos días antes del plazo vuelve "Confirmar ahora" en Perfil; aprobado el 24-nov). |
| `pruebas/mejoras_conductor_24nov_pruebas.sql` | Pruebas de esas 3 migraciones (16). Terminan en `ROLLBACK`. |
| `migrations/20261124150000_documentos_conductor.sql` | Documentos del conductor (24-nov): `tipos_documento` (los 4, configurable), `documentos`, `revisiones_documento`, ajustes `metodo_validacion_documentos` (`aprobar_todo`) y `meses_aviso_vencimiento_documentos` (3), el método de validación (`privado.validar_documento`), el estado del perfil y de la verificación, los vencimientos y avisos, el espacio privado `documentos` de Storage con sus políticas, la versión `prueba-2` de "Revisión de mis documentos" si no hay una vigente, y la tarea diaria con pg_cron. |
| `pruebas/storage_simulado.sql` | Imita lo mínimo de Supabase Storage (`storage.buckets`, `storage.objects`, `storage.foldername`). **Nunca se aplica en Supabase.** |
| `pruebas/documentos_conductor_pruebas.sql` | Pruebas de los documentos (94): catálogo, Storage (nadie lee ni borra lo ajeno), reglas al subir, aprobación automática provisoria, reemplazos, otro método, vencimientos y avisos, perfil completo, catálogo configurable, "Revisión de mis documentos" con 2 o 4 textos y permisos. Terminan en `ROLLBACK`. |
| `scripts/generar_zonas.py` | Genera el bloque de regiones, zonas y comunas de la migración de datos desde `docs/propuesta-zonas.csv`. Ese bloque no se edita a mano. |
| `pruebas/auth_simulado.sql` | Imita lo mínimo de Supabase (roles y `auth.users`) para probar en local. **Nunca se aplica en Supabase.** |
| `pruebas/etapa1_pruebas.sql` | Pruebas de datos y de seguridad. Terminan en `ROLLBACK`: no dejan datos. |

## Probar en local (Postgres 16)

```bash
pg_createcluster 16 pruebas -p 5499 && pg_ctlcluster 16 pruebas start
su postgres -c "createdb -p 5499 dale"
su postgres -c "psql -p 5499 -d dale -X -v ON_ERROR_STOP=1 \
  -f supabase/pruebas/auth_simulado.sql \
  -f supabase/pruebas/storage_simulado.sql \
  -f supabase/migrations/20261102120000_etapa1_esquema.sql \
  -f supabase/migrations/20261102120100_etapa1_datos_iniciales.sql \
  -f supabase/pruebas/etapa1_pruebas.sql \
  -f supabase/migrations/20261109190000_quitar_etmday_leads.sql \
  -f supabase/migrations/20261110120000_app_conductor_v1_textos_prueba.sql \
  -f supabase/migrations/20261110120100_app_conductor_v1_ajustes_publicos.sql \
  -f supabase/pruebas/app_conductor_v1_pruebas.sql \
  -f supabase/pruebas/app_conductor_v1_postgrest.sql \
  -f supabase/migrations/20261116120000_negocios_con_licencia_b_y_c.sql \
  -f supabase/pruebas/negocios_con_licencia_b_y_c_pruebas.sql \
  -f supabase/migrations/20261124120000_experiencia_ejemplo_taxi.sql \
  -f supabase/migrations/20261124120100_autorizaciones_solo_dos.sql \
  -f supabase/migrations/20261124120200_ajuste_aviso_reconfirmar.sql \
  -f supabase/pruebas/mejoras_conductor_24nov_pruebas.sql \
  -f supabase/migrations/20261124150000_documentos_conductor.sql \
  -f supabase/pruebas/documentos_conductor_pruebas.sql"
```

Cada prueba imprime `OK  [código] ...`. Si una falla, psql se detiene con
`FALLA: ...`. Al final aparecen `FIN: todas las pruebas de la Etapa 1 pasaron.`, `FIN: todas las pruebas de la app del conductor v1 pasaron.`, `FIN: todas las pruebas de las formas de PostgREST de la app v1 pasaron.`, `FIN: todas las pruebas de los negocios con licencia B y C pasaron.`, `FIN: todas las pruebas de las mejoras del conductor del 24-nov pasaron.` y `FIN: todas las pruebas de los documentos del conductor pasaron.` (TOTAL_OK líneas `OK` en total, probado el 24-nov). Si los archivos están en una carpeta que el usuario postgres no puede leer, cópialos antes a una carpeta legible (por ejemplo `/tmp`).
El aviso `no se pudo crear o actualizar la cuenta` es esperado: lo provoca la prueba A8.

Para repetir desde cero: `su postgres -c "dropdb -p 5499 dale"` y volver a crearla.

## Cambiar las zonas

1. Editar `docs/propuesta-zonas.csv`.
2. `python3 supabase/scripts/generar_zonas.py` (reescribe el bloque generado).
3. `python3 supabase/scripts/generar_zonas.py --comprobar` revisa que esté al día.

Si cambian los conteos aprobados (16 / 81 / 346), se ajustan en `ESPERADO` dentro del script.
Una vez aplicada en Supabase, la migración no se vuelve a correr: los cambios
posteriores se hacen desde el panel o con una migración nueva.

## Reglas que conviene saber

- **Quién escribe qué.** La persona solo cambia lo suyo. Estados, fechas de
  verificación, clases revisadas y roles los escriben el sistema (`postgres`,
  `service_role`) o el equipo. El equipo, en la cuenta o el perfil de **otra**
  persona, solo cambia estados (no correo, celular, avisos, datos ni id) y solo
  anota clases **revisadas**; en lo **propio** tiene las mismas reglas que
  cualquiera (nadie se revisa a sí mismo). Los triggers lo hacen cumplir aunque
  la app se equivoque.
- **La cuenta nace al confirmar el código.** Supabase Auth crea el usuario en
  `auth.users` cuando se pide el código; la fila de `cuentas` aparece recién
  cuando se confirma (`phone_confirmed_at`).
- **La app no elige ids.** En `consentimientos` y `experiencia_conductor` el
  INSERT se da por columnas, sin `id`. Si se agrega una columna que la app deba
  escribir, hay que sumarla a ese `grant`.
- **Quitar una clase declarada quita los negocios que ya no habilita.** Para
  cambiar las clases, la app agrega las nuevas antes de quitar las viejas (o
  quita solo las que se desmarcan); si borra todas y las vuelve a poner, se
  pierden los negocios elegidos.
- **El primer administrador** se crea a mano en el editor SQL de Supabase, después
  de que esa persona entre una vez con su celular:

  ```sql
  insert into public.miembros_equipo (id, rol)
  select id, 'administrador' from public.cuentas where celular = '+569XXXXXXXX';
  ```

- **Borrar un usuario que aceptó autorizaciones falla a propósito.** Qué se conserva
  al borrar una cuenta lo decide el abogado (R19 / MD23).
- **Documentos: el método de validación es una pieza aparte.** `privado.validar_documento` decide
  qué pasa con cada documento recién subido según el ajuste `metodo_validacion_documentos`
  (`aprobar_todo`: lo aprueba y deja la revisión "aprobación automática provisoria"; cualquier otro
  valor, por ejemplo `equipo`: queda en revisión). Para cambiar de método se cambia el ajuste o se
  reemplaza esa función; la app solo muestra el estado. El estado del perfil (`estado_perfil`,
  `estado_verificacion`) lo calcula `privado.recalcular_conductor` cada vez que cambia algo de los
  pasos 1, 2, 4 o de los documentos.
- **Documentos: el archivo primero, después la fila.** La app sube el archivo a
  `documentos/<su id>/<uuid>.<ext>` y después inserta la fila; la base revisa que el archivo exista y
  sea suyo. Un archivo solo se puede borrar si ningún documento vigente lo usa.
- **Vencimientos:** `privado.marcar_documentos_vencidos()` corre cada día con pg_cron (la migración lo
  agenda si pg_cron está disponible [verificar al aplicarla en Supabase]). `privado.documentos_por_avisar()`
  deja lista la lista para avisar por WhatsApp o correo; quien envíe el aviso anota
  `privado.anotar_aviso_vencimiento(id)`. Dentro de la app el aviso se calcula solo.
- **Vistas futuras:** siempre con `security_invoker = true`; si no, se saltan la RLS.
- **Funciones futuras:** en el esquema `privado`, con `set search_path = ''`. En `public`
  quedan expuestas por la API. Postgres le da EXECUTE a PUBLIC a cada función nueva y
  eso no se puede quitar por esquema (`alter default privileges in schema ... revoke`
  no tiene efecto): cada migración que cree una hace
  `revoke all on function ... from public, anon, authenticated, service_role;` y
  después los `grant` que necesite. La prueba E9 lo revisa.
- **Versiones de las migraciones:** si se aplican con `apply_migration` del conector,
  Supabase probablemente les pone su propio número de versión [verificar]. Si después
  se usa la CLI de Supabase, se alinean con `supabase migration repair`.

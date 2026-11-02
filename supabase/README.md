# Base de datos de Dale Contacto (Supabase)

Etapa 1: catálogos, cuentas, equipo, autorizaciones y perfil del conductor.
Todavía no hay titulares, búsquedas, match, documentos, mensajes ni cobro.

## Qué hay en cada carpeta

| Carpeta / archivo | Qué es |
|---|---|
| `migrations/20261102120000_etapa1_esquema.sql` | Tablas, funciones auxiliares (esquema `privado`), triggers, seguridad por filas (RLS) y permisos. |
| `migrations/20261102120100_etapa1_datos_iniciales.sql` | Datos de partida: regiones, zonas, comunas, licencias, industrias, tipos de vehículo, negocios, listas y el umbral del match. |
| `scripts/generar_zonas.py` | Genera el bloque de regiones, zonas y comunas de la migración de datos desde `docs/propuesta-zonas.csv`. Ese bloque no se edita a mano. |
| `pruebas/auth_simulado.sql` | Imita lo mínimo de Supabase (roles y `auth.users`) para probar en local. **Nunca se aplica en Supabase.** |
| `pruebas/etapa1_pruebas.sql` | Pruebas de datos y de seguridad. Terminan en `ROLLBACK`: no dejan datos. |

## Probar en local (Postgres 16)

```bash
pg_createcluster 16 pruebas -p 5499 && pg_ctlcluster 16 pruebas start
su postgres -c "createdb -p 5499 dale"
su postgres -c "psql -p 5499 -d dale -X -v ON_ERROR_STOP=1 \
  -f supabase/pruebas/auth_simulado.sql \
  -f supabase/migrations/20261102120000_etapa1_esquema.sql \
  -f supabase/migrations/20261102120100_etapa1_datos_iniciales.sql \
  -f supabase/pruebas/etapa1_pruebas.sql"
```

Cada prueba imprime `OK  [código] ...`. Si una falla, psql se detiene con
`FALLA: ...`. Al final aparece `FIN: todas las pruebas de la Etapa 1 pasaron.`
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

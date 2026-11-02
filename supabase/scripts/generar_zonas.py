#!/usr/bin/env python3
"""Genera la parte de regiones, zonas y comunas de la migración de datos iniciales.

Lee docs/propuesta-zonas.csv (columnas: region,zona,comuna) y reemplaza el bloque
entre los marcadores de supabase/migrations/20261102120100_etapa1_datos_iniciales.sql.
El resto de ese archivo (licencias, negocios, listas...) se escribe a mano.

Uso (desde la raíz del repositorio):
    python3 supabase/scripts/generar_zonas.py             # reescribe el bloque
    python3 supabase/scripts/generar_zonas.py --comprobar # solo revisa que esté al día
"""

import csv
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CSV = RAIZ / "docs" / "propuesta-zonas.csv"
MIGRACION = RAIZ / "supabase" / "migrations" / "20261102120100_etapa1_datos_iniciales.sql"

INICIO = "-- >>> INICIO: generado por supabase/scripts/generar_zonas.py (no editar a mano)"
FIN = "-- <<< FIN: generado por supabase/scripts/generar_zonas.py"

# Conteos aprobados (2-nov). Si el CSV cambia a propósito, se ajustan aquí.
ESPERADO = {"regiones": 16, "zonas": 81, "comunas": 346}

# Formas de uso común o de Google Maps (salen de docs/propuesta-zonas.md).
NOMBRES_ALTERNATIVOS = {
    "Paiguano": ["Paihuano"],
    "Llaillay": ["Llay-Llay"],
    "Calera": ["La Calera"],
}


def sql_texto(valor: str) -> str:
    """Literal de texto SQL con el apóstrofo escapado (ej. O'Higgins)."""
    return "'" + valor.replace("'", "''") + "'"


def sql_arreglo(valores: list[str]) -> str:
    if not valores:
        return "'{}'"
    return "array[" + ", ".join(sql_texto(v) for v in valores) + "]"


def leer_csv() -> list[dict]:
    with CSV.open(encoding="utf-8-sig", newline="") as f:
        filas = list(csv.DictReader(f))
    if not filas or set(filas[0].keys()) != {"region", "zona", "comuna"}:
        sys.exit(f"{CSV}: se esperaban las columnas region,zona,comuna")
    for i, fila in enumerate(filas, start=2):
        for col in ("region", "zona", "comuna"):
            fila[col] = (fila[col] or "").strip()
            if not fila[col]:
                sys.exit(f"{CSV}, línea {i}: falta '{col}'")
    return filas


def generar(filas: list[dict]) -> str:
    regiones: list[str] = []
    zonas: dict[str, list[str]] = {}
    region_de_zona: dict[tuple[str, str], str] = {}
    vistas: set[tuple[str, str]] = set()

    for fila in filas:
        region, zona, comuna = fila["region"], fila["zona"], fila["comuna"]
        if region not in regiones:
            regiones.append(region)
            zonas[region] = []
        if zona not in zonas[region]:
            zonas[region].append(zona)
        if (region, comuna) in vistas:
            sys.exit(f"Comuna repetida en {region}: {comuna}")
        vistas.add((region, comuna))
        region_de_zona[(region, zona)] = region

    conteos = {
        "regiones": len(regiones),
        "zonas": sum(len(z) for z in zonas.values()),
        "comunas": len(filas),
    }
    if conteos != ESPERADO:
        sys.exit(f"Conteos del CSV {conteos} distintos de los aprobados {ESPERADO}")

    comunas_csv = {f["comuna"] for f in filas}
    for nombre in NOMBRES_ALTERNATIVOS:
        if nombre not in comunas_csv:
            sys.exit(f"Nombre alternativo para una comuna que no está en el CSV: {nombre}")

    lineas = []
    for n, fila in enumerate(filas, start=1):
        region, zona, comuna = fila["region"], fila["zona"], fila["comuna"]
        lineas.append(
            "  ({}, {}, {}, {}, {}, {}, {})".format(
                n,
                regiones.index(region) + 1,
                sql_texto(region),
                zonas[region].index(zona) + 1,
                sql_texto(zona),
                sql_texto(comuna),
                sql_arreglo(NOMBRES_ALTERNATIVOS.get(comuna, [])),
            )
        )

    valores = ",\n".join(lineas)
    return f"""{INICIO}
-- Fuente: docs/propuesta-zonas.csv ({conteos['regiones']} regiones, {conteos['zonas']} zonas, {conteos['comunas']} comunas).
-- Orden de regiones y de zonas dentro de cada región: el de aparición en el CSV.

create temporary table zonas_csv (
  n            integer not null,
  orden_region integer not null,
  region       text not null,
  orden_zona   integer not null,
  zona         text not null,
  comuna       text not null,
  alternativos text[] not null
);

insert into zonas_csv (n, orden_region, region, orden_zona, zona, comuna, alternativos) values
{valores};

insert into public.regiones (nombre, orden)
select v.region, v.orden_region
  from (select distinct region, orden_region from zonas_csv) v
 order by v.orden_region
on conflict (nombre) do nothing;

insert into public.zonas (region_id, nombre, orden)
select (select r.id from public.regiones r where r.nombre = v.region),
       v.zona,
       v.orden_zona
  from (select distinct region, orden_region, zona, orden_zona from zonas_csv) v
 order by v.orden_region, v.orden_zona
on conflict (region_id, nombre) do nothing;

insert into public.comunas (nombre, nombres_alternativos, region_id, zona_id)
select v.comuna,
       v.alternativos,
       (select r.id from public.regiones r where r.nombre = v.region),
       (select z.id
          from public.zonas z
          join public.regiones r on r.id = z.region_id
         where r.nombre = v.region and z.nombre = v.zona)
  from zonas_csv v
 order by v.n
on conflict (region_id, nombre) do nothing;

do $$
declare
  v_faltan integer;
begin
  if (select count(distinct region) from zonas_csv) <> {conteos['regiones']}
     or (select count(distinct (region, zona)) from zonas_csv) <> {conteos['zonas']}
     or (select count(*) from zonas_csv) <> {conteos['comunas']} then
    raise exception 'Los datos generados no tienen {conteos['regiones']}/{conteos['zonas']}/{conteos['comunas']} filas';
  end if;

  select count(*) into v_faltan
    from zonas_csv v
   where not exists (
     select 1
       from public.comunas c
       join public.regiones r on r.id = c.region_id
       join public.zonas z on z.id = c.zona_id
      where c.nombre = v.comuna and r.nombre = v.region and z.nombre = v.zona
        and c.nombres_alternativos = v.alternativos
   );
  if v_faltan > 0 then
    raise exception '% comunas del CSV no quedaron en su región y zona', v_faltan;
  end if;
end
$$;

drop table zonas_csv;
{FIN}"""


def main() -> None:
    comprobar = "--comprobar" in sys.argv[1:]
    bloque = generar(leer_csv())

    texto = MIGRACION.read_text(encoding="utf-8")
    if texto.count(INICIO) != 1 or texto.count(FIN) != 1:
        sys.exit(f"{MIGRACION}: no encuentro una vez cada marcador de inicio y fin")
    antes, resto = texto.split(INICIO, 1)
    _, despues = resto.split(FIN, 1)
    nuevo = antes + bloque + despues

    if comprobar:
        if nuevo != texto:
            sys.exit("El bloque de zonas no está al día: ejecuta supabase/scripts/generar_zonas.py")
        print("Bloque de zonas al día.")
        return

    MIGRACION.write_text(nuevo, encoding="utf-8")
    print(f"Escrito {MIGRACION.relative_to(RAIZ)} ({ESPERADO['regiones']} regiones, "
          f"{ESPERADO['zonas']} zonas, {ESPERADO['comunas']} comunas).")


if __name__ == "__main__":
    main()

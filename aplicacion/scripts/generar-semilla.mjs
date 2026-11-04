// Genera src/datos/semilla/geografia.ts desde docs/propuesta-zonas.csv.
// Es la misma fuente que usa supabase/scripts/generar_zonas.py para la base:
// 16 regiones, 81 zonas y 346 comunas, en el orden de aparición del CSV.
// Uso: npm run semilla  (no editar geografia.ts a mano)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const csvRuta = resolve(aqui, '../../docs/propuesta-zonas.csv');
const salida = resolve(aqui, '../src/datos/semilla/geografia.ts');

// Igual que NOMBRES_ALTERNATIVOS en supabase/scripts/generar_zonas.py
const NOMBRES_ALTERNATIVOS = {
  Paiguano: ['Paihuano'],
  Llaillay: ['Llay-Llay'],
  Calera: ['La Calera'],
};

const slug = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const lineas = readFileSync(csvRuta, 'utf8').trim().split(/\r?\n/);
const cabecera = lineas.shift();
if (cabecera.trim() !== 'region,zona,comuna') throw new Error('Cabecera inesperada: ' + cabecera);

const regiones = [];
const zonas = [];
const comunas = [];
const regionPorNombre = new Map();
const zonaPorClave = new Map();
const idsComuna = new Set();

for (const linea of lineas) {
  const [region, zona, comuna] = linea.split(',').map((s) => s.trim());
  if (!region || !zona || !comuna) throw new Error('Fila incompleta: ' + linea);
  let r = regionPorNombre.get(region);
  if (!r) {
    r = { id: 'r' + String(regiones.length + 1).padStart(2, '0'), nombre: region, orden: regiones.length + 1 };
    regiones.push(r);
    regionPorNombre.set(region, r);
  }
  const claveZona = region + '|' + zona;
  let z = zonaPorClave.get(claveZona);
  if (!z) {
    const orden = zonas.filter((x) => x.regionId === r.id).length + 1;
    z = { id: r.id + '-z' + orden, regionId: r.id, nombre: zona, orden };
    zonas.push(z);
    zonaPorClave.set(claveZona, z);
  }
  const id = slug(comuna);
  if (idsComuna.has(id)) throw new Error('Comuna repetida: ' + comuna);
  idsComuna.add(id);
  comunas.push({ id, nombre: comuna, regionId: r.id, zonaId: z.id, alternativos: NOMBRES_ALTERNATIVOS[comuna] ?? [] });
}

for (const nombre of Object.keys(NOMBRES_ALTERNATIVOS)) {
  if (!comunas.some((c) => c.nombre === nombre)) throw new Error('Alternativo sin comuna: ' + nombre);
}
if (regiones.length !== 16 || zonas.length !== 81 || comunas.length !== 346) {
  throw new Error(`Se esperaban 16/81/346 y salieron ${regiones.length}/${zonas.length}/${comunas.length}`);
}

const js = (v) => JSON.stringify(v);
const texto = `// GENERADO por scripts/generar-semilla.mjs desde docs/propuesta-zonas.csv. No editar a mano.
// ${regiones.length} regiones, ${zonas.length} zonas, ${comunas.length} comunas (las mismas de la base de datos).
import type { Comuna, Region, Zona } from '../tipos.ts';

export const REGIONES: Region[] = [
${regiones.map((r) => `  { id: ${js(r.id)}, nombre: ${js(r.nombre)}, orden: ${r.orden} },`).join('\n')}
];

export const ZONAS: Zona[] = [
${zonas.map((z) => `  { id: ${js(z.id)}, regionId: ${js(z.regionId)}, nombre: ${js(z.nombre)}, orden: ${z.orden} },`).join('\n')}
];

export const COMUNAS: Comuna[] = [
${comunas
  .map(
    (c) =>
      `  { id: ${js(c.id)}, nombre: ${js(c.nombre)}, regionId: ${js(c.regionId)}, zonaId: ${js(c.zonaId)}, alternativos: ${js(c.alternativos)} },`,
  )
  .join('\n')}
];
`;
writeFileSync(salida, texto);
console.log(`geografia.ts: ${regiones.length} regiones, ${zonas.length} zonas, ${comunas.length} comunas`);

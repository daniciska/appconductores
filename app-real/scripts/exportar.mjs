// Arma la app real del conductor lista para publicar en Netlify (sitio aparte del mockup) en dist/.
// No publica nada.
//   1. Revisa la configuración pública (.env): dirección de Supabase y clave PUBLICABLE (se niega con
//      una clave secreta o la service_role).
//   2. Revisa que desde las rutas no se llegue a nada de la demo ni del panel.
//   3. Exporta (expo export -p web): salida web de una sola página, con public/_redirects (todas las
//      rutas sirven index.html) y public/_headers (noindex y cabeceras de seguridad).
//   4. Revisa el export: sin textos de la demo, del panel ni secretos; con _redirects y _headers.
// Uso (en app-real/): npm run export:web   ·   Salida: app-real/dist (ignorada por git).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// La revisión de la configuración es la misma que usa la app (TypeScript, que Node ejecuta directo). Se
// carga después de callar el aviso de Node sobre el tipo de módulo de ese archivo (es solo un aviso).
process.removeAllListeners('warning');
const { revisarConfiguracion } = await import('../src/configuracion.ts');

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(app, 'dist');

function cortar(mensaje) {
  console.error(`\n✗ ${mensaje}\n  No se armó la app.`);
  process.exit(1);
}

/** Lee las variables como Expo: process.env manda; después .env.production.local, .env.local, .env.production y .env. */
function variables() {
  const valores = {};
  for (const nombre of ['.env', '.env.production', '.env.local', '.env.production.local']) {
    const ruta = join(app, nombre);
    if (!existsSync(ruta)) continue;
    for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(linea);
      if (m && !linea.trim().startsWith('#')) valores[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return { ...valores, ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('EXPO_PUBLIC_'))) };
}

function correr(titulo, comando, args) {
  console.log(`\n▸ ${titulo}`);
  const r = spawnSync(comando, args, { cwd: app, stdio: 'inherit', env: { ...process.env, CI: '1' } });
  if (r.status !== 0) cortar(`Falló: ${titulo}.`);
}

console.log('▸ Configuración pública');
const v = variables();
try {
  const c = revisarConfiguracion({
    url: v.EXPO_PUBLIC_SUPABASE_URL,
    clave: v.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    codigosDePrueba: v.EXPO_PUBLIC_CODIGOS_DE_PRUEBA,
  });
  console.log(`  Supabase ${c.url} · clave publicable · ${c.codigosDePrueba ? 'con números de prueba' : 'sin números de prueba'}`);
} catch (e) {
  cortar(e instanceof Error ? e.message : String(e));
}

correr('Importaciones: nada de la demo ni del panel', process.execPath, ['scripts/revisar-sin-demo.mjs']);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
correr('Export web (dist/)', npx, ['expo', 'export', '-p', 'web', '--output-dir', 'dist', '--clear']);
for (const archivo of ['index.html', '_redirects', '_headers']) {
  if (!existsSync(join(dist, archivo))) cortar(`Falta dist/${archivo}.`);
}
if (!/X-Robots-Tag:\s*noindex/i.test(readFileSync(join(dist, '_headers'), 'utf8'))) cortar('dist/_headers no tiene X-Robots-Tag: noindex.');
correr('Revisión del export: sin demo, sin panel y sin secretos', process.execPath, ['scripts/revisar-sin-demo.mjs', 'dist']);

console.log(`\n✓ App real lista en ${relative(process.cwd(), dist) || dist}`);
console.log('  Se publica esta carpeta completa en el sitio de la app real (no en el del mockup).');

// Arma UNA carpeta lista para publicar en Netlify (sitio del mockup) con las dos demos:
//   raíz    = export de la demo del conductor y del titular (aplicacion/)
//   /panel  = export de la demo del panel (esta carpeta, base '/panel')
// y escribe las reglas del sitio (_redirects y _headers). No publica nada.
//
// Pasos: 1) exporta aplicacion/ y revisa que no lleve nada del panel (si lleva algo, se corta aquí);
//        2) exporta el panel; 3) arma la carpeta.
// Uso (en panel/): npm run export:demo   ·   Salida: ../dist-demo (en la raíz del repositorio).
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const panel = join(dirname(fileURLToPath(import.meta.url)), '..');
const raiz = join(panel, '..');
const app = join(raiz, 'aplicacion');
const sitio = join(raiz, 'dist-demo');

function correr(titulo, comando, args, cwd) {
  console.log(`\n▸ ${titulo}`);
  const r = spawnSync(comando, args, { cwd, stdio: 'inherit', env: { ...process.env, CI: '1' } });
  if (r.status !== 0) {
    console.error(`\n✗ Falló: ${titulo}. No se armó el sitio.`);
    process.exit(r.status ?? 1);
  }
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
correr('Export de la demo del conductor (aplicacion/dist)', npx, ['expo', 'export', '-p', 'web'], app);
correr('Revisión: el export del conductor no lleva nada del panel', process.execPath, ['scripts/revisar-export-sin-panel.mjs', 'dist'], app);
correr('Export del panel (panel/dist, base /panel)', npx, ['expo', 'export', '-p', 'web'], panel);

const distApp = join(app, 'dist');
const distPanel = join(panel, 'dist');
for (const d of [distApp, distPanel]) if (!existsSync(join(d, 'index.html'))) throw new Error(`Falta el export: ${d}`);
// El panel se publica con base /panel: su index.html debe cargar sus archivos desde ahí.
if (!readFileSync(join(distPanel, 'index.html'), 'utf8').includes('/panel/_expo/')) {
  throw new Error('El export del panel no usa la base /panel (revisa experiments.baseUrl en panel/app.json).');
}

console.log('\n▸ Armando el sitio');
rmSync(sitio, { recursive: true, force: true });
cpSync(distApp, sitio, { recursive: true });
cpSync(distPanel, join(sitio, 'panel'), { recursive: true });

// Reglas del sitio. Gana la primera que calza. Las del panel no llevan "!": así sus archivos reales
// (/panel/_expo, /panel/assets) se sirven directo y solo las rutas de pantallas caen en su index.html.
const redirectsApp = readFileSync(join(distApp, '_redirects'), 'utf8').trim();
writeFileSync(
  join(sitio, '_redirects'),
  `# Dirección corta del panel: lleva a la demo del panel en el dominio del mockup.
https://panel-mockup.dalecontacto.cl/*  https://mockup.dalecontacto.cl/panel/:splat  301!
http://panel-mockup.dalecontacto.cl/*   https://mockup.dalecontacto.cl/panel/:splat  301!

# Demo del panel (app aparte): sus pantallas sirven su propio index.html.
/panel     /panel/index.html  200
/panel/*   /panel/index.html  200

# Demo del conductor y del titular (aplicacion/public/_redirects).
${redirectsApp}
`,
);

const headersApp = readFileSync(join(distApp, '_headers'), 'utf8').trim();
writeFileSync(
  join(sitio, '_headers'),
  `${headersApp}

# Demo del panel: no se puede abrir dentro de otra página.
/panel
  X-Frame-Options: DENY
  Content-Security-Policy: frame-ancestors 'none'
/panel/*
  X-Frame-Options: DENY
  Content-Security-Policy: frame-ancestors 'none'
`,
);

console.log(`\n✓ Sitio listo en ${relative(process.cwd(), sitio) || sitio}`);
console.log('  Raíz: demo del conductor · /panel: demo del panel. Se publica esta carpeta completa.');

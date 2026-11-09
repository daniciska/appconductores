// Genera .expo/types/router.d.ts (las rutas tipadas de expo-router) sin abrir el servidor de desarrollo.
// "expo start" lo hace solo; "expo export" no. Lo usa "npm run typecheck" para que tsc detecte enlaces
// rotos entre las pantallas del panel. Usa la misma función que Expo CLI (SDK 58).
const fs = require('node:fs');
const path = require('node:path');

const panel = path.join(__dirname, '..');
process.env.EXPO_ROUTER_APP_ROOT = path.join(panel, 'src', 'app');
try {
  const cli = path.dirname(require.resolve('@expo/cli/package.json', { paths: [path.dirname(require.resolve('expo/package.json', { paths: [panel] }))] }));
  const modulo = require.resolve('@expo/router-server/build/typed-routes', { paths: [cli] });
  const carpeta = path.join(panel, '.expo', 'types');
  const archivo = path.join(carpeta, 'router.d.ts');
  fs.mkdirSync(carpeta, { recursive: true });
  fs.rmSync(archivo, { force: true });
  // Escribe el archivo un momento después (con un temporizador): se revisa al terminar.
  require(modulo).regenerateDeclarations(carpeta, {});
  process.on('exit', () => {
    if (fs.existsSync(archivo)) console.log('Rutas tipadas del panel: .expo/types/router.d.ts');
    else {
      console.error('No se generó .expo/types/router.d.ts. Corre "npm run web" una vez y vuelve a intentar.');
      process.exitCode = 1;
    }
  });
} catch (e) {
  console.error('No se pudieron generar las rutas tipadas. Corre "npm run web" una vez y vuelve a intentar.');
  console.error(e && e.message ? e.message : e);
  process.exit(1);
}

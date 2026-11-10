// La app real no instala dependencias propias: usa las de aplicacion/ (una sola copia de React y de Expo).
// Crea app-real/node_modules como enlace a ../aplicacion/node_modules (si no existe). En Windows, "junction".
import { existsSync, lstatSync, symlinkSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(app, '..', 'aplicacion', 'node_modules');
const enlace = join(app, 'node_modules');
if (!existsSync(join(destino, 'expo'))) {
  console.error('Falta aplicacion/node_modules: corre "npm install" en aplicacion/ primero.');
  process.exit(1);
}
let info = null;
try {
  info = lstatSync(enlace);
} catch {
  info = null;
}
if (info && !info.isSymbolicLink()) {
  console.error('app-real/node_modules es una carpeta: bórrala. La app real usa las dependencias de aplicacion/.');
  process.exit(1);
}
if (!info) symlinkSync(process.platform === 'win32' ? destino : relative(app, destino), enlace, 'junction');

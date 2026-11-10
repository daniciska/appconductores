// Metro de la app real: compila también el código común que vive en ../aplicacion/src (diseño,
// pantallas aprobadas, interfaz de datos, motor del match) y resuelve TODAS las dependencias desde
// ../aplicacion/node_modules, para que haya una sola copia de React, Expo, zustand y supabase-js.
// (Mismo armado que ../panel/metro.config.js.)
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const raizApp = __dirname;
const raizComun = path.resolve(raizApp, '../aplicacion');

const config = getDefaultConfig(raizApp);
config.watchFolders = [raizComun];
config.resolver.nodeModulesPaths = [path.join(raizComun, 'node_modules')];
config.resolver.disableHierarchicalLookup = true;
module.exports = config;

// Metro del panel: compila también el código común que vive en ../aplicacion/src (diseño, datos de la
// demo, motor del match) y resuelve TODAS las dependencias desde ../aplicacion/node_modules, para que
// haya una sola copia de React, Expo y zustand.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const raizPanel = __dirname;
const raizApp = path.resolve(raizPanel, '../aplicacion');

const config = getDefaultConfig(raizPanel);
config.watchFolders = [raizApp];
config.resolver.nodeModulesPaths = [path.join(raizApp, 'node_modules')];
config.resolver.disableHierarchicalLookup = true;
module.exports = config;

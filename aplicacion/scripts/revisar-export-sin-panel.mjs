// Revisa que el export web de la demo del conductor (dist/) no lleve nada del panel de administración:
// ni textos, ni direcciones, ni nombres de sus piezas o acciones. El panel es otra app (carpeta panel/
// del repositorio) y la app de conductores y titulares no debe llevar nada de él.
// Uso: npm run revisar:sin-panel   (después de npm run export:web)   ·   o: node scripts/revisar-export-sin-panel.mjs [carpeta]
// Sale con error (código 1) si encuentra algo; así corta la publicación (la usa panel/scripts/armar-sitio-demo.mjs).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Textos que solo existen en el panel. Se buscan tal cual y con las letras con tilde escapadas (\xf3, ó). */
export const PROHIBIDOS = [
  'Panel de administraci',
  'Reglas del match',
  'Zonas y comunas',
  'Entrar como revisor',
  'Entrar como administrador',
  'Salir del panel',
  'Solo un administrador puede',
  'Registro de acciones',
  '/panel',
  'panel-mockup',
  'PaginaPanel',
  'MarcoPanel',
  'aprobarDocumento',
  'rechazarDocumento',
  'cambiarUmbral',
  'resumenPanel',
  'colaDocumentos',
  'registrarAccionEquipo',
  'QUIEN_EN_PANEL',
  'Tú (administrador)',
  'Tú (revisor)',
  // Los roles del panel como valores (la demo del conductor solo los tiene como tipo, que no llega al export).
  '"administrador"',
  "'administrador'",
  '"revisor"',
  "'revisor'",
  // Datos de ejemplo que solo usa el panel (panel/src/datos/semillaPanel.ts).
  'Paula Vergara',
  'Ignacio Toro',
  'Apagó la industria',
  'r01m1',
  'transferir una garant',
  'publicidad de un curso',
];

const BINARIOS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.ttf', '.otf', '.woff', '.woff2']);

/** Formas en que un texto puede quedar escrito dentro del JavaScript minificado. */
export function variantes(texto) {
  const hex = (c, ancho) => c.codePointAt(0).toString(16).padStart(ancho, '0');
  const con = (f) => [...texto].map((c) => (c.codePointAt(0) > 127 ? f(c) : c)).join('');
  return [
    ...new Set([
      texto,
      con((c) => (c.codePointAt(0) < 256 ? `\\x${hex(c, 2)}` : `\\u${hex(c, 4)}`)),
      con((c) => (c.codePointAt(0) < 256 ? `\\x${hex(c, 2).toUpperCase()}` : `\\u${hex(c, 4).toUpperCase()}`)),
      con((c) => `\\u${hex(c, 4)}`),
      con((c) => `\\u${hex(c, 4).toUpperCase()}`),
    ]),
  ];
}

function archivos(carpeta) {
  const salida = [];
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta));
    else if (!BINARIOS.has(extname(nombre).toLowerCase())) salida.push(ruta);
  }
  return salida;
}

/** Devuelve lo encontrado: [{ archivo, texto }]. */
export function revisarCarpeta(carpeta, prohibidos = PROHIBIDOS) {
  const hallazgos = [];
  for (const archivo of archivos(carpeta)) {
    const contenido = readFileSync(archivo, 'utf8');
    for (const texto of prohibidos) {
      if (variantes(texto).some((v) => contenido.includes(v))) hallazgos.push({ archivo: relative(carpeta, archivo), texto });
    }
  }
  return hallazgos;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const carpeta = resolve(process.argv[2] ?? 'dist');
  if (!existsSync(join(carpeta, 'index.html'))) {
    console.error(`No hay un export en ${carpeta}. Corre primero: npm run export:web`);
    process.exit(1);
  }
  const hallazgos = revisarCarpeta(carpeta);
  if (hallazgos.length > 0) {
    console.error('El export de la demo del conductor lleva cosas del panel:');
    for (const h of hallazgos) console.error(`  ${h.archivo}: «${h.texto}»`);
    process.exit(1);
  }
  console.log(`Sin textos ni direcciones del panel en ${relative(process.cwd(), carpeta) || '.'} (${PROHIBIDOS.length} textos revisados).`);
}

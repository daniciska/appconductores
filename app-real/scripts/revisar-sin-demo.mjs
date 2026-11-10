// Revisa que la app real no lleve nada de la demo ni del panel. Dos revisiones:
//   1. Importaciones: desde app-real/src/app (las rutas) no se puede llegar a la tienda, los datos de
//      ejemplo, la simulación, la clave de la demo, las pantallas que la v1 no trae ni a nada del panel.
//   2. Export (dist/): no puede tener textos de la demo ("Demo:", "Ingresa la clave", "Reiniciar demo"…),
//      nombres de las personas ficticias de la semilla, textos del panel ni claves secretas.
// Uso: node scripts/revisar-sin-demo.mjs [carpeta-del-export]   (sin carpeta: solo las importaciones)
// Sale con error (código 1) si encuentra algo; scripts/exportar.mjs la corre antes y después de armar.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROHIBIDOS as PROHIBIDOS_PANEL, revisarCarpeta } from '../../aplicacion/scripts/revisar-export-sin-panel.mjs';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const comun = resolve(app, '..', 'aplicacion', 'src');
const raizRepo = resolve(app, '..');

// ---------------------------------------------------------------------------
// 1. Importaciones
// ---------------------------------------------------------------------------

/** Archivos (relativos a la raíz del repositorio) a los que la app real no puede llegar. */
export const MODULOS_PROHIBIDOS = [
  // Estado, datos de ejemplo y simulación de la demo.
  /^aplicacion\/src\/datos\/(tienda|estado|hooks|selectores|simulacion|migracion|almacenamiento|revisionManual|revisionEquipo|avisosEntrePestanas|claveDemo|direcciones)\.tsx?$/,
  /^aplicacion\/src\/datos\/semilla\//,
  /^aplicacion\/src\/datos\/demo\//,
  // Pantallas que la v1 no trae (o que son solo de la demo).
  /^aplicacion\/src\/pantallas\/(matches|bolsa)\//,
  /^aplicacion\/src\/pantallas\/documentos\/(Inicio|Perfil|MisDocumentos|SubirDocumento|Enviado|NoAprobado|QuienRecibio|EliminarCuenta|textos|rutas|acciones)\.tsx?$/,
  /^aplicacion\/src\/pantallas\/ingreso\/(SelectorDemo|PuertaClave|Paso2|Paso5|sugerencias)\.tsx?$/,
  /^aplicacion\/src\/ui\/demo\.tsx?$/,
  /^aplicacion\/src\/app\//,
  // Nada del panel.
  /^panel\//,
];

const EXTENSIONES = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function resolverArchivo(base) {
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of EXTENSIONES) if (existsSync(base + ext)) return base + ext;
  for (const ext of EXTENSIONES) if (existsSync(join(base, 'index' + ext))) return join(base, 'index' + ext);
  return null;
}

/** Ruta del archivo que importa `especificador` desde `desde`, o null si es una dependencia (node_modules). */
export function resolverImportacion(especificador, desde) {
  if (especificador.startsWith('@real/')) return resolverArchivo(join(app, 'src', especificador.slice(6)));
  if (especificador.startsWith('@/')) return resolverArchivo(join(comun, especificador.slice(2)));
  if (especificador.startsWith('.')) return resolverArchivo(resolve(dirname(desde), especificador));
  return null;
}

function importacionesDe(archivo) {
  const texto = readFileSync(archivo, 'utf8');
  const salida = new Set();
  const re = /(?:import|export)\s+(?:type\s+)?(?:[^'"`;]*?\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const m of texto.matchAll(re)) {
    // Las importaciones de solo tipos no llegan al paquete.
    if (/^(?:import|export)\s+type\s/.test(m[0])) continue;
    salida.add(m[1] ?? m[2] ?? m[3]);
  }
  return [...salida];
}

function archivosDe(carpeta) {
  const salida = [];
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivosDe(ruta));
    else if (EXTENSIONES.includes(extname(nombre))) salida.push(ruta);
  }
  return salida;
}

/** Recorre las importaciones desde las rutas de la app real. Devuelve [{ archivo, cadena }] prohibidos. */
export function revisarImportaciones(carpetaRutas = join(app, 'src', 'app')) {
  const visto = new Map(); // archivo → quién lo importó
  const pendientes = archivosDe(carpetaRutas).map((a) => [a, null]);
  const hallazgos = [];
  while (pendientes.length > 0) {
    const [archivo, padre] = pendientes.pop();
    if (visto.has(archivo)) continue;
    visto.set(archivo, padre);
    const rel = relative(raizRepo, archivo).split('\\').join('/');
    // Las rutas de partida son las de la app que se revisa: se marcan solo los módulos a los que llegan.
    if (padre && MODULOS_PROHIBIDOS.some((re) => re.test(rel))) {
      const cadena = [rel];
      let p = padre;
      while (p) {
        cadena.unshift(relative(raizRepo, p).split('\\').join('/'));
        p = visto.get(p) ?? null;
      }
      hallazgos.push({ archivo: rel, cadena });
      continue;
    }
    for (const esp of importacionesDe(archivo)) {
      const destino = resolverImportacion(esp, archivo);
      if (destino && !visto.has(destino)) pendientes.push([destino, archivo]);
    }
  }
  return { hallazgos, revisados: visto.size };
}

// ---------------------------------------------------------------------------
// 2. Textos en el export
// ---------------------------------------------------------------------------

/** Nombres de las personas y empresas ficticias de la semilla de la demo (y del usuario de ejemplo). */
export function nombresFicticios() {
  const t = readFileSync(join(comun, 'datos', 'semilla', 'ficticios.ts'), 'utf8');
  const nombres = new Set();
  for (const m of t.matchAll(/\b(?:nombre|razonSocial|nombres|apellido1|apellido2|correo|direccion)\s*:\s*'([^']{3,})'/g)) nombres.add(m[1]);
  return [...nombres];
}

/** Textos que solo existen en la demo. */
export const TEXTOS_DEMO = [
  'Demo con datos de ejemplo',
  'Ingresa la clave',
  'Atajo:',
  'Reiniciar demo',
  // Las notas "Demo: …" de la demo (en el código minificado, "bandaDemo:" o "esDemo:" son nombres de
  // propiedades, no textos: por eso se busca con comillas o con un espacio después).
  '"Demo:"',
  "'Demo:'",
  'Demo: ',
  'Menú de la demo',
  'En la demo',
  'de la demo',
  'dale-demo',
  'Ver como conductor',
  'Ver como titular',
  'Aprobar ahora',
  '__daleDemo',
  // El hash de la clave de la demo (aplicacion/src/datos/claveDemo.ts).
  'd950af57714f1e1fed4eecadfebc9c2f99c43c0170a6125cc4a5a07b6343a146',
];

/**
 * Lo que jamás puede ir en la app: claves secretas de Supabase. "service_role" no aparece en ninguna parte
 * del paquete (tampoco en supabase-js). "sb_secret_" sí aparece en supabase-js (lo usa para reconocer el
 * tipo de clave), así que de ese formato se busca una clave de verdad (ver CLAVE_SECRETA).
 */
export const SECRETOS = ['service_role'];
/** Una clave secreta nueva escrita en el paquete. */
export const CLAVE_SECRETA = /sb_secret_[A-Za-z0-9_-]{8,}/;
/** Un JWT (clave antigua) escrito en el paquete: se revisa su rol. */
const JWT = /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

/**
 * Textos a buscar. Los nombres de una sola palabra ("Luis") se buscan entre comillas para no confundirlos
 * con pedazos de otras palabras; los de varias palabras, tal cual.
 */
export function textosProhibidos() {
  const ficticios = nombresFicticios().flatMap((n) => (/\s/.test(n) ? [n] : [`"${n}"`, `'${n}'`]));
  return [...TEXTOS_DEMO, ...SECRETOS, ...ficticios, ...PROHIBIDOS_PANEL];
}

function archivosDeTexto(carpeta) {
  const salida = [];
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivosDeTexto(ruta));
    else if (['.js', '.html', '.json', '.css', '.txt', ''].includes(extname(nombre)) || nombre.startsWith('_')) salida.push(ruta);
  }
  return salida;
}

/** Claves secretas escritas en el export (formato nuevo o JWT con rol distinto de anon). */
export function revisarSecretos(carpeta) {
  const hallazgos = [];
  for (const archivo of archivosDeTexto(carpeta)) {
    const texto = readFileSync(archivo, 'utf8');
    const rel = relative(carpeta, archivo);
    if (CLAVE_SECRETA.test(texto)) hallazgos.push({ archivo: rel, texto: 'una clave sb_secret_…' });
    for (const jwt of texto.match(JWT) ?? []) {
      try {
        const rol = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8')).role;
        if (rol !== 'anon') hallazgos.push({ archivo: rel, texto: `un JWT con rol ${rol}` });
      } catch {
        // No era un JWT.
      }
    }
  }
  return hallazgos;
}

export function revisarExport(carpeta) {
  return [...revisarCarpeta(carpeta, textosProhibidos()), ...revisarSecretos(carpeta)];
}

// ---------------------------------------------------------------------------

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let falla = false;
  const { hallazgos, revisados } = revisarImportaciones();
  if (hallazgos.length > 0) {
    falla = true;
    console.error('La app real llega a módulos de la demo o del panel:');
    for (const h of hallazgos) console.error(`  ${h.archivo}\n      por: ${h.cadena.join(' → ')}`);
  } else {
    console.log(`Importaciones: sin nada de la demo ni del panel (${revisados} archivos revisados desde src/app).`);
  }
  const carpeta = process.argv[2] ? resolve(process.argv[2]) : null;
  if (carpeta) {
    if (!existsSync(join(carpeta, 'index.html'))) {
      console.error(`No hay un export en ${carpeta}.`);
      process.exit(1);
    }
    const encontrados = revisarExport(carpeta);
    if (encontrados.length > 0) {
      falla = true;
      console.error('El export de la app real lleva textos de la demo, del panel o secretos:');
      for (const h of encontrados) console.error(`  ${h.archivo}: «${h.texto}»`);
    } else {
      console.log(`Export: sin textos de la demo, del panel ni secretos (${textosProhibidos().length} textos revisados en ${relative(process.cwd(), carpeta) || '.'}).`);
    }
  }
  process.exit(falla ? 1 : 0);
}

/// <reference types="node" />
// Pruebas de "Letra grande" (src/ui/escalaTipos.ts): escala de tipos, estilos y medidas.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  GRIS_MAS_OSCURO,
  MARCADOR_GRANDE,
  MEDIDAS_GRANDES,
  MEDIDAS_NORMALES,
  altoLineaGrande,
  escalarEstiloTexto,
  tamanoGrande,
} from '../src/ui/escalaTipos.ts';

/** Contraste WCAG 2.1 entre dos colores #RRGGBB. */
function contraste(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

describe('escala de tipos de "Letra grande"', () => {
  it('los textos chicos crecen 3 px y los títulos 2 px', () => {
    const tabla: [number, number][] = [
      [12, 15],
      [13, 16],
      [14, 17],
      [15, 18],
      [16, 19],
      [17, 20],
      [20, 23],
      [22, 25],
      [24, 26],
      [26, 28],
      [34, 36],
    ];
    for (const [normal, grande] of tabla) assert.equal(tamanoGrande(normal), grande, `${normal} px`);
  });

  it('el cuerpo de texto queda en 18 px o más (lectura cómoda)', () => {
    assert.ok(tamanoGrande(15) >= 18);
  });

  it('la escala nunca achica ni invierte los tamaños', () => {
    let anterior = 0;
    for (let t = 10; t <= 40; t++) {
      const g = tamanoGrande(t);
      assert.ok(g > t);
      assert.ok(g >= anterior);
      anterior = g;
    }
  });

  it('el alto de línea mantiene la proporción', () => {
    assert.equal(altoLineaGrande(22, 15), Math.round((22 * 18) / 15));
    assert.equal(altoLineaGrande(31, 26), Math.round((31 * 28) / 26));
  });
});

describe('escalarEstiloTexto', () => {
  it('escala tamaño y alto de línea y deja lo demás igual', () => {
    const antes = { fontSize: 15, lineHeight: 22, fontFamily: 'X', color: '#111111', letterSpacing: -0.2 };
    const despues = escalarEstiloTexto(antes);
    assert.deepEqual(despues, { fontSize: 18, lineHeight: 26, fontFamily: 'X', color: '#111111', letterSpacing: -0.2 });
    assert.equal(antes.fontSize, 15, 'no modifica el estilo original');
  });

  it('sin tamaño (texto dentro de otro texto) hereda: no le pone tamaño', () => {
    assert.deepEqual(escalarEstiloTexto({ color: '#A3261B' }), { color: '#A3261B' });
  });

  it('oscurece los grises claros para que se lean (contraste AA)', () => {
    assert.equal(escalarEstiloTexto({ fontSize: 14, color: '#9A9A9A' }).color, '#6B6B6B');
    assert.equal(escalarEstiloTexto({ fontSize: 14, color: '#ababab' }).color, '#6B6B6B');
  });

  it('los grises que usa con letra grande tienen contraste AA (4,5:1) sobre los fondos de la app', () => {
    // Blanco (tarjetas y campos), #F6F6F6 (fondo de pantalla y filas apagadas) y #EEEEEE (pastillas grises).
    for (const gris of new Set(Object.values(GRIS_MAS_OSCURO))) {
      for (const fondo of ['#FFFFFF', '#F6F6F6', '#EEEEEE']) {
        assert.ok(contraste(gris, fondo) >= 4.5, `${gris} sobre ${fondo}: ${contraste(gris, fondo).toFixed(2)}`);
      }
    }
  });
});

describe('texto de ejemplo de los campos con letra grande', () => {
  it('cumple AA sobre el blanco de los campos, más claro que las ayudas y lejos del texto escrito', () => {
    const sobreBlanco = contraste(MARCADOR_GRANDE, '#FFFFFF');
    assert.ok(sobreBlanco >= 4.5, `${MARCADOR_GRANDE} sobre blanco: ${sobreBlanco.toFixed(2)}`);
    assert.ok(sobreBlanco > contraste('#9A9A9A', '#FFFFFF'), 'más oscuro que con letra normal');
    assert.ok(sobreBlanco < contraste('#6B6B6B', '#FFFFFF'), 'más claro que las ayudas');
    assert.ok(contraste('#111111', '#FFFFFF') / sobreBlanco > 3, 'muy distinto del texto escrito');
  });
});

describe('medidas de los controles', () => {
  it('con letra grande, botones, campos, casillas y zonas para tocar miden 56 px o más', () => {
    const m = MEDIDAS_GRANDES;
    for (const [nombre, valor] of Object.entries({
      tactil: m.tactil,
      campo: m.campo,
      fila: m.fila,
      boton: m.boton,
      chipCuadrado: m.chipCuadrado,
      chipConSubtitulo: m.chipConSubtitulo,
      opcion: m.opcion,
    })) {
      assert.ok(valor >= 56, `${nombre}: ${valor}`);
    }
  });

  it('con letra grande nada queda más chico que con letra normal', () => {
    const n = MEDIDAS_NORMALES;
    const g = MEDIDAS_GRANDES;
    for (const clave of ['tactil', 'campo', 'fila', 'boton', 'chipCuadrado', 'chipConSubtitulo', 'opcion', 'casilla', 'radioOpcion', 'iconoFila'] as const) {
      assert.ok(g[clave] >= n[clave], clave);
    }
    assert.ok(g.interruptor.alto >= n.interruptor.alto && g.interruptor.ancho >= n.interruptor.ancho);
    assert.ok(g.icono(20) > n.icono(20));
  });

  it('las medidas normales son las de las maquetas (la app con letra normal no cambia)', () => {
    assert.equal(MEDIDAS_NORMALES.tactil, 44);
    assert.equal(MEDIDAS_NORMALES.campo, 52);
    assert.equal(MEDIDAS_NORMALES.boton, 56);
    assert.equal(MEDIDAS_NORMALES.casilla, 20);
    assert.deepEqual(MEDIDAS_NORMALES.interruptor, { ancho: 52, alto: 32, bola: 26 });
    assert.equal(MEDIDAS_NORMALES.icono(18), 18);
  });
});

describe('las pantallas respetan "Letra grande"', () => {
  it('ninguna pantalla ni componente usa el Text o el TextInput de react-native directo', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const raiz = new URL('..', import.meta.url).pathname;
    const carpetas = [join(raiz, 'src/pantallas'), join(raiz, 'src/ui'), join(raiz, 'src/app'), join(raiz, '../app-real/src')];
    const archivos: string[] = [];
    const recorrer = (d: string) => {
      for (const n of readdirSync(d)) {
        const r = join(d, n);
        if (statSync(r).isDirectory()) recorrer(r);
        else if (/\.tsx?$/.test(n)) archivos.push(r);
      }
    };
    carpetas.forEach(recorrer);
    // Permitidos: escala.tsx (los envuelve) y los alias explícitos (`Text as TextoFijo`: iniciales del avatar).
    const malos = archivos
      .filter((a) => !a.endsWith('/ui/escala.tsx'))
      .filter((a) => {
        const m = /import\s*\{([^}]*)\}\s*from\s*'react-native'/.exec(readFileSync(a, 'utf8'));
        return !!m && m[1].split(',').map((x) => x.trim()).some((x) => x === 'Text' || x === 'TextInput');
      });
    assert.deepEqual(malos, []);
  });
});

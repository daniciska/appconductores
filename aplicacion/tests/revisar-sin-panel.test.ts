/// <reference types="node" />
// Pruebas del revisor que corta la publicación si el export de la demo del conductor lleva algo del
// panel (scripts/revisar-export-sin-panel.mjs). Correr con: npm run test:match
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { PROHIBIDOS, revisarCarpeta, variantes } from '../scripts/revisar-export-sin-panel.mjs';

const carpetas: string[] = [];
function exportDePrueba(js: string): string {
  const c = mkdtempSync(join(tmpdir(), 'dale-export-'));
  carpetas.push(c);
  mkdirSync(join(c, '_expo', 'static', 'js', 'web'), { recursive: true });
  writeFileSync(join(c, 'index.html'), '<!doctype html><title>Dale Contacto</title>');
  writeFileSync(join(c, '_expo', 'static', 'js', 'web', 'entry.js'), js);
  return c;
}
after(() => carpetas.forEach((c) => rmSync(c, { recursive: true, force: true })));

describe('Revisor del export sin panel', () => {
  it('incluye los textos pedidos', () => {
    for (const t of ['Panel de administraci', 'Reglas del match', 'Zonas y comunas', 'Entrar como revisor', '/panel', 'PaginaPanel', 'MarcoPanel']) {
      assert.ok((PROHIBIDOS as string[]).includes(t), t);
    }
  });

  it('incluye los roles del panel como valores y sus datos de ejemplo', () => {
    for (const t of ['"administrador"', '"revisor"', 'Paula Vergara', 'r01m1', 'transferir una garant']) {
      assert.ok((PROHIBIDOS as string[]).includes(t), t);
    }
    const c = exportDePrueba('if(v.rol!=="administrador"&&v.rol!=="revisor")return null;');
    const textos = (revisarCarpeta(c) as { texto: string }[]).map((h) => h.texto);
    assert.deepEqual(textos.sort(), ['"administrador"', '"revisor"']);
  });

  it('encuentra textos con tildes escritas como \\xNN o \\uNNNN (JavaScript minificado)', () => {
    assert.ok((variantes('Tú (revisor)') as string[]).includes('T\\xfa (revisor)'));
    const c = exportDePrueba('var a="Panel de administraci\\xf3n",b="T\\u00fa (revisor)";');
    const textos = (revisarCarpeta(c) as { texto: string }[]).map((h) => h.texto);
    assert.ok(textos.includes('Panel de administraci'));
    assert.ok(textos.includes('Tú (revisor)'));
  });

  it('encuentra direcciones y nombres de piezas del panel', () => {
    const c = exportDePrueba('router.push("/panel/documentos");function MarcoPanel(){}');
    const textos = (revisarCarpeta(c) as { texto: string }[]).map((h) => h.texto);
    assert.deepEqual(textos.sort(), ['/panel', 'MarcoPanel']);
  });

  it('un export limpio pasa', () => {
    const c = exportDePrueba('var a="Revisión de documentos en unos segundos";');
    assert.deepEqual(revisarCarpeta(c), []);
  });
});

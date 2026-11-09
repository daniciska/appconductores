/// <reference types="node" />
// Pruebas de la clave de entrada de la demo (src/datos/claveDemo.ts).
// La clave real no se escribe aquí: se prueba con otra y su hash.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { HASH_CLAVE_DEMO, esClaveCorrecta, normalizarClave, sha256Hex } from '../src/datos/claveDemo.ts';

const hashDe = (t: string) => createHash('sha256').update(t, 'utf8').digest('hex');

describe('clave de la demo', () => {
  it('el hash guardado tiene la forma de un SHA-256 (64 caracteres hexadecimales en minúsculas)', () => {
    assert.match(HASH_CLAVE_DEMO, /^[0-9a-f]{64}$/);
  });

  it('sha256Hex coincide con el de Node', async () => {
    assert.equal(await sha256Hex('camino-verde-12'), hashDe('camino-verde-12'));
  });

  it('normaliza espacios a los lados y mayúsculas', () => {
    assert.equal(normalizarClave('  Camino-Verde-12 '), 'camino-verde-12');
  });

  it('acepta la clave correcta aunque venga con mayúsculas o espacios', async () => {
    const hash = hashDe('camino-verde-12');
    assert.equal(await esClaveCorrecta(' CAMINO-verde-12 ', hash), true);
  });

  it('rechaza una clave distinta y la vacía', async () => {
    const hash = hashDe('camino-verde-12');
    assert.equal(await esClaveCorrecta('camino-verde-13', hash), false);
    assert.equal(await esClaveCorrecta('', hash), false);
  });
});

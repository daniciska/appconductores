/// <reference types="node" />
// Buscador de comunas del Paso 2 temporal (aplicacion/src/pantallas/ingreso/buscarComuna.ts).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buscarComunas, sinTildes } from '../../aplicacion/src/pantallas/ingreso/buscarComuna.ts';

import { catalogosLeidos } from './base.ts';

const comunas = catalogosLeidos().catalogos.comunas;
const nombres = (t: string) => buscarComunas(t, comunas).map((c) => c.nombre);

describe('buscar comuna', () => {
  it('sin tildes y sin mayúsculas', () => {
    assert.equal(sinTildes('  Ñuñoa '), 'nunoa');
    assert.deepEqual(nombres('nunoa'), ['Ñuñoa']);
    assert.deepEqual(nombres('ÑUÑOA'), ['Ñuñoa']);
  });
  it('desde 2 letras y hasta 6 sugerencias', () => {
    assert.deepEqual(nombres('n'), []);
    assert.equal(nombres('san').length, 6);
  });
  it('primero la exacta, después las que empiezan así y al final las que lo contienen', () => {
    const r = nombres('maipu');
    assert.equal(r[0], 'Maipú');
    const santiago = nombres('santiago');
    assert.equal(santiago[0], 'Santiago');
    const prov = nombres('provi');
    assert.deepEqual(prov, ['Providencia']);
    const con = nombres('ancud');
    assert.deepEqual(con, ['Ancud']);
    const contiene = nombres('lagos');
    assert.ok(contiene.includes('Los Lagos') && contiene.indexOf('Lagos') === -1);
  });
  it('también por el nombre alternativo', () => {
    assert.deepEqual(nombres('paihuano'), ['Paiguano']);
    assert.deepEqual(nombres('la calera'), ['Calera']);
  });
  it('si no hay, lista vacía', () => {
    assert.deepEqual(nombres('xyzw'), []);
  });
});

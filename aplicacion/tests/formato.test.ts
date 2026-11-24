// Máscaras de los campos de fecha (Paso 1, S05) y de celular (A2, S03).
// Node ejecuta TypeScript directo (sin compilar), por eso las importaciones llevan ".ts".
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mascaraCampoCelular, mascaraFechaEscrita } from '../src/datos/formato.ts';

/** Escribe tecla por tecla, como en el celular: cada tecla se agrega a lo que ya muestra el campo. */
function teclear(mascara: (t: string) => string, teclas: string): string {
  let valor = '';
  for (const t of teclas) valor = mascara(valor + t);
  return valor;
}

describe('fecha de nacimiento (S05): cómoda en el teclado del iPhone y de Android', () => {
  it('cualquier separador sirve y el día o mes de un número se completa con 0', () => {
    for (const escrito of ['5.3.1968', '5,3,1968', '5-3-1968', '5 3 1968', '5/3/1968']) {
      assert.equal(mascaraFechaEscrita(escrito), '05/03/1968', `pegado: ${escrito}`);
      assert.equal(teclear(mascaraFechaEscrita, escrito), '05/03/1968', `tecleado: ${escrito}`);
    }
  });
  it('solo números sigue funcionando (05031968 → 05/03/1968)', () => {
    assert.equal(teclear(mascaraFechaEscrita, '05031968'), '05/03/1968');
    assert.equal(mascaraFechaEscrita('15111970'), '15/11/1970');
  });
  it('días y meses de 2 números con separador', () => {
    assert.equal(teclear(mascaraFechaEscrita, '15.11.1970'), '15/11/1970');
    assert.equal(teclear(mascaraFechaEscrita, '05.03.1968'), '05/03/1968');
  });
  it('el separador recién escrito se ve como barra y borrar funciona', () => {
    assert.equal(mascaraFechaEscrita('5.'), '05/');
    assert.equal(mascaraFechaEscrita('05,'), '05/');
    assert.equal(mascaraFechaEscrita('05/03.'), '05/03/');
    assert.equal(mascaraFechaEscrita('05'), '05', 'al borrar la barra queda el día');
    assert.equal(mascaraFechaEscrita('05/0'), '05/0');
  });
  it('lo que rellena el navegador con el año primero (1968-03-05)', () => {
    assert.equal(mascaraFechaEscrita('1968-03-05'), '05/03/1968');
    assert.equal(mascaraFechaEscrita('1968-3-5'), '05/03/1968');
  });
  it('nunca más de 8 números', () => {
    assert.equal(mascaraFechaEscrita('05/03/196899'), '05/03/1968');
  });
});

describe('celular (S03): se acepta el número como venga', () => {
  it('pegado como sale en WhatsApp, con 56 o con 0', () => {
    for (const escrito of ['+56 9 9000 0001', '+56990000001', '56990000001', '09 9000 0001', '990000001', '9 9000 0001', '+56 (9) 9000-0001', '0056 9 9000 0001', '0056990000001']) {
      assert.equal(mascaraCampoCelular(escrito), '9 9000 0001', escrito);
    }
  });
  it('tecleado de a uno, también empezando con +56', () => {
    assert.equal(teclear(mascaraCampoCelular, '+56990000001'), '9 9000 0001');
    assert.equal(teclear(mascaraCampoCelular, '990000001'), '9 9000 0001');
    assert.equal(teclear(mascaraCampoCelular, '0056990000001'), '9 9000 0001');
  });
  it('nunca más de 9 números', () => {
    assert.equal(mascaraCampoCelular('9900000012345'), '9 9000 0001');
  });
});

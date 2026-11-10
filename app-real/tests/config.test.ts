/// <reference types="node" />
// La configuración pública (src/configuracion.ts): acepta la clave publicable y rechaza cualquier secreta.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { revisarConfiguracion } from '../src/configuracion.ts';

const URL_OK = 'https://zflalaqimacsnlvurzeb.supabase.co';
const jwt = (payload: object) =>
  `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.firma`;

describe('configuración pública de la app real', () => {
  it('acepta la del .env versionado (dirección del proyecto y clave publicable, con números de prueba)', () => {
    const env = Object.fromEntries(
      readFileSync(new URL('../.env', import.meta.url), 'utf8')
        .split('\n')
        .filter((l) => /^[A-Z_]+=/.test(l))
        .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
    );
    const c = revisarConfiguracion({
      url: env.EXPO_PUBLIC_SUPABASE_URL,
      clave: env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      codigosDePrueba: env.EXPO_PUBLIC_CODIGOS_DE_PRUEBA,
    });
    assert.equal(c.url, URL_OK);
    assert.equal(c.ref, 'zflalaqimacsnlvurzeb');
    assert.match(c.clavePublica, /^sb_publishable_/);
    assert.equal(c.codigosDePrueba, true);
  });

  it('rechaza una clave secreta nueva (sb_secret_…)', () => {
    assert.throws(() => revisarConfiguracion({ url: URL_OK, clave: 'sb_secret_abcdefghijklmnop' }), /no es la publicable/);
  });

  it('rechaza un JWT con rol service_role y acepta la anon antigua', () => {
    assert.throws(() => revisarConfiguracion({ url: URL_OK, clave: jwt({ role: 'service_role', ref: 'x' }) }), /no es la publicable/);
    assert.equal(revisarConfiguracion({ url: URL_OK, clave: jwt({ role: 'anon' }) }).clavePublica.split('.').length, 3);
  });

  it('se detiene si falta una variable o la dirección no es de Supabase', () => {
    assert.throws(() => revisarConfiguracion({ clave: 'sb_publishable_x' }), /Falta EXPO_PUBLIC_SUPABASE_URL/);
    assert.throws(() => revisarConfiguracion({ url: URL_OK }), /Falta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
    assert.throws(() => revisarConfiguracion({ url: 'https://ejemplo.cl', clave: 'sb_publishable_x' }), /no parece de un proyecto/);
  });

  it('los números de prueba se encienden solo con "1"', () => {
    assert.equal(revisarConfiguracion({ url: URL_OK, clave: 'sb_publishable_x' }).codigosDePrueba, false);
    assert.equal(revisarConfiguracion({ url: URL_OK, clave: 'sb_publishable_x', codigosDePrueba: '0' }).codigosDePrueba, false);
  });
});

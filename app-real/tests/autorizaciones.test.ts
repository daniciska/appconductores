/// <reference types="node" />
// Los 4 textos de "Antes de empezar": los de la pantalla (TEXTOS_AUTORIZACION, los que muestra la demo)
// son los mismos que guarda la base como versión 'prueba-1' (la migración aplicada en Supabase el 9-nov).
// La app real muestra los vigentes de la base (textosDeCasillas) y registra esos mismos; la pantalla
// los dibuja con partesTexto (negrita y enlaces), igual que la maqueta.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { CLAVE_TEXTO, textosDeCasillas } from '../src/datos/catalogos.ts';
import { textosParaAceptar } from '../src/datos/escrituras.ts';
import { TEXTOS_AUTORIZACION, partesTexto } from '../../aplicacion/src/pantallas/ingreso/textosAutorizacion.ts';

import { BASE } from './base.ts';

const migracion = readFileSync(new URL('../../supabase/migrations/20261110120000_app_conductor_v1_textos_prueba.sql', import.meta.url), 'utf8');

const enPantalla: Record<string, string> = TEXTOS_AUTORIZACION;
const enMigracion = Object.fromEntries([...migracion.matchAll(/\('([a-z_]+)',\s*'[^']*',\s*'([^']*)'/g)].map((m) => [m[1], m[2]]));

describe('textos de "Antes de empezar"', () => {
  it('la pantalla tiene las 4 casillas', () => {
    assert.deepEqual(Object.keys(enPantalla).sort(), ['compartir', 'mensajes', 'revision', 'terminos']);
  });
  it('cada casilla es igual al texto de la migración con su clave', () => {
    for (const [casilla, clave] of Object.entries(CLAVE_TEXTO)) {
      assert.equal(enPantalla[casilla], enMigracion[clave], `${casilla} → ${clave}`);
    }
  });
  it('la app real muestra los textos de la base y registra esos mismos; si falta uno, no registra nada', () => {
    const vigentes = BASE.textos_autorizacion.map((t: { id: number; clave: string; version: string; obligatoria: boolean; texto: string }) => ({ ...t }));
    const todas = { terminos: true, compartir: true, revision: true, mensajes: true };
    const r = textosParaAceptar(todas, vigentes);
    assert.ok(r.ok && r.valor.map((t) => t.id).join() === '1,2,3,4');
    assert.deepEqual(textosDeCasillas(vigentes), TEXTOS_AUTORIZACION, 'hoy la base tiene los mismos textos de la pantalla');
    // Llega una versión nueva (por ejemplo, la del abogado): la pantalla la muestra y se registra esa.
    const nueva = vigentes.map((t: { id: number; clave: string; version: string; texto: string }) =>
      t.clave === 'compartir_ficha' ? { ...t, id: 9, version: 'v1', texto: 'Otro texto del abogado.' } : t,
    );
    assert.equal(textosDeCasillas(nueva).compartir, 'Otro texto del abogado.');
    const r2 = textosParaAceptar(todas, nueva);
    assert.ok(r2.ok && r2.valor.map((t) => t.id).join() === '1,9,3,4');
    assert.deepEqual(textosParaAceptar(todas, []), { ok: false, error: 'Faltan los textos de autorización. Avísale al equipo.' });
    const sinUno = vigentes.filter((t: { clave: string }) => t.clave !== 'normas_mensajes');
    assert.deepEqual(textosParaAceptar(todas, sinUno), { ok: false, error: 'Faltan los textos de autorización. Avísale al equipo.' });
    assert.equal(textosDeCasillas(sinUno).mensajes, undefined, 'A4 usa el suyo para esa casilla');
  });
  it('se dibujan como en la maqueta: título en negrita y enlaces a Términos y Política', () => {
    assert.deepEqual(partesTexto(TEXTOS_AUTORIZACION.terminos), [
      { tipo: 'texto', texto: 'Acepto los ' },
      { tipo: 'enlace', texto: 'Términos', documento: 'terminos' },
      { tipo: 'texto', texto: ' y la ' },
      { tipo: 'enlace', texto: 'Política de privacidad', documento: 'privacidad' },
      { tipo: 'texto', texto: ', y declaro ser mayor de 18 años.' },
    ]);
    assert.deepEqual(partesTexto(TEXTOS_AUTORIZACION.compartir), [{ tipo: 'texto', texto: TEXTOS_AUTORIZACION.compartir }]);
    assert.deepEqual(partesTexto(TEXTOS_AUTORIZACION.revision), [
      { tipo: 'negrita', texto: 'Revisión de mis documentos:' },
      {
        tipo: 'texto',
        texto: ' un sistema automático los revisa primero; las dudas y los rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.',
      },
    ]);
    assert.deepEqual(partesTexto(TEXTOS_AUTORIZACION.mensajes), [
      { tipo: 'negrita', texto: 'Mensajes:' },
      { tipo: 'texto', texto: ' me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y bloquear.' },
    ]);
    // Cada enlace, solo la primera vez; las partes juntas son el texto completo.
    const otro = 'Leí los Términos y Condiciones y la Política de privacidad. Los Términos pueden cambiar.';
    const partes = partesTexto(otro);
    assert.equal(partes.filter((p) => p.tipo === 'enlace').length, 2);
    assert.equal(partes.map((p) => p.texto).join(''), otro);
    for (const t of Object.values(TEXTOS_AUTORIZACION)) assert.equal(partesTexto(t).map((p) => p.texto).join(''), t);
  });
  it('y a lo que tiene la base (catálogo de las pruebas, sacado de las migraciones)', () => {
    for (const [casilla, clave] of Object.entries(CLAVE_TEXTO)) {
      const t = BASE.textos_autorizacion.find((x: { clave: string }) => x.clave === clave);
      assert.equal(t.texto, enPantalla[casilla], clave);
      assert.equal(t.version, 'prueba-1');
      assert.equal(t.obligatoria, true);
    }
  });
});

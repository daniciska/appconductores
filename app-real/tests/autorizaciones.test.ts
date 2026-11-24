/// <reference types="node" />
// Los 4 textos de "Antes de empezar": los de la pantalla (TEXTOS_AUTORIZACION, los que muestra la demo)
// son los mismos que guarda la base como versión 'prueba-1' (la migración aplicada en Supabase el 9-nov).
// La app real muestra una casilla por cada texto obligatorio vigente de la base (textosParaA4) y registra
// esos mismos; la pantalla los dibuja con partesTexto (negrita) y pone los enlaces en una línea aparte (enlacesDeLaCasilla).
// Versiones nuevas, una 5.ª autorización y "Volver": tests/a4-versiones.test.ts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { textosParaAceptar } from '../src/datos/escrituras.ts';
import { textosParaA4 } from '../src/datos/perfil.ts';
import { TEXTOS_AUTORIZACION, casillaDeLaMaqueta, enlacesDeLaCasilla, partesTexto } from '../../aplicacion/src/pantallas/ingreso/textosAutorizacion.ts';

import { BASE } from './base.ts';

/** Casilla de la maqueta → clave del texto en la base (textos_autorizacion.clave). */
const CLAVE_TEXTO: Record<string, string> = {
  terminos: 'terminos_privacidad',
  compartir: 'compartir_ficha',
  revision: 'revision_documentos',
  mensajes: 'normas_mensajes',
};

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
  it('la app real muestra una casilla por texto de la base (por su id) y registra esos mismos', () => {
    const vigentes = BASE.textos_autorizacion.map((t: { id: number; clave: string; version: string; obligatoria: boolean; texto: string }) => ({ ...t }));
    // Hoy la base tiene los mismos 4 textos de la pantalla, en el mismo orden: A4 se dibuja como la maqueta.
    const a4 = textosParaA4(vigentes, []);
    assert.deepEqual(a4.map((t) => t.id), ['1', '2', '3', '4']);
    assert.deepEqual(a4.map((t) => casillaDeLaMaqueta(t.texto)), ['terminos', 'compartir', 'revision', 'mensajes']);
    assert.deepEqual(a4.map((t) => t.texto), Object.values(TEXTOS_AUTORIZACION));
    const todas = { '1': true, '2': true, '3': true, '4': true };
    const r = textosParaAceptar(todas, vigentes);
    assert.ok(r.ok && r.valor.map((t) => t.id).join() === '1,2,3,4');
    // Llega una versión nueva (por ejemplo, la del abogado): la pantalla la muestra con su id y se registra esa.
    const nueva = vigentes.map((t: { id: number; clave: string; version: string; texto: string }) =>
      t.clave === 'compartir_ficha' ? { ...t, id: 9, version: 'v1', texto: 'Otro texto del abogado.' } : t,
    );
    assert.deepEqual(textosParaA4(nueva, [1, 2, 3, 4])[1], { id: '9', texto: 'Otro texto del abogado.', aceptado: false });
    assert.deepEqual(textosParaAceptar(todas, nueva), { ok: false, error: 'Marca todas las autorizaciones para continuar.' });
    const r2 = textosParaAceptar({ ...todas, '9': true }, nueva);
    assert.ok(r2.ok && r2.valor.map((t) => t.id).join() === '1,9,3,4');
    // Sin textos en la base (migración no aplicada) no se registra nada.
    assert.deepEqual(textosParaAceptar(todas, []), { ok: false, error: 'No pudimos cargar las autorizaciones. Inténtalo más tarde.' });
    // Lo que la base tiene es lo que se pide: sin uno, A4 muestra 3 casillas y bastan esas 3.
    const sinUno = vigentes.filter((t: { clave: string }) => t.clave !== 'normas_mensajes');
    assert.equal(textosParaA4(sinUno, []).length, 3);
    assert.ok(textosParaAceptar({ '1': true, '2': true, '3': true }, sinUno).ok);
  });
  it('se dibujan como en la maqueta: título en negrita y la frase como texto normal', () => {
    assert.deepEqual(partesTexto(TEXTOS_AUTORIZACION.terminos), [{ tipo: 'texto', texto: TEXTOS_AUTORIZACION.terminos }]);
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
    // Las partes juntas son el texto completo, y ninguna es un enlace (S13: los enlaces van aparte).
    for (const t of Object.values(TEXTOS_AUTORIZACION)) {
      assert.equal(partesTexto(t).map((p) => p.texto).join(''), t);
      assert.ok(partesTexto(t).every((p) => p.tipo === 'texto' || p.tipo === 'negrita'));
    }
  });
  it('S13: los Términos y la Política se abren desde una línea aparte, bajo la frase', () => {
    assert.deepEqual(enlacesDeLaCasilla(TEXTOS_AUTORIZACION.terminos), [
      { documento: 'terminos', titulo: 'Leer Términos' },
      { documento: 'privacidad', titulo: 'Leer Política de privacidad' },
    ]);
    for (const c of ['compartir', 'revision', 'mensajes'] as const) assert.deepEqual(enlacesDeLaCasilla(TEXTOS_AUTORIZACION[c]), [], c);
    // Un texto de la base: en el orden en que aparecen y una vez cada uno.
    const otro = 'Avisos: leí la Política de privacidad y los Términos y Condiciones. Los Términos pueden cambiar.';
    assert.deepEqual(enlacesDeLaCasilla(otro), [
      { documento: 'privacidad', titulo: 'Leer Política de privacidad' },
      { documento: 'terminos', titulo: 'Leer Términos' },
    ]);
    assert.deepEqual(partesTexto(otro)[0], { tipo: 'negrita', texto: 'Avisos:' });
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

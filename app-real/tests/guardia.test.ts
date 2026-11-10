/// <reference types="node" />
// Guardia de rutas (src/guardia.ts): la tabla de la sección 6.6 de la especificación.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { destinoGuardia, rutaDeEntrada, type EstadoGuardia } from '../src/guardia.ts';

const sinSesion: EstadoGuardia = { conSesion: false, autorizacionesCompletas: false, registrado: false, codigoPedido: false };
const sinAutorizaciones: EstadoGuardia = { conSesion: true, autorizacionesCompletas: false, registrado: false, codigoPedido: false };
const sinRegistro: EstadoGuardia = { conSesion: true, autorizacionesCompletas: true, registrado: false, codigoPedido: false };
const registrado: EstadoGuardia = { conSesion: true, autorizacionesCompletas: true, registrado: true, codigoPedido: false };

describe('guardia de rutas', () => {
  it('sin sesión: solo bienvenida, celular y código (con código pedido)', () => {
    assert.equal(destinoGuardia('/conductor/bienvenida', sinSesion), null);
    assert.equal(destinoGuardia('/conductor/celular', sinSesion), null);
    assert.equal(destinoGuardia('/conductor/codigo', sinSesion), '/conductor/celular');
    assert.equal(destinoGuardia('/conductor/codigo', { ...sinSesion, codigoPedido: true }), null);
    for (const r of ['/conductor/inicio', '/conductor/perfil', '/conductor/registro/1', '/conductor/autorizaciones', '/conductor/disponibilidad'])
      assert.equal(destinoGuardia(r, sinSesion), '/conductor/bienvenida', r);
  });
  it('con sesión y sin autorizaciones: solo "Antes de empezar"', () => {
    assert.equal(destinoGuardia('/conductor/autorizaciones', sinAutorizaciones), null);
    assert.equal(destinoGuardia('/conductor/registro/1', sinAutorizaciones), '/conductor/autorizaciones');
    assert.equal(destinoGuardia('/conductor/inicio', sinAutorizaciones), '/conductor/autorizaciones');
  });
  it('con autorizaciones y sin registrarse: "Antes de empezar" y el Paso 1', () => {
    assert.equal(destinoGuardia('/conductor/autorizaciones', sinRegistro), null);
    assert.equal(destinoGuardia('/conductor/registro/1', sinRegistro), null);
    assert.equal(destinoGuardia('/conductor/registro/2', sinRegistro), '/conductor/registro/1');
    assert.equal(destinoGuardia('/conductor/inicio', sinRegistro), '/conductor/registro/1');
  });
  it('registrado: todo, salvo el ingreso (que lleva a Inicio)', () => {
    for (const r of ['/conductor/inicio', '/conductor/perfil', '/conductor/registro/4', '/conductor/disponibilidad', '/conductor/autorizaciones'])
      assert.equal(destinoGuardia(r, registrado), null, r);
    for (const r of ['/conductor/bienvenida', '/conductor/celular', '/conductor/codigo']) assert.equal(destinoGuardia(r, registrado), '/conductor/inicio', r);
  });
  it('las entradas (/ y /conductor) deciden solas', () => {
    assert.equal(destinoGuardia('/conductor', sinSesion), null);
    assert.equal(rutaDeEntrada(sinSesion), '/conductor/bienvenida');
    assert.equal(rutaDeEntrada(sinAutorizaciones), '/conductor/autorizaciones');
    assert.equal(rutaDeEntrada(sinRegistro), '/conductor/registro/1');
    assert.equal(rutaDeEntrada(registrado), '/conductor/inicio');
  });
});

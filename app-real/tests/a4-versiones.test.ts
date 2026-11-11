/// <reference types="node" />
// "Antes de empezar" (A4) cuando la base cambia, con el supabase-js de verdad contra el Supabase SIMULADO:
// - Una casilla por cada texto obligatorio vigente para el conductor, en el orden de la base (una clave
//   nueva, la 5.ª, aparece sola, sin publicar otra app).
// - Cada casilla parte marcada SOLO si la persona aceptó esa misma versión (su id), nunca por deducción
//   de otras claves: una versión nueva parte sin marcar y "Continuar" no avanza hasta marcarla.
// - Solo se registran las versiones que faltan (las ya aceptadas no se duplican).
// - "Volver" ofrece cerrar sesión siempre que la guardia no deje salir de A4 (nunca hay vueltas).
// La pantalla usa estas mismas reglas puras (aplicacion/src/pantallas/ingreso/textosAutorizacion.ts).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { mapearCatalogos, type CatalogosLeidos } from '../src/datos/catalogos.ts';
import { ejecutarPlan, planAutorizaciones, planPaso1, textosParaAceptar } from '../src/datos/escrituras.ts';
import { leerCatalogos, leerPerfil } from '../src/datos/lecturas.ts';
import { mapearPerfil, type PerfilLeido } from '../src/datos/perfil.ts';
import { destinoGuardia } from '../src/guardia.ts';
import {
  TEXTOS_AUTORIZACION,
  alDiaEnA4,
  casillaDeLaMaqueta,
  casillasA4,
  faltanEnA4,
  marcasIniciales,
  partesTexto,
  textoMarcaTodas,
  volverDeA4,
} from '../../aplicacion/src/pantallas/ingreso/textosAutorizacion.ts';

import { crearSupabaseSimulado } from './simulador/supabaseSimulado.mjs';

const URL_SB = 'https://zflalaqimacsnlvurzeb.supabase.co';
const NUMERO = '56990000001';
const CODIGO = '123456';
const MARCA_TODAS = 'Marca todas las autorizaciones para continuar.';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sim = any;

interface Persona {
  sim: Sim;
  cliente: SupabaseClient;
  uid: string;
  /** Vuelve a leer catálogos y perfil, como la app al abrirse. */
  leer(): Promise<{ c: CatalogosLeidos; p: PerfilLeido }>;
  /** Consentimientos vigentes de la persona (ids de texto, en orden). */
  aceptados(): number[];
}

/** Entra con el número de prueba; opcionalmente acepta los 4 textos de hoy y hace el Paso 1. */
async function persona({ aceptar = false, registrar = false } = {}): Promise<Persona> {
  const sim = crearSupabaseSimulado({ numerosDePrueba: { [NUMERO]: CODIGO } });
  const cliente = createClient(URL_SB, 'sb_publishable_prueba', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: sim.fetch },
  });
  assert.equal((await cliente.auth.signInWithOtp({ phone: '+' + NUMERO, options: { channel: 'whatsapp' } })).error, null);
  const { data } = await cliente.auth.verifyOtp({ phone: '+' + NUMERO, token: CODIGO, type: 'sms' });
  const uid = data.session!.user.id;
  const leer = async () => {
    const cat = await leerCatalogos(cliente);
    assert.equal(cat.error, null);
    const c = mapearCatalogos(cat.datos!);
    const r = await leerPerfil(cliente, uid);
    assert.equal(r.error, null);
    return { c, p: mapearPerfil(r.datos!, c.mapas, c.textos) };
  };
  const aceptados = () =>
    sim.datos.consentimientos
      .filter((x: { cuenta_id: string; revocado_en: string | null }) => x.cuenta_id === uid && !x.revocado_en)
      .map((x: { texto_autorizacion_id: number }) => x.texto_autorizacion_id)
      .sort((a: number, b: number) => a - b);
  if (aceptar) {
    const { c } = await leer();
    assert.equal((await ejecutarPlan(cliente, planAutorizaciones(uid, c.textos, []))).ok, true);
  }
  if (registrar) {
    const { c } = await leer();
    const d = { nombres: 'Ana', apellido1: 'Prueba', apellido2: '', fechaNacimiento: '14/03/1990', correo: 'a@ejemplo.cl', clasesDeclaradas: ['A2'], disponible: true };
    assert.equal((await ejecutarPlan(cliente, planPaso1(uid, d, { registrado: false, clasesDeclaradas: [] }, c.mapas, new Date().toISOString()))).ok, true);
  }
  return { sim, cliente, uid, leer, aceptados };
}

/** Publica en la base una versión nueva de una clave (la anterior deja de estar vigente), como una migración. */
function publicarVersion(sim: Sim, clave: string, id: number, texto: string) {
  const textos = sim.catalogos.textos_autorizacion;
  const viejo = textos.find((t: { clave: string; vigente: boolean }) => t.clave === clave && t.vigente);
  viejo.vigente = false;
  textos.push({ ...viejo, id, version: 'v1', texto, vigente: true, exige_aceptar_de_nuevo: true });
}

/** Lo que muestra la pantalla A4 de la app real con este perfil. */
function pantalla(p: PerfilLeido) {
  const casillas = casillasA4(p.textosAutorizacion, false);
  const marcas = marcasIniciales(casillas);
  return {
    casillas,
    marcas,
    /** Cómo parte cada casilla, en el orden en que se dibujan. */
    marcadas: casillas.map((x) => marcas[x.id]),
    volver: volverDeA4('cerrarSesion', p.conductor.registrado, casillas),
  };
}

/** A dónde manda la guardia a quien toca "Volver" hacia Inicio (null: lo deja ir). */
const guardiaInicio = (p: PerfilLeido) =>
  destinoGuardia('/conductor/inicio', { conSesion: true, autorizacionesCompletas: p.autorizacionesCompletas, registrado: p.conductor.registrado, codigoPedido: false });

const CLAVES = ['terminos_privacidad', 'compartir_ficha', 'revision_documentos', 'normas_mensajes'];

describe('A4 · persona nueva', () => {
  it('ve las 4 casillas de la maqueta (los textos de la base), en orden y sin nada marcado', async () => {
    const yo = await persona();
    const { c, p } = await yo.leer();
    const a4 = pantalla(p);
    assert.deepEqual(a4.casillas.map((x) => x.id), ['1', '2', '3', '4']);
    assert.deepEqual(a4.casillas.map((x) => casillaDeLaMaqueta(x.texto)), ['terminos', 'compartir', 'revision', 'mensajes'], 'se dibujan con el JSX de la maqueta');
    assert.deepEqual(a4.marcadas, [false, false, false, false]);
    assert.equal(faltanEnA4(a4.casillas, a4.marcas).length, 4);
    assert.equal(textoMarcaTodas(a4.casillas.length), 'Marca las 4 autorizaciones para continuar.');
    assert.equal(a4.volver, 'cerrarSesion');
    // "Continuar" sin marcar: no se registra nada.
    assert.deepEqual(textosParaAceptar(a4.marcas, c.textos), { ok: false, error: MARCA_TODAS });
    // Marcando las 4: se registran las 4 y queda al día (sin registrarse aún: la guardia lo lleva al Paso 1).
    const r = textosParaAceptar({ '1': true, '2': true, '3': true, '4': true }, c.textos);
    assert.ok(r.ok);
    assert.equal((await ejecutarPlan(yo.cliente, planAutorizaciones(yo.uid, r.valor, p.aceptados))).ok, true);
    assert.deepEqual(yo.aceptados(), [1, 2, 3, 4]);
    const despues = (await yo.leer()).p;
    assert.equal(despues.autorizacionesCompletas, true);
    assert.equal(guardiaInicio(despues), '/conductor/registro/1');
    assert.equal(pantalla(despues).volver, 'cerrarSesion', 'sin registrarse, Inicio no la deja pasar: ofrece cerrar sesión');
  });
});

describe('A4 · versión nueva de un texto (persona registrada)', () => {
  CLAVES.forEach((clave, i) => {
    it(`${clave}: parte sin marcar, "Continuar" no avanza hasta marcarla y solo se registra la nueva`, async () => {
      const yo = await persona({ aceptar: true, registrar: true });
      let { c, p } = await yo.leer();
      assert.equal(p.autorizacionesCompletas, true);
      assert.equal(pantalla(p).volver, 'inicio');
      assert.equal(guardiaInicio(p), null);

      const id = 10 + i;
      const nuevo = `Texto nuevo del abogado para ${clave}.`;
      publicarVersion(yo.sim, clave, id, nuevo);
      ({ c, p } = await yo.leer());

      // La guardia la lleva a A4 y A4 muestra la versión nueva en su lugar, SIN marcar; las otras, marcadas.
      assert.equal(p.autorizacionesCompletas, false);
      assert.equal(guardiaInicio(p), '/conductor/autorizaciones');
      const a4 = pantalla(p);
      assert.deepEqual(a4.casillas.map((x) => x.id), ['1', '2', '3', '4'].map((x, k) => (k === i ? String(id) : x)));
      assert.equal(a4.casillas[i].texto, nuevo);
      assert.equal(casillaDeLaMaqueta(nuevo), null, 'se dibuja con partesTexto');
      assert.deepEqual(a4.marcadas, [0, 1, 2, 3].map((k) => k !== i));
      assert.deepEqual(faltanEnA4(a4.casillas, a4.marcas).map((x) => x.id), [String(id)]);
      // "Volver": la guardia no la deja salir de A4, así que ofrece cerrar sesión (no da vueltas).
      assert.equal(a4.volver, 'cerrarSesion');

      // "Continuar" sin marcar la nueva: no se registra nada.
      const antes = yo.sim.pedidos.length;
      assert.deepEqual(textosParaAceptar(a4.marcas, c.textos), { ok: false, error: MARCA_TODAS });
      assert.equal(yo.sim.pedidos.length, antes);
      assert.deepEqual(yo.aceptados(), [1, 2, 3, 4]);

      // Marcándola: se registra SOLO la versión nueva (las ya aceptadas no se duplican).
      const r = textosParaAceptar({ ...a4.marcas, [String(id)]: true }, c.textos);
      assert.ok(r.ok);
      const plan = planAutorizaciones(yo.uid, r.valor, p.aceptados);
      assert.deepEqual(plan, [{ tipo: 'insertar', tabla: 'consentimientos', filas: [{ cuenta_id: yo.uid, texto_autorizacion_id: id }] }]);
      assert.equal((await ejecutarPlan(yo.cliente, plan)).ok, true);
      assert.deepEqual(yo.aceptados(), [1, 2, 3, 4, id].sort((a, b) => a - b));

      // Al día otra vez: la guardia la deja pasar y "Volver" va a Inicio.
      ({ p } = await yo.leer());
      assert.equal(p.autorizacionesCompletas, true);
      assert.equal(guardiaInicio(p), null);
      assert.equal(pantalla(p).volver, 'inicio');
    });
  });

  it('también a quien aceptó pero no se registró: la nueva parte sin marcar', async () => {
    const yo = await persona({ aceptar: true });
    publicarVersion(yo.sim, 'normas_mensajes', 20, 'Mensajes: me comprometo a un trato respetuoso. Texto nuevo de mensajes.');
    const { c, p } = await yo.leer();
    const a4 = pantalla(p);
    assert.deepEqual(a4.marcadas, [true, true, true, false]);
    assert.deepEqual(partesTexto(a4.casillas[3].texto)[0], { tipo: 'negrita', texto: 'Mensajes:' });
    assert.deepEqual(textosParaAceptar(a4.marcas, c.textos), { ok: false, error: MARCA_TODAS });
    assert.equal(a4.volver, 'cerrarSesion');
    assert.equal(guardiaInicio(p), '/conductor/autorizaciones');
  });
});

describe('A4 · una autorización nueva (5.ª clave)', () => {
  it('aparece sola, se acepta y deja pasar; las opcionales y las de titulares no se piden', async () => {
    const yo = await persona({ aceptar: true, registrar: true });
    const textos = yo.sim.catalogos.textos_autorizacion;
    const base = textos[0];
    const QUINTA = 'Avisos: acepto recibir por WhatsApp los avisos de mi perfil.';
    textos.push({ ...base, id: 30, clave: 'avisos_whatsapp', nombre: 'Avisos', texto: QUINTA, version: 'v1', orden: 5 });
    textos.push({ ...base, id: 31, clave: 'novedades', nombre: 'Novedades', texto: 'Novedades: opcional.', version: 'v1', obligatoria: false, orden: 6 });
    textos.push({ ...base, id: 32, clave: 'titular_algo', nombre: 'Solo titulares', texto: 'Solo para titulares.', version: 'v1', para_quien: 'titular', orden: 7 });

    let { c, p } = await yo.leer();
    assert.equal(p.autorizacionesCompletas, false);
    assert.equal(guardiaInicio(p), '/conductor/autorizaciones');
    const a4 = pantalla(p);
    assert.deepEqual(a4.casillas.map((x) => x.id), ['1', '2', '3', '4', '30']);
    assert.deepEqual(a4.marcadas, [true, true, true, true, false]);
    assert.deepEqual(partesTexto(QUINTA)[0], { tipo: 'negrita', texto: 'Avisos:' });
    assert.equal(textoMarcaTodas(a4.casillas.length), 'Marca las 5 autorizaciones para continuar.');
    assert.equal(a4.volver, 'cerrarSesion');
    assert.deepEqual(textosParaAceptar(a4.marcas, c.textos), { ok: false, error: MARCA_TODAS });

    const r = textosParaAceptar({ ...a4.marcas, '30': true }, c.textos);
    assert.ok(r.ok);
    assert.equal((await ejecutarPlan(yo.cliente, planAutorizaciones(yo.uid, r.valor, p.aceptados))).ok, true);
    assert.deepEqual(yo.aceptados(), [1, 2, 3, 4, 30]);
    ({ c, p } = await yo.leer());
    assert.equal(p.autorizacionesCompletas, true);
    assert.equal(guardiaInicio(p), null);
    assert.equal(pantalla(p).volver, 'inicio');
  });

  it('sin textos vigentes en la base: ninguna casilla, no se registra nada y "Volver" ofrece cerrar sesión', async () => {
    const yo = await persona();
    for (const t of yo.sim.catalogos.textos_autorizacion) t.vigente = false;
    const { c, p } = await yo.leer();
    const a4 = pantalla(p);
    assert.equal(a4.casillas.length, 0);
    assert.equal(alDiaEnA4(a4.casillas), false);
    assert.equal(p.autorizacionesCompletas, false);
    assert.deepEqual(textosParaAceptar(a4.marcas, c.textos), { ok: false, error: 'Faltan los textos de autorización. Avísale al equipo.' });
    assert.equal(a4.volver, 'cerrarSesion');
  });
});

describe('A4 · "Volver" nunca da vueltas', () => {
  it('registrada y con una versión nueva pendiente: ofrece cerrar sesión; al día: va a Inicio', async () => {
    const yo = await persona({ aceptar: true, registrar: true });
    assert.equal(pantalla((await yo.leer()).p).volver, 'inicio');
    publicarVersion(yo.sim, 'revision_documentos', 40, 'Revisión de mis documentos: texto nuevo.');
    const { p } = await yo.leer();
    assert.equal(p.conductor.registrado, true);
    assert.equal(pantalla(p).volver, 'cerrarSesion');
  });
  it('solo va a Inicio cuando la guardia deja ir a Inicio (todas las combinaciones)', () => {
    const casilla = (aceptada: boolean) => ({ id: '1', texto: 'x', aceptada });
    for (const registrado of [true, false])
      for (const alDia of [true, false]) {
        const casillas = [casilla(true), casilla(alDia)];
        const volver = volverDeA4('cerrarSesion', registrado, casillas);
        const guardia = destinoGuardia('/conductor/inicio', { conSesion: true, autorizacionesCompletas: alDiaEnA4(casillas), registrado, codigoPedido: false });
        assert.equal(volver === 'inicio', guardia === null, `registrado=${registrado} alDia=${alDia}`);
      }
  });
  it('la demo sigue igual: sus 4 casillas, marcadas solo si ya las aceptó, y "Volver" al código', () => {
    const sinAceptar = casillasA4(null, false);
    assert.deepEqual(sinAceptar.map((x) => x.id), ['terminos', 'compartir', 'revision', 'mensajes']);
    assert.deepEqual(sinAceptar.map((x) => x.texto), Object.values(TEXTOS_AUTORIZACION));
    assert.deepEqual(marcasIniciales(sinAceptar), { terminos: false, compartir: false, revision: false, mensajes: false });
    assert.deepEqual(marcasIniciales(casillasA4(undefined, true)), { terminos: true, compartir: true, revision: true, mensajes: true });
    for (const registrado of [true, false]) assert.equal(volverDeA4('codigo', registrado, sinAceptar), 'codigo');
  });
});

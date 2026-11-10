/// <reference types="node" />
// Capa real con un cliente de Supabase SIMULADO: el supabase-js de verdad (el mismo de la app) habla con
// tests/simulador/supabaseSimulado.mjs, que responde como Auth y PostgREST con las reglas de la base.
// Prueba las lecturas, el ejecutor de los planes, los errores y la FORMA de cada pedido (método, tabla,
// on_conflict, Prefer, columnas enviadas, filtro por el propio id).
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { mapearCatalogos, type CatalogosLeidos } from '../src/datos/catalogos.ts';
import { textoErrorPedirCodigo, textoErrorVerificar } from '../src/datos/errores.ts';
import {
  ejecutarPlan,
  planAutorizaciones,
  planDisponible,
  planPaso1,
  planPaso2,
  planPaso3,
  planPaso4,
} from '../src/datos/escrituras.ts';
import { leerCatalogos, leerPerfil } from '../src/datos/lecturas.ts';
import { mapearPerfil, type PerfilLeido } from '../src/datos/perfil.ts';

import { crearSupabaseSimulado } from './simulador/supabaseSimulado.mjs';

const URL_SB = 'https://zflalaqimacsnlvurzeb.supabase.co';
const NUMERO = '56990000001';
const CODIGO = '123456';
const AHORA = () => new Date().toISOString();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sim: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cliente: SupabaseClient<any>;
let c: CatalogosLeidos;
let uid = '';

async function perfil(): Promise<PerfilLeido> {
  const r = await leerPerfil(cliente, uid);
  assert.equal(r.error, null);
  return mapearPerfil(r.datos!, c.mapas, c.textos);
}

const ultimos = (n: number) => sim.pedidos.slice(-n);

before(async () => {
  sim = crearSupabaseSimulado({ numerosDePrueba: { [NUMERO]: CODIGO } });
  cliente = createClient(URL_SB, 'sb_publishable_prueba', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: sim.fetch },
  });
});

describe('ingreso con celular y código', () => {
  it('un número que no está en la lista de prueba no entra', async () => {
    const { error } = await cliente.auth.signInWithOtp({ phone: '+56990000099', options: { channel: 'whatsapp' } });
    assert.equal(error?.code, 'sms_send_failed');
    assert.equal(textoErrorPedirCodigo(error!, true), 'Por ahora solo pueden entrar los celulares del equipo.');
    const p = ultimos(1)[0];
    assert.equal(p.ruta, '/auth/v1/otp');
    assert.deepEqual([p.body.phone, p.body.channel], ['+56990000099', 'whatsapp']);
  });
  it('el número de prueba pide el código; pedir otro antes de 60 s da la espera', async () => {
    const r = await cliente.auth.signInWithOtp({ phone: '+' + NUMERO, options: { channel: 'whatsapp' } });
    assert.equal(r.error, null);
    const otra = await cliente.auth.signInWithOtp({ phone: '+' + NUMERO, options: { channel: 'sms' } });
    assert.equal(otra.error?.code, 'over_sms_send_rate_limit');
    assert.match(textoErrorPedirCodigo(otra.error!, true), /^Espera (59|60) segundos para pedir otro código\.$/);
    assert.equal(sim.datos.cuentas.length, 0, 'pedir el código no crea la cuenta');
  });
  it('un código malo no entra', async () => {
    const { error } = await cliente.auth.verifyOtp({ phone: '+' + NUMERO, token: '000000', type: 'sms' });
    assert.equal(textoErrorVerificar(error!), 'El código no es correcto o ya venció.');
  });
  it('el código correcto crea la sesión y la cuenta (+569…)', async () => {
    const { data, error } = await cliente.auth.verifyOtp({ phone: '+' + NUMERO, token: CODIGO, type: 'sms' });
    assert.equal(error, null);
    uid = data.session!.user.id;
    assert.equal(sim.datos.cuentas[0].celular, '+' + NUMERO);
  });
});

describe('lecturas', () => {
  it('catálogos (también sin filtrar por persona) con el ajuste de 30 días y los 4 textos vigentes', async () => {
    const r = await leerCatalogos(cliente);
    assert.equal(r.error, null);
    c = mapearCatalogos(r.datos!);
    assert.equal(c.catalogos.comunas.length, 346);
    assert.equal(c.textos.length, 4);
    assert.equal(c.diasReconfirmar, 30);
    const negocios = sim.pedidos.find((p: { ruta: string }) => p.ruta === '/rest/v1/negocios');
    assert.match(negocios.query.select, /negocio_clases_licencia\(clase_licencia_id\),negocio_tamanos\(tamano_vehiculo_id\)/);
    const textos = sim.pedidos.find((p: { ruta: string }) => p.ruta === '/rest/v1/textos_autorizacion');
    assert.deepEqual([textos.query.vigente, textos.query.para_quien], ['eq.true', 'in.(conductor,todos)']);
  });
  it('el perfil propio: cada lectura filtrada por su id; recién entrado no hay conductor ni autorizaciones', async () => {
    const antes = sim.pedidos.length;
    const p = await perfil();
    const lecturas = sim.pedidos.slice(antes);
    assert.equal(lecturas.length, 7);
    for (const l of lecturas) assert.ok(Object.values(l.query).includes(`eq.${uid}`), `${l.ruta} filtra por el propio id`);
    assert.equal(p.cuenta.celular, '9000 0001');
    assert.equal(p.conductor.registrado, false);
    assert.equal(p.autorizacionesCompletas, false);
  });
});

describe('guardar cada pantalla', () => {
  it('A4: se aceptan las 4 (sin id; la fecha la pone el servidor) y repetir no duplica', async () => {
    assert.deepEqual(await ejecutarPlan(cliente, planAutorizaciones(uid, c.textos, [])), { ok: true, valor: undefined });
    const p = ultimos(1)[0];
    assert.deepEqual([p.method, p.ruta], ['POST', '/rest/v1/consentimientos']);
    for (const f of p.body) assert.deepEqual(Object.keys(f).sort(), ['cuenta_id', 'texto_autorizacion_id']);
    // Otra vez (como si la pantalla no supiera que ya estaban): el 23505 se ignora.
    assert.equal((await ejecutarPlan(cliente, planAutorizaciones(uid, c.textos, []))).ok, true);
    assert.equal(sim.datos.consentimientos.length, 4);
    assert.equal((await perfil()).autorizacionesCompletas, true);
  });
  it('Paso 1 con menos de 18 años: el mensaje de la base, tal cual', async () => {
    const hace17 = new Date(Date.now() - 17 * 365.25 * 24 * 3600 * 1000);
    const fecha = `${String(hace17.getDate()).padStart(2, '0')}/${String(hace17.getMonth() + 1).padStart(2, '0')}/${hace17.getFullYear()}`;
    const r = await ejecutarPlan(
      cliente,
      planPaso1(uid, { nombres: 'Ana', apellido1: 'Prueba', apellido2: '', fechaNacimiento: fecha, correo: 'a@b.cl', clasesDeclaradas: ['A2'], disponible: true }, { registrado: false, clasesDeclaradas: [] }, c.mapas, AHORA()),
    );
    assert.deepEqual(r, { ok: false, error: 'Tienes que tener 18 años o más.' });
    assert.equal(sim.datos.conductores.length, 0);
  });
  it('Paso 1: queda registrado, con la confirmación de "Disponible" del servidor y sus clases', async () => {
    const r = await ejecutarPlan(
      cliente,
      planPaso1(uid, { nombres: 'Ana María', apellido1: 'Prueba', apellido2: '', fechaNacimiento: '14/03/1990', correo: 'equipo.a@ejemplo.cl', clasesDeclaradas: ['A2', 'B'], disponible: true }, { registrado: false, clasesDeclaradas: [] }, c.mapas, '2000-01-01T00:00:00Z'),
    );
    assert.equal(r.ok, true);
    const d = sim.datos.conductores[0];
    assert.equal(d.estado_perfil, 'incompleto');
    assert.notEqual(d.disponibilidad_confirmada_en, '2000-01-01T00:00:00Z');
    const p = await perfil();
    assert.equal(p.conductor.registrado, true);
    assert.deepEqual(p.conductor.clasesDeclaradas.sort(), ['A2', 'B']);
    assert.equal(p.conductor.pasosListos.datos, true);
    assert.equal(p.cuenta.apellido2, '');
    const licencias = sim.pedidos.findLast((x: { ruta: string; method: string }) => x.ruta === '/rest/v1/conductor_licencias' && x.method === 'POST');
    assert.equal(licencias.query.on_conflict, 'conductor_id,clase_licencia_id,origen');
    assert.match(licencias.prefer, /resolution=ignore-duplicates/);
  });
  it('si se corta la red a mitad del Paso 1, se avisa; al reintentar queda bien y sin duplicados', async () => {
    sim.fallar((x: { method: string; ruta: string }) => x.method === 'POST' && x.ruta === '/rest/v1/conductor_licencias', 'red');
    const d = { nombres: 'Ana María', apellido1: 'Prueba', apellido2: 'Soto', fechaNacimiento: '14/03/1990', correo: 'equipo.a@ejemplo.cl', clasesDeclaradas: ['A2', 'A3'], disponible: true };
    const actual = { registrado: true, clasesDeclaradas: ['A2', 'B'] };
    const r = await ejecutarPlan(cliente, planPaso1(uid, d, actual, c.mapas, AHORA()));
    assert.deepEqual(r, { ok: false, error: 'No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.' });
    assert.equal((await ejecutarPlan(cliente, planPaso1(uid, d, actual, c.mapas, AHORA()))).ok, true);
    const p = await perfil();
    assert.deepEqual(p.conductor.clasesDeclaradas.sort(), ['A2', 'A3']);
    assert.equal(p.cuenta.apellido2, 'Soto');
    assert.equal(sim.datos.conductor_licencias.length, 2);
  });
  it('Paso 2: la comuna y el estacionamiento, con la dirección vacía', async () => {
    assert.equal((await ejecutarPlan(cliente, planPaso2(uid, { comunaId: '94', tieneEstacionamiento: true }))).ok, true);
    const patch = ultimos(1)[0];
    assert.deepEqual([patch.method, patch.ruta, patch.query.id, patch.query.select], ['PATCH', '/rest/v1/conductores', `eq.${uid}`, 'id']);
    assert.deepEqual(patch.body, { comuna_id: 94, tiene_estacionamiento: true, direccion: null, direccion_detalle: null, google_place_id: null });
    assert.equal((await perfil()).conductor.pasosListos.direccion, true);
  });
  it('Paso 3: años (cambiar con on_conflict, sin id) e idiomas', async () => {
    let p = await perfil();
    assert.equal(
      (await ejecutarPlan(cliente, planPaso3(uid, { experiencia: { '2': 5, '3': 2 }, idiomas: ['es'] }, { experiencia: p.conductor.experiencia, idiomas: p.conductor.idiomas }, c.mapas))).ok,
      true,
    );
    p = await perfil();
    assert.equal(
      (await ejecutarPlan(cliente, planPaso3(uid, { experiencia: { '2': 6 }, idiomas: ['es', 'en'] }, { experiencia: p.conductor.experiencia, idiomas: p.conductor.idiomas }, c.mapas))).ok,
      true,
    );
    p = await perfil();
    assert.deepEqual(p.conductor.experiencia, { '2': 6 });
    assert.deepEqual(p.conductor.idiomas.sort(), ['en', 'es']);
    const exp = sim.pedidos.filter((x: { ruta: string; method: string }) => x.ruta === '/rest/v1/experiencia_conductor' && x.method === 'POST');
    for (const e of exp) {
      assert.equal(e.query.on_conflict, 'conductor_id,tamano_vehiculo_id');
      assert.match(e.prefer, /resolution=merge-duplicates/);
      for (const f of e.body) assert.equal('id' in f, false);
    }
  });
  it('Paso 4: negocios, turno y días; un negocio apagado lo rechaza la base', async () => {
    let p = await perfil();
    const visibles = ['1', '3'];
    const actual = { negocios: p.conductor.negocios, turnos: p.conductor.turnos, dias: p.conductor.dias };
    assert.equal((await ejecutarPlan(cliente, planPaso4(uid, { negocios: ['1', '3'], turnos: ['dia'], dias: ['lu', 'ma'] }, actual, visibles, c.mapas))).ok, true);
    p = await perfil();
    assert.deepEqual(p.conductor.negocios.sort(), ['1', '3']);
    assert.deepEqual(p.conductor.pasosListos, { datos: true, direccion: true, experiencia: true, trabajo: true, documentos: false });
    // Taxi colectivo (2) está apagado: si se forzara, la base lo rechaza con su mensaje.
    const forzado = await ejecutarPlan(cliente, [{ tipo: 'agregar', tabla: 'conductor_negocios', filas: [{ conductor_id: uid, negocio_id: 2 }], conflicto: 'conductor_id,negocio_id', siExiste: 'ignorar' }]);
    assert.deepEqual(forzado, { ok: false, error: 'Ese negocio no está disponible.' });
  });
  it('quitar la única clase que habilita los taxis los quita del Paso 4 (la app vuelve a leer)', async () => {
    let p = await perfil();
    const d = { nombres: 'Ana María', apellido1: 'Prueba', apellido2: 'Soto', fechaNacimiento: '14/03/1990', correo: 'equipo.a@ejemplo.cl', clasesDeclaradas: ['B'], disponible: true };
    assert.equal((await ejecutarPlan(cliente, planPaso1(uid, d, { registrado: true, clasesDeclaradas: p.conductor.clasesDeclaradas }, c.mapas, AHORA()))).ok, true);
    p = await perfil();
    assert.deepEqual(p.conductor.negocios, []);
    assert.equal(p.conductor.pasosListos.trabajo, false);
    // Con solo B, un taxi lo rechaza la base.
    const r = await ejecutarPlan(cliente, planPaso4(uid, { negocios: ['1'], turnos: ['dia'], dias: ['lu'] }, { negocios: [], turnos: ['dia'], dias: ['lu', 'ma'] }, ['1', '3'], c.mapas));
    assert.deepEqual(r, { ok: false, error: 'Tu licencia no habilita para ese negocio.' });
  });
  it('Disponible: apagar y encender (la fecha la pone el servidor)', async () => {
    assert.equal((await ejecutarPlan(cliente, planDisponible(uid, false, AHORA()))).ok, true);
    assert.equal((await perfil()).conductor.disponible, false);
    assert.equal((await ejecutarPlan(cliente, planDisponible(uid, true, '1999-01-01T00:00:00Z'))).ok, true);
    const p = await perfil();
    assert.equal(p.conductor.disponible, true);
    assert.ok(Date.now() - new Date(p.conductor.disponibilidadConfirmadaEn!).getTime() < 60_000);
  });
  it('si el token venció, renueva la sesión una vez y guarda', async () => {
    sim.vencerTokens();
    const r = await ejecutarPlan(cliente, planDisponible(uid, false, AHORA()));
    assert.equal(r.ok, true);
    assert.ok(sim.pedidos.some((x: { ruta: string; query: Record<string, string> }) => x.ruta === '/auth/v1/token' && x.query.grant_type === 'refresh_token'));
  });
  it('nadie lee lo de otra persona: sin sesión, las tablas de personas no responden', async () => {
    const anonimo = createClient(URL_SB, 'sb_publishable_prueba', { auth: { persistSession: false }, global: { fetch: sim.fetch } });
    const r = await anonimo.from('cuentas').select('id').eq('id', uid).maybeSingle();
    assert.equal(r.error?.code, '42501');
  });
});

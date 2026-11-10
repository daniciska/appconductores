/// <reference types="node" />
// La sesión (src/datos/sesion.ts) con el supabase-js de verdad, guardando la sesión como en el navegador
// (un almacenamiento en memoria con la misma clave sb-<ref>-auth-token), y el Supabase simulado.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createClient } from '@supabase/supabase-js';

import { esErrorDeRed } from '../src/datos/errores.ts';
import { ejecutarPlan, planDisponible } from '../src/datos/escrituras.ts';
import { leerPerfil } from '../src/datos/lecturas.ts';
import { cerrarSesionEnEsteEquipo, leerConSesion, type AlmacenSesion, type SesionGuardada } from '../src/datos/sesion.ts';

import { crearSupabaseSimulado } from './simulador/supabaseSimulado.mjs';

const URL_SB = 'https://zflalaqimacsnlvurzeb.supabase.co';
const CLAVE = 'sb-zflalaqimacsnlvurzeb-auth-token';
const NUMERO = '56990000001';
const CODIGO = '123456';

function nuevo() {
  const sim = crearSupabaseSimulado({ numerosDePrueba: { [NUMERO]: CODIGO } });
  const memoria = new Map<string, string>();
  const navegador = {
    getItem: (k: string) => memoria.get(k) ?? null,
    setItem: (k: string, v: string) => void memoria.set(k, v),
    removeItem: (k: string) => void memoria.delete(k),
  };
  const cliente = createClient(URL_SB, 'sb_publishable_prueba', {
    auth: { storage: navegador, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: sim.fetch },
  });
  const eventos: string[] = [];
  cliente.auth.onAuthStateChange((e) => void eventos.push(e));
  const almacen: AlmacenSesion = {
    leer: async () => (memoria.has(CLAVE) ? (JSON.parse(memoria.get(CLAVE)!) as SesionGuardada) : null),
    borrar: async () => {
      const habia = memoria.has(CLAVE);
      for (const k of [CLAVE, `${CLAVE}-user`, `${CLAVE}-code-verifier`]) memoria.delete(k);
      return habia;
    },
  };
  return { sim, cliente, memoria, eventos, almacen };
}

async function entrar(cliente: ReturnType<typeof nuevo>['cliente']) {
  await cliente.auth.signInWithOtp({ phone: '+' + NUMERO });
  const { data } = await cliente.auth.verifyOtp({ phone: '+' + NUMERO, token: CODIGO, type: 'sms' });
  return data.session!.user.id;
}

/** Deja la sesión guardada como si su token hubiera vencido hace un minuto. */
function vencerEnElEquipo(memoria: Map<string, string>) {
  const s = JSON.parse(memoria.get(CLAVE)!);
  s.expires_at = Math.floor(Date.now() / 1000) - 60;
  memoria.set(CLAVE, JSON.stringify(s));
}

describe('cerrar sesión en este equipo', () => {
  it('con conexión: la sesión se borra y el servidor la anula (scope local, con el token de la sesión)', async () => {
    const { cliente, memoria, almacen, sim, eventos } = nuevo();
    await entrar(cliente);
    const token = JSON.parse(memoria.get(CLAVE)!).access_token;
    const { avisoAlServidor } = await cerrarSesionEnEsteEquipo(cliente, almacen);
    assert.equal(memoria.has(CLAVE), false);
    assert.equal(eventos.at(-1), 'SIGNED_OUT');
    assert.equal(await avisoAlServidor, true);
    const logout = sim.pedidos.find((p: { ruta: string }) => p.ruta === '/auth/v1/logout');
    assert.equal(logout.query.scope, 'local');
    assert.equal((await cliente.auth.getSession()).data.session, null);
    assert.ok(token);
  });
  it('sin conexión y con el token vigente: la sesión se borra igual, al instante', async () => {
    const { cliente, memoria, almacen, sim, eventos } = nuevo();
    await entrar(cliente);
    sim.sinConexion(true);
    const t0 = Date.now();
    const { avisoAlServidor } = await cerrarSesionEnEsteEquipo(cliente, almacen);
    assert.ok(Date.now() - t0 < 1000, 'no espera a la red');
    assert.equal(memoria.has(CLAVE), false);
    assert.equal(eventos.filter((e) => e === 'SIGNED_OUT').length, 1, 'avisa una sola vez');
    assert.equal(await avisoAlServidor, false);
  });
  it('sin conexión y con el token vencido (supabase-js solo no la borraba): se borra al instante y avisa SIGNED_OUT', async () => {
    const { cliente, memoria, almacen, sim, eventos } = nuevo();
    await entrar(cliente);
    vencerEnElEquipo(memoria);
    sim.sinConexion(true);
    const t0 = Date.now();
    const { avisoAlServidor } = await cerrarSesionEnEsteEquipo(cliente, almacen);
    assert.ok(Date.now() - t0 < 1000, 'no espera a renovar el token');
    assert.equal(memoria.has(CLAVE), false);
    assert.equal(eventos.at(-1), 'SIGNED_OUT');
    assert.equal(await avisoAlServidor, false, 'con el token vencido no se avisa al servidor');
    assert.equal(sim.pedidos.filter((p: { ruta: string }) => p.ruta === '/auth/v1/token').length, 0);
    // Al volver la red, no hay sesión que vuelva sola.
    sim.sinConexion(false);
    assert.equal((await cliente.auth.getSession()).data.session, null);
  });
});

describe('la base rechaza el token (PGRST301) al leer', () => {
  it('se renueva la sesión una vez y se vuelve a leer', async () => {
    const { cliente, sim } = nuevo();
    const uid = await entrar(cliente);
    sim.vencerTokens();
    const r = await leerConSesion(cliente, () => leerPerfil(cliente, uid));
    assert.equal(r.error, null);
    assert.equal(r.datos?.cuenta?.id, uid);
    assert.equal(sim.pedidos.filter((p: { ruta: string }) => p.ruta === '/auth/v1/token').length, 1);
  });
  it('si no se puede renovar, avisa que venció (y quien llama cierra la sesión)', async () => {
    const { cliente, sim } = nuevo();
    const uid = await entrar(cliente);
    sim.anularSesiones();
    const r = await leerConSesion(cliente, () => leerPerfil(cliente, uid));
    assert.equal(r.vencida, true);
  });
  it('sin red para renovar, es un error de conexión (no se cierra la sesión)', async () => {
    // supabase-js reintenta la renovación sin red unos 25 s: aquí, un cliente que responde como él al final.
    const sinRed = { auth: { refreshSession: async () => ({ data: { session: null, user: null }, error: { name: 'AuthRetryableFetchError', message: 'Failed to fetch', status: 0 } }) } };
    let lecturas = 0;
    const r = await leerConSesion(sinRed as never, async () => {
      lecturas += 1;
      return { datos: null, error: { code: 'PGRST301', message: 'JWT expired', status: 401 } };
    });
    assert.equal(r.vencida, undefined);
    assert.ok(esErrorDeRed(r.error));
    assert.equal(lecturas, 1);
  });
  it('al guardar pasa lo mismo: sin renovar, `vencida`', async () => {
    const { cliente, sim } = nuevo();
    const uid = await entrar(cliente);
    sim.anularSesiones();
    const r = await ejecutarPlan(cliente, planDisponible(uid, false, new Date().toISOString()));
    assert.deepEqual(r, { ok: false, error: 'Tu sesión venció. Vuelve a entrar.', vencida: true });
  });
});

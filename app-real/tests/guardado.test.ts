/// <reference types="node" />
// Guardar con el perfil al día (src/datos/guardado.ts) con el supabase-js de verdad y el Supabase
// simulado. Los casos de la revisión: un guardado que falla a mitad de camino deja parte hecha en la
// base; el siguiente intento tiene que armar su plan sobre lo que de verdad quedó, no sobre lo de antes.
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { mapearCatalogos, type CatalogosLeidos } from '../src/datos/catalogos.ts';
import { ejecutarPlan, planAutorizaciones, planPaso1, planPaso4, type Plan, type ResultadoPlan } from '../src/datos/escrituras.ts';
import { guardarAlDia, type DependenciasGuardado } from '../src/datos/guardado.ts';
import { leerCatalogos, leerPerfil } from '../src/datos/lecturas.ts';
import { mapearPerfil, type PerfilLeido } from '../src/datos/perfil.ts';
import type { DatosPaso1 } from '../../aplicacion/src/datos/puerto/tipos.ts';

import { crearSupabaseSimulado } from './simulador/supabaseSimulado.mjs';

const URL_SB = 'https://zflalaqimacsnlvurzeb.supabase.co';
const NUMERO = '56990000001';
const CODIGO = '123456';
const AHORA = () => new Date().toISOString();
const OK = { ok: true, valor: undefined } as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sim: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cliente: SupabaseClient<any>;
let c: CatalogosLeidos;
let uid = '';

/** Lo mismo que hace la app real (puertoReal.tsx): el perfil en memoria y si está al día. */
const app = { perfil: null as PerfilLeido | null, alDia: true };
const deps: DependenciasGuardado = {
  alDia: () => app.alDia,
  marcarDesactualizado: () => {
    app.alDia = false;
  },
  releer: async (): Promise<ResultadoPlan> => {
    const r = await leerPerfil(cliente, uid);
    if (r.error) return { ok: false, error: 'No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.' };
    app.perfil = mapearPerfil(r.datos, c.mapas, c.textos);
    app.alDia = true;
    return OK;
  },
  ejecutar: (plan: Plan) => ejecutarPlan(cliente, plan),
};
const guardar = (armar: (p: PerfilLeido) => Plan) => guardarAlDia(deps, () => armar(app.perfil!));
const enLaBase = (tabla: string, col: string) => sim.datos[tabla].filter((f: Record<string, unknown>) => f.conductor_id === uid).map((f: Record<string, unknown>) => String(f[col])).sort();

/** Una respuesta de error que supabase-js no reintenta (las lecturas sin red las reintenta 3 veces). */
const ERROR_500 = { status: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: 'XX000', message: 'error' }) };

const datos1 = (clases: string[]): DatosPaso1 => ({
  nombres: 'Ana',
  apellido1: 'Prueba',
  apellido2: '',
  fechaNacimiento: '14/03/1990',
  correo: 'a@b.cl',
  clasesDeclaradas: clases,
  disponible: true,
});
const paso1 = (clases: string[]) => guardar((p) => planPaso1(uid, datos1(clases), { registrado: p.conductor.registrado, clasesDeclaradas: p.conductor.clasesDeclaradas }, c.mapas, AHORA()));
const paso4 = (negocios: string[], turnos: ('dia' | 'noche')[], dias: ('lu' | 'ma' | 'mi')[]) =>
  guardar((p) => planPaso4(uid, { negocios, turnos, dias }, { negocios: p.conductor.negocios, turnos: p.conductor.turnos, dias: p.conductor.dias }, ['1', '3'], c.mapas));

before(async () => {
  sim = crearSupabaseSimulado({ numerosDePrueba: { [NUMERO]: CODIGO } });
  cliente = createClient(URL_SB, 'sb_publishable_prueba', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: sim.fetch },
  });
  await cliente.auth.signInWithOtp({ phone: '+' + NUMERO });
  const { data } = await cliente.auth.verifyOtp({ phone: '+' + NUMERO, token: CODIGO, type: 'sms' });
  uid = data.session!.user.id;
  const cat = await leerCatalogos(cliente);
  c = mapearCatalogos(cat.datos!);
  assert.deepEqual(await deps.releer(), OK);
  assert.equal((await guardar((p) => planAutorizaciones(uid, c.textos, p.aceptados))).ok, true);
  assert.equal((await paso1(['A2', 'B'])).ok, true);
  assert.deepEqual(await paso4(['1', '3'], ['dia'], ['lu']), OK);
  assert.deepEqual(enLaBase('conductor_negocios', 'negocio_id'), ['1', '3']);
});

describe('guardar con el perfil al día', () => {
  it('Paso 4: falla a medias (ya borró Taxi ejecutivo); al marcarlo de nuevo y guardar, queda guardado', async () => {
    // Intento 1: desmarca Taxi ejecutivo y cambia el turno; la red se corta en la 2.ª llamada.
    sim.fallar((x: { method: string; ruta: string }) => x.method === 'POST' && x.ruta === '/rest/v1/conductor_opciones', 'red');
    const r1 = await paso4(['1'], ['noche'], ['lu']);
    assert.deepEqual(r1, { ok: false, error: 'No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.' });
    assert.deepEqual(enLaBase('conductor_negocios', 'negocio_id'), ['1'], 'el borrado del negocio 3 alcanzó a llegar');
    assert.equal(app.alDia, false);
    // Intento 2: la persona vuelve a marcar Taxi ejecutivo. Se relee antes de armar el plan.
    const antes = sim.pedidos.length;
    assert.deepEqual(await paso4(['1', '3'], ['noche'], ['lu']), OK);
    assert.deepEqual(enLaBase('conductor_negocios', 'negocio_id'), ['1', '3']);
    assert.deepEqual(app.perfil!.conductor.negocios.sort(), ['1', '3']);
    assert.deepEqual(app.perfil!.conductor.turnos, ['noche']);
    const primero = sim.pedidos[antes];
    assert.deepEqual([primero.method, primero.ruta], ['GET', '/rest/v1/cuentas'], 'primero lee el perfil');
  });
  it('Paso 1: el borrado de una clase llega a la base pero se pierde la respuesta; al marcarla de nuevo, queda', async () => {
    sim.fallar((x: { method: string; ruta: string }) => x.method === 'DELETE' && x.ruta === '/rest/v1/conductor_licencias', 'red-despues');
    const r1 = await paso1(['B']);
    assert.equal(r1.ok, false);
    assert.deepEqual(enLaBase('conductor_licencias', 'clase_licencia_id').length, 1, 'la base quitó A2');
    // La base, al quitar A2, quitó los taxis (su regla). Eso no se deshace solo: la persona lo ve en Inicio.
    assert.deepEqual(enLaBase('conductor_negocios', 'negocio_id'), []);
    assert.deepEqual(await paso1(['A2', 'B']), OK);
    assert.deepEqual(app.perfil!.conductor.clasesDeclaradas.sort(), ['A2', 'B']);
    assert.equal(enLaBase('conductor_licencias', 'clase_licencia_id').length, 2);
    assert.equal(app.perfil!.conductor.pasosListos.trabajo, false);
  });
  it('si el plan sale bien pero no se puede releer, dice que se guardó; el siguiente intento lee primero', async () => {
    sim.fallar((x: { method: string; ruta: string }) => x.method === 'GET' && x.ruta === '/rest/v1/conductores', ERROR_500);
    const r = await paso4(['1'], ['dia'], ['lu', 'ma']);
    assert.deepEqual(r, { ok: false, error: 'Se guardó, pero se cortó la conexión. Inténtalo de nuevo.' });
    assert.deepEqual(enLaBase('conductor_negocios', 'negocio_id'), ['1']);
    assert.equal(app.alDia, false);
    const antes = sim.pedidos.length;
    assert.deepEqual(await paso4(['1'], ['dia'], ['lu', 'ma']), OK);
    const escrituras = sim.pedidos.slice(antes).filter((x: { method: string }) => x.method !== 'GET');
    assert.equal(escrituras.length, 0, 'ya estaba guardado: no escribe nada otra vez');
    assert.deepEqual(app.perfil!.conductor.dias.sort(), ['lu', 'ma']);
  });
  it('si releer antes de armar el plan falla, no escribe nada', async () => {
    app.alDia = false;
    sim.fallar((x: { method: string; ruta: string }) => x.method === 'GET' && x.ruta === '/rest/v1/cuentas', ERROR_500);
    const antes = sim.pedidos.length;
    const r = await paso4(['1', '3'], ['dia'], ['lu']);
    assert.equal(r.ok, false);
    assert.equal(sim.pedidos.slice(antes).filter((x: { method: string }) => x.method !== 'GET').length, 0);
    assert.deepEqual(enLaBase('conductor_negocios', 'negocio_id'), ['1']);
  });
});

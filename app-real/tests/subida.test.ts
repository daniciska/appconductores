/// <reference types="node" />
// Subir documentos con el supabase-js de verdad contra el Supabase SIMULADO (Storage incluido):
// la forma de cada pedido, el método de validación (hoy aprueba todo), el perfil completo, reemplazar,
// la limpieza de archivos, cortes de red y que nadie suba ni lea lo de otra persona.
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { mapearCatalogos, type CatalogosLeidos } from '../src/datos/catalogos.ts';
import { hoyEnChile, sumarDias, sumarMeses } from '../src/datos/documentos.ts';
import { ejecutarPlan, planAutorizaciones, planPaso1, planPaso2, planPaso4 } from '../src/datos/escrituras.ts';
import { leerCatalogos, leerPerfil } from '../src/datos/lecturas.ts';
import { mapearPerfil, type PerfilLeido } from '../src/datos/perfil.ts';
import { TEXTO_SUBIDA, limpiarArchivosSobrantes, nuevoUuid, subirDocumento, textoErrorStorage, type PedidoSubida } from '../src/datos/subida.ts';

import { crearSupabaseSimulado } from './simulador/supabaseSimulado.mjs';

const URL_SB = 'https://zflalaqimacsnlvurzeb.supabase.co';
const HOY = hoyEnChile();
const AHORA = () => new Date().toISOString();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cliente = SupabaseClient<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sim: any;
let c: CatalogosLeidos;

function nuevoCliente(): Cliente {
  return createClient(URL_SB, 'sb_publishable_prueba', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: sim.fetch },
  });
}

async function entrar(numero: string): Promise<{ cliente: Cliente; uid: string }> {
  const cliente = nuevoCliente();
  sim.olvidarEsperas();
  await cliente.auth.signInWithOtp({ phone: '+' + numero, options: { channel: 'whatsapp' } });
  const { data } = await cliente.auth.verifyOtp({ phone: '+' + numero, token: '123456', type: 'sms' });
  return { cliente, uid: data.session!.user.id };
}

async function perfil(cliente: Cliente, uid: string): Promise<PerfilLeido> {
  const r = await leerPerfil(cliente, uid);
  assert.equal(r.error, null);
  return mapearPerfil(r.datos!, c.mapas, c.textos, '', { tipos: c.tiposDocumento, meses: c.mesesAvisoDocumentos });
}

/** Pasos 1, 2 y 4 (y, si se pide, las autorizaciones de "Antes de empezar"). */
async function registrar(cliente: Cliente, uid: string, { aceptar = true } = {}) {
  const ok = async (plan: Parameters<typeof ejecutarPlan>[1]) => assert.deepEqual(await ejecutarPlan(cliente, plan), { ok: true, valor: undefined });
  if (aceptar) await ok(planAutorizaciones(uid, c.textos.filter((t) => t.obligatoria), []));
  await ok(
    planPaso1(
      uid,
      { nombres: 'Ana', apellido1: 'Prueba', apellido2: '', fechaNacimiento: '14/03/1990', correo: 'ana@correo.cl', clasesDeclaradas: ['A2'], disponible: true },
      { registrado: false, clasesDeclaradas: [] },
      c.mapas,
      AHORA(),
    ),
  );
  await ok(planPaso2(uid, { comunaId: '94', tieneEstacionamiento: true }));
  const negocio = c.catalogos.negocios.find((n) => n.nombre === 'Taxi')!.id;
  await ok(planPaso4(uid, { negocios: [negocio], turnos: ['dia'], dias: ['lu'] }, { negocios: [], turnos: [], dias: [] }, [negocio], c.mapas));
}

const tipoId = (clave: string) => c.tiposDocumento.find((t) => t.clave === clave)!.id;
const foto = (bytes = 2048, tipo = 'image/jpeg') => new Blob([new Uint8Array(bytes)], { type: tipo });
const pdf = () => new Blob([new TextEncoder().encode('%PDF-1.4 prueba')], { type: 'application/pdf' });

function pedido(uid: string, clave: string, cambios: Partial<PedidoSubida> = {}): PedidoSubida {
  const esPdf = clave === 'hoja_vida' || clave === 'antecedentes';
  return {
    uid,
    tipoId: tipoId(clave),
    archivo: esPdf ? pdf() : foto(),
    mime: esPdf ? 'application/pdf' : 'image/jpeg',
    uuid: nuevoUuid(),
    emitidoEn: esPdf ? sumarDias(HOY, -2) : null,
    venceEn: esPdf ? null : sumarMeses(HOY, 48),
    ...cambios,
  };
}

before(async () => {
  sim = crearSupabaseSimulado({ numerosDePrueba: { '56990000001': '123456', '56990000002': '123456', '56990000003': '123456' } });
  const r = await leerCatalogos(nuevoCliente());
  assert.equal(r.error, null);
  c = mapearCatalogos(r.datos!);
});

describe('subir los 4 documentos', () => {
  let cliente: Cliente;
  let uid = '';
  before(async () => {
    ({ cliente, uid } = await entrar('56990000001'));
    await registrar(cliente, uid);
  });

  it('catálogo y ajuste leídos de la base: 4 tipos y aviso a 3 meses', () => {
    assert.equal(c.tiposDocumento.length, 4);
    assert.equal(c.mesesAvisoDocumentos, 3);
    const ajustes = sim.pedidos.find((p: { ruta: string }) => p.ruta === '/rest/v1/ajustes');
    assert.equal(ajustes.query.id, 'in.(dias_reconfirmar_disponibilidad,meses_aviso_vencimiento_documentos)');
  });

  it('la cédula: el archivo va a su carpeta con su tipo, sin pisar nada; la fila sin estado; queda aprobada', async () => {
    const antes = sim.pedidos.length;
    const p = pedido(uid, 'cedula');
    const r = await subirDocumento(cliente, p);
    assert.equal(r.ok, true);
    const [subida, insercion] = sim.pedidos.slice(antes);
    assert.equal(subida.method, 'POST');
    assert.equal(subida.ruta, `/storage/v1/object/documentos/${uid}/${p.uuid}.jpg`);
    assert.equal(subida.tipo, 'image/jpeg');
    assert.equal(subida.bytes, 2048);
    assert.deepEqual([insercion.method, insercion.ruta], ['POST', '/rest/v1/documentos']);
    assert.deepEqual(Object.keys(insercion.body).sort(), ['archivo_bytes', 'archivo_ruta', 'archivo_tipo', 'cuenta_id', 'emitido_en', 'tipo_documento_id', 'vence_en']);
    assert.equal(insercion.body.vence_en, sumarMeses(HOY, 48));
    const pf = await perfil(cliente, uid);
    assert.equal(pf.documentos[0].estado, 'aprobado');
    assert.equal(sim.revisiones.at(-1).metodo, 'aprobacion_automatica_provisoria');
    assert.equal(pf.conductor.pasosListos.documentos, false);
    assert.equal(pf.conductor.estadoPerfil, 'incompleto');
  });

  it('con los 4 aprobados: Paso 5 listo y la base deja el perfil completo y verificado', async () => {
    for (const clave of ['licencia', 'hoja_vida', 'antecedentes']) assert.equal((await subirDocumento(cliente, pedido(uid, clave))).ok, true);
    const pf = await perfil(cliente, uid);
    assert.equal(pf.conductor.pasosListos.documentos, true);
    assert.deepEqual([pf.conductor.estadoPerfil, pf.conductor.estadoVerificacion], ['completo', 'verificado']);
    assert.equal(sim.archivos.filter((a: { owner_id: string }) => a.owner_id === uid).length, 4);
  });

  it('reemplazar la licencia: la anterior queda reemplazada y su archivo se borra al limpiar', async () => {
    const vieja = sim.datos.documentos.find((d: { tipo_documento_id: number; estado: string }) => d.tipo_documento_id === tipoId('licencia') && d.estado === 'aprobado');
    assert.equal((await subirDocumento(cliente, pedido(uid, 'licencia', { venceEn: sumarMeses(HOY, 60) }))).ok, true);
    assert.equal(sim.datos.documentos.find((d: { id: number }) => d.id === vieja.id).estado, 'reemplazado');
    const pf = await perfil(cliente, uid);
    assert.equal(pf.documentos.length, 4, 'la lectura no trae los reemplazados');
    const borrados = await limpiarArchivosSobrantes(cliente, uid, pf.documentos);
    assert.equal(borrados, 1);
    assert.ok(!sim.archivos.some((a: { name: string }) => a.name === vieja.archivo_ruta));
    assert.equal(pf.conductor.estadoPerfil, 'completo');
    // Limpiar otra vez no borra nada (los vigentes no se pueden borrar).
    assert.equal(await limpiarArchivosSobrantes(cliente, uid, pf.documentos), 0);
  });

  it('las reglas de la base llegan como textos cortos', async () => {
    const intentos: [Partial<PedidoSubida>, string, string][] = [
      [{ venceEn: sumarDias(HOY, -1) }, 'cedula', 'Ese documento ya venció. Sube uno vigente.'],
      [{ emitidoEn: sumarDias(HOY, -31) }, 'hoja_vida', 'Debe tener 30 días o menos. Saca uno nuevo.'],
      [{ archivo: pdf(), mime: 'application/pdf' }, 'cedula', 'Sube una foto (JPG o PNG).'],
    ];
    for (const [cambios, clave, texto] of intentos) {
      const r = await subirDocumento(cliente, pedido(uid, clave, cambios));
      assert.deepEqual(r, { ok: false, error: texto });
    }
    // Lo que no quedó como documento se borra de Storage al momento.
    await new Promise((r) => setTimeout(r, 20));
    const pf = await perfil(cliente, uid);
    const usados = new Set(pf.documentos.map((d) => d.ruta));
    assert.deepEqual(sim.archivos.filter((a: { owner_id: string; name: string }) => a.owner_id === uid && !usados.has(a.name)), []);
  });

  it('Storage rechaza lo que no es foto ni PDF y lo de más de 10 MB', async () => {
    // La app no deja elegir un GIF (errorArchivo); si llegara, Storage lo rechaza.
    const gif = await cliente.storage.from('documentos').upload(`${uid}/${nuevoUuid()}.jpg`, new Uint8Array(10).buffer, { contentType: 'image/gif' });
    assert.equal(textoErrorStorage(gif.error), TEXTO_SUBIDA.formato);
    assert.deepEqual(await subirDocumento(cliente, pedido(uid, 'cedula', { archivo: foto(10 * 1024 * 1024 + 10) })), { ok: false, error: TEXTO_SUBIDA.pesado });
  });

  it('sin red al subir: se avisa y no queda nada', async () => {
    const antes = sim.archivos.length;
    sim.fallar((p: { ruta: string }) => p.ruta.startsWith('/storage/v1/object/documentos/'), 'red');
    assert.deepEqual(await subirDocumento(cliente, pedido(uid, 'cedula')), { ok: false, error: TEXTO_SUBIDA.conexion });
    assert.equal(sim.archivos.length, antes);
  });

  it('se corta la red al guardar la fila: el archivo se borra; si la fila sí quedó, se da por subido', async () => {
    const antes = sim.archivos.length;
    sim.fallar((p: { method: string; ruta: string }) => p.method === 'POST' && p.ruta === '/rest/v1/documentos', 'red');
    const r = await subirDocumento(cliente, pedido(uid, 'cedula'));
    assert.equal(r.ok, false);
    await new Promise((x) => setTimeout(x, 20));
    assert.equal(sim.archivos.length, antes, 'sin fila, el archivo se borró');

    const docs = sim.datos.documentos.length;
    sim.fallar((p: { method: string; ruta: string }) => p.method === 'POST' && p.ruta === '/rest/v1/documentos', 'red-despues');
    const r2 = await subirDocumento(cliente, pedido(uid, 'cedula', { venceEn: sumarMeses(HOY, 70) }));
    await new Promise((x) => setTimeout(x, 20));
    const nuevo = sim.datos.documentos.at(-1);
    // La fila quedó y solo se perdió la respuesta: se pregunta y no se pide subirlo de nuevo.
    assert.deepEqual(r2, { ok: true, valor: { id: nuevo.id, ruta: nuevo.archivo_ruta } });
    assert.equal(sim.datos.documentos.length, docs + 1);
    assert.ok(sim.archivos.some((a: { name: string }) => a.name === nuevo.archivo_ruta), 'el archivo del documento guardado sigue');
    assert.equal(nuevo.estado, 'aprobado');
  });

  it('si el token venció, se renueva una vez y se sube', async () => {
    sim.vencerTokens();
    const r = await subirDocumento(cliente, pedido(uid, 'antecedentes'));
    assert.equal(r.ok, true);
  });
});

describe('otro método de validación, sin cambiar la app', () => {
  it('con "equipo" el documento queda en revisión; al aprobarlo, el perfil se completa', async () => {
    const { cliente, uid } = await entrar('56990000002');
    await registrar(cliente, uid);
    sim.metodoValidacion('equipo');
    try {
      for (const clave of ['cedula', 'licencia', 'hoja_vida', 'antecedentes']) assert.equal((await subirDocumento(cliente, pedido(uid, clave))).ok, true);
      let pf = await perfil(cliente, uid);
      assert.deepEqual(pf.documentos.map((d) => d.estado), ['en_revision', 'en_revision', 'en_revision', 'en_revision']);
      assert.deepEqual([pf.conductor.estadoPerfil, pf.conductor.estadoVerificacion], ['incompleto', 'en_revision']);
      for (const d of sim.datos.documentos.filter((x: { cuenta_id: string }) => x.cuenta_id === uid)) sim.decidirDocumento(d.id, 'aprobado');
      pf = await perfil(cliente, uid);
      assert.deepEqual([pf.conductor.estadoPerfil, pf.conductor.pasosListos.documentos], ['completo', true]);
    } finally {
      sim.metodoValidacion('aprobar_todo');
    }
  });
});

describe('cada uno solo lo suyo', () => {
  it('sin "Revisión de mis documentos" no se sube; nadie sube a la carpeta de otro ni lee sus documentos', async () => {
    const { cliente, uid } = await entrar('56990000003');
    await registrar(cliente, uid, { aceptar: false });
    assert.deepEqual(await subirDocumento(cliente, pedido(uid, 'cedula')), { ok: false, error: 'Primero acepta la revisión de tus documentos.' });

    // Sin ningún texto vigente de la revisión, la base no recibe documentos (ni de quien no aceptó nada).
    const texto = sim.catalogos.textos_autorizacion.find((t: { clave: string; vigente: boolean }) => t.clave === 'revision_documentos' && t.vigente);
    texto.vigente = false;
    try {
      assert.deepEqual(await subirDocumento(cliente, pedido(uid, 'cedula')), {
        ok: false,
        error: 'Por ahora no podemos recibir documentos. Inténtalo más tarde.',
      });
    } finally {
      texto.vigente = true;
    }

    const otro = sim.datos.documentos[0];
    const r = await subirDocumento(cliente, { ...pedido(uid, 'cedula'), uid: otro.cuenta_id });
    assert.deepEqual(r, { ok: false, error: 'No tienes permiso para hacer esto.' });
    const lectura = await cliente.from('documentos').select('id').eq('cuenta_id', otro.cuenta_id);
    assert.deepEqual(lectura.data, []);
    const lista = await cliente.storage.from('documentos').list(otro.cuenta_id);
    assert.deepEqual(lista.data, []);
    const borrar = await cliente.storage.from('documentos').remove([otro.archivo_ruta]);
    assert.deepEqual(borrar.data, []);
    assert.ok(sim.archivos.some((a: { name: string }) => a.name === otro.archivo_ruta));
    const cambiar = await cliente.from('documentos').update({ estado: 'aprobado' }).eq('id', otro.id);
    assert.equal(cambiar.error?.code, '42501');
  });
  it('textos de error de Storage', () => {
    assert.equal(textoErrorStorage({ name: 'StorageUnknownError', message: 'fetch failed' }), TEXTO_SUBIDA.conexion);
    assert.equal(textoErrorStorage({ statusCode: '413', message: 'The object exceeded the maximum allowed size' }), TEXTO_SUBIDA.pesado);
    assert.equal(textoErrorStorage({ statusCode: '415', message: 'mime type image/gif is not supported' }), TEXTO_SUBIDA.formato);
    assert.equal(textoErrorStorage({ statusCode: '500', message: 'internal' }), TEXTO_SUBIDA.subir);
  });
});

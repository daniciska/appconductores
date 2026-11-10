/// <reference types="node" />
// Plan de escritura de cada pantalla (src/datos/escrituras.ts): qué se escribe, en qué orden y con qué.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  planAutorizaciones,
  planDisponible,
  planPaso1,
  planPaso2,
  planPaso3,
  planPaso4,
  type Operacion,
} from '../src/datos/escrituras.ts';

import { catalogosLeidos } from './base.ts';

const UID = 'aaaaaaaa-1111-4000-8000-00000000000a';
const AHORA = '2026-11-09T21:00:00.000Z';
const { mapas, textos } = catalogosLeidos();
const datos1 = { nombres: ' Ana ', apellido1: 'Prueba ', apellido2: '  ', fechaNacimiento: '14/03/1990', correo: ' a@b.cl ', clasesDeclaradas: ['A2', 'B'], disponible: true };
const tablas = (p: Operacion[]) => p.map((o) => `${o.tipo}:${'tabla' in o ? o.tabla : 'conductores'}`);
/** Todas las filas que se insertan en un plan. */
const filas = (p: Operacion[]) => p.flatMap((o) => (o.tipo === 'agregar' || o.tipo === 'insertar' ? o.filas : o.tipo === 'crear_conductor' ? [o.valores] : []));

describe('Paso 1', () => {
  it('primera vez: cuenta → crear conductor (con la fecha de confirmación) → clases', () => {
    const p = planPaso1(UID, datos1, { registrado: false, clasesDeclaradas: [] }, mapas, AHORA);
    assert.deepEqual(tablas(p), ['actualizar:cuentas', 'crear_conductor:conductores', 'agregar:conductor_licencias']);
    assert.deepEqual(p[0].tipo === 'actualizar' && p[0].valores, { email: 'a@b.cl', nombres: 'Ana', primer_apellido: 'Prueba', segundo_apellido: null });
    assert.ok(p[1].tipo === 'crear_conductor');
    assert.deepEqual(p[1].valores, { id: UID, fecha_nacimiento: '1990-03-14', disponible: true, disponibilidad_confirmada_en: AHORA });
    assert.deepEqual(p[1].siExiste, { fecha_nacimiento: '1990-03-14', disponible: true }, 'si quedó de un intento a medias, se actualiza sin la fecha de confirmación');
    const op = p[2];
    assert.ok(op.tipo === 'agregar');
    assert.equal(op.conflicto, 'conductor_id,clase_licencia_id,origen');
    assert.equal(op.siExiste, 'ignorar');
    assert.deepEqual(op.filas, [
      { conductor_id: UID, clase_licencia_id: mapas.claseIdPorCodigo.A2, origen: 'declarada' },
      { conductor_id: UID, clase_licencia_id: mapas.claseIdPorCodigo.B, origen: 'declarada' },
    ]);
  });
  it('editando: update simple del conductor, SIN disponibilidad_confirmada_en', () => {
    const p = planPaso1(UID, datos1, { registrado: true, clasesDeclaradas: ['A2', 'B'] }, mapas, AHORA);
    assert.deepEqual(tablas(p), ['actualizar:cuentas', 'actualizar:conductores']);
    assert.ok(p[1].tipo === 'actualizar');
    assert.equal('disponibilidad_confirmada_en' in p[1].valores, false);
  });
  it('cambiar clases: primero se agregan las nuevas y después se quitan las desmarcadas', () => {
    const p = planPaso1(UID, { ...datos1, clasesDeclaradas: ['A3'] }, { registrado: true, clasesDeclaradas: ['A2', 'B'] }, mapas, AHORA);
    assert.deepEqual(tablas(p), ['actualizar:cuentas', 'actualizar:conductores', 'agregar:conductor_licencias', 'quitar:conductor_licencias']);
    const quitar = p[3];
    assert.ok(quitar.tipo === 'quitar');
    assert.deepEqual(quitar.donde, { conductor_id: UID, origen: 'declarada' }, 'solo las declaradas propias (nunca las revisadas)');
    assert.deepEqual(quitar.valores, [mapas.claseIdPorCodigo.A2, mapas.claseIdPorCodigo.B]);
  });
  it('el segundo apellido vacío se guarda como null', () => {
    const p = planPaso1(UID, { ...datos1, apellido2: 'Soto' }, { registrado: true, clasesDeclaradas: ['A2', 'B'] }, mapas, AHORA);
    assert.ok(p[0].tipo === 'actualizar');
    assert.equal(p[0].valores.segundo_apellido, 'Soto');
  });
});

describe('Paso 2 temporal (comuna de la lista)', () => {
  it('guarda la comuna y el estacionamiento y deja la dirección vacía', () => {
    const p = planPaso2(UID, { comunaId: '94', tieneEstacionamiento: false });
    assert.deepEqual(p, [
      {
        tipo: 'actualizar',
        tabla: 'conductores',
        id: UID,
        valores: { comuna_id: 94, tiene_estacionamiento: false, direccion: null, direccion_detalle: null, google_place_id: null },
        sinFila: 'No encontramos tu cuenta. Vuelve a entrar.',
      },
    ]);
  });
});

describe('Paso 3', () => {
  it('años: agregar o cambiar (por conductor y tipo) y quitar los desmarcados; idiomas solo de su lista', () => {
    const p = planPaso3(
      UID,
      { experiencia: { '2': 6, '3': 0, '4': 80 }, idiomas: ['es', 'en'] },
      { experiencia: { '2': 5, '3': 2 }, idiomas: ['es', 'pt'] },
      mapas,
    );
    assert.deepEqual(tablas(p), ['agregar:experiencia_conductor', 'quitar:experiencia_conductor', 'agregar:conductor_opciones', 'quitar:conductor_opciones']);
    const exp = p[0];
    assert.ok(exp.tipo === 'agregar');
    assert.equal(exp.siExiste, 'actualizar');
    assert.equal(exp.conflicto, 'conductor_id,tamano_vehiculo_id');
    assert.deepEqual(exp.filas, [
      { conductor_id: UID, tamano_vehiculo_id: 2, anos: 6 },
      { conductor_id: UID, tamano_vehiculo_id: 4, anos: 50 },
    ]);
    assert.ok(p[1].tipo === 'quitar');
    assert.deepEqual(p[1].valores, [3]);
    assert.ok(p[2].tipo === 'agregar');
    assert.deepEqual(p[2].filas, [{ conductor_id: UID, opcion_id: mapas.opcionIdPorClave.idioma.en }]);
    assert.ok(p[3].tipo === 'quitar');
    assert.deepEqual(p[3].valores, [mapas.opcionIdPorClave.idioma.pt]);
  });
  it('sin cambios no escribe nada', () => {
    assert.deepEqual(planPaso3(UID, { experiencia: { '2': 5 }, idiomas: ['es'] }, { experiencia: { '2': 5 }, idiomas: ['es'] }, mapas).length, 1, 'el upsert de años se repite sin problema');
    assert.deepEqual(planPaso3(UID, { experiencia: {}, idiomas: [] }, { experiencia: {}, idiomas: [] }, mapas), []);
  });
});

describe('Paso 4', () => {
  it('agrega y quita negocios visibles; lo guardado de un negocio que no se muestra no se toca', () => {
    const p = planPaso4(
      UID,
      { negocios: ['3'], turnos: ['dia', 'noche'], dias: ['lu', 'ma'] },
      { negocios: ['1', '2'], turnos: ['dia'], dias: ['lu', 'sa'] },
      ['1', '3'],
      mapas,
    );
    const negocios = p.filter((o) => 'tabla' in o && o.tabla === 'conductor_negocios');
    assert.equal(negocios.length, 2);
    assert.ok(negocios[0].tipo === 'agregar');
    assert.deepEqual(negocios[0].filas, [{ conductor_id: UID, negocio_id: 3 }]);
    assert.ok(negocios[1].tipo === 'quitar');
    assert.deepEqual(negocios[1].valores, [1], 'el 2 (apagado) se conserva');
  });
  it('turnos y días: se agregan y quitan solo opciones de su lista', () => {
    const p = planPaso4(UID, { negocios: [], turnos: ['noche'], dias: ['lu', 'ma'] }, { negocios: [], turnos: ['dia'], dias: ['lu', 'sa'] }, [], mapas);
    const ops = p.filter((o) => 'tabla' in o && o.tabla === 'conductor_opciones');
    const agregadas = ops.flatMap((o) => (o.tipo === 'agregar' ? o.filas.map((f) => f.opcion_id) : []));
    const quitadas = ops.flatMap((o) => (o.tipo === 'quitar' ? o.valores : []));
    assert.deepEqual(agregadas.sort(), [mapas.opcionIdPorClave.turno.noche, mapas.opcionIdPorClave.dia_semana.ma].sort());
    assert.deepEqual(quitadas.sort(), [mapas.opcionIdPorClave.turno.dia, mapas.opcionIdPorClave.dia_semana.sa].sort());
  });
  it('un negocio que no se muestra no se agrega aunque venga marcado', () => {
    const p = planPaso4(UID, { negocios: ['2'], turnos: [], dias: [] }, { negocios: [], turnos: [], dias: [] }, ['1', '3'], mapas);
    assert.deepEqual(p, []);
  });
});

describe('Antes de empezar (A4)', () => {
  it('inserta solo los textos que faltan, por columnas y sin id', () => {
    const p = planAutorizaciones(UID, textos, [2]);
    assert.equal(p.length, 1);
    assert.ok(p[0].tipo === 'insertar');
    assert.deepEqual(p[0].filas, [1, 3, 4].map((n) => ({ cuenta_id: UID, texto_autorizacion_id: n })));
    assert.deepEqual(planAutorizaciones(UID, textos, [1, 2, 3, 4]), []);
  });
});

describe('Disponible para trabajar', () => {
  it('encender lleva la fecha de confirmación (la pone el servidor); apagar no', () => {
    const on = planDisponible(UID, true, AHORA)[0];
    const off = planDisponible(UID, false, AHORA)[0];
    assert.ok(on.tipo === 'actualizar' && off.tipo === 'actualizar');
    assert.deepEqual(on.valores, { disponible: true, disponibilidad_confirmada_en: AHORA });
    assert.deepEqual(off.valores, { disponible: false });
  });
});

describe('reglas comunes', () => {
  it('nunca se manda id en consentimientos ni en experiencia_conductor', () => {
    const todos = [
      ...planPaso3(UID, { experiencia: { '1': 1, '2': 3 }, idiomas: ['es'] }, { experiencia: {}, idiomas: [] }, mapas),
      ...planAutorizaciones(UID, textos, []),
    ];
    for (const f of filas(todos)) assert.equal('id' in f, false);
  });
  it('todas las filas que se escriben son del propio conductor', () => {
    const todos = [
      ...planPaso1(UID, datos1, { registrado: false, clasesDeclaradas: [] }, mapas, AHORA),
      ...planPaso3(UID, { experiencia: { '2': 3 }, idiomas: ['es'] }, { experiencia: {}, idiomas: [] }, mapas),
      ...planPaso4(UID, { negocios: ['1'], turnos: ['dia'], dias: ['lu'] }, { negocios: [], turnos: [], dias: [] }, ['1'], mapas),
      ...planAutorizaciones(UID, textos, []),
    ];
    for (const f of filas(todos)) assert.equal(f.conductor_id ?? f.cuenta_id ?? f.id, UID);
  });
});

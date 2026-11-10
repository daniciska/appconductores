/// <reference types="node" />
// Filas de la base → lo que leen las pantallas (src/datos/catalogos.ts y src/datos/perfil.ts).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { catalogosVacios } from '../src/datos/catalogos.ts';
import { celularDeLaBase, celularParaAuth, fechaDeLaBase, fechaParaLaBase, mapearPerfil, perfilVacio, type FilasPerfil } from '../src/datos/perfil.ts';
import { avancePerfil, negocioPermitidoPorDeclaradas, negociosPorIndustria } from '../../aplicacion/src/datos/puerto/derivados.ts';

import { catalogosLeidos } from './base.ts';

const UID = 'aaaaaaaa-1111-4000-8000-00000000000a';
const c = catalogosLeidos();
const id = (nombre: string) => c.catalogos.negocios.find((n) => n.nombre === nombre)!.id;
const op = (lista: 'turno' | 'dia_semana' | 'idioma', clave: string) => c.mapas.opcionIdPorClave[lista][clave];

function filas(cambios: Partial<FilasPerfil> = {}): FilasPerfil {
  return {
    cuenta: {
      id: UID,
      celular: '+56990000001',
      celular_verificado_en: '2026-11-09T21:00:00Z',
      creado_en: '2026-11-09T21:00:00Z',
      email: 'equipo.a@ejemplo.cl',
      nombres: 'Ana María',
      primer_apellido: 'Prueba',
      segundo_apellido: null,
      estado: 'activa',
    },
    conductor: {
      id: UID,
      fecha_nacimiento: '1990-03-14',
      comuna_id: null,
      tiene_estacionamiento: null,
      disponible: true,
      disponibilidad_confirmada_en: '2026-11-09T21:00:00Z',
      estado_perfil: 'incompleto',
      estado_verificacion: 'sin_documentos',
      creado_en: '2026-11-09T21:00:00Z',
    },
    licencias: [{ clase_licencia_id: c.mapas.claseIdPorCodigo.A2, origen: 'declarada' }],
    experiencia: [],
    negocios: [],
    opciones: [],
    consentimientos: [1, 2, 3, 4].map((n) => ({ texto_autorizacion_id: n })),
    ...cambios,
  };
}

describe('catálogos', () => {
  it('trae los conteos de la base (16 regiones, 81 zonas, 346 comunas, 10 clases, 7 tipos, 11 negocios)', () => {
    assert.equal(c.catalogos.regiones.length, 16);
    assert.equal(c.catalogos.zonas.length, 81);
    assert.equal(c.catalogos.comunas.length, 346);
    assert.equal(c.catalogos.clases.length, 10);
    assert.equal(c.catalogos.tamanos.length, 7);
    assert.equal(c.catalogos.negocios.length, 11);
    assert.deepEqual(c.catalogos.turnos.map((t) => t.clave), ['dia', 'noche']);
    assert.deepEqual(c.catalogos.dias.map((d) => d.corto), ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']);
    assert.deepEqual(c.catalogos.idiomas.map((i) => i.clave), ['es', 'en', 'pt', 'fr', 'ht']);
    assert.equal(c.diasReconfirmar, 30);
  });
  it('los ids de la base pasan a texto y la comuna lleva su zona y región', () => {
    const nunoa = c.catalogos.comunas.find((x) => x.nombre === 'Ñuñoa')!;
    assert.deepEqual(nunoa, { id: '94', nombre: 'Ñuñoa', regionId: '7', zonaId: '26', alternativos: [] });
    assert.equal(c.catalogos.zonas.find((z) => z.id === '26')!.nombre, 'Zona Oriente');
  });
  it('los negocios llevan sus clases por código; solo Taxi y Taxi ejecutivo se ven (carga apagada)', () => {
    const taxi = c.catalogos.negocios.find((n) => n.nombre === 'Taxi')!;
    assert.deepEqual(taxi.clases, ['A1', 'A2', 'A3', 'A1 antigua']);
    assert.deepEqual(taxi.tamanos, ['2']);
    const visibles = negociosPorIndustria({ catalogos: c.catalogos }, true).flatMap((g) => g.negocios.map((n) => n.nombre));
    assert.deepEqual(visibles, ['Taxi', 'Taxi ejecutivo']);
    const turismo = c.catalogos.negocios.find((n) => n.nombre === 'Van o bus de turismo')!;
    assert.equal(turismo.pregunta?.respuestas.length, 4);
  });
  it('mapas: opciones por clave e id, clases por código', () => {
    assert.equal(op('turno', 'dia'), 1);
    assert.equal(op('dia_semana', 'lu'), 3);
    assert.equal(op('idioma', 'es'), 10);
    assert.deepEqual(c.mapas.opcionPorId[8], { lista: 'dia_semana', clave: 'sa' });
    assert.equal(c.mapas.opcionPorId[15], undefined, 'modo de contrato (en espera) no es del conductor');
    assert.equal(c.mapas.claseCodigoPorId[9], 'A1 antigua');
  });
  it('sin ajuste legible, 30 días', () => {
    assert.equal(catalogosVacios().diasReconfirmar, 30);
  });
});

describe('perfil propio', () => {
  it('celular +569… ↔ 8 dígitos y fecha ISO ↔ dd/mm/aaaa', () => {
    assert.equal(celularDeLaBase('+56990000001'), '9000 0001');
    assert.equal(celularParaAuth('9000 0001'), '+56990000001');
    assert.equal(fechaDeLaBase('1990-03-14'), '14/03/1990');
    assert.equal(fechaParaLaBase('14/03/1990'), '1990-03-14');
  });
  it('sin sesión: el celular que se está verificando, "Disponible" encendido y nada marcado', () => {
    const p = perfilVacio(c.mapas, c.textos, '9000 0001');
    assert.equal(p.cuenta.celular, '9000 0001');
    assert.equal(p.conductor.registrado, false);
    assert.equal(p.conductor.disponible, true);
    assert.equal(p.conductor.tieneEstacionamiento, false);
    assert.deepEqual([p.conductor.clasesDeclaradas, p.conductor.idiomas, p.conductor.negocios, p.conductor.turnos, p.conductor.dias], [[], [], [], [], []]);
    assert.deepEqual(p.conductor.experiencia, {});
    assert.equal(p.autorizacionesCompletas, false);
  });
  it('autorizaciones: completas con los 4 textos vigentes; terminos/compartirFicha según su clave', () => {
    const p = mapearPerfil(filas({ consentimientos: [{ texto_autorizacion_id: 1 }, { texto_autorizacion_id: 2 }] }), c.mapas, c.textos);
    assert.equal(p.autorizacionesCompletas, false);
    assert.equal(p.cuenta.autorizaciones.terminos, true);
    assert.equal(p.cuenta.autorizaciones.compartirFicha, true);
    assert.equal(mapearPerfil(filas(), c.mapas, c.textos).autorizacionesCompletas, true);
    assert.equal(mapearPerfil(filas(), c.mapas, []).autorizacionesCompletas, false, 'sin textos vigentes no hay nada que aceptar');
  });
  it('Paso 1 listo con fila, nombres, apellido, correo y una clase; sin clase, no', () => {
    const p = mapearPerfil(filas(), c.mapas, c.textos);
    assert.equal(p.conductor.registrado, true);
    assert.equal(p.conductor.fechaNacimiento, '14/03/1990');
    assert.deepEqual(p.conductor.clasesDeclaradas, ['A2']);
    assert.deepEqual(p.conductor.pasosListos, { datos: true, direccion: false, experiencia: false, trabajo: false, documentos: false });
    assert.equal(p.conductor.pasoActual, 2);
    assert.equal(mapearPerfil(filas({ licencias: [] }), c.mapas, c.textos).conductor.pasosListos.datos, false);
    assert.equal(avancePerfil(p).listos, 1);
  });
  it('Paso 2 listo con comuna y estacionamiento respondido (también "no")', () => {
    const p = mapearPerfil(filas({ conductor: { ...filas().conductor!, comuna_id: 94, tiene_estacionamiento: false } }), c.mapas, c.textos);
    assert.equal(p.conductor.pasosListos.direccion, true);
    assert.equal(p.conductor.comunaId, '94');
    assert.equal(p.conductor.tieneEstacionamiento, false);
  });
  it('Paso 3 listo con años, o con idiomas, o con el Paso 4 listo (es opcional)', () => {
    const conAnos = mapearPerfil(filas({ experiencia: [{ tamano_vehiculo_id: 2, anos: 5 }] }), c.mapas, c.textos);
    assert.equal(conAnos.conductor.pasosListos.experiencia, true);
    assert.deepEqual(conAnos.conductor.experiencia, { '2': 5 });
    assert.equal(mapearPerfil(filas({ opciones: [{ opcion_id: op('idioma', 'es') }] }), c.mapas, c.textos).conductor.pasosListos.experiencia, true);
    const soloPaso4 = mapearPerfil(
      filas({ negocios: [{ negocio_id: Number(id('Taxi')) }], opciones: [{ opcion_id: op('turno', 'dia') }, { opcion_id: op('dia_semana', 'lu') }] }),
      c.mapas,
      c.textos,
    );
    assert.equal(soloPaso4.conductor.pasosListos.trabajo, true);
    assert.equal(soloPaso4.conductor.pasosListos.experiencia, true);
    assert.equal(mapearPerfil(filas(), c.mapas, c.textos).conductor.pasosListos.experiencia, false);
  });
  it('Paso 4 listo con negocio, turno y día; las opciones se separan por lista', () => {
    const p = mapearPerfil(
      filas({
        negocios: [{ negocio_id: 1 }, { negocio_id: 3 }],
        opciones: [{ opcion_id: op('turno', 'noche') }, { opcion_id: op('dia_semana', 'sa') }, { opcion_id: op('dia_semana', 'do') }, { opcion_id: op('idioma', 'en') }],
      }),
      c.mapas,
      c.textos,
    );
    assert.deepEqual(p.conductor.negocios, ['1', '3']);
    assert.deepEqual(p.conductor.turnos, ['noche']);
    assert.deepEqual(p.conductor.dias, ['sa', 'do']);
    assert.deepEqual(p.conductor.idiomas, ['en']);
    assert.equal(p.conductor.pasosListos.trabajo, true);
    assert.equal(p.conductor.pasosListos.documentos, false, 'los documentos siempre faltan en la v1');
    assert.equal(avancePerfil(p).listos, 3);
  });
  it('con los pasos 1 a 4 listos: 4 de 5 (80 %), paso actual 4', () => {
    const p = mapearPerfil(
      filas({
        conductor: { ...filas().conductor!, comuna_id: 94, tiene_estacionamiento: true },
        negocios: [{ negocio_id: 1 }],
        opciones: [{ opcion_id: op('turno', 'dia') }, { opcion_id: op('dia_semana', 'lu') }],
      }),
      c.mapas,
      c.textos,
    );
    const a = avancePerfil(p);
    assert.deepEqual([a.listos, a.total, a.porcentaje, a.siguientePaso], [4, 5, 80, 5]);
    assert.equal(p.conductor.estadoPerfil, 'incompleto');
  });
  it('el Paso 4 en gris: con solo clase B, Taxi no está permitido; con A2 sí', () => {
    const conB = mapearPerfil(filas({ licencias: [{ clase_licencia_id: c.mapas.claseIdPorCodigo.B, origen: 'declarada' }] }), c.mapas, c.textos);
    assert.equal(negocioPermitidoPorDeclaradas({ catalogos: c.catalogos, conductor: conB.conductor }, id('Taxi')), false);
    const conA2 = mapearPerfil(filas(), c.mapas, c.textos);
    assert.equal(negocioPermitidoPorDeclaradas({ catalogos: c.catalogos, conductor: conA2.conductor }, id('Taxi')), true);
  });
});

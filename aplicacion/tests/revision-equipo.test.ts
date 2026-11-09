/// <reference types="node" />
// Pruebas de la revisión del equipo: cuándo se simula y cuándo espera a una persona que revisa a mano
// en el mismo navegador (src/datos/revisionEquipo.ts y src/datos/revisionManual.ts).
// Correr con: npm run test:match (corre todas las pruebas de tests/).
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { planificarRevisionEquipo, rondaDe } from '../src/datos/revisionEquipo.ts';
import {
  CLAVE_REINICIO,
  PLAZO_REVISION_MANUAL_MS,
  PREFIJO_REVISION_MANUAL,
  clavesDeMarcas,
  leerRevisionManual,
  marcaVigente,
  reiniciarRevisionManual,
} from '../src/datos/revisionManual.ts';
import type { DocumentoUsuario, TareaSimulada, TipoDocumentoId } from '../src/datos/tipos.ts';

const TIPOS: TipoDocumentoId[] = ['cedula', 'licencia', 'hoja_vida', 'antecedentes'];

function doc(tipo: TipoDocumentoId, cambios: Partial<DocumentoUsuario> = {}): DocumentoUsuario {
  return { tipo, estado: 'falta', etapa: null, enviadoEl: null, otraRevisionEl: null, ...cambios } as DocumentoUsuario;
}

/** Hoja de Vida y antecedentes esperando a una persona; cédula y licencia ya aprobadas. */
function documentos(): Record<TipoDocumentoId, DocumentoUsuario> {
  const enviado = '2026-11-09T12:00:00.000Z';
  return {
    cedula: doc('cedula', { estado: 'aprobado' }),
    licencia: doc('licencia', { estado: 'aprobado' }),
    hoja_vida: doc('hoja_vida', { estado: 'en_revision', etapa: 'equipo', enviadoEl: enviado }),
    antecedentes: doc('antecedentes', { estado: 'en_revision', etapa: 'equipo', enviadoEl: enviado }),
  };
}

let n = 0;
const entrada = (manual: boolean, pendientes: TareaSimulada[] = []) => ({
  documentos: documentos(),
  pendientes,
  tipos: TIPOS,
  ahora: 1_000_000,
  manual,
  segundos: 12,
  nuevoId: () => `t${n++}`,
});

describe('planificarRevisionEquipo', () => {
  it('sin revisión manual programa la revisión simulada a los 12 s (la segunda un poco después)', () => {
    const r = planificarRevisionEquipo(entrada(false));
    assert.ok(r);
    const revisiones = r.filter((t) => t.tipo === 'revision_equipo');
    assert.deepEqual(
      revisiones.map((t) => [t.tipo === 'revision_equipo' && t.documento, t.venceEn]),
      [
        ['hoja_vida', 1_012_000],
        ['antecedentes', 1_012_600],
      ],
    );
  });

  it('no programa dos veces la misma ronda', () => {
    const primera = planificarRevisionEquipo(entrada(false))!;
    assert.equal(planificarRevisionEquipo(entrada(false, primera)), null);
  });

  it('pedir otra revisión es otra ronda', () => {
    const d = documentos().hoja_vida;
    assert.notEqual(rondaDe(d), rondaDe({ ...d, otraRevisionEl: '2026-11-09T13:00:00.000Z' }));
  });

  it('con revisión manual no programa nada y quita las revisiones simuladas ya programadas', () => {
    assert.equal(planificarRevisionEquipo(entrada(true)), null);
    const programadas = planificarRevisionEquipo(entrada(false))!;
    const otra: TareaSimulada = { id: 'x', tipo: 'respuesta_titular', venceEn: 5, busquedaId: 'b01' };
    const r = planificarRevisionEquipo(entrada(true, [...programadas, otra]));
    assert.deepEqual(r, [otra]);
  });

  it('al terminar la revisión manual vuelve a programarse desde ese momento', () => {
    const r = planificarRevisionEquipo({ ...entrada(false), ahora: 2_000_000 })!;
    assert.equal(r[0].venceEn, 2_012_000);
  });
});

describe('Revisión manual en el navegador', () => {
  const datos: Record<string, string> = {};
  const almacen = {
    getItem: (k: string) => datos[k] ?? null,
    setItem: (k: string, v: string) => {
      datos[k] = v;
    },
    removeItem: (k: string) => {
      delete datos[k];
    },
    key: (i: number) => Object.keys(datos)[i] ?? null,
    get length() {
      return Object.keys(datos).length;
    },
  };
  const ahora = 5_000_000;
  const marca = (id: string, hasta: number) => {
    datos[`${PREFIJO_REVISION_MANUAL}${id}`] = JSON.stringify({ hasta });
  };
  beforeEach(() => {
    for (const k of Object.keys(datos)) delete datos[k];
  });

  it('sin marcas no hay revisión manual', () => {
    datos['dale-demo-datos'] = '{"state":{},"version":4}';
    assert.equal(leerRevisionManual(ahora, almacen), false);
  });

  it('una marca vigente de cualquier pestaña detiene la revisión simulada', () => {
    marca('a', ahora - 1);
    assert.equal(leerRevisionManual(ahora, almacen), false);
    marca('b', ahora + PLAZO_REVISION_MANUAL_MS);
    assert.equal(leerRevisionManual(ahora, almacen), true);
  });

  it('una marca olvidada (la pestaña se cerró sin avisar) vence sola', () => {
    marca('a', ahora + PLAZO_REVISION_MANUAL_MS);
    assert.equal(leerRevisionManual(ahora + PLAZO_REVISION_MANUAL_MS, almacen), true);
    assert.equal(leerRevisionManual(ahora + PLAZO_REVISION_MANUAL_MS + 1, almacen), false);
  });

  it('lo que no se entiende no cuenta como marca', () => {
    assert.equal(marcaVigente('{"rol":"x","desde":"y"}', ahora), false);
    assert.equal(marcaVigente('no es json', ahora), false);
    assert.equal(marcaVigente(null, ahora), false);
    assert.equal(marcaVigente(`{"hasta":${ahora}}`, ahora), true);
  });

  it('"Reiniciar demo" borra todas las marcas y avisa a las demás pestañas', () => {
    marca('a', ahora + 10_000);
    marca('b', ahora + 10_000);
    datos['dale-demo-datos'] = 'x';
    reiniciarRevisionManual(ahora, almacen);
    assert.deepEqual(clavesDeMarcas(almacen), []);
    assert.equal(datos[CLAVE_REINICIO], String(ahora));
    assert.equal(datos['dale-demo-datos'], 'x');
    assert.equal(leerRevisionManual(ahora, almacen), false);
  });
});

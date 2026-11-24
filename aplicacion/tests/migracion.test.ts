/// <reference types="node" />
// Pruebas de cómo se llevan los datos guardados a la versión actual (src/datos/migracion.ts).
// Correr con: npm run test:match (corre todas las pruebas de tests/).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { DatosDemo } from '../src/datos/estado.ts';
import { migrarDatos } from '../src/datos/migracion.ts';

/** Un estado inicial de mentira con lo que mira la migración (versión 5). */
function inicial(): DatosDemo {
  return {
    version: 5,
    rol: null,
    titularDemo: { titularId: 'tyo', plan: 'sin_plan', destacadasUsadas: 0, registro: { datosListos: false }, contactoMostrado: {} },
    cuenta: { nombres: '' },
    catalogos: { negocios: [{ id: 'taxi', activo: true }] },
    reglas: { umbral: 66, reglas: [] },
    ajustes: { bolsaActiva: true },
    titulares: [{ id: 't01', suspendido: false }],
    conductores: [{ id: 'c01', suspendido: false }],
    equipo: [],
    accionesEquipo: [],
    pendientes: [],
  } as unknown as DatosDemo;
}

/** Lo que guardó una persona: progreso, cambios de configuración y una cuenta suspendida. */
function guardado(): Record<string, unknown> {
  return {
    version: 3,
    rol: 'conductor',
    cuenta: { nombres: 'Daniel' },
    catalogos: { negocios: [{ id: 'taxi', activo: false }] },
    reglas: { umbral: 80, reglas: [] },
    ajustes: { bolsaActiva: false },
    titulares: [{ id: 't01', suspendido: true }],
    conductores: [{ id: 'c01', suspendido: true }],
    equipo: [{ id: 'e01' }],
    accionesEquipo: [{ id: 'a01' }],
    pendientes: [{ id: 't1', tipo: 'prerevision' }],
    titularDemo: { titularId: 't01', plan: 'flota', destacadasUsadas: 1 },
  };
}

describe('migrarDatos', () => {
  it('desde la versión 3 conserva todo (progreso, configuración, suspensiones y equipo)', () => {
    const r = migrarDatos(guardado(), 3, inicial());
    assert.equal(r.version, 5);
    assert.equal(r.rol, 'conductor');
    assert.equal(r.cuenta.nombres, 'Daniel');
    assert.equal(r.catalogos.negocios[0].activo, false);
    assert.equal(r.reglas.umbral, 80);
    assert.equal(r.ajustes.bolsaActiva, false);
    assert.equal(r.titulares[0].suspendido, true);
    assert.equal(r.conductores[0].suspendido, true);
    assert.equal(r.equipo.length, 1);
    assert.equal(r.accionesEquipo.length, 1);
    assert.equal(r.pendientes.length, 1);
    // Antes del 24-nov el titular de la demo era siempre la empresa de ejemplo: queda ya registrada.
    assert.equal(r.titularDemo.titularId, 't01');
    assert.equal(r.titularDemo.plan, 'flota');
    assert.equal(r.titularDemo.registro.datosListos, true);
    assert.deepEqual(r.titularDemo.contactoMostrado, {});
  });

  it('desde la versión 4 también completa el registro del titular, y desde la 5 conserva todo', () => {
    const r4 = migrarDatos({ ...guardado(), version: 4 }, 4, inicial());
    assert.equal(r4.titularDemo.registro.datosListos, true);
    const v5 = { ...guardado(), version: 5, titularDemo: { titularId: 'tyo', plan: 'sin_plan', destacadasUsadas: 0, registro: { datosListos: false }, contactoMostrado: { 'b01|c02': 'x' } } };
    const r5 = migrarDatos(v5, 5, inicial());
    assert.equal(r5.titularDemo.titularId, 'tyo');
    assert.equal(r5.titularDemo.registro.datosListos, false);
    assert.equal(r5.titularDemo.contactoMostrado['b01|c02'], 'x');
  });

  it('desde la versión 2 conserva el progreso, pero la configuración vuelve a su valor inicial', () => {
    const r = migrarDatos({ ...guardado(), rol: 'admin' }, 2, inicial());
    assert.equal(r.version, 5);
    assert.equal(r.rol, null); // 'admin' era el panel dentro de la demo
    assert.equal(r.cuenta.nombres, 'Daniel');
    assert.equal(r.catalogos.negocios[0].activo, true);
    assert.equal(r.reglas.umbral, 66);
    assert.equal(r.ajustes.bolsaActiva, true);
    assert.equal(r.titulares[0].suspendido, false);
    assert.equal(r.conductores[0].suspendido, false);
  });

  it('desde otra versión o con datos que no se entienden parte de cero', () => {
    const base = inicial();
    assert.equal(migrarDatos(guardado(), 1, base), base);
    assert.equal(migrarDatos(guardado(), 9, base), base);
    assert.equal(migrarDatos(guardado(), 6, base), base);
    assert.equal(migrarDatos(null, 3, base), base);
    assert.equal(migrarDatos('texto', 3, base), base);
    assert.equal(migrarDatos([1, 2], 3, base), base);
  });
});

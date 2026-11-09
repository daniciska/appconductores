/// <reference types="node" />
// Pruebas de los permisos de cada rol del panel (src/permisos.ts). Correr con: npm test (en panel/).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PERMISOS, firmaDe, puede, type Permiso } from '../src/permisos.ts';

const TODOS: Permiso[] = [
  'decidir_documentos',
  'resolver_reportes',
  'suspender_cuentas',
  'cambiar_reglas',
  'cambiar_catalogos',
  'cambiar_zonas',
  'cambiar_ajustes',
  'gestionar_equipo',
  'ver_registro',
];

describe('Permisos del panel', () => {
  it('el revisor decide documentos y reportes y suspende cuentas (MD52 por confirmar)', () => {
    for (const p of ['decidir_documentos', 'resolver_reportes', 'suspender_cuentas'] as Permiso[]) assert.equal(puede('revisor', p), true, p);
  });

  it('el revisor no cambia la configuración, el equipo ni ve el registro', () => {
    for (const p of ['cambiar_reglas', 'cambiar_catalogos', 'cambiar_zonas', 'cambiar_ajustes', 'gestionar_equipo', 'ver_registro'] as Permiso[]) {
      assert.equal(puede('revisor', p), false, p);
    }
  });

  it('el administrador puede todo lo del revisor y además la configuración', () => {
    for (const p of TODOS) assert.equal(puede('administrador', p), true, p);
    for (const p of PERMISOS.revisor) assert.equal(PERMISOS.administrador.has(p), true, p);
  });

  it('sin rol (en la portada) no se puede nada', () => {
    for (const p of TODOS) assert.equal(puede(null, p), false, p);
  });

  it('la firma del registro empieza con "Tú" y dice el rol', () => {
    assert.equal(firmaDe('revisor'), 'Tú (revisor)');
    assert.equal(firmaDe('administrador'), 'Tú (administrador)');
  });
});

/// <reference types="node" />
// La app real no llega a nada de la demo ni del panel (scripts/revisar-sin-demo.mjs).
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { nombresFicticios, revisarImportaciones, textosProhibidos } from '../scripts/revisar-sin-demo.mjs';

describe('sin demo', () => {
  it('desde las rutas de la app real no se llega a la tienda, la semilla, la simulación ni al panel', () => {
    const { hallazgos, revisados } = revisarImportaciones();
    assert.deepEqual(hallazgos, []);
    assert.ok(revisados > 30);
  });
  it('la revisión sí encuentra la demo (desde las rutas del mockup se llega a la tienda)', () => {
    const { hallazgos } = revisarImportaciones(fileURLToPath(new URL('../../aplicacion/src/app', import.meta.url)));
    const archivos = hallazgos.map((h: { archivo: string }) => h.archivo);
    assert.ok(archivos.some((a: string) => /^aplicacion\/src\/datos\/(tienda|hooks|simulacion)\.ts$/.test(a)), archivos.join(', '));
    assert.ok(archivos.some((a: string) => a.startsWith('aplicacion/src/datos/semilla/') || a.startsWith('aplicacion/src/pantallas/matches/')));
  });
  it('busca en el export los nombres de la semilla, los textos de la demo y del panel, y service_role', () => {
    const nombres = nombresFicticios();
    assert.ok(nombres.includes('Transportes Los Aromos SpA'));
    assert.ok(nombres.includes('Daniel Alejandro'));
    const t = textosProhibidos();
    for (const x of ['Demo con datos de ejemplo', 'Ingresa la clave', 'Atajo:', 'Reiniciar demo', 'service_role', 'Entrar como revisor']) assert.ok(t.includes(x), x);
  });
});

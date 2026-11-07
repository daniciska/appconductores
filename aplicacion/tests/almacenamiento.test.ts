/// <reference types="node" />
// Pruebas de cómo se guarda la demo en el navegador (src/datos/almacenamiento.ts).
// Correr con: npm run test:match (corre todas las pruebas de tests/).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { create } from 'zustand';
import { persist, type StateStorage } from 'zustand/middleware';

import { crearAlmacenDemo, versionGuardada } from '../src/datos/almacenamiento.ts';

const NUEVA = 'dale-demo-datos';
const ANTERIOR = 'dale-demo-v1';

/** Un localStorage de mentira, compartido por varias "pestañas". */
function navegador(inicial: Record<string, string> = {}) {
  const datos: Record<string, string> = { ...inicial };
  let escrituras = 0;
  const base: StateStorage = {
    getItem: async (k) => datos[k] ?? null,
    setItem: async (k, v) => {
      escrituras++;
      datos[k] = v;
    },
    removeItem: async (k) => {
      delete datos[k];
    },
  };
  return { datos, base, escrituras: () => escrituras };
}

const guardado = (state: unknown, version: number) => JSON.stringify({ state, version });

interface Datos {
  progreso: string;
  umbral: number;
}

/** Una pestaña con la tienda real de zustand (persist) sobre el navegador de mentira. */
function pestana(base: StateStorage, version: number, alQuedarVieja?: () => void) {
  const store = create<Datos>()(
    persist(() => ({ progreso: 'nada', umbral: 66 }), {
      name: NUEVA,
      version,
      storage: crearAlmacenDemo<Datos>(base, { claveAnterior: ANTERIOR, version, alQuedarVieja }),
      // Como migrarEstado: se conserva el progreso y los ajustes vuelven a sus valores iniciales.
      migrate: (viejo) => ({ progreso: (viejo as Datos).progreso, umbral: 66 }),
    }),
  );
  return store;
}

const esperar = () => new Promise((r) => setTimeout(r, 10));

describe('versionGuardada', () => {
  it('lee la versión del final del texto', () => {
    assert.equal(versionGuardada(guardado({ a: 1 }, 3)), 3);
    assert.equal(versionGuardada(guardado({ version: 9, b: 'x' }, 12)), 12);
  });
  it('sin texto o sin versión: null', () => {
    assert.equal(versionGuardada(null), null);
    assert.equal(versionGuardada('{"state":{}}'), null);
  });
});

describe('Clave anterior (dale-demo-v1)', () => {
  it('se lee una sola vez, se lleva a la versión nueva, se guarda en la clave nueva y se borra', async () => {
    const n = navegador({ [ANTERIOR]: guardado({ progreso: 'verificado', umbral: 95 }, 2) });
    const tienda = pestana(n.base, 3);
    await tienda.persist.rehydrate();
    assert.equal(tienda.getState().progreso, 'verificado');
    assert.equal(tienda.getState().umbral, 66);
    assert.equal(versionGuardada(n.datos[NUEVA] ?? null), 3);
    assert.equal(ANTERIOR in n.datos, false);
  });

  it('si la clave nueva ya tiene datos, la anterior no se lee ni se toca', async () => {
    const n = navegador({
      [NUEVA]: guardado({ progreso: 'nuevo', umbral: 66 }, 3),
      [ANTERIOR]: guardado({ progreso: 'viejo', umbral: 95 }, 2),
    });
    const tienda = pestana(n.base, 3);
    await tienda.persist.rehydrate();
    assert.equal(tienda.getState().progreso, 'nuevo');
    tienda.setState({ progreso: 'nuevo 2' });
    await esperar();
    assert.equal(JSON.parse(n.datos[ANTERIOR]).state.progreso, 'viejo');
  });

  it('una pestaña vieja que sigue escribiendo la clave anterior no cambia la nueva', async () => {
    const n = navegador({ [ANTERIOR]: guardado({ progreso: 'verificado', umbral: 66 }, 2) });
    const tienda = pestana(n.base, 3);
    await tienda.persist.rehydrate();
    // La pestaña vieja (código publicado) vuelve a guardar en su clave.
    n.datos[ANTERIOR] = guardado({ progreso: 'desde cero', umbral: 66 }, 2);
    await tienda.persist.rehydrate(); // como al recibir el evento "storage"
    assert.equal(tienda.getState().progreso, 'verificado');
    assert.equal(JSON.parse(n.datos[NUEVA]).state.progreso, 'verificado');
  });
});

describe('Pestaña con código más viejo que lo guardado', () => {
  it('no pisa los datos de una versión más nueva y avisa una sola vez', async () => {
    let avisos = 0;
    const n = navegador({ [NUEVA]: guardado({ progreso: 'hecho en la 4', umbral: 66 }, 4) });
    const vieja = pestana(n.base, 3, () => avisos++);
    await vieja.persist.rehydrate();
    assert.equal(vieja.getState().progreso, 'nada'); // no "migra hacia atrás"
    vieja.setState({ progreso: 'algo en la 3' });
    vieja.setState({ progreso: 'otra cosa en la 3' });
    await esperar();
    assert.equal(versionGuardada(n.datos[NUEVA]), 4);
    assert.equal(JSON.parse(n.datos[NUEVA]).state.progreso, 'hecho en la 4');
    assert.equal(avisos, 1);
  });

  it('si otra pestaña guarda una versión más nueva mientras tanto, esta deja de guardar', async () => {
    let avisos = 0;
    const n = navegador();
    const vieja = pestana(n.base, 3, () => avisos++);
    await vieja.persist.rehydrate();
    vieja.setState({ progreso: 'en la 3' });
    await esperar();
    assert.equal(versionGuardada(n.datos[NUEVA]), 3);
    const nueva = pestana(n.base, 4);
    await nueva.persist.rehydrate();
    assert.equal(nueva.getState().progreso, 'en la 3'); // la nueva conserva lo de la 3
    await esperar();
    assert.equal(versionGuardada(n.datos[NUEVA]), 4);
    const antes = n.escrituras();
    vieja.setState({ progreso: 'la 3 otra vez' });
    await esperar();
    assert.equal(n.escrituras(), antes);
    assert.equal(versionGuardada(n.datos[NUEVA]), 4);
    assert.equal(avisos, 1);
  });

  it('dos pestañas de versiones distintas no se pelean: las escrituras se detienen', async () => {
    const n = navegador({ [NUEVA]: guardado({ progreso: 'verificado', umbral: 66 }, 3) });
    const vieja = pestana(n.base, 3);
    const nueva = pestana(n.base, 4);
    await vieja.persist.rehydrate();
    await nueva.persist.rehydrate();
    // Cada pestaña vuelve a leer varias veces (como con el evento "storage").
    for (let i = 0; i < 5; i++) {
      await vieja.persist.rehydrate();
      await nueva.persist.rehydrate();
    }
    await esperar();
    assert.equal(versionGuardada(n.datos[NUEVA]), 4);
    assert.equal(nueva.getState().progreso, 'verificado');
    assert.equal(JSON.parse(n.datos[NUEVA]).state.progreso, 'verificado');
  });
});

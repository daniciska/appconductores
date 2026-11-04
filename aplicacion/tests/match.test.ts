/// <reference types="node" />
// Pruebas del motor del match. Correr con: npm run test:match
// Node ejecuta TypeScript directo (sin compilar), por eso las importaciones llevan ".ts".
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  aniosEnNegocio,
  evaluarMatch,
  habilitaNegocio,
  textoPideLicencia,
  visibleEnBolsa,
  type CatalogoMatch,
  type ConductorParaMatch,
  type EntradaMatch,
} from '../src/datos/match.ts';
import { CLASES_LICENCIA, INDUSTRIAS, NEGOCIOS, REGLAS_MATCH, TAMANOS_VEHICULO, UMBRAL_MATCH } from '../src/datos/semilla/catalogos.ts';
import { crearFicticios } from '../src/datos/semilla/ficticios.ts';
import { COMUNAS, REGIONES, ZONAS } from '../src/datos/semilla/geografia.ts';
import type { Busqueda, CodigoRegla, ReglasMatch, UsoRegla } from '../src/datos/tipos.ts';

const AHORA = Date.UTC(2026, 10, 4, 15, 0, 0);
const { busquedas, conductores, titulares } = crearFicticios(AHORA);

const catalogo: CatalogoMatch = { negocios: NEGOCIOS, industrias: INDUSTRIAS, clases: CLASES_LICENCIA, comunas: COMUNAS };
const reglas = (cambios: Partial<Record<CodigoRegla, { uso?: UsoRegla; peso?: number }>> = {}, umbral = UMBRAL_MATCH): ReglasMatch => ({
  umbral,
  reglas: REGLAS_MATCH.map((r) => ({ ...r, ...(cambios[r.codigo] ?? {}) })),
});

/** El conductor de ejemplo de la demo, ya verificado: Ñuñoa, A2 y B, 5 años en liviano. */
const ejemplo = (cambios: Partial<ConductorParaMatch> = {}): ConductorParaMatch => ({
  estadoPerfil: 'completo',
  estadoVerificacion: 'verificado',
  disponible: true,
  comunaId: 'nunoa',
  tieneEstacionamiento: true,
  clasesRevisadas: ['A2', 'B'],
  experiencia: { liviano: 5, van: 2 },
  negocios: ['taxi', 'taxi_ejecutivo'],
  turnos: ['dia'],
  dias: ['lu', 'ma', 'mi', 'ju', 'vi', 'sa'],
  ...cambios,
});

const busqueda = (id: string): Busqueda => {
  const b = busquedas.find((x) => x.id === id);
  if (!b) throw new Error(`no existe la búsqueda ${id}`);
  return b;
};

const evaluar = (conductor: ConductorParaMatch, b: Busqueda | string, extra: Partial<EntradaMatch> = {}) =>
  evaluarMatch({
    conductor,
    busqueda: typeof b === 'string' ? busqueda(b) : b,
    catalogo,
    reglas: reglas(),
    ...extra,
  });

describe('datos de la semilla', () => {
  it('tiene las 16 regiones, 81 zonas y 346 comunas de la base', () => {
    assert.equal(REGIONES.length, 16);
    assert.equal(ZONAS.length, 81);
    assert.equal(COMUNAS.length, 346);
    for (const c of COMUNAS) {
      const z = ZONAS.find((x) => x.id === c.zonaId);
      if (!z) throw new Error(`zona de ${c.nombre}`);
      assert.equal(z.regionId, c.regionId, `${c.nombre} está en una zona de otra región`);
    }
  });

  it('todas las referencias de los datos ficticios existen', () => {
    const idsComuna = new Set(COMUNAS.map((c) => c.id));
    const idsNegocio = new Set(NEGOCIOS.map((n) => n.id));
    const idsTamano = new Set(TAMANOS_VEHICULO.map((t) => t.id));
    for (const b of busquedas) {
      assert.ok(idsComuna.has(b.comunaId), `comuna ${b.comunaId}`);
      assert.ok(idsNegocio.has(b.negocioId), `negocio ${b.negocioId}`);
      assert.ok(titulares.some((t) => t.id === b.titularId), `titular ${b.titularId}`);
      assert.ok(b.detalle.length <= 300, `detalle de ${b.id} muy largo`);
    }
    for (const c of conductores) assert.ok(c.comunaId && idsComuna.has(c.comunaId), `comuna ${c.comunaId}`);
    for (const n of NEGOCIOS) for (const t of n.tamanos) assert.ok(idsTamano.has(t), `${n.id}: ${t}`);
    assert.ok(busquedas.length >= 12 && busquedas.length <= 16);
    assert.ok(conductores.length >= 8 && conductores.length <= 10);
  });

  it('al lanzar solo están activos Taxi y Taxi ejecutivo', () => {
    assert.deepEqual(
      NEGOCIOS.filter((n) => n.activo).map((n) => n.id),
      ['taxi', 'taxi_ejecutivo'],
    );
    assert.equal(INDUSTRIAS.find((i) => i.id === 'carga')?.activo, false);
  });
});

describe('match: porcentaje y umbral', () => {
  it('coincide en todo: 100 %', () => {
    const r = evaluar(ejemplo(), 'b01');
    assert.equal(r.hayMatch, true);
    assert.equal(r.porcentaje, 100);
    assert.equal(r.coinciden, 4);
    assert.equal(r.evaluadas, 4);
    assert.deepEqual(r.noCoinciden, []);
  });

  it('otra zona y 6 de 7 días: 71 % ≥ 66, hay match', () => {
    const r = evaluar(ejemplo(), 'b03');
    assert.equal(r.hayMatch, true);
    assert.equal(r.porcentaje, 71);
    assert.deepEqual(r.noCoinciden, ['M2', 'M7']);
    assert.deepEqual(r.textosNoCoinciden, ['otra zona', 'no todos los días']);
  });

  it('M7 es proporcional: 1 de 2 días pedidos suma 0,5', () => {
    const r = evaluar(ejemplo(), 'b07');
    const m7 = r.detalle.find((d) => d.codigo === 'M7');
    assert.equal(m7?.valor, 0.5);
    assert.equal(r.porcentaje, 88);
    assert.equal(r.hayMatch, true);
  });

  it('otra zona y menos años de los pedidos: 50 %, no hay match', () => {
    const r = evaluar(ejemplo(), 'b05');
    assert.equal(r.hayMatch, false);
    assert.equal(r.porcentaje, 50);
    assert.deepEqual(r.noCoinciden, ['M2', 'M4']);
  });

  it('el conductor de ejemplo tiene 5 matches: b01, b02, b03, b07 y b14', () => {
    const ids = busquedas.filter((b) => evaluar(ejemplo(), b).hayMatch).map((b) => b.id);
    assert.deepEqual(ids, ['b01', 'b02', 'b03', 'b07', 'b14']);
  });

  it('el umbral se lee de las reglas: con 80 el 71 % ya no alcanza', () => {
    const r = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b03'), catalogo, reglas: reglas({}, 80) });
    assert.equal(r.porcentaje, 71);
    assert.equal(r.hayMatch, false);
  });

  it('compara fracciones exactas: 2 de 3 (66,7 %) alcanza 66 pero no 67', () => {
    const sinDias = { M7: { uso: 'apagado' as UsoRegla } };
    // b05 sin M7: zona no, años no, estacionamiento sí → 1 de 3. Se usa b03 sin M7: zona no → 2 de 3.
    const con66 = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b03'), catalogo, reglas: reglas(sinDias, 66) });
    const con67 = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b03'), catalogo, reglas: reglas(sinDias, 67) });
    assert.equal(con66.evaluadas, 3);
    assert.equal(con66.hayMatch, true);
    assert.equal(con67.hayMatch, false);
  });

  it('los pesos cuentan: zona con peso 3 baja el 71 % a 48 %', () => {
    const r = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b03'), catalogo, reglas: reglas({ M2: { peso: 3 } }) });
    assert.equal(r.porcentaje, 48);
    assert.equal(r.hayMatch, false);
  });

  it('lo que el titular no exige cuenta como coincidencia', () => {
    const b: Busqueda = { ...busqueda('b02'), aniosMinimos: 0, dias: [], exigeEstacionamiento: false };
    const r = evaluar(ejemplo({ experiencia: {}, tieneEstacionamiento: false, comunaId: 'las-condes' }), b);
    assert.equal(r.porcentaje, 100);
  });
});

describe('match: filtros obligatorios', () => {
  it('F1: el negocio debe estar entre los del conductor', () => {
    const r = evaluar(ejemplo({ negocios: ['taxi'] }), 'b02');
    assert.equal(r.hayMatch, false);
    assert.deepEqual(r.filtrosFallidos, ['F1']);
  });

  it('F2: usa las clases REVISADAS (las declaradas no cuentan)', () => {
    const r = evaluar(ejemplo({ clasesRevisadas: [] }), 'b01');
    assert.deepEqual(r.filtrosFallidos, ['F2']);
    const soloB = evaluar(ejemplo({ clasesRevisadas: ['B'] }), 'b01');
    assert.deepEqual(soloB.filtrosFallidos, ['F2'], 'Taxi pide A1, A2, A3 o A1 antigua');
  });

  it('F3: misma región', () => {
    const r = evaluar(ejemplo(), 'b08');
    assert.deepEqual(r.filtrosFallidos, ['F3']);
    const vina = evaluar(ejemplo({ comunaId: 'valparaiso' }), 'b08');
    assert.equal(vina.hayMatch, true);
  });

  it('M3: al menos un turno en común', () => {
    const r = evaluar(ejemplo(), 'b04');
    assert.deepEqual(r.filtrosFallidos, ['M3']);
    assert.equal(evaluar(ejemplo({ turnos: ['dia', 'noche'] }), 'b04').hayMatch, true);
  });

  it('cada regla se puede apagar o volver filtro desde el panel', () => {
    const sinTurno = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b04'), catalogo, reglas: reglas({ M3: { uso: 'apagado' } }) });
    assert.equal(sinTurno.hayMatch, true);
    const zonaFiltro = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b03'), catalogo, reglas: reglas({ M2: { uso: 'filtro' } }) });
    assert.deepEqual(zonaFiltro.filtrosFallidos, ['M2']);
    assert.equal(zonaFiltro.evaluadas, 3);
  });
});

describe('match: condiciones previas', () => {
  const casos: [string, Partial<ConductorParaMatch>, Partial<EntradaMatch>, string][] = [
    ['perfil incompleto', { estadoPerfil: 'incompleto' }, {}, 'perfil_incompleto'],
    ['sin verificar', { estadoVerificacion: 'en_revision' }, {}, 'no_verificado'],
    ['no disponible', { disponible: false }, {}, 'no_disponible'],
    ['bloqueado', {}, { bloqueado: true }, 'bloqueado'],
    ['titular suspendido', {}, { titularSuspendido: true }, 'cuenta_suspendida'],
  ];
  for (const [nombre, cambios, extra, esperado] of casos) {
    it(nombre, () => {
      const r = evaluar(ejemplo(cambios), 'b01', extra);
      assert.equal(r.hayMatch, false);
      assert.equal(r.precondicionFallida, esperado);
    });
  }

  it('búsqueda pausada', () => {
    const r = evaluar(ejemplo(), 'b12');
    assert.equal(r.precondicionFallida, 'busqueda_no_activa');
  });

  it('negocio o industria apagados', () => {
    const colectivo: Busqueda = { ...busqueda('b01'), negocioId: 'taxi_colectivo' };
    assert.equal(evaluar(ejemplo({ negocios: ['taxi_colectivo'] }), colectivo).precondicionFallida, 'negocio_inactivo');
    const industriasApagadas = INDUSTRIAS.map((i) => ({ ...i, activo: false }));
    const r = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b01'), catalogo: { ...catalogo, industrias: industriasApagadas }, reglas: reglas() });
    assert.equal(r.precondicionFallida, 'negocio_inactivo');
  });
});

describe('licencias y experiencia', () => {
  const negocio = (id: string) => NEGOCIOS.find((n) => n.id === id)!;

  it("'B' incluye las clases que habilitan B", () => {
    assert.equal(habilitaNegocio(['A2'], negocio('aplicacion'), null, CLASES_LICENCIA), true);
    assert.equal(habilitaNegocio(['C'], negocio('aplicacion'), null, CLASES_LICENCIA), false);
  });

  it('la respuesta sobre el vehículo define la licencia exigida', () => {
    const carga = negocio('carga_urbano');
    assert.equal(habilitaNegocio(['B'], carga, 'hasta_3500', CLASES_LICENCIA), true);
    assert.equal(habilitaNegocio(['B'], carga, 'mas_de_3500', CLASES_LICENCIA), false);
    assert.equal(habilitaNegocio(['A4'], carga, 'mas_de_3500', CLASES_LICENCIA), true);
    assert.equal(habilitaNegocio(['A4'], carga, 'tracto', CLASES_LICENCIA), false);
  });

  it('M4 usa la categoría relacionada con más años', () => {
    assert.equal(aniosEnNegocio({ liviano: 2, van: 6 }, negocio('taxi_colectivo')), 6);
    assert.equal(aniosEnNegocio({ van: 6 }, negocio('taxi')), 0);
  });

  it('texto "Pide licencia" para los negocios en gris', () => {
    assert.equal(textoPideLicencia(negocio('bus_interurbano')), 'Pide licencia A3');
    assert.equal(textoPideLicencia(negocio('moto_delivery')), 'Pide licencia C');
    assert.equal(textoPideLicencia(negocio('taxi')), 'Pide licencia A1, A2 o A3');
  });

  it('las zonas editables cambian el resultado (Santiago movida a Zona Oriente)', () => {
    const comunas = COMUNAS.map((c) => (c.id === 'santiago' ? { ...c, zonaId: 'r07-z3' } : c));
    const r = evaluarMatch({ conductor: ejemplo(), busqueda: busqueda('b03'), catalogo: { ...catalogo, comunas }, reglas: reglas() });
    assert.equal(r.porcentaje, 96);
    assert.deepEqual(r.noCoinciden, ['M7']);
  });
});

describe('bolsa de trabajo (R29)', () => {
  const ve = (id: string, bolsaActiva = true) => {
    const b = busqueda(id);
    return visibleEnBolsa({
      conductor: ejemplo(),
      busqueda: b,
      catalogo,
      reglas: reglas(),
      bolsaActiva,
      enBolsa: b.enBolsa,
      visibilidad: b.visibilidadBolsa,
      perfiles: b.perfilesBolsa,
    });
  };

  it('ve las ofertas para todos, las de match y las de perfiles que cumple', () => {
    assert.equal(ve('b13'), true, 'todos los conductores (sin match)');
    assert.equal(ve('b11'), true, 'todos los conductores (otro turno)');
    assert.equal(ve('b01'), true, 'solo match, y hay match');
    assert.equal(ve('b14'), true, 'perfiles: Zona Oriente');
  });

  it('no ve las de otra región, las de match sin match ni las de perfiles que no cumple', () => {
    assert.equal(ve('b09'), false, 'otra región');
    assert.equal(ve('b05'), false, 'solo match, sin match');
    assert.equal(ve('b06'), false, 'perfiles: solo Zona Sur');
    assert.equal(ve('b02'), false, 'no está publicada');
  });

  it('con la bolsa apagada no se ve nada', () => {
    assert.equal(ve('b13', false), false);
  });
});

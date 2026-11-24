// Cómo se lleva lo guardado en el navegador a la versión actual del estado. Es una función pura que
// recibe el estado inicial (así no carga la semilla y se prueba con Node: tests/migracion.test.ts).
// La usa migrarEstado (estado.ts).
import type { DatosDemo, TitularDemo } from './estado';
import { registroTitularEjemplo } from './titularRegistro.ts';

/**
 * Lo guardado antes de la versión 5 (24-nov) no tiene registro del titular: era siempre la empresa de
 * ejemplo (t01), así que se completa como ya registrada.
 */
function titularDemoV5(viejo: Partial<DatosDemo>, inicial: DatosDemo): TitularDemo {
  const t = viejo.titularDemo as Partial<TitularDemo> | undefined;
  if (!t) return inicial.titularDemo;
  return {
    ...inicial.titularDemo,
    ...t,
    registro: t.registro ?? registroTitularEjemplo(),
    contactoMostrado: t.contactoMostrado ?? {},
  } as TitularDemo;
}

/**
 * La versión 6 (24-nov) agrega la flota: los vehículos de ejemplo, las listas de marcas y colores, los
 * vehículos por plan y el aviso de vencimientos. A lo guardado antes se le suman los de la semilla.
 */
function completarV6(d: DatosDemo, inicial: DatosDemo): DatosDemo {
  const porPlan = new Map(inicial.catalogos.planes.map((p) => [p.id, p.vehiculos]));
  const vehiculos = d.vehiculos ?? inicial.vehiculos;
  const ligados = new Map(inicial.busquedas.map((b) => [b.id, b.vehiculoIds ?? []]));
  return {
    ...d,
    vehiculos,
    busquedas: (d.busquedas ?? []).map((b) => (b.vehiculoIds ? b : { ...b, vehiculoIds: ligados.get(b.id) ?? [] })),
    catalogos: {
      ...d.catalogos,
      marcas: d.catalogos.marcas ?? inicial.catalogos.marcas,
      colores: d.catalogos.colores ?? inicial.catalogos.colores,
      planes: d.catalogos.planes.map((p) => (p.vehiculos === undefined ? { ...p, vehiculos: porPlan.get(p.id) ?? p.busquedasActivas } : p)),
    },
    ajustes: { ...inicial.ajustes, ...d.ajustes },
  };
}

/**
 * - Desde la versión 6: se conserva todo.
 * - Desde la versión 5: se conserva todo y se agrega la flota.
 * - Desde las versiones 3 y 4: se conserva todo y el titular de la demo queda como la empresa de ejemplo ya
 *   registrada (antes del 24-nov no había registro del titular).
 * - Desde la versión 3 (7-nov): se conserva todo (progreso, catálogos, reglas, ajustes, suspensiones y
 *   equipo). La 4 solo agrega la revisión manual, que vive en su propia clave (revisionManual.ts).
 * - Desde la versión 2 (la demo del 4-nov, con el panel dentro): se conserva lo que hizo la persona, pero
 *   los catálogos, las reglas del match y los ajustes vuelven a sus valores iniciales y las cuentas
 *   suspendidas se reactivan (lo que se cambió en ese panel ya no se podía deshacer).
 * - Desde otra versión, o si lo guardado no se entiende: se parte de cero.
 */
export function migrarDatos(guardado: unknown, version: number, inicial: DatosDemo): DatosDemo {
  if (!guardado || typeof guardado !== 'object' || Array.isArray(guardado)) return inicial;
  const viejo = guardado as Partial<DatosDemo>;
  // 'admin' era el rol del panel cuando estaba dentro de la demo (versión 2).
  const rol = (viejo.rol as string | null | undefined) === 'admin' ? null : (viejo.rol ?? null);
  if (version === 6) return { ...inicial, ...viejo, version: inicial.version, rol };
  if (version === 5) return completarV6({ ...inicial, ...viejo, version: inicial.version, rol }, inicial);
  if (version === 3 || version === 4) {
    return completarV6({ ...inicial, ...viejo, version: inicial.version, rol, titularDemo: titularDemoV5(viejo, inicial) }, inicial);
  }
  if (version === 2) {
    return completarV6({
      ...inicial,
      ...viejo,
      version: inicial.version,
      rol,
      titularDemo: titularDemoV5(viejo, inicial),
      catalogos: inicial.catalogos,
      reglas: inicial.reglas,
      ajustes: inicial.ajustes,
      titulares: (viejo.titulares ?? inicial.titulares).map((t) => ({ ...t, suspendido: false })),
      conductores: (viejo.conductores ?? inicial.conductores).map((c) => ({ ...c, suspendido: false })),
    }, inicial);
  }
  return inicial;
}

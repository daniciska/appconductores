// Cómo se lleva lo guardado en el navegador a la versión actual del estado. Es una función pura que
// recibe el estado inicial (así no carga la semilla y se prueba con Node: tests/migracion.test.ts).
// La usa migrarEstado (estado.ts).
import type { DatosDemo } from './estado';

/**
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
  if (version === 3) return { ...inicial, ...viejo, version: inicial.version, rol };
  if (version === 2) {
    return {
      ...inicial,
      ...viejo,
      version: inicial.version,
      rol,
      catalogos: inicial.catalogos,
      reglas: inicial.reglas,
      ajustes: inicial.ajustes,
      titulares: (viejo.titulares ?? inicial.titulares).map((t) => ({ ...t, suspendido: false })),
      conductores: (viejo.conductores ?? inicial.conductores).map((c) => ({ ...c, suspendido: false })),
    };
  }
  return inicial;
}

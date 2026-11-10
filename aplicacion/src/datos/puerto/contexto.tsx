// Proveedor de la interfaz de datos y los hooks que usan las pantallas compartidas.
//   const nombres = useVista((v) => v.cuenta.nombres);     // un valor (igual que useDemo(selector))
//   const avance = useVistaDerivada(avancePerfil);          // algo calculado, memorizado
//   const acciones = useAcciones();                         // await acciones.guardarPaso1(...)
//   const entorno = useEntorno();                           // demo o real (textos, esperas, ajustes)
// Si falta el proveedor, los hooks lanzan un error: nunca se cae en la demo sin avisar.
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AccionesConductor, Entorno, VistaConductor } from './tipos';

/** Lo que entrega cada implementación (demo o real). Los "use…" son hooks: se llaman en cada render. */
export interface ImplementacionPuerto {
  /** Lee un valor de la vista (como useDemo(selector): con Object.is entre renders). */
  useVista: <T>(selector: (v: VistaConductor) => T) => T;
  /** La vista completa (para cálculos derivados). */
  useVistaCompleta: () => VistaConductor;
  useEntorno: () => Entorno;
  acciones: AccionesConductor;
}

const Contexto = createContext<ImplementacionPuerto | null>(null);

export function ProveedorConductor({ implementacion, children }: { implementacion: ImplementacionPuerto; children: ReactNode }) {
  return <Contexto.Provider value={implementacion}>{children}</Contexto.Provider>;
}

function useImplementacion(): ImplementacionPuerto {
  const i = useContext(Contexto);
  if (!i) throw new Error('Falta <ProveedorConductor> (la interfaz de datos del conductor) en el layout.');
  return i;
}

export function useVista<T>(selector: (v: VistaConductor) => T): T {
  return useImplementacion().useVista(selector);
}

/** Algo calculado sobre la vista completa, memorizado (equivale a useDerivado de la demo). */
export function useVistaDerivada<T>(fn: (v: VistaConductor) => T): T {
  const v = useImplementacion().useVistaCompleta();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => fn(v), [v]);
}

export function useAcciones(): AccionesConductor {
  return useImplementacion().acciones;
}

export function useEntorno(): Entorno {
  return useImplementacion().useEntorno();
}

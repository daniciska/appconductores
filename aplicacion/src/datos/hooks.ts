// Hooks de lectura para las pantallas. Calculan listas derivadas de forma segura (memorizadas sobre
// el estado completo), para no caer en el re-render infinito de un selector que crea arreglos nuevos.
import { useEffect, useMemo, useState } from 'react';

import * as sel from './selectores';
import { useDemo } from './tienda';
import type { DatosDemo } from './estado';

/** Estado completo (se vuelve a pintar con cualquier cambio: bien para una demo). */
export function useEstado(): DatosDemo {
  return useDemo();
}

/** Atajo genérico: deriva algo del estado completo con memo. Ej.: useDerivado((s) => sel.avancePerfil(s)). */
export function useDerivado<T>(fn: (s: DatosDemo) => T): T {
  const s = useDemo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => fn(s), [s]);
}

export const useCatalogos = () => useDemo((s) => s.catalogos);
export const useAjustes = () => useDemo((s) => s.ajustes);
export const useNegociosActivos = () => useDerivado(sel.negociosActivos);
export const useNegociosPorIndustria = (soloActivos = true) => useDerivado((s) => sel.negociosPorIndustria(s, soloActivos));

export const useMatchesDelUsuario = () => useDerivado(sel.matchesDelUsuario);
export const useMatchDelUsuario = (busquedaId: string) => useDerivado((s) => sel.matchDelUsuario(s, busquedaId));
export const useAvancePerfil = () => useDerivado(sel.avancePerfil);
export const useEstadoInicio = () => useDerivado(sel.estadoInicio);
export const useDiagnosticoMatches = () => useDerivado(sel.diagnosticoMatches);
export const useResumenDocumentos = () => useDerivado((s) => sel.resumenDocumentos(s.documentos));
export const useConversaciones = () => useDerivado(sel.conversacionesDelUsuario);
export const useMensajesNoLeidos = () => useDerivado(sel.mensajesNoLeidos);
export const useOfertasBolsa = () => useDerivado(sel.ofertasBolsaDelUsuario);
export const usePostulacionesDelUsuario = () => useDerivado(sel.postulacionesDelUsuario);
export const useEntregasDelUsuario = () => useDerivado(sel.entregasDelUsuario);

export const useTitularDemo = () => useDerivado(sel.titularDeLaDemo);
export const usePlanDemo = () => useDerivado(sel.planDeLaDemo);
export const useBusquedasDelTitular = () => useDerivado(sel.busquedasDelTitularDemo);
export const usePostulantes = (busquedaId: string) => useDerivado((s) => sel.postulantesDeBusqueda(s, busquedaId));
export const useConductoresQueCalzan = (busquedaId: string) => useDerivado((s) => sel.conductoresQueCalzan(s, busquedaId));

export const useTodosLosConductores = () => useDerivado(sel.todosLosConductores);
export const useColaDocumentos = (incluirEnPrerevision = false) =>
  useDerivado((s) => sel.colaDocumentos(s, incluirEnPrerevision));
export const useReportesAbiertos = () => useDerivado(sel.reportesAbiertos);
export const useResumenPanel = () => useDerivado(sel.resumenPanel);

/** true cuando ya se leyó lo guardado en el navegador. */
export function useDemoHidratada(): boolean {
  const [listo, setListo] = useState(() => useDemo.persist.hasHydrated());
  useEffect(() => {
    if (useDemo.persist.hasHydrated()) setListo(true);
    const quitar = useDemo.persist.onFinishHydration(() => setListo(true));
    return quitar;
  }, []);
  return listo;
}

/** Fecha actual que se actualiza cada `cadaMs` (para "hace 5 min"). */
export function useAhora(cadaMs = 30000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(id);
  }, [cadaMs]);
  return ahora;
}

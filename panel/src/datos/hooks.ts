// Hooks de lectura propios del panel (memorizados sobre el estado completo, como los de la demo).
import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';

import { colaDocumentos, reportesAbiertos, resumenPanel } from './lecturas';

export const useTodosLosConductores = () => useDerivado(sel.todosLosConductores);
export const useColaDocumentos = (incluirEnPrerevision = false) => useDerivado((s) => colaDocumentos(s, incluirEnPrerevision));
export const useReportesAbiertos = () => useDerivado(reportesAbiertos);
export const useResumenPanel = () => useDerivado(resumenPanel);

// Titular · Reportar a un conductor (24-nov: se puede reportar en las dos direcciones; sin "Bloquear").
// Ruta: /titular/conductor/[id]/reportar?busqueda=b01
// Usa el mismo formulario que el conductor (FormularioReporte). El reporte lo resuelve el equipo en el panel.
import { router, useLocalSearchParams } from 'expo-router';

import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import { FormularioReporte } from '@/pantallas/matches/Reportar';

import { nombreCorto } from './piezas';

export default function ReportarConductor() {
  const { id, busqueda } = useLocalSearchParams<{ id: string; busqueda?: string }>();
  const conductor = useDerivado((s) => sel.conductorVista(s, id));
  const reportar = useDemo((s) => s.reportarConductor);
  const volverA = `/titular/conductor/${id}${busqueda ? `?busqueda=${busqueda}` : ''}`;
  return (
    <FormularioReporte
      nombreReportado={conductor ? nombreCorto(conductor) : 'este conductor'}
      rolReportado="conductor"
      volverA={volverA}
      alEnviar={(motivo, detalle) => reportar({ conductorId: id, busquedaId: busqueda ?? null, motivo, detalle })}
      alTerminar={() => (router.canGoBack() ? router.back() : router.replace('/titular/busquedas'))}
    />
  );
}

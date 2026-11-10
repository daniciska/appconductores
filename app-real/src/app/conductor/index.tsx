// /conductor: lleva a cada persona a donde corresponde (bienvenida, "Antes de empezar", Paso 1 o Inicio).
import { Redirect } from 'expo-router';

import { useTiendaReal } from '@real/datos/tiendaReal';
import { rutaDeEntrada } from '@real/guardia';

export default function EntradaConductor() {
  const conSesion = useTiendaReal((s) => !!s.uid);
  const autorizacionesCompletas = useTiendaReal((s) => s.autorizacionesCompletas);
  const registrado = useTiendaReal((s) => s.vista.conductor.registrado);
  return <Redirect href={rutaDeEntrada({ conSesion, autorizacionesCompletas, registrado, codigoPedido: false })} />;
}

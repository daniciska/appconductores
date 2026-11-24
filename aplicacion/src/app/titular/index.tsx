// /titular · Entrada del titular: si falta un paso del registro, lleva a ese paso; si no, a Mis búsquedas.
import { Redirect } from 'expo-router';

import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { rutaRegistroTitular } from '@/pantallas/titular/piezas';

export default function EntradaTitular() {
  const paso = useDerivado(sel.pasoRegistroTitular);
  return <Redirect href={rutaRegistroTitular(paso)} />;
}

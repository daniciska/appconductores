// /conductor: entra a Inicio si ya se registró; si no, a la Bienvenida (A1).
import { Redirect } from 'expo-router';

import { useDemo } from '@/datos/tienda';

export default function EntradaConductor() {
  const registrado = useDemo((s) => s.conductor.registrado);
  return <Redirect href={registrado ? '/conductor/inicio' : '/conductor/bienvenida'} />;
}

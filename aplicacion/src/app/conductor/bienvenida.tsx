// /conductor/bienvenida · A1 · Bienvenida. Envoltorio delgado: la pantalla está en src/pantallas/ingreso/Bienvenida.tsx
// En la demo, "Tengo vehículos" lleva a la demo del titular.
import { router } from 'expo-router';

import Bienvenida from '@/pantallas/ingreso/Bienvenida';

export default function RutaBienvenida() {
  return <Bienvenida alElegirTitular={() => router.push('/titular')} />;
}

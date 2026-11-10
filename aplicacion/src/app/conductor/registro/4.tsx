// /conductor/registro/4 · B4 · Paso 4: qué trabajo buscas. Envoltorio delgado: la pantalla está en src/pantallas/ingreso/Paso4.tsx
// En la demo, "Continuar" sigue al Paso 5 (documentos).
import { router } from 'expo-router';

import Paso4 from '@/pantallas/ingreso/Paso4';

export default function RutaPaso4() {
  return <Paso4 alTerminar={() => router.push('/conductor/registro/5')} />;
}

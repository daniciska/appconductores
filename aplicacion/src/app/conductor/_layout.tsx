// Layout del conductor: columna de celular centrada, pila de pantallas y botón "Demo".
import { useEffect } from 'react';
import { Stack } from 'expo-router';

import { useDemo } from '@/datos/tienda';
import { BotonDemo, MarcoCelular, color } from '@/ui';

export default function LayoutConductor() {
  const elegirRol = useDemo((s) => s.elegirRol);
  useEffect(() => {
    elegirRol('conductor');
  }, [elegirRol]);
  return (
    <MarcoCelular>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.fondo } }} />
      <BotonDemo />
    </MarcoCelular>
  );
}

// Layout del conductor: columna de celular centrada, pila de pantallas y botón "Demo".
import { useEffect } from 'react';
import { Stack } from 'expo-router';

import { useDemo } from '@/datos/tienda';
import { MarcoCelular, color } from '@/ui';
import { BotonDemo } from '@/ui/demo';

export default function LayoutConductor() {
  const elegirRol = useDemo((s) => s.elegirRol);
  useEffect(() => {
    elegirRol('conductor');
  }, [elegirRol]);
  return (
    <MarcoCelular bandaDemo>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.fondo } }} />
      <BotonDemo />
    </MarcoCelular>
  );
}

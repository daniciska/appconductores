// Pestañas del conductor en la v1: solo Inicio y Perfil (matches, mensajes y bolsa llegan después).
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';

import { BarraInferior, color, type PestanaBarra } from '@/ui';
import { House, UserRound } from '@/ui/iconos';

const PESTANAS: PestanaBarra[] = [
  { clave: 'inicio', etiqueta: 'Inicio', icono: House, href: '/conductor/inicio' },
  { clave: 'perfil', etiqueta: 'Perfil', icono: UserRound, href: '/conductor/perfil' },
];

function Barra({ state, navigateToTab }: BottomTabBarProps) {
  const activa = state.routes[state.index]?.name ?? 'inicio';
  const elegir = (p: PestanaBarra) => {
    const ruta = state.routes.find((r) => r.name === p.clave);
    if (ruta) navigateToTab(ruta.key);
  };
  return <BarraInferior pestanas={PESTANAS} activa={activa} onElegir={elegir} />;
}

export default function LayoutPestanas() {
  return (
    <Tabs tabBar={(props) => <Barra {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.fondo } }}>
      <Tabs.Screen name="inicio" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

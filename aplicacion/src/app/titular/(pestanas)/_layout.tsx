// Pestañas del titular: Búsquedas, Flota, Favoritos y Perfil (prototipo del 24-nov).
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';

import { BarraInferior, color, type PestanaBarra } from '@/ui';
import { CarFront, Search, Star, UserRound } from '@/ui/iconos';

function Barra({ state, navigateToTab }: BottomTabBarProps) {
  const pestanas: PestanaBarra[] = [
    { clave: 'busquedas', etiqueta: 'Búsquedas', icono: Search, href: '/titular/busquedas' },
    { clave: 'flota', etiqueta: 'Flota', icono: CarFront, href: '/titular/flota' },
    { clave: 'favoritos', etiqueta: 'Favoritos', icono: Star, href: '/titular/favoritos' },
    { clave: 'perfil', etiqueta: 'Perfil', icono: UserRound, href: '/titular/perfil' },
  ];
  const activa = state.routes[state.index]?.name ?? 'busquedas';
  const elegir = (p: PestanaBarra) => {
    const ruta = state.routes.find((r) => r.name === p.clave);
    if (ruta) navigateToTab(ruta.key);
  };
  return <BarraInferior pestanas={pestanas} activa={activa} onElegir={elegir} />;
}

export default function LayoutPestanasTitular() {
  return (
    <Tabs tabBar={(props) => <Barra {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.fondo } }}>
      <Tabs.Screen name="busquedas" options={{ title: 'Búsquedas' }} />
      <Tabs.Screen name="flota" options={{ title: 'Flota' }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

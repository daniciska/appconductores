// Pestañas del conductor: Inicio, Matches, Bolsa (solo si la bolsa está activa), Mensajes y Perfil.
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';

import { useMensajesNoLeidos } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import { BarraInferior, color, type PestanaBarra } from '@/ui';
import { BriefcaseBusiness, CircleCheck, House, MessageSquare, UserRound } from '@/ui/iconos';

function Barra({ state, navigateToTab }: BottomTabBarProps) {
  const bolsaActiva = useDemo((s) => s.ajustes.bolsaActiva);
  const noLeidos = useMensajesNoLeidos();
  const pestanas: PestanaBarra[] = [
    { clave: 'inicio', etiqueta: 'Inicio', icono: House, href: '/conductor/inicio' },
    { clave: 'matches', etiqueta: 'Matches', icono: CircleCheck, href: '/conductor/matches' },
    ...(bolsaActiva
      ? [{ clave: 'bolsa', etiqueta: 'Bolsa', icono: BriefcaseBusiness, href: '/conductor/bolsa' as const }]
      : []),
    {
      clave: 'mensajes',
      etiqueta: 'Mensajes',
      icono: MessageSquare,
      href: '/conductor/mensajes',
      punto: noLeidos > 0,
      etiquetaAccesible: noLeidos > 0 ? `Mensajes, ${noLeidos} ${noLeidos === 1 ? 'nuevo' : 'nuevos'}` : 'Mensajes',
    },
    { clave: 'perfil', etiqueta: 'Perfil', icono: UserRound, href: '/conductor/perfil' },
  ];
  const activa = state.routes[state.index]?.name ?? 'inicio';
  const elegir = (p: PestanaBarra) => {
    const ruta = state.routes.find((r) => r.name === p.clave);
    if (ruta) navigateToTab(ruta.key);
  };
  return <BarraInferior pestanas={pestanas} activa={activa} onElegir={elegir} />;
}

export default function LayoutPestanas() {
  return (
    <Tabs
      tabBar={(props) => <Barra {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.fondo } }}>
      <Tabs.Screen name="inicio" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      <Tabs.Screen name="bolsa" options={{ title: 'Bolsa' }} />
      <Tabs.Screen name="mensajes" options={{ title: 'Mensajes' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

// Layout del panel de administración: ancho completo, barra lateral en escritorio y menú en celular.
// No es ruta del mockup: estaba en src/app/admin/_layout.tsx y queda guardado para la app del panel
// (ver src/panel/README.md). Si vuelve a ser ruta, va en el _layout.tsx de la carpeta del panel.
import { useEffect } from 'react';
import { Slot, usePathname } from 'expo-router';

import { useColaDocumentos, useReportesAbiertos } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import { rutaPanel, seccionDeRuta } from '@/panel/enlaces';
import { MarcoPanel, type ElementoPanel } from '@/panel/marco';
import {
  FileCheck,
  Flag,
  LayoutDashboard,
  ListChecks,
  Map as IconoMapa,
  Settings,
  SlidersHorizontal,
  Users,
  UserRound,
} from '@/ui/iconos';

export default function LayoutPanel() {
  const elegirRol = useDemo((s) => s.elegirRol);
  useEffect(() => {
    elegirRol('admin');
  }, [elegirRol]);
  const cola = useColaDocumentos().length;
  const reportes = useReportesAbiertos().length;
  const ruta = usePathname();

  const elementos: ElementoPanel[] = [
    { clave: 'resumen', etiqueta: 'Resumen', icono: LayoutDashboard, href: rutaPanel('resumen') },
    { clave: 'documentos', etiqueta: 'Documentos', icono: FileCheck, href: rutaPanel('documentos'), contador: cola },
    { clave: 'conductores', etiqueta: 'Conductores', icono: UserRound, href: rutaPanel('conductores') },
    { clave: 'reportes', etiqueta: 'Reportes', icono: Flag, href: rutaPanel('reportes'), contador: reportes },
    { clave: 'match', etiqueta: 'Reglas del match', icono: SlidersHorizontal, href: rutaPanel('match') },
    { clave: 'catalogos', etiqueta: 'Catálogos', icono: ListChecks, href: rutaPanel('catalogos') },
    { clave: 'zonas', etiqueta: 'Zonas y comunas', icono: IconoMapa, href: rutaPanel('zonas') },
    { clave: 'ajustes', etiqueta: 'Ajustes', icono: Settings, href: rutaPanel('ajustes') },
    { clave: 'equipo', etiqueta: 'Equipo', icono: Users, href: rutaPanel('equipo') },
  ];
  const seccion = seccionDeRuta(ruta);

  return (
    <MarcoPanel elementos={elementos} activa={seccion}>
      <Slot />
    </MarcoPanel>
  );
}

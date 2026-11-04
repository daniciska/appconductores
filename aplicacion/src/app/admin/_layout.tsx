// Layout del panel de administración: ancho completo, barra lateral en escritorio y menú en celular.
import { useEffect } from 'react';
import { Slot, usePathname } from 'expo-router';

import { useColaDocumentos, useReportesAbiertos } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import { MarcoPanel, type ElementoPanel } from '@/ui';
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
    { clave: 'resumen', etiqueta: 'Resumen', icono: LayoutDashboard, href: '/admin' },
    { clave: 'documentos', etiqueta: 'Documentos', icono: FileCheck, href: '/admin/documentos', contador: cola },
    { clave: 'conductores', etiqueta: 'Conductores', icono: UserRound, href: '/admin/conductores' },
    { clave: 'reportes', etiqueta: 'Reportes', icono: Flag, href: '/admin/reportes', contador: reportes },
    { clave: 'match', etiqueta: 'Reglas del match', icono: SlidersHorizontal, href: '/admin/match' },
    { clave: 'catalogos', etiqueta: 'Catálogos', icono: ListChecks, href: '/admin/catalogos' },
    { clave: 'zonas', etiqueta: 'Zonas y comunas', icono: IconoMapa, href: '/admin/zonas' },
    { clave: 'ajustes', etiqueta: 'Ajustes', icono: Settings, href: '/admin/ajustes' },
    { clave: 'equipo', etiqueta: 'Equipo', icono: Users, href: '/admin/equipo' },
  ];
  const seccion = ruta.replace(/^\/admin\/?/, '').split('/')[0] || 'resumen';

  return (
    <MarcoPanel elementos={elementos} activa={seccion}>
      <Slot />
    </MarcoPanel>
  );
}

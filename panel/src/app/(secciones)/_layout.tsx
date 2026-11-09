// Layout de las secciones del panel (/panel/resumen, /panel/documentos…): marco con barra lateral en
// escritorio y menú en celular. Sin rol elegido en esta pestaña (o al salir del panel, o con "Reiniciar
// demo" en la demo del conductor) vuelve a la portada.
import { useEffect } from 'react';
import { Redirect, Slot, usePathname } from 'expo-router';

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
import { useDemo } from '@/datos/tienda';

import { useColaDocumentos, useReportesAbiertos } from '@panel/datos/hooks';
import { IDS_REPORTES_DE_EJEMPLO } from '@panel/datos/semillaPanel';
import { rutaPanel, seccionDeRuta } from '@panel/enlaces';
import { MarcoPanel, type ElementoPanel } from '@panel/marco';
import { prepararDatosDelPanel, useRolPanel } from '@panel/sesion';

export default function LayoutSecciones() {
  const rol = useRolPanel();
  const cola = useColaDocumentos().length;
  const reportes = useReportesAbiertos().length;
  // Faltan los datos de ejemplo del panel (por ejemplo, al recargar después de "Reiniciar demo").
  const faltanDatos = useDemo(
    (s) => (s.equipo.length === 0 && s.accionesEquipo.length === 0) || !s.reportes.some((r) => IDS_REPORTES_DE_EJEMPLO.includes(r.id)),
  );
  const ruta = usePathname();

  // Con el panel en uso, el equipo y los reportes de ejemplo deben estar.
  useEffect(() => {
    if (rol && faltanDatos) prepararDatosDelPanel();
  }, [rol, faltanDatos]);

  if (!rol) return <Redirect href="/" />;

  const elementos: ElementoPanel[] = [
    { clave: 'resumen', etiqueta: 'Resumen', icono: LayoutDashboard, href: rutaPanel('resumen'), grupo: 'inicio' },
    { clave: 'documentos', etiqueta: 'Documentos', icono: FileCheck, href: rutaPanel('documentos'), contador: cola, grupo: 'revision' },
    { clave: 'conductores', etiqueta: 'Conductores', icono: UserRound, href: rutaPanel('conductores'), grupo: 'revision' },
    { clave: 'reportes', etiqueta: 'Reportes', icono: Flag, href: rutaPanel('reportes'), contador: reportes, grupo: 'revision' },
    { clave: 'match', etiqueta: 'Reglas del match', icono: SlidersHorizontal, href: rutaPanel('match'), grupo: 'configuracion' },
    { clave: 'catalogos', etiqueta: 'Catálogos', icono: ListChecks, href: rutaPanel('catalogos'), grupo: 'configuracion' },
    { clave: 'zonas', etiqueta: 'Zonas y comunas', icono: IconoMapa, href: rutaPanel('zonas'), grupo: 'configuracion' },
    { clave: 'ajustes', etiqueta: 'Ajustes', icono: Settings, href: rutaPanel('ajustes'), grupo: 'configuracion' },
    { clave: 'equipo', etiqueta: 'Equipo', icono: Users, href: rutaPanel('equipo'), grupo: 'configuracion' },
  ];

  return (
    <MarcoPanel elementos={elementos} activa={seccionDeRuta(ruta)} rol={rol}>
      <Slot />
    </MarcoPanel>
  );
}

// Datos de ejemplo que solo usa el panel (nombres inventados): el equipo con sus primeras acciones y dos
// reportes abiertos entre personas ficticias. La demo del conductor parte sin ellos: el panel los agrega
// al entrar, si faltan (ver sesion.ts).
import type { AccionEquipo, MiembroEquipo, Reporte } from '@/datos/tipos';

const DIA_MS = 24 * 60 * 60 * 1000;
const HORA_MS = 60 * 60 * 1000;

const haceDesde = (ahora: number) => (dias: number, horas = 0) => new Date(ahora - dias * DIA_MS - horas * HORA_MS).toISOString();

export function semillaEquipo(ahora = Date.now()): { equipo: MiembroEquipo[]; accionesEquipo: AccionEquipo[] } {
  const hace = haceDesde(ahora);
  return {
    equipo: [
      { id: 'e01', nombre: 'Paula Vergara', celular: '+56 9 5555 0301', rol: 'administrador', activo: true, agregadoEl: hace(45) },
      { id: 'e02', nombre: 'Ignacio Toro', celular: '+56 9 5555 0302', rol: 'revisor', activo: true, agregadoEl: hace(30) },
      { id: 'e03', nombre: 'Camila Rojas', celular: '+56 9 5555 0303', rol: 'revisor', activo: false, agregadoEl: hace(60) },
    ],
    accionesEquipo: [
      { id: 'a01', quien: 'Paula Vergara', que: 'Apagó la industria Transporte de carga', fecha: hace(20) },
      { id: 'a02', quien: 'Ignacio Toro', que: 'Aprobó la Hoja de Vida de Marcela Ortiz Fuenzalida', fecha: hace(20, 2) },
      { id: 'a03', quien: 'Ignacio Toro', que: 'No aprobó la licencia de Andrés Figueroa Lillo (Ilegible)', fecha: hace(4) },
    ],
  };
}

/** Ids de los reportes de ejemplo (para saber si ya están). */
export const IDS_REPORTES_DE_EJEMPLO = ['r01', 'r02'];

/** Dos reportes abiertos entre personas ficticias de la demo (búsquedas b07 y b08). */
export function reportesDeEjemplo(ahora = Date.now()): Reporte[] {
  const hace = haceDesde(ahora);
  const msg = (id: string, autor: 'conductor' | 'titular', texto: string, horasAtras: number) => ({
    id,
    autor,
    texto,
    hora: hace(0, horasAtras),
    leido: true,
  });
  return [
    {
      id: 'r01',
      busquedaId: 'b07',
      quienReporta: { id: 'c02', nombre: 'Luis Henríquez Parra', rol: 'conductor' },
      reportado: { id: 't04', nombre: 'Mónica Sepúlveda Riquelme', rol: 'titular' },
      motivo: 'dinero',
      detalle: 'Me pidió transferir una garantía antes de ver el auto.',
      estado: 'abierto',
      queSeHizo: null,
      reportadoEl: hace(0, 3),
      resueltoEl: null,
      conversacion: [
        msg('r01m1', 'conductor', 'Hola, vi tu búsqueda para fines de semana. ¿Sigue disponible?', 6),
        msg('r01m2', 'titular', 'Hola, sí. Para reservarlo tienes que transferirme $200.000 hoy.', 5),
        msg('r01m3', 'conductor', '¿Puedo ver el auto antes?', 5),
        msg('r01m4', 'titular', 'Primero la transferencia, después coordinamos.', 4),
      ],
    },
    {
      id: 'r02',
      busquedaId: 'b08',
      quienReporta: { id: 't05', nombre: 'Taxis Bahía Azul Ltda.', rol: 'titular' },
      reportado: { id: 'c09', nombre: 'Patricio Leiva Contreras', rol: 'conductor' },
      motivo: 'spam',
      detalle: 'Envía publicidad de un curso en vez de hablar de la oferta.',
      estado: 'abierto',
      queSeHizo: null,
      reportadoEl: hace(1, 2),
      resueltoEl: null,
      conversacion: [
        msg('r02m1', 'conductor', 'Hola, ¿te interesa un curso para sacar la licencia profesional? Escríbeme a mi número.', 30),
        msg('r02m2', 'titular', 'Hola, buscamos conductor para el taxi, no un curso.', 29),
        msg('r02m3', 'conductor', 'Tengo cupos con descuento esta semana, aprovecha.', 28),
      ],
    },
  ];
}

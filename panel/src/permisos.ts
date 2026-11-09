// Qué puede hacer cada rol del equipo en el panel de la demo. Sin dependencias (se prueba con Node:
// tests/permisos.test.ts). Fuentes:
// - DECIDIDO (CLAUDE.md, P8): las dudas y los rechazos de documentos los decide una persona del equipo.
// - Lo que hoy permite la base (Etapa 1, supabase/): solo un administrador escribe catálogos, zonas,
//   ajustes (umbral incluido) y la lista del equipo, nunca su propia fila; cualquier persona del equipo
//   puede cambiar el estado de otras cuentas. Que la base lo permita NO decide quién suspende: eso está
//   pendiente (MD52, decisión 8 de la propuesta del panel).
// - PROPUESTA, por confirmar (docs/modelo-datos.json y docs/propuesta-panel-administracion.md): reportes
//   los resuelve el equipo (R18); pesos y filtros del match, solo el administrador (R22); el registro de
//   acciones lo ven solo los administradores; el revisor también suspende y reactiva conductores y
//   titulares (MD52).
import type { RolEquipo } from '@/datos/tipos';

export type Permiso =
  /** Aprobar o no aprobar documentos (y abrir el archivo, que queda registrado). */
  | 'decidir_documentos'
  /** Leer la conversación reportada y resolver el reporte. */
  | 'resolver_reportes'
  /** Suspender o reactivar conductores y titulares (para el revisor, propuesta por confirmar: MD52). */
  | 'suspender_cuentas'
  /** Umbral, uso y peso de las reglas del match. */
  | 'cambiar_reglas'
  /** Encender o apagar negocios e industrias y cambiar nombres. */
  | 'cambiar_catalogos'
  /** Crear y renombrar zonas y mover comunas. */
  | 'cambiar_zonas'
  /** Bolsa de trabajo, plazos y ajustes de la demo. */
  | 'cambiar_ajustes'
  /** Agregar personas al equipo, cambiar su rol o su acceso (nunca la propia). */
  | 'gestionar_equipo'
  /** Ver el registro de acciones del equipo. */
  | 'ver_registro';

const DEL_EQUIPO: Permiso[] = ['decidir_documentos', 'resolver_reportes', 'suspender_cuentas'];
const SOLO_ADMINISTRADOR: Permiso[] = [
  'cambiar_reglas',
  'cambiar_catalogos',
  'cambiar_zonas',
  'cambiar_ajustes',
  'gestionar_equipo',
  'ver_registro',
];

export const PERMISOS: Record<RolEquipo, ReadonlySet<Permiso>> = {
  revisor: new Set(DEL_EQUIPO),
  administrador: new Set([...DEL_EQUIPO, ...SOLO_ADMINISTRADOR]),
};

export function puede(rol: RolEquipo | null | undefined, permiso: Permiso): boolean {
  return !!rol && PERMISOS[rol].has(permiso);
}

export const NOMBRE_ROL: Record<RolEquipo, string> = { administrador: 'Administrador', revisor: 'Revisor' };

/** Cómo firma la persona que usa la demo en el registro ("Tú (revisor)"). Empieza con "Tú" (avatar). */
export function firmaDe(rol: RolEquipo | null | undefined): string {
  return rol ? `Tú (${NOMBRE_ROL[rol].toLowerCase()})` : 'Tú';
}

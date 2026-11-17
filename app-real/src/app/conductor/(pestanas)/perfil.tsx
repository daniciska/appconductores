// /conductor/perfil · E1 · Perfil de la v1: lo común con la demo (aplicacion/src/pantallas/documentos/PerfilBase.tsx),
// sin "Seguridad y privacidad" ni "Eliminar mi cuenta". "Cerrar sesión" cierra la sesión solo en este equipo
// (también sin conexión) y lleva a la Bienvenida.
import { useAcciones } from '@/datos/puerto/contexto';
import { PerfilBase, type PreguntaAyuda } from '@/pantallas/documentos/PerfilBase';
import { irABienvenidaTrasCerrarSesion } from '@/pantallas/ingreso/acciones';

/**
 * Centro de ayuda de la v1 (propuesta S14): solo lo que calza con lo que la app pide hoy. "¿Quién ve
 * mis documentos?" y "¿Quién ve mi dirección?" vuelven cuando la app pida documentos y dirección.
 */
const PREGUNTAS_V1: PreguntaAyuda[] = [
  {
    p: '¿Cuándo aparezco en los matches?',
    r: 'Cuando completes tu perfil, tus documentos estén aprobados y estés disponible para trabajar.',
  },
  { p: '¿Cómo dejo de aparecer por un tiempo?', r: 'Apaga "Disponible para trabajar". Puedes volver cuando quieras.' },
];

export default function RutaPerfil() {
  const acciones = useAcciones();
  return (
    <PerfilBase
      preguntasAyuda={PREGUNTAS_V1}
      alCerrarSesion={async () => {
        await acciones.cerrarSesion();
        irABienvenidaTrasCerrarSesion();
      }}
    />
  );
}

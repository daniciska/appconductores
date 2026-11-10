// /conductor/perfil · E1 · Perfil de la v1: lo común con la demo (aplicacion/src/pantallas/documentos/PerfilBase.tsx),
// sin "Seguridad y privacidad" ni "Eliminar mi cuenta". "Cerrar sesión" cierra la sesión solo en este equipo
// (también sin conexión) y lleva a la Bienvenida.
import { useAcciones } from '@/datos/puerto/contexto';
import { PerfilBase } from '@/pantallas/documentos/PerfilBase';
import { irABienvenidaTrasCerrarSesion } from '@/pantallas/ingreso/acciones';

export default function RutaPerfil() {
  const acciones = useAcciones();
  return (
    <PerfilBase
      alCerrarSesion={async () => {
        await acciones.cerrarSesion();
        irABienvenidaTrasCerrarSesion();
      }}
    />
  );
}

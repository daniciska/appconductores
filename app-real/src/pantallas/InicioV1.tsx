// Inicio de la app real v1 (perfil incompleto): saludo con la insignia "Perfil incompleto" y la vista
// común con la demo (aplicacion/src/pantallas/documentos/VistaIncompleta.tsx), con los documentos como
// "Próximamente": en la v1 todavía no se suben (Etapa 3 de la base y revisión del abogado).
import { useNavigation } from 'expo-router';

import { iniciales } from '@/datos/formato';
import { useVista } from '@/datos/puerto/contexto';
import { Saludo } from '@/pantallas/documentos/piezas';
import { VistaIncompleta } from '@/pantallas/documentos/VistaIncompleta';
import { Pantalla } from '@/ui';
import { Clock } from '@/ui/iconos';

type Navegacion = { dispatch: (accion: { type: string; payload?: Record<string, unknown> }) => void };

export default function InicioV1() {
  const navigation = useNavigation() as unknown as Navegacion;
  const nombres = useVista((v) => v.cuenta.nombres);
  const apellido = useVista((v) => v.cuenta.apellido1);
  const nombre = nombres.trim().split(/\s+/)[0] || 'Conductor';

  return (
    <Pantalla inferior={24}>
      <Saludo
        nombre={nombre}
        iniciales={iniciales(`${nombre} ${apellido}`.trim())}
        insignia={{ texto: 'Perfil incompleto', tono: 'amarilla', icono: Clock }}
        onAvatar={() => navigation.dispatch({ type: 'NAVIGATE', payload: { name: 'perfil' } })}
      />
      <VistaIncompleta documentos={{ modo: 'proximamente' }} nota="Mientras tu perfil esté incompleto, no apareces en los matches." />
    </Pantalla>
  );
}

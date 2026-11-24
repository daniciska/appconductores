// /conductor/perfil · E1 · Perfil (app real): lo común con la demo (aplicacion/src/pantallas/documentos/PerfilBase.tsx)
// y, como en la maqueta, "Seguridad y privacidad" con "Mis documentos" (con "Vence pronto" si toca).
// Sin "Quién recibió mis datos", "Conversaciones bloqueadas" ni "Eliminar mi cuenta" (llegan con los
// matches y los mensajes). "Cerrar sesión" cierra la sesión solo en este equipo (también sin conexión)
// y lleva a la Bienvenida.
import { View } from 'react-native';

import { useAcciones } from '@/datos/puerto/contexto';
import { PerfilBase, type PreguntaAyuda } from '@/pantallas/documentos/PerfilBase';
import { irABienvenidaTrasCerrarSesion } from '@/pantallas/ingreso/acciones';
import { FilaLista, GrupoLista, Insignia, TituloSeccion } from '@/ui';
import { Hoja } from '@/ui/iconosPropios';

import { fem } from '@real/datos/documentos';
import { useDocumentos } from '@real/pantallas/documentos/comunes';

/**
 * Centro de ayuda de la app real (S14, aprobada el 24-nov): solo lo que calza con lo que la app pide hoy. "¿Quién ve
 * mis documentos?" volvió con el Paso 5 (documentos); "¿Quién ve mi dirección?" vuelve cuando la app pida la dirección.
 */
const PREGUNTAS_V1: PreguntaAyuda[] = [
  {
    p: '¿Cuándo aparezco en los matches?',
    r: 'Cuando completes tu perfil, tus documentos estén aprobados y estés disponible para trabajar.',
  },
  { p: '¿Quién ve mis documentos?', r: 'Solo nuestro equipo de verificación. Los titulares ven una insignia, nunca tus archivos.' },
  { p: '¿Cómo dejo de aparecer por un tiempo?', r: 'Apaga "Disponible para trabajar". Puedes volver cuando quieras.' },
];

export default function RutaPerfil() {
  const acciones = useAcciones();
  const docs = useDocumentos();
  const aviso = docs.avisos[0] ?? null;
  // El aviso va en el subtítulo (una insignia al lado partía el título en dos líneas).
  const subtitulo = aviso
    ? `${aviso.tipo.corto}: ${aviso.estado === 'vencido' ? fem(aviso.tipo, 'vencida', 'vencido') : 'vence pronto'}`
    : `${docs.listos} de ${docs.total} aprobados`;
  return (
    <PerfilBase
      preguntasAyuda={PREGUNTAS_V1}
      seccionSeguridad={
        <View style={{ gap: 8 }}>
          <TituloSeccion>Seguridad y privacidad</TituloSeccion>
          <GrupoLista>
            <FilaLista
              titulo="Mis documentos"
              subtitulo={subtitulo}
              icono={Hoja}
              href="/conductor/perfil/documentos"
              derecha={aviso ? <Insignia texto="!" tono={aviso.estado === 'vencido' ? 'roja' : 'amarilla'} icono={null} /> : undefined}
            />
          </GrupoLista>
        </View>
      }
      alCerrarSesion={async () => {
        await acciones.cerrarSesion();
        irABienvenidaTrasCerrarSesion();
      }}
    />
  );
}

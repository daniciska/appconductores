// Ruta desconocida.
import { Compass } from '@/ui/iconos';
import { EstadoVacio, MarcoCelular, Pantalla } from '@/ui';

export default function NoEncontrada() {
  return (
    <MarcoCelular>
      <Pantalla>
        <EstadoVacio
          icono={Compass}
          titulo="Esta pantalla no existe"
          texto="Puede que el enlace esté incompleto."
          accion={{ titulo: 'Ir al inicio', href: '/conductor' }}
          style={{ marginTop: 80 }}
        />
      </Pantalla>
    </MarcoCelular>
  );
}

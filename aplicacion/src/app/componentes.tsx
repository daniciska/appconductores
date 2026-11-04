// /componentes · Muestrario del sistema de diseño (src/ui) para revisar cómo se ven los componentes.
// No tiene enlaces desde la demo: es una referencia para quienes construyen pantallas.
import { useState } from 'react';
import { View } from 'react-native';

import {
  Aviso,
  Avatar,
  BarraInferior,
  BarraPasos,
  Boton,
  BotonIcono,
  Campo,
  Chip,
  ControlSegmentado,
  Dialogo,
  Encabezado,
  EstadoVacio,
  FilaCheck,
  FilaDato,
  FilaInterruptor,
  FilaLista,
  FilaRadio,
  GrupoLista,
  HojaInferior,
  Insignia,
  MarcoCelular,
  OpcionIcono,
  Pantalla,
  Separado,
  Stepper,
  Tarjeta,
  Texto,
  Titulo,
  TituloSeccion,
  Volante,
  mostrarToast,
} from '@/ui';
import {
  BriefcaseBusiness,
  CircleCheck,
  Eye,
  FileText,
  House,
  IdCard,
  Inbox,
  MessageSquare,
  Moon,
  Star,
  Sun,
  Trash,
  UserRound,
} from '@/ui/iconos';

export default function Componentes() {
  const [chips, setChips] = useState(['A2', 'B']);
  const [anios, setAnios] = useState(5);
  const [disp, setDisp] = useState(true);
  const [radio, setRadio] = useState('match');
  const [seg, setSeg] = useState<'todos' | 'fav'>('todos');
  const [hoja, setHoja] = useState(false);
  const [dialogo, setDialogo] = useState(false);
  const [correo, setCorreo] = useState('');
  const alternar = (c: string) => setChips((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]));

  return (
    <MarcoCelular>
      <Pantalla>
        <Encabezado paso={3} volverA="/" />
        <Titulo>Componentes</Titulo>
        <Texto variante="parrafo" tono="secundario">
          Muestrario de src/ui con los estilos de las maquetas.
        </Texto>

        <TituloSeccion>Botones</TituloSeccion>
        <Boton titulo="Escribir mensaje" variante="principal" icono={MessageSquare} onPress={() => mostrarToast('Aviso de ejemplo', 'exito')} />
        <Boton titulo="Guardar y continuar" variante="oscuro" />
        <Boton titulo="Guardar y terminar después" variante="contorno" />
        <Boton titulo="Cargando" cargando />
        <Boton titulo="Deshabilitado" deshabilitado />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Boton titulo="Ver" tamano="mediano" />
          <Boton titulo="Ingresar" variante="texto" tamano="mediano" />
          <BotonIcono icono={Star} etiquetaAccesible="Favorito" variante="acento" relleno />
          <BotonIcono icono={Star} etiquetaAccesible="Marcar favorito" variante="suave" colorIcono="#6B6B6B" />
        </View>

        <TituloSeccion>Campos</TituloSeccion>
        <Campo etiqueta="Correo electrónico" obligatorio valor={correo} onCambiar={setCorreo} placeholder="nombre@correo.cl" />
        <Campo etiqueta="Nombres" obligatorio valor="" onCambiar={() => undefined} error="Ingresa tus nombres." />
        <Campo etiqueta="Celular" prefijo="+56 9" valor="5555 0123" onCambiar={() => undefined} ayuda="Te enviaremos un código por WhatsApp." />

        <TituloSeccion>Chips, casillas y radios</TituloSeccion>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['A1', 'A2', 'A3', 'B', 'C'].map((c) => (
            <Chip key={c} etiqueta={c} seleccionado={chips.includes(c)} onPress={() => alternar(c)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d, i) => (
            <Chip key={d} etiqueta={d} forma="cuadrado" seleccionado={i < 6} style={{ flex: 1 }} />
          ))}
        </View>
        <FilaCheck titulo="Taxi ejecutivo" ejemplo="radiotaxi, aeropuerto" marcada />
        <FilaCheck titulo="Bus interurbano" ejemplo="viajes entre ciudades" marcada={false} deshabilitada nota="Pide licencia A3" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <OpcionIcono titulo="Día" icono={Sun} seleccionada />
          <OpcionIcono titulo="Noche" icono={Moon} seleccionada={false} />
        </View>
        <FilaRadio titulo="Solo conductores que hacen match" descripcion="Pasan los filtros y llegan al 66 %." seleccionada={radio === 'match'} onPress={() => setRadio('match')} />
        <FilaRadio titulo="Conductores que tú elijas" seleccionada={radio === 'elijas'} onPress={() => setRadio('elijas')} extra={<Insignia texto="Plan Flota chica" tono="gris" icono={null} />} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Chip etiqueta="Vehículo liviano" subtitulo="auto, SUV, camioneta" seleccionado style={{ flex: 1 }} />
          <Stepper valor={anios} onCambiar={setAnios} etiquetaAccesible="años" />
        </View>
        <FilaInterruptor titulo="Disponible para trabajar" ayuda="Te pediremos confirmarlo cada 30 días." valor={disp} onCambiar={setDisp} />
        <ControlSegmentado opciones={[{ clave: 'todos', etiqueta: 'Todos · 5' }, { clave: 'fav', etiqueta: 'Favoritos · 1' }]} valor={seg} onCambiar={setSeg} />
        <BarraPasos actual={2} />

        <TituloSeccion>Información</TituloSeccion>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Insignia texto="Revisado" />
          <Insignia texto="Coincide 88 %" tamano="grande" />
          <Insignia texto="1 vence pronto" tono="amarilla" />
          <Insignia texto="Enviada" tono="gris" />
          <Insignia texto="No aprobado" tono="roja" icono={null} />
          <Insignia texto="Destacada" tono="acento" icono={Star} />
        </View>
        <Aviso icono="candado" texto="El contacto del titular está oculto hasta que decida compartirlo contigo." />
        <Aviso tono="error" icono="alerta" texto="Completa los campos marcados con * para guardar." />
        <Tarjeta>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar texto="TL" />
            <View style={{ gap: 6 }}>
              <Texto variante="fuerte">Transportes Los Aromos SpA</Texto>
              <Insignia texto="Empresa revisada en SII" />
            </View>
          </View>
        </Tarjeta>
        <Tarjeta separacion={0}>
          <Titulo nivel="tarjeta">Condiciones</Titulo>
          <Separado>
            <FilaDato etiqueta="Retiro" valor="Providencia · Zona Oriente" />
            <FilaDato etiqueta="Turno" valor="Día" />
            <FilaDato etiqueta="Días" valor="Lu a Sá" />
          </Separado>
        </Tarjeta>
        <GrupoLista>
          <FilaLista icono={IdCard} titulo="Mis datos" onPress={() => undefined} />
          <FilaLista icono={FileText} titulo="Mis documentos" derecha={<Insignia texto="1 vence pronto" tono="amarilla" icono={null} />} onPress={() => undefined} />
          <FilaLista icono={Eye} titulo="Quién recibió mis datos" onPress={() => undefined} />
          <FilaLista icono={Volante} titulo="Mi experiencia" onPress={() => undefined} />
          <FilaLista icono={Trash} titulo="Eliminar mi cuenta" peligro onPress={() => setDialogo(true)} flecha={false} />
        </GrupoLista>
        <Tarjeta>
          <EstadoVacio icono={Inbox} titulo="Aún no tienes mensajes" texto="Cuando escribas a un titular, la conversación aparece aquí." accion={{ titulo: 'Ver mis matches', onPress: () => setHoja(true) }} />
        </Tarjeta>
        <BarraInferior
          activa="matches"
          pestanas={[
            { clave: 'inicio', etiqueta: 'Inicio', icono: House, href: '/' },
            { clave: 'matches', etiqueta: 'Matches', icono: CircleCheck, href: '/' },
            { clave: 'bolsa', etiqueta: 'Bolsa', icono: BriefcaseBusiness, href: '/' },
            { clave: 'mensajes', etiqueta: 'Mensajes', icono: MessageSquare, href: '/', punto: true },
            { clave: 'perfil', etiqueta: 'Perfil', icono: UserRound, href: '/' },
          ]}
          onElegir={() => undefined}
        />
      </Pantalla>
      <HojaInferior visible={hoja} onCerrar={() => setHoja(false)} titulo="Hoja inferior" descripcion="Se cierra tocando fuera." pie={<Boton titulo="Listo" onPress={() => setHoja(false)} />}>
        <Texto>Contenido de la hoja.</Texto>
      </HojaInferior>
      <Dialogo
        visible={dialogo}
        titulo="¿Eliminar tu cuenta?"
        texto="Se borran tu perfil, documentos y mensajes."
        confirmar={{ titulo: 'Eliminar', peligro: true, onPress: () => setDialogo(false) }}
        cancelar={{ onPress: () => setDialogo(false) }}
      />
    </MarcoCelular>
  );
}

// Titular · Perfil: tus datos, verificación, plan, términos y cerrar sesión.
// Ruta: /titular/perfil
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { celularCompleto, iniciales } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import { useEntorno } from '@/datos/puerto/contexto';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import { irAlSelector } from '@/pantallas/documentos/acciones';
import { NotaDemo } from '@/pantallas/ingreso/comunes';
import { Avatar, Boton, Dialogo, FilaLista, GrupoLista, HojaInferior, Insignia, Pantalla, Titulo, TituloSeccion, color, tipo } from '@/ui';
import { BadgeCheck, CreditCard, Shield, UserRound } from '@/ui/iconos';
import { CerrarSesion } from '@/ui/iconosPropios';

import { ConRegistro } from './piezas';

function Contenido() {
  const titular = useDerivado(sel.titularDeLaDemo);
  const plan = useDerivado(sel.planDeLaDemo);
  const registro = useDemo((s) => s.titularDemo.registro);
  const celular = useDemo((s) => s.cuenta.celular);
  const reiniciarTitular = useDemo((s) => s.reiniciarTitular);
  const { textosLegales } = useEntorno();
  const raiz = useNavigation('/');
  const [hoja, setHoja] = useState(false);
  const [salir, setSalir] = useState(false);
  const [rehacer, setRehacer] = useState(false);
  const empresa = titular.tipo === 'empresa';
  const cedula = registro.cedula.estado;

  return (
    <Pantalla inferior={24}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4 }}>
        <Avatar texto={iniciales(sel.nombreTitular(titular))} tamano={60} forma="circulo" />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Titulo nivel={2}>{sel.nombreTitular(titular)}</Titulo>
          <Text style={[tipo.secundario, { color: color.textoSecundario }]}>
            {empresa ? `${titular.nombre} · ${titular.rut ?? ''}` : celularCompleto(celular)}
          </Text>
          {titular.revisado ? <Insignia texto={sel.insigniaTitular(titular)} tono="verde" /> : null}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <TituloSeccion>Tu cuenta</TituloSeccion>
        <GrupoLista>
          <FilaLista titulo="Tus datos" subtitulo={empresa ? 'Empresa' : 'Persona natural'} icono={UserRound} onPress={() => router.push({ pathname: '/titular/datos', params: { editar: '1' } })} />
          <FilaLista
            titulo="Verificación"
            icono={BadgeCheck}
            href="/titular/verificacion"
            derecha={
              cedula === 'aprobado' ? (
                <Insignia texto="Revisada" icono={null} />
              ) : cedula === 'en_revision' ? (
                <Insignia texto="En revisión" tono="amarilla" icono={null} />
              ) : (
                <Insignia texto="Pendiente" tono="gris" icono={null} />
              )
            }
          />
          <FilaLista
            titulo="Tu plan"
            icono={CreditCard}
            href="/titular/planes"
            derecha={<Insignia texto={plan?.nombre ?? 'Sin plan'} tono={plan ? 'oscura' : 'gris'} icono={null} />}
          />
        </GrupoLista>
      </View>

      <View style={{ gap: 8 }}>
        <TituloSeccion>Ayuda y legal</TituloSeccion>
        <GrupoLista>
          <FilaLista titulo="Términos y privacidad" icono={Shield} onPress={() => setHoja(true)} />
          <FilaLista titulo="Cerrar sesión" icono={CerrarSesion} onPress={() => setSalir(true)} flecha={false} />
        </GrupoLista>
      </View>

      <NotaDemo texto="Demo:" accion={{ titulo: 'Volver a registrarme como titular', onPress: () => setRehacer(true) }} centrada />

      <HojaInferior
        visible={hoja}
        onCerrar={() => setHoja(false)}
        titulo="Términos y privacidad"
        descripcion={textosLegales.perfil}
        pie={<Boton titulo="Entendido" variante="oscuro" onPress={() => setHoja(false)} />}
      />
      <Dialogo
        visible={salir}
        titulo="¿Cerrar sesión?"
        texto="Para volver a entrar, usa tu celular."
        confirmar={{
          titulo: 'Cerrar sesión',
          onPress: () => {
            setSalir(false);
            irAlSelector(raiz);
          },
        }}
        cancelar={{ onPress: () => setSalir(false) }}
      />
      <Dialogo
        visible={rehacer}
        titulo="¿Volver a registrarte?"
        texto="Se borran tu titular de la demo y sus búsquedas. La empresa de ejemplo no cambia."
        confirmar={{
          titulo: 'Volver a registrarme',
          peligro: true,
          onPress: () => {
            setRehacer(false);
            reiniciarTitular();
            if (router.canDismiss()) router.dismissAll();
            router.replace('/titular/celular');
          },
        }}
        cancelar={{ onPress: () => setRehacer(false) }}
      />
    </Pantalla>
  );
}

export default function PerfilTitular() {
  return (
    <ConRegistro>
      <Contenido />
    </ConRegistro>
  );
}

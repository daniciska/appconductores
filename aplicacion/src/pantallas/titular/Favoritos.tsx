// Titular · Favoritos: los conductores que marcó con la estrella, con la búsqueda suya donde mejor calzan.
// Ruta: /titular/favoritos
import { View } from 'react-native';
import { Text } from '@/ui/escala';
import { router } from 'expo-router';

import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { EstadoVacio, Pantalla, Tarjeta, Titulo, Avatar, color, tipo } from '@/ui';
import { ChevronRight, Lock, Star } from '@/ui/iconos';
import { iniciales } from '@/datos/formato';

import { ConRegistro, TarjetaConductor, nombreCorto } from './piezas';

function Contenido() {
  const lista = useDerivado(sel.favoritosDelTitular);
  const plan = useDerivado(sel.planDeLaDemo);
  const mostrado = useDerivado((s) => (b: string, c: string) => !!sel.contactoMostradoA(s, b, c));

  return (
    <Pantalla inferior={24}>
      <Titulo style={{ paddingHorizontal: 4 }}>Favoritos</Titulo>
      {!plan ? (
        <EstadoVacio
          icono={Lock}
          titulo="Elige un plan para ver conductores"
          texto="Con un plan ves los conductores que hacen match y puedes guardarlos aquí."
          accion={{ titulo: 'Ver planes', onPress: () => router.push('/titular/planes') }}
        />
      ) : lista.length === 0 ? (
        <EstadoVacio icono={Star} titulo="Aún no tienes favoritos" texto="Toca la estrella en la ficha de un conductor para guardarlo aquí." />
      ) : (
        <View style={{ gap: 10 }}>
          {lista.map(({ conductor: c, mejor }) =>
            mejor ? (
              <View key={c.id} style={{ gap: 6 }}>
                <Text style={[tipo.pequeno, { color: color.textoSecundario, paddingHorizontal: 4 }]}>{mejor.negocio.nombre}</Text>
                <TarjetaConductor
                  conductor={c}
                  busquedaId={mejor.busqueda.id}
                  negocioId={mejor.busqueda.negocioId}
                  porcentaje={mejor.resultado.porcentaje}
                  favorito
                  contactoMostrado={mostrado(mejor.busqueda.id, c.id)}
                />
              </View>
            ) : (
              <Tarjeta key={c.id} padding={14} apagada>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar texto={iniciales(c.nombre)} tamano={44} forma="circulo" tono="claro" />
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={[tipo.fuerte, { color: color.texto }]}>{nombreCorto(c)}</Text>
                    <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Hoy no hace match con tus búsquedas activas.</Text>
                  </View>
                  <ChevronRight size={18} color={color.textoDeshabilitado} strokeWidth={2} />
                </View>
              </Tarjeta>
            ),
          )}
        </View>
      )}
    </Pantalla>
  );
}

export default function Favoritos() {
  return (
    <ConRegistro>
      <Contenido />
    </ConRegistro>
  );
}

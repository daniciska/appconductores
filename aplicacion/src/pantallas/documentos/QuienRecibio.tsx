// E3 · Quién recibió mis datos
// Ruta: /conductor/perfil/quien-recibio
// Maqueta: docs/maqueta/CondQuienVio.dc.html
// Se llena con las entregas de datos de la demo (state.entregasDatos): titulares que abrieron la ficha,
// postulaciones vistas y direcciones compartidas. Se actualiza en vivo.
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Text, View } from 'react-native';

import { fechaLarga } from '@/datos/formato';
import { useEntregasDelUsuario } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import type { EntregaDatos } from '@/datos/tipos';
import { Encabezado, Pantalla, Separador, color, duracion, fuente, mostrarToast, radio, tipo } from '@/ui';
import { Eye, Info, MapPin, UserRound } from '@/ui/iconos';

import { CuadroIcono, TituloPantalla } from './piezas';

function Aparecer({ children }: { children: ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: duracion.lenta, useNativeDriver: false }).start();
  }, [v]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

function detalle(e: EntregaDatos, negocio: string): string {
  const fecha = fechaLarga(e.fecha);
  if (e.que.length === 1 && e.que[0] === 'direccion') return `${negocio} · Tu dirección · ${fecha}`;
  if (e.desde === 'postulacion') return `${negocio} · Postulación · ${fecha}`;
  return `${negocio} · ${fecha}`;
}

export default function QuienRecibio() {
  const entregas = useEntregasDelUsuario();
  const negocios = useDemo((s) => s.catalogos.negocios);

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/perfil" />
      <TituloPantalla titulo="Quién recibió mis datos" subtitulo="Estos titulares vieron tu ficha y tu contacto porque hicieron match contigo." />

      {entregas.length === 0 ? (
        <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta }}>
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 20 }}>
            <View aria-hidden style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
              <Eye size={24} color={color.texto} strokeWidth={2} />
            </View>
            <Text style={[tipo.fuerte, { color: color.texto, textAlign: 'center' }]}>Aún nadie recibió tus datos</Text>
            <Text style={[tipo.secundario, { color: color.textoSecundario, textAlign: 'center', maxWidth: 280 }]}>
              Cuando un titular con match abra tu ficha, aparecerá aquí.
            </Text>
          </View>
        </View>
      ) : (
        <View
          role="list"
          aria-live="polite"
          style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingVertical: 4, paddingHorizontal: 16 }}>
          {entregas.map((e, i) => {
            const negocio = negocios.find((n) => n.id === e.negocioId)?.nombre ?? 'Búsqueda';
            const esDireccion = e.que.length === 1 && e.que[0] === 'direccion';
            return (
              <Aparecer key={e.id}>
                {i > 0 ? <Separador sangria={52} /> : null}
                <View role="listitem" style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                  <CuadroIcono icono={esDireccion ? MapPin : UserRound} redondo />
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{e.nombreTitular}</Text>
                    <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{detalle(e, negocio)}</Text>
                  </View>
                </View>
              </Aparecer>
            );
          })}
        </View>
      )}

      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ paddingTop: 1 }}>
          <Info size={20} color={color.texto} strokeWidth={2} />
        </View>
        <Text style={[tipo.secundario, { flex: 1, lineHeight: 21, color: color.textoSuave }]}>
          Así siempre sabes quién tiene tus datos. Si tienes dudas,{' '}
          <Text
            role="link"
            onPress={() => mostrarToast('En la demo, este enlace no envía mensajes.')}
            style={[fuente(700), { color: color.texto, textDecorationLine: 'underline' }]}>
            escríbenos
          </Text>
          .
        </Text>
      </View>
    </Pantalla>
  );
}

// D5 · Reportar o bloquear
// Ruta: /conductor/mensajes/[id]/reportar
// Maqueta: docs/maqueta/CondReportar.dc.html
// Hoja sobre la conversación (de fondo, atenuada). El reporte queda abierto, con la copia de la
// conversación, para que lo revise el equipo (queda abierto hasta que lo resuelvan); bloquear
// saca ese match y cierra el chat.
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fechaConMes } from '@/datos/formato';
import { useMatchDelUsuario } from '@/datos/hooks';
import { ID_USUARIO, nombreTitular } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { MotivoReporteId } from '@/datos/tipos';
import { Aviso, Boton, Campo, Dialogo, Presionable, color, duracion, fuente, mostrarToast, radio, tipo, volver } from '@/ui';
import { Ban, Flag } from '@/ui/iconos';

import { ConversacionVista } from './Conversacion';

function OpcionMotivo({ titulo, marcada, onPress }: { titulo: string; marcada: boolean; onPress: () => void }) {
  return (
    <Presionable
      role="radio"
      aria-checked={marcada}
      aria-label={titulo}
      onPress={onPress}
      style={{
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: radio.campo,
        backgroundColor: color.superficie,
        borderWidth: marcada ? 1.5 : 1,
        borderColor: marcada ? color.bordeFuerte : color.borde,
      }}>
      <View
        aria-hidden
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: marcada ? 2 : 1.5,
          borderColor: marcada ? color.oscuro : color.textoSecundario,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {marcada ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.oscuro }} /> : null}
      </View>
      <Text style={[tipo.cuerpo, fuente(marcada ? 600 : 500), { color: color.texto, flex: 1 }]}>{titulo}</Text>
    </Presionable>
  );
}

export default function Reportar() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = idParam ?? '';
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const m = useMatchDelUsuario(id);
  const motivos = useDemo((s) => s.catalogos.motivosReporte);
  const reportes = useDemo((s) => s.reportes);
  const bloqueado = useDemo((s) => (m ? s.bloqueos.includes(m.titular.id) : false));
  const reportar = useDemo((s) => s.reportarConversacion);
  const bloquear = useDemo((s) => s.bloquearTitular);
  const desbloquear = useDemo((s) => s.desbloquearTitular);

  const [motivo, setMotivo] = useState<MotivoReporteId | null>(null);
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmarBloqueo, setConfirmarBloqueo] = useState(false);

  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrada, { toValue: 1, duration: duracion.lenta, useNativeDriver: false }).start();
  }, [entrada]);

  const nombre = m ? nombreTitular(m.titular) : 'el titular';
  const anterior = reportes.find((r) => r.busquedaId === id && r.quienReporta.id === ID_USUARIO && r.estado === 'abierto');
  const volverAlChat = () => volver({ pathname: '/conductor/mensajes/[id]', params: { id } });

  const cerrar = () => {
    Animated.timing(entrada, { toValue: 0, duration: duracion.rapida, useNativeDriver: false }).start(() => volverAlChat());
  };

  const enviar = () => {
    if (!motivo || !m) return;
    setEnviando(true);
    setTimeout(() => {
      reportar({ busquedaId: id, motivo, detalle: motivo === 'otro' ? detalle : undefined });
      mostrarToast('Reporte enviado. Nuestro equipo lo revisará.', 'exito');
      volverAlChat();
    }, 450);
  };

  const confirmarBloquear = () => {
    if (!m) return;
    bloquear(m.titular.id);
    setConfirmarBloqueo(false);
    mostrarToast(`Bloqueaste a ${nombre}.`, 'exito');
    volverAlChat();
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <View aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.35, pointerEvents: 'none' }}>
        <ConversacionVista id={id} soloLectura />
      </View>

      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17,17,17,0.04)', opacity: entrada }}>
        <Pressable aria-label="Cancelar" style={{ flex: 1 }} onPress={cerrar} />
      </Animated.View>

      <Animated.View
        role="dialog"
        aria-modal
        aria-label="¿Qué quieres hacer?"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: height - 72,
          backgroundColor: color.superficie,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
          opacity: entrada,
          transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [48, 0] }) }],
        }}>
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 28 + insets.bottom }}>
          <View aria-hidden style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: color.bordeCampo }} />
          <Text role="heading" aria-level={2} style={{ marginTop: 18, fontFamily: 'Sora_700Bold', fontSize: 22, lineHeight: 28, letterSpacing: -0.3, color: color.texto }}>
            ¿Qué quieres hacer?
          </Text>

          {anterior ? (
            <Aviso
              icono={Flag}
              tono="exito"
              titulo="Ya reportaste esta conversación"
              texto={`El ${fechaConMes(anterior.reportadoEl)}. Nuestro equipo la está revisando.`}
              style={{ marginTop: 18 }}
            />
          ) : (
            <>
              <View role="radiogroup" aria-label="Reportar conversación" style={{ marginTop: 18, gap: 8 }}>
                <Text style={[tipo.etiqueta, { color: color.texto, marginBottom: 0 }]}>Reportar conversación</Text>
                <Text style={[tipo.ayuda, { color: color.textoSecundario, marginBottom: 2, marginTop: -4 }]}>
                  Elige el motivo principal. Nuestro equipo lo revisará.
                </Text>
                {motivos.map((x) => (
                  <OpcionMotivo key={x.id} titulo={x.nombre} marcada={motivo === x.id} onPress={() => setMotivo(x.id)} />
                ))}
                {motivo === 'otro' ? (
                  <Campo
                    etiqueta="Cuéntanos qué pasó"
                    notaEtiqueta="(opcional)"
                    valor={detalle}
                    onCambiar={setDetalle}
                    placeholder="Escribe aquí"
                    multilinea
                    maxLength={300}
                    contador
                    style={{ marginTop: 6 }}
                  />
                ) : null}
              </View>

              <Boton
                titulo="Enviar reporte"
                variante="oscuro"
                icono={Flag}
                deshabilitado={!motivo || !m}
                cargando={enviando}
                onPress={enviar}
                style={{ marginTop: 16 }}
              />
            </>
          )}

          <View style={{ height: 1, backgroundColor: color.separador, marginTop: 18, marginBottom: 6 }} />

          {m ? (
            <Presionable
              role="button"
              aria-label={bloqueado ? `Desbloquear a ${nombre}` : `Bloquear a ${nombre}`}
              onPress={() => {
                if (bloqueado) {
                  desbloquear(m.titular.id);
                  mostrarToast(`Desbloqueaste a ${nombre}.`, 'exito');
                  volverAlChat();
                } else setConfirmarBloqueo(true);
              }}
              style={{ minHeight: 64, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radio.boton44,
                  backgroundColor: bloqueado ? color.fondo : color.errorFondo,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ban size={20} color={bloqueado ? color.texto : color.error} strokeWidth={2} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={[tipo.fuerte, { color: bloqueado ? color.texto : color.error }]}>
                  {bloqueado ? `Desbloquear a ${nombre}` : `Bloquear a ${nombre}`}
                </Text>
                <Text style={[tipo.ayuda, { lineHeight: 18, color: color.textoSecundario }]}>
                  {bloqueado ? 'Podrá escribirte y volverá a tus matches si calza contigo.' : 'No podrá escribirte y dejará de aparecer en tus matches.'}
                </Text>
              </View>
            </Presionable>
          ) : null}

          <Presionable
            role="button"
            aria-label="Cancelar"
            onPress={cerrar}
            style={{ marginTop: 6, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>Cancelar</Text>
          </Presionable>
        </ScrollView>
      </Animated.View>

      <Dialogo
        visible={confirmarBloqueo}
        titulo={`¿Bloquear a ${nombre}?`}
        texto="No podrá escribirte y dejará de aparecer en tus matches. Puedes desbloquearlo después."
        confirmar={{ titulo: 'Bloquear', onPress: confirmarBloquear, peligro: true }}
        cancelar={{ onPress: () => setConfirmarBloqueo(false) }}
      />
    </View>
  );
}

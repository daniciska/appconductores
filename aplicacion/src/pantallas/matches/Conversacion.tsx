// D4 · Conversación
// Ruta: /conductor/mensajes/[id]
// Maqueta: docs/maqueta/CondConversacion.dc.html
// Chat con el titular de un match: enviar mensajes (la simulación responde a los 2–4 s, con
// "escribiendo…"), contacto compartido por el titular (Llamar / WhatsApp solo avisan en la demo),
// "Compartir mi dirección" con confirmación (queda en "Quién recibió mis datos") y menú para
// reportar o bloquear (D5).
import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Animated, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EllipsisVertical from 'lucide-react-native/icons/ellipsis-vertical';

import { fechaConMes, hora, iniciales } from '@/datos/formato';
import { useDerivado, useMatchDelUsuario } from '@/datos/hooks';
import { lugar, nombreTitular } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import { borrarBorrador, guardarBorrador, leerBorrador } from '@/datos/borradores';
import type { Mensaje } from '@/datos/tipos';
import {
  Avatar,
  Aviso,
  Boton,
  BotonIcono,
  Dialogo,
  Encabezado,
  EstadoVacio,
  Pantalla,
  Presionable,
  Texto,
  color,
  fuente,
  mostrarToast,
  radio,
  tipo,
  volver,
} from '@/ui';
import { ArrowRight, Check, ChevronLeft, CircleHelp, EyeOff, LockOpen, MapPin, MessageSquare, Phone } from '@/ui/iconos';

import { TEXTO_MENSAJE_OCULTO, esAvisoDeContacto, fechaDelMatch, useIrA, useRegistroFichaVista } from './acciones';
import { Aparecer, AvisoBloqueado, BotonFavorito, ChipSistema } from './piezas';

const SUGERENCIAS = ['Hola, vi tu búsqueda. ¿Sigue disponible?', '¿El vehículo se retira en la mañana?', '¿Podemos hablar por teléfono?'];

// ---------------------------------------------------------------------------
// Piezas del chat
// ---------------------------------------------------------------------------

function Burbuja({ m }: { m: Mensaje }) {
  const propia = m.autor === 'conductor';
  if (m.oculto) {
    return (
      <View
        style={{
          alignSelf: propia ? 'flex-end' : 'flex-start',
          maxWidth: '78%',
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: color.textoDeshabilitado,
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <EyeOff size={15} color={color.textoSecundario} strokeWidth={2} />
        <Text style={[tipo.secundario, { color: color.textoSecundario, fontStyle: 'italic' }]}>{TEXTO_MENSAJE_OCULTO}</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        alignSelf: propia ? 'flex-end' : 'flex-start',
        maxWidth: '78%',
        backgroundColor: propia ? color.oscuro : color.superficie,
        borderWidth: propia ? 0 : 1,
        borderColor: color.borde,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderBottomRightRadius: propia ? 6 : 18,
        borderBottomLeftRadius: propia ? 18 : 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}>
      <Text style={[tipo.cuerpo, { lineHeight: 21, color: propia ? color.blanco : color.texto }]}>{m.texto}</Text>
    </View>
  );
}

/** Tres puntos que laten mientras el titular escribe. */
function Escribiendo() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const ciclo = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1100, useNativeDriver: false }));
    ciclo.start();
    return () => ciclo.stop();
  }, [v]);
  const punto = (i: number) => ({
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.textoSecundario,
    opacity: v.interpolate({
      inputRange: [0, 0.2 + i * 0.2, 0.4 + i * 0.2, 1],
      outputRange: [0.3, 1, 0.3, 0.3],
      extrapolate: 'clamp',
    }),
  });
  return (
    <View
      aria-live="polite"
      aria-label="El titular está escribiendo"
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        gap: 5,
        backgroundColor: color.superficie,
        borderWidth: 1,
        borderColor: color.borde,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 15,
      }}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={punto(i)} />
      ))}
    </View>
  );
}

function TarjetaContacto({ nombre, telefono }: { nombre: string; telefono: string }) {
  return (
    <View
      style={{
        alignSelf: 'center',
        width: '100%',
        maxWidth: 310,
        marginTop: 6,
        backgroundColor: color.exitoFondo,
        borderRadius: radio.tarjeta,
        padding: 16,
        alignItems: 'center',
        gap: 4,
      }}>
      <View
        aria-hidden
        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.superficie, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <LockOpen size={18} color={color.exito} strokeWidth={2} />
      </View>
      <Text style={[tipo.secundario, fuente(600), { color: color.exitoTexto, textAlign: 'center' }]}>
        {nombre} compartió su contacto contigo
      </Text>
      <Text selectable style={[fuente(700), { fontSize: 18, lineHeight: 24, letterSpacing: 0.2, color: color.texto }]}>
        {telefono}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignSelf: 'stretch' }}>
        <Boton
          titulo="Llamar"
          variante="contorno"
          tamano="mediano"
          icono={Phone}
          anchoCompleto
          style={{ flex: 1, paddingHorizontal: 8 }}
          onPress={() => mostrarToast(`En la demo no se hacen llamadas. Llamarías al ${telefono}.`, 'info')}
        />
        <Boton
          titulo="WhatsApp"
          variante="oscuro"
          tamano="mediano"
          icono={MessageSquare}
          anchoCompleto
          style={{ flex: 1, paddingHorizontal: 8 }}
          onPress={() => mostrarToast('En la demo no se abre WhatsApp.', 'info')}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Vista (la usa también D5 de fondo, en modo solo lectura)
// ---------------------------------------------------------------------------

export function ConversacionVista({ id, soloLectura = false }: { id: string; soloLectura?: boolean }) {
  const insets = useSafeAreaInsets();
  const irA = useIrA();
  const m = useMatchDelUsuario(id);
  const mensajes = useDemo((s) => s.mensajes[id]);
  const escribiendo = useDemo((s) => !!s.titularEscribiendo[id]);
  const direccionCompartida = useDemo((s) => s.direccionCompartida[id] ?? null);
  const conductor = useDemo((s) => s.conductor);
  const bloqueado = useDemo((s) => (m ? s.bloqueos.includes(m.titular.id) : false));
  const enviarMensaje = useDemo((s) => s.enviarMensaje);
  const marcarLeida = useDemo((s) => s.marcarConversacionLeida);
  const compartirDireccion = useDemo((s) => s.compartirMiDireccion);
  const desbloquear = useDemo((s) => s.desbloquearTitular);
  const fechaMatch = useDerivado((s) => fechaDelMatch(s, id));
  const miLugar = useDerivado((s) => lugar(s, s.conductor.comunaId));

  // El mensaje a medias se guarda como borrador: no se pierde al volver atrás, cambiar de pestaña o recargar.
  const claveBorrador = `chat:${id}`;
  const [texto, setTextoLocal] = useState(() => leerBorrador<string>(claveBorrador) ?? '');
  const setTexto = (t: string) => {
    setTextoLocal(t);
    guardarBorrador(claveBorrador, t.trim() ? t : '');
  };
  const [foco, setFoco] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const lista = mensajes ?? [];
  const cantidadInicial = useRef(lista.length).current;
  const primeraVez = useRef(true);

  useEffect(() => {
    if (!soloLectura && lista.length > 0) marcarLeida(id);
  }, [soloLectura, id, lista.length, marcarLeida]);

  if (!m) {
    return (
      <Pantalla>
        <Encabezado volverA="/conductor/mensajes" />
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 60 }}>
          <EstadoVacio
            icono={CircleHelp}
            titulo="No encontramos esta conversación"
            accion={{ titulo: 'Ver mis mensajes', onPress: () => volver('/conductor/mensajes') }}
          />
        </View>
      </Pantalla>
    );
  }

  const nombre = nombreTitular(m.titular);
  const puedeEscribir = !bloqueado && (m.vigente || lista.length > 0);
  const contactoEnLista = lista.some(esAvisoDeContacto);
  const ultimoPropio = [...lista].reverse().find((x) => x.autor === 'conductor');
  const indiceUltimo = ultimoPropio ? lista.lastIndexOf(ultimoPropio) : -1;
  const leido = indiceUltimo >= 0 && (lista.slice(indiceUltimo + 1).some((x) => x.autor === 'titular') || escribiendo);

  const enviar = () => {
    const limpio = texto.trim();
    if (!limpio || !puedeEscribir) return;
    enviarMensaje(id, limpio);
    setTextoLocal('');
    borrarBorrador(claveBorrador);
    inputRef.current?.focus();
  };

  const pedirCompartir = () => {
    if (!conductor.direccion.trim()) {
      mostrarToast('Primero agrega tu dirección en tu perfil.', 'error');
      return;
    }
    setConfirmar(true);
  };

  const direccionTexto = [conductor.direccion.trim(), conductor.depto.trim(), miLugar.comuna?.nombre].filter(Boolean).join(', ');

  const cabecera = (
    <View
      style={{
        backgroundColor: color.superficie,
        borderBottomWidth: 1,
        borderBottomColor: color.borde,
        paddingTop: 56 + insets.top,
        paddingLeft: 12,
        paddingRight: 4,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}>
      <BotonIcono icono={ChevronLeft} etiquetaAccesible="Volver" onPress={() => volver('/conductor/mensajes')} />
      <Avatar texto={iniciales(nombre)} tamano={40} style={{ marginLeft: 4 }} />
      <Presionable
        role="link"
        aria-label={`${nombre}. Match para ${m.negocio.nombre}. Ver oferta`}
        onPress={() => irA('detalle', id)}
        style={{ marginLeft: 6, flex: 1, minWidth: 0, minHeight: 44, justifyContent: 'center', gap: 2 }}>
        <Text numberOfLines={1} style={[tipo.fuerte, { color: color.texto }]}>
          {nombre}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text numberOfLines={1} style={[fuente(400), { fontSize: 12, lineHeight: 16, color: color.textoSecundario, flexShrink: 1 }]}>
            Match para {m.negocio.nombre} ·{' '}
          </Text>
          <Text style={[fuente(600), { fontSize: 12, lineHeight: 16, color: color.texto, textDecorationLine: 'underline', flexShrink: 0 }]}>
            ver oferta
          </Text>
        </View>
      </Presionable>
      <BotonFavorito busquedaId={id} favorito={m.favorito} nombre={`${m.negocio.nombre} de ${nombre}`} />
      <BotonIcono
        icono={EllipsisVertical}
        variante="transparente"
        etiquetaAccesible="Más opciones: reportar o bloquear"
        onPress={() => router.push({ pathname: '/conductor/mensajes/[id]/reportar', params: { id } })}
      />
    </View>
  );

  const pie = bloqueado ? (
    <View style={{ paddingHorizontal: 16 }}>
      <AvisoBloqueado
        nombre={nombre}
        onDesbloquear={() => {
          desbloquear(m.titular.id);
          mostrarToast(`Desbloqueaste a ${nombre}.`, 'exito');
        }}
      />
    </View>
  ) : !puedeEscribir ? (
    <View style={{ paddingHorizontal: 16 }}>
      <Aviso texto="Solo puedes escribir a titulares con los que tienes match." />
    </View>
  ) : (
    <>
      <View style={{ paddingHorizontal: 16, alignItems: 'center', marginTop: -6 }}>
        {direccionCompartida ? (
          <View
            style={{
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: radio.pastilla,
              backgroundColor: color.exitoFondo,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
            <Check size={16} color={color.exito} strokeWidth={2.4} />
            <Text style={[tipo.botonChico, { color: color.exitoTexto }]}>Compartiste tu dirección el {fechaConMes(direccionCompartida)}</Text>
          </View>
        ) : (
          <Presionable
            role="button"
            aria-label="Compartir mi dirección"
            onPress={pedirCompartir}
            style={{
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: radio.pastilla,
              borderWidth: 1.5,
              borderColor: color.bordeFuerte,
              backgroundColor: color.superficie,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
            <MapPin size={16} color={color.texto} strokeWidth={2} />
            <Text style={[tipo.botonChico, { color: color.texto }]}>Compartir mi dirección</Text>
          </Presionable>
        )}
      </View>
      <Text style={[fuente(400), { fontSize: 12, lineHeight: 16, color: color.textoSecundario, textAlign: 'center', paddingHorizontal: 16 }]}>
        Nunca compartas claves ni datos bancarios por mensaje.
      </Text>
      <View
        style={{
          backgroundColor: color.superficie,
          borderTopWidth: 1,
          borderTopColor: color.borde,
          paddingTop: 10,
          paddingHorizontal: 12,
          paddingBottom: 24 + insets.bottom,
          marginBottom: -(20 + insets.bottom),
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <TextInput
          ref={inputRef}
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribe un mensaje"
          placeholderTextColor={color.textoDeshabilitado}
          aria-label="Escribe un mensaje"
          maxLength={500}
          returnKeyType="send"
          submitBehavior="submit"
          onSubmitEditing={enviar}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          style={[
            tipo.cuerpo,
            {
              flex: 1,
              minWidth: 0,
              minHeight: 46,
              paddingHorizontal: 16,
              paddingVertical: 0,
              borderRadius: 23,
              borderWidth: foco ? 1.5 : 1,
              borderColor: foco ? color.bordeFuerte : color.bordeCampo,
              backgroundColor: foco ? color.superficie : color.fondo,
              color: color.texto,
            },
            { outlineStyle: 'none' } as object,
          ]}
        />
        <Presionable
          role="button"
          aria-label="Enviar"
          aria-disabled={!texto.trim()}
          disabled={!texto.trim()}
          onPress={enviar}
          efecto="escala"
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: texto.trim() ? color.oscuro : color.interruptorApagado,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ArrowRight size={18} color={color.blanco} strokeWidth={2.2} />
        </Presionable>
      </View>
    </>
  );

  return (
    <>
      <Pantalla
        superior={0}
        lateral={0}
        separacion={0}
        animar={!soloLectura}
        cabecera={cabecera}
        pie={soloLectura ? undefined : pie}
        scrollRef={scrollRef}
        propsScroll={{
          scrollEnabled: !soloLectura,
          onContentSizeChange: () => {
            if (soloLectura) return;
            scrollRef.current?.scrollToEnd({ animated: !primeraVez.current });
            primeraVez.current = false;
          },
        }}>
        <View style={{ flexGrow: 1, justifyContent: soloLectura ? 'flex-start' : 'flex-end', paddingHorizontal: 16, paddingTop: 16, gap: 10 }}>
          {fechaMatch ? (
            <ChipSistema texto={`${m.origen === 'postulacion' ? 'Match por postulación' : 'Hicieron match'} · ${fechaConMes(fechaMatch)}`} />
          ) : null}

          {lista.length === 0 && puedeEscribir ? (
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
              <Texto variante="secundario" tono="secundario" centrado style={{ maxWidth: 280 }}>
                Escríbele a {nombre} para presentarte.
              </Texto>
              <View style={{ alignItems: 'center', gap: 8 }}>
                {SUGERENCIAS.map((sug) => (
                  <Presionable
                    key={sug}
                    role="button"
                    aria-label={`Usar: ${sug}`}
                    onPress={() => {
                      setTexto(sug);
                      inputRef.current?.focus();
                    }}
                    style={{
                      minHeight: 40,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: color.bordeCampo,
                      backgroundColor: color.superficie,
                      justifyContent: 'center',
                    }}>
                    <Text style={[tipo.secundario, fuente(600), { color: color.texto }]}>{sug}</Text>
                  </Presionable>
                ))}
              </View>
            </View>
          ) : null}

          {lista.map((msg, i) => {
            let contenido: ReactNode;
            if (msg.autor === 'sistema') {
              contenido =
                esAvisoDeContacto(msg) && m.contactoCompartidoEl ? (
                  <TarjetaContacto nombre={nombre} telefono={m.titular.telefono} />
                ) : (
                  <ChipSistema
                    texto={msg.texto}
                    icono={/dirección/i.test(msg.texto) ? <MapPin size={12} color={color.textoSecundario} strokeWidth={2.2} /> : undefined}
                  />
                );
            } else {
              contenido = <Burbuja m={msg} />;
            }
            const meta =
              i === indiceUltimo ? (
                <Text style={[fuente(500), { fontSize: 11, lineHeight: 14, color: color.textoSecundario, alignSelf: 'flex-end', marginTop: -4 }]}>
                  {hora(msg.hora)} · {leido ? 'Leído' : 'Enviado'}
                </Text>
              ) : null;
            return i >= cantidadInicial ? (
              <Aparecer key={msg.id} style={{ gap: 10 }}>
                {contenido}
                {meta}
              </Aparecer>
            ) : (
              <View key={msg.id} style={{ gap: 10 }}>
                {contenido}
                {meta}
              </View>
            );
          })}

          {m.contactoCompartidoEl && !contactoEnLista ? <TarjetaContacto nombre={nombre} telefono={m.titular.telefono} /> : null}

          {escribiendo && !bloqueado ? (
            <Aparecer>
              <Escribiendo />
            </Aparecer>
          ) : null}
        </View>
      </Pantalla>

      <Dialogo
        visible={confirmar}
        titulo="¿Compartir tu dirección?"
        texto={`${nombre} la verá y quedará en “Quién recibió mis datos”. No se puede deshacer.`}
        confirmar={{
          titulo: 'Compartir dirección',
          onPress: () => {
            compartirDireccion(id);
            setConfirmar(false);
            mostrarToast('Compartiste tu dirección.', 'exito');
          },
        }}
        cancelar={{ onPress: () => setConfirmar(false) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: color.fondo,
            borderRadius: radio.campo,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}>
          <MapPin size={18} color={color.texto} strokeWidth={2} />
          <Text style={[tipo.secundario, fuente(600), { color: color.texto, flex: 1 }]}>{direccionTexto}</Text>
        </View>
      </Dialogo>
    </>
  );
}

export default function Conversacion() {
  useRegistroFichaVista();
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ConversacionVista id={id ?? ''} />;
}


// Piezas visuales propias del grupo "bolsa" (BC1–BC3 y BT1–BT5), con las medidas de las maquetas.
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Platform, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { router, type Href } from 'expo-router';
import Sparkle from 'lucide-react-native/icons/sparkle';

import { fechaCorta, haceCuanto } from '@/datos/formato';
import type { OfertaBolsa, PostulacionUsuario } from '@/datos/selectores';
import { nombreTitular } from '@/datos/selectores';
import {
  Boton,
  Encabezado,
  Insignia,
  Presionable,
  Separador,
  Tarjeta,
  Titulo,
  color,
  duracion,
  fuente,
  radio,
  tipo,
  type LucideIcon,
} from '@/ui';
import { Ban, Check, ChevronRight, CircleCheck, Eye, Lock, MessageSquare, Send } from '@/ui/iconos';

import { estadoVisto, mayuscula, type EstadoVisto } from './datos';

// ---------------------------------------------------------------------------
// Estructura
// ---------------------------------------------------------------------------

/** En web, reparte las líneas del texto de forma pareja (como text-wrap: balance de las maquetas). */
export const EQUILIBRADO = Platform.OS === 'web' ? ({ textWrap: 'balance' } as object) : null;

/** Título de pantalla con subtítulo opcional (h1 26 px y párrafo gris, con 4 px de sangría). */
export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <View style={{ gap: 6, paddingHorizontal: 4 }}>
      <Titulo>{titulo}</Titulo>
      {subtitulo ? <Text style={[tipo.parrafo, { color: color.textoSecundario }, EQUILIBRADO]}>{subtitulo}</Text> : null}
    </View>
  );
}

/** Fila volver + texto gris a la derecha ("Bolsa de trabajo", "Tu plan: Flota chica"). */
export function EncabezadoConTexto({ texto, volverA, derecha }: { texto?: string; volverA: Href; derecha?: ReactNode }) {
  return (
    <Encabezado
      volverA={volverA}
      derecha={
        derecha ?? (texto ? <Text style={[tipo.secundario, fuente(600), { color: color.textoSecundario }]}>{texto}</Text> : undefined)
      }
    />
  );
}

/** Aparece suave (sube 6 px). Para tarjetas de listas. */
export function Aparecer({ children, retraso = 0, style }: { children: ReactNode; retraso?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: duracion.normal, delay: retraso, useNativeDriver: false }).start();
  }, [v, retraso]);
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

/** Cuadro oscuro de 48 px con un ícono blanco (o amarillo) al centro. */
export function CuadroIcono({ icono: Icono, tamano = 48, acento }: { icono: LucideIcon; tamano?: number; acento?: boolean }) {
  return (
    <View
      aria-hidden
      style={{
        width: tamano,
        height: tamano,
        borderRadius: tamano >= 56 ? 18 : 14,
        backgroundColor: color.oscuro,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icono size={tamano >= 56 ? 26 : 24} color={acento ? color.acento : color.blanco} strokeWidth={1.9} />
    </View>
  );
}

/** Rótulo de grupo de opciones ("¿Quién puede verla?", "Zonas"). */
export function Rotulo({ children, ayuda }: { children: string; ayuda?: string }) {
  return (
    <View style={{ gap: 4, paddingHorizontal: 4 }}>
      <Text role="heading" aria-level={2} style={[tipo.etiqueta, { color: color.texto }]}>
        {children}
      </Text>
      {ayuda ? <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{ayuda}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Insignias
// ---------------------------------------------------------------------------

/** "Destacada" (amarillo claro, chispa amarilla). */
export function InsigniaDestacada({ grande }: { grande?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        backgroundColor: color.acentoSuave,
        borderRadius: grande ? radio.icono : radio.insignia,
        paddingHorizontal: 9,
        paddingVertical: 5,
      }}>
      <Sparkle size={grande ? 14 : 13} color={color.acentoTrazo} fill={color.acento} strokeWidth={1.6} />
      <Text style={[fuente(700), { fontSize: grande ? 13 : 12, lineHeight: grande ? 17 : 16, color: color.amarilloTexto }]}>Destacada</Text>
    </View>
  );
}

/** "Hace match contigo" (verde, con círculo y check). */
export function InsigniaMatch({ porcentaje }: { porcentaje?: number }) {
  return (
    <Insignia
      texto={porcentaje !== undefined ? `Hace match contigo · ${porcentaje} %` : 'Hace match contigo'}
      tono="verde"
      icono={CircleCheck}
    />
  );
}

/** "En la bolsa" (punto verde) o "Fuera de la bolsa" (gris). */
export function InsigniaBolsa({ enBolsa, pausada }: { enBolsa: boolean; pausada?: boolean }) {
  const activa = enBolsa && !pausada;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        flexShrink: 0,
        backgroundColor: activa ? color.exitoFondo : color.grisInsignia,
        borderRadius: radio.insignia,
        paddingHorizontal: 9,
        paddingVertical: 5,
      }}>
      <View aria-hidden style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: activa ? color.exito : color.textoDeshabilitado }} />
      <Text style={[fuente(700), { fontSize: 12, lineHeight: 16, color: activa ? color.exitoTexto : color.textoSuave }]}>
        {activa ? 'En la bolsa' : enBolsa ? 'En pausa' : 'Fuera de la bolsa'}
      </Text>
    </View>
  );
}

/** Pastilla "Incluida" (verde) o "Plan Flota" (gris con candado), bajo cada opción de visibilidad. */
export function PastillaPlan({ incluida, plan }: { incluida: boolean; plan?: string }) {
  return (
    <View
      style={{
        marginTop: 2,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        backgroundColor: incluida ? color.exitoFondo : color.borde,
        borderRadius: radio.insignia,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}>
      {incluida ? null : <Lock size={11} color={color.textoSuave} strokeWidth={2.8} />}
      <Text style={[fuente(700), { fontSize: 12, lineHeight: 16, color: incluida ? color.exitoTexto : color.textoSuave }]}>
        {incluida ? 'Incluida' : `Plan ${plan ?? 'Flota'}`}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Chips de filtro (sin check, como en BC1)
// ---------------------------------------------------------------------------

export function ChipFiltro({ etiqueta, marcado, onPress }: { etiqueta: string; marcado: boolean; onPress: () => void }) {
  return (
    <Presionable
      role="radio"
      aria-checked={marcado}
      aria-label={etiqueta}
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: radio.pastilla,
        borderWidth: 1,
        borderColor: marcado ? color.oscuro : color.bordeCampo,
        backgroundColor: marcado ? color.oscuro : color.superficie,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={[fuente(600), { fontSize: 14, lineHeight: 19, color: marcado ? color.blanco : color.texto }]}>{etiqueta}</Text>
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// Conductor: tarjeta de oferta (BC1)
// ---------------------------------------------------------------------------

function NombreYRevisado({ nombre, revisado, apagada }: { nombre: string; revisado: boolean; apagada?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 6 }}>
      <Text style={[tipo.secundario, fuente(600), { color: apagada ? color.textoSecundario : color.textoSuave }]}>{nombre}</Text>
      {revisado ? (
        <Insignia
          texto="Revisado"
          tono={apagada ? 'gris' : 'verde'}
          icono={apagada ? Check : 'check'}
          style={apagada ? { backgroundColor: color.borde } : undefined}
        />
      ) : null}
    </View>
  );
}

export function TarjetaOferta({ o }: { o: OfertaBolsa }) {
  const nombre = nombreTitular(o.titular);
  const postulada = !!o.postulacion;
  const ir = () => router.push({ pathname: '/conductor/bolsa/[id]', params: { id: o.id } });
  return (
    <Tarjeta destacada={o.destacada} padding={16} separacion={12} style={o.destacada ? { borderWidth: 1 } : undefined}>
      <View style={{ gap: 6 }}>
        {o.destacada || o.esMatch ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 2 }}>
            {o.destacada ? <InsigniaDestacada /> : null}
            {o.esMatch ? <InsigniaMatch /> : null}
          </View>
        ) : null}
        <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto }]}>
          {o.negocio.nombre}
        </Text>
        <NombreYRevisado nombre={nombre} revisado={o.titular.revisado} />
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{o.condiciones}</Text>
      </View>
      <Separador />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        {postulada ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
            <CircleCheck size={16} color={color.exito} strokeWidth={2.2} />
            <Text style={[tipo.ayuda, fuente(700), { color: color.exitoTexto }]}>
              Postulaste · {fechaCorta(o.postulacion?.postuloEl)}
            </Text>
          </View>
        ) : (
          <Text style={[tipo.ayuda, { color: color.textoSecundario, flexShrink: 1 }]}>
            Publicada {haceCuanto(o.busqueda.publicadaBolsaEl ?? o.busqueda.publicadaEl)}
          </Text>
        )}
        <Boton
          titulo="Ver"
          variante={postulada ? 'suave' : 'oscuro'}
          tamano="mediano"
          iconoDerecha={ChevronRight}
          etiquetaAccesible={`Ver ${o.negocio.nombre} de ${nombre}`}
          onPress={ir}
          style={[{ flexShrink: 0 }, postulada ? { backgroundColor: color.separador, paddingHorizontal: 16 } : null]}
        />
      </View>
    </Tarjeta>
  );
}

// ---------------------------------------------------------------------------
// Conductor: tarjeta de postulación (BC1 "Mis postulaciones" y BC3)
// ---------------------------------------------------------------------------

const ESTADO_VISTO: Record<EstadoVisto, { texto: string; icono: LucideIcon; fondo: string; tinta: string; trazo: string }> = {
  te_escribio: { texto: 'Te escribió', icono: MessageSquare, fondo: color.exitoFondo, tinta: color.exitoTexto, trazo: color.exito },
  vista: { texto: 'Vista por el titular', icono: Eye, fondo: color.separador, tinta: color.textoSuave, trazo: color.textoSuave },
  enviada: { texto: 'Enviada', icono: Send, fondo: color.separador, tinta: color.textoSuave, trazo: color.textoSuave },
  cerrada: { texto: 'Cerrada', icono: Ban, fondo: color.borde, tinta: color.textoSecundario, trazo: color.textoSecundario },
};

export function PastillaEstado({ estado }: { estado: EstadoVisto }) {
  const e = ESTADO_VISTO[estado];
  const Icono = e.icono;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: e.fondo,
        borderRadius: radio.insignia,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}>
      <Icono size={15} color={e.trazo} strokeWidth={2.2} />
      <Text style={[fuente(700), { fontSize: 13, lineHeight: 17, color: e.tinta }]}>{e.texto}</Text>
    </View>
  );
}

const ORDEN_ESTADO: Record<EstadoVisto, number> = { te_escribio: 0, vista: 1, enviada: 2, cerrada: 3 };

/** Ordena como en la maqueta: Te escribió, Vista, Enviada y al final Cerrada; dentro, las más nuevas. */
export function ordenarPostulaciones(lista: PostulacionUsuario[]): PostulacionUsuario[] {
  return [...lista].sort(
    (a, b) =>
      ORDEN_ESTADO[estadoVisto(a.postulacion, a.busqueda)] - ORDEN_ESTADO[estadoVisto(b.postulacion, b.busqueda)] ||
      b.postulacion.cambioEl.localeCompare(a.postulacion.cambioEl),
  );
}

export function TarjetaPostulacion({ p }: { p: PostulacionUsuario }) {
  const estado = estadoVisto(p.postulacion, p.busqueda);
  const cerrada = estado === 'cerrada';
  const nombre = nombreTitular(p.titular);
  const fecha =
    estado === 'vista' ? (p.postulacion.vistaEl ?? p.postulacion.cambioEl) : estado === 'cerrada' ? p.postulacion.cambioEl : p.postulacion.postuloEl;
  return (
    <Tarjeta
      apagada={cerrada}
      padding={16}
      separacion={12}
      onPress={() => router.push({ pathname: '/conductor/bolsa/[id]', params: { id: p.busqueda.id } })}
      etiquetaAccesible={`${p.negocio.nombre} de ${nombre}: ${ESTADO_VISTO[estado].texto}`}>
      <View style={{ gap: 6 }}>
        <Text style={[tipo.tituloTarjeta, { color: cerrada ? color.textoSecundario : color.texto }]}>{p.negocio.nombre}</Text>
        <NombreYRevisado nombre={nombre} revisado={p.titular.revisado} apagada={cerrada} />
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{p.condiciones}</Text>
      </View>
      <Separador style={{ backgroundColor: color.borde }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 44 }}>
        <PastillaEstado estado={estado} />
        {estado === 'te_escribio' ? (
          <Boton
            titulo="Ver mensajes"
            variante="oscuro"
            tamano="mediano"
            iconoDerecha={ChevronRight}
            onPress={() => router.push({ pathname: '/conductor/mensajes/[id]', params: { id: p.busqueda.id } })}
            style={{ flexShrink: 0, paddingHorizontal: 16 }}
          />
        ) : (
          <Text style={[tipo.ayuda, { color: color.textoSecundario, flexShrink: 0 }]}>{fechaCorta(fecha)}</Text>
        )}
      </View>
    </Tarjeta>
  );
}

/** "Publicada hace 5 días" con mayúscula inicial cuando va sola. */
export const textoPublicada = (iso: string | null | undefined) => (iso ? `Publicada ${haceCuanto(iso)}` : '');
export { mayuscula };

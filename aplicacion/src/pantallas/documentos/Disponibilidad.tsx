// E4 · Confirmar disponibilidad
// Ruta: /conductor/disponibilidad
// Maqueta: docs/maqueta/CondDisponibilidad.dc.html
// Diálogo sobre una silueta del Inicio. "Sí, sigo disponible" reconfirma (y vuelve al match);
// "Pausar por ahora" apaga "Disponible para trabajar" (sale del match).
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
import { Boton, color, duracion, mostrarToast, sombra, volver } from '@/ui';
import { Bell } from '@/ui/iconos';

import { usePantallaAbierta } from '../ingreso/acciones';

const DIA_MS = 24 * 60 * 60 * 1000;

function Bloque({ ancho, alto, fondo = color.bordeCampo, radio = 8, style }: { ancho?: number | `${number}%`; alto: number; fondo?: string; radio?: number; style?: object }) {
  return <View style={[{ width: ancho, height: alto, borderRadius: radio, backgroundColor: fondo }, style]} />;
}

/** Silueta del Inicio (como en la maqueta): da contexto sin distraer. */
function SiluetaInicio({ pestanas }: { pestanas: number }) {
  return (
    <View aria-hidden style={{ flex: 1, gap: 16, opacity: 0.7, paddingTop: 56, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <View style={{ gap: 8 }}>
          <Bloque ancho={56} alto={12} radio={6} />
          <Bloque ancho={150} alto={22} />
          <Bloque ancho={110} alto={22} fondo={color.exitoFondo} />
        </View>
        <Bloque ancho={48} alto={48} radio={24} />
      </View>
      <View style={{ backgroundColor: color.oscuro, borderRadius: 20, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          <Bloque ancho={36} alto={44} fondo="#3D3D3D" />
          <Bloque ancho={170} alto={16} fondo="#3D3D3D" />
        </View>
        <Bloque ancho={120} alto={12} fondo="#3D3D3D" radio={6} />
        <Bloque alto={52} fondo="#3D3D3D" radio={14} />
      </View>
      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 8 }}>
          <Bloque ancho={170} alto={14} radio={7} />
          <Bloque ancho={210} alto={10} radio={5} fondo={color.superficieHundida} />
        </View>
        <Bloque ancho={52} alto={32} radio={16} />
      </View>
      <Bloque ancho={130} alto={14} radio={7} style={{ marginLeft: 4 }} />
      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 16 }}>
        {[0, 1].map((i) => (
          <View key={i} style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: i ? 1 : 0, borderTopColor: color.separador }}>
            <Bloque ancho={40} alto={40} radio={12} fondo={color.superficieHundida} />
            <View style={{ gap: 8, flex: 1 }}>
              <Bloque ancho={140} alto={12} radio={6} />
              <Bloque ancho={200} alto={10} radio={5} fondo={color.superficieHundida} />
            </View>
          </View>
        ))}
      </View>
      <View
        style={{
          marginTop: 'auto',
          marginHorizontal: -20,
          backgroundColor: color.superficie,
          borderTopWidth: 1,
          borderTopColor: color.borde,
          flexDirection: 'row',
          paddingTop: 8,
          paddingBottom: 28,
        }}>
        {Array.from({ length: pestanas }, (_, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <Bloque ancho={22} alto={22} radio={6} fondo={i === 0 ? color.oscuro : color.bordeCampo} />
            <Bloque ancho={36} alto={8} radio={4} fondo={i === 0 ? color.oscuro : color.bordeCampo} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Disponibilidad() {
  const disponible = useVista((v) => v.conductor.disponible);
  const confirmadaEn = useVista((v) => v.conductor.disponibilidadConfirmadaEn);
  const { pestanas } = useEntorno();
  const acciones = useAcciones();
  const enCurso = useRef(false);
  const pantalla = usePantallaAbierta();

  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrada, { toValue: 1, duration: duracion.lenta, useNativeDriver: false }).start();
  }, [entrada]);

  const dias = confirmadaEn ? Math.floor((Date.now() - new Date(confirmadaEn).getTime()) / DIA_MS) : null;
  const hace =
    dias === null ? '' : dias < 1 ? 'Hoy confirmaste que estabas disponible. ' : dias === 1 ? 'Ayer confirmaste que estabas disponible. ' : `Hace ${dias} días confirmaste que estabas disponible. `;

  const titulo = disponible ? '¿Sigues buscando trabajo?' : '¿Vuelves a buscar trabajo?';
  const texto = disponible
    ? `${hace}Te lo preguntamos para que los titulares solo vean conductores activos.`
    : 'Tu perfil está en pausa: los titulares no te ven en sus matches.';

  // Sin dobles toques; si no se pudo guardar (app real), se avisa y el diálogo sigue abierto.
  const si = async () => {
    if (enCurso.current) return;
    enCurso.current = true;
    const r = await acciones.confirmarDisponibilidad();
    enCurso.current = false;
    if (pantalla.salio()) return;
    if (!r.ok) {
      mostrarToast(r.error, 'error');
      return;
    }
    mostrarToast(disponible ? '¡Bien! Sigues disponible.' : 'Estás disponible para trabajar.', 'exito');
    volver('/conductor/inicio');
  };
  const pausar = async () => {
    if (enCurso.current) return;
    if (disponible) {
      enCurso.current = true;
      const r = await acciones.cambiarDisponible(false);
      enCurso.current = false;
      if (pantalla.salio()) return;
      if (!r.ok) {
        mostrarToast(r.error, 'error');
        return;
      }
      mostrarToast('Quedaste en pausa: no apareces en los matches.');
    }
    volver('/conductor/inicio');
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo, overflow: 'hidden' }}>
      <SiluetaInicio pestanas={pestanas} />
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: color.velo,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          opacity: entrada,
        }}>
        <Animated.View
          role="dialog"
          aria-modal
          aria-label={titulo}
          style={[
            {
              width: '100%',
              maxWidth: 390,
              backgroundColor: color.superficie,
              borderRadius: 24,
              padding: 24,
              transform: [
                { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                { scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
              ],
            },
            sombra.flotante,
          ]}>
          <View aria-hidden style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color.acentoSuave, alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={24} color={color.texto} strokeWidth={2} />
          </View>
          <Text role="heading" aria-level={1} style={{ marginTop: 18, fontFamily: 'Sora_700Bold', fontSize: 22, lineHeight: 27.5, letterSpacing: -0.3, color: color.texto }}>
            {titulo}
          </Text>
          <Text style={{ marginTop: 8, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, lineHeight: 22.5, color: color.textoSecundario }}>{texto}</Text>
          <View style={{ marginTop: 24, gap: 10 }}>
            <Boton titulo={disponible ? 'Sí, sigo disponible' : 'Sí, estoy disponible'} variante="oscuro" onPress={si} />
            <Boton titulo={disponible ? 'Pausar por ahora' : 'Seguir en pausa'} variante="contorno" onPress={pausar} />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

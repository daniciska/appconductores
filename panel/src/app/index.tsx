// /panel · Portada de la demo del panel: entrar como administrador o como revisor.
// Sin pantalla de ingreso (celular, código y segundo paso siguen por decidir). El rol elegido es de esta
// pestaña (se recuerda al recargar): con un rol ya elegido, la portada lleva directo al panel. Otra
// pestaña parte aquí, así se pueden ver los dos roles lado a lado.
import { Text, View, useWindowDimensions } from 'react-native';
import { Redirect, router } from 'expo-router';

import { Insignia, Presionable, Texto, Titulo, color, fuente, radio, sombra, type LucideIcon } from '@/ui';
import { ArrowUpRight, ChevronRight, ShieldCheck, Smartphone, UserRound } from '@/ui/iconos';
import type { RolEquipo } from '@/datos/tipos';

import { abrirDemoConductor } from '@panel/enlaces';
import { Marca } from '@panel/marco';
import { entrarComo, useRolPanel } from '@panel/sesion';

export default function Portada() {
  const rol = useRolPanel();
  const { width } = useWindowDimensions();
  const ancho = width >= 640;
  if (rol) return <Redirect href={rol === 'administrador' ? '/resumen' : '/documentos'} />;

  const entrar = (r: RolEquipo) => {
    entrarComo(r);
    router.replace(r === 'administrador' ? '/resumen' : '/documentos');
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: ancho ? 'center' : 'flex-start', padding: 16, paddingVertical: ancho ? 32 : 24 }}>
        <View style={{ width: '100%', maxWidth: 560, gap: 20 }}>
          <View style={{ paddingHorizontal: 4 }}>
            <Marca subtitulo="Demo del panel" />
          </View>

          <View
            style={[
              {
                backgroundColor: color.superficie,
                borderRadius: radio.tarjeta,
                borderWidth: 1,
                borderColor: color.borde,
                padding: ancho ? 28 : 20,
                gap: 20,
              },
              sombra.suave,
            ]}>
            <View style={{ gap: 10 }}>
              <Insignia texto="Demo con datos de ejemplo" tono="amarilla" icono={null} style={{ alignSelf: 'flex-start' }} />
              <Titulo>Panel de administración</Titulo>
              <Texto variante="parrafo" tono="secundario">
                Elige con qué rol entrar para ver qué hace cada uno.
              </Texto>
            </View>

            <View style={{ gap: 12 }}>
              <OpcionRol
                icono={ShieldCheck}
                titulo="Entrar como administrador"
                texto="Revisa y además cambia la configuración y el equipo."
                destacada
                onPress={() => entrar('administrador')}
              />
              <OpcionRol icono={UserRound} titulo="Entrar como revisor" texto="Revisa documentos y reportes." onPress={() => entrar('revisor')} />
            </View>

            <View style={{ height: 1, backgroundColor: color.separador }} />

            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View style={{ width: 32, height: 32, borderRadius: radio.icono, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={16} color={color.texto} strokeWidth={2} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Texto variante="secundario" tono="suave">
                  Está conectada a la demo del conductor abierta en este mismo navegador: lo que hagas aquí se ve allá, y al revés.
                </Texto>
                <Presionable
                  role="link"
                  aria-label="Abrir la demo del conductor en otra pestaña"
                  onPress={() => abrirDemoConductor('/')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36, alignSelf: 'flex-start' }}>
                  <Text style={[fuente(700), { fontSize: 14, color: color.texto, textDecorationLine: 'underline' }]}>Abrir la demo del conductor</Text>
                  <ArrowUpRight size={16} color={color.texto} strokeWidth={2.2} />
                </Presionable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function OpcionRol({ icono: Icono, titulo, texto, destacada, onPress }: { icono: LucideIcon; titulo: string; texto: string; destacada?: boolean; onPress: () => void }) {
  return (
    <Presionable
      role="button"
      aria-label={titulo}
      onPress={onPress}
      efecto="escala"
      style={({ hovered }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 76,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: radio.tarjeta - 4,
        backgroundColor: destacada ? color.oscuro : hovered ? color.fondo : color.superficie,
        borderWidth: destacada ? 0 : 1,
        borderColor: color.bordeCampo,
      })}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radio.icono,
          backgroundColor: destacada ? color.acento : color.fondo,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icono size={20} color={color.texto} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[fuente(700), { fontSize: 16, color: destacada ? color.blanco : color.texto }]}>{titulo}</Text>
        <Text style={[fuente(500), { fontSize: 13, lineHeight: 18, color: destacada ? '#CFCFCF' : color.textoSecundario }]}>{texto}</Text>
      </View>
      <ChevronRight size={20} color={destacada ? color.acento : color.textoSecundario} strokeWidth={2} />
    </Presionable>
  );
}

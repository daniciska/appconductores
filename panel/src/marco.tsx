// Marco del panel (ancho completo): barra lateral en escritorio y barra superior con menú en celular.
// Muestra con qué rol se entró, permite cambiarlo y salir del panel (vuelve a la portada).
import { useState, type ReactNode } from 'react';
import { ScrollView, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HojaInferior } from '@/ui/capas';
import { Boton, BotonIcono, Presionable } from '@/ui/controles';
import { mostrarToast } from '@/ui/Toast';
import { ArrowUpRight, KeyRound, Lock, LogOut, Menu, RefreshCw, type LucideIcon } from '@/ui/iconos';
import { Insignia } from '@/ui/info';
import { Texto, Titulo } from '@/ui/texto';
import { ANCHO_ESCRITORIO, color, fuente, radio, tipo } from '@/ui/tokens';
import type { RolEquipo } from '@/datos/tipos';

import { abrirDemoConductor } from './enlaces';
import { NOMBRE_ROL } from './permisos';
import { entrarComo, salirDelPanel, useRolPanel } from './sesion';

export interface ElementoPanel {
  clave: string;
  etiqueta: string;
  icono: LucideIcon;
  href: Href;
  /** Número a la derecha (ej. documentos en cola). */
  contador?: number;
  /** Las secciones de configuración las cambia solo un administrador. */
  grupo: 'inicio' | 'revision' | 'configuracion';
}

export function Marca({ claro, subtitulo = 'Panel de administración' }: { claro?: boolean; subtitulo?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color.acento, alignItems: 'center', justifyContent: 'center' }}>
        <KeyRound size={17} color={color.texto} strokeWidth={2.2} />
      </View>
      <View>
        <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 15, color: claro ? color.blanco : color.texto }}>Dale Contacto</Text>
        <Text style={[fuente(600), { fontSize: 11, color: color.textoSecundario }]}>{subtitulo}</Text>
      </View>
    </View>
  );
}

function ItemMenu({ e, activo, onPress }: { e: ElementoPanel; activo: boolean; onPress: () => void }) {
  const Icono = e.icono;
  return (
    <Presionable
      role="link"
      aria-current={activo ? 'page' : undefined}
      onPress={onPress}
      style={({ hovered }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 42,
        paddingHorizontal: 12,
        borderRadius: radio.boton44,
        backgroundColor: activo ? color.oscuro : hovered ? color.fondo : 'transparent',
      })}>
      <Icono size={18} color={activo ? color.acento : color.textoSecundario} strokeWidth={2} />
      <Text style={[fuente(activo ? 700 : 600), { flex: 1, fontSize: 14, color: activo ? color.blanco : color.texto }]}>{e.etiqueta}</Text>
      {e.contador ? (
        <View
          style={{
            minWidth: 22,
            height: 22,
            paddingHorizontal: 6,
            borderRadius: 11,
            backgroundColor: activo ? color.acento : color.amarilloFondo,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={[fuente(700), { fontSize: 12, color: activo ? color.texto : color.amarilloTexto }]}>{e.contador}</Text>
        </View>
      ) : null}
    </Presionable>
  );
}

function TituloGrupo({ texto, soloLectura }: { texto: string; soloLectura?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginTop: 14, marginBottom: 4, minHeight: 20 }}>
      <Texto variante="seccion" style={{ flex: 1 }}>
        {texto}
      </Texto>
      {soloLectura ? <Insignia texto="Solo lectura" tono="gris" icono={Lock} /> : null}
    </View>
  );
}

function Navegacion({ elementos, activa, onIr, rol }: { elementos: ElementoPanel[]; activa: string; onIr: (e: ElementoPanel) => void; rol: RolEquipo }) {
  const grupo = (g: ElementoPanel['grupo']) =>
    elementos.filter((e) => e.grupo === g).map((e) => <ItemMenu key={e.clave} e={e} activo={e.clave === activa} onPress={() => onIr(e)} />);
  return (
    <View role="navigation" aria-label="Secciones del panel" style={{ gap: 2 }}>
      {grupo('inicio')}
      <TituloGrupo texto="Revisión" />
      {grupo('revision')}
      <TituloGrupo texto="Configuración" soloLectura={rol === 'revisor'} />
      {grupo('configuracion')}
    </View>
  );
}

/** Rol actual, cambiar de rol y salir del panel (vuelve a la portada). */
function BloqueRol({ rol, alSalir }: { rol: RolEquipo; alSalir?: () => void }) {
  const otro: RolEquipo = rol === 'administrador' ? 'revisor' : 'administrador';
  const textoCambiar = `Cambiar a ${NOMBRE_ROL[otro].toLowerCase()}`;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.acento, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[fuente(700), { fontSize: 12, color: color.texto }]}>TÚ</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Texto variante="pequeno">Entraste como</Texto>
          <Texto variante="secundario" peso={700}>
            {NOMBRE_ROL[rol]}
          </Texto>
          <Presionable
            role="button"
            aria-label={textoCambiar}
            onPress={() => {
              entrarComo(otro);
              mostrarToast(`Ahora ves el panel como ${NOMBRE_ROL[otro].toLowerCase()}`, 'info');
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, alignSelf: 'flex-start' }}>
            <RefreshCw size={13} color={color.texto} strokeWidth={2.2} />
            <Text style={[fuente(700), { fontSize: 13, color: color.texto, textDecorationLine: 'underline' }]}>{textoCambiar}</Text>
          </Presionable>
        </View>
      </View>
      <Boton
        titulo="Salir del panel"
        icono={LogOut}
        variante="contorno"
        tamano="mediano"
        anchoCompleto
        onPress={() => {
          alSalir?.();
          salirDelPanel();
        }}
      />
    </View>
  );
}

/** Aviso de la demo: datos de ejemplo y conexión con la demo del conductor de este navegador. */
function AvisoDemo() {
  return (
    <View style={{ padding: 12, borderRadius: radio.campo, backgroundColor: color.fondo, gap: 4 }}>
      <Texto variante="pequeno" peso={700} tono="normal">
        Demo con datos de ejemplo
      </Texto>
      <Texto variante="pequeno">Conectada a la demo del conductor de este navegador.</Texto>
      <Presionable
        role="link"
        aria-label="Abrir la demo del conductor en otra pestaña"
        onPress={() => abrirDemoConductor('/')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32, alignSelf: 'flex-start' }}>
        <Text style={[fuente(700), { fontSize: 12, color: color.texto, textDecorationLine: 'underline' }]}>Abrir la demo del conductor</Text>
        <ArrowUpRight size={14} color={color.texto} strokeWidth={2.2} />
      </Presionable>
    </View>
  );
}

export interface PropsMarcoPanel {
  elementos: ElementoPanel[];
  activa: string;
  rol: RolEquipo;
  children: ReactNode;
}

/** Marco del panel: barra lateral (≥ 900 px) o barra superior con menú (celular). */
export function MarcoPanel({ elementos, activa, rol, children }: PropsMarcoPanel) {
  const { width } = useWindowDimensions();
  const escritorio = width >= ANCHO_ESCRITORIO;
  const [menu, setMenu] = useState(false);
  const insets = useSafeAreaInsets();
  const ir = (e: ElementoPanel) => {
    setMenu(false);
    router.navigate(e.href);
  };
  const actual = elementos.find((e) => e.clave === activa);

  if (escritorio) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: color.fondo }}>
        <View style={{ width: 264, backgroundColor: color.superficie, borderRightWidth: 1, borderRightColor: color.borde }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 24, gap: 20 }}>
            <View style={{ paddingHorizontal: 4 }}>
              <Marca />
            </View>
            <Navegacion elementos={elementos} activa={activa} onIr={ir} rol={rol} />
            <View style={{ marginTop: 'auto', gap: 16 }}>
              <AvisoDemo />
              <View style={{ height: 1, backgroundColor: color.separador }} />
              <BloqueRol rol={rol} />
            </View>
          </ScrollView>
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: color.superficie,
          borderBottomWidth: 1,
          borderBottomColor: color.borde,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <BotonIcono icono={Menu} etiquetaAccesible="Abrir menú del panel" variante="suave" onPress={() => setMenu(true)} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[fuente(700), { fontSize: 15, color: color.texto }]}>
            {actual?.etiqueta ?? 'Panel'}
          </Text>
          <Text numberOfLines={1} style={[fuente(500), { fontSize: 12, color: color.textoSecundario }]}>
            Panel · {NOMBRE_ROL[rol]}
          </Text>
        </View>
        <Insignia texto="Demo" tono="gris" icono={null} style={{ alignSelf: 'center' }} />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <HojaInferior visible={menu} onCerrar={() => setMenu(false)} titulo="Panel de administración">
        <View style={{ gap: 16 }}>
          <Navegacion elementos={elementos} activa={activa} onIr={ir} rol={rol} />
          <View style={{ height: 1, backgroundColor: color.separador }} />
          <BloqueRol rol={rol} alSalir={() => setMenu(false)} />
          <AvisoDemo />
        </View>
      </HojaInferior>
    </View>
  );
}

/** Línea para el revisor en las secciones que solo cambia un administrador. */
export function AvisoSoloLectura() {
  return (
    <View
      role="note"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: color.superficieHundida,
        borderRadius: radio.campo,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}>
      <Lock size={16} color={color.texto} strokeWidth={2} />
      <Texto variante="secundario" peso={600} style={{ flex: 1 }}>
        Solo un administrador puede cambiar esto.
      </Texto>
    </View>
  );
}

export interface PropsPaginaPanel {
  titulo: string;
  descripcion?: string;
  /** Botones a la derecha del título. */
  acciones?: ReactNode;
  /** Para el revisor en las secciones de configuración: muestra AvisoSoloLectura bajo el título. */
  soloLectura?: boolean;
  children: ReactNode;
  /** Ancho máximo del contenido (1100 por defecto). */
  anchoMaximo?: number;
  style?: StyleProp<ViewStyle>;
}

/** Página del panel: título, descripción y contenido con scroll. */
export function PaginaPanel({ titulo, descripcion, acciones, soloLectura, children, anchoMaximo = 1100, style }: PropsPaginaPanel) {
  const { width } = useWindowDimensions();
  const escritorio = width >= ANCHO_ESCRITORIO;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: escritorio ? 32 : 16, paddingBottom: 48 }}>
      <View style={[{ width: '100%', maxWidth: anchoMaximo, alignSelf: 'center', gap: 20 }, style]}>
        <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'flex-end' : 'stretch', gap: 12 }}>
          <View style={{ flex: escritorio ? 1 : undefined, gap: 6 }}>
            <Titulo>{titulo}</Titulo>
            {descripcion ? (
              <Texto variante="parrafo" tono="secundario" style={{ maxWidth: 720 }}>
                {descripcion}
              </Texto>
            ) : null}
          </View>
          {acciones && !soloLectura ? <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{acciones}</View> : null}
        </View>
        {soloLectura ? <AvisoSoloLectura /> : null}
        {children}
      </View>
    </ScrollView>
  );
}

/** Cifra destacada para el resumen del panel. */
export function Metrica({ etiqueta, valor, detalle, onPress }: { etiqueta: string; valor: string | number; detalle?: string; onPress?: () => void }) {
  return (
    <Presionable
      disabled={!onPress}
      onPress={onPress}
      style={{ flexGrow: 1, flexBasis: 180, backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, padding: 16, gap: 6 }}>
      <Texto variante="ayuda" peso={600}>
        {etiqueta}
      </Texto>
      <Text style={[tipo.h1, { color: color.texto }]}>{valor}</Text>
      {detalle ? <Texto variante="pequeno">{detalle}</Texto> : null}
    </Presionable>
  );
}

// Marco del panel de administración (ancho completo): barra lateral en escritorio, menú en celular.
// Antes estaba en src/ui/panel.tsx. Guardado fuera del mockup (ver src/panel/README.md).
import { useState, type ReactNode } from 'react';
import { ScrollView, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HojaInferior } from '@/ui/capas';
import { BotonIcono, Presionable } from '@/ui/controles';
import { KeyRound, Menu, type LucideIcon } from '@/ui/iconos';
import { BotonDemo } from '@/ui/navegacion';
import { Texto, Titulo } from '@/ui/texto';
import { ANCHO_ESCRITORIO, color, fuente, radio, tipo } from '@/ui/tokens';

export interface ElementoPanel {
  clave: string;
  etiqueta: string;
  icono: LucideIcon;
  href: Href;
  /** Número a la derecha (ej. documentos en cola). */
  contador?: number;
}

function Marca({ claro }: { claro?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color.acento, alignItems: 'center', justifyContent: 'center' }}>
        <KeyRound size={17} color={color.texto} strokeWidth={2.2} />
      </View>
      <View>
        <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 15, color: claro ? color.blanco : color.texto }}>Dale Contacto</Text>
        <Text style={[fuente(600), { fontSize: 11, color: color.textoSecundario }]}>Panel de administración</Text>
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
        paddingHorizontal: 12,
        borderRadius: radio.boton44,
        backgroundColor: activo ? color.oscuro : 'transparent',
      }}>
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

export interface PropsMarcoPanel {
  elementos: ElementoPanel[];
  activa: string;
  children: ReactNode;
}

/** Marco del panel: barra lateral (≥ 900 px) o barra superior con menú (celular). */
export function MarcoPanel({ elementos, activa, children }: PropsMarcoPanel) {
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
        <View style={{ width: 256, backgroundColor: color.superficie, borderRightWidth: 1, borderRightColor: color.borde, paddingHorizontal: 16, paddingVertical: 24, gap: 24 }}>
          <View style={{ paddingHorizontal: 4 }}>
            <Marca />
          </View>
          <View role="navigation" style={{ gap: 4 }}>
            {elementos.map((e) => (
              <ItemMenu key={e.clave} e={e} activo={e.clave === activa} onPress={() => ir(e)} />
            ))}
          </View>
          <View style={{ marginTop: 'auto', padding: 12, borderRadius: radio.campo, backgroundColor: color.fondo, gap: 4 }}>
            <Texto variante="pequeno" peso={700} tono="normal">
              Demo con datos de ejemplo
            </Texto>
            <Texto variante="pequeno">Los cambios quedan solo en este navegador.</Texto>
            <BotonDemo enLinea style={{ marginTop: 4 }} />
          </View>
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
        <View style={{ flex: 1 }}>
          <Text style={[fuente(700), { fontSize: 15, color: color.texto }]}>{actual?.etiqueta ?? 'Panel'}</Text>
          <Text style={[fuente(500), { fontSize: 12, color: color.textoSecundario }]}>Panel de administración</Text>
        </View>
        <View style={{ width: 76 }} />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <BotonDemo style={{ top: insets.top + 10 }} />
      <HojaInferior visible={menu} onCerrar={() => setMenu(false)} titulo="Panel de administración">
        <View style={{ gap: 4 }}>
          {elementos.map((e) => (
            <ItemMenu key={e.clave} e={e} activo={e.clave === activa} onPress={() => ir(e)} />
          ))}
        </View>
      </HojaInferior>
    </View>
  );
}

export interface PropsPaginaPanel {
  titulo: string;
  descripcion?: string;
  /** Botones a la derecha del título. */
  acciones?: ReactNode;
  children: ReactNode;
  /** Ancho máximo del contenido (1100 por defecto). */
  anchoMaximo?: number;
  style?: StyleProp<ViewStyle>;
}

/** Página del panel: título, descripción y contenido con scroll. */
export function PaginaPanel({ titulo, descripcion, acciones, children, anchoMaximo = 1100, style }: PropsPaginaPanel) {
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
          {acciones ? <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{acciones}</View> : null}
        </View>
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

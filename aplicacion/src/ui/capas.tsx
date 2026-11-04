// Capas sobre la pantalla: HojaInferior (sube desde abajo) y Dialogo (confirmación centrada).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Boton, BotonIcono } from './controles';
import { X } from './iconos';
import { Texto, Titulo } from './texto';
import { ANCHO_CELULAR, color, duracion, radio } from './tokens';

function useAparicion(visible: boolean) {
  const [montado, setMontado] = useState(visible);
  const valor = useRef(new Animated.Value(visible ? 1 : 0)).current;
  useEffect(() => {
    if (visible) setMontado(true);
    Animated.timing(valor, { toValue: visible ? 1 : 0, duration: duracion.normal, useNativeDriver: false }).start(({ finished }) => {
      if (finished && !visible) setMontado(false);
    });
  }, [visible, valor]);
  return { montado, valor };
}

export interface PropsHojaInferior {
  visible: boolean;
  onCerrar: () => void;
  titulo?: string;
  /** Texto bajo el título. */
  descripcion?: string;
  children?: ReactNode;
  /** Botones al final (fijos). */
  pie?: ReactNode;
}

/** Hoja que sube desde abajo, dentro de la columna de celular. Se cierra tocando fuera. */
export function HojaInferior({ visible, onCerrar, titulo, descripcion, children, pie }: PropsHojaInferior) {
  const { montado, valor } = useAparicion(visible);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  if (!montado) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onCerrar} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.velo, opacity: valor }}>
          <Pressable aria-label="Cerrar" style={{ flex: 1 }} onPress={onCerrar} />
        </Animated.View>
        <Animated.View
          role="dialog"
          aria-modal
          aria-label={titulo}
          style={{
            width: '100%',
            maxWidth: ANCHO_CELULAR,
            maxHeight: height * 0.88,
            backgroundColor: color.superficie,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 10,
            paddingBottom: 20 + insets.bottom,
            transform: [{ translateY: valor.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            opacity: valor,
          }}>
          <View aria-hidden style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: color.bordeCampo, marginBottom: 8 }} />
          {titulo ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingBottom: 8 }}>
              <View style={{ flex: 1, gap: 4, paddingTop: 8 }}>
                <Titulo nivel={2}>{titulo}</Titulo>
                {descripcion ? (
                  <Texto variante="secundario" tono="secundario">
                    {descripcion}
                  </Texto>
                ) : null}
              </View>
              <BotonIcono icono={X} etiquetaAccesible="Cerrar" variante="suave" onPress={onCerrar} />
            </View>
          ) : null}
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 12 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {pie ? <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>{pie}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

export interface PropsDialogo {
  visible: boolean;
  titulo: string;
  texto?: string;
  children?: ReactNode;
  confirmar: { titulo: string; onPress: () => void; peligro?: boolean };
  /** Por defecto "Cancelar". */
  cancelar?: { titulo?: string; onPress: () => void };
}

/** Diálogo de confirmación centrado (ej. "¿Compartir tu dirección? No se puede deshacer"). */
export function Dialogo({ visible, titulo, texto, children, confirmar, cancelar }: PropsDialogo) {
  const { montado, valor } = useAparicion(visible);
  if (!montado) return null;
  const cerrar = cancelar?.onPress ?? (() => undefined);
  return (
    <Modal visible transparent animationType="none" onRequestClose={cerrar} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.velo, opacity: valor }}>
          <Pressable aria-label="Cerrar" style={{ flex: 1 }} onPress={cerrar} />
        </Animated.View>
        <Animated.View
          role="alertdialog"
          aria-modal
          aria-label={titulo}
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: color.superficie,
            borderRadius: radio.tarjeta,
            padding: 20,
            gap: 12,
            opacity: valor,
            transform: [{ scale: valor.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
          }}>
          <Titulo nivel={2}>{titulo}</Titulo>
          {texto ? (
            <Texto variante="parrafo" tono="secundario">
              {texto}
            </Texto>
          ) : null}
          {children}
          <View style={{ gap: 10, marginTop: 4 }}>
            <Boton titulo={confirmar.titulo} onPress={confirmar.onPress} variante={confirmar.peligro ? 'peligro' : 'oscuro'} />
            <Boton titulo={cancelar?.titulo ?? 'Cancelar'} onPress={cerrar} variante="contorno" />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

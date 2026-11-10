// Piezas compartidas por las pantallas de ingreso y registro (A1–A4, B1–B5).
// Copian el estilo exacto de las maquetas (docs/maqueta/Cond*.dc.html).
import { useEffect, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { Platform, ScrollView, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { borrarBorrador, guardarBorrador, leerBorrador } from '@/datos/borradores';
import { useEntorno } from '@/datos/puerto/contexto';
import { Presionable, Texto, Titulo, color, fuente, radio, tipo, type LucideIcon } from '@/ui';
import { CircleAlert, Info, Sparkles } from '@/ui/iconos';

/** En web, reparte las líneas de un texto corto de forma pareja (como `text-wrap: balance` de las maquetas). */
export const equilibrado = (Platform.OS === 'web' ? { textWrap: 'balance' } : {}) as TextStyle;

/**
 * ¿Los formularios exigen los campos con *? En la demo, el ajuste validarObligatorios (apagado a pedido
 * de la dueña); en la app real, siempre.
 */
export function useValidarObligatorios(): boolean {
  return useEntorno().validarObligatorios;
}

/**
 * Borrador de un paso del registro (B1–B4): lo escrito y no guardado sobrevive a recargar la página.
 * `guardados` son los valores de la tienda al abrir el paso; si hay borrador, manda el borrador.
 * Llama a `recordar(valores)` cuando cambian (ver useRecordarBorrador) y a `olvidar()` al guardar.
 * En modo edición (desde Perfil) no se usa: salir sin guardar descarta los cambios.
 */
export function useBorradorPaso<T extends object>(paso: number, activo: boolean, guardados: T) {
  const clave = `paso:${paso}`;
  const [inicial] = useState<T>(() => {
    const b = activo ? leerBorrador<Partial<T>>(clave) : undefined;
    return b ? { ...guardados, ...b } : guardados;
  });
  const base = useRef(JSON.stringify(guardados));
  return {
    inicial,
    recordar: (valores: T) => {
      if (!activo) return;
      if (JSON.stringify(valores) === base.current) borrarBorrador(clave);
      else guardarBorrador(clave, valores);
    },
    olvidar: () => borrarBorrador(clave),
  };
}

/** Guarda el borrador cada vez que cambian los valores del formulario. */
export function useRecordarBorrador<T extends object>(borrador: { recordar: (v: T) => void }, valores: T) {
  const json = JSON.stringify(valores);
  const ultimo = useRef(json);
  useEffect(() => {
    if (json === ultimo.current) return;
    ultimo.current = json;
    borrador.recordar(JSON.parse(json) as T);
  }, [json, borrador]);
}

/**
 * Tras un intento fallido de guardar: lleva la vista al primer campo con error (o arriba) y lo enfoca.
 * Busca solo dentro del scroll de esta pantalla (en la web, las pantallas de atrás siguen en el DOM).
 */
export function irAlPrimerError(scrollRef: RefObject<ComponentRef<typeof ScrollView> | null>) {
  setTimeout(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    if (Platform.OS === 'web') {
      const nodo = (scroll as unknown as { getScrollableNode?: () => HTMLElement | null }).getScrollableNode?.();
      const primero = nodo?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
      if (nodo && primero) {
        const arriba = primero.getBoundingClientRect().top - nodo.getBoundingClientRect().top + nodo.scrollTop - 96;
        // (En react-native-web, scrollTo del nodo es el de ScrollView: recibe { y, animated }.)
        scroll.scrollTo({ y: Math.max(0, arriba), animated: true });
        if (primero.matches('input, textarea')) primero.focus({ preventScroll: true });
        return;
      }
    }
    scroll.scrollTo({ y: 0, animated: true });
  }, 60);
}

/** Título de la pantalla y el párrafo gris de abajo (h1 26 px + subtítulo 15 px). */
export function CabeceraFormulario({
  titulo,
  subtitulo,
  equilibrar,
  children,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  /** Reparte las líneas del subtítulo de forma pareja (como en las maquetas de los pasos 2 a 4). */
  equilibrar?: boolean;
  children?: ReactNode;
}) {
  return (
    <View style={{ marginTop: 8, gap: 6 }}>
      <Titulo>{titulo}</Titulo>
      {subtitulo ? (
        <Texto variante="parrafo" tono="secundario" style={equilibrar ? equilibrado : undefined}>
          {subtitulo}
        </Texto>
      ) : null}
      {children}
    </View>
  );
}

/** Etiqueta de un grupo de opciones (14 negrita) con asterisco y ayuda gris opcionales. */
export function EtiquetaGrupo({
  titulo,
  ayuda,
  obligatorio,
  nota,
  error,
}: {
  titulo: string;
  ayuda?: string;
  obligatorio?: boolean;
  /** Texto gris junto a la etiqueta, ej. "(opcional)". */
  nota?: string;
  /** Mensaje de error bajo la ayuda. */
  error?: string | false | null;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text role="heading" aria-level={2} style={[tipo.etiqueta, { color: color.texto }]}>
        {titulo}
        {nota ? <Text style={[fuente(500), { color: color.textoSecundario }]}> {nota}</Text> : null}
        {obligatorio ? (
          <Text aria-hidden style={{ color: color.error }}>
            {' '}
            *
          </Text>
        ) : null}
      </Text>
      {ayuda ? <Texto variante="ayuda">{ayuda}</Texto> : null}
      {error ? (
        <Text role="alert" style={[tipo.ayuda, fuente(600), { color: color.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** Alerta roja de la maqueta: "Completa los campos marcados con * para guardar." */
export function AlertaObligatorios({ texto = 'Completa los campos marcados con * para guardar.' }: { texto?: string }) {
  return (
    <View
      role="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: color.errorFondo,
        borderRadius: radio.campo,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}>
      <CircleAlert size={18} color={color.error} strokeWidth={2} />
      <Text style={[tipo.secundario, fuente(600), { flex: 1, color: color.error }]}>{texto}</Text>
    </View>
  );
}

/** "* Obligatorio", centrado bajo los botones. */
export function NotaObligatorio() {
  return (
    <Text style={[tipo.pequeno, fuente(400), { textAlign: 'center', color: color.textoSecundario }]}>
      <Text style={{ color: color.error }}>*</Text> Obligatorio
    </Text>
  );
}

/**
 * Nota discreta de la demo (destello + texto gris), con una acción opcional subrayada.
 * Ej.: "Demo: cualquier código de 6 dígitos" o "Demo: Rellenar con datos de ejemplo".
 */
export function NotaDemo({
  texto,
  accion,
  centrada,
  style,
}: {
  texto: string;
  accion?: { titulo: string; onPress: () => void };
  centrada?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const contenido = (
    <>
      <Sparkles size={14} color={color.amarilloTexto} strokeWidth={2.2} />
      <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
        {texto}
        {accion ? ' ' : null}
        {accion ? <Text style={[fuente(700), { color: color.texto, textDecorationLine: 'underline' }]}>{accion.titulo}</Text> : null}
      </Text>
    </>
  );
  const estilo: StyleProp<ViewStyle> = [
    { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, alignSelf: centrada ? 'center' : 'flex-start' },
    style,
  ];
  if (accion) {
    return (
      <Presionable role="button" aria-label={`${texto} ${accion.titulo}`} onPress={accion.onPress} hitSlop={8} style={[estilo, { minHeight: 44 }]}>
        {contenido}
      </Presionable>
    );
  }
  return <View style={estilo}>{contenido}</View>;
}

/** Tarjeta blanca con ícono de información (A2: "Con este número entrarás a la app…"). */
export function TarjetaInfo({ texto, icono: Icono = Info }: { texto: string; icono?: LucideIcon }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: color.superficie,
        borderWidth: 1,
        borderColor: color.borde,
        borderRadius: radio.campo,
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}>
      <Icono size={20} color={color.textoSecundario} strokeWidth={2} />
      <Text style={[tipo.secundario, { flex: 1, lineHeight: 20, color: color.textoSuave }]}>{texto}</Text>
    </View>
  );
}

/** Botón de texto de 44 px con ícono (A3: "Recibir el código por SMS"). */
export function BotonTexto({
  titulo,
  icono: Icono,
  onPress,
  deshabilitado,
  subrayado = true,
  style,
}: {
  titulo: string;
  icono?: LucideIcon;
  onPress?: () => void;
  deshabilitado?: boolean;
  subrayado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const tinta = deshabilitado ? color.textoSecundario : color.texto;
  return (
    <Presionable
      role="button"
      aria-disabled={deshabilitado}
      disabled={deshabilitado}
      onPress={onPress}
      style={[{ minHeight: 44, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }, style]}>
      {Icono ? <Icono size={16} color={tinta} strokeWidth={2} /> : null}
      <Text style={[tipo.botonChico, fuente(600), { color: tinta }, subrayado && !deshabilitado && { textDecorationLine: 'underline' }]}>
        {titulo}
      </Text>
    </Presionable>
  );
}

/** "Región Metropolitana de Santiago", "Región del Biobío", "Región de Valparaíso". */
export function textoRegion(nombre: string | undefined): string {
  if (!nombre) return '';
  if (/^Metropolitana/i.test(nombre)) return `Región ${nombre}`;
  if (/^(Libertador|Maule|Biob[ií]o)/i.test(nombre)) return `Región del ${nombre}`;
  return `Región de ${nombre}`;
}

/** Texto de ayuda de un documento con los días del ajuste diasAntiguedadPdf ("PDF … de 30 días o menos"). */
export function ayudaDocumento(ayuda: string, dias: number): string {
  return ayuda.replace(/\d+\s+días/, `${dias} días`);
}

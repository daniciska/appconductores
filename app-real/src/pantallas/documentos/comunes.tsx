// Piezas de las pantallas de documentos de la app real (Paso 5, Subir, Mis documentos, Inicio y Perfil).
// La parte visual viene de las piezas aprobadas del mockup (aplicacion/src/pantallas/documentos/piezas.tsx);
// los datos, de la base (src/datos/documentos.ts): estado de cada documento, avisos de vencimiento y la
// autorización "Revisión de mis documentos".
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/ui/escala';
import type { Href } from 'expo-router';

import { GUIAS, esTipoDocumento, type GuiaDocumento } from '@/pantallas/documentos/textos';
import { Boton, Casilla, HojaInferior, Presionable, color, fuente, mostrarToast, radio, tipo, type PropsInsignia } from '@/ui';
import { Clock, X } from '@/ui/iconos';

import { CuadroIcono } from '@/pantallas/documentos/piezas';

import {
  hoyEnChile,
  resumenDocumentos,
  textoAviso,
  textoEstado,
  textoRevisionPendiente,
  type ResumenDocumentos,
  type TipoDocumentoReal,
  type VistaTipo,
} from '@real/datos/documentos';
import { accionesDocumentos } from '@real/datos/puertoReal';
import { useTiendaReal } from '@real/datos/tiendaReal';

/** Ruta de C1 (subir) para un tipo de documento (por su clave). */
export function rutaSubir(clave: string): Href {
  return { pathname: '/conductor/documentos/subir/[tipo]', params: { tipo: clave } };
}

/** Estado de los documentos propios, al día (se recalcula si cambia algo o cambia el día). */
export function useDocumentos(): ResumenDocumentos & { meses: number } {
  const tipos = useTiendaReal((s) => s.tiposDocumento);
  const documentos = useTiendaReal((s) => s.documentos);
  const meses = useTiendaReal((s) => s.mesesAvisoDocumentos);
  const hoy = hoyEnChile();
  return useMemo(() => ({ ...resumenDocumentos(tipos, documentos, hoy, meses), meses }), [tipos, documentos, hoy, meses]);
}

/** El texto vigente de "Revisión de mis documentos" si todavía no está aceptado (o null). */
export function useRevisionPendiente() {
  const textos = useTiendaReal((s) => s.textos);
  const aceptados = useTiendaReal((s) => s.aceptados);
  return useMemo(() => textoRevisionPendiente(textos, aceptados), [textos, aceptados]);
}

/** La guía del documento (cómo tomar la foto o cómo obtenerlo). Un tipo nuevo del panel usa una general. */
export function guiaDe(t: TipoDocumentoReal): GuiaDocumento {
  if (esTipoDocumento(t.clave)) return GUIAS[t.clave];
  const pdf = t.formato === 'pdf';
  return {
    descripcion: t.ayuda,
    tituloPasos: pdf ? 'Cómo subirlo' : 'Cómo tomar la foto',
    pasos: pdf
      ? ['Descárgalo en PDF.', 'Súbelo aquí tal como lo descargaste.']
      : ['Toma la foto de frente, con buena luz y sin reflejos.', 'Revisa que se lea completo.'],
    aviso: () => 'Debe estar vigente.',
    privacidad: 'Solo nuestro equipo de verificación lo ve. Nunca se muestra a los titulares.',
    boton: pdf ? 'Elegir PDF' : 'Elegir foto',
    acepta: pdf ? 'application/pdf,.pdf' : 'image/*',
    esPdf: pdf,
    ...(t.enlace ? { enlace: { titulo: 'Cómo obtenerlo', url: t.enlace } } : {}),
  };
}

/** Insignia del estado de un documento (mismos tonos que la maqueta). */
export function insigniaDocumento(v: VistaTipo): PropsInsignia {
  const texto = textoEstado(v);
  switch (v.estado) {
    case 'aprobado':
    case 'renovacion_en_revision':
      return { texto, tono: 'verde' };
    case 'vence_pronto':
    case 'en_revision':
      return { texto, tono: 'amarilla', icono: Clock };
    case 'vencido':
    case 'no_aprobado':
      return { texto, tono: 'roja', icono: X };
    default:
      return { texto, tono: 'gris', icono: null };
  }
}

/** Avisos de vencimiento (Inicio, Paso 5 y Mis documentos): uno por documento, lleva a subirlo de nuevo. */
export function AvisosVencimiento({ avisos }: { avisos: VistaTipo[] }) {
  if (avisos.length === 0) return null;
  return (
    <View style={{ gap: 10 }}>
      {avisos.map((v) => {
        const vencido = v.estado === 'vencido';
        const texto = textoAviso(v);
        return (
          <Presionable
            key={v.tipo.id}
            role="button"
            aria-label={`${texto} Subir de nuevo`}
            href={rutaSubir(v.tipo.clave)}
            style={{
              backgroundColor: vencido ? color.errorFondo : color.amarilloFondo,
              borderRadius: radio.tarjeta,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
            <CuadroIcono icono={vencido ? X : Clock} fondo={color.superficie} colorIcono={vencido ? color.error : color.amarilloTexto} />
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={[tipo.cuerpo, fuente(600), { lineHeight: 21, color: vencido ? color.error : color.amarilloTexto }]}>{texto}</Text>
              <Text style={[tipo.ayuda, fuente(700), { color: color.texto, textDecorationLine: 'underline' }]}>Subir de nuevo</Text>
            </View>
          </Presionable>
        );
      })}
    </View>
  );
}

/** Para la fila del perfil: el aviso más próximo, o null. */
export function insigniaAviso(r: ResumenDocumentos): PropsInsignia | null {
  const a = r.avisos[0];
  if (!a) return null;
  return a.estado === 'vencido' ? { texto: 'Vencido', tono: 'roja', icono: X } : { texto: 'Vence pronto', tono: 'amarilla', icono: Clock };
}

/**
 * "Revisión de mis documentos": se pide antes de subir el primer documento si la persona no la aceptó
 * en "Antes de empezar". Una casilla (sin marcar) y "Aceptar y subir".
 */
export function HojaRevision({ visible, texto, onCerrar, onAceptada }: { visible: boolean; texto: string; onCerrar: () => void; onAceptada: () => void }) {
  const [marcada, setMarcada] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const aceptar = async () => {
    if (!marcada) return;
    setGuardando(true);
    const r = await accionesDocumentos.aceptarRevision();
    setGuardando(false);
    if (!r.ok) {
      mostrarToast(r.error, 'error');
      return;
    }
    onAceptada();
  };
  return (
    <HojaInferior
      visible={visible}
      onCerrar={onCerrar}
      titulo="Antes de subir tus documentos"
      pie={<Boton titulo="Aceptar y subir" variante="oscuro" deshabilitado={!marcada} cargando={guardando} onPress={aceptar} />}>
      <Presionable
        role="checkbox"
        aria-checked={marcada}
        onPress={() => setMarcada((m) => !m)}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 44, paddingVertical: 4 }}>
        <View style={{ marginTop: 1 }}>
          <Casilla marcada={marcada} />
        </View>
        <Text style={[tipo.cuerpo, fuente(500), { flex: 1, lineHeight: 22, color: color.texto }]}>{texto}</Text>
      </Presionable>
    </HojaInferior>
  );
}

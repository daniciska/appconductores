// B6 · Inicio con el perfil incompleto (tarjeta oscura con el avance y la lista de los 5 pasos).
// Maqueta: docs/maqueta/CondInicioIncompleto.dc.html
// La comparten el Inicio de la demo y el de la app real. Lo único que cambia es la fila de los
// documentos: en la demo lleva al Paso 5 ("N de 4 subidos"); en la app real también, con el estado
// real ("N de 4 aprobados", "En revisión"…: textoEstado).
// S09 (aprobada el 24-nov, ajustada): "Completa tu perfil para aparecer en los matches.", sin la nota de
// la campana en la app real, y las filas "Listo" de los pasos 1 a 4 también se tocan: abren ese paso
// para revisarlo o cambiarlo (modo edición).
import { View } from 'react-native';
import { Text, useMedidas } from '@/ui/escala';
import type { Href } from 'expo-router';

import { avancePerfil } from '@/datos/puerto/derivados';
import { useVista, useVistaDerivada } from '@/datos/puerto/contexto';
import { Boton, Presionable, Separado, color, fuente, radio, tipo } from '@/ui';
import { Bell, Check, ChevronRight } from '@/ui/iconos';

import { RUTA_PASO } from '../ingreso/acciones';
import { BarraAvance, GRIS_SOBRE_OSCURO, Nota, TarjetaOscura } from './piezas';

const NOMBRE_SECCION: Record<string, string> = {
  datos: 'Tus datos y licencia',
  direccion: 'Dónde vives',
  experiencia: 'Tu experiencia',
  trabajo: 'Qué trabajo buscas',
  documentos: 'Tus documentos',
};

export type DocumentosInicio =
  /**
   * La fila lleva al Paso 5. Demo: "N de 4 subidos". App real: `textoEstado` ("2 de 4 aprobados",
   * "En revisión"…) y `textoListo` ("Aprobados") cuando el paso está listo.
   */
  | { modo: 'activo'; subidos: number; ruta: Href; textoEstado?: string; textoListo?: string };

export function VistaIncompleta({ documentos, nota }: { documentos: DocumentosInicio; nota?: string }) {
  const m = useMedidas();
  const avance = useVistaDerivada(avancePerfil);
  const registrado = useVista((v) => v.conductor.registrado);
  const pasos = useVista((v) => v.conductor.pasosListos);
  const siguiente = avance.siguientePaso ?? 5;
  const rutaDe = (paso: number): Href | null =>
    paso <= 4 ? RUTA_PASO[paso as 1 | 2 | 3 | 4] : documentos.ruta;

  const filas = (['datos', 'direccion', 'experiencia', 'trabajo', 'documentos'] as const).map((id, i) => {
    const listo = pasos[id];
    const estado = listo
      ? id === 'documentos'
        ? (documentos.textoListo ?? 'Enviados')
        : 'Listo'
      : id === 'documentos'
        ? (documentos.textoEstado ?? `${documentos.subidos} de 4 subidos`)
        : 'Falta';
    return { id, paso: i + 1, nombre: NOMBRE_SECCION[id], listo, estado, ruta: rutaDe(i + 1) };
  });
  const rutaBoton = registrado ? rutaDe(siguiente) : '/conductor/bienvenida';

  return (
    <>
      <TarjetaOscura>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.2, color: color.blanco }}>
            {registrado ? 'Ya estás registrado' : 'Aún no te registras'}
          </Text>
          <Text style={[tipo.secundario, { lineHeight: 21, color: GRIS_SOBRE_OSCURO }]}>
            {registrado ? 'Completa tu perfil para aparecer en los matches.' : 'Crea tu perfil para empezar a aparecer en los matches.'}
          </Text>
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[tipo.ayuda, { color: GRIS_SOBRE_OSCURO }]}>
              {avance.listos} de {avance.total} pasos listos
            </Text>
            <Text style={[tipo.ayuda, { color: GRIS_SOBRE_OSCURO }]}>{avance.porcentaje}%</Text>
          </View>
          <BarraAvance
            valor={avance.listos / avance.total}
            etiqueta="Avance del perfil"
            maximo={avance.total}
            actual={avance.listos}
          />
        </View>
        {rutaBoton ? (
          <Boton titulo={registrado ? 'Continuar mi perfil' : 'Crear mi perfil'} variante="principal" href={rutaBoton} />
        ) : null}
      </TarjetaOscura>

      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingVertical: 6, paddingHorizontal: 16 }}>
        <Separado>
          {filas.map((f) => {
            // Lo que falta abre el paso del registro; lo listo (pasos 1 a 4), el mismo paso para revisarlo.
            const editarListo = f.listo && registrado && f.paso <= 4;
            const enlace: Href | null = editarListo
              ? { pathname: RUTA_PASO[f.paso as 1 | 2 | 3 | 4] as '/conductor/registro/1', params: { editar: '1' } }
              : !f.listo && registrado
                ? f.ruta
                : null;
            const contenido = (
              <>
                {f.listo ? (
                  <View aria-hidden style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color.exitoFondo, alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={15} color={color.exito} strokeWidth={2.8} />
                  </View>
                ) : (
                  <View aria-hidden style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.interruptorApagado }} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{f.nombre}</Text>
                  <Text style={[tipo.ayuda, f.listo ? [fuente(600), { color: color.exitoTexto }] : { color: color.textoSecundario }]}>
                    {f.estado}
                  </Text>
                </View>
                {enlace === null ? null : <ChevronRight size={m.icono(18)} color={color.texto} strokeWidth={2} />}
              </>
            );
            const estilo = { minHeight: 56, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 6 };
            return enlace ? (
              <Presionable key={f.id} role="button" aria-label={`${f.nombre}: ${f.estado}`} href={enlace} style={estilo}>
                {contenido}
              </Presionable>
            ) : (
              <View key={f.id} style={estilo}>
                {contenido}
              </View>
            );
          })}
        </Separado>
      </View>

      {nota ? (
        <Nota icono={Bell} tono="suave">
          {nota}
        </Nota>
      ) : null}
    </>
  );
}

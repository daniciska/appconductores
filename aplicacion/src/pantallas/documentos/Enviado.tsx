// C2 · Enviado a revisión
// Ruta: /conductor/documentos/enviado (opcional ?tipo=licencia cuando se envió uno solo)
// Maqueta: docs/maqueta/CondEnviado.dc.html
// Los pasos de "Qué pasa ahora" se marcan en vivo: la pre-revisión automática termina a los ~3 s y
// la Hoja de Vida y los antecedentes esperan a una persona en el panel.
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { TIPOS_DOC_ORDEN } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import { Boton, Pantalla, Texto, color } from '@/ui';
import { Check, CircleAlert } from '@/ui/iconos';

import { PasosNumerados } from './piezas';
import { TU_DOCUMENTO, esTipoDocumento, fem } from './textos';

export default function Enviado() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const documentos = useDemo((s) => s.documentos);
  const verificacion = useDemo((s) => s.conductor.estadoVerificacion);

  const lista = TIPOS_DOC_ORDEN.map((t) => documentos[t]);
  const enviados = lista.filter((d) => d.estado !== 'falta' && d.estado !== 'subido');
  const enPrerevision = lista.some((d) => d.estado === 'en_revision' && d.etapa === 'ia');
  const enRevision = lista.some((d) => d.estado === 'en_revision');
  const paso1 = enviados.length > 0 && !enPrerevision;
  const paso2 = paso1 && !enRevision;
  const verificado = verificacion === 'verificado';
  const conObservaciones = verificacion === 'con_observaciones' && !enRevision;

  const uno = esTipoDocumento(tipo);
  const titulo = verificado
    ? 'Tus documentos están aprobados'
    : conObservaciones
      ? 'Un documento no fue aprobado'
      : uno
        ? `${TU_DOCUMENTO[tipo]} está en revisión`
        : 'Tus documentos están en revisión';
  const subtitulo = verificado
    ? 'Ya apareces en los matches.'
    : conObservaciones
      ? 'En el inicio verás el motivo y qué puedes hacer.'
      : 'Te avisaremos cuando terminemos. Normalmente en menos de 24 horas.';

  const escala = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    escala.setValue(0.8);
    Animated.spring(escala, { toValue: 1, friction: 6, tension: 120, useNativeDriver: false }).start();
  }, [escala, verificado, conObservaciones]);

  return (
    <Pantalla>
      <View style={{ marginTop: 40, alignItems: 'center', gap: 20 }}>
        <Animated.View
          aria-hidden
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: conObservaciones ? color.errorFondo : color.exitoFondo,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: escala }],
          }}>
          {conObservaciones ? (
            <CircleAlert size={36} color={color.error} strokeWidth={2.2} />
          ) : (
            <Check size={36} color={color.exito} strokeWidth={2.6} />
          )}
        </Animated.View>
        <View style={{ gap: 10, paddingHorizontal: 8 }}>
          <Text
            role="heading"
            aria-level={1}
            aria-live="polite"
            style={{ fontFamily: 'Sora_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.4, color: color.texto, textAlign: 'center' }}>
            {titulo}
          </Text>
          <Texto variante="parrafo" tono="secundario" centrado>
            {subtitulo}
          </Texto>
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <PasosNumerados
          titulo={verificado ? 'Qué pasó' : 'Qué pasa ahora'}
          pasos={
            uno
              ? [
                  // Un solo documento (ej. después de subirlo de nuevo): en singular y concordando.
                  { texto: `Un sistema automático ${fem(tipo, 'la', 'lo')} revisa primero.`, hecho: paso1 },
                  { texto: `Si hay dudas o algún problema, ${fem(tipo, 'la', 'lo')} revisa una persona de nuestro equipo.`, hecho: paso2 },
                  { texto: `Cuando esté ${fem(tipo, 'aprobada', 'aprobado')}, empiezas a aparecer en los matches.`, hecho: verificado },
                ]
              : [
                  { texto: 'Un sistema automático los revisa primero.', hecho: paso1 },
                  { texto: 'Si hay dudas o algún problema, los revisa una persona de nuestro equipo.', hecho: paso2 },
                  { texto: 'Cuando estén aprobados, empiezas a aparecer en los matches.', hecho: verificado },
                ]
          }
        />
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16 }}>
        <Boton titulo="Ir al inicio" variante="oscuro" onPress={() => router.dismissTo('/conductor/inicio')} />
      </View>
    </Pantalla>
  );
}


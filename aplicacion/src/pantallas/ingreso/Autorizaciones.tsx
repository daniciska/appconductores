// A4 · Autorizaciones ("Antes de empezar")
// Ruta: /conductor/autorizaciones
// Maqueta: docs/maqueta/CondConsentimientos.dc.html
// Las casillas parten sin marcar (el consentimiento debe ser expreso). Con la validación de
// obligatorios apagada (por defecto en la demo) se puede continuar igual.
import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { useDemo } from '@/datos/tienda';
import { Boton, Casilla, Encabezado, HojaInferior, Pantalla, Presionable, Texto, color, fuente, radio, tipo } from '@/ui';

import { RUTA_PASO, irAInicioConductor } from './acciones';
import { AlertaObligatorios, CabeceraFormulario, useValidarObligatorios } from './comunes';

type Clave = 'terminos' | 'compartir' | 'revision' | 'mensajes';
const CLAVES: Clave[] = ['terminos', 'compartir', 'revision', 'mensajes'];

function FilaAutorizacion({
  marcada,
  error,
  onPress,
  etiqueta,
  children,
}: {
  marcada: boolean;
  error: boolean;
  onPress: () => void;
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <Presionable
      role="checkbox"
      aria-checked={marcada}
      aria-invalid={error}
      aria-label={etiqueta}
      onPress={onPress}
      efecto="ninguno"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: color.superficie,
        borderWidth: marcada || error ? 1.5 : 1,
        borderColor: error ? color.error : marcada ? color.bordeFuerte : color.bordeCampo,
        borderRadius: radio.campo,
        paddingVertical: 14,
        paddingHorizontal: 16,
        opacity: pressed ? 0.85 : 1,
      })}>
      <View style={{ marginTop: 1 }}>
        <Casilla marcada={marcada} />
      </View>
      <Text style={[tipo.cuerpo, fuente(500), { flex: 1, lineHeight: 22, color: color.texto }]}>{children}</Text>
    </Presionable>
  );
}

/** Enlace en negrita subrayado dentro del texto de una autorización (no marca la casilla). */
function EnlaceTexto({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  return (
    <Text
      role="link"
      onPress={(e) => {
        e?.stopPropagation?.();
        e?.preventDefault?.();
        onPress();
      }}
      style={[fuente(700), { color: color.texto, textDecorationLine: 'underline' }]}>
      {titulo}
    </Text>
  );
}

export default function Autorizaciones() {
  const guardadas = useDemo((s) => s.cuenta.autorizaciones);
  const registrado = useDemo((s) => s.conductor.registrado);
  const aceptarAutorizaciones = useDemo((s) => s.aceptarAutorizaciones);
  const validar = useValidarObligatorios();

  const yaAceptadas = guardadas.terminos && guardadas.privacidad && guardadas.compartirFicha;
  const [marcas, setMarcas] = useState<Record<Clave, boolean>>(() => ({
    terminos: yaAceptadas,
    compartir: yaAceptadas,
    revision: yaAceptadas,
    mensajes: yaAceptadas,
  }));
  const [intento, setIntento] = useState(false);
  const [documento, setDocumento] = useState<'terminos' | 'privacidad' | null>(null);

  const faltan = CLAVES.filter((c) => !marcas[c]);
  const mostrarErrores = intento && validar && faltan.length > 0;
  const alternar = (c: Clave) => setMarcas((m) => ({ ...m, [c]: !m[c] }));

  const continuar = () => {
    if (validar && faltan.length > 0) {
      setIntento(true);
      return;
    }
    aceptarAutorizaciones({ terminos: marcas.terminos, privacidad: marcas.terminos, compartirFicha: marcas.compartir });
    if (registrado) irAInicioConductor();
    else router.push(RUTA_PASO[1]);
  };

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/codigo" />
      <CabeceraFormulario titulo="Antes de empezar" subtitulo="Necesitamos tu autorización para cada uno de estos puntos." />

      <View role="group" aria-label="Autorizaciones" style={{ marginTop: 8, gap: 10 }}>
        <FilaAutorizacion
          marcada={marcas.terminos}
          error={mostrarErrores && !marcas.terminos}
          onPress={() => alternar('terminos')}
          etiqueta="Acepto los Términos y la Política de privacidad, y declaro ser mayor de 18 años.">
          Acepto los <EnlaceTexto titulo="Términos" onPress={() => setDocumento('terminos')} /> y la{' '}
          <EnlaceTexto titulo="Política de privacidad" onPress={() => setDocumento('privacidad')} />, y declaro ser mayor de 18 años.
        </FilaAutorizacion>
        <FilaAutorizacion
          marcada={marcas.compartir}
          error={mostrarErrores && !marcas.compartir}
          onPress={() => alternar('compartir')}
          etiqueta="Autorizo que, cuando haga match, se compartan mi ficha y mi contacto (teléfono y email) con ese titular.">
          Autorizo que, cuando haga match, se compartan mi ficha y mi contacto (teléfono y email) con ese titular.
        </FilaAutorizacion>
        <FilaAutorizacion
          marcada={marcas.revision}
          error={mostrarErrores && !marcas.revision}
          onPress={() => alternar('revision')}
          etiqueta="Revisión de mis documentos: un sistema automático los revisa primero; las dudas y los rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.">
          <Text style={fuente(700)}>Revisión de mis documentos:</Text> un sistema automático los revisa primero; las dudas y los
          rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.
        </FilaAutorizacion>
        <FilaAutorizacion
          marcada={marcas.mensajes}
          error={mostrarErrores && !marcas.mensajes}
          onPress={() => alternar('mensajes')}
          etiqueta="Mensajes: me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y bloquear.">
          <Text style={fuente(700)}>Mensajes:</Text> me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y
          bloquear.
        </FilaAutorizacion>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {mostrarErrores ? <AlertaObligatorios texto="Marca las 4 autorizaciones para continuar." /> : null}
        <Boton titulo="Continuar" onPress={continuar} />
      </View>

      <HojaInferior
        visible={documento !== null}
        onCerrar={() => setDocumento(null)}
        titulo={documento === 'privacidad' ? 'Política de privacidad' : 'Términos y condiciones'}
        pie={<Boton titulo="Entendido" onPress={() => setDocumento(null)} />}>
        <Texto variante="parrafo" tono="secundario">
          {documento === 'privacidad'
            ? 'En la app real aquí va la Política de privacidad completa: qué datos se piden, para qué se usan, quién los ve y cómo pedir que se borren.'
            : 'En la app real aquí van los Términos y condiciones completos.'}
        </Texto>
        <Texto variante="ayuda">Los textos legales están en preparación con un abogado. En la demo no hay texto legal.</Texto>
      </HojaInferior>
    </Pantalla>
  );
}

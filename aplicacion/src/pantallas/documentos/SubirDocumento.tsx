// C1 · Subir documento (cédula, licencia, Hoja de Vida o certificado de antecedentes)
// Ruta: /conductor/documentos/subir/[tipo]
// Maqueta: docs/maqueta/CondSubirDoc.dc.html
// En la demo no se sube nada: se elige un archivo real (solo se guarda su nombre) o uno de ejemplo.
// - Durante el registro (Paso 5): queda "Subido" y vuelve al Paso 5.
// - Si ya había enviado sus documentos (subir de nuevo o renovar): se envía a revisión y abre C2.
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { fechaLarga } from '@/datos/formato';
import { TIPOS_DOC_ORDEN } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import { Boton, Encabezado, EstadoVacio, Pantalla, Presionable, color, fuente, mostrarToast, tipo as tipografia, volver } from '@/ui';
import { Clock, ExternalLink, FileImage, FileText, Lock, Upload } from '@/ui/iconos';

import { elegirArchivo, formatoValido, subirYEnviar } from './acciones';
import { AvisoAmarillo, Caja, CuadroIcono, Nota, Pastilla, PasosNumerados, TituloPantalla } from './piezas';
import { GUIAS, SUBIDO, esTipoDocumento, fem } from './textos';

export default function SubirDocumento() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const valido = esTipoDocumento(tipo);
  const tipos = useDemo((s) => s.catalogos.tiposDocumento);
  const documentos = useDemo((s) => s.documentos);
  const enRegistro = useDemo((s) => !s.conductor.pasosListos.documentos);
  const clases = useDemo((s) => s.conductor.clasesDeclaradas);
  const diasPdf = useDemo((s) => s.ajustes.diasAntiguedadPdf);
  const subirDocumento = useDemo((s) => s.subirDocumento);
  const quitarDocumento = useDemo((s) => s.quitarDocumento);
  const [subiendo, setSubiendo] = useState<'archivo' | 'ejemplo' | null>(null);

  const volverA = enRegistro ? '/conductor/registro/5' : '/conductor/perfil/documentos';

  if (!valido) {
    return (
      <Pantalla>
        <Encabezado volverA="/conductor/inicio" />
        <EstadoVacio
          icono={FileText}
          titulo="No encontramos ese documento"
          texto="Vuelve y elige uno de la lista."
          accion={{ titulo: 'Volver', onPress: () => volver('/conductor/inicio') }}
        />
      </Pantalla>
    );
  }

  const info = tipos.find((t) => t.id === tipo);
  const guia = GUIAS[tipo];
  const doc = documentos[tipo];
  const numero = TIPOS_DOC_ORDEN.indexOf(tipo) + 1;
  const IconoArchivo = guia.esPdf ? FileText : FileImage;

  /** Guarda el archivo elegido (solo el nombre) y sigue. */
  const guardar = (nombre: string, origen: 'archivo' | 'ejemplo') => {
    setSubiendo(origen);
    // Pausa breve para que se note el "subiendo" (en la demo no viaja nada).
    setTimeout(() => {
      if (enRegistro) {
        subirDocumento(tipo, nombre);
        mostrarToast(SUBIDO[tipo], 'exito');
        volver(volverA);
      } else {
        subirYEnviar(tipo, nombre);
        router.replace({ pathname: '/conductor/documentos/enviado', params: { tipo } });
      }
    }, 650);
  };

  const elegir = async () => {
    const nombre = await elegirArchivo(guia.acepta);
    if (!nombre) {
      // Fuera de la web (o si se cerró el selector sin elegir) no hay archivo.
      return;
    }
    if (!formatoValido(nombre, guia.esPdf)) {
      mostrarToast(guia.esPdf ? 'Elige un archivo PDF.' : 'Elige una foto (JPG o PNG).', 'error');
      return;
    }
    guardar(nombre, 'archivo');
  };

  const conArchivo = doc.estado === 'subido' || doc.estado === 'en_revision';

  return (
    <Pantalla>
      <Encabezado volverA={volverA} derecha={<Pastilla texto={`Documento ${numero} de 4`} />} />
      <TituloPantalla titulo={info?.nombre ?? ''} subtitulo={guia.descripcion} />

      {conArchivo && doc.nombreArchivo ? (
        <Caja padding={14} gap={0} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 }}>
          <CuadroIcono icono={IconoArchivo} fondo={doc.estado === 'en_revision' ? color.amarilloFondo : color.exitoFondo} colorIcono={doc.estado === 'en_revision' ? color.amarilloTexto : color.exito} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text numberOfLines={1} style={[tipografia.cuerpo, fuente(600), { color: color.texto }]}>
              {doc.nombreArchivo}
            </Text>
            <Text style={[tipografia.ayuda, { color: color.textoSecundario }]}>
              {doc.estado === 'en_revision'
                ? `En revisión desde el ${fechaLarga(doc.enviadoEl)}`
                : `${fem(tipo, 'Subida', 'Subido')} el ${fechaLarga(doc.subidoEl)} · sin enviar`}
            </Text>
          </View>
          {doc.estado === 'subido' ? (
            <Presionable
              role="button"
              aria-label="Quitar archivo"
              onPress={() => {
                quitarDocumento(tipo);
                mostrarToast('Quitaste el archivo.');
              }}
              style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 }}>
              <Text style={[fuente(700), { fontSize: 14, color: color.texto, textDecorationLine: 'underline' }]}>Quitar</Text>
            </Presionable>
          ) : null}
        </Caja>
      ) : null}

      <PasosNumerados titulo={guia.tituloPasos} pasos={guia.pasos.map((texto) => ({ texto }))} />

      <View style={{ gap: 12 }}>
        <AvisoAmarillo icono={Clock} texto={guia.aviso(diasPdf, clases)} />
        <Nota icono={Lock}>{guia.privacidad}</Nota>
      </View>

      <View style={{ marginTop: 'auto', gap: 10, paddingTop: 8 }}>
        <Boton
          titulo={conArchivo ? (guia.esPdf ? 'Elegir otro PDF' : 'Elegir otra foto') : guia.boton}
          icono={Upload}
          variante="oscuro"
          cargando={subiendo === 'archivo'}
          deshabilitado={subiendo === 'ejemplo'}
          onPress={elegir}
        />
        {guia.enlace ? (
          <Boton
            titulo={guia.enlace.titulo}
            iconoDerecha={ExternalLink}
            variante="contorno"
            onPress={() => {
              Linking.openURL(guia.enlace!.url).catch(() => mostrarToast('No pudimos abrir el enlace.', 'error'));
            }}
          />
        ) : null}
        <Boton
          titulo={guia.esPdf ? 'Usar PDF de ejemplo' : 'Usar foto de ejemplo'}
          variante={guia.enlace ? 'texto' : 'contorno'}
          cargando={subiendo === 'ejemplo'}
          deshabilitado={subiendo === 'archivo'}
          onPress={() => guardar(guia.ejemplo, 'ejemplo')}
        />
      </View>
    </Pantalla>
  );
}

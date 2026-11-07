// C4 · Documento no aprobado
// Ruta: /conductor/documentos/[tipo]/no-aprobado
// Maqueta: docs/maqueta/CondDocRechazado.dc.html
// Si mientras se ve el documento cambia de estado (pidió otra revisión o el equipo lo aprobó), la pantalla lo muestra.
// En la demo se llega con el atajo "Documento no aprobado" del menú; la otra revisión la hace el equipo simulado.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { fechaLarga } from '@/datos/formato';
import { useDemo } from '@/datos/tienda';
import { Boton, Encabezado, EstadoVacio, Insignia, Pantalla, color, fuente, mostrarToast, tipo as tipografia } from '@/ui';
import { Bell, Camera, FileText, Info, RefreshCw, Upload, X } from '@/ui/iconos';

import { BotonContornoLargo, Caja, CuadroIcono, Nota, TituloPantalla } from './piezas';
import { GUIAS, esTipoDocumento, fem, motivoSimple, queHacerMotivo, rutaSubir } from './textos';

export default function NoAprobado() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const valido = esTipoDocumento(tipo);
  const tipos = useDemo((s) => s.catalogos.tiposDocumento);
  const motivos = useDemo((s) => s.catalogos.motivosRechazo);
  const documentos = useDemo((s) => s.documentos);
  const diasPdf = useDemo((s) => s.ajustes.diasAntiguedadPdf);
  const pedirOtraRevision = useDemo((s) => s.pedirOtraRevision);
  const [pidiendo, setPidiendo] = useState(false);

  if (!valido) {
    return (
      <Pantalla>
        <Encabezado volverA="/conductor/inicio" />
        <EstadoVacio
          icono={FileText}
          titulo="No encontramos ese documento"
          accion={{ titulo: 'Ir al inicio', onPress: () => router.dismissTo('/conductor/inicio') }}
        />
      </Pantalla>
    );
  }

  const doc = documentos[tipo];
  const nombre = tipos.find((t) => t.id === tipo)?.nombre ?? '';
  const motivo = motivos.find((m) => m.id === doc.motivo);
  const esFoto = !GUIAS[tipo].esPdf;

  // ---------------------------------------------------------------- Ya no está rechazado
  if (doc.estado !== 'rechazado') {
    const enRevision = doc.estado === 'en_revision';
    const aprobado = doc.estado === 'aprobado';
    return (
      <Pantalla>
        <Encabezado volverA="/conductor/inicio" />
        <TituloPantalla
          arriba={
            <Insignia
              texto={aprobado ? fem(tipo, 'Aprobada', 'Aprobado') : enRevision ? 'En revisión' : 'Sin revisar'}
              tono={aprobado ? 'verde' : enRevision ? 'amarilla' : 'gris'}
              icono={aprobado ? 'check' : enRevision ? RefreshCw : null}
              tamano="grande"
              style={{ marginBottom: 4 }}
            />
          }
          titulo={nombre}
          subtitulo={
            aprobado
              ? `Revisamos tu documento el ${fechaLarga(doc.revisadoEn)} y está todo bien.`
              : enRevision && doc.otraRevisionEl
                ? `Pediste otra revisión el ${fechaLarga(doc.otraRevisionEl)}. Una persona de nuestro equipo lo revisará de nuevo.`
                : enRevision
                  ? 'Lo estamos revisando.'
                  : 'Este documento todavía no se ha enviado a revisión.'
          }
        />
        {enRevision ? (
          <Nota icono={Bell} tono="suave">
            Te avisaremos por WhatsApp o correo cuando terminemos.
          </Nota>
        ) : null}
        <View style={{ marginTop: 'auto', gap: 10 }}>
          {doc.estado === 'falta' || doc.estado === 'subido' ? (
            <Boton titulo="Subir documento" icono={Upload} onPress={() => router.replace(rutaSubir(tipo))} />
          ) : null}
          <Boton titulo="Ir al inicio" variante={doc.estado === 'falta' || doc.estado === 'subido' ? 'contorno' : 'oscuro'} onPress={() => router.dismissTo('/conductor/inicio')} />
        </View>
      </Pantalla>
    );
  }

  // ---------------------------------------------------------------- No aprobado
  const pedir = () => {
    setPidiendo(true);
    setTimeout(() => {
      pedirOtraRevision(tipo);
      setPidiendo(false);
      mostrarToast('Pediste otra revisión. La hará una persona del equipo.', 'exito');
    }, 500);
  };

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/inicio" />
      <TituloPantalla
        arriba={<Insignia texto={fem(tipo, 'No aprobada', 'No aprobado')} tono="roja" icono={X} tamano="grande" style={{ marginBottom: 4 }} />}
        titulo={nombre}
        subtitulo={`Revisamos tu documento el ${fechaLarga(doc.revisadoEn)} y no pudimos aprobarlo.`}
      />

      <Caja gap={8}>
        <Text style={[fuente(700), { fontSize: 13, lineHeight: 17, color: color.textoSecundario }]}>Motivo</Text>
        <Text style={[fuente(600), { fontSize: 16, lineHeight: 23, color: color.texto }]}>
          {doc.motivo ? motivoSimple(doc.motivo, tipo, diasPdf) : 'No pudimos revisar el documento.'}
        </Text>
      </Caja>

      <Caja gap={12}>
        <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 17, lineHeight: 22, color: color.texto }]}>
          Qué puedes hacer
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <CuadroIcono icono={esFoto ? Camera : FileText} />
          <Text style={[tipografia.cuerpo, { flex: 1, lineHeight: 22, color: color.textoSuave }]}>
            {queHacerMotivo(motivo, tipo, diasPdf) ?? 'Sube el documento de nuevo.'}
          </Text>
        </View>
      </Caja>

      <View style={{ marginTop: 'auto', gap: 10, paddingTop: 8 }}>
        <Boton titulo="Subir de nuevo" icono={Upload} onPress={() => router.push(rutaSubir(tipo))} deshabilitado={pidiendo} />
        <BotonContornoLargo titulo="No estoy de acuerdo: pedir otra revisión" onPress={pedir} cargando={pidiendo} />
        <Nota icono={Info} centrada style={{ paddingTop: 4, paddingHorizontal: 8 }}>
          Todo rechazo lo decide una persona de nuestro equipo.
        </Nota>
      </View>
    </Pantalla>
  );
}


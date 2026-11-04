// B5 · Paso 5: documentos
// Ruta: /conductor/registro/5
// Maqueta: docs/maqueta/CondPaso5.dc.html
// Cada documento abre /conductor/documentos/subir/[tipo] (grupo documentos). "Enviar a revisión" se
// activa con los 4 documentos con archivo; empieza la pre-revisión simulada y abre C2.
import { Linking, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useResumenDocumentos } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import type { DocumentoUsuario, TipoDocumentoId } from '@/datos/tipos';
import { Aviso, Boton, Encabezado, Insignia, Pantalla, Presionable, color, fuente, radio, tipo, type LucideIcon } from '@/ui';
import { ArrowUpRight, Camera, ChevronRight, Hourglass } from '@/ui/iconos';
import { Hoja } from '@/ui/iconosPropios';

import { enviarYMostrarEnviado, irAInicioConductor, volverDesdePaso } from './acciones';
import { CabeceraFormulario, ayudaDocumento, equilibrado } from './comunes';

const REGISTRO_CIVIL = 'https://www.registrocivil.cl';

function InsigniaEstado({ doc }: { doc: DocumentoUsuario }) {
  const femenino = doc.tipo === 'cedula' || doc.tipo === 'licencia' || doc.tipo === 'hoja_vida';
  const a = femenino ? 'a' : 'o';
  switch (doc.estado) {
    case 'subido':
      return <Insignia texto={`Subid${a}`} />;
    case 'en_revision':
      return <Insignia texto="En revisión" tono="amarilla" icono={Hourglass} />;
    case 'aprobado':
      return <Insignia texto={`Aprobad${a}`} />;
    case 'rechazado':
      return <Insignia texto={`No aprobad${a} · Ver motivo`} tono="roja" icono={null} />;
    default:
      return <Insignia texto="Falta" tono="gris" icono={null} />;
  }
}

function TarjetaDocumento({
  nombre,
  ayuda,
  icono: Icono,
  doc,
  onPress,
}: {
  nombre: string;
  ayuda: string;
  icono: LucideIcon;
  doc: DocumentoUsuario;
  onPress: () => void;
}) {
  return (
    <Presionable
      role="button"
      aria-label={`${nombre}. ${ayuda}`}
      onPress={onPress}
      style={{
        backgroundColor: color.superficie,
        borderWidth: 1,
        borderColor: color.borde,
        borderRadius: radio.tarjeta,
        paddingVertical: 14,
        paddingLeft: 16,
        paddingRight: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <View style={{ width: 40, height: 40, borderRadius: radio.boton44, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
        <Icono size={20} color={color.texto} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{nombre}</Text>
        <Text style={[tipo.ayuda, { lineHeight: 17.5, color: color.textoSecundario }, equilibrado]}>{ayuda}</Text>
        <View style={{ marginTop: 6 }}>
          <InsigniaEstado doc={doc} />
        </View>
      </View>
      <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} />
    </Presionable>
  );
}

export default function Paso5() {
  const documentos = useDemo((s) => s.documentos);
  const tipos = useDemo((s) => s.catalogos.tiposDocumento);
  const diasPdf = useDemo((s) => s.ajustes.diasAntiguedadPdf);
  const resumen = useResumenDocumentos();

  const ordenados = [...tipos].sort((a, b) => a.orden - b.orden);
  const porEnviar = resumen.subidos > 0;
  const puedeEnviar = resumen.todosConArchivo && porEnviar;
  const todoEnviado = resumen.todosConArchivo && !porEnviar;

  const abrir = (tipoDoc: TipoDocumentoId, doc: DocumentoUsuario) => {
    if (doc.estado === 'rechazado') {
      router.push({ pathname: '/conductor/documentos/[tipo]/no-aprobado', params: { tipo: tipoDoc } });
    } else {
      router.push({ pathname: '/conductor/documentos/subir/[tipo]', params: { tipo: tipoDoc } });
    }
  };

  return (
    <Pantalla>
      <Encabezado paso={5} volverA={volverDesdePaso(5)} />
      <CabeceraFormulario
        titulo="Tus documentos"
        subtitulo="Los titulares solo ven conductores con sus 4 documentos aprobados. Nunca ven tus archivos, solo una insignia."
      />

      <View style={{ marginTop: 8, gap: 10 }}>
        {ordenados.map((t) => (
          <TarjetaDocumento
            key={t.id}
            nombre={t.nombre}
            ayuda={t.formato === 'pdf' ? ayudaDocumento(t.ayuda, diasPdf) : t.ayuda}
            icono={t.formato === 'pdf' ? Hoja : Camera}
            doc={documentos[t.id]}
            onPress={() => abrir(t.id, documentos[t.id])}
          />
        ))}
      </View>

      <View
        style={{
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.tarjeta,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={[tipo.etiqueta, { lineHeight: 19, color: color.texto }]}>¿Te falta la Hoja de Vida o el certificado de antecedentes?</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Pídelos en línea con tu ClaveÚnica.</Text>
        </View>
        <Presionable
          role="link"
          aria-label="Registro Civil (se abre en el navegador)"
          onPress={() => Linking.openURL(REGISTRO_CIVIL).catch(() => undefined)}
          style={{
            minHeight: 44,
            paddingHorizontal: 14,
            borderRadius: radio.boton44,
            backgroundColor: color.fondo,
            borderWidth: 1,
            borderColor: color.bordeCampo,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}>
          <Text style={[tipo.botonChico, { color: color.texto }]}>Registro Civil</Text>
          <ArrowUpRight size={16} color={color.texto} strokeWidth={2} />
        </Presionable>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 8 }}>
        {todoEnviado ? (
          <>
            <Aviso
              tono={resumen.rechazados > 0 ? 'error' : resumen.aprobados === resumen.total ? 'exito' : 'neutro'}
              icono={resumen.rechazados > 0 ? 'alerta' : 'info'}
              texto={
                resumen.rechazados > 0
                  ? 'Un documento no fue aprobado. Tócalo para ver el motivo.'
                  : resumen.aprobados === resumen.total
                    ? 'Tus 4 documentos están aprobados.'
                    : 'Tus documentos ya están en revisión. Te avisaremos por WhatsApp.'
              }
            />
            <Boton titulo="Ir al inicio" onPress={irAInicioConductor} />
          </>
        ) : (
          <>
            <Boton titulo="Enviar a revisión" onPress={enviarYMostrarEnviado} deshabilitado={!puedeEnviar} />
            {!puedeEnviar ? (
              <Text style={[tipo.ayuda, { textAlign: 'center', color: color.textoSecundario }]}>Sube los 4 documentos para enviarlos.</Text>
            ) : null}
            <Presionable
              role="button"
              onPress={irAInicioConductor}
              style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[tipo.cuerpo, fuente(600), { color: color.texto, textDecorationLine: 'underline' }]}>Terminar después</Text>
            </Presionable>
          </>
        )}
      </View>
    </Pantalla>
  );
}

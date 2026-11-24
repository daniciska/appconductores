// B5 · Paso 5: tus documentos (app real). Maqueta: docs/maqueta/CondPaso5.dc.html (pantalla aprobada del
// mockup, aplicacion/src/pantallas/ingreso/Paso5.tsx). Cambia lo que en la demo era simulado:
//   - No hay "Enviar a revisión": cada documento se envía al subirlo y la base lo revisa en el fondo
//     (método de validación). Cada tarjeta muestra el estado real: Falta, Aprobada, En revisión,
//     No aprobada, Vence pronto o Vencida.
//   - Con los 4 aprobados, "Ir al inicio". Si no, "Terminar después".
import { Linking, Text, View } from 'react-native';

import { CabeceraFormulario, equilibrado } from '@/pantallas/ingreso/comunes';
import { irAInicioConductor } from '@/pantallas/ingreso/acciones';
import { Aviso, Boton, Encabezado, Insignia, Pantalla, Presionable, color, fuente, radio, tipo } from '@/ui';
import { ArrowUpRight, Camera, ChevronRight } from '@/ui/iconos';
import { Hoja } from '@/ui/iconosPropios';

import { lineaFecha, type VistaTipo } from '@real/datos/documentos';

import { AvisosVencimiento, insigniaDocumento, rutaSubir, useDocumentos } from './comunes';

const REGISTRO_CIVIL = 'https://www.registrocivil.cl';

function TarjetaDocumento({ v }: { v: VistaTipo }) {
  const Icono = v.tipo.formato === 'pdf' ? Hoja : Camera;
  const linea = v.estado === 'falta' ? v.tipo.ayuda : lineaFecha(v);
  return (
    <Presionable
      role="button"
      aria-label={`${v.tipo.nombre}. ${insigniaDocumento(v).texto}. ${linea}`}
      href={rutaSubir(v.tipo.clave)}
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
        <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{v.tipo.nombre}</Text>
        <Text style={[tipo.ayuda, { lineHeight: 17.5, color: color.textoSecundario }, equilibrado]}>{linea}</Text>
        <View style={{ marginTop: 6 }}>
          <Insignia {...insigniaDocumento(v)} />
        </View>
      </View>
      <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} />
    </Presionable>
  );
}

export default function Paso5() {
  const r = useDocumentos();
  const pdf = r.tipos.some((v) => v.tipo.formato === 'pdf');
  const enRevision = r.tipos.some((v) => v.estado === 'en_revision');
  const revisar = r.tipos.some((v) => v.estado === 'no_aprobado' || v.estado === 'vencido');

  return (
    <Pantalla>
      <Encabezado paso={5} volverA="/conductor/registro/4" />
      <CabeceraFormulario
        titulo="Tus documentos"
        subtitulo={`Los titulares solo ven conductores con sus ${r.total} documentos aprobados. Nunca ven tus archivos, solo una insignia.`}
      />

      <AvisosVencimiento avisos={r.avisos} />

      <View style={{ marginTop: 8, gap: 10 }}>
        {r.tipos.map((v) => (
          <TarjetaDocumento key={v.tipo.id} v={v} />
        ))}
      </View>

      {pdf ? (
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
      ) : null}

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 8 }}>
        {r.completos ? (
          <>
            <Aviso tono="exito" icono="info" texto={`Tus ${r.total} documentos están aprobados.`} />
            <Boton titulo="Ir al inicio" onPress={irAInicioConductor} />
          </>
        ) : (
          <>
            {revisar ? <Aviso tono="error" icono="alerta" texto="Revisa el documento marcado en rojo y súbelo de nuevo." /> : null}
            {!revisar && enRevision ? <Aviso tono="neutro" icono="info" texto="Estamos revisando tus documentos." /> : null}
            {!revisar && !enRevision ? (
              <Text style={[tipo.ayuda, { textAlign: 'center', color: color.textoSecundario }]}>Sube los {r.total} documentos para completar tu perfil.</Text>
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

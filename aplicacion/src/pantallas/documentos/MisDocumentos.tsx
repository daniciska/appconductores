// E2 · Mis documentos
// Ruta: /conductor/perfil/documentos
// Maqueta: docs/maqueta/CondMisDocumentos.dc.html
import { Text, View } from 'react-native';
import type { Href } from 'expo-router';

import { fechaLarga } from '@/datos/formato';
import { TIPOS_DOC_ORDEN, documentoVencePronto } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { DocumentoUsuario } from '@/datos/tipos';
import { Boton, Encabezado, Insignia, Pantalla, color, fuente, type LucideIcon, type PropsInsignia } from '@/ui';
import { Clock, Lock, RefreshCw, Upload, X } from '@/ui/iconos';
import { Hoja } from '@/ui/iconosPropios';

import { CuadroIcono, Nota, TituloPantalla } from './piezas';
import { estadoDocumento, fem, motivoSimple, rutaNoAprobado, rutaSubir } from './textos';

/** Días de anticipación con que se avisa que un documento vence (igual que documentoVencePronto). */
const DIAS_AVISO = 30;

const mesAnio = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

function mesesEntre(desde: string | null, hasta: string | null): number {
  if (!desde || !hasta) return 12;
  return Math.max(1, Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
}

interface VistaDoc {
  insignia: PropsInsignia;
  linea: string;
  fondo: string;
  tinta: string;
  accion?: { titulo: string; icono?: LucideIcon; href: Href };
}

function vistaDocumento(doc: DocumentoUsuario, clasesRevisadas: string[], ayuda: string, diasPdf: number): VistaDoc {
  const t = doc.tipo;
  const gris = { fondo: color.fondo, tinta: color.texto };
  if (doc.estado === 'aprobado') {
    const pronto = documentoVencePronto(doc, DIAS_AVISO);
    const vence = fechaLarga(doc.venceEn);
    if (pronto) {
      return {
        insignia: { texto: 'Vence pronto', tono: 'amarilla', icono: Clock },
        linea: `${fem(t, 'Renuévala', 'Renuévalo')} antes del ${vence}`,
        fondo: color.amarilloFondo,
        tinta: color.amarilloTexto,
        accion: { titulo: 'Subir nueva', icono: Upload, href: rutaSubir(t) },
      };
    }
    const aprobada = fem(t, 'Aprobada', 'Aprobado');
    const linea =
      t === 'cedula'
        ? `Vence el ${vence}`
        : t === 'licencia'
          ? `Próximo control ${mesAnio(doc.venceEn)}`
          : `Se renueva cada ${mesesEntre(doc.revisadoEn, doc.venceEn)} meses · próxima vez ${vence}`;
    return {
      insignia: { texto: t === 'licencia' && clasesRevisadas.length > 0 ? `${aprobada} · ${clasesRevisadas.join(', ')}` : aprobada, tono: 'verde' },
      linea,
      ...gris,
    };
  }
  const est = estadoDocumento(doc);
  if (doc.estado === 'en_revision') {
    return {
      insignia: { texto: est.texto, tono: 'amarilla', icono: doc.otraRevisionEl ? RefreshCw : Clock },
      linea:
        doc.etapa === 'ia'
          ? `${fem(t, 'Enviada', 'Enviado')} el ${fechaLarga(doc.enviadoEl)}`
          : `${fem(t, 'Enviada', 'Enviado')} el ${fechaLarga(doc.enviadoEl)} · la revisa una persona del equipo`,
      ...gris,
    };
  }
  if (doc.estado === 'rechazado') {
    return {
      insignia: { texto: est.texto, tono: 'roja', icono: X },
      linea: doc.motivo ? motivoSimple(doc.motivo, t, diasPdf) : 'No pudimos aprobarlo.',
      fondo: color.errorFondo,
      tinta: color.error,
      accion: { titulo: 'Ver motivo', href: rutaNoAprobado(t) },
    };
  }
  if (doc.estado === 'subido') {
    return {
      insignia: { texto: est.texto, tono: 'gris', icono: null },
      linea: doc.nombreArchivo ?? '',
      ...gris,
      accion: { titulo: 'Cambiar archivo', icono: Upload, href: rutaSubir(t) },
    };
  }
  return {
    insignia: { texto: 'Falta', tono: 'gris', icono: null },
    linea: ayuda,
    ...gris,
    accion: { titulo: 'Subir', icono: Upload, href: rutaSubir(t) },
  };
}

export default function MisDocumentos() {
  const documentos = useDemo((s) => s.documentos);
  const tipos = useDemo((s) => s.catalogos.tiposDocumento);
  const clasesRevisadas = useDemo((s) => s.conductor.clasesRevisadas);
  const diasPdf = useDemo((s) => s.ajustes.diasAntiguedadPdf);

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/perfil" />
      <TituloPantalla titulo="Mis documentos" subtitulo={`Te avisaremos ${DIAS_AVISO} días antes de que un documento venza.`} />

      <View style={{ gap: 10 }}>
        {TIPOS_DOC_ORDEN.map((t) => {
          const info = tipos.find((x) => x.id === t);
          const v = vistaDocumento(documentos[t], clasesRevisadas, info?.ayuda ?? '', diasPdf);
          return (
            <View
              key={t}
              style={{
                backgroundColor: color.superficie,
                borderWidth: 1,
                borderColor: color.borde,
                borderRadius: 20,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
              }}>
              <CuadroIcono icono={Hoja} fondo={v.fondo} colorIcono={v.tinta} />
              <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 6 }}>
                <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 16, lineHeight: 22, color: color.texto }]}>
                  {info?.nombre}
                </Text>
                <Insignia {...v.insignia} />
                <Text style={[fuente(400), { fontSize: 13, lineHeight: 18, color: color.textoSecundario }]}>{v.linea}</Text>
                {v.accion ? (
                  <Boton
                    titulo={v.accion.titulo}
                    icono={v.accion.icono}
                    href={v.accion.href}
                    variante="contorno"
                    tamano="mediano"
                    style={{ marginTop: 6 }}
                  />
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <Nota icono={Lock}>Los titulares solo ven la insignia, nunca tus archivos.</Nota>
    </Pantalla>
  );
}


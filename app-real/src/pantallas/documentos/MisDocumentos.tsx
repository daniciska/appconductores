// E2 · Mis documentos (app real). Ruta: /conductor/perfil/documentos. Maqueta: docs/maqueta/CondMisDocumentos.dc.html
// (pantalla aprobada del mockup, aplicacion/src/pantallas/documentos/MisDocumentos.tsx), con los datos de la
// base: estado de cada documento, su fecha y, desde N meses antes de que venza (ajuste), el aviso.
import { View } from 'react-native';
import { Text } from '@/ui/escala';

import { CuadroIcono, Nota, TituloPantalla } from '@/pantallas/documentos/piezas';
import { Boton, Encabezado, Insignia, Pantalla, color, fuente } from '@/ui';
import { Lock, RefreshCw, Upload } from '@/ui/iconos';
import { Hoja } from '@/ui/iconosPropios';

import { fem, lineaFecha, type VistaTipo } from '@real/datos/documentos';

import { AvisosVencimiento, insigniaDocumento, rutaSubir, useDocumentos } from './comunes';

function accion(v: VistaTipo): { titulo: string; icono: typeof Upload } | null {
  switch (v.estado) {
    case 'falta':
      return { titulo: 'Subir', icono: Upload };
    case 'vence_pronto':
    case 'vencido':
      return { titulo: fem(v.tipo, 'Subir nueva', 'Subir nuevo'), icono: Upload };
    case 'no_aprobado':
      return { titulo: 'Subir de nuevo', icono: Upload };
    case 'aprobado':
      return { titulo: 'Reemplazar', icono: RefreshCw };
    default:
      return null;
  }
}

export default function MisDocumentos() {
  const r = useDocumentos();
  return (
    <Pantalla>
      <Encabezado volverA="/conductor/perfil" />
      <TituloPantalla
        titulo="Mis documentos"
        subtitulo={`Te avisaremos aquí ${r.meses === 1 ? '1 mes' : `${r.meses} meses`} antes de que un documento venza.`}
      />

      <AvisosVencimiento avisos={r.avisos} />

      <View style={{ gap: 10 }}>
        {r.tipos.map((v) => {
          const a = accion(v);
          const ins = insigniaDocumento(v);
          const tinta = ins.tono === 'roja' ? color.error : ins.tono === 'amarilla' ? color.amarilloTexto : color.texto;
          const fondo = ins.tono === 'roja' ? color.errorFondo : ins.tono === 'amarilla' ? color.amarilloFondo : color.fondo;
          return (
            <View
              key={v.tipo.id}
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
              <CuadroIcono icono={Hoja} fondo={fondo} colorIcono={tinta} />
              <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 6 }}>
                <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 16, lineHeight: 22, color: color.texto }]}>
                  {v.tipo.nombre}
                </Text>
                <Insignia {...ins} />
                <Text style={[fuente(400), { fontSize: 13, lineHeight: 18, color: color.textoSecundario }]}>{lineaFecha(v)}</Text>
                {a ? (
                  <Boton
                    titulo={a.titulo}
                    icono={a.icono}
                    href={rutaSubir(v.tipo.clave)}
                    variante="contorno"
                    tamano="mediano"
                    etiquetaAccesible={`${a.titulo}: ${v.tipo.nombre}`}
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

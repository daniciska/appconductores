// C1 · Subir documento (app real): cédula, licencia, Hoja de Vida o certificado de antecedentes.
// Ruta: /conductor/documentos/subir/[tipo] (tipo = clave del documento). Maqueta: docs/maqueta/CondSubirDoc.dc.html
// (pantalla aprobada del mockup, aplicacion/src/pantallas/documentos/SubirDocumento.tsx). Lo nuevo:
//   - Se elige el archivo de verdad (foto o PDF) y se ve antes de subirlo.
//   - La fecha del documento (vencimiento o emisión) se anota en un campo con teclado numérico
//     (dd/mm/aaaa, como la fecha de nacimiento). Sirve para avisar antes de que venza.
//   - "Subir": si falta la autorización "Revisión de mis documentos", se pide primero (una hoja).
//   - El estado lo decide la base (método de validación): hoy queda aprobado al momento.
// Formulario como los demás: campos con *, y si falta algo, alerta y el campo en rojo.
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Image, Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { mascaraFecha } from '@/datos/formato';
import { useVista } from '@/datos/puerto/contexto';
import { AvisoAmarillo, Caja, CuadroIcono, Nota, Pastilla, PasosNumerados, TituloPantalla } from '@/pantallas/documentos/piezas';
import { AlertaObligatorios, irAlPrimerError } from '@/pantallas/ingreso/comunes';
import { usePantallaAbierta } from '@/pantallas/ingreso/acciones';
import { Boton, Campo, Encabezado, EstadoVacio, Insignia, Pantalla, Presionable, color, fuente, mostrarToast, radio, tipo, volver } from '@/ui';
import { Clock, ExternalLink, FileImage, FileText, Lock, Upload } from '@/ui/iconos';

import { elegirArchivo, prepararFoto, type ArchivoElegido } from '@real/datos/archivoWeb';
import { errorArchivo, errorFechaDocumento, fechaCorta, hoyEnChile, lineaFecha, mimeDeArchivo, pesoLegible, textoTrasSubir, tituloBotonSubir } from '@real/datos/documentos';
import { accionesDocumentos } from '@real/datos/puertoReal';
import { useTiendaReal } from '@real/datos/tiendaReal';

import { HojaRevision, guiaDe, insigniaDocumento, useDocumentos, useRevisionPendiente } from './comunes';

/** Dónde está la fecha en cada documento (ayuda bajo el campo). */
const DONDE_FECHA: Record<string, string> = {
  cedula: 'Está en el frente de tu cédula.',
  licencia: 'Está en tu licencia, junto a tus clases.',
  hoja_vida: 'Está en el PDF, junto al folio.',
  antecedentes: 'Está en el PDF, junto al folio.',
};

export default function SubirDocumento() {
  const { tipo: clave } = useLocalSearchParams<{ tipo: string }>();
  const tipos = useTiendaReal((s) => s.tiposDocumento);
  const t = tipos.find((x) => x.clave === clave) ?? null;
  const r = useDocumentos();
  const clases = useVista((v) => v.conductor.clasesDeclaradas);
  const completo = useVista((v) => v.conductor.pasosListos.documentos);
  const pendiente = useRevisionPendiente();
  const pantalla = usePantallaAbierta();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [elegido, setElegido] = useState<ArchivoElegido | null>(null);
  const [fecha, setFecha] = useState('');
  const [intento, setIntento] = useState(false);
  const [errorDeLaBase, setErrorDeLaBase] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  /** La foto elegida se está achicando (antes de revisar su peso). */
  const [preparando, setPreparando] = useState(false);
  const [pedirRevision, setPedirRevision] = useState(false);

  // La vista previa de la foto se libera al cambiarla o al salir.
  const vistaPrevia = useRef<string | null>(null);
  useEffect(() => () => {
    if (vistaPrevia.current) URL.revokeObjectURL(vistaPrevia.current);
  }, []);

  const volverA = completo ? '/conductor/perfil/documentos' : '/conductor/registro/5';

  if (!t) {
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

  const guia = guiaDe(t);
  const vista = r.tipos.find((v) => v.tipo.id === t.id) ?? null;
  const numero = r.tipos.findIndex((v) => v.tipo.id === t.id) + 1;
  const pideFecha = t.fechaPedida !== 'ninguna';
  const hoy = hoyEnChile();
  const mime = elegido ? mimeDeArchivo(elegido.nombre, elegido.tipo) : null;
  const errores = {
    archivo: !elegido ? (guia.esPdf ? 'Elige el PDF.' : 'Elige la foto.') : errorArchivo(mime, elegido.archivo.size, t.formato),
    fecha: pideFecha ? errorFechaDocumento(fecha, t, hoy) : null,
  };
  // El error del archivo elegido se ve apenas se elige (bajo el campo, sin aviso flotante que tape otros errores).
  const ver = (k: keyof typeof errores) =>
    (intento || (k === 'archivo' && elegido) ? errores[k] : null) ?? (k === 'fecha' ? errorDeLaBase : null);
  const faltaObligatorio = intento && (!elegido || (pideFecha && !fecha.trim()));

  const elegir = async () => {
    const a = await elegirArchivo(guia.acepta);
    if (!a) return;
    if (vistaPrevia.current) URL.revokeObjectURL(vistaPrevia.current);
    vistaPrevia.current = a.vista;
    // Las fotos se achican al elegirlas: el tope de 10 MB se revisa con lo que de verdad se sube
    // (una foto de 12 MB queda en 1 a 2 MB). Los PDF y lo que no se pueda leer quedan tal cual.
    const m = mimeDeArchivo(a.nombre, a.tipo);
    if (m && t.formato === 'foto') {
      setPreparando(true);
      try {
        const listo = await prepararFoto(a.archivo, m);
        if (pantalla.salio()) return;
        setElegido({ ...a, archivo: listo.archivo, tipo: listo.mime });
      } finally {
        setPreparando(false);
      }
      return;
    }
    setElegido(a);
  };

  /** `revisionAceptada`: se acaba de aceptar en la hoja (esta función es de antes de leerla). */
  const subir = async (revisionAceptada = false) => {
    setIntento(true);
    setErrorDeLaBase(null);
    if (errores.archivo || errores.fecha || !elegido || !mime) {
      irAlPrimerError(scrollRef);
      return;
    }
    if (pendiente && !revisionAceptada) {
      setPedirRevision(true);
      return;
    }
    if (preparando) return;
    setSubiendo(true);
    try {
      const res = await accionesDocumentos.subir({ tipoId: t.id, archivo: elegido.archivo, mime, fecha });
      if (pantalla.salio()) return;
      if (!res.ok) {
        if (/fecha|venció|días o menos/i.test(res.error)) setErrorDeLaBase(res.error);
        mostrarToast(res.error, 'error');
        return;
      }
      mostrarToast(textoTrasSubir(t, res.valor.estado), res.valor.estado === 'aprobado' ? 'exito' : 'info');
      volver(volverA);
    } finally {
      setSubiendo(false);
    }
  };

  const IconoArchivo = guia.esPdf ? FileText : FileImage;
  const doc = vista?.documento ?? null;

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado volverA={volverA} derecha={numero > 0 ? <Pastilla texto={`Documento ${numero} de ${r.tipos.length}`} /> : undefined} />
      <TituloPantalla titulo={t.nombre} subtitulo={guia.descripcion} />

      {vista && doc ? (
        <Caja padding={14} gap={0} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 }}>
          <CuadroIcono icono={IconoArchivo} fondo={color.fondo} />
          <View style={{ flex: 1, minWidth: 0, gap: 4, alignItems: 'flex-start' }}>
            <Insignia {...insigniaDocumento(vista)} />
            <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
              {lineaFecha(vista)} · subido el {fechaCorta(doc.subidoEn)}
            </Text>
          </View>
        </Caja>
      ) : null}

      <PasosNumerados titulo={guia.tituloPasos} pasos={guia.pasos.map((texto) => ({ texto }))} />

      <View style={{ gap: 12 }}>
        <AvisoAmarillo icono={Clock} texto={guia.aviso(t.antiguedadMaximaDias ?? 30, clases)} />
        <Nota icono={Lock}>{guia.privacidad}</Nota>
      </View>

      {faltaObligatorio ? <AlertaObligatorios /> : null}

      <View style={{ gap: 8 }}>
        <Text style={[tipo.etiqueta, { color: color.texto }]}>
          {guia.esPdf ? 'PDF' : 'Foto'} <Text style={{ color: color.error }}>*</Text>
        </Text>
        <Presionable
          role="button"
          aria-label={elegido ? `${elegido.nombre}. Cambiar archivo` : guia.boton}
          aria-invalid={!!ver('archivo')}
          onPress={elegir}
          disabled={subiendo || preparando}
          style={{
            backgroundColor: color.superficie,
            borderWidth: 1.5,
            borderStyle: elegido ? 'solid' : 'dashed',
            borderColor: ver('archivo') ? color.error : color.bordeCampo,
            borderRadius: radio.tarjeta,
            paddingVertical: 14,
            paddingHorizontal: 16,
            minHeight: 72,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          {elegido?.vista ? (
            <Image source={{ uri: elegido.vista }} accessibilityIgnoresInvertColors style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: color.fondo }} resizeMode="cover" />
          ) : (
            <CuadroIcono icono={elegido ? IconoArchivo : Upload} fondo={color.fondo} />
          )}
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text numberOfLines={1} style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>
              {elegido ? elegido.nombre : guia.boton}
            </Text>
            <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
              {preparando
                ? 'Preparando la foto…'
                : elegido
                  ? `${pesoLegible(elegido.archivo.size)} · Toca para cambiarlo`
                  : guia.esPdf
                    ? 'Tal como lo descargaste'
                    : 'Desde la cámara o tus fotos'}
            </Text>
          </View>
        </Presionable>
        {ver('archivo') ? (
          <Text role="alert" style={[tipo.ayuda, fuente(600), { color: color.error }]}>
            {ver('archivo')}
          </Text>
        ) : null}
      </View>

      {pideFecha ? (
        <Campo
          etiqueta={t.etiquetaFecha ?? 'Fecha'}
          obligatorio
          valor={fecha}
          onCambiar={(x) => {
            setFecha(mascaraFecha(x));
            setErrorDeLaBase(null);
          }}
          placeholder="dd/mm/aaaa"
          keyboardType="number-pad"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          ayuda={DONDE_FECHA[t.clave] ?? 'Está en el documento.'}
          error={ver('fecha') ?? undefined}
        />
      ) : null}

      <View style={{ marginTop: 'auto', gap: 10, paddingTop: 8 }}>
        <Boton titulo={tituloBotonSubir(t.corto)} icono={Upload} variante="oscuro" cargando={subiendo || preparando} onPress={() => void subir()} />
        {guia.enlace ? (
          <Boton
            titulo={guia.enlace.titulo}
            iconoDerecha={ExternalLink}
            variante="texto"
            onPress={() => {
              Linking.openURL(guia.enlace!.url).catch(() => mostrarToast('No pudimos abrir el enlace.', 'error'));
            }}
          />
        ) : null}
      </View>

      {pendiente ? (
        <HojaRevision
          visible={pedirRevision}
          texto={pendiente.texto}
          onCerrar={() => setPedirRevision(false)}
          onAceptada={() => {
            setPedirRevision(false);
            // Ya aceptada: se sube lo que eligió.
            void subir(true);
          }}
        />
      ) : null}
    </Pantalla>
  );
}

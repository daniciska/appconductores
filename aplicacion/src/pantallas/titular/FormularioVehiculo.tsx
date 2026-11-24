// Titular · Agregar / editar un vehículo de la flota (24-nov)
// Rutas: /titular/vehiculo/nuevo y /titular/vehiculo/[id]
// Patente, tipo de vehículo, marca y modelo (listas desplegables), color, año, kilometraje y 3 documentos:
// padrón, revisión técnica (con vencimiento) y seguro obligatorio SOAP (con vencimiento). Con los 3 documentos
// queda "En revisión": el equipo los revisa y consulta la patente en el Registro Nacional de Transporte
// Público y Escolar (MTT). En la demo esa revisión se simula sola. La patente solo la ven el titular y el equipo.
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/ui/escala';
import { router, useLocalSearchParams } from 'expo-router';

import { fechaLarga, mascaraFecha } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import { elegirArchivo, formatoValido } from '@/pantallas/documentos/acciones';
import { AlertaObligatorios, CabeceraFormulario, EtiquetaGrupo, NotaDemo, NotaObligatorio, irAlPrimerError } from '@/pantallas/ingreso/comunes';
import { Boton, Campo, Chip, Dialogo, Encabezado, EstadoVacio, Insignia, Pantalla, Presionable, color, fuente, mostrarToast, radio, tipo } from '@/ui';
import { CarFront, Check, Clock, FileText, Trash, Upload } from '@/ui/iconos';

import { CampoLista } from './CampoLista';

/** "2027-03-15" → "15/03/2027" */
const isoAFecha = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '');
/** "15/03/2027" → "2027-03-15" (o null si no es una fecha real). */
function fechaAIso(t: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t.trim());
  if (!m) return null;
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const f = new Date(a, mes - 1, d);
  if (f.getFullYear() !== a || f.getMonth() !== mes - 1 || f.getDate() !== d) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}
const limpiarPatente = (t: string) => t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
const RE_PATENTE = /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4}|[A-Z]{3}\d{2,3})$/;
const miles = (n: string) => n.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

type ClaveDoc = 'padron' | 'revisionTecnica' | 'soap';
const DOCS: { clave: ClaveDoc; nombre: string; ayuda: string; vence: boolean }[] = [
  { clave: 'padron', nombre: 'Padrón', ayuda: 'Certificado de inscripción del vehículo.', vence: false },
  { clave: 'revisionTecnica', nombre: 'Revisión técnica', ayuda: 'El certificado vigente.', vence: true },
  { clave: 'soap', nombre: 'Seguro obligatorio (SOAP)', ayuda: 'La póliza vigente.', vence: true },
];

function FilaDocumento({
  nombre,
  ayuda,
  archivo,
  vence,
  fecha,
  onFecha,
  onArchivo,
  errorFecha,
}: {
  nombre: string;
  ayuda: string;
  archivo: string | null;
  vence: boolean;
  fecha: string;
  onFecha: (t: string) => void;
  onArchivo: (n: string | null) => void;
  errorFecha?: string;
}) {
  const elegir = async () => {
    const n = await elegirArchivo('image/*,application/pdf');
    if (!n) return;
    if (!formatoValido(n, false) && !formatoValido(n, true)) {
      mostrarToast('Elige una foto (JPG o PNG) o un PDF.', 'error');
      return;
    }
    onArchivo(n);
  };
  return (
    <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={20} color={color.texto} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={[tipo.fuerte, { color: color.texto }]}>{nombre}</Text>
          <Text numberOfLines={1} style={[tipo.ayuda, { color: color.textoSecundario }]}>{archivo ?? ayuda}</Text>
        </View>
        {archivo ? (
          <Presionable role="button" aria-label={`Quitar ${nombre}`} onPress={() => onArchivo(null)} style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Trash size={18} color={color.textoSecundario} strokeWidth={2} />
          </Presionable>
        ) : (
          <Boton titulo="Subir" variante="contorno" tamano="mediano" icono={Upload} onPress={elegir} />
        )}
      </View>
      {!archivo ? <NotaDemo texto="Demo:" accion={{ titulo: 'Usar un archivo de ejemplo', onPress: () => onArchivo(`${nombre.toLowerCase().split(' ')[0]}.pdf`) }} /> : null}
      {vence ? (
        <Campo
          etiqueta="Vence el"
          valor={fecha}
          onCambiar={(t) => onFecha(mascaraFecha(t))}
          placeholder="dd/mm/aaaa"
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={10}
          error={errorFecha}
        />
      ) : null}
    </View>
  );
}

export default function FormularioVehiculo() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const enEdicion = !!id && id !== 'nuevo';
  const previo = useDerivado((s) => (enEdicion ? (s.vehiculos ?? []).find((v) => v.id === id && v.titularId === s.titularDemo.titularId) : undefined));
  const catalogos = useDemo((s) => s.catalogos);
  const usado = useDerivado((s) => (previo ? s.busquedas.filter((b) => (b.vehiculoIds ?? []).includes(previo.id)).length : 0));
  const guardarVehiculo = useDemo((s) => s.guardarVehiculo);
  const quitarVehiculo = useDemo((s) => s.quitarVehiculo);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [patente, setPatente] = useState(previo?.patente ?? '');
  const [tamanoId, setTamano] = useState<string | null>(previo?.tamanoId ?? null);
  const [marcaId, setMarca] = useState<string | null>(previo?.marcaId ?? null);
  const [modelo, setModelo] = useState<string | null>(previo?.modelo ?? null);
  const [colorV, setColor] = useState<string | null>(previo?.color ?? null);
  const [anio, setAnio] = useState<string | null>(previo ? String(previo.anio) : null);
  const [km, setKm] = useState(previo ? miles(String(previo.kilometraje)) : '');
  const [archivos, setArchivos] = useState<Record<ClaveDoc, string | null>>({
    padron: previo?.padron.archivo ?? null,
    revisionTecnica: previo?.revisionTecnica.archivo ?? null,
    soap: previo?.soap.archivo ?? null,
  });
  const [fechas, setFechas] = useState<Record<ClaveDoc, string>>({
    padron: '',
    revisionTecnica: isoAFecha(previo?.revisionTecnica.venceEl ?? null),
    soap: isoAFecha(previo?.soap.venceEl ?? null),
  });
  const [intento, setIntento] = useState(false);
  const [quitar, setQuitar] = useState(false);

  if (enEdicion && !previo) {
    return (
      <Pantalla>
        <Encabezado volverA="/titular/flota" />
        <EstadoVacio icono={CarFront} titulo="No encontramos el vehículo" texto="Vuelve a tu flota y elige otro." />
      </Pantalla>
    );
  }

  const tamanos = [...catalogos.tamanos].sort((a, b) => a.orden - b.orden);
  const marcas = (catalogos.marcas ?? []).filter((m) => !tamanoId || m.tamanos.includes(tamanoId)).sort((a, b) => a.orden - b.orden);
  const marca = marcas.find((m) => m.id === marcaId) ?? (catalogos.marcas ?? []).find((m) => m.id === marcaId);
  const ahora = new Date().getFullYear();
  const anios = Array.from({ length: ahora + 2 - 1990 }, (_, i) => String(ahora + 1 - i));
  const p = limpiarPatente(patente);

  const errores = {
    patente: !p ? 'Ingresa la patente.' : !RE_PATENTE.test(p) ? 'Revisa la patente (ej. ABCD12).' : null,
    tamano: !tamanoId ? 'Elige el tipo de vehículo.' : null,
    marca: !marcaId ? 'Elige la marca.' : null,
    modelo: !modelo ? 'Elige el modelo.' : null,
    color: !colorV ? 'Elige el color.' : null,
    anio: !anio ? 'Elige el año.' : null,
    km: !km ? 'Ingresa el kilometraje.' : null,
    revisionTecnica: fechas.revisionTecnica && !fechaAIso(fechas.revisionTecnica) ? 'Revisa la fecha.' : null,
    soap: fechas.soap && !fechaAIso(fechas.soap) ? 'Revisa la fecha.' : null,
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const e = (k: keyof typeof errores) => (intento ? (errores[k] ?? undefined) : undefined);
  const vacio = !patente && !tamanoId && !marcaId && !km;

  const rellenar = () => {
    setPatente('RTKL24');
    setTamano('liviano');
    setMarca('toyota');
    setModelo('Yaris');
    setColor('blanco');
    setAnio('2021');
    setKm('68.400');
    const en = (dias: number) => isoAFecha(new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10));
    setArchivos({ padron: 'padron.pdf', revisionTecnica: 'revision-tecnica.jpg', soap: 'soap.pdf' });
    setFechas({ padron: '', revisionTecnica: en(200), soap: en(150) });
  };

  const guardar = () => {
    if (hayErrores) {
      setIntento(true);
      irAlPrimerError(scrollRef);
      return;
    }
    const r = guardarVehiculo(
      {
        patente: p,
        tamanoId: tamanoId!,
        marcaId: marcaId!,
        modelo: modelo!,
        color: colorV!,
        anio: Number(anio),
        kilometraje: Number(km.replace(/\D/g, '')),
        padron: archivos.padron,
        revisionTecnica: archivos.revisionTecnica,
        revisionTecnicaVence: fechaAIso(fechas.revisionTecnica),
        soap: archivos.soap,
        soapVence: fechaAIso(fechas.soap),
      },
      previo?.id,
    );
    if (!r.ok) {
      mostrarToast(r.error ?? 'No se pudo guardar.', 'error', 5000);
      return;
    }
    const v = useDemo.getState().vehiculos.find((x) => x.id === r.id);
    mostrarToast(
      v?.revision === 'falta_info' ? 'Guardado. Sube los documentos que faltan para revisarlo.' : v?.revision === 'en_revision' ? 'Guardado. Lo estamos revisando.' : 'Cambios guardados.',
      'exito',
      4500,
    );
    router.back();
  };

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado volverA="/titular/flota" />
      <CabeceraFormulario titulo={enEdicion ? 'Tu vehículo' : 'Agregar vehículo'} subtitulo="La patente y los documentos solo los ve nuestro equipo.">
        {vacio && !enEdicion ? <NotaDemo texto="Demo:" accion={{ titulo: 'Rellenar con datos de ejemplo', onPress: rellenar }} /> : null}
      </CabeceraFormulario>

      {previo ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {previo.revision === 'revisado' ? (
            <Insignia texto={`Revisado el ${fechaLarga(previo.revisadoEl)}`} />
          ) : previo.revision === 'en_revision' ? (
            <Insignia texto="En revisión" tono="amarilla" icono={Clock} />
          ) : (
            <Insignia texto="Faltan documentos" tono="gris" icono={null} />
          )}
          {previo.registroTransporte === 'inscrito' ? <Insignia texto="Inscrito en el registro de transporte" icono={Check} /> : null}
          {previo.registroTransporte === 'no_inscrito' ? <Insignia texto="No aparece en el registro de transporte" tono="roja" icono={null} /> : null}
        </View>
      ) : null}

      <View style={{ marginTop: 8, gap: 18 }}>
        <Campo
          etiqueta="Patente"
          obligatorio
          valor={sel.patenteVisible(patente)}
          onCambiar={(t) => setPatente(limpiarPatente(t))}
          placeholder="ABCD12"
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={9}
          error={e('patente')}
        />

        <View style={{ gap: 10 }}>
          <EtiquetaGrupo titulo="Tipo de vehículo" obligatorio error={e('tamano')} />
          <View role="radiogroup" aria-label="Tipo de vehículo" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {tamanos.map((t) => (
              <Chip
                key={t.id}
                etiqueta={t.nombre}
                rol="radio"
                seleccionado={tamanoId === t.id}
                onPress={() => {
                  setTamano(t.id);
                  const m = (catalogos.marcas ?? []).find((x) => x.id === marcaId);
                  if (m && !m.tamanos.includes(t.id)) {
                    setMarca(null);
                    setModelo(null);
                  }
                }}
                style={intento && errores.tamano ? { borderColor: color.error } : undefined}
              />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <CampoLista
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Marca"
            obligatorio
            valor={marcaId}
            opciones={marcas.map((m) => ({ clave: m.id, etiqueta: m.nombre }))}
            onCambiar={(c) => {
              if (c !== marcaId) setModelo(null);
              setMarca(c);
            }}
            placeholder="Elige"
            error={e('marca')}
          />
          <CampoLista
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Modelo"
            obligatorio
            valor={modelo}
            opciones={(marca?.modelos ?? []).map((m) => ({ clave: m, etiqueta: m }))}
            onCambiar={setModelo}
            placeholder={marca ? 'Elige' : 'Primero la marca'}
            deshabilitado={!marca}
            error={e('modelo')}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <CampoLista
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Color"
            obligatorio
            valor={colorV}
            opciones={(catalogos.colores ?? []).map((c) => ({ clave: c.clave, etiqueta: c.nombre }))}
            onCambiar={setColor}
            placeholder="Elige"
            error={e('color')}
          />
          <CampoLista
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Año"
            obligatorio
            valor={anio}
            opciones={anios.map((a) => ({ clave: a, etiqueta: a }))}
            onCambiar={setAnio}
            placeholder="Elige"
            error={e('anio')}
          />
        </View>

        <Campo
          etiqueta="Kilometraje"
          obligatorio
          valor={km}
          onCambiar={(t) => setKm(miles(t).slice(0, 9))}
          placeholder="Ej. 68.400"
          keyboardType="number-pad"
          inputMode="numeric"
          derecha={<Text style={[tipo.cuerpo, fuente(600), { color: color.textoSecundario }]}>km</Text>}
          error={e('km')}
        />

        <View style={{ gap: 10 }}>
          <EtiquetaGrupo titulo="Documentos" ayuda="Foto o PDF. Los necesitamos para revisar el vehículo." />
          {DOCS.map((d) => (
            <FilaDocumento
              key={d.clave}
              nombre={d.nombre}
              ayuda={d.ayuda}
              archivo={archivos[d.clave]}
              vence={d.vence}
              fecha={fechas[d.clave]}
              onFecha={(t) => setFechas((f) => ({ ...f, [d.clave]: t }))}
              onArchivo={(n) => setArchivos((a) => ({ ...a, [d.clave]: n }))}
              errorFecha={d.clave === 'padron' ? undefined : e(d.clave)}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {intento && hayErrores ? <AlertaObligatorios /> : null}
        <Boton titulo={enEdicion ? 'Guardar cambios' : 'Agregar a mi flota'} onPress={guardar} />
        {previo ? <Boton titulo="Quitar de mi flota" variante="texto" tamano="mediano" icono={Trash} onPress={() => setQuitar(true)} /> : null}
        <NotaObligatorio />
      </View>

      <Dialogo
        visible={quitar}
        titulo="¿Quitar este vehículo?"
        texto={usado > 0 ? 'También sale de sus búsquedas. Si una búsqueda queda sin vehículos, la pausamos.' : 'Sale de tu flota.'}
        confirmar={{
          titulo: 'Quitar',
          peligro: true,
          onPress: () => {
            setQuitar(false);
            if (previo) quitarVehiculo(previo.id);
            mostrarToast('Vehículo quitado de tu flota.', 'exito');
            router.back();
          },
        }}
        cancelar={{ onPress: () => setQuitar(false) }}
      />
    </Pantalla>
  );
}

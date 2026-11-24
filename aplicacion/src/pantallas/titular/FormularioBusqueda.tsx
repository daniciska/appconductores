// Titular · Nueva búsqueda / Editar búsqueda (T8–T12, T14, T16)
// Rutas: /titular/busqueda/nueva y /titular/busqueda/[id]/editar
// Una búsqueda es un vehículo o un grupo de vehículos iguales (P2). El titular elige un negocio (solo los
// activos, con su industria activa) y, si la licencia depende del vehículo, responde una pregunta más: con
// eso se calcula la licencia exigida (no la llena él). Sin garantía ni modo de contrato (crecimiento futuro).
// Flota (24-nov): la búsqueda elige uno o más vehículos de la flota; sin vehículos no se puede publicar.
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useDerivado } from '@/datos/hooks';
import { textoPideLicencia } from '@/datos/match';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { Dia, Turno } from '@/datos/tipos';
import { AlertaObligatorios, CabeceraFormulario, EtiquetaGrupo, NotaDemo, NotaObligatorio, irAlPrimerError } from '@/pantallas/ingreso/comunes';
import { Aviso, Boton, Campo, Chip, Encabezado, EstadoVacio, FilaCheck, FilaInterruptor, FilaRadio, OpcionIcono, Pantalla, Stepper, Texto, color, mostrarToast, radio, tipo, type LucideIcon } from '@/ui';
import { BadgeCheck, CarFront, Moon, Search, Sun } from '@/ui/iconos';

import { CampoComuna } from './piezas';

const ICONO_TURNO: Record<string, LucideIcon> = { dia: Sun, noche: Moon };
const alternar = <T,>(lista: T[], valor: T): T[] => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

export default function FormularioBusqueda() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existente = useDerivado((s) => (id ? s.busquedas.find((b) => b.id === id && b.titularId === s.titularDemo.titularId) : undefined));
  const grupos = useDerivado((s) => sel.negociosPorIndustria(s, true));
  const catalogos = useDemo((s) => s.catalogos);
  const flota = useDerivado((s) => sel.flotaDelTitularDemo(s).map((v) => ({ v, nombre: sel.nombreVehiculo(s, v) })));
  const guardarBusqueda = useDemo((s) => s.guardarBusqueda);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [vehiculoIds, setVehiculoIds] = useState<string[]>(() => existente?.vehiculoIds ?? (flota.length === 1 ? [flota[0].v.id] : []));
  const [negocioId, setNegocioId] = useState<string | null>(existente?.negocioId ?? null);
  const [respuesta, setRespuesta] = useState<string | null>(existente?.respuestaVehiculo ?? null);
  const [comunaId, setComunaId] = useState<string | null>(existente?.comunaId ?? null);
  const [turnos, setTurnos] = useState<Turno[]>(existente?.turnos ?? []);
  const [dias, setDias] = useState<Dia[]>(existente?.dias ?? []);
  const [anios, setAnios] = useState(existente?.aniosMinimos ?? 0);
  const [estacionamiento, setEstacionamiento] = useState(existente?.exigeEstacionamiento ?? false);
  const [detalle, setDetalle] = useState(existente?.detalle ?? '');
  const [intento, setIntento] = useState(false);
  const [claveComuna, setClaveComuna] = useState(0);

  if (!id && flota.length === 0) {
    return (
      <Pantalla>
        <Encabezado volverA="/titular/busquedas" />
        <EstadoVacio
          icono={CarFront}
          titulo="Primero agrega un vehículo"
          texto="Cada búsqueda es para vehículos de tu flota. Agrégalo y vuelve a crear la búsqueda."
          accion={{ titulo: 'Agregar vehículo', onPress: () => router.replace('/titular/vehiculo/nuevo') }}
        />
      </Pantalla>
    );
  }

  if (id && !existente) {
    return (
      <Pantalla>
        <Encabezado volverA="/titular/busquedas" />
        <EstadoVacio icono={Search} titulo="No encontramos la búsqueda" texto="Vuelve a tus búsquedas y elige otra." />
      </Pantalla>
    );
  }

  const negocio = negocioId ? catalogos.negocios.find((n) => n.id === negocioId) : undefined;
  const errores = {
    vehiculos: vehiculoIds.length === 0 ? 'Marca al menos un vehículo.' : null,
    negocio: !negocio ? 'Elige un negocio.' : null,
    respuesta: negocio?.pregunta && !respuesta ? 'Responde la pregunta del vehículo.' : null,
    comuna: !comunaId ? 'Elige la comuna de la lista.' : null,
    turnos: turnos.length === 0 ? 'Marca al menos un turno.' : null,
    dias: dias.length === 0 ? 'Marca al menos un día.' : null,
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const ver = intento;
  const ordenDias = catalogos.dias.map((d) => d.clave as Dia);
  const nombreRegion = (rid: string) => catalogos.regiones.find((r) => r.id === rid)?.nombre;
  const licencia = negocio && (!negocio.pregunta || respuesta) ? textoPideLicencia(negocio, respuesta).replace('Pide licencia', 'Licencia') : null;
  const vacio = !negocioId && !comunaId && turnos.length === 0 && dias.length === 0 && !detalle;

  const rellenar = () => {
    const primero = grupos[0]?.negocios[0];
    if (!primero) return;
    setVehiculoIds(flota.slice(0, 1).map((x) => x.v.id));
    setNegocioId(primero.id);
    setRespuesta(primero.pregunta?.respuestas[0]?.clave ?? null);
    setComunaId('providencia');
    setClaveComuna((k) => k + 1);
    setTurnos(['dia']);
    setDias(['lu', 'ma', 'mi', 'ju', 'vi']);
    setAnios(2);
    setEstacionamiento(false);
    setDetalle('Nissan Versa 2022. Entrega diaria de lunes a viernes; bencina y TAG por cuenta del conductor.');
  };

  const guardar = () => {
    // En la búsqueda siempre se exigen los obligatorios: sin ellos no hay match posible.
    if (hayErrores || !negocioId || !comunaId) {
      setIntento(true);
      irAlPrimerError(scrollRef);
      return;
    }
    const r = guardarBusqueda(
      { vehiculoIds, negocioId, respuestaVehiculo: respuesta, comunaId, turnos, dias, aniosMinimos: anios, exigeEstacionamiento: estacionamiento, detalle },
      existente?.id,
    );
    if (!r.ok || !r.id) {
      mostrarToast(r.error ?? 'No se pudo guardar.', 'error');
      return;
    }
    if (existente) {
      mostrarToast('Búsqueda guardada.', 'exito');
      router.back();
      return;
    }
    if (r.error) mostrarToast(`Guardada en pausa. ${r.error}`, 'info', 5500);
    else mostrarToast('Búsqueda publicada.', 'exito');
    router.replace({ pathname: '/titular/busqueda/[id]', params: { id: r.id } });
  };

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado volverA="/titular/busquedas" />
      <CabeceraFormulario
        equilibrar
        titulo={existente ? 'Editar búsqueda' : 'Nueva búsqueda'}
        subtitulo="Una búsqueda es un vehículo o un grupo de vehículos iguales.">
        {vacio && !existente ? <NotaDemo texto="Demo:" accion={{ titulo: 'Rellenar con datos de ejemplo', onPress: rellenar }} /> : null}
      </CabeceraFormulario>

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="¿Para qué vehículos?" obligatorio ayuda="Si son iguales, puedes marcar varios." error={ver && errores.vehiculos} />
        <View role="group" aria-label="Vehículos" style={{ gap: 8 }}>
          {flota.map(({ v, nombre }) => (
            <FilaCheck
              key={v.id}
              titulo={nombre}
              descripcion={sel.patenteVisible(v.patente)}
              marcada={vehiculoIds.includes(v.id)}
              onPress={() => setVehiculoIds((l) => alternar(l, v.id))}
              style={ver && errores.vehiculos ? { borderColor: color.error } : undefined}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="¿En qué negocio buscas conductor?" obligatorio error={ver && errores.negocio} />
        {grupos.length === 0 ? (
          <Aviso icono="info" texto="Por ahora no hay negocios abiertos." />
        ) : (
          <View role="radiogroup" aria-label="Negocio" style={{ gap: 8 }}>
            {grupos.map((g, gi) => (
              <View key={g.industria.id} style={{ gap: 8 }}>
                <Texto variante="seccion" style={{ paddingHorizontal: 4, paddingTop: gi === 0 ? 4 : 12 }}>
                  {g.industria.nombre}
                </Texto>
                {g.negocios.map((n) => (
                  <FilaRadio
                    key={n.id}
                    titulo={n.nombre}
                    descripcion={n.ejemplo ?? undefined}
                    seleccionada={negocioId === n.id}
                    onPress={() => {
                      if (negocioId !== n.id) setRespuesta(null);
                      setNegocioId(n.id);
                    }}
                    style={ver && errores.negocio ? { borderColor: color.error } : undefined}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </View>

      {negocio?.pregunta ? (
        <View style={{ marginTop: 8, gap: 12 }}>
          <EtiquetaGrupo titulo={negocio.pregunta.pregunta} obligatorio error={ver && errores.respuesta} />
          <View role="radiogroup" aria-label={negocio.pregunta.pregunta} style={{ gap: 8 }}>
            {negocio.pregunta.respuestas.map((r) => (
              <FilaRadio
                key={r.clave}
                titulo={r.texto}
                seleccionada={respuesta === r.clave}
                onPress={() => setRespuesta(r.clave)}
                style={ver && errores.respuesta ? { borderColor: color.error } : undefined}
              />
            ))}
          </View>
        </View>
      ) : null}

      {licencia ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.campo, paddingVertical: 12, paddingHorizontal: 14 }}>
          <BadgeCheck size={18} color={color.textoSuave} strokeWidth={2} />
          <Text style={[tipo.secundario, { color: color.textoSuave, flex: 1 }]}>
            Se exige <Text style={{ fontWeight: '700', color: color.texto }}>{licencia.replace('Licencia ', 'licencia ')}</Text>. La calculamos por ti.
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        <CampoComuna
          key={claveComuna}
          comunas={catalogos.comunas}
          nombreRegion={nombreRegion}
          comunaId={comunaId}
          onCambiar={setComunaId}
          error={ver && errores.comuna ? errores.comuna : undefined}
        />
      </View>

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="Turno" obligatorio ayuda="Puedes marcar los dos." error={ver && errores.turnos} />
        <View role="group" aria-label="Turno" style={{ flexDirection: 'row', gap: 8 }}>
          {catalogos.turnos.map((t) => (
            <OpcionIcono
              key={t.clave}
              titulo={t.nombre}
              icono={ICONO_TURNO[t.clave] ?? Sun}
              seleccionada={turnos.includes(t.clave as Turno)}
              onPress={() => setTurnos((l) => alternar(l, t.clave as Turno))}
              style={ver && errores.turnos ? { borderColor: color.error } : undefined}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="Días de trabajo" obligatorio error={ver && errores.dias} />
        <View role="group" aria-label="Días de trabajo" style={{ flexDirection: 'row', gap: 6 }}>
          {catalogos.dias.map((d) => (
            <Chip
              key={d.clave}
              forma="cuadrado"
              etiqueta={d.corto ?? d.nombre.slice(0, 2)}
              etiquetaAccesible={d.nombre}
              seleccionado={dias.includes(d.clave as Dia)}
              onPress={() => setDias((l) => ordenDias.filter((x) => alternar(l, d.clave as Dia).includes(x)))}
              style={[{ flex: 1 }, ver && errores.dias ? { borderColor: color.error } : null]}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingVertical: 12, paddingHorizontal: 16 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={[tipo.fuerte, { color: color.texto }]}>Años mínimos de experiencia</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{anios === 0 ? 'Sin mínimo' : 'En vehículos como el tuyo'}</Text>
        </View>
        <Stepper valor={anios} onCambiar={setAnios} min={0} max={30} etiquetaAccesible="Años mínimos de experiencia" />
      </View>

      <FilaInterruptor titulo="Exijo estacionamiento seguro" ayuda="El conductor debe tener dónde guardar el vehículo." valor={estacionamiento} onCambiar={setEstacionamiento} />

      <Campo
        etiqueta="Detalle de la oferta"
        notaEtiqueta="(opcional)"
        valor={detalle}
        onCambiar={setDetalle}
        multilinea
        maxLength={300}
        contador
        placeholder="Ej.: Nissan Versa 2022, entrega $17.000 diarios de lunes a sábado; bencina y TAG por cuenta del conductor."
        ayuda="El conductor lo ve con el match."
      />

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {ver && hayErrores ? <AlertaObligatorios /> : null}
        <Boton titulo={existente ? 'Guardar cambios' : 'Publicar búsqueda'} onPress={guardar} />
        <NotaObligatorio />
      </View>
    </Pantalla>
  );
}

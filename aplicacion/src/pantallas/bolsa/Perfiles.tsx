// BT2 · Conductores que tú elijas
// Ruta: /titular/bolsa/[busqueda]/perfiles
// Maqueta: docs/maqueta/BolsaPerfiles.dc.html
// Condiciones que funcionan como filtros para ver la oferta en la bolsa. La licencia y la región se
// exigen siempre. Cuenta en vivo cuántos conductores las cumplen. "Guardar condiciones" las deja en la búsqueda.
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { cortoDia, nombreDia } from '@/datos/formato';
import { useEstado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import type { Dia, PerfilesBolsa, Turno } from '@/datos/tipos';
import {
  Boton,
  Chip,
  EstadoVacio,
  Interruptor,
  OpcionIcono,
  Pantalla,
  Separado,
  Stepper,
  Tarjeta,
  color,
  fuente,
  mostrarToast,
  tipo,
  volver,
} from '@/ui';
import { Lock, Moon, Search, Sun, Users } from '@/ui/iconos';

import { guardarPerfilesBolsa } from './acciones';
import { conductoresQueVerian, perfilesIniciales, textoTamanos } from './datos';
import { Cabecera, EncabezadoConTexto, Rotulo } from './piezas';

const DIAS: Dia[] = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];
const alternar = <T,>(lista: T[], x: T): T[] => (lista.includes(x) ? lista.filter((y) => y !== x) : [...lista, x]);

function FilaSiempre({ texto }: { texto: string }) {
  return (
    <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <Lock size={16} color={color.textoSecundario} strokeWidth={2.2} />
        <Text style={[tipo.cuerpo, fuente(600), { color: color.texto, flexShrink: 1 }]}>{texto}</Text>
      </View>
      <Text style={[tipo.ayuda, fuente(600), { color: color.textoSecundario }]}>siempre</Text>
    </View>
  );
}

export default function Perfiles() {
  const { busqueda: id = '' } = useLocalSearchParams<{ busqueda: string }>();
  const estado = useEstado();
  const b = sel.busquedaPorId(estado, id);
  const valida = !!b && b.titularId === estado.titularDemo.titularId;
  const [p, setP] = useState<PerfilesBolsa>(() =>
    b ? perfilesIniciales(estado, b) : { zonas: [], aniosMinimos: 0, turnos: [], dias: [], estacionamiento: false },
  );
  const cuantos = useMemo(() => (b ? conductoresQueVerian(estado, b.id, 'perfiles', p) : 0), [estado, b, p]);

  if (!b || !valida) {
    return (
      <Pantalla>
        <EncabezadoConTexto volverA="/titular" />
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <EstadoVacio icono={Search} titulo="No encontramos esta búsqueda" accion={{ titulo: 'Volver', onPress: () => volver('/titular') }} />
        </View>
      </Pantalla>
    );
  }

  const negocio = sel.negocioPorId(estado, b.negocioId);
  const { comuna, region } = sel.lugar(estado, b.comunaId);
  const zonas = region ? sel.zonasDeRegion(estado, region.id) : [];
  const cambiar = (parcial: Partial<PerfilesBolsa>) => setP((x) => ({ ...x, ...parcial }));

  const guardar = () => {
    guardarPerfilesBolsa(b.id, p);
    mostrarToast('Condiciones guardadas.', 'exito');
    volver({ pathname: '/titular/bolsa/[busqueda]/publicar', params: { busqueda: b.id } });
  };

  return (
    <Pantalla>
      <EncabezadoConTexto
        volverA={{ pathname: '/titular/bolsa/[busqueda]/publicar', params: { busqueda: b.id } }}
        texto={[negocio?.nombre, comuna?.nombre].filter(Boolean).join(' · ')}
      />
      <Cabecera titulo="Conductores que tú elijas" subtitulo="Solo ellos verán tu oferta en la bolsa." />

      <Tarjeta padding={0} separacion={0} style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
        <Separado>
          <FilaSiempre texto={`Licencia para ${negocio?.nombre ?? 'el negocio'}`} />
          <FilaSiempre texto={`Región: ${region?.nombre ?? 'la de tu búsqueda'}`} />
        </Separado>
      </Tarjeta>

      <View style={{ marginTop: 8, gap: 12 }}>
        <Rotulo ayuda="Sin marcar, toda la región.">Zonas</Rotulo>
        <View role="group" aria-label="Zonas" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {zonas.map((z) => (
            <Chip key={z.id} etiqueta={z.nombre} seleccionado={p.zonas.includes(z.id)} onPress={() => cambiar({ zonas: alternar(p.zonas, z.id) })} />
          ))}
        </View>
      </View>

      <Tarjeta padding={0} style={{ marginTop: 8, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={[tipo.fuerte, { color: color.texto }]}>Años mínimos de experiencia</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>En {textoTamanos(estado, negocio)}</Text>
        </View>
        <Stepper valor={p.aniosMinimos} onCambiar={(n) => cambiar({ aniosMinimos: n })} etiquetaAccesible="años mínimos de experiencia" />
      </Tarjeta>

      <View style={{ marginTop: 8, gap: 12 }}>
        <Rotulo ayuda="Sin marcar, cualquiera.">Turno</Rotulo>
        <View role="group" aria-label="Turno" style={{ flexDirection: 'row', gap: 8 }}>
          {(['dia', 'noche'] as Turno[]).map((t) => (
            <OpcionIcono
              key={t}
              titulo={t === 'dia' ? 'Día' : 'Noche'}
              icono={t === 'dia' ? Sun : Moon}
              seleccionada={p.turnos.includes(t)}
              onPress={() => cambiar({ turnos: alternar(p.turnos, t) })}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 8, gap: 12 }}>
        <Rotulo ayuda="Que pueda al menos uno. Sin marcar, cualquiera.">Días</Rotulo>
        <View role="group" aria-label="Días" style={{ flexDirection: 'row', gap: 6 }}>
          {DIAS.map((d) => (
            <Chip
              key={d}
              forma="cuadrado"
              etiqueta={cortoDia(d)}
              etiquetaAccesible={nombreDia(d)}
              seleccionado={p.dias.includes(d)}
              onPress={() => cambiar({ dias: alternar(p.dias, d) })}
              style={{ flex: 1 }}
            />
          ))}
        </View>
      </View>

      <Tarjeta padding={0} style={{ marginTop: 8, paddingVertical: 14, paddingHorizontal: 16, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={[tipo.fuerte, { color: color.texto }]}>Estacionamiento seguro</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Solo quienes lo tienen.</Text>
        </View>
        <Interruptor valor={p.estacionamiento} onCambiar={(v) => cambiar({ estacionamiento: v })} etiquetaAccesible="Estacionamiento seguro" />
      </Tarjeta>

      <View style={{ marginTop: 'auto', paddingTop: 8, gap: 12 }}>
        <View aria-live="polite" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Users size={18} color={color.textoSuave} strokeWidth={2} />
          <Text style={[tipo.secundario, { color: color.textoSuave }]}>
            <Text style={[fuente(700), { color: color.texto }]}>
              {cuantos} {cuantos === 1 ? 'conductor' : 'conductores'}
            </Text>
            {cuantos === 1 ? ' cumple estas condiciones' : ' cumplen estas condiciones'}
          </Text>
        </View>
        <Boton titulo="Guardar condiciones" variante="oscuro" onPress={guardar} />
      </View>
    </Pantalla>
  );
}

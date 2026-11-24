// Titular · Flota (pestaña, 24-nov): los vehículos del titular, con su revisión y los avisos de vencimiento.
// Ruta: /titular/flota
// El plan limita cuántos vehículos puede tener (configurable; sin plan, 1). Para publicar una búsqueda hace
// falta al menos un vehículo.
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { fechaLarga } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import type { Vehiculo } from '@/datos/tipos';
import { Aviso, Boton, EstadoVacio, Insignia, Pantalla, Tarjeta, Titulo, color, tipo } from '@/ui';
import { CarFront, ChevronRight, Clock, Plus } from '@/ui/iconos';

import { ConRegistro } from './piezas';

const NOMBRE_DOC = { revisionTecnica: 'revisión técnica', soap: 'SOAP' } as const;

export function textoAviso(a: sel.AvisoVehiculo): string {
  const doc = NOMBRE_DOC[a.documento];
  if (a.estado === 'vencido') return `Venció la ${doc === 'SOAP' ? 'póliza del SOAP' : doc}`;
  return a.dias === 0 ? `La ${doc === 'SOAP' ? 'póliza del SOAP' : doc} vence hoy` : `La ${doc === 'SOAP' ? 'póliza del SOAP' : doc} vence en ${a.dias} ${a.dias === 1 ? 'día' : 'días'}`;
}

function TarjetaVehiculo({ v, avisos }: { v: Vehiculo; avisos: sel.AvisoVehiculo[] }) {
  const datos = useDerivado((s) => ({ nombre: sel.nombreVehiculo(s, v), color: sel.nombreColor(s, v.color), tamano: s.catalogos.tamanos.find((t) => t.id === v.tamanoId)?.nombre }));
  const vencido = avisos.some((a) => a.estado === 'vencido');
  return (
    <Tarjeta padding={16} separacion={10} etiquetaAccesible={`${datos.nombre}, patente ${sel.patenteVisible(v.patente)}. Ver vehículo`} onPress={() => router.push({ pathname: '/titular/vehiculo/[id]', params: { id: v.id } })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
          <CarFront size={22} color={color.texto} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text numberOfLines={1} style={[tipo.tituloTarjeta, { color: color.texto }]}>{datos.nombre}</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
            {[sel.patenteVisible(v.patente), datos.tamano, datos.color, `${v.kilometraje.toLocaleString('es-CL')} km`].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {v.revision === 'revisado' ? (
          <Insignia texto="Revisado" />
        ) : v.revision === 'en_revision' ? (
          <Insignia texto="En revisión" tono="amarilla" icono={Clock} />
        ) : (
          <Insignia texto="Faltan documentos" tono="gris" icono={null} />
        )}
        {avisos.map((a) => (
          <Insignia key={a.documento} texto={textoAviso(a)} tono={a.estado === 'vencido' ? 'roja' : 'amarilla'} icono={null} />
        ))}
      </View>
      {vencido ? <Text style={[tipo.ayuda, { color: color.error }]}>Sus búsquedas no salen en los matches hasta que subas el documento nuevo.</Text> : null}
      {v.revision === 'revisado' && v.revisadoEl ? <Text style={[tipo.pequeno, { color: color.textoSecundario }]}>Revisado el {fechaLarga(v.revisadoEl)}</Text> : null}
    </Tarjeta>
  );
}

function Contenido() {
  const flota = useDerivado(sel.flotaDelTitularDemo);
  const avisos = useDerivado((s) => sel.avisosFlota(s));
  const limite = useDerivado(sel.limiteVehiculos);
  const plan = useDerivado(sel.planDeLaDemo);
  const lleno = flota.length >= limite;

  return (
    <Pantalla inferior={24}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 4 }}>
        <Titulo style={{ flex: 1 }}>Mi flota</Titulo>
        <Text style={[tipo.secundario, { color: color.textoSecundario }]}>{flota.length} de {limite}</Text>
      </View>
      {flota.length === 0 ? (
        <EstadoVacio
          icono={CarFront}
          titulo="Agrega tu primer vehículo"
          texto="Con tu vehículo en la flota puedes publicar búsquedas. Lo revisamos para que los conductores confíen."
          accion={{ titulo: 'Agregar vehículo', onPress: () => router.push('/titular/vehiculo/nuevo') }}
        />
      ) : (
        <>
          {lleno ? (
            <Aviso
              icono="info"
              texto={plan ? `Tu plan ${plan.nombre} permite ${limite} ${limite === 1 ? 'vehículo' : 'vehículos'}.` : 'Sin plan puedes tener 1 vehículo.'}
              accion={<Boton titulo="Ver planes" variante="oscuro" tamano="mediano" onPress={() => router.push('/titular/planes')} />}
            />
          ) : (
            <Boton titulo="Agregar vehículo" icono={Plus} variante="principal" onPress={() => router.push('/titular/vehiculo/nuevo')} />
          )}
          <View style={{ gap: 10 }}>
            {flota.map((v) => (
              <TarjetaVehiculo key={v.id} v={v} avisos={avisos.filter((a) => a.vehiculo.id === v.id)} />
            ))}
          </View>
        </>
      )}
    </Pantalla>
  );
}

export default function Flota() {
  return (
    <ConRegistro>
      <Contenido />
    </ConRegistro>
  );
}

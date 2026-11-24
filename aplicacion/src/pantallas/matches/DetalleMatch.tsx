// D2 · Detalle del match
// Ruta: /conductor/matches/[id]
// Maqueta: docs/maqueta/CondDetalleMatch.dc.html
// % de coincidencia real (motor de match.ts con las reglas del estado) y qué no coincide, condiciones
// de la búsqueda, detalle del titular y su contacto si el titular se lo mostró (24-nov: sin mensajes).
// Sin modo de contrato ni garantía. Abrir este detalle NO entrega datos del conductor (eso pasa del
// lado del titular). "Compartir mi dirección" y "Reportar" viven aquí.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/ui/escala';
import { router, useLocalSearchParams } from 'expo-router';

import { iniciales, textoDias, textoTurnos } from '@/datos/formato';
import { useDerivado, useMatchDelUsuario } from '@/datos/hooks';
import { TEXTO_PRECONDICION, aniosEnNegocio } from '@/datos/match';
import { insigniaTitular, nombreColor, nombreTitular, vehiculosDeBusqueda } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { CodigoRegla } from '@/datos/tipos';
import {
  Avatar,
  Aviso,
  Boton,
  Dialogo,
  Encabezado,
  EstadoVacio,
  Insignia,
  Pantalla,
  Presionable,
  Separador,
  Texto,
  Titulo,
  color,
  fuente,
  mostrarToast,
  radio,
  tipo,
  volver,
} from '@/ui';
import { CircleHelp, Flag, Info, MapPin } from '@/ui/iconos';

import { BotonFavorito, NotaNoCoincide, TarjetaContacto } from './piezas';

/** "otra zona y no todos los días" */
function enumerar(lista: string[]): string {
  if (lista.length <= 1) return lista[0] ?? '';
  return `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}`;
}

function Fila({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string | null }) {
  return (
    <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 8 }}>
      <Texto variante="secundario" tono="secundario">
        {etiqueta}
      </Texto>
      <View style={{ alignItems: 'flex-end', gap: 2, flexShrink: 1 }}>
        <Text style={[tipo.cuerpo, fuente(600), { color: color.texto, textAlign: 'right' }]}>{valor}</Text>
        {nota ? <NotaNoCoincide texto={nota} /> : null}
      </View>
    </View>
  );
}

function TarjetaBlanca({ children, padding }: { children: ReactNode; padding?: { top: number; bottom: number } }) {
  return (
    <View
      style={{
        backgroundColor: color.superficie,
        borderWidth: 1,
        borderColor: color.borde,
        borderRadius: radio.tarjeta,
        paddingHorizontal: 18,
        paddingTop: padding?.top ?? 16,
        paddingBottom: padding?.bottom ?? 18,
      }}>
      {children}
    </View>
  );
}

export default function DetalleMatch() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const m = useMatchDelUsuario(id ?? '');
  const conductor = useDemo((s) => s.conductor);
  const compartirDireccion = useDemo((s) => s.compartirMiDireccion);
  // Flota (24-nov): el conductor ve el tipo, el año y el color del vehículo, y si está revisado (no la patente).
  const textoVehiculos = useDerivado((s) => {
    const b = s.busquedas.find((x) => x.id === id);
    if (!b) return null;
    const vs = vehiculosDeBusqueda(s, b);
    if (vs.length === 0) return null;
    const partes = vs.map((v) => `${s.catalogos.tamanos.find((t) => t.id === v.tamanoId)?.nombre ?? 'Vehículo'} ${v.anio}, ${nombreColor(s, v.color).toLowerCase()}`);
    const revisados = vs.every((v) => v.revision === 'revisado');
    return { texto: `${partes.join(' · ')}${revisados ? ' · Revisado' : ''}`, varios: vs.length > 1 };
  });
  const [confirmarDireccion, setConfirmarDireccion] = useState(false);

  if (!m) {
    return (
      <Pantalla>
        <Encabezado volverA="/conductor/matches" />
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 60 }}>
          <EstadoVacio
            icono={CircleHelp}
            titulo="No encontramos este match"
            texto="Puede que la búsqueda ya no exista."
            accion={{ titulo: 'Ver mis matches', onPress: () => volver('/conductor/matches') }}
          />
        </View>
      </Pantalla>
    );
  }

  const { busqueda: b, resultado: r, titular } = m;
  const nombre = nombreTitular(titular);
  const nota = (codigo: CodigoRegla, texto: string): string | null => {
    const d = r.detalle.find((x) => x.codigo === codigo);
    return d && d.uso !== 'apagado' && !d.cumple ? texto : null;
  };
  const anios = aniosEnNegocio(conductor.experiencia, m.negocio);
  const diasComunes = b.dias.filter((d) => conductor.dias.includes(d)).length;
  const porPostulacion = m.origen === 'postulacion' && !r.hayMatch;
  // Primero los filtros obligatorios que fallan (región, turno, negocio, licencia) y después las variables del %.
  // (Si es otra región, "otra zona" sobra.)
  const otraRegion = r.filtrosFallidos.includes('F3');
  const motivosNoVigente = [
    ...r.textosFiltrosFallidos,
    ...r.textosNoCoinciden.filter((_, i) => !(otraRegion && r.noCoinciden[i] === 'M2')),
  ];
  const motivoNoVigente = !m.vigente
    ? r.precondicionFallida
      ? TEXTO_PRECONDICION[r.precondicionFallida]
      : motivosNoVigente.length > 0
        ? enumerar(motivosNoVigente)
        : null
    : null;

  return (
    <Pantalla>
      <Encabezado
        volverA="/conductor/matches"
        derecha={<BotonFavorito busquedaId={m.id} favorito={m.favorito} nombre={`${m.negocio.nombre} de ${nombre}`} variante="borde" />}
      />

      <View style={{ alignItems: 'flex-start', gap: 10, paddingHorizontal: 4 }}>
        {!m.vigente ? (
          <Insignia texto="Sin match vigente" tono="gris" tamano="grande" icono={null} />
        ) : porPostulacion ? (
          <Insignia texto="Match por postulación" tono="gris" tamano="grande" icono={null} />
        ) : (
          <Insignia texto={`Coincide ${r.porcentaje} %`} tono="verde" tamano="grande" />
        )}
        <Titulo>{m.negocio.nombre}</Titulo>
        {!porPostulacion && r.textosNoCoinciden.length > 0 && m.vigente ? (
          <Texto variante="ayuda" style={{ marginTop: -4 }}>
            No coincide: {enumerar(r.textosNoCoinciden)}.
          </Texto>
        ) : null}
      </View>

      {motivoNoVigente ? (
        <Aviso icono={Info} titulo="Este match ya no está vigente" texto={`Motivo: ${motivoNoVigente.charAt(0).toLowerCase()}${motivoNoVigente.slice(1)}.`} />
      ) : null}

      <View
        style={{
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.tarjeta,
          paddingVertical: 16,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}>
        <Avatar texto={iniciales(nombre)} tamano={48} />
        <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 6 }}>
          <Text style={[tipo.fuerte, { fontSize: 16, color: color.texto }]}>{nombre}</Text>
          {titular.revisado ? <Insignia texto={insigniaTitular(titular)} tono="verde" /> : null}
        </View>
      </View>

      <TarjetaBlanca padding={{ top: 16, bottom: 4 }}>
        <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto, paddingBottom: 6 }]}>
          Condiciones
        </Text>
        {textoVehiculos ? (
          <>
            <Fila etiqueta={textoVehiculos.varios ? 'Vehículos' : 'Vehículo'} valor={textoVehiculos.texto} nota={null} />
            <Separador />
          </>
        ) : null}
        <Fila
          etiqueta="Retiro"
          valor={[m.comuna?.nombre, m.zona?.nombre].filter(Boolean).join(' · ') || 'Por definir'}
          nota={otraRegion ? 'Vives en otra región' : nota('M2', 'Vives en otra zona')}
        />
        <Separador />
        <Fila etiqueta="Turno" valor={textoTurnos(b.turnos)} nota={nota('M3', 'Otro turno')} />
        <Separador />
        <Fila
          etiqueta="Días"
          valor={textoDias(b.dias)}
          nota={nota('M7', `Coinciden ${diasComunes} de ${b.dias.length} días`)}
        />
        <Separador />
        <Fila
          etiqueta="Experiencia mínima"
          valor={b.aniosMinimos > 0 ? `${b.aniosMinimos} ${b.aniosMinimos === 1 ? 'año' : 'años'}` : 'Sin mínimo'}
          nota={nota('M4', `Tienes ${anios} ${anios === 1 ? 'año' : 'años'}`)}
        />
        <Separador />
        <Fila
          etiqueta="Estacionamiento"
          valor={b.exigeEstacionamiento ? 'Lo exige' : 'No lo exige'}
          nota={nota('M6', 'No tienes estacionamiento')}
        />
      </TarjetaBlanca>

      {b.detalle.trim() && !b.detalleOculto ? (
        <TarjetaBlanca>
          <View style={{ gap: 8 }}>
            <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto }]}>
              Detalle de la oferta
            </Text>
            <Text style={[tipo.parrafo, { color: color.textoSuave }]}>“{b.detalle.trim()}”</Text>
          </View>
        </TarjetaBlanca>
      ) : null}

      {m.contactoCompartidoEl ? (
        <>
          <TarjetaContacto titulo={`Contacto de ${nombre}`} telefono={titular.telefono} correo={titular.correo} />
          {m.direccionCompartidaEl ? (
            <Aviso icono={MapPin} tono="exito" texto="Compartiste tu dirección con este titular." />
          ) : (
            <Boton titulo="Compartir mi dirección" variante="contorno" icono={MapPin} onPress={() => setConfirmarDireccion(true)} />
          )}
        </>
      ) : (
        <Aviso icono="candado" texto="Si el titular tiene un plan, verá tu contacto. Si quiere, te mostrará el suyo." />
      )}

      <Presionable
        role="link"
        aria-label={`Reportar a ${nombre}`}
        onPress={() => router.push({ pathname: '/conductor/matches/[id]/reportar', params: { id: m.id } })}
        style={{ marginTop: 'auto', minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Flag size={16} color={color.textoSecundario} strokeWidth={2} />
        <Text style={[tipo.secundario, fuente(600), { color: color.textoSecundario }]}>Reportar a este titular</Text>
      </Presionable>

      <Dialogo
        visible={confirmarDireccion}
        titulo="¿Compartir tu dirección?"
        texto={`${nombre} verá tu dirección completa.`}
        confirmar={{
          titulo: 'Compartir',
          onPress: () => {
            compartirDireccion(m.id);
            setConfirmarDireccion(false);
            mostrarToast('Compartiste tu dirección.', 'exito');
          },
        }}
        cancelar={{ onPress: () => setConfirmarDireccion(false) }}
      />
    </Pantalla>
  );
}

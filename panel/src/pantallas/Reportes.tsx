// Panel · Reportes
// Ruta: /panel/reportes
// Sin maqueta (panel web). Reportes de conversaciones: leer la conversación (queda registrado) y resolver.
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAhora, useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { MotivoReporteId, Reporte } from '@/datos/tipos';
import { haceCuanto, hora, iniciales } from '@/datos/formato';
import {
  Aviso,
  Avatar,
  Boton,
  Campo,
  ControlSegmentado,
  EstadoVacio,
  FilaRadio,
  Insignia,
  Texto,
  Titulo,
  color,
  mostrarToast,
  radio,
  type TonoInsignia,
} from '@/ui';
import { PaginaPanel } from '@panel/marco';
import { CircleCheck, Eye, Flag, Lock } from '@/ui/iconos';

import { OPCIONES_RESOLUCION, cambiarSuspension, registrarLectura, resolverReporteCon, type QueSeHizo } from '@panel/datos/acciones';
import { usePuede } from '@panel/sesion';
import { FilaElegible, ListaDetalle, TarjetaPanel, useAnchoPanel } from './piezas';

type Vista = 'abiertos' | 'resueltos';

const TONO_MOTIVO: Record<MotivoReporteId, TonoInsignia> = { dinero: 'roja', acoso: 'roja', falsa: 'amarilla', spam: 'amarilla', otro: 'gris' };

export default function Reportes() {
  const reportes = useDemo((s) => s.reportes);
  const motivos = useDemo((s) => s.catalogos.motivosReporte);
  const { dosColumnas } = useAnchoPanel();
  const ahora = useAhora(30000);
  const [vista, setVista] = useState<Vista>('abiertos');
  const [elegido, setElegido] = useState<string | null>(null);

  const abiertos = reportes.filter((r) => r.estado === 'abierto').sort((a, b) => a.reportadoEl.localeCompare(b.reportadoEl));
  const resueltos = reportes.filter((r) => r.estado === 'resuelto').sort((a, b) => (b.resueltoEl ?? '').localeCompare(a.resueltoEl ?? ''));
  const lista = vista === 'abiertos' ? abiertos : resueltos;
  const actual = reportes.find((r) => r.id === elegido) ?? null;
  const nombreMotivo = (id: MotivoReporteId) => motivos.find((m) => m.id === id)?.nombre ?? id;

  useEffect(() => {
    if (dosColumnas && (!actual || !lista.some((r) => r.id === actual.id)) && lista.length > 0) setElegido(lista[0].id);
  }, [dosColumnas, actual, lista]);

  const listaUI = (
    <>
      <ControlSegmentado
        etiquetaAccesible="Qué reportes ver"
        opciones={[
          { clave: 'abiertos', etiqueta: `Abiertos · ${abiertos.length}` },
          { clave: 'resueltos', etiqueta: `Resueltos · ${resueltos.length}` },
        ]}
        valor={vista}
        onCambiar={(v) => {
          setVista(v);
          setElegido(null);
        }}
      />
      {lista.length === 0 ? (
        <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde }}>
          <EstadoVacio
            icono={vista === 'abiertos' ? CircleCheck : Flag}
            titulo={vista === 'abiertos' ? 'Sin reportes abiertos' : 'Aún no hay reportes resueltos'}
            texto={vista === 'abiertos' ? 'Cuando alguien reporte una conversación, aparecerá aquí.' : undefined}
          />
        </View>
      ) : (
        lista.map((r) => (
          <FilaElegible key={r.id} elegida={r.id === elegido} onPress={() => setElegido(r.id)} etiquetaAccesible={`Reporte: ${nombreMotivo(r.motivo)}`}>
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Insignia texto={nombreMotivo(r.motivo)} tono={TONO_MOTIVO[r.motivo]} icono={null} />
              </View>
              <Texto variante="secundario" peso={600} numberOfLines={1}>
                {r.quienReporta.nombre} → {r.reportado.nombre}
              </Texto>
              <Texto variante="ayuda">
                {vista === 'abiertos' ? `Reportado ${haceCuanto(r.reportadoEl, ahora)}` : `Resuelto ${haceCuanto(r.resueltoEl, ahora)}`}
              </Texto>
            </View>
          </FilaElegible>
        ))
      )}
    </>
  );

  const detalle =
    actual && lista.some((r) => r.id === actual.id) ? (
      <DetalleReporte key={actual.id} reporte={actual} nombreMotivo={nombreMotivo(actual.motivo)} ahora={ahora} onResuelto={() => setElegido(null)} />
    ) : dosColumnas ? (
      <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde, minHeight: 320, justifyContent: 'center' }}>
        <EstadoVacio icono={Flag} titulo="Elige un reporte" texto="Verás el motivo, la conversación reportada y cómo resolverlo." />
      </View>
    ) : null;

  return (
    <PaginaPanel titulo="Reportes" descripcion="Conversaciones reportadas por conductores o titulares. Los más antiguos primero.">
      <ListaDetalle lista={listaUI} detalle={detalle} hayElegido={!!actual && lista.some((r) => r.id === actual.id)} onVolver={() => setElegido(null)} textoVolver="Volver a los reportes" />
    </PaginaPanel>
  );
}

function DetalleReporte({ reporte: r, nombreMotivo, ahora, onResuelto }: { reporte: Reporte; nombreMotivo: string; ahora: number; onResuelto: () => void }) {
  const { escritorio } = useAnchoPanel();
  const [leida, setLeida] = useState(false);
  // Sin opción marcada: la persona elige qué hacer (R18: ocultar los mensajes o suspender la cuenta).
  const [opcion, setOpcion] = useState<QueSeHizo | null>(null);
  const [nota, setNota] = useState('');
  const suspendido = useDerivado((s) => !!(s.titulares.find((t) => t.id === r.reportado.id)?.suspendido || s.conductores.find((c) => c.id === r.reportado.id)?.suspendido));
  const contexto = useDerivado((s) => {
    const b = r.busquedaId ? sel.busquedaPorId(s, r.busquedaId) : undefined;
    if (!b) return null;
    return `${sel.negocioPorId(s, b.negocioId)?.nombre ?? ''} · ${sel.comunaPorId(s, b.comunaId)?.nombre ?? ''} · ${sel.nombreTitular(sel.titularPorId(s, b.titularId))}`;
  });
  // Suspender: el revisor también puede (propuesta, por confirmar: MD52). Al conductor de la demo no se le suspende.
  const puedeSuspender = usePuede('suspender_cuentas');
  const opciones = OPCIONES_RESOLUCION.filter((o) => o.clave !== 'suspender' || (puedeSuspender && r.reportado.id !== sel.ID_USUARIO));

  const leer = () => {
    registrarLectura(`Leyó la conversación reportada entre ${r.quienReporta.nombre} y ${r.reportado.nombre}`);
    setLeida(true);
  };

  return (
    <View style={{ gap: 16 }}>
      <TarjetaPanel>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Insignia texto={r.estado === 'abierto' ? 'Abierto' : 'Resuelto'} tono={r.estado === 'abierto' ? 'amarilla' : 'verde'} icono={r.estado === 'abierto' ? null : 'check'} />
            {suspendido ? <Insignia texto="Cuenta suspendida" tono="oscura" icono={null} /> : null}
          </View>
          <Titulo nivel={2}>{nombreMotivo}</Titulo>
          <Texto variante="secundario" tono="secundario">
            Reportado {haceCuanto(r.reportadoEl, ahora)}
            {contexto ? ` · ${contexto}` : ''}
          </Texto>
        </View>
        <View style={{ flexDirection: escritorio ? 'row' : 'column', gap: 12 }}>
          <Persona etiqueta="Quién reporta" nombre={r.quienReporta.nombre} rol={r.quienReporta.rol} />
          <Persona etiqueta="Persona reportada" nombre={r.reportado.nombre} rol={r.reportado.rol} destacada />
        </View>
        {r.detalle ? (
          <View style={{ backgroundColor: color.fondo, borderRadius: radio.campo, padding: 14, gap: 4 }}>
            <Texto variante="pequeno">Lo que escribió quien reporta</Texto>
            <Texto variante="secundario">“{r.detalle}”</Texto>
          </View>
        ) : null}
      </TarjetaPanel>

      <TarjetaPanel titulo="Conversación reportada" descripcion="Solo esta conversación la puede leer el equipo.">
        {!leida ? (
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 24, backgroundColor: color.fondo, borderRadius: radio.campo }}>
            <View style={{ width: 44, height: 44, borderRadius: radio.icono, backgroundColor: color.superficie, alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color={color.texto} strokeWidth={2} />
            </View>
            <Texto variante="secundario" tono="secundario" centrado style={{ maxWidth: 320 }}>
              {r.conversacion.length} mensajes. Al leerla, queda en el registro del equipo.
            </Texto>
            <Boton titulo="Leer conversación" icono={Eye} variante="oscuro" tamano="mediano" onPress={leer} style={{ alignSelf: 'center' }} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {r.conversacion.map((m) => {
              const esReportado = (m.autor === 'titular' && r.reportado.rol === 'titular') || (m.autor === 'conductor' && r.reportado.rol === 'conductor');
              const nombre = esReportado ? r.reportado.nombre : r.quienReporta.nombre;
              return (
                <View key={m.id} style={{ alignItems: esReportado ? 'flex-start' : 'flex-end', gap: 4 }}>
                  <Texto variante="pequeno">
                    {nombre} · {hora(m.hora)}
                  </Texto>
                  <View
                    style={{
                      maxWidth: '82%',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 16,
                      borderTopLeftRadius: esReportado ? 4 : 16,
                      borderTopRightRadius: esReportado ? 16 : 4,
                      backgroundColor: esReportado ? color.superficie : color.superficieHundida,
                      borderWidth: esReportado ? 1.5 : 0,
                      borderColor: color.errorFondo,
                    }}>
                    <Texto variante="secundario">{m.texto}</Texto>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </TarjetaPanel>

      {r.estado === 'abierto' ? (
        <TarjetaPanel titulo="Resolver" separacion={10}>
          {opciones.map((o) => (
            <FilaRadio key={o.clave} titulo={o.titulo} descripcion={o.descripcion} seleccionada={opcion === o.clave} onPress={() => setOpcion(o.clave)} />
          ))}
          <Campo etiqueta="Nota interna" notaEtiqueta="(opcional)" valor={nota} onCambiar={setNota} placeholder="Ej.: pidió dinero por adelantado" maxLength={140} />
          <Boton
            titulo="Resolver reporte"
            variante="oscuro"
            deshabilitado={!opcion}
            onPress={() => {
              if (!opcion) return;
              const resultado = resolverReporteCon(r, opcion, nota);
              if (!resultado.ok) {
                mostrarToast(resultado.error ?? 'No se pudo resolver.', 'error');
                return;
              }
              mostrarToast(
                opcion === 'suspender'
                  ? `Reporte resuelto: ${r.reportado.nombre} quedó suspendido`
                  : opcion === 'mensaje_oculto'
                    ? 'Reporte resuelto: mensajes ocultos'
                    : 'Reporte resuelto',
                'exito',
              );
              onResuelto();
            }}
          />
        </TarjetaPanel>
      ) : (
        <Aviso tono="exito" icono={CircleCheck} titulo={`Resuelto ${haceCuanto(r.resueltoEl, ahora)}`} texto={r.queSeHizo ?? 'Sin acción'} accion={
          suspendido && puedeSuspender ? (
            <Boton
              titulo="Reactivar cuenta"
              variante="contorno"
              tamano="mediano"
              onPress={() => {
                const resultado = cambiarSuspension(r.reportado.id, r.reportado.nombre, false);
                if (resultado.ok) mostrarToast(`${r.reportado.nombre} puede volver a usar la app`, 'exito');
                else mostrarToast(resultado.error ?? 'No se pudo reactivar.', 'error');
              }}
            />
          ) : undefined
        } />
      )}
    </View>
  );
}

function Persona({ etiqueta, nombre, rol, destacada }: { etiqueta: string; nombre: string; rol: 'conductor' | 'titular'; destacada?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: destacada ? color.errorFondo : color.borde,
        backgroundColor: color.superficie,
        borderRadius: radio.campo,
        padding: 12,
      }}>
      <Avatar texto={iniciales(nombre)} tamano={40} tono={destacada ? 'oscuro' : 'claro'} />
      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Texto variante="pequeno">{etiqueta}</Texto>
        <Texto variante="secundario" peso={700} numberOfLines={1}>
          {nombre}
        </Texto>
        <Texto variante="pequeno">{rol === 'titular' ? 'Titular' : 'Conductor'}</Texto>
      </View>
    </View>
  );
}

// D5 · Reportar (24-nov: en las dos direcciones y sin "Bloquear")
// Ruta: /conductor/matches/[id]/reportar (el conductor reporta al titular de un match).
// El titular reporta a un conductor desde /titular/conductor/[id]/reportar con el mismo FormularioReporte.
// El reporte queda abierto hasta que lo resuelva el equipo en el panel.
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/ui/escala';
import { useLocalSearchParams, type Href } from 'expo-router';

import { fechaConMes } from '@/datos/formato';
import { useMatchDelUsuario } from '@/datos/hooks';
import { ID_USUARIO, nombreTitular } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { MotivoReporteId } from '@/datos/tipos';
import { Aviso, Boton, Campo, Encabezado, Pantalla, Presionable, Titulo, color, fuente, mostrarToast, radio, tipo, volver } from '@/ui';
import { Flag } from '@/ui/iconos';

function OpcionMotivo({ titulo, marcada, onPress }: { titulo: string; marcada: boolean; onPress: () => void }) {
  return (
    <Presionable
      role="radio"
      aria-checked={marcada}
      aria-label={titulo}
      onPress={onPress}
      style={{
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: radio.campo,
        backgroundColor: color.superficie,
        borderWidth: marcada ? 1.5 : 1,
        borderColor: marcada ? color.bordeFuerte : color.borde,
      }}>
      <View
        aria-hidden
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: marcada ? 2 : 1.5,
          borderColor: marcada ? color.oscuro : color.textoSecundario,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {marcada ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.oscuro }} /> : null}
      </View>
      <Text style={[tipo.cuerpo, fuente(marcada ? 600 : 500), { color: color.texto, flex: 1 }]}>{titulo}</Text>
    </Presionable>
  );
}

export interface PropsFormularioReporte {
  /** A quién se reporta ("Transportes Los Aromos SpA", "Daniel Soto"). */
  nombreReportado: string;
  rolReportado: 'titular' | 'conductor';
  /** Ruta a la que vuelve "Volver" y "Cancelar". */
  volverA: string;
  alEnviar: (motivo: MotivoReporteId, detalle: string) => void;
  /** Después de enviar (por ejemplo, volver a la pantalla anterior). */
  alTerminar: () => void;
  /** Si ya hay un reporte abierto de esta persona: fecha en que se hizo (muestra "Ya lo reportaste"). */
  reportadoEl?: string | null;
}

/** Formulario de reporte: motivo (y detalle si es "Otro"). Lo usan el conductor y el titular. */
export function FormularioReporte({ nombreReportado, rolReportado, volverA, alEnviar, alTerminar, reportadoEl }: PropsFormularioReporte) {
  const motivos = useDemo((s) => s.catalogos.motivosReporte);
  const [motivo, setMotivo] = useState<MotivoReporteId | null>(null);
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const quien = rolReportado === 'titular' ? 'titular' : 'conductor';

  const enviar = () => {
    if (!motivo || enviando) return;
    setEnviando(true);
    setTimeout(() => {
      alEnviar(motivo, motivo === 'otro' ? detalle.trim() : '');
      mostrarToast('Reporte enviado. Nuestro equipo lo revisará.', 'exito');
      alTerminar();
    }, 450);
  };

  return (
    <Pantalla
      pie={
        reportadoEl ? undefined : (
          <Boton titulo="Enviar reporte" variante="oscuro" icono={Flag} deshabilitado={!motivo} cargando={enviando} onPress={enviar} />
        )
      }>
      <Encabezado volverA={volverA as Href} />
      <View style={{ gap: 6, paddingHorizontal: 4 }}>
        <Titulo>Reportar {quien}</Titulo>
        <Text style={[tipo.parrafo, { color: color.textoSecundario }]}>{nombreReportado}</Text>
      </View>

      {reportadoEl ? (
        <Aviso
          icono={Flag}
          tono="exito"
          titulo={`Ya reportaste a este ${quien}`}
          texto={`El ${fechaConMes(reportadoEl)}. Nuestro equipo lo está revisando.`}
        />
      ) : (
        <View role="radiogroup" aria-label="Motivo del reporte" style={{ gap: 8 }}>
          <Text style={[tipo.etiqueta, { color: color.texto }]}>¿Qué pasó? *</Text>
          {motivos.map((x) => (
            <OpcionMotivo key={x.id} titulo={x.nombre} marcada={motivo === x.id} onPress={() => setMotivo(x.id)} />
          ))}
          {motivo === 'otro' ? (
            <Campo
              etiqueta="Cuéntanos qué pasó"
              notaEtiqueta="(opcional)"
              valor={detalle}
              onCambiar={setDetalle}
              placeholder="Escribe aquí"
              multilinea
              maxLength={300}
              contador
              style={{ marginTop: 6 }}
            />
          ) : null}
        </View>
      )}
    </Pantalla>
  );
}

/** El conductor de la demo reporta al titular de un match. */
export default function Reportar() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = idParam ?? '';
  const m = useMatchDelUsuario(id);
  const reportar = useDemo((s) => s.reportarTitular);
  const anterior = useDemo((s) =>
    s.reportes.find((r) => r.busquedaId === id && r.quienReporta.id === ID_USUARIO && r.estado === 'abierto'),
  );
  const volverA = `/conductor/matches/${id}`;

  return (
    <FormularioReporte
      nombreReportado={m ? nombreTitular(m.titular) : 'Titular'}
      rolReportado="titular"
      volverA={volverA}
      reportadoEl={anterior?.reportadoEl ?? null}
      alEnviar={(motivo, detalle) => reportar({ busquedaId: id, motivo, detalle: detalle || undefined })}
      alTerminar={() => volver({ pathname: '/conductor/matches/[id]', params: { id } })}
    />
  );
}

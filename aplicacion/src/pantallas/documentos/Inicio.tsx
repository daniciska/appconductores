// B6 · C3 · C5 · C6 · Inicio del conductor
// Ruta: /conductor/inicio
// Maqueta: docs/maqueta/CondInicioIncompleto.dc.html, CondInicioRevision.dc.html, CondInicioActivo.dc.html, CondSinMatches.dc.html
// Refleja el estado en vivo: cuando el equipo (simulado en la demo) aprueba un documento, o cambia "Disponible", la pantalla cambia.
import { Text, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { iniciales, plural } from '@/datos/formato';
import {
  useAvancePerfil,
  useDerivado,
  useEstadoInicio,
  useMatchesDelUsuario,
  useMensajesNoLeidos,
  useResumenDocumentos,
} from '@/datos/hooks';
import { useRevisionManual } from '@/datos/revisionManual';
import { TIPOS_DOC_ORDEN, debeReconfirmarDisponibilidad, nombreTitular, primerNombre } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { DocumentoUsuario } from '@/datos/tipos';
import { Boton, Pantalla, Presionable, Separado, Texto, color, fuente, mostrarToast, radio, tipo, type LucideIcon, type PropsInsignia } from '@/ui';
import {
  Bell,
  CarFront,
  Check,
  ChevronRight,
  CircleCheck,
  Clock,
  FileText,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from '@/ui/iconos';
import Pause from 'lucide-react-native/icons/pause';

import { irAPestana } from './acciones';
import {
  BarraAvance,
  Caja,
  CuadroIcono,
  GRIS_SOBRE_OSCURO,
  Nota,
  Saludo,
  TarjetaDisponible,
  TarjetaOscura,
} from './piezas';
import { RUTA_PASO, rutaNoAprobado, rutaSubir } from './rutas';
import { estadoDocumento, type TonoEstado } from './textos';

const NOMBRE_SECCION: Record<string, string> = {
  datos: 'Tus datos y licencia',
  direccion: 'Dónde vives',
  experiencia: 'Tu experiencia',
  trabajo: 'Qué trabajo buscas',
  documentos: 'Tus documentos',
};

const ESTILO_ESTADO: Record<TonoEstado, { fondo: string; tinta: string; icono: LucideIcon }> = {
  exito: { fondo: color.exitoFondo, tinta: color.exitoTexto, icono: Check },
  error: { fondo: color.errorFondo, tinta: color.error, icono: X },
  amarillo: { fondo: color.amarilloFondo, tinta: color.amarilloTexto, icono: Clock },
  gris: { fondo: color.fondo, tinta: color.textoSecundario, icono: FileText },
};

// ---------------------------------------------------------------------------
// Comunes
// ---------------------------------------------------------------------------

function useCambiarDisponible() {
  const cambiarDisponible = useDemo((s) => s.cambiarDisponible);
  return (v: boolean) => {
    cambiarDisponible(v);
    mostrarToast(v ? 'Estás disponible para trabajar.' : 'Quedaste en pausa: no apareces en los matches.', v ? 'exito' : 'info');
  };
}

function Disponible() {
  const disponible = useDemo((s) => s.conductor.disponible);
  const dias = useDemo((s) => s.ajustes.diasReconfirmar);
  const cambiar = useCambiarDisponible();
  return <TarjetaDisponible valor={disponible} onCambiar={cambiar} diasReconfirmar={dias} />;
}

/** Aviso para reconfirmar la disponibilidad cuando pasaron los días configurados. */
function AvisoReconfirmar() {
  const toca = useDerivado((s) => s.conductor.disponible && debeReconfirmarDisponibilidad(s));
  if (!toca) return null;
  return (
    <Presionable
      role="button"
      aria-label="¿Sigues buscando trabajo? Confirmar"
      href="/conductor/disponibilidad"
      style={{
        backgroundColor: color.acentoSuave,
        borderWidth: 1,
        borderColor: color.acentoBorde,
        borderRadius: radio.tarjeta,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <CuadroIcono icono={Bell} fondo={color.superficie} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[tipo.fuerte, { color: color.texto }]}>¿Sigues buscando trabajo?</Text>
        <Texto variante="ayuda" tono="suave">
          Confírmalo para seguir en los matches.
        </Texto>
      </View>
      <ChevronRight size={18} color={color.texto} strokeWidth={2} />
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// B6 · Perfil incompleto
// ---------------------------------------------------------------------------

function VistaIncompleta() {
  const avance = useAvancePerfil();
  const registrado = useDemo((s) => s.conductor.registrado);
  const pasos = useDemo((s) => s.conductor.pasosListos);
  const docs = useResumenDocumentos();
  const siguiente = avance.siguientePaso ?? 5;

  const filas = (['datos', 'direccion', 'experiencia', 'trabajo', 'documentos'] as const).map((id, i) => {
    const listo = pasos[id];
    const estado = listo
      ? id === 'documentos'
        ? 'Enviados'
        : 'Listo'
      : id === 'documentos'
        ? `${4 - docs.faltan} de 4 subidos`
        : 'Falta';
    return { id, paso: i + 1, nombre: NOMBRE_SECCION[id], listo, estado };
  });

  return (
    <>
      <TarjetaOscura>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.2, color: color.blanco }}>
            {registrado ? 'Ya estás registrado' : 'Aún no te registras'}
          </Text>
          <Text style={[tipo.secundario, { lineHeight: 21, color: GRIS_SOBRE_OSCURO }]}>
            {registrado
              ? 'Completa tu perfil para empezar a aparecer en los matches.'
              : 'Crea tu perfil para empezar a aparecer en los matches.'}
          </Text>
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[tipo.ayuda, { color: GRIS_SOBRE_OSCURO }]}>
              {avance.listos} de {avance.total} pasos listos
            </Text>
            <Text style={[tipo.ayuda, { color: GRIS_SOBRE_OSCURO }]}>{avance.porcentaje}%</Text>
          </View>
          <BarraAvance
            valor={avance.listos / avance.total}
            etiqueta="Avance del perfil"
            maximo={avance.total}
            actual={avance.listos}
          />
        </View>
        <Boton
          titulo={registrado ? 'Continuar mi perfil' : 'Crear mi perfil'}
          variante="principal"
          href={registrado ? RUTA_PASO[siguiente] : '/conductor/bienvenida'}
        />
      </TarjetaOscura>

      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingVertical: 6, paddingHorizontal: 16 }}>
        <Separado>
          {filas.map((f) => {
            const contenido = (
              <>
                {f.listo ? (
                  <View aria-hidden style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color.exitoFondo, alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={15} color={color.exito} strokeWidth={2.8} />
                  </View>
                ) : (
                  <View aria-hidden style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.interruptorApagado }} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{f.nombre}</Text>
                  <Text style={[tipo.ayuda, f.listo ? [fuente(600), { color: color.exitoTexto }] : { color: color.textoSecundario }]}>
                    {f.estado}
                  </Text>
                </View>
                {f.listo ? null : <ChevronRight size={18} color={color.texto} strokeWidth={2} />}
              </>
            );
            const estilo = { minHeight: 56, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 6 };
            return f.listo || !registrado ? (
              <View key={f.id} style={estilo}>
                {contenido}
              </View>
            ) : (
              <Presionable key={f.id} role="button" aria-label={`${f.nombre}: ${f.estado}`} href={RUTA_PASO[f.paso]} style={estilo}>
                {contenido}
              </Presionable>
            );
          })}
        </Separado>
      </View>

      <Nota icono={Bell} tono="suave">
        Te recordaremos por WhatsApp o correo para que termines tu perfil. Mientras esté incompleto, no apareces en los matches.
      </Nota>
    </>
  );
}

// ---------------------------------------------------------------------------
// C3 · En revisión (o con observaciones)
// ---------------------------------------------------------------------------

function FilaVerificacion({ doc, nombre }: { doc: DocumentoUsuario; nombre: string }) {
  const est = estadoDocumento(doc);
  const e = ESTILO_ESTADO[est.tono];
  const Icono = doc.estado === 'subido' ? Upload : e.icono;
  const destino = doc.estado === 'rechazado' ? rutaNoAprobado(doc.tipo) : doc.estado === 'falta' || doc.estado === 'subido' ? rutaSubir(doc.tipo) : null;
  const texto = doc.estado === 'rechazado' ? `${est.texto} · Ver motivo` : est.texto;
  const contenido = (
    <>
      <CuadroIcono icono={Icono} fondo={e.fondo} colorIcono={est.tono === 'exito' ? color.exito : e.tinta} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{nombre}</Text>
        <Text style={[tipo.ayuda, fuente(600), { color: e.tinta }]}>{texto}</Text>
      </View>
      {destino ? <ChevronRight size={18} color={color.texto} strokeWidth={2} /> : null}
    </>
  );
  // Como en la maqueta C3: filas de 40 px (el ícono) con 10 px arriba y abajo de cada línea.
  // Las que se tocan tienen zona táctil de 44 px sin ocupar más espacio.
  const estilo = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, minHeight: 40 };
  if (!destino) return <View style={estilo}>{contenido}</View>;
  return (
    <Presionable role="button" aria-label={`${nombre}: ${texto}`} href={destino} style={[estilo, { minHeight: 44, marginVertical: -2 }]}>
      {contenido}
    </Presionable>
  );
}

function VistaRevision() {
  const documentos = useDemo((s) => s.documentos);
  const tipos = useDemo((s) => s.catalogos.tiposDocumento);
  const resumen = useResumenDocumentos();
  const aprobarPendientesDemo = useDemo((s) => s.aprobarPendientesDemo);
  // Si una persona del equipo revisa a mano en este navegador, los documentos esperan su decisión.
  const revisionManual = useRevisionManual();
  const enRevision = TIPOS_DOC_ORDEN.some((t) => documentos[t].estado === 'en_revision');

  // Como en la maqueta C3: el título no cambia aunque haya un documento no aprobado (eso se ve en su fila).
  const titulo = 'Tu perfil está en revisión';

  return (
    <>
      <TarjetaOscura style={{ paddingTop: 18, gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Text style={[fuente(700), { fontSize: 17, lineHeight: 22, color: color.blanco }]}>{titulo}</Text>
          <Text style={[tipo.secundario, { color: GRIS_SOBRE_OSCURO }]}>
            {resumen.aprobados} de {resumen.total} documentos aprobados
          </Text>
        </View>
        <BarraAvance
          valor={resumen.aprobados / resumen.total}
          etiqueta="Documentos aprobados"
          maximo={resumen.total}
          actual={resumen.aprobados}
        />
      </TarjetaOscura>

      <Caja padding={16} gap={10} style={{ paddingHorizontal: 18 }}>
        <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 16, lineHeight: 22, color: color.texto }]}>
          Verificación
        </Text>
        <Separado>
          {TIPOS_DOC_ORDEN.map((t) => (
            <FilaVerificacion key={t} doc={documentos[t]} nombre={tipos.find((x) => x.id === t)?.nombre ?? t} />
          ))}
        </Separado>
      </Caja>

      <Disponible />
      <AvisoReconfirmar />

      <View
        style={{
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: color.bordeCampo,
          borderRadius: radio.tarjeta,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <CircleCheck size={20} color={color.textoSecundario} strokeWidth={2} />
        <Text style={[tipo.secundario, { flex: 1, lineHeight: 20, color: color.textoSecundario }]}>
          Cuando tus documentos estén aprobados, aquí verás tus matches.
        </Text>
      </View>

      {enRevision ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
          <Sparkles size={14} color={color.textoSecundario} strokeWidth={2} />
          <Text style={[tipo.pequeno, { flex: 1, color: color.textoSecundario }]}>
            {revisionManual ? 'Demo: esperando la revisión del equipo.' : 'Demo: el equipo los aprueba en unos segundos.'}
          </Text>
          <Presionable
            role="button"
            aria-label="Aprobar ahora (atajo de la demo)"
            onPress={aprobarPendientesDemo}
            style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }}>
            <Text style={[fuente(700), { fontSize: 13, color: color.texto, textDecorationLine: 'underline' }]}>Aprobar ahora</Text>
          </Presionable>
        </View>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// C5 · Verificado con matches
// ---------------------------------------------------------------------------

function VistaActiva() {
  const navigation = useNavigation();
  const matches = useMatchesDelUsuario();
  const noLeidos = useMensajesNoLeidos();
  const ultimos = [...matches]
    .sort((a, b) => (b.busqueda.publicadaEl ?? '').localeCompare(a.busqueda.publicadaEl ?? ''))
    .slice(0, 3);
  const n = matches.length;

  return (
    <>
      <TarjetaOscura style={{ paddingTop: 22, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 48, lineHeight: 48, color: color.acento }}>{n}</Text>
            <Text style={[fuente(600), { fontSize: 17, lineHeight: 22, color: color.blanco, flexShrink: 1 }]}>
              {n === 1 ? 'match con un titular' : 'matches con titulares'}
            </Text>
          </View>
          {noLeidos > 0 ? (
            <Presionable
              role="button"
              aria-label={`${plural(noLeidos, 'mensaje nuevo', 'mensajes nuevos')}. Ver mensajes`}
              onPress={() => irAPestana(navigation, 'mensajes')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', minHeight: 28, marginVertical: -4 }}>
              <View aria-hidden style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.acento }} />
              <Text style={[tipo.secundario, { color: GRIS_SOBRE_OSCURO }]}>{plural(noLeidos, 'mensaje nuevo', 'mensajes nuevos')}</Text>
            </Presionable>
          ) : (
            <Text style={[tipo.secundario, { color: GRIS_SOBRE_OSCURO, minHeight: 20, lineHeight: 20 }]}>Sin mensajes nuevos</Text>
          )}
        </View>
        <Boton titulo="Ver mis matches" variante="principal" iconoDerecha={ChevronRight} onPress={() => irAPestana(navigation, 'matches')} />
      </TarjetaOscura>

      <Disponible />
      <AvisoReconfirmar />

      <View style={{ gap: 10 }}>
        <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 17, lineHeight: 22, color: color.texto, paddingHorizontal: 4 }]}>
          Últimos matches
        </Text>
        <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingVertical: 4, paddingHorizontal: 16 }}>
          <Separado>
            {ultimos.map((m) => {
              const sub = `${nombreTitular(m.titular)} · ${m.comuna?.nombre ?? ''}`;
              return (
                <Presionable
                  key={m.id}
                  role="button"
                  aria-label={`${m.negocio.nombre}, ${sub}`}
                  onPress={() => router.push({ pathname: '/conductor/matches/[id]', params: { id: m.id } })}
                  style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                  <CuadroIcono icono={CarFront} />
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{m.negocio.nombre}</Text>
                    <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{sub}</Text>
                  </View>
                  <ChevronRight size={18} color={color.texto} strokeWidth={2} />
                </Presionable>
              );
            })}
          </Separado>
        </View>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// C6 · Verificado sin matches
// ---------------------------------------------------------------------------

function VistaSinMatches() {
  // Como en la maqueta C6: una sola sugerencia.
  const consejos: { icono: LucideIcon; texto: string; paso: number }[] = [{ icono: SlidersHorizontal, texto: 'Revisa tus turnos y días', paso: 4 }];

  return (
    <>
      <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 20 }}>
        <View aria-hidden style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: color.superficieHundida, alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={28} color={color.texto} strokeWidth={2} />
        </View>
        <View style={{ gap: 8 }}>
          <Text role="heading" aria-level={2} style={{ fontFamily: 'Sora_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.4, color: color.texto, textAlign: 'center' }}>
            Aún no tienes matches
          </Text>
          <Texto variante="parrafo" tono="secundario" centrado>
            Te avisaremos apenas un titular busque a alguien como tú.
          </Texto>
        </View>
      </View>
      <AvisoReconfirmar />
      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 16, lineHeight: 22, color: color.texto, paddingHorizontal: 2, paddingBottom: 4 }]}>
          Para tener más matches
        </Text>
        <Separado>
          {consejos.map((c) => (
            <Presionable
              key={c.texto}
              role="button"
              aria-label={c.texto}
              href={RUTA_PASO[c.paso]}
              style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CuadroIcono icono={c.icono} />
              <Text style={[tipo.cuerpo, fuente(600), { flex: 1, color: color.texto }]}>{c.texto}</Text>
              <ChevronRight size={18} color={color.texto} strokeWidth={2} />
            </Presionable>
          ))}
        </Separado>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Verificado, pero en pausa ("Disponible para trabajar" apagado)
// ---------------------------------------------------------------------------

function VistaPausada() {
  const cambiar = useCambiarDisponible();
  return (
    <>
      <TarjetaOscura>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <CuadroIcono icono={Pause} fondo="#2A2A2A" colorIcono={color.acento} />
          <Text style={{ flex: 1, fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.2, color: color.blanco }}>
            Estás en pausa
          </Text>
        </View>
        <Text style={[tipo.secundario, { lineHeight: 21, color: GRIS_SOBRE_OSCURO }]}>
          Los titulares no te ven en sus matches. Tus conversaciones siguen abiertas.
        </Text>
        <Boton titulo="Volver a estar disponible" variante="principal" onPress={() => cambiar(true)} />
      </TarjetaOscura>
      <Nota icono={Bell} tono="suave">
        Cuando vuelvas, aparecerás de nuevo en los matches que calcen contigo.
      </Nota>
    </>
  );
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

export default function Inicio() {
  const navigation = useNavigation();
  const estado = useEstadoInicio();
  const disponible = useDemo((s) => s.conductor.disponible);
  const nombre = useDerivado(primerNombre);
  const apellido = useDemo((s) => s.cuenta.apellido1);

  const verificado = estado === 'verificado' || estado === 'sin_matches';
  const vista = verificado && !disponible ? 'pausado' : estado;

  const insignia: PropsInsignia | undefined =
    vista === 'incompleto'
      ? { texto: 'Perfil incompleto', tono: 'amarilla', icono: Clock }
      : vista === 'en_revision' || vista === 'con_observaciones'
        ? undefined
        : { texto: 'Perfil verificado', tono: 'verde' };

  return (
    <Pantalla inferior={24}>
      <Saludo
        nombre={nombre}
        iniciales={iniciales(`${nombre} ${apellido}`.trim())}
        insignia={insignia}
        onAvatar={() => irAPestana(navigation, 'perfil')}
      />
      {vista === 'incompleto' ? <VistaIncompleta /> : null}
      {vista === 'en_revision' || vista === 'con_observaciones' ? <VistaRevision /> : null}
      {vista === 'verificado' ? <VistaActiva /> : null}
      {vista === 'sin_matches' ? <VistaSinMatches /> : null}
      {vista === 'pausado' ? <VistaPausada /> : null}
    </Pantalla>
  );
}

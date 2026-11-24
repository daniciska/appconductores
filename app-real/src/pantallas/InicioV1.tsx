// Inicio del conductor (app real). Muestra el estado real del perfil:
//   - Perfil incompleto (faltan pasos o documentos): la vista común con la demo
//     (aplicacion/src/pantallas/documentos/VistaIncompleta.tsx), con la fila de documentos al Paso 5 y su
//     estado ("2 de 4 aprobados", "En revisión", "Revisa un documento").
//   - Perfil completo (pasos 1 a 4 y los 4 documentos aprobados; lo calcula la base): "Perfil
//     verificado", "Disponible para trabajar", "¿Sigues buscando trabajo?" cuando toca, y "Aún no tienes
//     matches" (maqueta C6), sin prometer avisos. En pausa, la tarjeta "Estás en pausa".
//   - Pasos listos y los 4 documentos subidos, pero alguno vencido o no aprobado: "No apareces en los
//     matches" con el botón para subirlo de nuevo (sin repetir arriba el aviso del mismo documento).
//   - Pasos listos y los 4 documentos subidos, alguno esperando revisión (si el método de validación no
//     los aprueba al tiro): "Tus documentos están en revisión"; no le falta nada, solo esperar.
//   - Arriba, el aviso de un documento que vence pronto o venció (desde 3 meses antes).
import { View } from 'react-native';
import { Text, useMedidas } from '@/ui/escala';
import { useNavigation } from 'expo-router';

import { iniciales } from '@/datos/formato';
import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
import { CuadroIcono, GRIS_SOBRE_OSCURO, Saludo, TarjetaDisponible, TarjetaOscura } from '@/pantallas/documentos/piezas';
import { VistaIncompleta } from '@/pantallas/documentos/VistaIncompleta';
import { Boton, Insignia, Pantalla, Presionable, Texto, color, fuente, mostrarToast, radio, tipo, type PropsInsignia } from '@/ui';
import { Bell, ChevronRight, Clock } from '@/ui/iconos';
import { Hoja } from '@/ui/iconosPropios';
import Pause from 'lucide-react-native/icons/pause';

import { documentosEsperandoRevision, textoDocumentosPorRenovar, tituloBotonSubir } from '@real/datos/documentos';

import { AvisosVencimiento, insigniaAviso, rutaSubir, useDocumentos } from './documentos/comunes';

type Navegacion = { dispatch: (accion: { type: string; payload?: Record<string, unknown> }) => void };

const DIA_MS = 24 * 60 * 60 * 1000;

/** Pasaron los días configurados desde la última vez que confirmó "Disponible para trabajar". */
export function tocaReconfirmar(disponible: boolean, confirmadaEn: string | null, dias: number, ahora = Date.now()): boolean {
  if (!disponible || !confirmadaEn) return false;
  return ahora - new Date(confirmadaEn).getTime() >= dias * DIA_MS;
}

function useCambiarDisponible() {
  const acciones = useAcciones();
  return async (v: boolean) => {
    const r = await acciones.cambiarDisponible(v);
    if (!r.ok) {
      mostrarToast(r.error, 'error');
      return;
    }
    mostrarToast(v ? 'Estás disponible para trabajar.' : 'Quedaste en pausa: no apareces en los matches.', v ? 'exito' : 'info');
  };
}

function AvisoReconfirmar() {
  const m = useMedidas();
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
      <ChevronRight size={m.icono(18)} color={color.texto} strokeWidth={2} />
    </Presionable>
  );
}

function VistaCompleta() {
  const m = useMedidas();
  const disponible = useVista((v) => v.conductor.disponible);
  const confirmadaEn = useVista((v) => v.conductor.disponibilidadConfirmadaEn);
  const { diasReconfirmar } = useEntorno();
  const cambiar = useCambiarDisponible();

  if (!disponible) {
    return (
      <TarjetaOscura>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <CuadroIcono icono={Pause} fondo="#2A2A2A" colorIcono={color.acento} />
          <Text style={{ flex: 1, fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.2, color: color.blanco }}>Estás en pausa</Text>
        </View>
        <Text style={[tipo.secundario, { lineHeight: 21, color: GRIS_SOBRE_OSCURO }]}>Los titulares no te ven en sus matches.</Text>
        <Boton titulo="Volver a estar disponible" variante="principal" onPress={() => void cambiar(true)} />
      </TarjetaOscura>
    );
  }

  return (
    <>
      <TarjetaDisponible valor={disponible} onCambiar={(v) => void cambiar(v)} diasReconfirmar={diasReconfirmar} />
      {tocaReconfirmar(disponible, confirmadaEn, diasReconfirmar) ? <AvisoReconfirmar /> : null}

      <View style={{ alignItems: 'center', gap: 16, paddingVertical: 20, paddingHorizontal: 20 }}>
        <View aria-hidden style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: color.superficieHundida, alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={m.icono(28)} color={color.texto} strokeWidth={2} />
        </View>
        <View style={{ gap: 8 }}>
          <Text role="heading" aria-level={2} style={{ fontFamily: 'Sora_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.4, color: color.texto, textAlign: 'center' }}>
            Aún no tienes matches
          </Text>
          <Texto variante="parrafo" tono="secundario" centrado>
            Cuando un titular busque a alguien como tú, aparecerá aquí.
          </Texto>
        </View>
      </View>

      <FilaMisDocumentos />
    </>
  );
}

/** Fila "Mis documentos" (con la insignia del aviso más próximo, salvo que la tarjeta de arriba ya lo diga). */
function FilaMisDocumentos({ conAviso = true }: { conAviso?: boolean }) {
  const m = useMedidas();
  const docs = useDocumentos();
  const aviso = conAviso ? insigniaAviso(docs) : null;
  return (
    <Presionable
      role="button"
      aria-label={`Mis documentos: ${docs.listos} de ${docs.total} aprobados`}
      href="/conductor/perfil/documentos"
      style={{
        backgroundColor: color.superficie,
        borderWidth: 1,
        borderColor: color.borde,
        borderRadius: radio.tarjeta,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <CuadroIcono icono={Hoja} />
      <View style={{ flex: 1, minWidth: 0, gap: 2, alignItems: 'flex-start' }}>
        <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>Mis documentos</Text>
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
          {docs.listos} de {docs.total} aprobados
        </Text>
        {aviso ? <Insignia {...aviso} style={{ marginTop: 4 }} /> : null}
      </View>
      <ChevronRight size={m.icono(18)} color={color.texto} strokeWidth={2} />
    </Presionable>
  );
}

/**
 * Pasos listos y documentos subidos, pero uno venció o no se aprobó (por ejemplo, a un conductor
 * verificado se le venció la licencia): no es alguien que recién se registra. Se le dice que dejó de
 * aparecer en los matches y se lo lleva directo a subirlo de nuevo.
 */
function VistaPorRenovar({ texto, tipoClave, corto }: { texto: string; tipoClave: string | null; corto: string | null }) {
  return (
    <>
      <TarjetaOscura>
        <Text role="heading" aria-level={2} style={{ fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.2, color: color.blanco }}>
          No apareces en los matches
        </Text>
        <Text style={[tipo.secundario, { lineHeight: 21, color: GRIS_SOBRE_OSCURO }]}>{texto}</Text>
        {tipoClave && corto ? (
          <Boton titulo={tituloBotonSubir(corto)} variante="principal" href={rutaSubir(tipoClave)} />
        ) : (
          <Boton titulo="Ver mis documentos" variante="principal" href="/conductor/perfil/documentos" />
        )}
      </TarjetaOscura>
      <FilaMisDocumentos conAviso={false} />
    </>
  );
}

/** Pasos listos y documentos subidos, alguno esperando revisión: no le falta nada, solo esperar. */
function VistaEnRevision() {
  return (
    <>
      <TarjetaOscura>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <CuadroIcono icono={Clock} fondo="#2A2A2A" colorIcono={color.acento} />
          <Text role="heading" aria-level={2} style={{ flex: 1, fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.2, color: color.blanco }}>
            Tus documentos están en revisión
          </Text>
        </View>
        <Text style={[tipo.secundario, { lineHeight: 21, color: GRIS_SOBRE_OSCURO }]}>Cuando estén aprobados, empiezas a aparecer en los matches.</Text>
      </TarjetaOscura>
      <FilaMisDocumentos />
    </>
  );
}

export default function InicioV1() {
  const navigation = useNavigation() as unknown as Navegacion;
  const nombres = useVista((v) => v.cuenta.nombres);
  const apellido = useVista((v) => v.cuenta.apellido1);
  const conductor = useVista((v) => v.conductor);
  const docs = useDocumentos();
  const nombre = nombres.trim().split(/\s+/)[0] || 'Conductor';

  const completo = conductor.registrado && conductor.estadoPerfil === 'completo' && docs.completos;
  const pasos1a4 =
    conductor.pasosListos.datos && conductor.pasosListos.direccion && conductor.pasosListos.experiencia && conductor.pasosListos.trabajo;
  const revisar = docs.tipos.some((v) => v.estado === 'no_aprobado' || v.estado === 'vencido');
  const enRevision = docs.tipos.some((v) => v.estado === 'en_revision');
  const insignia: PropsInsignia = completo
    ? { texto: 'Perfil verificado', tono: 'verde' }
    : pasos1a4 && revisar
      ? { texto: 'Revisa un documento', tono: 'roja', icono: null }
      : pasos1a4 && enRevision && docs.subidos === docs.total
        ? { texto: 'En revisión', tono: 'amarilla', icono: Clock }
        : { texto: 'Perfil incompleto', tono: 'amarilla', icono: Clock };
  const porRenovar = pasos1a4 && !completo ? textoDocumentosPorRenovar(docs) : null;
  const esperando = pasos1a4 && !completo && !porRenovar && documentosEsperandoRevision(docs);
  // La tarjeta "No apareces en los matches" ya lleva a subir esos documentos: su aviso no se repite arriba.
  const avisos = porRenovar ? docs.avisos.filter((v) => !porRenovar.tipos.some((t) => t.id === v.tipo.id)) : docs.avisos;
  const estadoDocs = revisar ? 'Revisa un documento' : enRevision ? 'En revisión' : `${docs.listos} de ${docs.total} aprobados`;

  return (
    <Pantalla inferior={24}>
      <Saludo
        nombre={nombre}
        iniciales={iniciales(`${nombre} ${apellido}`.trim())}
        insignia={insignia}
        onAvatar={() => navigation.dispatch({ type: 'NAVIGATE', payload: { name: 'perfil' } })}
      />
      <AvisosVencimiento avisos={avisos} />
      {completo ? (
        <VistaCompleta />
      ) : porRenovar ? (
        <VistaPorRenovar texto={porRenovar.texto} tipoClave={porRenovar.tipo?.clave ?? null} corto={porRenovar.tipo?.corto ?? null} />
      ) : esperando ? (
        <VistaEnRevision />
      ) : (
        // S09: sin la nota de la campana (ya lo dicen la insignia y la tarjeta).
        <VistaIncompleta
          documentos={{ modo: 'activo', subidos: docs.subidos, ruta: '/conductor/registro/5', textoEstado: estadoDocs, textoListo: 'Aprobados' }}
        />
      )}
    </Pantalla>
  );
}

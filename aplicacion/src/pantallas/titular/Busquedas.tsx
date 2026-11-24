// Titular · Mis búsquedas (pestaña de inicio del titular)
// Ruta: /titular/busquedas
// Cada búsqueda muestra cuántos conductores hacen match. Sin plan, el adelanto anónimo invita a elegir un
// plan; con plan, al tocar la búsqueda se ven los matches y sus contactos.
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { plural } from '@/datos/formato';
import { useBusquedasDelTitular, useDerivado, usePlanDemo, useTitularDemo } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import type { BusquedaTitular } from '@/datos/selectores';
import { TEXTO_CUENTA_SUSPENDIDA, limiteBusquedasActivas, useDemo } from '@/datos/tienda';
import type { PlanTitular } from '@/datos/tipos';
import { Aviso, Boton, Chip, EstadoVacio, Insignia, Pantalla, Presionable, Tarjeta, Titulo, color, fuente, mostrarToast, radio, tipo } from '@/ui';
import { ChevronRight, Clock, Lock, Plus, Search, Sparkles, Users } from '@/ui/iconos';

import { textoCambioPlan } from '../bolsa/datos';
import { Aparecer, InsigniaBolsa, Rotulo } from '../bolsa/piezas';
import { ConRegistro } from './piezas';

const OPCIONES_PLAN: { clave: PlanTitular; etiqueta: string }[] = [
  { clave: 'sin_plan', etiqueta: 'Sin plan' },
  { clave: 'basico', etiqueta: 'Básico' },
  { clave: 'flota_chica', etiqueta: 'Flota chica' },
  { clave: 'flota', etiqueta: 'Flota' },
];

const ESTADO_BUSQUEDA = {
  activa: { texto: 'Activa', tono: 'verde' as const },
  pausada: { texto: 'Pausada', tono: 'gris' as const },
  cubierta: { texto: 'Cubierta', tono: 'gris' as const },
};

function TarjetaBusqueda({ b, conPlan, bolsaActiva }: { b: BusquedaTitular; conPlan: boolean; bolsaActiva: boolean }) {
  const estado = ESTADO_BUSQUEDA[b.busqueda.estado];
  const activa = b.busqueda.estado === 'activa';
  return (
    <Tarjeta
      padding={16}
      separacion={10}
      etiquetaAccesible={`${b.negocio.nombre}. ${b.condiciones}. ${activa ? `${b.coinciden} hacen match` : estado.texto}`}
      onPress={() => router.push({ pathname: '/titular/busqueda/[id]', params: { id: b.busqueda.id } })}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto }]}>
            {b.negocio.nombre}
          </Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{b.condiciones}</Text>
        </View>
        <Insignia texto={estado.texto} tono={estado.tono} icono={null} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {activa ? (
          <>
            {conPlan ? <Users size={16} color={color.textoSuave} strokeWidth={2} /> : <Lock size={16} color={color.textoSuave} strokeWidth={2} />}
            <Text style={[tipo.ayuda, { color: color.textoSuave, flex: 1 }]}>
              <Text style={fuente(700)}>{plural(b.coinciden, 'conductor', 'conductores')}</Text>
              {b.coinciden === 1 ? ' hace match' : ' hacen match'}
              {!conPlan && b.coinciden > 0 ? ' · elige un plan para verlos' : ''}
            </Text>
          </>
        ) : (
          <Text style={[tipo.ayuda, { color: color.textoSecundario, flex: 1 }]}>
            {b.busqueda.estado === 'pausada' ? 'En pausa: no aparece en los matches.' : 'Ya tiene conductor.'}
          </Text>
        )}
        <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} />
      </View>
      {bolsaActiva && (b.busqueda.enBolsa || b.postulantes > 0) ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <InsigniaBolsa enBolsa={b.busqueda.enBolsa} pausada={!activa} />
          {b.postulantes > 0 ? (
            <Insignia
              texto={b.postulantesNuevos > 0 ? `${plural(b.postulantes, 'postulante', 'postulantes')} · ${b.postulantesNuevos} ${b.postulantesNuevos === 1 ? 'nuevo' : 'nuevos'}` : plural(b.postulantes, 'postulante', 'postulantes')}
              tono={b.postulantesNuevos > 0 ? 'amarilla' : 'gris'}
              icono={null}
            />
          ) : null}
        </View>
      ) : null}
    </Tarjeta>
  );
}

function Contenido() {
  const titular = useTitularDemo();
  const plan = usePlanDemo();
  const planId = useDemo((s) => s.titularDemo.plan);
  const cedula = useDemo((s) => s.titularDemo.registro.cedula.estado);
  const cambiarPlan = useDemo((s) => s.cambiarPlanTitular);
  const bolsaActiva = useDemo((s) => s.ajustes.bolsaActiva);
  const busquedas = useBusquedasDelTitular();
  const activas = useDerivado(sel.busquedasActivasDelTitular);
  const limite = useDerivado(limiteBusquedasActivas);
  const totalMatches = busquedas.filter((b) => b.busqueda.estado === 'activa').reduce((n, b) => n + b.coinciden, 0);

  const elegirPlan = (p: PlanTitular) => {
    if (p === planId) return;
    const cambios = cambiarPlan(p);
    const nombre = OPCIONES_PLAN.find((o) => o.clave === p)?.etiqueta ?? '';
    mostrarToast(textoCambioPlan(p === 'sin_plan' ? 'Ahora estás sin plan' : `Plan de la demo: ${nombre}`, cambios), cambios.length ? 'info' : 'exito', cambios.length ? 5500 : undefined);
  };

  return (
    <Pantalla inferior={24}>
      <View style={{ gap: 6, paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Titulo style={{ flex: 1 }}>Mis búsquedas</Titulo>
          <Presionable
            role="button"
            aria-label={`Tu plan: ${plan?.nombre ?? 'Sin plan'}. Ver planes`}
            onPress={() => router.push('/titular/planes')}
            style={{ minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' }}>
            <View style={{ minHeight: 32, paddingHorizontal: 10, borderRadius: radio.insignia, backgroundColor: plan ? color.oscuro : color.superficieHundida, justifyContent: 'center' }}>
              <Text style={[fuente(700), { fontSize: 12, lineHeight: 16, color: plan ? color.blanco : color.textoSecundario }]}>{plan?.nombre ?? 'Sin plan'}</Text>
            </View>
          </Presionable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 6 }}>
          <Text style={[tipo.parrafo, { color: color.textoSecundario }]}>{sel.nombreTitular(titular)}</Text>
          {titular.revisado ? <Insignia texto={sel.insigniaTitular(titular)} tono="verde" /> : null}
        </View>
      </View>

      {titular.suspendido ? <Aviso tono="error" icono="alerta" texto={TEXTO_CUENTA_SUSPENDIDA} /> : null}
      {!titular.revisado ? (
        <Aviso
          icono={cedula === 'en_revision' ? Clock : 'info'}
          texto={
            cedula === 'en_revision'
              ? titular.tipo === 'empresa'
                ? 'Estamos revisando tu cédula y tu empresa. Te avisaremos.'
                : 'Estamos revisando tu cédula. Te avisaremos.'
              : 'Verifica tu cuenta para que los conductores confíen en tus búsquedas.'
          }
          accion={
            cedula === 'en_revision' ? undefined : (
              <Boton titulo="Verificar" variante="oscuro" tamano="mediano" onPress={() => router.push('/titular/verificacion')} />
            )
          }
        />
      ) : null}

      {busquedas.length > 0 ? (
        <Tarjeta padding={0} separacion={0} style={{ flexDirection: 'row' }}>
          {[
            { etiqueta: 'Activas', valor: `${activas} de ${limite}` },
            { etiqueta: 'Matches', valor: `${totalMatches}` },
          ].map((m, i) => (
            <View key={m.etiqueta} style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 2, borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: color.separador }}>
              <Text style={[tipo.pequeno, { color: color.textoSecundario }]}>{m.etiqueta}</Text>
              <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 18, lineHeight: 24, color: color.texto }}>{m.valor}</Text>
            </View>
          ))}
        </Tarjeta>
      ) : null}

      {busquedas.length === 0 ? (
        <EstadoVacio
          icono={Search}
          titulo="Crea tu primera búsqueda"
          texto="Cuéntanos qué vehículo tienes y te mostramos cuántos conductores verificados calzan."
          accion={{ titulo: 'Nueva búsqueda', onPress: () => router.push('/titular/busqueda/nueva') }}
        />
      ) : (
        <>
          <Boton titulo="Nueva búsqueda" icono={Plus} variante="principal" onPress={() => router.push('/titular/busqueda/nueva')} />
          <Rotulo>Tus búsquedas</Rotulo>
          <View style={{ gap: 10 }}>
            {busquedas.map((b, i) => (
              <Aparecer key={b.busqueda.id} retraso={Math.min(i, 6) * 40}>
                <TarjetaBusqueda b={b} conPlan={!!plan} bolsaActiva={bolsaActiva} />
              </Aparecer>
            ))}
          </View>
        </>
      )}

      {busquedas.length > 0 ? (
      <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.textoDeshabilitado, borderRadius: radio.tarjeta, padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color={color.texto} strokeWidth={2} />
          <Text style={[tipo.etiqueta, { color: color.texto, flex: 1 }]}>Demo: cambia el plan al instante</Text>
        </View>
        <View role="radiogroup" aria-label="Plan de la demo" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {OPCIONES_PLAN.map((o) => (
            <Chip
              key={o.clave}
              etiqueta={o.etiqueta}
              seleccionado={planId === o.clave}
              rol="radio"
              onPress={() => elegirPlan(o.clave)}
              style={{ flexBasis: '45%', flexGrow: 1, justifyContent: 'center' }}
            />
          ))}
        </View>
      </View>
      ) : null}
    </Pantalla>
  );
}

export default function Busquedas() {
  return (
    <ConRegistro>
      <Contenido />
    </ConRegistro>
  );
}

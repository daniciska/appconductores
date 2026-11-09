// Titular · Inicio del titular (demo)
// Ruta: /titular
// Maqueta: docs/maqueta/InicioTitular.dc.html (referencia general: tarjeta de búsqueda y adelanto anónimo)
// Las búsquedas de Transportes Los Aromos SpA (t01), cuáles están en la bolsa y quién las ve,
// sus postulantes y un selector del plan de la demo para probar qué cambia con cada plan.
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { plural } from '@/datos/formato';
import { useBusquedasDelTitular, useDerivado, usePlanDemo, useTitularDemo } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import type { BusquedaTitular } from '@/datos/selectores';
import { TEXTO_CUENTA_SUSPENDIDA, useDemo } from '@/datos/tienda';
import type { PlanTitular } from '@/datos/tipos';
import {
  Aviso,
  Boton,
  Chip,
  EstadoVacio,
  Insignia,
  Pantalla,
  Presionable,
  Separador,
  Tarjeta,
  Titulo,
  color,
  fuente,
  mostrarToast,
  radio,
  tipo,
} from '@/ui';
import { ChevronRight, Eye, Lock, Search, Sparkles, Users } from '@/ui/iconos';

import { TEXTO_VISIBILIDAD, cupoBolsa, textoCambioPlan } from './datos';
import { Aparecer, EQUILIBRADO, InsigniaBolsa, InsigniaDestacada, Rotulo } from './piezas';

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

/** Adelanto anónimo (sin plan): "8 conductores verificados coinciden con tu búsqueda" (maqueta InicioTitular). */
function Adelanto({ n }: { n: number }) {
  return (
    <View style={{ backgroundColor: color.oscuro, borderRadius: 16, padding: 18, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View aria-hidden style={{ flexDirection: 'row' }}>
          {['#3A3A3A', '#555555', '#707070'].map((fondo, i) => (
            <View
              key={fondo}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: fondo, borderWidth: 2, borderColor: color.oscuro, marginLeft: i === 0 ? 0 : -10 }}
            />
          ))}
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 22, lineHeight: 28, color: color.acento }}>
            {plural(n, 'conductor', 'conductores')}
          </Text>
          <Text style={[fuente(400), { fontSize: 14, lineHeight: 19, color: '#BDBDBD' }]}>
            {n === 1 ? 'verificado coincide con tu búsqueda' : 'verificados coinciden con tu búsqueda'}
          </Text>
        </View>
      </View>
      <Presionable
        role="link"
        aria-label="Activa un plan para ver sus contactos"
        onPress={() => router.push('/titular/planes')}
        efecto="escala"
        style={{ minHeight: 50, borderRadius: 14, backgroundColor: color.acento, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Lock size={18} color={color.texto} strokeWidth={2.2} />
        <Text style={[fuente(700), { fontSize: 15, lineHeight: 20, color: color.texto }]}>Activa un plan para ver sus contactos</Text>
      </Presionable>
    </View>
  );
}

function TarjetaBusqueda({ b, conPlan }: { b: BusquedaTitular; conPlan: boolean }) {
  const cambiarEstado = useDemo((s) => s.cambiarEstadoBusqueda);
  const estado = ESTADO_BUSQUEDA[b.busqueda.estado];
  const pausada = b.busqueda.estado !== 'activa';
  const id = b.busqueda.id;

  return (
    <Tarjeta padding={16} separacion={12}>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto, flex: 1 }]}>
            {b.negocio.nombre}
          </Text>
          <Insignia texto={estado.texto} tono={estado.tono} icono={null} />
        </View>
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{b.condiciones}</Text>
      </View>

      {pausada ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Users size={16} color={color.textoSecundario} strokeWidth={2} />
          <Text style={[tipo.ayuda, { color: color.textoSecundario, flex: 1 }]}>En pausa: no aparece en los matches.</Text>
        </View>
      ) : !conPlan ? (
        <Adelanto n={b.coinciden} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Users size={16} color={color.textoSuave} strokeWidth={2} />
          <Text style={[tipo.ayuda, { color: color.textoSuave, flex: 1 }]}>
            <Text style={fuente(700)}>{plural(b.coinciden, 'conductor', 'conductores')}</Text>
            {b.coinciden === 1 ? ' hace match' : ' hacen match'}
          </Text>
        </View>
      )}

      <Separador />

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <InsigniaBolsa enBolsa={b.busqueda.enBolsa} pausada={pausada} />
          {b.destacada ? <InsigniaDestacada /> : null}
          {b.postulantes > 0 ? (
            <Insignia
              texto={b.postulantesNuevos > 0 ? `${plural(b.postulantes, 'postulante', 'postulantes')} · ${b.postulantesNuevos} ${b.postulantesNuevos === 1 ? 'nuevo' : 'nuevos'}` : plural(b.postulantes, 'postulante', 'postulantes')}
              tono={b.postulantesNuevos > 0 ? 'amarilla' : 'gris'}
              icono={null}
            />
          ) : null}
        </View>
        {b.busqueda.enBolsa ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Eye size={16} color={color.textoSuave} strokeWidth={2} />
            <Text style={[tipo.ayuda, { color: color.textoSuave, flex: 1 }]}>La ven: {TEXTO_VISIBILIDAD[b.busqueda.visibilidadBolsa]}</Text>
          </View>
        ) : null}
      </View>

      {pausada ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Boton
            titulo="Activar búsqueda"
            variante="oscuro"
            tamano="mediano"
            anchoCompleto
            style={{ flex: 1 }}
            onPress={() => {
              const r = cambiarEstado(id, 'activa');
              if (r.ok) mostrarToast('Búsqueda activa otra vez.', 'exito');
              else mostrarToast(r.error ?? 'No se pudo activar.', 'error');
            }}
          />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Boton
            titulo={b.postulantes > 0 ? `Postulantes · ${b.postulantes}` : 'Postulantes'}
            variante="contorno"
            tamano="mediano"
            anchoCompleto
            style={{ flex: 1, paddingHorizontal: 10 }}
            onPress={() => router.push({ pathname: '/titular/bolsa/[busqueda]/postulantes', params: { busqueda: id } })}
          />
          <Boton
            titulo={b.busqueda.enBolsa ? 'Editar oferta' : 'Publicar'}
            variante={b.busqueda.enBolsa ? 'oscuro' : 'principal'}
            tamano="mediano"
            anchoCompleto
            style={{ flex: 1, paddingHorizontal: 10 }}
            onPress={() => router.push({ pathname: '/titular/bolsa/[busqueda]/publicar', params: { busqueda: id } })}
          />
        </View>
      )}
    </Tarjeta>
  );
}

export default function InicioTitular() {
  const titular = useTitularDemo();
  const plan = usePlanDemo();
  const planId = useDemo((s) => s.titularDemo.plan);
  const cambiarPlan = useDemo((s) => s.cambiarPlanTitular);
  const bolsaActiva = useDemo((s) => s.ajustes.bolsaActiva);
  const busquedas = useBusquedasDelTitular();
  const cupo = useDerivado(cupoBolsa);
  const activas = useDerivado(sel.busquedasActivasDelTitular);
  const usuarioPostulo = useDerivado((s) =>
    s.postulaciones.some((p) => p.conductorId === sel.ID_USUARIO && sel.busquedaPorId(s, p.busquedaId)?.titularId === s.titularDemo.titularId),
  );
  const nuevos = busquedas.reduce((n, b) => n + b.postulantesNuevos, 0);

  const elegirPlan = (p: PlanTitular) => {
    if (p === planId) return;
    const cambios = cambiarPlan(p);
    const nombre = OPCIONES_PLAN.find((o) => o.clave === p)?.etiqueta ?? '';
    mostrarToast(textoCambioPlan(p === 'sin_plan' ? 'Ahora estás sin plan' : `Plan de la demo: ${nombre}`, cambios), cambios.length ? 'info' : 'exito', cambios.length ? 5500 : undefined);
  };

  return (
    <Pantalla>
      <View style={{ gap: 6, paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Titulo style={{ flex: 1 }}>Mis búsquedas</Titulo>
          <Presionable
            role="button"
            aria-label={`Tu plan: ${plan?.nombre ?? 'Sin plan'}. Ver planes`}
            onPress={() => router.push('/titular/planes')}
            style={{ minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' }}>
            <View style={{ minHeight: 32, paddingHorizontal: 10, borderRadius: radio.insignia, backgroundColor: plan ? color.oscuro : color.superficieHundida, justifyContent: 'center' }}>
              <Text style={[fuente(700), { fontSize: 12, lineHeight: 16, color: plan ? color.blanco : color.textoSecundario }]}>
                {plan?.nombre ?? 'Sin plan'}
              </Text>
            </View>
          </Presionable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 6 }}>
          <Text style={[tipo.parrafo, { color: color.textoSecundario }]}>{sel.nombreTitular(titular)}</Text>
          {titular.revisado ? <Insignia texto={sel.insigniaTitular(titular)} tono="verde" /> : null}
        </View>
      </View>

      {titular.suspendido ? <Aviso tono="error" icono="alerta" texto={TEXTO_CUENTA_SUSPENDIDA} /> : null}

      <Tarjeta padding={0} separacion={0} style={{ flexDirection: 'row' }}>
        {[
          { etiqueta: 'Activas', valor: plan ? `${activas} de ${plan.busquedasActivas}` : `${activas}` },
          { etiqueta: 'En la bolsa', valor: plan ? `${cupo.usadas} de ${cupo.maximo}` : `${cupo.usadas}` },
          { etiqueta: 'Nuevos', valor: plan ? `${nuevos}` : '—' },
        ].map((m, i) => (
          <View key={m.etiqueta} style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 2, borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: color.separador }}>
            <Text style={[tipo.pequeno, { color: color.textoSecundario }]}>{m.etiqueta}</Text>
            <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 18, lineHeight: 24, color: color.texto }}>{m.valor}</Text>
          </View>
        ))}
      </Tarjeta>

      <View
        style={{
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: color.textoDeshabilitado,
          borderRadius: radio.tarjeta,
          padding: 16,
          gap: 12,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color={color.texto} strokeWidth={2} />
          <Text style={[tipo.etiqueta, { color: color.texto, flex: 1 }]}>Plan de la demo</Text>
          <Presionable
            role="link"
            onPress={() => router.push('/titular/planes')}
            style={{ minHeight: 44, marginVertical: -6, paddingLeft: 8, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={[tipo.ayuda, fuente(700), { color: color.texto }]}>Comparar</Text>
            <ChevronRight size={14} color={color.texto} strokeWidth={2.2} />
          </Presionable>
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
        <Text style={[tipo.ayuda, { color: color.textoSecundario }, EQUILIBRADO]}>Cambia el plan para ver qué cambia en la bolsa. No se cobra nada.</Text>
      </View>

      {!bolsaActiva ? (
        <Aviso icono="info" texto="La bolsa de trabajo no está activa por ahora. Los conductores no ven las ofertas." />
      ) : null}

      <Rotulo>Tus búsquedas</Rotulo>
      {busquedas.length === 0 ? (
        <EstadoVacio icono={Search} titulo="Aún no tienes búsquedas" texto="Cuando publiques una, aparecerá aquí." />
      ) : (
        <View style={{ gap: 10 }}>
          {busquedas.map((b, i) => (
            <Aparecer key={b.busqueda.id} retraso={Math.min(i, 6) * 40}>
              <TarjetaBusqueda b={b} conPlan={!!plan} />
            </Aparecer>
          ))}
        </View>
      )}

      <Aviso
        icono="chispa"
        texto={
          usuarioPostulo
            ? 'Tu conductor de la demo postuló a una de estas ofertas. Escríbele desde Postulantes y míralo en sus Mensajes.'
            : 'Como conductor verificado, postula a una oferta de esta empresa y respóndete desde aquí.'
        }
      />
    </Pantalla>
  );
}

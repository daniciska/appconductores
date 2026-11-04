// E1 · Perfil
// Ruta: /conductor/perfil
// Maqueta: docs/maqueta/CondPerfil.dc.html
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { fechaCorta, iniciales } from '@/datos/formato';
import { useEntregasDelUsuario, useResumenDocumentos } from '@/datos/hooks';
import { nombreTitular } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import {
  Avatar,
  Boton,
  Dialogo,
  FilaLista,
  GrupoLista,
  HojaInferior,
  Insignia,
  Pantalla,
  Presionable,
  Separador,
  Texto,
  TituloSeccion,
  Volante,
  color,
  fuente,
  mostrarToast,
  radio,
  tipo,
  type PropsInsignia,
} from '@/ui';
import {
  Ban,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Clock,
  Eye,
  IdCard,
  MapPin,
  Shield,
  Trash,
} from '@/ui/iconos';
import { CerrarSesion, Hoja } from '@/ui/iconosPropios';

import { irAlSelector } from './acciones';
import { FilaDisponible } from './piezas';

const PREGUNTAS: { p: string; r: string }[] = [
  {
    p: '¿Cuándo aparezco en los matches?',
    r: 'Cuando tu perfil está completo, tus 4 documentos están aprobados y estás disponible para trabajar.',
  },
  { p: '¿Quién ve mis documentos?', r: 'Solo nuestro equipo de verificación. Los titulares ven una insignia, nunca tus archivos.' },
  { p: '¿Quién ve mi dirección?', r: 'Nadie. Solo la recibe un titular si tú se la compartes en una conversación.' },
  { p: '¿Cómo dejo de aparecer por un tiempo?', r: 'Apaga "Disponible para trabajar". Puedes volver cuando quieras.' },
];

function insigniaPerfil(estadoPerfil: string, verificacion: string, registrado: boolean): PropsInsignia {
  if (!registrado || estadoPerfil !== 'completo') return { texto: 'Perfil incompleto', tono: 'amarilla', icono: Clock };
  if (verificacion === 'verificado') return { texto: 'Verificado', tono: 'verde' };
  if (verificacion === 'con_observaciones') return { texto: 'Revisa un documento', tono: 'roja', icono: null };
  return { texto: 'En revisión', tono: 'amarilla', icono: Clock };
}

export default function Perfil() {
  // Navegación de la pila raíz: para volver al selector de la demo.
  const raiz = useNavigation('/');
  const cuenta = useDemo((s) => s.cuenta);
  const conductor = useDemo((s) => s.conductor);
  const dias = useDemo((s) => s.ajustes.diasReconfirmar);
  const bloqueos = useDemo((s) => s.bloqueos);
  const titulares = useDemo((s) => s.titulares);
  const cambiarDisponible = useDemo((s) => s.cambiarDisponible);
  const desbloquearTitular = useDemo((s) => s.desbloquearTitular);
  const docs = useResumenDocumentos();
  const entregas = useEntregasDelUsuario();
  const [hoja, setHoja] = useState<'bloqueos' | 'ayuda' | 'terminos' | null>(null);
  const [salir, setSalir] = useState(false);

  const primer = cuenta.nombres.trim().split(/\s+/)[0] ?? '';
  const nombre = [primer, cuenta.apellido1.trim()].filter(Boolean).join(' ') || 'Tu perfil';
  const insignia = insigniaPerfil(conductor.estadoPerfil, conductor.estadoVerificacion, conductor.registrado);

  const insigniaDocs: PropsInsignia | null =
    docs.rechazados > 0
      ? { texto: docs.rechazados === 1 ? '1 no aprobado' : `${docs.rechazados} no aprobados`, tono: 'roja', icono: null }
      : docs.vencenPronto > 0
        ? { texto: docs.vencenPronto === 1 ? '1 vence pronto' : `${docs.vencenPronto} vencen pronto`, tono: 'amarilla', icono: null }
        : docs.enRevision > 0
          ? { texto: `${docs.enRevision} en revisión`, tono: 'gris', icono: null }
          : docs.faltan > 0
            ? { texto: docs.faltan === 1 ? 'Falta 1' : `Faltan ${docs.faltan}`, tono: 'gris', icono: null }
            : null;

  const titularesBloqueados = bloqueos.map((id) => titulares.find((t) => t.id === id)).filter((t) => !!t);

  const alternarDisponible = (v: boolean) => {
    cambiarDisponible(v);
    mostrarToast(v ? 'Estás disponible para trabajar.' : 'Quedaste en pausa: no apareces en los matches.', v ? 'exito' : 'info');
  };

  return (
    <Pantalla inferior={24}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 4 }}>
        <Avatar texto={iniciales(nombre === 'Tu perfil' ? 'Conductor' : nombre)} tamano={64} forma="circulo" />
        <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 6 }}>
          <Text role="heading" aria-level={1} numberOfLines={2} style={{ fontFamily: 'Sora_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.4, color: color.texto }}>
            {nombre}
          </Text>
          <Insignia {...insignia} />
        </View>
      </View>

      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingTop: 16, paddingHorizontal: 18, paddingBottom: conductor.disponible ? 2 : 16 }}>
        <View style={{ paddingBottom: conductor.disponible ? 14 : 0 }}>
          <FilaDisponible valor={conductor.disponible} onCambiar={alternarDisponible} diasReconfirmar={dias} />
        </View>
        {conductor.disponible ? (
          <>
            <Separador />
            <Presionable
              role="button"
              aria-label="Confirmar ahora"
              href="/conductor/disponibilidad"
              style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Text style={[fuente(700), { fontSize: 14, color: color.texto }]}>Confirmar ahora</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {conductor.disponibilidadConfirmadaEn ? (
                  <Texto variante="ayuda">Última vez el {fechaCorta(conductor.disponibilidadConfirmadaEn)}</Texto>
                ) : null}
                <ChevronRight size={18} color={color.texto} strokeWidth={2} />
              </View>
            </Presionable>
          </>
        ) : null}
      </View>

      <View style={{ gap: 8 }}>
        <TituloSeccion>Mi perfil</TituloSeccion>
        <GrupoLista>
          <FilaLista titulo="Mis datos" icono={IdCard} href={{ pathname: '/conductor/registro/1', params: { editar: '1' } }} />
          <FilaLista titulo="Dónde vivo" icono={MapPin} href={{ pathname: '/conductor/registro/2', params: { editar: '1' } }} />
          <FilaLista titulo="Mi experiencia" icono={Volante} href={{ pathname: '/conductor/registro/3', params: { editar: '1' } }} />
          <FilaLista titulo="El trabajo que busco" icono={BriefcaseBusiness} href={{ pathname: '/conductor/registro/4', params: { editar: '1' } }} />
        </GrupoLista>
      </View>

      <View style={{ gap: 8 }}>
        <TituloSeccion>Seguridad y privacidad</TituloSeccion>
        <GrupoLista>
          <FilaLista
            titulo="Mis documentos"
            icono={Hoja}
            href="/conductor/perfil/documentos"
            derecha={insigniaDocs ? <Insignia {...insigniaDocs} /> : undefined}
          />
          <FilaLista
            titulo="Quién recibió mis datos"
            icono={Eye}
            href="/conductor/perfil/quien-recibio"
            derecha={entregas.length > 0 ? <Insignia texto={String(entregas.length)} tono="gris" icono={null} /> : undefined}
          />
          <FilaLista
            titulo="Conversaciones bloqueadas"
            icono={Ban}
            onPress={() => setHoja('bloqueos')}
            derecha={bloqueos.length > 0 ? <Insignia texto={String(bloqueos.length)} tono="gris" icono={null} /> : undefined}
          />
        </GrupoLista>
      </View>

      <View style={{ gap: 8 }}>
        <TituloSeccion>Ayuda</TituloSeccion>
        <GrupoLista>
          <FilaLista titulo="Centro de ayuda" icono={CircleHelp} onPress={() => setHoja('ayuda')} />
          <FilaLista titulo="Términos y privacidad" icono={Shield} onPress={() => setHoja('terminos')} />
        </GrupoLista>
      </View>

      <GrupoLista>
        <FilaLista titulo="Cerrar sesión" icono={CerrarSesion} onPress={() => setSalir(true)} flecha={false} />
        <FilaLista titulo="Eliminar mi cuenta" icono={Trash} peligro href="/conductor/eliminar-cuenta" flecha={false} />
      </GrupoLista>

      {/* Conversaciones bloqueadas */}
      <HojaInferior
        visible={hoja === 'bloqueos'}
        onCerrar={() => setHoja(null)}
        titulo="Conversaciones bloqueadas"
        descripcion={titularesBloqueados.length > 0 ? 'No te pueden escribir ni ver tu ficha.' : undefined}>
        {titularesBloqueados.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 24 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={24} color={color.textoSecundario} strokeWidth={2} />
            </View>
            <Texto variante="fuerte" centrado>
              No has bloqueado a nadie
            </Texto>
            <Texto variante="secundario" tono="secundario" centrado>
              Puedes bloquear a un titular desde su conversación.
            </Texto>
          </View>
        ) : (
          titularesBloqueados.map((t) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 }}>
              <Avatar texto={iniciales(nombreTitular(t))} tamano={40} tono="claro" />
              <Text numberOfLines={2} style={[tipo.cuerpo, fuente(600), { flex: 1, color: color.texto }]}>
                {nombreTitular(t)}
              </Text>
              <Boton
                titulo="Desbloquear"
                variante="contorno"
                tamano="mediano"
                onPress={() => {
                  desbloquearTitular(t.id);
                  mostrarToast(`Desbloqueaste a ${nombreTitular(t)}.`, 'exito');
                }}
              />
            </View>
          ))
        )}
      </HojaInferior>

      {/* Centro de ayuda */}
      <HojaInferior visible={hoja === 'ayuda'} onCerrar={() => setHoja(null)} titulo="Centro de ayuda">
        {PREGUNTAS.map((x, i) => (
          <View key={x.p} style={{ gap: 4 }}>
            {i > 0 ? <Separador style={{ marginBottom: 12 }} /> : null}
            <Text style={[tipo.fuerte, { color: color.texto }]}>{x.p}</Text>
            <Texto variante="secundario" tono="secundario">
              {x.r}
            </Texto>
          </View>
        ))}
      </HojaInferior>

      {/* Términos y privacidad */}
      <HojaInferior
        visible={hoja === 'terminos'}
        onCerrar={() => setHoja(null)}
        titulo="Términos y privacidad"
        descripcion="Aquí estarán los Términos y la Política de privacidad. En la demo todavía no están."
        pie={<Boton titulo="Entendido" variante="oscuro" onPress={() => setHoja(null)} />}
      />

      <Dialogo
        visible={salir}
        titulo="¿Cerrar sesión?"
        texto="Para volver a entrar usarás tu celular y un código. En la demo, tus datos quedan guardados."
        confirmar={{
          titulo: 'Cerrar sesión',
          onPress: () => {
            setSalir(false);
            mostrarToast('Cerraste sesión.');
            irAlSelector(raiz);
          },
        }}
        cancelar={{ onPress: () => setSalir(false) }}
      />
    </Pantalla>
  );
}


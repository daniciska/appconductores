// E1 · Perfil: lo común de la demo y de la app real (encabezado, "Disponible para trabajar" con
// "Confirmar ahora", Mi perfil, Ayuda y Cerrar sesión).
// Maqueta: docs/maqueta/CondPerfil.dc.html
// Lo que solo tiene la demo (Seguridad y privacidad, Eliminar mi cuenta) llega desde su ruta como
// bloques extra; la app real v1 no los muestra.
import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { fechaCorta, iniciales } from '@/datos/formato';
import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
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
  tipo,
  radio,
  type PropsInsignia,
} from '@/ui';
import { BriefcaseBusiness, ChevronRight, CircleHelp, Clock, IdCard, MapPin, Shield } from '@/ui/iconos';
import { CerrarSesion } from '@/ui/iconosPropios';

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

export function insigniaPerfil(estadoPerfil: string, verificacion: string, registrado: boolean): PropsInsignia {
  if (!registrado || estadoPerfil !== 'completo') return { texto: 'Perfil incompleto', tono: 'amarilla', icono: Clock };
  if (verificacion === 'verificado') return { texto: 'Verificado', tono: 'verde' };
  if (verificacion === 'con_observaciones') return { texto: 'Revisa un documento', tono: 'roja', icono: null };
  return { texto: 'En revisión', tono: 'amarilla', icono: Clock };
}

export interface PropsPerfilBase {
  /** Grupo "Seguridad y privacidad" (con sus hojas), entre "Mi perfil" y "Ayuda". Solo la demo. */
  seccionSeguridad?: ReactNode;
  /** Fila bajo "Cerrar sesión" (en la demo, "Eliminar mi cuenta"). */
  filaEliminar?: ReactNode;
  /** Después de confirmar "Cerrar sesión". */
  alCerrarSesion: () => void;
}

export function PerfilBase({ seccionSeguridad, filaEliminar, alCerrarSesion }: PropsPerfilBase) {
  const cuenta = useVista((v) => v.cuenta);
  const conductor = useVista((v) => v.conductor);
  const { diasReconfirmar: dias, textosLegales, textoCerrarSesion } = useEntorno();
  const acciones = useAcciones();
  const [hoja, setHoja] = useState<'ayuda' | 'terminos' | null>(null);
  const [salir, setSalir] = useState(false);

  const primer = cuenta.nombres.trim().split(/\s+/)[0] ?? '';
  const nombre = [primer, cuenta.apellido1.trim()].filter(Boolean).join(' ') || 'Tu perfil';
  const insignia = insigniaPerfil(conductor.estadoPerfil, conductor.estadoVerificacion, conductor.registrado);

  const alternarDisponible = async (v: boolean) => {
    const r = await acciones.cambiarDisponible(v);
    if (!r.ok) {
      mostrarToast(r.error, 'error');
      return;
    }
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

      {seccionSeguridad}

      <View style={{ gap: 8 }}>
        <TituloSeccion>Ayuda</TituloSeccion>
        <GrupoLista>
          <FilaLista titulo="Centro de ayuda" icono={CircleHelp} onPress={() => setHoja('ayuda')} />
          <FilaLista titulo="Términos y privacidad" icono={Shield} onPress={() => setHoja('terminos')} />
        </GrupoLista>
      </View>

      <GrupoLista>
        <FilaLista titulo="Cerrar sesión" icono={CerrarSesion} onPress={() => setSalir(true)} flecha={false} />
        {filaEliminar}
      </GrupoLista>

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
        descripcion={textosLegales.perfil}
        pie={<Boton titulo="Entendido" variante="oscuro" onPress={() => setHoja(null)} />}
      />

      <Dialogo
        visible={salir}
        titulo="¿Cerrar sesión?"
        texto={textoCerrarSesion}
        confirmar={{
          titulo: 'Cerrar sesión',
          onPress: () => {
            setSalir(false);
            alCerrarSesion();
          },
        }}
        cancelar={{ onPress: () => setSalir(false) }}
      />
    </Pantalla>
  );
}


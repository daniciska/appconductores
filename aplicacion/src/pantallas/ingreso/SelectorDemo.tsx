// / · Selector de la demo: elegir con qué rol entrar (conductor o titular), atajos y reiniciar.
// El panel de administración no se muestra ni se enlaza aquí (pedido de la dueña, 7 y 9-nov): es otra
// app del mismo sitio (carpeta panel/ del repositorio).
// Estilo de la Bienvenida (docs/maqueta/CondBienvenida.dc.html): fondo casi negro y tarjetas grandes.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { nombreCompleto } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import {
  AutoFrente,
  Dialogo,
  Insignia,
  Llave,
  MarcoCelular,
  Pantalla,
  Presionable,
  Texto,
  Titulo,
  Volante,
  color,
  fuente,
  mostrarToast,
  radio,
  type LucideIcon,
} from '@/ui';
import { ChevronRight, CircleAlert, RotateCcw, Sparkles } from '@/ui/iconos';

type Variante = 'clara' | 'acento' | 'oscura';

function TarjetaRol({
  titulo,
  texto,
  icono: Icono,
  variante,
  onPress,
}: {
  titulo: string;
  texto: string;
  icono: LucideIcon;
  variante: Variante;
  onPress: () => void;
}) {
  const fondo = variante === 'clara' ? color.superficie : variante === 'acento' ? color.acento : '#1C1C1C';
  const tinta = variante === 'oscura' ? color.blanco : color.texto;
  const sub = variante === 'clara' ? color.textoSecundario : variante === 'acento' ? color.texto : '#BDBDBD';
  const fondoIcono = variante === 'clara' ? color.fondo : variante === 'acento' ? 'rgba(17,17,17,0.10)' : '#2A2A2A';
  return (
    <Presionable
      role="button"
      aria-label={titulo}
      efecto="escala"
      onPress={onPress}
      style={{
        backgroundColor: fondo,
        borderRadius: radio.boton,
        borderWidth: variante === 'oscura' ? 1 : 0,
        borderColor: '#2E2E2E',
        paddingVertical: 18,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      }}>
      <View style={{ width: 44, height: 44, borderRadius: radio.boton44, backgroundColor: fondoIcono, alignItems: 'center', justifyContent: 'center' }}>
        <Icono size={22} color={variante === 'oscura' ? color.acento : color.texto} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[fuente(700), { fontSize: 17, lineHeight: 22, color: tinta }]}>{titulo}</Text>
        <Text style={[fuente(400), { fontSize: 14, lineHeight: 20, color: sub }]}>{texto}</Text>
      </View>
      <ChevronRight size={20} color={variante === 'clara' ? color.textoSecundario : tinta} strokeWidth={2} />
    </Presionable>
  );
}

function BotonSecundario({ titulo, icono: Icono, onPress }: { titulo: string; icono: LucideIcon; onPress: () => void }) {
  return (
    <Presionable
      role="button"
      onPress={onPress}
      style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
      <Icono size={16} color="#BDBDBD" strokeWidth={2.2} />
      <Text style={[fuente(600), { fontSize: 14, color: '#E5E5E5', textDecorationLine: 'underline' }]}>{titulo}</Text>
    </Presionable>
  );
}

export default function SelectorDemo() {
  const conductor = useDemo((s) => s.conductor);
  const cuenta = useDemo((s) => s.cuenta);
  const elegirRol = useDemo((s) => s.elegirRol);
  const reiniciarDemo = useDemo((s) => s.reiniciarDemo);
  const prepararConductorVerificado = useDemo((s) => s.prepararConductorVerificado);
  const prepararDocumentoNoAprobado = useDemo((s) => s.prepararDocumentoNoAprobado);
  const [confirmar, setConfirmar] = useState(false);

  const entrar = (rol: 'conductor' | 'titular', href: Href) => {
    elegirRol(rol);
    router.push(href);
  };

  const estadoConductor = !conductor.registrado
    ? 'Aún no te registras como conductor.'
    : `${nombreCompleto(cuenta) || 'Tu conductor'} · ${
        conductor.estadoVerificacion === 'verificado'
          ? 'verificado'
          : conductor.estadoVerificacion === 'con_observaciones'
            ? 'documento no aprobado'
            : conductor.estadoPerfil === 'incompleto'
              ? 'perfil incompleto'
              : 'documentos en revisión'
      }`;

  return (
    <MarcoCelular>
      <Pantalla fondo={color.oscuro} separacion={16} superior={40} inferior={20}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: radio.boton44, backgroundColor: color.acento, alignItems: 'center', justifyContent: 'center' }}>
            <Llave size={24} color={color.texto} />
          </View>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 20, letterSpacing: -0.2, color: color.blanco }}>Dale Contacto</Text>
        </View>

        <View style={{ marginTop: 28, gap: 14 }}>
          <Insignia texto="Demo con datos de ejemplo" tono="acento" icono={Sparkles} />
          <Titulo nivel="hero" tono="blanco">
            Recorre la app como conductor o titular.
          </Titulo>
          <Text style={[fuente(400), { fontSize: 16, lineHeight: 24, color: '#BDBDBD' }]}>
            Todo es de ejemplo: lo que escribas queda solo en este navegador y no se envía nada.
          </Text>
        </View>

        <View style={{ marginTop: 'auto', paddingTop: 12, gap: 12 }}>
          <TarjetaRol
            titulo="Ver como conductor"
            texto="Registro, documentos, matches y mensajes."
            icono={Volante}
            variante="clara"
            onPress={() => entrar('conductor', '/conductor')}
          />
          <TarjetaRol
            titulo="Ver como titular (bolsa)"
            texto="Publica vehículos en la bolsa y revisa postulantes."
            icono={AutoFrente}
            variante="acento"
            onPress={() => entrar('titular', '/titular')}
          />
        </View>

        <View style={{ gap: 4, paddingTop: 4 }}>
          <Texto variante="ayuda" style={{ color: '#8C8C8C', paddingHorizontal: 4 }}>
            {estadoConductor}
          </Texto>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16 }}>
            <BotonSecundario
              titulo="Atajo: conductor ya verificado"
              icono={Sparkles}
              onPress={() => {
                prepararConductorVerificado();
                mostrarToast('Listo: conductor verificado con matches.', 'exito');
                router.push('/conductor/inicio');
              }}
            />
            <BotonSecundario
              titulo="Atajo: documento no aprobado"
              icono={CircleAlert}
              onPress={() => {
                prepararDocumentoNoAprobado();
                // Sin aviso: taparía los botones de la pantalla, que ya dice "No aprobada".
                // Inicio queda debajo: al volver desde "No aprobada" se ve la fila con el motivo.
                router.push('/conductor/inicio');
                router.push({ pathname: '/conductor/documentos/[tipo]/no-aprobado', params: { tipo: 'hoja_vida' } });
              }}
            />
            <BotonSecundario titulo="Reiniciar demo" icono={RotateCcw} onPress={() => setConfirmar(true)} />
          </View>
        </View>
      </Pantalla>

      <Dialogo
        visible={confirmar}
        titulo="¿Reiniciar la demo?"
        texto="Se borra lo que hiciste en este navegador y vuelven los datos de ejemplo."
        confirmar={{
          titulo: 'Reiniciar',
          peligro: true,
          onPress: () => {
            reiniciarDemo();
            setConfirmar(false);
            mostrarToast('La demo volvió a empezar.', 'exito');
          },
        }}
        cancelar={{ onPress: () => setConfirmar(false) }}
      />
    </MarcoCelular>
  );
}

// A1 · Bienvenida
// Ruta: /conductor/bienvenida
// Maqueta: docs/maqueta/CondBienvenida.dc.html
// Sin "modo de contrato" (crecimiento futuro): el párrafo nombra solo lo que usa el match.
// Arriba de las tarjetas, el interruptor "Letra grande" (24-nov): agranda toda la app. Con letra grande
// todo tiene que caber en un celular común con la barra del navegador (360x640, 390x664): menos aire
// arriba y "Ingresar" pasa a la fila del logo, a la derecha.
// "Tengo vehículos" se dibuja solo si la ruta pasa `alElegirTitular` (la demo sí; la app real v1, no).
import { View } from 'react-native';
import { Text, useGrande } from '@/ui/escala';
import { router } from 'expo-router';

import { AutoFrente, InterruptorLetraGrande, Llave, Pantalla, Presionable, Volante, color, espacio, fuente, radio, tipo, type LucideIcon } from '@/ui';
import { ChevronRight } from '@/ui/iconos';

function TarjetaEntrada({
  titulo,
  texto,
  icono: Icono,
  acento,
  onPress,
}: {
  titulo: string;
  texto: string;
  icono: LucideIcon;
  acento?: boolean;
  onPress: () => void;
}) {
  const grande = useGrande();
  return (
    <Presionable
      role="button"
      aria-label={`${titulo}. ${texto}`}
      efecto="escala"
      onPress={onPress}
      style={{
        backgroundColor: acento ? color.acento : color.superficie,
        borderRadius: radio.boton,
        paddingVertical: grande ? 14 : 18,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radio.boton44,
          backgroundColor: acento ? 'rgba(17,17,17,0.10)' : color.fondo,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icono size={22} color={color.texto} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[fuente(700), { fontSize: 17, lineHeight: 22, color: color.texto }]}>{titulo}</Text>
        <Text style={[tipo.secundario, { color: acento ? color.texto : color.textoSecundario }]}>{texto}</Text>
      </View>
      <ChevronRight size={20} color={acento ? color.texto : color.textoSecundario} strokeWidth={2} />
    </Presionable>
  );
}

function Ingresar() {
  return (
    <Presionable
      role="link"
      aria-label="Ingresar"
      onPress={() => router.push('/conductor/celular')}
      style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 2 }}>
      <Text style={[fuente(600), { fontSize: 15, color: color.blanco, textDecorationLine: 'underline' }]}>Ingresar</Text>
    </Presionable>
  );
}

export default function Bienvenida({ alElegirTitular }: { alElegirTitular?: () => void } = {}) {
  const grande = useGrande();
  return (
    <Pantalla fondo={color.oscuro} superior={grande ? espacio.xxxl : undefined} inferior={grande ? espacio.xxxl : undefined}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: radio.boton44, backgroundColor: color.acento, alignItems: 'center', justifyContent: 'center' }}>
          <Llave size={24} color={color.texto} />
        </View>
        <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 20, letterSpacing: -0.2, color: color.blanco }}>Dale Contacto</Text>
        {grande ? (
          <View style={{ marginLeft: 'auto' }}>
            <Ingresar />
          </View>
        ) : null}
      </View>

      <View style={{ marginTop: grande ? 28 : 56, gap: grande ? 12 : 16 }}>
        <Text role="heading" aria-level={1} style={[tipo.hero, { lineHeight: 38, letterSpacing: -0.6, color: color.blanco }]}>
          Conductores y vehículos, conectados.
        </Text>
        <Text style={[fuente(400), { fontSize: 16, lineHeight: 24, color: color.textoSobreOscuro }]}>
          Si manejas, encuentra un vehículo para trabajar. Si tienes vehículos, encuentra conductores con sus documentos
          revisados. Hacemos match según licencia, zona y turno.
        </Text>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: grande ? 20 : 24, gap: grande ? 10 : 12 }}>
        <InterruptorLetraGrande tono="oscuro" style={grande ? undefined : { marginBottom: 4 }} />
        <TarjetaEntrada
          titulo="Soy conductor"
          texto="Encuentra vehículos para trabajar. Gratis."
          icono={Volante}
          onPress={() => router.push('/conductor/celular')}
        />
        {alElegirTitular ? (
          <TarjetaEntrada
            titulo="Tengo vehículos"
            texto="Encuentra conductores verificados."
            icono={AutoFrente}
            acento
            onPress={alElegirTitular}
          />
        ) : null}
        {grande ? null : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 12, gap: 4 }}>
            <Text style={[fuente(400), { fontSize: 15, color: color.textoSobreOscuro }]}>¿Ya tienes cuenta?</Text>
            <Ingresar />
          </View>
        )}
      </View>
    </Pantalla>
  );
}

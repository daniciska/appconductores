// A2 · Celular
// Ruta: /conductor/celular
// Maqueta: docs/maqueta/CondCelular.dc.html
// En la demo no se envía nada: "Enviar código" guarda el número y pasa a A3.
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { EJEMPLO_USUARIO } from '@/datos/semilla';
import { useDemo } from '@/datos/tienda';
import { Boton, Campo, Encabezado, Pantalla, color, fuente, radio, tipo } from '@/ui';

import { celularParaCampo, celularParaGuardar, celularValido, mascaraCampoCelular } from './acciones';
import { CabeceraFormulario, NotaDemo, TarjetaInfo, useValidarObligatorios } from './comunes';

export default function Celular() {
  const guardado = useDemo((s) => s.cuenta.celular);
  const guardarCelular = useDemo((s) => s.guardarCelular);
  const validar = useValidarObligatorios();

  const [valor, setValor] = useState(() => celularParaCampo(guardado));
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const valido = celularValido(valor);
  const error = intento && validar && !valido ? (valor.trim() ? 'Revisa tu número: son 9 dígitos y empieza con 9.' : 'Ingresa tu número de celular.') : undefined;

  const enviar = () => {
    if (validar && !valido) {
      setIntento(true);
      return;
    }
    guardarCelular(celularParaGuardar(valor));
    setEnviando(true);
    // Pausa breve para que se sienta el envío (en la demo no sale ningún mensaje).
    temporizador.current = setTimeout(() => {
      setEnviando(false);
      router.push('/conductor/codigo');
    }, 600);
  };

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/bienvenida" />
      <CabeceraFormulario titulo="Ingresa tu celular" subtitulo="Te enviaremos un código por WhatsApp. Si no te llega, te lo mandamos por SMS." />

      <View style={{ marginTop: 8, gap: 8 }}>
        <Text nativeID="celular-etiqueta" style={[tipo.etiqueta, { color: color.texto }]}>
          Número de celular
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View
            style={{
              minHeight: 52,
              paddingHorizontal: 16,
              borderRadius: radio.campo,
              backgroundColor: color.superficieHundida,
              borderWidth: 1,
              borderColor: color.bordeCampo,
              justifyContent: 'center',
            }}>
            <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>+56</Text>
          </View>
          <Campo
            style={{ flex: 1 }}
            valor={valor}
            onCambiar={(t) => setValor(mascaraCampoCelular(t))}
            placeholder="9 1234 5678"
            keyboardType="phone-pad"
            inputMode="tel"
            autoComplete="tel-national"
            textContentType="telephoneNumber"
            aria-label="Número de celular, después de +56"
            error={error}
            maxLength={11}
            returnKeyType="send"
            onSubmitEditing={enviar}
            autoFocus
          />
        </View>
      </View>

      <TarjetaInfo texto="Con este número entrarás a la app. También es el que verán los titulares con los que hagas match." />

      {!valor ? (
        <NotaDemo
          texto="Demo:"
          accion={{ titulo: 'Usar un número de ejemplo', onPress: () => setValor(celularParaCampo(EJEMPLO_USUARIO.celular)) }}
        />
      ) : null}

      <View style={{ marginTop: 'auto', paddingTop: 16 }}>
        <Boton titulo="Enviar código" onPress={enviar} cargando={enviando} />
      </View>
    </Pantalla>
  );
}

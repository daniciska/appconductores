// A2 · Celular
// Ruta: /conductor/celular
// Maqueta: docs/maqueta/CondCelular.dc.html
// "Enviar código" pide el código (en la demo no se envía nada: guarda el número) y pasa a A3. Si la
// persona vuelve atrás mientras se envía, se queda donde fue (no se la lleva a A3).
// "Letra grande" (pedido de Daniela, 24-nov): también aquí, la primera pantalla del registro, con el mismo
// interruptor que la Bienvenida y Perfil (tono claro, como en Perfil), para quien llega directo o no lo vio.
// Va en la cabecera, al lado de "Volver" (versión de una línea): el campo del número se activa solo al
// entrar y el teclado tapaba el interruptor si iba abajo; además así no baja "Enviar código".
import { useState } from 'react';
import { View } from 'react-native';
import { Text, useMedidas } from '@/ui/escala';
import { router } from 'expo-router';

import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
import { Boton, Campo, Encabezado, InterruptorLetraGrande, Pantalla, color, fuente, radio, tipo } from '@/ui';

import { celularParaCampo, celularParaGuardar, celularValido, mascaraCampoCelular, usePantallaAbierta } from './acciones';
import { CabeceraFormulario, NotaDemo, TarjetaInfo, useValidarObligatorios } from './comunes';

export default function Celular() {
  const guardado = useVista((v) => v.cuenta.celular);
  const acciones = useAcciones();
  const { ejemplo } = useEntorno();
  const validar = useValidarObligatorios();
  const pantalla = usePantallaAbierta();

  const m = useMedidas();
  const [valor, setValor] = useState(() => celularParaCampo(guardado));
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const valido = celularValido(valor);
  const error =
    intento && validar && !valido
      ? valor.trim()
        ? // Espacios que no se cortan: el ejemplo "9 1234 5678" queda entero en una línea.
          'Escribe solo tu número, por ejemplo 9\u00A01234\u00A05678.'
        : 'Ingresa tu número de celular.'
      : (errorEnvio ?? undefined);

  const enviar = async () => {
    if (enviando) return;
    if (validar && !valido) {
      setIntento(true);
      return;
    }
    setErrorEnvio(null);
    setEnviando(true);
    const senal = pantalla.senal();
    const r = await acciones.pedirCodigo(celularParaGuardar(valor), 'whatsapp', { senal });
    if (senal.aborted) return;
    setEnviando(false);
    if (!r.ok) {
      setErrorEnvio(r.error);
      return;
    }
    router.push('/conductor/codigo');
  };

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/bienvenida" derecha={<InterruptorLetraGrande compacto />} />
      <CabeceraFormulario titulo="Ingresa tu celular" subtitulo="Te enviaremos un código por WhatsApp. Si no te llega, te lo mandamos por SMS." />

      <View style={{ marginTop: 8, gap: 8 }}>
        <Text nativeID="celular-etiqueta" style={[tipo.etiqueta, { color: color.texto }]}>
          Número de celular
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View
            style={{
              // Mismo alto que el campo del número (52, o 60 con letra grande).
              minHeight: m.campo,
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
            onCambiar={(t) => {
              setValor(mascaraCampoCelular(t));
              if (errorEnvio) setErrorEnvio(null);
            }}
            placeholder="9 1234 5678"
            keyboardType="phone-pad"
            inputMode="tel"
            autoComplete="tel-national"
            textContentType="telephoneNumber"
            aria-label="Número de celular, después de +56"
            error={error}
            // Deja pegar el número como venga ("+56 (9) 9000-0001", "0056 9 9000 0001"): la máscara lo deja en
            // 9 dígitos. El tope es holgado para que el navegador no corte lo pegado antes de la máscara.
            maxLength={24}
            returnKeyType="send"
            onSubmitEditing={enviar}
            autoFocus
          />
        </View>
      </View>

      <TarjetaInfo texto="Con este número entrarás a la app. También es el que verán los titulares con los que hagas match." />

      {ejemplo && !valor ? (
        <NotaDemo
          texto={ejemplo.etiqueta}
          accion={{ titulo: ejemplo.usarNumero, onPress: () => setValor(celularParaCampo(ejemplo.usuario.celular)) }}
        />
      ) : null}

      <View style={{ marginTop: 'auto', paddingTop: 16 }}>
        <Boton titulo="Enviar código" onPress={enviar} cargando={enviando} />
      </View>
    </Pantalla>
  );
}

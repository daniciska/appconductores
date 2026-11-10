// A2 · Celular
// Ruta: /conductor/celular
// Maqueta: docs/maqueta/CondCelular.dc.html
// "Enviar código" pide el código (en la demo no se envía nada: guarda el número) y pasa a A3. Si la
// persona vuelve atrás mientras se envía, se queda donde fue (no se la lleva a A3).
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
import { Boton, Campo, Encabezado, Pantalla, color, fuente, radio, tipo } from '@/ui';

import { celularParaCampo, celularParaGuardar, celularValido, mascaraCampoCelular, usePantallaAbierta } from './acciones';
import { CabeceraFormulario, NotaDemo, TarjetaInfo, useValidarObligatorios } from './comunes';

export default function Celular() {
  const guardado = useVista((v) => v.cuenta.celular);
  const acciones = useAcciones();
  const { ejemplo } = useEntorno();
  const validar = useValidarObligatorios();
  const pantalla = usePantallaAbierta();

  const [valor, setValor] = useState(() => celularParaCampo(guardado));
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const valido = celularValido(valor);
  const error =
    intento && validar && !valido
      ? valor.trim()
        ? 'Revisa tu número: son 9 dígitos y empieza con 9.'
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
            maxLength={11}
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

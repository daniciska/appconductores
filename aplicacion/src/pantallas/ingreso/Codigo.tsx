// A3 · Código (WhatsApp o SMS)
// Ruta: /conductor/codigo
// Maqueta: docs/maqueta/CondCodigo.dc.html
// En la demo se acepta cualquier código de 6 dígitos (se dice discretamente sobre el botón).
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { celularCompleto } from '@/datos/formato';
import { useDemo } from '@/datos/tienda';
import { Boton, Encabezado, Pantalla, color, fuente, mostrarToast, radio, tipo } from '@/ui';
import { Clock, MessageSquare } from '@/ui/iconos';

import { irAInicioConductor, rutaTrasVerificar } from './acciones';
import { BotonTexto, CabeceraFormulario, NotaDemo } from './comunes';

const LARGO = 6;
const ESPERA_REENVIO = 30;

export default function Codigo() {
  const celular = useDemo((s) => s.cuenta.celular);
  const verificarCelular = useDemo((s) => s.verificarCelular);

  const [codigo, setCodigo] = useState('');
  const [foco, setFoco] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canal, setCanal] = useState<'WhatsApp' | 'SMS'>('WhatsApp');
  const [segundos, setSegundos] = useState(ESPERA_REENVIO);
  const [verificando, setVerificando] = useState(false);
  const entrada = useRef<ComponentRef<typeof TextInput>>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cuenta regresiva para reenviar.
  useEffect(() => {
    if (segundos <= 0) return;
    const id = setTimeout(() => setSegundos((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [segundos]);
  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const numero = celular.replace(/\D/g, '') ? celularCompleto(celular) : null;

  const verificar = () => {
    if (codigo.length < LARGO) {
      setError(`Ingresa los ${LARGO} dígitos del código.`);
      entrada.current?.focus();
      return;
    }
    setVerificando(true);
    temporizador.current = setTimeout(() => {
      setVerificando(false);
      verificarCelular();
      mostrarToast('Celular verificado.', 'exito');
      const destino = rutaTrasVerificar();
      if (destino === 'inicio') irAInicioConductor();
      else router.push(destino);
    }, 700);
  };

  const reenviar = (nuevoCanal: 'WhatsApp' | 'SMS') => {
    setCanal(nuevoCanal);
    setSegundos(ESPERA_REENVIO);
    setCodigo('');
    setError(null);
    mostrarToast(`Te enviamos un código nuevo por ${nuevoCanal}.`, 'info');
    entrada.current?.focus();
  };

  const cambiar = (t: string) => {
    const limpio = t.replace(/\D/g, '').slice(0, LARGO);
    setCodigo(limpio);
    if (error) setError(null);
  };

  const activa = Math.min(codigo.length, LARGO - 1);
  const mm = Math.floor(segundos / 60);
  const ss = String(segundos % 60).padStart(2, '0');

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/celular" />
      <CabeceraFormulario
        titulo="Ingresa el código"
        subtitulo={
          <>
            Lo enviamos por {canal} {numero ? 'al ' : 'a tu celular'}
            {numero ? <Text style={[fuente(600), { color: color.texto }]}>{numero}</Text> : null}.
          </>
        }
      />

      <View style={{ marginTop: 8, gap: 8 }}>
        <View aria-hidden style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          {Array.from({ length: LARGO }, (_, i) => {
            const digito = codigo[i] ?? '';
            const actual = foco && i === activa && !(codigo.length === LARGO && i === LARGO - 1 && digito);
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  maxWidth: 48,
                  height: 56,
                  borderRadius: radio.campo,
                  backgroundColor: color.superficie,
                  borderWidth: error ? 1.5 : actual ? 2 : 1,
                  borderColor: error ? color.error : actual ? color.bordeFuerte : color.bordeCampo,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={[fuente(700), { fontSize: 22, color: color.texto }]}>{digito}</Text>
              </View>
            );
          })}
        </View>
        {/* Un solo campo invisible encima de las cajas: recibe lo escrito y lo pegado. */}
        <TextInput
          ref={entrada}
          value={codigo}
          onChangeText={cambiar}
          keyboardType="number-pad"
          inputMode="numeric"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={LARGO}
          autoFocus
          caretHidden
          aria-label="Código de 6 dígitos"
          aria-invalid={!!error}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          onSubmitEditing={verificar}
          style={[
            // 16 px: evita que Safari en iPhone haga zoom al enfocar.
            { position: 'absolute', top: 0, left: 0, right: 0, height: 56, opacity: 0, color: 'transparent', fontSize: 16 },
            Platform.OS === 'web' ? ({ outlineStyle: 'none', cursor: 'pointer' } as object) : null,
          ]}
        />
        {error ? (
          <Text role="alert" style={[tipo.ayuda, fuente(600), { color: color.error }]}>
            {error}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        <Text style={[tipo.secundario, { color: color.textoSecundario }]}>¿No te llegó?</Text>
        {segundos > 0 ? (
          <BotonTexto titulo={`Reenviar por WhatsApp en ${mm}:${ss}`} icono={Clock} deshabilitado />
        ) : (
          <BotonTexto titulo="Reenviar por WhatsApp" onPress={() => reenviar('WhatsApp')} />
        )}
      </View>
      <BotonTexto titulo="Recibir el código por SMS" icono={MessageSquare} onPress={() => reenviar('SMS')} />

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 8 }}>
        <NotaDemo texto="Demo: cualquier código de 6 dígitos" centrada />
        <Boton titulo="Verificar" onPress={verificar} cargando={verificando} />
      </View>
    </Pantalla>
  );
}

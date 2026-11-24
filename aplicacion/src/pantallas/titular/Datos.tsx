// Titular · Tus datos (T1, T2, T4, T5, T7)
// Ruta: /titular/datos (registro) y /titular/datos?editar=1 (desde Perfil)
// Un solo perfil con selector "Persona natural / Empresa" (P2). El RUN no se pide: sale de la cédula, como
// en el conductor. El celular es el verificado. Validación igual que el conductor: con el ajuste
// validarObligatorios encendido (en la demo parte apagado) se exigen los campos con *.
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/ui/escala';
import { router, useLocalSearchParams } from 'expo-router';

import { celularCompleto } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import type { DatosTitular } from '@/datos/titularRegistro';
import type { TipoTitular } from '@/datos/tipos';
import {
  AlertaObligatorios,
  CabeceraFormulario,
  EtiquetaGrupo,
  NotaDemo,
  NotaObligatorio,
  irAlPrimerError,
  useValidarObligatorios,
} from '@/pantallas/ingreso/comunes';
import { Boton, Campo, ControlSegmentado, Encabezado, Insignia, Pantalla, color, fuente, mostrarToast, radio, tipo, volver } from '@/ui';

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "76543210-3" o "76.543.210-3" → ¿dígito verificador correcto? (módulo 11). */
export function rutValido(texto: string): boolean {
  const limpio = texto.replace(/[.\s]/g, '').toUpperCase();
  const m = /^(\d{7,8})-?([\dK])$/.exec(limpio);
  if (!m) return false;
  let suma = 0;
  let mult = 2;
  for (let i = m[1].length - 1; i >= 0; i--) {
    suma += Number(m[1][i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = 11 - (suma % 11);
  const dv = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === m[2];
}

/** Da formato al RUT mientras se escribe: "765432103" → "76.543.210-3". */
export function mascaraRut(texto: string): string {
  const t = texto.replace(/[^\dkK]/g, '').toUpperCase().slice(0, 9);
  if (t.length < 2) return t;
  const cuerpo = t.slice(0, -1).replace(/K/g, '');
  const dv = t.slice(-1);
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

const EJEMPLO: DatosTitular = {
  tipo: 'empresa',
  nombres: 'Carolina',
  apellido1: 'Soto',
  apellido2: 'Pérez',
  correo: 'carolina@flotasur.example',
  razonSocial: 'Flota Sur SpA',
  rut: '76.123.456-0',
};

export default function DatosTitularPantalla() {
  const { editar } = useLocalSearchParams<{ editar?: string }>();
  const enEdicion = editar === '1';
  const registro = useDerivado((s) => s.titularDemo.registro);
  const celular = useDemo((s) => s.cuenta.celular);
  const guardarDatos = useDemo((s) => s.guardarDatosTitular);
  const validar = useValidarObligatorios();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [tipoTitular, setTipo] = useState<TipoTitular>(registro.tipo);
  const [nombres, setNombres] = useState(registro.nombres);
  const [apellido1, setApellido1] = useState(registro.apellido1);
  const [apellido2, setApellido2] = useState(registro.apellido2);
  const [correo, setCorreo] = useState(registro.correo);
  const [razonSocial, setRazonSocial] = useState(registro.razonSocial);
  const [rut, setRut] = useState(registro.rut);
  const [intento, setIntento] = useState(false);
  const empresa = tipoTitular === 'empresa';

  const errores = {
    nombres: !nombres.trim() ? 'Ingresa tus nombres.' : null,
    apellido1: !apellido1.trim() ? 'Ingresa tu primer apellido.' : null,
    correo: !correo.trim() ? 'Ingresa tu correo electrónico.' : !RE_CORREO.test(correo.trim()) ? 'Revisa tu correo.' : null,
    razonSocial: empresa && !razonSocial.trim() ? 'Ingresa la razón social.' : null,
    rut: empresa ? (!rut.trim() ? 'Ingresa el RUT de la empresa.' : !rutValido(rut) ? 'Revisa el RUT: el dígito verificador no calza.' : null) : null,
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const ver = intento && validar;
  const e = (k: keyof typeof errores) => (ver ? (errores[k] ?? undefined) : undefined);
  const vacio = !nombres && !apellido1 && !correo && !razonSocial && !rut;

  const rellenar = () => {
    setTipo(EJEMPLO.tipo);
    setNombres(EJEMPLO.nombres);
    setApellido1(EJEMPLO.apellido1);
    setApellido2(EJEMPLO.apellido2);
    setCorreo(EJEMPLO.correo);
    setRazonSocial(EJEMPLO.razonSocial);
    setRut(EJEMPLO.rut);
  };

  const guardar = () => {
    if (validar && hayErrores) {
      setIntento(true);
      irAlPrimerError(scrollRef);
      return;
    }
    const primeraVez = !registro.datosListos;
    guardarDatos({ tipo: tipoTitular, nombres, apellido1, apellido2, correo, razonSocial, rut });
    if (enEdicion) {
      mostrarToast('Datos guardados.', 'exito');
      volver('/titular/perfil');
      return;
    }
    router.push('/titular/verificacion');
    if (primeraVez) setTimeout(() => mostrarToast('Listo, ya quedaste registrado.', 'exito'), 50);
  };

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado volverA={enEdicion ? '/titular/perfil' : '/titular/autorizaciones'} />
      <CabeceraFormulario titulo="Tus datos" subtitulo={enEdicion ? 'Mantén tus datos al día.' : 'Los conductores verán tu nombre o el de tu empresa.'}>
        {vacio && !enEdicion ? <NotaDemo texto="Demo:" accion={{ titulo: 'Rellenar con datos de ejemplo', onPress: rellenar }} /> : null}
      </CabeceraFormulario>

      <View style={{ marginTop: 8, gap: 18 }}>
        <View style={{ gap: 10 }}>
          <EtiquetaGrupo titulo="¿Cómo usarás la app?" obligatorio />
          <ControlSegmentado<TipoTitular>
            opciones={[
              { clave: 'persona', etiqueta: 'Persona natural' },
              { clave: 'empresa', etiqueta: 'Empresa' },
            ]}
            valor={tipoTitular}
            onCambiar={setTipo}
            etiquetaAccesible="Persona natural o empresa"
          />
        </View>

        {empresa ? (
          <>
            <Campo
              etiqueta="Razón social"
              obligatorio
              valor={razonSocial}
              onCambiar={setRazonSocial}
              placeholder="Como aparece en el SII"
              autoCapitalize="words"
              autoComplete="organization"
              error={e('razonSocial')}
            />
            <Campo
              etiqueta="RUT de la empresa"
              obligatorio
              valor={rut}
              onCambiar={(t) => setRut(mascaraRut(t))}
              placeholder="76.123.456-7"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              ayuda="Lo revisamos en el SII."
              error={e('rut')}
            />
            <Text style={[tipo.etiqueta, { color: color.texto, marginTop: 4 }]}>Quién usa la cuenta</Text>
          </>
        ) : null}

        <Campo
          etiqueta="Nombres"
          obligatorio
          valor={nombres}
          onCambiar={setNombres}
          placeholder="Como aparecen en tu cédula"
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
          error={e('nombres')}
        />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <Campo
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Primer apellido"
            obligatorio
            valor={apellido1}
            onCambiar={setApellido1}
            autoComplete="family-name"
            textContentType="familyName"
            autoCapitalize="words"
            error={e('apellido1')}
          />
          <Campo
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Segundo apellido"
            notaEtiqueta="(si tienes)"
            valor={apellido2}
            onCambiar={setApellido2}
            autoComplete="additional-name"
            autoCapitalize="words"
          />
        </View>
        <Campo
          etiqueta="Correo electrónico"
          obligatorio
          valor={correo}
          onCambiar={setCorreo}
          placeholder="nombre@correo.cl"
          keyboardType="email-address"
          inputMode="email"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          error={e('correo')}
        />

        <View
          style={{
            backgroundColor: color.superficie,
            borderWidth: 1,
            borderColor: color.borde,
            borderRadius: radio.campo,
            minHeight: 64,
            paddingVertical: 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Celular verificado</Text>
            <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{celularCompleto(celular)}</Text>
          </View>
          <Insignia texto="Verificado" />
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {ver && hayErrores ? <AlertaObligatorios /> : null}
        <Boton titulo={enEdicion ? 'Guardar cambios' : 'Continuar'} onPress={guardar} />
        <NotaObligatorio />
      </View>
    </Pantalla>
  );
}

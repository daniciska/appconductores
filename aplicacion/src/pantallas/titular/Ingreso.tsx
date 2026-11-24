// Titular · Ingreso: celular, código y "Antes de empezar" (prototipo del 24-nov).
// Rutas: /titular/celular, /titular/codigo, /titular/autorizaciones
// Celular y Código son las mismas pantallas del conductor (src/pantallas/ingreso), con otras rutas y otro
// texto. "Antes de empezar" del titular tiene sus propias casillas.
import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import { AlertaObligatorios, CabeceraFormulario } from '@/pantallas/ingreso/comunes';
import CelularBase from '@/pantallas/ingreso/Celular';
import CodigoBase from '@/pantallas/ingreso/Codigo';
import { Boton, Encabezado, FilaCheck, Pantalla } from '@/ui';

import { rutaRegistroTitular } from './piezas';

export function CelularTitular() {
  return (
    <CelularBase
      volverA="/conductor/bienvenida"
      alEnviado={() => router.push('/titular/codigo')}
      info="Con este número entrarás a la app. Los conductores lo verán solo si tú se lo muestras."
    />
  );
}

export function CodigoTitular() {
  const verificar = useDemo((s) => s.titularVerificarCelular);
  return (
    <CodigoBase
      volverA="/titular/celular"
      alVerificar={() => {
        verificar();
        // Si ya había hecho el registro antes (otra vez en este navegador), entra directo.
        const paso = sel.pasoRegistroTitular(useDemo.getState());
        router.push(rutaRegistroTitular(paso ?? null));
      }}
    />
  );
}

const CASILLAS = [
  { clave: 'terminos', texto: 'Acepto los Términos y condiciones y la Política de privacidad.' },
  { clave: 'revision', texto: 'Autorizo que revisen mi cédula y, si represento a una empresa, su RUT en el SII.' },
] as const;

export function AutorizacionesTitular() {
  const yaAcepto = useDerivado((s) => !!s.titularDemo.registro.autorizadoEl);
  const aceptar = useDemo((s) => s.titularAceptarAutorizaciones);
  const [marcas, setMarcas] = useState<Record<string, boolean>>(() => ({ terminos: yaAcepto, revision: yaAcepto }));
  const [intento, setIntento] = useState(false);
  const todas = CASILLAS.every((c) => marcas[c.clave]);

  const continuar = () => {
    if (!todas) {
      setIntento(true);
      return;
    }
    aceptar();
    router.push(rutaRegistroTitular(sel.pasoRegistroTitular(useDemo.getState())));
  };

  return (
    <Pantalla>
      <Encabezado volverA="/titular/codigo" />
      <CabeceraFormulario titulo="Antes de empezar" subtitulo="Para usar Dale Contacto necesitamos tu autorización." />
      <View style={{ marginTop: 8, gap: 10 }}>
        {CASILLAS.map((c) => (
          <FilaCheck
            key={c.clave}
            titulo={c.texto}
            marcada={!!marcas[c.clave]}
            onPress={() => setMarcas((m) => ({ ...m, [c.clave]: !m[c.clave] }))}
          />
        ))}
      </View>
      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {intento && !todas ? <AlertaObligatorios texto="Marca las dos casillas para continuar." /> : null}
        <Boton titulo="Continuar" onPress={continuar} />
      </View>
    </Pantalla>
  );
}

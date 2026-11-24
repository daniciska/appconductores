// Titular · Pago del plan (pago web, P14). En la demo no se cobra nada ni se piden datos de pago: el botón
// activa el plan. En la app real, el pago se hace en la página del proveedor de pagos (por definir).
// Ruta: /titular/pago?plan=basico
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { pesos } from '@/datos/formato';
import { useCatalogos } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import type { PlanId } from '@/datos/tipos';
import { CabeceraFormulario, NotaDemo } from '@/pantallas/ingreso/comunes';
import { Boton, Encabezado, EstadoVacio, FilaDato, Pantalla, Separado, color, mostrarToast, radio, tipo } from '@/ui';
import { CreditCard, Lock } from '@/ui/iconos';

import { textoCambioPlan } from '../bolsa/datos';
import { irABusquedas } from './piezas';

export default function Pago() {
  const { plan: planId } = useLocalSearchParams<{ plan: string }>();
  const catalogos = useCatalogos();
  const actual = useDemo((s) => s.titularDemo.plan);
  const cambiarPlan = useDemo((s) => s.cambiarPlanTitular);
  const plan = catalogos.planes.find((p) => p.id === planId);

  if (!plan) {
    return (
      <Pantalla>
        <Encabezado volverA="/titular/planes" />
        <EstadoVacio icono={CreditCard} titulo="No encontramos ese plan" texto="Vuelve y elige uno de la lista." />
      </Pantalla>
    );
  }

  const pagar = () => {
    const cambios = cambiarPlan(plan.id as PlanId);
    mostrarToast(textoCambioPlan(`Listo: tu plan es ${plan.nombre}`, cambios), cambios.length ? 'info' : 'exito', cambios.length ? 5500 : undefined);
    irABusquedas();
  };

  return (
    <Pantalla>
      <Encabezado volverA="/titular/planes" />
      <CabeceraFormulario titulo={`Plan ${plan.nombre}`} subtitulo="Se renueva cada mes. Cancela cuando quieras." />
      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingHorizontal: 16, paddingVertical: 2 }}>
        <Separado>
          <FilaDato etiqueta="Búsquedas activas" valor={String(plan.busquedasActivas)} />
          <FilaDato etiqueta="Matches y contactos" valor="Incluidos" />
          <FilaDato etiqueta="Total mensual" valor={plan.precioMensual !== null ? pesos(plan.precioMensual) : 'Por definir'} />
        </Separado>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
        <Lock size={16} color={color.textoSecundario} strokeWidth={2} />
        <Text style={[tipo.ayuda, { color: color.textoSecundario, flex: 1 }]}>Pagas en una página segura. Te enviamos el comprobante a tu correo.</Text>
      </View>
      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        <NotaDemo texto="Demo: no se cobra nada ni se piden datos de pago." centrada />
        <Boton titulo={actual === plan.id ? 'Ya es tu plan' : 'Pagar y activar'} onPress={pagar} deshabilitado={actual === plan.id} />
      </View>
    </Pantalla>
  );
}

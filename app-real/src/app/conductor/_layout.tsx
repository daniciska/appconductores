// Layout del conductor (app real): columna de celular centrada, pila de pantallas y la guardia de rutas
// (src/guardia.ts). La guardia revisa cada ruta al llegar a ella; mientras lleva a otra, tapa la pantalla
// para que no se vea un instante la que no corresponde. Además, si la sesión termina o cambia de persona
// fuera de esta pestaña (cambioDeSesion), lleva a la entrada que corresponde con la pila limpia: así
// ninguna pantalla abierta queda mostrando (ni guardando) datos de otra sesión.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';

import { Cargando, MarcoCelular, color, mostrarToast } from '@/ui';

import { useTiendaReal } from '@real/datos/tiendaReal';
import { destinoGuardia, rutaDeEntrada } from '@real/guardia';

export default function LayoutConductor() {
  const ruta = usePathname();
  const conSesion = useTiendaReal((s) => !!s.uid);
  const autorizacionesCompletas = useTiendaReal((s) => s.autorizacionesCompletas);
  const registrado = useTiendaReal((s) => s.vista.conductor.registrado);
  const codigoPedido = useTiendaReal((s) => !!s.vista.ingreso);
  const destino = destinoGuardia(ruta, { conSesion, autorizacionesCompletas, registrado, codigoPedido });
  const [revisada, setRevisada] = useState<string | null>(null);

  useEffect(() => {
    if (revisada === ruta) return;
    setRevisada(ruta);
    if (destino) router.replace(destino);
  }, [ruta, destino, revisada]);

  const cambio = useTiendaReal((s) => s.cambioDeSesion);
  const ultimoCambio = useRef(cambio.n);
  useEffect(() => {
    if (cambio.n === ultimoCambio.current) return;
    ultimoCambio.current = cambio.n;
    const e = useTiendaReal.getState();
    const entrada = rutaDeEntrada({
      conSesion: !!e.uid,
      autorizacionesCompletas: e.autorizacionesCompletas,
      registrado: e.vista.conductor.registrado,
      codigoPedido: false,
    });
    if (router.canDismiss()) router.dismissAll();
    router.replace(entrada);
    if (cambio.texto) mostrarToast(cambio.texto);
  }, [cambio]);

  return (
    <MarcoCelular>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.fondo } }} />
      {revisada !== ruta && destino ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: color.fondo }]}>
          <Cargando />
        </View>
      ) : null}
    </MarcoCelular>
  );
}

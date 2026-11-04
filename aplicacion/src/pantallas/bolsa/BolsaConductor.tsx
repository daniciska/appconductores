// BC1 · Bolsa de trabajo
// Ruta: /conductor/bolsa
// Maqueta: docs/maqueta/BolsaLista.dc.html (y BolsaPostulaciones.dc.html para la segunda pestaña)
// Ofertas que el conductor puede ver (R29: bolsa activa, negocio e industria activos, licencia,
// misma región y la visibilidad que eligió el titular), las destacadas primero. La segunda pestaña
// es "Mis postulaciones" con su estado real.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useOfertasBolsa, usePostulacionesDelUsuario } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import { ControlSegmentado, Pantalla } from '@/ui';

import { BolsaApagada, ListaOfertas, ListaPostulaciones } from './listas';
import { Cabecera } from './piezas';

type Vista = 'ofertas' | 'postulaciones';

export default function BolsaConductor() {
  const bolsaActiva = useDemo((s) => s.ajustes.bolsaActiva);
  const ofertas = useOfertasBolsa();
  const postulaciones = usePostulacionesDelUsuario();
  // ?vista=postulaciones abre directo la segunda pestaña (lo usa /conductor/bolsa/postulaciones).
  const { vista: vistaPedida } = useLocalSearchParams<{ vista?: string }>();
  const [vista, setVista] = useState<Vista>(vistaPedida === 'postulaciones' ? 'postulaciones' : 'ofertas');
  useEffect(() => {
    if (vistaPedida === 'postulaciones') setVista('postulaciones');
  }, [vistaPedida]);

  return (
    <Pantalla inferior={24}>
      <Cabecera titulo="Bolsa de trabajo" subtitulo="Ofertas abiertas a tu perfil. Postula con un toque." />

      {!bolsaActiva ? (
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <BolsaApagada />
        </View>
      ) : (
        <>
          <ControlSegmentado<Vista>
            etiquetaAccesible="Bolsa de trabajo"
            opciones={[
              { clave: 'ofertas', etiqueta: `Ofertas · ${ofertas.length}` },
              { clave: 'postulaciones', etiqueta: `Mis postulaciones · ${postulaciones.length}` },
            ]}
            valor={vista}
            onCambiar={setVista}
          />
          {vista === 'ofertas' ? <ListaOfertas /> : <ListaPostulaciones onVerOfertas={() => setVista('ofertas')} />}
        </>
      )}
    </Pantalla>
  );
}

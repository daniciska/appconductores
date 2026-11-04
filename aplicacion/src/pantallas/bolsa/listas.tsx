// Listas del conductor en la bolsa: ofertas (BC1) y "Mis postulaciones" (BC1 y BC3).
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useAvancePerfil, useOfertasBolsa, usePostulacionesDelUsuario } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import { Aviso, EstadoVacio } from '@/ui';
import { BriefcaseBusiness, MapPin, MessageSquare, Search, Send } from '@/ui/iconos';

import { Aparecer, ChipFiltro, TarjetaOferta, TarjetaPostulacion, ordenarPostulaciones } from './piezas';

const RUTA_PASO: Record<number, Href> = {
  1: '/conductor/registro/1',
  2: '/conductor/registro/2',
  3: '/conductor/registro/3',
  4: '/conductor/registro/4',
  5: '/conductor/registro/5',
};

/** Ofertas que ve el usuario (R29), con filtro por negocio. */
export function ListaOfertas() {
  const ofertas = useOfertasBolsa();
  const registrado = useDemo((s) => s.conductor.registrado);
  const comunaId = useDemo((s) => s.conductor.comunaId);
  const avance = useAvancePerfil();
  const [filtro, setFiltro] = useState<string>('todos');

  // Chips: "Todos" y los negocios que aparecen en las ofertas (en el orden del catálogo).
  const negocios = useMemo(() => {
    const vistos = new Map<string, { id: string; nombre: string; orden: number }>();
    for (const o of ofertas) vistos.set(o.negocio.id, { id: o.negocio.id, nombre: o.negocio.nombre, orden: o.negocio.orden });
    return [...vistos.values()].sort((a, b) => a.orden - b.orden);
  }, [ofertas]);
  const filtroValido = filtro === 'todos' || negocios.some((n) => n.id === filtro) ? filtro : 'todos';
  const lista = filtroValido === 'todos' ? ofertas : ofertas.filter((o) => o.negocio.id === filtroValido);

  if (!registrado || !comunaId) {
    return (
      <EstadoVacio
        icono={MapPin}
        titulo="Completa tu perfil"
        texto="Con tu licencia y tu dirección, aquí verás las ofertas abiertas a tu perfil."
        accion={{ titulo: 'Completar mi perfil', onPress: () => router.push(RUTA_PASO[avance.siguientePaso ?? 1]) }}
      />
    );
  }

  if (ofertas.length === 0) {
    return (
      <EstadoVacio
        icono={Search}
        titulo="Aún no hay ofertas para ti"
        texto="Te avisaremos cuando un titular publique una oferta abierta a tu perfil."
      />
    );
  }

  return (
    <>
      {negocios.length > 1 ? (
        <View role="radiogroup" aria-label="Filtrar por negocio" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <ChipFiltro etiqueta="Todos" marcado={filtroValido === 'todos'} onPress={() => setFiltro('todos')} />
          {negocios.map((n) => (
            <ChipFiltro key={n.id} etiqueta={n.nombre} marcado={filtroValido === n.id} onPress={() => setFiltro(n.id)} />
          ))}
        </View>
      ) : null}
      <View style={{ gap: 10 }}>
        {lista.map((o, i) => (
          <Aparecer key={o.id} retraso={Math.min(i, 6) * 40}>
            <TarjetaOferta o={o} />
          </Aparecer>
        ))}
      </View>
    </>
  );
}

/** "Mis postulaciones": estados Enviada, Vista, Te escribió y Cerrada con datos reales. */
export function ListaPostulaciones({ onVerOfertas }: { onVerOfertas?: () => void }) {
  const postulaciones = usePostulacionesDelUsuario();
  const lista = useMemo(() => ordenarPostulaciones(postulaciones), [postulaciones]);

  if (lista.length === 0) {
    return (
      <EstadoVacio
        icono={Send}
        titulo="Aún no postulas"
        texto="Toca “Me interesa” en una oferta y sigue aquí su estado."
        accion={onVerOfertas ? { titulo: 'Ver ofertas', onPress: onVerOfertas } : undefined}
      />
    );
  }

  return (
    <>
      <View style={{ gap: 10 }}>
        {lista.map((p, i) => (
          <Aparecer key={p.postulacion.id} retraso={Math.min(i, 6) * 40}>
            <TarjetaPostulacion p={p} />
          </Aparecer>
        ))}
      </View>
      <Aviso icono={MessageSquare} texto="Si el titular te escribe, la conversación aparece en Mensajes." />
    </>
  );
}

/** La bolsa está apagada desde el panel (se puede llegar con un enlace directo). */
export function BolsaApagada() {
  return (
    <EstadoVacio
      icono={BriefcaseBusiness}
      titulo="La bolsa de trabajo no está activa"
      texto="Cuando se active, aquí verás las ofertas abiertas a tu perfil."
    />
  );
}

// Titular · Una búsqueda y sus matches
// Ruta: /titular/busqueda/[id]
// Sin plan: solo cuántos conductores le harían match (adelanto anónimo, P11). Con plan: la lista de
// conductores que hacen match (con su %), y al tocar uno, su ficha con el contacto. Desde aquí se pausa,
// se marca como cubierta, se edita y, si la bolsa está activa, se publica en la bolsa.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { plural } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { TEXTO_CUENTA_SUSPENDIDA, useDemo } from '@/datos/tienda';
import type { EstadoBusqueda } from '@/datos/tipos';
import { Aviso, Boton, ControlSegmentado, Encabezado, EstadoVacio, Insignia, Pantalla, Tarjeta, Titulo, color, mostrarToast, tipo } from '@/ui';
import { Pencil, Search, Users } from '@/ui/iconos';

import { ChipFiltro, Rotulo } from '../bolsa/piezas';
import { Adelanto, TarjetaConductor } from './piezas';

const ESTADOS: { clave: EstadoBusqueda; etiqueta: string }[] = [
  { clave: 'activa', etiqueta: 'Activa' },
  { clave: 'pausada', etiqueta: 'Pausada' },
  { clave: 'cubierta', etiqueta: 'Cubierta' },
];

export default function Resultados() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const datos = useDerivado((s) => {
    const b = s.busquedas.find((x) => x.id === id && x.titularId === s.titularDemo.titularId);
    if (!b) return null;
    return {
      b,
      negocio: sel.negocioPorId(s, b.negocioId)!,
      condiciones: sel.textoCondiciones(s, b),
      calzan: sel.conductoresQueCalzan(s, b.id),
      plan: sel.planDeLaDemo(s),
      titular: sel.titularDeLaDemo(s),
      favoritos: s.favoritosTitular,
      mostrado: (cid: string) => !!sel.contactoMostradoA(s, b.id, cid),
      bolsaActiva: s.ajustes.bolsaActiva,
      postulantes: s.postulaciones.filter((p) => p.busquedaId === b.id && p.estado !== 'descartada').length,
    };
  });
  const cambiarEstado = useDemo((s) => s.cambiarEstadoBusqueda);
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  if (!datos) {
    return (
      <Pantalla>
        <Encabezado volverA="/titular/busquedas" />
        <EstadoVacio icono={Search} titulo="No encontramos la búsqueda" texto="Vuelve a tus búsquedas y elige otra." />
      </Pantalla>
    );
  }
  const { b, negocio, condiciones, calzan, plan, titular, favoritos, mostrado, bolsaActiva, postulantes } = datos;
  const activa = b.estado === 'activa';
  const lista = soloFavoritos ? calzan.filter((x) => favoritos.includes(x.conductor.id)) : calzan;

  const elegirEstado = (e: EstadoBusqueda) => {
    if (e === b.estado) return;
    const r = cambiarEstado(b.id, e);
    if (!r.ok) {
      mostrarToast(r.error ?? 'No se pudo cambiar.', 'error', 5000);
      return;
    }
    mostrarToast(e === 'activa' ? 'Búsqueda activa.' : e === 'pausada' ? 'Búsqueda en pausa: no aparece en los matches.' : 'Marcada como cubierta. ¡Bien!', 'exito');
  };

  return (
    <Pantalla>
      <Encabezado
        volverA="/titular/busquedas"
        derecha={
          <Boton
            titulo="Editar"
            variante="texto"
            tamano="mediano"
            icono={Pencil}
            onPress={() => router.push({ pathname: '/titular/busqueda/[id]/editar', params: { id: b.id } })}
          />
        }
      />
      <View style={{ gap: 6 }}>
        <Titulo>{negocio.nombre}</Titulo>
        <Text style={[tipo.parrafo, { color: color.textoSecundario }]}>
          {condiciones}
        </Text>
        {b.detalle && !b.detalleOculto ? <Text style={[tipo.secundario, { color: color.textoSuave }]}>{b.detalle}</Text> : null}
      </View>

      <ControlSegmentado opciones={ESTADOS} valor={b.estado} onCambiar={elegirEstado} etiquetaAccesible="Estado de la búsqueda" />

      {titular.suspendido ? <Aviso tono="error" icono="alerta" texto={TEXTO_CUENTA_SUSPENDIDA} /> : null}

      {!activa ? (
        <Aviso
          icono="info"
          texto={b.estado === 'pausada' ? 'En pausa: los conductores no la ven y no hay matches nuevos.' : 'Cubierta: ya tiene conductor. Actívala si lo vuelves a necesitar.'}
        />
      ) : !plan ? (
        <Adelanto n={calzan.length} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Rotulo>{calzan.length === 0 ? 'Matches' : `${plural(calzan.length, 'match', 'matches')}`}</Rotulo>
            {calzan.some((x) => favoritos.includes(x.conductor.id)) ? (
              <ChipFiltro etiqueta="Solo favoritos" marcado={soloFavoritos} onPress={() => setSoloFavoritos((v) => !v)} />
            ) : null}
          </View>
          {lista.length === 0 ? (
            <EstadoVacio
              icono={Users}
              titulo="Aún no hay conductores que calcen"
              texto="Te avisaremos cuando haya. Si bajas los años mínimos o quitas el estacionamiento, puede haber más."
            />
          ) : (
            <View style={{ gap: 10 }}>
              {lista.map((x) => (
                <TarjetaConductor
                  key={x.conductor.id}
                  conductor={x.conductor}
                  busquedaId={b.id}
                  negocioId={b.negocioId}
                  porcentaje={x.resultado.porcentaje}
                  favorito={favoritos.includes(x.conductor.id)}
                  contactoMostrado={mostrado(x.conductor.id)}
                />
              ))}
            </View>
          )}
        </>
      )}

      {bolsaActiva && activa ? (
        <Tarjeta padding={16} separacion={10}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[tipo.fuerte, { color: color.texto, flex: 1 }]}>Bolsa de trabajo</Text>
            <Insignia texto={b.enBolsa ? 'Publicada' : 'No publicada'} tono={b.enBolsa ? 'verde' : 'gris'} icono={null} />
          </View>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Publícala para que también te postulen conductores.</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Boton
              titulo={postulantes > 0 ? `Postulantes · ${postulantes}` : 'Postulantes'}
              variante="contorno"
              tamano="mediano"
              anchoCompleto
              style={{ flex: 1, paddingHorizontal: 10 }}
              onPress={() => router.push({ pathname: '/titular/bolsa/[busqueda]/postulantes', params: { busqueda: b.id } })}
            />
            <Boton
              titulo={b.enBolsa ? 'Editar oferta' : 'Publicar'}
              variante={b.enBolsa ? 'oscuro' : 'principal'}
              tamano="mediano"
              anchoCompleto
              style={{ flex: 1, paddingHorizontal: 10 }}
              onPress={() => router.push({ pathname: '/titular/bolsa/[busqueda]/publicar', params: { busqueda: b.id } })}
            />
          </View>
        </Tarjeta>
      ) : null}
    </Pantalla>
  );
}

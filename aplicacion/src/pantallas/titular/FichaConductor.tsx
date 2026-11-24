// Titular · Ficha del conductor
// Ruta: /titular/conductor/[id]?busqueda=b01
// Con plan: datos del conductor, su teléfono y correo (sin mensajes: 24-nov), favorito, "Mostrar mi
// contacto" (el conductor podrá ver el teléfono y el correo del titular; no se puede deshacer) y Reportar.
// Sin plan: no ve perfiles ni contactos (P11). Al abrirla, el conductor de la demo lo ve en "Quién recibió
// mis datos".
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { TEXTO_CUENTA_SUSPENDIDA, useDemo } from '@/datos/tienda';
import { Aviso, Boton, BotonIcono, Dialogo, Encabezado, EstadoVacio, Pantalla, color, fuente, mostrarToast, radio, tipo } from '@/ui';
import { Check, Flag, Info, Lock, Star, UserRound } from '@/ui/iconos';

import { TarjetaContacto } from '../matches/piezas';
import { CabeceraConductor, DatosConductor, nombreCorto } from './piezas';

export default function FichaConductor() {
  const { id, busqueda } = useLocalSearchParams<{ id: string; busqueda?: string }>();
  const datos = useDerivado((s) => {
    const conductor = sel.conductorVista(s, id);
    const b = busqueda ? s.busquedas.find((x) => x.id === busqueda && x.titularId === s.titularDemo.titularId) : undefined;
    if (!conductor) return null;
    const resultado = b ? sel.simularMatch(s, id, b.id) : null;
    const postulo = b ? s.postulaciones.some((p) => p.busquedaId === b.id && p.conductorId === id && p.estado !== 'descartada') : false;
    return {
      conductor,
      b,
      negocio: b ? sel.negocioPorId(s, b.negocioId) : undefined,
      resultado,
      postulo,
      plan: sel.planDeLaDemo(s),
      titular: sel.titularDeLaDemo(s),
      favorito: s.favoritosTitular.includes(id),
      mostrado: b ? sel.contactoMostradoA(s, b.id, id) : null,
    };
  });
  const abrirFicha = useDemo((s) => s.abrirFichaConductor);
  const alternarFavorito = useDemo((s) => s.alternarFavoritoTitular);
  const mostrarContacto = useDemo((s) => s.mostrarContactoA);
  const [confirmar, setConfirmar] = useState(false);

  const puedeVer = !!datos?.plan && !!datos.b && (!!datos.resultado?.hayMatch || datos.postulo);
  useEffect(() => {
    if (puedeVer && datos?.b) abrirFicha(datos.b.id, id, datos.resultado?.hayMatch ? 'match' : 'postulacion');
    // Solo al abrir la ficha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeVer]);

  const volverA = datos?.b ? (`/titular/busqueda/${datos.b.id}` as const) : '/titular/favoritos';

  if (!datos) {
    return (
      <Pantalla>
        <Encabezado volverA="/titular/busquedas" />
        <EstadoVacio icono={UserRound} titulo="No encontramos a este conductor" texto="Puede que ya no esté disponible." />
      </Pantalla>
    );
  }
  const { conductor: c, b, negocio, resultado, plan, titular, favorito, mostrado } = datos;

  if (!plan) {
    return (
      <Pantalla>
        <Encabezado volverA={volverA} />
        <EstadoVacio
          icono={Lock}
          titulo="Elige un plan para ver conductores"
          texto="Con un plan ves las fichas y los contactos de quienes hacen match con tus búsquedas."
          accion={{ titulo: 'Ver planes', onPress: () => router.push('/titular/planes') }}
        />
      </Pantalla>
    );
  }
  if (!b || !puedeVer) {
    return (
      <Pantalla>
        <Encabezado volverA={volverA} />
        <EstadoVacio
          icono={UserRound}
          titulo="Ya no hace match"
          texto="Este conductor ya no calza con esta búsqueda (cambió su disponibilidad o la búsqueda cambió)."
        />
      </Pantalla>
    );
  }

  const confirmarMostrar = () => {
    setConfirmar(false);
    const r = mostrarContacto(b.id, c.id);
    if (r.ok) mostrarToast(`${nombreCorto(c)} ya puede ver tu contacto.`, 'exito');
    else mostrarToast(r.error ?? 'No se pudo mostrar.', 'error');
  };

  return (
    <Pantalla
      pie={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {mostrado ? (
            <View style={{ flex: 1, minHeight: 56, borderRadius: radio.boton, backgroundColor: color.exitoFondo, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Check size={18} color={color.exitoTexto} strokeWidth={2.4} />
              <Text style={[fuente(700), { fontSize: 15, color: color.exitoTexto }]}>Le mostraste tu contacto</Text>
            </View>
          ) : (
            <Boton titulo="Mostrar mi contacto" variante="principal" onPress={() => setConfirmar(true)} deshabilitado={titular.suspendido} style={{ flex: 1 }} />
          )}
          <BotonIcono
            icono={Star}
            tamano={56}
            etiquetaAccesible={favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
            variante={favorito ? 'acento' : 'borde'}
            relleno={favorito}
            colorIcono={favorito ? undefined : color.textoSecundario}
            onPress={() => {
              alternarFavorito(c.id);
              if (!favorito) mostrarToast('Guardado en favoritos.', 'exito');
            }}
            style={{ borderRadius: radio.boton }}
          />
        </View>
      }>
      <Encabezado volverA={volverA} titulo={negocio?.nombre} />
      <CabeceraConductor c={c} />

      {resultado?.hayMatch ? (
        <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.campo, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[tipo.secundario, fuente(600), { color: color.texto }]}>Coincidencia con tu búsqueda</Text>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 18, color: color.texto }}>{resultado.porcentaje} %</Text>
        </View>
      ) : (
        <Aviso icono="info" texto="Postuló a tu oferta en la bolsa, aunque no hace match con todo lo que pides." />
      )}

      {titular.suspendido ? <Aviso tono="error" icono="alerta" texto={TEXTO_CUENTA_SUSPENDIDA} /> : null}

      <TarjetaContacto telefono={c.celular} correo={c.correo} />
      <DatosConductor c={c} negocioId={b.negocioId} />

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 2 }}>
        <Info size={16} color={color.textoSecundario} strokeWidth={2} style={{ marginTop: 1 }} />
        <Text style={[tipo.ayuda, { color: color.textoSecundario, flex: 1 }]}>Al reunirte, pide la cédula física para confirmar que es la misma persona.</Text>
      </View>

      <Boton
        titulo="Reportar a este conductor"
        variante="texto"
        tamano="mediano"
        icono={Flag}
        onPress={() => router.push({ pathname: '/titular/conductor/[id]/reportar', params: { id: c.id, busqueda: b.id } })}
      />

      <Dialogo
        visible={confirmar}
        titulo={`¿Mostrar tu contacto a ${nombreCorto(c)}?`}
        texto="Podrá ver tu teléfono y tu correo. No se puede deshacer."
        confirmar={{ titulo: 'Mostrar mi contacto', onPress: confirmarMostrar }}
        cancelar={{ onPress: () => setConfirmar(false) }}
      />
    </Pantalla>
  );
}

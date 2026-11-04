// BC2 · Detalle de la oferta
// Ruta: /conductor/bolsa/[id]
// Maqueta: docs/maqueta/BolsaDetalle.dc.html
// "Me interesa" crea una postulación real (el titular ve la ficha, igual que en un match; la
// dirección sigue privada). Mientras el titular no escriba, se puede retirar.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { fechaCorta, iniciales, textoDias, textoTurnos } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import {
  Aviso,
  Avatar,
  Boton,
  Dialogo,
  EstadoVacio,
  FilaDato,
  Insignia,
  Pantalla,
  Separado,
  Tarjeta,
  Titulo,
  color,
  fuente,
  mostrarToast,
  radio,
  tipo,
} from '@/ui';
import { Ban, CircleCheck, LockOpen, MessageSquare, Search, Send } from '@/ui/iconos';

import { retirarPostulacion } from './acciones';
import { estadoVisto, motivoNoPostula, type MotivoNoPostula } from './datos';
import { EncabezadoConTexto, InsigniaDestacada, InsigniaMatch, textoPublicada } from './piezas';

const TEXTO_MOTIVO: Record<MotivoNoPostula, { texto: string; accion: string }> = {
  incompleto: { texto: 'Completa tu perfil para postular.', accion: 'Completar' },
  en_revision: { texto: 'Podrás postular cuando aprobemos tus documentos.', accion: 'Ver' },
  con_observaciones: { texto: 'Revisa tus documentos para postular.', accion: 'Revisar' },
  no_disponible: { texto: 'Activa “Disponible para trabajar” para postular.', accion: 'Activar' },
};

export default function DetalleOferta() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const datos = useDerivado((s) => {
    const busqueda = sel.busquedaPorId(s, id);
    if (!busqueda) return null;
    const titular = sel.titularPorId(s, busqueda.titularId);
    const negocio = sel.negocioPorId(s, busqueda.negocioId);
    if (!titular || !negocio) return null;
    const oferta = sel.ofertasBolsaDelUsuario(s).find((o) => o.id === id) ?? null;
    const postulacion = s.postulaciones.find((p) => p.busquedaId === id && p.conductorId === sel.ID_USUARIO) ?? null;
    return { busqueda, titular, negocio, oferta, postulacion, ...sel.lugar(s, busqueda.comunaId) };
  });
  const motivo = useDerivado(motivoNoPostula);
  const avance = useDerivado(sel.avancePerfil);
  const postular = useDemo((s) => s.postular);
  const cambiarDisponible = useDemo((s) => s.cambiarDisponible);
  const [enviando, setEnviando] = useState(false);
  const [confirmarRetiro, setConfirmarRetiro] = useState(false);

  // La oferta no existe, o ya no está en la bolsa para este conductor y nunca postuló.
  if (!datos || (!datos.oferta && !datos.postulacion)) {
    return (
      <Pantalla>
        <EncabezadoConTexto volverA="/conductor/bolsa" texto="Bolsa de trabajo" />
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <EstadoVacio
            icono={Search}
            titulo="Esta oferta ya no está disponible"
            texto="El titular la cerró o la sacó de la bolsa."
            accion={{ titulo: 'Volver a la bolsa', onPress: () => (router.canGoBack() ? router.back() : router.replace('/conductor/bolsa')) }}
          />
        </View>
      </Pantalla>
    );
  }

  const { busqueda, titular, negocio, oferta, postulacion, comuna, zona } = datos;
  const nombre = sel.nombreTitular(titular);
  const estado = postulacion ? estadoVisto(postulacion, busqueda) : null;
  const destacada = oferta?.destacada ?? false;

  const tocarMeInteresa = () => {
    if (motivo) return;
    setEnviando(true);
    // Una pausa corta para que se note el envío.
    setTimeout(() => {
      const r = postular(busqueda.id);
      setEnviando(false);
      if (r.ok) mostrarToast('Postulaste. Te avisaremos si te escribe.', 'exito');
      else mostrarToast(r.error ?? 'No se pudo postular.', 'error');
    }, 450);
  };

  const resolverMotivo = () => {
    if (motivo === 'no_disponible') {
      cambiarDisponible(true);
      mostrarToast('Listo, ya estás disponible.', 'exito');
    } else if (motivo === 'incompleto') {
      const paso = avance.siguientePaso ?? 1;
      router.push(paso === 1 ? '/conductor/registro/1' : paso === 2 ? '/conductor/registro/2' : paso === 3 ? '/conductor/registro/3' : paso === 4 ? '/conductor/registro/4' : '/conductor/registro/5');
    } else {
      router.push('/conductor/perfil/documentos');
    }
  };

  const retirar = () => {
    if (!postulacion) return;
    const r = retirarPostulacion(postulacion.id);
    setConfirmarRetiro(false);
    if (r.ok) mostrarToast('Retiraste tu postulación.', 'info');
    else mostrarToast(r.error ?? 'No se pudo retirar.', 'error');
  };

  const condiciones = [
    { etiqueta: 'Retiro', valor: [comuna?.nombre, zona?.nombre].filter(Boolean).join(' · ') },
    { etiqueta: 'Turno', valor: textoTurnos(busqueda.turnos) },
    { etiqueta: 'Días', valor: textoDias(busqueda.dias) },
    {
      etiqueta: 'Experiencia mínima',
      valor: busqueda.aniosMinimos > 0 ? `${busqueda.aniosMinimos} ${busqueda.aniosMinimos === 1 ? 'año' : 'años'}` : 'Sin mínimo',
    },
    { etiqueta: 'Estacionamiento', valor: busqueda.exigeEstacionamiento ? 'Lo exige' : 'No lo exige' },
  ];

  const pie = (() => {
    if (!postulacion) {
      return (
        <>
          {motivo ? (
            <Aviso
              tono="acento"
              icono="candado"
              texto={TEXTO_MOTIVO[motivo].texto}
              accion={
                <Boton titulo={TEXTO_MOTIVO[motivo].accion} variante="oscuro" tamano="mediano" onPress={resolverMotivo} style={{ flexShrink: 0 }} />
              }
            />
          ) : null}
          <Boton
            titulo="Me interesa"
            variante="principal"
            icono={Send}
            cargando={enviando}
            deshabilitado={!!motivo}
            onPress={tocarMeInteresa}
          />
        </>
      );
    }
    if (estado === 'te_escribio') {
      return (
        <>
          <EstadoPie icono="mensaje" texto={`${sel.nombreTitular(titular)} te escribió`} />
          <Boton
            titulo="Ver mensajes"
            variante="principal"
            icono={MessageSquare}
            onPress={() => router.push({ pathname: '/conductor/mensajes/[id]', params: { id: busqueda.id } })}
          />
        </>
      );
    }
    if (estado === 'cerrada') {
      return (
        <>
          <EstadoPie icono="cerrada" texto="Postulación cerrada" />
          <Text style={[tipo.ayuda, { color: color.textoSecundario, textAlign: 'center' }]}>
            El titular ya no recibe postulaciones para esta oferta.
          </Text>
        </>
      );
    }
    return (
      <>
        <EstadoPie icono="ok" texto={`Postulaste el ${fechaCorta(postulacion.postuloEl)}`} />
        <Text style={[tipo.ayuda, { color: color.textoSecundario, textAlign: 'center' }]}>
          {estado === 'vista' ? 'El titular ya vio tu ficha. Te avisaremos si te escribe.' : 'Te avisaremos si el titular te escribe.'}
        </Text>
        <Boton titulo="Retirar postulación" variante="texto" tamano="mediano" anchoCompleto onPress={() => setConfirmarRetiro(true)} />
      </>
    );
  })();

  return (
    <Pantalla>
      <EncabezadoConTexto volverA="/conductor/bolsa" texto="Bolsa de trabajo" />

      <View style={{ gap: 10, paddingHorizontal: 4, alignItems: 'flex-start' }}>
        {destacada || oferta?.esMatch ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {destacada ? <InsigniaDestacada grande /> : null}
            {oferta?.esMatch ? <InsigniaMatch porcentaje={oferta.porcentaje} /> : null}
          </View>
        ) : null}
        <Titulo>{negocio.nombre}</Titulo>
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
          {textoPublicada(busqueda.publicadaBolsaEl ?? busqueda.publicadaEl)}
        </Text>
      </View>

      <Tarjeta padding={0} style={{ paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar texto={iniciales(nombre)} tamano={48} />
        <View style={{ flex: 1, minWidth: 0, gap: 6, alignItems: 'flex-start' }}>
          <Text style={[fuente(700), { fontSize: 16, lineHeight: 21, color: color.texto }]}>{nombre}</Text>
          {titular.revisado ? <Insignia texto="Revisado" tono="verde" /> : null}
        </View>
      </Tarjeta>

      <Tarjeta padding={0} separacion={0} style={{ paddingTop: 16, paddingHorizontal: 18, paddingBottom: 4 }}>
        <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto, paddingBottom: 6 }]}>
          Condiciones
        </Text>
        <Separado>
          {condiciones.map((c) => (
            <FilaDato key={c.etiqueta} etiqueta={c.etiqueta} valor={c.valor} />
          ))}
        </Separado>
      </Tarjeta>

      {busqueda.detalle && !busqueda.detalleOculto ? (
        <Tarjeta padding={0} separacion={8} style={{ paddingTop: 16, paddingHorizontal: 18, paddingBottom: 18 }}>
          <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto }]}>
            Detalle de la oferta
          </Text>
          <Text style={[tipo.parrafo, { color: color.textoSuave }]}>“{busqueda.detalle}”</Text>
        </Tarjeta>
      ) : null}

      <Aviso icono={LockOpen} texto="Al postular, el titular verá tu ficha, igual que en un match. Tu dirección sigue privada." />

      <View aria-live="polite" style={{ marginTop: 'auto', paddingTop: 8, gap: 8 }}>
        {pie}
      </View>

      <Dialogo
        visible={confirmarRetiro}
        titulo="¿Retirar tu postulación?"
        texto="El titular ya no la verá en sus postulantes. Puedes volver a postular después."
        confirmar={{ titulo: 'Retirar', peligro: true, onPress: retirar }}
        cancelar={{ titulo: 'Mantener', onPress: () => setConfirmarRetiro(false) }}
      />
    </Pantalla>
  );
}

/** Caja de estado de 56 px (verde "Postulaste el dd/mm", gris "Postulación cerrada"). */
function EstadoPie({ icono, texto }: { icono: 'ok' | 'mensaje' | 'cerrada'; texto: string }) {
  const cerrada = icono === 'cerrada';
  const Icono = icono === 'mensaje' ? MessageSquare : cerrada ? Ban : CircleCheck;
  return (
    <View
      role="status"
      style={{
        minHeight: 56,
        borderRadius: radio.boton,
        backgroundColor: cerrada ? color.borde : color.exitoFondo,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
      }}>
      <Icono size={20} color={cerrada ? color.textoSecundario : color.exito} strokeWidth={2.2} />
      <Text style={[tipo.boton, { color: cerrada ? color.textoSecundario : color.exitoTexto }]}>{texto}</Text>
    </View>
  );
}

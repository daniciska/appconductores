// BT1 · Publicar en la bolsa
// Ruta: /titular/bolsa/[busqueda]/publicar
// Maqueta: docs/maqueta/BolsaPublicar.dc.html
// El titular decide si su búsqueda va a la bolsa y quién la ve, según su plan (Básico: solo match;
// Flota chica: + conductores que elija; Flota: + todos y destacar). Respeta el cupo de ofertas del plan.
import { useMemo, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useDerivado, useEstado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { VisibilidadBolsa } from '@/datos/tipos';
import {
  Aviso,
  Boton,
  EstadoVacio,
  Interruptor,
  Pantalla,
  Presionable,
  Tarjeta,
  color,
  fuente,
  mostrarToast,
  radio,
  tipo,
  volver,
} from '@/ui';
import { CarFront, ChevronRight, Lock, Search, Users } from '@/ui/iconos';

import { conductoresQueVerian, cupoBolsa, perfilesIniciales, resumenPerfiles } from './datos';
import { Cabecera, CuadroIcono, EncabezadoConTexto, PastillaPlan, Rotulo } from './piezas';

const OPCIONES: { id: VisibilidadBolsa; titulo: string; texto: string }[] = [
  { id: 'match', titulo: 'Solo conductores que hacen match', texto: 'Cumplen lo obligatorio y coinciden con tu búsqueda.' },
  { id: 'perfiles', titulo: 'Conductores que tú elijas', texto: 'Tú pones las condiciones: zona, años, turno y días.' },
  { id: 'todos', titulo: 'Todos los conductores', texto: 'Todos los que tienen la licencia para este negocio en tu región.' },
];

/** Enlace de 44 px con flecha, alineado con el texto de la opción ("Elegir condiciones >"). */
function EnlaceFila({ titulo, onPress, borde }: { titulo: string; onPress: () => void; borde?: boolean }) {
  return (
    <Presionable
      role="link"
      onPress={onPress}
      style={{
        minHeight: 44,
        marginLeft: borde ? 16 : 50,
        marginRight: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        borderTopWidth: borde ? 1 : 0,
        borderTopColor: color.separador,
      }}>
      <Text style={[tipo.botonChico, { color: color.texto }]}>{titulo}</Text>
      <ChevronRight size={16} color={color.texto} strokeWidth={2.2} />
    </Presionable>
  );
}

/** Opción de visibilidad: radio, título, texto y pastilla "Incluida" / "Plan Flota". */
function OpcionVisibilidad({
  titulo,
  texto,
  incluida,
  planQueLaIncluye,
  seleccionada,
  onPress,
  children,
}: {
  titulo: string;
  texto: string;
  incluida: boolean;
  planQueLaIncluye: string;
  seleccionada: boolean;
  onPress: () => void;
  children?: ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: incluida ? color.superficie : '#FAFAFA',
        borderWidth: seleccionada ? 1.5 : 1,
        borderColor: seleccionada ? color.bordeFuerte : color.borde,
        borderRadius: radio.boton,
        overflow: 'hidden',
      }}>
      <Presionable
        role="radio"
        aria-checked={seleccionada}
        aria-disabled={!incluida}
        disabled={!incluida}
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: children ? 6 : 14 }}>
        {incluida ? (
          <View
            aria-hidden
            style={{
              width: 22,
              height: 22,
              marginTop: 1,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: seleccionada ? color.oscuro : color.interruptorApagado,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: seleccionada ? color.oscuro : 'transparent' }} />
          </View>
        ) : (
          <View aria-hidden style={{ width: 22, height: 22, marginTop: 1, borderRadius: 11, backgroundColor: color.borde, alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={12} color={color.textoSecundario} strokeWidth={2.6} />
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0, gap: 4, alignItems: 'flex-start' }}>
          <Text style={[tipo.cuerpo, fuente(seleccionada ? 700 : 600), { color: incluida ? color.texto : color.textoSuave }]}>{titulo}</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{texto}</Text>
          <PastillaPlan incluida={incluida} plan={planQueLaIncluye} />
        </View>
      </Presionable>
      {children}
    </View>
  );
}

export default function Publicar() {
  const { busqueda: id = '' } = useLocalSearchParams<{ busqueda: string }>();
  const datos = useDerivado((s) => {
    const b = sel.busquedaPorId(s, id);
    if (!b || b.titularId !== s.titularDemo.titularId) return null;
    return {
      b,
      negocio: sel.negocioPorId(s, b.negocioId),
      condiciones: sel.textoCondiciones(s, b),
      planes: s.catalogos.planes,
    };
  });
  const cupo = useDerivado(cupoBolsa);
  const destacadasUsadas = useDemo((s) => s.titularDemo.destacadasUsadas);
  const publicarEnBolsa = useDemo((s) => s.publicarEnBolsa);
  const quitarDeBolsa = useDemo((s) => s.quitarDeBolsa);
  const destacarOferta = useDemo((s) => s.destacarOferta);
  const quitarDestacado = useDemo((s) => s.quitarDestacado);
  const cambiarEstado = useDemo((s) => s.cambiarEstadoBusqueda);

  const plan = cupo.plan;
  const b = datos?.b;
  const [publicar, setPublicar] = useState<boolean>(true);
  const [quien, setQuien] = useState<VisibilidadBolsa>(() => {
    const v = b?.enBolsa ? b.visibilidadBolsa : 'match';
    return plan?.visibilidades.includes(v) ? v : 'match';
  });
  const [destacar, setDestacar] = useState<boolean>(() => !!b && sel.estaDestacada(b));
  const [guardando, setGuardando] = useState(false);

  // Lo que depende de la elección local (quién la ve) se calcula con useMemo sobre el estado completo.
  const estado = useEstado();
  const perfiles = useMemo(() => (b ? perfilesIniciales(estado, b) : null), [estado, b]);
  const resumen = useMemo(() => (perfiles ? resumenPerfiles(estado, perfiles) : ''), [estado, perfiles]);
  const cuantos = useMemo(
    () => (b ? conductoresQueVerian(estado, b.id, quien, quien === 'perfiles' ? perfiles : null) : 0),
    [estado, b, quien, perfiles],
  );

  if (!datos || !b) {
    return (
      <Pantalla>
        <EncabezadoConTexto volverA="/titular" />
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <EstadoVacio icono={Search} titulo="No encontramos esta búsqueda" accion={{ titulo: 'Volver a mis búsquedas', onPress: () => volver('/titular') }} />
        </View>
      </Pantalla>
    );
  }

  const planQueIncluye = (v: VisibilidadBolsa) =>
    [...datos.planes].sort((x, y) => x.orden - y.orden).find((p) => p.visibilidades.includes(v))?.nombre ?? 'Flota';
  const planConDestacadas = [...datos.planes].sort((x, y) => x.orden - y.orden).find((p) => p.destacadasMes > 0)?.nombre ?? 'Flota';
  const puedeDestacar = !!plan && plan.destacadasMes > 0;
  const yaDestacada = sel.estaDestacada(b);
  const quedanDestacadas = plan ? Math.max(0, plan.destacadasMes - destacadasUsadas) : 0;
  const pausada = b.estado !== 'activa';
  // Ofertas del titular en la bolsa sin contar esta: si ya llegan al máximo del plan, esta no cabe.
  const otras = cupo.usadas - (b.enBolsa ? 1 : 0);
  const sinCupo = !!plan && otras >= cupo.maximo;
  const ofertasSiPublica = !publicar ? otras : sinCupo ? cupo.usadas : otras + 1;
  const irAPlanes = () => router.push('/titular/planes');

  const guardar = () => {
    if (!publicar) {
      if (b.enBolsa) {
        quitarDeBolsa(b.id);
        mostrarToast('Sacaste la oferta de la bolsa.', 'info');
      }
      volver('/titular');
      return;
    }
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      const r = publicarEnBolsa(b.id, { visibilidad: quien, perfiles: quien === 'perfiles' ? perfiles : undefined });
      if (!r.ok) {
        mostrarToast(r.error ?? 'No se pudo publicar.', 'error');
        return;
      }
      if (puedeDestacar && destacar && !yaDestacada) {
        const d = destacarOferta(b.id);
        if (!d.ok) mostrarToast(d.error ?? 'No se pudo destacar.', 'error');
      } else if (!destacar && yaDestacada) {
        quitarDestacado(b.id);
      }
      mostrarToast(b.enBolsa ? 'Cambios guardados.' : 'Tu oferta está en la bolsa.', 'exito');
      volver('/titular');
    }, 450);
  };

  return (
    <Pantalla>
      <EncabezadoConTexto volverA="/titular" texto={plan ? `Tu plan: ${plan.nombre}` : 'Sin plan'} />
      <Cabecera titulo="Publicar en la bolsa" subtitulo="Los conductores verán tu oferta y podrán postular." />

      <Tarjeta padding={16} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <CuadroIcono icono={CarFront} />
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={[tipo.seccion, { color: color.textoSecundario }]}>Tu búsqueda</Text>
          <Text style={[tipo.tituloTarjeta, { color: color.texto }]}>{datos.negocio?.nombre ?? 'Búsqueda'}</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{datos.condiciones}</Text>
        </View>
      </Tarjeta>

      {!plan ? (
        <Aviso
          tono="acento"
          icono="candado"
          texto="Elige un plan para publicar en la bolsa."
          accion={<Boton titulo="Ver planes" variante="oscuro" tamano="mediano" onPress={irAPlanes} style={{ flexShrink: 0 }} />}
        />
      ) : pausada ? (
        <Aviso
          tono="acento"
          icono="info"
          texto="Esta búsqueda está pausada: no aparece en la bolsa."
          accion={
            <Boton
              titulo="Activar"
              variante="oscuro"
              tamano="mediano"
              style={{ flexShrink: 0 }}
              onPress={() => {
                const r = cambiarEstado(b.id, 'activa');
                if (r.ok) mostrarToast('Búsqueda activa otra vez.', 'exito');
                else mostrarToast(r.error ?? 'No se pudo activar.', 'error');
              }}
            />
          }
        />
      ) : null}

      <Tarjeta padding={0} style={{ paddingVertical: 14, paddingHorizontal: 16, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={[tipo.fuerte, { color: color.texto }]}>Publicar en la bolsa de trabajo</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
            {publicar ? 'Aparece en la pestaña Bolsa.' : 'Tu oferta no está en la bolsa.'}
          </Text>
        </View>
        <Interruptor valor={publicar} onCambiar={setPublicar} etiquetaAccesible="Publicar en la bolsa de trabajo" deshabilitado={!plan} />
      </Tarjeta>

      {publicar ? (
        <>
          <View style={{ marginTop: 8, gap: 10 }}>
            <Rotulo>¿Quién puede verla?</Rotulo>
            <View role="radiogroup" aria-label="¿Quién puede verla?" style={{ gap: 8 }}>
              {OPCIONES.map((o) => {
                const incluida = !!plan && plan.visibilidades.includes(o.id);
                const seleccionada = incluida && quien === o.id;
                return (
                  <OpcionVisibilidad
                    key={o.id}
                    titulo={o.titulo}
                    texto={o.texto}
                    incluida={incluida}
                    planQueLaIncluye={planQueIncluye(o.id)}
                    seleccionada={seleccionada}
                    onPress={() => setQuien(o.id)}>
                    {incluida && o.id === 'perfiles' ? (
                      <>
                        {seleccionada ? (
                          <View
                            aria-live="polite"
                            style={{ marginLeft: 50, marginRight: 16, marginTop: 4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radio.boton44, backgroundColor: color.fondo, gap: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Users size={16} color={color.textoSuave} strokeWidth={2} />
                              <Text style={[tipo.ayuda, fuente(600), { color: color.textoSuave }]}>
                                La verán {cuantos} {cuantos === 1 ? 'conductor' : 'conductores'}
                              </Text>
                            </View>
                            {resumen ? <Text style={[tipo.pequeno, { color: color.textoSecundario, paddingLeft: 24 }]}>{resumen}</Text> : null}
                          </View>
                        ) : null}
                        <EnlaceFila
                          titulo="Elegir condiciones"
                          onPress={() => {
                            setQuien('perfiles');
                            router.push({ pathname: '/titular/bolsa/[busqueda]/perfiles', params: { busqueda: b.id } });
                          }}
                        />
                      </>
                    ) : null}
                    {incluida && o.id !== 'perfiles' && seleccionada ? (
                      <View style={{ marginLeft: 50, marginRight: 16, marginBottom: 14, marginTop: -2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Users size={16} color={color.textoSuave} strokeWidth={2} />
                        <Text aria-live="polite" style={[tipo.ayuda, fuente(600), { color: color.textoSuave }]}>
                          La verán {cuantos} {cuantos === 1 ? 'conductor' : 'conductores'}
                        </Text>
                      </View>
                    ) : null}
                    {!incluida ? <EnlaceFila titulo={`Disponible en plan ${planQueIncluye(o.id)}`} onPress={irAPlanes} /> : null}
                  </OpcionVisibilidad>
                );
              })}
            </View>
          </View>

          <Tarjeta padding={0} separacion={0}>
            <View style={{ paddingTop: 14, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <Text style={[tipo.fuerte, { color: puedeDestacar ? color.texto : color.textoSuave }]}>Destacar esta oferta</Text>
                <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
                  {puedeDestacar
                    ? yaDestacada
                      ? 'Aparece primero en la bolsa por 7 días.'
                      : `Aparece primero en la bolsa. Te quedan ${quedanDestacadas} este mes.`
                    : 'Aparece primero en la bolsa.'}
                </Text>
              </View>
              {puedeDestacar ? (
                <Interruptor
                  valor={destacar}
                  onCambiar={setDestacar}
                  etiquetaAccesible="Destacar esta oferta"
                  deshabilitado={!yaDestacada && quedanDestacadas <= 0}
                />
              ) : (
                <View aria-hidden style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: '#E6E6E6', padding: 3 }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color.blanco, alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={12} color={color.textoDeshabilitado} strokeWidth={2.6} />
                  </View>
                </View>
              )}
            </View>
            {!puedeDestacar ? <EnlaceFila borde titulo={`Disponible en plan ${planConDestacadas}`} onPress={irAPlanes} /> : null}
          </Tarjeta>

          {sinCupo && plan ? (
            <Aviso
              tono="error"
              icono="alerta"
              texto={`Tu plan ${plan.nombre} permite ${cupo.maximo} ${cupo.maximo === 1 ? 'oferta' : 'ofertas'} en la bolsa. Saca otra o cambia de plan.`}
              accion={<Boton titulo="Ver planes" variante="oscuro" tamano="mediano" onPress={irAPlanes} style={{ flexShrink: 0 }} />}
            />
          ) : null}
        </>
      ) : (
        <Aviso icono="info" texto="Tu búsqueda sigue activa. La verán solo los conductores que hacen match." />
      )}

      <View style={{ marginTop: 'auto', paddingTop: 8, gap: 12 }}>
        {plan ? (
          <Text aria-live="polite" style={[tipo.ayuda, { color: color.textoSecundario, textAlign: 'center' }]}>
            Ofertas en la bolsa:{' '}
            <Text style={[fuente(700), { color: ofertasSiPublica > cupo.maximo ? color.error : color.texto }]}>
              {Math.max(0, ofertasSiPublica)} de {cupo.maximo}
            </Text>
          </Text>
        ) : null}
        {publicar ? (
          <Boton
            titulo={b.enBolsa ? 'Guardar cambios' : 'Publicar oferta'}
            variante="principal"
            cargando={guardando}
            deshabilitado={!plan || pausada || sinCupo}
            onPress={guardar}
          />
        ) : (
          <Boton titulo="Guardar" variante="oscuro" onPress={guardar} />
        )}
      </View>
    </Pantalla>
  );
}

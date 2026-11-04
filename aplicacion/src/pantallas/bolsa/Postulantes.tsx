// BT3 · BT4 · Postulantes
// Ruta: /titular/bolsa/[busqueda]/postulantes
// Maqueta: docs/maqueta/BolsaPostulantes.dc.html, BolsaPostulantesSinPlan.dc.html
// Con plan (BT3): fichas de quienes postularon, Nuevos / Vistos, ver ficha, escribir y descartar
// (con "Deshacer"). Si escribe al conductor de la demo, se crea el match con origen "Postulación" y la
// conversación aparece en sus Mensajes. Sin plan (BT4): solo cuántos postularon y "Ver planes".
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { haceCuanto, iniciales, textoDias, textoTurnos } from '@/datos/formato';
import { useEstado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import type { ConductorVista } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { EstadoPostulacion, Postulacion } from '@/datos/tipos';
import {
  Aviso,
  Avatar,
  Boton,
  BotonIcono,
  Campo,
  ControlSegmentado,
  EstadoVacio,
  FilaDato,
  HojaInferior,
  Insignia,
  Pantalla,
  Presionable,
  Separado,
  Separador,
  Tarjeta,
  Titulo,
  color,
  fuente,
  mostrarToast,
  radio,
  tipo,
  volver,
} from '@/ui';
import { CircleCheck, Eye, Inbox, Info, Lock, Mail, MessageSquare, Pencil, Phone, Search, Star, UserRound, Users, X } from '@/ui/iconos';

import { escribirAPostulanteDesdeBolsa, restaurarPostulacion } from './acciones';
import { TEXTO_VISIBILIDAD, aniosParaBusqueda, mayuscula, textoTamanos } from './datos';
import { Aparecer, EncabezadoConTexto, InsigniaBolsa } from './piezas';

type Pestana = 'nuevos' | 'vistos';

interface Postulante {
  postulacion: Postulacion;
  conductor: ConductorVista;
  anios: number;
  hayMatch: boolean;
  porcentaje: number;
}

/** "Daniel Rojas": primer nombre y primer apellido. */
function nombreCorto(c: ConductorVista): string {
  const nombres = c.nombres.trim().split(/\s+/).filter(Boolean);
  if (nombres.length === 0 || c.nombre === 'Tú (demo)') return c.esUsuario ? 'Tú' : c.nombre;
  const apellido = c.nombre.trim().split(/\s+/)[nombres.length];
  return [nombres[0], apellido].filter(Boolean).join(' ');
}

/** Conserva el último valor no nulo, para que una hoja muestre su contenido mientras se cierra. */
function useUltimo<T>(v: T | null): T | null {
  const ref = useRef<T | null>(v);
  if (v) ref.current = v;
  return v ?? ref.current;
}

// ---------------------------------------------------------------------------
// Ficha del conductor (hoja inferior)
// ---------------------------------------------------------------------------

function Ficha({
  p: pActual,
  negocioId,
  onCerrar,
  onEscribir,
}: {
  p: Postulante | null;
  negocioId: string;
  onCerrar: () => void;
  onEscribir: () => void;
}) {
  const estado = useEstado();
  const alternarFavorito = useDemo((s) => s.alternarFavoritoTitular);
  const q = useUltimo(pActual);
  if (!q) return null;
  const p = q;
  const c = p.conductor;
  const negocio = sel.negocioPorId(estado, negocioId);
  const favorito = estado.favoritosTitular.includes(c.id);
  const docs = c.documentos;
  const idiomas = c.idiomas.map((k) => estado.catalogos.idiomas.find((i) => i.clave === k)?.nombre ?? k);
  const insignias = [
    docs.cedula.estado === 'aprobado' ? 'Cédula revisada' : null,
    docs.licencia.estado === 'aprobado' ? `Licencia ${c.clasesRevisadas.join(' · ')} revisada` : null,
    docs.hoja_vida.estado === 'aprobado' ? 'Hoja de Vida revisada' : null,
    docs.antecedentes.estado === 'aprobado' ? 'Antecedentes revisados' : null,
  ].filter((x): x is string => !!x);

  return (
    <HojaInferior
      visible={!!pActual}
      onCerrar={onCerrar}
      pie={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Boton titulo="Escribir" variante="principal" icono={MessageSquare} onPress={onEscribir} style={{ flex: 1 }} />
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 4 }}>
        <Avatar texto={iniciales(c.nombre)} tamano={56} forma="circulo" />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Titulo nivel={2}>{c.nombre}</Titulo>
          <Text style={[tipo.secundario, { color: color.textoSecundario }]}>
            {[c.comuna ? `Vive en ${c.comuna.nombre}` : null, c.edad !== null ? `${c.edad} años` : null].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      {insignias.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {insignias.map((t) => (
            <Insignia key={t} texto={t} tono="verde" />
          ))}
        </View>
      ) : null}

      {p.hayMatch ? (
        <View style={{ backgroundColor: color.fondo, borderRadius: radio.campo, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[tipo.secundario, fuente(600), { color: color.texto }]}>También hace match</Text>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 18, color: color.texto }}>{p.porcentaje} %</Text>
        </View>
      ) : null}

      <View style={{ borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingHorizontal: 16, paddingVertical: 2 }}>
        <Separado>
          <FilaDato etiqueta="Experiencia" valor={`${p.anios} ${p.anios === 1 ? 'año' : 'años'} en ${textoTamanos(estado, negocio)}`} />
          <FilaDato etiqueta="Turnos" valor={textoTurnos(c.turnos)} />
          <FilaDato etiqueta="Días" valor={textoDias(c.dias)} />
          <FilaDato etiqueta="Estacionamiento" valor={c.tieneEstacionamiento ? 'Sí' : 'No'} />
          {idiomas.length > 0 ? <FilaDato etiqueta="Idiomas" valor={idiomas.join(', ')} /> : null}
        </Separado>
      </View>

      <View style={{ borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingHorizontal: 16, paddingVertical: 2 }}>
        <Separado>
          <FilaContacto icono={Phone} texto={c.celular || 'Sin teléfono'} />
          <FilaContacto icono={Mail} texto={c.correo || 'Sin correo'} />
        </Separado>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 2 }}>
        <Info size={16} color={color.textoSecundario} strokeWidth={2} style={{ marginTop: 1 }} />
        <Text style={[tipo.ayuda, { color: color.textoSecundario, flex: 1 }]}>
          Al reunirte, pide la cédula física para confirmar que es la misma persona.
        </Text>
      </View>
    </HojaInferior>
  );
}

function FilaContacto({ icono: Icono, texto }: { icono: typeof Phone; texto: string }) {
  return (
    <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icono size={16} color={color.textoSuave} strokeWidth={2} />
      <Text selectable style={[tipo.cuerpo, fuente(600), { color: color.texto, flex: 1 }]} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Escribir (hoja inferior)
// ---------------------------------------------------------------------------

function Escribir({
  p: pActual,
  textoInicial,
  onCerrar,
  onEnviar,
}: {
  p: Postulante | null;
  textoInicial: string;
  onCerrar: () => void;
  onEnviar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState(textoInicial);
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    if (textoInicial) setTexto(textoInicial);
  }, [textoInicial]);
  const p = useUltimo(pActual);
  if (!p) return null;
  const vacio = texto.trim().length === 0;
  return (
    <HojaInferior
      visible={!!pActual}
      onCerrar={onCerrar}
      titulo={`Escribir a ${p.conductor.nombres.split(/\s+/)[0]}`}
      descripcion="Le llega como mensaje privado. Tu contacto sigue oculto."
      pie={
        <Boton
          titulo="Enviar mensaje"
          variante="principal"
          icono={MessageSquare}
          deshabilitado={vacio}
          cargando={enviando}
          onPress={() => {
            setEnviando(true);
            setTimeout(() => {
              setEnviando(false);
              onEnviar(texto.trim());
            }, 400);
          }}
        />
      }>
      <Campo valor={texto} onCambiar={setTexto} multilinea maxLength={500} contador aria-label="Mensaje" placeholder="Escribe tu mensaje" />
    </HojaInferior>
  );
}

// ---------------------------------------------------------------------------
// BT4 · Sin plan
// ---------------------------------------------------------------------------

function SinPlan({ cuantos, encabezado }: { cuantos: number; encabezado: ReactNode }) {
  const filas = [
    { ancho1: '58%', ancho2: '82%', opacidad: 1 },
    { ancho1: '46%', ancho2: '74%', opacidad: 0.9 },
    { ancho1: '62%', ancho2: '68%', opacidad: 0.78 },
    { ancho1: '50%', ancho2: '80%', opacidad: 0.64 },
    { ancho1: '40%', ancho2: '70%', opacidad: 0.5 },
  ].slice(0, Math.max(3, Math.min(5, cuantos)));
  return (
    <Pantalla>
      <EncabezadoConTexto volverA="/titular" texto="Sin plan" />
      <Titulo style={{ paddingHorizontal: 4 }}>Postulantes</Titulo>
      {encabezado}

      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4 }}>
        <View aria-hidden style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: color.oscuro, alignItems: 'center', justifyContent: 'center' }}>
          <Users size={26} color={color.acento} strokeWidth={2} />
        </View>
        <Titulo nivel={2} style={{ flex: 1 }}>
          {cuantos === 0
            ? 'Aún nadie postula a tu oferta'
            : cuantos === 1
              ? '1 conductor postuló a tu oferta'
              : `${cuantos} conductores postularon a tu oferta`}
        </Titulo>
      </View>

      <View aria-hidden style={{ gap: 8 }}>
        {filas.map((f, i) => (
          <View
            key={i}
            style={{
              backgroundColor: color.superficie,
              borderWidth: 1,
              borderColor: color.borde,
              borderRadius: 18,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              opacity: f.opacidad,
            }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color.separador, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#D6D6D6', marginBottom: 3 }} />
              <View style={{ width: 36, height: 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#D6D6D6', marginBottom: -4 }} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={{ height: 10, width: f.ancho1 as `${number}%`, borderRadius: 5, backgroundColor: '#E4E4E4' }} />
              <View style={{ height: 8, width: f.ancho2 as `${number}%`, borderRadius: 4, backgroundColor: '#EFEFEF' }} />
            </View>
            <View style={{ width: 36, height: 36, borderRadius: radio.icono, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} color={color.textoSecundario} strokeWidth={2.2} />
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 8, gap: 14 }}>
        <Text style={[tipo.parrafo, { color: color.textoSuave, textAlign: 'center' }]}>Elige un plan para ver sus fichas y escribirles.</Text>
        <Boton titulo="Ver planes" variante="principal" onPress={() => router.push('/titular/planes')} />
      </View>
    </Pantalla>
  );
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

export default function Postulantes() {
  const { busqueda: id = '' } = useLocalSearchParams<{ busqueda: string }>();
  const estado = useEstado();
  const descartar = useDemo((s) => s.descartarPostulacion);
  const verPostulacion = useDemo((s) => s.verPostulacion);
  const [pestana, setPestana] = useState<Pestana>('nuevos');
  const [deshacer, setDeshacer] = useState<{ id: string; estado: EstadoPostulacion } | null>(null);
  const [fichaDe, setFichaDe] = useState<string | null>(null);
  const [escribirA, setEscribirA] = useState<string | null>(null);
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (reloj.current) clearTimeout(reloj.current);
    },
    [],
  );

  const b = sel.busquedaPorId(estado, id);
  const valida = !!b && b.titularId === estado.titularDemo.titularId;
  const plan = sel.planDeLaDemo(estado);

  const postulantes = useMemo<Postulante[]>(() => {
    if (!b) return [];
    return sel.postulantesDeBusqueda(estado, b.id).map(({ postulacion, conductor }) => {
      const r = sel.simularMatch(estado, conductor.id, b.id);
      return {
        postulacion,
        conductor,
        anios: aniosParaBusqueda(estado, conductor.experiencia, b.negocioId),
        hayMatch: !!r?.hayMatch,
        porcentaje: r?.porcentaje ?? 0,
      };
    });
  }, [estado, b]);

  if (!b || !valida) {
    return (
      <Pantalla>
        <EncabezadoConTexto volverA="/titular" />
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <EstadoVacio icono={Search} titulo="No encontramos esta búsqueda" accion={{ titulo: 'Volver', onPress: () => volver('/titular') }} />
        </View>
      </Pantalla>
    );
  }

  const negocio = sel.negocioPorId(estado, b.negocioId);
  const condiciones = sel.textoCondiciones(estado, b);
  const comuna = sel.comunaPorId(estado, b.comunaId);
  const pausada = b.estado !== 'activa';

  const tarjetaBusqueda = (
    <Tarjeta padding={16} separacion={10}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={[tipo.tituloTarjeta, { color: color.texto }]}>{negocio?.nombre}</Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{condiciones}</Text>
        </View>
        <InsigniaBolsa enBolsa={b.enBolsa} pausada={pausada} />
      </View>
      {plan && b.enBolsa ? (
        <>
          <Separador />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Eye size={16} color={color.textoSuave} strokeWidth={2} />
            <Text style={[tipo.ayuda, { color: color.textoSuave, flex: 1 }]}>La ven: {TEXTO_VISIBILIDAD[b.visibilidadBolsa]}</Text>
          </View>
        </>
      ) : null}
    </Tarjeta>
  );

  // BT4: sin plan solo se ve cuántos postularon.
  if (!plan || !plan.vePostulantes) {
    return <SinPlan cuantos={postulantes.length} encabezado={tarjetaBusqueda} />;
  }

  const nuevos = postulantes.filter((p) => p.postulacion.estado === 'enviada');
  const vistos = postulantes.filter((p) => p.postulacion.estado !== 'enviada');
  const lista = pestana === 'nuevos' ? nuevos : vistos;
  const enFicha = postulantes.find((p) => p.postulacion.id === fichaDe) ?? null;
  const aEscribir = postulantes.find((p) => p.postulacion.id === escribirA) ?? null;
  const textoInicial = aEscribir
    ? `Hola ${aEscribir.conductor.nombres.split(/\s+/)[0]}, vi tu postulación a ${negocio?.nombre ?? 'mi oferta'}${comuna ? ` en ${comuna.nombre}` : ''}. ¿Podemos conversar?`
    : '';

  const descartarPostulante = (p: Postulante) => {
    setDeshacer({ id: p.postulacion.id, estado: p.postulacion.estado });
    descartar(p.postulacion.id);
    if (reloj.current) clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setDeshacer(null), 8000);
  };

  const abrirFicha = (p: Postulante) => {
    if (p.postulacion.estado === 'enviada') verPostulacion(p.postulacion.id);
    setFichaDe(p.postulacion.id);
  };

  const enviar = (texto: string) => {
    if (!aEscribir) return;
    escribirAPostulanteDesdeBolsa(aEscribir.postulacion.id, texto);
    setEscribirA(null);
    mostrarToast(
      aEscribir.conductor.esUsuario ? 'Enviado. Lo verá en Mensajes como conductor.' : `Mensaje enviado a ${aEscribir.conductor.nombres.split(/\s+/)[0]}.`,
      'exito',
    );
  };

  return (
    <Pantalla>
      <EncabezadoConTexto
        volverA="/titular"
        derecha={
          <Presionable
            role="link"
            onPress={() => router.push({ pathname: '/titular/bolsa/[busqueda]/publicar', params: { busqueda: b.id } })}
            style={{ minHeight: 44, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pencil size={16} color={color.texto} strokeWidth={2} />
            <Text style={[tipo.botonChico, { color: color.texto }]}>{b.enBolsa ? 'Editar oferta' : 'Publicar'}</Text>
          </Presionable>
        }
      />
      <Titulo style={{ paddingHorizontal: 4 }}>Postulantes</Titulo>
      {tarjetaBusqueda}

      <ControlSegmentado<Pestana>
        etiquetaAccesible="Filtrar postulantes"
        opciones={[
          { clave: 'nuevos', etiqueta: `Nuevos · ${nuevos.length}` },
          { clave: 'vistos', etiqueta: `Vistos · ${vistos.length}` },
        ]}
        valor={pestana}
        onCambiar={setPestana}
      />

      {deshacer ? (
        <Aparecer>
          <View
            role="status"
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: color.oscuro, borderRadius: radio.campo, paddingLeft: 16, paddingRight: 6, paddingVertical: 4 }}>
            <Text style={[tipo.secundario, fuente(600), { color: color.blanco }]}>Postulación descartada</Text>
            <Presionable
              role="button"
              onPress={() => {
                restaurarPostulacion(deshacer.id, deshacer.estado);
                setDeshacer(null);
              }}
              style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }}>
              <Text style={[tipo.botonChico, { color: color.acento }]}>Deshacer</Text>
            </Presionable>
          </View>
        </Aparecer>
      ) : null}

      {lista.length === 0 ? (
        <Tarjeta padding={0} style={{ paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', gap: 6 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            {pestana === 'nuevos' ? <Inbox size={22} color={color.texto} strokeWidth={1.8} /> : <UserRound size={22} color={color.texto} strokeWidth={1.8} />}
          </View>
          <Text style={[tipo.fuerte, { color: color.texto, textAlign: 'center' }]}>
            {pestana === 'nuevos' ? 'No hay postulantes nuevos' : 'No hay postulantes vistos'}
          </Text>
          <Text style={[tipo.ayuda, { color: color.textoSecundario, textAlign: 'center' }]}>
            {pestana === 'nuevos'
              ? b.enBolsa
                ? 'Te avisamos cuando alguien postule.'
                : 'Publica tu oferta en la bolsa para recibir postulantes.'
              : 'Aquí quedan los que ya revisaste.'}
          </Text>
        </Tarjeta>
      ) : (
        <View style={{ gap: 10 }}>
          {lista.map((p, i) => {
            const c = p.conductor;
            const nombre = nombreCorto(c) || c.nombre;
            return (
              <Aparecer key={p.postulacion.id} retraso={Math.min(i, 6) * 40}>
                <Tarjeta padding={16} separacion={12}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <Avatar texto={iniciales(c.nombre)} tamano={44} forma="circulo" />
                    <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 8, rowGap: 2 }}>
                        <Text style={[fuente(700), { fontSize: 16, lineHeight: 21, color: color.texto }]}>
                          {nombre}
                          {c.esUsuario ? <Text style={[fuente(600), { color: color.textoSecundario }]}> (tú)</Text> : null}
                        </Text>
                        <Text style={[tipo.pequeno, fuente(400), { color: color.textoSecundario }]}>{mayuscula(haceCuanto(p.postulacion.postuloEl))}</Text>
                      </View>
                      <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
                        {[c.comuna ? `Vive en ${c.comuna.nombre}` : null, `${p.anios} ${p.anios === 1 ? 'año' : 'años'} en ${textoTamanos(estado, negocio)}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                    <BotonIcono
                      icono={X}
                      variante="transparente"
                      etiquetaAccesible={`Descartar a ${nombre}`}
                      colorIcono={color.textoSecundario}
                      onPress={() => descartarPostulante(p)}
                      style={{ marginTop: -8, marginRight: -8 }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    {c.estadoVerificacion === 'verificado' ? <Insignia texto="Revisado" tono="verde" /> : null}
                    {p.hayMatch ? (
                      <Insignia texto={`También hace match · ${p.porcentaje} %`} tono="gris" icono={CircleCheck} style={{ backgroundColor: color.separador }} />
                    ) : null}
                    {p.postulacion.estado === 'te_escribio' ? <Insignia texto="Le escribiste" tono="gris" icono={MessageSquare} /> : null}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Boton
                      titulo="Ver ficha"
                      variante="contorno"
                      tamano="mediano"
                      icono={UserRound}
                      anchoCompleto
                      style={{ flex: 1 }}
                      onPress={() => abrirFicha(p)}
                    />
                    <Boton
                      titulo="Escribir"
                      variante="oscuro"
                      tamano="mediano"
                      icono={MessageSquare}
                      anchoCompleto
                      style={{ flex: 1 }}
                      onPress={() => setEscribirA(p.postulacion.id)}
                    />
                  </View>
                </Tarjeta>
              </Aparecer>
            );
          })}
        </View>
      )}

      {postulantes.some((p) => p.conductor.esUsuario) ? (
        <Aviso icono="chispa" texto="Tu conductor de la demo postuló aquí. Escríbele y míralo en sus Mensajes." />
      ) : null}

      <Ficha
        p={enFicha}
        negocioId={b.negocioId}
        onCerrar={() => setFichaDe(null)}
        onEscribir={() => {
          const idP = fichaDe;
          setFichaDe(null);
          setEscribirA(idP);
        }}
      />
      <Escribir p={aEscribir} textoInicial={textoInicial} onCerrar={() => setEscribirA(null)} onEnviar={enviar} />
    </Pantalla>
  );
}

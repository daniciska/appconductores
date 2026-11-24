// Piezas de las pantallas del titular (prototipo del 24-nov): buscador de comuna, adelanto anónimo,
// tarjeta y ficha del conductor, filas de contacto y la guarda del registro.
import { useMemo, useState, type ReactNode } from 'react';
import { Text, View, type TextInputKeyPressEvent } from 'react-native';
import { Redirect, router } from 'expo-router';

import { iniciales, plural, textoDias, textoTurnos } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import type { ConductorVista } from '@/datos/selectores';
import type { Comuna } from '@/datos/tipos';
import { Avatar, Campo, FilaDato, Insignia, Presionable, Separado, Tarjeta, Titulo, color, fuente, radio, sombra, tipo } from '@/ui';
import { ChevronRight, Lock, MapPin } from '@/ui/iconos';

import { buscarComunas, MINIMO_LETRAS } from '../ingreso/buscarComuna';
import { textoRegion } from '../ingreso/comunes';
import { aniosParaBusqueda, textoTamanos } from '../bolsa/datos';

// ---------------------------------------------------------------------------
// Guarda del registro: si falta un paso, lleva a ese paso.
// ---------------------------------------------------------------------------

const RUTA_REGISTRO = {
  celular: '/titular/celular',
  autorizaciones: '/titular/autorizaciones',
  datos: '/titular/datos',
} as const;

/** Muestra la pantalla solo si el titular ya terminó su registro; si no, lo lleva al paso que falta. */
export function ConRegistro({ children }: { children: ReactNode }) {
  const paso = useDerivado(sel.pasoRegistroTitular);
  if (paso) return <Redirect href={RUTA_REGISTRO[paso]} />;
  return <>{children}</>;
}

export const rutaRegistroTitular = (paso: sel.PasoRegistroTitular) => (paso ? RUTA_REGISTRO[paso] : '/titular/busquedas');

/** Vuelve a la lista de búsquedas sin dejar la pila de pantallas llena. */
export function irABusquedas() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/titular/busquedas');
}

// ---------------------------------------------------------------------------
// Comuna de retiro (buscador de comunas, como el Paso 2 temporal del conductor)
// ---------------------------------------------------------------------------

export function CampoComuna({
  comunas,
  nombreRegion,
  comunaId,
  onCambiar,
  error,
}: {
  comunas: Comuna[];
  nombreRegion: (regionId: string) => string | undefined;
  comunaId: string | null;
  onCambiar: (id: string | null) => void;
  error?: string;
}) {
  const inicial = comunaId ? (comunas.find((c) => c.id === comunaId)?.nombre ?? '') : '';
  const [texto, setTexto] = useState(inicial);
  const [editando, setEditando] = useState(false);
  const [resaltada, setResaltada] = useState(0);
  const sugerencias = useMemo(() => (editando ? buscarComunas(texto, comunas) : []), [editando, texto, comunas]);
  const abierta = editando && texto.trim().length >= MINIMO_LETRAS;

  const escribir = (t: string) => {
    setTexto(t);
    onCambiar(null);
    setEditando(true);
    setResaltada(0);
  };
  const elegir = (c: Comuna) => {
    setTexto(c.nombre);
    onCambiar(c.id);
    setEditando(false);
  };
  const teclas = (e: TextInputKeyPressEvent) => {
    if (!abierta || sugerencias.length === 0) return;
    const k = e.nativeEvent.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      setResaltada((i) => (i + (k === 'ArrowDown' ? 1 : -1) + sugerencias.length) % sugerencias.length);
    } else if (k === 'Enter') {
      e.preventDefault();
      elegir(sugerencias[resaltada] ?? sugerencias[0]);
    } else if (k === 'Escape') {
      setEditando(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Campo
        etiqueta="Comuna donde se retira el vehículo"
        obligatorio
        icono={MapPin}
        valor={texto}
        onCambiar={escribir}
        onFocus={() => {
          if (!comunaId && texto.trim().length >= MINIMO_LETRAS) setEditando(true);
        }}
        onKeyPress={teclas}
        placeholder="Escribe la comuna"
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="done"
        role="combobox"
        aria-expanded={abierta}
        aria-controls="comuna-retiro-sugerencias"
        error={error}
      />
      {abierta ? (
        <View
          nativeID="comuna-retiro-sugerencias"
          role={'listbox' as 'list'}
          aria-label="Comunas sugeridas"
          style={[{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.campo, overflow: 'hidden' }, sombra.suave]}>
          {sugerencias.length === 0 ? (
            <View style={{ minHeight: 56, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center' }}>
              <Text style={[tipo.secundario, { color: color.textoSecundario }]}>No encontramos esa comuna. Revisa cómo la escribiste.</Text>
            </View>
          ) : (
            sugerencias.map((c, i) => (
              <Presionable
                key={c.id}
                role="option"
                aria-selected={i === resaltada}
                onPress={() => elegir(c)}
                onHoverIn={() => setResaltada(i)}
                efecto="ninguno"
                style={{
                  minHeight: 56,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: i === resaltada ? color.acentoSuave : color.superficie,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: color.separador,
                }}>
                <MapPin size={18} color={color.textoSecundario} strokeWidth={2} />
                <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <Text numberOfLines={1} style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>
                    {c.nombre}
                  </Text>
                  <Text numberOfLines={1} style={[tipo.ayuda, { color: color.textoSecundario }]}>
                    {textoRegion(nombreRegion(c.regionId))}
                  </Text>
                </View>
              </Presionable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Adelanto anónimo (sin plan): "8 conductores verificados coinciden con tu búsqueda"
// ---------------------------------------------------------------------------

export function Adelanto({ n, accion = 'Elige un plan para ver sus contactos' }: { n: number; accion?: string }) {
  return (
    <View style={{ backgroundColor: color.oscuro, borderRadius: 16, padding: 18, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View aria-hidden style={{ flexDirection: 'row' }}>
          {['#3A3A3A', '#555555', '#707070'].map((fondo, i) => (
            <View
              key={fondo}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: fondo, borderWidth: 2, borderColor: color.oscuro, marginLeft: i === 0 ? 0 : -10 }}
            />
          ))}
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 22, lineHeight: 28, color: color.acento }}>{plural(n, 'conductor', 'conductores')}</Text>
          <Text style={[fuente(400), { fontSize: 14, lineHeight: 19, color: '#BDBDBD' }]}>
            {n === 1 ? 'verificado hace match con tu búsqueda' : 'verificados hacen match con tu búsqueda'}
          </Text>
        </View>
      </View>
      {n > 0 ? (
        <Presionable
          role="link"
          aria-label={accion}
          onPress={() => router.push('/titular/planes')}
          efecto="escala"
          style={{ minHeight: 50, borderRadius: 14, backgroundColor: color.acento, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 }}>
          <Lock size={18} color={color.texto} strokeWidth={2.2} />
          <Text style={[fuente(700), { fontSize: 15, lineHeight: 20, color: color.texto }]}>{accion}</Text>
        </Presionable>
      ) : (
        <Text style={[tipo.ayuda, { color: '#BDBDBD' }]}>Te avisaremos cuando un conductor calce con tu búsqueda.</Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Conductor: tarjeta en la lista de matches y ficha
// ---------------------------------------------------------------------------

/** "Daniel Rojas": primer nombre y primer apellido. */
export function nombreCorto(c: ConductorVista): string {
  const nombres = c.nombres.trim().split(/\s+/).filter(Boolean);
  if (nombres.length === 0 || c.nombre === 'Tú (demo)') return c.esUsuario ? 'Conductor de la demo' : c.nombre;
  const apellido = c.nombre.trim().split(/\s+/)[nombres.length];
  return [nombres[0], apellido].filter(Boolean).join(' ');
}

export function TarjetaConductor({
  conductor: c,
  busquedaId,
  negocioId,
  porcentaje,
  favorito,
  contactoMostrado,
}: {
  conductor: ConductorVista;
  busquedaId: string;
  negocioId: string;
  porcentaje: number;
  favorito: boolean;
  contactoMostrado: boolean;
}) {
  const anios = useDerivado((s) => aniosParaBusqueda(s, c.experiencia, negocioId));
  const detalle = [c.comuna?.nombre, c.edad !== null ? `${c.edad} años` : null, `${anios} ${anios === 1 ? 'año' : 'años'} de experiencia`]
    .filter(Boolean)
    .join(' · ');
  return (
    <Tarjeta
      padding={14}
      separacion={10}
      etiquetaAccesible={`${nombreCorto(c)}, ${porcentaje} % de coincidencia. Ver ficha`}
      onPress={() => router.push({ pathname: '/titular/conductor/[id]', params: { id: c.id, busqueda: busquedaId } })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar texto={iniciales(c.nombre)} tamano={44} forma="circulo" tono={c.esUsuario ? 'acento' : 'oscuro'} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text numberOfLines={1} style={[tipo.fuerte, { color: color.texto }]}>
            {nombreCorto(c)}
          </Text>
          <Text numberOfLines={2} style={[tipo.ayuda, { color: color.textoSecundario }]}>
            {detalle}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 18, lineHeight: 24, color: color.texto }}>{porcentaje} %</Text>
          <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} />
        </View>
      </View>
      {favorito || contactoMostrado || c.esUsuario ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {c.esUsuario ? <Insignia texto="Tu conductor de la demo" tono="amarilla" icono={null} /> : null}
          {favorito ? <Insignia texto="Favorito" tono="acento" icono={null} /> : null}
          {contactoMostrado ? <Insignia texto="Le mostraste tu contacto" tono="gris" icono={null} /> : null}
        </View>
      ) : null}
    </Tarjeta>
  );
}

/** Insignias de los documentos revisados del conductor. */
export function insigniasDocumentos(c: ConductorVista): string[] {
  const d = c.documentos;
  return [
    d.cedula.estado === 'aprobado' ? 'Cédula revisada' : null,
    d.licencia.estado === 'aprobado' ? `Licencia ${c.clasesRevisadas.join(' · ')} revisada` : null,
    d.hoja_vida.estado === 'aprobado' ? 'Hoja de Vida revisada' : null,
    d.antecedentes.estado === 'aprobado' ? 'Antecedentes revisados' : null,
  ].filter((x): x is string => !!x);
}

/** Cabecera de la ficha del conductor: avatar, nombre, comuna, edad y documentos revisados. */
export function CabeceraConductor({ c }: { c: ConductorVista }) {
  const insignias = insigniasDocumentos(c);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar texto={iniciales(c.nombre)} tamano={60} forma="circulo" tono={c.esUsuario ? 'acento' : 'oscuro'} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Titulo nivel={2}>{c.esUsuario && c.nombre === 'Tú (demo)' ? 'Conductor de la demo' : c.nombre}</Titulo>
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
    </View>
  );
}

/** Datos de trabajo del conductor para la búsqueda (experiencia, turnos, días, estacionamiento, idiomas). */
export function DatosConductor({ c, negocioId }: { c: ConductorVista; negocioId: string }) {
  const s = useDerivado((x) => x);
  const negocio = sel.negocioPorId(s, negocioId);
  const anios = aniosParaBusqueda(s, c.experiencia, negocioId);
  const idiomas = c.idiomas.map((k) => s.catalogos.idiomas.find((i) => i.clave === k)?.nombre ?? k);
  return (
    <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingHorizontal: 16, paddingVertical: 2 }}>
      <Separado>
        <FilaDato etiqueta="Experiencia" valor={`${anios} ${anios === 1 ? 'año' : 'años'} en ${textoTamanos(s, negocio)}`} />
        <FilaDato etiqueta="Licencia" valor={c.clasesRevisadas.length ? c.clasesRevisadas.join(' · ') : c.clasesDeclaradas.join(' · ')} />
        <FilaDato etiqueta="Turnos" valor={textoTurnos(c.turnos)} />
        <FilaDato etiqueta="Días" valor={textoDias(c.dias)} />
        <FilaDato etiqueta="Estacionamiento seguro" valor={c.tieneEstacionamiento ? 'Sí' : 'No'} />
        {idiomas.length > 0 ? <FilaDato etiqueta="Idiomas" valor={idiomas.join(', ')} /> : null}
      </Separado>
    </View>
  );
}

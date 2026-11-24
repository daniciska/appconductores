// B2 · Paso 2 TEMPORAL de la app real v1: ¿Dónde vives? con la comuna elegida de una lista.
// Ruta: /conductor/registro/2 (app real)
// Maqueta: docs/maqueta/CondPaso2.dc.html (mismo estilo). Decidido el 9-nov: mientras no exista la
// cuenta de Google Cloud, el conductor elige su comuna de una lista (sin dirección). Igual que el Paso 2
// aprobado salvo: campo "Tu comuna" con sugerencias de comunas (no de direcciones), sin "Depto, casa o
// block", sin insignia "Verificada" y sin la nota de dirección privada. El estacionamiento parte apagado
// o con lo guardado. La zona y la región salen de la comuna.
// Mejoras aprobadas (24-nov): S10 una sola "Tu comuna" (la zona y la región, en gris bajo el campo), se elige
// sola si lo escrito es el nombre completo de una sola comuna y ninguna otra sigue así, un solo error a
// la vez y estacionamiento más claro;
// S04 "Guardar y terminar después"; S11 avisa antes de salir sin guardar (modo edición).
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View, type TextInputKeyPressEvent } from 'react-native';
import { router } from 'expo-router';

import { useAcciones, useVista } from '@/datos/puerto/contexto';
import type { Comuna } from '@/datos/tipos';
import { Boton, Campo, Encabezado, Pantalla, Presionable, color, fuente, radio, sombra, tipo, ZonaInterruptor } from '@/ui';
import { MapPin } from '@/ui/iconos';

import {
  RUTA_PASO,
  irAInicioConductor,
  terminarEdicion,
  useGuardando,
  useModoEdicion,
  usePantallaAbierta,
  useVolverDesdePaso,
  useVolverTrasEditar,
} from './acciones';
import { buscarComunas, comunaQueCalzaSola, MINIMO_LETRAS } from './buscarComuna';
import {
  AlertaObligatorios,
  BotonTerminarDespues,
  CabeceraFormulario,
  equilibrado,
  irAlPrimerError,
  textoRegion,
  useBorradorPaso,
  useRecordarBorrador,
  useSalirSinGuardar,
  useValidarObligatorios,
} from './comunes';

export default function Paso2Comuna() {
  const conductor = useVista((v) => v.conductor);
  const catalogos = useVista((v) => v.catalogos);
  const acciones = useAcciones();
  const editar = useModoEdicion();
  const validar = useValidarObligatorios();
  const volverA = useVolverDesdePaso(2);
  const volverTrasEditar = useVolverTrasEditar();
  const { guardando, ejecutar } = useGuardando();
  const [pulsado, setPulsado] = useState<'continuar' | 'despues'>('continuar');
  const pantalla = usePantallaAbierta();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const nombreComuna = (id: string | null) => (id ? (catalogos.comunas.find((c) => c.id === id)?.nombre ?? '') : '');
  const borrador = useBorradorPaso(2, !editar, {
    texto: nombreComuna(conductor.comunaId),
    comunaId: conductor.comunaId,
    estacionamiento: conductor.tieneEstacionamiento,
  });
  const [texto, setTexto] = useState(borrador.inicial.texto);
  const [comunaId, setComunaId] = useState<string | null>(borrador.inicial.comunaId);
  const [estacionamiento, setEstacionamiento] = useState(borrador.inicial.estacionamiento);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  useRecordarBorrador(borrador, { texto, comunaId, estacionamiento });
  const [editando, setEditando] = useState(false);
  const [resaltada, setResaltada] = useState(0);
  const [intento, setIntento] = useState(false);

  const sugerencias = useMemo(() => (editando ? buscarComunas(texto, catalogos.comunas) : []), [editando, texto, catalogos.comunas]);
  const nombreRegion = (id: string) => catalogos.regiones.find((r) => r.id === id)?.nombre;
  const comuna = comunaId ? catalogos.comunas.find((c) => c.id === comunaId) : undefined;
  const zona = comuna ? catalogos.zonas.find((z) => z.id === comuna.zonaId) : undefined;
  const region = comuna ? catalogos.regiones.find((r) => r.id === comuna.regionId) : undefined;

  const abierta = editando && texto.trim().length >= MINIMO_LETRAS;
  // Un solo error a la vez (S10): el del campo. Si lo escrito no calza con ninguna comuna, la lista (que
  // diría lo mismo) no se muestra; si calza con varias, la lista sigue abierta para elegir.
  const encontradas = texto.trim() ? buscarComunas(texto, catalogos.comunas) : [];
  const error =
    intento && validar && !comunaId
      ? !texto.trim()
        ? 'Ingresa tu comuna.'
        : encontradas.length === 0
          ? 'No encontramos esa comuna. Revisa cómo la escribiste.'
          : 'Elige tu comuna de la lista.'
      : undefined;

  const elegir = (c: Comuna) => {
    setTexto(c.nombre);
    setComunaId(c.id);
    setEditando(false);
  };

  const escribir = (t: string) => {
    setTexto(t);
    setIntento(false);
    setResaltada(0);
    // Si lo escrito es el nombre de una sola comuna y ninguna otra sigue así ("nunoa" → Ñuñoa), se
    // elige sola. "San Pedro" no: puede seguir "de la Paz" (ver comunaQueCalzaSola).
    const sola = comunaQueCalzaSola(t, catalogos.comunas);
    if (sola) {
      elegir(sola);
      return;
    }
    setComunaId(null);
    setEditando(true);
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

  const salir = useSalirSinGuardar(
    editar && JSON.stringify({ comunaId, estacionamiento }) !== JSON.stringify({ comunaId: borrador.inicial.comunaId, estacionamiento: borrador.inicial.estacionamiento }),
    () => continuar('continuar'),
    volverTrasEditar,
  );

  const continuar = (siguiente: 'continuar' | 'despues') =>
    ejecutar(async () => {
      setPulsado(siguiente);
      // Solo se guarda una comuna elegida (de la lista o porque se eligió sola al escribir).
      const id = comunaId;
      if (!id) {
        if (siguiente === 'despues') {
          // Sin comuna no hay nada que guardar en este paso: se sale igual (S04).
          borrador.olvidar();
          irAInicioConductor();
          return;
        }
        if (validar) {
          setIntento(true);
          irAlPrimerError(scrollRef);
        }
        return;
      }
      setErrorGuardar(null);
      const r = await acciones.guardarPaso2({ comunaId: id, tieneEstacionamiento: estacionamiento });
      if (pantalla.salio()) {
        // Salió mientras se guardaba: lo guardado queda, pero no se la lleva a otra pantalla.
        if (r.ok) borrador.olvidar();
        return;
      }
      if (!r.ok) {
        setErrorGuardar(r.error);
        return;
      }
      borrador.olvidar();
      if (editar) {
        salir.soltar();
        terminarEdicion(volverTrasEditar);
      } else if (siguiente === 'despues') irAInicioConductor();
      else router.push(RUTA_PASO[3]);
    });

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado paso={editar ? undefined : 2} volverA={editar ? volverTrasEditar : volverA} onVolver={salir.onVolver} />
      <CabeceraFormulario equilibrar titulo="¿Dónde vives?" subtitulo="Con tu comuna te mostramos vehículos cerca." />

      <View style={{ marginTop: 8, gap: 8 }}>
        <Campo
          etiqueta="Tu comuna"
          obligatorio
          icono={MapPin}
          valor={texto}
          onCambiar={escribir}
          onFocus={() => {
            if (!comunaId && texto.trim().length >= MINIMO_LETRAS) setEditando(true);
          }}
          onKeyPress={teclas}
          placeholder="Escribe tu comuna"
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          role="combobox"
          aria-expanded={abierta}
          aria-controls="comuna-sugerencias"
          error={error}
          ayuda={comuna && !abierta ? [zona?.nombre, textoRegion(region?.nombre)].filter(Boolean).join(' · ') : undefined}
        />

        {abierta && !(error && sugerencias.length === 0) ? (
          <View
            nativeID="comuna-sugerencias"
            // 'listbox' no está en los tipos de React Native, pero react-native-web lo pasa tal cual al HTML.
            role={'listbox' as 'list'}
            aria-label="Comunas sugeridas"
            style={[
              { backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.campo, overflow: 'hidden' },
              sombra.suave,
            ]}>
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

      <ZonaInterruptor
        valor={estacionamiento}
        onCambiar={setEstacionamiento}
        etiquetaAccesible="Tengo un lugar seguro para guardar el vehículo"
        style={{
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.tarjeta,
          paddingVertical: 16,
          paddingHorizontal: 18,
          gap: 16,
        }}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={[tipo.fuerte, { lineHeight: 20, color: color.texto }, equilibrado]}>Tengo un lugar seguro para guardar el vehículo</Text>
          <Text style={[tipo.mensajeCampo, { color: color.textoSecundario }]}>garaje o estacionamiento cerrado</Text>
        </View>
      </ZonaInterruptor>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {error ? <AlertaObligatorios /> : errorGuardar ? <AlertaObligatorios texto={errorGuardar} /> : null}
        <Boton titulo={editar ? 'Guardar cambios' : 'Continuar'} onPress={() => continuar('continuar')} cargando={guardando && pulsado === 'continuar'} />
        {editar ? null : <BotonTerminarDespues onPress={() => continuar('despues')} cargando={guardando && pulsado === 'despues'} />}
      </View>
      {salir.dialogo}
    </Pantalla>
  );
}

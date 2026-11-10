// B2 · Paso 2: dónde vives
// Ruta: /conductor/registro/2
// Maqueta: docs/maqueta/CondPaso2.dc.html
// La dirección se elige de una lista de sugerencias SIMULADAS (en la app real, Google Maps Places).
// De la dirección elegida sale la comuna verificada, con su zona y región (lo único que usa el match).
// La dirección es privada. Este es el Paso 2 de la demo; la app real v1 usa Paso2Comuna (la comuna de
// una lista) mientras no exista la cuenta de Google Cloud.
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View, type TextInputKeyPressEvent } from 'react-native';
import { router } from 'expo-router';

import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
import { Boton, Campo, Encabezado, Insignia, Pantalla, Presionable, Separador, color, fuente, radio, sombra, tipo, ZonaInterruptor } from '@/ui';
import { Lock, MapPin } from '@/ui/iconos';

import { RUTA_PASO, terminarEdicion, useGuardando, useModoEdicion, usePantallaAbierta, useVolverDesdePaso } from './acciones';
import {
  AlertaObligatorios,
  CabeceraFormulario,
  NotaDemo,
  equilibrado,
  irAlPrimerError,
  textoRegion,
  useBorradorPaso,
  useRecordarBorrador,
  useValidarObligatorios,
} from './comunes';
import { sugerirDireccionesDemo, type Sugerencia } from './sugerencias';

export default function Paso2() {
  const conductor = useVista((v) => v.conductor);
  const catalogos = useVista((v) => v.catalogos);
  const acciones = useAcciones();
  const { ejemplo } = useEntorno();
  const editar = useModoEdicion();
  const validar = useValidarObligatorios();
  const volverA = useVolverDesdePaso(2);
  const { guardando, ejecutar } = useGuardando();
  const pantalla = usePantallaAbierta();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const borrador = useBorradorPaso(2, !editar, {
    texto: conductor.direccion,
    comunaId: conductor.comunaId,
    depto: conductor.depto,
    estacionamiento: conductor.tieneEstacionamiento,
  });
  const [texto, setTexto] = useState(borrador.inicial.texto);
  const [comunaId, setComunaId] = useState<string | null>(borrador.inicial.comunaId);
  const [depto, setDepto] = useState(borrador.inicial.depto);
  const [estacionamiento, setEstacionamiento] = useState(borrador.inicial.estacionamiento);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  useRecordarBorrador(borrador, { texto, comunaId, depto, estacionamiento });
  const [editando, setEditando] = useState(false);
  const [resaltada, setResaltada] = useState(0);
  const [intento, setIntento] = useState(false);

  const sugerencias = useMemo(
    () => (editando ? sugerirDireccionesDemo(texto, catalogos.comunas) : []),
    [editando, texto, catalogos.comunas],
  );
  const nombreRegion = (id: string) => catalogos.regiones.find((r) => r.id === id)?.nombre;
  const comuna = comunaId ? catalogos.comunas.find((c) => c.id === comunaId) : undefined;
  const zona = comuna ? catalogos.zonas.find((z) => z.id === comuna.zonaId) : undefined;
  const region = comuna ? catalogos.regiones.find((r) => r.id === comuna.regionId) : undefined;

  const abierta = editando && texto.trim().length >= 3;
  const error = intento && validar && !comunaId ? (texto.trim() ? 'Elige tu dirección de la lista.' : 'Ingresa tu dirección.') : undefined;

  const escribir = (t: string) => {
    setTexto(t);
    setComunaId(null);
    setEditando(true);
    setResaltada(0);
  };

  const elegir = (s: Sugerencia) => {
    setTexto(s.direccion);
    setComunaId(s.comunaId);
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

  const usarEjemplo = () => {
    if (!ejemplo) return;
    setTexto(ejemplo.usuario.direccion);
    setComunaId(ejemplo.usuario.comunaId);
    setDepto(ejemplo.usuario.depto);
    setEditando(false);
  };

  const continuar = () =>
    ejecutar(async () => {
      if (validar && !comunaId) {
        setIntento(true);
        irAlPrimerError(scrollRef);
        return;
      }
      setErrorGuardar(null);
      const r = await acciones.guardarPaso2({ direccion: texto, depto, comunaId, tieneEstacionamiento: estacionamiento });
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
      if (editar) terminarEdicion();
      else router.push(RUTA_PASO[3]);
    });

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado paso={editar ? undefined : 2} volverA={editar ? '/conductor/perfil' : volverA} />
      <CabeceraFormulario equilibrar titulo="¿Dónde vives?" subtitulo="Con tu dirección sabemos tu comuna exacta y te mostramos vehículos cerca.">
        {ejemplo && !texto && !comunaId ? <NotaDemo texto={ejemplo.etiqueta} accion={{ titulo: ejemplo.usarDireccion, onPress: usarEjemplo }} /> : null}
      </CabeceraFormulario>

      <View style={{ marginTop: 8, gap: 8 }}>
        <Campo
          etiqueta="Tu dirección"
          obligatorio
          icono={MapPin}
          valor={texto}
          onCambiar={escribir}
          onFocus={() => {
            if (!comunaId && texto.trim().length >= 3) setEditando(true);
          }}
          onKeyPress={teclas}
          placeholder="Calle y número"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
          autoCapitalize="words"
          returnKeyType="done"
          role="combobox"
          aria-expanded={abierta}
          aria-controls="dir-sugerencias"
          error={error}
        />

        {abierta ? (
          <View
            nativeID="dir-sugerencias"
            // 'listbox' no está en los tipos de React Native, pero react-native-web lo pasa tal cual al HTML.
            role={'listbox' as 'list'}
            aria-label="Direcciones sugeridas"
            style={[
              { backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.campo, overflow: 'hidden' },
              sombra.suave,
            ]}>
            {sugerencias.length === 0 ? (
              <View style={{ minHeight: 56, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center' }}>
                <Text style={[tipo.secundario, { color: color.textoSecundario }]}>No encontramos esa comuna. Revisa cómo la escribiste.</Text>
              </View>
            ) : (
              sugerencias.map((s, i) => (
                <Presionable
                  key={s.comunaId}
                  role="option"
                  aria-selected={i === resaltada}
                  onPress={() => elegir(s)}
                  onHoverIn={() => setResaltada(i)}
                  efecto="ninguno"
                  style={{
                    minHeight: 56,
                    paddingVertical: 15,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: i === resaltada ? color.acentoSuave : color.superficie,
                    borderBottomWidth: 1,
                    borderBottomColor: color.separador,
                  }}>
                  <MapPin size={18} color={color.textoSecundario} strokeWidth={2} />
                  <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                    <Text numberOfLines={1} style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>
                      {s.direccion}
                    </Text>
                    <Text numberOfLines={1} style={[tipo.ayuda, { color: color.textoSecundario }]}>
                      {s.comuna}, {textoRegion(nombreRegion(s.regionId))}
                    </Text>
                  </View>
                </Presionable>
              ))
            )}
            <Text style={[fuente(400), { fontSize: 11, lineHeight: 14, color: color.textoSecundario, textAlign: 'right', paddingTop: 6, paddingBottom: 8, paddingHorizontal: 14 }]}>
              Sugerencias de Google Maps
            </Text>
          </View>
        ) : null}

        {!error ? (
          <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Escribe tu calle y número, y elige tu dirección de la lista.</Text>
        ) : null}
      </View>

      <Campo
        etiqueta="Depto, casa o block"
        notaEtiqueta="(opcional)"
        valor={depto}
        onCambiar={setDepto}
        placeholder="Ej: Depto 402"
        autoComplete="address-line2"
      />

      <View
        style={{
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.tarjeta,
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 10,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Tu comuna (se completa con tu dirección)</Text>
            {comuna ? (
              <>
                <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>
                  {comuna.nombre}
                  {zona ? ` · ${zona.nombre}` : ''}
                </Text>
                <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{textoRegion(region?.nombre)}</Text>
              </>
            ) : (
              <Text style={[tipo.cuerpo, fuente(500), { color: color.textoDeshabilitado }]}>Elige tu dirección para verla</Text>
            )}
          </View>
          {comuna ? <Insignia texto="Verificada" style={{ alignSelf: 'center' }} /> : null}
        </View>
        <Separador />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Lock size={16} color={color.textoSecundario} strokeWidth={2} style={{ marginTop: 1 }} />
          <Text style={[tipo.ayuda, { flex: 1, lineHeight: 18, color: color.textoSuave }]}>
            Tu dirección es privada. Solo tú decides compartirla tras un match.
          </Text>
        </View>
      </View>

      <ZonaInterruptor
        valor={estacionamiento}
        onCambiar={setEstacionamiento}
        etiquetaAccesible="Tengo estacionamiento seguro para el vehículo"
        style={{
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.tarjeta,
          paddingVertical: 16,
          paddingHorizontal: 18,
          gap: 16,
        }}>
        <Text style={[tipo.fuerte, { flex: 1, minWidth: 0, lineHeight: 20, color: color.texto }, equilibrado]}>
          Tengo estacionamiento seguro para el vehículo
        </Text>
      </ZonaInterruptor>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {error ? <AlertaObligatorios /> : errorGuardar ? <AlertaObligatorios texto={errorGuardar} /> : null}
        <Boton titulo={editar ? 'Guardar cambios' : 'Continuar'} onPress={continuar} cargando={guardando} />
      </View>
    </Pantalla>
  );
}

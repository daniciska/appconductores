// B2 · Paso 2 TEMPORAL de la app real v1: ¿Dónde vives? con la comuna elegida de una lista.
// Ruta: /conductor/registro/2 (app real)
// Maqueta: docs/maqueta/CondPaso2.dc.html (mismo estilo). Decidido el 9-nov: mientras no exista la
// cuenta de Google Cloud, el conductor elige su comuna de una lista (sin dirección). Igual que el Paso 2
// aprobado salvo: campo "Tu comuna" con sugerencias de comunas (no de direcciones), sin "Depto, casa o
// block", sin insignia "Verificada" y sin la nota de dirección privada. El estacionamiento parte apagado
// o con lo guardado. La zona y la región salen de la comuna.
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View, type TextInputKeyPressEvent } from 'react-native';
import { router } from 'expo-router';

import { useAcciones, useVista } from '@/datos/puerto/contexto';
import type { Comuna } from '@/datos/tipos';
import { Boton, Campo, Encabezado, Pantalla, Presionable, color, fuente, radio, sombra, tipo, ZonaInterruptor } from '@/ui';
import { MapPin } from '@/ui/iconos';

import { RUTA_PASO, terminarEdicion, useGuardando, useModoEdicion, usePantallaAbierta, useVolverDesdePaso } from './acciones';
import { buscarComunas, MINIMO_LETRAS } from './buscarComuna';
import {
  AlertaObligatorios,
  CabeceraFormulario,
  equilibrado,
  irAlPrimerError,
  textoRegion,
  useBorradorPaso,
  useRecordarBorrador,
  useValidarObligatorios,
} from './comunes';

export default function Paso2Comuna() {
  const conductor = useVista((v) => v.conductor);
  const catalogos = useVista((v) => v.catalogos);
  const acciones = useAcciones();
  const editar = useModoEdicion();
  const validar = useValidarObligatorios();
  const volverA = useVolverDesdePaso(2);
  const { guardando, ejecutar } = useGuardando();
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
  const error = intento && validar && !comunaId ? (texto.trim() ? 'Elige tu comuna de la lista.' : 'Ingresa tu comuna.') : undefined;

  const escribir = (t: string) => {
    setTexto(t);
    setComunaId(null);
    setEditando(true);
    setResaltada(0);
  };

  const elegir = (c: Comuna) => {
    setTexto(c.nombre);
    setComunaId(c.id);
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

  const continuar = () =>
    ejecutar(async () => {
      if (!comunaId) {
        if (validar) {
          setIntento(true);
          irAlPrimerError(scrollRef);
        }
        return;
      }
      setErrorGuardar(null);
      const r = await acciones.guardarPaso2({ comunaId, tieneEstacionamiento: estacionamiento });
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
        />

        {abierta ? (
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

        {!error ? <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Escribe tu comuna y elígela de la lista.</Text> : null}
      </View>

      <View
        style={{
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.tarjeta,
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 2,
        }}>
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Tu comuna</Text>
        {comuna ? (
          <>
            <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>
              {comuna.nombre}
              {zona ? ` · ${zona.nombre}` : ''}
            </Text>
            <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{textoRegion(region?.nombre)}</Text>
          </>
        ) : (
          // Gris de ayuda (contraste 5,3:1 sobre blanco): el gris claro de la maqueta no se lee bien.
          <Text style={[tipo.cuerpo, fuente(500), { color: color.textoSecundario }]}>Elige tu comuna para verla</Text>
        )}
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

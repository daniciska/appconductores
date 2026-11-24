// A4 · Autorizaciones ("Antes de empezar")
// Ruta: /conductor/autorizaciones
// Maqueta: docs/maqueta/CondConsentimientos.dc.html
// Las casillas parten sin marcar (el consentimiento debe ser expreso): solo parte marcada la que la
// persona ya aceptó en esa misma versión. Con la validación de obligatorios apagada (por defecto en la
// demo) se puede continuar igual; en la app real hay que marcarlas todas.
// Casillas y textos (./textosAutorizacion.ts): la demo muestra 3 de las 4 de la maqueta ('prueba-1', sin la de mensajes); la app
// real, una por cada texto obligatorio vigente de la base (en su orden), y registra la aceptación de esos
// mismos. Todas se dibujan igual (partesTexto y enlacesDeLaCasilla): la frase, con su título en negrita,
// marca la casilla al tocarla en cualquier parte; los documentos que nombra ("Términos", "Política de
// privacidad") se abren desde una línea aparte bajo la frase, con 44 px para tocar (S13, 24-nov).
// "Volver": en la demo, al código (A3); en la app real, a Inicio solo si la guardia la deja salir de A4;
// si no, ofrece cerrar sesión (la sesión ya está abierta y no hay otra salida).
// Teclado: Tab llega a cada casilla y a cada enlace; Espacio o Enter marcan la casilla y Enter abre
// el enlace.
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/ui/escala';
import { router } from 'expo-router';

import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
import type { MarcasAutorizacion } from '@/datos/puerto/tipos';
import { Boton, Casilla, Dialogo, Encabezado, HojaInferior, Pantalla, Presionable, Texto, color, fuente, radio, tipo } from '@/ui';

import { RUTA_PASO, irABienvenidaTrasCerrarSesion, irAInicioConductor, useGuardando, usePantallaAbierta } from './acciones';
import { AlertaObligatorios, CabeceraFormulario, useValidarObligatorios } from './comunes';
import {
  TEXTOS_AUTORIZACION,
  casillasA4,
  enlacesDeLaCasilla,
  faltanEnA4,
  marcasIniciales,
  partesTexto,
  textoMarcaTodas,
  volverDeA4,
  type DocumentoLegal,
} from './textosAutorizacion';

export { TEXTOS_AUTORIZACION };

/** Tecla del teclado en la web (react-native-web entrega el evento del navegador). */
type EventoTecla = { key?: string; repeat?: boolean; target?: unknown; currentTarget?: unknown; preventDefault?: () => void };

/**
 * Una casilla: la frase entera marca o desmarca la casilla (tocarla en cualquier parte), y debajo, si la
 * frase nombra documentos, la línea de sus enlaces (S13, 24-nov). Los enlaces quedan fuera de la casilla:
 * cada uno mide al menos 44 px de alto y no se tocan por error al marcar.
 */
function FilaAutorizacion({
  texto,
  marcada,
  error,
  onPress,
  abrir,
}: {
  texto: string;
  marcada: boolean;
  error: boolean;
  onPress: () => void;
  abrir: (d: DocumentoLegal) => void;
}) {
  const enlaces = enlacesDeLaCasilla(texto);
  return (
    <View
      style={{
        backgroundColor: color.superficie,
        borderWidth: marcada || error ? 1.5 : 1,
        borderColor: error ? color.error : marcada ? color.bordeFuerte : color.bordeCampo,
        borderRadius: radio.campo,
        overflow: 'hidden',
      }}>
      <Presionable
        role="checkbox"
        aria-checked={marcada}
        aria-invalid={error}
        aria-label={texto}
        onPress={onPress}
        // Espacio marca la casilla, como en una casilla del navegador (Enter ya lo hace Presionable).
        {...({
          onKeyDown: (e: EventoTecla) => {
            if (e.key !== ' ' || e.target !== e.currentTarget) return;
            e.preventDefault?.();
            if (!e.repeat) onPress();
          },
        } as object)}
        efecto="ninguno"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          paddingTop: 14,
          paddingBottom: enlaces.length ? 4 : 14,
          paddingHorizontal: 16,
          opacity: pressed ? 0.85 : 1,
        })}>
        <View style={{ marginTop: 1 }}>
          <Casilla marcada={marcada} />
        </View>
        <Text style={[tipo.cuerpo, fuente(500), { flex: 1, color: color.texto }]}>
          {partesTexto(texto).map((p, i) =>
            p.tipo === 'negrita' ? (
              <Text key={i} style={fuente(700)}>
                {p.texto}
              </Text>
            ) : (
              p.texto
            ),
          )}
        </Text>
      </Presionable>
      {enlaces.length ? (
        // Bajo la frase y alineados con ella (16 de margen + 20 de casilla + 12 de espacio), uno bajo el
        // otro: en un celular no caben los dos en una línea con 44 px cada uno para tocar.
        <View style={{ alignItems: 'flex-start', paddingLeft: 48, paddingRight: 16, paddingBottom: 4 }}>
          {enlaces.map((e) => (
            <Presionable
              key={e.documento}
              role="link"
              aria-label={e.titulo}
              onPress={() => abrir(e.documento)}
              // Enter abre el documento (en la web, un enlace sin dirección no lo hace solo).
              {...({
                onKeyDown: (k: EventoTecla) => {
                  if (k.key !== 'Enter' || k.target !== k.currentTarget) return;
                  k.preventDefault?.();
                  abrir(e.documento);
                },
              } as object)}
              style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text style={[tipo.cuerpo, fuente(700), { color: color.texto, textDecorationLine: 'underline' }]}>{e.titulo}</Text>
            </Presionable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function Autorizaciones() {
  const guardadas = useVista((v) => v.cuenta.autorizaciones);
  const registrado = useVista((v) => v.conductor.registrado);
  const deLaBase = useVista((v) => v.textosAutorizacion ?? null);
  const acciones = useAcciones();
  const { textosLegales, volverDesdeAutorizaciones, textoCerrarSesion } = useEntorno();
  const validar = useValidarObligatorios();
  const { guardando, ejecutar } = useGuardando();
  const pantalla = usePantallaAbierta();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [salir, setSalir] = useState(false);

  // Demo: sus 3 casillas parten marcadas si ya las aceptó en la demo (como siempre).
  const casillas = casillasA4(deLaBase, guardadas.terminos && guardadas.privacidad && guardadas.compartirFicha);
  const [marcas, setMarcas] = useState<MarcasAutorizacion>(() => marcasIniciales(casillas));
  const [intento, setIntento] = useState(false);
  const [documento, setDocumento] = useState<DocumentoLegal | null>(null);

  const faltan = faltanEnA4(casillas, marcas);
  const mostrarErrores = intento && validar && faltan.length > 0;
  const alternar = (id: string) => setMarcas((m) => ({ ...m, [id]: !m[id] }));
  // App real: a Inicio solo si la guardia la deja salir de A4; si no, "Volver" ofrece cerrar sesión.
  const ofrecerCerrarSesion = volverDeA4(volverDesdeAutorizaciones, registrado, casillas) === 'cerrarSesion';

  const continuar = () =>
    ejecutar(async () => {
      if (validar && faltan.length > 0) {
        setIntento(true);
        return;
      }
      setErrorGuardar(null);
      const r = await acciones.aceptarAutorizaciones(marcas);
      if (pantalla.salio()) return;
      if (!r.ok) {
        setErrorGuardar(r.error);
        return;
      }
      if (registrado) irAInicioConductor();
      else router.push(RUTA_PASO[1]);
    });

  const cerrarSesion = async () => {
    setSalir(false);
    await acciones.cerrarSesion();
    irABienvenidaTrasCerrarSesion();
  };

  return (
    <Pantalla>
      {volverDesdeAutorizaciones === 'cerrarSesion' ? (
        <Encabezado volverA="/conductor/inicio" onVolver={ofrecerCerrarSesion ? () => setSalir(true) : undefined} />
      ) : (
        <Encabezado volverA="/conductor/codigo" />
      )}
      <CabeceraFormulario titulo="Antes de empezar" />

      <View role="group" aria-label="Autorizaciones" style={{ marginTop: 8, gap: 10 }}>
        {casillas.map((c) => (
          <FilaAutorizacion
            key={c.id}
            texto={c.texto}
            marcada={!!marcas[c.id]}
            error={mostrarErrores && !marcas[c.id]}
            onPress={() => alternar(c.id)}
            abrir={setDocumento}
          />
        ))}
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {mostrarErrores ? <AlertaObligatorios texto={textoMarcaTodas(casillas.length)} /> : null}
        {errorGuardar && !mostrarErrores ? <AlertaObligatorios texto={errorGuardar} /> : null}
        <Boton titulo="Continuar" onPress={continuar} cargando={guardando} />
      </View>

      <HojaInferior
        visible={documento !== null}
        onCerrar={() => setDocumento(null)}
        titulo={documento === 'privacidad' ? 'Política de privacidad' : 'Términos y condiciones'}
        pie={<Boton titulo="Entendido" onPress={() => setDocumento(null)} />}>
        <Texto variante="parrafo" tono="secundario">
          {documento === 'privacidad' ? textosLegales.privacidad : textosLegales.terminos}
        </Texto>
        {textosLegales.nota ? <Texto variante="ayuda">{textosLegales.nota}</Texto> : null}
      </HojaInferior>

      {volverDesdeAutorizaciones === 'cerrarSesion' ? (
        <Dialogo
          visible={salir}
          titulo="¿Cerrar sesión?"
          texto={textoCerrarSesion}
          confirmar={{ titulo: 'Cerrar sesión', onPress: () => void cerrarSesion() }}
          cancelar={{ onPress: () => setSalir(false) }}
        />
      ) : null}
    </Pantalla>
  );
}

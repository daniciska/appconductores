// A4 · Autorizaciones ("Antes de empezar")
// Ruta: /conductor/autorizaciones
// Maqueta: docs/maqueta/CondConsentimientos.dc.html
// Las casillas parten sin marcar (el consentimiento debe ser expreso). Con la validación de
// obligatorios apagada (por defecto en la demo) se puede continuar igual; en la app real hay que
// marcar las 4. Textos (./textosAutorizacion.ts): la demo muestra los de la versión de prueba
// 'prueba-1'; la app real, los vigentes de la base, y registra la aceptación de esos mismos.
// "Volver": en la demo, al código (A3); en la app real la sesión ya está abierta, así que ofrece
// cerrar sesión (para entrar con otro número).
// Teclado: Tab llega a cada casilla y a cada enlace; Espacio o Enter marcan la casilla y Enter abre
// el enlace (sin marcar la casilla).
import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAcciones, useEntorno, useVista } from '@/datos/puerto/contexto';
import type { CasillaAutorizacion } from '@/datos/puerto/tipos';
import { Boton, Casilla, Dialogo, Encabezado, HojaInferior, Pantalla, Presionable, Texto, color, fuente, radio, tipo } from '@/ui';

import { RUTA_PASO, irABienvenidaTrasCerrarSesion, irAInicioConductor, useGuardando, usePantallaAbierta } from './acciones';
import { AlertaObligatorios, CabeceraFormulario, useValidarObligatorios } from './comunes';
import { TEXTOS_AUTORIZACION, partesTexto, type DocumentoLegal } from './textosAutorizacion';

export { TEXTOS_AUTORIZACION };

/** Tecla del teclado en la web (react-native-web entrega el evento del navegador). */
type EventoTecla = { key?: string; repeat?: boolean; target?: unknown; currentTarget?: unknown; preventDefault?: () => void; stopPropagation?: () => void };

type Clave = CasillaAutorizacion;
const CLAVES: Clave[] = ['terminos', 'compartir', 'revision', 'mensajes'];

function FilaAutorizacion({
  marcada,
  error,
  onPress,
  etiqueta,
  children,
}: {
  marcada: boolean;
  error: boolean;
  onPress: () => void;
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <Presionable
      role="checkbox"
      aria-checked={marcada}
      aria-invalid={error}
      aria-label={etiqueta}
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
        backgroundColor: color.superficie,
        borderWidth: marcada || error ? 1.5 : 1,
        borderColor: error ? color.error : marcada ? color.bordeFuerte : color.bordeCampo,
        borderRadius: radio.campo,
        paddingVertical: 14,
        paddingHorizontal: 16,
        opacity: pressed ? 0.85 : 1,
      })}>
      <View style={{ marginTop: 1 }}>
        <Casilla marcada={marcada} />
      </View>
      <Text style={[tipo.cuerpo, fuente(500), { flex: 1, lineHeight: 22, color: color.texto }]}>{children}</Text>
    </Presionable>
  );
}

/** Enlace en negrita subrayado dentro del texto de una autorización (no marca la casilla). */
function EnlaceTexto({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  return (
    <Text
      role="link"
      onPress={(e) => {
        e?.stopPropagation?.();
        e?.preventDefault?.();
        onPress();
      }}
      {...({
        // Enter abre la ventana (y no llega a la casilla de alrededor).
        onKeyDown: (e: EventoTecla) => {
          if (e.key !== 'Enter') return;
          e.preventDefault?.();
          e.stopPropagation?.();
          onPress();
        },
      } as object)}
      style={[fuente(700), { color: color.texto, textDecorationLine: 'underline' }]}>
      {titulo}
    </Text>
  );
}

/** Los 4 textos aprobados, tal como en la maqueta (la demo y la app real mientras la base tenga 'prueba-1'). */
function contenidoMaqueta(c: Clave, abrir: (d: DocumentoLegal) => void): ReactNode {
  switch (c) {
    case 'terminos':
      return (
        <>
          Acepto los <EnlaceTexto titulo="Términos" onPress={() => abrir('terminos')} /> y la{' '}
          <EnlaceTexto titulo="Política de privacidad" onPress={() => abrir('privacidad')} />, y declaro ser mayor de 18 años.
        </>
      );
    case 'compartir':
      return <>Autorizo que, cuando haga match, se compartan mi ficha y mi contacto (teléfono y email) con ese titular.</>;
    case 'revision':
      return (
        <>
          <Text style={fuente(700)}>Revisión de mis documentos:</Text> un sistema automático los revisa primero; las dudas y los
          rechazos los decide una persona de nuestro equipo. Puedo pedir otra revisión.
        </>
      );
    case 'mensajes':
      return (
        <>
          <Text style={fuente(700)}>Mensajes:</Text> me comprometo a un trato respetuoso. Las conversaciones se pueden reportar y
          bloquear.
        </>
      );
  }
}

/**
 * El texto de una casilla: el aprobado se dibuja igual que en la maqueta; uno que llegue de la base
 * (por ejemplo, el del abogado) se dibuja con las mismas reglas (título en negrita y enlaces a
 * Términos y Política, ver partesTexto).
 */
function ContenidoTexto({ casilla, texto, abrir }: { casilla: Clave; texto: string; abrir: (d: DocumentoLegal) => void }) {
  if (texto === TEXTOS_AUTORIZACION[casilla]) return <>{contenidoMaqueta(casilla, abrir)}</>;
  return (
    <>
      {partesTexto(texto).map((p, i) =>
        p.tipo === 'negrita' ? (
          <Text key={i} style={fuente(700)}>
            {p.texto}
          </Text>
        ) : p.tipo === 'enlace' ? (
          <EnlaceTexto key={i} titulo={p.texto} onPress={() => abrir(p.documento)} />
        ) : (
          p.texto
        ),
      )}
    </>
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

  const yaAceptadas = guardadas.terminos && guardadas.privacidad && guardadas.compartirFicha;
  const [marcas, setMarcas] = useState<Record<Clave, boolean>>(() => ({
    terminos: yaAceptadas,
    compartir: yaAceptadas,
    revision: yaAceptadas,
    mensajes: yaAceptadas,
  }));
  const [intento, setIntento] = useState(false);
  const [documento, setDocumento] = useState<DocumentoLegal | null>(null);

  const textoDe = (c: Clave) => deLaBase?.[c] ?? TEXTOS_AUTORIZACION[c];
  const faltan = CLAVES.filter((c) => !marcas[c]);
  const mostrarErrores = intento && validar && faltan.length > 0;
  const alternar = (c: Clave) => setMarcas((m) => ({ ...m, [c]: !m[c] }));
  // App real: quien ya está registrado y al día vuelve como siempre; si no, "Volver" ofrece cerrar sesión.
  const ofrecerCerrarSesion = volverDesdeAutorizaciones === 'cerrarSesion' && !(registrado && yaAceptadas);

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
      <CabeceraFormulario titulo="Antes de empezar" subtitulo="Necesitamos tu autorización para cada uno de estos puntos." />

      <View role="group" aria-label="Autorizaciones" style={{ marginTop: 8, gap: 10 }}>
        {CLAVES.map((c) => (
          <FilaAutorizacion key={c} marcada={marcas[c]} error={mostrarErrores && !marcas[c]} onPress={() => alternar(c)} etiqueta={textoDe(c)}>
            <ContenidoTexto casilla={c} texto={textoDe(c)} abrir={setDocumento} />
          </FilaAutorizacion>
        ))}
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {mostrarErrores ? <AlertaObligatorios texto="Marca las 4 autorizaciones para continuar." /> : null}
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

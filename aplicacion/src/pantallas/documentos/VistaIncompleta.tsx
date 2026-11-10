// B6 · Inicio con el perfil incompleto (tarjeta oscura con el avance y la lista de los 5 pasos).
// Maqueta: docs/maqueta/CondInicioIncompleto.dc.html
// La comparten el Inicio de la demo y el de la app real v1. Lo único que cambia es la fila de los
// documentos: en la demo lleva al Paso 5 ("N de 4 subidos"); en la app real v1 todavía no se pueden
// subir ("Próximamente", sin enlace) y, si solo faltan ellos, la tarjeta lo dice y no muestra botón.
import { Text, View } from 'react-native';
import type { Href } from 'expo-router';

import { avancePerfil } from '@/datos/puerto/derivados';
import { useVista, useVistaDerivada } from '@/datos/puerto/contexto';
import { Boton, Presionable, Separado, color, fuente, radio, tipo } from '@/ui';
import { Bell, Check, ChevronRight } from '@/ui/iconos';

import { RUTA_PASO } from '../ingreso/acciones';
import { BarraAvance, GRIS_SOBRE_OSCURO, Nota, TarjetaOscura } from './piezas';

const NOMBRE_SECCION: Record<string, string> = {
  datos: 'Tus datos y licencia',
  direccion: 'Dónde vives',
  experiencia: 'Tu experiencia',
  trabajo: 'Qué trabajo buscas',
  documentos: 'Tus documentos',
};

export type DocumentosInicio =
  /** Demo: la fila lleva al Paso 5 y dice cuántos van subidos. */
  | { modo: 'activo'; subidos: number; ruta: Href }
  /** App real v1: los documentos llegan después ("Próximamente", sin enlace). */
  | { modo: 'proximamente' };

export function VistaIncompleta({ documentos, nota }: { documentos: DocumentosInicio; nota: string }) {
  const avance = useVistaDerivada(avancePerfil);
  const registrado = useVista((v) => v.conductor.registrado);
  const pasos = useVista((v) => v.conductor.pasosListos);
  const siguiente = avance.siguientePaso ?? 5;
  const proximamente = documentos.modo === 'proximamente';
  /** Solo faltan los documentos y todavía no se pueden subir: no hay nada que continuar. */
  const soloDocumentos = proximamente && registrado && siguiente === 5;
  const rutaDe = (paso: number): Href | null =>
    paso <= 4 ? RUTA_PASO[paso as 1 | 2 | 3 | 4] : documentos.modo === 'activo' ? documentos.ruta : null;

  const filas = (['datos', 'direccion', 'experiencia', 'trabajo', 'documentos'] as const).map((id, i) => {
    const listo = pasos[id];
    const estado = listo
      ? id === 'documentos'
        ? 'Enviados'
        : 'Listo'
      : id === 'documentos'
        ? documentos.modo === 'activo'
          ? `${documentos.subidos} de 4 subidos`
          : 'Próximamente'
        : 'Falta';
    return { id, paso: i + 1, nombre: NOMBRE_SECCION[id], listo, estado, ruta: rutaDe(i + 1) };
  });
  const rutaBoton = registrado ? rutaDe(siguiente) : '/conductor/bienvenida';

  return (
    <>
      <TarjetaOscura>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.2, color: color.blanco }}>
            {registrado ? 'Ya estás registrado' : 'Aún no te registras'}
          </Text>
          <Text style={[tipo.secundario, { lineHeight: 21, color: GRIS_SOBRE_OSCURO }]}>
            {soloDocumentos
              ? 'Ya guardaste tus datos. Falta un paso: tus documentos, que pronto podrás subir aquí.'
              : registrado
                ? 'Completa tu perfil para empezar a aparecer en los matches.'
                : 'Crea tu perfil para empezar a aparecer en los matches.'}
          </Text>
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[tipo.ayuda, { color: GRIS_SOBRE_OSCURO }]}>
              {avance.listos} de {avance.total} pasos listos
            </Text>
            <Text style={[tipo.ayuda, { color: GRIS_SOBRE_OSCURO }]}>{avance.porcentaje}%</Text>
          </View>
          <BarraAvance
            valor={avance.listos / avance.total}
            etiqueta="Avance del perfil"
            maximo={avance.total}
            actual={avance.listos}
          />
        </View>
        {rutaBoton ? (
          <Boton titulo={registrado ? 'Continuar mi perfil' : 'Crear mi perfil'} variante="principal" href={rutaBoton} />
        ) : null}
      </TarjetaOscura>

      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, paddingVertical: 6, paddingHorizontal: 16 }}>
        <Separado>
          {filas.map((f) => {
            const conEnlace = !f.listo && registrado && f.ruta !== null;
            const contenido = (
              <>
                {f.listo ? (
                  <View aria-hidden style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color.exitoFondo, alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={15} color={color.exito} strokeWidth={2.8} />
                  </View>
                ) : (
                  <View aria-hidden style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.interruptorApagado }} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{f.nombre}</Text>
                  <Text style={[tipo.ayuda, f.listo ? [fuente(600), { color: color.exitoTexto }] : { color: color.textoSecundario }]}>
                    {f.estado}
                  </Text>
                </View>
                {f.listo || f.ruta === null ? null : <ChevronRight size={18} color={color.texto} strokeWidth={2} />}
              </>
            );
            const estilo = { minHeight: 56, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 6 };
            return conEnlace && f.ruta ? (
              <Presionable key={f.id} role="button" aria-label={`${f.nombre}: ${f.estado}`} href={f.ruta} style={estilo}>
                {contenido}
              </Presionable>
            ) : (
              <View key={f.id} style={estilo}>
                {contenido}
              </View>
            );
          })}
        </Separado>
      </View>

      <Nota icono={Bell} tono="suave">
        {nota}
      </Nota>
    </>
  );
}

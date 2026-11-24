// B4 · Paso 4: qué trabajo buscas
// Ruta: /conductor/registro/4
// Maqueta: docs/maqueta/CondPaso4.dc.html
// Negocios ACTIVOS (negocio e industria activos en el catálogo), agrupados por industria. Los que la
// licencia declarada no permite aparecen en gris con "Pide licencia X". Turno y días: filtro M3 y
// variable M7 del match. A dónde lleva "Continuar" lo decide la ruta (`alTerminar`): en la demo, al
// Paso 5; en la app real v1, a Inicio. Lo guardado de un negocio que hoy no se muestra no se toca.
// Mejoras aprobadas (24-nov): S02 botón "¿Tienes otra clase de licencia? Agrégala" (abre "Tus datos" y vuelve
// aquí con lo marcado), aviso sin "Paso 1" y sin rojo en lo que no se puede marcar (si no se puede
// marcar ninguno, el aviso de la licencia es el único mensaje sobre los negocios); S04 "Guardar y
// terminar después"; S11 avisa antes de salir sin guardar (modo edición).
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { textoPideLicencia } from '@/datos/match';
import { useAcciones, useVista, useVistaDerivada } from '@/datos/puerto/contexto';
import { negocioPermitidoPorDeclaradas, negociosPorIndustria } from '@/datos/puerto/derivados';
import type { Dia, Turno } from '@/datos/tipos';
import { Aviso, Boton, Chip, Encabezado, FilaCheck, OpcionIcono, Pantalla, Texto, color, fuente, tipo, type LucideIcon } from '@/ui';
import { Moon, Sun } from '@/ui/iconos';

import { irAInicioConductor, terminarEdicion, useGuardando, useModoEdicion, usePantallaAbierta, useVolverDesdePaso, useVolverTrasEditar } from './acciones';
import {
  AlertaObligatorios,
  BotonTerminarDespues,
  BotonTexto,
  CabeceraFormulario,
  EtiquetaGrupo,
  irAlPrimerError,
  useBorradorPaso,
  useRecordarBorrador,
  useSalirSinGuardar,
  useValidarObligatorios,
} from './comunes';

const ICONO_TURNO: Record<string, LucideIcon> = { dia: Sun, noche: Moon };

export default function Paso4({ alTerminar }: { /** Después de guardar (sin editar): a dónde sigue. */ alTerminar: () => void }) {
  const guardados = useVista((v) => v.conductor.negocios);
  const turnosGuardados = useVista((v) => v.conductor.turnos);
  const diasGuardados = useVista((v) => v.conductor.dias);
  const turnosCatalogo = useVista((v) => v.catalogos.turnos);
  const diasCatalogo = useVista((v) => v.catalogos.dias);
  const acciones = useAcciones();
  const editar = useModoEdicion();
  const grupos = useVistaDerivada((v) => negociosPorIndustria(v, true));
  const permitidos = useVistaDerivada((v) => v.catalogos.negocios.filter((n) => negocioPermitidoPorDeclaradas(v, n.id)).map((n) => n.id));
  const validar = useValidarObligatorios();
  const volverA = useVolverDesdePaso(4);
  const volverTrasEditar = useVolverTrasEditar();
  const { guardando, ejecutar } = useGuardando();
  const [pulsado, setPulsado] = useState<'continuar' | 'despues'>('continuar');
  const pantalla = usePantallaAbierta();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const visibles = grupos.flatMap((g) => g.negocios.map((n) => n.id));
  const borrador = useBorradorPaso(4, !editar, {
    negocios: guardados.filter((id) => permitidos.includes(id)),
    turnos: turnosGuardados,
    dias: diasGuardados,
  });
  const [negocios, setNegocios] = useState<string[]>(borrador.inicial.negocios);
  const [turnos, setTurnos] = useState<Turno[]>(borrador.inicial.turnos);
  const [dias, setDias] = useState<Dia[]>(borrador.inicial.dias);
  const [intento, setIntento] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  useRecordarBorrador(borrador, { negocios, turnos, dias });

  const marcadosVisibles = negocios.filter((id) => visibles.includes(id) && permitidos.includes(id));
  const hayBloqueados = visibles.some((id) => !permitidos.includes(id));
  const todosBloqueados = visibles.length > 0 && visibles.every((id) => !permitidos.includes(id));
  const errores = {
    negocios: marcadosVisibles.length === 0 ? 'Marca al menos un negocio.' : null,
    turnos: turnos.length === 0 ? 'Marca al menos un turno.' : null,
    dias: dias.length === 0 ? 'Marca al menos un día.' : null,
  };
  const ver = intento && validar;
  const hayErrores = Object.values(errores).some(Boolean);
  // S02: si la licencia no permite ningún negocio, no se pide "Marca al menos un negocio" (no se puede):
  // el aviso de la licencia pasa a rojo y es el único mensaje sobre los negocios.
  const errorNegocios = todosBloqueados ? null : errores.negocios;
  const otrosErrores = !!(errorNegocios || errores.turnos || errores.dias);

  const alternar = <T,>(lista: T[], valor: T): T[] => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

  const ordenar = (l: string[]) => [...l].sort();
  const cambiado =
    JSON.stringify([ordenar(negocios.filter((id) => permitidos.includes(id))), ordenar(turnos), ordenar(dias)]) !==
    JSON.stringify([ordenar(borrador.inicial.negocios), ordenar(borrador.inicial.turnos), ordenar(borrador.inicial.dias)]);
  const salir = useSalirSinGuardar(editar && cambiado, () => continuar('continuar'), volverTrasEditar);

  /** S02: abre "Tus datos" para agregar una clase y, al guardar, vuelve aquí con lo ya marcado. */
  const agregarClase = () => router.push({ pathname: '/conductor/registro/1', params: { editar: '1', volver: '4' } });

  const continuar = (siguiente: 'continuar' | 'despues') =>
    ejecutar(async () => {
      setPulsado(siguiente);
      // "Guardar y terminar después" guarda lo que haya, sin alerta (S04).
      if (siguiente === 'continuar' && validar && hayErrores) {
        setIntento(true);
        irAlPrimerError(scrollRef);
        return;
      }
      setErrorGuardar(null);
      // Se guardan los marcados que la licencia permite (los negocios apagados en el catálogo no se tocan).
      const r = await acciones.guardarPaso4({
        negocios: negocios.filter((id) => permitidos.includes(id)),
        turnos,
        dias,
        parcial: siguiente === 'despues',
      });
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
      if (editar) terminarEdicion(volverTrasEditar);
      else if (siguiente === 'despues') irAInicioConductor();
      else alTerminar();
    });

  const ordenDias = diasCatalogo.map((d) => d.clave as Dia);

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado paso={editar ? undefined : 4} volverA={editar ? volverTrasEditar : volverA} onVolver={salir.onVolver} />
      <CabeceraFormulario equilibrar titulo="¿Qué trabajo buscas?" subtitulo="Solo verás vehículos que calcen con lo que marques aquí." />

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo
          titulo="¿En qué negocio te gustaría trabajar?"
          obligatorio
          ayuda="Puedes marcar varios."
          error={ver && errorNegocios}
        />
        {grupos.length === 0 ? (
          <Aviso icono="info" texto="Por ahora no hay negocios abiertos. Te avisaremos cuando haya." />
        ) : (
          <View style={{ gap: 8 }}>
            {grupos.map((g, gi) => (
              <View key={g.industria.id} role="group" aria-label={g.industria.nombre} style={{ gap: 8 }}>
                <Texto variante="seccion" style={{ paddingHorizontal: 4, paddingTop: gi === 0 ? 4 : 12 }}>
                  {g.industria.nombre}
                </Texto>
                {g.negocios.map((n) => {
                  const permitido = permitidos.includes(n.id);
                  return (
                    <FilaCheck
                      key={n.id}
                      titulo={n.nombre}
                      ejemplo={n.ejemplo}
                      marcada={permitido && negocios.includes(n.id)}
                      deshabilitada={!permitido}
                      nota={permitido ? undefined : textoPideLicencia(n)}
                      onPress={() => setNegocios((l) => alternar(l, n.id))}
                      // El rojo solo en los que se pueden marcar (S02).
                      style={ver && errores.negocios && permitido ? { borderColor: color.error } : undefined}
                    />
                  );
                })}
              </View>
            ))}
            {todosBloqueados ? (
              <Aviso icono={ver ? 'alerta' : 'info'} tono={ver ? 'error' : 'neutro'} style={{ marginTop: 4 }}>
                {/* S13: a 15 px, como los demás mensajes bajo un campo. */}
                <Text style={[tipo.mensajeCampo, ver ? fuente(600) : null, { color: ver ? color.error : color.textoSuave }]}>
                  Con tu licencia no puedes trabajar en estos negocios.
                </Text>
              </Aviso>
            ) : null}
            {hayBloqueados ? <BotonTexto titulo="¿Tienes otra clase de licencia? Agrégala" onPress={agregarClase} /> : null}
          </View>
        )}
      </View>

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="Preferencia de turno" obligatorio ayuda="Puedes marcar los dos." error={ver && errores.turnos} />
        <View role="group" aria-label="Preferencia de turno" style={{ flexDirection: 'row', gap: 8 }}>
          {turnosCatalogo.map((t) => (
            <OpcionIcono
              key={t.clave}
              titulo={t.nombre}
              icono={ICONO_TURNO[t.clave] ?? Sun}
              seleccionada={turnos.includes(t.clave as Turno)}
              onPress={() => setTurnos((l) => alternar(l, t.clave as Turno))}
              style={ver && errores.turnos ? { borderColor: color.error } : undefined}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="Días que puedes trabajar" obligatorio ayuda="Marca todos los que puedas." error={ver && errores.dias} />
        <View role="group" aria-label="Días que puedes trabajar" style={{ flexDirection: 'row', gap: 6 }}>
          {diasCatalogo.map((d) => (
            <Chip
              key={d.clave}
              forma="cuadrado"
              etiqueta={d.corto ?? d.nombre.slice(0, 2)}
              etiquetaAccesible={d.nombre}
              seleccionado={dias.includes(d.clave as Dia)}
              onPress={() =>
                setDias((l) => {
                  const nueva = alternar(l, d.clave as Dia);
                  return ordenDias.filter((x) => nueva.includes(x));
                })
              }
              style={[{ flex: 1 }, ver && errores.dias ? { borderColor: color.error } : null]}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {ver && otrosErrores ? <AlertaObligatorios /> : errorGuardar ? <AlertaObligatorios texto={errorGuardar} /> : null}
        <Boton titulo={editar ? 'Guardar cambios' : 'Continuar'} onPress={() => continuar('continuar')} cargando={guardando && pulsado === 'continuar'} />
        {editar ? null : <BotonTerminarDespues onPress={() => continuar('despues')} cargando={guardando && pulsado === 'despues'} />}
      </View>
      {salir.dialogo}
    </Pantalla>
  );
}

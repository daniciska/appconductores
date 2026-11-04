// B4 · Paso 4: qué trabajo buscas
// Ruta: /conductor/registro/4
// Maqueta: docs/maqueta/CondPaso4.dc.html
// Negocios ACTIVOS (negocio e industria activos en el panel), agrupados por industria. Los que la
// licencia declarada no permite aparecen en gris con "Pide licencia X". Turno y días: filtro M3 y
// variable M7 del match.
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { useDerivado, useNegociosPorIndustria } from '@/datos/hooks';
import { textoPideLicencia } from '@/datos/match';
import { negocioPermitidoPorDeclaradas } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { Dia, Turno } from '@/datos/tipos';
import { Aviso, Boton, Chip, Encabezado, FilaCheck, OpcionIcono, Pantalla, Texto, color, type LucideIcon } from '@/ui';
import { Moon, Sun } from '@/ui/iconos';

import { RUTA_PASO, terminarEdicion, useModoEdicion, volverDesdePaso } from './acciones';
import { AlertaObligatorios, CabeceraFormulario, EtiquetaGrupo, irAlPrimerError, useBorradorPaso, useRecordarBorrador, useValidarObligatorios } from './comunes';

const ICONO_TURNO: Record<string, LucideIcon> = { dia: Sun, noche: Moon };

export default function Paso4() {
  const guardados = useDemo((s) => s.conductor.negocios);
  const turnosGuardados = useDemo((s) => s.conductor.turnos);
  const diasGuardados = useDemo((s) => s.conductor.dias);
  const turnosCatalogo = useDemo((s) => s.catalogos.turnos);
  const diasCatalogo = useDemo((s) => s.catalogos.dias);
  const guardarPaso4 = useDemo((s) => s.guardarPaso4);
  const editar = useModoEdicion();
  const grupos = useNegociosPorIndustria(true);
  const permitidos = useDerivado((s) => s.catalogos.negocios.filter((n) => negocioPermitidoPorDeclaradas(s, n.id)).map((n) => n.id));
  const validar = useValidarObligatorios();

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
  const errores = {
    negocios: marcadosVisibles.length === 0 ? 'Marca al menos un negocio.' : null,
    turnos: turnos.length === 0 ? 'Marca al menos un turno.' : null,
    dias: dias.length === 0 ? 'Marca al menos un día.' : null,
  };
  const ver = intento && validar;
  const hayErrores = Object.values(errores).some(Boolean);

  const alternar = <T,>(lista: T[], valor: T): T[] => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

  const continuar = () => {
    if (validar && hayErrores) {
      setIntento(true);
      irAlPrimerError(scrollRef);
      return;
    }
    // Se guardan los marcados que la licencia permite (los negocios apagados en el panel no se tocan).
    guardarPaso4({ negocios: negocios.filter((id) => permitidos.includes(id)), turnos, dias });
    borrador.olvidar();
    if (editar) terminarEdicion();
    else router.push(RUTA_PASO[5]);
  };

  const ordenDias = diasCatalogo.map((d) => d.clave as Dia);

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado paso={editar ? undefined : 4} volverA={editar ? '/conductor/perfil' : volverDesdePaso(4)} />
      <CabeceraFormulario equilibrar titulo="¿Qué trabajo buscas?" subtitulo="Solo verás vehículos que calcen con lo que marques aquí." />

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo
          titulo="¿En qué negocio te gustaría trabajar?"
          obligatorio
          ayuda="Puedes marcar varios. Los que tu licencia no permite aparecen en gris."
          error={ver && errores.negocios}
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
                      style={ver && errores.negocios ? { borderColor: color.error } : undefined}
                    />
                  );
                })}
              </View>
            ))}
            {visibles.length > 0 && visibles.every((id) => !permitidos.includes(id)) ? (
              <Aviso icono="info" texto="Con las clases que marcaste en el Paso 1 no puedes trabajar en estos negocios." style={{ marginTop: 4 }} />
            ) : null}
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
        {ver && hayErrores ? <AlertaObligatorios /> : null}
        <Boton titulo={editar ? 'Guardar cambios' : 'Continuar'} onPress={continuar} />
      </View>
    </Pantalla>
  );
}

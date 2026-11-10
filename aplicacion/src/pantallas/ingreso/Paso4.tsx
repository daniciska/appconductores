// B4 · Paso 4: qué trabajo buscas
// Ruta: /conductor/registro/4
// Maqueta: docs/maqueta/CondPaso4.dc.html
// Negocios ACTIVOS (negocio e industria activos en el catálogo), agrupados por industria. Los que la
// licencia declarada no permite aparecen en gris con "Pide licencia X". Turno y días: filtro M3 y
// variable M7 del match. A dónde lleva "Continuar" lo decide la ruta (`alTerminar`): en la demo, al
// Paso 5; en la app real v1, a Inicio. Lo guardado de un negocio que hoy no se muestra no se toca.
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';

import { textoPideLicencia } from '@/datos/match';
import { useAcciones, useVista, useVistaDerivada } from '@/datos/puerto/contexto';
import { negocioPermitidoPorDeclaradas, negociosPorIndustria } from '@/datos/puerto/derivados';
import type { Dia, Turno } from '@/datos/tipos';
import { Aviso, Boton, Chip, Encabezado, FilaCheck, OpcionIcono, Pantalla, Texto, color, type LucideIcon } from '@/ui';
import { Moon, Sun } from '@/ui/iconos';

import { terminarEdicion, useGuardando, useModoEdicion, usePantallaAbierta, useVolverDesdePaso } from './acciones';
import { AlertaObligatorios, CabeceraFormulario, EtiquetaGrupo, irAlPrimerError, useBorradorPaso, useRecordarBorrador, useValidarObligatorios } from './comunes';

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
  const { guardando, ejecutar } = useGuardando();
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
  const errores = {
    negocios: marcadosVisibles.length === 0 ? 'Marca al menos un negocio.' : null,
    turnos: turnos.length === 0 ? 'Marca al menos un turno.' : null,
    dias: dias.length === 0 ? 'Marca al menos un día.' : null,
  };
  const ver = intento && validar;
  const hayErrores = Object.values(errores).some(Boolean);

  const alternar = <T,>(lista: T[], valor: T): T[] => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

  const continuar = () =>
    ejecutar(async () => {
      if (validar && hayErrores) {
        setIntento(true);
        irAlPrimerError(scrollRef);
        return;
      }
      setErrorGuardar(null);
      // Se guardan los marcados que la licencia permite (los negocios apagados en el catálogo no se tocan).
      const r = await acciones.guardarPaso4({ negocios: negocios.filter((id) => permitidos.includes(id)), turnos, dias });
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
      else alTerminar();
    });

  const ordenDias = diasCatalogo.map((d) => d.clave as Dia);

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado paso={editar ? undefined : 4} volverA={editar ? '/conductor/perfil' : volverA} />
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
        {ver && hayErrores ? <AlertaObligatorios /> : errorGuardar ? <AlertaObligatorios texto={errorGuardar} /> : null}
        <Boton titulo={editar ? 'Guardar cambios' : 'Continuar'} onPress={continuar} cargando={guardando} />
      </View>
    </Pantalla>
  );
}

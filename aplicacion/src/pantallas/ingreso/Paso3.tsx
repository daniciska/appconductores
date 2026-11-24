// B3 · Paso 3: experiencia
// Ruta: /conductor/registro/3
// Maqueta: docs/maqueta/CondPaso3.dc.html
// 7 categorías (catálogo de tamaños) con años manejando cada una. "Idiomas que hablas" es opcional y
// no cuenta en el match.
// Mejoras aprobadas (24-nov): S06 los años se escriben con el teclado (de 1 a 50) y se mantienen los
// botones − y + para ajustar; aparecen solo al marcar el vehículo. S07 "¿Qué vehículos has manejado?"
// es obligatorio; S04 "Guardar y terminar después"; S11 avisa antes de salir sin guardar (modo edición).
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { useAcciones, useVista } from '@/datos/puerto/contexto';
import { Boton, Chip, Encabezado, Pantalla, Presionable, color, fuente, radio, tipo } from '@/ui';
import { ChevronDown, Minus, Plus } from '@/ui/iconos';

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
import {
  AlertaObligatorios,
  BotonTerminarDespues,
  CabeceraFormulario,
  EtiquetaGrupo,
  irAlPrimerError,
  useBorradorPaso,
  useRecordarBorrador,
  useSalirSinGuardar,
  useValidarObligatorios,
} from './comunes';

/** Cuántas categorías se ven antes de "Ver los N tipos de vehículo" (hoy son 7: se ven todas). */
const VISIBLES = 7;
const MAX_ANOS = 50;
/** Ancho de la columna de años: − (44) + cajita (56) + + (44) y los espacios. */
const ANCHO_ANOS = 152;

/** Años escritos → número válido (1 a 50) o null. */
function aniosValidos(texto: string | undefined): number | null {
  const t = (texto ?? '').trim();
  const n = Number(t);
  return t && Number.isInteger(n) && n >= 1 && n <= MAX_ANOS ? n : null;
}

/** El error de una cajita de años: vacía, o con un número fuera de 1 a 50 (ej. "0"). */
function errorAnios(texto: string | undefined): string | null {
  if (!(texto ?? '').trim()) return 'Escribe cuántos años.';
  return aniosValidos(texto) === null ? `Escribe entre 1 y ${MAX_ANOS}.` : null;
}

/**
 * S06 · Años manejando un vehículo: se escriben con el teclado de números y los botones − y + ajustan
 * de a uno (+ con la cajita vacía pone 1). De 1 a 50.
 */
function AniosVehiculo({
  valor,
  onCambiar,
  nombre,
  error,
}: {
  valor: string;
  onCambiar: (t: string) => void;
  nombre: string;
  error: boolean;
}) {
  const [foco, setFoco] = useState(false);
  const n = Number(valor);
  const hayNumero = valor.trim() !== '' && Number.isInteger(n);
  const boton = (signo: 'menos' | 'mas') => {
    const bloqueado = signo === 'menos' ? !hayNumero || n <= 1 : hayNumero && n >= MAX_ANOS;
    const Icono = signo === 'menos' ? Minus : Plus;
    return (
      <Presionable
        role="button"
        aria-label={`${signo === 'menos' ? 'Restar' : 'Sumar'} un año: ${nombre}`}
        aria-disabled={bloqueado}
        disabled={bloqueado}
        onPress={() => onCambiar(String(signo === 'menos' ? Math.max(1, n - 1) : hayNumero ? Math.min(MAX_ANOS, n + 1) : 1))}
        style={{
          width: 44,
          height: 44,
          borderRadius: radio.boton44,
          borderWidth: 1,
          borderColor: bloqueado ? color.separador : color.bordeCampo,
          backgroundColor: bloqueado ? '#FAFAFA' : color.fondo,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icono size={18} color={bloqueado ? color.iconoDeshabilitado : color.texto} strokeWidth={2} />
      </Presionable>
    );
  };
  return (
    <View style={{ width: ANCHO_ANOS, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {boton('menos')}
      <TextInput
        value={valor}
        onChangeText={onCambiar}
        placeholder="Años"
        placeholderTextColor={color.textoSecundario}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={2}
        selectTextOnFocus
        aria-label={`Años manejando ${nombre}`}
        aria-invalid={error}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        style={[
          // 17 px (más de 16): Safari en iPhone no hace zoom al enfocar.
          { ...fuente(700), fontSize: 17, lineHeight: 22, textAlign: 'center', color: color.texto },
          {
            width: 56,
            height: 44,
            padding: 0,
            borderRadius: radio.campo,
            backgroundColor: color.superficie,
            borderWidth: error || foco ? 1.5 : 1,
            borderColor: error ? color.error : foco ? color.bordeFuerte : color.bordeCampo,
          },
          { outlineStyle: 'none' } as object,
        ]}
      />
      {boton('mas')}
    </View>
  );
}

export default function Paso3() {
  const experienciaGuardada = useVista((v) => v.conductor.experiencia);
  const idiomasGuardados = useVista((v) => v.conductor.idiomas);
  const tamanosCatalogo = useVista((v) => v.catalogos.tamanos);
  const idiomasCatalogo = useVista((v) => v.catalogos.idiomas);
  const acciones = useAcciones();
  const editar = useModoEdicion();
  const validar = useValidarObligatorios();
  const volverA = useVolverDesdePaso(3);
  const volverTrasEditar = useVolverTrasEditar();
  const { guardando, ejecutar } = useGuardando();
  const pantalla = usePantallaAbierta();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [pulsado, setPulsado] = useState<'continuar' | 'despues'>('continuar');
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const borrador = useBorradorPaso(3, !editar, {
    marcados: Object.keys(experienciaGuardada).filter((k) => experienciaGuardada[k] > 0),
    anios: Object.fromEntries(Object.entries(experienciaGuardada).map(([k, n]) => [k, String(n)])) as Record<string, string>,
    idiomas: idiomasGuardados,
  });
  const [marcados, setMarcados] = useState<string[]>(borrador.inicial.marcados);
  // Texto de cada cajita "Años" (vacía hasta que se escribe).
  const [anios, setAnios] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(borrador.inicial.anios ?? {}).map(([k, v]) => [k, String(v)])),
  );
  const [idiomas, setIdiomas] = useState<string[]>(borrador.inicial.idiomas);
  useRecordarBorrador(borrador, { marcados, anios, idiomas });
  const [todos, setTodos] = useState(false);
  const [intento, setIntento] = useState(false);

  const tamanos = [...tamanosCatalogo].sort((a, b) => a.orden - b.orden);
  const lista = todos ? tamanos : tamanos.slice(0, VISIBLES);

  const sinAnios = marcados.filter((id) => errorAnios(anios[id]) !== null);
  const errores = {
    vehiculos: marcados.length === 0 ? 'Marca al menos un vehículo.' : null,
    anios: sinAnios.length > 0 ? 'Revisa los años.' : null,
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const ver = intento && validar;

  const alternar = (id: string) => {
    if (marcados.includes(id)) setMarcados((m) => m.filter((x) => x !== id));
    else setMarcados((m) => [...m, id]);
  };

  const escribirAnios = (id: string, t: string) => {
    const d = t.replace(/\D/g, '').slice(0, 2);
    setAnios((a) => ({ ...a, [id]: d && Number(d) > MAX_ANOS ? String(MAX_ANOS) : d }));
  };

  // S11: ¿hay cambios sin guardar? (vehículos, años de cada uno e idiomas)
  const resumen = (m: string[], a: Record<string, string | number>, i: string[]) =>
    JSON.stringify([...m].sort().map((id) => [id, String(a[id] ?? '')]).concat([...i].sort().map((x) => [x, 'idioma'])));
  const cambiado = resumen(marcados, anios, idiomas) !== resumen(borrador.inicial.marcados, borrador.inicial.anios ?? {}, borrador.inicial.idiomas);
  const salir = useSalirSinGuardar(editar && cambiado, () => continuar('continuar'), volverTrasEditar);

  const continuar = (siguiente: 'continuar' | 'despues') =>
    ejecutar(async () => {
      setPulsado(siguiente);
      // "Guardar y terminar después" guarda lo que haya, sin alerta (S04).
      if (siguiente === 'continuar' && validar && hayErrores) {
        setIntento(true);
        irAlPrimerError(scrollRef);
        return;
      }
      const experiencia: Record<string, number> = {};
      for (const id of marcados) {
        const n = aniosValidos(anios[id]);
        if (n !== null) experiencia[id] = n;
      }
      setErrorGuardar(null);
      const r = await acciones.guardarPaso3({ experiencia, idiomas, parcial: siguiente === 'despues' });
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
      else router.push(RUTA_PASO[4]);
    });

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado paso={editar ? undefined : 3} volverA={editar ? volverTrasEditar : volverA} onVolver={salir.onVolver} />
      <CabeceraFormulario titulo="Tu experiencia" />

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="¿Qué vehículos has manejado?" obligatorio ayuda="Puedes marcar varios." error={ver && errores.vehiculos} />
        <View
          role="group"
          aria-label="¿Qué vehículos has manejado?"
          style={{
            backgroundColor: color.superficie,
            borderWidth: ver && errores.vehiculos ? 1.5 : 1,
            borderColor: ver && errores.vehiculos ? color.error : color.borde,
            borderRadius: radio.tarjeta,
            padding: 14,
            gap: 8,
          }}>
          {marcados.length > 0 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={[fuente(700), { width: ANCHO_ANOS, textAlign: 'center', fontSize: 13, lineHeight: 17, color: color.textoSecundario }]}>
                Años manejando
              </Text>
            </View>
          ) : null}
          {lista.map((t) => {
            const sel = marcados.includes(t.id);
            const errorFila = ver && sel ? errorAnios(anios[t.id]) : null;
            return (
              <View key={t.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Chip
                    etiqueta={t.nombre}
                    subtitulo={t.ayuda}
                    seleccionado={sel}
                    onPress={() => alternar(t.id)}
                    etiquetaAccesible={`${t.nombre} (${t.ayuda})`}
                    style={{ flex: 1, minWidth: 0, paddingHorizontal: 14 }}
                  />
                  {sel ? (
                    <AniosVehiculo valor={anios[t.id] ?? ''} onCambiar={(x) => escribirAnios(t.id, x)} nombre={t.nombre} error={!!errorFila} />
                  ) : null}
                </View>
                {errorFila ? (
                  <Text role="alert" style={[tipo.mensajeCampo, fuente(600), { color: color.error, textAlign: 'right' }]}>
                    {errorFila}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
        {!todos && tamanos.length > VISIBLES ? (
          <Presionable
            role="button"
            onPress={() => setTodos(true)}
            style={{ minHeight: 44, alignSelf: 'flex-start', paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[tipo.fuerte, { color: color.texto }]}>Ver los {tamanos.length} tipos de vehículo</Text>
            <ChevronDown size={18} color={color.texto} strokeWidth={2} />
          </Presionable>
        ) : null}
      </View>

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="Idiomas que hablas" nota="(opcional)" ayuda="Los titulares lo ven en tu ficha." />
        <View role="group" aria-label="Idiomas que hablas" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {idiomasCatalogo.map((i) => (
            <Chip
              key={i.clave}
              etiqueta={i.nombre}
              seleccionado={idiomas.includes(i.clave)}
              onPress={() => setIdiomas((l) => (l.includes(i.clave) ? l.filter((x) => x !== i.clave) : [...l, i.clave]))}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {ver && hayErrores ? <AlertaObligatorios /> : errorGuardar ? <AlertaObligatorios texto={errorGuardar} /> : null}
        <Boton titulo={editar ? 'Guardar cambios' : 'Continuar'} onPress={() => continuar('continuar')} cargando={guardando && pulsado === 'continuar'} />
        {editar ? null : <BotonTerminarDespues onPress={() => continuar('despues')} cargando={guardando && pulsado === 'despues'} />}
      </View>
      {salir.dialogo}
    </Pantalla>
  );
}

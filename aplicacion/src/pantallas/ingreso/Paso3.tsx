// B3 · Paso 3: experiencia
// Ruta: /conductor/registro/3
// Maqueta: docs/maqueta/CondPaso3.dc.html
// 7 categorías (catálogo de tamaños) con años manejando cada una: el contador solo se activa en las
// marcadas. "Idiomas que hablas" es opcional y no cuenta en el match.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { useDemo } from '@/datos/tienda';
import { Boton, Chip, Encabezado, Pantalla, Presionable, Stepper, color, fuente, radio, tipo } from '@/ui';
import { ChevronDown } from '@/ui/iconos';

import { RUTA_PASO, terminarEdicion, useModoEdicion, volverDesdePaso } from './acciones';
import { CabeceraFormulario, EtiquetaGrupo, useBorradorPaso, useRecordarBorrador } from './comunes';

/** Cuántas categorías se ven antes de "Ver los N tipos de vehículo" (hoy son 7: se ven todas). */
const VISIBLES = 7;
const ANCHO_CONTADOR = 132;

export default function Paso3() {
  const experienciaGuardada = useDemo((s) => s.conductor.experiencia);
  const idiomasGuardados = useDemo((s) => s.conductor.idiomas);
  const tamanosCatalogo = useDemo((s) => s.catalogos.tamanos);
  const idiomasCatalogo = useDemo((s) => s.catalogos.idiomas);
  const guardarPaso3 = useDemo((s) => s.guardarPaso3);
  const editar = useModoEdicion();

  const borrador = useBorradorPaso(3, !editar, {
    marcados: Object.keys(experienciaGuardada).filter((k) => experienciaGuardada[k] > 0),
    anios: { ...experienciaGuardada },
    idiomas: idiomasGuardados,
  });
  const [marcados, setMarcados] = useState<string[]>(borrador.inicial.marcados);
  const [anios, setAnios] = useState<Record<string, number>>(borrador.inicial.anios);
  const [idiomas, setIdiomas] = useState<string[]>(borrador.inicial.idiomas);
  useRecordarBorrador(borrador, { marcados, anios, idiomas });
  const [todos, setTodos] = useState(false);

  const tamanos = [...tamanosCatalogo].sort((a, b) => a.orden - b.orden);
  const lista = todos ? tamanos : tamanos.slice(0, VISIBLES);

  const alternar = (id: string) => {
    if (marcados.includes(id)) {
      setMarcados((m) => m.filter((x) => x !== id));
    } else {
      setMarcados((m) => [...m, id]);
      // Al marcar, parte en 1 año (0 años no se guarda como experiencia).
      setAnios((a) => ({ ...a, [id]: Math.max(1, a[id] ?? 0) }));
    }
  };

  const continuar = () => {
    const experiencia: Record<string, number> = {};
    for (const id of marcados) experiencia[id] = Math.max(1, anios[id] ?? 1);
    guardarPaso3({ experiencia, idiomas });
    borrador.olvidar();
    if (editar) terminarEdicion();
    else router.push(RUTA_PASO[4]);
  };

  return (
    <Pantalla>
      <Encabezado paso={editar ? undefined : 3} volverA={editar ? '/conductor/perfil' : volverDesdePaso(3)} />
      <CabeceraFormulario equilibrar titulo="Tu experiencia" subtitulo="Marca los vehículos que has manejado y cuántos años llevas manejando cada uno." />

      <View style={{ marginTop: 8, gap: 12 }}>
        <EtiquetaGrupo titulo="¿Qué vehículos has manejado?" ayuda="Según su tamaño. Puedes marcar varios." />
        <View
          role="group"
          aria-label="¿Qué vehículos has manejado?"
          style={{
            backgroundColor: color.superficie,
            borderWidth: 1,
            borderColor: color.borde,
            borderRadius: radio.tarjeta,
            paddingTop: 12,
            paddingHorizontal: 14,
            paddingBottom: 14,
            gap: 8,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={[fuente(700), { width: ANCHO_CONTADOR, textAlign: 'center', fontSize: 12, lineHeight: 16, color: color.textoSecundario }]}>
              Años de experiencia
            </Text>
          </View>
          {lista.map((t) => {
            const sel = marcados.includes(t.id);
            return (
              <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Chip
                  etiqueta={t.nombre}
                  subtitulo={t.ayuda}
                  seleccionado={sel}
                  onPress={() => alternar(t.id)}
                  etiquetaAccesible={`${t.nombre} (${t.ayuda})`}
                  style={{ flex: 1, minWidth: 0, paddingHorizontal: 14 }}
                />
                <Stepper
                  valor={sel ? (anios[t.id] ?? 1) : 0}
                  onCambiar={(n) => setAnios((a) => ({ ...a, [t.id]: n }))}
                  min={sel ? 1 : 0}
                  max={50}
                  deshabilitado={!sel}
                  etiquetaAccesible={`años manejando ${t.nombre}`}
                />
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

      <View style={{ marginTop: 'auto', paddingTop: 16 }}>
        <Boton titulo={editar ? 'Guardar cambios' : 'Continuar'} onPress={continuar} />
      </View>
    </Pantalla>
  );
}

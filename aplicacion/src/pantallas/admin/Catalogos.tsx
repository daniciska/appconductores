// Panel · Catálogos · Negocios e industrias, tipos de vehículo y clases de licencia
// Ruta: /admin/catalogos
// Sin maqueta (panel web). Encender o apagar un negocio o una industria cambia en vivo el Paso 4,
// los matches y la bolsa.
import { useState } from 'react';
import { View } from 'react-native';

import { useCatalogos, useDerivado } from '@/datos/hooks';
import { habilitaNegocio, textoPideLicencia } from '@/datos/match';
import { useDemo } from '@/datos/tienda';
import type { Industria, Negocio, TamanoVehiculo } from '@/datos/tipos';
import { plural } from '@/datos/formato';
import {
  Aviso,
  BotonIcono,
  Campo,
  ControlSegmentado,
  Dialogo,
  Insignia,
  Interruptor,
  PaginaPanel,
  Separador,
  Texto,
  color,
  mostrarToast,
  radio,
} from '@/ui';
import { Check, Pencil, X } from '@/ui/iconos';

import { renombrarTamano } from './acciones';
import { usoNegocios } from './datosPanel';
import { CabeceraTabla, TarjetaPanel, useAnchoPanel } from './piezas';

type Pestana = 'negocios' | 'vehiculos' | 'licencias';

export default function Catalogos() {
  const [pestana, setPestana] = useState<Pestana>('negocios');
  const { escritorio } = useAnchoPanel();
  return (
    <PaginaPanel
      titulo="Catálogos"
      descripcion="Lo que la app muestra en las listas. Los cambios se ven en vivo en el registro, los matches y la bolsa.">
      <ControlSegmentado
        etiquetaAccesible="Catálogo"
        style={{ maxWidth: 560 }}
        opciones={[
          { clave: 'negocios', etiqueta: 'Negocios' },
          { clave: 'vehiculos', etiqueta: escritorio ? 'Tipos de vehículo' : 'Vehículos' },
          { clave: 'licencias', etiqueta: escritorio ? 'Clases de licencia' : 'Licencias' },
        ]}
        valor={pestana}
        onCambiar={setPestana}
      />
      {pestana === 'negocios' ? <Negocios /> : pestana === 'vehiculos' ? <Vehiculos /> : <Licencias />}
    </PaginaPanel>
  );
}

// ---------------------------------------------------------------------------
// Negocios e industrias
// ---------------------------------------------------------------------------

function Negocios() {
  const cat = useCatalogos();
  const uso = useDerivado(usoNegocios);
  const cambiarIndustriaActiva = useDemo((s) => s.cambiarIndustriaActiva);
  const [apagar, setApagar] = useState<Industria | null>(null);
  const industrias = [...cat.industrias].sort((a, b) => a.orden - b.orden);
  const negociosDe = (i: Industria) => cat.negocios.filter((n) => n.industriaId === i.id).sort((a, b) => a.orden - b.orden);
  const encendidosDe = (i: Industria) => negociosDe(i).filter((n) => n.activo);

  return (
    <View style={{ gap: 16 }}>
      <Aviso icono="info" texto="Solo los negocios encendidos, de una industria encendida, se ven en la app y entran al match." />
      {industrias.map((i) => {
        const negocios = negociosDe(i);
        const encendidos = encendidosDe(i).length;
        return (
          <TarjetaPanel
            key={i.id}
            titulo={i.nombre}
            descripcion={i.activo ? `${encendidos} de ${negocios.length} negocios encendidos` : 'Industria apagada: sus negocios no se ven ni entran al match'}
            derecha={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Texto variante="ayuda" peso={600}>
                  {i.activo ? 'Encendida' : 'Apagada'}
                </Texto>
                <Interruptor
                  valor={i.activo}
                  etiquetaAccesible={`Industria ${i.nombre}`}
                  onCambiar={(v) => {
                    if (!v) setApagar(i);
                    else {
                      cambiarIndustriaActiva(i.id, true);
                      mostrarToast(`${i.nombre} encendida`, 'exito');
                    }
                  }}
                />
              </View>
            }
            separacion={8}>
            <View style={{ borderTopWidth: 1, borderTopColor: color.separador }}>
              {negocios.map((n, idx) => (
                <View key={n.id}>
                  {idx > 0 ? <Separador /> : null}
                  <FilaNegocio negocio={n} industriaActiva={i.activo} uso={uso[n.id] ?? { conductores: 0, busquedas: 0 }} />
                </View>
              ))}
            </View>
          </TarjetaPanel>
        );
      })}

      <Dialogo
        visible={!!apagar}
        titulo={apagar ? `¿Apagar ${apagar.nombre}?` : ''}
        texto={apagar ? textoApagarIndustria(encendidosDe(apagar).map((n) => n.nombre)) : undefined}
        confirmar={{
          titulo: 'Apagar industria',
          peligro: true,
          onPress: () => {
            if (apagar) {
              cambiarIndustriaActiva(apagar.id, false);
              mostrarToast(`${apagar.nombre} apagada`, 'info');
            }
            setApagar(null);
          },
        }}
        cancelar={{ onPress: () => setApagar(null) }}
      />
    </View>
  );
}

function textoApagarIndustria(encendidos: string[]): string {
  const despues = 'dejan de verse en la app y salen del match. Al encenderla vuelven como estaban.';
  if (encendidos.length === 0) return 'No tiene negocios encendidos. Al encenderla, sus negocios vuelven como estaban.';
  if (encendidos.length === 1) return `Se apaga su único negocio encendido (${encendidos[0]}): deja de verse en la app y sale del match. Al encenderla vuelve como estaba.`;
  return `Se apagan sus ${encendidos.length} negocios encendidos (${encendidos.join(', ')}): ${despues}`;
}

function FilaNegocio({ negocio: n, industriaActiva, uso }: { negocio: Negocio; industriaActiva: boolean; uso: { conductores: number; busquedas: number } }) {
  const cambiarNegocioActivo = useDemo((s) => s.cambiarNegocioActivo);
  const renombrarNegocio = useDemo((s) => s.renombrarNegocio);
  const { escritorio } = useAnchoPanel();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(n.nombre);
  const visible = n.activo && industriaActiva;

  const guardar = () => {
    if (nombre.trim() && nombre.trim() !== n.nombre) {
      renombrarNegocio(n.id, nombre);
      mostrarToast('Nombre guardado', 'exito');
    }
    setEditando(false);
  };

  return (
    <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'stretch', gap: 12, paddingVertical: 14 }}>
      <View style={{ flex: 1, minWidth: 0, gap: 4, opacity: industriaActiva ? 1 : 0.55 }}>
        {editando ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Campo
              valor={nombre}
              onCambiar={setNombre}
              aria-label={`Nombre de ${n.nombre}`}
              maxLength={40}
              autoFocus
              onSubmitEditing={guardar}
              style={{ flex: 1, maxWidth: 360 }}
            />
            <BotonIcono icono={Check} etiquetaAccesible="Guardar nombre" variante="oscuro" onPress={guardar} />
            <BotonIcono
              icono={X}
              etiquetaAccesible="Cancelar"
              variante="suave"
              onPress={() => {
                setNombre(n.nombre);
                setEditando(false);
              }}
            />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Texto variante="cuerpo" peso={700}>
              {n.nombre}
            </Texto>
            {n.ejemplo ? <Texto variante="ayuda">({n.ejemplo})</Texto> : null}
            {n.activo && !industriaActiva ? <Insignia texto="Apagado por la industria" tono="gris" icono={null} /> : null}
          </View>
        )}
        <Texto variante="ayuda">
          {textoPideLicencia(n)}
          {n.pregunta ? ` según «${n.pregunta.pregunta}»` : ''} · {plural(uso.conductores, 'conductor', 'conductores')} · {plural(uso.busquedas, 'búsqueda', 'búsquedas')}
        </Texto>
        {n.nota ? <Texto variante="pequeno">Nota: {n.nota.replace(/\s*\[verificar\]/g, ' (por verificar)')}</Texto> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: escritorio ? 'flex-end' : 'space-between' }}>
        {!editando ? (
          <BotonIcono icono={Pencil} etiquetaAccesible={`Cambiar nombre de ${n.nombre}`} variante="suave" onPress={() => setEditando(true)} />
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Texto variante="ayuda" peso={600} style={{ minWidth: 64, textAlign: 'right' }}>
            {visible ? 'En la app' : n.activo ? 'Oculto' : 'Apagado'}
          </Texto>
          <Interruptor
            valor={n.activo}
            etiquetaAccesible={`Negocio ${n.nombre}`}
            onCambiar={(v) => {
              cambiarNegocioActivo(n.id, v);
              mostrarToast(
                v
                  ? industriaActiva
                    ? `${n.nombre} encendido: aparece en el Paso 4 y en los matches`
                    : `${n.nombre} encendido. Falta encender la industria.`
                  : `${n.nombre} apagado: sale del Paso 4 y de los matches`,
                v ? 'exito' : 'info',
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tipos de vehículo (categorías de experiencia del Paso 3)
// ---------------------------------------------------------------------------

function Vehiculos() {
  const cat = useCatalogos();
  const conExperiencia = useDerivado((s) => {
    const salida: Record<string, number> = {};
    const todos = [s.conductor.registrado ? s.conductor.experiencia : null, ...s.conductores.map((c) => c.experiencia)].filter(
      (x): x is Record<string, number> => !!x,
    );
    for (const t of s.catalogos.tamanos) salida[t.id] = todos.filter((e) => (e[t.id] ?? 0) > 0).length;
    return salida;
  });
  const tamanos = [...cat.tamanos].sort((a, b) => a.orden - b.orden);
  return (
    <View style={{ gap: 16 }}>
      <Aviso icono="info" texto="Son las categorías de «¿Qué vehículos has manejado?» (Paso 3). Cada negocio usa algunas para contar los años de experiencia." />
      <TarjetaPanel separacion={0} padding={0}>
        {tamanos.map((t, i) => (
          <View key={t.id}>
            {i > 0 ? <Separador /> : null}
            <FilaTamano
              tamano={t}
              conductores={conExperiencia[t.id] ?? 0}
              negocios={cat.negocios.filter((n) => n.tamanos.includes(t.id)).map((n) => n.nombre)}
            />
          </View>
        ))}
      </TarjetaPanel>
    </View>
  );
}

function FilaTamano({ tamano: t, conductores, negocios }: { tamano: TamanoVehiculo; conductores: number; negocios: string[] }) {
  const { escritorio } = useAnchoPanel();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(t.nombre);
  const guardar = () => {
    if (nombre.trim() && nombre.trim() !== t.nombre) {
      renombrarTamano(t.id, nombre);
      mostrarToast('Nombre guardado', 'exito');
    }
    setEditando(false);
  };
  return (
    <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'stretch', gap: 12, paddingHorizontal: 20, paddingVertical: 14 }}>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        {editando ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Campo valor={nombre} onCambiar={setNombre} aria-label={`Nombre de ${t.nombre}`} maxLength={40} autoFocus onSubmitEditing={guardar} style={{ flex: 1, maxWidth: 360 }} />
            <BotonIcono icono={Check} etiquetaAccesible="Guardar nombre" variante="oscuro" onPress={guardar} />
            <BotonIcono
              icono={X}
              etiquetaAccesible="Cancelar"
              variante="suave"
              onPress={() => {
                setNombre(t.nombre);
                setEditando(false);
              }}
            />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <Texto variante="cuerpo" peso={700}>
              {t.nombre}
            </Texto>
            <Texto variante="ayuda">({t.ayuda})</Texto>
          </View>
        )}
        <Texto variante="ayuda">
          {plural(conductores, 'conductor la declara', 'conductores la declaran')}
          {negocios.length ? ` · Cuenta para ${negocios.join(', ')}` : ' · Ningún negocio la usa'}
        </Texto>
      </View>
      {!editando ? <BotonIcono icono={Pencil} etiquetaAccesible={`Cambiar nombre de ${t.nombre}`} variante="suave" onPress={() => setEditando(true)} /> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Clases de licencia (solo lectura)
// ---------------------------------------------------------------------------

function Licencias() {
  const cat = useCatalogos();
  const { escritorio } = useAnchoPanel();
  const clases = [...cat.clases].sort((a, b) => a.orden - b.orden);
  const negocios = [...cat.negocios].sort((a, b) => a.orden - b.orden);
  return (
    <View style={{ gap: 16 }}>
      <Aviso icono="candado" texto="Las clases las define la ley de tránsito: aquí solo se consultan." />
      <View>
        {escritorio ? (
          <CabeceraTabla
            columnas={[
              { titulo: 'Clase', flex: 1.4 },
              { titulo: 'Maneja lo de la B', flex: 0.9 },
              { titulo: 'Negocios que habilita', flex: 3 },
            ]}
          />
        ) : null}
        <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, overflow: 'hidden' }}>
          {clases.map((c, i) => {
            const habilita = negocios.filter((n) => habilitaNegocio([c.codigo], n, null, cat.clases)).map((n) => n.nombre);
            return (
              <View key={c.codigo}>
                {i > 0 ? <Separador /> : null}
                <View style={{ flexDirection: escritorio ? 'row' : 'column', gap: escritorio ? 12 : 6, paddingHorizontal: 16, paddingVertical: 12, minHeight: 56, alignItems: escritorio ? 'center' : 'stretch' }}>
                  <View style={{ flex: escritorio ? 1.4 : undefined, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ minWidth: 44, height: 28, paddingHorizontal: 8, borderRadius: radio.insignia, backgroundColor: c.esAntigua ? color.fondo : color.oscuro, alignItems: 'center', justifyContent: 'center' }}>
                      <Texto variante="pequeno" peso={700} tono={c.esAntigua ? 'normal' : 'blanco'}>
                        {c.codigo.replace(' antigua', '')}
                      </Texto>
                    </View>
                    <Texto variante="secundario" peso={600} style={{ flex: 1 }}>
                      {c.nombre}
                    </Texto>
                  </View>
                  <View style={{ flex: escritorio ? 0.9 : undefined }}>
                    {escritorio ? (
                      <Texto variante="secundario">{c.habilitaClaseB ? 'Sí' : 'No'}</Texto>
                    ) : (
                      <Texto variante="ayuda">Maneja lo de la B: {c.habilitaClaseB ? 'sí' : 'no'}</Texto>
                    )}
                  </View>
                  <Texto variante={escritorio ? 'secundario' : 'ayuda'} tono="secundario" style={{ flex: escritorio ? 3 : undefined }}>
                    {habilita.length ? habilita.join(', ') : 'Ninguno del catálogo'}
                  </Texto>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

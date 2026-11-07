// Panel · Zonas
// Era la ruta (ya no existe en el mockup): /admin/zonas
// Sin maqueta (panel web). Región → zonas → comunas. Renombrar zonas, crear zonas y mover comunas.
// La zona se usa en el % del match (M2): mover una comuna cambia los matches en vivo.
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { useCatalogos, useDerivado } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import type { Comuna, Zona } from '@/datos/tipos';
import { plural } from '@/datos/formato';
import { Boton, BotonIcono, Campo, EstadoVacio, FilaRadio, Insignia, Presionable, Texto, color, fuente, mostrarToast, radio } from '@/ui';
import { PaginaPanel } from '@/panel/marco';
import { Check, ChevronDown, Map as IconoMapa, MapPin, Pencil, Plus, X } from '@/ui/iconos';

import { usoZonas } from './datosPanel';
import { CampoBusqueda, TarjetaPanel, VentanaPanel, useAnchoPanel } from './piezas';

const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export default function Zonas() {
  const cat = useCatalogos();
  const uso = useDerivado(usoZonas);
  const crearZona = useDemo((s) => s.crearZona);
  const moverComunaAZona = useDemo((s) => s.moverComunaAZona);
  const { dosColumnas } = useAnchoPanel();

  const [regionId, setRegionId] = useState('r07');
  const [elegirRegion, setElegirRegion] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mover, setMover] = useState<Comuna | null>(null);
  const [destino, setDestino] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [nombreNueva, setNombreNueva] = useState('');

  const regiones = [...cat.regiones].sort((a, b) => a.orden - b.orden);
  const region = regiones.find((r) => r.id === regionId) ?? regiones[0];
  const zonas = useMemo(() => cat.zonas.filter((z) => z.regionId === region.id).sort((a, b) => a.orden - b.orden), [cat.zonas, region.id]);
  const comunasDe = (zonaId: string) => cat.comunas.filter((c) => c.zonaId === zonaId).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const q = sinTildes(busqueda);
  const coincide = (c: Comuna) => !q || sinTildes(c.nombre).includes(q);
  const zonasVisibles = q ? zonas.filter((z) => comunasDe(z.id).some(coincide)) : zonas;
  const totalComunas = cat.comunas.filter((c) => c.regionId === region.id).length;

  const abrirMover = (c: Comuna) => {
    setMover(c);
    setDestino(c.zonaId);
  };

  const confirmarMover = () => {
    if (!mover || !destino) return;
    if (destino === mover.zonaId) {
      setMover(null);
      return;
    }
    const r = moverComunaAZona(mover.id, destino);
    const zona = cat.zonas.find((z) => z.id === destino);
    if (r.ok) mostrarToast(`${mover.nombre} ahora está en ${zona?.nombre ?? 'otra zona'}`, 'exito');
    else mostrarToast(r.error ?? 'No se pudo mover la comuna', 'error');
    setMover(null);
  };

  return (
    <PaginaPanel
      titulo="Zonas y comunas"
      descripcion="Cada zona agrupa comunas de una región. El match suma puntos cuando el conductor y la búsqueda están en la misma zona."
      acciones={<Boton titulo="Nueva zona" icono={Plus} variante="oscuro" tamano="mediano" onPress={() => { setNombreNueva(''); setNueva(true); }} />}>
      <View style={{ flexDirection: dosColumnas ? 'row' : 'column', gap: 12, alignItems: dosColumnas ? 'center' : 'stretch' }}>
        <Presionable
          role="button"
          aria-label={`Región: ${region.nombre}. Cambiar región`}
          onPress={() => setElegirRegion(true)}
          style={{
            flex: dosColumnas ? 1 : undefined,
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: color.superficie,
            borderWidth: 1,
            borderColor: color.bordeCampo,
            borderRadius: radio.campo,
            paddingHorizontal: 16,
          }}>
          <IconoMapa size={18} color={color.texto} strokeWidth={2} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Texto variante="pequeno">Región</Texto>
            <Texto variante="cuerpo" peso={700} numberOfLines={1}>
              {region.nombre}
            </Texto>
          </View>
          <Texto variante="ayuda">
            {plural(zonas.length, 'zona', 'zonas')} · {plural(totalComunas, 'comuna', 'comunas')}
          </Texto>
          <ChevronDown size={18} color={color.textoSecundario} strokeWidth={2} />
        </Presionable>
        <View style={{ flex: dosColumnas ? 1 : undefined }}>
          <CampoBusqueda valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar comuna en esta región" />
        </View>
      </View>

      <Texto variante="ayuda">Toca una comuna para moverla a otra zona.</Texto>

      {zonasVisibles.length === 0 ? (
        <TarjetaPanel>
          <EstadoVacio icono={MapPin} titulo="Sin resultados" texto={`Ninguna comuna de ${region.nombre} coincide con «${busqueda}».`} />
        </TarjetaPanel>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {zonasVisibles.map((z) => (
            <TarjetaZona
              key={z.id}
              zona={z}
              comunas={comunasDe(z.id)}
              resaltar={q ? coincide : undefined}
              uso={uso[z.id] ?? { conductores: 0, busquedas: 0 }}
              onComuna={abrirMover}
            />
          ))}
        </View>
      )}

      {/* Elegir región */}
      <VentanaPanel visible={elegirRegion} onCerrar={() => setElegirRegion(false)} titulo="Elige una región">
        {regiones.map((r) => {
          const nz = cat.zonas.filter((z) => z.regionId === r.id).length;
          const nc = cat.comunas.filter((c) => c.regionId === r.id).length;
          return (
            <FilaRadio
              key={r.id}
              titulo={r.nombre}
              descripcion={`${plural(nz, 'zona', 'zonas')} · ${plural(nc, 'comuna', 'comunas')}`}
              seleccionada={r.id === region.id}
              onPress={() => {
                setRegionId(r.id);
                setBusqueda('');
                setElegirRegion(false);
              }}
            />
          );
        })}
      </VentanaPanel>

      {/* Mover comuna */}
      <VentanaPanel
        visible={!!mover}
        onCerrar={() => setMover(null)}
        titulo={mover ? `Mover ${mover.nombre}` : ''}
        descripcion="Elige su nueva zona. Los matches se recalculan al instante."
        pie={
          <>
            <Boton
              titulo={destino && mover && destino !== mover.zonaId ? `Mover a ${cat.zonas.find((z) => z.id === destino)?.nombre ?? ''}` : 'Elige otra zona'}
              deshabilitado={!destino || !mover || destino === mover.zonaId}
              onPress={confirmarMover}
            />
            <Boton titulo="Cancelar" variante="contorno" onPress={() => setMover(null)} />
          </>
        }>
        {mover
          ? cat.zonas
              .filter((z) => z.regionId === mover.regionId)
              .sort((a, b) => a.orden - b.orden)
              .map((z) => (
                <FilaRadio
                  key={z.id}
                  titulo={z.nombre}
                  descripcion={plural(cat.comunas.filter((c) => c.zonaId === z.id).length, 'comuna', 'comunas')}
                  seleccionada={z.id === destino}
                  onPress={() => setDestino(z.id)}
                  extra={z.id === mover.zonaId ? <Insignia texto="Actual" tono="gris" icono={null} /> : undefined}
                />
              ))
          : null}
      </VentanaPanel>

      {/* Nueva zona */}
      <VentanaPanel
        visible={nueva}
        onCerrar={() => setNueva(false)}
        titulo="Nueva zona"
        descripcion={`En ${region.nombre}. Después mueve comunas a ella.`}
        pie={
          <>
            <Boton
              titulo="Crear zona"
              deshabilitado={!nombreNueva.trim()}
              onPress={() => {
                crearZona(region.id, nombreNueva);
                mostrarToast(`Zona ${nombreNueva.trim()} creada`, 'exito');
                setNueva(false);
              }}
            />
            <Boton titulo="Cancelar" variante="contorno" onPress={() => setNueva(false)} />
          </>
        }>
        <Campo etiqueta="Nombre" obligatorio valor={nombreNueva} onCambiar={setNombreNueva} placeholder="Ej.: Zona Cordillera" maxLength={40} autoFocus />
      </VentanaPanel>
    </PaginaPanel>
  );
}

function TarjetaZona({
  zona,
  comunas,
  resaltar,
  uso,
  onComuna,
}: {
  zona: Zona;
  comunas: Comuna[];
  resaltar?: (c: Comuna) => boolean;
  uso: { conductores: number; busquedas: number };
  onComuna: (c: Comuna) => void;
}) {
  const renombrarZona = useDemo((s) => s.renombrarZona);
  const { escritorio } = useAnchoPanel();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(zona.nombre);
  const guardar = () => {
    if (nombre.trim() && nombre.trim() !== zona.nombre) {
      renombrarZona(zona.id, nombre);
      mostrarToast('Nombre guardado', 'exito');
    }
    setEditando(false);
  };
  return (
    <TarjetaPanel style={escritorio ? { flexGrow: 1, flexBasis: 380, minWidth: 0 } : { width: '100%', minWidth: 0 }} separacion={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}>
        {editando ? (
          <>
            <Campo valor={nombre} onCambiar={setNombre} aria-label={`Nombre de ${zona.nombre}`} maxLength={40} autoFocus onSubmitEditing={guardar} style={{ flex: 1 }} />
            <BotonIcono icono={Check} etiquetaAccesible="Guardar nombre" variante="oscuro" onPress={guardar} />
            <BotonIcono
              icono={X}
              etiquetaAccesible="Cancelar"
              variante="suave"
              onPress={() => {
                setNombre(zona.nombre);
                setEditando(false);
              }}
            />
          </>
        ) : (
          <>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Texto variante="fuerte">{zona.nombre}</Texto>
              <Texto variante="ayuda">
                {plural(comunas.length, 'comuna', 'comunas')} · {plural(uso.conductores, 'conductor', 'conductores')} · {plural(uso.busquedas, 'búsqueda', 'búsquedas')}
              </Texto>
            </View>
            <BotonIcono icono={Pencil} etiquetaAccesible={`Cambiar nombre de ${zona.nombre}`} variante="suave" onPress={() => setEditando(true)} />
          </>
        )}
      </View>
      {comunas.length === 0 ? (
        <View style={{ backgroundColor: color.fondo, borderRadius: radio.campo, padding: 14 }}>
          <Texto variante="ayuda">Sin comunas. Mueve comunas a esta zona desde otra.</Texto>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {comunas.map((c) => {
            const marcada = resaltar ? resaltar(c) : false;
            const apagada = resaltar ? !marcada : false;
            return (
              <Presionable
                key={c.id}
                role="button"
                aria-label={`Mover ${c.nombre}`}
                onPress={() => onComuna(c)}
                hitSlop={3}
                style={({ hovered }) => ({
                  minHeight: 38,
                  paddingHorizontal: 12,
                  borderRadius: 19,
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: marcada ? color.oscuro : hovered ? color.bordeFuerte : color.bordeCampo,
                  backgroundColor: marcada ? color.oscuro : color.superficie,
                  opacity: apagada ? 0.45 : 1,
                })}>
                <Text style={[fuente(600), { fontSize: 13, color: marcada ? color.blanco : color.texto }]}>{c.nombre}</Text>
              </Presionable>
            );
          })}
        </View>
      )}
    </TarjetaPanel>
  );
}

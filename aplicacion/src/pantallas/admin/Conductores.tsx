// Panel · Conductores
// Ruta: /admin/conductores
// Sin maqueta (panel web). Lista con filtros por estado y detalle de solo lectura.
import { useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { useAhora, useCatalogos, useDerivado, useTodosLosConductores } from '@/datos/hooks';
import { TEXTO_PRECONDICION } from '@/datos/match';
import * as sel from '@/datos/selectores';
import type { ConductorVista } from '@/datos/selectores';
import type { TipoDocumentoId } from '@/datos/tipos';
import { fechaLarga, haceCuanto, iniciales, plural, textoDias, textoTurnos } from '@/datos/formato';
import { Aviso, Avatar, Boton, EstadoVacio, Insignia, PaginaPanel, Presionable, Separador, Texto, Titulo, color, radio } from '@/ui';
import { Lock, MapPin, UserRound, Users } from '@/ui/iconos';

import { conteoMatches, matchesDeConductor, precondicionDeConductor } from './datosPanel';
import { CabeceraTabla, CampoBusqueda, Dato, FilaElegible, Filtros, GrillaDatos, InsigniaConductor, ListaDetalle, TarjetaPanel, useAnchoPanel } from './piezas';

type Filtro = 'todos' | 'verificado' | 'en_revision' | 'con_observaciones' | 'incompleto' | 'suspendido';

function cumpleFiltro(c: ConductorVista, f: Filtro): boolean {
  switch (f) {
    case 'todos':
      return true;
    case 'suspendido':
      return c.suspendido;
    case 'incompleto':
      return !c.suspendido && c.estadoVerificacion === 'sin_documentos';
    default:
      return !c.suspendido && c.estadoVerificacion === f;
  }
}

const NOMBRE_DOC: Record<TipoDocumentoId, string> = { cedula: 'Cédula', licencia: 'Licencia', hoja_vida: 'Hoja de Vida', antecedentes: 'Antecedentes' };

export default function Conductores() {
  const conductores = useTodosLosConductores();
  const matches = useDerivado(conteoMatches);
  const { dosColumnas, escritorio } = useAnchoPanel();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [elegido, setElegido] = useState<string | null>(null);
  const ahora = useAhora(30000);

  const cuenta = (f: Filtro) => conductores.filter((c) => cumpleFiltro(c, f)).length;
  const visibles = useMemo(() => {
    const q = busqueda
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
    return conductores.filter((c) => {
      if (!cumpleFiltro(c, filtro)) return false;
      if (!q) return true;
      const texto = `${c.nombre} ${c.comuna?.nombre ?? ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return texto.includes(q);
    });
  }, [conductores, filtro, busqueda]);

  const actual = conductores.find((c) => c.id === elegido) ?? null;
  // En pantallas anchas, sin nada elegido, se ve la tabla completa; al elegir, lista + ficha.
  const conTabla = dosColumnas;

  const filtros = (
    <View style={{ gap: 12 }}>
      <CampoBusqueda valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por nombre o comuna" />
      <Filtros
        etiquetaAccesible="Filtrar por estado"
        valor={filtro}
        onCambiar={setFiltro}
        opciones={[
          { clave: 'todos', etiqueta: 'Todos', cantidad: cuenta('todos') },
          { clave: 'verificado', etiqueta: 'Verificados', cantidad: cuenta('verificado') },
          { clave: 'en_revision', etiqueta: 'En revisión', cantidad: cuenta('en_revision') },
          { clave: 'con_observaciones', etiqueta: 'Con observaciones', cantidad: cuenta('con_observaciones') },
          { clave: 'incompleto', etiqueta: 'Sin documentos', cantidad: cuenta('incompleto') },
          { clave: 'suspendido', etiqueta: 'Suspendidos', cantidad: cuenta('suspendido') },
        ]}
      />
    </View>
  );

  const lista =
    visibles.length === 0 ? (
      <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde }}>
        <EstadoVacio icono={Users} titulo="Sin conductores" texto="No hay conductores con este filtro." />
      </View>
    ) : (
      visibles.map((c) => (
        <FilaElegible key={c.id} elegida={c.id === elegido} onPress={() => setElegido(c.id)} etiquetaAccesible={c.nombre}>
          <Avatar texto={iniciales(c.nombre)} tamano={40} tono={c.esUsuario ? 'acento' : 'claro'} />
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Texto variante="cuerpo" peso={700} numberOfLines={1}>
              {c.nombre}
              {c.esUsuario ? <Texto variante="ayuda"> (demo)</Texto> : null}
            </Texto>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <InsigniaConductor c={c} />
              <Texto variante="ayuda" numberOfLines={1}>
                {c.comuna?.nombre ?? 'Sin dirección'} · {plural(matches[c.id] ?? 0, 'match', 'matches')}
              </Texto>
            </View>
          </View>
        </FilaElegible>
      ))
    );

  if (conTabla && !actual) {
    // Escritorio sin nada elegido: tabla completa.
    return (
      <PaginaPanel titulo="Conductores" descripcion="Todos los conductores de la demo. Toca uno para ver su ficha.">
        {filtros}
        <View style={{ gap: 0 }}>
          <CabeceraTabla
            columnas={[
              { titulo: 'Conductor', flex: 2.3 },
              { titulo: 'Comuna', flex: 1.5 },
              { titulo: 'Licencia', flex: 0.9 },
              { titulo: 'Estado', flex: 1.4 },
              { titulo: 'Matches', flex: 0.7, alinear: 'right' },
              { titulo: 'Registro', flex: 0.9, alinear: 'right' },
            ]}
          />
          <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde, overflow: 'hidden' }}>
            {visibles.length === 0 ? (
              <EstadoVacio icono={Users} titulo="Sin conductores" texto="No hay conductores con este filtro." />
            ) : (
              visibles.map((c, i) => (
                <View key={c.id}>
                  {i > 0 ? <Separador /> : null}
                  <FilaTabla c={c} matches={matches[c.id] ?? 0} ahora={ahora} onPress={() => setElegido(c.id)} />
                </View>
              ))
            )}
          </View>
        </View>
      </PaginaPanel>
    );
  }

  return (
    <PaginaPanel titulo="Conductores" descripcion="Todos los conductores de la demo. Toca uno para ver su ficha.">
      {!actual || dosColumnas ? filtros : null}
      <ListaDetalle
        lista={lista}
        hayElegido={!!actual}
        onVolver={() => setElegido(null)}
        detalle={
          actual ? (
            <FichaConductor c={actual} ahora={ahora} onCerrar={escritorio ? () => setElegido(null) : undefined} />
          ) : (
            <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde, minHeight: 320, justifyContent: 'center' }}>
              <EstadoVacio icono={UserRound} titulo="Elige un conductor" texto="Verás su perfil, sus documentos y sus matches." />
            </View>
          )
        }
      />
    </PaginaPanel>
  );
}

function FilaTabla({ c, matches, ahora, onPress }: { c: ConductorVista; matches: number; ahora: number; onPress: () => void }) {
  return (
    <FilaPresionable onPress={onPress} etiqueta={c.nombre}>
      <View style={{ flex: 2.3, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Avatar texto={iniciales(c.nombre)} tamano={36} tono={c.esUsuario ? 'acento' : 'claro'} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Texto variante="secundario" peso={700} numberOfLines={1}>
            {c.nombre}
          </Texto>
          <Texto variante="pequeno" numberOfLines={1}>
            {c.esUsuario ? 'Conductor de la demo' : c.celular}
          </Texto>
        </View>
      </View>
      <Texto variante="secundario" numberOfLines={1} style={{ flex: 1.5 }}>
        {c.comuna ? `${c.comuna.nombre}` : 'Sin dirección'}
        {c.zona ? <Texto variante="pequeno">{`  ${c.zona.nombre}`}</Texto> : null}
      </Texto>
      <Texto variante="secundario" style={{ flex: 0.9 }}>
        {(c.clasesRevisadas.length ? c.clasesRevisadas : c.clasesDeclaradas).join(', ') || '—'}
      </Texto>
      <View style={{ flex: 1.4 }}>
        <InsigniaConductor c={c} />
      </View>
      <Texto variante="secundario" peso={700} style={{ flex: 0.7, textAlign: 'right' }}>
        {matches}
      </Texto>
      <Texto variante="ayuda" style={{ flex: 0.9, textAlign: 'right' }}>
        {c.registradoEl ? haceCuanto(c.registradoEl, ahora).replace('hace ', '') : '—'}
      </Texto>
    </FilaPresionable>
  );
}


function FilaPresionable({ children, onPress, etiqueta }: { children: ReactNode; onPress: () => void; etiqueta: string }) {
  return (
    <Presionable
      role="button"
      aria-label={`Ver ficha de ${etiqueta}`}
      onPress={onPress}
      style={({ hovered }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 60,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: hovered ? color.fondo : color.superficie,
      })}>
      {children}
    </Presionable>
  );
}

// ---------------------------------------------------------------------------
// Ficha (solo lectura)
// ---------------------------------------------------------------------------

function FichaConductor({ c, ahora, onCerrar }: { c: ConductorVista; ahora: number; onCerrar?: () => void }) {
  const cat = useCatalogos();
  const susMatches = useDerivado((s) => matchesDeConductor(s, c.id));
  const pre = useDerivado((s) => precondicionDeConductor(s, c.id));
  const enCola = sel.TIPOS_DOC_ORDEN.some((t) => c.documentos[t].estado === 'en_revision' && c.documentos[t].etapa === 'equipo');
  const negocios = c.negocios.map((id) => cat.negocios.find((n) => n.id === id)?.nombre ?? id);
  const experiencia = cat.tamanos.filter((t) => (c.experiencia[t.id] ?? 0) > 0);
  const idiomas = c.idiomas.map((id) => cat.idiomas.find((i) => i.clave === id)?.nombre ?? id);

  return (
    <View style={{ gap: 16 }}>
      <TarjetaPanel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar texto={iniciales(c.nombre)} tamano={56} tono={c.esUsuario ? 'acento' : 'oscuro'} />
          <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
            <Titulo nivel={2}>{c.nombre}</Titulo>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <InsigniaConductor c={c} />
              {c.esUsuario ? <Insignia texto="Conductor de la demo" tono="acento" icono={null} /> : null}
              <Insignia texto={c.disponible ? 'Disponible' : 'No disponible'} tono={c.disponible ? 'verde' : 'gris'} icono={c.disponible ? 'check' : null} />
            </View>
          </View>
          {onCerrar ? <Boton titulo="Cerrar" variante="texto" tamano="mediano" onPress={onCerrar} /> : null}
        </View>
        {pre ? (
          <Aviso icono="info" titulo="No entra al match" texto={TEXTO_PRECONDICION[pre]} />
        ) : (
          <Aviso tono="exito" icono="info" titulo={`Entra al match: ${plural(susMatches.length, 'match vigente', 'matches vigentes')}`} />
        )}
      </TarjetaPanel>

      <TarjetaPanel titulo="Datos">
        <GrillaDatos>
          <Dato etiqueta="Celular">{c.celular || '—'}</Dato>
          <Dato etiqueta="Correo">
            {/* El correo se corta después de la @ (no en medio de una palabra). */}
            {c.correo ? c.correo.replace('@', '@\u200B') : '—'}
          </Dato>
          <Dato etiqueta="Edad">{c.edad !== null ? `${c.edad} años` : '—'}</Dato>
          <Dato etiqueta="Registrado">{c.registradoEl ? fechaLarga(c.registradoEl) : '—'}</Dato>
          <Dato etiqueta="Comuna">{c.comuna ? `${c.comuna.nombre} · ${c.zona?.nombre ?? ''}` : 'Sin dirección'}</Dato>
          <Dato etiqueta="Región">{c.region?.nombre ?? '—'}</Dato>
        </GrillaDatos>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.fondo, borderRadius: radio.campo, padding: 12 }}>
          <MapPin size={16} color={color.textoSecundario} strokeWidth={2} />
          <View style={{ flex: 1, gap: 1 }}>
            <Texto variante="secundario" peso={600}>
              {c.comuna ? 'Dirección privada' : 'Sin dirección'}
            </Texto>
            <Texto variante="pequeno">No se muestra a nadie. Solo la recibe un titular si el conductor se la comparte.</Texto>
          </View>
          <Lock size={14} color={color.textoSecundario} strokeWidth={2} />
        </View>
      </TarjetaPanel>

      <TarjetaPanel titulo="Perfil de trabajo">
        <GrillaDatos>
          <Dato etiqueta="Licencia declarada">{c.clasesDeclaradas.join(', ') || '—'}</Dato>
          <Dato etiqueta="Licencia revisada">{c.clasesRevisadas.join(', ') || 'Sin revisar'}</Dato>
          <Dato etiqueta="Busca trabajo en">{negocios.join(', ') || '—'}</Dato>
          <Dato etiqueta="Turno · Días">{`${textoTurnos(c.turnos)} · ${textoDias(c.dias)}`}</Dato>
          <Dato etiqueta="Estacionamiento seguro">{c.tieneEstacionamiento ? 'Sí' : 'No'}</Dato>
          <Dato etiqueta="Idiomas">{idiomas.join(', ') || '—'}</Dato>
        </GrillaDatos>
        <View style={{ gap: 8 }}>
          <Texto variante="pequeno">Experiencia</Texto>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {experiencia.length === 0 ? (
              <Texto variante="secundario">Sin experiencia declarada</Texto>
            ) : (
              experiencia.map((t) => <Insignia key={t.id} texto={`${t.nombre} · ${plural(c.experiencia[t.id] ?? 0, 'año', 'años')}`} tono="gris" icono={null} />)
            )}
          </View>
        </View>
      </TarjetaPanel>

      <TarjetaPanel
        titulo="Documentos"
        derecha={enCola ? <Boton titulo="Ir a la cola" variante="oscuro" tamano="mediano" onPress={() => router.navigate('/admin/documentos')} /> : undefined}
        separacion={4}>
        {sel.TIPOS_DOC_ORDEN.map((t, i) => {
          const d = c.documentos[t];
          const motivo = d.motivo ? cat.motivosRechazo.find((m) => m.id === d.motivo)?.nombre : null;
          return (
            <View key={t}>
              {i > 0 ? <Separador /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 8 }}>
                <View style={{ flex: 1, gap: 1 }}>
                  <Texto variante="secundario" peso={600}>
                    {NOMBRE_DOC[t]}
                  </Texto>
                  <Texto variante="pequeno">
                    {d.estado === 'aprobado'
                      ? `${d.quienDecidio === 'ia' ? 'Agente de IA' : 'Persona del equipo'} · ${fechaLarga(d.revisadoEn)}`
                      : d.estado === 'rechazado'
                        ? (motivo ?? 'No aprobado')
                        : d.estado === 'en_revision'
                          ? d.etapa === 'ia'
                            ? 'Pre-revisión del agente'
                            : `En cola ${haceCuanto(d.enviadoEl, ahora)}`
                          : d.estado === 'subido'
                            ? 'Subido, sin enviar'
                            : 'Falta'}
                  </Texto>
                </View>
                {d.estado === 'aprobado' ? (
                  <Insignia texto="Aprobado" tono="verde" />
                ) : d.estado === 'rechazado' ? (
                  <Insignia texto="No aprobado" tono="roja" icono={null} />
                ) : d.estado === 'en_revision' ? (
                  <Insignia texto="En revisión" tono="amarilla" icono={null} />
                ) : (
                  <Insignia texto={d.estado === 'subido' ? 'Subido' : 'Falta'} tono="gris" icono={null} />
                )}
              </View>
            </View>
          );
        })}
      </TarjetaPanel>

      <TarjetaPanel titulo="Matches vigentes" descripcion="Con las reglas del match de hoy." separacion={4}>
        {susMatches.length === 0 ? (
          <Texto variante="secundario" tono="secundario" style={{ paddingVertical: 8 }}>
            {pre ? `Sin matches: ${TEXTO_PRECONDICION[pre].toLowerCase()}.` : 'Ninguna búsqueda coincide por ahora.'}
          </Texto>
        ) : (
          susMatches.map((m, i) => (
            <View key={m.busqueda.id}>
              {i > 0 ? <Separador /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 }}>
                <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <Texto variante="secundario" peso={600} numberOfLines={1}>
                    {m.negocio?.nombre} · {m.comuna}
                  </Texto>
                  <Texto variante="pequeno" numberOfLines={1}>
                    {sel.nombreTitular(m.titular)}
                    {m.resultado.textosNoCoinciden.length ? ` · ${m.resultado.textosNoCoinciden.join(', ')}` : ''}
                  </Texto>
                </View>
                <Insignia texto={`${m.resultado.porcentaje} %`} tono={m.resultado.porcentaje === 100 ? 'verde' : 'gris'} icono={m.resultado.porcentaje === 100 ? 'check' : null} />
              </View>
            </View>
          ))
        )}
      </TarjetaPanel>
    </View>
  );
}

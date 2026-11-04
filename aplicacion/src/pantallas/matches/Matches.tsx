// D1 · Mis matches
// Ruta: /conductor/matches
// Maqueta: docs/maqueta/CondMatches.dc.html
// Lista los matches vigentes del usuario (motor de match.ts con su perfil real), con pestañas
// Todos / Favoritos y conteos reales. Sin el contacto del titular: solo dice si lo compartió.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useAvancePerfil, useMatchesDelUsuario } from '@/datos/hooks';
import type { MatchUsuario } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import {
  Aviso,
  Boton,
  ControlSegmentado,
  EstadoVacio,
  Insignia,
  Pantalla,
  Separador,
  Tarjeta,
  color,
  fuente,
  mostrarToast,
  tipo,
} from '@/ui';
import { Bell, ChevronRight, CircleAlert, Hourglass, Lock, LockOpen, Moon, Star, UserRound } from '@/ui/iconos';

import { useRegistroFichaVista } from './acciones';
import { Aparecer, BotonFavorito, TituloPestana } from './piezas';

type Filtro = 'todos' | 'favoritos';

const RUTA_PASO: Record<number, Href> = {
  1: '/conductor/registro/1',
  2: '/conductor/registro/2',
  3: '/conductor/registro/3',
  4: '/conductor/registro/4',
  5: '/conductor/registro/5',
};

function TarjetaMatch({ m }: { m: MatchUsuario }) {
  const nombre = m.titular.razonSocial ?? m.titular.nombre;
  const compartido = !!m.contactoCompartidoEl;
  return (
    <Tarjeta padding={16} separacion={12}>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Text role="heading" aria-level={2} style={[tipo.tituloTarjeta, { color: color.texto, flex: 1, minWidth: 0 }]}>
            {m.negocio.nombre}
          </Text>
          <BotonFavorito
            busquedaId={m.id}
            favorito={m.favorito}
            nombre={`${m.negocio.nombre} de ${nombre}`}
            style={{ marginTop: -12, marginBottom: -12, marginRight: -6 }}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 6 }}>
          <Text style={[tipo.secundario, fuente(600), { color: color.textoSuave }]}>{nombre}</Text>
          {m.titular.revisado ? <Insignia texto="Revisado" tono="verde" /> : null}
          {m.origen === 'postulacion' ? <Insignia texto="Por postulación" tono="gris" /> : null}
        </View>
        <Text style={[tipo.ayuda, { lineHeight: 18, color: color.textoSecundario }]}>{m.condiciones}</Text>
      </View>
      <Separador />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
          {compartido ? (
            <LockOpen size={15} color={color.exito} strokeWidth={2.2} />
          ) : (
            <Lock size={15} color={color.textoSecundario} strokeWidth={2.2} />
          )}
          <Text style={[tipo.ayuda, fuente(600), { color: compartido ? color.exitoTexto : color.textoSecundario, flexShrink: 1 }]}>
            {compartido ? 'Te compartió su contacto' : 'Contacto oculto'}
          </Text>
        </View>
        <Boton
          titulo="Ver"
          variante="oscuro"
          tamano="mediano"
          iconoDerecha={ChevronRight}
          etiquetaAccesible={`Ver ${m.negocio.nombre} de ${nombre}`}
          onPress={() => router.push({ pathname: '/conductor/matches/[id]', params: { id: m.id } })}
          style={{ flexShrink: 0 }}
        />
      </View>
    </Tarjeta>
  );
}

/** Por qué no hay matches todavía (perfil, documentos, disponibilidad o simplemente sin búsquedas). */
function SinMatches() {
  const registrado = useDemo((s) => s.conductor.registrado);
  const estadoPerfil = useDemo((s) => s.conductor.estadoPerfil);
  const verificacion = useDemo((s) => s.conductor.estadoVerificacion);
  const disponible = useDemo((s) => s.conductor.disponible);
  const cambiarDisponible = useDemo((s) => s.cambiarDisponible);
  const avance = useAvancePerfil();

  if (!registrado || estadoPerfil !== 'completo') {
    return (
      <EstadoVacio
        icono={UserRound}
        titulo="Completa tu perfil"
        texto="Con tu perfil completo y tus documentos aprobados, aquí verás a los titulares que calzan contigo."
        accion={{ titulo: 'Completar mi perfil', onPress: () => router.push(RUTA_PASO[avance.siguientePaso ?? 1]) }}
      />
    );
  }
  if (verificacion === 'con_observaciones') {
    return (
      <EstadoVacio
        icono={CircleAlert}
        titulo="Revisa tus documentos"
        texto="Uno de tus documentos no fue aprobado. Cuando esté listo, verás tus matches aquí."
        accion={{ titulo: 'Ver mis documentos', onPress: () => router.push('/conductor/perfil/documentos') }}
      />
    );
  }
  if (verificacion !== 'verificado') {
    return (
      <EstadoVacio
        icono={Hourglass}
        titulo="Estamos revisando tus documentos"
        texto="Cuando estén aprobados, verás aquí a los titulares que calzan contigo."
        accion={{ titulo: 'Ver mis documentos', onPress: () => router.push('/conductor/perfil/documentos') }}
      />
    );
  }
  if (!disponible) {
    return (
      <EstadoVacio
        icono={Moon}
        titulo="No estás disponible"
        texto="Mientras esté apagado, los titulares no te encuentran."
        accion={{
          titulo: 'Estoy disponible',
          onPress: () => {
            cambiarDisponible(true);
            mostrarToast('Listo, ya estás disponible.', 'exito');
          },
        }}
      />
    );
  }
  return (
    <EstadoVacio
      icono={Bell}
      titulo="Aún no tienes matches"
      texto="Te avisaremos apenas un titular busque a alguien como tú."
      accion={{ titulo: 'Revisa tus turnos y días', onPress: () => router.push('/conductor/registro/4') }}
    />
  );
}

export default function Matches() {
  useRegistroFichaVista();
  const matches = useMatchesDelUsuario();
  const disponible = useDemo((s) => s.conductor.disponible);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const favoritos = matches.filter((m) => m.favorito);
  const lista = filtro === 'favoritos' ? favoritos : matches;

  return (
    <Pantalla inferior={24}>
      <TituloPestana>Mis matches</TituloPestana>

      {matches.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <SinMatches />
        </View>
      ) : (
        <>
          <ControlSegmentado<Filtro>
            etiquetaAccesible="Filtrar matches"
            opciones={[
              { clave: 'todos', etiqueta: `Todos · ${matches.length}` },
              { clave: 'favoritos', etiqueta: `Favoritos · ${favoritos.length}` },
            ]}
            valor={filtro}
            onCambiar={setFiltro}
          />

          {!disponible ? (
            <Aviso icono={Moon} texto="No estás disponible: no apareces en búsquedas nuevas." />
          ) : null}

          {lista.length === 0 ? (
            <EstadoVacio
              icono={Star}
              titulo="Aún no tienes favoritos"
              texto="Toca la estrella de un match para guardarlo aquí."
              style={{ paddingTop: 56 }}
            />
          ) : (
            <View role="list" style={{ gap: 10 }}>
              {lista.map((m, i) => (
                <Aparecer key={`${filtro}-${m.id}`} retraso={Math.min(i, 5) * 40}>
                  <View role="listitem">
                    <TarjetaMatch m={m} />
                  </View>
                </Aparecer>
              ))}
            </View>
          )}
        </>
      )}
    </Pantalla>
  );
}

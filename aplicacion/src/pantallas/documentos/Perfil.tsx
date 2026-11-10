// E1 · Perfil (demo)
// Ruta: /conductor/perfil
// Maqueta: docs/maqueta/CondPerfil.dc.html
// Lo común con la app real está en ./PerfilBase.tsx. Aquí se agrega lo que solo tiene la demo:
// "Seguridad y privacidad" (Mis documentos, Quién recibió mis datos, Conversaciones bloqueadas),
// "Eliminar mi cuenta" y, al cerrar sesión, la vuelta al menú de la demo.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { iniciales } from '@/datos/formato';
import { useEntregasDelUsuario, useResumenDocumentos } from '@/datos/hooks';
import { nombreTitular } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import {
  Avatar,
  Boton,
  FilaLista,
  GrupoLista,
  HojaInferior,
  Insignia,
  Texto,
  TituloSeccion,
  color,
  fuente,
  mostrarToast,
  tipo,
  type PropsInsignia,
} from '@/ui';
import { Ban, Eye, Trash } from '@/ui/iconos';
import { Hoja } from '@/ui/iconosPropios';

import { irAlSelector } from './acciones';
import { PerfilBase } from './PerfilBase';

function SeguridadYPrivacidad() {
  const bloqueos = useDemo((s) => s.bloqueos);
  const titulares = useDemo((s) => s.titulares);
  const desbloquearTitular = useDemo((s) => s.desbloquearTitular);
  const docs = useResumenDocumentos();
  const entregas = useEntregasDelUsuario();
  const [hoja, setHoja] = useState<'bloqueos' | null>(null);

  const insigniaDocs: PropsInsignia | null =
    docs.rechazados > 0
      ? { texto: docs.rechazados === 1 ? '1 no aprobado' : `${docs.rechazados} no aprobados`, tono: 'roja', icono: null }
      : docs.vencenPronto > 0
        ? { texto: docs.vencenPronto === 1 ? '1 vence pronto' : `${docs.vencenPronto} vencen pronto`, tono: 'amarilla', icono: null }
        : docs.enRevision > 0
          ? { texto: `${docs.enRevision} en revisión`, tono: 'gris', icono: null }
          : docs.faltan > 0
            ? { texto: docs.faltan === 1 ? 'Falta 1' : `Faltan ${docs.faltan}`, tono: 'gris', icono: null }
            : null;

  const titularesBloqueados = bloqueos.map((id) => titulares.find((t) => t.id === id)).filter((t) => !!t);

  return (
    <>
      <View style={{ gap: 8 }}>
        <TituloSeccion>Seguridad y privacidad</TituloSeccion>
        <GrupoLista>
          <FilaLista
            titulo="Mis documentos"
            icono={Hoja}
            href="/conductor/perfil/documentos"
            derecha={insigniaDocs ? <Insignia {...insigniaDocs} /> : undefined}
          />
          <FilaLista
            titulo="Quién recibió mis datos"
            icono={Eye}
            href="/conductor/perfil/quien-recibio"
            derecha={entregas.length > 0 ? <Insignia texto={String(entregas.length)} tono="gris" icono={null} /> : undefined}
          />
          <FilaLista
            titulo="Conversaciones bloqueadas"
            icono={Ban}
            onPress={() => setHoja('bloqueos')}
            derecha={bloqueos.length > 0 ? <Insignia texto={String(bloqueos.length)} tono="gris" icono={null} /> : undefined}
          />
        </GrupoLista>
      </View>

      {/* Conversaciones bloqueadas */}
      <HojaInferior
        visible={hoja === 'bloqueos'}
        onCerrar={() => setHoja(null)}
        titulo="Conversaciones bloqueadas"
        descripcion={titularesBloqueados.length > 0 ? 'No te pueden escribir ni ver tu ficha.' : undefined}>
        {titularesBloqueados.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 24 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={24} color={color.textoSecundario} strokeWidth={2} />
            </View>
            <Texto variante="fuerte" centrado>
              No has bloqueado a nadie
            </Texto>
            <Texto variante="secundario" tono="secundario" centrado>
              Puedes bloquear a un titular desde su conversación.
            </Texto>
          </View>
        ) : (
          titularesBloqueados.map((t) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 }}>
              <Avatar texto={iniciales(nombreTitular(t))} tamano={40} tono="claro" />
              <Text numberOfLines={2} style={[tipo.cuerpo, fuente(600), { flex: 1, color: color.texto }]}>
                {nombreTitular(t)}
              </Text>
              <Boton
                titulo="Desbloquear"
                variante="contorno"
                tamano="mediano"
                onPress={() => {
                  desbloquearTitular(t.id);
                  mostrarToast(`Desbloqueaste a ${nombreTitular(t)}.`, 'exito');
                }}
              />
            </View>
          ))
        )}
      </HojaInferior>
    </>
  );
}

export default function Perfil() {
  // Navegación de la pila raíz: para volver al selector de la demo.
  const raiz = useNavigation('/');
  return (
    <PerfilBase
      seccionSeguridad={<SeguridadYPrivacidad />}
      filaEliminar={<FilaLista titulo="Eliminar mi cuenta" icono={Trash} peligro href="/conductor/eliminar-cuenta" flecha={false} />}
      alCerrarSesion={() => {
        mostrarToast('Cerraste sesión.');
        irAlSelector(raiz);
      }}
    />
  );
}

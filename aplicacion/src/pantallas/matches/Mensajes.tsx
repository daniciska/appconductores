// D3 · Mensajes
// Ruta: /conductor/mensajes
// Maqueta: docs/maqueta/CondMensajes.dc.html
// Conversaciones del conductor con titulares de sus matches (la más reciente primero), con no leídos,
// "escribiendo…" en vivo y la insignia "Contacto compartido".
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { useBorradores } from '@/datos/borradores';
import { cuandoCorto, iniciales } from '@/datos/formato';
import { useAhora, useConversaciones } from '@/datos/hooks';
import { nombreTitular, type ConversacionResumen } from '@/datos/selectores';
import { Avatar, EstadoVacio, Insignia, Pantalla, Presionable, Separador, color, fuente, tipo } from '@/ui';
import { Ban, Info, MessageSquare, Phone } from '@/ui/iconos';

import { useRegistroFichaVista } from './acciones';
import { Aparecer, TituloPestana } from './piezas';

function vistaPrevia(c: ConversacionResumen, borrador?: string): string {
  if (borrador?.trim()) return `Borrador: ${borrador.trim()}`;
  const u = c.ultimo;
  if (!u) return '';
  if (u.autor === 'conductor') return `Tú: ${u.texto}`;
  return u.texto;
}

function FilaConversacion({ c, ahora }: { c: ConversacionResumen; ahora: number }) {
  const borrador = useBorradores((s) => s.datos[`chat:${c.busquedaId}`]) as string | undefined;
  const nombre = nombreTitular(c.titular);
  const nuevo = c.noLeidos > 0;
  const etiqueta = [
    nombre,
    c.negocio.nombre,
    nuevo ? `${c.noLeidos} ${c.noLeidos === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}` : null,
    c.escribiendo ? 'escribiendo' : null,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <Presionable
      role="link"
      aria-label={etiqueta}
      onPress={() => router.push({ pathname: '/conductor/mensajes/[id]', params: { id: c.busquedaId } })}
      style={{ minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, opacity: c.bloqueado ? 0.6 : 1 }}>
      <Avatar texto={iniciales(nombre)} tamano={44} forma="circulo" />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <Text numberOfLines={1} style={[tipo.cuerpo, fuente(nuevo ? 700 : 600), { color: color.texto, flexShrink: 1, minWidth: 0 }]}>
            {nombre}
          </Text>
          <Text style={[fuente(nuevo ? 700 : 400), { fontSize: 12, lineHeight: 16, color: nuevo ? color.texto : color.textoSecundario, flexShrink: 0 }]}>
            {cuandoCorto(c.ultimo?.hora, ahora)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {c.escribiendo ? (
            <Text numberOfLines={1} style={[tipo.secundario, fuente(600), { color: color.exitoTexto, flexShrink: 1 }]}>
              escribiendo…
            </Text>
          ) : (
            <Text
              numberOfLines={1}
              style={[tipo.secundario, { color: nuevo ? color.textoSuave : color.textoSecundario, flexShrink: 1, minWidth: 0 }]}>
              {vistaPrevia(c, borrador)}
            </Text>
          )}
          {nuevo ? (
            <View
              aria-hidden
              style={{
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
                borderRadius: 10,
                backgroundColor: color.acento,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <Text style={[fuente(700), { fontSize: 12, lineHeight: 16, color: color.texto }]}>{c.noLeidos}</Text>
            </View>
          ) : null}
        </View>
        {c.bloqueado ? (
          <View style={{ flexDirection: 'row', paddingTop: 3 }}>
            <Insignia texto="Bloqueado" tono="gris" icono={Ban} />
          </View>
        ) : c.contactoCompartido ? (
          <View style={{ flexDirection: 'row', paddingTop: 3 }}>
            <Insignia texto="Contacto compartido" tono="verde" icono={Phone} />
          </View>
        ) : null}
      </View>
    </Presionable>
  );
}

export default function Mensajes() {
  useRegistroFichaVista();
  const conversaciones = useConversaciones();
  const ahora = useAhora(30000);

  return (
    <Pantalla inferior={24}>
      <TituloPestana>Mensajes</TituloPestana>

      {conversaciones.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <EstadoVacio
            icono={MessageSquare}
            titulo="Aún no tienes mensajes"
            texto="Entra a uno de tus matches y toca “Escribir mensaje” para conversar con el titular."
            accion={{ titulo: 'Ver mis matches', onPress: () => router.navigate('/conductor/matches') }}
          />
        </View>
      ) : (
        <>
          <Aparecer>
            <View
              role="list"
              aria-live="polite"
              style={{
                backgroundColor: color.superficie,
                borderWidth: 1,
                borderColor: color.borde,
                borderRadius: 20,
                paddingVertical: 4,
                paddingHorizontal: 16,
              }}>
              {conversaciones.map((c, i) => (
                <View key={c.busquedaId} role="listitem">
                  {i > 0 ? <Separador sangria={56} /> : null}
                  <FilaConversacion c={c} ahora={ahora} />
                </View>
              ))}
            </View>
          </Aparecer>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4 }}>
            <Info size={16} color={color.textoSecundario} strokeWidth={2} style={{ marginTop: 1 }} />
            <Text style={[tipo.ayuda, { lineHeight: 19, color: color.textoSecundario, flex: 1 }]}>
              Puedes escribirle a cualquier titular con el que hiciste match. Entra al match y toca “Escribir mensaje”.
            </Text>
          </View>
        </>
      )}
    </Pantalla>
  );
}

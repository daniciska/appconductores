// E5 · Eliminar cuenta
// Ruta: /conductor/eliminar-cuenta
// Maqueta: docs/maqueta/CondEliminarCuenta.dc.html
// Borra los datos del usuario de la demo (perfil, documentos, matches, mensajes) y vuelve al selector.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { useDemo } from '@/datos/tienda';
import { Aviso, Boton, Casilla, Encabezado, Pantalla, Presionable, color, fuente, mostrarToast, radio, tipo, volver } from '@/ui';
import { Trash } from '@/ui/iconos';

import { irAlSelector } from './acciones';
import { BotonRojo, BotonTextoSimple, Caja, TituloPantalla } from './piezas';

export default function EliminarCuenta() {
  // Navegación de la pila raíz: para volver al selector de la demo.
  const raiz = useNavigation('/');
  const disponible = useDemo((s) => s.conductor.disponible);
  const cambiarDisponible = useDemo((s) => s.cambiarDisponible);
  const eliminarCuenta = useDemo((s) => s.eliminarCuenta);
  const [entiendo, setEntiendo] = useState(false);
  const [falta, setFalta] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const pausar = () => {
    cambiarDisponible(false);
    mostrarToast('Quedaste en pausa: no apareces en los matches.');
    volver('/conductor/perfil');
  };

  const eliminar = () => {
    if (!entiendo) {
      setFalta(true);
      return;
    }
    setBorrando(true);
    setTimeout(() => {
      eliminarCuenta();
      mostrarToast('Eliminamos tu cuenta y tus datos de la demo.', 'exito');
      irAlSelector(raiz);
    }, 600);
  };

  return (
    <Pantalla>
      <Encabezado volverA="/conductor/perfil" />
      <TituloPantalla
        arriba={
          <View aria-hidden style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color.errorFondo, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Trash size={24} color={color.error} strokeWidth={2} />
          </View>
        }
        titulo="Eliminar mi cuenta"
        subtitulo="Se borrarán tu perfil, tus documentos, tus matches y tus mensajes. No se puede deshacer."
      />

      <Caja gap={12} style={{ alignItems: 'flex-start' }}>
        <View style={{ gap: 4 }}>
          <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 16, lineHeight: 22, color: color.texto }]}>
            Antes de irte
          </Text>
          <Text style={[tipo.secundario, { lineHeight: 21, color: color.textoSuave }]}>
            {disponible
              ? '¿Solo quieres dejar de aparecer? Puedes pausar tu disponibilidad.'
              : 'Ya estás en pausa: los titulares no te ven en sus matches.'}
          </Text>
        </View>
        {disponible ? <Boton titulo="Pausar" variante="contorno" tamano="mediano" onPress={pausar} /> : null}
      </Caja>

      <Presionable
        role="checkbox"
        aria-checked={entiendo}
        aria-label="Entiendo que esto no se puede deshacer."
        onPress={() => {
          setEntiendo((v) => !v);
          setFalta(false);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: color.superficie,
          borderWidth: falta ? 1.5 : 1,
          borderColor: falta ? color.error : color.borde,
          borderRadius: radio.campo,
          paddingVertical: 14,
          paddingHorizontal: 16,
          minHeight: 52,
        }}>
        <Casilla marcada={entiendo} />
        <Text style={[fuente(500), { flex: 1, fontSize: 15, lineHeight: 21, color: color.texto }]}>Entiendo que esto no se puede deshacer.</Text>
      </Presionable>

      {falta ? <Aviso tono="error" icono="alerta" texto="Marca la casilla para confirmar." /> : null}

      <View style={{ marginTop: 'auto', gap: 4, paddingTop: 8 }}>
        <BotonRojo titulo="Eliminar mi cuenta" onPress={eliminar} cargando={borrando} />
        <BotonTextoSimple titulo="Cancelar" onPress={() => volver('/conductor/perfil')} />
      </View>
    </Pantalla>
  );
}

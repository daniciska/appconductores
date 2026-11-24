// Lista desplegable (marca, modelo, color, año de la flota): un campo que abre una hoja con las opciones.
// Con más de 8 opciones agrega un buscador.
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/ui/escala';

import { Campo, FilaRadio, HojaInferior, Presionable, color, fuente, radio, tipo } from '@/ui';
import { ChevronDown, Search } from '@/ui/iconos';

import { sinTildes } from '../ingreso/buscarComuna';

export interface OpcionCampoLista {
  clave: string;
  etiqueta: string;
}

export function CampoLista({
  etiqueta,
  obligatorio,
  valor,
  opciones,
  onCambiar,
  placeholder = 'Elige una opción',
  error,
  deshabilitado,
  style,
}: {
  etiqueta: string;
  obligatorio?: boolean;
  valor: string | null;
  opciones: OpcionCampoLista[];
  onCambiar: (clave: string) => void;
  placeholder?: string;
  error?: string;
  deshabilitado?: boolean;
  style?: object;
}) {
  const [abierta, setAbierta] = useState(false);
  const [buscar, setBuscar] = useState('');
  const elegida = opciones.find((o) => o.clave === valor);
  const filtradas = useMemo(() => {
    const t = sinTildes(buscar);
    return t ? opciones.filter((o) => sinTildes(o.etiqueta).includes(t)) : opciones;
  }, [buscar, opciones]);

  return (
    <View style={[{ gap: 8 }, style]}>
      <Text style={[tipo.etiqueta, { color: color.texto }]}>
        {etiqueta}
        {obligatorio ? (
          <Text aria-hidden style={{ color: color.error }}>
            {' '}
            *
          </Text>
        ) : null}
      </Text>
      <Presionable
        role="button"
        aria-label={`${etiqueta}: ${elegida?.etiqueta ?? 'sin elegir'}`}
        aria-disabled={deshabilitado}
        disabled={deshabilitado}
        onPress={() => {
          setBuscar('');
          setAbierta(true);
        }}
        style={{
          minHeight: 52,
          paddingHorizontal: 16,
          borderRadius: radio.campo,
          backgroundColor: deshabilitado ? color.fondo : color.superficie,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? color.error : color.bordeCampo,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <Text numberOfLines={1} style={[tipo.cuerpo, { flex: 1, color: elegida ? color.texto : color.textoSecundario }]}>
          {elegida?.etiqueta ?? placeholder}
        </Text>
        <ChevronDown size={18} color={color.textoSecundario} strokeWidth={2} />
      </Presionable>
      {error ? <Text role="alert" style={[tipo.ayuda, fuente(600), { color: color.error }]}>{error}</Text> : null}

      <HojaInferior visible={abierta} onCerrar={() => setAbierta(false)} titulo={etiqueta}>
        {opciones.length > 8 ? (
          <Campo valor={buscar} onCambiar={setBuscar} placeholder="Buscar" icono={Search} autoCorrect={false} aria-label={`Buscar ${etiqueta.toLowerCase()}`} />
        ) : null}
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 8, paddingBottom: 4 }} keyboardShouldPersistTaps="handled">
          {filtradas.length === 0 ? (
            <Text style={[tipo.secundario, { color: color.textoSecundario, padding: 8 }]}>No hay opciones con ese nombre.</Text>
          ) : (
            filtradas.map((o) => (
              <FilaRadio
                key={o.clave}
                titulo={o.etiqueta}
                seleccionada={o.clave === valor}
                onPress={() => {
                  onCambiar(o.clave);
                  setAbierta(false);
                }}
              />
            ))
          )}
        </ScrollView>
      </HojaInferior>
    </View>
  );
}

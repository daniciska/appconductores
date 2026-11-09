// Pantalla de clave de la demo (decisión de la dueña, 9-nov). Envuelve todo el sitio: la demo del
// conductor y el panel (/panel) la usan en su layout raíz. Se pide una vez por navegador; la lógica y
// el hash de la clave están en src/datos/claveDemo.ts. Estilo de la Bienvenida y del menú de la demo.
import { useState, type ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

import { accesoRecordado, esClaveCorrecta, recordarAcceso } from '@/datos/claveDemo';
import { Boton, Insignia, Llave, MarcoCelular, Pantalla, color, fuente, radio, tipo } from '@/ui';
import { Sparkles } from '@/ui/iconos';

export function PuertaClave({ children }: { children: ReactNode }) {
  const [abierta, setAbierta] = useState(accesoRecordado);
  if (abierta) return <>{children}</>;
  return <PantallaClave onEntrar={() => setAbierta(true)} />;
}

function PantallaClave({ onEntrar }: { onEntrar: () => void }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revisando, setRevisando] = useState(false);
  const [foco, setFoco] = useState(false);

  async function entrar() {
    if (revisando) return;
    if (!clave.trim()) {
      setError('Escribe la clave.');
      return;
    }
    setRevisando(true);
    const ok = await esClaveCorrecta(clave).catch(() => null);
    setRevisando(false);
    if (ok === null) {
      setError('Este navegador no puede comprobar la clave. Abre la demo con https.');
      return;
    }
    if (!ok) {
      setError('Esa clave no es correcta.');
      return;
    }
    recordarAcceso();
    onEntrar();
  }

  return (
    <MarcoCelular>
      <Pantalla fondo={color.oscuro} separacion={16} superior={40} inferior={20}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radio.boton44,
              backgroundColor: color.acento,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Llave size={24} color={color.texto} />
          </View>
          <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 20, letterSpacing: -0.2, color: color.blanco }}>
            Dale Contacto
          </Text>
        </View>

        <View style={{ marginTop: 28, gap: 14 }}>
          <Insignia texto="Demo con datos de ejemplo" tono="acento" icono={Sparkles} />
          <Text role="heading" aria-level={1} style={[tipo.hero, { color: color.blanco }]}>
            Ingresa la clave de la demo.
          </Text>
          <Text style={[fuente(400), { fontSize: 16, lineHeight: 24, color: '#BDBDBD' }]}>
            Te la pide una sola vez en este navegador.
          </Text>
        </View>

        <View style={{ marginTop: 'auto', paddingTop: 12, gap: 12 }}>
          <Text nativeID="etiqueta-clave" style={[tipo.etiqueta, { color: color.blanco }]}>
            Clave
          </Text>
          <TextInput
            value={clave}
            onChangeText={(t) => {
              setClave(t);
              if (error) setError(null);
            }}
            onSubmitEditing={entrar}
            onFocus={() => setFoco(true)}
            onBlur={() => setFoco(false)}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            returnKeyType="go"
            aria-labelledby="etiqueta-clave"
            aria-invalid={!!error}
            placeholder="Escribe la clave"
            placeholderTextColor={color.textoDeshabilitado}
            style={[
              tipo.cuerpo,
              {
                minHeight: 52,
                paddingHorizontal: 16,
                borderRadius: radio.campo,
                backgroundColor: color.superficie,
                color: color.texto,
                borderWidth: error || foco ? 2 : 1,
                borderColor: error ? color.error : foco ? color.acento : '#2E2E2E',
              },
            ]}
          />
          {error ? (
            <Text role="alert" style={[fuente(600), { fontSize: 14, lineHeight: 20, color: '#FF8A80' }]}>
              {error}
            </Text>
          ) : null}
          <Boton titulo="Entrar" variante="principal" onPress={entrar} cargando={revisando} anchoCompleto />
        </View>
      </Pantalla>
    </MarcoCelular>
  );
}

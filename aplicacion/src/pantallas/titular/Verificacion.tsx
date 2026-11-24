// Titular · Verificación (P12, 24-nov): foto de la cédula de quien usa la cuenta (T18) y, si es empresa, el
// equipo revisa el RUT en el SII sin pedir archivo (T19). En la demo no se sube nada (solo el nombre del
// archivo) y la revisión del equipo se simula sola en unos segundos (SEGUNDOS_REVISION_TITULAR).
// Ruta: /titular/verificacion (en el registro, después de "Tus datos", y desde Perfil)
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/ui/escala';
import { router } from 'expo-router';

import { fechaLarga } from '@/datos/formato';
import { useDerivado } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import { CabeceraFormulario, NotaDemo } from '@/pantallas/ingreso/comunes';
import { elegirArchivo, formatoValido } from '@/pantallas/documentos/acciones';
import { Boton, Encabezado, Insignia, Pantalla, color, fuente, mostrarToast, radio, tipo } from '@/ui';
import { Building, Clock, IdCard, ShieldCheck, Trash } from '@/ui/iconos';

import { irABusquedas } from './piezas';

function Fila({ icono: Icono, titulo, texto, derecha }: { icono: typeof IdCard; titulo: string; texto: string; derecha?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color.fondo, alignItems: 'center', justifyContent: 'center' }}>
        <Icono size={22} color={color.texto} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={[tipo.fuerte, { color: color.texto }]}>{titulo}</Text>
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>{texto}</Text>
      </View>
      {derecha}
    </View>
  );
}

export default function Verificacion() {
  const registro = useDerivado((s) => s.titularDemo.registro);
  const enRegistro = useDerivado((s) => !s.titulares.find((t) => t.id === s.titularDemo.titularId)?.revisado && s.titularDemo.registro.cedula.estado === 'falta');
  const subir = useDemo((s) => s.subirCedulaTitular);
  const quitar = useDemo((s) => s.quitarCedulaTitular);
  const enviar = useDemo((s) => s.enviarCedulaTitular);
  const [subiendo, setSubiendo] = useState(false);
  const c = registro.cedula;
  const empresa = registro.tipo === 'empresa';

  const guardar = (nombre: string) => {
    setSubiendo(true);
    setTimeout(() => {
      subir(nombre);
      setSubiendo(false);
    }, 500);
  };
  const elegir = async () => {
    const nombre = await elegirArchivo('image/*');
    if (!nombre) return;
    if (!formatoValido(nombre, false)) {
      mostrarToast('Elige una foto (JPG o PNG).', 'error');
      return;
    }
    guardar(nombre);
  };
  const enviarARevision = () => {
    enviar();
    mostrarToast('Enviada. Te avisaremos cuando esté revisada.', 'exito');
    irABusquedas();
  };

  const estadoCedula =
    c.estado === 'aprobado' ? (
      <Insignia texto="Revisada" />
    ) : c.estado === 'en_revision' ? (
      <Insignia texto="En revisión" tono="amarilla" icono={Clock} />
    ) : c.estado === 'subido' ? (
      <Insignia texto="Lista para enviar" tono="gris" icono={null} />
    ) : null;

  return (
    <Pantalla>
      <Encabezado volverA={enRegistro ? '/titular/datos' : '/titular/perfil'} />
      <CabeceraFormulario
        titulo={empresa ? 'Verifica tu cuenta y tu empresa' : 'Verifica tu cuenta'}
        subtitulo="Así los conductores saben que detrás de cada búsqueda hay una persona real."
      />

      <View style={{ backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, borderRadius: radio.tarjeta, padding: 16, gap: 16 }}>
        <Fila
          icono={IdCard}
          titulo="Tu cédula"
          texto={c.estado === 'aprobado' ? `Revisada el ${fechaLarga(c.revisadoEl)}` : c.archivo ? c.archivo : 'Foto del frente, con los datos legibles.'}
          derecha={estadoCedula}
        />
        {empresa ? (
          <Fila
            icono={Building}
            titulo="RUT de la empresa"
            texto={c.estado === 'aprobado' ? 'Revisado en el SII' : 'Lo revisamos en el SII. No tienes que subir nada.'}
            derecha={c.estado === 'aprobado' ? <Insignia texto="Revisado" /> : null}
          />
        ) : null}
      </View>

      {c.estado === 'aprobado' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.exitoFondo, borderRadius: radio.campo, padding: 14 }}>
          <ShieldCheck size={20} color={color.exitoTexto} strokeWidth={2} />
          <Text style={[tipo.secundario, fuente(600), { color: color.exitoTexto, flex: 1 }]}>
            Los conductores ven la insignia «{empresa ? 'Empresa revisada en SII' : 'Titular revisado'}».
          </Text>
        </View>
      ) : c.estado === 'en_revision' ? (
        <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>Mientras la revisamos, ya puedes crear tus búsquedas.</Text>
      ) : null}

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {c.estado === 'falta' ? (
          <>
            <NotaDemo texto="Demo: no se sube nada." accion={{ titulo: 'Usar una foto de ejemplo', onPress: () => guardar('cedula-frente.jpg') }} />
            <Boton titulo="Subir foto de la cédula" onPress={elegir} cargando={subiendo} />
            {enRegistro ? <Boton titulo="Hacerlo después" variante="contorno" onPress={irABusquedas} /> : null}
          </>
        ) : c.estado === 'subido' ? (
          <>
            <Boton titulo="Enviar a revisión" onPress={enviarARevision} />
            <Boton titulo="Cambiar foto" variante="contorno" icono={Trash} onPress={quitar} />
          </>
        ) : (
          <Boton titulo="Ir a mis búsquedas" onPress={() => (router.canGoBack() ? router.back() : irABusquedas())} />
        )}
      </View>
    </Pantalla>
  );
}

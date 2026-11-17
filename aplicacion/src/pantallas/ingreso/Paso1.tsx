// B1 · Paso 1: tus datos
// Ruta: /conductor/registro/1
// Maqueta: docs/maqueta/CondPaso1.dc.html
// Al guardar, el conductor ya queda registrado ("Guardar y continuar" o "Guardar y terminar después").
// Validación (en la demo, solo con el ajuste validarObligatorios encendido; en la app real, siempre):
// campos con *, fecha real, no futura y de 18 años o más (propuesta), correo con formato y al menos una
// clase de licencia. Si el guardado falla (app real), el mensaje sale arriba de los botones y lo escrito
// sigue en pantalla.
// Propuestas (maqueta): S01 pista de qué licencia pide cada negocio abierto; S05 fecha "como en papel"
// y errores con ejemplo; S02 abierto desde el Paso 4 (?editar=1&volver=4) vuelve al Paso 4 al guardar;
// S11 avisa antes de quitar un negocio elegido al quitar una clase, y antes de salir sin guardar.
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { celularCompleto, edad, mascaraFechaEscrita } from '@/datos/formato';
import { habilitaNegocio } from '@/datos/match';
import { useAcciones, useEntorno, useVista, useVistaDerivada } from '@/datos/puerto/contexto';
import { pistaLicencias } from '@/datos/puerto/derivados';
import { Boton, Campo, Chip, Dialogo, Encabezado, FilaInterruptor, Insignia, Pantalla, color, fuente, mostrarToast, radio, tipo } from '@/ui';

import {
  RUTA_PASO,
  irAInicioConductor,
  terminarEdicion,
  useGuardando,
  useModoEdicion,
  usePantallaAbierta,
  useVolverDesdePaso,
  useVolverTrasEditar,
} from './acciones';
import {
  AlertaObligatorios,
  CabeceraFormulario,
  EtiquetaGrupo,
  NotaDemo,
  NotaObligatorio,
  irAlPrimerError,
  useBorradorPaso,
  useRecordarBorrador,
  useSalirSinGuardar,
  useValidarObligatorios,
} from './comunes';

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Error de la fecha de nacimiento ('dd/mm/aaaa') o null si está bien. */
function errorFecha(texto: string): string | null {
  const t = texto.trim();
  if (!t) return 'Ingresa tu fecha de nacimiento.';
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t);
  // S05: si el día y el mes están, pero el año va corto ("05/03/68"), se dice qué falta.
  if (!m && /^\d{2}\/\d{2}\/\d{1,3}$/.test(t)) return 'Escribe el año con 4 números. Ejemplo: 1968.';
  if (!m) return 'Escribe día, mes y año. Ejemplo: 05/03/1968.';
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(a, mes - 1, d);
  if (fecha.getFullYear() !== a || fecha.getMonth() !== mes - 1 || fecha.getDate() !== d || a < 1900) return 'Revisa la fecha.';
  if (fecha.getTime() > Date.now()) return 'La fecha no puede ser futura.';
  const e = edad(t);
  if (e === null || e < 18) return 'Debes tener 18 años o más para registrarte.';
  return null;
}

export default function Paso1() {
  const cuenta = useVista((v) => v.cuenta);
  const conductor = useVista((v) => v.conductor);
  const clasesCatalogo = useVista((v) => v.catalogos.clases);
  const negociosCatalogo = useVista((v) => v.catalogos.negocios);
  const pista = useVistaDerivada(pistaLicencias);
  const volverTrasEditar = useVolverTrasEditar();
  const { diasReconfirmar, ejemplo } = useEntorno();
  const acciones = useAcciones();
  const editar = useModoEdicion();
  const validar = useValidarObligatorios();
  const volverA = useVolverDesdePaso(1);
  const { guardando, ejecutar } = useGuardando();
  const pantalla = usePantallaAbierta();
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [pulsado, setPulsado] = useState<'continuar' | 'despues'>('continuar');

  const borrador = useBorradorPaso(1, !editar, {
    nombres: cuenta.nombres,
    apellido1: cuenta.apellido1,
    apellido2: cuenta.apellido2,
    fecha: conductor.fechaNacimiento,
    correo: cuenta.correo,
    clases: conductor.clasesDeclaradas,
    disponible: conductor.disponible,
  });
  const [nombres, setNombres] = useState(borrador.inicial.nombres);
  const [apellido1, setApellido1] = useState(borrador.inicial.apellido1);
  const [apellido2, setApellido2] = useState(borrador.inicial.apellido2);
  const [fecha, setFecha] = useState(borrador.inicial.fecha);
  const [correo, setCorreo] = useState(borrador.inicial.correo);
  const [clases, setClases] = useState<string[]>(borrador.inicial.clases);
  const [disponible, setDisponible] = useState(borrador.inicial.disponible);
  const [intento, setIntento] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  useRecordarBorrador(borrador, { nombres, apellido1, apellido2, fecha, correo, clases, disponible });

  const errores = {
    nombres: !nombres.trim() ? 'Ingresa tus nombres.' : null,
    apellido1: !apellido1.trim() ? 'Ingresa tu primer apellido.' : null,
    fecha: errorFecha(fecha),
    correo: !correo.trim()
      ? 'Ingresa tu correo electrónico.'
      : !RE_CORREO.test(correo.trim())
        ? 'A tu correo le falta algo. Ejemplo: nombre@correo.cl'
        : null,
    clases: clases.length === 0 ? 'Marca al menos una clase.' : null,
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const ver = intento && validar;
  const e = (k: keyof typeof errores) => (ver ? (errores[k] ?? undefined) : undefined);

  const ordenadas = [...clasesCatalogo].sort((a, b) => a.orden - b.orden);
  const alternarClase = (codigo: string) =>
    setClases((cs) => (cs.includes(codigo) ? cs.filter((c) => c !== codigo) : [...cs, codigo]));

  const vacio = !nombres && !apellido1 && !apellido2 && !fecha && !correo;
  const rellenarEjemplo = () => {
    if (!ejemplo) return;
    setNombres(ejemplo.usuario.nombres);
    setApellido1(ejemplo.usuario.apellido1);
    setApellido2(ejemplo.usuario.apellido2);
    setFecha(ejemplo.usuario.fechaNacimiento);
    setCorreo(ejemplo.usuario.correo);
  };

  // S11: negocios elegidos que se quitarían al quitar una clase (la base los quita sola).
  const quitadas = conductor.clasesDeclaradas.filter((c) => !clases.includes(c));
  const negociosQueSeQuitan = quitadas.length
    ? negociosCatalogo.filter(
        (n) =>
          conductor.negocios.includes(n.id) &&
          habilitaNegocio(conductor.clasesDeclaradas, n, null, clasesCatalogo) &&
          !habilitaNegocio(clases, n, null, clasesCatalogo),
      )
    : [];
  const [confirmarQuitar, setConfirmarQuitar] = useState<'continuar' | 'despues' | null>(null);

  const valores = { nombres, apellido1, apellido2, fecha, correo, clases: [...clases].sort(), disponible };
  const iniciales = { ...borrador.inicial, clases: [...borrador.inicial.clases].sort() };
  const salir = useSalirSinGuardar(editar && JSON.stringify(valores) !== JSON.stringify(iniciales), () => guardar('continuar'), volverTrasEditar);

  const guardar = (siguiente: 'continuar' | 'despues', confirmado = false) =>
    ejecutar(async () => {
      setPulsado(siguiente);
      if (validar && hayErrores) {
        setIntento(true);
        irAlPrimerError(scrollRef);
        return;
      }
      if (negociosQueSeQuitan.length > 0 && !confirmado) {
        setConfirmarQuitar(siguiente);
        return;
      }
      setErrorGuardar(null);
      const primeraVez = !conductor.registrado;
      const r = await acciones.guardarPaso1({ nombres, apellido1, apellido2, fechaNacimiento: fecha, correo, clasesDeclaradas: clases, disponible });
      if (pantalla.salio()) {
        // Salió mientras se guardaba: lo guardado queda, pero no se la lleva a otra pantalla.
        if (r.ok) borrador.olvidar();
        return;
      }
      if (!r.ok) {
        setErrorGuardar(r.error);
        irAlPrimerError(scrollRef);
        return;
      }
      borrador.olvidar();
      if (editar) {
        terminarEdicion(volverTrasEditar);
      } else if (siguiente === 'continuar') {
        router.push(RUTA_PASO[2]);
      } else {
        irAInicioConductor();
      }
      if (primeraVez) {
        // El aviso sale después de navegar para que se vea sobre la pantalla nueva.
        setTimeout(() => mostrarToast('Listo, ya quedaste registrado.', 'exito'), 50);
      }
    });

  return (
    <Pantalla scrollRef={scrollRef}>
      <Encabezado paso={editar ? undefined : 1} volverA={editar ? volverTrasEditar : volverA} onVolver={salir.onVolver} />
      <CabeceraFormulario
        titulo="Tus datos"
        subtitulo={editar ? 'Mantén tus datos al día.' : 'Con estos datos ya quedas registrado. El resto lo puedes completar ahora o después.'}>
        {ejemplo && vacio ? <NotaDemo texto={ejemplo.etiqueta} accion={{ titulo: ejemplo.rellenarDatos, onPress: rellenarEjemplo }} /> : null}
      </CabeceraFormulario>

      <View style={{ marginTop: 8, gap: 18 }}>
        <Campo
          etiqueta="Nombres"
          obligatorio
          valor={nombres}
          onCambiar={setNombres}
          placeholder="Como aparecen en tu cédula"
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
          error={e('nombres')}
        />

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <Campo
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Primer apellido"
            obligatorio
            valor={apellido1}
            onCambiar={setApellido1}
            autoComplete="family-name"
            textContentType="familyName"
            autoCapitalize="words"
            error={e('apellido1')}
          />
          <Campo
            style={{ flex: 1, minWidth: 0 }}
            etiqueta="Segundo apellido"
            notaEtiqueta="(si tienes)"
            valor={apellido2}
            onCambiar={setApellido2}
            autoComplete="additional-name"
            autoCapitalize="words"
          />
        </View>

        <Campo
          etiqueta="Fecha de nacimiento"
          obligatorio
          valor={fecha}
          onCambiar={(t) => setFecha(mascaraFechaEscrita(t))}
          placeholder="día/mes/año"
          keyboardType="number-pad"
          inputMode="numeric"
          autoComplete="birthdate-full"
          maxLength={10}
          ayuda="Los titulares solo ven tu edad."
          error={e('fecha')}
        />

        <Campo
          etiqueta="Correo electrónico"
          obligatorio
          valor={correo}
          onCambiar={setCorreo}
          placeholder="nombre@correo.cl"
          keyboardType="email-address"
          inputMode="email"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          error={e('correo')}
        />

        <View style={{ gap: 12 }}>
          <EtiquetaGrupo
            titulo="Clases de licencia"
            obligatorio
            ayuda="Marca todas las que aparecen en tu licencia."
            error={e('clases')}
          />
          <View role="group" aria-label="Clases de licencia" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ordenadas.map((c) => (
              <Chip
                key={c.codigo}
                etiqueta={c.codigo}
                etiquetaAccesible={c.nombre}
                seleccionado={clases.includes(c.codigo)}
                onPress={() => alternarClase(c.codigo)}
                style={ver && errores.clases ? { borderColor: color.error } : undefined}
              />
            ))}
          </View>
          {pista ? <Text style={[tipo.mensajeCampo, { color: color.textoSecundario }]}>{pista}</Text> : null}
        </View>

        <FilaInterruptor
          titulo="Disponible para trabajar"
          ayuda={`Te pediremos confirmarlo cada ${diasReconfirmar} días.`}
          valor={disponible}
          onCambiar={setDisponible}
        />

        <View
          style={{
            backgroundColor: color.superficie,
            borderWidth: 1,
            borderColor: color.borde,
            borderRadius: radio.campo,
            minHeight: 64,
            paddingVertical: 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={[tipo.ayuda, { color: color.textoSecundario }]}>
              {cuenta.celularVerificado ? 'Celular verificado' : 'Celular'}
            </Text>
            <Text style={[tipo.cuerpo, fuente(600), { color: color.texto }]}>{celularCompleto(cuenta.celular)}</Text>
          </View>
          {cuenta.celularVerificado ? <Insignia texto="Verificado" /> : <Insignia texto="Sin verificar" tono="gris" />}
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {ver && hayErrores ? <AlertaObligatorios /> : errorGuardar ? <AlertaObligatorios texto={errorGuardar} /> : null}
        {editar ? (
          <Boton titulo="Guardar cambios" onPress={() => guardar('continuar')} cargando={guardando} />
        ) : (
          <>
            <Boton titulo="Guardar y continuar" onPress={() => guardar('continuar')} cargando={guardando && pulsado === 'continuar'} />
            <Boton
              titulo="Guardar y terminar después"
              variante="contorno"
              onPress={() => guardar('despues')}
              cargando={guardando && pulsado === 'despues'}
            />
          </>
        )}
        <NotaObligatorio />
      </View>

      {salir.dialogo}
      <Dialogo
        visible={confirmarQuitar !== null}
        titulo={quitadas.length > 1 ? `¿Quitar las clases ${unir(quitadas)}?` : `¿Quitar la clase ${quitadas[0] ?? ''}?`}
        texto={`También se ${negociosQueSeQuitan.length > 1 ? 'quitarán' : 'quitará'} ${unir(negociosQueSeQuitan.map((n) => n.nombre))} de lo que buscas.`}
        confirmar={{
          titulo: 'Quitar',
          onPress: () => {
            const siguiente = confirmarQuitar ?? 'continuar';
            setConfirmarQuitar(null);
            void guardar(siguiente, true);
          },
        }}
        cancelar={{ onPress: () => setConfirmarQuitar(null) }}
      />
    </Pantalla>
  );
}

/** "A2", "A2 y A3", "Taxi, Taxi colectivo y Taxi ejecutivo". */
function unir(lista: string[]): string {
  return lista.length <= 1 ? (lista[0] ?? '') : `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}`;
}

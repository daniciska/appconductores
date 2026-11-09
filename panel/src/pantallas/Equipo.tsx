// Panel · Equipo
// Ruta: /panel/equipo
// Sin maqueta (panel web). Personas del equipo con su rol (Revisor o Administrador) y el registro de acciones.
import { useState } from 'react';
import { View } from 'react-native';

import { useAhora } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import type { MiembroEquipo, RolEquipo } from '@/datos/tipos';
import { fechaLarga, haceCuanto, iniciales, mascaraCelular } from '@/datos/formato';
import {
  Avatar,
  Boton,
  Campo,
  ControlSegmentado,
  EstadoVacio,
  Insignia,
  Interruptor,
  Separador,
  Texto,
  color,
  mostrarToast,
  radio,
} from '@/ui';
import { PaginaPanel } from '@panel/marco';
import { ClipboardList, Plus, ShieldCheck, UserRound } from '@/ui/iconos';

import { agregarMiembro, alternarMiembroActivo, cambiarRolMiembro } from '@panel/datos/acciones';
import { NOMBRE_ROL, firmaDe } from '@panel/permisos';
import { usePuede, useRolPanel } from '@panel/sesion';

import { TarjetaPanel, VentanaPanel, useAnchoPanel } from './piezas';

const ROLES: { clave: RolEquipo; etiqueta: string }[] = [
  { clave: 'revisor', etiqueta: 'Revisor' },
  { clave: 'administrador', etiqueta: 'Administrador' },
];

export default function Equipo() {
  const equipo = useDemo((s) => s.equipo);
  const acciones = useDemo((s) => s.accionesEquipo);
  const { escritorio } = useAnchoPanel();
  // Agregar personas, cambiar su rol o su acceso: solo un administrador. El registro, solo administradores.
  const editable = usePuede('gestionar_equipo');
  const verRegistro = usePuede('ver_registro');
  const ahora = useAhora(30000);
  const [agregando, setAgregando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [rol, setRol] = useState<RolEquipo>('revisor');
  const [error, setError] = useState(false);
  const [cuantas, setCuantas] = useState(12);

  const activos = equipo.filter((m) => m.activo).length;
  const celularValido = celular.replace(/\D/g, '').length === 8;

  const agregar = () => {
    if (!nombre.trim() || !celularValido) {
      setError(true);
      return;
    }
    const r = agregarMiembro({ nombre, celular: `+56 9 ${mascaraCelular(celular)}`, rol });
    setAgregando(false);
    if (r.ok) mostrarToast(`${nombre.trim()} quedó en el equipo como ${NOMBRE_ROL[rol]}`, 'exito');
    else mostrarToast(r.error ?? 'No se pudo agregar.', 'error');
  };

  return (
    <PaginaPanel
      titulo="Equipo"
      soloLectura={!editable}
      descripcion="Quién usa el panel y con qué rol."
      acciones={
        <Boton
          titulo="Agregar persona"
          icono={Plus}
          variante="oscuro"
          tamano="mediano"
          onPress={() => {
            setNombre('');
            setCelular('');
            setRol('revisor');
            setError(false);
            setAgregando(true);
          }}
        />
      }>
      <View style={{ flexDirection: escritorio ? 'row' : 'column', gap: 12 }}>
        <RolExplicado titulo="Revisor" texto="Revisa documentos y reportes." />
        <RolExplicado titulo="Administrador" texto="Además cambia la configuración y asigna roles." />
      </View>

      {/* La fila "Tú" (quien usa la demo) también cuenta: tiene acceso. */}
      <TarjetaPanel titulo="Personas" descripcion={`${activos + 1} con acceso · ${equipo.length - activos} sin acceso`} separacion={4}>
        <FilaYo />
        {equipo.map((m) => (
          <View key={m.id}>
            <Separador />
            <FilaMiembro m={m} editable={editable} />
          </View>
        ))}
      </TarjetaPanel>

      {verRegistro ? (
        <TarjetaPanel titulo="Registro de acciones" descripcion="Lo que hace el equipo con datos delicados o con la configuración. No se puede modificar." separacion={4}>
          {acciones.length === 0 ? (
            <EstadoVacio icono={ClipboardList} titulo="Sin acciones todavía" />
          ) : (
            <>
              {acciones.slice(0, cuantas).map((a, i) => (
                <View key={a.id}>
                  {i > 0 ? <Separador sangria={escritorio ? 0 : 0} /> : null}
                  <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'flex-start', gap: escritorio ? 16 : 2, minHeight: 52, paddingVertical: 10 }}>
                    <Texto variante="ayuda" style={{ width: escritorio ? 150 : undefined }}>
                      {fechaLarga(a.fecha)} · {haceCuanto(a.fecha, ahora).replace('hace ', '')}
                    </Texto>
                    <Texto variante="secundario" peso={600} style={{ width: escritorio ? 160 : undefined }} numberOfLines={1}>
                      {a.quien}
                    </Texto>
                    <Texto variante="secundario" style={{ flex: escritorio ? 1 : undefined }}>
                      {a.que}
                    </Texto>
                  </View>
                </View>
              ))}
              {acciones.length > cuantas ? (
                <Boton titulo={`Ver más (${acciones.length - cuantas})`} variante="texto" tamano="mediano" onPress={() => setCuantas((n) => n + 20)} style={{ alignSelf: 'center' }} />
            ) : null}
          </>
        )}
      </TarjetaPanel>
      ) : null}

      <VentanaPanel
        visible={agregando && editable}
        onCerrar={() => setAgregando(false)}
        titulo="Agregar persona"
        pie={
          <>
            <Boton titulo="Agregar" onPress={agregar} />
            <Boton titulo="Cancelar" variante="contorno" onPress={() => setAgregando(false)} />
          </>
        }>
        <Campo etiqueta="Nombre" obligatorio valor={nombre} onCambiar={setNombre} placeholder="Ej.: Sofía Fuentes" maxLength={60} error={error && !nombre.trim() ? 'Escribe su nombre' : undefined} />
        <Campo
          etiqueta="Celular"
          obligatorio
          prefijo="+56 9"
          valor={mascaraCelular(celular)}
          onCambiar={setCelular}
          placeholder="1234 5678"
          keyboardType="phone-pad"
          maxLength={9}
          error={error && !celularValido ? 'Escribe los 8 dígitos' : undefined}
        />
        <View style={{ gap: 8 }}>
          <Texto variante="etiqueta">Rol</Texto>
          <ControlSegmentado opciones={ROLES} valor={rol} onCambiar={setRol} etiquetaAccesible="Rol" />
        </View>
      </VentanaPanel>
    </PaginaPanel>
  );
}

function RolExplicado({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.superficieHundida, borderRadius: radio.campo, padding: 14 }}>
      <View style={{ width: 36, height: 36, borderRadius: radio.icono, backgroundColor: color.superficie, alignItems: 'center', justifyContent: 'center' }}>
        {titulo === 'Administrador' ? <ShieldCheck size={18} color={color.texto} strokeWidth={2} /> : <UserRound size={18} color={color.texto} strokeWidth={2} />}
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Texto variante="etiqueta">{titulo}</Texto>
        <Texto variante="ayuda">{texto}</Texto>
      </View>
    </View>
  );
}

/** La persona que usa la demo, con el rol con que entró (su propia fila no se puede cambiar). */
function FilaYo() {
  const rol = useRolPanel();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10 }}>
      <Avatar texto="TÚ" tamano={40} forma="circulo" tono="acento" />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Texto variante="cuerpo" peso={700}>
          {firmaDe(rol)}
        </Texto>
        <Texto variante="ayuda">Tu sesión en esta demo</Texto>
      </View>
      {rol ? <Insignia texto={NOMBRE_ROL[rol]} tono={rol === 'administrador' ? 'oscura' : 'gris'} icono={null} /> : null}
    </View>
  );
}

function FilaMiembro({ m, editable }: { m: MiembroEquipo; editable: boolean }) {
  const { escritorio } = useAnchoPanel();
  return (
    <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'stretch', gap: 12, minHeight: 64, paddingVertical: 12 }}>
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: m.activo ? 1 : 0.55 }}>
        <Avatar texto={iniciales(m.nombre)} tamano={40} forma="circulo" tono="claro" />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Texto variante="cuerpo" peso={700} numberOfLines={1}>
            {m.nombre}
          </Texto>
          <Texto variante="ayuda" numberOfLines={1}>
            {m.celular} · desde el {fechaLarga(m.agregadoEl)}
          </Texto>
        </View>
      </View>
      {!editable ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Insignia texto={NOMBRE_ROL[m.rol]} tono={m.rol === 'administrador' ? 'oscura' : 'gris'} icono={null} />
          <Texto variante="ayuda" peso={600}>
            {m.activo ? 'Con acceso' : 'Sin acceso'}
          </Texto>
        </View>
      ) : (
        <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'stretch', gap: escritorio ? 16 : 10 }}>
          <ControlSegmentado
            opciones={ROLES}
            valor={m.rol}
            onCambiar={(r) => {
              const resultado = cambiarRolMiembro(m.id, r);
              if (resultado.ok) mostrarToast(`${m.nombre} ahora es ${NOMBRE_ROL[r]}`, 'exito');
              else mostrarToast(resultado.error ?? 'No se pudo cambiar.', 'error');
            }}
            etiquetaAccesible={`Rol de ${m.nombre}`}
            style={escritorio ? { width: 250 } : undefined}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: escritorio ? 'flex-start' : 'space-between' }}>
            <Texto variante="ayuda" peso={600} style={{ width: escritorio ? 76 : undefined, textAlign: escritorio ? 'right' : 'left' }}>
              {escritorio ? (m.activo ? 'Con acceso' : 'Sin acceso') : m.activo ? 'Con acceso al panel' : 'Sin acceso al panel'}
            </Texto>
            <Interruptor
              valor={m.activo}
              etiquetaAccesible={`Acceso de ${m.nombre}`}
              onCambiar={() => {
                const resultado = alternarMiembroActivo(m.id);
                if (resultado.ok) mostrarToast(m.activo ? `${m.nombre} ya no tiene acceso al panel` : `${m.nombre} tiene acceso de nuevo`, 'info');
                else mostrarToast(resultado.error ?? 'No se pudo cambiar.', 'error');
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

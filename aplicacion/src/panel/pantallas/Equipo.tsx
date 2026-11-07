// Panel · Equipo
// Era la ruta (ya no existe en el mockup): /admin/equipo
// Sin maqueta (panel web). Personas del equipo con su rol (Revisor o Administrador) y el registro de acciones.
import { useState } from 'react';
import { View } from 'react-native';

import { useAhora } from '@/datos/hooks';
import { useDemo, QUIEN_EN_PANEL } from '@/datos/tienda';
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
import { PaginaPanel } from '@/panel/marco';
import { ClipboardList, Plus, ShieldCheck, UserRound } from '@/ui/iconos';

import { TarjetaPanel, VentanaPanel, useAnchoPanel } from './piezas';

const ROLES: { clave: RolEquipo; etiqueta: string }[] = [
  { clave: 'revisor', etiqueta: 'Revisor' },
  { clave: 'administrador', etiqueta: 'Administrador' },
];

export default function Equipo() {
  const equipo = useDemo((s) => s.equipo);
  const acciones = useDemo((s) => s.accionesEquipo);
  const agregarMiembro = useDemo((s) => s.agregarMiembro);
  const { escritorio } = useAnchoPanel();
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
    agregarMiembro({ nombre, celular: `+56 9 ${mascaraCelular(celular)}`, rol });
    mostrarToast(`${nombre.trim()} ya puede entrar al panel`, 'exito');
    setAgregando(false);
  };

  return (
    <PaginaPanel
      titulo="Equipo"
      descripcion="Quién usa el panel. Entran con su celular, como todos."
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

      <TarjetaPanel titulo="Personas" descripcion={`${activos} con acceso · ${equipo.length - activos} sin acceso`} separacion={4}>
        <FilaYo />
        {equipo.map((m) => (
          <View key={m.id}>
            <Separador />
            <FilaMiembro m={m} />
          </View>
        ))}
      </TarjetaPanel>

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

      <VentanaPanel
        visible={agregando}
        onCerrar={() => setAgregando(false)}
        titulo="Agregar persona"
        descripcion="Recibirá un código por WhatsApp para entrar."
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

/** La persona que usa la demo (siempre Administrador). */
function FilaYo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10 }}>
      <Avatar texto="TÚ" tamano={40} forma="circulo" tono="acento" />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Texto variante="cuerpo" peso={700}>
          {QUIEN_EN_PANEL}
        </Texto>
        <Texto variante="ayuda">Tu sesión en esta demo</Texto>
      </View>
      <Insignia texto="Administrador" tono="oscura" icono={null} />
    </View>
  );
}

function FilaMiembro({ m }: { m: MiembroEquipo }) {
  const cambiarRolMiembro = useDemo((s) => s.cambiarRolMiembro);
  const alternarMiembroActivo = useDemo((s) => s.alternarMiembroActivo);
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
      <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'stretch', gap: escritorio ? 16 : 10 }}>
        <ControlSegmentado
          opciones={ROLES}
          valor={m.rol}
          onCambiar={(r) => {
            cambiarRolMiembro(m.id, r);
            mostrarToast(`${m.nombre} ahora es ${r === 'administrador' ? 'Administrador' : 'Revisor'}`, 'exito');
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
              alternarMiembroActivo(m.id);
              mostrarToast(m.activo ? `${m.nombre} ya no puede entrar al panel` : `${m.nombre} puede volver a entrar`, 'info');
            }}
          />
        </View>
      </View>
    </View>
  );
}

// Panel · Match · Reglas del match
// Ruta: /admin/match
// Sin maqueta (panel web). Umbral, uso y peso de cada regla. Todo cambia los matches en vivo.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { useDerivado } from '@/datos/hooks';
import { reglasIniciales } from '@/datos/estado';
import * as sel from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { ReglaMatch, UsoRegla } from '@/datos/tipos';
import { plural } from '@/datos/formato';
import {
  Boton,
  Campo,
  ControlSegmentado,
  Dialogo,
  PaginaPanel,
  Separador,
  Stepper,
  Texto,
  color,
  mostrarToast,
  radio,
  tipo,
} from '@/ui';
import { ArrowRight, RotateCcw } from '@/ui/iconos';

import { fijarPeso, fijarUmbral, fijarUsoRegla } from './acciones';
import { distribucionMatch } from './datosPanel';
import { Codigo, Deslizador, TarjetaPanel, useAnchoPanel } from './piezas';

const UMBRAL_INICIAL = reglasIniciales().umbral;

export default function Match() {
  const reglas = useDemo((s) => s.reglas);
  const restablecerReglas = useDemo((s) => s.restablecerReglas);
  const pueden = useDerivado(sel.variablesQuePuedenFallar);
  const { escritorio } = useAnchoPanel();
  const [confirmar, setConfirmar] = useState(false);
  const [texto, setTexto] = useState(String(reglas.umbral));
  const [enfocado, setEnfocado] = useState(false);
  const [errorUmbral, setErrorUmbral] = useState(false);

  useEffect(() => {
    if (!enfocado) setTexto(String(reglas.umbral));
  }, [reglas.umbral, enfocado]);

  const ordenadas = [...reglas.reglas].sort((a, b) => a.orden - b.orden);
  const filtros = ordenadas.filter((r) => r.uso === 'filtro').length;
  const variables = ordenadas.filter((r) => r.uso === 'variable').length;
  const apagadas = ordenadas.filter((r) => r.uso === 'apagado').length;

  const textoFallan =
    variables === 0
      ? 'No hay variables del %: basta con cumplir los filtros.'
      : pueden === 0
        ? `Con esta configuración deben coincidir las ${variables} variables.`
        : `Con esta configuración se acepta que ${pueden === 1 ? 'falle 1 variable' : `fallen ${pueden} variables`} de ${variables}.`;

  return (
    <PaginaPanel
      titulo="Reglas del match"
      descripcion="Qué se compara entre el conductor y la búsqueda. Los cambios se aplican en vivo."
      anchoMaximo={1180}
      acciones={<Boton titulo="Restablecer" icono={RotateCcw} variante="contorno" tamano="mediano" onPress={() => setConfirmar(true)} />}>
      <View style={{ flexDirection: escritorio ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: escritorio ? 1.45 : undefined, width: escritorio ? undefined : '100%', gap: 16 }}>
          {/* Umbral */}
          <TarjetaPanel
            titulo="Umbral"
            descripcion="El % mínimo de coincidencia para que haya match."
            derecha={
              <View style={{ width: 112 }}>
                <Campo
                  valor={texto}
                  aria-label="Umbral en porcentaje"
                  keyboardType="number-pad"
                  maxLength={3}
                  onFocus={() => setEnfocado(true)}
                  error={errorUmbral}
                  onBlur={() => {
                    setEnfocado(false);
                    if (errorUmbral || !texto.trim()) {
                      mostrarToast('Usa un número entero del 0 al 100. Quedó el umbral anterior.', 'error');
                    }
                    setErrorUmbral(false);
                    setTexto(String(useDemo.getState().reglas.umbral));
                  }}
                  onCambiar={(t) => {
                    // Solo se aplica un número entero del 0 al 100; "7.5" o "-5" no se cambian a escondidas.
                    setTexto(t);
                    const limpio = t.trim();
                    const valido = /^\d{1,3}$/.test(limpio) && Number(limpio) <= 100;
                    setErrorUmbral(limpio !== '' && !valido);
                    if (valido) fijarUmbral(Number(limpio));
                  }}
                  derecha={<Texto variante="cuerpo" peso={700}>%</Texto>}
                />
              </View>
            }>
            <View style={{ gap: 6 }}>
              {errorUmbral ? (
                <Texto variante="ayuda" peso={600} style={{ color: color.error }} role="alert">
                  Usa un número entero del 0 al 100.
                </Texto>
              ) : null}
              <Deslizador valor={reglas.umbral} onCambiar={fijarUmbral} etiquetaAccesible="Umbral del match" marca={UMBRAL_INICIAL} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Texto variante="pequeno">0 %</Texto>
                <Texto variante="pequeno">Inicial: {UMBRAL_INICIAL} %</Texto>
                <Texto variante="pequeno">100 %</Texto>
              </View>
            </View>
            <View style={{ backgroundColor: color.acentoSuave, borderRadius: radio.campo, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Texto variante="secundario" peso={600}>
                {textoFallan}
              </Texto>
            </View>
          </TarjetaPanel>

          <TarjetaPanel titulo="Cómo se calcula" separacion={10}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Codigo texto="F" oscuro />
              <Texto variante="secundario" tono="suave" style={{ flex: 1 }}>
                <Texto variante="secundario" peso={700}>Filtro:</Texto> si no se cumple, no hay match.
              </Texto>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Codigo texto="%" />
              <Texto variante="secundario" tono="suave" style={{ flex: 1 }}>
                <Texto variante="secundario" peso={700}>Variable:</Texto> suma al % según su peso. % = suma de (peso × coincidencia) ÷ suma de pesos. Los días cuentan en proporción.
              </Texto>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Codigo texto="—" />
              <Texto variante="secundario" tono="suave" style={{ flex: 1 }}>
                <Texto variante="secundario" peso={700}>Apagado:</Texto> no se compara.
              </Texto>
            </View>
          </TarjetaPanel>
        </View>

        <View style={{ flex: escritorio ? 1 : undefined, width: escritorio ? undefined : '100%', gap: 16 }}>
          <VistaPrevia />
        </View>
      </View>

      {/* Reglas */}
      <TarjetaPanel
        titulo="Reglas"
        descripcion={`${plural(filtros, 'filtro', 'filtros')} · ${plural(variables, 'variable del %', 'variables del %')} · ${plural(apagadas, 'apagada', 'apagadas')}`}
        separacion={4}>
        {ordenadas.map((r, i) => (
          <View key={r.codigo}>
            {i > 0 ? <Separador /> : null}
            <FilaRegla regla={r} onUso={(uso) => fijarUsoRegla(r.codigo, uso)} />
          </View>
        ))}
      </TarjetaPanel>

      <Dialogo
        visible={confirmar}
        titulo="¿Restablecer las reglas?"
        texto={`Vuelven el umbral de ${UMBRAL_INICIAL} % y las reglas de la decisión del 2-nov.`}
        confirmar={{
          titulo: 'Restablecer',
          onPress: () => {
            restablecerReglas();
            setConfirmar(false);
            mostrarToast('Reglas restablecidas', 'exito');
          },
        }}
        cancelar={{ onPress: () => setConfirmar(false) }}
      />
    </PaginaPanel>
  );
}

function FilaRegla({ regla: r, onUso }: { regla: ReglaMatch; onUso: (u: UsoRegla) => void }) {
  const { escritorio } = useAnchoPanel();
  const segmentado = (
    <ControlSegmentado
      etiquetaAccesible={`Cómo cuenta ${r.nombre}`}
      style={{ width: escritorio ? 270 : '100%' }}
      opciones={[
        { clave: 'filtro', etiqueta: 'Filtro' },
        { clave: 'variable', etiqueta: 'Variable' },
        { clave: 'apagado', etiqueta: 'Apagado' },
      ]}
      valor={r.uso}
      onCambiar={onUso}
    />
  );
  const peso =
    r.uso === 'variable' ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {!escritorio ? <Texto variante="ayuda">Peso</Texto> : null}
        <Stepper valor={r.peso} onCambiar={(v) => fijarPeso(r.codigo, v)} min={0} max={10} etiquetaAccesible={`peso de ${r.nombre}`} />
      </View>
    ) : escritorio ? (
      <Texto variante="ayuda" style={{ width: 132, textAlign: 'center' }}>
        —
      </Texto>
    ) : null;

  return (
    <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'stretch', gap: 12, paddingVertical: 14, opacity: r.uso === 'apagado' ? 0.7 : 1 }}>
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Codigo texto={r.codigo} oscuro={r.uso === 'filtro'} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Texto variante="cuerpo" peso={700}>
            {r.nombre}
          </Texto>
          <Texto variante="ayuda">{r.comoCompara}</Texto>
        </View>
      </View>
      {segmentado}
      {peso}
    </View>
  );
}

function VistaPrevia() {
  const d = useDerivado(distribucionMatch);
  const inicial = useDerivado((s) => distribucionMatch({ ...s, reglas: reglasIniciales() }).hacenMatch);
  const umbral = useDemo((s) => s.reglas.umbral);
  const registrado = useDemo((s) => s.conductor.registrado);
  const maximo = Math.max(1, ...d.valores.map((v) => v.cantidad));
  const diferencia = d.hacenMatch - inicial;

  return (
    <TarjetaPanel titulo="Vista previa" descripcion="Todos los pares conductor–búsqueda de la demo que cumplen los filtros.">
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, backgroundColor: color.fondo, borderRadius: radio.campo, padding: 14, gap: 2 }}>
          <Texto variante="pequeno">Matches vigentes</Texto>
          <Text style={[tipo.h1, { color: color.texto }]}>{d.hacenMatch}</Text>
          <Texto variante="pequeno" tono={diferencia > 0 ? 'exito' : diferencia < 0 ? 'error' : 'secundario'} peso={600}>
            {diferencia === 0 ? 'Igual que con las reglas iniciales' : `${diferencia > 0 ? '+' : '−'}${Math.abs(diferencia)} frente a las reglas iniciales`}
          </Texto>
        </View>
        <View style={{ flex: 1, backgroundColor: color.fondo, borderRadius: radio.campo, padding: 14, gap: 2 }}>
          <Texto variante="pequeno">Cumplen los filtros</Texto>
          <Text style={[tipo.h1, { color: color.texto }]}>{d.pasanFiltros}</Text>
          <Texto variante="pequeno">{d.pasanFiltros - d.hacenMatch} bajo el umbral</Texto>
        </View>
      </View>

      {/* Gráfico: cada barra es un % exacto; a la derecha de la línea amarilla hay match. */}
      <View style={{ gap: 6 }}>
        <View
          role="img"
          aria-label={`${d.hacenMatch} de ${d.pasanFiltros} pares llegan al umbral de ${umbral} %`}
          style={{ height: 132, marginHorizontal: 6, borderBottomWidth: 1, borderBottomColor: color.bordeCampo }}>
          {d.valores.map((v) => (
            <View
              key={v.porcentaje}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${v.porcentaje}%`,
                marginLeft: -4,
                width: 8,
                height: Math.max(4, (v.cantidad / maximo) * 104),
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                backgroundColor: v.porcentaje >= umbral ? color.oscuro : color.interruptorApagado,
              }}
            />
          ))}
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${umbral}%`, width: 2, marginLeft: -1, backgroundColor: color.acento }} />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: `${umbral}%`,
              transform: [{ translateX: umbral > 80 ? -52 : 6 }],
              backgroundColor: color.acento,
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}>
            <Texto variante="pequeno" peso={700} tono="normal">
              {umbral} %
            </Texto>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Texto variante="pequeno">0 %</Texto>
          <Texto variante="pequeno">50 %</Texto>
          <Texto variante="pequeno">100 %</Texto>
        </View>
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
          <Leyenda tinte={color.oscuro} texto="Hay match" />
          <Leyenda tinte={color.interruptorApagado} texto="Bajo el umbral" />
          <Leyenda tinte={color.acento} texto="Umbral" linea />
        </View>
      </View>

      <Separador />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto variante="secundario" peso={700}>
            Conductor de la demo
          </Texto>
          <Texto variante="ayuda">
            {registrado ? plural(d.matchesUsuario, 'match vigente', 'matches vigentes') : 'Aún no se registra'}
          </Texto>
        </View>
        <Boton titulo="Ver en la app" variante="contorno" tamano="mediano" iconoDerecha={ArrowRight} onPress={() => router.push('/conductor')} />
      </View>
    </TarjetaPanel>
  );
}

function Leyenda({ tinte, texto, linea }: { tinte: string; texto: string; linea?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: linea ? 3 : 10, height: linea ? 12 : 10, borderRadius: 2, backgroundColor: tinte }} />
      <Texto variante="pequeno">{texto}</Texto>
    </View>
  );
}

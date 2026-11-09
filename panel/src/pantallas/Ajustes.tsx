// Panel · Ajustes
// Era la ruta (ya no existe en el mockup): /admin/ajustes
// Sin maqueta (panel web). Interruptores y números que cambian el comportamiento de la app en vivo.
import { useState } from 'react';
import { View } from 'react-native';

import { useAjustes } from '@/datos/hooks';
import type { Ajustes as TipoAjustes } from '@/datos/tipos';
import { Boton, Dialogo, Interruptor, Separador, Stepper, Texto, mostrarToast } from '@/ui';
import { PaginaPanel } from '@/panel/marco';
import { RotateCcw } from '@/ui/iconos';

import { fijarAjuste, restablecerAjustesPanel } from './acciones';
import { TarjetaPanel, useAnchoPanel } from './piezas';

type ClaveNumero = 'diasReconfirmar' | 'diasAntiguedadPdf' | 'segundosPrerevision';
type ClaveSiNo = 'bolsaActiva' | 'validarObligatorios';

export default function Ajustes() {
  const a = useAjustes();
  const [confirmar, setConfirmar] = useState(false);

  return (
    <PaginaPanel
      titulo="Ajustes"
      descripcion="Cambian la app en vivo."
      acciones={<Boton titulo="Restablecer" icono={RotateCcw} variante="contorno" tamano="mediano" onPress={() => setConfirmar(true)} />}>
      {/* Mismo ancho y alineación que las otras páginas; solo las tarjetas quedan más angostas (filas legibles). */}
      <View style={{ width: '100%', maxWidth: 860, gap: 20 }}>
      <TarjetaPanel titulo="Funciones" separacion={4}>
        <FilaSiNo
          clave="bolsaActiva"
          valor={a.bolsaActiva}
          titulo="Bolsa de trabajo"
          ayuda="Muestra la pestaña Bolsa al conductor y las ofertas publicadas por los titulares."
          aviso={(v) => (v ? 'Bolsa de trabajo encendida' : 'Bolsa de trabajo apagada: la pestaña ya no se muestra')}
        />
        <Separador />
        <FilaSiNo
          clave="validarObligatorios"
          valor={a.validarObligatorios}
          titulo="Validar campos obligatorios"
          ayuda="Apagado, los formularios se guardan aunque falten datos marcados con *."
          aviso={(v) => (v ? 'Ahora los campos con * son obligatorios' : 'Los formularios se guardan aunque falten datos')}
        />
      </TarjetaPanel>

      <TarjetaPanel titulo="Plazos" separacion={4}>
        <FilaNumero
          clave="diasReconfirmar"
          valor={a.diasReconfirmar}
          min={7}
          max={90}
          sufijo="días"
          titulo="Reconfirmar disponibilidad"
          ayuda="Cada cuántos días le pedimos al conductor confirmar que sigue disponible."
        />
        <Separador />
        <FilaNumero
          clave="diasAntiguedadPdf"
          valor={a.diasAntiguedadPdf}
          min={1}
          max={90}
          sufijo="días"
          titulo="Antigüedad máxima de los PDF"
          ayuda="Hoja de Vida y antecedentes. El agente de IA lo revisa con la fecha de emisión."
        />
      </TarjetaPanel>

      <TarjetaPanel titulo="Solo para la demo" descripcion="No existen en la app real." separacion={4}>
        <FilaNumero
          clave="segundosPrerevision"
          valor={a.segundosPrerevision}
          min={1}
          max={30}
          sufijo="seg"
          titulo="Duración de la pre-revisión"
          ayuda="Lo que tarda el agente de IA simulado en revisar los documentos enviados."
        />
      </TarjetaPanel>

      </View>

      <Dialogo
        visible={confirmar}
        titulo="¿Restablecer los ajustes?"
        texto="Vuelven los valores con que parte la demo."
        confirmar={{
          titulo: 'Restablecer',
          onPress: () => {
            restablecerAjustesPanel();
            setConfirmar(false);
            mostrarToast('Ajustes restablecidos', 'exito');
          },
        }}
        cancelar={{ onPress: () => setConfirmar(false) }}
      />
    </PaginaPanel>
  );
}

function FilaSiNo({ clave, valor, titulo, ayuda, aviso }: { clave: ClaveSiNo; valor: boolean; titulo: string; ayuda: string; aviso: (v: boolean) => string }) {
  const { escritorio } = useAnchoPanel();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 72, paddingVertical: 12 }}>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Texto variante="fuerte">{titulo}</Texto>
        <Texto variante="ayuda">{ayuda}</Texto>
      </View>
      {escritorio ? (
        <Texto variante="ayuda" peso={600}>
          {valor ? 'Encendido' : 'Apagado'}
        </Texto>
      ) : null}
      <Interruptor
        valor={valor}
        etiquetaAccesible={titulo}
        onCambiar={(v) => {
          fijarAjuste(clave, v as TipoAjustes[ClaveSiNo], titulo);
          mostrarToast(aviso(v), v ? 'exito' : 'info');
        }}
      />
    </View>
  );
}

function FilaNumero({
  clave,
  valor,
  min,
  max,
  sufijo,
  titulo,
  ayuda,
}: {
  clave: ClaveNumero;
  valor: number;
  min: number;
  max: number;
  sufijo: string;
  titulo: string;
  ayuda: string;
}) {
  const { escritorio } = useAnchoPanel();
  return (
    <View style={{ flexDirection: escritorio ? 'row' : 'column', alignItems: escritorio ? 'center' : 'stretch', gap: 12, minHeight: 72, paddingVertical: 12 }}>
      <View style={{ flex: escritorio ? 1 : undefined, minWidth: 0, gap: 2 }}>
        <Texto variante="fuerte">{titulo}</Texto>
        <Texto variante="ayuda">{ayuda}</Texto>
      </View>
      <View style={{ alignSelf: escritorio ? 'auto' : 'flex-start' }}>
        <Stepper valor={valor} onCambiar={(v) => fijarAjuste(clave, v, titulo)} min={min} max={max} sufijo={sufijo} etiquetaAccesible={titulo} />
      </View>
    </View>
  );
}

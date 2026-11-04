// BT5 · Planes con la bolsa (propuesta)
// Ruta: /titular/planes
// Maqueta: docs/maqueta/BolsaPlanes.dc.html
// Los planes salen del catálogo (editable desde el panel). Precios por definir. En la demo, "Elegir"
// cambia el plan del titular al instante y no se cobra nada.
import { Text, View } from 'react-native';

import { pesos } from '@/datos/formato';
import { useCatalogos } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import type { Plan, PlanTitular } from '@/datos/tipos';
import { Boton, Pantalla, Presionable, color, fuente, mostrarToast, radio, tipo, volver } from '@/ui';
import { Check, Pencil } from '@/ui/iconos';

import { TEXTO_VISIBILIDAD_PLAN, textoCambioPlan } from './datos';
import { Cabecera, EncabezadoConTexto } from './piezas';

/** Etiqueta punteada "Propuesta" (los planes y precios aún se deciden). */
function Propuesta() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: color.textoDeshabilitado,
        borderRadius: radio.insignia,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}>
      <Pencil size={13} color={color.textoSuave} strokeWidth={2.2} />
      <Text style={[tipo.seccion, { color: color.textoSuave }]}>Propuesta</Text>
    </View>
  );
}

function Fila({ etiqueta, valor, oscuro, nada, si }: { etiqueta: string; valor?: string; oscuro: boolean; nada?: boolean; si?: boolean }) {
  return (
    <View
      style={{
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: oscuro ? '#2E2E2E' : color.separador,
      }}>
      <Text style={[tipo.ayuda, { color: oscuro ? '#BDBDBD' : color.textoSecundario, flexShrink: 0 }]}>{etiqueta}</Text>
      {nada ? (
        <View>
          <Text aria-hidden style={[fuente(700), { fontSize: 14, color: oscuro ? '#8A8A8A' : color.textoDeshabilitado }]}>
            —
          </Text>
          {/* Solo para lectores de pantalla (como en la maqueta BT5). */}
          <Text style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}>No incluye</Text>
        </View>
      ) : si ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Check size={16} color={oscuro ? '#7BD3A1' : color.exito} strokeWidth={2.6} />
          <Text style={[fuente(700), { fontSize: 14, color: oscuro ? color.blanco : color.exitoTexto }]}>Sí</Text>
        </View>
      ) : (
        <Text style={[fuente(700), { fontSize: 14, lineHeight: 19, textAlign: 'right', flexShrink: 1, color: oscuro ? color.blanco : color.texto }]}>{valor}</Text>
      )}
    </View>
  );
}

function TarjetaPlan({ plan, actual, onElegir }: { plan: Plan; actual: boolean; onElegir: () => void }) {
  const oscuro = plan.recomendado;
  const extra = plan.visibilidades.filter((v) => v !== 'match');
  const quien = extra.length === 0 ? TEXTO_VISIBILIDAD_PLAN.match : TEXTO_VISIBILIDAD_PLAN[extra[extra.length - 1]];
  return (
    <View
      style={{
        backgroundColor: oscuro ? color.oscuro : color.superficie,
        borderWidth: oscuro ? 2 : actual ? 1.5 : 1,
        borderColor: oscuro ? color.acento : actual ? color.bordeFuerte : color.borde,
        borderRadius: radio.tarjeta,
        padding: 18,
        gap: 14,
      }}>
      <View style={{ gap: 10 }}>
        {oscuro || actual ? (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {oscuro ? (
              <View style={{ backgroundColor: color.acento, borderRadius: radio.insignia, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={[fuente(700), { fontSize: 11, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase', color: color.texto }]}>Recomendado</Text>
              </View>
            ) : null}
            {actual ? (
              <View style={{ backgroundColor: oscuro ? '#2A2A2A' : color.exitoFondo, borderRadius: radio.insignia, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={[fuente(700), { fontSize: 11, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase', color: oscuro ? color.blanco : color.exitoTexto }]}>
                  Tu plan
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <Text role="heading" aria-level={2} style={[fuente(700), { fontSize: 18, lineHeight: 24, color: oscuro ? color.blanco : color.texto }]}>
            {plan.nombre}
          </Text>
          {plan.precioMensual !== null ? (
            <Text>
              <Text style={{ fontFamily: 'Sora_700Bold', fontSize: 16, color: oscuro ? color.blanco : color.texto }}>{pesos(plan.precioMensual)}</Text>
              <Text style={[tipo.ayuda, { color: oscuro ? '#BDBDBD' : color.textoSecundario }]}>/mes</Text>
            </Text>
          ) : (
            <Text style={[tipo.ayuda, fuente(600), { color: oscuro ? '#BDBDBD' : color.textoSecundario }]}>Precio por definir</Text>
          )}
        </View>
      </View>
      <View>
        <Fila oscuro={oscuro} etiqueta="Búsquedas activas" valor={String(plan.busquedasActivas)} />
        <Fila oscuro={oscuro} etiqueta="Ofertas en la bolsa" valor={String(plan.ofertasBolsa)} />
        <Fila oscuro={oscuro} etiqueta="Quién ve tus ofertas" valor={quien} />
        <Fila oscuro={oscuro} etiqueta="Destacar ofertas" valor={`${plan.destacadasMes} al mes`} nada={plan.destacadasMes <= 0} />
        <Fila oscuro={oscuro} etiqueta="Ver quién postuló" si={plan.vePostulantes} nada={!plan.vePostulantes} />
      </View>
      <Presionable
        role="button"
        aria-label={actual ? `${plan.nombre}: tu plan actual` : `Elegir ${plan.nombre}`}
        aria-disabled={actual}
        disabled={actual}
        efecto="escala"
        onPress={onElegir}
        style={{
          minHeight: 48,
          borderRadius: radio.campo,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          backgroundColor: actual ? (oscuro ? '#2A2A2A' : color.fondo) : oscuro ? color.acento : color.superficie,
          borderWidth: actual || oscuro ? 0 : 1.5,
          borderColor: color.bordeFuerte,
        }}>
        {actual ? <Check size={16} color={oscuro ? color.blanco : color.textoSuave} strokeWidth={2.4} /> : null}
        <Text style={[fuente(700), { fontSize: 15, lineHeight: 20, color: actual ? (oscuro ? color.blanco : color.textoSuave) : color.texto }]}>
          {actual ? 'Tu plan actual' : `Elegir ${plan.nombre}`}
        </Text>
      </Presionable>
    </View>
  );
}

export default function Planes() {
  const catalogos = useCatalogos();
  const planActual = useDemo((s) => s.titularDemo.plan);
  const cambiarPlan = useDemo((s) => s.cambiarPlanTitular);
  const planes = [...catalogos.planes].sort((a, b) => a.orden - b.orden);

  const elegir = (id: PlanTitular, nombre: string) => {
    const cambios = cambiarPlan(id);
    mostrarToast(textoCambioPlan(id === 'sin_plan' ? 'Ahora estás sin plan' : `Listo: tu plan es ${nombre}`, cambios), cambios.length ? 'info' : 'exito', cambios.length ? 5500 : undefined);
    volver('/titular');
  };

  return (
    <Pantalla>
      <EncabezadoConTexto volverA="/titular" derecha={<Propuesta />} />
      <Cabecera titulo="Elige tu plan" subtitulo="Publica tus vehículos en la bolsa y recibe postulantes." />

      {planes.map((p) => (
        <TarjetaPlan key={p.id} plan={p} actual={planActual === p.id} onElegir={() => elegir(p.id, p.nombre)} />
      ))}

      <Text style={[tipo.pequeno, fuente(400), { color: color.textoSecundario, textAlign: 'center', lineHeight: 18 }]}>
        Se renueva cada mes. Cancela cuando quieras.{'\n'}En la demo no se cobra nada.
      </Text>
      {planActual !== 'sin_plan' ? (
        <Boton titulo="Quedarme sin plan" variante="texto" tamano="mediano" anchoCompleto onPress={() => elegir('sin_plan', '')} />
      ) : null}
    </Pantalla>
  );
}

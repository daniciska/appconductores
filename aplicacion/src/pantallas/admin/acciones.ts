// Acciones propias del panel de administración que no están en la tienda común.
// Escriben en la misma tienda (useDemo.setState), así que todo queda guardado en el navegador
// y las pantallas del conductor y del titular cambian en vivo.
import { useDemo } from '@/datos/tienda';
import type { Ajustes, CodigoRegla, Reporte, UsoRegla } from '@/datos/tipos';

// ---------------------------------------------------------------------------
// Registro de acciones con espera: un control deslizante o un stepper cambian el valor muchas veces
// seguidas; al registro va solo el último cambio (después de una pausa corta).
// ---------------------------------------------------------------------------

const esperas = new Map<string, ReturnType<typeof setTimeout>>();

function registrarConEspera(clave: string, que: () => string, ms = 900) {
  const antes = esperas.get(clave);
  if (antes) clearTimeout(antes);
  esperas.set(
    clave,
    setTimeout(() => {
      esperas.delete(clave);
      useDemo.getState().registrarAccionEquipo(que());
    }, ms),
  );
}

/** Deja en el registro algo que el equipo vio (abrir un archivo, leer una conversación reportada). */
export function registrarLectura(que: string) {
  useDemo.getState().registrarAccionEquipo(que);
}

/** Umbral del match (0 a 100) desde el control deslizante: cambia en vivo y se registra al soltar. */
export function fijarUmbral(valor: number) {
  const umbral = Math.min(100, Math.max(0, Math.round(valor)));
  useDemo.setState((s) => ({ reglas: { ...s.reglas, umbral } }));
  registrarConEspera('umbral', () => `Cambió el umbral del match a ${useDemo.getState().reglas.umbral} %`);
}

/** Peso de una variable del % (0 a 10). */
export function fijarPeso(codigo: CodigoRegla, peso: number) {
  const valor = Math.max(0, Math.min(10, Math.round(peso)));
  useDemo.setState((s) => ({
    reglas: { ...s.reglas, reglas: s.reglas.reglas.map((r) => (r.codigo === codigo ? { ...r, peso: valor } : r)) },
  }));
  registrarConEspera(`peso-${codigo}`, () => {
    const r = useDemo.getState().reglas.reglas.find((x) => x.codigo === codigo);
    return `Cambió el peso de ${r?.nombre ?? codigo} a ${r?.peso ?? valor}`;
  });
}

/** Cómo cuenta una regla (filtro, variable del % o apagada), con su nombre en el registro. */
export function fijarUsoRegla(codigo: CodigoRegla, uso: UsoRegla) {
  useDemo.setState((s) => ({ reglas: { ...s.reglas, reglas: s.reglas.reglas.map((r) => (r.codigo === codigo ? { ...r, uso } : r)) } }));
  const r = useDemo.getState().reglas.reglas.find((x) => x.codigo === codigo);
  const texto = uso === 'filtro' ? 'filtro obligatorio' : uso === 'variable' ? 'variable del %' : 'apagada';
  useDemo.getState().registrarAccionEquipo(`Dejó «${r?.nombre ?? codigo}» como ${texto}`);
}

/** Suspende o reactiva una cuenta (titular o conductor ficticio) y lo anota con el nombre. */
export function cambiarSuspension(personaId: string, nombre: string, suspendido: boolean) {
  useDemo.setState((s) => ({
    titulares: s.titulares.map((t) => (t.id === personaId ? { ...t, suspendido } : t)),
    conductores: s.conductores.map((c) => (c.id === personaId ? { ...c, suspendido } : c)),
  }));
  useDemo.getState().registrarAccionEquipo(`${suspendido ? 'Suspendió' : 'Reactivó'} la cuenta de ${nombre}`);
}

/** Cambia un ajuste con un texto legible en el registro ("Días para reconfirmar disponibilidad: 45"). */
export function fijarAjuste<K extends keyof Ajustes>(clave: K, valor: Ajustes[K], etiqueta: string) {
  useDemo.setState((s) => ({ ajustes: { ...s.ajustes, [clave]: valor } }));
  registrarConEspera(`ajuste-${String(clave)}`, () => {
    const v = useDemo.getState().ajustes[clave];
    const texto = typeof v === 'boolean' ? (v ? 'encendido' : 'apagado') : String(v);
    return `Cambió "${etiqueta}" a ${texto}`;
  }, typeof valor === 'boolean' ? 0 : 900);
}

/** Restablece los ajustes y lo deja en el registro. */
export function restablecerAjustesPanel() {
  useDemo.getState().restablecerAjustes();
  useDemo.getState().registrarAccionEquipo('Restableció los ajustes');
}

/** Cambia el nombre de un tipo de vehículo (categoría de experiencia del Paso 3). */
export function renombrarTamano(tamanoId: string, nombre: string) {
  const limpio = nombre.trim();
  if (!limpio) return;
  useDemo.setState((s) => ({
    catalogos: { ...s.catalogos, tamanos: s.catalogos.tamanos.map((t) => (t.id === tamanoId ? { ...t, nombre: limpio } : t)) },
  }));
  useDemo.getState().registrarAccionEquipo(`Cambió el nombre de un tipo de vehículo a ${limpio}`);
}

export type QueSeHizo = 'sin_accion' | 'mensaje_oculto' | 'advertencia' | 'suspender';

export const OPCIONES_RESOLUCION: { clave: QueSeHizo; titulo: string; descripcion: string }[] = [
  { clave: 'sin_accion', titulo: 'Sin acción', descripcion: 'No infringe las reglas.' },
  { clave: 'mensaje_oculto', titulo: 'Ocultar los mensajes', descripcion: 'La otra persona deja de verlos.' },
  { clave: 'advertencia', titulo: 'Enviar una advertencia', descripcion: 'Aviso por WhatsApp y correo.' },
  { clave: 'suspender', titulo: 'Suspender la cuenta', descripcion: 'Sale de los matches y no puede escribir.' },
];

/** Resuelve un reporte. Si se elige suspender, suspende la cuenta reportada (no la del usuario de la demo). */
export function resolverReporteCon(reporte: Reporte, opcion: QueSeHizo, nota: string) {
  const s = useDemo.getState();
  const base = OPCIONES_RESOLUCION.find((o) => o.clave === opcion)?.titulo ?? 'Sin acción';
  const texto = opcion === 'suspender' ? 'Cuenta suspendida' : opcion === 'mensaje_oculto' ? 'Mensajes ocultados' : opcion === 'advertencia' ? 'Advertencia enviada' : base;
  if (opcion === 'suspender' && reporte.reportado.id !== 'yo') cambiarSuspension(reporte.reportado.id, reporte.reportado.nombre, true);
  s.resolverReporte(reporte.id, nota.trim() ? `${texto}. ${nota.trim()}` : texto);
}

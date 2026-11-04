// Acciones y ayudas propias del grupo "matches" (D1–D5).
//
// Registro "el titular vio tu ficha": abrir el match desde el lado del conductor NO entrega datos.
// La entrega ocurre del lado del titular. En la demo se anota en "Quién recibió mis datos" cuando
// el titular responde por primera vez en una conversación (para responder, abrió la ficha del
// conductor: ve la ficha, el teléfono y el correo). La simulación de src/datos no lo hace, así que
// aquí se escucha la tienda y se registra una sola vez por búsqueda.
import { useEffect } from 'react';
import { router, useNavigation } from 'expo-router';

import { busquedaPorId, nombreTitular, titularPorId } from '@/datos/selectores';
import { ahoraISO, nuevoId, useDemo } from '@/datos/tienda';
import type { DatosDemo } from '@/datos/estado';
import type { EntregaDatos, Mensaje } from '@/datos/tipos';

function yaRecibioFicha(s: DatosDemo, busquedaId: string): boolean {
  return (
    s.fichasAbiertas.includes(busquedaId) ||
    s.entregasDatos.some((e) => e.busquedaId === busquedaId && e.que.includes('ficha'))
  );
}

/** Revisa las conversaciones y anota la entrega de la ficha cuando el titular ya respondió. */
function revisarFichasVistas(s: DatosDemo): void {
  const nuevas: EntregaDatos[] = [];
  const abiertas: string[] = [];
  for (const [busquedaId, lista] of Object.entries(s.mensajes)) {
    if (!lista?.some((m) => m.autor === 'titular')) continue;
    if (yaRecibioFicha(s, busquedaId)) continue;
    const b = busquedaPorId(s, busquedaId);
    const t = b ? titularPorId(s, b.titularId) : undefined;
    if (!b || !t) continue;
    const primera = lista.find((m) => m.autor === 'titular');
    nuevas.push({
      id: nuevoId('ed'),
      busquedaId,
      titularId: t.id,
      nombreTitular: nombreTitular(t),
      negocioId: b.negocioId,
      que: ['ficha', 'telefono', 'correo'],
      desde: 'apertura_ficha',
      fecha: primera?.hora ?? ahoraISO(),
    });
    abiertas.push(busquedaId);
  }
  if (nuevas.length === 0) return;
  useDemo.setState((actual) => ({
    entregasDatos: [...actual.entregasDatos, ...nuevas.filter((e) => !yaRecibioFicha(actual, e.busquedaId))],
    fichasAbiertas: [...actual.fichasAbiertas, ...abiertas.filter((id) => !actual.fichasAbiertas.includes(id))],
  }));
}

let escuchando = false;

/** Empieza a escuchar las respuestas de los titulares (idempotente). */
export function iniciarRegistroFichaVista(): void {
  if (escuchando) return;
  escuchando = true;
  revisarFichasVistas(useDemo.getState());
  useDemo.subscribe((s, previo) => {
    if (s.mensajes !== previo.mensajes) revisarFichasVistas(s);
  });
}

/** Hook para las pantallas del grupo: asegura el registro mientras se usa la demo. */
export function useRegistroFichaVista(): void {
  useEffect(() => {
    iniciarRegistroFichaVista();
  }, []);
}

// Se enciende apenas se carga el módulo (y las pantallas lo vuelven a asegurar con el hook).
iniciarRegistroFichaVista();

// ---------------------------------------------------------------------------
// Ayudas de conversación
// ---------------------------------------------------------------------------

/** El mensaje de sistema que avisa que el titular compartió su contacto. */
export const esAvisoDeContacto = (m: Mensaje): boolean => m.autor === 'sistema' && /compartió su contacto/i.test(m.texto);

/**
 * Fecha del match para "Hicieron match · 4 nov": cuando se cumplieron las dos cosas (búsqueda publicada
 * y conductor verificado), sin pasar del primer mensaje.
 */
export function fechaDelMatch(s: DatosDemo, busquedaId: string): string | null {
  const b = busquedaPorId(s, busquedaId);
  if (!b) return null;
  const revisiones = Object.values(s.documentos)
    .map((d) => d.revisadoEn)
    .filter((x): x is string => !!x)
    .sort();
  const verificado = revisiones[revisiones.length - 1] ?? s.conductor.registradoEl ?? b.publicadaEl;
  const base = [b.publicadaEl, verificado].sort()[1] ?? b.publicadaEl;
  const primero = s.mensajes[busquedaId]?.[0]?.hora;
  return primero && primero < base ? primero : base;
}

// ---------------------------------------------------------------------------
// Navegación entre el detalle (D2) y la conversación (D4) sin apilar copias
// ---------------------------------------------------------------------------

type Destino = 'detalle' | 'conversacion';

const NOMBRE_RUTA: Record<Destino, RegExp> = {
  detalle: /^matches\/\[id\]$/,
  conversacion: /^mensajes\/\[id\](\/index)?$/,
};

/**
 * Devuelve una función que abre el detalle o la conversación de una búsqueda. Si esa misma pantalla
 * está justo detrás en la pila (D2 → D4 → "ver oferta"), vuelve atrás en vez de apilar otra copia.
 */
export function useIrA(): (destino: Destino, id: string) => void {
  const navegacion = useNavigation();
  return (destino, id) => {
    const estado = navegacion.getState();
    const rutas = estado?.routes ?? [];
    const anterior = rutas[rutas.length - 2] as { name?: string; params?: { id?: string } } | undefined;
    if (anterior?.name && NOMBRE_RUTA[destino].test(anterior.name) && anterior.params?.id === id) {
      router.back();
      return;
    }
    if (destino === 'detalle') router.push({ pathname: '/conductor/matches/[id]', params: { id } });
    else router.push({ pathname: '/conductor/mensajes/[id]', params: { id } });
  };
}

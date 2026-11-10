// Navegación y ayudas propias del grupo "ingreso" (A1–A4, B1–B4).
// Lo comparten la demo y la app real: aquí solo van rutas que existen en las dos (la del Paso 5 y la
// de "Enviado a revisión" son de la demo y viven en src/pantallas/documentos/).
import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import { mascaraCelular } from '@/datos/formato';
import { useVista } from '@/datos/puerto/contexto';
import { mostrarToast, volver } from '@/ui';

/** Ruta de cada paso del registro que comparten la demo y la app real (rutas con tipo). */
export const RUTA_PASO: Record<1 | 2 | 3 | 4, Href> = {
  1: '/conductor/registro/1',
  2: '/conductor/registro/2',
  3: '/conductor/registro/3',
  4: '/conductor/registro/4',
};

/**
 * Modo edición: Perfil abre los pasos 1–4 con ?editar=1. Ahí el botón dice "Guardar cambios" y, al
 * guardar, vuelve a Perfil en vez de seguir al paso siguiente.
 */
export function useModoEdicion(): boolean {
  const { editar } = useLocalSearchParams<{ editar?: string }>();
  return editar === '1';
}

/** Después de guardar en modo edición: aviso y vuelta a Perfil. */
export function terminarEdicion() {
  mostrarToast('Cambios guardados.', 'exito');
  volver('/conductor/perfil');
}

/** Ruta de respaldo del botón volver de cada paso (si se abrió el enlace directo). */
export function useVolverDesdePaso(paso: 1 | 2 | 3 | 4): Href {
  const registrado = useVista((v) => v.conductor.registrado);
  if (paso > 1) return RUTA_PASO[(paso - 1) as 1 | 2 | 3];
  return registrado ? '/conductor/inicio' : '/conductor/autorizaciones';
}

/** Lo que se escribe en el campo del celular ("9 1234 5678") → los 8 dígitos que guarda la tienda ("1234 5678"). */
export function celularParaGuardar(escrito: string): string {
  const d = escrito.replace(/\D/g, '');
  const ocho = d.length === 9 && d.startsWith('9') ? d.slice(1) : d.length <= 8 ? d : d.slice(-8);
  return mascaraCelular(ocho);
}

/** Los 8 dígitos guardados ("1234 5678") → lo que muestra el campo ("9 1234 5678"). */
export function celularParaCampo(guardado: string): string {
  const d = guardado.replace(/\D/g, '');
  return d ? mascaraCampoCelular('9' + d) : '';
}

/** Máscara mientras se escribe: "912345678" → "9 1234 5678". */
export function mascaraCampoCelular(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 9);
  if (d.length <= 1) return d;
  if (d.length <= 5) return `${d.slice(0, 1)} ${d.slice(1)}`;
  return `${d.slice(0, 1)} ${d.slice(1, 5)} ${d.slice(5)}`;
}

/** ¿El celular escrito es válido? 9 dígitos que empiezan con 9. */
export function celularValido(escrito: string): boolean {
  return /^9\d{8}$/.test(escrito.replace(/\D/g, ''));
}

/**
 * Lleva a Inicio dejando la pila limpia: saca el ingreso y los pasos del registro de la pila del
 * conductor (para que "volver" no regrese a la bienvenida ni al formulario).
 */
export function irAInicioConductor() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/conductor/inicio');
}

/** Tras cerrar sesión (app real): pila limpia y a la Bienvenida, con el aviso. */
export function irABienvenidaTrasCerrarSesion() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/conductor/bienvenida');
  mostrarToast('Cerraste sesión.');
}

/**
 * ¿La persona sigue en esta pantalla? Tras un `await` (pedir o verificar el código, guardar un paso),
 * si ya salió (por ejemplo, con "Volver"), no se navega ni se avisa nada, como la demo cancelaba su
 * temporizador al salir. `senal()` da una señal que se cancela al salir, para pasársela a la acción.
 */
export function usePantallaAbierta() {
  const control = useRef<AbortController | null>(null);
  useEffect(() => {
    const c = new AbortController();
    control.current = c;
    return () => c.abort();
  }, []);
  return useMemo(
    () => ({
      senal: () => (control.current ??= new AbortController()).signal,
      salio: () => control.current?.signal.aborted ?? false,
    }),
    [],
  );
}

/**
 * Guardar sin dobles toques: `ejecutar(fn)` no corre si ya hay un guardado en curso, y `guardando`
 * se enciende solo si tarda (más de 150 ms), para que un guardado inmediato no haga parpadear el botón.
 */
export function useGuardando() {
  const [guardando, setGuardando] = useState(false);
  const enCurso = useRef(false);
  async function ejecutar(fn: () => Promise<void>) {
    if (enCurso.current) return;
    enCurso.current = true;
    const t = setTimeout(() => setGuardando(true), 150);
    try {
      await fn();
    } finally {
      clearTimeout(t);
      enCurso.current = false;
      setGuardando(false);
    }
  }
  return { guardando, ejecutar };
}

// Acciones y navegación propias del grupo "ingreso" (A1–A4, B1–B5).
import { router, useLocalSearchParams, type Href } from 'expo-router';

import { mascaraCelular } from '@/datos/formato';
import { useDemo } from '@/datos/tienda';
import { mostrarToast, volver } from '@/ui';

/** Ruta de cada paso del registro (rutas con tipo). */
export const RUTA_PASO: Record<1 | 2 | 3 | 4 | 5, Href> = {
  1: '/conductor/registro/1',
  2: '/conductor/registro/2',
  3: '/conductor/registro/3',
  4: '/conductor/registro/4',
  5: '/conductor/registro/5',
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
export function volverDesdePaso(paso: 1 | 2 | 3 | 4 | 5): Href {
  if (paso > 1) return RUTA_PASO[(paso - 1) as 1 | 2 | 3 | 4];
  return useDemo.getState().conductor.registrado ? '/conductor/inicio' : '/conductor/autorizaciones';
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
 * Después de verificar el código: quien ya se registró va a Inicio; quien ya aceptó las
 * autorizaciones sigue en el Paso 1; los demás pasan por "Antes de empezar" (A4).
 */
export function rutaTrasVerificar(): 'inicio' | Href {
  const s = useDemo.getState();
  if (s.conductor.registrado) return 'inicio';
  if (s.cuenta.autorizaciones.terminos) return RUTA_PASO[1];
  return '/conductor/autorizaciones';
}

/**
 * Lleva a Inicio dejando la pila limpia: saca el ingreso y los pasos del registro de la pila del
 * conductor (para que "volver" no regrese a la bienvenida ni al formulario).
 */
export function irAInicioConductor() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/conductor/inicio');
}

/**
 * Envía a revisión los documentos subidos y abre "Enviado a revisión" (C2) sobre Inicio, de modo que
 * "Ir al inicio" vuelva a Inicio y no al Paso 5.
 */
export function enviarYMostrarEnviado() {
  useDemo.getState().enviarDocumentosARevision();
  if (router.canDismiss()) router.dismissAll();
  router.replace('/conductor/inicio');
  router.push('/conductor/documentos/enviado');
}

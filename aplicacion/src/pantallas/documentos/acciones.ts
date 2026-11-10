// Acciones propias del grupo "documentos" (sobre la tienda de la demo) y ayudas de navegación.
import { Platform } from 'react-native';
import { router } from 'expo-router';

import { useDemo } from '@/datos/tienda';
import type { TipoDocumentoId } from '@/datos/tipos';

/**
 * Sube un documento y lo envía de inmediato a revisión (cuando el conductor ya había enviado sus
 * documentos antes: subir de nuevo uno no aprobado o renovar uno que vence).
 */
export function subirYEnviar(tipo: TipoDocumentoId, nombreArchivo: string) {
  const s = useDemo.getState();
  s.subirDocumento(tipo, nombreArchivo);
  s.enviarDocumentosARevision([tipo]);
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

/**
 * Abre el selector de archivos del navegador y devuelve SOLO el nombre del archivo elegido.
 * Nunca se lee el contenido: en la demo no se sube nada. Fuera de la web devuelve null.
 */
export function elegirArchivo(acepta: string): Promise<string | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolver) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acepta;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    let listo = false;
    const terminar = (nombre: string | null) => {
      if (listo) return;
      listo = true;
      input.remove();
      resolver(nombre);
    };
    input.addEventListener('change', () => terminar(input.files?.[0]?.name ?? null));
    input.addEventListener('cancel', () => terminar(null));
    document.body.appendChild(input);
    input.click();
  });
}

/** ¿El nombre corresponde al formato pedido? (PDF o imagen) */
export function formatoValido(nombre: string, esPdf: boolean): boolean {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  if (esPdf) return ext === 'pdf';
  return ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'].includes(ext);
}

type Navegacion = {
  dispatch: (accion: { type: string; payload?: Record<string, unknown> }) => void;
};

/**
 * Vuelve al selector de la demo ("/"), igual que el botón "Demo": recibe la navegación de la pila
 * raíz (useNavigation('/')) y vuelve a su pantalla "index" (si no estaba en la pila, la agrega).
 */
export function irAlSelector(navegacionRaiz: unknown) {
  try {
    (navegacionRaiz as Navegacion).dispatch({ type: 'POP_TO', payload: { name: 'index', params: undefined, merge: false } });
  } catch {
    // Último recurso: recargar en la raíz.
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign('/');
  }
}

/** Cambia de pestaña del conductor (desde una pantalla que está dentro de las pestañas). */
export function irAPestana(navigation: unknown, pestana: 'inicio' | 'matches' | 'bolsa' | 'mensajes' | 'perfil') {
  (navigation as Navegacion).dispatch({ type: 'NAVIGATE', payload: { name: pestana } });
}

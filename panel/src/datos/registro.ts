// Registro de acciones del equipo ("Acción del equipo", R26): cada línea dice quién, qué y cuándo.
// Quien firma se fija en el momento de la acción (no al escribir la línea), así un cambio de rol o
// salir del panel justo después no cambia la firma.
import { ahoraISO, nuevoId, useDemo } from '@/datos/tienda';

/** Agrega una línea al registro (lo más nuevo primero; la demo guarda las últimas 200). */
export function escribirEnRegistro(quien: string, que: string): void {
  useDemo.setState((s) => ({ accionesEquipo: [{ id: nuevoId('a'), quien, que, fecha: ahoraISO() }, ...s.accionesEquipo].slice(0, 200) }));
}

// Un control deslizante o un botón de sumar cambian el valor muchas veces seguidas: al registro va solo
// el último cambio, después de una pausa corta. Lo que queda esperando se escribe antes de cambiar de
// rol, al salir del panel y al cerrar la pestaña (vaciarRegistroPendiente).
const esperas = new Map<string, { reloj: ReturnType<typeof setTimeout>; escribir: () => void }>();

export function registrarConEspera(clave: string, quien: string, que: () => string, ms = 900): void {
  const antes = esperas.get(clave);
  if (antes) clearTimeout(antes.reloj);
  const escribir = () => {
    esperas.delete(clave);
    escribirEnRegistro(quien, que());
  };
  esperas.set(clave, { reloj: setTimeout(escribir, ms), escribir });
}

/** Escribe ya todo lo que esperaba la pausa. */
export function vaciarRegistroPendiente(): void {
  for (const { reloj, escribir } of [...esperas.values()]) {
    clearTimeout(reloj);
    escribir();
  }
}

// Implementación DEMO de la interfaz de datos del conductor: la tienda de la demo (zustand + localStorage).
// Se comporta igual que antes de existir la interfaz: las mismas acciones de la tienda y las mismas
// pausas cortas al pedir y verificar el código (para que se sienta el envío). Si la persona sale de A3
// durante la pausa, el celular no queda verificado (como cuando la pantalla cancelaba su temporizador);
// la pantalla, además, no navega (usePantallaAbierta). La monta el layout raíz
// de la demo; la app real usa la suya (app-real/src/datos/puertoReal.tsx) y no importa este archivo.
import type { ReactNode } from 'react';

import { ProveedorConductor, type ImplementacionPuerto } from '../puerto/contexto';
import type { AccionesConductor, DestinoIngreso, Entorno, Resultado, VistaConductor } from '../puerto/tipos';
import { EJEMPLO_USUARIO } from '../semilla';
import { useDemo } from '../tienda';

const OK: Resultado = { ok: true, valor: undefined };
/** La persona salió de la pantalla durante la pausa: no se cambia nada (la pantalla ya no lo muestra). */
const CANCELADA: Resultado<never> = { ok: false, error: 'Cancelado.' };
const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Después de verificar el código: quien ya se registró va a Inicio; quien ya aceptó las
 * autorizaciones sigue en el Paso 1; los demás pasan por "Antes de empezar" (A4).
 */
function destinoTrasVerificar(): DestinoIngreso {
  const s = useDemo.getState();
  if (s.conductor.registrado) return 'inicio';
  if (s.cuenta.autorizaciones.terminos) return 'paso1';
  return 'autorizaciones';
}

const acciones: AccionesConductor = {
  async pedirCodigo(celular8, _canal, opciones) {
    if (opciones?.reenvio) return OK; // En la demo no se envía nada.
    useDemo.getState().guardarCelular(celular8);
    // Pausa breve para que se sienta el envío (en la demo no sale ningún mensaje).
    await esperar(600);
    return OK;
  },
  async verificarCodigo(_codigo, opciones) {
    await esperar(700);
    if (opciones?.senal?.aborted) return CANCELADA;
    useDemo.getState().verificarCelular();
    return { ok: true, valor: destinoTrasVerificar() };
  },
  async aceptarAutorizaciones(m) {
    useDemo.getState().aceptarAutorizaciones({ terminos: m.terminos, privacidad: m.terminos, compartirFicha: m.compartir });
    return OK;
  },
  async guardarPaso1(d) {
    const primeraVez = !useDemo.getState().conductor.registrado;
    useDemo.getState().guardarPaso1(d);
    return { ok: true, valor: { primeraVez } };
  },
  async guardarPaso2(d) {
    useDemo.getState().guardarPaso2({ direccion: '', depto: '', ...d });
    return OK;
  },
  async guardarPaso3(d) {
    useDemo.getState().guardarPaso3(d);
    return OK;
  },
  async guardarPaso4(d) {
    useDemo.getState().guardarPaso4(d);
    return OK;
  },
  async cambiarDisponible(v) {
    useDemo.getState().cambiarDisponible(v);
    return OK;
  },
  async confirmarDisponibilidad() {
    useDemo.getState().confirmarDisponibilidad();
    return OK;
  },
  // En la demo, "Cerrar sesión" vuelve al menú de la demo (lo hace Perfil); los datos quedan guardados.
  async cerrarSesion() {},
};

const TEXTOS_FIJOS = {
  esDemo: true,
  esperaReenvioSegundos: 30,
  notaCodigo: 'Demo: cualquier código de 6 dígitos',
  ejemplo: {
    etiqueta: 'Demo:',
    usarNumero: 'Usar un número de ejemplo',
    rellenarDatos: 'Rellenar con datos de ejemplo',
    usarDireccion: 'Usar una dirección de ejemplo',
    usuario: EJEMPLO_USUARIO,
  },
  textosLegales: {
    terminos: 'En la app real aquí van los Términos y condiciones completos.',
    privacidad:
      'En la app real aquí va la Política de privacidad completa: qué datos se piden, para qué se usan, quién los ve y cómo pedir que se borren.',
    nota: 'Los textos legales están en preparación con un abogado. En la demo no hay texto legal.',
    perfil: 'Aquí estarán los Términos y la Política de privacidad. En la demo todavía no están.',
  },
  textoCerrarSesion: 'Para volver a entrar usarás tu celular y un código. En la demo, tus datos quedan guardados.',
  volverDesdeAutorizaciones: 'codigo',
} satisfies Partial<Entorno>;

function useEntornoDemo(): Entorno {
  // Los ajustes los puede cambiar el panel de la demo en otra pestaña: se leen en vivo.
  const validarObligatorios = useDemo((s) => s.ajustes.validarObligatorios);
  const diasReconfirmar = useDemo((s) => s.ajustes.diasReconfirmar);
  const bolsaActiva = useDemo((s) => s.ajustes.bolsaActiva);
  return { ...TEXTOS_FIJOS, validarObligatorios, diasReconfirmar, pestanas: bolsaActiva ? 5 : 4 };
}

const IMPLEMENTACION_DEMO: ImplementacionPuerto = {
  // El estado de la demo ya tiene la forma de VistaConductor (y más).
  useVista: <T,>(selector: (v: VistaConductor) => T) => useDemo(selector),
  useVistaCompleta: () => useDemo(),
  useEntorno: useEntornoDemo,
  acciones,
};

export function ProveedorDemo({ children }: { children: ReactNode }) {
  return <ProveedorConductor implementacion={IMPLEMENTACION_DEMO}>{children}</ProveedorConductor>;
}

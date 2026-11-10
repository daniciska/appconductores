// Interfaz de datos de las pantallas del conductor que comparten la demo y la app real ("puerto").
// Las pantallas compartidas (ingreso, pasos 1 a 4, Inicio incompleto, Perfil, disponibilidad) leen y
// escriben SOLO por aquí; cada app entrega su implementación con un proveedor:
//   - la demo (src/datos/demo/puertoDemo.tsx): la tienda de la demo, en el navegador;
//   - la app real (app-real/src/datos/puertoReal.tsx): Supabase.
// Solo tipos: se puede importar desde cualquier lado (también desde las pruebas de Node).
import type { Catalogos, ConductorUsuario, CuentaUsuario, Dia, Turno } from '../tipos.ts';

export type CatalogosRegistro = Pick<
  Catalogos,
  'regiones' | 'zonas' | 'comunas' | 'clases' | 'industrias' | 'tamanos' | 'negocios' | 'turnos' | 'dias' | 'idiomas'
>;

/** Canal por el que se pide el código. */
export type CanalCodigo = 'whatsapp' | 'sms';

/** El código que se está esperando (solo en la app real; en la demo es null). */
export interface IngresoPendiente {
  /** Los 8 dígitos después de +56 9, con espacio ("1234 5678"). */
  celular: string;
  canal: CanalCodigo;
  /** Cuándo se pidió el último código (ms): de ahí se cuenta la espera para pedir otro. */
  pedidoEn: number;
}

/** Lo que leen las pantallas. La tienda de la demo (DatosDemo) ya tiene esta forma. */
export interface VistaConductor {
  /** celular = 8 dígitos ("1234 5678"). */
  cuenta: CuentaUsuario;
  /** registrado, pasosListos y pasoActual: en la app real se deducen de lo guardado. */
  conductor: ConductorUsuario;
  catalogos: CatalogosRegistro;
  /** Código pedido y todavía sin verificar (app real). La demo no lo usa. */
  ingreso?: IngresoPendiente | null;
  /**
   * Textos vigentes de "Antes de empezar" leídos de la base, por casilla (app real): A4 muestra estos y
   * la app registra la aceptación de estos mismos. La demo no los tiene (usa los de la pantalla).
   */
  textosAutorizacion?: Partial<Record<CasillaAutorizacion, string>> | null;
}

export type Resultado<T = void> = { ok: true; valor: T } | { ok: false; error: string };
export type DestinoIngreso = 'inicio' | 'paso1' | 'autorizaciones';

export interface DatosPaso1 {
  nombres: string;
  apellido1: string;
  apellido2: string;
  /** 'dd/mm/aaaa'. */
  fechaNacimiento: string;
  correo: string;
  /** Códigos de las clases ('A2', 'B'…). */
  clasesDeclaradas: string[];
  disponible: boolean;
}

/** Paso 2 de la demo (dirección con sugerencias). */
export interface DatosPaso2 {
  direccion: string;
  depto: string;
  comunaId: string | null;
  tieneEstacionamiento: boolean;
}

/** Paso 2 temporal de la app real: la comuna elegida de una lista (sin dirección). */
export interface DatosPaso2Comuna {
  comunaId: string;
  tieneEstacionamiento: boolean;
}

export interface DatosPaso3 {
  /** Años manejando cada tipo de vehículo marcado ({ [idTamano]: años }). */
  experiencia: Record<string, number>;
  /** Claves de idioma ('es', 'en'…). */
  idiomas: string[];
}

export interface DatosPaso4 {
  /** Negocios marcados (ids). */
  negocios: string[];
  turnos: Turno[];
  dias: Dia[];
}

/** Las 4 casillas de "Antes de empezar" (A4). */
export type CasillaAutorizacion = 'terminos' | 'compartir' | 'revision' | 'mensajes';
export type MarcasAutorizacion = Record<CasillaAutorizacion, boolean>;

/** `senal`: se cancela si la persona sale de la pantalla mientras se espera (ver usePantallaAbierta). */
export interface OpcionesAccion {
  senal?: AbortSignal;
}

export interface AccionesConductor {
  /** Pide un código para el celular (8 dígitos). `reenvio`: desde A3 ("Reenviar…"). */
  pedirCodigo(celular8: string, canal: CanalCodigo, opciones?: OpcionesAccion & { reenvio?: boolean }): Promise<Resultado>;
  /** Verifica el código y dice a dónde ir. */
  verificarCodigo(codigo: string, opciones?: OpcionesAccion): Promise<Resultado<DestinoIngreso>>;
  aceptarAutorizaciones(marcas: MarcasAutorizacion): Promise<Resultado>;
  guardarPaso1(d: DatosPaso1): Promise<Resultado<{ primeraVez: boolean }>>;
  guardarPaso2(d: DatosPaso2 | DatosPaso2Comuna): Promise<Resultado>;
  guardarPaso3(d: DatosPaso3): Promise<Resultado>;
  guardarPaso4(d: DatosPaso4): Promise<Resultado>;
  cambiarDisponible(v: boolean): Promise<Resultado>;
  confirmarDisponibilidad(): Promise<Resultado>;
  cerrarSesion(): Promise<void>;
}

/** Atajos de la demo para rellenar formularios ("Demo: Rellenar con datos de ejemplo"). La app real no los tiene. */
export interface EjemploDemo {
  /** Texto de la nota ("Demo:"). */
  etiqueta: string;
  usarNumero: string;
  rellenarDatos: string;
  usarDireccion: string;
  usuario: {
    celular: string;
    correo: string;
    nombres: string;
    apellido1: string;
    apellido2: string;
    fechaNacimiento: string;
    direccion: string;
    depto: string;
    comunaId: string;
  };
}

/** Textos legales de prueba (las ventanas de Términos de A4 y de Perfil). */
export interface TextosLegales {
  /** Ventana "Términos y condiciones" (A4). */
  terminos: string;
  /** Ventana "Política de privacidad" (A4). */
  privacidad: string;
  /** Nota gris bajo esas ventanas (o null). */
  nota: string | null;
  /** Texto de la hoja "Términos y privacidad" de Perfil. */
  perfil: string;
}

/** Lo que cambia entre la demo y la app real, fuera de los datos. */
export interface Entorno {
  esDemo: boolean;
  /** Si los formularios exigen los campos con * (demo: ajuste; real: siempre). */
  validarObligatorios: boolean;
  /** Cada cuántos días se pide confirmar "Disponible para trabajar". */
  diasReconfirmar: number;
  /** Segundos entre dos códigos (demo 30, real 60). */
  esperaReenvioSegundos: number;
  /** Nota sobre "Verificar" en A3 (o null). */
  notaCodigo: string | null;
  /** Cuántas pestañas tiene la barra (silueta de E4). */
  pestanas: number;
  /** Atajos de la demo (o null). */
  ejemplo: EjemploDemo | null;
  textosLegales: TextosLegales;
  /** Texto del diálogo "¿Cerrar sesión?". */
  textoCerrarSesion: string;
  /**
   * "Volver" en A4. Demo: vuelve al código (A3). App real: la sesión ya está abierta y A3 no sirve,
   * así que ofrece cerrar sesión (para entrar con otro número).
   */
  volverDesdeAutorizaciones: 'codigo' | 'cerrarSesion';
}

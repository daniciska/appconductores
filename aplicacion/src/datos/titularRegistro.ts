// Registro del titular de la demo (prototipo del titular, 24-nov). Puro: solo tipos, para que lo usen la
// tienda, la migración y las pruebas de Node.
import type { TipoTitular } from './tipos.ts';

/** Id del titular que crea la persona que se registra como titular en la demo. */
export const ID_TITULAR_USUARIO = 'tyo';
/** Id del titular de ejemplo (atajo "Empresa de ejemplo" y lo guardado antes del 24-nov). */
export const ID_TITULAR_EJEMPLO = 't01';

/** Cédula de quien usa la cuenta del titular (T18). En la demo solo se guarda el nombre del archivo. */
export type EstadoCedulaTitular = 'falta' | 'subido' | 'en_revision' | 'aprobado';

export interface CedulaTitular {
  estado: EstadoCedulaTitular;
  archivo: string | null;
  enviadoEl: string | null;
  revisadoEl: string | null;
}

/** Lo que escribe el titular en "Tus datos" (T1, T2, T4, T5, T7). El celular es el verificado. */
export interface DatosTitular {
  tipo: TipoTitular;
  nombres: string;
  apellido1: string;
  apellido2: string;
  correo: string;
  /** Solo empresa. */
  razonSocial: string;
  /** Solo empresa, con dígito verificador ("76.123.456-7"). */
  rut: string;
}

export interface RegistroTitular extends DatosTitular {
  celularVerificado: boolean;
  autorizadoEl: string | null;
  /** true desde que guardó "Tus datos": ya existe su titular en la demo. */
  datosListos: boolean;
  cedula: CedulaTitular;
}

export function registroTitularVacio(): RegistroTitular {
  return {
    tipo: 'persona',
    nombres: '',
    apellido1: '',
    apellido2: '',
    correo: '',
    razonSocial: '',
    rut: '',
    celularVerificado: false,
    autorizadoEl: null,
    datosListos: false,
    cedula: { estado: 'falta', archivo: null, enviadoEl: null, revisadoEl: null },
  };
}

/** El registro ya hecho de la empresa de ejemplo (Transportes Los Aromos SpA, t01). */
export function registroTitularEjemplo(ahora = Date.now()): RegistroTitular {
  const hace = (dias: number) => new Date(ahora - dias * 24 * 60 * 60 * 1000).toISOString();
  return {
    tipo: 'empresa',
    nombres: 'Patricia',
    apellido1: 'Morales',
    apellido2: 'Fuentes',
    correo: 'contacto@losaromos.example',
    razonSocial: 'Transportes Los Aromos SpA',
    rut: '76.543.210-3',
    celularVerificado: true,
    autorizadoEl: hace(40),
    datosListos: true,
    cedula: { estado: 'aprobado', archivo: 'cedula-frente.jpg', enviadoEl: hace(40), revisadoEl: hace(39) },
  };
}

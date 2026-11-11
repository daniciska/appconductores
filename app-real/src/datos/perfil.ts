// Perfil propio leído de la base → CuentaUsuario y ConductorUsuario (los tipos de las pantallas).
// Puro: lo prueba tests/mapeo.test.ts. Las consultas están en ./lecturas.ts (siempre filtradas por el
// propio id: alguien del equipo ve por RLS las filas de todos).
//
// "Pasos listos": la base no los guarda (y estado_perfil queda 'incompleto' hasta la Etapa 3); la app
// los deduce solo para mostrar el avance:
//   Paso 1 · hay fila en conductores, nombres, primer apellido y correo con texto, y al menos una clase.
//   Paso 2 · comuna y estacionamiento respondidos.
//   Paso 3 · algún vehículo con años, o algún idioma, o el Paso 4 listo (el Paso 3 es opcional).
//   Paso 4 · al menos un negocio, un turno y un día.
//   Paso 5 · documentos: siempre falta en la v1.
import type { TextoAutorizacion } from '@/datos/puerto/tipos';
import type { ConductorUsuario, CuentaUsuario, Dia, EstadoVerificacion, Turno } from '@/datos/tipos';

import { textosObligatorios, type MapasCatalogo, type TextoVigente } from './catalogos.ts';

export interface FilasPerfil {
  cuenta: {
    id: string;
    celular: string | null;
    celular_verificado_en: string | null;
    creado_en: string | null;
    email: string | null;
    nombres: string | null;
    primer_apellido: string | null;
    segundo_apellido: string | null;
    estado: string;
  } | null;
  conductor: {
    id: string;
    fecha_nacimiento: string;
    comuna_id: number | null;
    tiene_estacionamiento: boolean | null;
    disponible: boolean;
    disponibilidad_confirmada_en: string | null;
    estado_perfil: string;
    estado_verificacion: string;
    creado_en: string;
  } | null;
  licencias: { clase_licencia_id: number; origen: string }[];
  experiencia: { tamano_vehiculo_id: number; anos: number }[];
  negocios: { negocio_id: number }[];
  opciones: { opcion_id: number }[];
  consentimientos: { texto_autorizacion_id: number }[];
}

export interface PerfilLeido {
  cuenta: CuentaUsuario;
  conductor: ConductorUsuario;
  /** Las casillas de A4: una por texto obligatorio vigente, aceptada solo si aceptó esa misma versión. */
  textosAutorizacion: TextoAutorizacion[];
  /** Están aceptados todos los textos vigentes obligatorios (y hay al menos uno). */
  autorizacionesCompletas: boolean;
  /** Ids de textos aceptados y vigentes (sin retirar). */
  aceptados: number[];
}

/** '+56912345678' → '1234 5678' (los 8 dígitos después de +56 9). */
export function celularDeLaBase(celular: string | null | undefined): string {
  const d = (celular ?? '').replace(/\D/g, '');
  if (!d) return '';
  const ocho = d.startsWith('569') && d.length === 11 ? d.slice(3) : d.slice(-8);
  return ocho.length > 4 ? `${ocho.slice(0, 4)} ${ocho.slice(4)}` : ocho;
}

/** Los 8 dígitos de la app ('1234 5678') → '+56912345678' (como lo pide Supabase Auth). */
export function celularParaAuth(celular8: string): string {
  return '+569' + celular8.replace(/\D/g, '').slice(-8);
}

/** 'aaaa-mm-dd' → 'dd/mm/aaaa'. */
export function fechaDeLaBase(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** 'dd/mm/aaaa' → 'aaaa-mm-dd'. */
export function fechaParaLaBase(texto: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : texto.trim();
}

/**
 * Las casillas de A4 (vista.textosAutorizacion): una por texto obligatorio vigente, en su orden, con
 * `aceptado` solo si la persona aceptó ESA versión (su id). Nunca se deduce de otras claves.
 */
export function textosParaA4(textos: TextoVigente[], aceptados: number[]): TextoAutorizacion[] {
  return textosObligatorios(textos).map((t) => ({ id: String(t.id), texto: t.texto.trim(), aceptado: aceptados.includes(t.id) }));
}

const VERIFICACION: EstadoVerificacion[] = ['sin_documentos', 'en_revision', 'verificado', 'con_observaciones'];
const texto = (t: string | null | undefined) => (t ?? '').trim();

export function mapearPerfil(f: FilasPerfil, mapas: MapasCatalogo, textos: TextoVigente[], ingresoCelular = ''): PerfilLeido {
  const c = f.cuenta;
  const d = f.conductor;
  const aceptados = f.consentimientos.map((x) => x.texto_autorizacion_id);
  const aceptada = (clave: string) => textos.some((t) => t.clave === clave && aceptados.includes(t.id));
  // La guardia (al día) y A4 (sus casillas) salen de la misma lista.
  const textosAutorizacion = textosParaA4(textos, aceptados);
  const autorizacionesCompletas = textosAutorizacion.length > 0 && textosAutorizacion.every((t) => t.aceptado);

  const cuenta: CuentaUsuario = {
    celular: c ? celularDeLaBase(c.celular) : ingresoCelular,
    celularVerificado: !!c?.celular_verificado_en,
    correo: c?.email ?? '',
    nombres: c?.nombres ?? '',
    apellido1: c?.primer_apellido ?? '',
    apellido2: c?.segundo_apellido ?? '',
    creadaEl: c?.creado_en ?? null,
    // Solo informativo (las pantallas de la v1 no lo usan): A4 usa textosAutorizacion, versión por versión.
    autorizaciones: {
      terminos: aceptada('terminos_privacidad'),
      privacidad: aceptada('terminos_privacidad'),
      compartirFicha: aceptada('compartir_ficha'),
      recordatoriosWhatsapp: false,
    },
    autorizacionesEl: null,
  };

  const opcionesDe = (lista: 'turno' | 'dia_semana' | 'idioma') =>
    f.opciones.map((o) => mapas.opcionPorId[o.opcion_id]).filter((o) => o?.lista === lista).map((o) => o!.clave);
  const clasesDeclaradas = f.licencias.filter((l) => l.origen === 'declarada').map((l) => mapas.claseCodigoPorId[l.clase_licencia_id]).filter(Boolean);
  const clasesRevisadas = f.licencias.filter((l) => l.origen === 'revisada').map((l) => mapas.claseCodigoPorId[l.clase_licencia_id]).filter(Boolean);
  const experiencia: Record<string, number> = {};
  for (const e of f.experiencia) if (e.anos > 0) experiencia[String(e.tamano_vehiculo_id)] = e.anos;
  const idiomas = opcionesDe('idioma');
  const turnos = opcionesDe('turno') as Turno[];
  const dias = opcionesDe('dia_semana') as Dia[];
  const negocios = f.negocios.map((n) => String(n.negocio_id));

  const datos = !!d && !!texto(c?.nombres) && !!texto(c?.primer_apellido) && !!texto(c?.email) && clasesDeclaradas.length > 0;
  const direccion = !!d && d.comuna_id !== null && d.tiene_estacionamiento !== null;
  const trabajo = !!d && negocios.length > 0 && turnos.length > 0 && dias.length > 0;
  const experienciaLista = !!d && (Object.keys(experiencia).length > 0 || idiomas.length > 0 || trabajo);
  const pasosListos = { datos, direccion, experiencia: experienciaLista, trabajo, documentos: false };
  const orden = [datos, direccion, experienciaLista, trabajo];
  const primero = orden.findIndex((x) => !x);

  const conductor: ConductorUsuario = {
    registrado: !!d,
    registradoEl: d?.creado_en ?? null,
    pasosListos,
    pasoActual: primero === -1 ? 4 : primero + 1,
    fechaNacimiento: fechaDeLaBase(d?.fecha_nacimiento),
    // En la v1 no se pide la dirección (la comuna se elige de una lista).
    direccion: '',
    depto: '',
    comunaId: d?.comuna_id != null ? String(d.comuna_id) : null,
    tieneEstacionamiento: d?.tiene_estacionamiento ?? false,
    clasesDeclaradas,
    clasesRevisadas,
    idiomas,
    experiencia,
    negocios,
    turnos,
    dias,
    // Antes de registrarse, "Disponible para trabajar" parte encendido (decidido).
    disponible: d ? d.disponible : true,
    disponibilidadConfirmadaEn: d?.disponibilidad_confirmada_en ?? null,
    estadoPerfil: d?.estado_perfil === 'completo' ? 'completo' : 'incompleto',
    estadoVerificacion: VERIFICACION.includes(d?.estado_verificacion as EstadoVerificacion)
      ? (d!.estado_verificacion as EstadoVerificacion)
      : 'sin_documentos',
  };

  return { cuenta, conductor, textosAutorizacion, autorizacionesCompletas, aceptados };
}

/** Perfil vacío (sin sesión): el celular que se está verificando, si hay. */
export function perfilVacio(mapas: MapasCatalogo, textos: TextoVigente[], ingresoCelular = ''): PerfilLeido {
  return mapearPerfil(
    { cuenta: null, conductor: null, licencias: [], experiencia: [], negocios: [], opciones: [], consentimientos: [] },
    mapas,
    textos,
    ingresoCelular,
  );
}

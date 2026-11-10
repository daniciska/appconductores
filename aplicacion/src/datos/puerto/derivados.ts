// Lecturas derivadas sobre la interfaz de datos (VistaConductor): sirven igual en la demo y en la app
// real. La demo las reexporta desde selectores.ts (su estado tiene la misma forma).
// Puras: se pueden probar con Node (por eso las importaciones llevan ".ts").
import { habilitaNegocio } from '../match.ts';
import type { Industria, Negocio, SeccionPerfil } from '../tipos.ts';
import type { VistaConductor } from './tipos.ts';

/** Las 5 secciones del perfil del conductor (pasos 1 a 5). */
export const SECCIONES: { id: SeccionPerfil; paso: number; nombre: string }[] = [
  { id: 'datos', paso: 1, nombre: 'Tus datos' },
  { id: 'direccion', paso: 2, nombre: 'Dónde vives' },
  { id: 'experiencia', paso: 3, nombre: 'Tu experiencia' },
  { id: 'trabajo', paso: 4, nombre: '¿Qué trabajo buscas?' },
  { id: 'documentos', paso: 5, nombre: 'Tus documentos' },
];

type ConCatalogos = Pick<VistaConductor, 'catalogos'>;

/** Avance del perfil: pasos listos de 5. */
export function avancePerfil(v: Pick<VistaConductor, 'conductor'>) {
  const faltantes = SECCIONES.filter((x) => !v.conductor.pasosListos[x.id]);
  const listos = SECCIONES.length - faltantes.length;
  return {
    listos,
    total: SECCIONES.length,
    porcentaje: Math.round((listos / SECCIONES.length) * 100),
    faltantes,
    /** Primer paso que falta (1 a 5), o null si está completo. */
    siguientePaso: faltantes[0]?.paso ?? null,
  };
}

/** Negocios agrupados por industria. Con soloActivos (por defecto), solo lo que la app muestra. */
export function negociosPorIndustria(v: ConCatalogos, soloActivos = true): { industria: Industria; negocios: Negocio[] }[] {
  return [...v.catalogos.industrias]
    .sort((a, b) => a.orden - b.orden)
    .filter((i) => !soloActivos || i.activo)
    .map((industria) => ({
      industria,
      negocios: v.catalogos.negocios
        .filter((n) => n.industriaId === industria.id && (!soloActivos || n.activo))
        .sort((a, b) => a.orden - b.orden),
    }))
    .filter((g) => g.negocios.length > 0);
}

/** ¿Las clases DECLARADAS permiten el negocio? (Paso 4: los que no, en gris con "Pide licencia X"). */
export function negocioPermitidoPorDeclaradas(v: Pick<VistaConductor, 'catalogos' | 'conductor'>, negocioId: string): boolean {
  const n = v.catalogos.negocios.find((x) => x.id === negocioId);
  return !!n && habilitaNegocio(v.conductor.clasesDeclaradas, n, null, v.catalogos.clases);
}

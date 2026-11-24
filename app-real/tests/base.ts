// Ayudas de las pruebas: los catálogos de la base (simulador/base-inicial.json) con la forma que
// devuelven las lecturas de la app (src/datos/lecturas.ts).
import { readFileSync } from 'node:fs';

import { mapearCatalogos, type CatalogosLeidos, type FilasCatalogo } from '../src/datos/catalogos.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BASE: any = JSON.parse(readFileSync(new URL('./simulador/base-inicial.json', import.meta.url), 'utf8'));

export function filasCatalogo(): FilasCatalogo {
  return {
    regiones: BASE.regiones,
    zonas: BASE.zonas,
    comunas: BASE.comunas,
    clases: BASE.clases_licencia,
    industrias: BASE.industrias,
    tamanos: BASE.tamanos_vehiculo,
    negocios: BASE.negocios,
    listas: BASE.listas.filter((l: { clave: string }) => ['turno', 'dia_semana', 'idioma'].includes(l.clave)),
    // Como lecturas.ts: solo los textos vigentes.
    textos: BASE.textos_autorizacion.filter((t: { vigente: boolean }) => t.vigente),
    diasReconfirmar: BASE.ajustes.find((a: { id: string }) => a.id === 'dias_reconfirmar_disponibilidad').valor,
    tiposDocumento: BASE.tipos_documento,
    mesesAvisoDocumentos: BASE.ajustes.find((a: { id: string }) => a.id === 'meses_aviso_vencimiento_documentos').valor,
  };
}

export const catalogosLeidos = (): CatalogosLeidos => mapearCatalogos(filasCatalogo());

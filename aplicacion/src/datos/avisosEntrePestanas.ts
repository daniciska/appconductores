// Avisos al conductor por cambios que llegan desde otra pestaña de este navegador: un documento que
// una persona del equipo aprobó o no aprobó mientras el conductor tenía la demo abierta. Los cambios
// hechos en esta misma pestaña ya muestran su aviso al ocurrir (ver tienda.ts y simulacion.ts).
// Lo enciende el layout raíz. Solo avisa en las pantallas del conductor.
import { avisar } from './avisos';
import type { DatosDemo } from './estado';
import { TIPOS_DOC_ORDEN } from './selectores';
import { useDemo } from './tienda';
import type { TipoDocumentoId } from './tipos';

const APROBADO: Record<TipoDocumentoId, string> = {
  cedula: 'Tu cédula fue aprobada.',
  licencia: 'Tu licencia fue aprobada.',
  hoja_vida: 'Tu Hoja de Vida fue aprobada.',
  antecedentes: 'Tu certificado de antecedentes fue aprobado.',
};

const NO_APROBADO: Record<TipoDocumentoId, string> = {
  cedula: 'No pudimos aprobar tu cédula.',
  licencia: 'No pudimos aprobar tu licencia.',
  hoja_vida: 'No pudimos aprobar tu Hoja de Vida.',
  antecedentes: 'No pudimos aprobar tu certificado de antecedentes.',
};

const enPantallasDelConductor = () =>
  typeof window !== 'undefined' && typeof window.location?.pathname === 'string' && window.location.pathname.startsWith('/conductor');

function avisarCambios(antes: DatosDemo, despues: DatosDemo): void {
  if (!enPantallasDelConductor()) return;
  if (antes.conductor.estadoVerificacion !== 'verificado' && despues.conductor.estadoVerificacion === 'verificado') {
    avisar('¡Listo! Tus 4 documentos están aprobados.', 'exito');
    return;
  }
  for (const t of TIPOS_DOC_ORDEN) {
    const a = antes.documentos[t];
    const d = despues.documentos[t];
    if (a?.estado !== 'en_revision' || !d) continue;
    if (d.estado === 'aprobado') avisar(APROBADO[t], 'exito');
    else if (d.estado === 'rechazado') avisar(NO_APROBADO[t], 'error');
  }
}

/** Empieza a mirar lo que llega de otras pestañas. Devuelve una función para dejar de mirar. */
export function iniciarAvisosEntrePestanas(): () => void {
  let antes: DatosDemo | null = null;
  // La primera lectura (al abrir la página) no es un cambio: solo se compara desde la segunda.
  let primeraLista = useDemo.persist.hasHydrated();
  const quitarInicio = useDemo.persist.onHydrate((s) => {
    antes = primeraLista ? (s as DatosDemo) : null;
  });
  const quitarFin = useDemo.persist.onFinishHydration((s) => {
    if (antes) avisarCambios(antes, s as DatosDemo);
    antes = null;
    primeraLista = true;
  });
  return () => {
    quitarInicio();
    quitarFin();
  };
}

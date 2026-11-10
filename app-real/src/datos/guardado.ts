// Guardar una pantalla con el perfil al día. Los planes de escritura (./escrituras.ts) comparan lo que
// marcó la persona con lo que la app leyó de la base. Si un guardado falla a mitad de camino, parte del
// plan pudo quedar hecho (por ejemplo, se borró un negocio y después se cortó la red), y lo leído ya no
// es lo que hay en la base: el siguiente guardado vuelve a leer ANTES de armar su plan. Si el plan sale
// bien pero no se puede volver a leer, se dice que se guardó (y el próximo intento lee primero).
// Sin React ni Supabase: lo prueba tests/guardado.test.ts.
import { TEXTO } from './errores.ts';
import type { Plan, ResultadoPlan } from './escrituras.ts';

export interface DependenciasGuardado {
  /** ¿Lo leído sigue siendo lo que hay en la base? */
  alDia: () => boolean;
  marcarDesactualizado: () => void;
  /** Vuelve a leer el perfil propio; si sale bien, queda al día. */
  releer: () => Promise<ResultadoPlan>;
  ejecutar: (plan: Plan) => Promise<ResultadoPlan>;
}

/** `armar` se llama recién con el perfil al día (lee el estado en ese momento). */
export async function guardarAlDia(d: DependenciasGuardado, armar: () => Plan): Promise<ResultadoPlan> {
  if (!d.alDia()) {
    const antes = await d.releer();
    if (!antes.ok) return antes;
  }
  const r = await d.ejecutar(armar());
  if (!r.ok) {
    d.marcarDesactualizado();
    return r;
  }
  const despues = await d.releer();
  if (!despues.ok) {
    d.marcarDesactualizado();
    return 'vencida' in despues ? despues : { ok: false, error: TEXTO.guardadoSinReleer };
  }
  return { ok: true, valor: undefined };
}

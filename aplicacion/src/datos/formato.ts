// Formatos de texto en español de Chile (fechas, días, turnos, nombres).
import type { Dia, Turno } from './tipos';

const ORDEN_DIAS: Dia[] = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];
const CORTO: Record<Dia, string> = { lu: 'Lu', ma: 'Ma', mi: 'Mi', ju: 'Ju', vi: 'Vi', sa: 'Sá', do: 'Do' };
const LARGO: Record<Dia, string> = {
  lu: 'Lunes',
  ma: 'Martes',
  mi: 'Miércoles',
  ju: 'Jueves',
  vi: 'Viernes',
  sa: 'Sábado',
  do: 'Domingo',
};

export const nombreDia = (d: Dia) => LARGO[d];
export const cortoDia = (d: Dia) => CORTO[d];

/** "Lu a Sá", "Todos los días", "Sá y Do", "Lu, Mi y Vi", "Sin días". */
export function textoDias(dias: Dia[]): string {
  const orden = ORDEN_DIAS.filter((d) => dias.includes(d));
  if (orden.length === 0) return 'Sin días';
  if (orden.length === 7) return 'Todos los días';
  const indices = orden.map((d) => ORDEN_DIAS.indexOf(d));
  const seguidos = indices.every((v, i) => i === 0 || v === indices[i - 1] + 1);
  if (seguidos && orden.length >= 3) return `${CORTO[orden[0]]} a ${CORTO[orden[orden.length - 1]]}`;
  const cortos = orden.map((d) => CORTO[d]);
  if (cortos.length === 1) return cortos[0];
  return `${cortos.slice(0, -1).join(', ')} y ${cortos[cortos.length - 1]}`;
}

/** "Día", "Noche", "Día y noche". */
export function textoTurnos(turnos: Turno[]): string {
  const dia = turnos.includes('dia');
  const noche = turnos.includes('noche');
  if (dia && noche) return 'Día y noche';
  if (dia) return 'Día';
  if (noche) return 'Noche';
  return 'Sin turno';
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const dos = (n: number) => String(n).padStart(2, '0');

/** dd/mm/aaaa */
export function fechaLarga(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** dd/mm */
export function fechaCorta(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}`;
}

/** "4 nov" */
export function fechaConMes(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

/** HH:MM */
export function hora(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Para listas de mensajes: hora si es de hoy, "Ayer" o dd/mm. */
export function cuandoCorto(iso: string | null | undefined, ahora = Date.now()): string {
  if (!iso) return '';
  const d = new Date(iso);
  const hoy = new Date(ahora);
  const mismoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (mismoDia(d, hoy)) return hora(iso);
  const ayer = new Date(ahora - 24 * 60 * 60 * 1000);
  if (mismoDia(d, ayer)) return 'Ayer';
  return fechaCorta(iso);
}

/** "hace 5 min", "hace 2 h", "hace 3 días". */
export function haceCuanto(iso: string | null | undefined, ahora = Date.now()): string {
  if (!iso) return '';
  const seg = Math.max(0, Math.round((ahora - new Date(iso).getTime()) / 1000));
  if (seg < 60) return 'recién';
  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.round(h / 24);
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}

/** Días que faltan hasta una fecha (negativo si ya pasó). */
export function diasHasta(iso: string | null | undefined, ahora = Date.now()): number {
  if (!iso) return 0;
  return Math.ceil((new Date(iso).getTime() - ahora) / (24 * 60 * 60 * 1000));
}

/** Edad a partir de 'dd/mm/aaaa'. null si la fecha no es válida. */
export function edad(fechaNacimiento: string, ahora = Date.now()): number | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fechaNacimiento.trim());
  if (!m) return null;
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const hoy = new Date(ahora);
  let e = hoy.getFullYear() - a;
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < d)) e -= 1;
  return e >= 0 && e < 120 ? e : null;
}

/** Pone barras mientras se escribe una fecha: "1403198" → "14/03/198". */
export function mascaraFecha(texto: string): string {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

/** Formatea los 8 dígitos del celular: "55550123" → "5555 0123". */
export function mascaraCelular(texto: string): string {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  return n.length > 4 ? `${n.slice(0, 4)} ${n.slice(4)}` : n;
}

/** "+56 9 5555 0123" */
export function celularCompleto(celular: string): string {
  const limpio = mascaraCelular(celular);
  return limpio ? `+56 9 ${limpio}` : '+56 9';
}

/** Iniciales para avatares: "Transportes Los Aromos SpA" → "TL"; "Daniel" → "D". */
export function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/\([^)]*\)/g, '') // "Tú (demo)" → "Tú"
    .replace(/\b(SpA|Ltda\.?|S\.A\.)\b/gi, '')
    .trim()
    .split(/\s+/)
    .filter((p) => /^\p{L}/u.test(p));
  if (partes.length === 0) return '?';
  if (partes.length === 1 && partes[0].toLowerCase() === 'tú') return 'TÚ';
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
}

/** "$28.000" */
export function pesos(n: number): string {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Pluraliza: plural(3, 'match', 'matches') → "3 matches". */
export function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

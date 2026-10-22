/**
 * Datas do dia a dia da EBD, sempre como `YYYY-MM-DD` (a forma da API) e
 * sempre na hora local — nunca `toISOString()`, que muda o dia à meia-noite.
 */

export const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
] as const;

export const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;

const pad = (n: number): string => String(n).padStart(2, '0');

export function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIso(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): string {
  return toIso(new Date());
}

/** "domingo, 18 de outubro de 2026" */
export function formatLong(value: string): string {
  const d = parseIso(value);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "18/10" */
export function formatShort(value: string): string {
  const d = parseIso(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** "18/10/2026" */
export function formatDate(value: string): string {
  const d = parseIso(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('pt-PT') + text.slice(1);
}

/** Segunda a domingo da semana desse dia. */
export function weekOf(value: string): { from: string; to: string } {
  const d = parseIso(value);
  const sinceMonday = (d.getDay() + 6) % 7;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - sinceMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  return { from: toIso(monday), to: toIso(sunday) };
}

/** Primeiro e último dia do mês `YYYY-MM`. */
export function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(last)}` };
}

/** Idade em anos completos nesse dia. */
export function ageOn(birth: string | null, on: string = today()): number | null {
  if (!birth) {
    return null;
  }
  const b = parseIso(birth);
  const r = parseIso(on);
  let age = r.getFullYear() - b.getFullYear();
  if (r.getMonth() < b.getMonth() || (r.getMonth() === b.getMonth() && r.getDate() < b.getDate())) {
    age--;
  }
  return age;
}

/** "8 anos", "1 ano" */
export function ageLabel(birth: string | null): string {
  const age = ageOn(birth);
  if (age === null) {
    return 'idade por preencher';
  }
  return age === 1 ? '1 ano' : `${age} anos`;
}

/** "Ana Silva" → "AS" */
export function initials(first: string | null, last: string | null): string {
  return ((first ?? '?').charAt(0) + (last ?? '').charAt(0)).toLocaleUpperCase('pt-PT');
}

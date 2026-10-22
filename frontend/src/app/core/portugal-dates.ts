import { toIso } from './dates';

/** A date the app knows on its own, every year. Not stored in the database. */
export interface StandardDate {
  key: string;
  date: string;
  title: string;
  note: string;
}

/** Easter Sunday (Gregorian, "Anonymous" algorithm — Meeus/Jones/Butcher). */
export function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** First Sunday of May — Dia da Mãe in Portugal. */
function firstSundayOfMay(year: number): Date {
  const d = new Date(year, 4, 1);
  d.setDate(1 + ((7 - d.getDay()) % 7));
  return d;
}

/** The fixed and moveable dates of the Portuguese calendar the EBD marks. */
export function standardDates(year: number): StandardDate[] {
  const goodFriday = easter(year);
  goodFriday.setDate(goodFriday.getDate() - 2);
  return [
    { key: 'ano-novo', date: `${year}-01-01`, title: 'Ano Novo', note: '1 de janeiro' },
    { key: 'dia-do-pai', date: `${year}-03-19`, title: 'Dia do Pai', note: '19 de março, dia de São José' },
    { key: 'sexta-santa', date: toIso(goodFriday), title: 'Sexta-feira Santa', note: 'Muda todos os anos (dois dias antes da Páscoa)' },
    { key: 'dia-da-mae', date: toIso(firstSundayOfMay(year)), title: 'Dia da Mãe', note: '1.º domingo de maio' },
    { key: 'natal', date: `${year}-12-25`, title: 'Natal', note: '25 de dezembro' }
  ].sort((x, y) => x.date.localeCompare(y.date));
}

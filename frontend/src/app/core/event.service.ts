import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, of } from 'rxjs';
import { parseIso, today } from './dates';
import { standardDates } from './portugal-dates';

/* ------------------------------------------------------------------ domain */

export interface AppEvent {
  id: number | null;
  title: string;
  date: string;
  /** `HH:mm`, optional. */
  time: string | null;
  place: string | null;
  description: string | null;
}

/** What the Eventos page and the dashboard show: saved events plus the standard dates. */
export interface CalendarItem {
  key: string;
  date: string;
  title: string;
  time: string | null;
  place: string | null;
  description: string | null;
  standard: boolean;
  event: AppEvent | null;
}

/* -------------------------------------------------------------- wire shape */

interface EventPayload {
  id: number | null;
  titulo: string;
  data: string;
  hora: string | null;
  local: string | null;
  descricao: string | null;
}

const toEvent = (p: EventPayload): AppEvent => ({
  id: p.id,
  title: p.titulo,
  date: p.data,
  time: p.hora ? p.hora.slice(0, 5) : null,
  place: p.local,
  description: p.descricao
});

const toPayload = (e: AppEvent): EventPayload => ({
  id: e.id,
  titulo: e.title.trim(),
  data: e.date,
  hora: e.time || null,
  local: e.place?.trim() || null,
  descricao: e.description?.trim() || null
});

/* ----------------------------------------------------------------- service */

const API = '/api/eventos';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private http: HttpClient) {}

  list(from: string, to: string) {
    return this.http.get<EventPayload[]>(API, { params: { de: from, ate: to } }).pipe(map((l) => l.map(toEvent)));
  }

  create(e: AppEvent) {
    return this.http.post<EventPayload>(API, toPayload(e)).pipe(map(toEvent));
  }

  update(e: AppEvent) {
    return this.http.put<EventPayload>(`${API}/${e.id}`, toPayload(e)).pipe(map(toEvent));
  }

  remove(id: number) {
    return this.http.delete<void>(`${API}/${id}`);
  }

  /** Saved events and standard dates between two days, in date order. */
  calendar(from: string, to: string) {
    const years: number[] = [];
    for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) years.push(y);
    const standard: CalendarItem[] = years
      .flatMap(standardDates)
      .filter((d) => d.date >= from && d.date <= to)
      .map((d) => ({ key: `${d.key}-${d.date}`, date: d.date, title: d.title, time: null, place: null, description: d.note, standard: true, event: null }));
    return forkJoin({ saved: this.list(from, to), standard: of(standard) }).pipe(
      map(({ saved, standard }) =>
        [
          ...standard,
          ...saved.map((e): CalendarItem => ({
            key: `e${e.id}`,
            date: e.date,
            title: e.title,
            time: e.time,
            place: e.place,
            description: e.description,
            standard: false,
            event: e
          }))
        ].sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
      )
    );
  }
}

/** Days between today and `date` (negative = already passed). */
export function daysUntil(date: string, from: string = today()): number {
  return Math.round((parseIso(date).getTime() - parseIso(from).getTime()) / 86_400_000);
}

export function untilLabel(days: number): string {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days > 1) return `Daqui a ${days} dias`;
  return days === -1 ? 'Foi ontem' : `Foi há ${-days} dias`;
}


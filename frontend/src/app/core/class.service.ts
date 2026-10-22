import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/* ------------------------------------------------------------------ domain */

export interface SchoolClass {
  id: number;
  name: string;
  order: number;
  lastTeachers: string | null;
  studentCount: number;
  /** Whole years. Empty max = no upper limit (e.g. "+7"). */
  minAge: number | null;
  maxAge: number | null;
}

/* -------------------------------------------------------------- wire shape */

interface ClassPayload {
  id: number;
  nome: string;
  ordem: number;
  ultimasProfessoras: string | null;
  totalAlunos: number;
  idadeMinima: number | null;
  idadeMaxima: number | null;
}

export const toSchoolClass = (p: ClassPayload): SchoolClass => ({
  id: p.id,
  name: p.nome,
  order: p.ordem,
  lastTeachers: p.ultimasProfessoras,
  studentCount: p.totalAlunos,
  minAge: p.idadeMinima ?? null,
  maxAge: p.idadeMaxima ?? null
});

export interface ClassTemplate {
  name: string;
  minAge: number;
  maxAge: number;
  /** Earlier names of the same class, so an existing one is recognised. */
  aliases?: string[];
}

/** As turmas da EBD da AD Santarém, pela ordem em que aparecem na app. */
export const SUGGESTED_CLASSES: ClassTemplate[] = [
  { name: 'Berçário (0–2 anos)', minAge: 0, maxAge: 2 },
  { name: 'Formiguinhas (3–5 anos)', minAge: 3, maxAge: 5 },
  { name: 'Fantásticos (6–9 anos)', minAge: 6, maxAge: 9 },
  { name: 'Tás com Deus (10–14 anos)', minAge: 10, maxAge: 14 },
  { name: 'EBD Tarde (3–6 anos)', minAge: 3, maxAge: 6 },
  { name: 'EBD Tarde (7–14 anos)', minAge: 7, maxAge: 14, aliases: ['EBD Tarde (+7 anos)'] }
];

/** "3–5 anos", "+7 anos", "até 2 anos", or '' when the class has no ages. */
export function ageRangeLabel(c: Pick<SchoolClass, 'minAge' | 'maxAge'>): string {
  const { minAge: min, maxAge: max } = c;
  if (min === null && max === null) return '';
  if (max === null) return `+${min} anos`;
  if (min === null || min === 0) return `até ${max} anos`;
  return `${min}–${max} anos`;
}

/* ----------------------------------------------------------------- service */

const API = '/api/turmas';

@Injectable({ providedIn: 'root' })
export class ClassService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<ClassPayload[]>(API).pipe(map((list) => list.map(toSchoolClass)));
  }

  create(name: string, minAge: number | null = null, maxAge: number | null = null) {
    return this.http
      .post<ClassPayload>(API, { nome: name, idadeMinima: minAge, idadeMaxima: maxAge })
      .pipe(map(toSchoolClass));
  }

  update(id: number, name: string, minAge: number | null, maxAge: number | null) {
    return this.http
      .put<ClassPayload>(`${API}/${id}`, { nome: name, idadeMinima: minAge, idadeMaxima: maxAge })
      .pipe(map(toSchoolClass));
  }

  remove(id: number) {
    return this.http.delete<void>(`${API}/${id}`);
  }
}

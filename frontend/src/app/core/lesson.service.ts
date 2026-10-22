import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/* ------------------------------------------------------------------ domain */

/** One tap marks both: present, or present with the Bible. */
export type Attendance = 'present' | 'bible';

export interface Lesson {
  classId: number;
  date: string;
  teachers: string | null;
  topic: string | null;
  /** student id → attendance. Absent students are not listed. */
  attendance: Record<number, Attendance>;
  present: number;
  withBible: number;
}

/* -------------------------------------------------------------- wire shape */

interface LessonPayload {
  turmaId: number;
  data: string;
  professoras: string | null;
  licao: string | null;
  presencas: Record<string, 'PRESENTE' | 'COM_BIBLIA'>;
  presentes: number;
  comBiblia: number;
}

export function toLesson(p: LessonPayload): Lesson {
  const attendance: Record<number, Attendance> = {};
  Object.entries(p.presencas ?? {}).forEach(([id, state]) => {
    attendance[Number(id)] = state === 'COM_BIBLIA' ? 'bible' : 'present';
  });
  return {
    classId: p.turmaId,
    date: p.data,
    teachers: p.professoras,
    topic: p.licao,
    attendance,
    present: p.presentes,
    withBible: p.comBiblia
  };
}

const WIRE_STATE: Record<Attendance, 'PRESENTE' | 'COM_BIBLIA'> = { present: 'PRESENTE', bible: 'COM_BIBLIA' };

/* ----------------------------------------------------------------- service */

const API = '/api/aulas';

@Injectable({ providedIn: 'root' })
export class LessonService {
  constructor(private http: HttpClient) {}

  get(classId: number, date: string) {
    return this.http
      .get<LessonPayload>(API, { params: { turmaId: String(classId), data: date } })
      .pipe(map(toLesson));
  }

  saveDetails(classId: number, date: string, teachers: string, topic: string) {
    return this.http
      .put<LessonPayload>(`${API}/dados`, { turmaId: classId, data: date, professoras: teachers, licao: topic })
      .pipe(map(toLesson));
  }

  /** Tapping the button that is already on clears it; the other one switches. */
  mark(classId: number, date: string, studentId: number, state: Attendance) {
    return this.http
      .post<LessonPayload>(`${API}/presencas`, {
        turmaId: classId,
        data: date,
        alunoId: studentId,
        estado: WIRE_STATE[state]
      })
      .pipe(map(toLesson));
  }
}

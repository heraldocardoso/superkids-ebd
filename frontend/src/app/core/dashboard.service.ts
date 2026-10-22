import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/* ------------------------------------------------------------------ domain */

export interface DayAttendance {
  date: string;
  present: number;
  withBible: number;
}

export interface ClassAttendance {
  classId: number;
  className: string;
  present: number;
  withBible: number;
  total: number;
}

export interface Birthday {
  studentId: number;
  name: string;
  classId: number | null;
  className: string;
  date: string;
  turning: number;
  guardianContact: string | null;
  hasPhoto: boolean;
}

export interface StudentSummary {
  id: number;
  name: string;
  className: string;
  hasPhoto: boolean;
}

export interface Dashboard {
  selectedDay: string | null;
  daysWithRollCall: string[];
  attendance: DayAttendance[];
  byClass: ClassAttendance[];
  weekBirthdays: Birthday[];
  weekStart: string;
  weekEnd: string;
  enrolled: number;
  incompleteForms: number;
  pendingConsents: number;
  biblesAtHome: { yes: number; no: number; unknown: number };
  withoutBible: StudentSummary[];
}

/* -------------------------------------------------------------- wire shape */

interface BirthdayPayload {
  alunoId: number;
  nome: string;
  turmaId: number | null;
  turma: string;
  dia: string;
  fazAnos: number;
  contactoEncarregado: string | null;
  temFoto: boolean;
}

interface DashboardPayload {
  diaSelecionado: string | null;
  datasComChamada: string[];
  frequencia: { data: string; presentes: number; comBiblia: number }[];
  porTurma: { turmaId: number; turma: string; presentes: number; comBiblia: number; totalAlunos: number }[];
  aniversariantesSemana: BirthdayPayload[];
  inicioSemana: string;
  fimSemana: string;
  alunosInscritos: number;
  fichasIncompletas: number;
  autorizacoesPorRecolher: number;
  bibliaEmCasa: { tem: number; naoTem: number; porSaber: number };
  semBiblia: { id: number; nome: string; turma: string; temFoto: boolean }[];
}

export const toBirthday = (b: BirthdayPayload): Birthday => ({
  studentId: b.alunoId,
  name: b.nome,
  classId: b.turmaId,
  className: b.turma,
  date: b.dia,
  turning: b.fazAnos,
  guardianContact: b.contactoEncarregado,
  hasPhoto: b.temFoto
});

export function toDashboard(p: DashboardPayload): Dashboard {
  return {
    selectedDay: p.diaSelecionado,
    daysWithRollCall: p.datasComChamada,
    attendance: p.frequencia.map((f) => ({ date: f.data, present: f.presentes, withBible: f.comBiblia })),
    byClass: p.porTurma.map((t) => ({
      classId: t.turmaId,
      className: t.turma,
      present: t.presentes,
      withBible: t.comBiblia,
      total: t.totalAlunos
    })),
    weekBirthdays: p.aniversariantesSemana.map(toBirthday),
    weekStart: p.inicioSemana,
    weekEnd: p.fimSemana,
    enrolled: p.alunosInscritos,
    incompleteForms: p.fichasIncompletas,
    pendingConsents: p.autorizacoesPorRecolher,
    biblesAtHome: { yes: p.bibliaEmCasa.tem, no: p.bibliaEmCasa.naoTem, unknown: p.bibliaEmCasa.porSaber },
    withoutBible: p.semBiblia.map((s) => ({ id: s.id, name: s.nome, className: s.turma, hasPhoto: s.temFoto }))
  };
}

/* ----------------------------------------------------------------- service */

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  get(day?: string | null) {
    const params: Record<string, string> = day ? { dia: day } : {};
    return this.http.get<DashboardPayload>('/api/painel', { params }).pipe(map(toDashboard));
  }

  birthdays(from: string, to: string, classId?: number | null) {
    const params: Record<string, string> = { de: from, ate: to };
    if (classId) {
      params['turmaId'] = String(classId);
    }
    return this.http
      .get<BirthdayPayload[]>('/api/relatorios/aniversariantes', { params })
      .pipe(map((list) => list.map(toBirthday)));
  }
}

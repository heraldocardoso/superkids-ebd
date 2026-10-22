import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/* ===================================================================== domain */

export type Literacy = 'yes' | 'no' | 'learning';
export type GuardianType = 'mother' | 'father' | 'both' | 'other';
export type ConsentStatus = 'pending' | 'signed' | 'refused';
export type ConsentMethod = 'paper' | 'online' | 'app';
export type AttachmentKind = 'photo' | 'receipt' | 'signature';

export interface Parent {
  name: string | null;
  contact: string | null;
  instagram: string | null;
  notApplicable: boolean;
}

export interface OtherGuardian {
  name: string | null;
  relation: string | null;
  contact: string | null;
}

/** `null` = question not answered yet. */
export interface Health {
  dietaryRestriction: boolean | null;
  dietaryDetail: string | null;
  allergy: boolean | null;
  allergyDetail: string | null;
  medication: boolean | null;
  medicationDetail: string | null;
  specialNeeds: boolean | null;
  specialNeedsDetail: string | null;
  autism: boolean | null;
}

export interface Family {
  livesWithParents: boolean | null;
  motherChristian: boolean;
  fatherChristian: boolean;
  religion: string | null;
  schoolNotice: boolean | null;
  schoolNoticeReason: string | null;
  siblings: boolean | null;
  siblingsDetail: string | null;
  notes: string | null;
}

/** RGPD consent from the guardian. `health` and `photo` are authorizations 2 and 3. */
export interface Consent {
  status: ConsentStatus;
  method: ConsentMethod | null;
  date: string | null;
  time: string | null;
  signedBy: string | null;
  relation: string | null;
  email: string | null;
  health: boolean;
  photo: boolean;
  textVersion: string | null;
}

export interface Student {
  id: number | null;
  classId: number | null;
  /** Optional second class the child also attends (e.g. the afternoon EBD). */
  secondClassId: number | null;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  address: string | null;
  literate: Literacy | null;
  hasBible: boolean | null;
  mother: Parent;
  father: Parent;
  guardian: GuardianType | null;
  otherGuardian: OtherGuardian;
  health: Health;
  family: Family;
  consent: Consent;
  hasPhoto: boolean;
  hasReceipt: boolean;
  hasSignature: boolean;
  origin: 'form' | 'rollCall';
  missingFields: string[];
}

export const emptyParent = (): Parent => ({ name: null, contact: null, instagram: null, notApplicable: false });

export const emptyHealth = (): Health => ({
  dietaryRestriction: null,
  dietaryDetail: null,
  allergy: null,
  allergyDetail: null,
  medication: null,
  medicationDetail: null,
  specialNeeds: null,
  specialNeedsDetail: null,
  autism: null
});

export const emptyConsent = (): Consent => ({
  status: 'pending',
  method: null,
  date: null,
  time: null,
  signedBy: null,
  relation: null,
  email: null,
  health: false,
  photo: false,
  textVersion: null
});

export function emptyStudent(classId: number | null = null): Student {
  return {
    id: null,
    classId,
    secondClassId: null,
    firstName: '',
    lastName: '',
    birthDate: null,
    address: null,
    literate: null,
    hasBible: null,
    mother: emptyParent(),
    father: emptyParent(),
    guardian: null,
    otherGuardian: { name: null, relation: null, contact: null },
    health: emptyHealth(),
    family: {
      livesWithParents: null,
      motherChristian: false,
      fatherChristian: false,
      religion: null,
      schoolNotice: null,
      schoolNoticeReason: null,
      siblings: null,
      siblingsDetail: null,
      notes: null
    },
    consent: emptyConsent(),
    hasPhoto: false,
    hasReceipt: false,
    hasSignature: false,
    origin: 'form',
    missingFields: []
  };
}

export function fullName(s: Pick<Student, 'firstName' | 'lastName'>): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || 'Sem nome';
}

/** The guardian's phone, whoever the guardian is. */
export function guardianContact(s: Student): string | null {
  switch (s.guardian) {
    case 'mother':
      return s.mother.contact;
    case 'father':
      return s.father.contact;
    case 'both':
      return [s.mother.contact, s.father.contact].filter(Boolean).join(' / ') || null;
    case 'other':
      return s.otherGuardian.contact;
    default:
      return null;
  }
}

/** What the API would list as missing, computed locally while the form is being filled. */
export function missingFields(s: Student): string[] {
  const missing: string[] = [];
  if (!s.firstName?.trim()) missing.push('nome');
  if (!s.lastName?.trim()) missing.push('apelido');
  if (!s.birthDate) missing.push('data de nascimento');
  if (!(s.mother.notApplicable || s.mother.name?.trim())) missing.push('mãe');
  if (!(s.father.notApplicable || s.father.name?.trim())) missing.push('pai');
  if (!s.guardian || (s.guardian === 'other' && !s.otherGuardian.name?.trim())) {
    missing.push('encarregado de educação');
  }
  return missing;
}

/* ================================================================ wire shape
   The API speaks Portuguese. Only this block knows it. */

const LITERACY = { yes: 'SIM', no: 'NAO', learning: 'EM_PROGRESSO' } as const;
const GUARDIAN = { mother: 'MAE', father: 'PAI', both: 'AMBOS', other: 'OUTRO' } as const;
const STATUS = { pending: 'POR_RECOLHER', signed: 'ASSINADA', refused: 'RECUSADA' } as const;
const METHOD = { paper: 'PAPEL', online: 'FORMULARIO_ONLINE', app: 'APP' } as const;
export const ATTACHMENT_PATH: Record<AttachmentKind, string> = {
  photo: 'foto',
  receipt: 'comprovativo',
  signature: 'assinatura'
};

function invert<K extends string, V extends string>(o: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k])) as Record<V, K>;
}
const LITERACY_IN = invert(LITERACY);
const GUARDIAN_IN = invert(GUARDIAN);
const STATUS_IN = invert(STATUS);
const METHOD_IN = invert(METHOD);

interface ParentPayload {
  nome: string | null;
  contacto: string | null;
  instagram: string | null;
  naoAplicavel: boolean;
}

export interface StudentPayload {
  id: number | null;
  turmaId: number | null;
  segundaTurmaId?: number | null;
  nome: string;
  apelido: string;
  dataNascimento: string | null;
  morada: string | null;
  alfabetizado: string | null;
  temBiblia: boolean | null;
  mae: ParentPayload | null;
  pai: ParentPayload | null;
  encarregado: string | null;
  outroEncarregado: { nome: string | null; parentesco: string | null; contacto: string | null } | null;
  saude: {
    restricaoAlimentar: boolean | null;
    restricaoQual: string | null;
    alergia: boolean | null;
    alergiaQual: string | null;
    medicacao: boolean | null;
    medicacaoQual: string | null;
    necessidadesEspeciais: boolean | null;
    necessidadesDescricao: string | null;
    autismo: boolean | null;
  } | null;
  familia: {
    moraComPais: boolean | null;
    maeCrista: boolean;
    paiCristao: boolean;
    religiao: string | null;
    notificacaoEscola: boolean | null;
    notificacaoMotivo: string | null;
    irmaos: boolean | null;
    irmaosDescricao: string | null;
    notas: string | null;
  } | null;
  autorizacao: {
    estado: string | null;
    forma: string | null;
    data: string | null;
    hora: string | null;
    assinadaPor: string | null;
    relacao: string | null;
    email: string | null;
    saude: boolean;
    foto: boolean;
    versaoTexto: string | null;
  } | null;
  temFoto?: boolean;
  temComprovativo?: boolean;
  temAssinatura?: boolean;
  origem?: string;
  camposEmFalta?: string[];
}

const blank = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

const toParent = (p: ParentPayload | null): Parent =>
  p ? { name: p.nome, contact: p.contacto, instagram: p.instagram, notApplicable: p.naoAplicavel } : emptyParent();

const toParentPayload = (p: Parent): ParentPayload => ({
  nome: blank(p.name),
  contacto: blank(p.contact),
  instagram: blank(p.instagram),
  naoAplicavel: p.notApplicable
});

export function toStudent(p: StudentPayload): Student {
  const base = emptyStudent(p.turmaId);
  const s = p.saude;
  const f = p.familia;
  const a = p.autorizacao;
  return {
    ...base,
    id: p.id,
    secondClassId: p.segundaTurmaId ?? null,
    firstName: p.nome ?? '',
    lastName: p.apelido ?? '',
    birthDate: p.dataNascimento,
    address: p.morada,
    literate: p.alfabetizado ? LITERACY_IN[p.alfabetizado as keyof typeof LITERACY_IN] ?? null : null,
    hasBible: p.temBiblia,
    mother: toParent(p.mae),
    father: toParent(p.pai),
    guardian: p.encarregado ? GUARDIAN_IN[p.encarregado as keyof typeof GUARDIAN_IN] ?? null : null,
    otherGuardian: {
      name: p.outroEncarregado?.nome ?? null,
      relation: p.outroEncarregado?.parentesco ?? null,
      contact: p.outroEncarregado?.contacto ?? null
    },
    health: s
      ? {
          dietaryRestriction: s.restricaoAlimentar,
          dietaryDetail: s.restricaoQual,
          allergy: s.alergia,
          allergyDetail: s.alergiaQual,
          medication: s.medicacao,
          medicationDetail: s.medicacaoQual,
          specialNeeds: s.necessidadesEspeciais,
          specialNeedsDetail: s.necessidadesDescricao,
          autism: s.autismo
        }
      : emptyHealth(),
    family: f
      ? {
          livesWithParents: f.moraComPais,
          motherChristian: f.maeCrista,
          fatherChristian: f.paiCristao,
          religion: f.religiao,
          schoolNotice: f.notificacaoEscola,
          schoolNoticeReason: f.notificacaoMotivo,
          siblings: f.irmaos,
          siblingsDetail: f.irmaosDescricao,
          notes: f.notas
        }
      : base.family,
    consent: a
      ? {
          status: (a.estado && STATUS_IN[a.estado as keyof typeof STATUS_IN]) || 'pending',
          method: a.forma ? METHOD_IN[a.forma as keyof typeof METHOD_IN] ?? null : null,
          date: a.data,
          time: a.hora ? a.hora.slice(0, 5) : null,
          signedBy: a.assinadaPor,
          relation: a.relacao,
          email: a.email,
          health: a.saude,
          photo: a.foto,
          textVersion: a.versaoTexto
        }
      : emptyConsent(),
    hasPhoto: !!p.temFoto,
    hasReceipt: !!p.temComprovativo,
    hasSignature: !!p.temAssinatura,
    origin: p.origem === 'CHAMADA' ? 'rollCall' : 'form',
    missingFields: p.camposEmFalta ?? []
  };
}

export function toStudentPayload(s: Student): StudentPayload {
  const h = s.health;
  const f = s.family;
  const c = s.consent;
  return {
    id: s.id,
    turmaId: s.classId,
    segundaTurmaId: s.secondClassId && s.secondClassId !== s.classId ? s.secondClassId : null,
    nome: s.firstName.trim(),
    apelido: s.lastName.trim(),
    dataNascimento: s.birthDate || null,
    morada: blank(s.address),
    alfabetizado: s.literate ? LITERACY[s.literate] : null,
    temBiblia: s.hasBible,
    mae: toParentPayload(s.mother),
    pai: toParentPayload(s.father),
    encarregado: s.guardian ? GUARDIAN[s.guardian] : null,
    outroEncarregado:
      s.guardian === 'other'
        ? {
            nome: blank(s.otherGuardian.name),
            parentesco: blank(s.otherGuardian.relation),
            contacto: blank(s.otherGuardian.contact)
          }
        : null,
    saude: {
      restricaoAlimentar: h.dietaryRestriction,
      restricaoQual: h.dietaryRestriction ? blank(h.dietaryDetail) : null,
      alergia: h.allergy,
      alergiaQual: h.allergy ? blank(h.allergyDetail) : null,
      medicacao: h.medication,
      medicacaoQual: h.medication ? blank(h.medicationDetail) : null,
      necessidadesEspeciais: h.specialNeeds,
      necessidadesDescricao: h.specialNeeds ? blank(h.specialNeedsDetail) : null,
      autismo: h.autism
    },
    familia: {
      moraComPais: f.livesWithParents,
      maeCrista: f.motherChristian,
      paiCristao: f.fatherChristian,
      religiao: blank(f.religion),
      notificacaoEscola: f.schoolNotice,
      notificacaoMotivo: f.schoolNotice ? blank(f.schoolNoticeReason) : null,
      irmaos: f.siblings,
      irmaosDescricao: f.siblings ? blank(f.siblingsDetail) : null,
      notas: blank(f.notes)
    },
    autorizacao: {
      estado: STATUS[c.status],
      forma: c.status === 'pending' || !c.method ? null : METHOD[c.method],
      data: c.status === 'pending' ? null : c.date,
      hora: c.status === 'pending' || !(c.method === 'app' || c.method === 'online') ? null : c.time,
      assinadaPor: c.status === 'pending' ? null : blank(c.signedBy),
      relacao: c.status === 'pending' ? null : c.relation,
      email: c.method === 'online' ? blank(c.email) : null,
      saude: c.status === 'signed' && c.health,
      foto: c.status === 'signed' && c.photo,
      versaoTexto: c.textVersion
    }
  };
}

/* ================================================================ attendance */

/** One month of a student's attendance: lessons given in their classes vs. lessons attended. */
export interface MonthAttendance {
  month: number;
  lessons: number;
  present: number;
  withBible: number;
}

export interface AttendanceSummary {
  lessons: number;
  present: number;
  withBible: number;
  /** 0–100, or null when no lesson was given in the period. */
  rate: number | null;
}

/** Adds up months `from`..`to` (1–12, inclusive). */
export function summarize(months: MonthAttendance[], from: number, to: number): AttendanceSummary {
  const sel = months.filter((m) => m.month >= from && m.month <= to);
  const lessons = sel.reduce((n, m) => n + m.lessons, 0);
  const present = sel.reduce((n, m) => n + m.present, 0);
  const withBible = sel.reduce((n, m) => n + m.withBible, 0);
  return { lessons, present, withBible, rate: lessons ? Math.round((present / lessons) * 100) : null };
}

interface AttendancePayload {
  ano: number;
  meses: { mes: number; aulas: number; presencas: number; comBiblia: number }[];
}

/* =================================================================== service */

const API = '/api/alunos';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private http: HttpClient) {}

  list(classId?: number) {
    const params: Record<string, string> = classId ? { turmaId: String(classId) } : {};
    return this.http.get<StudentPayload[]>(API, { params }).pipe(map((list) => list.map(toStudent)));
  }

  get(id: number) {
    return this.http.get<StudentPayload>(`${API}/${id}`).pipe(map(toStudent));
  }

  /** Full form from the students menu: every required field must be there. */
  create(student: Student) {
    return this.http.post<StudentPayload>(API, toStudentPayload(student)).pipe(map(toStudent));
  }

  /** Quick add during roll call: name, surname and birth date only; marked present. */
  quickCreate(classId: number, firstName: string, lastName: string | null, birthDate: string | null, lessonDate: string) {
    return this.http
      .post<StudentPayload>(`${API}/rapido`, {
        turmaId: classId,
        nome: firstName,
        apelido: lastName,
        dataNascimento: birthDate,
        dataAula: lessonDate
      })
      .pipe(map(toStudent));
  }

  update(student: Student) {
    return this.http.put<StudentPayload>(`${API}/${student.id}`, toStudentPayload(student)).pipe(map(toStudent));
  }

  remove(id: number) {
    return this.http.delete<void>(`${API}/${id}`);
  }

  uploadAttachment(id: number, kind: AttachmentKind, file: Blob) {
    const form = new FormData();
    form.append('ficheiro', file, `${ATTACHMENT_PATH[kind]}.${file.type === 'image/png' ? 'png' : 'jpg'}`);
    return this.http.post<void>(`${API}/${id}/anexos/${ATTACHMENT_PATH[kind]}`, form);
  }

  /** As a Blob: an <img src> cannot send the Bearer token. */
  getAttachment(id: number, kind: AttachmentKind) {
    return this.http.get(`${API}/${id}/anexos/${ATTACHMENT_PATH[kind]}`, { responseType: 'blob' });
  }

  /** Month by month, for one year. */
  attendance(id: number, year: number) {
    return this.http
      .get<AttendancePayload>(`${API}/${id}/frequencia`, { params: { ano: String(year) } })
      .pipe(
        map((p): MonthAttendance[] =>
          p.meses.map((m) => ({ month: m.mes, lessons: m.aulas, present: m.presencas, withBible: m.comBiblia }))
        )
      );
  }

  removeAttachment(id: number, kind: AttachmentKind) {
    return this.http.delete<void>(`${API}/${id}/anexos/${ATTACHMENT_PATH[kind]}`);
  }
}

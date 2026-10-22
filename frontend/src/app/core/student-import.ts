import { ClassTemplate, SchoolClass, SUGGESTED_CLASSES } from './class.service';
import { fullName, Student } from './student.service';

/** One line of the import file: `turma;nome;apelido;notas`. */
export interface ImportRow {
  line: number;
  className: string;
  firstName: string;
  lastName: string;
  notes: string;
  /** `tambem = sim`: the child already has a class (here or in this file); add this one as the second class. */
  also: boolean;
}

export type ImportStatus = 'new' | 'link' | 'duplicate' | 'noClass' | 'noName' | 'noMatch';

export interface PlannedRow extends ImportRow {
  status: ImportStatus;
  /** Existing class, or the EBD template that will be created for it. */
  target: SchoolClass | ClassTemplate | null;
  /** For 'link': the child already in the app, or the name key of a row created by this same file. */
  linkStudent?: Student;
  linkKey?: string;
  problem?: string;
}

export const nameKey = (first: string, last: string): string => fold(`${first} ${last}`);

export const fold = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/** Excel in Portugal saves CSV with `;`; Google Sheets with `,`. Both work, quotes too. */
export function parseCsv(text: string): ImportRow[] {
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const sep = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const split = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = !quoted;
      } else if (ch === sep && !quoted) {
        out.push(cur);
        cur = '';
      } else cur += ch;
    }
    out.push(cur);
    return out.map((c) => c.trim());
  };

  const header = split(lines[0]).map(fold);
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const hasHeader = col('turma', 'nome') >= 0;
  const idx = hasHeader
    ? {
        cls: col('turma', 'classe'),
        first: col('nome', 'primeiro nome'),
        last: col('apelido', 'sobrenome'),
        notes: col('notas', 'observacoes', 'obs'),
        also: col('tambem', 'tambem frequenta', 'segunda turma')
      }
    : { cls: 0, first: 1, last: 2, notes: 3, also: 4 };

  return lines.slice(hasHeader ? 1 : 0).map((l, i) => {
    const c = split(l);
    const at = (k: number) => (k >= 0 ? (c[k] ?? '') : '');
    return {
      line: i + (hasHeader ? 2 : 1),
      className: at(idx.cls),
      firstName: at(idx.first),
      lastName: at(idx.last),
      notes: at(idx.notes),
      also: ['sim', 's', 'x', 'yes', '1'].includes(fold(at(idx.also)))
    };
  });
}

const templateFor = (name: string): ClassTemplate | null =>
  SUGGESTED_CLASSES.find((t) => [t.name, ...(t.aliases ?? [])].some((n) => fold(n) === fold(name))) ?? null;

/** Matches each row to a class and marks children who are already there. */
export function planImport(rows: ImportRow[], classes: SchoolClass[], students: Student[]): PlannedRow[] {
  const existing = new Set(students.map((s) => `${s.classId}|${fold(fullName(s))}`));
  const byName = new Map<string, Student[]>();
  for (const s of students) byName.set(fold(fullName(s)), [...(byName.get(fold(fullName(s))) ?? []), s]);
  const createdInFile = new Map<string, number>();
  for (const r of rows) if (!r.also && r.firstName) createdInFile.set(nameKey(r.firstName, r.lastName), (createdInFile.get(nameKey(r.firstName, r.lastName)) ?? 0) + 1);

  const seen = new Set<string>();
  return rows.map((r): PlannedRow => {
    const template = templateFor(r.className);
    const names = [r.className, ...(template ? [template.name, ...(template.aliases ?? [])] : [])].map(fold);
    const cls = classes.find((c) => names.includes(fold(c.name))) ?? null;
    const target = cls ?? template;
    if (!r.firstName) return { ...r, status: 'noName', target };
    if (!target) return { ...r, status: 'noClass', target };
    const key = nameKey(r.firstName, r.lastName);

    if (r.also) {
      const inApp = byName.get(key) ?? [];
      const inFile = createdInFile.get(key) ?? 0;
      if (inApp.length + inFile !== 1) {
        return { ...r, status: 'noMatch', target, problem: inApp.length + inFile ? 'há mais do que uma criança com este nome' : 'não encontrada nas outras turmas' };
      }
      const s = inApp[0];
      if (s && cls && (s.classId === cls.id || s.secondClassId === cls.id)) return { ...r, status: 'duplicate', target };
      if (s && s.secondClassId) return { ...r, status: 'noMatch', target, problem: 'já tem uma segunda turma' };
      return { ...r, status: 'link', target, linkStudent: s, linkKey: s ? undefined : key };
    }

    const dupKey = `${cls?.id ?? target.name}|${key}`;
    const dup = (cls && existing.has(`${cls.id}|${key}`)) || seen.has(dupKey);
    seen.add(dupKey);
    return { ...r, status: dup ? 'duplicate' : 'new', target };
  });
}

export const isExistingClass = (t: SchoolClass | ClassTemplate | null): t is SchoolClass => !!t && 'id' in t;

import { SchoolClass } from './class.service';
import { parseCsv, planImport } from './student-import';
import { emptyStudent } from './student.service';

const formiguinhas: SchoolClass = { id: 2, name: 'Formiguinhas (3–5 anos)', order: 1, lastTeachers: null, studentCount: 1, minAge: 3, maxAge: 5 };

describe('student import', () => {
  it('reads the Excel (;) file with header, BOM and quotes', () => {
    const rows = parseCsv('﻿turma;nome;apelido;notas\r\nFormiguinhas (3–5 anos);Bela;;\r\n"Berçário (0–2 anos)";Paulo;Junior;"Na lista: ""Paulo (Junior)"""\r\n');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({ className: 'Berçário (0–2 anos)', firstName: 'Paulo', lastName: 'Junior', notes: 'Na lista: "Paulo (Junior)"' });
  });

  it('reads a comma file too', () => {
    expect(parseCsv('turma,nome\nFantásticos (6–9 anos),Abiel')[0].firstName).toBe('Abiel');
  });

  it('finds the class, skips children already there, and plans missing EBD classes', () => {
    const bela = emptyStudent(2);
    bela.id = 9;
    bela.firstName = 'Bela';
    const plan = planImport(
      parseCsv('turma;nome;apelido\nFormiguinhas (3-5 anos);Bela;\nformiguinhas (3–5 anos);Amanda;\nEBD Tarde (+7 anos);John;\nTurma X;Rui;\nBerçário (0–2 anos);;'),
      [formiguinhas],
      [bela]
    );
    expect(plan.map((p) => p.status)).toEqual(['duplicate', 'new', 'new', 'noClass', 'noName']);
    expect(plan[2].target?.name).toBe('EBD Tarde (7–14 anos)');
  });

  it('links a child who goes morning and afternoon instead of creating a second one', () => {
    const plan = planImport(
      parseCsv('turma;nome;apelido;notas;tambem\nFormiguinhas (3–5 anos);Diana;;;\nEBD Tarde (3–6 anos);Diana;;;sim\nEBD Tarde (3–6 anos);Rui;;;sim'),
      [formiguinhas],
      []
    );
    expect(plan.map((p) => p.status)).toEqual(['new', 'link', 'noMatch']);
    expect(plan[1].linkKey).toBe('diana');
  });
});

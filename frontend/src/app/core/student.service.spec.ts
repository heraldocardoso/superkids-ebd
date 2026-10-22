import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { careItems } from './care';
import {
  emptyStudent,
  guardianContact,
  missingFields,
  StudentService,
  toStudent,
  toStudentPayload
} from './student.service';

const complete = () => {
  const s = emptyStudent(1);
  s.firstName = 'Ana';
  s.lastName = 'Silva';
  s.birthDate = '2018-05-02';
  s.mother.name = 'Maria';
  s.mother.contact = '912000000';
  s.father.notApplicable = true;
  s.guardian = 'mother';
  return s;
};

describe('student model', () => {
  it('lists what the form still needs', () => {
    const s = emptyStudent(1);
    s.firstName = 'Ana';
    s.lastName = 'Silva';
    s.birthDate = '2018-05-02';
    expect(missingFields(s)).toEqual(['mãe', 'pai', 'encarregado de educação']);
    expect(missingFields(complete())).toEqual([]);
  });

  it('asks for the name when the guardian is someone else', () => {
    const s = complete();
    s.guardian = 'other';
    expect(missingFields(s)).toEqual(['encarregado de educação']);
    s.otherGuardian.name = 'Avó Rosa';
    expect(missingFields(s)).toEqual([]);
  });

  it("finds the guardian's phone", () => {
    const s = complete();
    expect(guardianContact(s)).toBe('912000000');
    s.guardian = 'both';
    s.father = { name: 'João', contact: '913000000', instagram: null, notApplicable: false };
    expect(guardianContact(s)).toBe('912000000 / 913000000');
  });

  it('survives the trip to the Portuguese API and back', () => {
    const s = complete();
    s.id = 7;
    s.hasBible = false;
    s.literate = 'learning';
    s.consent.status = 'signed';
    s.consent.method = 'app';
    const back = toStudent(toStudentPayload(s) as never);
    expect(back.firstName).toBe('Ana');
    expect(back.guardian).toBe('mother');
    expect(back.literate).toBe('learning');
    expect(back.consent.status).toBe('signed');
    expect(back.consent.method).toBe('app');
    expect(back.father.notApplicable).toBe(true);
  });

  it('shows a care icon for each thing the teacher must know', () => {
    const s = complete();
    s.hasBible = false;
    s.health.allergy = true;
    s.health.allergyDetail = '  amendoim ';
    expect(careItems(s).map((c) => c.kind)).toEqual(['noBible', 'allergy']);
    expect(careItems(s)[1].detail).toBe('amendoim');
  });
});

describe('StudentService', () => {
  it('sends the quick roll-call add in Portuguese', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(StudentService).quickCreate(3, 'Rui', 'Costa', '2019-01-01', '2026-10-18').subscribe();
    const req = http.expectOne('/api/alunos/rapido');
    expect(req.request.body).toEqual({
      turmaId: 3,
      nome: 'Rui',
      apelido: 'Costa',
      dataNascimento: '2019-01-01',
      dataAula: '2026-10-18'
    });
    http.verify();
  });
});

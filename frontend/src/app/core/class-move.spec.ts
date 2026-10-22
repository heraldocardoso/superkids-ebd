import { ageRangeLabel, SchoolClass } from './class.service';
import { classMove } from './class-move';

const cls = (id: number, order: number, name: string, minAge: number | null, maxAge: number | null): SchoolClass => ({
  id, order, name, minAge, maxAge, lastTeachers: null, studentCount: 0
});

const classes = [
  cls(1, 0, 'Berçário', 0, 2),
  cls(2, 1, 'Formiguinhas', 3, 5),
  cls(3, 2, 'Fantásticos', 6, 9),
  cls(4, 3, 'Tás com Deus', 10, 14),
  cls(5, 4, 'EBD Tarde 3–6', 3, 6),
  cls(6, 5, 'EBD Tarde 7–14', 7, 14)
];

describe('classMove', () => {
  it('warns on the very day the child turns one year over the class maximum', () => {
    const kid = { birthDate: '2020-10-22', classId: 2 };
    expect(classMove(kid, classes, '2026-10-21')).toBeNull();
    const m = classMove(kid, classes, '2026-10-22');
    expect(m?.age).toBe(6);
    expect(m?.suggested?.name).toBe('Fantásticos');
  });

  it('keeps the afternoon children in the afternoon', () => {
    const m = classMove({ birthDate: '2019-01-10', classId: 5 }, classes, '2026-10-22');
    expect(m?.suggested?.name).toBe('EBD Tarde 7–14');
  });

  it('says nothing for a class without ages or a child without birth date', () => {
    const open = [...classes, cls(7, 6, 'Sem idades', null, null)];
    expect(classMove({ birthDate: '2010-01-01', classId: 7 }, open, '2026-10-22')).toBeNull();
    expect(classMove({ birthDate: null, classId: 2 }, classes, '2026-10-22')).toBeNull();
  });

  it('flags the oldest class with no class to go to', () => {
    const m = classMove({ birthDate: '2011-01-01', classId: 4 }, classes, '2026-10-22');
    expect(m?.age).toBe(15);
    expect(m?.suggested).toBeNull();
  });
});

describe('ageRangeLabel', () => {
  it('reads like the church writes it', () => {
    expect(ageRangeLabel({ minAge: 3, maxAge: 5 })).toBe('3–5 anos');
    expect(ageRangeLabel({ minAge: 0, maxAge: 2 })).toBe('até 2 anos');
    expect(ageRangeLabel({ minAge: 7, maxAge: null })).toBe('+7 anos');
    expect(ageRangeLabel({ minAge: null, maxAge: null })).toBe('');
  });
});

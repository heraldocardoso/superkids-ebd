import { ageOn, today } from './dates';
import { SchoolClass } from './class.service';
import { Student } from './student.service';

export interface ClassMove {
  age: number;
  current: SchoolClass;
  /** The next class whose ages fit, or null if none does. */
  suggested: SchoolClass | null;
}

/**
 * The child has outgrown the class: from the day they turn `maxAge + 1`.
 * Only an alert — the leadership decides when the child actually moves.
 */
export function classMove(
  student: Pick<Student, 'birthDate' | 'classId'> & { secondClassId?: number | null },
  classes: SchoolClass[],
  on: string = today()
): ClassMove | null {
  return outgrown(student.birthDate, student.classId, classes, on) ?? outgrown(student.birthDate, student.secondClassId ?? null, classes, on);
}

function outgrown(birthDate: string | null, classId: number | null, classes: SchoolClass[], on: string): ClassMove | null {
  const current = classes.find((c) => c.id === classId);
  const age = ageOn(birthDate, on);
  if (!current || current.maxAge === null || age === null || age <= current.maxAge) return null;

  const fits = (c: SchoolClass) => c.id !== current.id && (c.minAge ?? 0) <= age && (c.maxAge === null || age <= c.maxAge);
  const ordered = [...classes].sort((a, b) => a.order - b.order);
  const after = ordered.filter((c) => c.order > current.order);
  // Prefer the next class in the list (Formiguinhas → Fantásticos, EBD Tarde 3–6 → EBD Tarde 7–14).
  const suggested = after.find(fits) ?? ordered.find(fits) ?? null;
  return { age, current, suggested };
}

export function classMoveLabel(m: ClassMove): string {
  return m.suggested ? `Fez ${m.age} anos · passa para ${m.suggested.name}` : `Fez ${m.age} anos · já passou da idade da turma`;
}

import { emptyStudent } from '../../core/student.service';
import { matches } from './students.component';

describe('students filters', () => {
  it('separates the Bible answers', () => {
    const s = emptyStudent(1);
    expect(matches(s, 'bibleUnknown')).toBe(true);
    s.hasBible = false;
    expect(matches(s, 'noBible')).toBe(true);
    expect(matches(s, 'bibleUnknown')).toBe(false);
  });

  it('flags every consent that is not signed', () => {
    const s = emptyStudent(1);
    expect(matches(s, 'consent')).toBe(true);
    s.consent.status = 'signed';
    expect(matches(s, 'consent')).toBe(false);
  });
});

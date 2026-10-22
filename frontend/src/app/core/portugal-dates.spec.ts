import { easter, standardDates } from './portugal-dates';
import { toIso } from './dates';

describe('Portuguese calendar', () => {
  it('knows when Easter falls', () => {
    expect(toIso(easter(2026))).toBe('2026-04-05');
    expect(toIso(easter(2027))).toBe('2027-03-28');
    expect(toIso(easter(2025))).toBe('2025-04-20');
  });

  it('puts Good Friday, Mother’s and Father’s Day on the Portuguese dates', () => {
    const d = Object.fromEntries(standardDates(2026).map((x) => [x.key, x.date]));
    expect(d['sexta-santa']).toBe('2026-04-03');
    expect(d['dia-da-mae']).toBe('2026-05-03');
    expect(d['dia-do-pai']).toBe('2026-03-19');
    expect(d['natal']).toBe('2026-12-25');
    expect(d['ano-novo']).toBe('2026-01-01');
    expect(Object.fromEntries(standardDates(2027).map((x) => [x.key, x.date]))['dia-da-mae']).toBe('2027-05-02');
  });
});

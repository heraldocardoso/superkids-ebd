import { ageLabel, ageOn, initials, monthRange, weekOf } from './dates';

describe('dates', () => {
  it('gives the Monday-to-Sunday week of any day', () => {
    expect(weekOf('2026-10-21')).toEqual({ from: '2026-10-19', to: '2026-10-25' });
    expect(weekOf('2026-10-25')).toEqual({ from: '2026-10-19', to: '2026-10-25' });
    expect(weekOf('2026-10-19')).toEqual({ from: '2026-10-19', to: '2026-10-25' });
  });

  it('knows how long each month is, February included', () => {
    expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(monthRange('2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
    expect(monthRange('2026-12')).toEqual({ from: '2026-12-01', to: '2026-12-31' });
  });

  it('counts whole years only', () => {
    expect(ageOn('2018-10-22', '2026-10-21')).toBe(7);
    expect(ageOn('2018-10-21', '2026-10-21')).toBe(8);
    expect(ageOn(null)).toBeNull();
    expect(ageLabel(null)).not.toBe('');
  });

  it('builds initials from name and surname', () => {
    expect(initials('Ana', 'Silva')).toBe('AS');
  });
});

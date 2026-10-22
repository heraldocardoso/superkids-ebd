import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DateFieldComponent } from './date-field.component';

describe('DateFieldComponent', () => {
  const create = () => {
    TestBed.configureTestingModule({ imports: [DateFieldComponent], providers: [provideNoopAnimations()] });
    return TestBed.createComponent(DateFieldComponent);
  };

  it('writes the picked day back as an ISO date, without shifting the timezone', () => {
    const c = create().componentInstance;
    c.change(new Date(2026, 9, 25));
    expect(c.value()).toBe('2026-10-25');
    c.change(null);
    expect(c.value()).toBeNull();
  });

  it('keeps only year and month in month view', () => {
    const f = create();
    f.componentRef.setInput('view', 'month');
    f.componentInstance.change(new Date(2026, 1, 1));
    expect(f.componentInstance.value()).toBe('2026-02');
  });

  it('shows the date as dd/mm/aaaa whatever the device language', async () => {
    const f = create();
    f.componentInstance.value.set('2018-05-02');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect((f.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('02/05/2018');
  });
});

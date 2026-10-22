import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { parseIso, toIso } from '../../core/dates';

/**
 * Date field that looks the same on every phone: PrimeNG's calendar with a
 * fixed dd/mm/aaaa format, instead of the browser's own picker (which follows
 * the device language and shows mm/dd/yyyy on a phone set to English).
 * Reads and writes ISO strings (`2026-10-22`, or `2026-10` in month view),
 * the same values the API uses.
 */
@Component({
  selector: 'app-date-field',
  standalone: true,
  imports: [FormsModule, CalendarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <p-calendar
      [ngModel]="asDate()"
      (ngModelChange)="change($event)"
      [view]="view()"
      [dateFormat]="view() === 'month' ? 'MM yy' : 'dd/mm/yy'"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [showIcon]="true"
      iconDisplay="input"
      [showOnFocus]="true"
      [readonlyInput]="view() === 'month'"
      [firstDayOfWeek]="1"
      [disabled]="disabled()"
      [placeholder]="view() === 'month' ? 'mês' : 'dd/mm/aaaa'"
      [inputId]="inputId()"
      appendTo="body"
      styleClass="w-full"
      inputStyleClass="w-full"
      panelStyleClass="ebd-datepicker"
    />
  `
})
export class DateFieldComponent {
  /** ISO value: `YYYY-MM-DD`, or `YYYY-MM` when `view` is 'month'. */
  readonly value = model<string | null>(null);
  readonly view = input<'date' | 'month'>('date');
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly disabled = input(false);
  readonly inputId = input<string | undefined>(undefined);

  readonly asDate = computed(() => toDate(this.value()));
  readonly minDate = computed(() => toDate(this.min()) ?? undefined);
  readonly maxDate = computed(() => toDate(this.max()) ?? undefined);

  change(d: Date | null): void {
    if (!d) {
      this.value.set(null);
      return;
    }
    const iso = toIso(d);
    this.value.set(this.view() === 'month' ? iso.slice(0, 7) : iso);
  }
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  return parseIso(value.length === 7 ? `${value}-01` : value);
}

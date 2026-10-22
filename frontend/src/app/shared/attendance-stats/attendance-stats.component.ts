import { ChangeDetectionStrategy, Component, computed, effect, input, signal, untracked } from '@angular/core';
import { capitalize, MONTHS, today } from '../../core/dates';
import { AttendanceSummary, MonthAttendance, StudentService, summarize } from '../../core/student.service';

interface Tile {
  label: string;
  stats: AttendanceSummary;
}

/**
 * How often the child came, always against the lessons actually given in
 * their classes: the selected month, its semester and the whole year, plus
 * one bar per month. Tap a bar to see that month.
 */
@Component({
  selector: 'app-attendance-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-1">
        <button type="button" class="grid h-8 w-8 place-items-center rounded-full border-0 bg-transparent text-ink-muted hover:text-ink" aria-label="Ano anterior" (click)="changeYear(-1)">
          <i class="pi pi-chevron-left text-xs"></i>
        </button>
        <b class="min-w-[3.5rem] text-center font-heading">{{ year() }}</b>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full border-0 bg-transparent text-ink-muted hover:text-ink disabled:opacity-30"
          aria-label="Ano seguinte"
          [disabled]="year() >= currentYear"
          (click)="changeYear(1)"
        >
          <i class="pi pi-chevron-right text-xs"></i>
        </button>
      </div>

      @if (loading()) {
        <p class="m-0 text-sm text-ink-muted">A carregar…</p>
      } @else if (failed()) {
        <p class="m-0 text-sm text-status-danger">Não foi possível carregar a frequência.</p>
      } @else {
        <div class="grid grid-cols-3 gap-2">
          @for (tile of tiles(); track tile.label) {
            <div class="flex min-w-0 flex-col gap-1 rounded-md border border-border bg-surface-raised p-2.5">
              <span class="text-[0.68rem] font-extrabold uppercase leading-tight tracking-wide text-ink-muted">{{ tile.label }}</span>
              @if (tile.stats.lessons) {
                <span class="font-heading leading-none">
                  <b class="text-2xl font-black" [class]="rateColor(tile.stats.rate)">{{ tile.stats.present }}</b>
                  <span class="text-sm font-bold text-ink-muted">/{{ tile.stats.lessons }}</span>
                </span>
                <span class="text-xs font-bold text-ink-muted">aulas · {{ tile.stats.rate }}%</span>
                <span class="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <span class="block h-full rounded-full" [class]="rateBar(tile.stats.rate)" [style.width.%]="tile.stats.rate"></span>
                </span>
                <span class="truncate text-[0.7rem] font-bold text-accent">{{ tile.stats.withBible }} com Bíblia</span>
              } @else {
                <span class="text-sm text-ink-muted">Sem aulas</span>
              }
            </div>
          }
        </div>

        <div class="flex items-end gap-1 pt-1" role="group" aria-label="Frequência por mês">
          @for (m of months(); track m.month) {
            <button
              type="button"
              class="flex min-w-0 flex-1 flex-col items-center gap-1 border-0 bg-transparent p-0"
              [attr.aria-label]="monthName(m.month) + ': ' + m.present + ' de ' + m.lessons + ' aulas'"
              [title]="monthName(m.month) + ': ' + m.present + ' de ' + m.lessons + ' aulas'"
              (click)="month.set(m.month)"
            >
              <span class="relative flex h-14 w-full items-end overflow-hidden rounded-sm bg-surface-sunken">
                @if (m.lessons) {
                  <span class="block w-full rounded-sm" [class]="rateBar(rate(m))" [style.height.%]="Math.max(rate(m), 4)"></span>
                }
              </span>
              <span class="text-[0.65rem] font-extrabold" [class]="m.month === month() ? 'text-accent' : 'text-ink-muted'">
                {{ monthName(m.month).charAt(0).toUpperCase() }}
              </span>
            </button>
          }
        </div>
        <p class="m-0 text-xs text-ink-muted">
          Cada barra é um mês: quanto mais alta, mais vezes a criança veio (barra cheia = veio a todas as aulas). Conta só as aulas dadas
          nas turmas da criança; as de antes da inscrição não contam como falta. Toque num mês para o ver nos quadros de cima.
        </p>
      }
    </div>
  `
})
export class AttendanceStatsComponent {
  readonly studentId = input.required<number>();

  readonly currentYear = Number(today().slice(0, 4));
  readonly year = signal(this.currentYear);
  readonly month = signal(Number(today().slice(5, 7)));
  readonly months = signal<MonthAttendance[]>([]);
  readonly loading = signal(true);
  readonly failed = signal(false);
  protected readonly Math = Math;

  readonly tiles = computed<Tile[]>(() => {
    const ms = this.months();
    const m = this.month();
    const firstHalf = m <= 6;
    return [
      { label: capitalize(this.monthName(m)), stats: summarize(ms, m, m) },
      { label: firstHalf ? '1.º semestre' : '2.º semestre', stats: firstHalf ? summarize(ms, 1, 6) : summarize(ms, 7, 12) },
      { label: `Ano ${this.year()}`, stats: summarize(ms, 1, 12) }
    ];
  });

  constructor(private students: StudentService) {
    effect(() => {
      const id = this.studentId();
      const y = this.year();
      untracked(() => this.load(id, y));
    });
  }

  private load(id: number, year: number): void {
    this.loading.set(true);
    this.failed.set(false);
    this.students.attendance(id, year).subscribe({
      next: (ms) => {
        this.months.set(ms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.failed.set(true);
      }
    });
  }

  changeYear(delta: number): void {
    const y = this.year() + delta;
    this.year.set(y);
    this.month.set(y === this.currentYear ? Number(today().slice(5, 7)) : 12);
  }

  monthName(m: number): string {
    return MONTHS[m - 1];
  }

  rate(m: MonthAttendance): number {
    return m.lessons ? Math.round((m.present / m.lessons) * 100) : 0;
  }

  /** One colour for everything: green, the colour of "Presente" in the roll call. */
  rateColor(_rate: number | null): string {
    return 'text-status-success';
  }

  rateBar(rate: number | null): string {
    return rate === null ? 'bg-border' : 'bg-status-success';
  }
}

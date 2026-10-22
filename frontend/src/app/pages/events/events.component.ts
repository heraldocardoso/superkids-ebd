import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { apiErrorMessage } from '../../core/api-error';
import { capitalize, formatLong, MONTHS, parseIso, today, WEEKDAYS } from '../../core/dates';
import { AppEvent, CalendarItem, daysUntil, EventService, untilLabel } from '../../core/event.service';
import { DateFieldComponent } from '../../shared/date-field/date-field.component';

interface MonthGroup {
  label: string;
  items: CalendarItem[];
}

const emptyEvent = (date: string): AppEvent => ({ id: null, title: '', date, time: null, place: null, description: null });

/**
 * The EBD calendar for one year: the events the church creates plus the
 * standard Portuguese dates (Natal, Sexta-feira Santa, Dia da Mãe…),
 * which are worked out by the app every year and cannot be edited.
 */
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputMaskModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    DateFieldComponent
  ],
  providers: [MessageService, ConfirmationService],
  host: { class: 'flex min-w-0 flex-col gap-4 lg:gap-5' },
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  readonly todayIso = today();
  readonly year = signal(Number(today().slice(0, 4)));
  readonly items = signal<CalendarItem[]>([]);
  readonly loaded = signal(false);

  readonly dialogOpen = signal(false);
  readonly saving = signal(false);
  draft: AppEvent = emptyEvent(today());

  readonly next = computed(() => this.items().find((i) => i.date >= this.todayIso) ?? null);

  readonly months = computed<MonthGroup[]>(() => {
    const groups: MonthGroup[] = [];
    for (const item of this.items()) {
      const label = capitalize(MONTHS[parseIso(item.date).getMonth()]);
      const g = groups.at(-1);
      if (g && g.label === label) g.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  });

  constructor(
    private events: EventService,
    private messages: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const y = this.year();
    this.events.calendar(`${y}-01-01`, `${y}-12-31`).subscribe({
      next: (list) => {
        this.items.set(list);
        this.loaded.set(true);
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  changeYear(delta: number): void {
    this.year.update((y) => y + delta);
    this.load();
  }

  day(date: string): string {
    return String(parseIso(date).getDate());
  }

  weekday(date: string): string {
    return WEEKDAYS[parseIso(date).getDay()].slice(0, 3);
  }

  longDate(date: string): string {
    return capitalize(formatLong(date));
  }

  until(date: string): string {
    return untilLabel(daysUntil(date, this.todayIso));
  }

  isPast(date: string): boolean {
    return date < this.todayIso;
  }

  openNew(): void {
    const y = this.year();
    this.draft = emptyEvent(String(y) === this.todayIso.slice(0, 4) ? this.todayIso : `${y}-01-01`);
    this.dialogOpen.set(true);
  }

  openEdit(item: CalendarItem): void {
    if (!item.event) return;
    this.draft = { ...item.event };
    this.dialogOpen.set(true);
  }

  save(): void {
    const d = this.draft;
    if (!d.title.trim() || !d.date) {
      this.messages.add({ severity: 'warn', detail: 'Escreva o nome e a data do evento.' });
      return;
    }
    const time = d.time?.trim() || null;
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      this.messages.add({ severity: 'warn', detail: 'A hora tem de ser como 15:30.' });
      return;
    }
    this.saving.set(true);
    const isNew = d.id === null;
    (isNew ? this.events.create({ ...d, time }) : this.events.update({ ...d, time })).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.messages.add({ severity: 'success', detail: isNew ? 'Evento criado' : 'Evento guardado' });
        const y = Number(saved.date.slice(0, 4));
        if (y !== this.year()) this.year.set(y);
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toastError(err);
      }
    });
  }

  remove(): void {
    const d = this.draft;
    if (d.id === null) return;
    this.confirm.confirm({
      header: 'Apagar evento',
      message: `Apagar "${d.title}"?`,
      acceptLabel: 'Apagar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () =>
        this.events.remove(d.id!).subscribe({
          next: () => {
            this.dialogOpen.set(false);
            this.messages.add({ severity: 'success', detail: 'Evento apagado' });
            this.load();
          },
          error: (err: unknown) => this.toastError(err)
        })
    });
  }

  private toastError(err: unknown): void {
    this.messages.add({ severity: 'error', detail: apiErrorMessage(err, 'Não foi possível concluir. Tente de novo.') });
  }
}

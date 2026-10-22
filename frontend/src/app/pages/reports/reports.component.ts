import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { forkJoin, map, of } from 'rxjs';
import { apiErrorMessage } from '../../core/api-error';
import { ClassService, SchoolClass } from '../../core/class.service';
import { Birthday, DashboardService } from '../../core/dashboard.service';
import { ageOn, capitalize, formatDate, formatLong, formatShort, MONTHS, monthRange, parseIso, today, weekOf, WEEKDAYS } from '../../core/dates';
import { DateFieldComponent } from '../../shared/date-field/date-field.component';
import { TranslatedComponent } from '../../core/i18n/translated.component';
import { LessonService } from '../../core/lesson.service';
import { AttendanceReport, BirthdayGroup, PdfService } from '../../core/pdf.service';
import { fullName, StudentService } from '../../core/student.service';
import { ReportsTranslations, reportsTranslations } from './translations';

type Tab = 'attendance' | 'birthdays';
type Period = 'week' | 'month';

/**
 * Printable lists. The preview is drawn in the app's own dark colours;
 * only the PDF that is downloaded is white, ready to print.
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DateFieldComponent, FormsModule, ButtonModule, DropdownModule, InputTextModule, ToastModule],
  providers: [MessageService],
  host: { class: 'flex min-w-0 flex-col gap-4 lg:gap-5' },
  templateUrl: './reports.component.html'
})
export class ReportsComponent extends TranslatedComponent<ReportsTranslations> implements OnInit {
  protected readonly translations = reportsTranslations;

  readonly tab = signal<Tab>('attendance');
  readonly classes = signal<SchoolClass[]>([]);
  readonly classId = signal<number | null>(null);
  readonly date = signal(today());
  readonly period = signal<Period>('week');
  readonly weekDay = signal(today());
  readonly month = signal(today().slice(0, 7));

  readonly attendance = signal<AttendanceReport[]>([]);
  readonly birthdays = signal<BirthdayGroup[]>([]);
  readonly busy = signal(false);

  readonly todayIso = today();

  readonly classOptions = computed(() => [
    { label: this.t().allClasses, value: null as number | null },
    ...this.classes().map((c) => ({ label: c.name, value: c.id as number | null }))
  ]);

  readonly dateLabel = computed(() => capitalize(formatLong(this.date())));

  readonly periodLabel = computed(() => {
    if (this.period() === 'month') {
      const [y, m] = this.month().split('-').map(Number);
      return `${MONTHS[m - 1]} ${y}`;
    }
    const w = weekOf(this.weekDay());
    return `${formatShort(w.from)} a ${formatShort(w.to)}`;
  });

  constructor(
    private classService: ClassService,
    private studentService: StudentService,
    private lessons: LessonService,
    private dashboard: DashboardService,
    private pdf: PdfService,
    private messages: MessageService,
    route: ActivatedRoute
  ) {
    super();
    const q = route.snapshot.queryParamMap;
    const turma = Number(q.get('turma'));
    if (turma) this.classId.set(turma);
    if (q.get('data')) this.date.set(q.get('data')!);
    if (q.get('tab') === 'birthdays') this.tab.set('birthdays');
  }

  ngOnInit(): void {
    this.classService.list().subscribe({
      next: (list) => {
        this.classes.set(list);
        if (this.classId() && !list.some((c) => c.id === this.classId())) this.classId.set(null);
        this.refresh();
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
    this.refresh();
  }

  setClass(id: number | null): void {
    this.classId.set(id);
    this.refresh();
  }

  setDate(value: string): void {
    this.date.set(value || today());
    this.refresh();
  }

  setPeriod(p: Period): void {
    this.period.set(p);
    this.refresh();
  }

  setWeekDay(value: string): void {
    this.weekDay.set(value || today());
    this.refresh();
  }

  setMonth(value: string): void {
    this.month.set(value || today().slice(0, 7));
    this.refresh();
  }

  refresh(): void {
    if (this.tab() === 'attendance') this.loadAttendance();
    else this.loadBirthdays();
  }

  private selected(): SchoolClass[] {
    const id = this.classId();
    return id ? this.classes().filter((c) => c.id === id) : this.classes();
  }

  private loadAttendance(): void {
    const classes = this.selected();
    const date = this.date();
    if (!classes.length) {
      this.attendance.set([]);
      return;
    }
    forkJoin(
      classes.map((c) =>
        forkJoin({ lesson: this.lessons.get(c.id, date), students: this.studentService.list(c.id) }).pipe(
          map(({ lesson, students }): AttendanceReport => ({
            className: c.name,
            date,
            teachers: lesson.teachers,
            topic: lesson.topic,
            enrolled: students.length,
            rows: students
              .filter((s) => s.id && lesson.attendance[s.id])
              .map((s) => ({ name: fullName(s), age: ageOn(s.birthDate, date), bible: lesson.attendance[s.id!] === 'bible' }))
          }))
        )
      )
    ).subscribe({
      next: (reports) => this.attendance.set(reports),
      error: (err: unknown) => this.toastError(err)
    });
  }

  private range(): { from: string; to: string } {
    return this.period() === 'month' ? monthRange(this.month()) : weekOf(this.weekDay());
  }

  private loadBirthdays(): void {
    const { from, to } = this.range();
    const classes = this.selected();
    (classes.length ? this.dashboard.birthdays(from, to, this.classId()) : of([] as Birthday[])).subscribe({
      next: (list) =>
        this.birthdays.set(
          classes.map((c) => ({ className: c.name, items: list.filter((b) => b.classId === c.id) }))
        ),
      error: (err: unknown) => this.toastError(err)
    });
  }

  bibleCount(r: AttendanceReport): number {
    return r.rows.filter((x) => x.bible).length;
  }

  birthdayDay(b: Birthday): string {
    return `${capitalize(WEEKDAYS[parseIso(b.date).getDay()])} ${formatShort(b.date)}`;
  }

  formatDate = formatDate;

  async download(): Promise<void> {
    this.busy.set(true);
    try {
      if (this.tab() === 'attendance') {
        await this.pdf.attendance(this.attendance());
      } else {
        const { from } = this.range();
        await this.pdf.birthdays(this.periodLabel(), this.birthdays(), this.period() === 'month' ? this.month() : from);
      }
    } catch (err) {
      this.toastError(err);
    } finally {
      this.busy.set(false);
    }
  }

  private toastError(err: unknown): void {
    this.messages.add({ severity: 'error', detail: apiErrorMessage(err, this.t().genericError) });
  }
}

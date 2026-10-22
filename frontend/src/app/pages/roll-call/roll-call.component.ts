import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { apiErrorMessage } from '../../core/api-error';
import { CARE_ORDER, CARE_SHORT, careItems } from '../../core/care';
import { ClassService, SchoolClass } from '../../core/class.service';
import { classMove, classMoveLabel } from '../../core/class-move';
import { ageLabel, today } from '../../core/dates';
import { DateFieldComponent } from '../../shared/date-field/date-field.component';
import { TranslatedComponent } from '../../core/i18n/translated.component';
import { Attendance, Lesson, LessonService } from '../../core/lesson.service';
import { fullName, Student, StudentService } from '../../core/student.service';
import { CareBadgesComponent } from '../../shared/care-badges/care-badges.component';
import { CareIconComponent } from '../../shared/care-icon/care-icon.component';
import { StudentAvatarComponent } from '../../shared/student-avatar/student-avatar.component';
import { StudentFormComponent } from '../student-form/student-form.component';
import { RollCallTranslations, rollCallTranslations } from './translations';

const CLASS_KEY = 'ebd-roll-call-class';

/**
 * Sunday's roll call. One compact card per child, the height of the photo:
 * name, age and care icons on the left, two big square buttons on the right
 * (present / present with Bible). The counter sticks to the top while the
 * teacher scrolls down the list.
 */
@Component({
  selector: 'app-roll-call',
  standalone: true,
  imports: [DateFieldComponent, 
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    CareBadgesComponent,
    CareIconComponent,
    StudentAvatarComponent,
    StudentFormComponent
  ],
  providers: [MessageService],
  host: { class: 'flex min-w-0 flex-col gap-4 lg:gap-5' },
  templateUrl: './roll-call.component.html'
})
export class RollCallComponent extends TranslatedComponent<RollCallTranslations> implements OnInit {
  protected readonly translations = rollCallTranslations;

  readonly classes = signal<SchoolClass[]>([]);
  readonly classId = signal<number | null>(null);
  readonly date = signal(today());
  readonly students = signal<Student[]>([]);
  readonly lesson = signal<Lesson | null>(null);
  readonly loaded = signal(false);
  readonly editingDetails = signal(false);
  readonly quickOpen = signal(false);
  readonly quickSaving = signal(false);

  readonly formOpen = signal(false);
  readonly formStudentId = signal<number | null>(null);

  teachers = '';
  topic = '';
  quickFirst = '';
  quickLast = '';
  quickBirth: string | null = '';

  readonly todayIso = today();
  readonly careLegend = CARE_ORDER.map((kind) => ({ kind, label: CARE_SHORT[kind] }));

  readonly currentClass = computed(() => this.classes().find((c) => c.id === this.classId()) ?? null);

  readonly cards = computed(() =>
    this.students().map((s) => ({
      student: s,
      name: fullName(s),
      age: ageLabel(s.birthDate),
      care: careItems(s),
      incomplete: s.missingFields.length > 0,
      move: (() => {
        const m = classMove({ birthDate: s.birthDate, classId: this.classId() }, this.classes(), this.date());
        return m ? classMoveLabel(m) : null;
      })()
    }))
  );

  readonly counts = computed(() => {
    const att = this.lesson()?.attendance ?? {};
    const ids = new Set(this.students().map((s) => s.id));
    let present = 0;
    let bible = 0;
    Object.entries(att).forEach(([id, state]) => {
      if (ids.has(Number(id))) {
        present++;
        if (state === 'bible') bible++;
      }
    });
    return { present, bible, total: this.students().length };
  });

  /** Fields open while something is missing; a one-line summary once both are filled. */
  readonly showDetailsForm = computed(() => {
    const l = this.lesson();
    return this.editingDetails() || !l?.teachers || !l?.topic;
  });

  constructor(
    private classService: ClassService,
    private studentService: StudentService,
    private lessons: LessonService,
    private messages: MessageService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.classService.list().subscribe({
      next: (list) => {
        this.classes.set(list);
        const stored = Number(this.readStoredClass());
        const pick = list.find((c) => c.id === stored)?.id ?? list[0]?.id ?? null;
        this.loaded.set(true);
        if (pick) this.selectClass(pick);
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  selectClass(id: number): void {
    this.classId.set(id);
    this.quickOpen.set(false);
    this.editingDetails.set(false);
    try {
      localStorage.setItem(CLASS_KEY, String(id));
    } catch {
      /* storage disabled */
    }
    this.load();
  }

  changeDate(value: string): void {
    this.date.set(value || today());
    this.editingDetails.set(false);
    this.load();
  }

  private load(): void {
    const id = this.classId();
    if (!id) return;
    forkJoin({
      students: this.studentService.list(id),
      lesson: this.lessons.get(id, this.date())
    }).subscribe({
      next: ({ students, lesson }) => {
        this.students.set(students);
        this.setLesson(lesson);
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  private setLesson(lesson: Lesson): void {
    this.lesson.set(lesson);
    this.teachers = lesson.teachers ?? '';
    this.topic = lesson.topic ?? '';
  }

  attendance(studentId: number | null): Attendance | null {
    return studentId ? (this.lesson()?.attendance[studentId] ?? null) : null;
  }

  /** Optimistic: the card changes colour at once; the server's answer then settles it. */
  mark(student: Student, state: Attendance): void {
    const id = this.classId();
    const lesson = this.lesson();
    if (!id || !student.id || !lesson) return;
    const current = lesson.attendance[student.id];
    const attendance = { ...lesson.attendance };
    if (current === state) delete attendance[student.id];
    else attendance[student.id] = state;
    this.lesson.set({ ...lesson, attendance });
    navigator.vibrate?.(10);

    this.lessons.mark(id, this.date(), student.id, state).subscribe({
      next: (l) => this.lesson.update((now) => (now ? { ...now, attendance: l.attendance, present: l.present, withBible: l.withBible } : l)),
      error: (err: unknown) => {
        this.lesson.set(lesson);
        this.toastError(err);
      }
    });
  }

  saveDetails(): void {
    const id = this.classId();
    if (!id) return;
    const l = this.lesson();
    if ((l?.teachers ?? '') === this.teachers.trim() && (l?.topic ?? '') === this.topic.trim()) return;
    this.lessons.saveDetails(id, this.date(), this.teachers, this.topic).subscribe({
      next: (saved) => {
        this.lesson.update((now) => (now ? { ...now, teachers: saved.teachers, topic: saved.topic } : saved));
        this.classes.update((list) =>
          list.map((c) => (c.id === id && saved.teachers ? { ...c, lastTeachers: saved.teachers } : c))
        );
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  finishDetails(): void {
    this.saveDetails();
    this.editingDetails.set(false);
  }

  openQuick(): void {
    this.quickOpen.set(true);
    setTimeout(() => {
      const input = document.getElementById('quickFirst');
      input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      input?.focus();
    }, 50);
  }

  addQuick(): void {
    const id = this.classId();
    if (!id) return;
    if (!this.quickFirst.trim()) {
      this.messages.add({ severity: 'warn', detail: this.t().quickMissing });
      return;
    }
    this.quickSaving.set(true);
    this.studentService
      .quickCreate(id, this.quickFirst.trim(), this.quickLast.trim() || null, this.quickBirth || null, this.date())
      .subscribe({
        next: (s) => {
          this.quickSaving.set(false);
          this.quickOpen.set(false);
          this.messages.add({ severity: 'success', detail: this.t().quickAdded.replace('{name}', s.firstName) });
          this.quickFirst = this.quickLast = this.quickBirth = '';
          this.classes.update((list) => list.map((c) => (c.id === id ? { ...c, studentCount: c.studentCount + 1 } : c)));
          this.load();
        },
        error: (err: unknown) => {
          this.quickSaving.set(false);
          this.toastError(err);
        }
      });
  }

  openRecord(student: Student): void {
    this.formStudentId.set(student.id);
    this.formOpen.set(true);
  }

  onSaved(): void {
    this.load();
    this.classService.list().subscribe((list) => this.classes.set(list));
  }

  goToReport(): void {
    void this.router.navigate(['/reports'], { queryParams: { turma: this.classId(), data: this.date() } });
  }

  goToClasses(): void {
    void this.router.navigate(['/students'], { queryParams: { classes: 1 } });
  }

  private readStoredClass(): string | null {
    try {
      return localStorage.getItem(CLASS_KEY);
    } catch {
      return null;
    }
  }

  private toastError(err: unknown): void {
    this.messages.add({ severity: 'error', detail: apiErrorMessage(err, this.t().genericError) });
  }
}

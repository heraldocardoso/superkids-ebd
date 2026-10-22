import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { concat, forkJoin, toArray } from 'rxjs';
import { apiErrorMessage } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { careItems } from '../../core/care';
import { ageRangeLabel, ClassService, ClassTemplate, SchoolClass, SUGGESTED_CLASSES } from '../../core/class.service';
import { classMove, ClassMove, classMoveLabel } from '../../core/class-move';
import { ageLabel } from '../../core/dates';
import { TranslatedComponent } from '../../core/i18n/translated.component';
import { fullName, Student, StudentService } from '../../core/student.service';
import { CareBadgesComponent } from '../../shared/care-badges/care-badges.component';
import { StudentAvatarComponent } from '../../shared/student-avatar/student-avatar.component';
import { StudentFormComponent } from '../student-form/student-form.component';
import { ImportDialogComponent } from '../import/import-dialog.component';
import { StudentsTranslations, studentsTranslations } from './translations';

export type StudentFilter = 'moveClass' | 'incomplete' | 'consent' | 'noBible' | 'bibleUnknown';
const FILTERS: StudentFilter[] = ['moveClass', 'incomplete', 'consent', 'noBible', 'bibleUnknown'];

const fold = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Every student, filterable by class and by what is still missing; the classes are managed here too. */
@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    CareBadgesComponent,
    StudentAvatarComponent,
    StudentFormComponent,
    ImportDialogComponent
  ],
  providers: [MessageService, ConfirmationService],
  host: { class: 'flex min-w-0 flex-col gap-4 lg:gap-5' },
  templateUrl: './students.component.html'
})
export class StudentsComponent extends TranslatedComponent<StudentsTranslations> implements OnInit {
  protected readonly translations = studentsTranslations;

  readonly filters = FILTERS;
  readonly suggestions = SUGGESTED_CLASSES;

  readonly classes = signal<SchoolClass[]>([]);
  readonly students = signal<Student[]>([]);
  readonly loaded = signal(false);
  readonly classId = signal<number | null>(null);
  readonly filter = signal<StudentFilter | null>(null);
  readonly query = signal('');

  readonly formOpen = signal(false);
  readonly formStudentId = signal<number | null>(null);
  readonly classesOpen = signal(false);
  readonly importOpen = signal(false);
  newClassName = '';
  newMin: number | null = null;
  newMax: number | null = null;
  readonly editing = signal<number | null>(null);
  editName = '';
  editMin: number | null = null;
  editMax: number | null = null;
  readonly ageRangeLabel = ageRangeLabel;

  readonly defaultClassId = computed(() => this.classId() ?? this.classes().at(0)?.id ?? null);

  readonly isAdmin = computed(() => this.auth.isAdmin());

  readonly classNames = computed(() => new Map(this.classes().map((c) => [c.id, c.name])));

  readonly visible = computed(() => {
    const q = fold(this.query().trim());
    const cls = this.classId();
    const f = this.filter();
    return this.students()
      .filter((s) => !cls || s.classId === cls || s.secondClassId === cls)
      .filter((s) => !f || matches(s, f, this.classes()))
      .filter((s) => !q || fold(fullName(s)).includes(q))
      .map((s) => ({
        student: s,
        name: fullName(s),
        age: ageLabel(s.birthDate),
        className:
          ((s.classId && this.classNames().get(s.classId)) || this.t().noClass) +
          (s.secondClassId && this.classNames().get(s.secondClassId) ? ' + ' + this.classNames().get(s.secondClassId) : ''),
        care: careItems(s),
        incomplete: s.missingFields.length > 0,
        move: moveText(classMove(s, this.classes()))
      }));
  });

  readonly unusedSuggestions = computed(() => this.suggestionsFor(this.classes()).filter((x) => !x.existing).map((x) => x.template));

  /** Classes created before the ages existed: one tap fills them in from the EBD list. */
  readonly missingAges = computed(() =>
    this.suggestionsFor(this.classes()).filter((x) => x.existing && x.existing.minAge === null && x.existing.maxAge === null)
  );

  private suggestionsFor(classes: SchoolClass[]) {
    return SUGGESTED_CLASSES.map((template) => ({
      template,
      existing: classes.find((c) => [template.name, ...(template.aliases ?? [])].some((n) => fold(n) === fold(c.name))) ?? null
    }));
  }

  constructor(
    private classService: ClassService,
    private studentService: StudentService,
    private auth: AuthService,
    private messages: MessageService,
    private confirm: ConfirmationService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const f = params.get('filter') as StudentFilter | null;
    if (f && FILTERS.includes(f)) this.filter.set(f);
    if (params.get('classes')) this.classesOpen.set(true);
    this.load();
  }

  load(): void {
    forkJoin({ classes: this.classService.list(), students: this.studentService.list() }).subscribe({
      next: ({ classes, students }) => {
        this.classes.set(classes);
        this.students.set(students);
        this.loaded.set(true);
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  toggleFilter(f: StudentFilter): void {
    this.filter.update((now) => (now === f ? null : f));
  }

  countLabel(n: number): string {
    return n === 1 ? this.t().countOne : this.t().countMany.replace('{n}', String(n));
  }

  open(id: number | null): void {
    this.formStudentId.set(id);
    this.formOpen.set(true);
  }

  /* ------------------------------------------------------------- classes */

  createClass(): void {
    const value = this.newClassName.trim();
    if (!value) return;
    this.classService.create(value, this.newMin, this.newMax).subscribe({
      next: (c) => {
        this.classes.update((list) => [...list, c]);
        this.newClassName = '';
        this.newMin = this.newMax = null;
        this.messages.add({ severity: 'success', detail: this.t().classCreated });
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  createSuggested(s: ClassTemplate): void {
    this.classService.create(s.name, s.minAge, s.maxAge).subscribe({
      next: (c) => this.classes.update((list) => [...list, c]),
      error: (err: unknown) => this.toastError(err)
    });
  }

  /** One after the other, so the classes keep the order of the list. */
  createAllSuggested(): void {
    const list = this.unusedSuggestions();
    if (!list.length) return;
    concat(...list.map((s) => this.classService.create(s.name, s.minAge, s.maxAge)))
      .pipe(toArray())
      .subscribe({
        next: (created) => {
          this.classes.update((now) => [...now, ...created]);
          this.messages.add({ severity: 'success', detail: this.t().classesCreated.replace('{n}', String(created.length)) });
        },
        error: (err: unknown) => {
          this.toastError(err);
          this.load();
        }
      });
  }

  fillMissingAges(): void {
    const list = this.missingAges();
    concat(...list.map((x) => this.classService.update(x.existing!.id, x.existing!.name, x.template.minAge, x.template.maxAge)))
      .pipe(toArray())
      .subscribe({
        next: (saved) => {
          const byId = new Map(saved.map((c) => [c.id, c]));
          this.classes.update((now) => now.map((c) => byId.get(c.id) ?? c));
          this.messages.add({ severity: 'success', detail: this.t().agesFilled });
        },
        error: (err: unknown) => this.toastError(err)
      });
  }

  startEdit(c: SchoolClass): void {
    this.editing.set(c.id);
    this.editName = c.name;
    this.editMin = c.minAge;
    this.editMax = c.maxAge;
  }

  saveEdit(c: SchoolClass): void {
    const name = this.editName.trim();
    if (!name) return;
    this.classService.update(c.id, name, this.editMin, this.editMax).subscribe({
      next: (saved) => {
        this.editing.set(null);
        this.classes.update((list) => list.map((x) => (x.id === saved.id ? saved : x)));
      },
      error: (err: unknown) => this.toastError(err)
    });
  }

  removeClass(c: SchoolClass): void {
    if (c.studentCount > 0) {
      this.messages.add({ severity: 'warn', detail: this.t().classNotEmpty });
      return;
    }
    this.confirm.confirm({
      header: this.t().removeClass,
      message: this.t().removeClassConfirm.replace('{name}', c.name),
      acceptLabel: this.t().remove,
      rejectLabel: this.t().cancel,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () =>
        this.classService.remove(c.id).subscribe({
          next: () => {
            this.classes.update((list) => list.filter((x) => x.id !== c.id));
            if (this.classId() === c.id) this.classId.set(null);
            this.messages.add({ severity: 'success', detail: this.t().classRemoved });
          },
          error: (err: unknown) => this.toastError(err)
        })
    });
  }

  private toastError(err: unknown): void {
    this.messages.add({ severity: 'error', detail: apiErrorMessage(err, this.t().genericError) });
  }
}

function moveText(m: ClassMove | null): string | null {
  return m ? classMoveLabel(m) : null;
}

export function matches(s: Student, f: StudentFilter, classes: SchoolClass[] = []): boolean {
  switch (f) {
    case 'moveClass':
      return classMove(s, classes) !== null;
    case 'incomplete':
      return s.missingFields.length > 0;
    case 'consent':
      return s.consent.status !== 'signed';
    case 'noBible':
      return s.hasBible === false;
    case 'bibleUnknown':
      return s.hasBible === null;
  }
}

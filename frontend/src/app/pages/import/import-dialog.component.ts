import { Component, computed, input, model, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../core/api-error';
import { ClassService, SchoolClass } from '../../core/class.service';
import { isExistingClass, nameKey, parseCsv, PlannedRow, planImport } from '../../core/student-import';
import { emptyStudent, Student, StudentService } from '../../core/student.service';

interface ClassGroup {
  name: string;
  isNew: boolean;
  rows: PlannedRow[];
  toCreate: number;
  toLink: number;
}

/**
 * "Importar lista": a CSV with `turma;nome;apelido;notas` (what Excel saves).
 * Shows what will happen per class, then creates the children one by one.
 * Only the first name is needed; the rest of each form stays flagged as missing.
 */
@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule],
  templateUrl: './import-dialog.component.html'
})
export class ImportDialogComponent {
  readonly visible = model(false);
  readonly classes = input<SchoolClass[]>([]);
  readonly students = input<Student[]>([]);
  readonly imported = output<void>();

  readonly fileName = signal<string | null>(null);
  readonly plan = signal<PlannedRow[]>([]);
  readonly running = signal(false);
  readonly done = signal(0);
  readonly failures = signal<string[]>([]);
  readonly finished = signal(false);

  readonly groups = computed<ClassGroup[]>(() => {
    const map = new Map<string, ClassGroup>();
    for (const r of this.plan()) {
      if (!r.target) continue;
      const g = map.get(r.target.name) ?? { name: r.target.name, isNew: !isExistingClass(r.target), rows: [], toCreate: 0, toLink: 0 };
      g.rows.push(r);
      if (r.status === 'new') g.toCreate++;
      if (r.status === 'link') g.toLink++;
      map.set(r.target.name, g);
    }
    return [...map.values()];
  });

  readonly toCreate = computed(() => this.plan().filter((r) => r.status === 'new'));
  readonly toLink = computed(() => this.plan().filter((r) => r.status === 'link'));
  readonly total = computed(() => this.toCreate().length + this.toLink().length);
  readonly duplicates = computed(() => this.plan().filter((r) => r.status === 'duplicate').length);
  readonly problems = computed(() => this.plan().filter((r) => r.status === 'noClass' || r.status === 'noName' || r.status === 'noMatch'));
  readonly newClasses = computed(() => this.groups().filter((g) => g.isNew && (g.toCreate || g.toLink)));
  readonly progress = computed(() => {
    const total = this.total();
    return total ? Math.round((this.done() / total) * 100) : 0;
  });

  constructor(
    private classService: ClassService,
    private studentService: StudentService
  ) {}

  async pick(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file) return;
    this.reset();
    this.fileName.set(file.name);
    const text = await file.text();
    this.plan.set(planImport(parseCsv(text), this.classes(), this.students()));
  }

  reset(): void {
    this.fileName.set(null);
    this.plan.set([]);
    this.done.set(0);
    this.failures.set([]);
    this.finished.set(false);
  }

  close(): void {
    if (this.running()) return;
    this.visible.set(false);
    if (this.finished()) this.reset();
  }

  /** One request at a time: slower, but the order is kept and a failure does not stop the rest. */
  async run(): Promise<void> {
    this.running.set(true);
    this.done.set(0);
    this.failures.set([]);
    const classIds = new Map<string, number>();
    for (const c of this.classes()) classIds.set(c.name, c.id);

    for (const g of this.newClasses()) {
      const t = g.rows[0].target!;
      if (isExistingClass(t)) continue;
      try {
        const created = await firstValueFrom(this.classService.create(t.name, t.minAge, t.maxAge));
        classIds.set(t.name, created.id);
      } catch (err) {
        this.failures.update((f) => [...f, `Turma ${t.name}: ${apiErrorMessage(err, 'não foi criada')}`]);
      }
    }

    const created = new Map<string, Student>();
    for (const r of this.toCreate()) {
      const classId = classIds.get(r.target!.name);
      if (!classId) {
        this.failures.update((f) => [...f, `${r.firstName} ${r.lastName}`.trim() + ': turma não criada']);
        this.done.update((n) => n + 1);
        continue;
      }
      const s = emptyStudent(classId);
      s.firstName = r.firstName;
      s.lastName = r.lastName;
      s.family.notes = r.notes || null;
      try {
        created.set(nameKey(r.firstName, r.lastName), await firstValueFrom(this.studentService.create(s)));
      } catch (err) {
        this.failures.update((f) => [...f, `${r.firstName} ${r.lastName}`.trim() + ': ' + apiErrorMessage(err, 'erro')]);
      }
      this.done.update((n) => n + 1);
    }

    // Second class for children who go morning and afternoon.
    for (const r of this.toLink()) {
      const classId = classIds.get(r.target!.name);
      const s = r.linkStudent ?? (r.linkKey ? created.get(r.linkKey) : undefined);
      if (!classId || !s) {
        this.failures.update((f) => [...f, `${this.label(r)}: não foi possível ligar à ${r.target!.name}`]);
      } else if (s.classId !== classId) {
        try {
          await firstValueFrom(this.studentService.update({ ...s, secondClassId: classId }));
        } catch (err) {
          this.failures.update((f) => [...f, `${this.label(r)}: ` + apiErrorMessage(err, 'erro')]);
        }
      }
      this.done.update((n) => n + 1);
    }

    this.running.set(false);
    this.finished.set(true);
    this.imported.emit();
  }

  label(r: PlannedRow): string {
    return `${r.firstName} ${r.lastName}`.trim();
  }
}

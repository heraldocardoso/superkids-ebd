import { Component, computed, effect, input, model, output, signal, untracked } from '@angular/core';
import { classMove, classMoveLabel } from '../../core/class-move';
import { AttendanceStatsComponent } from '../../shared/attendance-stats/attendance-stats.component';
import { DateFieldComponent } from '../../shared/date-field/date-field.component';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../core/api-error';
import { SchoolClass } from '../../core/class.service';
import { CONSENT_VERSION } from '../../core/consent';
import { formatDate, today } from '../../core/dates';
import { blobToDataUrl, documentScan, squarePhoto } from '../../core/image';
import { PdfService } from '../../core/pdf.service';
import { PhotoService } from '../../core/photo.service';
import {
  ConsentMethod,
  ConsentStatus,
  GuardianType,
  Literacy,
  Student,
  StudentService,
  emptyStudent,
  fullName,
  missingFields
} from '../../core/student.service';
import { Choice, ChoicePillsComponent, NO_YES } from '../../shared/choice-pills/choice-pills.component';
import { StudentAvatarComponent } from '../../shared/student-avatar/student-avatar.component';
import { SignatureDialogComponent, SignatureResult } from '../signature/signature-dialog.component';

const METHOD_LABEL: Record<ConsentMethod, string> = {
  paper: 'Em papel',
  online: 'Formulário online',
  app: 'Assinada na app'
};

/**
 * The student's form. On a phone it fills the screen like a page; from the
 * tablet up it is a window. Photo and name come first; the RGPD consent is at
 * the end, with a warning at the top while it is still missing.
 */
@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [AttendanceStatsComponent, DateFieldComponent, 
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    ChoicePillsComponent,
    StudentAvatarComponent,
    SignatureDialogComponent
  ],
  templateUrl: './student-form.component.html'
})
export class StudentFormComponent {
  readonly visible = model(false);
  /** `null` = new student from the students menu. */
  readonly studentId = input<number | null>(null);
  readonly defaultClassId = input<number | null>(null);
  readonly classes = input<SchoolClass[]>([]);
  readonly saved = output<Student>();
  readonly removed = output<number>();

  readonly s = signal<Student>(emptyStudent());

  /** The student being edited, as a plain object for `[(ngModel)]`. */
  get m(): Student {
    return this.s();
  }
  /** Bumped on every edit so `computed`s re-read the mutable model. */
  private readonly rev = signal(0);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly confirmDelete = signal(false);
  readonly consentEditing = signal(false);
  readonly signatureOpen = signal(false);

  /* Files picked but not uploaded yet */
  readonly photoPreview = signal<string | null>(null);
  private photoBlob: Blob | null = null;
  private photoRemoved = false;
  readonly receiptPending = signal(false);
  private receiptBlob: Blob | null = null;
  readonly signaturePending = signal<string | null>(null);

  readonly isNew = computed(() => this.studentId() === null);

  readonly missing = computed(() => {
    this.rev();
    return missingFields(this.s());
  });

  readonly consent = computed(() => {
    this.rev();
    return this.s().consent;
  });

  /** RGPD: health data and photo only with the guardian's signed authorization. */
  readonly healthAllowed = computed(() => this.consent().status === 'signed' && this.consent().health);
  readonly photoAllowed = computed(() => this.consent().status === 'signed' && this.consent().photo);

  readonly showSummary = computed(() => this.consent().status === 'signed' && !this.consentEditing());

  readonly hasPhoto = computed(() => {
    this.rev();
    return this.s().hasPhoto && !this.photoRemoved;
  });

  readonly guardianInfo = computed(() => {
    this.rev();
    const st = this.s();
    const line = (who: string, name: string | null, contact: string | null) =>
      `${name?.trim() || who + ' (nome por preencher)'}${contact?.trim() ? ' · ' + contact.trim() : ' · sem contacto'}`;
    const m = line('Mãe', st.mother.name, st.mother.contact);
    const p = line('Pai', st.father.name, st.father.contact);
    switch (st.guardian) {
      case 'mother':
        return [m];
      case 'father':
        return [p];
      case 'both':
        return [m, p];
      default:
        return [];
    }
  });

  readonly guardianOptions = computed<Choice<GuardianType>[]>(() => {
    this.rev();
    const st = this.s();
    return [
      { value: 'mother', label: 'Mãe', disabled: st.mother.notApplicable },
      { value: 'father', label: 'Pai', disabled: st.father.notApplicable },
      { value: 'both', label: 'Ambos', disabled: st.mother.notApplicable || st.father.notApplicable },
      { value: 'other', label: 'Outra pessoa' }
    ];
  });

  readonly title = computed(() => {
    this.rev();
    return this.isNew() ? 'Novo aluno' : fullName(this.s());
  });

  readonly literacy: Choice<Literacy>[] = [
    { value: 'yes', label: 'Sim' },
    { value: 'no', label: 'Não' },
    { value: 'learning', label: 'Em progresso' }
  ];
  readonly hasBibleOptions: Choice<boolean>[] = [
    { value: true, label: 'Sim' },
    { value: false, label: 'Não tem' }
  ];
  readonly yesNo: Choice<boolean>[] = [
    { value: true, label: 'Sim' },
    { value: false, label: 'Não' }
  ];
  readonly noYes = NO_YES;
  readonly statuses: Choice<ConsentStatus>[] = [
    { value: 'signed', label: 'Assinada' },
    { value: 'pending', label: 'Por recolher' },
    { value: 'refused', label: 'Recusada' }
  ];
  readonly methods: Choice<ConsentMethod>[] = [
    { value: 'paper', label: 'Em papel' },
    { value: 'online', label: 'Formulário online' },
    { value: 'app', label: 'Assinada na app' }
  ];
  readonly methodLabel = METHOD_LABEL;
  readonly todayIso = today();

  /** Outgrown the class? Recomputed as the birth date or class changes in the form. */
  readonly move = computed(() => {
    this.rev();
    const st = this.s();
    const m = st ? classMove(st, this.classes()) : null;
    return m ? { label: classMoveLabel(m), suggested: m.suggested } : null;
  });

  moveTo(classId: number): void {
    this.m.classId = classId;
    this.touch();
  }
  readonly parents = [
    { key: 'mother' as const, label: 'Mãe' },
    { key: 'father' as const, label: 'Pai' }
  ];

  constructor(
    private students: StudentService,
    private photos: PhotoService,
    private pdf: PdfService,
    private messages: MessageService
  ) {
    effect(() => {
      if (this.visible()) {
        const id = this.studentId();
        untracked(() => this.open(id));
      }
    });
  }

  /* ------------------------------------------------------------- opening */

  private open(id: number | null): void {
    this.error.set(null);
    this.confirmDelete.set(false);
    this.consentEditing.set(false);
    this.resetFiles();
    if (id === null) {
      this.s.set(emptyStudent(this.defaultClassId() ?? this.classes()[0]?.id ?? null));
      this.touch();
      return;
    }
    this.loading.set(true);
    this.students.get(id).subscribe({
      next: (student) => {
        this.s.set(student);
        this.loading.set(false);
        this.touch();
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(err, 'Não foi possível abrir a ficha.'));
      }
    });
  }

  private resetFiles(): void {
    const preview = this.photoPreview();
    if (preview) URL.revokeObjectURL(preview);
    this.photoPreview.set(null);
    this.photoBlob = null;
    this.photoRemoved = false;
    this.receiptBlob = null;
    this.receiptPending.set(false);
    this.signaturePending.set(null);
  }

  /** Every edit goes through here so the computed values refresh. */
  touch(): void {
    this.rev.update((v) => v + 1);
  }

  /* -------------------------------------------------------- field helpers */

  setParentNotApplicable(which: 'mother' | 'father', value: boolean): void {
    const st = this.s();
    st[which].notApplicable = value;
    if (value) {
      st[which] = { name: null, contact: null, instagram: null, notApplicable: true };
      if (st.guardian === which || st.guardian === 'both') st.guardian = null;
    }
    this.touch();
  }

  setStatus(status: ConsentStatus | null): void {
    const c = this.s().consent;
    c.status = status ?? 'pending';
    if (c.status === 'signed') {
      c.date = c.date ?? today();
      if (!c.signedBy) {
        const st = this.s();
        c.signedBy =
          (st.guardian === 'father' ? st.father.name : st.guardian === 'other' ? st.otherGuardian.name : st.mother.name) ?? null;
      }
    }
    if (c.status !== 'signed') {
      c.health = false;
      c.photo = false;
    }
    this.touch();
  }

  setMethod(method: ConsentMethod | null): void {
    this.s().consent.method = method;
    this.touch();
  }

  /* ---------------------------------------------------------------- files */

  async pickPhoto(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file) return;
    try {
      this.photoBlob = await squarePhoto(file);
      const old = this.photoPreview();
      if (old) URL.revokeObjectURL(old);
      this.photoPreview.set(URL.createObjectURL(this.photoBlob));
      this.photoRemoved = false;
      this.touch();
    } catch {
      this.toast('error', 'Não foi possível ler a imagem.');
    }
  }

  removePhoto(): void {
    const old = this.photoPreview();
    if (old) URL.revokeObjectURL(old);
    this.photoPreview.set(null);
    this.photoBlob = null;
    this.photoRemoved = true;
    this.touch();
  }

  async pickReceipt(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file) return;
    try {
      this.receiptBlob = await documentScan(file);
      this.receiptPending.set(true);
      this.toast('info', 'Imagem adicionada. Guarde a ficha para registar.');
    } catch {
      this.toast('error', 'Não foi possível ler a imagem.');
    }
  }

  removeReceipt(): void {
    this.receiptBlob = null;
    this.receiptPending.set(false);
    this.s().hasReceipt = false;
    this.receiptRemoved = true;
    this.touch();
  }
  private receiptRemoved = false;

  onSigned(result: SignatureResult): void {
    const c = this.s().consent;
    const now = new Date();
    c.status = result.data ? 'signed' : 'refused';
    c.method = 'app';
    c.date = today();
    c.time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    c.signedBy = result.signedBy;
    c.relation = result.relation;
    c.health = result.health;
    c.photo = result.photo;
    c.textVersion = CONSENT_VERSION;
    this.signaturePending.set(result.signature);
    this.consentEditing.set(false);
    this.touch();
    this.toast(
      'info',
      result.data ? 'Autorização assinada. Toque em “Guardar ficha” para registar.' : 'Recusa registada. Toque em “Guardar ficha” para registar.'
    );
  }

  signerDefault(): string | null {
    const st = this.s();
    return (st.guardian === 'father' ? st.father.name : st.guardian === 'other' ? st.otherGuardian.name : st.mother.name) ?? null;
  }

  relationDefault(): 'mother' | 'father' | 'other' {
    const g = this.s().guardian;
    return g === 'father' ? 'father' : g === 'other' ? 'other' : 'mother';
  }

  consentLine(): string {
    const c = this.consent();
    const date = c.date ? formatDate(c.date) : 'data por indicar';
    return [c.method ? METHOD_LABEL[c.method] : 'Forma por indicar', date + (c.time ? ` às ${c.time}` : ''), c.signedBy]
      .filter(Boolean)
      .join(' · ');
  }

  scrollToConsent(): void {
    document.getElementById('consent-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ----------------------------------------------------------------- save */

  async save(): Promise<void> {
    const st = this.s();
    this.error.set(null);
    // Only the first name is needed to save; whatever else is missing stays flagged on the form.
    if (!st.firstName.trim()) {
      this.fail('O nome é obrigatório.');
      return;
    }
    if (st.consent.status === 'signed' && !st.consent.method) {
      this.fail('Indique como foi assinada a autorização.');
      return;
    }

    this.saving.set(true);
    try {
      let result = this.isNew()
        ? await firstValueFrom(this.students.create(st))
        : await firstValueFrom(this.students.update(st));
      const id = result.id!;

      if (this.photoBlob && this.photoAllowed()) {
        await firstValueFrom(this.students.uploadAttachment(id, 'photo', this.photoBlob));
        this.photos.forget(id);
      } else if (this.photoRemoved && result.hasPhoto) {
        await firstValueFrom(this.students.removeAttachment(id, 'photo'));
        this.photos.forget(id);
      }
      if (this.receiptBlob && (st.consent.method === 'paper' || st.consent.method === 'online')) {
        await firstValueFrom(this.students.uploadAttachment(id, 'receipt', this.receiptBlob));
      } else if (this.receiptRemoved && result.hasReceipt) {
        await firstValueFrom(this.students.removeAttachment(id, 'receipt'));
      }
      const signature = this.signaturePending();
      if (signature && st.consent.method === 'app') {
        const blob = await (await fetch(signature)).blob();
        await firstValueFrom(this.students.uploadAttachment(id, 'signature', blob));
      }
      if (this.photoBlob || this.photoRemoved || this.receiptBlob || this.receiptRemoved || signature) {
        result = await firstValueFrom(this.students.get(id));
      }

      this.saving.set(false);
      const missing = result.missingFields;
      this.toast('success', missing.length ? 'Ficha guardada. Ainda faltam: ' + missing.join(', ') : 'Ficha guardada');
      this.saved.emit(result);
      this.visible.set(false);
    } catch (err: unknown) {
      this.saving.set(false);
      this.fail(apiErrorMessage(err, 'Não foi possível guardar. Tente de novo.'));
    }
  }

  remove(): void {
    const id = this.studentId();
    if (id === null) return;
    this.students.remove(id).subscribe({
      next: () => {
        this.photos.forget(id);
        this.toast('success', 'Aluno eliminado');
        this.removed.emit(id);
        this.visible.set(false);
      },
      error: (err: unknown) => this.fail(apiErrorMessage(err, 'Não foi possível eliminar.'))
    });
  }

  /* ------------------------------------------------------------ receipt */

  async downloadReceipt(): Promise<void> {
    const st = this.s();
    const id = st.id;
    const fetchData = async (kind: 'receipt' | 'signature', has: boolean): Promise<string | null> => {
      if (!id || !has) return null;
      try {
        return await blobToDataUrl(await firstValueFrom(this.students.getAttachment(id, kind)));
      } catch {
        return null;
      }
    };
    const receipt = this.receiptBlob ? await blobToDataUrl(this.receiptBlob) : await fetchData('receipt', st.hasReceipt);
    const signature = this.signaturePending() ?? (await fetchData('signature', st.hasSignature));
    const className = this.classes().find((c) => c.id === st.classId)?.name ?? 'Sem turma';
    try {
      await this.pdf.consentReceipt(st, className, { receipt, signature });
    } catch {
      this.toast('error', 'Não foi possível gerar o PDF.');
    }
  }

  /* -------------------------------------------------------------- helpers */

  private fail(message: string): void {
    this.error.set(message);
    document.querySelector('.ebd-sheet .p-dialog-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private toast(severity: 'success' | 'info' | 'error', detail: string): void {
    this.messages.add({ severity, detail, life: 3500 });
  }
}

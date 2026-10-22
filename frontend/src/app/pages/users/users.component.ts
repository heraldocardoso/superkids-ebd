import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { apiErrorMessage } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { TranslatedComponent } from '../../core/i18n/translated.component';
import { Role, User, UserService } from '../../core/user.service';
import { UsersTranslations, usersTranslations } from './translations';

interface Draft {
  id: number | null;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
}

const emptyDraft = (): Draft => ({ id: null, name: '', email: '', password: '', role: 'PROFESSOR', active: true });

/** Admin only: who can sign in to the EBD app. */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    PasswordModule,
    TableModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService, ConfirmationService],
  host: { class: 'flex min-w-0 flex-col gap-4 lg:gap-5' },
  templateUrl: './users.component.html'
})
export class UsersComponent extends TranslatedComponent<UsersTranslations> implements OnInit {
  protected readonly translations = usersTranslations;

  readonly users = signal<User[]>([]);
  readonly dialogOpen = signal(false);
  readonly saving = signal(false);
  draft: Draft = emptyDraft();

  readonly me = computed(() => this.auth.user()?.email ?? null);
  readonly roleOptions = computed(() => [
    { label: this.t().roleTeacher, value: 'PROFESSOR' as Role },
    { label: this.t().roleAdmin, value: 'ADMIN' as Role }
  ]);

  constructor(
    private service: UserService,
    private auth: AuthService,
    private messages: MessageService,
    private confirm: ConfirmationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.list().subscribe({
      next: (list) => this.users.set(list),
      error: (err: unknown) => this.toastError(err)
    });
  }

  isMe(u: User): boolean {
    return u.email === this.me();
  }

  openNew(): void {
    this.draft = emptyDraft();
    this.dialogOpen.set(true);
  }

  openEdit(u: User): void {
    this.draft = { id: u.id, name: u.name, email: u.email, password: '', role: u.role, active: u.active };
    this.dialogOpen.set(true);
  }

  save(): void {
    const d = this.draft;
    const isNew = d.id === null;
    const passwordOk = isNew ? d.password.length >= 6 : !d.password || d.password.length >= 6;
    if (!d.name.trim() || !d.email.trim() || !passwordOk) {
      this.messages.add({ severity: 'warn', detail: this.t().fillAll });
      return;
    }
    this.saving.set(true);
    const request = isNew
      ? this.service.create({ name: d.name.trim(), email: d.email.trim(), password: d.password, role: d.role })
      : this.service.update(d.id!, { name: d.name.trim(), role: d.role, active: d.active, password: d.password || null });
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.messages.add({ severity: 'success', detail: isNew ? this.t().created : this.t().updated });
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toastError(err);
      }
    });
  }

  remove(u: User): void {
    this.confirm.confirm({
      header: this.t().removeTitle,
      message: this.t().removeConfirm.replace('{name}', u.name),
      acceptLabel: this.t().remove,
      rejectLabel: this.t().cancel,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () =>
        this.service.remove(u.id).subscribe({
          next: () => {
            this.users.update((list) => list.filter((x) => x.id !== u.id));
            this.messages.add({ severity: 'success', detail: this.t().removed });
          },
          error: (err: unknown) => this.toastError(err)
        })
    });
  }

  private toastError(err: unknown): void {
    this.messages.add({ severity: 'error', detail: apiErrorMessage(err, this.t().genericError) });
  }
}

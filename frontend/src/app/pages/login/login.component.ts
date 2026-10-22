import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/auth.service';
import { apiErrorStatus } from '../../core/api-error';
import { MottoComponent } from '../../shared/motto/motto.component';
import { TranslatedComponent } from '../../core/i18n/translated.component';
import { LoginTranslations, loginTranslations } from './translations';

/**
 * The EBD's own sign-in page. Same fields and same API contract as the
 * Escola de Louvor's login dialog; here it is a full page, because the EBD
 * app has nothing public to show before it.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MottoComponent, FormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login.component.html'
})
export class LoginComponent extends TranslatedComponent<LoginTranslations> implements OnInit {
  protected readonly translations = loginTranslations;

  email = '';
  password = '';

  readonly isSigningIn = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('expired')) {
      this.error.set(this.t().expired);
    }
  }

  signIn(): void {
    if (!this.email.trim() || !this.password) {
      this.error.set(this.t().missing);
      return;
    }
    this.error.set(null);
    this.isSigningIn.set(true);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.isSigningIn.set(false);
        void this.router.navigate(['/']);
      },
      error: (err: unknown) => {
        this.isSigningIn.set(false);
        const status = apiErrorStatus(err);
        this.error.set(status === 401 || status === 400 ? this.t().invalid : this.t().offline);
      }
    });
  }
}

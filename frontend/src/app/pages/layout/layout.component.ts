import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MOTTO } from '../../core/motto';
import { MottoComponent } from '../../shared/motto/motto.component';
import { TranslatedComponent } from '../../core/i18n/translated.component';
import { LayoutTranslations, layoutTranslations } from './translations';

interface NavEntry {
  route: string;
  label: keyof LayoutTranslations;
  /** SVG path(s) for the bottom bar icon. */
  icon: string;
  adminOnly?: boolean;
}

/**
 * The signed-in frame. Phone and tablet get a bottom tab bar within reach of
 * the thumb; from `lg` the tabs move up into the header, like the Louvor site.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MottoComponent, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
})
export class LayoutComponent extends TranslatedComponent<LayoutTranslations> {
  protected readonly motto = MOTTO;
  protected readonly translations = layoutTranslations;

  private readonly entries: NavEntry[] = [
    { route: '/dashboard', label: 'dashboard', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
    { route: '/roll-call', label: 'rollCall', icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9' },
    {
      route: '/students',
      label: 'students',
      icon: 'M9 3.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7M2.5 21c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5M16 3.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .8 3.5 3 3.5 6.2'
    },
    { route: '/events', label: 'events', icon: 'M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5zM8 13h2M14 13h2M8 16.5h2' },
    { route: '/reports', label: 'reports', icon: 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6' },
    {
      route: '/users',
      label: 'users',
      icon: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
      adminOnly: true
    }
  ];

  /** Desktop tabs: everything the user may open. */
  readonly nav = computed(() => this.entries.filter((e) => !e.adminOnly || this.auth.isAdmin()));
  /** Bottom bar: five at most, so the admin page moves to the header on phones. */
  readonly bottomNav = computed(() => this.entries.filter((e) => !e.adminOnly));

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    super();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

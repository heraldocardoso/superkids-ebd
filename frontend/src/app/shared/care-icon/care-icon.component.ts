import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CareKind } from '../../core/care';

let nextId = 0;

/**
 * One care icon. Drawn inline so it takes the colour from the theme; the
 * autism puzzle piece keeps its four colours, the most recognised symbol.
 */
@Component({
  selector: 'app-care-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-grid place-items-center' },
  template: `
    @switch (kind()) {
      @case ('autism') {
        <svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()" aria-hidden="true">
          <defs>
            <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ef4444" />
              <stop offset=".3" stop-color="#ef4444" />
              <stop offset=".3" stop-color="#facc15" />
              <stop offset=".52" stop-color="#facc15" />
              <stop offset=".52" stop-color="#3b82f6" />
              <stop offset=".76" stop-color="#3b82f6" />
              <stop offset=".76" stop-color="#38bdf8" />
              <stop offset="1" stop-color="#38bdf8" />
            </linearGradient>
          </defs>
          <path
            d="M3 7.5h4.6a2.6 2.6 0 1 1 5.2 0H17.5v4.6a2.6 2.6 0 1 1 0 5.2V21.5H3z"
            [attr.fill]="'url(#' + gradientId + ')'"
          />
        </svg>
      }
      @default {
        <svg
          viewBox="0 0 24 24"
          [attr.width]="size()"
          [attr.height]="size()"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          [class]="colour[kind()]"
        >
          @switch (kind()) {
            @case ('noBible') {
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
              <path d="M12 6v7M9.5 8.5h5" />
              <path d="M2.5 2.5l19 19" stroke-width="2.6" />
            }
            @case ('allergy') {
              <path d="M12 3l9.5 17h-19z" />
              <path d="M12 10v4.5M12 17.5v.01" />
            }
            @case ('diet') {
              <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 4-3 7h3v11" />
            }
            @case ('needs') {
              <circle cx="12" cy="4.5" r="1.8" />
              <path d="M5 8.5l7 1.5 7-1.5M12 10v5M12 15l-3.5 6M12 15l3.5 6" />
            }
            @case ('medication') {
              <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-35 12 12)" />
              <path d="M9.2 8l5.6 8" />
            }
            @case ('siblings') {
              <circle cx="8" cy="7" r="3" />
              <circle cx="17" cy="9" r="2.4" />
              <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6M13.5 20c.2-2.6 1.6-4.6 3.5-4.6s3.4 2 3.5 4.6" />
            }
          }
        </svg>
      }
    }
  `
})
export class CareIconComponent {
  readonly kind = input.required<CareKind>();
  readonly size = input(16);

  protected readonly gradientId = `care-autism-${++nextId}`;

  protected readonly colour: Record<CareKind, string> = {
    noBible: 'text-accent',
    autism: '',
    allergy: 'text-status-danger',
    diet: 'text-status-warning',
    needs: 'text-status-info',
    medication: 'text-care-medication',
    siblings: 'text-status-success'
  };
}

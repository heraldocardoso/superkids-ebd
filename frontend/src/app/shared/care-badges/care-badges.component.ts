import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { CareItem, CareKind } from '../../core/care';
import { CareIconComponent } from '../care-icon/care-icon.component';

/**
 * The row of care icons on a card. On a phone there is no hover, so a tap on
 * any icon opens a bubble with every care item and its detail
 * ("Alergia: amendoim"), plus a shortcut to the full form.
 */
@Component({
  selector: 'app-care-badges',
  standalone: true,
  imports: [OverlayPanelModule, CareIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex min-w-0' },
  template: `
    @if (items().length) {
      <span class="flex flex-nowrap gap-1 overflow-hidden">
        @for (item of items(); track item.kind) {
          <button
            type="button"
            class="relative grid h-[1.4rem] w-[1.4rem] shrink-0 place-items-center rounded-md bg-surface-sunken transition-shadow after:absolute after:-inset-2 after:content-['']"
            [class.ring-2]="open() === item.kind"
            [class.ring-accent]="open() === item.kind"
            [attr.aria-label]="item.label + (item.detail ? ': ' + item.detail : '')"
            (click)="toggle($event, item.kind, panel)"
          >
            <app-care-icon [kind]="item.kind" [size]="14" />
          </button>
        }
      </span>

      <p-overlayPanel #panel [style]="{ width: 'min(19rem, calc(100vw - 1.5rem))' }" (onHide)="open.set(null)">
        <div class="flex flex-col gap-3">
          <p class="m-0 truncate font-heading text-[0.95rem] font-extrabold">{{ name() }}</p>
          <ul class="m-0 flex list-none flex-col gap-2 p-0">
            @for (item of ordered(); track item.kind) {
              <li class="flex items-start gap-2.5 text-sm leading-snug text-ink-muted">
                <span class="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-sunken">
                  <app-care-icon [kind]="item.kind" [size]="15" />
                </span>
                <span>
                  <b class="text-ink">{{ item.label }}{{ item.detail ? ':' : '' }}</b>
                  {{ item.detail }}
                </span>
              </li>
            }
          </ul>
          <button
            type="button"
            class="self-start rounded-md border border-border bg-surface px-3 py-2 text-sm font-bold text-ink hover:bg-border"
            (click)="panel.hide(); openRecord.emit()"
          >
            Abrir ficha
          </button>
        </div>
      </p-overlayPanel>
    }
  `
})
export class CareBadgesComponent {
  readonly items = input.required<CareItem[]>();
  readonly name = input('');
  readonly openRecord = output<void>();

  protected readonly open = signal<CareKind | null>(null);

  /** The icon that was tapped comes first in the bubble. */
  protected readonly ordered = computed(() => {
    const first = this.open();
    return [...this.items()].sort((a, b) => Number(b.kind === first) - Number(a.kind === first));
  });

  protected toggle(event: Event, kind: CareKind, panel: OverlayPanel): void {
    event.stopPropagation();
    if (this.open() === kind && panel.overlayVisible) {
      panel.hide();
      return;
    }
    this.open.set(kind);
    panel.show(event, event.currentTarget);
  }
}


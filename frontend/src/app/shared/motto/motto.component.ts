import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MOTTO } from '../../core/motto';

/**
 * "1/168": one hour out of the 168 in a week. `strip` sits under the app
 * header on every page; `card` is the larger version on the login page.
 */
@Component({
  selector: 'app-motto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'strip') {
      <div class="flex min-w-0 items-center gap-2.5">
        <span class="shrink-0 rounded-md bg-accent px-1.5 py-0.5 font-heading text-xs font-black text-ink-on-accent">{{ m.ratio }}</span>
        <p class="m-0 min-w-0 text-[0.8rem] leading-snug">
          <b class="font-extrabold text-ink">{{ m.line }}</b>
          @if (showMission()) {
            <span class="hidden text-ink-muted md:inline"> · {{ m.mission }}</span>
          }
        </p>
      </div>
    } @else {
      <figure class="m-0 flex gap-4 rounded-lg border border-accent/35 bg-accent/[0.06] p-4 sm:p-5">
        <span class="shrink-0 font-heading text-3xl font-black leading-none text-accent sm:text-4xl">{{ m.ratio }}</span>
        <figcaption class="flex flex-col gap-1.5">
          <b class="text-base font-extrabold leading-snug sm:text-lg">{{ m.line }}</b>
          <span class="text-sm leading-relaxed text-ink-muted">{{ m.mission }}</span>
        </figcaption>
      </figure>
    }
  `
})
export class MottoComponent {
  readonly variant = input<'strip' | 'card'>('strip');
  readonly showMission = input(true);
  protected readonly m = MOTTO;
}

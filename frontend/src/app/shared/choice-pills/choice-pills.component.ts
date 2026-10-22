import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface Choice<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

let nextId = 0;

/**
 * Yes / No (and similar) as big tappable pills — one tap, no dropdown. A real
 * radio group underneath, so keyboard and screen readers work as expected.
 */
@Component({
  selector: 'app-choice-pills',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap items-center gap-2' },
  template: `
    @if (question()) {
      <span class="basis-full font-bold text-ink sm:mr-1.5 sm:flex-1 sm:basis-56">{{ question() }}</span>
    }
    <span class="flex flex-wrap gap-2" role="radiogroup" [attr.aria-label]="question() || null">
      @for (option of options(); track option.label) {
        <label
          class="inline-flex min-h-[2.75rem] cursor-pointer select-none items-center gap-2 rounded-full border-[1.5px] px-3.5 py-2 font-bold transition-colors"
          [class]="
            option.disabled || disabled()
              ? 'cursor-not-allowed border-border bg-surface-raised text-ink-muted opacity-40'
              : value() === option.value
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-surface-raised text-ink-muted hover:border-border-strong hover:text-ink'
          "
        >
          <input
            type="radio"
            class="m-0 h-[1.1rem] w-[1.1rem] accent-[hsl(var(--ui--color-accent))]"
            [name]="name"
            [checked]="value() === option.value"
            [disabled]="option.disabled || disabled()"
            (change)="value.set(option.value)"
          />
          {{ option.label }}
        </label>
      }
    </span>
  `
})
export class ChoicePillsComponent<T> {
  readonly options = input.required<Choice<T>[]>();
  readonly question = input<string>('');
  readonly disabled = input(false);
  readonly value = model<T | null>(null);

  protected readonly name = `choice-${++nextId}`;
}

export const YES_NO: Choice<boolean>[] = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' }
];

export const NO_YES: Choice<boolean>[] = [
  { value: false, label: 'Não' },
  { value: true, label: 'Sim' }
];

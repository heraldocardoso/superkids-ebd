import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { initials } from '../../core/dates';
import { PhotoService } from '../../core/photo.service';

/**
 * The round photo, or the initials when there is none (or no authorization).
 * A red badge marks a form with important data missing.
 */
@Component({
  selector: 'app-student-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative inline-block shrink-0' },
  template: `
    <span
      class="grid place-items-center overflow-hidden rounded-full border-2 bg-surface-raised font-heading font-black text-accent"
      [class]="ringClass()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.font-size.px]="size() * 0.34"
    >
      @if (photo(); as url) {
        <img [src]="url" alt="" class="h-full w-full object-cover" />
      } @else {
        {{ letters() }}
      }
    </span>
    @if (incomplete()) {
      <span
        class="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-surface bg-[#ef4444] text-[0.7rem] font-black text-white"
        title="Ficha incompleta"
        aria-label="Ficha incompleta"
        >!</span
      >
    }
  `
})
export class StudentAvatarComponent {
  private readonly photos = inject(PhotoService);

  readonly studentId = input<number | null>(null);
  readonly firstName = input<string | null>('');
  readonly lastName = input<string | null>('');
  readonly hasPhoto = input(false);
  readonly incomplete = input(false);
  readonly size = input(46);
  readonly highlight = input(false);

  /** A photo picked in the form but not saved yet. */
  readonly previewUrl = input<string | null>(null);

  protected readonly letters = computed(() => initials(this.firstName(), this.lastName()));

  protected readonly photo = computed(() => {
    const preview = this.previewUrl();
    if (preview) {
      return preview;
    }
    return this.photos.url(this.studentId(), this.hasPhoto())();
  });

  protected readonly ringClass = computed(() => (this.highlight() ? 'border-accent' : 'border-border'));
}

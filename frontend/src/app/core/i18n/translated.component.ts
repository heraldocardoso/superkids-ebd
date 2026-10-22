import { computed, inject, Signal } from '@angular/core';
import { I18nService } from './i18n.service';
import { TranslationSet } from './language';

/**
 * Base class for every component that shows text.
 *
 * ```ts
 * export class HomeComponent extends TranslatedComponent<HomeTranslations> {
 *   protected readonly translations = homeTranslations;
 * }
 * ```
 *
 * The template then reads `{{ t().title }}`, and switching language re-renders
 * because `t` is a computed signal over the active language.
 */
export abstract class TranslatedComponent<T extends object> {
  protected readonly i18n = inject(I18nService);

  /** Supplied by the subclass, normally imported from its `translations.ts`. */
  protected abstract readonly translations: TranslationSet<T>;

  /** Current language's strings. Lazy, so the subclass field is already set. */
  readonly t: Signal<T> = computed(() => this.translations[this.i18n.language()]);
}

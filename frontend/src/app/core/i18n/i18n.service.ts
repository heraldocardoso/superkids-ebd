import { Injectable, signal } from '@angular/core';
import { DEFAULT_LANGUAGE, isLanguage, Language } from './language';

const STORAGE_KEY = 'language';

/**
 * Holds the active language. Components never read this directly — they extend
 * `TranslatedComponent` and read `t()`.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly current = signal<Language>(this.detect());

  readonly language = this.current.asReadonly();

  constructor() {
    this.applyToDocument(this.current());
  }

  setLanguage(language: Language): void {
    this.current.set(language);
    this.applyToDocument(language);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* private mode / storage disabled — the choice just won't survive a reload */
    }
  }

  /**
   * The reader's own stored choice, or Portuguese.
   *
   * `navigator.language` is deliberately NOT consulted. This is a Portuguese
   * church and the site should open in Portuguese for everyone, with the other
   * languages there for whoever wants them. Following the browser meant a
   * visitor on an English phone landed on an English page they never asked
   * for — and once someone picks a language, that choice is what sticks.
   */
  private detect(): Language {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) {
        return stored;
      }
    } catch {
      /* private mode / storage disabled - fall through to the default */
    }

    return DEFAULT_LANGUAGE;
  }

  private applyToDocument(language: Language): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }
}

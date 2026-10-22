/**
 * Languages the app ships with.
 *
 * A EBD começa só em português. A estrutura é a mesma da Escola de Louvor:
 * para acrescentar inglês, espanhol ou francês basta pôr o código aqui e o
 * TypeScript passa a exigir essas chaves em cada `translations.ts`.
 */
export const LANGUAGES = ['pt'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'pt';

export const LANGUAGE_LABELS: Record<Language, string> = {
  pt: 'Português'
};

/**
 * A component's translations: the same key set, once per language.
 * Declare the keys in the `pt` entry and let TypeScript force the others to
 * match, so a missing key is a compile error rather than a blank label.
 */
export type TranslationSet<T extends object> = Record<Language, T>;

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

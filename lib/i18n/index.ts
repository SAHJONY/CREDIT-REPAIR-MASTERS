/**
 * New850 i18n layer — Spanish-first.
 *
 * Canonical string source for the client portal. Supersedes the partial
 * hardcoded ES map in components/global-language-switcher.tsx (left
 * untouched; do not modify or break it).
 */
export { dictionaries, es, en } from "./dictionaries";
export type { SupportedLang } from "./dictionaries";
export { t } from "./t";
export { BANNED_ES, BANNED_EN, scanNoPromises } from "./banned";

export const LANGUAGE_DEFAULT = "es" as const;

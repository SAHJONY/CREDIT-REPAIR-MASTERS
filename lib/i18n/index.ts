/**
 * New850 i18n layer — Spanish-first.
 *
 * Canonical string source for the client portal. Supersedes the partial
 * hardcoded ES map in components/global-language-switcher.tsx (left
 * untouched; do not modify or break it).
 */
export { dictionaries, es, en } from "./dictionaries.ts";
export type { SupportedLang } from "./dictionaries.ts";
export { t } from "./t.ts";
export { BANNED_ES, BANNED_EN, scanNoPromises } from "./banned.ts";

export const LANGUAGE_DEFAULT = "es" as const;

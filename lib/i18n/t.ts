import { dictionaries, type SupportedLang } from "./dictionaries.ts";

/**
 * t(lang, key, vars?) — translate a dictionary key.
 *
 * - `lang` missing, null, or anything other than 'es'/'en' → Spanish ('es').
 * - Missing key → returns the key itself and logs a console.warn.
 * - Supports {placeholder} interpolation from `vars`.
 */
export function t(
  lang: SupportedLang | string | undefined | null,
  key: string,
  vars?: Record<string, string>,
): string {
  const resolved: SupportedLang = lang === "en" || lang === "es" ? lang : "es";
  const table = dictionaries[resolved];
  let text = table[key];
  if (text === undefined) {
    console.warn(`[i18n] missing key "${key}" (lang: ${resolved})`);
    return key;
  }
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(value);
    }
  }
  return text;
}

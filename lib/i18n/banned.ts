/**
 * No-promise guardrails for Spanish (and English) customer-facing copy.
 *
 * Any text that goes to a customer, a bureau, or a furnisher must pass
 * scanNoPromises() with zero hits before it is sent or rendered.
 */

export const BANNED_ES: RegExp[] = [
  /garantiz\w*/i,
  /\+ ?\d{2,3} ?puntos/i,
  /borramos todo/i,
  /100% (de éxito|aprobado)/i,
  /elimina(r|mos) todo/i,
  /pago por adelantado/i,
];

export const BANNED_EN: RegExp[] = [
  /guaranteed/i,
  /\+ ?\d{2,3} ?points/i,
  /delete everything/i,
  /100% (success|approved)/i,
  /upfront payment/i,
];

/**
 * Returns the `.source` of every banned pattern matched in `text`.
 * Empty array = clean.
 */
export function scanNoPromises(text: string): string[] {
  const hits: string[] = [];
  for (const pattern of [...BANNED_ES, ...BANNED_EN]) {
    if (pattern.test(text)) hits.push(pattern.source);
  }
  return hits;
}

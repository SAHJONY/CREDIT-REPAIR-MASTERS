/**
 * Spanish FCRA dispute letter templates — DRAFTS ONLY.
 *
 * Factual framing only ("información inexacta o no verificable"). Every
 * disputed item is tied to a real report item id (evidenciaId). Each letter
 * carries the FCRA rights notice and contains ZERO guarantee language —
 * every template must pass scanNoPromises() before use.
 *
 * Formal "usted" form, Latin American neutral Spanish.
 */

export const FCRA_RIGHTS_LINE_ES =
  "Aviso de derechos: bajo la FCRA §611 (15 U.S.C. § 1681i), usted tiene derecho " +
  "a disputar información inexacta o no verificable y a recibir una investigación " +
  "razonable dentro de los 30 días. La decisión final sobre cada elemento corresponde " +
  "al buró de crédito.";

export interface DisputeItemES {
  /** Creditor / furnisher name as shown on the report. */
  acreedor: string;
  /** Account number (masked ok) or report item reference. */
  cuenta: string;
  /** Factual reason for the dispute. */
  motivo: string;
  /** Real report item id this dispute is tied to. */
  evidenciaId: string;
}

export interface DisputeRoundInputES {
  fecha: string;
  nombre_cliente: string;
  direccion_cliente: string;
  ciudad_estado_zip: string;
  nombre_buro: string;
  direccion_buro: string;
  items: DisputeItemES[];
}

function renderItems(items: DisputeItemES[]): string {
  return items
    .map(
      (it, i) =>
        `${i + 1}. Acreedor: ${it.acreedor} | Cuenta: ${it.cuenta}\n` +
        `   Motivo de la disputa: ${it.motivo}\n` +
        `   Referencia de evidencia: ${it.evidenciaId}`,
    )
    .join("\n\n");
}

function encabezado(input: DisputeRoundInputES): string {
  return (
    `${input.fecha}\n\n` +
    `${input.nombre_buro}\n` +
    `${input.direccion_buro}\n\n` +
    `De:\n${input.nombre_cliente}\n${input.direccion_cliente}\n${input.ciudad_estado_zip}\n`
  );
}

/**
 * Round 1 — factual verification request under FCRA §611.
 */
export function disputeRound1ES(input: DisputeRoundInputES): string {
  return (
    encabezado(input) +
    `\nAsunto: Solicitud de investigación — verificación factual (FCRA §611)\n\n` +
    `Estimado departamento de disputas:\n\n` +
    `Me dirijo a usted para solicitar la investigación de la siguiente información ` +
    `contenida en mi reporte de crédito, la cual considero inexacta o no verificable, ` +
    `conforme a la Fair Credit Reporting Act (FCRA), Sección 611 (15 U.S.C. § 1681i):\n\n` +
    renderItems(input.items) +
    `\n\nSolicito que cada elemento sea verificado con el acreedor correspondiente ` +
    `y que se corrija o suprima toda información que no pueda verificarse de forma ` +
    `precisa y completa.\n\n` +
    `${FCRA_RIGHTS_LINE_ES}\n\n` +
    `Atentamente,\n${input.nombre_cliente}\n`
  );
}

/**
 * Round 2 — escalation: request the method of verification
 * (FCRA §611(a)(6)(B)(iii)) after an unsatisfactory Round 1 response.
 */
export function disputeRound2ES(
  input: DisputeRoundInputES & { fecha_ronda_anterior?: string },
): string {
  const ref = input.fecha_ronda_anterior
    ? ` del ${input.fecha_ronda_anterior}`
    : "";
  return (
    encabezado(input) +
    `\nAsunto: Segunda solicitud — descripción del método de verificación (FCRA §611)\n\n` +
    `Estimado departamento de disputas:\n\n` +
    `El ${input.fecha} presenté una disputa sobre los elementos listados abajo${ref}, ` +
    `y la respuesta recibida no resolvió la inexactitud señalada. Conforme a la FCRA ` +
    `§611(a)(6)(B)(iii), solicito una descripción del método de verificación utilizado ` +
    `para cada elemento, incluyendo el nombre y la dirección del acreedor contactado:\n\n` +
    renderItems(input.items) +
    `\n\nSi la información no puede verificarse de forma precisa y completa, solicito ` +
    `que se corrija o suprima del reporte.\n\n` +
    `${FCRA_RIGHTS_LINE_ES}\n\n` +
    `Atentamente,\n${input.nombre_cliente}\n`
  );
}

/**
 * Round 3 — escalation mentioning a CFPB complaint. Still just a letter draft;
 * no complaint is filed by this function.
 */
export function disputeRound3ES(
  input: DisputeRoundInputES & { fecha_ronda_anterior?: string },
): string {
  const ref = input.fecha_ronda_anterior
    ? ` del ${input.fecha_ronda_anterior}`
    : "";
  return (
    encabezado(input) +
    `\nAsunto: Tercera solicitud — escalación y aviso de queja ante la CFPB (FCRA §611)\n\n` +
    `Estimado departamento de disputas:\n\n` +
    `He presentado dos rondas de disputa sobre los elementos listados abajo${ref}, ` +
    `sin que la información inexacta o no verificable haya sido corregida. ` +
    `Solicito una reinvestigación completa de cada elemento:\n\n` +
    renderItems(input.items) +
    `\n\nDe no recibir una resolución conforme a la FCRA §611, me reservo el derecho ` +
    `de presentar una queja formal ante la Oficina de Protección Financiera del ` +
    `Consumidor (CFPB) y ante la fiscalía general de mi estado.\n\n` +
    `${FCRA_RIGHTS_LINE_ES}\n\n` +
    `Atentamente,\n${input.nombre_cliente}\n`
  );
}

export interface PayForDeleteInputES {
  fecha: string;
  nombre_cliente: string;
  direccion_cliente: string;
  ciudad_estado_zip: string;
  nombre_acreedor: string;
  direccion_acreedor: string;
  cuenta: string;
  monto_oferta: string;
  /** Real report item id this offer is tied to. */
  evidenciaId: string;
}

/**
 * Pay-for-delete offer to a furnisher/collector. A negotiation proposal only:
 * payment is conditioned on written confirmation that the tradeline will be
 * removed from the client's reports.
 */
export function payForDeleteES(input: PayForDeleteInputES): string {
  return (
    `${input.fecha}\n\n` +
    `${input.nombre_acreedor}\n` +
    `${input.direccion_acreedor}\n\n` +
    `De:\n${input.nombre_cliente}\n${input.direccion_cliente}\n${input.ciudad_estado_zip}\n\n` +
    `Asunto: Propuesta de pago condicionado a la eliminación del registro — Cuenta ${input.cuenta}\n\n` +
    `Estimados señores:\n\n` +
    `En relación con la cuenta ${input.cuenta} (referencia de evidencia: ${input.evidenciaId}), ` +
    `les propongo un pago único de ${input.monto_oferta}, condicionado a que me confirmen ` +
    `por escrito que, una vez recibido el pago, solicitarán a los burós de crédito la ` +
    `eliminación de esta cuenta de mis reportes.\n\n` +
    `Este pago se realizará únicamente después de recibir dicha confirmación escrita. ` +
    `Esta propuesta no constituye un reconocimiento de la validez del monto reclamado.\n\n` +
    `${FCRA_RIGHTS_LINE_ES}\n\n` +
    `Atentamente,\n${input.nombre_cliente}\n`
  );
}

export interface GoodwillInputES {
  fecha: string;
  nombre_cliente: string;
  direccion_cliente: string;
  ciudad_estado_zip: string;
  nombre_acreedor: string;
  direccion_acreedor: string;
  cuenta: string;
  /** Brief factual context (e.g. one late payment during a documented hardship). */
  detalle: string;
}

/**
 * Goodwill adjustment letter. Does NOT dispute accuracy — it acknowledges the
 * history and asks the furnisher for a courtesy adjustment.
 */
export function goodwillES(input: GoodwillInputES): string {
  return (
    `${input.fecha}\n\n` +
    `${input.nombre_acreedor}\n` +
    `${input.direccion_acreedor}\n\n` +
    `De:\n${input.nombre_cliente}\n${input.direccion_cliente}\n${input.ciudad_estado_zip}\n\n` +
    `Asunto: Solicitud de ajuste de buena voluntad — Cuenta ${input.cuenta}\n\n` +
    `Estimados señores:\n\n` +
    `Les escribo respecto a la cuenta ${input.cuenta}. No disputo la exactitud del ` +
    `historial reportado; ${input.detalle} ` +
    `Desde entonces, mi historial de pagos con ustedes se ha mantenido al día.\n\n` +
    `Les pido respetuosamente que consideren, como gesto de buena voluntad, solicitar ` +
    `a los burós de crédito el ajuste o la eliminación de la marca negativa asociada ` +
    `a esta cuenta. Comprendo que esta decisión queda a su entera discreción.\n\n` +
    `${FCRA_RIGHTS_LINE_ES}\n\n` +
    `Atentamente,\n${input.nombre_cliente}\n`
  );
}

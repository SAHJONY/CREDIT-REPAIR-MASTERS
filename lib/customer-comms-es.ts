/**
 * Spanish-first customer message templates (WhatsApp-friendly).
 *
 * Warm, concise, realistic — no score promises, no guarantees, no invented
 * fees. Each function returns a short message; keep under ~400 chars where
 * possible. EN mirrors live in `commsEN` with identical keys.
 */

export interface CommsTemplates {
  bienvenida(nombre: string): string;
  solicitudDocumentos(nombre: string, documentos: string[]): string;
  actualizacionRonda(nombre: string, ronda: number, items: number): string;
  ventanaInvestigacionAbierta(nombre: string, buro: string, dias: number): string;
  ventanaVencida(nombre: string, buro: string): string;
  casoCerrado(nombre: string, resumen: string): string;
  tipUtilizacion(): string;
  tipHistorialPagos(): string;
  tipInquiries(): string;
}

export const commsES: CommsTemplates = {
  bienvenida: (nombre) =>
    `¡Hola ${nombre}! Bienvenido(a) a New850. Ya revisamos su reporte y preparamos su plan de disputas. Le avisaremos de cada avance por aquí. Cualquier duda, escríbanos.`,

  solicitudDocumentos: (nombre, documentos) =>
    `Hola ${nombre}, para continuar con su caso necesitamos: ${documentos.join(", ")}. Súbalos en su portal cuando pueda; sin ellos no podemos enviar las disputas.`,

  actualizacionRonda: (nombre, ronda, items) =>
    `Hola ${nombre}, enviamos su ronda ${ronda} con ${items} elemento(s) en disputa. El buró tiene hasta 30 días para investigar. Le avisaremos cuando llegue la respuesta.`,

  ventanaInvestigacionAbierta: (nombre, buro, dias) =>
    `Hola ${nombre}, ${buro} confirmó que su disputa está en investigación. La ventana cierra en aprox. ${dias} días. Le avisaremos en cuanto haya respuesta.`,

  ventanaVencida: (nombre, buro) =>
    `Hola ${nombre}, la ventana de investigación de ${buro} ya venció sin respuesta completa. Preparamos la siguiente ronda de escalación. Le compartiremos el borrador para su aprobación.`,

  casoCerrado: (nombre, resumen) =>
    `Hola ${nombre}, cerramos su ronda actual. Resumen: ${resumen} Seguimos monitoreando su reporte y le avisaremos de cualquier cambio.`,

  tipUtilizacion: () =>
    `Tip de crédito: la utilización es lo que debe frente a su límite. Mantenerla por debajo del 30% suele verse mejor en su perfil. Sin promesas: es un hábito, no un atajo.`,

  tipHistorialPagos: () =>
    `Tip de crédito: pagar a tiempo cada mes es el hábito con más peso en su historial. Si puede, active pagos automáticos al menos por el mínimo.`,

  tipInquiries: () =>
    `Tip de crédito: cada solicitud de crédito deja una consulta que puede bajar su puntaje por un tiempo. Solicite crédito solo cuando realmente lo necesite.`,
};

export const commsEN: CommsTemplates = {
  bienvenida: (nombre) =>
    `Hi ${nombre}! Welcome to New850. We've reviewed your report and prepared your dispute plan. We'll update you here on every step. Just reply with any questions.`,

  solicitudDocumentos: (nombre, documentos) =>
    `Hi ${nombre}, to move your case forward we need: ${documentos.join(", ")}. Please upload them in your portal when you can; we can't send disputes without them.`,

  actualizacionRonda: (nombre, ronda, items) =>
    `Hi ${nombre}, we sent your round ${ronda} with ${items} disputed item(s). The bureau has up to 30 days to investigate. We'll let you know when the response arrives.`,

  ventanaInvestigacionAbierta: (nombre, buro, dias) =>
    `Hi ${nombre}, ${buro} confirmed your dispute is under investigation. The window closes in about ${dias} days. We'll notify you as soon as there's a response.`,

  ventanaVencida: (nombre, buro) =>
    `Hi ${nombre}, the ${buro} investigation window closed without a full response. We're preparing the next escalation round and will share the draft for your approval.`,

  casoCerrado: (nombre, resumen) =>
    `Hi ${nombre}, we've closed your current round. Summary: ${resumen} We'll keep monitoring your report and notify you of any change.`,

  tipUtilizacion: () =>
    `Credit tip: utilization is what you owe versus your limit. Keeping it under 30% usually looks better on your profile. No promises: it's a habit, not a shortcut.`,

  tipHistorialPagos: () =>
    `Credit tip: paying on time every month is the habit that carries the most weight in your history. If you can, set up autopay for at least the minimum.`,

  tipInquiries: () =>
    `Credit tip: each credit application leaves an inquiry that can lower your score for a while. Apply for credit only when you truly need it.`,
};

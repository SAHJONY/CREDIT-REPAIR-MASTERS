/**
 * New850 i18n dictionaries — Spanish-first client portal strings.
 *
 * Spanish ('es') is the default language. Every key exists in BOTH tables;
 * lib/i18n/i18n.test.ts enforces identical key sets so no translation is
 * ever missing in either direction.
 *
 * SUPERSEDES the partial hardcoded ES map in
 * components/global-language-switcher.tsx (client-side DOM text-swap hack).
 * That component is intentionally left untouched; these dictionaries are the
 * canonical string source going forward. All strings from the switcher's ES
 * map are included here verbatim (see "switcher parity" comments).
 *
 * Tone: Latin American neutral Spanish. Formal templates use "usted".
 */

export type SupportedLang = "es" | "en";

export const es: Record<string, string> = {
  // ── nav ──────────────────────────────────────────────────────────
  // (switcher parity: every English source string in the switcher's ES map
  // has its verbatim Spanish translation here)
  "nav.home": "Inicio",
  "nav.services": "Servicios",
  "nav.howItWorks": "Cómo funciona",
  "nav.results": "Resultados",
  "nav.pricing": "Precios",
  "nav.education": "Educación",
  "nav.about": "Nosotros",
  "nav.getStarted": "Comenzar",
  "nav.getStartedNow": "Comenzar ahora",
  "nav.clientPortal": "Portal del cliente",
  "nav.staff": "Equipo",
  "nav.dashboard": "Panel",
  "nav.clients": "Clientes",
  "nav.documents": "Documentos",
  "nav.payments": "Pagos",
  "nav.billing": "Facturación",
  "nav.compliance": "Cumplimiento",
  "nav.creditProgress": "Progreso de crédito",
  "nav.reportsScores": "Reportes y puntajes",
  "nav.disputes": "Disputas",
  "nav.account": "Cuenta",
  "nav.accountSettings": "Configuración",
  "nav.signIn": "Iniciar sesión",
  "nav.signOut": "Cerrar sesión",
  "nav.secureConfidential": "Seguro y confidencial",

  // ── dashboard ────────────────────────────────────────────────────
  "dashboard.title": "Panel del cliente",
  "dashboard.welcome": "Le damos la bienvenida, {nombre}",
  "dashboard.creditProgress": "Progreso de crédito",
  "dashboard.reportsScores": "Reportes y puntajes",
  "dashboard.itemsUnderReview": "Elementos en revisión",
  "dashboard.progressOverview": "Resumen del progreso",
  "dashboard.recentActivity": "Actividad reciente",
  "dashboard.viewProgress": "Ver tu progreso",
  "dashboard.viewReports": "Ver reportes",
  "dashboard.viewDocuments": "Ver documentos",
  "dashboard.viewBilling": "Ver facturación",
  "dashboard.financialEducation": "Educación financiera",
  "dashboard.currentScore": "Puntaje actual",
  "dashboard.scoreChange": "Cambio de puntaje",
  "dashboard.noActivity": "Aún no hay actividad registrada.",
  "dashboard.nextRound": "Próxima ronda",
  "dashboard.openCases": "Casos abiertos",
  "dashboard.documentsNeeded": "Documentos pendientes",
  "dashboard.creditReports": "Reportes de crédito",

  // ── disputes ─────────────────────────────────────────────────────
  "disputes.title": "Disputas",
  "disputes.newDispute": "Nueva disputa",
  "disputes.round1": "Ronda 1 — Verificación factual",
  "disputes.round2": "Ronda 2 — Método de verificación",
  "disputes.round3": "Ronda 3 — Escalación",
  "disputes.status.pending": "Pendiente",
  "disputes.status.investigation": "En investigación",
  "disputes.status.responded": "Respuesta recibida",
  "disputes.status.completed": "Completado",
  "disputes.investigationWindow": "Ventana de investigación",
  "disputes.investigationWindowOpen": "Ventana de investigación abierta",
  "disputes.investigationWindowClosed": "Ventana de investigación cerrada",
  "disputes.windowDaysRemaining": "Quedan {dias} días",
  "disputes.bureau.equifax": "Equifax",
  "disputes.bureau.experian": "Experian",
  "disputes.bureau.transunion": "TransUnion",
  "disputes.viewLetters": "Ver cartas",
  "disputes.itemsDisputed": "Elementos disputados",
  "disputes.evidenceAttached": "Evidencia adjunta",
  "disputes.submittedOn": "Enviado el {fecha}",
  "disputes.responseReceived": "Respuesta recibida el {fecha}",
  "disputes.noDisputes": "No tiene disputas activas en este momento.",
  "disputes.emptyCta": "Iniciar una revisión de su reporte",
  "disputes.roundStatus": "Estado de la ronda",
  "disputes.furnisherResponse": "Respuesta del acreedor",
  "disputes.whatHappensNext": "Qué sigue",
  "disputes.methodOfVerification": "Método de verificación",
  "disputes.letterDraft": "Borrador de carta",

  // ── documents ────────────────────────────────────────────────────
  "documents.title": "Documentos",
  "documents.upload": "Subir documento",
  "documents.required": "Documentos requeridos",
  "documents.idFront": "Identificación (frente)",
  "documents.idBack": "Identificación (reverso)",
  "documents.proofOfAddress": "Comprobante de domicilio",
  "documents.ssnCard": "Tarjeta de Seguro Social",
  "documents.status.pending": "Pendiente de revisión",
  "documents.status.verified": "Verificado",
  "documents.status.rejected": "Rechazado",
  "documents.uploadInstructions":
    "Suba fotos claras de sus documentos. Aceptamos PDF, JPG y PNG.",
  "documents.acceptedFormats": "Formatos aceptados: PDF, JPG, PNG",
  "documents.maxSize": "Tamaño máximo: {mb} MB",
  "documents.noDocuments": "Aún no ha subido documentos.",
  "documents.emptyCta": "Subir mi primer documento",
  "documents.missingForDispute":
    "Faltan documentos para continuar con su disputa",

  // ── education ────────────────────────────────────────────────────
  "education.title": "Educación financiera",
  "education.utilization": "Utilización de crédito",
  "education.paymentHistory": "Historial de pagos",
  "education.inquiries": "Consultas (inquiries)",
  "education.creditMix": "Mezcla de crédito",
  "education.lengthOfHistory": "Antigüedad del historial",
  "education.readTime": "{minutos} min de lectura",
  "education.markComplete": "Marcar como completada",
  "education.completedLesson": "Lección completada",
  "education.snippetUtilization":
    "La utilización es el saldo usado frente a su límite disponible. Mantenerla baja suele verse mejor en su perfil.",
  "education.snippetPaymentHistory":
    "Pagar a tiempo, cada mes, es el hábito que más peso tiene en su historial.",
  "education.snippetInquiries":
    "Las consultas duras pueden afectar su puntaje temporalmente; solicite crédito solo cuando lo necesite.",

  // ── auth ─────────────────────────────────────────────────────────
  "auth.signIn": "Iniciar sesión",
  "auth.signOut": "Cerrar sesión",
  "auth.email": "Correo electrónico",
  "auth.password": "Contraseña",
  "auth.createAccount": "Crear cuenta",
  "auth.forgotPassword": "¿Olvidó su contraseña?",
  "auth.signInButton": "Entrar",
  "auth.createAccountButton": "Crear mi cuenta",
  "auth.welcomeBack": "Bienvenido de nuevo",
  "auth.invalidCredentials":
    "Correo o contraseña incorrectos. Inténtelo de nuevo.",
  "auth.checkEmail": "Revise su correo para continuar.",

  // ── letters ──────────────────────────────────────────────────────
  "letters.title": "Cartas de disputa",
  "letters.round1Name": "Carta de verificación — Ronda 1",
  "letters.round2Name": "Solicitud de método de verificación — Ronda 2",
  "letters.round3Name": "Escalación con queja CFPB — Ronda 3",
  "letters.payForDeleteName": "Oferta de pago por eliminación",
  "letters.goodwillName": "Carta de buena voluntad",
  "letters.preview": "Vista previa",
  "letters.download": "Descargar",
  "letters.copyText": "Copiar texto",
  "letters.generatedOn": "Generada el {fecha}",
  "letters.fcraRights":
    "Bajo la FCRA §611 (15 U.S.C. § 1681i), usted tiene derecho a disputar información inexacta o no verificable y a recibir una investigación razonable dentro de los 30 días.",

  // ── common ───────────────────────────────────────────────────────
  "common.save": "Guardar",
  "common.cancel": "Cancelar",
  "common.continue": "Continuar",
  "common.close": "Cerrar",
  "common.open": "Abrir",
  "common.pending": "Pendiente",
  "common.completed": "Completado",
  "common.current": "Actual",
  "common.back": "Atrás",
  "common.next": "Siguiente",
  "common.submit": "Enviar",
  "common.delete": "Eliminar",
  "common.edit": "Editar",
  "common.search": "Buscar",
  "common.loading": "Cargando…",
  "common.tryAgain": "Intentar de nuevo",
  "common.viewAll": "Ver todo",
  "common.yes": "Sí",
  "common.no": "No",
  "common.optional": "Opcional",
  "common.required": "Obligatorio",

  // ── errors ───────────────────────────────────────────────────────
  "errors.generic": "Ocurrió un error inesperado. Inténtelo de nuevo.",
  "errors.network":
    "No pudimos conectarnos. Revise su conexión e inténtelo de nuevo.",
  "errors.notFound": "No encontramos lo que buscaba.",
  "errors.unauthorized":
    "Su sesión expiró o no tiene permiso. Inicie sesión de nuevo.",
  "errors.validation": "Revise los campos marcados e inténtelo de nuevo.",
  "errors.uploadFailed": "No se pudo subir el archivo. Inténtelo de nuevo.",
  "errors.sessionExpired": "Su sesión expiró. Inicie sesión de nuevo.",
  "errors.tryLater": "Algo salió mal de nuestro lado. Inténtelo más tarde.",
};

export const en: Record<string, string> = {
  // ── nav ──────────────────────────────────────────────────────────
  "nav.home": "Home",
  "nav.services": "Services",
  "nav.howItWorks": "How It Works",
  "nav.results": "Results",
  "nav.pricing": "Pricing",
  "nav.education": "Education",
  "nav.about": "About Us",
  "nav.getStarted": "Get Started",
  "nav.getStartedNow": "Get Started Now",
  "nav.clientPortal": "Client Portal",
  "nav.staff": "Staff",
  "nav.dashboard": "Dashboard",
  "nav.clients": "Clients",
  "nav.documents": "Documents",
  "nav.payments": "Payments",
  "nav.billing": "Billing",
  "nav.compliance": "Compliance",
  "nav.creditProgress": "Credit Progress",
  "nav.reportsScores": "Reports & Scores",
  "nav.disputes": "Disputes",
  "nav.account": "Account",
  "nav.accountSettings": "Account Settings",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.secureConfidential": "Secure & Confidential",

  // ── dashboard ────────────────────────────────────────────────────
  "dashboard.title": "Client Dashboard",
  "dashboard.welcome": "Welcome back, {nombre}",
  "dashboard.creditProgress": "Credit Progress",
  "dashboard.reportsScores": "Reports & Scores",
  "dashboard.itemsUnderReview": "Items Under Review",
  "dashboard.progressOverview": "Progress Overview",
  "dashboard.recentActivity": "Recent Activity",
  "dashboard.viewProgress": "View Your Progress",
  "dashboard.viewReports": "View Reports",
  "dashboard.viewDocuments": "View Documents",
  "dashboard.viewBilling": "View Billing",
  "dashboard.financialEducation": "Financial Education",
  "dashboard.currentScore": "Current Score",
  "dashboard.scoreChange": "Score Change",
  "dashboard.noActivity": "No activity recorded yet.",
  "dashboard.nextRound": "Next Round",
  "dashboard.openCases": "Open Cases",
  "dashboard.documentsNeeded": "Documents Needed",
  "dashboard.creditReports": "Credit Reports",

  // ── disputes ─────────────────────────────────────────────────────
  "disputes.title": "Disputes",
  "disputes.newDispute": "New Dispute",
  "disputes.round1": "Round 1 — Factual Verification",
  "disputes.round2": "Round 2 — Method of Verification",
  "disputes.round3": "Round 3 — Escalation",
  "disputes.status.pending": "Pending",
  "disputes.status.investigation": "Under Investigation",
  "disputes.status.responded": "Response Received",
  "disputes.status.completed": "Completed",
  "disputes.investigationWindow": "Investigation Window",
  "disputes.investigationWindowOpen": "Investigation Window Open",
  "disputes.investigationWindowClosed": "Investigation Window Closed",
  "disputes.windowDaysRemaining": "{dias} days remaining",
  "disputes.bureau.equifax": "Equifax",
  "disputes.bureau.experian": "Experian",
  "disputes.bureau.transunion": "TransUnion",
  "disputes.viewLetters": "View Letters",
  "disputes.itemsDisputed": "Items Disputed",
  "disputes.evidenceAttached": "Evidence Attached",
  "disputes.submittedOn": "Submitted on {fecha}",
  "disputes.responseReceived": "Response received on {fecha}",
  "disputes.noDisputes": "You have no active disputes right now.",
  "disputes.emptyCta": "Start a review of my report",
  "disputes.roundStatus": "Round Status",
  "disputes.furnisherResponse": "Furnisher Response",
  "disputes.whatHappensNext": "What Happens Next",
  "disputes.methodOfVerification": "Method of Verification",
  "disputes.letterDraft": "Letter Draft",

  // ── documents ────────────────────────────────────────────────────
  "documents.title": "Documents",
  "documents.upload": "Upload Document",
  "documents.required": "Required Documents",
  "documents.idFront": "ID (front)",
  "documents.idBack": "ID (back)",
  "documents.proofOfAddress": "Proof of Address",
  "documents.ssnCard": "Social Security Card",
  "documents.status.pending": "Pending Review",
  "documents.status.verified": "Verified",
  "documents.status.rejected": "Rejected",
  "documents.uploadInstructions":
    "Upload clear photos of your documents. We accept PDF, JPG, and PNG.",
  "documents.acceptedFormats": "Accepted formats: PDF, JPG, PNG",
  "documents.maxSize": "Maximum size: {mb} MB",
  "documents.noDocuments": "You haven't uploaded any documents yet.",
  "documents.emptyCta": "Upload my first document",
  "documents.missingForDispute":
    "Documents are missing to continue with your dispute",

  // ── education ────────────────────────────────────────────────────
  "education.title": "Financial Education",
  "education.utilization": "Credit Utilization",
  "education.paymentHistory": "Payment History",
  "education.inquiries": "Inquiries",
  "education.creditMix": "Credit Mix",
  "education.lengthOfHistory": "Length of History",
  "education.readTime": "{minutos} min read",
  "education.markComplete": "Mark as Complete",
  "education.completedLesson": "Lesson Completed",
  "education.snippetUtilization":
    "Utilization is the balance you use versus your available limit. Keeping it low usually looks better on your profile.",
  "education.snippetPaymentHistory":
    "Paying on time, every month, is the habit that carries the most weight in your history.",
  "education.snippetInquiries":
    "Hard inquiries can affect your score temporarily; apply for credit only when you need it.",

  // ── auth ─────────────────────────────────────────────────────────
  "auth.signIn": "Sign in",
  "auth.signOut": "Sign out",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.createAccount": "Create Account",
  "auth.forgotPassword": "Forgot your password?",
  "auth.signInButton": "Sign In",
  "auth.createAccountButton": "Create my account",
  "auth.welcomeBack": "Welcome back",
  "auth.invalidCredentials":
    "Incorrect email or password. Please try again.",
  "auth.checkEmail": "Check your email to continue.",

  // ── letters ──────────────────────────────────────────────────────
  "letters.title": "Dispute Letters",
  "letters.round1Name": "Verification Letter — Round 1",
  "letters.round2Name": "Method of Verification Request — Round 2",
  "letters.round3Name": "Escalation with CFPB Complaint — Round 3",
  "letters.payForDeleteName": "Pay-for-Delete Offer",
  "letters.goodwillName": "Goodwill Letter",
  "letters.preview": "Preview",
  "letters.download": "Download",
  "letters.copyText": "Copy Text",
  "letters.generatedOn": "Generated on {fecha}",
  "letters.fcraRights":
    "Under FCRA §611 (15 U.S.C. § 1681i), you have the right to dispute inaccurate or unverifiable information and to receive a reasonable investigation within 30 days.",

  // ── common ───────────────────────────────────────────────────────
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.continue": "Continue",
  "common.close": "Close",
  "common.open": "Open",
  "common.pending": "Pending",
  "common.completed": "Completed",
  "common.current": "Current",
  "common.back": "Back",
  "common.next": "Next",
  "common.submit": "Submit",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.search": "Search",
  "common.loading": "Loading…",
  "common.tryAgain": "Try again",
  "common.viewAll": "View all",
  "common.yes": "Yes",
  "common.no": "No",
  "common.optional": "Optional",
  "common.required": "Required",

  // ── errors ───────────────────────────────────────────────────────
  "errors.generic": "Something unexpected happened. Please try again.",
  "errors.network":
    "We couldn't connect. Check your connection and try again.",
  "errors.notFound": "We couldn't find what you were looking for.",
  "errors.unauthorized":
    "Your session expired or you don't have permission. Please sign in again.",
  "errors.validation": "Please review the highlighted fields and try again.",
  "errors.uploadFailed": "The file couldn't be uploaded. Please try again.",
  "errors.sessionExpired": "Your session expired. Please sign in again.",
  "errors.tryLater": "Something went wrong on our end. Please try again later.",
};

export const dictionaries: Record<SupportedLang, Record<string, string>> = {
  es,
  en,
};

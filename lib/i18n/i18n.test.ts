import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { es, en } from "./dictionaries.ts";
import { t } from "./t.ts";
import { LANGUAGE_DEFAULT } from "./index.ts";
import {
  FCRA_RIGHTS_LINE_ES,
  disputeRound1ES,
  disputeRound2ES,
  disputeRound3ES,
  payForDeleteES,
  goodwillES,
  type DisputeRoundInputES,
} from "../dispute-templates-es.ts";
import { commsES, commsEN } from "../customer-comms-es.ts";
import { BANNED_ES, BANNED_EN, scanNoPromises } from "./banned.ts";

const sampleInput: DisputeRoundInputES = {
  fecha: "17 de septiembre de 2026",
  nombre_cliente: "María Ejemplo",
  direccion_cliente: "123 Calle Principal, Apt 4",
  ciudad_estado_zip: "Houston, TX 77001",
  nombre_buro: "Equifax",
  direccion_buro: "P.O. Box 740256, Atlanta, GA 30374",
  items: [
    {
      acreedor: "Banco Ficticio",
      cuenta: "****1234",
      motivo: "Saldo reportado no coincide con mis registros",
      evidenciaId: "EV-2026-0042",
    },
    {
      acreedor: "Cobros S.A.",
      cuenta: "****9876",
      motivo: "Cuenta no reconocida; solicito verificación",
      evidenciaId: "EV-2026-0043",
    },
  ],
};

describe("dictionaries", () => {
  it("ES and EN have identical key sets", () => {
    const esKeys = Object.keys(es).sort();
    const enKeys = Object.keys(en).sort();
    assert.deepEqual(enKeys, esKeys);
    assert.ok(esKeys.length > 100, `expected >100 keys, got ${esKeys.length}`);
  });

  it("covers every string from the legacy switcher ES map (superset)", () => {
    const switcherPairs: Array<[string, string]> = [
      ["nav.home", "Inicio"],
      ["nav.services", "Servicios"],
      ["nav.howItWorks", "Cómo funciona"],
      ["nav.results", "Resultados"],
      ["nav.pricing", "Precios"],
      ["nav.education", "Educación"],
      ["nav.about", "Nosotros"],
      ["nav.getStarted", "Comenzar"],
      ["nav.getStartedNow", "Comenzar ahora"],
      ["nav.clientPortal", "Portal del cliente"],
      ["nav.staff", "Equipo"],
      ["nav.dashboard", "Panel"],
      ["nav.clients", "Clientes"],
      ["nav.documents", "Documentos"],
      ["nav.payments", "Pagos"],
      ["nav.billing", "Facturación"],
      ["nav.compliance", "Cumplimiento"],
      ["nav.creditProgress", "Progreso de crédito"],
      ["nav.reportsScores", "Reportes y puntajes"],
      ["nav.disputes", "Disputas"],
      ["nav.account", "Cuenta"],
      ["nav.accountSettings", "Configuración"],
      ["dashboard.viewProgress", "Ver tu progreso"],
      ["dashboard.viewReports", "Ver reportes"],
      ["dashboard.viewDocuments", "Ver documentos"],
      ["dashboard.viewBilling", "Ver facturación"],
      ["dashboard.creditReports", "Reportes de crédito"],
      ["dashboard.itemsUnderReview", "Elementos en revisión"],
      ["dashboard.progressOverview", "Resumen del progreso"],
      ["dashboard.recentActivity", "Actividad reciente"],
      ["dashboard.financialEducation", "Educación financiera"],
      ["nav.secureConfidential", "Seguro y confidencial"],
      ["common.pending", "Pendiente"],
      ["common.completed", "Completado"],
      ["common.current", "Actual"],
      ["common.open", "Abrir"],
      ["common.close", "Cerrar"],
      ["common.save", "Guardar"],
      ["common.cancel", "Cancelar"],
      ["common.continue", "Continuar"],
      ["auth.signIn", "Iniciar sesión"],
      ["auth.signOut", "Cerrar sesión"],
    ];
    for (const [key, expectedEs] of switcherPairs) {
      assert.equal(es[key], expectedEs, `missing switcher key ${key}`);
    }
  });
});

describe("t()", () => {
  it("returns Spanish for t('es', key)", () => {
    assert.equal(t("es", "nav.home"), "Inicio");
    assert.equal(t("es", "disputes.title"), "Disputas");
  });

  it("returns English for t('en', key)", () => {
    assert.equal(t("en", "nav.home"), "Home");
  });

  it("defaults to ES when lang is missing or invalid", () => {
    assert.equal(LANGUAGE_DEFAULT, "es");
    assert.equal(t(undefined, "nav.home"), "Inicio");
    assert.equal(t(null, "nav.home"), "Inicio");
    assert.equal(t("fr", "nav.home"), "Inicio");
    assert.equal(t("", "nav.home"), "Inicio");
  });

  it("returns the key and warns on missing key", () => {
    const origWarn = console.warn;
    let warned = false;
    console.warn = () => {
      warned = true;
    };
    try {
      assert.equal(t("es", "no.such.key"), "no.such.key");
      assert.equal(warned, true);
    } finally {
      console.warn = origWarn;
    }
  });

  it("interpolates {placeholders}", () => {
    assert.equal(t("es", "dashboard.welcome", { nombre: "María" }), "Le damos la bienvenida, María");
    assert.equal(t("es", "disputes.windowDaysRemaining", { dias: "12" }), "Quedan 12 días");
  });
});

describe("dispute templates", () => {
  const r1 = disputeRound1ES(sampleInput);
  const r2 = disputeRound2ES(sampleInput);
  const r3 = disputeRound3ES(sampleInput);
  const pfd = payForDeleteES({
    fecha: sampleInput.fecha,
    nombre_cliente: sampleInput.nombre_cliente,
    direccion_cliente: sampleInput.direccion_cliente,
    ciudad_estado_zip: sampleInput.ciudad_estado_zip,
    nombre_acreedor: "Cobros S.A.",
    direccion_acreedor: "P.O. Box 999, Dallas, TX 75201",
    cuenta: "****9876",
    monto_oferta: "$450",
    evidenciaId: "EV-2026-0043",
  });
  const gw = goodwillES({
    fecha: sampleInput.fecha,
    nombre_cliente: sampleInput.nombre_cliente,
    direccion_cliente: sampleInput.direccion_cliente,
    ciudad_estado_zip: sampleInput.ciudad_estado_zip,
    nombre_acreedor: "Banco Ficticio",
    direccion_acreedor: "P.O. Box 111, Houston, TX 77001",
    cuenta: "****1234",
    detalle: "tuve un pago tardío durante una dificultad documentada.",
  });
  const all = [r1, r2, r3, pfd, gw];

  it("all templates pass scanNoPromises with zero hits", () => {
    for (const text of all) {
      assert.deepEqual(scanNoPromises(text), []);
    }
  });

  it("banned lists are non-empty and match what they claim", () => {
    assert.ok(BANNED_ES.length > 0);
    assert.ok(BANNED_EN.length > 0);
    assert.notDeepEqual(scanNoPromises("Garantizamos +120 puntos, borramos todo"), []);
    assert.notDeepEqual(scanNoPromises("guaranteed approval, delete everything"), []);
  });

  it("all documented placeholders are replaced (no {…} remnants)", () => {
    for (const text of all) {
      assert.ok(!/\{[^}]+\}/.test(text), "found unreplaced placeholder");
    }
  });

  it("each disputed item is tied to its evidence id", () => {
    for (const text of [r1, r2, r3]) {
      assert.ok(text.includes("EV-2026-0042"));
      assert.ok(text.includes("EV-2026-0043"));
    }
    assert.ok(pfd.includes("EV-2026-0043"));
  });

  it("every template includes the FCRA rights line", () => {
    for (const text of all) {
      assert.ok(text.includes(FCRA_RIGHTS_LINE_ES));
      assert.ok(text.includes("FCRA"));
    }
  });

  it("R1/R2/R3 are distinct with escalating language", () => {
    assert.notEqual(r1, r2);
    assert.notEqual(r2, r3);
    assert.ok(r1.includes("verificación factual"));
    assert.ok(/método de verificación/i.test(r2));
    assert.ok(r3.includes("CFPB"));
  });

  it("pay-for-delete conditions payment on written confirmation", () => {
    assert.ok(/confirmaci.n escrita/i.test(pfd));
    assert.ok(pfd.includes("$450"));
  });

  it("goodwill letter does not dispute accuracy", () => {
    assert.ok(/no disputo la exactitud/i.test(gw));
  });
});

describe("customer comms", () => {
  it("ES and EN mirrors expose identical keys", () => {
    const esKeys = Object.keys(commsES).sort();
    const enKeys = Object.keys(commsEN).sort();
    assert.deepEqual(enKeys, esKeys);
  });

  it("messages are warm, concise, and promise-free", () => {
    const nombre = "María Ejemplo";
    const msgs = [
      commsES.bienvenida(nombre),
      commsES.solicitudDocumentos(nombre, ["identificación", "comprobante de domicilio"]),
      commsES.actualizacionRonda(nombre, 1, 2),
      commsES.ventanaInvestigacionAbierta(nombre, "Equifax", 20),
      commsES.ventanaVencida(nombre, "Experian"),
      commsES.casoCerrado(nombre, "2 elementos corregidos, 1 en seguimiento."),
      commsES.tipUtilizacion(),
      commsES.tipHistorialPagos(),
      commsES.tipInquiries(),
    ];
    for (const m of msgs) {
      assert.ok(m.length <= 400, `message too long (${m.length} chars)`);
      assert.deepEqual(scanNoPromises(m), []);
    }
    for (const m of msgs.slice(0, 6)) {
      assert.ok(m.includes("María Ejemplo"));
    }
    assert.ok(commsEN.bienvenida(nombre).includes("María Ejemplo"));
  });
});

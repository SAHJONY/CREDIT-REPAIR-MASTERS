export type StateComplianceMode = "validated" | "manual_review_required" | "blocked";

export interface StateComplianceRule {
  jurisdiction: string;
  name: string;
  mode: StateComplianceMode;
  federalBaseline: true;
  advanceFeeRestricted: boolean;
  writtenContractRequired: boolean;
  cancellationRightsRequired: boolean;
  stateOverlayValidated: boolean;
  notes: string[];
  sources: string[];
}

export const STATE_RULES_VERSION = "2026-08-16.1";

const JURISDICTIONS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida",
  GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
  NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming"
};

const FEDERAL_SOURCES = [
  "https://www.ftc.gov/legal-library/browse/statutes/credit-repair-organizations-act",
  "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/"
];

const FEDERAL_NOTES = [
  "CROA baseline: no deceptive representations; written contract/disclosures and cancellation rights apply; advance payment restrictions apply.",
  "FCRA baseline: disputes must concern information the consumer believes is inaccurate or incomplete; frivolous disputes must not be generated.",
  "Accurate negative information must not be challenged merely because it is negative."
];

const florida: StateComplianceRule = {
  jurisdiction: "FL",
  name: "Florida",
  mode: "validated",
  federalBaseline: true,
  advanceFeeRestricted: true,
  writtenContractRequired: true,
  cancellationRightsRequired: true,
  stateOverlayValidated: true,
  notes: [
    ...FEDERAL_NOTES,
    "Florida Credit Service Organizations Act, Chapter 817 Part III, applies to covered credit-service organizations.",
    "Florida Statute 817.7005 restricts receiving consideration before full performance unless statutory bond/trust-account conditions are satisfied.",
    "False or misleading statements to a consumer reporting agency or creditor are prohibited."
  ],
  sources: [
    ...FEDERAL_SOURCES,
    "https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&StatuteYear=2025&Title=->2025->Chapter%20817->Part%20III&URL=0800-0899/0817/0817PartIIIContentsIndex.html",
    "https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0800-0899/0817/Sections/0817.7005.html"
  ]
};

export const stateComplianceRules: Record<string, StateComplianceRule> = Object.fromEntries(
  Object.entries(JURISDICTIONS).map(([jurisdiction, name]) => [
    jurisdiction,
    jurisdiction === "FL" ? florida : {
      jurisdiction,
      name,
      mode: "manual_review_required" as const,
      federalBaseline: true as const,
      advanceFeeRestricted: true,
      writtenContractRequired: true,
      cancellationRightsRequired: true,
      stateOverlayValidated: false,
      notes: [
        ...FEDERAL_NOTES,
        "State-specific licensing, registration, bonding, fee, contract, disclosure, and cancellation requirements have not yet been validated in this runtime.",
        "External credit-repair actions for this jurisdiction require compliance review; automation must fail closed."
      ],
      sources: FEDERAL_SOURCES
    }
  ])
);

export function resolveStateCompliance(state: string | undefined): StateComplianceRule {
  const code = state?.trim().toUpperCase();
  if (code && stateComplianceRules[code]) return stateComplianceRules[code];
  return {
    jurisdiction: code || "UNKNOWN",
    name: "Unknown jurisdiction",
    mode: "blocked",
    federalBaseline: true,
    advanceFeeRestricted: true,
    writtenContractRequired: true,
    cancellationRightsRequired: true,
    stateOverlayValidated: false,
    notes: [...FEDERAL_NOTES, "Unknown or unsupported jurisdiction: consequential external actions are blocked."],
    sources: FEDERAL_SOURCES
  };
}

export function stateComplianceRuntimeSummary() {
  const rules = Object.values(stateComplianceRules);
  return {
    version: STATE_RULES_VERSION,
    jurisdictions: rules.length,
    validated: rules.filter((rule) => rule.mode === "validated").length,
    manualReviewRequired: rules.filter((rule) => rule.mode === "manual_review_required").length,
    failClosed: true,
    runtimeReady: rules.length === 51 && rules.every((rule) => rule.federalBaseline)
  };
}

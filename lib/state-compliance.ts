export type StateComplianceMode = 'validated' | 'manual_review_required' | 'blocked';
export type AdvanceFeePolicy = 'post_performance_only' | 'preperformance_only_if_bonded_or_trust' | 'unknown';
export type RegistrationPolicy = 'required' | 'conditional' | 'not_identified' | 'unknown';
export type BondPolicy = 'required' | 'conditional_for_advance_fees' | 'not_identified' | 'unknown';

export interface StateComplianceRule {
  jurisdiction: string;
  name: string;
  mode: StateComplianceMode;
  federalBaseline: true;
  stateOverlayValidated: boolean;
  verifiedAt?: string;
  advanceFeeRestricted: boolean;
  advanceFeePolicy: AdvanceFeePolicy;
  writtenContractRequired: boolean;
  cancellationRightsRequired: boolean;
  cancellationDays?: number;
  cancellationUsesWorkingDays?: boolean;
  maxPerformanceDays?: number;
  monthlyStatementRequired?: boolean;
  registrationPolicy: RegistrationPolicy;
  bondPolicy: BondPolicy;
  externalCommunicationAuthorizationRequired?: boolean;
  redactSensitiveIdentifiersOnExternalCommunications?: boolean;
  notes: string[];
  sources: string[];
}

export const STATE_RULES_VERSION = '2026-08-17.2';

const JURISDICTIONS: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska',
  NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
  PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming'
};

const FEDERAL_SOURCES = [
  'https://www.ftc.gov/legal-library/browse/statutes/credit-repair-organizations-act',
  'https://www.ftc.gov/legal-library/browse/rules/telemarketing-sales-rule',
  'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/'
];

const FEDERAL_NOTES = [
  'CROA baseline: deceptive representations are prohibited; covered credit-repair agreements require mandated disclosures, written contracts, cancellation rights, and advance-payment restrictions.',
  'FCRA baseline: disputes must be grounded in information the consumer believes is inaccurate or incomplete; frivolous or knowingly false disputes must not be generated.',
  'Accurate negative information must not be challenged merely because it is negative.',
  'Telemarketing transactions are routed through the separate TSR payment and consent gate.'
];

function validatedRule(input: Omit<StateComplianceRule, 'mode' | 'federalBaseline' | 'stateOverlayValidated' | 'verifiedAt'>): StateComplianceRule {
  return {
    ...input,
    mode: 'validated',
    federalBaseline: true,
    stateOverlayValidated: true,
    verifiedAt: '2026-08-17'
  };
}

const validated: Record<string, StateComplianceRule> = {
  AZ: validatedRule({
    jurisdiction: 'AZ', name: 'Arizona', advanceFeeRestricted: true,
    advanceFeePolicy: 'preperformance_only_if_bonded_or_trust', writtenContractRequired: true,
    cancellationRightsRequired: true, cancellationDays: 3, cancellationUsesWorkingDays: false,
    registrationPolicy: 'not_identified', bondPolicy: 'conditional_for_advance_fees',
    notes: [...FEDERAL_NOTES,
      'Arizona Revised Statutes Title 44, Chapter 11, Article 7 governs covered credit services organizations.',
      'Arizona prohibits collecting consideration before full and complete performance unless the organization has the statutory surety bond.',
      'The buyer must receive the statutory information statement before contract execution or payment, and the organization must retain the signed acknowledgment for two years.',
      'Every contract must be written, dated, signed, contain the required three-day cancellation statement, and be accompanied by the detachable statutory cancellation form.',
      'Written communications to buyers, furnishers, creditors, and consumer reporting agencies must identify the organization by complete name and address and state that the communication is from a credit services organization.'
    ],
    sources: [...FEDERAL_SOURCES,
      'https://www.azleg.gov/ars/44/01703.htm',
      'https://www.azleg.gov/ars/44/01704.htm',
      'https://www.azleg.gov/ars/44/01705.htm',
      'https://www.azleg.gov/ars/44/01706.htm',
      'https://www.azleg.gov/ars/44/01708.htm',
      'https://www.azleg.gov/ars/44/01713.htm'
    ]
  }),
  FL: validatedRule({
    jurisdiction: 'FL', name: 'Florida', advanceFeeRestricted: true,
    advanceFeePolicy: 'preperformance_only_if_bonded_or_trust', writtenContractRequired: true,
    cancellationRightsRequired: true, cancellationDays: 5, cancellationUsesWorkingDays: false,
    registrationPolicy: 'not_identified', bondPolicy: 'conditional_for_advance_fees',
    notes: [...FEDERAL_NOTES,
      'Florida Chapter 817 Part III applies to covered credit service organizations.',
      'Florida restricts pre-performance consideration unless the statutory surety-bond and trust-account conditions are satisfied.',
      'The contract must contain the statutory five-day cancellation language and be accompanied by the cancellation form.'
    ],
    sources: [...FEDERAL_SOURCES,
      'https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0800-0899/0817/Sections/0817.7005.html',
      'https://www.leg.state.fl.us/STATUTES/index.cfm?App_mode=Display_Statute&Search_String=&URL=0800-0899/0817/Sections/0817.704.html'
    ]
  }),
  CA: validatedRule({
    jurisdiction: 'CA', name: 'California', advanceFeeRestricted: true,
    advanceFeePolicy: 'post_performance_only', writtenContractRequired: true,
    cancellationRightsRequired: true, cancellationDays: 5, cancellationUsesWorkingDays: true,
    maxPerformanceDays: 180, monthlyStatementRequired: true,
    registrationPolicy: 'required', bondPolicy: 'required',
    notes: [...FEDERAL_NOTES,
      'California Credit Services Act prohibits charging before full and complete performance.',
      'Covered services must be performed within 180 days and monthly statements are required.',
      'A five-working-day cancellation notice is required.',
      'A $100,000 surety bond and Department of Justice registration are statutory prerequisites to conducting business.'
    ],
    sources: [...FEDERAL_SOURCES,
      'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?article=&chapter=&division=3.&lawCode=CIV&part=4.&title=1.6E.',
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1789.25.'
    ]
  }),
  TX: validatedRule({
    jurisdiction: 'TX', name: 'Texas', advanceFeeRestricted: true,
    advanceFeePolicy: 'preperformance_only_if_bonded_or_trust', writtenContractRequired: true,
    cancellationRightsRequired: true, cancellationDays: 3, cancellationUsesWorkingDays: false,
    maxPerformanceDays: 180, registrationPolicy: 'required', bondPolicy: 'conditional_for_advance_fees',
    notes: [...FEDERAL_NOTES,
      'Texas Finance Code Chapter 393 requires a registration statement before conducting business.',
      'Contracts must be written and the estimated service period may not exceed 180 days.',
      'The consumer has a three-day cancellation right with detachable cancellation notices.',
      'Pre-completion consideration is allowed only with the statutory surety bond or surety account.'
    ],
    sources: [...FEDERAL_SOURCES,
      'https://statutes.capitol.texas.gov/DocViewer.aspx?DocKey=FI%2FFI.393'
    ]
  }),
  NY: validatedRule({
    jurisdiction: 'NY', name: 'New York', advanceFeeRestricted: true,
    advanceFeePolicy: 'post_performance_only', writtenContractRequired: true,
    cancellationRightsRequired: true, cancellationDays: 3, cancellationUsesWorkingDays: false,
    registrationPolicy: 'not_identified', bondPolicy: 'not_identified',
    notes: [...FEDERAL_NOTES,
      'New York General Business Law Article 28-BB prohibits advance fees for covered credit-services businesses.',
      'The contract must be written, signed by both parties, and contain a detailed statement of services and intended modifications.',
      'The contract must be accompanied by the statutory three-day Notice of Cancellation.'
    ],
    sources: [...FEDERAL_SOURCES,
      'https://www.nysenate.gov/legislation/laws/GBS/A28-BB',
      'https://www.nysenate.gov/legislation/laws/GBS/458-E',
      'https://www.nysenate.gov/legislation/laws/GBS/458-F'
    ]
  }),
  IL: validatedRule({
    jurisdiction: 'IL', name: 'Illinois', advanceFeeRestricted: true,
    advanceFeePolicy: 'preperformance_only_if_bonded_or_trust', writtenContractRequired: true,
    cancellationRightsRequired: true, cancellationDays: 3, cancellationUsesWorkingDays: false,
    registrationPolicy: 'required', bondPolicy: 'conditional_for_advance_fees',
    notes: [...FEDERAL_NOTES,
      'Illinois Credit Services Organizations Act requires registration with the Secretary of State before conducting business.',
      'Contracts require the statutory three-day cancellation notice and two detachable copies.',
      'Illinois administrative rules require a $100,000 surety bond when consideration is charged or received before full and complete performance.'
    ],
    sources: [...FEDERAL_SOURCES,
      'https://www.ilga.gov/Legislation/ILCS/Articles?ActID=2365&ChapterID=67',
      'https://www.ilga.gov/agencies/JCAR/EntirePart?titlepart=01400177'
    ]
  }),
  WA: validatedRule({
    jurisdiction: 'WA', name: 'Washington', advanceFeeRestricted: true,
    advanceFeePolicy: 'preperformance_only_if_bonded_or_trust', writtenContractRequired: true,
    cancellationRightsRequired: true, cancellationDays: 5, cancellationUsesWorkingDays: true,
    maxPerformanceDays: 180, registrationPolicy: 'not_identified', bondPolicy: 'conditional_for_advance_fees',
    externalCommunicationAuthorizationRequired: true, redactSensitiveIdentifiersOnExternalCommunications: true,
    notes: [...FEDERAL_NOTES,
      'Washington Chapter 19.134 RCW requires the statutory information statement before contract execution or payment.',
      'Contracts include a five-working-day cancellation right and a service period not exceeding 180 days.',
      'Written communications to consumer reporting agencies, creditors, collection agencies, or regulatory entities require prior written consumer authorization.',
      'External written communications must redact sensitive identifiers except where full values are legally permissible and required for the objective.'
    ],
    sources: [...FEDERAL_SOURCES,
      'https://lawfilesext.leg.wa.gov/Law/RCW/RCW%20%2019%20%20TITLE/RCW%20%2019%20.134%20%20CHAPTER/RCW%20%2019%20.134%20%20CHAPTER.htm',
      'https://lawfilesext.leg.wa.gov/biennium/2023-24/Htm/Bills/Session%20Laws/House/1311-S.SL.htm'
    ]
  })
};

export const stateComplianceRules: Record<string, StateComplianceRule> = Object.fromEntries(
  Object.entries(JURISDICTIONS).map(([jurisdiction, name]) => [jurisdiction, validated[jurisdiction] ?? {
    jurisdiction,
    name,
    mode: 'manual_review_required' as const,
    federalBaseline: true as const,
    stateOverlayValidated: false,
    advanceFeeRestricted: true,
    advanceFeePolicy: 'unknown' as const,
    writtenContractRequired: true,
    cancellationRightsRequired: true,
    registrationPolicy: 'unknown' as const,
    bondPolicy: 'unknown' as const,
    notes: [...FEDERAL_NOTES,
      'State-specific licensing, registration, bonding, fee, contract, disclosure, and cancellation requirements are not yet verified against an authoritative state source in this ruleset.',
      'The operating system may automate intake, evidence, document storage, analysis, and internal workflow, but consequential external actions and automated billing remain fail-closed.'
    ],
    sources: FEDERAL_SOURCES
  }])
);

export function resolveStateCompliance(state: string | undefined): StateComplianceRule {
  const code = state?.trim().toUpperCase();
  if (code && stateComplianceRules[code]) return stateComplianceRules[code];
  return {
    jurisdiction: code || 'UNKNOWN', name: 'Unknown jurisdiction', mode: 'blocked',
    federalBaseline: true, stateOverlayValidated: false, advanceFeeRestricted: true,
    advanceFeePolicy: 'unknown', writtenContractRequired: true, cancellationRightsRequired: true,
    registrationPolicy: 'unknown', bondPolicy: 'unknown',
    notes: [...FEDERAL_NOTES, 'Unknown or unsupported jurisdiction: consequential external actions are blocked.'],
    sources: FEDERAL_SOURCES
  };
}

export function mayAutomateConsequentialAction(state: string | undefined) {
  return resolveStateCompliance(state).mode === 'validated';
}

export function stateComplianceRuntimeSummary() {
  const rules = Object.values(stateComplianceRules);
  const validatedCount = rules.filter((rule) => rule.mode === 'validated').length;
  return {
    version: STATE_RULES_VERSION,
    jurisdictions: rules.length,
    validated: validatedCount,
    manualReviewRequired: rules.filter((rule) => rule.mode === 'manual_review_required').length,
    blocked: rules.filter((rule) => rule.mode === 'blocked').length,
    automationPercent: Math.round((validatedCount / rules.length) * 100),
    failClosed: true,
    federalBaselineCoverage: rules.length === 51 && rules.every((rule) => rule.federalBaseline),
    nationwideAutonomous: validatedCount === 51
  };
}

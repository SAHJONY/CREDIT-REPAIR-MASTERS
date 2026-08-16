export type CreditProviderMode = "consumer_import" | "consumer_authorized_fetch" | "commercial_api";

export interface CreditProviderLinks {
  home?: string;
  report?: string;
  dispute?: string;
  freeze?: string;
  fraudAlert?: string;
  support?: string;
  developer?: string;
  directory?: string;
}

export interface CreditDataProvider {
  id: string;
  name: string;
  category: "nationwide_bureau" | "supplementary" | "banking" | "utilities" | "employment" | "insurance" | "directory";
  modes: CreditProviderMode[];
  freeConsumerDisclosure: boolean;
  unattendedProductionApi: boolean;
  officialUrl: string;
  links: CreditProviderLinks;
  notes: string;
}

/**
 * Lawful no-cost consumer disclosure sources that can feed CREDIT REPAIR MASTERS
 * through consumer-controlled import. Entries must never be treated as an
 * unattended bureau API unless a separate contracted commercial integration is configured.
 *
 * Links are official consumer/bureau resources only. Never automate identity
 * verification, bypass authentication, or submit disputes without the consumer's
 * authorization and the platform's approval/compliance gates.
 */
export const freeCreditDataProviders: CreditDataProvider[] = [
  {
    id: "annual-credit-report",
    name: "AnnualCreditReport.com",
    category: "directory",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.annualcreditreport.com/",
    links: {
      home: "https://www.annualcreditreport.com/",
      report: "https://www.annualcreditreport.com/index.action"
    },
    notes: "Federally authorized consumer portal for free Equifax, Experian and TransUnion credit reports. Consumer authentication is required."
  },
  {
    id: "equifax",
    name: "Equifax",
    category: "nationwide_bureau",
    modes: ["consumer_import", "commercial_api"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.equifax.com/personal/credit-report-services/",
    links: {
      home: "https://www.equifax.com/personal/",
      report: "https://www.equifax.com/personal/credit-report-services/",
      dispute: "https://www.equifax.com/personal/credit-report-services/credit-dispute/",
      freeze: "https://www.equifax.com/personal/credit-report-services/credit-freeze/",
      fraudAlert: "https://www.equifax.com/personal/credit-report-services/credit-fraud-alerts/",
      support: "https://www.equifax.com/personal/help/",
      developer: "https://developer.equifax.com/"
    },
    notes: "Free consumer disclosure path is supported. Production API use requires a separate authorized commercial integration."
  },
  {
    id: "experian",
    name: "Experian",
    category: "nationwide_bureau",
    modes: ["consumer_import", "commercial_api"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.experian.com/",
    links: {
      home: "https://www.experian.com/",
      report: "https://www.experian.com/consumer-products/free-credit-report.html",
      dispute: "https://www.experian.com/disputes/main.html",
      freeze: "https://www.experian.com/freeze/center.html",
      fraudAlert: "https://www.experian.com/fraud/center.html",
      support: "https://www.experian.com/help/contact/",
      developer: "https://developer.experian.com/"
    },
    notes: "Free consumer report access is distinct from Experian developer/commercial credit APIs."
  },
  {
    id: "transunion",
    name: "TransUnion",
    category: "nationwide_bureau",
    modes: ["consumer_import", "commercial_api"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.transunion.com/",
    links: {
      home: "https://www.transunion.com/",
      report: "https://www.transunion.com/annual-credit-report",
      dispute: "https://www.transunion.com/credit-disputes/dispute-your-credit",
      freeze: "https://www.transunion.com/credit-freeze",
      fraudAlert: "https://www.transunion.com/fraud-alerts",
      support: "https://www.transunion.com/customer-support/contact-us-consumers"
    },
    notes: "Free consumer disclosure can be imported; commercial API access requires separate approval and credentials."
  },
  {
    id: "innovis",
    name: "Innovis",
    category: "supplementary",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.innovis.com/",
    links: {
      home: "https://www.innovis.com/",
      report: "https://www.innovis.com/personal/creditReport",
      dispute: "https://www.innovis.com/personal/disputeResolution",
      freeze: "https://www.innovis.com/personal/securityFreeze"
    },
    notes: "Supplementary consumer report available directly to the consumer, with official dispute and security-freeze flows."
  },
  {
    id: "lexisnexis-risk-solutions",
    name: "LexisNexis Risk Solutions",
    category: "supplementary",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://consumer.risk.lexisnexis.com/",
    links: {
      home: "https://consumer.risk.lexisnexis.com/",
      report: "https://consumer.risk.lexisnexis.com/"
    },
    notes: "Consumer disclosure can include public-record and identity-related data useful for evidence reconciliation."
  },
  {
    id: "sage-stream",
    name: "SageStream",
    category: "supplementary",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://consumer.risk.lexisnexis.com/",
    links: {
      home: "https://consumer.risk.lexisnexis.com/",
      report: "https://consumer.risk.lexisnexis.com/"
    },
    notes: "Supplementary consumer disclosure source administered through LexisNexis Risk Solutions."
  },
  {
    id: "chexsystems",
    name: "ChexSystems",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.chexsystems.com/",
    links: {
      home: "https://www.chexsystems.com/",
      report: "https://www.chexsystems.com/request-reports/consumer-disclosure",
      support: "https://www.chexsystems.com/"
    },
    notes: "Consumer portal supports disclosure reports, security freezes, security alerts, disputes and blocks."
  },
  {
    id: "early-warning-services",
    name: "Early Warning Services",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.earlywarning.com/consumer-information",
    links: {
      home: "https://www.earlywarning.com/",
      report: "https://www.earlywarning.com/consumer-information",
      dispute: "https://www.earlywarning.com/consumer-information",
      support: "https://www.earlywarning.com/consumer-information"
    },
    notes: "Consumer deposit/payment account reporting disclosure and dispute instructions."
  },
  {
    id: "telecheck",
    name: "TeleCheck",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://getassistance.telecheck.com/consumer-file-report/",
    links: {
      home: "https://getassistance.telecheck.com/",
      report: "https://getassistance.telecheck.com/consumer-file-report/"
    },
    notes: "Specialty checking/payment consumer reporting disclosure."
  },
  {
    id: "certegy",
    name: "Certegy",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.askcertegy.com/FACT.jsp",
    links: {
      home: "https://www.askcertegy.com/",
      report: "https://www.askcertegy.com/FACT.jsp"
    },
    notes: "Specialty check-risk consumer reporting disclosure."
  },
  {
    id: "nctue",
    name: "National Consumer Telecom & Utilities Exchange (NCTUE)",
    category: "utilities",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://nctue.com/consumers/",
    links: {
      home: "https://nctue.com/",
      report: "https://nctue.com/consumers/",
      freeze: "https://nctue.com/consumers/"
    },
    notes: "Telecom and utility payment-history consumer disclosure and consumer freeze resources."
  },
  {
    id: "the-work-number",
    name: "The Work Number",
    category: "employment",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://employees.theworknumber.com/",
    links: {
      home: "https://employees.theworknumber.com/",
      report: "https://employees.theworknumber.com/employee-data-report",
      freeze: "https://employees.theworknumber.com/employee-data-freeze"
    },
    notes: "Employment/income consumer data access; use only with consumer authorization and applicable permissible purpose."
  },
  {
    id: "cfpb-consumer-reporting-directory",
    name: "CFPB Consumer Reporting Company List",
    category: "directory",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/",
    links: {
      home: "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/",
      directory: "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/"
    },
    notes: "Authoritative CFPB directory for additional specialty consumer reporting companies, report-access instructions, disputes and freezes."
  }
];

export const freeImportProviders = freeCreditDataProviders.filter(
  (provider) => provider.freeConsumerDisclosure && provider.modes.includes("consumer_import")
);

export function getFreeCreditProviderCatalog() {
  return {
    providers: freeCreditDataProviders,
    count: freeCreditDataProviders.length,
    productionApiSatisfied: false,
    warning: "Free consumer disclosures support consumer-controlled import. A contracted authorized bureau API is still required for unattended live bureau ingestion."
  };
}

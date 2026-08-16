export type CreditProviderMode = "consumer_import" | "consumer_authorized_fetch" | "commercial_api";

export interface CreditDataProvider {
  id: string;
  name: string;
  category: "nationwide_bureau" | "supplementary" | "banking" | "utilities" | "employment" | "insurance" | "directory";
  modes: CreditProviderMode[];
  freeConsumerDisclosure: boolean;
  unattendedProductionApi: boolean;
  officialUrl: string;
  notes: string;
}

/**
 * Lawful no-cost consumer disclosure sources that can feed CREDIT REPAIR MASTERS
 * through consumer-controlled import. Entries must never be treated as an
 * unattended bureau API unless a separate contracted commercial integration is configured.
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
    notes: "Free consumer disclosure path is supported. Production API use requires a separate authorized commercial integration."
  },
  {
    id: "experian",
    name: "Experian",
    category: "nationwide_bureau",
    modes: ["consumer_import", "commercial_api"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.experian.com/consumer-products/free-credit-report.html",
    notes: "Free consumer report access is distinct from Experian developer/commercial credit APIs."
  },
  {
    id: "transunion",
    name: "TransUnion",
    category: "nationwide_bureau",
    modes: ["consumer_import", "commercial_api"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.transunion.com/annual-credit-report",
    notes: "Free consumer disclosure can be imported; commercial API access requires separate approval and credentials."
  },
  {
    id: "innovis",
    name: "Innovis",
    category: "supplementary",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.innovis.com/personal/creditReport",
    notes: "Supplementary consumer report available directly to the consumer."
  },
  {
    id: "lexisnexis-risk-solutions",
    name: "LexisNexis Risk Solutions",
    category: "supplementary",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://consumer.risk.lexisnexis.com/",
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
    notes: "Supplementary consumer disclosure source administered through LexisNexis Risk Solutions."
  },
  {
    id: "chexsystems",
    name: "ChexSystems",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.chexsystems.com/request-reports/consumer-disclosure",
    notes: "Consumer banking/checking account reporting disclosure."
  },
  {
    id: "early-warning-services",
    name: "Early Warning Services",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.earlywarning.com/consumer-information",
    notes: "Consumer deposit/payment account reporting disclosure."
  },
  {
    id: "telecheck",
    name: "TeleCheck",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://getassistance.telecheck.com/consumer-file-report/",
    notes: "Specialty checking/payment consumer reporting disclosure."
  },
  {
    id: "certegy",
    name: "Certegy",
    category: "banking",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://www.askcertegy.com/consumer-services/",
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
    notes: "Telecom and utility payment-history consumer disclosure."
  },
  {
    id: "the-work-number",
    name: "The Work Number",
    category: "employment",
    modes: ["consumer_import"],
    freeConsumerDisclosure: true,
    unattendedProductionApi: false,
    officialUrl: "https://employees.theworknumber.com/employee-data-freeze",
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
    notes: "Authoritative directory for additional specialty consumer reporting companies and disclosure instructions."
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

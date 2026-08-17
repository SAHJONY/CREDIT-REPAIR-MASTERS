import type { DemoDocument } from './demo-documents';

export const requiredLegalDocuments: DemoDocument[] = [
  {
    slug: 'consumer-credit-file-rights-disclosure',
    category: 'Disclosure',
    name: 'Consumer Credit File Rights Under State and Federal Law — FEDERAL REQUIRED DISCLOSURE',
    status: 'sample',
    use: 'Separate pre-contract disclosure required by 15 U.S.C. § 1679c. Preserve the statutory text and deliver before the consumer signs the service agreement.',
    sections: [
      {
        heading: 'Consumer Credit File Rights Under State and Federal Law',
        lines: [
          'You have a right to dispute inaccurate information in your credit report by contacting the credit bureau directly. However, neither you nor any credit repair company or credit repair organization has the right to have accurate, current, and verifiable information removed from your credit report. The credit bureau must remove accurate, negative information from your report only if it is over 7 years old. Bankruptcy information can be reported for 10 years.',
          'You have a right to obtain a copy of your credit report from a credit bureau. You may be charged a reasonable fee. There is no fee, however, if you have been turned down for credit, employment, insurance, or a rental dwelling because of information in your credit report within the preceding 60 days. The credit bureau must provide someone to help you interpret the information in your credit file. You are entitled to receive a free copy of your credit report if you are unemployed and intend to apply for employment in the next 60 days, if you are a recipient of public welfare assistance, or if you have reason to believe that there is inaccurate information in your credit report due to fraud.',
          'You have a right to sue a credit repair organization that violates the Credit Repair Organization Act. This law prohibits deceptive practices by credit repair organizations.',
          'You have the right to cancel your contract with any credit repair organization for any reason within 3 business days from the date you signed it.',
          'Federal Trade Commission',
          'Washington, D.C. 20580'
        ]
      },
      {
        heading: 'Consumer acknowledgment',
        lines: [
          'I acknowledge that CREDIT REPAIR MASTERS provided this statement to me as a document separate from the service agreement before I signed any credit-repair agreement.',
          'Client legal name: {{client.legalName}}',
          'Client signature: {{signature.client}}',
          'Date: {{signature.date}}',
          'Compliance record: retain the signed acknowledgment for at least the period required by federal law.'
        ]
      }
    ]
  },
  {
    slug: 'federal-notice-of-cancellation',
    category: 'Disclosure',
    name: 'Federal Notice of Cancellation — CROA FORM',
    status: 'sample',
    use: 'Federal cancellation form required to accompany a credit-repair contract under 15 U.S.C. § 1679e.',
    sections: [
      {
        heading: 'NOTICE OF CANCELLATION',
        lines: [
          'You may cancel this contract, without any penalty or obligation, at any time before midnight of the 3rd day which begins after the date the contract is signed by you.',
          'To cancel this contract, mail or deliver a signed, dated copy of this cancellation notice, or any other written notice to CREDIT REPAIR MASTERS / {{provider.legalEntity}} at {{provider.principalAddress}} before midnight on {{contract.federalCancellationDeadline}}.',
          'I hereby cancel this transaction.',
          'Date: ____________________',
          'Purchaser signature: ____________________'
        ]
      },
      {
        heading: 'Florida overlay',
        lines: [
          'Florida clients also receive the separate Florida Notice of Cancellation providing the longer five-day cancellation period. The longer applicable protection controls the operational service-start gate.'
        ]
      }
    ]
  },
  {
    slug: 'florida-credit-services-information-statement',
    category: 'Disclosure',
    name: 'Florida Credit Services Information Statement — PRODUCTION DRAFT',
    status: 'sample',
    use: 'Florida information statement structured to cover the subjects required by Fla. Stat. §§ 817.702–817.703.',
    sections: [
      {
        heading: 'Your right to review your consumer reporting agency file',
        lines: [
          'You have the right under federal law to review consumer-reporting information maintained about you by a consumer reporting agency. You may obtain disclosures directly from the consumer reporting agencies and through official free-disclosure channels for which you qualify.',
          'If you request your file from a consumer reporting agency within 30 days after receiving notice that credit has been denied, Florida law requires this statement to inform you that you may review that file at no charge.',
          'Approximate price to review your file through the official free consumer-disclosure channels used in this workflow: $0. If you choose a different paid product or monitoring service, the consumer reporting agency controls and discloses that price; purchasing such a product is not required to use CREDIT REPAIR MASTERS.'
        ]
      },
      {
        heading: 'Your right to dispute directly',
        lines: [
          'You have the right to dispute directly with a consumer reporting agency the completeness or accuracy of any item contained in a file about you maintained by that agency. You do not have to hire CREDIT REPAIR MASTERS to exercise that right.'
        ]
      },
      {
        heading: 'Accurate information cannot be permanently removed merely because it is negative',
        lines: [
          'Accurate information cannot be permanently removed from a consumer reporting agency file merely because it is adverse. CREDIT REPAIR MASTERS does not promise removal of accurate, current, and verifiable information.'
        ]
      },
      {
        heading: 'Services and total amount',
        lines: [
          'Detailed services to be performed: {{contract.serviceDescription}}',
          'Total amount the buyer will pay or become obligated to pay for those services: ${{contract.totalPrice}}',
          'Payment terms: {{contract.paymentSchedule}}'
        ]
      },
      {
        heading: 'Bond / trust account rights and information',
        lines: [
          'Florida law provides rights relating to the surety bond or trust-account mechanism required by Fla. Stat. § 817.7005 when a credit service organization relies on that mechanism to receive consideration before full and complete performance.',
          'Surety company name, if applicable: {{provider.suretyName}}',
          'Surety company address: {{provider.suretyAddress}}',
          'Depository and trustee, if applicable: {{provider.trustDepositoryAndTrustee}}',
          'Trust account number/reference, when disclosure is legally required: {{provider.trustAccountReference}}',
          'If the company is not relying on a bond/trust mechanism because the engagement is billed only after full and complete performance, the production compliance workflow must state that fact and confirm the legally appropriate disclosure before execution.'
        ]
      },
      {
        heading: 'Buyer acknowledgment',
        lines: [
          'I acknowledge receipt of this Florida Credit Services Information Statement.',
          'Buyer legal name: {{client.legalName}}',
          'Buyer signature: {{signature.client}}',
          'Date: {{signature.date}}',
          'Record retention: preserve an exact signed copy for the period required by Florida law.'
        ]
      }
    ]
  },
  {
    slug: 'florida-notice-of-cancellation',
    category: 'Disclosure',
    name: 'Florida Notice of Cancellation — 5-Day Statutory Form',
    status: 'sample',
    use: 'Florida five-day cancellation form accompanying the consumer credit-services contract.',
    sections: [
      {
        heading: 'NOTICE OF CANCELLATION',
        lines: [
          'You may cancel this contract, without any penalty or obligation, within 5 days from the date the contract is signed.',
          'If you cancel any payment made by you under this contract, it will be returned within 10 days following receipt by the credit service organization of your cancellation notice.',
          'To cancel this contract, mail or deliver a signed dated copy of this cancellation notice, or any other written notice to:',
          'CREDIT REPAIR MASTERS / {{provider.legalEntity}}',
          '{{provider.principalAddress}}',
          '{{provider.placeOfBusiness}}',
          'not later than midnight {{contract.floridaCancellationDeadline}}.',
          'I hereby cancel this transaction.',
          'Date: ____________________',
          'Purchaser signature: ____________________'
        ]
      },
      {
        heading: 'Production control',
        lines: [
          'The contract-generation workflow must calculate and insert the actual cancellation deadline and deliver the completed notice with the signed contract. The customer must be able to retain a copy.'
        ]
      }
    ]
  }
];

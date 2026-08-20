export type New850VerticalId = 'loans' | 'auto' | 'mortgage' | 'business' | 'marketplace';

export type New850Vertical = {
  id: New850VerticalId;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  serviceId: string;
  readinessFactors: readonly string[];
  journey: readonly string[];
  products: readonly string[];
  guardrail: string;
};

export const new850Verticals: Record<New850VerticalId, New850Vertical> = {
  loans: {
    id: 'loans',
    eyebrow: 'NEW850 LOANS',
    title: 'Prepare before you borrow.',
    subtitle: 'Personal loans, debt consolidation, credit cards and lines of credit start with a stronger application profile.',
    description: 'New850 measures the factors you can control, identifies blockers and helps you decide when you are better prepared to compare financing options.',
    cta: 'Build my loan readiness plan',
    serviceId: 'approval-blueprint',
    readinessFactors: ['Credit profile', 'Debt-to-income ratio', 'Revolving utilization', 'Payment history', 'Recent inquiries', 'Income stability'],
    journey: ['Define borrowing goal', 'Measure affordability and blockers', 'Improve controllable factors', 'Compare options when better prepared'],
    products: ['Personal loans', 'Debt consolidation', 'Credit cards', 'Lines of credit', 'Refinancing', 'Secured financing'],
    guardrail: 'New850 provides readiness analysis and comparison support. Financing decisions, rates and terms are determined by third-party financial institutions.'
  },
  auto: {
    id: 'auto',
    eyebrow: 'NEW850 AUTO',
    title: 'Know the payment before the dealership.',
    subtitle: 'Build an auto-buying plan around affordability, down payment, credit profile and financing readiness.',
    description: 'New850 Auto connects budget planning, credit readiness and a future vehicle marketplace so customers can shop with a defined payment range and stronger financing profile.',
    cta: 'Start my auto readiness plan',
    serviceId: 'auto-loan-ready',
    readinessFactors: ['Target vehicle budget', 'Estimated monthly payment', 'Down payment', 'Credit profile', 'DTI impact', 'Trade-in equity'],
    journey: ['Set vehicle and payment target', 'Measure auto-loan readiness', 'Improve blockers and cash position', 'Compare financing and vehicle options'],
    products: ['Auto loans', 'Refinancing', 'Dealer financing partners', 'Vehicle marketplace', 'Trade-in partners', 'Protection products later'],
    guardrail: 'New850 does not approve auto financing or sell vehicles. Partner lenders and dealers make their own underwriting, pricing and sales decisions.'
  },
  mortgage: {
    id: 'mortgage',
    eyebrow: 'NEW850 HOME',
    title: 'Prepare the file before you shop for the house.',
    subtitle: 'Mortgage readiness combines credit, DTI, reserves, down payment and documentation into one measurable plan.',
    description: 'New850 Home helps customers understand the profile and documentation typically considered in mortgage shopping, then tracks readiness before partner handoff.',
    cta: 'Build my mortgage readiness plan',
    serviceId: 'mortgage-ready-90',
    readinessFactors: ['Credit profile', 'Front-end and back-end DTI', 'Down payment', 'Cash reserves', 'Income documentation', 'Recent credit activity'],
    journey: ['Set home-price target', 'Measure mortgage readiness', 'Build reserves and documentation', 'Compare licensed mortgage options'],
    products: ['Mortgage readiness', 'Mortgage partner marketplace', 'Document vault', 'Home affordability planning', 'Realtor partners later', 'Home services later'],
    guardrail: 'New850 readiness tools are not mortgage underwriting or a commitment to lend. Mortgage origination and brokerage activity must be performed by appropriately licensed partners.'
  },
  business: {
    id: 'business',
    eyebrow: 'NEW850 BUSINESS',
    title: 'Turn business data into funding readiness.',
    subtitle: 'Organize revenue, cash flow, business profile and documents before approaching capital providers.',
    description: 'New850 Business creates a measurable funding-readiness profile so owners can see documentation gaps, financial pressure points and likely financing categories before submitting applications.',
    cta: 'Build my business funding profile',
    serviceId: 'business-credit-accelerator',
    readinessFactors: ['Business age', 'Revenue', 'Cash flow', 'Banking history', 'Business credit profile', 'Documentation completeness'],
    journey: ['Define capital use', 'Measure business readiness', 'Complete financial and entity profile', 'Compare appropriate funding categories'],
    products: ['Term loans', 'Lines of credit', 'Equipment financing', 'Working capital', 'Invoice financing', 'SBA readiness'],
    guardrail: 'New850 does not guarantee business funding. Availability, pricing and approval are determined by participating capital providers and their eligibility requirements.'
  },
  marketplace: {
    id: 'marketplace',
    eyebrow: 'NEW850 MARKETPLACE',
    title: 'Prepare first. Compare second.',
    subtitle: 'A financial marketplace designed around readiness rather than sending every customer directly into another application.',
    description: 'The marketplace foundation organizes financing categories by customer goal and readiness state. Partner ranking must remain governed, explainable and independent from undisclosed pay-to-play steering.',
    cta: 'Check my readiness first',
    serviceId: 'approval-blueprint',
    readinessFactors: ['Customer goal', 'Readiness score', 'Affordability', 'Documentation', 'Consent', 'Partner eligibility criteria'],
    journey: ['Choose a financial goal', 'Complete readiness assessment', 'Reach appropriate shopping threshold', 'Compare participating providers'],
    products: ['Loans', 'Credit cards', 'Auto financing', 'Mortgages', 'Business funding', 'Banking and other financial services later'],
    guardrail: 'Marketplace results are planning and comparison tools. Partner compensation must not override customer-fit criteria or required regulatory disclosures.'
  }
};

export const new850PrimaryNav = [
  { label: 'Readiness', href: '/loan-readiness' },
  { label: 'Loans', href: '/loans' },
  { label: 'Auto', href: '/auto' },
  { label: 'Home', href: '/mortgage' },
  { label: 'Business', href: '/business-funding' },
  { label: 'Marketplace', href: '/marketplace' }
] as const;

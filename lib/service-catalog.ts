export type ServiceAudience = 'consumer' | 'business' | 'b2b';
export type ServiceBillingModel = 'one_time' | 'monthly' | 'custom';
export type ServiceRegulatoryClass = 'consumer_credit_services' | 'business_advisory' | 'software';

export interface CommercialService {
  id: string;
  name: string;
  audience: ServiceAudience;
  billingModel: ServiceBillingModel;
  regulatoryClass: ServiceRegulatoryClass;
  priceCents?: number;
  priceRangeCents?: [number, number];
  description: string;
  deliverables: string[];
  paymentPolicy: 'post_performance' | 'standard' | 'manual_quote';
}

export const commercialServices: CommercialService[] = [
  {
    id: 'approval-blueprint',
    name: 'New850 Approval Blueprint',
    audience: 'consumer',
    billingModel: 'one_time',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 14900,
    description: 'A goal-specific readiness blueprint that shows what may be holding the customer back, what to improve first and when to reassess before applying.',
    deliverables: ['Goal-specific 0–100 New850 Readiness assessment','Credit, utilization, DTI, inquiry and reserve analysis','P0/P1/P2 blocker inventory','Prioritized 7/30/60/90-day action plan','Ready-to-Shop planning gate and reassessment targets'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'debt-optimization-plan',
    name: 'Credit & Debt Optimization Plan',
    audience: 'consumer',
    billingModel: 'one_time',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 29900,
    description: 'A quantified payoff and utilization strategy designed to improve controllable credit and debt-readiness factors before financial shopping.',
    deliverables: ['Balance and utilization analysis','Priority payoff sequence','DTI impact modeling','Target utilization thresholds','30/60/90-day optimization roadmap'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'mortgage-ready-90',
    name: 'New850 Mortgage Ready 90',
    audience: 'consumer',
    billingModel: 'one_time',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 59900,
    description: 'A 90-day home-financing readiness program focused on credit profile, debt ratios, reserves and application-document preparation.',
    deliverables: ['Mortgage-specific readiness baseline','DTI and reserve targets','Credit-utilization plan','Income and document readiness checklist','30/60/90-day reassessments','Final Ready-to-Shop planning review'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'auto-loan-ready',
    name: 'New850 Auto Ready',
    audience: 'consumer',
    billingModel: 'one_time',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 14900,
    description: 'Vehicle-financing readiness analysis that helps customers understand affordability, credit blockers, down-payment targets and application timing.',
    deliverables: ['Auto financing readiness assessment','Payment and affordability planning','Credit and utilization blockers','Down-payment target','Application timing roadmap'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'denial-rescue',
    name: 'New850 Denial Recovery',
    audience: 'consumer',
    billingModel: 'one_time',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 19900,
    description: 'A post-denial analysis that converts an adverse-action outcome into a prioritized recovery plan before the customer applies again.',
    deliverables: ['Adverse-action reason review','Credit-factor and debt analysis','Controllable blocker identification','Reapplication timing guidance','30/60/90-day recovery roadmap'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'financing-concierge',
    name: 'New850 Readiness Concierge',
    audience: 'consumer',
    billingModel: 'custom',
    regulatoryClass: 'consumer_credit_services',
    priceRangeCents: [99900, 250000],
    description: 'High-touch preparation for a specific financing goal with recurring readiness reviews, documentation tracking and milestone management.',
    deliverables: ['Dedicated readiness plan','Monthly readiness review','Document-vault preparation checklist','Credit and debt milestone tracking','Final application-readiness packet'],
    paymentPolicy: 'manual_quote'
  },
  {
    id: 'credit-intelligence-audit',
    name: 'New850 Financial Readiness Audit',
    audience: 'consumer',
    billingModel: 'one_time',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 19900,
    description: 'Evidence-based credit-to-approval readiness assessment tied to the customer’s next financing goal.',
    deliverables: ['Credit report normalization','Goal-specific readiness assessment','Utilization, DTI, payment, inquiry and derogatory analysis','P0/P1/P2 blocker inventory','Personalized 7/30/60/90-day action plan'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'credit-intelligence-membership',
    name: 'New850 Readiness Membership',
    audience: 'consumer',
    billingModel: 'monthly',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 12900,
    description: 'Ongoing readiness monitoring, evidence organization, reassessment and monthly strategy work.',
    deliverables: ['Monthly readiness reassessment','Readiness-score delta tracking','Utilization and DTI recommendations','Evidence organization','Legitimate dispute preparation when supported','Monthly action-plan update'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'premium-credit-recovery',
    name: 'New850 Premium Recovery',
    audience: 'consumer',
    billingModel: 'monthly',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 24900,
    description: 'Higher-touch readiness and recovery management for complex evidence-backed credit reporting problems.',
    deliverables: ['Priority readiness review','Advanced evidence matching','Furnisher correspondence preparation','Escalation planning','Complex bureau-response analysis','Goal-specific blocker reprioritization'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'business-credit-accelerator',
    name: 'New850 Business Funding Readiness',
    audience: 'business',
    billingModel: 'one_time',
    regulatoryClass: 'business_advisory',
    priceCents: 79900,
    description: 'Business-credit and funding-readiness implementation program.',
    deliverables: ['Business profile audit','Documentation readiness review','Vendor and reporting roadmap','Funding-readiness plan','Implementation milestones'],
    paymentPolicy: 'standard'
  },
  {
    id: 'business-credit-concierge',
    name: 'New850 Business Concierge',
    audience: 'business',
    billingModel: 'custom',
    regulatoryClass: 'business_advisory',
    priceRangeCents: [150000, 300000],
    description: 'High-touch business credit and financing-readiness advisory.',
    deliverables: ['Dedicated readiness plan','Business credit profile optimization','Reporting verification','Financing-readiness preparation','Priority implementation support'],
    paymentPolicy: 'manual_quote'
  },
  {
    id: 'credit-os-solo',
    name: 'New850 OS — Solo',
    audience: 'b2b',
    billingModel: 'monthly',
    regulatoryClass: 'software',
    priceCents: 19900,
    description: 'Single-operator access to the New850 financial-readiness operating platform.',
    deliverables: ['Client readiness workspace','Explainable scoring','Evidence ledger','AI analysis tools','Compliance workflow','Audit trail'],
    paymentPolicy: 'standard'
  },
  {
    id: 'credit-os-professional',
    name: 'New850 OS — Professional',
    audience: 'b2b',
    billingModel: 'monthly',
    regulatoryClass: 'software',
    priceCents: 39900,
    description: 'Multi-user professional financial-readiness and customer-operations platform.',
    deliverables: ['Everything in Solo','Expanded client capacity','Team roles','Readiness pipeline reporting','Operational reporting','Priority support'],
    paymentPolicy: 'standard'
  },
  {
    id: 'credit-os-agency',
    name: 'New850 OS — Agency',
    audience: 'b2b',
    billingModel: 'monthly',
    regulatoryClass: 'software',
    priceCents: 79900,
    description: 'Agency-grade New850 financial-readiness platform with advanced workflow and governance capacity.',
    deliverables: ['Everything in Professional','Agency workflows','Advanced governance','Higher capacity','White-label readiness'],
    paymentPolicy: 'standard'
  }
];

export function getCommercialService(id: string) {
  return commercialServices.find((service) => service.id === id) ?? null;
}

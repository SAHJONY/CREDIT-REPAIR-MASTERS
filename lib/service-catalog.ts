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
    id: 'credit-intelligence-audit',
    name: 'Complete Credit Intelligence Audit',
    audience: 'consumer',
    billingModel: 'one_time',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 19900,
    description: 'Evidence-based credit report analysis and prioritized improvement plan.',
    deliverables: ['Credit report normalization','Account-by-account accuracy review','Utilization and derogatory-account analysis','Evidence inventory','Personalized action plan'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'credit-intelligence-membership',
    name: 'Credit Intelligence Membership',
    audience: 'consumer',
    billingModel: 'monthly',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 12900,
    description: 'Ongoing monitoring, evidence organization, response analysis, and monthly strategy work.',
    deliverables: ['Monthly report review','Utilization recommendations','Evidence organization','Legitimate dispute preparation','Bureau-response analysis','Monthly strategy update'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'premium-credit-recovery',
    name: 'Premium Credit Recovery Management',
    audience: 'consumer',
    billingModel: 'monthly',
    regulatoryClass: 'consumer_credit_services',
    priceCents: 24900,
    description: 'Higher-touch case management for complex evidence-backed credit reporting problems.',
    deliverables: ['Priority case review','Advanced evidence matching','Furnisher correspondence preparation','Escalation planning','Complex bureau-response analysis'],
    paymentPolicy: 'post_performance'
  },
  {
    id: 'business-credit-accelerator',
    name: 'Business Credit Accelerator',
    audience: 'business',
    billingModel: 'one_time',
    regulatoryClass: 'business_advisory',
    priceCents: 79900,
    description: 'Business-credit readiness and implementation advisory program.',
    deliverables: ['Business profile audit','Documentation readiness review','Vendor and reporting roadmap','Funding-readiness plan','Implementation milestones'],
    paymentPolicy: 'standard'
  },
  {
    id: 'business-credit-concierge',
    name: 'Business Credit Concierge',
    audience: 'business',
    billingModel: 'custom',
    regulatoryClass: 'business_advisory',
    priceRangeCents: [150000, 300000],
    description: 'High-touch business credit and financing-readiness advisory.',
    deliverables: ['Dedicated advisory plan','Business credit profile optimization','Reporting verification','Financing-readiness preparation','Priority implementation support'],
    paymentPolicy: 'manual_quote'
  },
  {
    id: 'credit-os-solo',
    name: 'CREDIT REPAIR MASTERS OS — Solo',
    audience: 'b2b',
    billingModel: 'monthly',
    regulatoryClass: 'software',
    priceCents: 19900,
    description: 'Single-operator access to the credit operations software platform.',
    deliverables: ['Client workspace','Evidence ledger','AI analysis tools','Compliance workflow','Audit trail'],
    paymentPolicy: 'standard'
  },
  {
    id: 'credit-os-professional',
    name: 'CREDIT REPAIR MASTERS OS — Professional',
    audience: 'b2b',
    billingModel: 'monthly',
    regulatoryClass: 'software',
    priceCents: 39900,
    description: 'Multi-user professional credit operations platform.',
    deliverables: ['Everything in Solo','Expanded client capacity','Team roles','Operational reporting','Priority support'],
    paymentPolicy: 'standard'
  },
  {
    id: 'credit-os-agency',
    name: 'CREDIT REPAIR MASTERS OS — Agency',
    audience: 'b2b',
    billingModel: 'monthly',
    regulatoryClass: 'software',
    priceCents: 79900,
    description: 'Agency-grade credit operations platform with advanced workflow capacity.',
    deliverables: ['Everything in Professional','Agency workflows','Advanced governance','Higher capacity','White-label readiness'],
    paymentPolicy: 'standard'
  }
];

export function getCommercialService(id: string) {
  return commercialServices.find((service) => service.id === id) ?? null;
}

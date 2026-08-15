import type { CreditProfile, Finding } from "./types";

const pct = (n: number) => Math.round(n * 100) / 100;

export function utilization(profile: CreditProfile) {
  const revolving = profile.accounts.filter((a) => a.type === "revolving" && a.limit);
  const balance = revolving.reduce((s, a) => s + a.balance, 0);
  const limit = revolving.reduce((s, a) => s + (a.limit ?? 0), 0);
  return limit ? pct((balance / limit) * 100) : 0;
}

export function analyzeProfile(profile: CreditProfile): Finding[] {
  const findings: Finding[] = [];
  const util = utilization(profile);

  if (util > 49) {
    findings.push({
      id: "util-high",
      title: `Revolving utilization is ${util}%`,
      reason: "High revolving utilization is a controllable risk factor and should be prioritized before opening new credit.",
      severity: "high",
      confidence: 0.99,
      action: "Build a cash-efficient paydown sequence targeting <29%, then <9% where appropriate.",
      requiresApproval: false
    });
  } else if (util > 29) {
    findings.push({
      id: "util-medium",
      title: `Revolving utilization is ${util}%`,
      reason: "Utilization is above the initial optimization threshold.",
      severity: "medium",
      confidence: 0.98,
      action: "Model balances required to cross utilization thresholds without reducing liquidity below reserve.",
      requiresApproval: false
    });
  }

  const late = profile.accounts.filter((a) => a.status === "late");
  if (late.length) {
    findings.push({
      id: "late-accounts",
      title: `${late.length} account(s) reporting late`,
      reason: "Payment history is a high-priority adverse factor. Accuracy must be verified before any dispute is prepared.",
      severity: "high",
      confidence: 0.96,
      action: "Verify dates, bureau consistency, creditor statements and payment evidence; dispute only documented inaccuracies.",
      requiresApproval: false
    });
  }

  const collections = profile.accounts.filter((a) => a.status === "collection");
  if (collections.length) {
    findings.push({
      id: "collections",
      title: `${collections.length} collection account(s) require validation`,
      reason: "Collections should be evaluated for identity, balance, ownership, dates and bureau consistency before strategy selection.",
      severity: "high",
      confidence: 0.94,
      action: "Create evidence matrix and classify each item as accurate, inaccurate, incomplete, duplicate or unknown.",
      requiresApproval: false
    });
  }

  if (profile.hardInquiries >= 4) {
    findings.push({
      id: "inquiries",
      title: `${profile.hardInquiries} hard inquiries`,
      reason: "Additional applications may add avoidable risk while the profile is being optimized.",
      severity: "medium",
      confidence: 0.9,
      action: "Freeze new-credit recommendations unless a modeled benefit exceeds expected downside and client approves.",
      requiresApproval: true
    });
  }

  if (profile.ageMonths < 24) {
    findings.push({
      id: "thin-age",
      title: "Young credit file",
      reason: "Limited age can constrain near-term improvement and should not be addressed with indiscriminate account opening.",
      severity: "medium",
      confidence: 0.88,
      action: "Preserve oldest legitimate accounts and avoid unnecessary closure/application churn.",
      requiresApproval: false
    });
  }

  return findings;
}

export function paydownPlan(profile: CreditProfile) {
  const reserve = Math.max(500, profile.cashAvailable * 0.25);
  let budget = Math.max(0, profile.cashAvailable - reserve);
  const cards = profile.accounts
    .filter((a) => a.type === "revolving" && a.limit && a.balance > 0)
    .map((a) => ({ ...a, utilization: a.balance / (a.limit ?? 1) }))
    .sort((a, b) => b.utilization - a.utilization);

  const steps: Array<{ account: string; pay: number; targetUtilization: number }> = [];
  for (const card of cards) {
    const targetBalance29 = (card.limit ?? 0) * 0.29;
    const needed = Math.max(0, card.balance - targetBalance29);
    const pay = Math.min(needed, budget);
    if (pay > 0) {
      steps.push({ account: card.creditor, pay: Math.round(pay), targetUtilization: 29 });
      budget -= pay;
    }
    if (budget <= 0) break;
  }
  return { reserve: Math.round(reserve), allocated: Math.round(profile.cashAvailable - reserve - budget), remaining: Math.round(budget), steps };
}

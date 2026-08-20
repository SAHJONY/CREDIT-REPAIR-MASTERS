import { neon } from '@neondatabase/serverless';
import { productionMfaReady } from './mfa';
import { getReadinessChecks, readinessSummary, type ReadinessCheck } from './readiness';

declare const process: { env: Record<string, string | undefined> };

type ProductionTable =
  | 'loan_readiness_assessments'
  | 'growth_leads'
  | 'marketplace_partners'
  | 'marketplace_handoffs'
  | 'marketplace_outcomes';

async function productionTableReady(tableName: ProductionTable) {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  try {
    const sql = neon(url);
    const rows = tableName === 'loan_readiness_assessments'
      ? await sql`select to_regclass('public.loan_readiness_assessments') as table_name`
      : tableName === 'growth_leads'
        ? await sql`select to_regclass('public.growth_leads') as table_name`
        : tableName === 'marketplace_partners'
          ? await sql`select to_regclass('public.marketplace_partners') as table_name`
          : tableName === 'marketplace_handoffs'
            ? await sql`select to_regclass('public.marketplace_handoffs') as table_name`
            : await sql`select to_regclass('public.marketplace_outcomes') as table_name`;
    return Boolean(rows[0]?.table_name);
  } catch {
    return false;
  }
}

export async function resolveProductionReadiness(organizationId: string) {
  const checks = getReadinessChecks();
  const [mfaReady, loanReadinessReady, growthLeadInboxReady, marketplacePartnersReady, marketplaceHandoffsReady, marketplaceOutcomesReady] = await Promise.all([
    productionMfaReady(organizationId),
    productionTableReady('loan_readiness_assessments'),
    productionTableReady('growth_leads'),
    productionTableReady('marketplace_partners'),
    productionTableReady('marketplace_handoffs'),
    productionTableReady('marketplace_outcomes')
  ]);
  const marketplaceSchemaReady = marketplacePartnersReady && marketplaceHandoffsReady && marketplaceOutcomesReady;

  const resolvedChecks: ReadinessCheck[] = checks.map((check) => {
    if (check.id === 'mfa') {
      return {
        ...check,
        status: mfaReady ? 'ready' as const : 'setup' as const,
        detail: mfaReady
          ? 'All active privileged operators have verified MFA enrollment'
          : 'Privileged MFA key and verified owner/admin enrollment required'
      };
    }
    if (check.id === 'lead-delivery') {
      return {
        ...check,
        status: growthLeadInboxReady ? 'ready' as const : 'setup' as const,
        detail: growthLeadInboxReady
          ? 'Durable tenant-scoped Owner/Growth lead inbox is present; webhook or Resend notification remains additive'
          : 'Apply the durable growth lead inbox migration before accepting production acquisition traffic'
      };
    }
    return check;
  });

  resolvedChecks.push({
    id: 'loan-readiness-persistence',
    label: 'Loan Readiness persistent history schema',
    status: loanReadinessReady ? 'ready' : 'setup',
    requiredForProduction: true,
    detail: loanReadinessReady
      ? 'Production database contains the tenant-scoped loan readiness assessment history table'
      : 'Apply the versioned Loan Readiness migration before enabling saved assessments'
  });

  resolvedChecks.push({
    id: 'marketplace-persistence',
    label: 'New850 Marketplace persistent schema',
    status: marketplaceSchemaReady ? 'ready' : 'setup',
    requiredForProduction: true,
    detail: marketplaceSchemaReady
      ? 'Production database contains partner, consented handoff and outcome attribution tables'
      : 'Apply the versioned New850 Marketplace migration before enabling partner routing or outcome attribution'
  });

  return {
    checks: resolvedChecks,
    summary: readinessSummary(resolvedChecks)
  };
}

import { neon } from '@neondatabase/serverless';
import { productionMfaReady } from './mfa';
import { getReadinessChecks, readinessSummary, type ReadinessCheck } from './readiness';

declare const process: { env: Record<string, string | undefined> };

async function productionTableReady(tableName: 'loan_readiness_assessments' | 'growth_leads') {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  try {
    const sql = neon(url);
    const rows = tableName === 'loan_readiness_assessments'
      ? await sql`select to_regclass('public.loan_readiness_assessments') as table_name`
      : await sql`select to_regclass('public.growth_leads') as table_name`;
    return Boolean(rows[0]?.table_name);
  } catch {
    return false;
  }
}

export async function resolveProductionReadiness(organizationId: string) {
  const checks = getReadinessChecks();
  const [mfaReady, loanReadinessReady, growthLeadInboxReady] = await Promise.all([
    productionMfaReady(organizationId),
    productionTableReady('loan_readiness_assessments'),
    productionTableReady('growth_leads')
  ]);

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

  return {
    checks: resolvedChecks,
    summary: readinessSummary(resolvedChecks)
  };
}

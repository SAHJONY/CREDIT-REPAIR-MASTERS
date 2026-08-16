import { productionMfaReady } from './mfa';
import { getReadinessChecks, readinessSummary } from './readiness';

export async function resolveProductionReadiness(organizationId: string) {
  const checks = getReadinessChecks();
  const mfaReady = await productionMfaReady(organizationId);
  const resolvedChecks = checks.map((check) => check.id === 'mfa'
    ? {
        ...check,
        status: mfaReady ? 'ready' as const : 'setup' as const,
        detail: mfaReady
          ? 'All active privileged operators have verified MFA enrollment'
          : 'Privileged MFA key and verified owner/admin enrollment required'
      }
    : check);

  return {
    checks: resolvedChecks,
    summary: readinessSummary(resolvedChecks)
  };
}

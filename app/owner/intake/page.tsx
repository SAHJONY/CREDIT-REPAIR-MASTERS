import { redirect } from 'next/navigation';
import { getBusinessSession } from '@/lib/session-access';
import { listIntakeCases, describePipelineState } from '@/lib/owner-intake';
import { OwnerIntakeForm } from '@/components/owner-intake-form';
import { t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/**
 * Owner intake workspace — New850 credit-report case intake.
 * Owner/admin only. Phones are stored encrypted and shown masked;
 * SSNs are never accepted or stored.
 */
export default async function OwnerIntakePage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.member.role !== 'owner' && session.member.role !== 'admin') redirect('/dashboard');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const cases = listIntakeCases(session.organizationId);

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <h1>{t('es', 'intake.title')}</h1>
      <p style={{ color: '#555', marginTop: 4 }}>{t('es', 'intake.subtitle')}</p>

      <section style={{ marginTop: 24 }}>
        <h2>{t('es', 'intake.newCase')}</h2>
        <OwnerIntakeForm />
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>{t('es', 'intake.caseList')} ({cases.length})</h2>
        {cases.length === 0 ? (
          <p style={{ color: '#777' }}>{t('es', 'intake.noCases')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: 8 }}>{t('es', 'intake.customerName')}</th>
                  <th style={{ padding: 8 }}>{t('es', 'intake.phone')}</th>
                  <th style={{ padding: 8 }}>{t('es', 'intake.status')}</th>
                  <th style={{ padding: 8 }}>{t('es', 'intake.report')}</th>
                  <th style={{ padding: 8 }}>{t('es', 'intake.pipeline')}</th>
                  <th style={{ padding: 8 }}>{t('es', 'intake.created')}</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>{c.customerName}</td>
                    <td style={{ padding: 8, fontFamily: 'monospace' }}>{c.phoneMasked}</td>
                    <td style={{ padding: 8 }}>{t('es', `intake.status.${c.status}`)}</td>
                    <td style={{ padding: 8 }}>
                      {c.report ? t('es', 'intake.reportYes') : t('es', 'intake.reportNo')}
                    </td>
                    <td style={{ padding: 8 }}>{describePipelineState(c, 'es')}</td>
                    <td style={{ padding: 8 }}>{new Date(c.createdAt).toLocaleDateString('es')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

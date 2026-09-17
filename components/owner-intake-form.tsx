'use client';

import { FormEvent, useState } from 'react';
import { t } from '@/lib/i18n';

/**
 * Owner intake form — creates a New850 credit-repair case and optionally
 * attaches the customer's credit report in the same request.
 *
 * Spanish-first. The phone is encrypted server-side before it touches disk;
 * SSNs are never accepted (the server rejects SSN-like patterns and requires
 * the redaction attestation when a file is attached).
 */
export function OwnerIntakeForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(''); setOk('');
    try {
      const formData = new FormData(event.currentTarget);
      // Checkbox → "true"/"false" for the API schema.
      formData.set('ssnAttestation', (event.currentTarget.querySelector('input[name="ssnAttestation"]') as HTMLInputElement)?.checked ? 'true' : 'false');
      const response = await fetch('/api/owner/intake/cases', { method: 'POST', body: formData });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error ? t('es', 'intake.errorWithCode', { code: String(payload.error) }) : t('es', 'intake.error')); return; }
      setOk(t('es', 'intake.success', { name: String(payload.case?.customerName ?? '') }));
      (event.target as HTMLFormElement).reset();
      window.location.reload();
    } catch { setError(t('es', 'intake.error')); }
    finally { setBusy(false); }
  }

  return <form className="appForm compactForm" onSubmit={submit}>
    <label>{t('es', 'intake.customerName')}<input name="customerName" minLength={2} maxLength={120} required placeholder={t('es', 'intake.customerNamePh')} /></label>
    <label>{t('es', 'intake.phone')}<input name="phone" minLength={7} maxLength={20} required placeholder={t('es', 'intake.phonePh')} inputMode="tel" /></label>
    <div className="formHint">{t('es', 'intake.phoneHelp')}</div>
    <label>{t('es', 'intake.notes')}<textarea name="notes" maxLength={2000} rows={3} placeholder={t('es', 'intake.notesPh')} /></label>
    <label>{t('es', 'intake.reportFile')}<input name="file" type="file" accept="application/pdf,image/jpeg,image/png" /></label>
    <div className="formHint">{t('es', 'intake.reportHelp')}</div>
    <label className="checkLabel"><input name="ssnAttestation" type="checkbox" value="true" /> {t('es', 'intake.ssnAttestation')}</label>
    {error ? <div className="formError">{error}</div> : null}
    {ok ? <div className="formOk">{ok}</div> : null}
    <button className="primaryButton" disabled={busy} type="submit">{busy ? t('es', 'intake.submitting') : t('es', 'intake.submit')}</button>
  </form>;
}

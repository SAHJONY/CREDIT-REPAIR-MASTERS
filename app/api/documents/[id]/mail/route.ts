import { randomUUID } from 'node:crypto';
import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { sendCertifiedLetterViaLob, type CreditBureauId, creditBureauMailingAddresses } from '@/lib/bureau-mail';
import { documentMetadata } from '@/lib/document-sharing';
import { sentRecord, signatureMatchesCurrentVersion } from '@/lib/document-workflow';
import { getPlatformStore } from '@/lib/platform-store';

const bodySchema = z.object({
  clientId: z.string().trim().min(3).max(160),
  bureau: z.enum(['equifax', 'experian', 'transunion']),
  confirmSend: z.literal(true)
});

function consentActive(consent: { granted: boolean; revokedAt?: string; expiresAt?: string }) {
  if (!consent.granted || consent.revokedAt) return false;
  return !consent.expiresAt || Date.parse(consent.expiresAt) > Date.now();
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','credit_specialist','compliance_reviewer']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_BUREAU_MAIL_REQUEST' }, { status: 400 });

  const { id } = await params;
  const bureau = parsed.data.bureau as CreditBureauId;
  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, parsed.data.clientId);
  if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });

  const [evidence, audit, consents] = await Promise.all([
    store.listEvidence(auth.organizationId, client.id),
    store.listAudit(auth.organizationId, 1000),
    store.listConsents(auth.organizationId, client.id)
  ]);
  const document = evidence.find((item) => item.id === id);
  if (!document) return NextResponse.json({ error: 'DOCUMENT_NOT_FOUND' }, { status: 404 });
  const metadata = documentMetadata(audit, document);
  if (metadata.documentClass !== 'client_document' || metadata.category !== 'dispute') {
    return NextResponse.json({ error: 'SIGNED_DISPUTE_LETTER_REQUIRED' }, { status: 409 });
  }
  if (!document.sha256 || !signatureMatchesCurrentVersion(audit, document)) {
    return NextResponse.json({ error: 'CURRENT_VERSION_NOT_SIGNED' }, { status: 409 });
  }
  const submissionConsent = consents.some((consent) => consent.scope === 'dispute_submission' && consentActive(consent));
  if (!submissionConsent) return NextResponse.json({ error: 'DISPUTE_SUBMISSION_CONSENT_REQUIRED' }, { status: 409 });

  const existingSent = sentRecord(audit, id);
  if (existingSent && existingSent.metadata?.documentSha256 === document.sha256) {
    return NextResponse.json({ error: 'CURRENT_VERSION_ALREADY_SENT', sent: existingSent.metadata }, { status: 409 });
  }
  if (!document.vaultRef) return NextResponse.json({ error: 'DOCUMENT_FILE_NOT_AVAILABLE' }, { status: 404 });
  if (metadata.contentType && metadata.contentType !== 'application/pdf') {
    return NextResponse.json({ error: 'PDF_REQUIRED_FOR_POSTAL_MAIL' }, { status: 409 });
  }

  try {
    const blobResult = await get(document.vaultRef, { access: 'private' });
    if (!blobResult || blobResult.statusCode !== 200) return NextResponse.json({ error: 'DOCUMENT_FILE_NOT_FOUND' }, { status: 404 });
    const arrayBuffer = await new Response(blobResult.stream).arrayBuffer();
    const pdf = new Blob([arrayBuffer], { type: 'application/pdf' });
    const filename = metadata.filename?.toLowerCase().endsWith('.pdf') ? metadata.filename : `${document.id}.pdf`;
    const mail = await sendCertifiedLetterViaLob({
      bureau,
      pdf,
      filename,
      idempotencyKey: `new850:${auth.organizationId}:${document.id}:${document.sha256}:${bureau}`,
      metadata: { organization_id: auth.organizationId, client_id: client.id, document_id: document.id, bureau }
    });

    const now = new Date().toISOString();
    const recipient = creditBureauMailingAddresses[bureau];
    const commonMetadata = {
      clientId: client.id,
      documentSha256: document.sha256,
      channel: 'lob_certified_mail',
      bureau,
      provider: 'lob',
      providerLetterId: mail.id || '',
      trackingNumber: mail.tracking_number || '',
      expectedDeliveryDate: mail.expected_delivery_date || '',
      recipient: recipient.company || recipient.name || bureau,
      recipientAddress: `${recipient.addressLine1}, ${recipient.city}, ${recipient.state} ${recipient.zip}`
    };

    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'document.mail_submitted',
      resourceType: 'evidence',
      resourceId: document.id,
      decision: 'allowed',
      metadata: commonMetadata,
      createdAt: now
    });
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'document.sent',
      resourceType: 'evidence',
      resourceId: document.id,
      decision: 'allowed',
      metadata: commonMetadata,
      createdAt: now
    });

    return NextResponse.json({
      sent: true,
      bureau,
      providerLetterId: mail.id,
      trackingNumber: mail.tracking_number || null,
      expectedDeliveryDate: mail.expected_delivery_date || null,
      recipient
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'BUREAU_MAIL_SEND_FAILED' }, { status: 503 });
  }
}

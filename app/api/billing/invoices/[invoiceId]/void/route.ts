import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { getBillingInvoice, voidBillingInvoice } from '@/lib/billing-store';
import { getPlatformStore } from '@/lib/platform-store';

export async function POST(request: NextRequest, context: { params: Promise<{ invoiceId: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner', 'admin']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { invoiceId } = await context.params;
  const existing = await getBillingInvoice(auth.organizationId, invoiceId);
  if (!existing) return NextResponse.json({ error: 'INVOICE_NOT_FOUND' }, { status: 404 });
  if (existing.status === 'paid') return NextResponse.json({ error: 'PAID_INVOICE_CANNOT_BE_VOIDED' }, { status: 409 });
  if (existing.status === 'void') return NextResponse.json({ invoice: existing }, { status: 200 });

  const invoice = await voidBillingInvoice(auth.organizationId, invoiceId);
  if (!invoice) return NextResponse.json({ error: 'INVOICE_VOID_CONFLICT' }, { status: 409 });

  const store = getPlatformStore();
  await store.appendAudit(auth.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: auth.organizationId,
    actorType: 'user',
    actorId: auth.actorId,
    action: 'billing.invoice_voided',
    resourceType: 'client',
    resourceId: invoice.clientId,
    decision: 'allowed',
    metadata: { invoiceId: invoice.id, clientId: invoice.clientId, amountCents: invoice.amountCents },
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ invoice });
}

import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { evaluateBillingEligibility } from '@/lib/billing-policy';
import { createBillingInvoice, listBillingInvoices } from '@/lib/billing-store';
import { getPlatformStore } from '@/lib/platform-store';
import { getCommercialService } from '@/lib/service-catalog';

const schema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  milestoneLabel: z.string().trim().min(3).max(180),
  salesChannel: z.enum(['web', 'referral', 'in_person', 'telemarketing']).default('web'),
  serviceCompleted: z.boolean().default(false),
  contractSigned: z.boolean().default(false),
  cancellationWindowExpired: z.boolean().default(false),
  floridaBondAndTrustValidated: z.boolean().default(false),
  dueAt: z.string().datetime().optional()
});

export async function GET(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner', 'admin', 'credit_specialist', 'compliance_reviewer', 'auditor']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const invoices = await listBillingInvoices(auth.organizationId);
    return NextResponse.json({ invoices });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'BILLING_READ_FAILED' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner', 'admin', 'credit_specialist']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INVOICE_PAYLOAD', issues: parsed.error.flatten() }, { status: 400 });

  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, parsed.data.clientId);
  if (!client || client.status === 'closed') return NextResponse.json({ error: 'CLIENT_NOT_BILLABLE' }, { status: 409 });
  const service = getCommercialService(parsed.data.serviceId);
  if (!service || !service.priceCents) return NextResponse.json({ error: 'SERVICE_PRICE_NOT_AUTOMATABLE' }, { status: 409 });

  const eligibility = evaluateBillingEligibility({
    serviceId: service.id,
    state: client.state,
    salesChannel: parsed.data.salesChannel,
    serviceCompleted: parsed.data.serviceCompleted,
    contractSigned: parsed.data.contractSigned,
    cancellationWindowExpired: parsed.data.cancellationWindowExpired,
    floridaBondAndTrustValidated: parsed.data.floridaBondAndTrustValidated
  });

  if (!eligibility.mayCollectNow) {
    return NextResponse.json({ error: 'PAYMENT_COLLECTION_NOT_ELIGIBLE', eligibility }, { status: 409 });
  }

  try {
    const invoice = await createBillingInvoice({
      id: `inv_${randomUUID()}`,
      organizationId: auth.organizationId,
      clientId: client.id,
      serviceId: service.id,
      milestoneLabel: parsed.data.milestoneLabel,
      amountCents: service.priceCents,
      eligibilityDecision: eligibility.decision,
      eligibilitySnapshot: eligibility,
      createdBy: auth.actorId,
      dueAt: parsed.data.dueAt
    });

    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'billing.invoice_issued',
      resourceType: 'client',
      resourceId: client.id,
      decision: 'allowed',
      metadata: { clientId: client.id, invoiceId: invoice.id, serviceId: service.id, amountCents: service.priceCents, milestoneLabel: parsed.data.milestoneLabel },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ invoice, eligibility }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'INVOICE_CREATE_FAILED';
    return NextResponse.json({ error: code }, { status: 503 });
  }
}

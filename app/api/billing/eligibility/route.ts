import { NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluateBillingEligibility } from '@/lib/billing-policy';

const schema = z.object({
  serviceId: z.string().min(1),
  state: z.string().min(2).max(32),
  salesChannel: z.enum(['web', 'referral', 'in_person', 'telemarketing']),
  serviceCompleted: z.boolean().optional(),
  contractSigned: z.boolean().optional(),
  cancellationWindowExpired: z.boolean().optional(),
  floridaBondAndTrustValidated: z.boolean().optional()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_BILLING_ELIGIBILITY_INPUT', issues: parsed.error.issues }, { status: 400 });
  const result = evaluateBillingEligibility(parsed.data);
  return NextResponse.json(result, { status: result.decision === 'blocked' ? 403 : 200 });
}

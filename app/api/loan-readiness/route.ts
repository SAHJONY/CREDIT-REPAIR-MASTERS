import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { calculateLoanReadiness } from '@/lib/loan-readiness-engine';
import { appendLoanReadinessAssessment, listLoanReadinessAssessments } from '@/lib/loan-readiness-store';
import { getPlatformStore } from '@/lib/platform-store';

const assessmentSchema = z.object({
  clientId: z.string().trim().min(1),
  goal: z.enum(['mortgage','auto','credit_card','personal_loan','business_credit','lease','financed_purchase']),
  creditScore: z.number().int().min(300).max(850),
  utilization: z.number().min(0).max(100),
  monthlyIncome: z.number().min(0),
  monthlyDebt: z.number().min(0),
  onTimePaymentRate: z.number().min(0).max(100),
  derogatories: z.number().int().min(0).max(100),
  hardInquiries: z.number().int().min(0).max(100),
  cashReserves: z.number().min(0)
});

export async function GET(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','credit_specialist','compliance_reviewer','auditor']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const clientId = request.nextUrl.searchParams.get('clientId') || undefined;
    const history = await listLoanReadinessAssessments(auth.organizationId, clientId, 25);
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'LOAN_READINESS_HISTORY_FAILED' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','credit_specialist']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const parsed = assessmentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'INVALID_LOAN_READINESS_PAYLOAD', issues: parsed.error.flatten() }, { status: 400 });

    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, parsed.data.clientId);
    if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });

    const result = calculateLoanReadiness(parsed.data);
    const now = new Date().toISOString();
    const assessment = await appendLoanReadinessAssessment(auth.organizationId, {
      id: `lr_${randomUUID()}`,
      organizationId: auth.organizationId,
      clientId: parsed.data.clientId,
      goal: parsed.data.goal,
      readinessScore: result.readiness,
      status: result.status,
      creditScore: parsed.data.creditScore,
      utilization: parsed.data.utilization,
      monthlyIncome: parsed.data.monthlyIncome,
      monthlyDebt: parsed.data.monthlyDebt,
      dti: Number(result.dti.toFixed(2)),
      onTimePaymentRate: parsed.data.onTimePaymentRate,
      derogatories: parsed.data.derogatories,
      hardInquiries: parsed.data.hardInquiries,
      cashReserves: parsed.data.cashReserves,
      reserveMonths: Number(result.reserveMonths.toFixed(2)),
      roadmap: result.actions,
      createdBy: auth.actorId,
      createdAt: now
    });

    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'loan_readiness.assess',
      resourceType: 'loan_readiness_assessment',
      resourceId: assessment.id,
      decision: 'allowed',
      metadata: { clientId: client.id, goal: assessment.goal, score: assessment.readinessScore, status: assessment.status },
      createdAt: now
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'LOAN_READINESS_SAVE_FAILED' }, { status: 503 });
  }
}

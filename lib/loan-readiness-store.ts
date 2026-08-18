import { neon } from '@neondatabase/serverless';
import type { LoanReadinessAssessment } from './platform-types';
import { isProductionEnvironment } from './platform-store';

declare const process: { env: Record<string, string | undefined> };

const memory: LoanReadinessAssessment[] = [];

function rowToAssessment(row: Record<string, unknown>): LoanReadinessAssessment {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    clientId: String(row.client_id),
    goal: row.goal as LoanReadinessAssessment['goal'],
    readinessScore: Number(row.readiness_score),
    status: row.status as LoanReadinessAssessment['status'],
    creditScore: Number(row.credit_score),
    utilization: Number(row.utilization),
    monthlyIncome: Number(row.monthly_income),
    monthlyDebt: Number(row.monthly_debt),
    dti: Number(row.dti),
    onTimePaymentRate: Number(row.on_time_payment_rate),
    derogatories: Number(row.derogatories),
    hardInquiries: Number(row.hard_inquiries),
    cashReserves: Number(row.cash_reserves),
    reserveMonths: Number(row.reserve_months),
    roadmap: Array.isArray(row.roadmap) ? row.roadmap as LoanReadinessAssessment['roadmap'] : [],
    createdBy: String(row.created_by),
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (isProductionEnvironment()) throw new Error('PRODUCTION_DATABASE_NOT_CONFIGURED');
    return null;
  }
  return neon(url);
}

export async function appendLoanReadinessAssessment(organizationId: string, assessment: LoanReadinessAssessment) {
  if (assessment.organizationId !== organizationId) throw new Error('TENANT_SCOPE_MISMATCH');
  const sql = database();
  if (!sql) {
    memory.push(assessment);
    return assessment;
  }

  await sql`insert into loan_readiness_assessments (
    id, organization_id, client_id, goal, readiness_score, status, credit_score,
    utilization, monthly_income, monthly_debt, dti, on_time_payment_rate,
    derogatories, hard_inquiries, cash_reserves, reserve_months, roadmap,
    created_by, created_at
  ) values (
    ${assessment.id}, ${organizationId}, ${assessment.clientId}, ${assessment.goal},
    ${assessment.readinessScore}, ${assessment.status}, ${assessment.creditScore},
    ${assessment.utilization}, ${assessment.monthlyIncome}, ${assessment.monthlyDebt},
    ${assessment.dti}, ${assessment.onTimePaymentRate}, ${assessment.derogatories},
    ${assessment.hardInquiries}, ${assessment.cashReserves}, ${assessment.reserveMonths},
    ${JSON.stringify(assessment.roadmap)}::jsonb, ${assessment.createdBy}, ${assessment.createdAt}
  )`;
  return assessment;
}

export async function listLoanReadinessAssessments(organizationId: string, clientId?: string, limit = 25) {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const sql = database();
  if (!sql) {
    return memory
      .filter((item) => item.organizationId === organizationId && (!clientId || item.clientId === clientId))
      .slice(-safeLimit)
      .reverse();
  }

  const rows = clientId
    ? await sql`select * from loan_readiness_assessments where organization_id = ${organizationId} and client_id = ${clientId} order by created_at desc limit ${safeLimit}`
    : await sql`select * from loan_readiness_assessments where organization_id = ${organizationId} order by created_at desc limit ${safeLimit}`;
  return rows.map((row) => rowToAssessment(row as Record<string, unknown>));
}

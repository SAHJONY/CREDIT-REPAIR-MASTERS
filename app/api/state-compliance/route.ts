import { NextRequest, NextResponse } from 'next/server';
import { resolveStateCompliance, stateComplianceRuntimeSummary } from '@/lib/state-compliance';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get('state')?.trim();
  if (state) {
    const rule = resolveStateCompliance(state);
    return NextResponse.json({
      rulesVersion: stateComplianceRuntimeSummary().version,
      rule,
      autonomous: rule.mode === 'validated',
      failClosed: true
    });
  }

  return NextResponse.json(stateComplianceRuntimeSummary());
}

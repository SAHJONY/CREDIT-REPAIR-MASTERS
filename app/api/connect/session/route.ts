import { NextRequest, NextResponse } from 'next/server';
import { getCustomerPortalSession } from '@/lib/customer-portal';

export const dynamic = 'force-dynamic';

const CONNECT_URL = (process.env.SAHJONY_CONNECT_URL || 'https://sahjony-connect.vercel.app').replace(/\/$/, '');

type Mode = 'text' | 'voice' | 'video';

export async function POST(request: NextRequest) {
  const portal = await getCustomerPortalSession();
  if (!portal) {
    return NextResponse.json({ detail: 'Authenticated client portal session required' }, { status: 401 });
  }

  const key = process.env.SAHJONY_CONNECT_INTEGRATION_KEY?.trim();
  if (!key) {
    return NextResponse.json({ detail: 'SAHJONY Connect integration is not configured' }, { status: 503 });
  }

  let body: { mode?: Mode } = {};
  try {
    body = await request.json();
  } catch {}
  const mode: Mode = body.mode === 'voice' || body.mode === 'video' ? body.mode : 'text';

  try {
    const upstream = await fetch(`${CONNECT_URL}/api/connect/integrations/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Connect-Integration-Key': key,
      },
      body: JSON.stringify({
        project_id: 'new850',
        project_name: 'New850.com',
        external_context_id: portal.client.id,
        context_type: 'financial_readiness_support',
        display_name: portal.client.displayName,
        language: 'auto',
        mode,
        ai_assistance: false,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });

    const text = await upstream.text();
    const response = new NextResponse(text || null, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
    return response;
  } catch {
    return NextResponse.json({ detail: 'SAHJONY Connect is temporarily unavailable' }, { status: 502 });
  }
}

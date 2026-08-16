import { NextResponse } from 'next/server';
import { commercialServices } from '@/lib/service-catalog';

export async function GET() {
  return NextResponse.json({
    currency: 'USD',
    services: commercialServices,
    notice: 'Consumer credit-services pricing is subject to federal and state payment-timing rules. Catalog publication does not itself authorize collection.'
  });
}

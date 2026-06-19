import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const base = request.nextUrl.searchParams.get('base') || 'USD';
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Exchange rate API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API responded with status ${res.status}` }, { status: 502 });
    }

    const data = await res.json();

    if (data.result !== 'success') {
      return NextResponse.json({ error: data['error-type'] || 'Unknown API error' }, { status: 502 });
    }

    return NextResponse.json({
      base: data.base_code,
      rates: data.conversion_rates,
      updated: data.time_last_update_utc,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 502 });
  }
}

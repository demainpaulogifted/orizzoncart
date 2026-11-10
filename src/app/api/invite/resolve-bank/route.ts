import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { account_number, bank_code } = await request.json();
  if (!account_number || !bank_code) {
    return NextResponse.json({ error: 'Missing account number or bank' }, { status: 400 });
  }
  const secretKey = process.env.PLATFORM_PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Platform gateway not configured' }, { status: 500 });
  }
  try {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const data = await res.json();
    if (data.status && data.data) {
      return NextResponse.json({ account_name: data.data.account_name });
    }
    return NextResponse.json({ error: 'Invalid account number or bank' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Could not verify bank' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { account_number, bank_code } = await request.json();
  if (!account_number || !bank_code) return NextResponse.json({ error: 'Missing details' }, { status: 400 });

  // We use your PLATFORM Paystack Secret Key to verify banks for merchants
  const secretKey = process.env.PLATFORM_PAYSTACK_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: 'Platform gateway not configured' }, { status: 500 });

  try {
    const res = await fetch(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    const data = await res.json();

    if (data.status && data.data) {
      return NextResponse.json({ account_name: data.data.account_name });
    }
    return NextResponse.json({ error: 'Invalid account number or bank' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Could not verify bank' }, { status: 500 });
  }
}
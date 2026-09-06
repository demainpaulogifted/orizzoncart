import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: merchant } = await supabase.from('merchants').select('id, payment_receiving_status').eq('user_id', user.id).single();
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    // Prevent paying if already active
    if (merchant.payment_receiving_status === 'ACTIVE') {
      return NextResponse.json({ error: 'Store is already activated' }, { status: 400 });
    }

    // Fetch dynamic pricing from platform settings
    const { data: settings } = await supabase.from('platform_settings').select('activation_fee, activation_discount_percent').single();
    const baseFee = settings?.activation_fee || 5000;
    const discount = settings?.activation_discount_percent || 0;
    const finalAmount = baseFee - (baseFee * (discount / 100));

    // Create pending transaction record
    const reference = `ORZ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const { data: transaction, error: txError } = await supabase.from('platform_transactions').insert({
      merchant_id: merchant.id,
      transaction_type: 'payment_activation',
      amount: finalAmount,
      currency: 'NGN',
      status: 'pending',
      payment_reference: reference,
    }).select().single();

    if (txError) throw txError;

    // Initialize with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PLATFORM_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: finalAmount * 100, // Paystack expects amount in kobo
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/payment?reference=${reference}`,
        metadata: {
          merchant_id: merchant.id,
          transaction_id: transaction.id,
          type: 'platform_activation'
        }
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Paystack initialization failed');
    }

    return NextResponse.json({ 
      authorization_url: paystackData.data.authorization_url,
      reference: reference 
    });

  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize payment' }, { status: 500 });
  }
}
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export class PaymentService {
  static async createPaymentIntent(merchantId: string, amount: number) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('platform_transactions').insert({
      merchant_id: merchantId,
      transaction_type: 'payment_activation',
      amount: amount,
      currency: 'NGN',
      status: 'pending',
    }).select().single();
    if (error) throw error;
    return data;
  }
}
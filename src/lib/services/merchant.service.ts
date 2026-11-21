import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateMerchantId } from '@/lib/utils';
import { isValidCountryCurrency } from '@/lib/geo/country-currency';

export class MerchantService {
  static async create(input: {
    user_id: string;
    business_name: string;
    store_name: string;
    store_slug: string;
    country_code: string;
    currency_code: string;
    merchant_type?: 'physical' | 'digital';
  }) {
    if (!isValidCountryCurrency(input.country_code, input.currency_code)) {
      throw new Error('Invalid business country or selling currency');
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('merchants')
      .insert({
        merchant_id: generateMerchantId(),
        user_id: input.user_id,
        business_name: input.business_name,
        store_name: input.store_name,
        store_slug: input.store_slug.toLowerCase(),
        merchant_type: input.merchant_type || 'physical',
        country_code: input.country_code,
        currency_code: input.currency_code,
        payment_mode: 'platform',
        payment_receiving_status: 'NOT_CONFIGURED',
        cart_status: 'LOCKED',
        checkout_status: 'LOCKED',
        is_published: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async validateStoreSlug(slug: string): Promise<boolean> {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from('merchants')
      .select('id')
      .eq('store_slug', slug.toLowerCase())
      .single();

    return !data;
  }
}

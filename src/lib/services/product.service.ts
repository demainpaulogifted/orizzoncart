import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils';

export class ProductService {
  static async create(input: { merchant_id: string; name: string; price: number; description?: string; category?: string; images?: string[] }) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('products').insert({
      merchant_id: input.merchant_id,
      name: input.name,
      slug: generateSlug(input.name),
      price: input.price,
      description: input.description || null,
      category: input.category || null,
      images: input.images?.map((url, i) => ({ url, alt_text: null, display_order: i })) || [],
      is_active: true,
    }).select().single();
    if (error) throw error;
    return data;
  }
}
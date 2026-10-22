import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data: allWithLocations, error } = await admin
      .from('merchants')
      .select('id, store_name, store_slug, is_verified, business_locations, cac_number, created_at')
      .not('business_locations', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const merchants = (allWithLocations || []).filter(
      (m: any) => Array.isArray(m.business_locations) && m.business_locations.length > 0
    );

    const pending = merchants.filter((m: any) => !m.is_verified);
    const verified = merchants.filter((m: any) => m.is_verified);

    return NextResponse.json({ pending, verified });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
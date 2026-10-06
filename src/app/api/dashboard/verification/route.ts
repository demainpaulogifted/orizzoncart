import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

async function getMerchant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.from('merchants').select('*').eq('user_id', user.id).maybeSingle();
  return data || null;
}

export async function GET() {
  const merchant = await getMerchant();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });
  return NextResponse.json(merchant);
}

export async function POST(request: Request) {
  const merchant = await getMerchant();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const b = await request.json();

  const phone = (b.business_phone || '').trim();
  const email = (b.business_email || '').trim();
  const about = (b.business_about || '').trim();
  const logo = (b.logo_url || '').trim();
  const locs = Array.isArray(b.business_locations) ? b.business_locations : [];

  if (phone.replace(/\D/g, '').length < 7)
    return NextResponse.json({ error: 'A valid business phone number is required.' }, { status: 400 });
  if (!email.includes('@'))
    return NextResponse.json({ error: 'A valid business contact email is required.' }, { status: 400 });
  if (!logo.startsWith('http'))
    return NextResponse.json({ error: 'Business logo is required (upload it in Store Settings first).' }, { status: 400 });
  if (about.length < 20)
    return NextResponse.json({ error: 'Please write a proper "About" (at least 20 characters).' }, { status: 400 });
  if (locs.length !== 3)
    return NextResponse.json({ error: 'Exactly 3 business locations are required.' }, { status: 400 });
  for (let i = 0; i < 3; i++) {
    const l = locs[i] || {};
    if (!l.address?.trim() || !l.city?.trim() || !l.state?.trim())
      return NextResponse.json({ error: `Location ${i + 1} is incomplete (address, city and state are required).` }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('merchants')
    .update({
      business_phone: phone,
      business_email: email,
      business_about: about,
      cac_number: (b.cac_number || '').trim() || null,
      logo_url: logo,
      business_locations: locs,
      is_verified: true,
    })
    .eq('id', merchant.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
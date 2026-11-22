
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const COUNTRY_CONFIG = [
  { country_code: 'NG', country_name: 'Nigeria', currency_code: 'NGN', gateway: 'paystack' },
  { country_code: 'ZA', country_name: 'South Africa', currency_code: 'ZAR', gateway: 'paystack' },
  { country_code: 'EG', country_name: 'Egypt', currency_code: 'EGP', gateway: 'paystack' },
  { country_code: 'KE', country_name: 'Kenya', currency_code: 'KES', gateway: 'paystack' },
  { country_code: 'MA', country_name: 'Morocco', currency_code: 'MAD', gateway: 'paystack' },
  { country_code: 'US', country_name: 'United States', currency_code: 'USD', gateway: 'paypal' },
  { country_code: 'GB', country_name: 'United Kingdom', currency_code: 'USD', gateway: 'paypal' },
  { country_code: 'CA', country_name: 'Canada', currency_code: 'USD', gateway: 'paypal' },
  { country_code: 'MX', country_name: 'Mexico', currency_code: 'USD', gateway: 'paypal' },
  { country_code: 'HT', country_name: 'Haiti', currency_code: 'USD', gateway: 'paypal' },
  { country_code: 'OTHER', country_name: 'International Showcase', currency_code: 'USD', gateway: 'paypal' },
] as const;

async function authorize() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'platform_admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { error: null };
}

export async function GET() {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('platform_activation_fees')
      .select('country_code, amount, is_enabled');

    if (error) throw error;

    const fees = COUNTRY_CONFIG.map((country) => {
      const saved = (data || []).find(
        (row) => row.country_code === country.country_code
      );

      return {
        ...country,
        amount: saved?.amount == null ? null : Number(saved.amount),
        is_enabled: saved?.is_enabled ?? true,
      };
    });

    return NextResponse.json({ fees });
  } catch (error) {
    console.error('Activation fee GET error:', error);
    return NextResponse.json(
      { error: 'Could not load activation fees.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await authorize();
    if (auth.error) return auth.error;

    const body = await request.json();
    if (!Array.isArray(body?.fees)) {
      return NextResponse.json({ error: 'Invalid fees payload.' }, { status: 400 });
    }

    const allowed = new Set(COUNTRY_CONFIG.map((item) => item.country_code));
    const seen = new Set<string>();

    for (const fee of body.fees) {
      if (
        !fee ||
        typeof fee.country_code !== 'string' ||
        !allowed.has(fee.country_code) ||
        seen.has(fee.country_code) ||
        typeof fee.is_enabled !== 'boolean'
      ) {
        return NextResponse.json({ error: 'Invalid or duplicate country fee.' }, { status: 400 });
      }

      seen.add(fee.country_code);

      if (
        fee.amount !== null &&
        (
          typeof fee.amount !== 'number' ||
          !Number.isFinite(fee.amount) ||
          fee.amount < 0 ||
          Math.round(fee.amount * 100) !== fee.amount * 100
        )
      ) {
        return NextResponse.json(
          { error: `Invalid amount for ${fee.country_code}. Use a non-negative amount with at most two decimal places.` },
          { status: 400 }
        );
      }
    }

    if (seen.size !== COUNTRY_CONFIG.length) {
      return NextResponse.json(
        { error: 'Submit all configured country fee rows together.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const rows = COUNTRY_CONFIG.map((country) => {
      const submitted = body.fees.find(
        (fee: any) => fee.country_code === country.country_code
      );

      return {
        ...country,
        amount: submitted.amount,
        is_enabled: submitted.is_enabled,
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await admin
      .from('platform_activation_fees')
      .upsert(rows, { onConflict: 'country_code' });

    if (error) throw error;

    return GET();
  } catch (error) {
    console.error('Activation fee PUT error:', error);
    return NextResponse.json(
      { error: 'Could not save activation fees.' },
      { status: 500 }
    );
  }
}

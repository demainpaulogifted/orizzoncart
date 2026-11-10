import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateInviteCode, inviteLink } from '@/lib/invite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const bank_name = String(body.bank_name || '').trim();
    const bank_code = String(body.bank_code || '').trim();
    const account_number = String(body.account_number || '').trim();
    const account_name = String(body.account_name || '').trim();

    if (!email || !bank_name || !bank_code || !account_number || !account_name) {
      return NextResponse.json({ error: 'Email, bank, account number and verified name are required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: existing } = await admin.from('invite_partners').select('*').eq('email', email).maybeSingle();
    if (existing) {
      return NextResponse.json({ partner: existing, link: inviteLink(existing.invite_code), returning: true });
    }

    let code = generateInviteCode(8);
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await admin.from('invite_partners').select('id').eq('invite_code', code).maybeSingle();
      if (!clash) break;
      code = generateInviteCode(8);
    }

    const { data: partner, error } = await admin
      .from('invite_partners')
      .insert({ email, invite_code: code, bank_name, bank_code, account_number, account_name })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ partner, link: inviteLink(code), returning: false }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Registration failed' }, { status: 500 });
  }
}

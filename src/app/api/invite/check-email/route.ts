
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from('invite_partners')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      exists: !!data,
    });
  } catch (error: any) {
    console.error('Partner email check:', error);

    return NextResponse.json(
      { error: 'Could not check this email. Please try again.' },
      { status: 500 }
    );
  }
}

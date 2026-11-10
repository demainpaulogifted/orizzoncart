import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { INVITE_COOKIE } from '@/lib/invite';

export default async function InviteCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = (code || '').trim().toLowerCase();
  if (clean) {
    const jar = await cookies();
    jar.set(INVITE_COOKIE, clean, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
  }
  redirect(`/signup?ref=${encodeURIComponent(clean)}`);
}

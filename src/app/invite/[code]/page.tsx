import { redirect } from 'next/navigation';

/**
 * Cookie is set in middleware. This page only redirects to signup.
 * Reserved paths under /invite: join, dashboard
 */
export default async function InviteCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const clean = (code || '').trim().toLowerCase();

  if (!clean || clean === 'join' || clean === 'dashboard') {
    redirect('/invite/join');
  }

  redirect(`/signup?ref=${encodeURIComponent(clean)}`);
}

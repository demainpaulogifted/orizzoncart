import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user.id).maybeSingle();
  if (!merchant) redirect('/onboarding');

  // AUTO-STOP: if maintenance expired, suspend payment receiving immediately
  let current = merchant;
  if (merchant.maintenance_expires_at && new Date(merchant.maintenance_expires_at) < new Date() && merchant.payment_receiving_status === 'ACTIVE') {
    await supabase.from('merchants').update({
      payment_receiving_status: 'SUSPENDED',
      cart_status: 'LOCKED',
      checkout_status: 'DISABLED',
      maintenance_status: 'expired',
    }).eq('id', merchant.id);
    current = { ...merchant, payment_receiving_status: 'SUSPENDED', cart_status: 'LOCKED', checkout_status: 'DISABLED' };
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  const isAdmin = profile?.role === 'platform_admin';

  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardSidebar merchant={current} isAdmin={isAdmin} />
      <main className="pl-20 sm:pl-24">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
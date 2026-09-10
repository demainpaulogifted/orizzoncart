import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { StoreSwitcher } from '@/components/dashboard/StoreSwitcher';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: merchants } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id);

  if (!merchants || merchants.length === 0) redirect('/onboarding');

  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;
  const currentMerchant = merchants.find((m) => m.id === activeId) || merchants[0];

  let merchant = currentMerchant;
  if (
    currentMerchant.maintenance_expires_at &&
    new Date(currentMerchant.maintenance_expires_at) < new Date() &&
    currentMerchant.payment_receiving_status === 'ACTIVE'
  ) {
    await supabase
      .from('merchants')
      .update({
        payment_receiving_status: 'SUSPENDED',
        cart_status: 'LOCKED',
        checkout_status: 'DISABLED',
        maintenance_status: 'expired',
      })
      .eq('id', currentMerchant.id);
    merchant = { ...currentMerchant, payment_receiving_status: 'SUSPENDED' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  const isAdmin = profile?.role === 'platform_admin';

  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardSidebar merchant={merchant} isAdmin={isAdmin} />
      <main className="pl-14">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-end mb-5">
            <StoreSwitcher currentMerchant={merchant} />
          </div>
          {children}
          <DashboardFooter />
        </div>
      </main>
    </div>
  );
}
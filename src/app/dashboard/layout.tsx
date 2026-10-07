import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MerchantTour } from '@/components/dashboard/MerchantTour';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = profile?.role === 'platform_admin' || profile?.role === 'staff';

  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('user_id', user.id);

  const merchant =
    (merchants || []).find((m: any) => m.id === activeId) || (merchants || [])[0] || null;

  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardSidebar merchant={merchant} isAdmin={isAdmin} />
      <MerchantTour />
      <main className="pt-14 min-w-0">
        <div className="w-full max-w-full px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
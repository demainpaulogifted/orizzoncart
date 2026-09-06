import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
  if (!merchant) redirect('/onboarding');

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar merchant={merchant} />
      <main className="lg:ml-64 pt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
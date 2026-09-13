import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'platform_admin' && profile?.role !== 'staff') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-slate-100 overflow-x-hidden">
      <AdminSidebar role={profile?.role} />
      <main className="pl-16 sm:pl-20 md:pl-24 min-w-0">
        <div className="w-full max-w-full px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
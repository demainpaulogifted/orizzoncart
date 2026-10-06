'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MarketplaceSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Create the Supabase Auth user
    const { data, error: authError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: name, is_shopper: true } }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Create the Marketplace Customer profile
    try {
      const admin = createAdminClient();
      await admin.from('marketplace_customers').upsert({
        email: email,
        full_name: name,
        password_hash: 'managed_by_supabase_auth' // We use Supabase Auth for security
      }, { onConflict: 'email' });
    } catch (e) {
      console.error('Profile creation error', e);
    }

    router.push('/marketplace/profile');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <Link href="/marketplace" className="text-purple-600 text-sm hover:underline mb-6 inline-block">← Back to Marketplace</Link>
        <h1 className="text-2xl font-extrabold mb-2 text-center">Create Shopper Account</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">One account to track orders from every OrizzonCart store.</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Password (min 6 chars)</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Shopper Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/marketplace/login" className="text-purple-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
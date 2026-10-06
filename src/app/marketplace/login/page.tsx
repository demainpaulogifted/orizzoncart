'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MarketplaceLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/marketplace/profile');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <Link href="/marketplace" className="text-purple-600 text-sm hover:underline mb-6 inline-block">← Back to Marketplace</Link>
        <h1 className="text-2xl font-extrabold mb-2 text-center">Welcome Back, Shopper</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Log in to track your orders from all stores.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Logging in...' : 'Log In to Marketplace'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have a shopper account?{' '}
          <Link href="/marketplace/signup" className="text-purple-600 font-bold hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message);
      setBusy(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-8 text-center">
          <h1 className="text-3xl font-extrabold text-white">OrizzonCart</h1>
          <p className="text-purple-100 text-sm mt-1">Own Your Sales • Welcome back</p>
        </div>
        <form onSubmit={submit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Link href="/forgot-password" className="block text-center text-xs font-bold text-purple-600 hover:underline">
            Forgot password?
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {busy ? 'Signing in...' : 'Log In'}
          </button>
          <p className="text-center text-sm text-gray-600">
            New here?{' '}
            <Link href="/signup" className="font-bold text-purple-600 hover:underline">
              Create your free store
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
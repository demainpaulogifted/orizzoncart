'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { MarketplaceReturnBanner } from '@/components/marketplace/MarketplaceReturnBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Authentication failed. Please try again.');

      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (merchantError) throw merchantError;

      if (merchant) {
        const requested = new URLSearchParams(window.location.search).get('next');
        const destination =
          requested && requested.startsWith('/') && !requested.startsWith('//')
            ? requested
            : '/dashboard';
        router.replace(destination);
      } else {
        router.replace('/onboarding');
      }
      router.refresh();
    } catch (err: any) {
      console.error('Merchant login error:', err);
      toast.error(err.message || 'Unable to sign in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MarketplaceReturnBanner />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">Merchant Login</h1>
            <p className="text-sm text-gray-500">Sign in to manage your OrizzonCart store</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <input required type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input required type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-600">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-lg shadow-purple-200">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="text-center space-y-3 pt-2">
            <Link href="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-700">
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-500">
              Need a merchant account?{' '}
              <Link href="/signup" className="font-bold text-purple-600 hover:text-purple-700">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        <span className="text-5xl">🔑</span>
        <h1 className="text-2xl font-extrabold">Reset your password</h1>
        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm font-bold">
            ✅ Check your email! We sent a secure reset link. Tap it to set a new password. (No code needed.)
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 text-left">
            <label className="block text-sm font-medium text-gray-700">Your email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
            <button type="submit" disabled={busy} className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
              {busy ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <Link href="/login" className="block text-sm font-bold text-purple-600 hover:underline">← Back to login</Link>
      </div>
    </div>
  );
}
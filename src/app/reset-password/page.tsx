'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setBusy(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(err.message);
    else setDone(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        <span className="text-5xl">🔒</span>
        <h1 className="text-2xl font-extrabold">Choose a new password</h1>
        {done ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm font-bold">
              ✅ Password changed successfully!
            </div>
            <Link href="/login" className="block w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 text-left">
            <label className="block text-sm font-medium text-gray-700">New password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
            <label className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
            <button type="submit" disabled={busy} className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
              {busy ? 'Saving...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
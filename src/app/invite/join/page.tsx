'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const BANKS: { name: string; code: string }[] = [
  { name: 'Access Bank', code: '044' }, { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' }, { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' }, { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Globus Bank', code: '00103' }, { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Heritage Bank', code: '030' }, { name: 'Keystone Bank', code: '082' },
  { name: 'Polaris Bank', code: '076' }, { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' }, { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' }, { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' }, { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank (ALAT)', code: '035' }, { name: 'Zenith Bank', code: '057' },
  { name: 'Moniepoint MFB', code: '50515' }, { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay', code: '999992' }, { name: 'PalmPay', code: '999991' },
  { name: 'FairMoney MFB', code: '51318' },
];

export default function InviteJoinPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState(BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const bankCode = useMemo(() => BANKS.find((b) => b.name === bankName)?.code || '', [bankName]);

  async function verifyAccount() {
    if (!accountNumber || accountNumber.length < 10) { toast.error('Enter a valid 10-digit account number'); return; }
    setVerifying(true); setAccountName('');
    try {
      const res = await fetch('/api/invite/resolve-bank', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setAccountName(data.account_name); toast.success('Account name verified');
    } catch (e: any) { toast.error(e.message || 'Could not verify account'); }
    finally { setVerifying(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName) { toast.error('Verify your account name first'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/invite/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: accountName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      toast.success(data.returning ? 'Welcome back' : 'You are in!');
      router.push(`/invite/dashboard?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-10">
      <div className="max-w-md mx-auto">
        <Link href="/marketplace" className="text-sm font-bold text-purple-600 hover:underline">← Marketplace</Link>
        <div className="mt-4 bg-white rounded-3xl border shadow-xl p-6 space-y-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-amber-600">Invite & Earn</p>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Earn ₦500 per activated store</h1>
            <p className="text-sm text-gray-600 mt-2">Register with email + bank only. Share your link. When a merchant activates payments, you earn ₦500.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Bank</label>
              <select value={bankName} onChange={(e) => { setBankName(e.target.value); setAccountName(''); }} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                {BANKS.map((b) => <option key={b.code + b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Account number</label>
              <div className="flex gap-2">
                <input required inputMode="numeric" maxLength={10} value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setAccountName(''); }} className="flex-1 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400" placeholder="0123456789" />
                <button type="button" onClick={() => void verifyAccount()} disabled={verifying} className="px-4 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl disabled:opacity-50">{verifying ? '...' : 'Verify'}</button>
              </div>
              {accountName && <p className="mt-2 text-sm font-bold text-green-700">✓ {accountName}</p>}
            </div>
            <button type="submit" disabled={loading || !accountName} className="w-full py-3.5 bg-amber-500 text-white font-extrabold rounded-xl hover:bg-amber-600 disabled:opacity-50">{loading ? 'Saving...' : 'Get my invite link'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

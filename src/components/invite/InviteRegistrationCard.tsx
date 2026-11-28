
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank (ALAT)', code: '035' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'FairMoney MFB', code: '51318' },
];

export default function InviteRegistrationCard() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'bank' | 'login'>('email');

  const [bankName, setBankName] = useState(BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [checking, setChecking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const bankCode = useMemo(
    () => BANKS.find((bank) => bank.name === bankName)?.code || '',
    [bankName]
  );

  async function continueWithEmail() {
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Enter a valid email address.');
      return;
    }

    setChecking(true);

    try {
      const res = await fetch('/api/invite/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not check email.');

      setStep(data.exists ? 'login' : 'bank');
    } catch (error: any) {
      toast.error(error.message || 'Please try again.');
    } finally {
      setChecking(false);
    }
  }

  async function verifyAccount() {
    if (!/^\d{10}$/.test(accountNumber)) {
      toast.error('Enter a valid 10-digit account number.');
      return;
    }

    setVerifying(true);
    setAccountName('');

    try {
      const res = await fetch('/api/invite/resolve-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: bankCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Account verification failed.');

      setAccountName(data.account_name);
      toast.success('Bank account successfully verified.');
    } catch (error: any) {
      toast.error(error.message || 'Could not verify account.');
    } finally {
      setVerifying(false);
    }
  }

  async function createAccount() {
    if (!accountName) {
      toast.error('Verify your bank account first.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invite/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          bank_name: bankName,
          bank_code: bankCode,
          account_number: accountNumber,
          account_name: accountName,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      toast.success('Your partner account has been created!');
      router.replace('/invite/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    if (!/^\d{10}$/.test(accountNumber)) {
      toast.error('Enter your 10-digit account number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invite/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          account_number: accountNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed.');

      toast.success('Welcome back!');
      router.replace('/invite/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  function resetToEmail() {
    setStep('email');
    setAccountNumber('');
    setAccountName('');
  }

  return (
    <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xl shadow-purple-900/5 sm:p-8">
      <div className="mb-7">
        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-amber-800">
          Partner registration
        </span>

        <h3 className="mt-4 text-2xl font-black text-gray-950">
          {step === 'email' && 'Get your personal invite link.'}
          {step === 'bank' && 'Verify your bank account.'}
          {step === 'login' && 'Welcome back, partner.'}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {step === 'email' && 'Enter your email to get started.'}
          {step === 'bank' && 'Complete your bank details to create your account.'}
          {step === 'login' && 'Enter your registered account number to access your dashboard.'}
        </p>
      </div>

      {step === 'email' && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Email address
            </label>

            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void continueWithEmail();
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 outline-none focus:border-purple-500 focus:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="button"
            onClick={() => void continueWithEmail()}
            disabled={checking}
            className="w-full rounded-xl bg-purple-700 px-5 py-4 font-black text-white disabled:opacity-50"
          >
            {checking ? 'Checking email...' : 'Continue →'}
          </button>

          <p className="text-center text-xs leading-6 text-gray-400">
            New partner? We will guide you through registration. Already registered?
            You can log in with your bank account number.
          </p>
        </div>
      )}

      {step === 'bank' && (
        <div className="space-y-5">
          <div className="rounded-xl bg-purple-50 p-3 text-sm text-purple-800">
            Registering: <strong>{email}</strong>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Select your bank
            </label>

            <select
              value={bankName}
              onChange={(e) => {
                setBankName(e.target.value);
                setAccountName('');
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
            >
              {BANKS.map((bank) => (
                <option key={bank.code + bank.name} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Account number
            </label>

            <input
              required
              inputMode="numeric"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                setAccountName('');
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
              placeholder="Enter 10-digit account number"
            />

            <button
              type="button"
              onClick={() => void verifyAccount()}
              disabled={verifying}
              className="mt-3 w-full rounded-xl border-2 border-purple-700 px-4 py-3 font-bold text-purple-800 disabled:opacity-50"
            >
              {verifying ? 'Verifying account...' : 'Verify bank account'}
            </button>

            {accountName && (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-bold uppercase text-green-700">
                  Verified account name
                </p>
                <p className="mt-1 font-extrabold text-green-900">
                  ✓ {accountName}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void createAccount()}
            disabled={loading || !accountName}
            className="w-full rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-4 font-black text-white disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create my account and get my invite link →'}
          </button>

          <button
            type="button"
            onClick={resetToEmail}
            className="w-full py-2 text-sm font-bold text-gray-500"
          >
            ← Back
          </button>

          <p className="text-center text-xs leading-6 text-gray-400">
            Your verified account number will also be your initial login password.
            Keep it private.
          </p>
        </div>
      )}

      {step === 'login' && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Registered email address
            </label>

            <input
              type="email"
              value={email}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-4 text-gray-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Re-enter your 10-digit account number
            </label>

            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={10}
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') void login();
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
              placeholder="••••••••••"
            />
          </div>

          <button
            type="button"
            onClick={() => void login()}
            disabled={loading}
            className="w-full rounded-xl bg-purple-700 px-5 py-4 font-black text-white disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in to dashboard →'}
          </button>

          <button
            type="button"
            onClick={resetToEmail}
            className="w-full py-2 text-sm font-bold text-gray-500"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const NIGERIAN_BANKS = [
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
  { name: 'SunTrust Bank', code: '100' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank (ALAT)', code: '035' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Parallex Bank', code: '104' },
  { name: 'PremiumTrust Bank', code: '105' },
  { name: 'Optimus Bank', code: '107' },
  { name: 'Signature Bank', code: '106' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Taj Bank', code: '302' },
  { name: 'Lotus Bank', code: '303' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'Sparkle MFB', code: '51310' },
  { name: 'Rubies MFB', code: '125' },
  { name: 'VFD MFB (V Bank)', code: '566' },
  { name: 'Carbon (OneFi)', code: '565' },
  { name: 'FairMoney MFB', code: '51318' },
  { name: 'GoMoney', code: '100022' },
  { name: 'Accion MFB', code: '602' },
  { name: 'AB Microfinance Bank', code: '401' },
  { name: 'LAPO MFB', code: '403' },
  { name: 'Bainescredit MFB', code: '51229' },
  { name: 'NPF Microfinance Bank', code: '50629' },
  { name: 'Nirsal MFB', code: '50115' },
  { name: 'Bowen MFB', code: '50931' },
  { name: 'Amju MFB', code: '50926' },
  { name: 'Mutual Benefits MFB', code: '50604' },
  { name: 'FCT MFB', code: '50267' },
  { name: 'Microvis MFB', code: '50819' },
  { name: 'OPay', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Flutterwave Send', code: '110004' },
  { name: 'EcoMobile (Xpress)', code: '307' },
];

export default function PaymentSettingsPage() {
  const [bankQuery, setBankQuery] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentBank, setCurrentBank] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('merchants')
        .select('bank_name, account_number, account_name, payment_receiving_status, paystack_secret_key, flutterwave_secret_key')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data && data.account_name) setCurrentBank(data);
    };
    load();
  }, []);

  const filteredBanks = bankQuery
    ? NIGERIAN_BANKS.filter((b) => b.name.toLowerCase().includes(bankQuery.toLowerCase()))
    : NIGERIAN_BANKS;
  const selectedBank = NIGERIAN_BANKS.find((b) => b.code === bankCode);
  const options =
    selectedBank && !filteredBanks.some((b) => b.code === selectedBank.code)
      ? [selectedBank, ...filteredBanks]
      : filteredBanks;

  const resolveBank = async () => {
    if (accountNumber.length !== 10) {
      toast.error('Account number must be 10 digits');
      return;
    }
    setResolving(true);
    setAccountName('');
    try {
      const res = await fetch('/api/merchants/resolve-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
      });
      const data = await res.json();
      if (data.account_name) {
        setAccountName(data.account_name);
        toast.success('Account verified!');
      } else {
        toast.error(data.error || 'Could not verify account');
      }
    } catch {
      toast.error('Network error — try again');
    }
    setResolving(false);
  };

  const saveBank = async () => {
    setSaving(true);
    const bankName = NIGERIAN_BANKS.find((b) => b.code === bankCode)?.name || '';
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      toast.error('Not logged in');
      return;
    }

    const isPendingActivation = currentBank?.payment_receiving_status === 'PENDING_KEYS';

    const updatePayload: any = {
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      paystack_subaccount_code: null,
      split_code_token: null,
      split_code_source: null,
    };

    if (isPendingActivation) {
      updatePayload.payment_receiving_status = 'ACTIVE';
      updatePayload.cart_status = 'ENABLED';
      updatePayload.checkout_status = 'ENABLED';
    }

    const { error } = await supabase.from('merchants').update(updatePayload).eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast.error('Failed to save: ' + error.message);
      return;
    }

    toast.success(isPendingActivation ? '🎉 Store activated! You can now start selling.' : '✅ Payout account updated!');
    setCurrentBank({
      ...currentBank,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      payment_receiving_status: isPendingActivation ? 'ACTIVE' : currentBank?.payment_receiving_status,
    });
    setEditing(false);
    setAccountName('');
    setAccountNumber('');
    setBankCode('');
    setBankQuery('');
  };

  const removeBank = async () => {
    const typed = prompt('Type DELETE to confirm removing your payout account:');
    if (typed !== 'DELETE') {
      if (typed !== null) toast.error('Not removed — type DELETE exactly to confirm.');
      return;
    }
    setDeleting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setDeleting(false);
      return;
    }

    const hasLegacyKeys = !!(currentBank?.paystack_secret_key || currentBank?.flutterwave_secret_key);
    const updatePayload: any = {
      bank_name: null,
      account_number: null,
      account_name: null,
      paystack_subaccount_code: null,
      split_code_token: null,
      split_code_source: null,
    };
    if (!hasLegacyKeys) {
      updatePayload.payment_receiving_status = 'NOT_CONFIGURED';
      updatePayload.cart_status = 'LOCKED';
      updatePayload.checkout_status = 'DISABLED';
    }

    const { error } = await supabase.from('merchants').update(updatePayload).eq('user_id', user.id);
    setDeleting(false);
    if (error) {
      toast.error('Failed to remove: ' + error.message);
      return;
    }
    toast.success('Payout account removed.');
    setCurrentBank(null);
    setEditing(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">💜 OrizzonPay Settlement</h1>
        <p className="text-gray-600 text-sm">
          Where your money lands automatically after the 24hr bank clearing window.
        </p>
      </div>

      {currentBank && !editing && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase">Active Payout Account</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentBank.payment_receiving_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {currentBank.payment_receiving_status === 'ACTIVE' ? '✅ Receiving Payments' : '⏳ Awaiting Activation'}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-lg font-extrabold text-gray-900">{currentBank.account_name}</p>
            <p className="text-sm text-gray-600 mt-1">{currentBank.bank_name}</p>
            <p className="text-sm font-mono text-gray-600 mt-1">•••• •••• {String(currentBank.account_number).slice(-4)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setEditing(true)} className="py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700">
              ✏️ Change Account
            </button>
            <button onClick={removeBank} disabled={deleting} className="py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 disabled:opacity-50">
              {deleting ? '...' : '🗑️ Remove Account'}
            </button>
          </div>

          <div className="text-xs text-gray-500 space-y-1 text-center">
            <p>Platform token: 1.5% per sale • Payouts auto-arrive after 24hr bank clearing</p>
            <p>🔒 We never hold your money. Paystack routes it directly to this account.</p>
          </div>
        </div>
      )}

      {(!currentBank || editing) && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">{currentBank ? 'Change Bank Account' : 'Add Bank Account'}</h2>
            {currentBank && (
              <button onClick={() => setEditing(false)} className="text-sm font-bold text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Search your bank</label>
            <input
              type="text"
              value={bankQuery}
              onChange={(e) => setBankQuery(e.target.value)}
              placeholder="Type bank name e.g. Kuda, GTB, Moniepoint..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            />
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Select bank...</option>
              {options.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Account Number (10 digits)</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0123456789"
              />
              <button
                onClick={resolveBank}
                disabled={!bankCode || accountNumber.length !== 10 || resolving}
                className="px-5 bg-gray-900 text-white rounded-xl font-bold text-sm disabled:opacity-50"
              >
                {resolving ? '...' : 'Verify'}
              </button>
            </div>
          </div>

          {accountName && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-xs text-purple-800 font-bold uppercase">Verified Account Name</p>
              <p className="text-lg font-extrabold text-gray-900">{accountName}</p>
            </div>
          )}

          <button
            onClick={saveBank}
            disabled={!accountName || saving}
            className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : currentBank ? 'Update Payout Account' : 'Activate OrizzonPay'}
          </button>

          <div className="text-xs text-gray-500 space-y-1 text-center">
            <p>Platform token: 1.5% per sale • Payouts auto-arrive after 24hr bank clearing</p>
            <p>🔒 We never hold your money. Paystack routes it directly to this account.</p>
          </div>
        </div>
      )}
    </div>
  );
}
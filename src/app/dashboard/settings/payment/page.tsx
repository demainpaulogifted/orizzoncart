'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' }, { name: 'Citibank Nigeria', code: '023' }, { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' }, { name: 'First Bank of Nigeria', code: '011' }, { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Globus Bank', code: '00103' }, { name: 'Guaranty Trust Bank (GTBank)', code: '058' }, { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' }, { name: 'Polaris Bank', code: '076' }, { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' }, { name: 'Standard Chartered Bank', code: '068' }, { name: 'Sterling Bank', code: '232' },
  { name: 'SunTrust Bank', code: '100' }, { name: 'Titan Trust Bank', code: '102' }, { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' }, { name: 'Unity Bank', code: '215' }, { name: 'Wema Bank (ALAT)', code: '035' },
  { name: 'Zenith Bank', code: '057' }, { name: 'Parallex Bank', code: '104' }, { name: 'PremiumTrust Bank', code: '105' },
  { name: 'Optimus Bank', code: '107' }, { name: 'Signature Bank', code: '106' }, { name: 'Jaiz Bank', code: '301' },
  { name: 'Taj Bank', code: '302' }, { name: 'Lotus Bank', code: '303' }, { name: 'Moniepoint MFB', code: '50515' },
  { name: 'Kuda Bank', code: '50211' }, { name: 'Sparkle MFB', code: '51310' }, { name: 'Rubies MFB', code: '125' },
  { name: 'VFD MFB (V Bank)', code: '566' }, { name: 'Carbon (OneFi)', code: '565' }, { name: 'FairMoney MFB', code: '51318' },
  { name: 'GoMoney', code: '100022' }, { name: 'Accion MFB', code: '602' }, { name: 'AB Microfinance Bank', code: '401' },
  { name: 'LAPO MFB', code: '403' }, { name: 'Bainescredit MFB', code: '51229' }, { name: 'NPF Microfinance Bank', code: '50629' },
  { name: 'Nirsal MFB', code: '50115' }, { name: 'Bowen MFB', code: '50931' }, { name: 'Amju MFB', code: '50926' },
  { name: 'Mutual Benefits MFB', code: '50604' }, { name: 'FCT MFB', code: '50267' }, { name: 'Microvis MFB', code: '50819' },
  { name: 'OPay', code: '999992' }, { name: 'PalmPay', code: '999991' }, { name: 'Flutterwave Send', code: '110004' },
  { name: 'EcoMobile (Xpress)', code: '307' },
];

function mask(key: string) { return key ? '••••••••' + key.slice(-4) : ''; }

export default function PaymentSettingsPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [feeInfo, setFeeInfo] = useState<any>(null);
  const [feePaying, setFeePaying] = useState(false);
  const [showKeysForm, setShowKeysForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [keysForm, setKeysForm] = useState({ gateway: 'paystack', ps_secret: '', ps_public: '', fw_secret: '', fw_public: '' });
  const [savingKeys, setSavingKeys] = useState(false);
  const [bankQuery, setBankQuery] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
      const { data: merchants } = await supabase.from('merchants').select('*').eq('user_id', user.id);
      const active = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];
      setMerchant(active || null);
      if (active) setKeysForm((k) => ({ ...k, gateway: active.preferred_gateway || 'paystack' }));
      const fee = await fetch('/api/payments/platform/initialize').then((r) => r.json()).catch(() => null);
      setFeeInfo(fee);
    };
    load();
  }, []);

  const feePaid = merchant && (merchant.payment_receiving_status === 'ACTIVE' || merchant.payment_receiving_status === 'PENDING_KEYS' || !!merchant.payment_activated_at);
  const hasOwnKeys = merchant && (merchant.paystack_secret_key || merchant.flutterwave_secret_key);
  const hasBank = merchant && merchant.bank_name && merchant.account_number;
  const method = merchant?.payout_method || (hasOwnKeys ? 'own_keys' : hasBank ? 'orizzonpay' : null);

  const payActivationFee = async () => {
    setFeePaying(true);
    try {
      const res = await fetch('/api/payments/platform/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'payment_activation' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast.error(err.message || 'Could not start payment');
      setFeePaying(false);
    }
  };

  const saveKeys = async () => {
    setSavingKeys(true);
    const supabase = createClient();
    const isPending = merchant?.payment_receiving_status === 'PENDING_KEYS';
    const payload: any = {
      preferred_gateway: keysForm.gateway,
      paystack_secret_key: keysForm.ps_secret || merchant?.paystack_secret_key || null,
      paystack_public_key: keysForm.ps_public || merchant?.paystack_public_key || null,
      flutterwave_secret_key: keysForm.fw_secret || merchant?.flutterwave_secret_key || null,
      flutterwave_public_key: keysForm.fw_public || merchant?.flutterwave_public_key || null,
      payout_method: merchant?.payout_method || 'own_keys',
    };
    if (isPending) { payload.payment_receiving_status = 'ACTIVE'; payload.cart_status = 'ENABLED'; payload.checkout_status = 'ENABLED'; }
    const { error } = await supabase.from('merchants').update(payload).eq('id', merchant.id);
    setSavingKeys(false);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('🔑 Keys saved — you keep 100% of every sale!');
    setMerchant({ ...merchant, ...payload, payment_receiving_status: payload.payment_receiving_status || merchant.payment_receiving_status });
    setShowKeysForm(false);
    setKeysForm({ gateway: keysForm.gateway, ps_secret: '', ps_public: '', fw_secret: '', fw_public: '' });
  };

  const filteredBanks = bankQuery ? NIGERIAN_BANKS.filter((b) => b.name.toLowerCase().includes(bankQuery.toLowerCase())) : NIGERIAN_BANKS;
  const selectedBank = NIGERIAN_BANKS.find((b) => b.code === bankCode);
  const options = selectedBank && !filteredBanks.some((b) => b.code === selectedBank.code) ? [selectedBank, ...filteredBanks] : filteredBanks;

  const resolveBank = async () => {
    if (accountNumber.length !== 10) { toast.error('Account number must be 10 digits'); return; }
    setResolving(true); setAccountName('');
    try {
      const res = await fetch('/api/merchants/resolve-bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }) });
      const data = await res.json();
      if (data.account_name) { setAccountName(data.account_name); toast.success('Account verified!'); }
      else toast.error(data.error || 'Could not verify account');
    } catch { toast.error('Network error — try again'); }
    setResolving(false);
  };

  const saveBank = async () => {
    setSavingBank(true);
    const supabase = createClient();
    const isPending = merchant?.payment_receiving_status === 'PENDING_KEYS';
    const payload: any = {
      bank_name: NIGERIAN_BANKS.find((b) => b.code === bankCode)?.name || '',
      account_number: accountNumber,
      account_name: accountName,
      paystack_subaccount_code: null,
      split_code_platform: null,
      payout_method: merchant?.payout_method || 'orizzonpay',
    };
    if (isPending) { payload.payment_receiving_status = 'ACTIVE'; payload.cart_status = 'ENABLED'; payload.checkout_status = 'ENABLED'; }
    const { error } = await supabase.from('merchants').update(payload).eq('id', merchant.id);
    setSavingBank(false);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('🏦 Bank saved — OrizzonPay ready (5% fee)!');
    setMerchant({ ...merchant, ...payload, payment_receiving_status: payload.payment_receiving_status || merchant.payment_receiving_status });
    setShowBankForm(false);
    setAccountName(''); setAccountNumber(''); setBankCode(''); setBankQuery('');
  };

  const switchMethod = async (m: 'own_keys' | 'orizzonpay') => {
    const supabase = createClient();
    const { error } = await supabase.from('merchants').update({ payout_method: m }).eq('id', merchant.id);
    if (error) { toast.error(error.message); return; }
    setMerchant({ ...merchant, payout_method: m });
    toast.success(m === 'own_keys' ? '✅ Now receiving via YOUR keys (0% fee). OrizzonPay locked.' : '✅ Now receiving via OrizzonPay (5% fee). Your keys locked.');
  };

  if (!merchant) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">💳 Payment Settings</h1>
        <p className="text-gray-600 text-sm">Choose how you receive money. Set up one method to start selling — you can save both, but only ONE receives payments at a time.</p>
      </div>

      {!feePaid && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <span className="text-xs font-bold text-purple-600 uppercase">Step 1 — One-time</span>
          <h2 className="font-bold text-lg">Pay Activation Fee</h2>
          <p className="text-sm text-gray-600">Unlocks selling on {merchant.store_name}. After this, set up your payout method below.</p>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-purple-800">Activation Fee</span>
            <span className="text-2xl font-extrabold text-purple-700">₦{Number(feeInfo?.final_amount ?? 5000).toLocaleString()}</span>
          </div>
          <button onClick={payActivationFee} disabled={feePaying} className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
            {feePaying ? 'Redirecting to Paystack...' : 'Pay & Continue'}
          </button>
        </div>
      )}

      {feePaid && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-bold mb-1">Currently receiving payments via:</p>
            {method === 'own_keys' && <p>🔑 Your own payment keys — <strong>0% platform fee</strong> (OrizzonPay bank is locked)</p>}
            {method === 'orizzonpay' && <p>🏦 OrizzonPay bank account — <strong>5% platform fee</strong> (your keys are locked)</p>}
            {!method && <p>⚠️ Nothing yet — set up one method below to start selling.</p>}
          </div>

          {/* OPTION A */}
          <div className={`bg-white border-2 rounded-2xl p-6 space-y-4 ${method === 'own_keys' ? 'border-green-400' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg">🔑 Option A — My Own Payment Keys</h2>
                <p className="text-xs text-gray-500 mt-1">Connect your Paystack/Flutterwave account. Money lands directly with you.</p>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full shrink-0">0% fee</span>
            </div>

            {hasOwnKeys ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  {merchant.paystack_secret_key && <p className="text-sm font-mono">Paystack: {mask(merchant.paystack_secret_key)}</p>}
                  {merchant.flutterwave_secret_key && <p className="text-sm font-mono">Flutterwave: {mask(merchant.flutterwave_secret_key)}</p>}
                </div>
                {method === 'own_keys' ? (
                  <p className="text-xs font-bold text-green-700 bg-green-50 rounded-lg px-3 py-2">✅ ACTIVE — receiving payments here</p>
                ) : (
                  <>
                    <p className="text-xs font-bold text-gray-500 bg-gray-100 rounded-lg px-3 py-2">🔒 Saved but LOCKED — not receiving payments</p>
                    <button onClick={() => switchMethod('own_keys')} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                      Switch to this method (activate)
                    </button>
                  </>
                )}
                <button onClick={() => setShowKeysForm(!showKeysForm)} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200">
                  {showKeysForm ? 'Close' : '✏️ Update keys'}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowKeysForm(!showKeysForm)} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">
                {showKeysForm ? 'Close' : '🔑 Set Up My Own Keys'}
              </button>
            )}

            {showKeysForm && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Preferred Gateway</label>
                  <select value={keysForm.gateway} onChange={(e) => setKeysForm({ ...keysForm, gateway: e.target.value })} className="w-full px-4 py-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="paystack">Paystack</option>
                    <option value="flutterwave">Flutterwave</option>
                  </select>
                </div>
                <input type="password" value={keysForm.ps_secret} onChange={(e) => setKeysForm({ ...keysForm, ps_secret: e.target.value })} placeholder="Paystack Secret Key (sk_test_...)" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" />
                <input value={keysForm.ps_public} onChange={(e) => setKeysForm({ ...keysForm, ps_public: e.target.value })} placeholder="Paystack Public Key (pk_test_...)" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" />
                <input type="password" value={keysForm.fw_secret} onChange={(e) => setKeysForm({ ...keysForm, fw_secret: e.target.value })} placeholder="Flutterwave Secret Key (optional)" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" />
                <input value={keysForm.fw_public} onChange={(e) => setKeysForm({ ...keysForm, fw_public: e.target.value })} placeholder="Flutterwave Public Key (optional)" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" />
                <button onClick={saveKeys} disabled={savingKeys || (!keysForm.ps_secret && !keysForm.fw_secret && !hasOwnKeys)} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
                  {savingKeys ? 'Saving...' : 'Save Keys'}
                </button>
              </div>
            )}
          </div>

          {/* OPTION B */}
          <div className={`bg-white border-2 rounded-2xl p-6 space-y-4 ${method === 'orizzonpay' ? 'border-green-400' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg">🏦 Option B — OrizzonPay (Bank Account)</h2>
                <p className="text-xs text-gray-500 mt-1">No payment account needed. We route money straight to your bank after each sale.</p>
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full shrink-0">5% fee</span>
            </div>

            {hasBank ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-extrabold text-gray-900">{merchant.account_name}</p>
                  <p className="text-sm text-gray-600">{merchant.bank_name} • •••• {String(merchant.account_number).slice(-4)}</p>
                </div>
                {method === 'orizzonpay' ? (
                  <p className="text-xs font-bold text-green-700 bg-green-50 rounded-lg px-3 py-2">✅ ACTIVE — receiving payments here</p>
                ) : (
                  <>
                    <p className="text-xs font-bold text-gray-500 bg-gray-100 rounded-lg px-3 py-2">🔒 Saved but LOCKED — not receiving payments</p>
                    <button onClick={() => switchMethod('orizzonpay')} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                      Switch to this method (activate)
                    </button>
                  </>
                )}
                <button onClick={() => setShowBankForm(!showBankForm)} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200">
                  {showBankForm ? 'Close' : '✏️ Change bank account'}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowBankForm(!showBankForm)} className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">
                {showBankForm ? 'Close' : '🏦 Set Up OrizzonPay (Add Bank)'}
              </button>
            )}

            {showBankForm && (
              <div className="space-y-3 pt-2 border-t">
                <input type="text" value={bankQuery} onChange={(e) => setBankQuery(e.target.value)} placeholder="Search bank name..." className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select bank...</option>
                  {options.map((b: any) => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input type="text" maxLength={10} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} placeholder="10-digit account number" className="flex-1 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                  <button onClick={resolveBank} disabled={!bankCode || accountNumber.length !== 10 || resolving} className="px-5 bg-gray-900 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                    {resolving ? '...' : 'Verify'}
                  </button>
                </div>
                {accountName && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                    <p className="text-xs text-purple-800 font-bold uppercase">Verified Name</p>
                    <p className="font-extrabold text-gray-900">{accountName}</p>
                  </div>
                )}
                <button onClick={saveBank} disabled={!accountName || savingBank} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
                  {savingBank ? 'Saving...' : 'Save Bank Account'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
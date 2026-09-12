'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'GTBank', code: '058' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'First Bank', code: '011' },
  { name: 'UBA', code: '033' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'Opay', code: '999992' },
  { name: 'Palmpay', code: '999991' },
  { name: 'Moniepoint MFB', code: '50515' },
];

export default function PaymentSettingsPage() {
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentBank, setCurrentBank] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('merchants').select('bank_name, account_number, account_name').eq('user_id', (await supabase.auth.getUser()).data.user?.id || '').single();
      if (data) setCurrentBank(data);
    };
    load();
  }, []);

  const resolveBank = async () => {
    if (accountNumber.length !== 10) { toast.error('Account number must be 10 digits'); return; }
    setResolving(true);
    setAccountName('');
    const res = await fetch('/api/merchants/resolve-bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode })
    });
    const data = await res.json();
    setResolving(false);
    if (data.account_name) {
      setAccountName(data.account_name);
      toast.success('Account verified!');
    } else {
      toast.error(data.error || 'Could not verify account');
    }
  };

  const saveBank = async () => {
    setSaving(true);
    const bankName = NIGERIAN_BANKS.find(b => b.code === bankCode)?.name || '';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('merchants').update({
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
    }).eq('user_id', user?.id);

    setSaving(false);
    if (error) toast.error('Failed to save');
    else {
      toast.success('🎉 OrizzonPay activated! Payouts will go here.');
      setCurrentBank({ bank_name: bankName, account_number, account_name: accountName });
      setAccountName(''); setAccountNumber(''); setBankCode('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">💜 OrizzonPay Settlement</h1>
        <p className="text-gray-600 text-sm">Where we send your money automatically after the 24hr bank clearing window.</p>
      </div>

      {currentBank?.account_name && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-green-800 uppercase mb-1">Active Payout Account</p>
          <p className="text-lg font-extrabold text-gray-900">{currentBank.account_name}</p>
          <p className="text-sm text-gray-600">{currentBank.bank_name} • {currentBank.account_number}</p>
        </div>
      )}

      <div className="bg-white border rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-lg">{currentBank ? 'Update' : 'Add'} Bank Account</h2>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Bank Name</label>
          <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select bank...</option>
            {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Account Number (10 digits)</label>
          <div className="flex gap-2">
            <input 
              type="text" maxLength={10} value={accountNumber} 
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} 
              className="flex-1 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" 
              placeholder="0123456789"
            />
            <button onClick={resolveBank} disabled={!bankCode || accountNumber.length !== 10 || resolving} className="px-5 bg-gray-900 text-white rounded-xl font-bold text-sm disabled:opacity-50">
              {resolving ? '...' : 'Verify'}
            </button>
          </div>
        </div>

        {accountName && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-xs text-purple-800 font-bold uppercase">Verified Name</p>
            <p className="text-lg font-extrabold text-gray-900">{accountName}</p>
          </div>
        )}

        <button onClick={saveBank} disabled={!accountName || saving} className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50">
          {saving ? 'Activating OrizzonPay...' : 'Activate OrizzonPay'}
        </button>
        
        <p className="text-xs text-center text-gray-500">🔒 We never hold your money. Paystack routes it directly to this account.</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PayPalConnectCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [environment, setEnvironment] = useState('sandbox');
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      try {
        const response = await fetch(
          '/api/merchants/paypal/connect',
          { cache: 'no-store' }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not load PayPal status.');
        }

        if (active) {
          setConnected(!!data.connected);
          setEnvironment(data.environment || 'sandbox');
        }
      } catch (error: any) {
        if (active) {
          toast.error(error.message || 'Could not load PayPal status.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStatus();

    return () => {
      active = false;
    };
  }, []);

  const connectPayPal = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      toast.error('Enter both your PayPal Client ID and Client Secret.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        '/api/merchants/paypal/connect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId.trim(),
            client_secret: clientSecret.trim(),
            environment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PayPal connection failed.');
      }

      setConnected(true);
      setClientId('');
      setClientSecret('');
      setShowForm(false);

      toast.success('PayPal credentials verified and securely saved.');
    } catch (error: any) {
      toast.error(error.message || 'Could not connect PayPal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-lg">PayPal Business</h2>

        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          connected
            ? 'text-green-700 bg-green-50'
            : 'text-orange-700 bg-orange-50'
        }`}>
          {loading
            ? 'Checking...'
            : connected
              ? 'Credentials verified'
              : 'Not connected'}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        Connect your own PayPal Business REST API credentials.
        Your customers' payments are intended to go directly to
        your own PayPal account.
      </p>

      {connected && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-bold text-green-800">
            PayPal credentials successfully verified.
          </p>
          <p className="text-xs text-green-700">
            Environment: {environment.toUpperCase()}
          </p>
          <p className="text-xs text-green-700">
            Your Client Secret is encrypted and is never displayed here.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
      >
        {showForm
          ? 'Close'
          : connected
            ? 'Update PayPal Credentials'
            : 'Connect My PayPal Account'}
      </button>

      {showForm && (
        <div className="space-y-3 border-t pt-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              PayPal Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white"
            >
              <option value="sandbox">Sandbox — Testing</option>
              <option value="live">Live — Real Payments</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              PayPal Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your PayPal Client ID"
              autoComplete="off"
              className="w-full px-4 py-3 border rounded-xl font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              PayPal Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your PayPal Client Secret"
              autoComplete="new-password"
              className="w-full px-4 py-3 border rounded-xl font-mono text-sm"
            />
          </div>

          <button
            type="button"
            onClick={connectPayPal}
            disabled={saving || !clientId.trim() || !clientSecret.trim()}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Verifying with PayPal...' : 'Verify and Save PayPal'}
          </button>

          <p className="text-xs text-gray-500">
            Your credentials are sent securely to OrizzonCart's
            server. Never share your Client Secret with anyone.
          </p>
        </div>
      )}

      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
        Important: Credential verification confirms that PayPal
        accepts your API credentials. It does not yet confirm that
        your account can receive customer payments through OrizzonCart.
        Checkout integration and receiving eligibility must be completed
        separately.
      </p>
    </div>
  );
}

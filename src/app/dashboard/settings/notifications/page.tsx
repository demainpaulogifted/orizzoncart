'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NotificationSettingsPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/merchant')
      .then(r => r.json())
      .then(d => {
        setMerchant(d.merchant);
        setWhatsappNumber(d.merchant?.whatsapp_number || '');
      });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_number: whatsappNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('✅ Notification settings saved!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function testNotification() {
    try {
      const res = await fetch('/api/dashboard/notifications/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('✅ Test notification sent!');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🔔 Notification Settings</h1>
      <p className="text-gray-500 text-sm">
        Receive WhatsApp alerts when customers place orders.
      </p>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">
            WhatsApp Number
          </label>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="08012345678"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include country code (e.g., 2348012345678)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {whatsappNumber && (
            <button
              onClick={testNotification}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
            >
              Send Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
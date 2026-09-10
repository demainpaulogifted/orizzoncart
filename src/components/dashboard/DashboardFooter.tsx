'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function DashboardFooter() {
  const [deferred, setDeferred] = useState<any>(null);
  const [alertsOn, setAlertsOn] = useState(false);

  useEffect(() => {
    const onPrompt = (e: any) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    if ('Notification' in window && Notification.permission === 'granted') setAlertsOn(true);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) { toast.info('Use your browser menu → "Add to Home screen"'); return; }
    deferred.prompt();
    setDeferred(null);
  };

  const enableAlerts = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) { toast.error('This browser does not support alerts'); return; }
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { toast.error('Notification permission denied'); return; }
      const vapidRes = await fetch('/api/notifications/vapid');
      const { publicKey } = await vapidRes.json();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      const res = await fetch('/api/notifications/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub.toJSON()) });
      if (!res.ok) throw new Error();
      setAlertsOn(true);
      toast.success('🔔 Order alerts ON! You will be pinged on every new order.');
    } catch {
      toast.error('Could not enable alerts on this device');
    }
  };

  return (
    <footer className="mt-12 border-t border-gray-200 bg-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-gray-500 text-center sm:text-left">
        OrizzonCart v1.0 • Powered by OrizzonS Inc. • Built for Nigerian businesses 🇳🇬
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        <button onClick={install} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700">
          📲 Install App
        </button>
        <button onClick={enableAlerts} disabled={alertsOn} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${alertsOn ? 'bg-green-100 text-green-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
          {alertsOn ? '🔔 Alerts ON' : '🔕 Enable Order Alerts'}
        </button>
      </div>
    </footer>
  );
}
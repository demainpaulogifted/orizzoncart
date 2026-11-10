'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { SHARE_MESSAGES } from '@/lib/invite';

function DashboardInner() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!email) { setLoading(false); return; }
    fetch(`/api/invite/stats?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) throw new Error(d.error); setData(d); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [email]);

  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied`); }
    catch { toast.error('Could not copy'); }
  }

  function downloadFlyer(variant: 'short' | 'long') {
    if (!data?.link) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, '#7c3aed'); grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1350);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px system-ui, sans-serif'; ctx.fillText('OrizzonCart', 80, 160);
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.fillText(variant === 'short' ? 'Sell online in Nigeria' : 'Open your free store', 80, 260);
    ctx.font = '36px system-ui, sans-serif';
    const body = variant === 'short' ? 'Free store · WhatsApp selling · Marketplace' : 'Fashion, food, beauty, tech & more.\nNo coding. Launch in minutes.';
    body.split('\n').forEach((line, i) => ctx.fillText(line, 80, 360 + i * 52));
    ctx.font = 'bold 32px system-ui, sans-serif'; ctx.fillText(data.link.replace('https://', ''), 80, 1100);
    ctx.font = '28px system-ui, sans-serif'; ctx.fillText('Invite & Earn · orizzoncart.com.ng', 80, 1180);
    const a = document.createElement('a');
    a.download = `orizzoncart-flyer-${variant}.png`;
    a.href = canvas.toDataURL('image/png'); a.click();
    toast.success('Flyer downloaded');
  }

  if (!email) return <div className="p-10 text-center"><p className="text-gray-600">Open from registration, or </p><Link href="/invite/join" className="text-purple-600 font-bold">register here</Link></div>;
  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!data) return <div className="p-10 text-center text-red-600">Partner not found</div>;

  const link = data.link as string;
  const shortMsg = SHARE_MESSAGES.short + link;
  const longMsg = SHARE_MESSAGES.long + link;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24">
      <div className="max-w-lg mx-auto space-y-4">
        <Link href="/marketplace" className="text-sm font-bold text-purple-600">← Marketplace</Link>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-xs font-extrabold text-amber-600 uppercase">Your invite link</p>
          <p className="mt-2 font-mono text-sm break-all text-gray-900">{link}</p>
          <button type="button" onClick={() => void copy(link, 'Link')} className="mt-3 w-full py-2.5 bg-purple-600 text-white font-bold rounded-xl text-sm">Copy link</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border p-4 text-center"><p className="text-2xl font-extrabold text-purple-700">{data.partner.stores_registered}</p><p className="text-[11px] font-bold text-gray-500 mt-1">Stores registered</p></div>
          <div className="bg-white rounded-2xl border p-4 text-center"><p className="text-2xl font-extrabold text-green-700">{data.partner.stores_activated}</p><p className="text-[11px] font-bold text-gray-500 mt-1">Stores activated</p></div>
          <div className="bg-white rounded-2xl border p-4 text-center"><p className="text-2xl font-extrabold text-amber-600">₦{data.pending_naira}</p><p className="text-[11px] font-bold text-gray-500 mt-1">Pending payout</p></div>
          <div className="bg-white rounded-2xl border p-4 text-center"><p className="text-2xl font-extrabold text-gray-800">₦{data.paid_naira}</p><p className="text-[11px] font-bold text-gray-500 mt-1">Already paid</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-extrabold text-gray-900">Pick a message to share</h2>
          <div className="rounded-xl bg-gray-50 border p-3">
            <p className="text-[10px] font-extrabold uppercase text-gray-400 mb-1">Short</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{shortMsg}</p>
            <button type="button" onClick={() => void copy(shortMsg, 'Short message')} className="mt-2 text-xs font-bold text-purple-600">Copy short message</button>
          </div>
          <div className="rounded-xl bg-gray-50 border p-3">
            <p className="text-[10px] font-extrabold uppercase text-gray-400 mb-1">Long</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{longMsg}</p>
            <button type="button" onClick={() => void copy(longMsg, 'Long message')} className="mt-2 text-xs font-bold text-purple-600">Copy long message</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-extrabold text-gray-900">Download flyers</h2>
          <p className="text-xs text-gray-500">PNG with your link — WhatsApp, Instagram, Facebook.</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => downloadFlyer('short')} className="py-3 bg-gray-900 text-white text-sm font-bold rounded-xl">Short flyer</button>
            <button type="button" onClick={() => downloadFlyer('long')} className="py-3 bg-amber-500 text-white text-sm font-bold rounded-xl">Long flyer</button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400">₦500 pending when a referred store completes activation. You pay partners manually.</p>
      </div>
    </div>
  );
}

export default function InviteDashboardPage() {
  return <Suspense fallback={<div className="p-10 text-center">Loading...</div>}><DashboardInner /></Suspense>;
}

'use client';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics').then((r) => r.json()).then(setData).catch(() => setData({}));
  }, []);

  if (!data) return <div className="p-10 text-center text-gray-500">Loading analytics...</div>;

  const maxSource = Math.max(1, ...(data.sources || []).map((s: any) => s.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600 text-sm">Real visitors, real sources, real time-on-store. Last 30 days.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-xs font-bold text-gray-500 uppercase">Unique Visitors</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{data.visitors || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-xs font-bold text-gray-500 uppercase">Page Views</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">{data.pageviews || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-xs font-bold text-gray-500 uppercase">Avg Time on Store</p>
          <p className="text-3xl font-extrabold text-teal-600 mt-1">{fmtDuration(data.avg_duration || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-xs font-bold text-gray-500 uppercase">Paid Orders</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">{data.orders || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{formatCurrency(data.revenue || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-xs font-bold text-gray-500 uppercase">Conversion</p>
          <p className="text-3xl font-extrabold text-orange-600 mt-1">
            {data.visitors ? ((data.orders / data.visitors) * 100).toFixed(1) : '0.0'}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold mb-4">📍 Where visitors come from</h2>
        {(!data.sources || data.sources.length === 0) ? (
          <p className="text-sm text-gray-500">No traffic yet. Share your store link on WhatsApp & Instagram — sources will appear here automatically.</p>
        ) : (
          <div className="space-y-3">
            {data.sources.map((s: any) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="text-gray-500">{s.count} visits</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        💡 Genuine visitors only: bots, previews and your own logged-in visits are automatically excluded.
      </div>
    </div>
  );
}
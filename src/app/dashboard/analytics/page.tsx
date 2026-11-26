
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
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/analytics', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Analytics unavailable');
        return response.json();
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <p className="font-bold text-gray-800">
          Analytics could not be loaded.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  const maxSource = Math.max(
    1,
    ...(data.sources || []).map((s: any) => s.count)
  );

  const metrics = [
    {
      label: 'Unique Visitors',
      value: data.visitors || 0,
      color: 'text-blue-600',
    },
    {
      label: 'Page Views',
      value: data.pageviews || 0,
      color: 'text-indigo-600',
    },
    {
      label: 'Average Time on Store',
      value: fmtDuration(data.avg_duration || 0),
      color: 'text-teal-600',
    },
    {
      label: 'All Orders',
      value: data.orders || 0,
      color: 'text-green-600',
    },
    {
      label: 'Paid Orders',
      value: data.paid_orders || 0,
      color: 'text-emerald-600',
    },
    {
      label: 'Pending Payments',
      value: data.pending_orders || 0,
      color: 'text-amber-600',
    },
    {
      label: 'Total Sales',
      value: formatCurrency(data.revenue || 0),
      color: 'text-purple-600',
    },
    {
      label: 'Conversion',
      value: `${Number(data.conversion_rate || 0).toFixed(1)}%`,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Business intelligence
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
          Store Analytics
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Understand your visitors, orders and actual business revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-500">
              {item.label}
            </p>
            <p className={`mt-2 break-words text-2xl font-extrabold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-gray-900">
          Sales performance
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Today',
              orders: data.today_orders,
              sales: data.today_revenue,
            },
            {
              label: 'This week',
              orders: data.week_orders,
              sales: data.week_revenue,
            },
            {
              label: 'This month',
              orders: data.month_orders,
              sales: data.month_revenue,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-gray-50 p-4"
            >
              <p className="text-xs font-bold text-gray-500">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-extrabold text-gray-900">
                {formatCurrency(item.sales || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {item.orders || 0} orders
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-gray-900">
          Order status overview
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Pending payment',
              value: data.pending_orders,
              color: 'text-amber-700',
            },
            {
              label: 'Delivered',
              value: data.completed_orders,
              color: 'text-green-700',
            },
            {
              label: 'Cancelled',
              value: data.cancelled_orders,
              color: 'text-red-700',
            },
            {
              label: 'Refunded',
              value: data.refunded_orders,
              color: 'text-purple-700',
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className={`mt-2 text-2xl font-extrabold ${item.color}`}>
                {item.value || 0}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-extrabold text-gray-900">
          Where visitors come from
        </h2>

        {(!data.sources || data.sources.length === 0) ? (
          <p className="text-sm text-gray-500">
            No recorded visitor sources yet. Share your store link to
            start attracting visitors.
          </p>
        ) : (
          <div className="space-y-4">
            {data.sources.map((source: any) => (
              <div key={source.name}>
                <div className="mb-1 flex justify-between text-xs font-bold">
                  <span className="text-gray-700">
                    {source.name}
                  </span>
                  <span className="text-gray-500">
                    {source.count} visits
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{
                      width: `${(source.count / maxSource) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-800">
        Orders include all successfully created orders, even when payment
        is pending. Sales include paid orders that have not been cancelled
        or refunded. Visitor and conversion statistics cover the last
        30 days.
      </div>
    </div>
  );
}

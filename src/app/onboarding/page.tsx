'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';
import {
  COUNTRIES,
  CURRENCIES,
} from '@/lib/geo/country-currency';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countryTouched, setCountryTouched] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    store_name: '',
    store_slug: '',
    whatsapp_number: '',
    merchant_type: 'physical',
    store_description: '',
    country_code: 'NG',
    currency_code: 'NGN',
  });

  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orizzoncart.com.ng';

  useEffect(() => {
    let cancelled = false;

    fetch('/api/geo/country')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || countryTouched || !data.country_code) return;

        const country = COUNTRIES.find(
          (item) => item.code === data.country_code
        );

        if (country) {
          setForm((current) => ({
            ...current,
            country_code: country.code,
            currency_code: country.currency,
          }));
        }
      })
      .catch(() => {
        // Nigeria remains the default if location detection is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [countryTouched]);

  const handleStoreName = (value: string) => {
    setForm((current) => ({
      ...current,
      store_name: value,
      store_slug: generateSlug(value),
    }));
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((item) => item.code === countryCode);
    if (!country) return;

    setCountryTouched(true);
    setForm((current) => ({
      ...current,
      country_code: country.code,
      currency_code: country.currency,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.country_code || !form.currency_code) {
      toast.error('Select your business country and selling currency.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business_name,
          store_name: form.store_name,
          store_slug: form.store_slug,
          merchant_type: form.merchant_type,
          country_code: form.country_code,
          currency_code: form.currency_code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create store');
      }

      document.cookie =
        `active_merchant_id=${data.merchant.id}; path=/; max-age=31536000; SameSite=Lax`;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('merchants')
        .update({
          whatsapp_number: form.whatsapp_number,
          store_description: form.store_description,
        })
        .eq('id', data.merchant.id)
        .eq('user_id', user?.id);

      if (updateError) {
        throw new Error(
          'Store was created, but WhatsApp and description could not be saved. Please contact support.'
        );
      }

      toast.success(`Store "${form.store_name}" created successfully!`);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">Create a New Store</h1>
          <p className="text-gray-600 mt-2">
            Each store has its own products, orders, country and selling currency.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business / Owner Name *
            </label>
            <input
              required
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg"
              placeholder="Paul's Fashion Ltd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Name *
            </label>
            <input
              required
              value={form.store_name}
              onChange={(e) => handleStoreName(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg"
              placeholder="Paul's Fashion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Store Link *
            </label>
            <div className="flex items-center gap-2">
              <input
                required
                value={form.store_slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    store_slug: generateSlug(e.target.value),
                  })
                }
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg"
                placeholder="paulsfashion"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                .{rootDomain}
              </span>
            </div>
            <p className="text-xs text-purple-600 mt-2 font-semibold">
              Your store address:{' '}
              <span className="font-mono">
                {form.store_slug || 'yourstore'}.{rootDomain}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-4">
            <div>
              <h2 className="font-bold text-gray-900">
                Business Country and Selling Currency
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Confirm the country where your business operates. We may suggest
                a country based on your location, but you must confirm it.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Country *
              </label>
              <select
                required
                value={form.country_code}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Selling Currency *
              </label>
              <select
                required
                value={form.currency_code}
                onChange={(e) =>
                  setForm({ ...form, currency_code: e.target.value })
                }
                className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} — {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                Suggested currency follows your selected country. You can
                choose another supported currency. This setting will be saved
                for your store and used for product prices.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number * (required to launch)
            </label>
            <input
              required
              type="tel"
              value={form.whatsapp_number}
              onChange={(e) =>
                setForm({ ...form, whatsapp_number: e.target.value })
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg"
              placeholder="+2348012345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customers will see a WhatsApp chat button on your store.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What type of merchant are you? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, merchant_type: 'physical' })
                }
                className={`p-4 rounded-xl border-2 text-left ${
                  form.merchant_type === 'physical'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <p className="font-bold">Physical Goods</p>
                <p className="text-xs text-gray-500 mt-1">
                  Clothing, shoes, food and gadgets.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, merchant_type: 'digital' })
                }
                className={`p-4 rounded-xl border-2 text-left ${
                  form.merchant_type === 'digital'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <p className="font-bold">Digital Goods</p>
                <p className="text-xs text-gray-500 mt-1">
                  Courses, eBooks and downloadable files.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Description (optional)
            </label>
            <textarea
              value={form.store_description}
              onChange={(e) =>
                setForm({ ...form, store_description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg"
              placeholder="Tell customers what you sell..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating store...' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  );
}

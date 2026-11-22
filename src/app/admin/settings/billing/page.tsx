
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const FREQ_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly (3 months)',
  yearly: 'Yearly',
};

type ActivationFee = {
  country_code: string;
  country_name: string;
  currency_code: string;
  gateway: 'paystack' | 'paypal';
  amount: number | null;
  is_enabled: boolean;
};

const COUNTRY_ORDER = [
  'NG', 'ZA', 'EG', 'KE', 'MA',
  'US', 'GB', 'CA', 'MX', 'HT', 'OTHER',
];

function money(amount: number | null, currency: string) {
  if (amount === null || !Number.isFinite(Number(amount))) {
    return 'Not configured';
  }

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export default function AdminBillingSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [fees, setFees] = useState<ActivationFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPlans, setSavingPlans] = useState(false);
  const [savingFees, setSavingFees] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const supabase = createClient();

        const [settingsResult, plansResult, feesResult] = await Promise.all([
          supabase
            .from('platform_settings')
            .select('*')
            .limit(1)
            .maybeSingle(),

          supabase
            .from('maintenance_plans')
            .select('*'),

          fetch('/api/admin/activation-fees', {
            method: 'GET',
            cache: 'no-store',
          }),
        ]);

        if (!active) return;

        if (settingsResult.error) {
          throw new Error(settingsResult.error.message);
        }

        if (plansResult.error) {
          throw new Error(plansResult.error.message);
        }

        setSettings(settingsResult.data);

        const existingPlans = plansResult.data || [];

        setPlans(
          ['monthly', 'quarterly', 'yearly'].map(
            (frequency) =>
              existingPlans.find(
                (plan: any) => plan.frequency === frequency
              ) || {
                frequency,
                base_price: 1000,
                discount_percent: 0,
                is_active: true,
              }
          )
        );

        if (!feesResult.ok) {
          const result = await feesResult.json().catch(() => ({}));
          throw new Error(
            result.error || 'Could not load country activation fees.'
          );
        }

        const feesResultJson = await feesResult.json();

        setFees(
          [...(feesResultJson.fees || [])].sort(
            (a: ActivationFee, b: ActivationFee) =>
              COUNTRY_ORDER.indexOf(a.country_code) -
              COUNTRY_ORDER.indexOf(b.country_code)
          )
        );
      } catch (error: any) {
        if (active) {
          toast.error(error.message || 'Could not load billing settings.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const updateFee = (
    countryCode: string,
    changes: Partial<ActivationFee>
  ) => {
    setFees((current) =>
      current.map((fee) =>
        fee.country_code === countryCode
          ? { ...fee, ...changes }
          : fee
      )
    );
  };

  const saveFees = async () => {
    setSavingFees(true);

    try {
      const response = await fetch('/api/admin/activation-fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fees: fees.map((fee) => ({
            country_code: fee.country_code,
            amount:
              fee.amount === null || fee.amount === undefined
                ? null
                : Number(fee.amount),
            is_enabled: fee.is_enabled,
          })),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error || 'Could not save activation fees.'
        );
      }

      if (result.fees) {
        setFees(
          [...result.fees].sort(
            (a: ActivationFee, b: ActivationFee) =>
              COUNTRY_ORDER.indexOf(a.country_code) -
              COUNTRY_ORDER.indexOf(b.country_code)
          )
        );
      }

      toast.success('Country activation fees saved.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save activation fees.');
    } finally {
      setSavingFees(false);
    }
  };

  const updatePlan = (
    index: number,
    changes: Record<string, any>
  ) => {
    setPlans((current) =>
      current.map((plan, i) =>
        i === index ? { ...plan, ...changes } : plan
      )
    );
  };

  const savePlans = async () => {
    setSavingPlans(true);

    try {
      const supabase = createClient();

      const rows = plans.map((plan) => ({
        frequency: plan.frequency,
        base_price: Number(plan.base_price),
        discount_percent: Number(plan.discount_percent),
        is_active: Boolean(plan.is_active),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('maintenance_plans')
        .upsert(rows, { onConflict: 'frequency' });

      if (error) throw error;

      toast.success('Maintenance plans saved.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save maintenance plans.');
    } finally {
      setSavingPlans(false);
    }
  };

  const configuredCount = fees.filter(
    (fee) =>
      fee.amount !== null &&
      Number.isFinite(Number(fee.amount)) &&
      Number(fee.amount) >= 0 &&
      fee.is_enabled
  ).length;

  if (loading) {
    return (
      <div className="max-w-4xl space-y-4">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Billing & Pricing
        </h1>
        <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">
          Loading billing settings...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Billing & Pricing
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage country-specific storefront activation fees and store
          maintenance plans.
        </p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Storefront Activation Fees
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            The merchant's registered country determines the activation
            currency and payment gateway. These fees are separate from
            the currency used to sell products.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 border p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-600">
              Enabled and configured countries
            </span>
            <span className="font-bold text-gray-900">
              {configuredCount} / {fees.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 mt-3 overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{
                width: `${
                  fees.length
                    ? (configuredCount / fees.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {fees.map((fee) => {
            const configured =
              fee.amount !== null &&
              Number.isFinite(Number(fee.amount)) &&
              Number(fee.amount) >= 0;

            return (
              <div
                key={fee.country_code}
                className="border rounded-xl p-4 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {fee.country_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {fee.country_code} · {fee.currency_code} ·{' '}
                      {fee.gateway === 'paystack' ? 'Paystack' : 'PayPal'}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={fee.is_enabled}
                      onChange={(event) =>
                        updateFee(fee.country_code, {
                          is_enabled: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-purple-600"
                    />
                    Enabled
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Activation Fee ({fee.currency_code})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fee.amount ?? ''}
                      placeholder="Enter fee"
                      onChange={(event) =>
                        updateFee(fee.country_code, {
                          amount:
                            event.target.value.trim() === ''
                              ? null
                              : Number(event.target.value),
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="rounded-lg bg-gray-50 border p-3 flex flex-col justify-center">
                    <span className="text-xs text-gray-500">
                      Merchant payment amount
                    </span>
                    <span className="font-bold text-gray-900 mt-1">
                      {configured
                        ? money(fee.amount, fee.currency_code)
                        : 'Not configured'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {configured && fee.is_enabled
                        ? 'Ready for configuration'
                        : !fee.is_enabled
                          ? 'Country disabled'
                          : 'Activation must remain unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={saveFees}
          disabled={savingFees}
          className="w-full sm:w-auto px-7 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-bold disabled:opacity-50"
        >
          {savingFees ? 'Saving country fees...' : 'Save Country Fees'}
        </button>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Previous Global Activation Pricing
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            These are your existing legacy settings. They are displayed
            for reference and are not changed by saving country fees.
          </p>
        </div>

        {settings ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">Legacy base fee</p>
              <p className="font-bold mt-1">
                {formatCurrency(Number(settings.activation_fee || 0))}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">Legacy discount</p>
              <p className="font-bold mt-1">
                {Number(settings.activation_discount_percent || 0)}%
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">Legacy final amount</p>
              <p className="font-bold mt-1">
                {formatCurrency(
                  Number(settings.activation_fee || 0) *
                    (1 -
                      Number(
                        settings.activation_discount_percent || 0
                      ) /
                        100)
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No legacy activation pricing record found.
          </p>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Store Maintenance Plans
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Set a price and discount for each plan. Active plans appear
            for merchants to choose. Expired plans automatically stop
            payment receiving.
          </p>
        </div>

        <div className="space-y-4">
          {plans.map((plan, index) => {
            const basePrice = Number(plan.base_price || 0);
            const discount = Number(plan.discount_percent || 0);
            const finalPrice =
              basePrice - basePrice * (discount / 100);

            return (
              <div
                key={plan.frequency}
                className={`rounded-xl border p-4 space-y-3 ${
                  plan.is_active
                    ? 'border-purple-300 bg-purple-50/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900">
                    {FREQ_LABELS[plan.frequency]}
                  </p>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(plan.is_active)}
                      onChange={(event) =>
                        updatePlan(index, {
                          is_active: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-purple-600"
                    />
                    Active
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Base Price (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={plan.base_price}
                      onChange={(event) =>
                        updatePlan(index, {
                          base_price: Number(event.target.value),
                        })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={plan.discount_percent}
                      onChange={(event) =>
                        updatePlan(index, {
                          discount_percent: Number(event.target.value),
                        })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Merchant pays:{' '}
                  <span className="font-extrabold text-green-600">
                    {formatCurrency(finalPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="ml-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={savePlans}
          disabled={savingPlans}
          className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold disabled:opacity-50"
        >
          {savingPlans ? 'Saving plans...' : 'Save Maintenance Plans'}
        </button>
      </section>
    </div>
  );
}

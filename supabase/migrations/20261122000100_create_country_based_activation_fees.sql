
create table if not exists public.platform_activation_fees (
  country_code text primary key,
  country_name text not null,
  currency_code text not null,
  gateway text not null check (gateway in ('paystack', 'paypal')),
  amount numeric(12,2),
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint platform_activation_fees_amount_nonnegative
    check (amount is null or amount >= 0)
);

alter table public.platform_activation_fees enable row level security;

insert into public.platform_activation_fees
  (country_code, country_name, currency_code, gateway, amount, is_enabled)
values
  ('NG', 'Nigeria', 'NGN', 'paystack', 5000, true),
  ('ZA', 'South Africa', 'ZAR', 'paystack', null, true),
  ('EG', 'Egypt', 'EGP', 'paystack', null, true),
  ('KE', 'Kenya', 'KES', 'paystack', null, true),
  ('MA', 'Morocco', 'MAD', 'paystack', null, true),
  ('US', 'United States', 'USD', 'paypal', null, true),
  ('GB', 'United Kingdom', 'USD', 'paypal', null, true),
  ('CA', 'Canada', 'USD', 'paypal', null, true),
  ('MX', 'Mexico', 'USD', 'paypal', null, true),
  ('HT', 'Haiti', 'USD', 'paypal', null, true),
  ('OTHER', 'International Showcase', 'USD', 'paypal', 1, true)
on conflict (country_code) do nothing;

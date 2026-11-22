
-- Store merchant-owned PayPal API credentials encrypted.
-- Never expose this table through client-side Supabase access.

create table if not exists public.merchant_payment_credentials (
  id uuid primary key default gen_random_uuid(),

  merchant_id uuid not null
    references public.merchants(id)
    on delete cascade,

  provider text not null
    check (provider = 'paypal'),

  environment text not null
    check (environment in ('sandbox', 'live')),

  client_id text not null,
  secret_ciphertext text not null,
  secret_iv text not null,
  secret_auth_tag text not null,

  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint merchant_payment_credentials_unique
    unique (merchant_id, provider)
);

create index if not exists
  idx_merchant_payment_credentials_merchant
on public.merchant_payment_credentials (merchant_id);

alter table public.merchant_payment_credentials
  enable row level security;

-- No client-side policies.
-- Only authenticated server routes using the service-role client
-- may read or write these encrypted credentials.

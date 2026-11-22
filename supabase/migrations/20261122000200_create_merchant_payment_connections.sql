
-- Keep third-party merchant payment connections separate from
-- the platform's activation payment credentials and merchant API keys.
--
-- IMPORTANT:
-- Never store Stripe secret keys, PayPal client secrets, OAuth access
-- tokens, or refresh tokens in this table.

create table if not exists public.merchant_payment_connections (
  id uuid primary key default gen_random_uuid(),

  merchant_id uuid not null
    references public.merchants(id)
    on delete cascade,

  provider text not null
    check (provider in ('stripe', 'paypal')),

  provider_account_id text,
  provider_payer_id text,

  account_country text,
  account_email text,

  onboarding_status text not null default 'not_connected'
    check (
      onboarding_status in (
        'not_connected',
        'pending',
        'connected',
        'restricted',
        'disconnected'
      )
    ),

  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,

  payments_receivable boolean not null default false,
  primary_email_confirmed boolean not null default false,
  permissions_granted boolean not null default false,

  is_default boolean not null default false,

  -- Only non-secret provider information may be stored here.
  metadata jsonb not null default '{}'::jsonb,

  connected_at timestamptz,
  last_verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint merchant_payment_connections_provider_unique
    unique (merchant_id, provider)
);

create index if not exists
  idx_merchant_payment_connections_merchant
on public.merchant_payment_connections (merchant_id);

create index if not exists
  idx_merchant_payment_connections_provider_status
on public.merchant_payment_connections (provider, onboarding_status);

create unique index if not exists
  idx_merchant_payment_connections_one_default
on public.merchant_payment_connections (merchant_id)
where is_default = true;

alter table public.merchant_payment_connections
  enable row level security;

-- No client-side policies are intentionally created.
-- Access must go through authenticated server routes using
-- the Supabase service-role client.

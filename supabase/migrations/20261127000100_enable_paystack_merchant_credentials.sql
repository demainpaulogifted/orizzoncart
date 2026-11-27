
-- Enable secure encrypted storage for merchant-owned Paystack keys.
-- PayPal credentials and existing records are preserved.
-- Paystack public key is stored in client_id.
-- Paystack secret key is stored only as AES-256-GCM ciphertext.

begin;

-- Allow both PayPal and Paystack credential records.
alter table public.merchant_payment_credentials
  drop constraint if exists merchant_payment_credentials_provider_check;

alter table public.merchant_payment_credentials
  add constraint merchant_payment_credentials_provider_check
  check (provider in ('paypal', 'paystack'));

-- Ensure the existing table remains protected.
alter table public.merchant_payment_credentials
  enable row level security;

-- No browser-facing policies are created.
-- Server routes using the Supabase service-role client
-- are responsible for all credential access.

create index if not exists
  idx_merchant_payment_credentials_provider
on public.merchant_payment_credentials (provider);

commit;

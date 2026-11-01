-- Run this in Supabase SQL editor (optional but recommended)
ALTER TABLE dropshipping_connections
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS refresh_token text,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS shop_id text,
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS currency_code text,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dropship_conn_merchant_supplier
  ON dropshipping_connections (merchant_id, supplier);

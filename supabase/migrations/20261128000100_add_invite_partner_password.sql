
ALTER TABLE public.invite_partners
ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE INDEX IF NOT EXISTS invite_partners_email_lookup_idx
ON public.invite_partners (LOWER(email));

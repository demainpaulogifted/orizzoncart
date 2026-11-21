alter table public.merchants
  add column if not exists country_code text,
  add column if not exists currency_code text;

update public.merchants
set country_code = 'NG',
    currency_code = 'NGN'
where country_code is null
   or currency_code is null;

alter table public.merchants
  alter column country_code set default 'NG',
  alter column currency_code set default 'NGN',
  alter column country_code set not null,
  alter column currency_code set not null;

comment on column public.merchants.country_code is
  'ISO 3166-1 alpha-2 code for the merchant business country confirmed during onboarding';

comment on column public.merchants.currency_code is
  'ISO 4217 selling currency selected by the merchant during onboarding';

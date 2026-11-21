alter table public.products
  add column if not exists currency_code text;

update public.products p
set currency_code = coalesce(m.currency_code, 'NGN')
from public.merchants m
where p.merchant_id = m.id
  and p.currency_code is null;

update public.products
set currency_code = 'NGN'
where currency_code is null;

alter table public.products
  alter column currency_code set default 'NGN',
  alter column currency_code set not null;

comment on column public.products.currency_code is
  'ISO 4217 currency code in which this product price and flash deal price are denominated';

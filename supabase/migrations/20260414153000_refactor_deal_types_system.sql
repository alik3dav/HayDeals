alter table public.deals
  add column if not exists bundle_text text;

insert into public.deal_types (code, name, description)
values
  ('price', 'Price', 'Direct fixed price deal.'),
  ('price_drop', 'Price Drop', 'Original vs current price reduction.'),
  ('percentage', 'Percentage', 'Percentage-only discount deal.'),
  ('coupon', 'Coupon', 'Promo code driven offer.'),
  ('bundle', 'Bundle', 'Bundle offer like 1+1 or 2+1.'),
  ('cashback', 'Cashback', 'Cashback or reward return offer.'),
  ('free', 'Free', 'Free item or trial deal.'),
  ('info', 'Info', 'Informational non-price deal post.')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = timezone('utc', now());

update public.deal_types
set
  is_active = false,
  updated_at = timezone('utc', now())
where code not in ('price', 'price_drop', 'percentage', 'coupon', 'bundle', 'cashback', 'free', 'info');

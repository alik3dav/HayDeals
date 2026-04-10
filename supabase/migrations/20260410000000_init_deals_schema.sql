-- HayDeals initial production schema (Supabase Postgres)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  reputation integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_length check (username is null or char_length(username) between 3 and 32)
);

create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists categories_active_idx on public.categories (is_active, name);

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- stores
-- ---------------------------------------------------------------------------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  website_url text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint stores_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists stores_active_idx on public.stores (is_active, name);

create trigger set_stores_updated_at
before update on public.stores
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deal_types
-- ---------------------------------------------------------------------------
create table if not exists public.deal_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint deal_types_code_format check (code ~ '^[a-z0-9_]+$')
);

create index if not exists deal_types_active_idx on public.deal_types (is_active, name);

create trigger set_deal_types_updated_at
before update on public.deal_types
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  store_id uuid references public.stores(id) on delete set null,
  deal_type_id uuid not null references public.deal_types(id) on delete restrict,

  title text not null,
  description text,

  merchant_name text,
  deal_url text not null,
  coupon_code text,

  original_price numeric(12, 2),
  sale_price numeric(12, 2),
  discount_percent numeric(5, 2),
  currency_code char(3) not null default 'AMD',

  starts_at timestamptz,
  expires_at timestamptz,

  moderation_status text not null default 'pending',
  moderated_by uuid references public.profiles(id) on delete set null,
  moderated_at timestamptz,
  moderation_note text,

  score integer not null default 0,
  upvotes_count integer not null default 0,
  downvotes_count integer not null default 0,
  comments_count integer not null default 0,
  bookmarks_count integer not null default 0,
  reports_count integer not null default 0,
  hot_score numeric(12, 4) not null default 0,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint deals_moderation_status check (moderation_status in ('pending', 'approved', 'rejected')),
  constraint deals_price_non_negative check (
    (original_price is null or original_price >= 0)
    and (sale_price is null or sale_price >= 0)
    and (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100))
  ),
  constraint deals_price_order check (
    original_price is null or sale_price is null or sale_price <= original_price
  ),
  constraint deals_expiration_order check (
    starts_at is null or expires_at is null or starts_at <= expires_at
  )
);

create index if not exists deals_profile_id_idx on public.deals (profile_id);
create index if not exists deals_category_id_idx on public.deals (category_id);
create index if not exists deals_store_id_idx on public.deals (store_id);
create index if not exists deals_type_id_idx on public.deals (deal_type_id);

-- list + sort indexes
create index if not exists deals_new_idx
  on public.deals (created_at desc)
  where moderation_status = 'approved';

create index if not exists deals_hot_idx
  on public.deals (hot_score desc, created_at desc)
  where moderation_status = 'approved';

create index if not exists deals_discussed_idx
  on public.deals (comments_count desc, created_at desc)
  where moderation_status = 'approved';

create index if not exists deals_expiration_idx
  on public.deals (expires_at asc)
  where moderation_status = 'approved' and expires_at is not null;

create trigger set_deals_updated_at
before update on public.deals
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deal_votes
-- ---------------------------------------------------------------------------
create table if not exists public.deal_votes (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  vote_value smallint not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint deal_votes_value check (vote_value in (-1, 1)),
  constraint deal_votes_one_per_user_per_deal unique (deal_id, profile_id)
);

create index if not exists deal_votes_profile_idx on public.deal_votes (profile_id, created_at desc);
create index if not exists deal_votes_deal_idx on public.deal_votes (deal_id, created_at desc);

create trigger set_deal_votes_updated_at
before update on public.deal_votes
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deal_comments
-- ---------------------------------------------------------------------------
create table if not exists public.deal_comments (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.deal_comments(id) on delete cascade,
  body text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists deal_comments_deal_idx on public.deal_comments (deal_id, created_at desc);
create index if not exists deal_comments_profile_idx on public.deal_comments (profile_id, created_at desc);
create index if not exists deal_comments_parent_idx on public.deal_comments (parent_comment_id);

create trigger set_deal_comments_updated_at
before update on public.deal_comments
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deal_bookmarks
-- ---------------------------------------------------------------------------
create table if not exists public.deal_bookmarks (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint deal_bookmarks_one_per_user_per_deal unique (deal_id, profile_id)
);

create index if not exists deal_bookmarks_profile_idx on public.deal_bookmarks (profile_id, created_at desc);
create index if not exists deal_bookmarks_deal_idx on public.deal_bookmarks (deal_id, created_at desc);

create trigger set_deal_bookmarks_updated_at
before update on public.deal_bookmarks
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deal_reports
-- ---------------------------------------------------------------------------
create table if not exists public.deal_reports (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  report_status text not null default 'open',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint deal_reports_status check (report_status in ('open', 'reviewed', 'dismissed'))
);

create index if not exists deal_reports_status_idx on public.deal_reports (report_status, created_at desc);
create index if not exists deal_reports_deal_idx on public.deal_reports (deal_id, created_at desc);
create index if not exists deal_reports_profile_idx on public.deal_reports (profile_id, created_at desc);

create trigger set_deal_reports_updated_at
before update on public.deal_reports
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- seed deal types
-- ---------------------------------------------------------------------------
insert into public.deal_types (code, name, description)
values
  ('discount', 'Discount', 'Direct price reduction deal.'),
  ('coupon', 'Coupon', 'Promo code or coupon-based offer.'),
  ('cashback', 'Cashback', 'Cashback or reward points offer.'),
  ('free_shipping', 'Free Shipping', 'Deals primarily offering free delivery.'),
  ('bundle', 'Bundle', 'Bundle pricing or buy-more-save-more offer.')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = timezone('utc', now());

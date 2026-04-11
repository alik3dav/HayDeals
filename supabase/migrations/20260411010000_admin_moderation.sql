alter table public.deals
  add column if not exists is_featured boolean not null default false;

create index if not exists deals_featured_idx
  on public.deals (is_featured, created_at desc)
  where is_featured = true;

alter table public.categories enable row level security;
alter table public.stores enable row level security;

grant select, insert, update on table public.categories to authenticated;
grant select, insert, update on table public.stores to authenticated;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "categories_manage_staff" on public.categories;
create policy "categories_manage_staff"
on public.categories
for all
to authenticated
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

drop policy if exists "stores_select_public" on public.stores;
create policy "stores_select_public"
on public.stores
for select
to anon, authenticated
using (true);

drop policy if exists "stores_manage_staff" on public.stores;
create policy "stores_manage_staff"
on public.stores
for all
to authenticated
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

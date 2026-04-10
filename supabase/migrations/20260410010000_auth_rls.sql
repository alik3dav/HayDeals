-- Auth, roles, profile bootstrap, and row-level security policies

-- ---------------------------------------------------------------------------
-- roles + profile bootstrap
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'moderator', 'admin'));
  end if;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_username text;
begin
  generated_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]+', '', 'g'));

  if generated_username is null or generated_username = '' then
    generated_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 12);
  end if;

  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    generated_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('moderator', 'admin'), false);
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- deal moderation status enhancement for drafts
-- ---------------------------------------------------------------------------
alter table public.deals drop constraint if exists deals_moderation_status;

alter table public.deals
  add constraint deals_moderation_status
  check (moderation_status in ('draft', 'pending', 'approved', 'rejected'));

-- ---------------------------------------------------------------------------
-- enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.deals enable row level security;
alter table public.deal_votes enable row level security;
alter table public.deal_comments enable row level security;
alter table public.deal_bookmarks enable row level security;
alter table public.deal_reports enable row level security;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self_or_staff" on public.profiles;
create policy "profiles_update_self_or_staff"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_moderator_or_admin())
with check (id = auth.uid() or public.is_moderator_or_admin());

-- ---------------------------------------------------------------------------
-- deals policies
-- ---------------------------------------------------------------------------
drop policy if exists "deals_select_public_approved" on public.deals;
create policy "deals_select_public_approved"
on public.deals
for select
to anon, authenticated
using (
  moderation_status = 'approved'
  or profile_id = auth.uid()
  or public.is_moderator_or_admin()
);

drop policy if exists "deals_insert_own" on public.deals;
create policy "deals_insert_own"
on public.deals
for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists "deals_update_owner_draft_or_pending" on public.deals;
create policy "deals_update_owner_draft_or_pending"
on public.deals
for update
to authenticated
using (
  profile_id = auth.uid()
  and moderation_status in ('draft', 'pending')
)
with check (
  profile_id = auth.uid()
  and moderation_status in ('draft', 'pending')
);

drop policy if exists "deals_update_staff" on public.deals;
create policy "deals_update_staff"
on public.deals
for update
to authenticated
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

-- ---------------------------------------------------------------------------
-- deal votes policies
-- ---------------------------------------------------------------------------
drop policy if exists "deal_votes_select_authenticated" on public.deal_votes;
create policy "deal_votes_select_authenticated"
on public.deal_votes
for select
to authenticated
using (true);

drop policy if exists "deal_votes_insert_own" on public.deal_votes;
create policy "deal_votes_insert_own"
on public.deal_votes
for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists "deal_votes_update_own" on public.deal_votes;
create policy "deal_votes_update_own"
on public.deal_votes
for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop policy if exists "deal_votes_delete_own" on public.deal_votes;
create policy "deal_votes_delete_own"
on public.deal_votes
for delete
to authenticated
using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- deal comments policies
-- ---------------------------------------------------------------------------
drop policy if exists "deal_comments_select_public" on public.deal_comments;
create policy "deal_comments_select_public"
on public.deal_comments
for select
to anon, authenticated
using (true);

drop policy if exists "deal_comments_insert_authenticated" on public.deal_comments;
create policy "deal_comments_insert_authenticated"
on public.deal_comments
for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists "deal_comments_update_own_or_staff" on public.deal_comments;
create policy "deal_comments_update_own_or_staff"
on public.deal_comments
for update
to authenticated
using (profile_id = auth.uid() or public.is_moderator_or_admin())
with check (profile_id = auth.uid() or public.is_moderator_or_admin());

-- ---------------------------------------------------------------------------
-- deal bookmarks policies (private)
-- ---------------------------------------------------------------------------
drop policy if exists "deal_bookmarks_select_own" on public.deal_bookmarks;
create policy "deal_bookmarks_select_own"
on public.deal_bookmarks
for select
to authenticated
using (profile_id = auth.uid());

drop policy if exists "deal_bookmarks_insert_own" on public.deal_bookmarks;
create policy "deal_bookmarks_insert_own"
on public.deal_bookmarks
for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists "deal_bookmarks_delete_own" on public.deal_bookmarks;
create policy "deal_bookmarks_delete_own"
on public.deal_bookmarks
for delete
to authenticated
using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- deal reports policies
-- ---------------------------------------------------------------------------
drop policy if exists "deal_reports_select_own_or_staff" on public.deal_reports;
create policy "deal_reports_select_own_or_staff"
on public.deal_reports
for select
to authenticated
using (profile_id = auth.uid() or public.is_moderator_or_admin());

drop policy if exists "deal_reports_insert_own" on public.deal_reports;
create policy "deal_reports_insert_own"
on public.deal_reports
for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists "deal_reports_update_staff" on public.deal_reports;
create policy "deal_reports_update_staff"
on public.deal_reports
for update
to authenticated
using (public.is_moderator_or_admin())
with check (public.is_moderator_or_admin());

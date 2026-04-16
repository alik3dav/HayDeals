-- Points system v1: profile totals + immutable history log

alter table public.profiles
  add column if not exists points_total integer not null default 0;

create table if not exists public.profile_points_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  points_amount integer not null,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  constraint profile_points_log_action_type_format check (action_type ~ '^[a-z0-9_]+$')
);

create index if not exists profile_points_log_profile_created_idx
  on public.profile_points_log (profile_id, created_at desc);

create unique index if not exists profile_points_log_dedup_idx
  on public.profile_points_log (profile_id, action_type, related_entity_type, related_entity_id)
  where related_entity_type is not null and related_entity_id is not null;

alter table public.profile_points_log enable row level security;

drop policy if exists "profile_points_log_select_own_or_staff" on public.profile_points_log;
create policy "profile_points_log_select_own_or_staff"
on public.profile_points_log
for select
to authenticated
using (profile_id = auth.uid() or public.is_moderator_or_admin());

drop policy if exists "profile_points_log_insert_own" on public.profile_points_log;
create policy "profile_points_log_insert_own"
on public.profile_points_log
for insert
to authenticated
with check (profile_id = auth.uid());

create or replace function public.award_profile_points(
  p_profile_id uuid,
  p_action_type text,
  p_points_amount integer,
  p_related_entity_type text default null,
  p_related_entity_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  did_insert boolean := false;
  inserted_rows integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required to award points.';
  end if;

  if auth.uid() <> p_profile_id and not public.is_moderator_or_admin() then
    raise exception 'You are not allowed to award points for this user.';
  end if;

  insert into public.profile_points_log (
    profile_id,
    action_type,
    points_amount,
    related_entity_type,
    related_entity_id
  )
  values (
    p_profile_id,
    p_action_type,
    p_points_amount,
    p_related_entity_type,
    p_related_entity_id
  )
  on conflict do nothing;

  get diagnostics inserted_rows = row_count;
  did_insert := inserted_rows > 0;

  if did_insert then
    update public.profiles
    set points_total = points_total + p_points_amount
    where id = p_profile_id;
  end if;

  return did_insert;
end;
$$;

grant execute on function public.award_profile_points(uuid, text, integer, text, uuid) to authenticated;

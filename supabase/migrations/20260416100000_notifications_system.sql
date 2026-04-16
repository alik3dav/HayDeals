-- Notifications system for authenticated users.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  deal_id uuid references public.deals(id) on delete cascade,
  target_type text,
  target_id uuid,
  type text not null,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  dedupe_key text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notifications_type_check check (type in ('deal_comment', 'deal_upvote', 'deal_moderation_approved', 'deal_moderation_rejected')),
  constraint notifications_target_type_check check (target_type is null or target_type in ('deal', 'comment', 'vote', 'moderation'))
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_profile_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_profile_id, is_read, created_at desc);

create unique index if not exists notifications_dedupe_key_unique
  on public.notifications (dedupe_key)
  where dedupe_key is not null;

create trigger set_notifications_updated_at
before update on public.notifications
for each row
execute function public.set_updated_at();

alter table public.notifications enable row level security;
grant select, update on table public.notifications to authenticated;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (recipient_profile_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (recipient_profile_id = auth.uid())
with check (recipient_profile_id = auth.uid());

drop policy if exists "notifications_insert_staff_or_service" on public.notifications;
create policy "notifications_insert_staff_or_service"
on public.notifications
for insert
to authenticated
with check (public.is_moderator_or_admin());

create or replace function public.create_notification(
  p_recipient_profile_id uuid,
  p_actor_profile_id uuid,
  p_type text,
  p_message text,
  p_deal_id uuid default null,
  p_target_type text default null,
  p_target_id uuid default null,
  p_data jsonb default '{}'::jsonb,
  p_dedupe_key text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipient_profile_id is null then
    return;
  end if;

  insert into public.notifications (
    recipient_profile_id,
    actor_profile_id,
    type,
    message,
    deal_id,
    target_type,
    target_id,
    data,
    dedupe_key,
    is_read,
    read_at,
    created_at,
    updated_at
  )
  values (
    p_recipient_profile_id,
    p_actor_profile_id,
    p_type,
    p_message,
    p_deal_id,
    p_target_type,
    p_target_id,
    coalesce(p_data, '{}'::jsonb),
    p_dedupe_key,
    false,
    null,
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (dedupe_key)
  where dedupe_key is not null
  do update set
    actor_profile_id = excluded.actor_profile_id,
    message = excluded.message,
    deal_id = excluded.deal_id,
    target_type = excluded.target_type,
    target_id = excluded.target_id,
    data = excluded.data,
    is_read = false,
    read_at = null,
    created_at = timezone('utc', now()),
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.notify_on_deal_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  deal_owner_id uuid;
  actor_name text;
  deal_title text;
begin
  select d.profile_id, d.title
  into deal_owner_id, deal_title
  from public.deals d
  where d.id = new.deal_id;

  if deal_owner_id is null or deal_owner_id = new.profile_id then
    return new;
  end if;

  select coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Someone')
  into actor_name
  from public.profiles p
  where p.id = new.profile_id;

  perform public.create_notification(
    deal_owner_id,
    new.profile_id,
    'deal_comment',
    actor_name || ' commented on your deal: ' || coalesce(deal_title, 'your deal'),
    new.deal_id,
    'comment',
    new.id,
    jsonb_build_object('deal_title', deal_title, 'comment_id', new.id)
  );

  return new;
end;
$$;

drop trigger if exists trigger_notify_on_deal_comment on public.deal_comments;
create trigger trigger_notify_on_deal_comment
after insert on public.deal_comments
for each row
execute function public.notify_on_deal_comment();

create or replace function public.notify_on_deal_vote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  deal_owner_id uuid;
  actor_name text;
  deal_title text;
  should_notify boolean := false;
begin
  if tg_op = 'INSERT' and new.vote_value = 1 then
    should_notify := true;
  elsif tg_op = 'UPDATE' and old.vote_value <> 1 and new.vote_value = 1 then
    should_notify := true;
  end if;

  if not should_notify then
    return new;
  end if;

  select d.profile_id, d.title
  into deal_owner_id, deal_title
  from public.deals d
  where d.id = new.deal_id;

  if deal_owner_id is null or deal_owner_id = new.profile_id then
    return new;
  end if;

  select coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Someone')
  into actor_name
  from public.profiles p
  where p.id = new.profile_id;

  perform public.create_notification(
    deal_owner_id,
    new.profile_id,
    'deal_upvote',
    actor_name || ' upvoted your deal: ' || coalesce(deal_title, 'your deal'),
    new.deal_id,
    'vote',
    new.id,
    jsonb_build_object('deal_title', deal_title, 'vote_id', new.id),
    'deal_upvote:' || new.deal_id::text || ':' || new.profile_id::text
  );

  return new;
end;
$$;

drop trigger if exists trigger_notify_on_deal_vote on public.deal_votes;
create trigger trigger_notify_on_deal_vote
after insert or update of vote_value on public.deal_votes
for each row
execute function public.notify_on_deal_vote();

create or replace function public.notify_on_deal_moderation_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  notification_type text;
  notification_message text;
begin
  if new.profile_id is null or new.profile_id = new.moderated_by then
    return new;
  end if;

  if old.moderation_status = new.moderation_status then
    return new;
  end if;

  if new.moderation_status = 'approved' then
    notification_type := 'deal_moderation_approved';
    notification_message := 'Your deal was approved: ' || coalesce(new.title, 'Untitled deal');
  elsif new.moderation_status = 'rejected' then
    notification_type := 'deal_moderation_rejected';
    notification_message := 'Your deal was rejected: ' || coalesce(new.title, 'Untitled deal');
  else
    return new;
  end if;

  if new.moderated_by is not null then
    select coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Moderator')
    into actor_name
    from public.profiles p
    where p.id = new.moderated_by;
  else
    actor_name := null;
  end if;

  perform public.create_notification(
    new.profile_id,
    new.moderated_by,
    notification_type,
    notification_message,
    new.id,
    'moderation',
    new.id,
    jsonb_build_object('deal_title', new.title, 'status', new.moderation_status, 'moderation_note', new.moderation_note, 'actor_name', actor_name),
    'deal_moderation:' || new.id::text || ':' || new.moderation_status
  );

  return new;
end;
$$;

drop trigger if exists trigger_notify_on_deal_moderation_change on public.deals;
create trigger trigger_notify_on_deal_moderation_change
after update of moderation_status on public.deals
for each row
execute function public.notify_on_deal_moderation_change();

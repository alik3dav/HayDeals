-- Persisted website control / branding settings

create table if not exists public.website_control_settings (
  id integer primary key default 1,
  logotype_url text,
  logo_alt text,
  logo_size text not null default 'medium',
  primary_color text not null default '#22c55e',
  accent_color text not null default '#0f172a',
  site_announcement text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint website_control_settings_singleton check (id = 1),
  constraint website_control_settings_logo_size check (logo_size in ('small', 'medium', 'large', 'custom')),
  constraint website_control_settings_primary_color_hex check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint website_control_settings_accent_color_hex check (accent_color ~ '^#[0-9A-Fa-f]{6}$')
);

drop trigger if exists set_website_control_settings_updated_at on public.website_control_settings;

create trigger set_website_control_settings_updated_at
before update on public.website_control_settings
for each row
execute function public.set_updated_at();

insert into public.website_control_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.website_control_settings enable row level security;

grant select, insert, update on table public.website_control_settings to authenticated;
grant select on table public.website_control_settings to anon;

drop policy if exists "website_control_select_public" on public.website_control_settings;
create policy "website_control_select_public"
on public.website_control_settings
for select
to anon, authenticated
using (true);

drop policy if exists "website_control_manage_admin" on public.website_control_settings;
create policy "website_control_manage_admin"
on public.website_control_settings
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

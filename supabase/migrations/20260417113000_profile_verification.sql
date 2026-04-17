-- Profile verification flags with automatic admin verification.

alter table public.profiles
  add column if not exists is_verified boolean not null default false;

update public.profiles
set is_verified = true
where role = 'admin';

create or replace function public.ensure_admin_verified()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'admin' then
    new.is_verified := true;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_ensure_admin_verified on public.profiles;

create trigger profiles_ensure_admin_verified
before insert or update on public.profiles
for each row
execute function public.ensure_admin_verified();

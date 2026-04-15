-- Make profile bootstrap usernames resilient to length/uniqueness issues during auth sign-up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  display_name_candidate text;
  suffix text;
  max_base_length integer;
  attempts integer := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]+', '', 'g'));

  if base_username is null or base_username = '' then
    base_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 12);
  end if;

  -- Keep usernames compatible with profiles_username_length (3..32).
  base_username := substr(base_username, 1, 32);
  if char_length(base_username) < 3 then
    base_username := base_username || repeat('_', 3 - char_length(base_username));
  end if;

  final_username := base_username;

  -- Ensure username uniqueness (same email local-part across domains is common).
  while exists (select 1 from public.profiles p where p.username = final_username) loop
    attempts := attempts + 1;
    suffix := '_' || substr(replace(new.id::text, '-', ''), 1, least(12, 4 + attempts));

    max_base_length := 32 - char_length(suffix);
    if max_base_length < 3 then
      max_base_length := 3;
      suffix := substr(suffix, 1, 32 - max_base_length);
    end if;

    final_username := substr(base_username, 1, max_base_length) || suffix;

    exit when attempts > 8;
  end loop;

  display_name_candidate := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    final_username,
    nullif(substr(display_name_candidate, 1, 120), ''),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

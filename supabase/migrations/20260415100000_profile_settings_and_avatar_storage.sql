-- Profile name fields and avatar storage for account settings

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_first_name_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_first_name_length
      check (first_name is null or char_length(first_name) between 1 and 60);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_last_name_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_last_name_length
      check (last_name is null or char_length(last_name) between 1 and 60);
  end if;
end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public avatars are readable.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

-- Users upload only inside <auth.uid()>/
drop policy if exists "avatars_authenticated_upload_own_folder" on storage.objects;
create policy "avatars_authenticated_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update/delete only their own objects in avatars bucket.
drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars' and owner = auth.uid())
with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'avatars' and owner = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-logos',
  'store-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "store_logos_public_read" on storage.objects;
create policy "store_logos_public_read"
on storage.objects
for select
to public
using (bucket_id = 'store-logos');

drop policy if exists "store_logos_admin_upload" on storage.objects;
create policy "store_logos_admin_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = 'admin'
  and public.current_user_role() in ('admin', 'moderator')
);

drop policy if exists "store_logos_admin_update" on storage.objects;
create policy "store_logos_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'store-logos' and public.current_user_role() in ('admin', 'moderator'))
with check (bucket_id = 'store-logos' and public.current_user_role() in ('admin', 'moderator'));

drop policy if exists "store_logos_admin_delete" on storage.objects;
create policy "store_logos_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'store-logos' and public.current_user_role() in ('admin', 'moderator'));

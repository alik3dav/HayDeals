alter table public.website_control_settings
  add column if not exists sidebar_ad_href text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sidebar-ad-images',
  'sidebar-ad-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "sidebar_ad_images_public_read" on storage.objects;
create policy "sidebar_ad_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'sidebar-ad-images');

drop policy if exists "sidebar_ad_images_admin_upload" on storage.objects;
create policy "sidebar_ad_images_admin_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'sidebar-ad-images'
  and (storage.foldername(name))[1] = 'admin'
  and public.current_user_role() = 'admin'
);

drop policy if exists "sidebar_ad_images_admin_update" on storage.objects;
create policy "sidebar_ad_images_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'sidebar-ad-images' and public.current_user_role() = 'admin')
with check (bucket_id = 'sidebar-ad-images' and public.current_user_role() = 'admin');

drop policy if exists "sidebar_ad_images_admin_delete" on storage.objects;
create policy "sidebar_ad_images_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'sidebar-ad-images' and public.current_user_role() = 'admin');

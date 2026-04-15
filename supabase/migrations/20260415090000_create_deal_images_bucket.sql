-- Storage bucket and policies for submitted deal images

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deal-images',
  'deal-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public can read images from the bucket.
drop policy if exists "deal_images_public_read" on storage.objects;
create policy "deal_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'deal-images');

-- Authenticated users can upload into submissions/.
drop policy if exists "deal_images_authenticated_upload" on storage.objects;
create policy "deal_images_authenticated_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'deal-images'
  and (storage.foldername(name))[1] = 'submissions'
);

-- Uploaders can delete their own files in this bucket.
drop policy if exists "deal_images_owner_delete" on storage.objects;
create policy "deal_images_owner_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'deal-images' and owner = auth.uid());

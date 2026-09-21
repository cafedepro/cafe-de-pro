-- 0003_storage.sql : image bucket. Files live at  <restaurant_id>/<anything>.webp

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-media', 'restaurant-media', true, 2097152,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Public bucket => anyone can VIEW files by URL. Writes are restricted to the owner
-- of the restaurant whose id is the first folder in the path.
create policy media_owner_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'restaurant-media'
    and public.owns_restaurant(((storage.foldername(name))[1])::uuid)
  );

create policy media_owner_update on storage.objects for update to authenticated
  using (
    bucket_id = 'restaurant-media'
    and public.owns_restaurant(((storage.foldername(name))[1])::uuid)
  );

create policy media_owner_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'restaurant-media'
    and public.owns_restaurant(((storage.foldername(name))[1])::uuid)
  );

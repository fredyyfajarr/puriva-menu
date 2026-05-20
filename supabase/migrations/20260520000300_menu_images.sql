alter table public.menu_entries
add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read menu images" on storage.objects;
create policy "public can read menu images"
on storage.objects for select
using (bucket_id = 'menu-images');

drop policy if exists "admins can insert menu images" on storage.objects;
create policy "admins can insert menu images"
on storage.objects for insert
with check (bucket_id = 'menu-images' and private.is_admin());

drop policy if exists "admins can update menu images" on storage.objects;
create policy "admins can update menu images"
on storage.objects for update
using (bucket_id = 'menu-images' and private.is_admin())
with check (bucket_id = 'menu-images' and private.is_admin());

drop policy if exists "admins can delete menu images" on storage.objects;
create policy "admins can delete menu images"
on storage.objects for delete
using (bucket_id = 'menu-images' and private.is_admin());

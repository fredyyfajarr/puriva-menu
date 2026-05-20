create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function private.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

grant execute on function private.is_admin(uuid) to anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create table if not exists public.menu_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  display_mode text not null check (display_mode in ('compact-list', 'recipe-cards', 'grouped-by-base')),
  price_idr integer,
  sort_order integer not null default 999,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_entries (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.menu_sections(id) on delete cascade,
  name text not null,
  ingredients text[] not null default '{}',
  base_name text,
  benefit text,
  mix_notes jsonb not null default '{}'::jsonb,
  category_slug text check (category_slug in ('roots-detox', 'vitamin-c-booster', 'hydration')),
  image_url text,
  accent_color text not null default '#1f7a4d',
  price_idr integer,
  sort_order integer not null default 999,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_entries_section_sort_idx on public.menu_entries(section_id, sort_order);
create index if not exists menu_entries_base_idx on public.menu_entries(base_name);

grant select on public.menu_sections to anon, authenticated;
grant select on public.menu_entries to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update, delete on public.menu_sections to authenticated;
grant insert, update, delete on public.menu_entries to authenticated;
grant update on public.profiles to authenticated;

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

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_menu_sections_updated_at on public.menu_sections;
create trigger touch_menu_sections_updated_at
before update on public.menu_sections
for each row execute function public.touch_updated_at();

drop trigger if exists touch_menu_entries_updated_at on public.menu_entries;
create trigger touch_menu_entries_updated_at
before update on public.menu_entries
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_entries enable row level security;

drop policy if exists "profiles can read own profile" on public.profiles;
create policy "profiles can read own profile"
on public.profiles for select
using (id = auth.uid() or private.is_admin());

drop policy if exists "admins can update profiles" on public.profiles;
create policy "admins can update profiles"
on public.profiles for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "public can read active sections" on public.menu_sections;
create policy "public can read active sections"
on public.menu_sections for select
using (is_active = true or private.is_admin());

drop policy if exists "admins can insert sections" on public.menu_sections;
create policy "admins can insert sections"
on public.menu_sections for insert
with check (private.is_admin());

drop policy if exists "admins can update sections" on public.menu_sections;
create policy "admins can update sections"
on public.menu_sections for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "admins can delete sections" on public.menu_sections;
create policy "admins can delete sections"
on public.menu_sections for delete
using (private.is_admin());

drop policy if exists "public can read available entries" on public.menu_entries;
create policy "public can read available entries"
on public.menu_entries for select
using (
  private.is_admin()
  or (
    is_available = true
    and exists (
      select 1
      from public.menu_sections
      where menu_sections.id = menu_entries.section_id
        and menu_sections.is_active = true
    )
  )
);

drop policy if exists "admins can insert entries" on public.menu_entries;
create policy "admins can insert entries"
on public.menu_entries for insert
with check (private.is_admin());

drop policy if exists "admins can update entries" on public.menu_entries;
create policy "admins can update entries"
on public.menu_entries for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "admins can delete entries" on public.menu_entries;
create policy "admins can delete entries"
on public.menu_entries for delete
using (private.is_admin());

insert into public.menu_sections (slug, title, description, display_mode, price_idr, sort_order, is_active)
values
  ('cut-fruits', 'Cut Fruits', 'Fresh sliced fruit cups, ready to grab.', 'compact-list', 15000, 10, true),
  ('blended-juice', 'Blended Juice', 'Classic blended fruit juice, served cold.', 'compact-list', 25000, 20, true),
  ('pre-made-juice', 'Pre-made Juice', 'Bottled blends made fresh for the day.', 'recipe-cards', 30000, 30, true),
  ('cold-pressed-juice', 'Cold-Pressed Juice', '100% murni. Tanpa air, tanpa gula, tanpa sirup.', 'grouped-by-base', 35000, 40, true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  display_mode = excluded.display_mode,
  price_idr = excluded.price_idr,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

with seed(section_slug, name, ingredients, base_name, accent_color, price_idr, sort_order) as (
  values
    ('cut-fruits', 'Sunkist', array['Sunkist'], null, '#f97316', 15000, 1),
    ('cut-fruits', 'Melon', array['Melon'], null, '#65a30d', 15000, 2),
    ('cut-fruits', 'Pineapple', array['Pineapple'], null, '#eab308', 15000, 3),
    ('cut-fruits', 'Dragon Fruit', array['Dragon Fruit'], null, '#db2777', 15000, 4),
    ('cut-fruits', 'Watermelon', array['Watermelon'], null, '#ef4444', 15000, 5),
    ('cut-fruits', 'Mango', array['Mango'], null, '#f59e0b', 15000, 6),
    ('cut-fruits', 'Green Apple', array['Green Apple'], null, '#16a34a', 15000, 7),
    ('blended-juice', 'Avocado', array['Avocado'], null, '#3f6212', 25000, 1),
    ('blended-juice', 'Sunkist', array['Sunkist'], null, '#f97316', 25000, 2),
    ('blended-juice', 'Melon', array['Melon'], null, '#65a30d', 25000, 3),
    ('blended-juice', 'Pineapple', array['Pineapple'], null, '#eab308', 25000, 4),
    ('blended-juice', 'Guava', array['Guava'], null, '#db2777', 25000, 5),
    ('blended-juice', 'Dragon Fruit', array['Dragon Fruit'], null, '#be185d', 25000, 6),
    ('blended-juice', 'Watermelon', array['Watermelon'], null, '#ef4444', 25000, 7),
    ('blended-juice', 'Strawberry', array['Strawberry'], null, '#e11d48', 25000, 8),
    ('blended-juice', 'Mango', array['Mango'], null, '#f59e0b', 25000, 9),
    ('pre-made-juice', 'Splash Orange', array['Sunkist','Carrot','Green Apple'], null, '#f97316', 30000, 1),
    ('pre-made-juice', 'Pink Heart', array['Guava','Jicama','Watermelon'], null, '#db2777', 30000, 2),
    ('pre-made-juice', 'Yellow Glow', array['Pineapple','Sunkist','Green Apple','Lemon'], null, '#eab308', 30000, 3),
    ('pre-made-juice', 'Berry Happy', array['Strawberry','Sunkist','Watermelon'], null, '#e11d48', 30000, 4),
    ('pre-made-juice', 'Red Love', array['Watermelon','Pineapple','Sunkist'], null, '#dc2626', 30000, 5),
    ('pre-made-juice', 'Maroon Beet', array['Beet','Green Apple','Sunkist'], null, '#7f1d1d', 30000, 6),
    ('pre-made-juice', 'Green Forest', array['Cucumber','Pineapple','Celery','Green Apple','Kale'], null, '#15803d', 30000, 7),
    ('cold-pressed-juice', 'Carrot + Beet', array['Carrot','Beet'], 'Carrot', '#f97316', 35000, 1),
    ('cold-pressed-juice', 'Carrot + Celery', array['Carrot','Celery'], 'Carrot', '#f97316', 35000, 2),
    ('cold-pressed-juice', 'Carrot + Green Apple', array['Carrot','Green Apple'], 'Carrot', '#f97316', 35000, 3),
    ('cold-pressed-juice', 'Celery', array['Celery'], 'Celery', '#16a34a', 35000, 11),
    ('cold-pressed-juice', 'Celery + Melon', array['Celery','Melon'], 'Celery', '#16a34a', 35000, 12),
    ('cold-pressed-juice', 'Celery + Pineapple', array['Celery','Pineapple'], 'Celery', '#16a34a', 35000, 13),
    ('cold-pressed-juice', 'Celery + Green Apple', array['Celery','Green Apple'], 'Celery', '#16a34a', 35000, 14),
    ('cold-pressed-juice', 'Sunkist', array['Sunkist'], 'Sunkist', '#ea580c', 35000, 21),
    ('cold-pressed-juice', 'Sunkist + Carrot', array['Sunkist','Carrot'], 'Sunkist', '#ea580c', 35000, 22),
    ('cold-pressed-juice', 'Sunkist + Pineapple', array['Sunkist','Pineapple'], 'Sunkist', '#ea580c', 35000, 23),
    ('cold-pressed-juice', 'Sunkist + Strawberry', array['Sunkist','Strawberry'], 'Sunkist', '#ea580c', 35000, 24),
    ('cold-pressed-juice', 'Melon', array['Melon'], 'Melon', '#65a30d', 35000, 31),
    ('cold-pressed-juice', 'Melon + Sunkist', array['Melon','Sunkist'], 'Melon', '#65a30d', 35000, 32),
    ('cold-pressed-juice', 'Melon + Green Apple', array['Melon','Green Apple'], 'Melon', '#65a30d', 35000, 33),
    ('cold-pressed-juice', 'Melon + Strawberry', array['Melon','Strawberry'], 'Melon', '#65a30d', 35000, 34),
    ('cold-pressed-juice', 'Pineapple + Melon', array['Pineapple','Melon'], 'Pineapple', '#d97706', 35000, 41),
    ('cold-pressed-juice', 'Pineapple + Sunkist', array['Pineapple','Sunkist'], 'Pineapple', '#d97706', 35000, 42),
    ('cold-pressed-juice', 'Pineapple + Green Apple', array['Pineapple','Green Apple'], 'Pineapple', '#d97706', 35000, 43),
    ('cold-pressed-juice', 'Pineapple + Strawberry', array['Pineapple','Strawberry'], 'Pineapple', '#d97706', 35000, 44),
    ('cold-pressed-juice', 'Watermelon + Sunkist', array['Watermelon','Sunkist'], 'Watermelon', '#ef4444', 35000, 51),
    ('cold-pressed-juice', 'Watermelon + Strawberry', array['Watermelon','Strawberry'], 'Watermelon', '#ef4444', 35000, 52),
    ('cold-pressed-juice', 'Watermelon + Pineapple', array['Watermelon','Pineapple'], 'Watermelon', '#ef4444', 35000, 53),
    ('cold-pressed-juice', 'Guava + Beet', array['Guava','Beet'], 'Guava', '#db2777', 35000, 61),
    ('cold-pressed-juice', 'Guava + Sunkist', array['Guava','Sunkist'], 'Guava', '#db2777', 35000, 62),
    ('cold-pressed-juice', 'Guava + Pineapple', array['Guava','Pineapple'], 'Guava', '#db2777', 35000, 63),
    ('cold-pressed-juice', 'Guava + Green Apple', array['Guava','Green Apple'], 'Guava', '#db2777', 35000, 64),
    ('cold-pressed-juice', 'Guava + Watermelon', array['Guava','Watermelon'], 'Guava', '#db2777', 35000, 65),
    ('cold-pressed-juice', 'Beet + Carrot', array['Beet','Carrot'], 'Beet', '#be123c', 35000, 71),
    ('cold-pressed-juice', 'Beet + Pineapple', array['Beet','Pineapple'], 'Beet', '#be123c', 35000, 72),
    ('cold-pressed-juice', 'Beet + Green Apple', array['Beet','Green Apple'], 'Beet', '#be123c', 35000, 73)
)
insert into public.menu_entries (section_id, name, ingredients, base_name, accent_color, price_idr, sort_order, is_available)
select menu_sections.id, seed.name, seed.ingredients, seed.base_name, seed.accent_color, seed.price_idr, seed.sort_order, true
from seed
join public.menu_sections on menu_sections.slug = seed.section_slug
where not exists (
  select 1
  from public.menu_entries
  where menu_entries.section_id = menu_sections.id
    and menu_entries.name = seed.name
);

update public.menu_entries
set benefit = case name
  when 'Splash Orange' then 'Vitamin C dan beta-carotene untuk bantu jaga imun dan kulit tetap fresh.'
  when 'Pink Heart' then 'Rasa ringan, juicy, dan tinggi antioksidan untuk refresh harian.'
  when 'Yellow Glow' then 'Bright citrus blend untuk rasa segar dan bantu pencernaan.'
  when 'Berry Happy' then 'Manis-asam segar dengan antioksidan dari berry dan hidrasi watermelon.'
  when 'Red Love' then 'Hydrating, tropical, dan ringan untuk booster energi siang hari.'
  when 'Maroon Beet' then 'Earthy fresh untuk stamina, sirkulasi, dan rasa yang tetap balanced.'
  when 'Green Forest' then 'Green blend untuk detox ringan, mineral, dan rasa clean.'
  else benefit
end
where section_id = (select id from public.menu_sections where slug = 'pre-made-juice');

delete from public.menu_entries
where section_id = (select id from public.menu_sections where slug = 'cold-pressed-juice');

with cold_pressed_base(section_slug, name, ingredients, base_name, benefit, mix_notes, category_slug, accent_color, price_idr, sort_order) as (
  values
    ('cold-pressed-juice', 'Carrot', array['Green Apple','Celery','Sunkist'], 'Carrot', 'Mata dan kulit', '{"Green Apple":"Rasa lebih crisp dan bantu tambah antioksidan.","Celery":"Lebih clean dan ringan untuk detox harian.","Sunkist":"Vitamin C bikin carrot lebih bright dan fresh."}'::jsonb, 'roots-detox', '#f97316', 35000, 1),
    ('cold-pressed-juice', 'Beet', array['Green Apple','Carrot','Pineapple'], 'Beet', 'Stamina', '{"Green Apple":"Menyeimbangkan earthy beet dengan rasa segar.","Carrot":"Dobel roots untuk stamina dan beta-carotene.","Pineapple":"Rasa tropical dan bantu pencernaan."}'::jsonb, 'roots-detox', '#be123c', 35000, 2),
    ('cold-pressed-juice', 'Celery', array['Green Apple','Pineapple','Melon'], 'Celery', 'Deep detox', '{"Green Apple":"Lebih crisp, segar, dan mudah diminum.","Pineapple":"Manis-asam tropical untuk bantu pencernaan.","Melon":"Lebih ringan dan hydrating."}'::jsonb, 'roots-detox', '#16a34a', 35000, 3),
    ('cold-pressed-juice', 'Sunkist', array['Green Apple','Pineapple','Strawberry','Watermelon','Melon','Beet'], 'Sunkist', 'Imun kuat', '{"Green Apple":"Crisp dan fresh untuk balance rasa citrus.","Pineapple":"Tropical vitamin C dengan rasa lebih juicy.","Strawberry":"Antioksidan berry dan rasa manis-asam.","Watermelon":"Lebih hydrating dan ringan.","Melon":"Rasa soft, fresh, dan tidak terlalu asam.","Beet":"Tambahan earthy untuk stamina dan warna lebih bold."}'::jsonb, 'vitamin-c-booster', '#ea580c', 35000, 4),
    ('cold-pressed-juice', 'Pineapple', array['Melon','Green Apple','Guava','Sunkist','Strawberry'], 'Pineapple', 'Pencernaan', '{"Melon":"Lebih smooth dan hydrating.","Green Apple":"Crisp acidity untuk rasa lebih segar.","Guava":"Antioksidan dan body rasa lebih tebal.","Sunkist":"Extra citrus untuk vitamin C booster.","Strawberry":"Berry note yang manis-asam."}'::jsonb, 'vitamin-c-booster', '#d97706', 35000, 5),
    ('cold-pressed-juice', 'Guava', array['Green Apple','Sunkist','Strawberry','Beet','Pineapple'], 'Guava', 'Antioksidan', '{"Green Apple":"Lebih fresh dan ringan.","Sunkist":"Tambahan citrus untuk imun.","Strawberry":"Antioksidan berry dan aroma lebih fruity.","Beet":"Lebih bold untuk stamina.","Pineapple":"Tropical dan bantu pencernaan."}'::jsonb, 'vitamin-c-booster', '#db2777', 35000, 6),
    ('cold-pressed-juice', 'Watermelon', array['Sunkist','Strawberry','Green Apple','Pineapple'], 'Watermelon', 'Segar', '{"Sunkist":"Citrus fresh untuk rasa lebih lively.","Strawberry":"Berry note dan antioksidan.","Green Apple":"Crisp dan balance manis watermelon.","Pineapple":"Tropical, juicy, dan segar."}'::jsonb, 'hydration', '#ef4444', 35000, 7),
    ('cold-pressed-juice', 'Melon', array['Sunkist','Strawberry','Green Apple','Watermelon'], 'Melon', 'Hidrasi ringan', '{"Sunkist":"Citrus lift untuk rasa lebih fresh.","Strawberry":"Manis-asam ringan dengan antioksidan.","Green Apple":"Crisp dan clean.","Watermelon":"Extra hydrating dan juicy."}'::jsonb, 'hydration', '#65a30d', 35000, 8)
)
insert into public.menu_entries (section_id, name, ingredients, base_name, benefit, mix_notes, category_slug, accent_color, price_idr, sort_order, is_available)
select menu_sections.id, cold_pressed_base.name, cold_pressed_base.ingredients, cold_pressed_base.base_name, cold_pressed_base.benefit, cold_pressed_base.mix_notes, cold_pressed_base.category_slug, cold_pressed_base.accent_color, cold_pressed_base.price_idr, cold_pressed_base.sort_order, true
from cold_pressed_base
join public.menu_sections on menu_sections.slug = cold_pressed_base.section_slug;

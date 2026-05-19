alter table public.menu_entries
add column if not exists benefit text,
add column if not exists category_slug text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'menu_entries_category_slug_check'
  ) then
    alter table public.menu_entries
    add constraint menu_entries_category_slug_check
    check (category_slug in ('roots-detox', 'vitamin-c-booster', 'hydration'));
  end if;
end $$;

update public.menu_sections
set
  title = 'Cold-Pressed Bar',
  description = '100% murni. Tanpa air, tanpa gula, tanpa sirup.'
where slug = 'cold-pressed-juice';

delete from public.menu_entries
where section_id = (select id from public.menu_sections where slug = 'cold-pressed-juice');

with cold_pressed_base(section_slug, name, ingredients, base_name, benefit, category_slug, accent_color, price_idr, sort_order) as (
  values
    ('cold-pressed-juice', 'Carrot', array['Green Apple','Celery','Sunkist'], 'Carrot', 'Mata dan kulit', 'roots-detox', '#f97316', 35000, 1),
    ('cold-pressed-juice', 'Beet', array['Green Apple','Carrot','Pineapple'], 'Beet', 'Stamina', 'roots-detox', '#be123c', 35000, 2),
    ('cold-pressed-juice', 'Celery', array['Green Apple','Pineapple','Melon'], 'Celery', 'Deep detox', 'roots-detox', '#16a34a', 35000, 3),
    ('cold-pressed-juice', 'Sunkist', array['Green Apple','Pineapple','Strawberry','Watermelon','Melon','Beet'], 'Sunkist', 'Imun kuat', 'vitamin-c-booster', '#ea580c', 35000, 4),
    ('cold-pressed-juice', 'Pineapple', array['Melon','Green Apple','Guava','Sunkist','Strawberry'], 'Pineapple', 'Pencernaan', 'vitamin-c-booster', '#d97706', 35000, 5),
    ('cold-pressed-juice', 'Guava', array['Green Apple','Sunkist','Strawberry','Beet','Pineapple'], 'Guava', 'Antioksidan', 'vitamin-c-booster', '#db2777', 35000, 6),
    ('cold-pressed-juice', 'Watermelon', array['Sunkist','Strawberry','Green Apple','Pineapple'], 'Watermelon', 'Segar', 'hydration', '#ef4444', 35000, 7),
    ('cold-pressed-juice', 'Melon', array['Sunkist','Strawberry','Green Apple','Watermelon'], 'Melon', 'Hidrasi ringan', 'hydration', '#65a30d', 35000, 8)
)
insert into public.menu_entries (
  section_id,
  name,
  ingredients,
  base_name,
  benefit,
  category_slug,
  accent_color,
  price_idr,
  sort_order,
  is_available
)
select
  menu_sections.id,
  cold_pressed_base.name,
  cold_pressed_base.ingredients,
  cold_pressed_base.base_name,
  cold_pressed_base.benefit,
  cold_pressed_base.category_slug,
  cold_pressed_base.accent_color,
  cold_pressed_base.price_idr,
  cold_pressed_base.sort_order,
  true
from cold_pressed_base
join public.menu_sections on menu_sections.slug = cold_pressed_base.section_slug;

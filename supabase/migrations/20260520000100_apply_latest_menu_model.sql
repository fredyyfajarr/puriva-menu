alter table public.menu_entries
add column if not exists benefit text,
add column if not exists category_slug text,
add column if not exists mix_notes jsonb not null default '{}'::jsonb;

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
insert into public.menu_entries (
  section_id,
  name,
  ingredients,
  base_name,
  benefit,
  mix_notes,
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
  cold_pressed_base.mix_notes,
  cold_pressed_base.category_slug,
  cold_pressed_base.accent_color,
  cold_pressed_base.price_idr,
  cold_pressed_base.sort_order,
  true
from cold_pressed_base
join public.menu_sections on menu_sections.slug = cold_pressed_base.section_slug;

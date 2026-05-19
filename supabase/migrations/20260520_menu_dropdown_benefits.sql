alter table public.menu_entries
add column if not exists mix_notes jsonb not null default '{}'::jsonb;

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

update public.menu_entries
set mix_notes = case name
  when 'Carrot' then '{"Green Apple":"Rasa lebih crisp dan bantu tambah antioksidan.","Celery":"Lebih clean dan ringan untuk detox harian.","Sunkist":"Vitamin C bikin carrot lebih bright dan fresh."}'::jsonb
  when 'Beet' then '{"Green Apple":"Menyeimbangkan earthy beet dengan rasa segar.","Carrot":"Dobel roots untuk stamina dan beta-carotene.","Pineapple":"Rasa tropical dan bantu pencernaan."}'::jsonb
  when 'Celery' then '{"Green Apple":"Lebih crisp, segar, dan mudah diminum.","Pineapple":"Manis-asam tropical untuk bantu pencernaan.","Melon":"Lebih ringan dan hydrating."}'::jsonb
  when 'Sunkist' then '{"Green Apple":"Crisp dan fresh untuk balance rasa citrus.","Pineapple":"Tropical vitamin C dengan rasa lebih juicy.","Strawberry":"Antioksidan berry dan rasa manis-asam.","Watermelon":"Lebih hydrating dan ringan.","Melon":"Rasa soft, fresh, dan tidak terlalu asam.","Beet":"Tambahan earthy untuk stamina dan warna lebih bold."}'::jsonb
  when 'Pineapple' then '{"Melon":"Lebih smooth dan hydrating.","Green Apple":"Crisp acidity untuk rasa lebih segar.","Guava":"Antioksidan dan body rasa lebih tebal.","Sunkist":"Extra citrus untuk vitamin C booster.","Strawberry":"Berry note yang manis-asam."}'::jsonb
  when 'Guava' then '{"Green Apple":"Lebih fresh dan ringan.","Sunkist":"Tambahan citrus untuk imun.","Strawberry":"Antioksidan berry dan aroma lebih fruity.","Beet":"Lebih bold untuk stamina.","Pineapple":"Tropical dan bantu pencernaan."}'::jsonb
  when 'Watermelon' then '{"Sunkist":"Citrus fresh untuk rasa lebih lively.","Strawberry":"Berry note dan antioksidan.","Green Apple":"Crisp dan balance manis watermelon.","Pineapple":"Tropical, juicy, dan segar."}'::jsonb
  when 'Melon' then '{"Sunkist":"Citrus lift untuk rasa lebih fresh.","Strawberry":"Manis-asam ringan dengan antioksidan.","Green Apple":"Crisp dan clean.","Watermelon":"Extra hydrating dan juicy."}'::jsonb
  else mix_notes
end
where section_id = (select id from public.menu_sections where slug = 'cold-pressed-juice');

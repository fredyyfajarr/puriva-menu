with image_updates(section_slug, entry_name, image_url) as (
  values
    ('cut-fruits', 'Sunkist', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cut-fruits/cut-sunkist.webp'),
    ('cut-fruits', 'Melon', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cut-fruits/cut-melon.webp'),
    ('cut-fruits', 'Pineapple', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cut-fruits/cut-pineapple.webp'),
    ('cut-fruits', 'Dragon Fruit', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cut-fruits/cut-dragon-fruit.webp'),
    ('cut-fruits', 'Watermelon', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cut-fruits/cut-watermelon.webp'),
    ('cut-fruits', 'Green Apple', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cut-fruits/cut-green-apple.webp'),
    ('blended-juice', 'Avocado', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-avocado-juice.webp'),
    ('blended-juice', 'Sunkist', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-sunkist-juice.webp'),
    ('blended-juice', 'Melon', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-melon-juice.webp'),
    ('blended-juice', 'Pineapple', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-pineapple-juice.webp'),
    ('blended-juice', 'Guava', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-guava-juice.webp'),
    ('blended-juice', 'Dragon Fruit', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-dragon-fruit-juice.webp'),
    ('blended-juice', 'Watermelon', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-watermelon-juice.webp'),
    ('blended-juice', 'Strawberry', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-strawberry-juice.webp'),
    ('blended-juice', 'Mango', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/blended-juice/premium-mango-juice.webp'),
    ('pre-made-juice', 'Splash Orange', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/pre-made-juice/splash-orange.webp'),
    ('pre-made-juice', 'Pink Heart', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/pre-made-juice/pink-heart.webp'),
    ('pre-made-juice', 'Yellow Glow', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/pre-made-juice/yellow-glow.webp'),
    ('pre-made-juice', 'Berry Happy', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/pre-made-juice/berry-happy.webp'),
    ('pre-made-juice', 'Red Love', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/pre-made-juice/red-love.webp'),
    ('pre-made-juice', 'Maroon Beet', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/pre-made-juice/maroon-beat.webp'),
    ('pre-made-juice', 'Green Forest', 'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/pre-made-juice/green-forest.webp')
)
update public.menu_entries
set image_url = image_updates.image_url
from public.menu_sections, image_updates
where menu_entries.section_id = menu_sections.id
  and menu_sections.slug = image_updates.section_slug
  and menu_entries.name = image_updates.entry_name;

with mix_updates(entry_name, mix_image_urls) as (
  values
    ('Carrot', '{
      "Original": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/carrot-juice.webp",
      "Celery": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/carrot-celery-juice.webp",
      "Green Apple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/carrot-green-apple-juice.webp"
    }'::jsonb),
    ('Beet', '{
      "Carrot": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/beet-carrot-juice.webp",
      "Pineapple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/beet-pineapple-juice.webp",
      "Green Apple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/beet-green-apple-juice.webp"
    }'::jsonb),
    ('Celery', '{
      "Original": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/celery-juice.webp",
      "Green Apple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/celery-green-apple-juice.webp",
      "Pineapple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/celery-pineapple-juice.webp",
      "Melon": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/celery-melon-juice.webp"
    }'::jsonb),
    ('Sunkist', '{
      "Original": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/sunkist-juice.webp",
      "Carrot": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/sunkist-carrot-juice.webp",
      "Pineapple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/sunkist-pineapple-juice.webp",
      "Strawberry": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/sunkist-strawberry-juice.webp"
    }'::jsonb),
    ('Pineapple', '{
      "Melon": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/pineapple-melon-juice.webp",
      "Sunkist": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/pineapple-sunkist-juice.webp",
      "Green Apple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/pineapple-green-apple-juice.webp",
      "Strawberry": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/pineapple-strawberry-juice.webp"
    }'::jsonb),
    ('Guava', '{
      "Sunkist": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/guava-sunkist-juice.webp",
      "Pineapple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/guava-pineapple-juice.webp",
      "Green Apple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/guava-green-apple-juice.webp",
      "Beet": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/guava-beet-juice.webp"
    }'::jsonb),
    ('Watermelon', '{
      "Original": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/watermelon-juice.webp",
      "Sunkist": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/watermelon-sunkist-juice.webp",
      "Pineapple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/watermelon-pineapple-juice.webp",
      "Strawberry": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/watermelon-strawberry-juice.webp"
    }'::jsonb),
    ('Melon', '{
      "Original": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/melon-juice.webp",
      "Sunkist": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/melon-sunkist-juice.webp",
      "Strawberry": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/melon-strawberry-juice.webp",
      "Green Apple": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/melon-green-apple-juice.webp"
    }'::jsonb),
    ('Cucumber', '{
      "Original": "https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/cold-pressed-juice/cucumber-juice.webp"
    }'::jsonb)
)
update public.menu_entries
set mix_image_urls = coalesce(menu_entries.mix_image_urls, '{}'::jsonb) || mix_updates.mix_image_urls
from public.menu_sections, mix_updates
where menu_entries.section_id = menu_sections.id
  and menu_sections.slug = 'cold-pressed-juice'
  and menu_entries.name = mix_updates.entry_name;

update public.menu_entries
set mix_image_urls = coalesce(mix_image_urls, '{}'::jsonb) || jsonb_build_object(
  'Carrot',
  'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/sunkist-carrot.webp',
  'Strawberry',
  'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/sunkist-strawberry.webp'
)
where name = 'Sunkist'
  and exists (
    select 1
    from public.menu_sections
    where menu_sections.id = menu_entries.section_id
      and menu_sections.slug = 'cold-pressed-juice'
  );

update public.menu_entries
set mix_image_urls = coalesce(mix_image_urls, '{}'::jsonb) || jsonb_build_object(
  'Pineapple',
  'https://plzvbabkwgxxhmrpqvgg.supabase.co/storage/v1/object/public/menu-images/grab/celery-pineapple.webp'
)
where name = 'Celery'
  and exists (
    select 1
    from public.menu_sections
    where menu_sections.id = menu_entries.section_id
      and menu_sections.slug = 'cold-pressed-juice'
  );

create or replace function public.create_table_order(
  p_table_token text,
  p_customer_name text default null,
  p_notes text default null,
  p_payment_method text default 'cash',
  p_payment_status text default 'unpaid',
  p_items jsonb default '[]'::jsonb
)
returns table(order_id uuid, order_number bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_table_id uuid;
  v_session_id uuid;
  v_order_id uuid;
  v_order_number bigint;
  v_subtotal integer := 0;
  v_item jsonb;
  v_menu_entry_id uuid;
  v_menu_name text;
  v_section_slug text;
  v_variant_label text;
  v_mix_availability jsonb;
  v_quantity integer;
  v_unit_price integer;
  v_line_total integer;
  v_notes text;
  v_sold_out_ingredient text;
begin
  if p_payment_method not in ('cash', 'edc_bca', 'qris_static', 'dynamic_qris') then
    raise exception 'Invalid payment method';
  end if;

  if p_payment_status not in ('unpaid', 'pending', 'paid', 'failed', 'expired', 'refunded') then
    raise exception 'Invalid payment status';
  end if;

  select id into v_table_id
  from public.dining_tables
  where qr_token = trim(p_table_token)
    and is_active = true;

  if v_table_id is null then
    raise exception 'Invalid table token';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Order must contain 1 to 50 items';
  end if;

  select id into v_session_id
  from public.table_sessions
  where table_id = v_table_id
    and status = 'active'
  order by opened_at desc
  limit 1;

  if v_session_id is null then
    insert into public.table_sessions (table_id, status)
    values (v_table_id, 'active')
    returning id into v_session_id;
  end if;

  insert into public.orders (session_id, table_id, customer_name, notes, status, payment_status, payment_method, subtotal_idr, business_date)
  values (
    v_session_id,
    v_table_id,
    nullif(trim(coalesce(p_customer_name, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    'new',
    p_payment_status,
    p_payment_method,
    0,
    timezone('Asia/Jakarta', now())::date
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_menu_entry_id := (v_item ->> 'menu_entry_id')::uuid;
    v_variant_label := nullif(trim(coalesce(v_item ->> 'variant_label', '')), '');
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);
    v_notes := nullif(trim(coalesce(v_item ->> 'notes', '')), '');

    if v_quantity < 1 or v_quantity > 99 then
      raise exception 'Invalid quantity';
    end if;

    select
      menu_entries.name,
      menu_sections.slug,
      coalesce(menu_entries.price_idr, menu_sections.price_idr, 0),
      menu_entries.mix_availability
    into v_menu_name, v_section_slug, v_unit_price, v_mix_availability
    from public.menu_entries
    join public.menu_sections on menu_sections.id = menu_entries.section_id
    where menu_entries.id = v_menu_entry_id
      and menu_entries.is_available = true
      and menu_sections.is_active = true;

    if v_menu_name is null then
      raise exception 'Menu item is not available';
    end if;

    if v_variant_label is not null and coalesce((v_mix_availability ->> v_variant_label)::boolean, true) = false then
      raise exception 'Menu variant is sold out';
    end if;

    if v_section_slug = 'cold-pressed-juice'
      and v_variant_label is not null
      and lower(v_variant_label) <> 'original'
    then
      select coalesce(menu_entries.base_name, menu_entries.name)
      into v_sold_out_ingredient
      from public.menu_entries
      join public.menu_sections on menu_sections.id = menu_entries.section_id
      where menu_sections.slug = 'cold-pressed-juice'
        and menu_entries.is_available = false
        and lower(coalesce(menu_entries.base_name, menu_entries.name)) = lower(v_variant_label)
      limit 1;

      if v_sold_out_ingredient is not null then
        raise exception 'Menu ingredient is sold out';
      end if;
    end if;

    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into public.order_items (
      order_id,
      menu_entry_id,
      item_name,
      variant_label,
      quantity,
      unit_price_idr,
      line_total_idr,
      notes
    )
    values (
      v_order_id,
      v_menu_entry_id,
      v_menu_name,
      v_variant_label,
      v_quantity,
      v_unit_price,
      v_line_total,
      v_notes
    );
  end loop;

  update public.orders
  set subtotal_idr = v_subtotal
  where id = v_order_id;

  insert into public.audit_logs (action, entity_type, entity_id, actor_type, metadata)
  values (
    'order_created',
    'order',
    v_order_id,
    'customer',
    jsonb_build_object('table_id', v_table_id, 'session_id', v_session_id, 'subtotal_idr', v_subtotal, 'payment_method', p_payment_method)
  );

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function public.create_table_order(text, text, text, text, text, jsonb) to anon, authenticated;

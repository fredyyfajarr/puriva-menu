alter table public.dining_tables
add column if not exists qr_token text;

update public.dining_tables
set qr_token = replace(gen_random_uuid()::text, '-', '')
where qr_token is null or length(trim(qr_token)) = 0;

alter table public.dining_tables
alter column qr_token set default replace(gen_random_uuid()::text, '-', '');

alter table public.dining_tables
alter column qr_token set not null;

create unique index if not exists dining_tables_qr_token_idx on public.dining_tables(qr_token);

revoke select on public.dining_tables from anon;
grant select on public.dining_tables to authenticated;

drop policy if exists "public can read active dining tables" on public.dining_tables;
drop policy if exists "admins can read dining tables" on public.dining_tables;
create policy "admins can read dining tables"
on public.dining_tables for select
using (private.is_admin());

create or replace function public.get_dining_table_by_qr_token(p_qr_token text)
returns table(
  id uuid,
  code text,
  qr_token text,
  label text,
  is_active boolean
)
language sql
security definer
set search_path = public
as $$
  select dining_tables.id, dining_tables.code, dining_tables.qr_token, dining_tables.label, dining_tables.is_active
  from public.dining_tables
  where dining_tables.qr_token = trim(p_qr_token)
    and dining_tables.is_active = true
  limit 1;
$$;

grant execute on function public.get_dining_table_by_qr_token(text) to anon, authenticated;

drop function if exists public.create_table_order(text, text, text, text, text, jsonb);
drop function if exists public.create_table_order(text, text, text, jsonb);

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
  v_order_id uuid;
  v_order_number bigint;
  v_subtotal integer := 0;
  v_item jsonb;
  v_menu_entry_id uuid;
  v_menu_name text;
  v_variant_label text;
  v_quantity integer;
  v_unit_price integer;
  v_line_total integer;
  v_notes text;
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

  insert into public.orders (table_id, customer_name, notes, status, payment_status, payment_method, subtotal_idr)
  values (
    v_table_id,
    nullif(trim(coalesce(p_customer_name, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    'new',
    p_payment_status,
    p_payment_method,
    0
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

    select menu_entries.name, coalesce(menu_entries.price_idr, menu_sections.price_idr, 0)
    into v_menu_name, v_unit_price
    from public.menu_entries
    join public.menu_sections on menu_sections.id = menu_entries.section_id
    where menu_entries.id = v_menu_entry_id
      and menu_entries.is_available = true
      and menu_sections.is_active = true;

    if v_menu_name is null then
      raise exception 'Menu item is not available';
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

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function public.create_table_order(text, text, text, text, text, jsonb) to anon, authenticated;

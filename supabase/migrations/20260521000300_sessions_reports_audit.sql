create table if not exists public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.dining_tables(id),
  status text not null default 'active' check (status in ('active', 'closed', 'canceled')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
add column if not exists session_id uuid references public.table_sessions(id);

alter table public.orders
add column if not exists business_date date not null default (timezone('Asia/Jakarta', now())::date);

alter table public.orders
add column if not exists completed_at timestamptz;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  actor_type text not null default 'system' check (actor_type in ('customer', 'admin', 'system')),
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists table_sessions_table_status_idx on public.table_sessions(table_id, status, opened_at);
create index if not exists orders_session_idx on public.orders(session_id);
create index if not exists orders_business_date_idx on public.orders(business_date, status, payment_status);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

drop trigger if exists touch_table_sessions_updated_at on public.table_sessions;
create trigger touch_table_sessions_updated_at
before update on public.table_sessions
for each row execute function public.touch_updated_at();

alter table public.table_sessions enable row level security;
alter table public.audit_logs enable row level security;

grant select, update on public.table_sessions to authenticated;
grant select, insert on public.audit_logs to authenticated;

drop policy if exists "admins can read table sessions" on public.table_sessions;
create policy "admins can read table sessions"
on public.table_sessions for select
using (private.is_admin());

drop policy if exists "admins can update table sessions" on public.table_sessions;
create policy "admins can update table sessions"
on public.table_sessions for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "admins can read audit logs" on public.audit_logs;
create policy "admins can read audit logs"
on public.audit_logs for select
using (private.is_admin());

drop policy if exists "admins can insert audit logs" on public.audit_logs;
create policy "admins can insert audit logs"
on public.audit_logs for insert
with check (private.is_admin());

drop function if exists public.create_table_order(text, text, text, text, text, jsonb);

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

create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_status text;
  v_session_id uuid;
begin
  if not private.is_admin() then
    raise exception 'Forbidden';
  end if;

  if p_status not in ('new', 'preparing', 'ready', 'completed', 'canceled') then
    raise exception 'Invalid order status';
  end if;

  select status, session_id into v_old_status, v_session_id
  from public.orders
  where id = p_order_id;

  if v_old_status is null then
    raise exception 'Order not found';
  end if;

  update public.orders
  set
    status = p_status,
    completed_at = case when p_status in ('completed', 'canceled') then coalesce(completed_at, now()) else null end
  where id = p_order_id;

  if v_session_id is not null and p_status in ('completed', 'canceled') then
    update public.table_sessions
    set
      status = case
        when exists (
          select 1
          from public.orders
          where session_id = v_session_id
            and status not in ('completed', 'canceled')
        ) then status
        when p_status = 'canceled' then 'canceled'
        else 'closed'
      end,
      closed_at = case
        when exists (
          select 1
          from public.orders
          where session_id = v_session_id
            and status not in ('completed', 'canceled')
        ) then closed_at
        else now()
      end
    where id = v_session_id;
  end if;

  insert into public.audit_logs (action, entity_type, entity_id, actor_type, actor_user_id, metadata)
  values (
    'order_status_updated',
    'order',
    p_order_id,
    'admin',
    auth.uid(),
    jsonb_build_object('from', v_old_status, 'to', p_status, 'session_id', v_session_id)
  );
end;
$$;

grant execute on function public.set_order_status(uuid, text) to authenticated;

alter table public.orders
add column if not exists cancel_reason text;

drop function if exists public.set_order_status(uuid, text);
drop function if exists public.set_order_status(uuid, text, text);

create or replace function public.set_order_status(p_order_id uuid, p_status text, p_cancel_reason text default null)
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

  if p_status = 'canceled' and nullif(trim(coalesce(p_cancel_reason, '')), '') is null then
    raise exception 'Cancel reason is required';
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
    cancel_reason = case when p_status = 'canceled' then nullif(trim(coalesce(p_cancel_reason, '')), '') else null end,
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
    jsonb_build_object('from', v_old_status, 'to', p_status, 'session_id', v_session_id, 'cancel_reason', p_cancel_reason)
  );
end;
$$;

grant execute on function public.set_order_status(uuid, text, text) to authenticated;

create or replace view public.bi_order_facts as
select
  orders.id,
  orders.order_number,
  orders.business_date,
  orders.created_at,
  orders.completed_at,
  orders.status,
  orders.payment_status,
  orders.payment_method,
  orders.subtotal_idr,
  dining_tables.code as table_code,
  dining_tables.label as table_label,
  coalesce(sum(order_items.quantity), 0)::integer as item_quantity
from public.orders
join public.dining_tables on dining_tables.id = orders.table_id
left join public.order_items on order_items.order_id = orders.id
group by orders.id, dining_tables.code, dining_tables.label;

create or replace view public.bi_daily_sales as
select
  business_date,
  count(*) filter (where status = 'completed') as completed_invoice_count,
  count(*) filter (where status = 'canceled') as canceled_invoice_count,
  coalesce(sum(subtotal_idr) filter (where status = 'completed' and payment_status = 'paid'), 0)::integer as paid_sales_idr,
  coalesce(avg(subtotal_idr) filter (where status = 'completed' and payment_status = 'paid'), 0)::integer as average_order_value_idr
from public.orders
group by business_date;

grant select on public.bi_order_facts to authenticated;
grant select on public.bi_daily_sales to authenticated;

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check check (role in ('viewer', 'staff', 'admin', 'owner'));

alter table public.payments
add column if not exists qr_string text;

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
      and role in ('owner', 'admin')
  );
$$;

create or replace function private.has_staff_access(user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role in ('owner', 'admin', 'staff')
  );
$$;

grant execute on function private.has_staff_access(uuid) to anon, authenticated;

drop policy if exists "admins can read dining tables" on public.dining_tables;
create policy "staff can read dining tables"
on public.dining_tables for select
using (private.has_staff_access());

drop policy if exists "admins can read table sessions" on public.table_sessions;
create policy "staff can read table sessions"
on public.table_sessions for select
using (private.has_staff_access());

drop policy if exists "admins can update table sessions" on public.table_sessions;
create policy "staff can update table sessions"
on public.table_sessions for update
using (private.has_staff_access())
with check (private.has_staff_access());

drop policy if exists "admins can read orders" on public.orders;
create policy "staff can read orders"
on public.orders for select
using (private.has_staff_access());

drop policy if exists "admins can update orders" on public.orders;
create policy "staff can update orders"
on public.orders for update
using (private.has_staff_access())
with check (private.has_staff_access());

drop policy if exists "admins can read order items" on public.order_items;
create policy "staff can read order items"
on public.order_items for select
using (private.has_staff_access());

drop policy if exists "admins can read payments" on public.payments;
create policy "staff can read payments"
on public.payments for select
using (private.has_staff_access());

drop policy if exists "admins can insert payments" on public.payments;
create policy "admins can insert payments"
on public.payments for insert
with check (private.is_admin());

drop policy if exists "admins can update payments" on public.payments;
create policy "staff can update payments"
on public.payments for update
using (private.has_staff_access())
with check (private.has_staff_access());

drop policy if exists "admins can update entries" on public.menu_entries;
create policy "staff can update stock entries"
on public.menu_entries for update
using (private.has_staff_access())
with check (private.has_staff_access());

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
  if not private.has_staff_access() then
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

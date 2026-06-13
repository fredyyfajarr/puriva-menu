alter table public.orders
add column if not exists payment_status text not null default 'unpaid';

alter table public.orders
add column if not exists payment_method text;

alter table public.orders
add column if not exists paid_at timestamptz;

alter table public.orders
drop constraint if exists orders_payment_status_check;

alter table public.orders
add constraint orders_payment_status_check
check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'expired', 'refunded'));

create index if not exists orders_payment_status_created_idx on public.orders(payment_status, created_at);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'manual',
  provider_reference text,
  method text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  amount_idr integer not null check (amount_idr >= 0),
  currency text not null default 'IDR',
  checkout_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_created_idx on public.payments(order_id, created_at);
create index if not exists payments_provider_reference_idx on public.payments(provider, provider_reference);

drop trigger if exists touch_payments_updated_at on public.payments;
create trigger touch_payments_updated_at
before update on public.payments
for each row execute function public.touch_updated_at();

alter table public.payments enable row level security;

drop policy if exists "admins can read payments" on public.payments;
create policy "admins can read payments"
on public.payments for select
using (private.is_admin());

drop policy if exists "admins can insert payments" on public.payments;
create policy "admins can insert payments"
on public.payments for insert
with check (private.is_admin());

drop policy if exists "admins can update payments" on public.payments;
create policy "admins can update payments"
on public.payments for update
using (private.is_admin())
with check (private.is_admin());

grant select, insert, update on public.payments to authenticated;

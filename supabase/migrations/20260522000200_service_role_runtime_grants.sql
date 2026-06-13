grant usage on schema public to service_role;
grant usage, select on sequence public.orders_order_number_seq to service_role;

grant select on public.profiles to service_role;
grant select on public.menu_sections to service_role;
grant select, update on public.menu_entries to service_role;
grant select, insert, update on public.dining_tables to service_role;
grant select, insert, update on public.table_sessions to service_role;
grant select, insert, update on public.orders to service_role;
grant select, insert, update on public.order_items to service_role;
grant select, insert, update on public.payments to service_role;
grant select, insert on public.audit_logs to service_role;

grant execute on function public.get_dining_table_by_qr_token(text) to service_role;
grant execute on function public.create_table_order(text, text, text, text, text, jsonb) to service_role;
grant execute on function public.set_order_status(uuid, text, text) to service_role;

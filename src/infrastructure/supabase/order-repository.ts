import { randomBytes } from "crypto";

import type { CreatedOrder, CreateOrderInput, CreatePaymentInput, OrderRepository } from "@/application/order/order-repository";
import type { AuditLog, DiningTable, Order, OrderItem, OrderStatus, Payment, PaymentStatus, PublicOrderStatus, SalesReport } from "@/domain/order/types";

import { createSupabaseServerClient, createSupabaseServiceClient } from "./server";

type DiningTableRow = {
  id: string;
  code: string;
  qr_token: string;
  label: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type OrderItemRow = {
  id: string;
  item_name: string;
  variant_label: string | null;
  quantity: number;
  unit_price_idr: number;
  line_total_idr: number;
  notes: string | null;
};

type OrderRow = {
  id: string;
  session_id?: string | null;
  order_number: number;
  customer_name: string | null;
  notes: string | null;
  cancel_reason?: string | null;
  status: OrderStatus;
  payment_status?: PaymentStatus | null;
  payment_method?: string | null;
  paid_at?: string | null;
  subtotal_idr: number;
  business_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  table: {
    code: string;
    label: string;
  } | null;
  items: OrderItemRow[];
};

type AuditLogRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_type: string;
  actor_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type PaymentRow = {
  id: string;
  order_id: string;
  provider: string;
  provider_reference: string | null;
  method: string | null;
  status: PaymentStatus;
  amount_idr: number;
  currency: string;
  checkout_url: string | null;
  qr_string?: string | null;
  raw_payload: Record<string, unknown>;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

type OrderRepositoryOptions = {
  useServiceRole?: boolean;
};

function mapTable(row: DiningTableRow): DiningTable {
  return {
    id: row.id,
    code: row.code,
    qrToken: row.qr_token,
    label: row.label,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    itemName: row.item_name,
    variantLabel: row.variant_label,
    quantity: row.quantity,
    unitPriceIdr: row.unit_price_idr,
    lineTotalIdr: row.line_total_idr,
    notes: row.notes,
  };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    sessionId: row.session_id ?? null,
    orderNumber: row.order_number,
    tableCode: row.table?.code ?? "-",
    tableLabel: row.table?.label ?? "Unknown table",
    customerName: row.customer_name,
    notes: row.notes,
    cancelReason: row.cancel_reason ?? null,
    status: row.status,
    paymentStatus: row.payment_status ?? "unpaid",
    paymentMethod: row.payment_method ?? null,
    paidAt: row.paid_at ?? null,
    subtotalIdr: row.subtotal_idr,
    businessDate: row.business_date ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.items ?? []).map(mapItem),
  };
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorType: row.actor_type,
    actorUserId: row.actor_user_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider,
    providerReference: row.provider_reference,
    method: row.method,
    status: row.status,
    amountIdr: row.amount_idr,
    currency: row.currency,
    checkoutUrl: row.checkout_url,
    qrString: row.qr_string ?? null,
    rawPayload: row.raw_payload ?? {},
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildEmptySalesReport(
  period: SalesReport["period"],
  dateFrom: string,
  dateTo: string,
): SalesReport {
  return {
    period,
    dateFrom,
    dateTo,
    grossSalesIdr: 0,
    paidSalesIdr: 0,
    invoiceCount: 0,
    completedCount: 0,
    canceledCount: 0,
    averageOrderValueIdr: 0,
    paymentBreakdown: [],
    statusBreakdown: [],
    tableBreakdown: [],
    hourlySales: Array.from({ length: 24 }, (_, hour) => ({ hour, paidSalesIdr: 0, invoiceCount: 0 })),
    topItems: [],
    categoryBreakdown: [],
    cancelRate: 0,
    paidRate: 0,
    dailySales: [],
  };
}

function enumerateDates(dateFrom: string, dateTo: string) {
  const dates: string[] = [];
  const current = new Date(`${dateFrom}T00:00:00`);
  const end = new Date(`${dateTo}T00:00:00`);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function buildSalesReport(
  orders: Order[],
  period: SalesReport["period"],
  dateFrom: string,
  dateTo: string,
): SalesReport {
  const completedOrders = orders.filter((order) => order.status === "completed");
  const paidCompletedOrders = completedOrders.filter((order) => order.paymentStatus === "paid");
  const grossSalesIdr = completedOrders.reduce((total, order) => total + order.subtotalIdr, 0);
  const paidSalesIdr = paidCompletedOrders.reduce((total, order) => total + order.subtotalIdr, 0);
  const paymentMap = new Map<string, { method: string; totalIdr: number; count: number }>();
  const statusMap = new Map<OrderStatus, { status: OrderStatus; totalIdr: number; count: number }>();
  const tableMap = new Map<string, { tableCode: string; tableLabel: string; totalIdr: number; count: number }>();
  const hourlyMap = new Map<number, { hour: number; paidSalesIdr: number; invoiceCount: number }>(
    Array.from({ length: 24 }, (_, hour) => [hour, { hour, paidSalesIdr: 0, invoiceCount: 0 }]),
  );
  const itemMap = new Map<string, { name: string; quantity: number; totalIdr: number }>();
  const categoryMap = new Map<string, { category: string; quantity: number; totalIdr: number }>();
  const dailyMap = new Map<string, { date: string; paidSalesIdr: number; invoiceCount: number }>();

  for (const order of orders) {
    const status = statusMap.get(order.status) ?? { status: order.status, totalIdr: 0, count: 0 };
    status.totalIdr += order.subtotalIdr;
    status.count += 1;
    statusMap.set(order.status, status);
  }

  for (const order of paidCompletedOrders) {
    const method = order.paymentMethod ?? "unknown";
    const payment = paymentMap.get(method) ?? { method, totalIdr: 0, count: 0 };
    payment.totalIdr += order.subtotalIdr;
    payment.count += 1;
    paymentMap.set(method, payment);

    const date = order.businessDate ?? order.createdAt.slice(0, 10);
    const daily = dailyMap.get(date) ?? { date, paidSalesIdr: 0, invoiceCount: 0 };
    daily.paidSalesIdr += order.subtotalIdr;
    daily.invoiceCount += 1;
    dailyMap.set(date, daily);

    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }).format(new Date(order.completedAt ?? order.paidAt ?? order.createdAt)),
    ) % 24;
    const hourly = hourlyMap.get(hour) ?? { hour, paidSalesIdr: 0, invoiceCount: 0 };
    hourly.paidSalesIdr += order.subtotalIdr;
    hourly.invoiceCount += 1;
    hourlyMap.set(hour, hourly);

    const tableKey = order.tableCode;
    const table = tableMap.get(tableKey) ?? {
      tableCode: order.tableCode,
      tableLabel: order.tableLabel,
      totalIdr: 0,
      count: 0,
    };
    table.totalIdr += order.subtotalIdr;
    table.count += 1;
    tableMap.set(tableKey, table);

    for (const item of order.items) {
      const name = item.variantLabel ? `${item.itemName} + ${item.variantLabel}` : item.itemName;
      const current = itemMap.get(name) ?? { name, quantity: 0, totalIdr: 0 };
      current.quantity += item.quantity;
      current.totalIdr += item.lineTotalIdr;
      itemMap.set(name, current);

      const categoryName = item.itemName;
      const category = categoryMap.get(categoryName) ?? { category: categoryName, quantity: 0, totalIdr: 0 };
      category.quantity += item.quantity;
      category.totalIdr += item.lineTotalIdr;
      categoryMap.set(categoryName, category);
    }
  }

  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");

  return {
    period,
    dateFrom,
    dateTo,
    grossSalesIdr,
    paidSalesIdr,
    invoiceCount: orders.length,
    completedCount: completedOrders.length,
    canceledCount: orders.filter((order) => order.status === "canceled").length,
    averageOrderValueIdr: paidCompletedOrders.length ? Math.round(paidSalesIdr / paidCompletedOrders.length) : 0,
    paymentBreakdown: Array.from(paymentMap.values()).sort((a, b) => b.totalIdr - a.totalIdr),
    statusBreakdown: Array.from(statusMap.values()).sort((a, b) => b.count - a.count),
    tableBreakdown: Array.from(tableMap.values()).sort((a, b) => b.totalIdr - a.totalIdr).slice(0, 8),
    hourlySales: Array.from(hourlyMap.values()).sort((a, b) => a.hour - b.hour),
    topItems: Array.from(itemMap.values()).sort((a, b) => b.totalIdr - a.totalIdr).slice(0, 10),
    categoryBreakdown: Array.from(categoryMap.values()).sort((a, b) => b.totalIdr - a.totalIdr).slice(0, 10),
    cancelRate: orders.length ? Math.round((orders.filter((order) => order.status === "canceled").length / orders.length) * 100) : 0,
    paidRate: orders.length ? Math.round((paidOrders.length / orders.length) * 100) : 0,
    dailySales: enumerateDates(dateFrom, dateTo).map(
      (date) => dailyMap.get(date) ?? { date, paidSalesIdr: 0, invoiceCount: 0 },
    ),
  };
}

function createUnavailableRepository(): OrderRepository {
  const unavailable = async () => {
    throw new Error("Order features need Supabase env values.");
  };

  return {
    async getTableByToken() {
      return null;
    },
    async listDiningTables() {
      return [];
    },
    upsertDiningTable: unavailable,
    setDiningTableActive: unavailable,
    regenerateDiningTableQrToken: unavailable,
    createTableOrder: unavailable,
    createPayment: unavailable,
    async getLatestPaymentByOrderId() {
      return null;
    },
    async getPublicOrderStatus() {
      return null;
    },
    updatePaymentFromProvider: unavailable,
    async listActiveOrders() {
      return [];
    },
    async listOrders() {
      return [];
    },
    async getOrderById() {
      return null;
    },
    async getSalesReport(filters) {
      return buildEmptySalesReport(filters.period, filters.dateFrom, filters.dateTo);
    },
    async listAuditLogs() {
      return [];
    },
    updateOrderStatus: unavailable,
    updatePaymentStatus: unavailable,
  };
}

export function createOrderRepository(options: OrderRepositoryOptions = {}): OrderRepository {
  const getSupabase = async () =>
    options.useServiceRole ? createSupabaseServiceClient() : createSupabaseServerClient();

  return {
    async getTableByToken(token) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().getTableByToken(token);

      const { data, error } = await supabase
        .rpc("get_dining_table_by_qr_token", { p_qr_token: token })
        .maybeSingle();

      if (error) throw error;
      return data ? mapTable(data as DiningTableRow) : null;
    },

    async listDiningTables() {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().listDiningTables();

      const { data, error } = await supabase
        .from("dining_tables")
        .select("id, code, qr_token, label, is_active, created_at, updated_at")
        .order("code", { ascending: true });

      if (error || !data) return [];
      return (data as DiningTableRow[]).map(mapTable);
    },

    async upsertDiningTable(input) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().upsertDiningTable(input);

      const payload = {
        code: input.code.toUpperCase(),
        label: input.label,
        is_active: input.isActive,
      };

      const { error } = input.id
        ? await supabase.from("dining_tables").update(payload).eq("id", input.id)
        : await supabase.from("dining_tables").insert(payload);

      if (error) throw error;

      await supabase.from("audit_logs").insert({
        action: input.id ? "table_updated" : "table_created",
        entity_type: "dining_table",
        entity_id: input.id ?? null,
        actor_type: "admin",
        metadata: payload,
      });
    },

    async setDiningTableActive(id, isActive) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().setDiningTableActive(id, isActive);

      const { error } = await supabase
        .from("dining_tables")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("audit_logs").insert({
        action: "table_status_updated",
        entity_type: "dining_table",
        entity_id: id,
        actor_type: "admin",
        metadata: { is_active: isActive },
      });
    },

    async regenerateDiningTableQrToken(id) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().regenerateDiningTableQrToken(id);

      const { error } = await supabase
        .from("dining_tables")
        .update({ qr_token: randomBytes(16).toString("hex") })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("audit_logs").insert({
        action: "table_qr_regenerated",
        entity_type: "dining_table",
        entity_id: id,
        actor_type: "admin",
        metadata: {},
      });
    },

    async createTableOrder(input: CreateOrderInput): Promise<CreatedOrder> {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().createTableOrder(input);

      const { data, error } = await supabase.rpc("create_table_order", {
        p_table_token: input.tableToken,
        p_customer_name: input.customerName,
        p_notes: input.notes,
        p_payment_method: input.paymentMethod,
        p_payment_status: input.paymentStatus,
        p_items: input.items.map((item) => ({
          menu_entry_id: item.menuEntryId,
          item_name: item.itemName,
          variant_label: item.variantLabel,
          quantity: item.quantity,
          unit_price_idr: item.unitPriceIdr,
          notes: item.notes,
        })),
      });

      if (error) throw error;

      const created = Array.isArray(data) ? data[0] : data;
      return {
        id: created.order_id,
        orderNumber: created.order_number,
      };
    },

    async createPayment(input: CreatePaymentInput) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().createPayment(input);

      const { data, error } = await supabase
        .from("payments")
        .insert({
          order_id: input.orderId,
          provider: input.provider,
          provider_reference: input.providerReference,
          method: input.method,
          status: input.status,
          amount_idr: input.amountIdr,
          currency: input.currency ?? "IDR",
          checkout_url: input.checkoutUrl ?? null,
          qr_string: input.qrString ?? null,
          raw_payload: input.rawPayload ?? {},
          paid_at: input.paidAt ?? null,
        })
        .select("id, order_id, provider, provider_reference, method, status, amount_idr, currency, checkout_url, qr_string, raw_payload, paid_at, created_at, updated_at")
        .single();

      if (error) throw error;
      return mapPayment(data as PaymentRow);
    },

    async getLatestPaymentByOrderId(orderId) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().getLatestPaymentByOrderId(orderId);

      const { data, error } = await supabase
        .from("payments")
        .select("id, order_id, provider, provider_reference, method, status, amount_idr, currency, checkout_url, qr_string, raw_payload, paid_at, created_at, updated_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? mapPayment(data as PaymentRow) : null;
    },

    async getPublicOrderStatus(tableToken, orderId) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().getPublicOrderStatus(tableToken, orderId);

      const { data, error } = await supabase
        .from("orders")
        .select("id, session_id, order_number, customer_name, notes, cancel_reason, status, payment_status, payment_method, paid_at, subtotal_idr, business_date, completed_at, created_at, updated_at, table:dining_tables!inner(code, label, qr_token), items:order_items(id, item_name, variant_label, quantity, unit_price_idr, line_total_idr, notes)")
        .eq("id", orderId)
        .eq("dining_tables.qr_token", tableToken)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const order = mapOrder(data as unknown as OrderRow);
      const payment = await this.getLatestPaymentByOrderId(orderId);
      return { order, payment } satisfies PublicOrderStatus;
    },

    async updatePaymentFromProvider(input) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().updatePaymentFromProvider(input);

      const payload = {
        status: input.status,
        method: input.method,
        raw_payload: input.rawPayload,
        paid_at: input.paidAt ?? null,
      };
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .update(payload)
        .eq("provider", input.provider)
        .eq("provider_reference", input.providerReference)
        .select("id, order_id, amount_idr")
        .maybeSingle();

      if (paymentError) throw paymentError;
      if (!payment) return;

      const grossAmount = Number(input.rawPayload.gross_amount ?? payment.amount_idr);
      if (input.status === "paid" && Math.round(grossAmount) !== payment.amount_idr) {
        await supabase.from("audit_logs").insert({
          action: "midtrans_amount_mismatch",
          entity_type: "order",
          entity_id: payment.order_id,
          actor_type: "system",
          metadata: {
            provider_reference: input.providerReference,
            expected_amount_idr: payment.amount_idr,
            received_gross_amount: input.rawPayload.gross_amount,
          },
        });
        return;
      }

      const orderPayload = {
        payment_status: input.status,
        payment_method: input.method ?? "dynamic_qris",
        paid_at: input.status === "paid" ? input.paidAt ?? new Date().toISOString() : null,
      };

      const { error: orderError } = await supabase
        .from("orders")
        .update(orderPayload)
        .eq("id", payment.order_id);

      if (orderError) throw orderError;

      await supabase.from("audit_logs").insert({
        action: "midtrans_payment_updated",
        entity_type: "order",
        entity_id: payment.order_id,
        actor_type: "system",
        metadata: {
          provider_reference: input.providerReference,
          payment_status: input.status,
          payment_method: input.method,
        },
      });
    },

    async listActiveOrders() {
      return this.listOrders({ statuses: ["new", "preparing", "ready"] });
    },

    async listOrders(filters) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().listOrders(filters);

      let query = supabase
        .from("orders")
        .select("id, session_id, order_number, customer_name, notes, cancel_reason, status, payment_status, payment_method, paid_at, subtotal_idr, business_date, completed_at, created_at, updated_at, table:dining_tables(code, label), items:order_items(id, item_name, variant_label, quantity, unit_price_idr, line_total_idr, notes)");

      if (filters?.statuses?.length) {
        query = query.in("status", filters.statuses);
      }

      if (filters?.dateFrom) {
        query = query.gte("business_date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("business_date", filters.dateTo);
      }

      const { data, error } = await query
        .order("created_at", { ascending: filters?.statuses?.some((status) => status === "new") ?? false })
        .order("id", { referencedTable: "order_items", ascending: true })
        .limit(filters?.limit ?? 100);

      if (error || !data) return [];
      return (data as unknown as OrderRow[]).map(mapOrder);
    },

    async getOrderById(id) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().getOrderById(id);

      const { data, error } = await supabase
        .from("orders")
        .select("id, session_id, order_number, customer_name, notes, cancel_reason, status, payment_status, payment_method, paid_at, subtotal_idr, business_date, completed_at, created_at, updated_at, table:dining_tables(code, label), items:order_items(id, item_name, variant_label, quantity, unit_price_idr, line_total_idr, notes)")
        .eq("id", id)
        .order("id", { referencedTable: "order_items", ascending: true })
        .maybeSingle();

      if (error) throw error;
      return data ? mapOrder(data as unknown as OrderRow) : null;
    },

    async getSalesReport(filters) {
      const orders = await this.listOrders({
        statuses: ["completed", "canceled"],
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        limit: 1000,
      });

      return buildSalesReport(orders, filters.period, filters.dateFrom, filters.dateTo);
    },

    async listAuditLogs(limit = 100) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().listAuditLogs(limit);

      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, actor_type, actor_user_id, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return (data as AuditLogRow[]).map(mapAuditLog);
    },

    async updateOrderStatus(orderId, status, cancelReason = null) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().updateOrderStatus(orderId, status, cancelReason);

      const { error } = await supabase.rpc("set_order_status", {
        p_order_id: orderId,
        p_status: status,
        p_cancel_reason: cancelReason,
      });

      if (error) throw error;
    },

    async updatePaymentStatus(orderId, status, method = null) {
      const supabase = await getSupabase();
      if (!supabase) return createUnavailableRepository().updatePaymentStatus(orderId, status, method);

      const payload = {
        payment_status: status,
        payment_method: status === "paid" ? method ?? "cashier" : method,
        paid_at: status === "paid" ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from("orders")
        .update(payload)
        .eq("id", orderId);

      if (error) throw error;

      await supabase.from("audit_logs").insert({
        action: "payment_status_updated",
        entity_type: "order",
        entity_id: orderId,
        actor_type: "admin",
        metadata: { payment_status: status, payment_method: payload.payment_method },
      });
    },
  };
}

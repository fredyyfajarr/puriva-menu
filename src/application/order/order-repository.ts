import type {
  AuditLog,
  DiningTable,
  Order,
  OrderItemInput,
  OrderStatus,
  Payment,
  PaymentMethod,
  PublicOrderStatus,
  PaymentStatus,
  SalesReport,
  SalesReportPeriod,
} from "@/domain/order/types";

export type CreateOrderInput = {
  tableToken: string;
  customerName: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItemInput[];
};

export type CreatedOrder = {
  id: string;
  orderNumber: number;
};

export type CreatePaymentInput = {
  orderId: string;
  provider: "manual" | "midtrans";
  providerReference: string | null;
  method: string | null;
  status: PaymentStatus;
  amountIdr: number;
  currency?: string;
  checkoutUrl?: string | null;
  qrString?: string | null;
  rawPayload?: Record<string, unknown>;
  paidAt?: string | null;
};

export type OrderListFilters = {
  statuses?: OrderStatus[];
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type SalesReportFilters = {
  period: SalesReportPeriod;
  dateFrom: string;
  dateTo: string;
};

export type OrderRepository = {
  getTableByToken(token: string): Promise<DiningTable | null>;
  listDiningTables(): Promise<DiningTable[]>;
  upsertDiningTable(input: { id?: string; code: string; label: string; isActive: boolean }): Promise<void>;
  setDiningTableActive(id: string, isActive: boolean): Promise<void>;
  regenerateDiningTableQrToken(id: string): Promise<void>;
  createTableOrder(input: CreateOrderInput): Promise<CreatedOrder>;
  createPayment(input: CreatePaymentInput): Promise<Payment>;
  getLatestPaymentByOrderId(orderId: string): Promise<Payment | null>;
  getPublicOrderStatus(tableToken: string, orderId: string): Promise<PublicOrderStatus | null>;
  updatePaymentFromProvider(input: {
    provider: "midtrans";
    providerReference: string;
    status: PaymentStatus;
    method: string | null;
    rawPayload: Record<string, unknown>;
    paidAt?: string | null;
  }): Promise<void>;
  listActiveOrders(): Promise<Order[]>;
  listOrders(filters?: OrderListFilters): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getSalesReport(filters: SalesReportFilters): Promise<SalesReport>;
  listAuditLogs(limit?: number): Promise<AuditLog[]>;
  updateOrderStatus(orderId: string, status: OrderStatus, cancelReason?: string | null): Promise<void>;
  updatePaymentStatus(orderId: string, status: PaymentStatus, method?: string | null): Promise<void>;
};

export type DiningTable = {
  id: string;
  code: string;
  qrToken: string;
  label: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "canceled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "expired" | "refunded";
export type PaymentMethod = "cash" | "edc_bca" | "qris_static" | "dynamic_qris";
export type PaymentProvider = "manual" | "midtrans";

export type OrderItemInput = {
  menuEntryId: string;
  itemName: string;
  variantLabel: string | null;
  quantity: number;
  unitPriceIdr: number;
  notes: string | null;
};

export type OrderItem = {
  id: string;
  itemName: string;
  variantLabel: string | null;
  quantity: number;
  unitPriceIdr: number;
  lineTotalIdr: number;
  notes: string | null;
};

export type Order = {
  id: string;
  sessionId: string | null;
  orderNumber: number;
  tableCode: string;
  tableLabel: string;
  customerName: string | null;
  notes: string | null;
  cancelReason: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  subtotalIdr: number;
  businessDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type Payment = {
  id: string;
  orderId: string;
  provider: PaymentProvider | string;
  providerReference: string | null;
  method: string | null;
  status: PaymentStatus;
  amountIdr: number;
  currency: string;
  checkoutUrl: string | null;
  qrString: string | null;
  rawPayload: Record<string, unknown>;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicOrderStatus = {
  order: Order;
  payment: Payment | null;
};

export type SalesReportPeriod = "day" | "week" | "month" | "year";

export type SalesReport = {
  period: SalesReportPeriod;
  dateFrom: string;
  dateTo: string;
  grossSalesIdr: number;
  paidSalesIdr: number;
  invoiceCount: number;
  completedCount: number;
  canceledCount: number;
  averageOrderValueIdr: number;
  paymentBreakdown: Array<{
    method: string;
    totalIdr: number;
    count: number;
  }>;
  statusBreakdown: Array<{
    status: OrderStatus;
    totalIdr: number;
    count: number;
  }>;
  tableBreakdown: Array<{
    tableCode: string;
    tableLabel: string;
    totalIdr: number;
    count: number;
  }>;
  hourlySales: Array<{
    hour: number;
    paidSalesIdr: number;
    invoiceCount: number;
  }>;
  topItems: Array<{
    name: string;
    quantity: number;
    totalIdr: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    quantity: number;
    totalIdr: number;
  }>;
  cancelRate: number;
  paidRate: number;
  dailySales: Array<{
    date: string;
    paidSalesIdr: number;
    invoiceCount: number;
  }>;
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorType: string;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

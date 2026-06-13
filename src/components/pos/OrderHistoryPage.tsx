"use client";

import { Download, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatShortIdr } from "@/domain/menu/format";
import { buildInvoiceFilterQuery, type InvoiceFilterValues, type InvoicePeriod } from "@/domain/order/invoice-filters";
import type { Order, OrderStatus, PaymentStatus } from "@/domain/order/types";

const statusLabels: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  canceled: "Canceled",
};

const filterTabs: Array<{ label: string; href: string; isActive(status: string): boolean }> = [
  { label: "Completed", href: "/admin/invoices?status=completed", isActive: (status) => status === "completed" },
  { label: "Canceled", href: "/admin/invoices?status=canceled", isActive: (status) => status === "canceled" },
  { label: "All", href: "/admin/invoices?status=all", isActive: (status) => status === "all" },
];

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
  refunded: "Refunded",
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  edc_bca: "EDC BCA",
  qris_static: "QRIS Static",
  dynamic_qris: "Dynamic QRIS",
  cashier: "Cashier",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusTone(status: OrderStatus) {
  if (status === "completed") return "bg-[#e8f5eb] text-[#16824a]";
  if (status === "canceled") return "bg-[#fff0ed] text-[#b42318]";
  if (status === "ready") return "bg-[#e9f7ef] text-[#16824a]";
  if (status === "preparing") return "bg-[#e9f4ff] text-[#0969a2]";
  return "bg-[#fff0d6] text-[#9a5b00]";
}

function getPaymentTone(status: PaymentStatus) {
  if (status === "paid") return "bg-[#e8f5eb] text-[#16824a]";
  if (status === "pending") return "bg-[#e9f4ff] text-[#0969a2]";
  if (status === "failed" || status === "expired") return "bg-[#fff0ed] text-[#b42318]";
  if (status === "refunded") return "bg-[#f0f0ea] text-[#4a4f45]";
  return "bg-[#fff0d6] text-[#9a5b00]";
}

const periodTabs = [
  { period: "day" as const, label: "Daily" },
  { period: "week" as const, label: "Weekly" },
  { period: "month" as const, label: "Monthly" },
  { period: "year" as const, label: "Yearly" },
];

function buildInvoiceHref(status: string, filterValues: InvoiceFilterValues, overridePeriod?: InvoicePeriod) {
  return `/admin/invoices?${buildInvoiceFilterQuery(status, filterValues, overridePeriod)}`;
}

export function OrderHistoryPage({
  orders,
  activeFilter,
  filterValues,
}: {
  orders: Order[];
  activeFilter: string;
  filterValues: InvoiceFilterValues;
}) {
  const router = useRouter();
  const { period } = filterValues;
  const totalSales = orders
    .filter((order) => order.status === "completed" && order.paymentStatus === "paid")
    .reduce((total, order) => total + order.subtotalIdr, 0);
  const closingRows = [
    { key: "cash", label: "Cash" },
    { key: "edc_bca", label: "EDC BCA" },
    { key: "qris_static", label: "QRIS Static" },
    { key: "dynamic_qris", label: "Dynamic QRIS" },
  ].map((method) => ({
    ...method,
    total: orders
      .filter((order) => order.status === "completed" && order.paymentStatus === "paid" && order.paymentMethod === method.key)
      .reduce((total, order) => total + order.subtotalIdr, 0),
    count: orders.filter((order) => order.status === "completed" && order.paymentStatus === "paid" && order.paymentMethod === method.key).length,
  }));
  const unpaidCount = orders.filter((order) => order.status !== "canceled" && order.paymentStatus !== "paid").length;

  return (
    <div className="text-[#1f2f22]">
      <div className="w-full">
        <AdminPageHeader
          eyebrow="Operations"
          title="Invoice"
          description="Invoice harian, mingguan, bulanan, dan tahunan untuk closing dan print receipt."
          action={
            <a
              href={`/admin/invoices/export?${buildInvoiceFilterQuery(activeFilter, filterValues)}`}
              className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#173f2a] px-4 text-sm font-black text-white"
            >
              <Download size={16} />
              Export invoice
            </a>
          }
        />

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">Invoices</p>
            <p className="mt-2 text-3xl font-black text-[#173f2a]">{orders.length}</p>
          </div>
          <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">Completed sales</p>
            <p className="mt-2 text-3xl font-black text-[#1687a7]">{formatShortIdr(totalSales)}</p>
          </div>
          <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">Latest invoice</p>
            <p className="mt-2 text-3xl font-black text-[#173f2a]">
              {orders[0] ? `#${orders[0].orderNumber}` : "-"}
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">Closing summary</p>
              <h2 className="mt-1 text-xl font-black text-[#173f2a]">
                {filterValues.dateFrom} sampai {filterValues.dateTo}
              </h2>
            </div>
            <p className="text-sm font-bold text-[#65705e]">{unpaidCount} unpaid/pending invoice</p>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {closingRows.map((row) => (
              <div key={row.key} className="rounded-[8px] bg-[#fffaf0] p-3">
                <p className="text-xs font-black uppercase text-[#7a5d21]">{row.label}</p>
                <p className="mt-1 text-lg font-black text-[#173f2a]">{formatShortIdr(row.total)}</p>
                <p className="text-xs font-semibold text-[#65705e]">{row.count} invoice</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-4 flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <Link
              key={tab.href}
              href={buildInvoiceHref(tab.href.split("status=")[1] ?? activeFilter, filterValues)}
              className={`rounded-[8px] border px-4 py-2 text-sm font-black uppercase ${
                tab.isActive(activeFilter)
                  ? "border-[#173f2a] bg-[#173f2a] text-white"
                  : "border-[#d9c8a7] bg-white text-[#4a4f45]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="mb-5 grid gap-3 rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
          <div className="flex flex-wrap gap-2">
            {periodTabs.map((tab) => (
              <Link
                key={tab.period}
                href={buildInvoiceHref(activeFilter, filterValues, tab.period)}
                className={`rounded-[8px] border px-4 py-2 text-sm font-black uppercase ${
                  period === tab.period
                    ? "border-[#173f2a] bg-[#173f2a] text-white"
                    : "border-[#d9c8a7] bg-white text-[#4a4f45]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          {period === "day" ? (
            <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
              Tanggal
              <input
                type="date"
                defaultValue={filterValues.date}
                className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium"
                onChange={(event) => {
                  const next = { ...filterValues, date: event.currentTarget.value };
                  router.push(buildInvoiceHref(activeFilter, next));
                }}
              />
            </label>
          ) : null}
          {period === "week" ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
                Dari
                <input
                  type="date"
                  defaultValue={filterValues.weekFrom}
                  className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium"
                  onChange={(event) => {
                    const next = { ...filterValues, weekFrom: event.currentTarget.value };
                    router.push(buildInvoiceHref(activeFilter, next));
                  }}
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
                Sampai
                <input
                  type="date"
                  defaultValue={filterValues.weekTo}
                  className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium"
                  onChange={(event) => {
                    const next = { ...filterValues, weekTo: event.currentTarget.value };
                    router.push(buildInvoiceHref(activeFilter, next));
                  }}
                />
              </label>
            </div>
          ) : null}
          {period === "month" ? (
            <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
              Bulan
              <input
                type="month"
                defaultValue={filterValues.month}
                className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium"
                onChange={(event) => {
                  const next = { ...filterValues, month: event.currentTarget.value };
                  router.push(buildInvoiceHref(activeFilter, next));
                }}
              />
            </label>
          ) : null}
          {period === "year" ? (
            <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
              Tahun
              <input
                type="number"
                min="2020"
                max="2100"
                defaultValue={filterValues.year}
                className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium"
                onChange={(event) => {
                  const next = { ...filterValues, year: event.currentTarget.value };
                  router.push(buildInvoiceHref(activeFilter, next));
                }}
              />
            </label>
          ) : null}
        </div>

        {orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#9a7a35]">
                      <ReceiptText size={15} />
                      Invoice #{order.orderNumber}
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#173f2a]">{order.tableLabel}</h2>
                    <p className="mt-1 text-sm text-[#65705e]">{formatDateTime(order.createdAt)}</p>
                    <Link
                      href={`/admin/invoices/${order.id}`}
                      className="mt-3 inline-flex h-9 items-center rounded-[8px] bg-[#173f2a] px-3 text-xs font-black uppercase text-white"
                    >
                      Detail invoice
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getStatusTone(order.status)}`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getPaymentTone(order.paymentStatus)}`}>
                      {paymentLabels[order.paymentStatus]}
                    </span>
                    <span className="text-xl font-black text-[#1687a7]">{formatShortIdr(order.subtotalIdr)}</span>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-[#f3e5cd] rounded-[8px] border border-[#f3e5cd]">
                  {order.items.map((item) => (
                    <div key={item.id} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-black uppercase text-[#233224]">
                          {item.quantity}x {item.itemName}
                        </p>
                        {item.variantLabel ? <p className="mt-1 break-words text-xs font-bold text-[#7a5d21]">{item.variantLabel}</p> : null}
                        {item.notes ? <p className="mt-1 break-words text-xs text-[#65705e]">{item.notes}</p> : null}
                      </div>
                      <p className="text-sm font-black text-[#1687a7]">{formatShortIdr(item.lineTotalIdr)}</p>
                    </div>
                  ))}
                </div>

                {order.notes || order.customerName || order.paymentMethod || order.paidAt ? (
                  <div className="mt-3 rounded-[8px] bg-[#fffaf0] p-3 text-sm leading-6 text-[#65705e]">
                    {order.customerName ? <p className="font-bold text-[#233224]">{order.customerName}</p> : null}
                    {order.notes ? <p>{order.notes}</p> : null}
                    {order.cancelReason ? <p className="font-bold text-[#b42318]">Cancel reason: {order.cancelReason}</p> : null}
                    {order.paymentMethod || order.paidAt ? (
                      <p className="mt-1 font-bold text-[#233224]">
                        Payment: {order.paymentMethod ? paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod : "-"} {order.paidAt ? `- ${formatDateTime(order.paidAt)}` : ""}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black text-[#173f2a]">Belum ada invoice</h2>
            <p className="mt-2 text-sm text-[#65705e]">Order yang completed akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

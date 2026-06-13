"use client";

import { AlertTriangle, Clock, CreditCard, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { updateOrderStatusAction, updatePaymentStatusAction } from "@/app/admin/order-management/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatShortIdr } from "@/domain/menu/format";
import type { Order, OrderStatus, PaymentStatus } from "@/domain/order/types";

const statusLabels: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  canceled: "Canceled",
};

const nextActions: Record<OrderStatus, OrderStatus[]> = {
  new: ["preparing", "canceled"],
  preparing: ["ready", "canceled"],
  ready: ["completed", "canceled"],
  completed: [],
  canceled: [],
};

const boardTabs: Array<{ status: OrderStatus; label: string }> = [
  { status: "new", label: "New" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusTone(status: OrderStatus) {
  if (status === "new") return "bg-[#fff0d6] text-[#9a5b00]";
  if (status === "preparing") return "bg-[#e9f4ff] text-[#0969a2]";
  if (status === "ready") return "bg-[#e8f5eb] text-[#16824a]";
  if (status === "canceled") return "bg-[#fff0ed] text-[#b42318]";
  return "bg-[#f0f0ea] text-[#4a4f45]";
}

function getPaymentTone(status: PaymentStatus) {
  if (status === "paid") return "bg-[#e8f5eb] text-[#16824a]";
  if (status === "pending") return "bg-[#e9f4ff] text-[#0969a2]";
  if (status === "failed" || status === "expired") return "bg-[#fff0ed] text-[#b42318]";
  if (status === "refunded") return "bg-[#f0f0ea] text-[#4a4f45]";
  return "bg-[#fff0d6] text-[#9a5b00]";
}

function getPaymentDisplay(order: Order) {
  if (order.paymentStatus === "paid") return "Paid";
  if (order.paymentMethod === "dynamic_qris" && order.paymentStatus === "pending") return "Waiting QRIS";
  if (order.paymentStatus === "unpaid") return "Pay at cashier";
  return paymentLabels[order.paymentStatus];
}

function getPaymentInstruction(order: Order) {
  if (order.paymentMethod === "dynamic_qris") {
    return "Dynamic QRIS belum settled. Tunggu webhook Midtrans atau cek manual sebelum close order.";
  }

  const method = order.paymentMethod ? paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod : "Cashier";
  return `Customer pilih ${method}. Konfirmasi pembayaran di kasir, lalu tekan Mark paid.`;
}

function OrderCard({ order }: { order: Order }) {
  const needsPaymentAttention = order.paymentStatus !== "paid";

  return (
    <article className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#9a7a35]">#{order.orderNumber}</p>
          <h2 className="mt-1 text-2xl font-black text-[#173f2a]">{order.tableLabel}</h2>
          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#65705e]">
            <Clock size={14} />
            {formatTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getStatusTone(order.status)}`}>
            {statusLabels[order.status]}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getPaymentTone(order.paymentStatus)}`}>
            {getPaymentDisplay(order)}
          </span>
          {order.paymentMethod ? (
            <span className="rounded-full bg-[#fffaf0] px-3 py-1 text-xs font-black uppercase text-[#7a5d21]">
              {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 divide-y divide-[#f3e5cd] rounded-[8px] border border-[#f3e5cd]">
        {order.items.map((item) => (
          <div key={item.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-black uppercase text-[#233224]">
                  {item.quantity}x {item.itemName}
                </p>
                {item.variantLabel ? <p className="mt-1 break-words text-xs font-bold text-[#7a5d21]">{item.variantLabel}</p> : null}
                {item.notes ? <p className="mt-1 break-words text-xs text-[#65705e]">{item.notes}</p> : null}
              </div>
              <p className="shrink-0 text-sm font-black text-[#1687a7]">{formatShortIdr(item.lineTotalIdr)}</p>
            </div>
          </div>
        ))}
      </div>

      {order.notes ? (
        <div className="mt-3 rounded-[8px] bg-[#fffaf0] p-3 text-sm leading-6 text-[#65705e]">{order.notes}</div>
      ) : null}

      {needsPaymentAttention ? (
        <div className="mt-3 rounded-[8px] border border-[#f0c36d] bg-[#fff8e8] p-3 text-xs font-bold leading-5 text-[#8a5a00]">
          <p className="flex items-center gap-2 font-black uppercase">
            <AlertTriangle size={15} />
            Payment belum paid
          </p>
          <p className="mt-1">
            {getPaymentInstruction(order)}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-lg font-black text-[#1687a7]">{formatShortIdr(order.subtotalIdr)}</p>
        <div className="flex flex-wrap justify-end gap-2">
          {order.paymentStatus !== "paid" ? (
            <form action={updatePaymentStatusAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="paymentStatus" value="paid" />
              <select
                name="method"
                defaultValue={order.paymentMethod ?? "cashier"}
                className="mr-2 h-9 rounded-[8px] border border-[#d9c8a7] bg-white px-2 text-xs font-bold text-[#4a4f45]"
              >
                <option value="cash">Cash</option>
                <option value="edc_bca">EDC BCA</option>
                <option value="qris_static">QRIS Static</option>
                <option value="cashier">Cashier</option>
              </select>
              <button className="h-9 rounded-[8px] bg-[#16824a] px-3 text-xs font-black uppercase text-white">
                <CreditCard className="mr-1 inline" size={14} />
                Mark paid
              </button>
            </form>
          ) : null}
          {nextActions[order.status].map((status) => (
            <form key={status} action={updateOrderStatusAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="status" value={status} />
              {status === "canceled" ? (
                <input
                  name="cancelReason"
                  required
                  placeholder="Alasan cancel"
                  className="mr-2 h-9 w-36 rounded-[8px] border border-[#efc5bd] px-3 text-xs font-bold text-[#4a4f45]"
                />
              ) : null}
              <button
                className={`h-9 rounded-[8px] px-3 text-xs font-black uppercase ${
                  status === "canceled" ? "border border-[#efc5bd] bg-white text-[#b42318]" : "bg-[#173f2a] text-white"
                }`}
              >
                {statusLabels[status]}
              </button>
            </form>
          ))}
        </div>
      </div>
    </article>
  );
}

export function PosBoard({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("new");
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLastSyncedAt(new Date());
      router.refresh();
    }, 10000);

    return () => window.clearInterval(timer);
  }, [router]);

  const counts = useMemo(
    () =>
      boardTabs.reduce<Record<OrderStatus, number>>(
        (values, tab) => ({
          ...values,
          [tab.status]: orders.filter((order) => order.status === tab.status).length,
        }),
        { new: 0, preparing: 0, ready: 0, completed: 0, canceled: 0 },
      ),
    [orders],
  );
  const visibleOrders = orders.filter((order) => order.status === activeStatus);

  return (
    <div className="text-[#1f2f22]">
      <div className="w-full">
        <AdminPageHeader
          eyebrow="Operations"
          title="Order Management"
          description={`Auto refresh tiap 10 detik. Last sync ${formatTime(lastSyncedAt.toISOString())}.`}
          action={
            <button
              type="button"
              onClick={() => {
                setLastSyncedAt(new Date());
                router.refresh();
              }}
              className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#173f2a] px-4 text-sm font-black text-white"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          }
        />

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {boardTabs.map((tab) => (
            <button
              key={tab.status}
              type="button"
              onClick={() => setActiveStatus(tab.status)}
              className={`flex items-center justify-between rounded-[8px] border px-4 py-3 text-left transition ${
                activeStatus === tab.status
                  ? "border-[#173f2a] bg-[#173f2a] text-white"
                  : "border-[#e5d7bd] bg-white text-[#4a4f45]"
              }`}
            >
              <span className="text-sm font-black uppercase">{tab.label}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-black">{counts[tab.status]}</span>
            </button>
          ))}
        </div>

        {visibleOrders.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {visibleOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black text-[#173f2a]">Belum ada order {statusLabels[activeStatus]}</h2>
            <p className="mt-2 text-sm text-[#65705e]">Order dari QR meja akan masuk ke tab New lebih dulu.</p>
          </div>
        )}
      </div>
    </div>
  );
}

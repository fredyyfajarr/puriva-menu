"use client";

import { ArrowLeft, ChefHat, Download, Printer } from "lucide-react";
import Link from "next/link";

import { formatShortIdr } from "@/domain/menu/format";
import type { Order, Payment, PaymentStatus } from "@/domain/order/types";

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
  refunded: "Refunded",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function printMode(mode: "receipt" | "kitchen") {
  document.body.dataset.printMode = mode;
  window.print();
  window.setTimeout(() => {
    delete document.body.dataset.printMode;
  }, 300);
}

function PrintLineItems({ order, kitchen = false }: { order: Order; kitchen?: boolean }) {
  return (
    <div className="divide-y divide-[#c9decf]">
      {order.items.map((item) => (
        <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2">
          <div>
            <p className="font-black">
              {item.quantity}x {item.itemName}
            </p>
            {item.variantLabel ? <p className="text-sm">+ {item.variantLabel}</p> : null}
            {item.notes ? <p className="text-sm font-bold">Note: {item.notes}</p> : null}
          </div>
          {!kitchen ? <p className="font-black">{formatShortIdr(item.lineTotalIdr)}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function InvoiceDetailPage({ order, payment }: { order: Order; payment?: Payment | null }) {
  return (
    <div className="min-w-0 space-y-5 text-[#1f2f22]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-sm font-bold text-[#65705e]">
            <ArrowLeft size={16} />
            Back to history
          </Link>
          <h1 className="mt-2 text-3xl font-black text-[#173f2a]">Invoice #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-[#65705e]">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => printMode("receipt")}
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#173f2a] px-4 text-sm font-black text-white"
          >
            <Printer size={16} />
            Print receipt
          </button>
          <button
            type="button"
            onClick={() => printMode("kitchen")}
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#c9decf] bg-white px-4 text-sm font-black text-[#173f2a]"
          >
            <ChefHat size={16} />
            Kitchen ticket
          </button>
          <a
            href={`/admin/invoices/${order.id}/pdf`}
            className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#2f8f5b] px-4 text-sm font-black text-white"
          >
            <Download size={16} />
            PDF
          </a>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[8px] border border-[#dbe8dd] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black text-[#173f2a]">Items</h2>
          <div className="mt-4 divide-y divide-[#dbe8dd] rounded-[8px] border border-[#dbe8dd]">
            {order.items.map((item) => (
              <div key={item.id} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                  <p className="font-black uppercase text-[#233224]">
                    {item.quantity}x {item.itemName}
                  </p>
                  {item.variantLabel ? <p className="mt-1 text-sm font-bold text-[#2f6b46]">{item.variantLabel}</p> : null}
                  {item.notes ? <p className="mt-1 text-sm text-[#65705e]">{item.notes}</p> : null}
                </div>
                <p className="font-black text-[#2f8f5b]">{formatShortIdr(item.lineTotalIdr)}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[8px] border border-[#dbe8dd] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black text-[#173f2a]">Summary</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-[#65705e]">Table</span>
              <span className="font-black text-[#233224]">{order.tableLabel}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-[#65705e]">Status</span>
              <span className="font-black uppercase text-[#233224]">{order.status}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-[#65705e]">Payment</span>
              <span className="font-black uppercase text-[#233224]">{paymentLabels[order.paymentStatus]}</span>
            </p>
            {order.customerName ? (
              <p className="flex justify-between gap-3">
                <span className="text-[#65705e]">Customer</span>
                <span className="font-black text-[#233224]">{order.customerName}</span>
              </p>
            ) : null}
            {order.notes ? <p className="rounded-[8px] bg-[#f6fbf7] p-3 text-[#65705e]">{order.notes}</p> : null}
            {order.cancelReason ? <p className="rounded-[8px] bg-[#fff0ed] p-3 font-bold text-[#b42318]">Cancel: {order.cancelReason}</p> : null}
            {payment ? (
              <div className="rounded-[8px] border border-[#dbe8dd] bg-[#f6fbf7] p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#2f6b46]">Payment provider</p>
                <p className="mt-1 font-black text-[#233224]">{payment.provider}</p>
                {payment.providerReference ? <p className="break-words text-xs text-[#65705e]">{payment.providerReference}</p> : null}
                {payment.checkoutUrl ? (
                  <a href={payment.checkoutUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-black uppercase text-[#2f8f5b]">
                    Open QR image
                  </a>
                ) : null}
              </div>
            ) : null}
            <div className="border-t border-[#dbe8dd] pt-3">
              <p className="flex justify-between gap-3 text-lg">
                <span className="font-black text-[#173f2a]">Total</span>
                <span className="font-black text-[#2f8f5b]">{formatShortIdr(order.subtotalIdr)}</span>
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="receipt-print-area" aria-hidden="true">
        <div className="print-paper">
          <h1>Puriva Live</h1>
          <p>Invoice #{order.orderNumber}</p>
          <p>{order.tableLabel} - {formatDateTime(order.createdAt)}</p>
          <PrintLineItems order={order} />
          <div className="print-total">
            <span>Total</span>
            <strong>{formatShortIdr(order.subtotalIdr)}</strong>
          </div>
          <p>Payment: {paymentLabels[order.paymentStatus]}</p>
          <p>Thank you.</p>
        </div>
      </section>

      <section className="kitchen-print-area" aria-hidden="true">
        <div className="print-paper">
          <h1>Kitchen Ticket</h1>
          <p>#{order.orderNumber} - {order.tableLabel}</p>
          <p>{formatDateTime(order.createdAt)}</p>
          <PrintLineItems order={order} kitchen />
          {order.notes ? <p className="print-note">Order note: {order.notes}</p> : null}
        </div>
      </section>
    </div>
  );
}

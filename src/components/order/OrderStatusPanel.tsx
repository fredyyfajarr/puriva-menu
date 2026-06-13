"use client";

import { CheckCircle2, Clock3, CreditCard, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { formatShortIdr } from "@/domain/menu/format";
import type { PublicOrderStatus } from "@/domain/order/types";

type OrderStatusPanelProps = {
  initialStatus: PublicOrderStatus | null;
  orderId: string | null;
  tableToken: string;
};

const orderStatusLabels = {
  new: "Order diterima",
  preparing: "Lagi disiapkan",
  ready: "Siap diantar",
  completed: "Selesai",
  canceled: "Dibatalkan",
};

const paymentStatusLabels = {
  unpaid: "Belum dibayar",
  pending: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  failed: "Gagal",
  expired: "Expired",
  refunded: "Refunded",
};

function getStatusIcon(status?: string) {
  if (status === "paid" || status === "completed") return <CheckCircle2 size={18} />;
  if (status === "failed" || status === "expired" || status === "canceled") return <XCircle size={18} />;
  return <Clock3 size={18} />;
}

export function OrderStatusPanel({ initialStatus, orderId, tableToken }: OrderStatusPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!orderId) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status?tableToken=${encodeURIComponent(tableToken)}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (payload.ok) {
        setStatus(payload.data);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [orderId, tableToken]);

  useEffect(() => {
    if (!orderId) return;
    const interval = window.setInterval(refresh, 6000);
    return () => window.clearInterval(interval);
  }, [orderId, refresh]);

  if (!status) {
    return (
      <div className="mt-4 rounded-[8px] border border-[#f0ddbc] bg-[#fffaf0] p-4 text-sm font-bold text-[#7a5d21]">
        Status live belum tersedia. Order tetap sudah masuk ke kasir.
      </div>
    );
  }

  const { order, payment } = status;
  const qrImageUrl = payment?.checkoutUrl;

  return (
    <div className="mt-5 space-y-3 text-left">
      <div className="grid gap-2 rounded-[8px] border border-[#f0ddbc] bg-[#fffaf0] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">Live status</p>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#d9c8a7] bg-white px-3 text-xs font-black text-[#173f2a]"
          >
            {isRefreshing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[8px] bg-white p-3">
            <p className="flex items-center gap-2 text-sm font-black text-[#173f2a]">
              {getStatusIcon(order.status)}
              {orderStatusLabels[order.status]}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#65705e]">{order.tableLabel}</p>
          </div>
          <div className="rounded-[8px] bg-white p-3">
            <p className="flex items-center gap-2 text-sm font-black text-[#173f2a]">
              <CreditCard size={18} />
              {paymentStatusLabels[order.paymentStatus]}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#65705e]">{formatShortIdr(order.subtotalIdr)}</p>
          </div>
        </div>
      </div>

      {qrImageUrl ? (
        <div className="rounded-[8px] border border-[#173f2a] bg-white p-4 text-center">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">Dynamic QRIS</p>
          <div
            aria-label="Dynamic QRIS payment code"
            className="mx-auto mt-3 h-64 w-64 rounded-[8px] border border-[#f0ddbc] bg-contain bg-center bg-no-repeat p-2"
            style={{ backgroundImage: `url("${qrImageUrl}")` }}
          />
          <p className="mt-3 text-xs font-semibold leading-5 text-[#65705e]">
            Scan QR ini dengan aplikasi pembayaran. Status akan update otomatis setelah webhook diterima.
          </p>
          <a
            href={qrImageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-[8px] border border-[#d9c8a7] px-3 text-xs font-black uppercase text-[#173f2a]"
          >
            Buka QR image
          </a>
        </div>
      ) : order.paymentMethod === "dynamic_qris" ? (
        <div className="rounded-[8px] border border-[#f0ddbc] bg-[#fffaf0] p-4 text-sm font-bold text-[#7a5d21]">
          Dynamic QRIS dipilih, tapi QR belum tersedia. Pastikan Midtrans sandbox env sudah diisi.
        </div>
      ) : null}
    </div>
  );
}

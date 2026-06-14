import Link from "next/link";

import { OrderStatusPanel } from "@/components/order/OrderStatusPanel";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";

const paymentLabels: Record<string, string> = {
  cash: "Cash di kasir",
  edc_bca: "EDC BCA di kasir",
  qris_static: "QRIS static di kasir",
  dynamic_qris: "Dynamic QRIS",
};

async function getInitialStatus(tableToken: string, orderId?: string) {
  if (!orderId) return null;

  try {
    return await createOrderRepository({ useServiceRole: true }).getPublicOrderStatus(tableToken, orderId);
  } catch {
    return null;
  }
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ order?: string; orderId?: string; payment?: string }>;
}) {
  const { code } = await params;
  const { order, orderId, payment } = await searchParams;
  const paymentLabel = payment ? paymentLabels[payment] : null;
  const status = await getInitialStatus(code, orderId);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6fbf7] px-5 text-[#233224]">
      <div className="w-full max-w-md rounded-[8px] border border-[#dbe8dd] bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2f6b46]">Order masuk</p>
        <h1 className="mt-2 text-3xl font-black text-[#173f2a]">
          {order ? `#${order}` : "Thank you"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#687460]">
          Pesanan kamu sudah masuk ke kasir.
        </p>
        {paymentLabel ? (
          <div className="mt-4 rounded-[8px] border border-[#dbe8dd] bg-[#f6fbf7] p-3 text-sm font-bold text-[#173f2a]">
            Payment: {paymentLabel}
          </div>
        ) : null}
        <OrderStatusPanel initialStatus={status} orderId={orderId ?? null} tableToken={code} />
        <Link
          href={`/table/${encodeURIComponent(code)}`}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-[#173f2a] px-5 text-sm font-black uppercase text-white"
        >
          Order lagi
        </Link>
      </div>
      <footer className="mt-6 text-center text-xs font-bold text-[#65705e]">
        Copyright 2026. Made with love by fredyyfajarr.
      </footer>
    </main>
  );
}

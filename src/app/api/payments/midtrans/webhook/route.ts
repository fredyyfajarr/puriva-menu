import { NextRequest, NextResponse } from "next/server";

import {
  mapMidtransStatus,
  type MidtransNotificationPayload,
  verifyMidtransSignature,
} from "@/infrastructure/midtrans/client";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as MidtransNotificationPayload;

  if (!verifyMidtransSignature(payload)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  if (!payload.order_id) {
    return NextResponse.json({ ok: false, error: "missing_order_id" }, { status: 400 });
  }

  await createOrderRepository({ useServiceRole: true }).updatePaymentFromProvider({
    provider: "midtrans",
    providerReference: payload.order_id,
    status: mapMidtransStatus(payload.transaction_status, payload.fraud_status),
    method: payload.payment_type ?? "qris",
    rawPayload: payload,
    paidAt: payload.settlement_time ?? payload.transaction_time ?? null,
  });

  return NextResponse.json({ ok: true });
}

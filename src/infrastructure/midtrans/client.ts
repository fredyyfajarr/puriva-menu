import { createHash } from "crypto";

import type { Order, PaymentStatus } from "@/domain/order/types";

import { getMidtransEnv } from "./env";

type MidtransAction = {
  name: string;
  method: string;
  url: string;
};

export type MidtransChargeResponse = {
  status_code: string;
  status_message: string;
  transaction_id?: string;
  order_id: string;
  gross_amount: string;
  currency?: string;
  payment_type?: string;
  transaction_status?: string;
  fraud_status?: string;
  actions?: MidtransAction[];
  qr_string?: string;
  acquirer?: string;
};

export type MidtransNotificationPayload = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_time?: string;
  settlement_time?: string;
  transaction_id?: string;
  [key: string]: unknown;
};

function getAuthorizationHeader(serverKey: string) {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

export function buildMidtransOrderId(order: Order) {
  return `PURIVA-${order.orderNumber}-${order.id.slice(0, 8)}`;
}

export function getMidtransQrImageUrl(response: MidtransChargeResponse) {
  return response.actions?.find((action) => action.name === "generate-qr-code")?.url ?? null;
}

export function mapMidtransStatus(status?: string, fraudStatus?: string): PaymentStatus {
  if ((status === "settlement" || status === "capture") && (!fraudStatus || fraudStatus === "accept")) return "paid";
  if (status === "pending") return "pending";
  if (status === "expire") return "expired";
  if (status === "refund" || status === "partial_refund") return "refunded";
  return "failed";
}

export function verifyMidtransSignature(payload: MidtransNotificationPayload) {
  const { serverKey } = getMidtransEnv();

  if (!serverKey || !payload.order_id || !payload.status_code || !payload.gross_amount || !payload.signature_key) {
    return false;
  }

  const expected = createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`)
    .digest("hex");

  return expected === payload.signature_key;
}

export async function createMidtransQrisCharge(order: Order) {
  const env = getMidtransEnv();

  if (!env.serverKey) {
    return null;
  }

  const midtransOrderId = buildMidtransOrderId(order);
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: getAuthorizationHeader(env.serverKey),
  };
  const notificationUrl =
    env.notificationUrl ?? (env.appUrl ? `${env.appUrl}/api/payments/midtrans/webhook` : null);

  if (notificationUrl && !notificationUrl.includes("localhost")) {
    headers["X-Override-Notification"] = notificationUrl;
  }

  const response = await fetch(`${env.apiBaseUrl}/v2/charge`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.subtotalIdr,
      },
      item_details: order.items.map((item) => ({
        id: item.id,
        price: item.unitPriceIdr,
        quantity: item.quantity,
        name: [item.itemName, item.variantLabel].filter(Boolean).join(" + ").slice(0, 50),
      })),
      customer_details: {
        first_name: order.customerName ?? order.tableLabel,
      },
    }),
  });

  const payload = (await response.json()) as MidtransChargeResponse;

  if (!response.ok) {
    throw new Error(payload.status_message || "Failed to create Midtrans QRIS charge.");
  }

  return payload;
}

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { OrderItemInput, PaymentMethod, PaymentStatus } from "@/domain/order/types";
import { createMidtransQrisCharge, getMidtransQrImageUrl, mapMidtransStatus } from "@/infrastructure/midtrans/client";
import { createMenuRepository } from "@/infrastructure/supabase/menu-repository";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";

const itemSchema = z.object({
  menuEntryId: z.string().uuid(),
  itemName: z.string().trim().min(1),
  variantLabel: z.string().trim().nullable(),
  quantity: z.number().int().min(1).max(99),
  unitPriceIdr: z.number().int().min(0),
  notes: z.string().trim().nullable(),
});

const createOrderSchema = z.object({
  tableToken: z.string().trim().min(16).max(80),
  customerName: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["cash", "edc_bca", "qris_static", "dynamic_qris"]),
  itemsJson: z.string().trim().min(2),
});

const orderSubmitHits = new Map<string, number[]>();

function assertSubmitRateLimit(tableToken: string) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxHits = 8;
  const hits = (orderSubmitHits.get(tableToken) ?? []).filter((hit) => now - hit < windowMs);

  if (hits.length >= maxHits) {
    throw new Error("Terlalu banyak submit order. Coba lagi sebentar.");
  }

  hits.push(now);
  orderSubmitHits.set(tableToken, hits);
}

function getInitialPaymentStatus(method: PaymentMethod): PaymentStatus {
  return method === "dynamic_qris" ? "pending" : "unpaid";
}

async function assertItemsAvailable(items: OrderItemInput[]) {
  const catalog = await createMenuRepository().getCatalog();
  const entries = new Map(catalog.sections.flatMap((section) => section.entries.map((entry) => [entry.id, entry])));

  for (const item of items) {
    const entry = entries.get(item.menuEntryId);

    if (!entry) {
      throw new Error("Menu item is not available.");
    }

    if (item.variantLabel && entry.mixAvailability[item.variantLabel] === false) {
      throw new Error("Menu variant is sold out.");
    }
  }
}

export async function createTableOrderAction(formData: FormData) {
  const parsed = createOrderSchema.parse({
    tableToken: formData.get("tableToken"),
    customerName: formData.get("customerName") ?? "",
    notes: formData.get("notes") ?? "",
    paymentMethod: formData.get("paymentMethod") ?? "cash",
    itemsJson: formData.get("itemsJson"),
  });

  const items = z.array(itemSchema).min(1).max(50).parse(JSON.parse(parsed.itemsJson)) as OrderItemInput[];
  let created;

  assertSubmitRateLimit(parsed.tableToken);

  try {
    await assertItemsAvailable(items);

    created = await createOrderRepository().createTableOrder({
      tableToken: parsed.tableToken,
      customerName: parsed.customerName || null,
      notes: parsed.notes || null,
      paymentMethod: parsed.paymentMethod,
      paymentStatus: getInitialPaymentStatus(parsed.paymentMethod),
      items,
    });
  } catch {
    redirect(`/table/${encodeURIComponent(parsed.tableToken)}?error=stock`);
  }

  if (parsed.paymentMethod === "dynamic_qris") {
    try {
      const serviceRepository = createOrderRepository({ useServiceRole: true });
      const order = await serviceRepository.getOrderById(created.id);

      if (order) {
        const charge = await createMidtransQrisCharge(order);

        if (charge) {
          await serviceRepository.createPayment({
            orderId: order.id,
            provider: "midtrans",
            providerReference: charge.order_id,
            method: charge.payment_type ?? "qris",
            status: mapMidtransStatus(charge.transaction_status, charge.fraud_status),
            amountIdr: order.subtotalIdr,
            checkoutUrl: getMidtransQrImageUrl(charge),
            qrString: charge.qr_string ?? null,
            rawPayload: charge as unknown as Record<string, unknown>,
          });
        }
      }
    } catch {
      try {
        const serviceRepository = createOrderRepository({ useServiceRole: true });
        const order = await serviceRepository.getOrderById(created.id);

        if (order) {
          await serviceRepository.createPayment({
            orderId: order.id,
            provider: "midtrans",
            providerReference: `PURIVA-${order.orderNumber}-${order.id.slice(0, 8)}`,
            method: "qris",
            status: "pending",
            amountIdr: order.subtotalIdr,
            rawPayload: { error: "midtrans_charge_failed" },
          });
        }
      } catch {
        // Keep the customer flow moving. Missing service-role grants are fixed by the Supabase migration.
      }
    }
  }

  redirect(
    `/table/${encodeURIComponent(parsed.tableToken)}/success?order=${created.orderNumber}&orderId=${created.id}&payment=${parsed.paymentMethod}`,
  );
}

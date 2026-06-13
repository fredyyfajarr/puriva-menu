"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { OrderStatus, PaymentStatus } from "@/domain/order/types";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { requireStaffAccess } from "@/infrastructure/supabase/server";

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["new", "preparing", "ready", "completed", "canceled"]),
  cancelReason: z.string().trim().max(240).optional(),
});

const updatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "expired", "refunded"]),
  method: z.string().trim().max(40).optional(),
});

export async function updateOrderStatusAction(formData: FormData) {
  await requireStaffAccess();

  const parsed = updateStatusSchema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    cancelReason: formData.get("cancelReason") ?? "",
  });

  if (parsed.status === "canceled" && !parsed.cancelReason) {
    throw new Error("Cancel reason wajib diisi.");
  }

  await createOrderRepository().updateOrderStatus(
    parsed.orderId,
    parsed.status as OrderStatus,
    parsed.status === "canceled" ? parsed.cancelReason ?? null : null,
  );
  revalidatePath("/admin/order-management");
  revalidatePath("/admin/invoices");
}

export async function updatePaymentStatusAction(formData: FormData) {
  await requireStaffAccess();

  const parsed = updatePaymentSchema.parse({
    orderId: formData.get("orderId"),
    paymentStatus: formData.get("paymentStatus"),
    method: formData.get("method") ?? "",
  });

  await createOrderRepository().updatePaymentStatus(
    parsed.orderId,
    parsed.paymentStatus as PaymentStatus,
    parsed.method || null,
  );
  revalidatePath("/admin/order-management");
  revalidatePath("/admin/invoices");
}

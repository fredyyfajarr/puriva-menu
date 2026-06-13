"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { requireAdmin } from "@/infrastructure/supabase/server";

const tableSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  code: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .regex(/^[a-zA-Z0-9-]+$/, "Code hanya boleh huruf, angka, dan dash."),
  label: z.string().trim().min(2).max(40),
  isActive: z.string().optional(),
});

export async function upsertDiningTableAction(formData: FormData) {
  await requireAdmin();

  const parsed = tableSchema.parse({
    id: formData.get("id") ?? "",
    code: formData.get("code"),
    label: formData.get("label"),
    isActive: formData.get("isActive") ?? "",
  });

  await createOrderRepository().upsertDiningTable({
    id: parsed.id || undefined,
    code: parsed.code,
    label: parsed.label,
    isActive: parsed.isActive === "on",
  });

  revalidatePath("/admin/tables");
}

export async function toggleDiningTableAction(formData: FormData) {
  await requireAdmin();

  const id = z.string().uuid().parse(formData.get("id"));
  const isActive = formData.get("isActive") !== "true";

  await createOrderRepository().setDiningTableActive(id, isActive);
  revalidatePath("/admin/tables");
}

export async function regenerateDiningTableQrTokenAction(formData: FormData) {
  await requireAdmin();

  const id = z.string().uuid().parse(formData.get("id"));

  await createOrderRepository().regenerateDiningTableQrToken(id);
  revalidatePath("/admin/tables");
}

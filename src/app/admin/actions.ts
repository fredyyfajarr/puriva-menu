"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createMenuRepository } from "@/infrastructure/supabase/menu-repository";
import { createSupabaseServerClient, requireAdmin } from "@/infrastructure/supabase/server";

const entrySchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  sectionSlug: z.enum(["cut-fruits", "blended-juice", "pre-made-juice", "cold-pressed-juice"]),
  name: z.string().trim().min(2),
  ingredients: z.string().trim().min(2),
  baseName: z.string().trim().optional(),
  benefit: z.string().trim().optional(),
  mixNotes: z.string().trim().optional(),
  categorySlug: z.enum(["roots-detox", "vitamin-c-booster", "hydration"]).optional().or(z.literal("")),
  accentColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  priceIdr: z.coerce.number().int().positive().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isAvailable: z.string().optional(),
});

function parseIngredients(raw: string) {
  return raw
    .split(/\r?\n|,/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
}

function parseMixNotes(raw?: string) {
  if (!raw) return {};

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((notes, line) => {
      const [mix, ...descriptionParts] = line.split(":");
      const description = descriptionParts.join(":").trim();

      if (mix?.trim() && description) {
        notes[mix.trim()] = description;
      }

      return notes;
    }, {});
}

export async function upsertMenuEntryAction(formData: FormData) {
  await requireAdmin();

  const parsed = entrySchema.parse({
    id: formData.get("id") ?? "",
    sectionSlug: formData.get("sectionSlug"),
    name: formData.get("name"),
    ingredients: formData.get("ingredients"),
    baseName: formData.get("baseName") ?? "",
    benefit: formData.get("benefit") ?? "",
    mixNotes: formData.get("mixNotes") ?? "",
    categorySlug: formData.get("categorySlug") ?? "",
    accentColor: formData.get("accentColor") ?? "#1f7a4d",
    priceIdr: formData.get("priceIdr") ?? "",
    sortOrder: formData.get("sortOrder") ?? "999",
    isAvailable: formData.get("isAvailable") ?? "",
  });

  const isColdPressed = parsed.sectionSlug === "cold-pressed-juice";

  await createMenuRepository().upsertEntry({
    id: parsed.id || undefined,
    sectionSlug: parsed.sectionSlug,
    name: parsed.name,
    ingredients: parseIngredients(parsed.ingredients),
    baseName: isColdPressed ? parsed.name : parsed.baseName || null,
    benefit: parsed.benefit || null,
    mixNotes: isColdPressed ? parseMixNotes(parsed.mixNotes) : {},
    categorySlug: isColdPressed ? parsed.categorySlug || null : null,
    accentColor: parsed.accentColor,
    priceIdr: parsed.priceIdr === "" ? null : parsed.priceIdr ?? null,
    sortOrder: parsed.sortOrder,
    isAvailable: parsed.isAvailable === "on",
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleMenuEntryAction(formData: FormData) {
  await requireAdmin();

  const id = z.string().uuid().parse(formData.get("id"));
  const isAvailable = formData.get("isAvailable") !== "true";

  await createMenuRepository().setEntryAvailability(id, isAvailable);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteMenuEntryAction(formData: FormData) {
  await requireAdmin();

  const id = z.string().uuid().parse(formData.get("id"));

  await createMenuRepository().deleteEntry(id);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/admin/login?error=supabase-env-missing");
  }

  const email = z.string().email().parse(formData.get("email"));
  const password = z.string().min(8).parse(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

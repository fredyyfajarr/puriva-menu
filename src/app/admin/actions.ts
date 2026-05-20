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
  mixImageUrls: z.string().trim().optional(),
  categorySlug: z.enum(["roots-detox", "vitamin-c-booster", "hydration"]).optional().or(z.literal("")),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
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

function parseKeyValueLines(raw?: string) {
  if (!raw) return {};

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((values, line) => {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();

      if (key?.trim() && value) {
        values[key.trim()] = value;
      }

      return values;
    }, {});
}

async function uploadMixImages(formData: FormData, rawMixImageUrls: string | undefined, entryName: string) {
  const imageUrls = parseKeyValueLines(rawMixImageUrls);

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("mixImageFile:") || !(value instanceof File)) continue;

    const mix = key.replace("mixImageFile:", "").trim();
    const uploadedUrl = await uploadMenuImage(value, `${entryName}-${mix}`);

    if (mix && uploadedUrl) {
      imageUrls[mix] = uploadedUrl;
    }
  }

  return imageUrls;
}

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadMenuImage(file: File | null, entryName: string) {
  if (!file || file.size === 0) return null;

  const { supabase } = await requireAdmin();
  const extension = file.name.split(".").pop() ?? "jpg";
  const safeName = slugifyFileName(entryName);
  const path = `${safeName}-${Date.now()}.${extension}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from("menu-images").upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
  return data.publicUrl;
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
    mixImageUrls: formData.get("mixImageUrls") ?? "",
    categorySlug: formData.get("categorySlug") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    accentColor: formData.get("accentColor") ?? "#1f7a4d",
    priceIdr: formData.get("priceIdr") ?? "",
    sortOrder: formData.get("sortOrder") ?? "999",
    isAvailable: formData.get("isAvailable") ?? "",
  });

  const isColdPressed = parsed.sectionSlug === "cold-pressed-juice";
  const uploadedImageUrl = await uploadMenuImage(formData.get("imageFile") as File | null, parsed.name);
  const mixImageUrls = isColdPressed
    ? await uploadMixImages(formData, parsed.mixImageUrls, parsed.name)
    : {};

  await createMenuRepository().upsertEntry({
    id: parsed.id || undefined,
    sectionSlug: parsed.sectionSlug,
    name: parsed.name,
    ingredients: parseIngredients(parsed.ingredients),
    baseName: isColdPressed ? parsed.name : parsed.baseName || null,
    benefit: parsed.benefit || null,
    mixNotes: isColdPressed ? parseKeyValueLines(parsed.mixNotes) : {},
    mixImageUrls,
    categorySlug: isColdPressed ? parsed.categorySlug || null : null,
    imageUrl: uploadedImageUrl ?? (parsed.imageUrl || null),
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

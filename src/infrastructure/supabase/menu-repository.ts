import type { MenuEntryInput, MenuRepository } from "@/application/menu/menu-repository";
import { seedCatalog } from "@/domain/menu/seed-catalog";
import type { MenuCatalog, MenuEntry, MenuSection, MenuSectionSlug } from "@/domain/menu/types";

import { createSupabaseServerClient } from "./server";

type SectionRow = {
  id: string;
  slug: MenuSectionSlug;
  title: string;
  description: string | null;
  display_mode: MenuSection["displayMode"];
  price_idr: number | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
  entries?: EntryRow[];
};

type EntryRow = {
  id: string;
  section_id: string;
  name: string;
  ingredients: string[];
  base_name: string | null;
  accent_color: string | null;
  price_idr: number | null;
  is_available: boolean;
  sort_order: number;
};

function fromRows(rows: SectionRow[]): MenuCatalog {
  const sections = rows
    .sort((left, right) => left.sort_order - right.sort_order)
    .map<MenuSection>((section) => ({
      id: section.id,
      slug: section.slug,
      title: section.title,
      description: section.description ?? "",
      displayMode: section.display_mode,
      priceIdr: section.price_idr,
      sortOrder: section.sort_order,
      isActive: section.is_active,
      entries: (section.entries ?? [])
        .sort((left, right) => left.sort_order - right.sort_order)
        .map<MenuEntry>((entry) => ({
          id: entry.id,
          sectionSlug: section.slug,
          name: entry.name,
          ingredients: entry.ingredients ?? [],
          baseName: entry.base_name,
          accentColor: entry.accent_color ?? "#1f7a4d",
          priceIdr: entry.price_idr,
          isAvailable: entry.is_available,
          sortOrder: entry.sort_order,
        })),
    }));

  return {
    brandName: "Puriva Live",
    tagline: "Cold pressed juice menu",
    currency: "IDR",
    updatedAt: rows[0]?.updated_at ?? new Date().toISOString(),
    sections,
  };
}

function createPreviewRepository(): MenuRepository {
  const mutationUnavailable = async () => {
    throw new Error("Admin mutations need Supabase env values.");
  };

  return {
    async getCatalog() {
      return seedCatalog;
    },
    async getAdminCatalog() {
      return seedCatalog;
    },
    upsertEntry: mutationUnavailable,
    setEntryAvailability: mutationUnavailable,
    deleteEntry: mutationUnavailable,
    async listSections() {
      return seedCatalog.sections;
    },
  };
}

export function createMenuRepository(): MenuRepository {
  return {
    async getCatalog() {
      const supabase = await createSupabaseServerClient();
      if (!supabase) return createPreviewRepository().getCatalog();

      const { data, error } = await supabase
        .from("menu_sections")
        .select("id, slug, title, description, display_mode, price_idr, sort_order, is_active, updated_at, entries:menu_entries(id, section_id, name, ingredients, base_name, accent_color, price_idr, is_available, sort_order)")
        .eq("is_active", true)
        .eq("menu_entries.is_available", true)
        .order("sort_order", { ascending: true })
        .order("sort_order", { referencedTable: "menu_entries", ascending: true });

      if (error || !data) return createPreviewRepository().getCatalog();
      return fromRows(data as SectionRow[]);
    },
    async getAdminCatalog() {
      const supabase = await createSupabaseServerClient();
      if (!supabase) return createPreviewRepository().getAdminCatalog();

      const { data, error } = await supabase
        .from("menu_sections")
        .select("id, slug, title, description, display_mode, price_idr, sort_order, is_active, updated_at, entries:menu_entries(id, section_id, name, ingredients, base_name, accent_color, price_idr, is_available, sort_order)")
        .order("sort_order", { ascending: true })
        .order("sort_order", { referencedTable: "menu_entries", ascending: true });

      if (error || !data) return createPreviewRepository().getAdminCatalog();
      return fromRows(data as SectionRow[]);
    },
    async listSections() {
      const supabase = await createSupabaseServerClient();
      if (!supabase) return createPreviewRepository().listSections();

      const { data, error } = await supabase
        .from("menu_sections")
        .select("id, slug, title, description, display_mode, price_idr, sort_order, is_active, updated_at")
        .order("sort_order", { ascending: true });

      if (error || !data) return createPreviewRepository().listSections();
      return fromRows(data as SectionRow[]).sections;
    },
    async upsertEntry(input: MenuEntryInput) {
      const supabase = await createSupabaseServerClient();
      if (!supabase) return createPreviewRepository().upsertEntry(input);

      const { data: section, error: sectionError } = await supabase
        .from("menu_sections")
        .select("id")
        .eq("slug", input.sectionSlug)
        .single();

      if (sectionError || !section) throw new Error("Menu section not found.");

      const payload = {
        section_id: section.id,
        name: input.name,
        ingredients: input.ingredients,
        base_name: input.baseName,
        accent_color: input.accentColor,
        price_idr: input.priceIdr,
        is_available: input.isAvailable ?? true,
        sort_order: input.sortOrder ?? 999,
      };

      if (input.id) {
        const { error } = await supabase.from("menu_entries").update(payload).eq("id", input.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("menu_entries").insert(payload);
      if (error) throw error;
    },
    async setEntryAvailability(id: string, isAvailable: boolean) {
      const supabase = await createSupabaseServerClient();
      if (!supabase) return createPreviewRepository().setEntryAvailability(id, isAvailable);

      const { error } = await supabase
        .from("menu_entries")
        .update({ is_available: isAvailable })
        .eq("id", id);

      if (error) throw error;
    },
    async deleteEntry(id: string) {
      const supabase = await createSupabaseServerClient();
      if (!supabase) return createPreviewRepository().deleteEntry(id);

      const { error } = await supabase.from("menu_entries").delete().eq("id", id);
      if (error) throw error;
    },
  };
}

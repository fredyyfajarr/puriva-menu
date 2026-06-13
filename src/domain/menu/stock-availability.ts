import type { MenuCatalog, MenuEntry, MenuSection } from "./types";

export function normalizeIngredientName(value: string) {
  return value.trim().toLowerCase();
}

export function getColdPressedSoldOutIngredients(entries: MenuEntry[]) {
  return new Set(
    entries
      .filter((entry) => entry.sectionSlug === "cold-pressed-juice" && !entry.isAvailable)
      .map((entry) => normalizeIngredientName(entry.baseName ?? entry.name))
      .filter(Boolean),
  );
}

export function isMixBlockedBySoldOutIngredient(mix: string, soldOutIngredients: Set<string>) {
  if (normalizeIngredientName(mix) === "original") return false;
  return soldOutIngredients.has(normalizeIngredientName(mix));
}

export function isEntryBlockedBySoldOutIngredient(entry: MenuEntry, soldOutIngredients: Set<string>) {
  if (entry.sectionSlug === "cold-pressed-juice" || entry.sectionSlug === "pre-made-juice") return false;
  return entry.ingredients.some((ingredient) => soldOutIngredients.has(normalizeIngredientName(ingredient)));
}

function applySectionStockRules(section: MenuSection, soldOutIngredients: Set<string>): MenuSection {
  if (section.slug !== "cold-pressed-juice") {
    return {
      ...section,
      entries: section.entries.filter((entry) => entry.isAvailable && !isEntryBlockedBySoldOutIngredient(entry, soldOutIngredients)),
    };
  }

  return {
    ...section,
    entries: section.entries
      .filter((entry) => entry.isAvailable)
      .map((entry) => ({
        ...entry,
        mixAvailability: entry.ingredients.reduce<Record<string, boolean>>((values, mix) => {
          values[mix] = entry.mixAvailability[mix] !== false && !isMixBlockedBySoldOutIngredient(mix, soldOutIngredients);
          return values;
        }, { ...entry.mixAvailability }),
      })),
  };
}

export function applyPublicStockRules(catalog: MenuCatalog): MenuCatalog {
  const soldOutIngredients = getColdPressedSoldOutIngredients(catalog.sections.flatMap((section) => section.entries));

  return {
    ...catalog,
    sections: catalog.sections.map((section) => applySectionStockRules(section, soldOutIngredients)),
  };
}

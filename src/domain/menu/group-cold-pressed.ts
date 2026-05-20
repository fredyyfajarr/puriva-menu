import type { ColdPressedGroup, MenuEntry } from "./types";
import { coldPressedCategoryOptions, getColdPressedCategory } from "./cold-pressed-categories";

export function groupColdPressedByBase(entries: MenuEntry[]): ColdPressedGroup[] {
  const grouped = entries
    .filter((entry) => entry.isAvailable)
    .reduce<Map<string, ColdPressedGroup>>((groups, entry) => {
      const baseName = entry.baseName ?? entry.ingredients[0] ?? entry.name;
      const existing = groups.get(baseName);
      const category = getColdPressedCategory(entry.categorySlug);
      const mixes = getMixes(entry);

      if (existing) {
        existing.mixes.push(...mixes);
        existing.mixNotes = { ...existing.mixNotes, ...entry.mixNotes };
        existing.mixImageUrls = { ...existing.mixImageUrls, ...entry.mixImageUrls };
        existing.sortOrder = Math.min(existing.sortOrder, entry.sortOrder);
        return groups;
      }

      groups.set(baseName, {
        baseName,
        benefit: entry.benefit,
        categorySlug: category.slug,
        accentColor: entry.accentColor,
        imageUrl: entry.imageUrl,
        priceIdr: entry.priceIdr,
        mixes,
        mixNotes: entry.mixNotes,
        mixImageUrls: entry.mixImageUrls,
        sortOrder: entry.sortOrder,
      });

      return groups;
    }, new Map());

  return [...grouped.values()].map((group) => ({
    ...group,
    mixes: [...new Set(group.mixes)].sort((left, right) => Number(right === "Original") - Number(left === "Original")),
  })).sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getMixLabel(entry: MenuEntry) {
  if (!entry.baseName) return entry.name;

  const mixes = entry.ingredients.filter(
    (ingredient) => ingredient.toLowerCase() !== entry.baseName?.toLowerCase(),
  );

  return mixes.length > 0 ? mixes.join(" + ") : "Pure";
}

export function getMixes(entry: MenuEntry) {
  const baseName = entry.baseName ?? entry.name;
  const isBaseLevelEntry = entry.name.toLowerCase() === baseName.toLowerCase();

  if (isBaseLevelEntry) {
    return entry.ingredients.length > 0 ? entry.ingredients : ["Pure"];
  }

  return [getMixLabel(entry)];
}

export function groupColdPressedByCategory(entries: MenuEntry[]) {
  const groups = groupColdPressedByBase(entries);

  return coldPressedCategoryOptions
    .map((category) => ({
      ...category,
      groups: groups.filter((group) => group.categorySlug === category.slug),
    }))
    .filter((category) => category.groups.length > 0);
}

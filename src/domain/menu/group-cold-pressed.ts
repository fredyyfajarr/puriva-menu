import type { ColdPressedGroup, MenuEntry } from "./types";

export function groupColdPressedByBase(entries: MenuEntry[]): ColdPressedGroup[] {
  const grouped = entries
    .filter((entry) => entry.isAvailable)
    .reduce<Map<string, ColdPressedGroup>>((groups, entry) => {
      const baseName = entry.baseName ?? entry.ingredients[0] ?? entry.name;
      const existing = groups.get(baseName);

      if (existing) {
        existing.options.push(entry);
        return groups;
      }

      groups.set(baseName, {
        baseName,
        accentColor: entry.accentColor,
        priceIdr: entry.priceIdr,
        options: [entry],
      });

      return groups;
    }, new Map());

  return [...grouped.values()].map((group) => ({
    ...group,
    options: group.options.sort((left, right) => left.sortOrder - right.sortOrder),
  }));
}

export function getMixLabel(entry: MenuEntry) {
  if (!entry.baseName) return entry.name;

  const mixes = entry.ingredients.filter(
    (ingredient) => ingredient.toLowerCase() !== entry.baseName?.toLowerCase(),
  );

  return mixes.length > 0 ? mixes.join(" + ") : "Pure";
}

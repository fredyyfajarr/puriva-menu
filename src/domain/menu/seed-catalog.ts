import type { MenuCatalog, MenuEntry, MenuSection, MenuSectionSlug } from "./types";

const sectionMeta: Omit<MenuSection, "entries">[] = [
  {
    id: "cut-fruits",
    slug: "cut-fruits",
    title: "Cut Fruits",
    description: "Fresh sliced fruit cups, ready to grab.",
    displayMode: "compact-list",
    priceIdr: 15000,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: "blended-juice",
    slug: "blended-juice",
    title: "Blended Juice",
    description: "Classic blended fruit juice, served cold.",
    displayMode: "compact-list",
    priceIdr: 25000,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: "pre-made-juice",
    slug: "pre-made-juice",
    title: "Pre-made Juice",
    description: "Bottled blends made fresh for the day.",
    displayMode: "recipe-cards",
    priceIdr: 30000,
    sortOrder: 30,
    isActive: true,
  },
  {
    id: "cold-pressed-juice",
    slug: "cold-pressed-juice",
    title: "Cold-Pressed Juice",
    description: "Pick a base, then choose a clean fruit mix.",
    displayMode: "grouped-by-base",
    priceIdr: 35000,
    sortOrder: 40,
    isActive: true,
  },
];

function entry(
  sectionSlug: MenuSectionSlug,
  name: string,
  ingredients: string[],
  index: number,
  options?: Partial<MenuEntry>,
): MenuEntry {
  return {
    id: `${sectionSlug}-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    sectionSlug,
    name,
    ingredients,
    baseName: null,
    accentColor: "#1f7a4d",
    priceIdr: null,
    isAvailable: true,
    sortOrder: index,
    ...options,
  };
}

const cutFruits = [
  "Sunkist",
  "Melon",
  "Pineapple",
  "Dragon Fruit",
  "Watermelon",
  "Mango",
  "Green Apple",
].map((name, index) =>
  entry("cut-fruits", name, [name], index + 1, {
    accentColor: ["#f97316", "#65a30d", "#eab308", "#db2777", "#ef4444", "#f59e0b", "#16a34a"][index],
    priceIdr: 15000,
  }),
);

const blendedJuices = [
  "Avocado",
  "Sunkist",
  "Melon",
  "Pineapple",
  "Guava",
  "Dragon Fruit",
  "Watermelon",
  "Strawberry",
  "Mango",
].map((name, index) =>
  entry("blended-juice", name, [name], index + 1, {
    accentColor: ["#3f6212", "#f97316", "#65a30d", "#eab308", "#db2777", "#be185d", "#ef4444", "#e11d48", "#f59e0b"][index],
    priceIdr: 25000,
  }),
);

const preMade = [
  ["Splash Orange", ["Sunkist", "Carrot", "Green Apple"]],
  ["Pink Heart", ["Guava", "Jicama", "Watermelon"]],
  ["Yellow Glow", ["Pineapple", "Sunkist", "Green Apple", "Lemon"]],
  ["Berry Happy", ["Strawberry", "Sunkist", "Watermelon"]],
  ["Red Love", ["Watermelon", "Pineapple", "Sunkist"]],
  ["Maroon Beet", ["Beet", "Green Apple", "Sunkist"]],
  ["Green Forest", ["Cucumber", "Pineapple", "Celery", "Green Apple", "Kale"]],
].map(([name, ingredients], index) =>
  entry("pre-made-juice", name as string, ingredients as string[], index + 1, {
    accentColor: ["#f97316", "#db2777", "#eab308", "#e11d48", "#dc2626", "#7f1d1d", "#15803d"][index],
    priceIdr: 30000,
  }),
);

const coldPressedSource: Array<[string, string[], string]> = [
  ["Carrot", ["Beet", "Celery", "Green Apple"], "#f97316"],
  ["Celery", ["Pure", "Melon", "Pineapple", "Green Apple"], "#16a34a"],
  ["Sunkist", ["Pure", "Carrot", "Pineapple", "Strawberry"], "#ea580c"],
  ["Melon", ["Pure", "Sunkist", "Green Apple", "Strawberry"], "#65a30d"],
  ["Pineapple", ["Melon", "Sunkist", "Green Apple", "Strawberry"], "#d97706"],
  ["Watermelon", ["Sunkist", "Strawberry", "Pineapple"], "#ef4444"],
  ["Guava", ["Beet", "Sunkist", "Pineapple", "Green Apple", "Watermelon"], "#db2777"],
  ["Beet", ["Carrot", "Pineapple", "Green Apple"], "#be123c"],
];

const coldPressed = coldPressedSource.flatMap(([baseName, mixes, accentColor], baseIndex) =>
  mixes.map((mixName, mixIndex) => {
    const isPure = mixName === "Pure";
    const ingredients = isPure ? [baseName] : [baseName, mixName];
    return entry("cold-pressed-juice", ingredients.join(" + "), ingredients, baseIndex * 10 + mixIndex + 1, {
      baseName,
      accentColor,
      priceIdr: 35000,
    });
  }),
);

export const seedCatalog: MenuCatalog = {
  brandName: "Puriva Live",
  tagline: "Cold pressed juice menu",
  currency: "IDR",
  updatedAt: new Date("2026-05-19T00:00:00.000Z").toISOString(),
  sections: sectionMeta.map((section) => ({
    ...section,
    entries: [...cutFruits, ...blendedJuices, ...preMade, ...coldPressed]
      .filter((item) => item.sectionSlug === section.slug)
      .sort((left, right) => left.sortOrder - right.sortOrder),
  })),
};

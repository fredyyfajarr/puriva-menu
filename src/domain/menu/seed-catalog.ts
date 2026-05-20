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
    description: "100% murni. Tanpa air, tanpa gula, tanpa sirup.",
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
    benefit: null,
    mixNotes: {},
    categorySlug: null,
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
  ["Splash Orange", ["Sunkist", "Carrot", "Green Apple"], "Vitamin C dan beta-carotene untuk bantu jaga imun dan kulit tetap fresh."],
  ["Pink Heart", ["Guava", "Jicama", "Watermelon"], "Rasa ringan, juicy, dan tinggi antioksidan untuk refresh harian."],
  ["Yellow Glow", ["Pineapple", "Sunkist", "Green Apple", "Lemon"], "Bright citrus blend untuk rasa segar dan bantu pencernaan."],
  ["Berry Happy", ["Strawberry", "Sunkist", "Watermelon"], "Manis-asam segar dengan antioksidan dari berry dan hidrasi watermelon."],
  ["Red Love", ["Watermelon", "Pineapple", "Sunkist"], "Hydrating, tropical, dan ringan untuk booster energi siang hari."],
  ["Maroon Beet", ["Beet", "Green Apple", "Sunkist"], "Earthy fresh untuk stamina, sirkulasi, dan rasa yang tetap balanced."],
  ["Green Forest", ["Cucumber", "Pineapple", "Celery", "Green Apple", "Kale"], "Green blend untuk detox ringan, mineral, dan rasa clean."],
].map(([name, ingredients, benefit], index) =>
  entry("pre-made-juice", name as string, ingredients as string[], index + 1, {
    accentColor: ["#f97316", "#db2777", "#eab308", "#e11d48", "#dc2626", "#7f1d1d", "#15803d"][index],
    benefit: benefit as string,
    priceIdr: 30000,
  }),
);

const coldPressedSource: Array<[string, string[], Record<string, string>, string, string, MenuEntry["categorySlug"]]> = [
  [
    "Carrot",
    ["Green Apple", "Celery", "Sunkist"],
    {
      "Green Apple": "Rasa lebih crisp dan bantu tambah antioksidan.",
      Celery: "Lebih clean dan ringan untuk detox harian.",
      Sunkist: "Vitamin C bikin carrot lebih bright dan fresh.",
    },
    "#f97316",
    "Mata dan kulit",
    "roots-detox",
  ],
  [
    "Beet",
    ["Green Apple", "Carrot", "Pineapple"],
    {
      "Green Apple": "Menyeimbangkan earthy beet dengan rasa segar.",
      Carrot: "Dobel roots untuk stamina dan beta-carotene.",
      Pineapple: "Rasa tropical dan bantu pencernaan.",
    },
    "#be123c",
    "Stamina",
    "roots-detox",
  ],
  [
    "Celery",
    ["Green Apple", "Pineapple", "Melon"],
    {
      "Green Apple": "Lebih crisp, segar, dan mudah diminum.",
      Pineapple: "Manis-asam tropical untuk bantu pencernaan.",
      Melon: "Lebih ringan dan hydrating.",
    },
    "#16a34a",
    "Deep detox",
    "roots-detox",
  ],
  [
    "Sunkist",
    ["Green Apple", "Pineapple", "Strawberry", "Watermelon", "Melon", "Beet"],
    {
      "Green Apple": "Crisp dan fresh untuk balance rasa citrus.",
      Pineapple: "Tropical vitamin C dengan rasa lebih juicy.",
      Strawberry: "Antioksidan berry dan rasa manis-asam.",
      Watermelon: "Lebih hydrating dan ringan.",
      Melon: "Rasa soft, fresh, dan tidak terlalu asam.",
      Beet: "Tambahan earthy untuk stamina dan warna lebih bold.",
    },
    "#ea580c",
    "Imun kuat",
    "vitamin-c-booster",
  ],
  [
    "Pineapple",
    ["Melon", "Green Apple", "Guava", "Sunkist", "Strawberry"],
    {
      Melon: "Lebih smooth dan hydrating.",
      "Green Apple": "Crisp acidity untuk rasa lebih segar.",
      Guava: "Antioksidan dan body rasa lebih tebal.",
      Sunkist: "Extra citrus untuk vitamin C booster.",
      Strawberry: "Berry note yang manis-asam.",
    },
    "#d97706",
    "Pencernaan",
    "vitamin-c-booster",
  ],
  [
    "Guava",
    ["Green Apple", "Sunkist", "Strawberry", "Beet", "Pineapple"],
    {
      "Green Apple": "Lebih fresh dan ringan.",
      Sunkist: "Tambahan citrus untuk imun.",
      Strawberry: "Antioksidan berry dan aroma lebih fruity.",
      Beet: "Lebih bold untuk stamina.",
      Pineapple: "Tropical dan bantu pencernaan.",
    },
    "#db2777",
    "Antioksidan",
    "vitamin-c-booster",
  ],
  [
    "Watermelon",
    ["Sunkist", "Strawberry", "Green Apple", "Pineapple"],
    {
      Sunkist: "Citrus fresh untuk rasa lebih lively.",
      Strawberry: "Berry note dan antioksidan.",
      "Green Apple": "Crisp dan balance manis watermelon.",
      Pineapple: "Tropical, juicy, dan segar.",
    },
    "#ef4444",
    "Segar",
    "hydration",
  ],
  [
    "Melon",
    ["Sunkist", "Strawberry", "Green Apple", "Watermelon"],
    {
      Sunkist: "Citrus lift untuk rasa lebih fresh.",
      Strawberry: "Manis-asam ringan dengan antioksidan.",
      "Green Apple": "Crisp dan clean.",
      Watermelon: "Extra hydrating dan juicy.",
    },
    "#65a30d",
    "Hidrasi ringan",
    "hydration",
  ],
];

const coldPressed = coldPressedSource.map(([baseName, mixes, mixNotes, accentColor, benefit, categorySlug], baseIndex) =>
  entry("cold-pressed-juice", baseName, mixes, baseIndex + 1, {
    baseName,
    benefit,
    mixNotes,
    categorySlug,
    accentColor,
    priceIdr: 35000,
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

export type MenuSectionSlug =
  | "cut-fruits"
  | "blended-juice"
  | "pre-made-juice"
  | "cold-pressed-juice";

export type MenuDisplayMode = "compact-list" | "recipe-cards" | "grouped-by-base";
export type ColdPressedCategorySlug = "roots-detox" | "vitamin-c-booster" | "hydration";

export type MenuEntry = {
  id: string;
  sectionSlug: MenuSectionSlug;
  name: string;
  ingredients: string[];
  baseName: string | null;
  benefit: string | null;
  mixNotes: Record<string, string>;
  mixImageUrls: Record<string, string>;
  categorySlug: ColdPressedCategorySlug | null;
  imageUrl: string | null;
  accentColor: string;
  priceIdr: number | null;
  isAvailable: boolean;
  sortOrder: number;
};

export type MenuSection = {
  id: string;
  slug: MenuSectionSlug;
  title: string;
  description: string;
  displayMode: MenuDisplayMode;
  priceIdr: number | null;
  sortOrder: number;
  isActive: boolean;
  entries: MenuEntry[];
};

export type MenuCatalog = {
  brandName: string;
  tagline: string;
  currency: "IDR";
  updatedAt: string;
  sections: MenuSection[];
};

export type ColdPressedGroup = {
  baseName: string;
  benefit: string | null;
  categorySlug: ColdPressedCategorySlug;
  accentColor: string;
  imageUrl: string | null;
  priceIdr: number | null;
  mixes: string[];
  mixNotes: Record<string, string>;
  mixImageUrls: Record<string, string>;
  sortOrder: number;
};

export type ColdPressedCategory = {
  slug: ColdPressedCategorySlug;
  title: string;
  subtitle: string;
  icon: "leaf" | "zap" | "droplets";
  accentColor: string;
  groups: ColdPressedGroup[];
};

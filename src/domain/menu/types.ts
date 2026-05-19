export type MenuSectionSlug =
  | "cut-fruits"
  | "blended-juice"
  | "pre-made-juice"
  | "cold-pressed-juice";

export type MenuDisplayMode = "compact-list" | "recipe-cards" | "grouped-by-base";

export type MenuEntry = {
  id: string;
  sectionSlug: MenuSectionSlug;
  name: string;
  ingredients: string[];
  baseName: string | null;
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
  accentColor: string;
  priceIdr: number | null;
  options: MenuEntry[];
};

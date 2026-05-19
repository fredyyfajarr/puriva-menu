import type { ColdPressedCategorySlug } from "./types";

export const coldPressedCategoryOptions: Array<{
  slug: ColdPressedCategorySlug;
  title: string;
  subtitle: string;
  icon: "leaf" | "zap" | "droplets";
  accentColor: string;
}> = [
  {
    slug: "roots-detox",
    title: "Roots & Detox",
    subtitle: "Sayur dan roots untuk rasa clean, earthy, dan ringan.",
    icon: "leaf",
    accentColor: "#16824a",
  },
  {
    slug: "vitamin-c-booster",
    title: "Vitamin C Booster",
    subtitle: "Base buah bright untuk imun, antioksidan, dan rasa segar.",
    icon: "zap",
    accentColor: "#e56b1f",
  },
  {
    slug: "hydration",
    title: "Hydration",
    subtitle: "Series juicy dan ringan untuk hidrasi harian.",
    icon: "droplets",
    accentColor: "#1687a7",
  },
];

export function getColdPressedCategory(slug: ColdPressedCategorySlug | null | undefined) {
  return coldPressedCategoryOptions.find((category) => category.slug === slug) ?? coldPressedCategoryOptions[0];
}

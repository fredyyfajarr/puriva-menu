import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyPublicStockRules,
  getColdPressedSoldOutIngredients,
  isEntryBlockedBySoldOutIngredient,
  isMixBlockedBySoldOutIngredient,
} from "./stock-availability.ts";
import type { MenuCatalog, MenuEntry, MenuSection, MenuSectionSlug } from "./types.ts";

function entry(sectionSlug: MenuSectionSlug, name: string, ingredients: string[], isAvailable = true): MenuEntry {
  return {
    id: `${sectionSlug}-${name.toLowerCase().replaceAll(/\s+/g, "-")}`,
    sectionSlug,
    name,
    ingredients,
    baseName: sectionSlug === "cold-pressed-juice" ? name : null,
    benefit: null,
    mixNotes: {},
    mixImageUrls: {},
    mixAvailability: {},
    categorySlug: sectionSlug === "cold-pressed-juice" ? "vitamin-c-booster" : null,
    imageUrl: null,
    accentColor: "#173f2a",
    priceIdr: null,
    isAvailable,
    sortOrder: 1,
  };
}

function section(slug: MenuSectionSlug, entries: MenuEntry[]): MenuSection {
  return {
    id: slug,
    slug,
    title: slug,
    description: "",
    displayMode: slug === "cold-pressed-juice" ? "grouped-by-base" : "compact-list",
    priceIdr: null,
    sortOrder: 1,
    isActive: true,
    entries,
  };
}

function catalog(sections: MenuSection[]): MenuCatalog {
  return {
    brandName: "Puriva Live",
    tagline: "",
    currency: "IDR",
    updatedAt: "2026-06-13T00:00:00.000Z",
    sections,
  };
}

describe("stock availability rules", () => {
  it("treats sold-out cold-pressed bases as sold-out raw ingredients", () => {
    const soldOut = getColdPressedSoldOutIngredients([
      entry("cold-pressed-juice", "Sunkist", ["Original"], false),
      entry("cold-pressed-juice", "Pineapple", ["Original"], true),
    ]);

    assert.equal(soldOut.has("sunkist"), true);
    assert.equal(soldOut.has("pineapple"), false);
  });

  it("blocks cold-pressed mixes that use sold-out ingredients but keeps Original available", () => {
    const soldOut = new Set(["sunkist"]);

    assert.equal(isMixBlockedBySoldOutIngredient("Sunkist", soldOut), true);
    assert.equal(isMixBlockedBySoldOutIngredient("Original", soldOut), false);
  });

  it("blocks live-made cut fruit and blended items when their raw ingredient is sold out", () => {
    const soldOut = new Set(["sunkist"]);

    assert.equal(isEntryBlockedBySoldOutIngredient(entry("cut-fruits", "Sunkist", ["Sunkist"]), soldOut), true);
    assert.equal(isEntryBlockedBySoldOutIngredient(entry("blended-juice", "Sunkist", ["Sunkist"]), soldOut), true);
  });

  it("does not auto-block pre-made juice because it is finished bottled stock", () => {
    const soldOut = new Set(["sunkist"]);
    const splashOrange = entry("pre-made-juice", "Splash Orange", ["Sunkist", "Carrot", "Green Apple"]);

    assert.equal(isEntryBlockedBySoldOutIngredient(splashOrange, soldOut), false);
  });

  it("applies public catalog stock rules consistently", () => {
    const result = applyPublicStockRules(
      catalog([
        section("cold-pressed-juice", [
          entry("cold-pressed-juice", "Sunkist", ["Original"], false),
          entry("cold-pressed-juice", "Pineapple", ["Original", "Sunkist"], true),
        ]),
        section("cut-fruits", [entry("cut-fruits", "Sunkist", ["Sunkist"])]),
        section("blended-juice", [entry("blended-juice", "Sunkist", ["Sunkist"])]),
        section("pre-made-juice", [entry("pre-made-juice", "Splash Orange", ["Sunkist", "Carrot"])]),
      ]),
    );

    const coldPressed = result.sections.find((item) => item.slug === "cold-pressed-juice");
    const pineapple = coldPressed?.entries.find((item) => item.name === "Pineapple");
    const cutFruits = result.sections.find((item) => item.slug === "cut-fruits");
    const blended = result.sections.find((item) => item.slug === "blended-juice");
    const preMade = result.sections.find((item) => item.slug === "pre-made-juice");

    assert.equal(pineapple?.mixAvailability.Sunkist, false);
    assert.equal(cutFruits?.entries.length, 0);
    assert.equal(blended?.entries.length, 0);
    assert.equal(preMade?.entries.length, 1);
  });
});

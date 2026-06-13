"use client";

import { Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

import { toggleColdPressedMixAction, toggleMenuEntryAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatShortIdr } from "@/domain/menu/format";
import {
  getColdPressedSoldOutIngredients,
  isEntryBlockedBySoldOutIngredient,
  isMixBlockedBySoldOutIngredient,
} from "@/domain/menu/stock-availability";
import type { MenuCatalog } from "@/domain/menu/types";

export function StockControlPage({ catalog, isPreviewMode }: { catalog: MenuCatalog; isPreviewMode: boolean }) {
  const [activeSlug, setActiveSlug] = useState(catalog.sections[0]?.slug ?? "cut-fruits");
  const [query, setQuery] = useState("");
  const entries = useMemo(
    () =>
      catalog.sections.flatMap((section) =>
        section.entries.map((entry) => ({
          ...entry,
          sectionTitle: section.slug === "cold-pressed-juice" ? "Cold-Pressed Juice" : section.title,
          sectionPrice: section.priceIdr,
        })),
      ),
    [catalog],
  );
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sectionEntries = entries.filter((entry) => entry.sectionSlug === activeSlug);
    if (!normalized) return sectionEntries;

    return sectionEntries.filter((entry) =>
      [entry.name, entry.sectionTitle, entry.ingredients.join(" ")].join(" ").toLowerCase().includes(normalized),
    );
  }, [activeSlug, entries, query]);
  const coldPressedSoldOutIngredients = useMemo(
    () => getColdPressedSoldOutIngredients(entries),
    [entries],
  );

  return (
    <div className="min-w-0 space-y-5">
      <AdminPageHeader
        eyebrow="Operations"
        title="Stock Control"
        description="Toggle sold out cepat supaya customer tidak bisa order item yang stoknya habis."
      />

      <section className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {catalog.sections.map((section) => (
              <button
                key={section.slug}
                type="button"
                onClick={() => {
                  setActiveSlug(section.slug);
                  setQuery("");
                }}
                className={`h-10 shrink-0 rounded-[8px] border px-3 text-xs font-black uppercase ${
                  activeSlug === section.slug
                    ? "border-[#173f2a] bg-[#173f2a] text-white"
                    : "border-[#d9c8a7] bg-white text-[#4a4f45]"
                }`}
              >
                {section.slug === "cold-pressed-juice" ? "Cold-Pressed" : section.title}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7a5d21]" size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product..."
              className="h-11 w-full rounded-[8px] border border-[#d9c8a7] bg-white pl-10 pr-3 text-sm font-medium"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border border-[#e5d7bd] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#ead8b7] text-xs font-black uppercase tracking-[0.12em] text-[#7a5d21]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3e5cd]">
              {filteredEntries.map((entry) => (
                <Fragment key={entry.id}>
                  {(() => {
                    const isIngredientBlocked = isEntryBlockedBySoldOutIngredient(entry, coldPressedSoldOutIngredients);
                    const isEffectivelyAvailable = entry.isAvailable && !isIngredientBlocked;

                    return (
                  <tr key={entry.id}>
                    <td className="px-4 py-3">
                      <p className="font-black uppercase text-[#173f2a]">{entry.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-[#65705e]">
                        {entry.ingredients.join(" + ")}
                        {isIngredientBlocked ? " - ikut sold out karena bahan live menu habis" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#4a4f45]">{entry.sectionTitle}</td>
                    <td className="px-4 py-3 font-black text-[#1687a7]">{formatShortIdr(entry.priceIdr ?? entry.sectionPrice ?? 0)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                          isEffectivelyAvailable ? "bg-[#e8f5eb] text-[#16824a]" : "bg-[#fff0ed] text-[#b42318]"
                        }`}
                      >
                        {isIngredientBlocked ? "Ingredient sold out" : entry.isAvailable ? "Available" : "Sold out"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={toggleMenuEntryAction}>
                        <input type="hidden" name="id" value={entry.id} />
                        <input type="hidden" name="isAvailable" value={String(entry.isAvailable)} />
                        <button
                          disabled={isPreviewMode}
                          className="h-9 rounded-[8px] border border-[#d9c8a7] bg-[#fffaf0] px-3 text-xs font-black uppercase text-[#4a4f45] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {entry.isAvailable ? "Mark sold out" : "Restock"}
                        </button>
                      </form>
                    </td>
                  </tr>
                    );
                  })()}
                  {entry.sectionSlug === "cold-pressed-juice"
                    ? entry.ingredients.map((mix) => {
                        const isIngredientBlocked = isMixBlockedBySoldOutIngredient(mix, coldPressedSoldOutIngredients);
                        const isDirectMixAvailable = entry.mixAvailability[mix] !== false;
                        const isMixAvailable = entry.isAvailable && isDirectMixAvailable && !isIngredientBlocked;
                        const statusLabel = isIngredientBlocked ? "Base sold out" : isMixAvailable ? "Available" : "Sold out";

                        return (
                          <tr key={`${entry.id}-${mix}`} className="bg-[#fffaf0]">
                            <td className="px-4 py-2 pl-8 text-sm font-bold text-[#4a4f45]">+ {mix}</td>
                            <td className="px-4 py-2 text-xs text-[#65705e]" colSpan={2}>
                              {isIngredientBlocked ? "Ikut sold out karena base/bahan ini dimatikan." : "Varian mix"}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                                  isMixAvailable ? "bg-[#e8f5eb] text-[#16824a]" : "bg-[#fff0ed] text-[#b42318]"
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <form action={toggleColdPressedMixAction}>
                                <input type="hidden" name="id" value={entry.id} />
                                <input type="hidden" name="mix" value={mix} />
                                <input type="hidden" name="isAvailable" value={String(isDirectMixAvailable)} />
                                <button
                                  disabled={isPreviewMode || !entry.isAvailable || isIngredientBlocked}
                                  className="h-9 rounded-[8px] border border-[#d9c8a7] bg-white px-3 text-xs font-black uppercase text-[#4a4f45] disabled:cursor-not-allowed disabled:opacity-45"
                                >
                                  {isIngredientBlocked ? "Base sold out" : isDirectMixAvailable ? "Sold out mix" : "Restock mix"}
                                </button>
                              </form>
                            </td>
                          </tr>
                        );
                      })
                    : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { deleteMenuEntryAction, toggleMenuEntryAction, upsertMenuEntryAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { coldPressedCategoryOptions, getColdPressedCategory } from "@/domain/menu/cold-pressed-categories";
import { formatShortIdr } from "@/domain/menu/format";
import type { MenuCatalog, MenuEntry, MenuSection, MenuSectionSlug } from "@/domain/menu/types";

const pageSize = 8;

function formatMixNotes(mixNotes: Record<string, string>) {
  return Object.entries(mixNotes)
    .map(([mix, note]) => `${mix}: ${note}`)
    .join("\n");
}

function entrySearchText(entry: MenuEntry) {
  return [
    entry.name,
    entry.baseName,
    entry.benefit,
    entry.imageUrl,
    Object.values(entry.mixImageUrls).join(" "),
    entry.ingredients.join(" "),
    Object.keys(entry.mixNotes).join(" "),
    Object.values(entry.mixNotes).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSectionTitle(section: MenuSection) {
  return section.slug === "cold-pressed-juice" ? "Cold-Pressed Juice" : section.title;
}

export function AdminMenuEditor({
  catalog,
  isPreviewMode,
  initialSectionSlug,
}: {
  catalog: MenuCatalog;
  isPreviewMode: boolean;
  initialSectionSlug?: MenuSectionSlug;
}) {
  const fallbackSlug = catalog.sections[0]?.slug ?? "cold-pressed-juice";
  const initialSlug = catalog.sections.some((section) => section.slug === initialSectionSlug)
    ? initialSectionSlug
    : fallbackSlug;
  const [activeSlug, setActiveSlug] = useState<MenuSectionSlug>(initialSlug ?? fallbackSlug);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const productItems = catalog.sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    count: section.entries.length,
  }));

  const activeSection = catalog.sections.find((section) => section.slug === activeSlug) ?? catalog.sections[0];
  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const entries = activeSection?.entries ?? [];

    if (!normalizedQuery) return entries;
    return entries.filter((entry) => entrySearchText(entry).includes(normalizedQuery));
  }, [activeSection, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeSection(slug: MenuSectionSlug) {
    setActiveSlug(slug);
    setQuery("");
    setPage(1);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <AdminShell
      productItems={productItems}
      activeProductSlug={activeSlug}
      onProductSelect={changeSection}
      isPreviewMode={isPreviewMode}
    >
          {isPreviewMode ? (
            <div className="mb-6 rounded-[8px] border border-[#e0c58f] bg-[#fff9ef] p-4 text-sm text-[#72581d]">
              Admin mutation belum aktif karena environment Supabase belum diisi. UI ini tetap menampilkan bentuk data yang akan dipakai.
            </div>
          ) : null}

          {activeSection ? (
            <>
              <section className="mb-6 rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7a5d21]">
                      {activeSection.displayMode}
                    </p>
                    <h2 className="mt-1 text-3xl font-black text-[#173f2a]">{getSectionTitle(activeSection)}</h2>
                    <p className="mt-1 text-sm text-[#65705e]">
                      {activeSection.description}
                      {activeSection.priceIdr ? ` - ${formatShortIdr(activeSection.priceIdr)}` : ""}
                    </p>
                  </div>
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7a5d21]" size={17} />
                    <input
                      value={query}
                      onChange={(event) => changeQuery(event.target.value)}
                      placeholder="Search menu, mix, benefit..."
                      className="h-11 w-full rounded-[8px] border border-[#d9c8a7] bg-white pl-10 pr-3 text-sm font-medium"
                    />
                  </div>
                </div>

                <details className="group rounded-[8px] border border-[#ead8b7] bg-[#fffaf0] p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-black uppercase text-[#173f2a]">
                      <Plus size={17} />
                      Add item
                    </span>
                    <ChevronDown className="text-[#7a5d21] transition-transform group-open:rotate-180" size={18} />
                  </summary>
                  <div className="mt-4 border-t border-[#ead8b7] pt-4">
                    <EntryForm sections={catalog.sections} activeSection={activeSection} isDisabled={isPreviewMode} />
                  </div>
                </details>
              </section>

              <MenuTable
                entries={visibleEntries}
                sections={catalog.sections}
                activeSection={activeSection}
                isDisabled={isPreviewMode}
              />

              <div className="mt-4 flex flex-col gap-3 rounded-[8px] border border-[#e5d7bd] bg-white p-3 text-sm text-[#65705e] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {visibleEntries.length} of {filteredEntries.length} items
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="inline-flex h-9 items-center gap-1 rounded-[8px] border border-[#d9c8a7] px-3 font-bold disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>
                  <span className="font-bold text-[#1f2f22]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    className="inline-flex h-9 items-center gap-1 rounded-[8px] border border-[#d9c8a7] px-3 font-bold disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : null}
    </AdminShell>
  );
}

function MenuTable({
  entries,
  sections,
  activeSection,
  isDisabled,
}: {
  entries: MenuEntry[];
  sections: MenuSection[];
  activeSection: MenuSection;
  isDisabled: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-[#e5d7bd] bg-white shadow-sm">
      <div className="grid gap-3 p-3 md:hidden">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <MobileEntryCard
              key={entry.id}
              entry={entry}
              sections={sections}
              activeSection={activeSection}
              isDisabled={isDisabled}
            />
          ))
        ) : (
          <div className="rounded-[8px] border border-dashed border-[#d9c8a7] bg-[#fffaf0] p-4 text-center text-sm text-[#65705e]">
            No menu item found.
          </div>
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-[#fffaf0] text-xs font-black uppercase tracking-[0.12em] text-[#7a5d21]">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Mix / Ingredients</th>
              <th className="px-4 py-3">Benefit</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3e5cd]">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  entry={entry}
                  sections={sections}
                  activeSection={activeSection}
                  isDisabled={isDisabled}
                />
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-[#65705e]" colSpan={7}>
                  No menu item found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EntryPhoto({ entry, activeSection }: { entry: MenuEntry; activeSection: MenuSection }) {
  const photoUrl =
    activeSection.slug === "cold-pressed-juice" && Object.values(entry.mixImageUrls)[0]
      ? Object.values(entry.mixImageUrls)[0]
      : entry.imageUrl;

  return (
    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-[8px] border border-[#ead8b7] bg-[#fffaf0]">
      {photoUrl ? (
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${photoUrl}")` }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase text-[#9a7a35]">
          No image
        </div>
      )}
    </div>
  );
}

function MobileEntryCard({
  entry,
  sections,
  activeSection,
  isDisabled,
}: {
  entry: MenuEntry;
  sections: MenuSection[];
  activeSection: MenuSection;
  isDisabled: boolean;
}) {
  return (
    <article className="min-w-0 rounded-[8px] border border-[#f0ddbc] bg-white p-3">
      <div className="flex gap-3">
        <EntryPhoto entry={entry} activeSection={activeSection} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-words font-black uppercase text-[#1f2f22]">{entry.name}</p>
              <p className="mt-1 text-xs text-[#65705e]">
                {entry.baseName ? `Base ${entry.baseName}` : getSectionTitle(activeSection)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                entry.isAvailable ? "bg-[#e8f5eb] text-[#16824a]" : "bg-[#fff0ed] text-[#b42318]"
              }`}
            >
              {entry.isAvailable ? "On" : "Off"}
            </span>
          </div>
          <p className="mt-2 break-words text-sm text-[#4a4f45]">{entry.ingredients.join(" + ")}</p>
          {entry.benefit ? <p className="mt-1 break-words text-xs leading-5 text-[#65705e]">{entry.benefit}</p> : null}
          <p className="mt-2 text-sm font-black text-[#1687a7]">
            {entry.priceIdr ? formatShortIdr(entry.priceIdr) : "-"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <form action={toggleMenuEntryAction}>
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="isAvailable" value={String(entry.isAvailable)} />
          <button
            disabled={isDisabled}
            className="h-9 w-full rounded-[8px] border border-[#d9c8a7] px-3 text-xs font-bold text-[#4a4f45] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {entry.isAvailable ? "Hide" : "Show"}
          </button>
        </form>
        <form action={deleteMenuEntryAction}>
          <input type="hidden" name="id" value={entry.id} />
          <button
            disabled={isDisabled}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[8px] border border-[#efc5bd] px-3 text-xs font-bold text-[#b42318] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </form>
      </div>

      <details className="group mt-3 rounded-[8px] bg-[#fffaf0] p-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#173f2a]">
          <Pencil size={15} />
          Edit details
          <ChevronDown className="ml-auto transition-transform group-open:rotate-180" size={16} />
        </summary>
        <div className="mt-3 border-t border-[#ead8b7] pt-3">
          <EntryForm sections={sections} activeSection={activeSection} entry={entry} isDisabled={isDisabled} />
        </div>
      </details>
    </article>
  );
}

function TableRow({
  entry,
  sections,
  activeSection,
  isDisabled,
}: {
  entry: MenuEntry;
  sections: MenuSection[];
  activeSection: MenuSection;
  isDisabled: boolean;
}) {
  return (
    <>
      <tr className="align-top">
        <td className="px-4 py-4">
          <EntryPhoto entry={entry} activeSection={activeSection} />
        </td>
        <td className="px-4 py-4">
          <div className="flex items-start gap-2">
            <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: entry.accentColor }} />
            <div>
              <p className="font-black uppercase text-[#1f2f22]">{entry.name}</p>
              <p className="mt-1 text-xs text-[#65705e]">
                {entry.baseName ? `Base ${entry.baseName}` : getSectionTitle(activeSection)}
              </p>
            </div>
          </div>
        </td>
        <td className="max-w-xs px-4 py-4 text-[#4a4f45]">
          <p className="line-clamp-2">{entry.ingredients.join(" + ")}</p>
        </td>
        <td className="max-w-xs px-4 py-4 text-[#4a4f45]">
          <p className="line-clamp-2">{entry.benefit || "-"}</p>
        </td>
        <td className="px-4 py-4 font-bold text-[#1687a7]">{entry.priceIdr ? formatShortIdr(entry.priceIdr) : "-"}</td>
        <td className="px-4 py-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              entry.isAvailable ? "bg-[#e8f5eb] text-[#16824a]" : "bg-[#fff0ed] text-[#b42318]"
            }`}
          >
            {entry.isAvailable ? "Available" : "Hidden"}
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="flex justify-end gap-2">
            <form action={toggleMenuEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <input type="hidden" name="isAvailable" value={String(entry.isAvailable)} />
              <button
                disabled={isDisabled}
                className="h-9 rounded-[8px] border border-[#d9c8a7] px-3 text-xs font-bold text-[#4a4f45] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {entry.isAvailable ? "Hide" : "Show"}
              </button>
            </form>
            <form action={deleteMenuEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <button
                disabled={isDisabled}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#efc5bd] px-3 text-xs font-bold text-[#b42318] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </form>
          </div>
        </td>
      </tr>
      <tr>
        <td className="bg-[#fffaf0] px-4 py-3" colSpan={7}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#173f2a]">
              <Pencil size={15} />
              Edit details
              <ChevronDown className="transition-transform group-open:rotate-180" size={16} />
            </summary>
            <div className="mt-4 border-t border-[#ead8b7] pt-4">
              <EntryForm sections={sections} activeSection={activeSection} entry={entry} isDisabled={isDisabled} />
            </div>
          </details>
        </td>
      </tr>
    </>
  );
}

function EntryForm({
  sections,
  activeSection,
  entry,
  isDisabled,
}: {
  sections: MenuSection[];
  activeSection: MenuSection;
  entry?: MenuEntry;
  isDisabled: boolean;
}) {
  const selectedSection = entry
    ? sections.find((section) => section.slug === entry.sectionSlug) ?? activeSection
    : activeSection;
  const isColdPressed = selectedSection.slug === "cold-pressed-juice";

  return (
    <form action={upsertMenuEntryAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={entry?.id ?? ""} />
      <input type="hidden" name="imageUrl" value={entry?.imageUrl ?? ""} />
      <input type="hidden" name="mixAvailability" value={JSON.stringify(entry?.mixAvailability ?? {})} />

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Section
        <select
          name="sectionSlug"
          defaultValue={selectedSection.slug}
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sections.map((section) => (
            <option key={section.id} value={section.slug}>
              {getSectionTitle(section)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        {isColdPressed ? "Base name" : "Menu name"}
        <input
          name="name"
          defaultValue={entry?.name ?? ""}
          placeholder={isColdPressed ? "Celery" : "Splash Orange"}
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
          required
        />
      </label>

      {!isColdPressed ? (
        <label className="grid gap-1 text-sm font-bold text-[#4a4f45] sm:col-span-2">
          Menu image
          <input
            name="imageFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={isDisabled}
            className="rounded-[8px] border border-[#d9c8a7] bg-white px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-45"
          />
          {entry?.imageUrl ? (
            <span className="text-xs font-medium text-[#65705e]">Existing image will stay unless a new file is uploaded.</span>
          ) : null}
        </label>
      ) : null}

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45] sm:col-span-2">
        {isColdPressed ? "Mix list" : "Ingredients"}
        <textarea
          name="ingredients"
          defaultValue={entry?.ingredients.join("\n") ?? ""}
          placeholder={isColdPressed ? "Green Apple\nPineapple\nMelon" : "Sunkist\nCarrot\nGreen Apple"}
          disabled={isDisabled}
          className="min-h-24 rounded-[8px] border border-[#d9c8a7] px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-45"
          required
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Base fruit override
        <input
          name="baseName"
          defaultValue={entry?.baseName ?? ""}
          placeholder="Opsional. Cold-pressed otomatis pakai base name."
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Benefit
        <input
          name="benefit"
          defaultValue={entry?.benefit ?? ""}
          placeholder={isColdPressed ? "Deep detox" : "Vitamin C dan beta-carotene"}
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45] sm:col-span-2">
        Mix benefits
        <textarea
          name="mixNotes"
          defaultValue={entry ? formatMixNotes(entry.mixNotes) : ""}
          placeholder={"Green Apple: rasa lebih crisp dan segar\nPineapple: bantu pencernaan dan rasa tropical"}
          disabled={isDisabled}
          className="min-h-28 rounded-[8px] border border-[#d9c8a7] px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      {isColdPressed ? (
        <div className="grid gap-3 rounded-[8px] border border-[#ead8b7] bg-white p-3 sm:col-span-2">
          <div>
            <p className="text-sm font-black text-[#173f2a]">Mix photos</p>
            <p className="mt-1 text-xs font-medium leading-5 text-[#65705e]">
              Foto cold-pressed disimpan per pilihan mix karena warna tiap campuran beda.
            </p>
          </div>
          {entry ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {entry.ingredients.map((mix) => (
                <label key={mix} className="grid gap-1 text-xs font-bold text-[#4a4f45]">
                  {mix}
                  <input
                    name={`mixImageFile:${mix}`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={isDisabled}
                    className="rounded-[8px] border border-[#d9c8a7] bg-[#fffaf0] px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-45"
                  />
                  {entry.mixImageUrls[mix] ? (
                    <span className="font-medium text-[#65705e]">Existing image will stay unless replaced.</span>
                  ) : null}
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-[8px] bg-[#fffaf0] px-3 py-2 text-xs font-semibold leading-5 text-[#7a5d21]">
              Create base dulu, lalu edit item itu untuk upload foto per mix.
            </p>
          )}
          <label className="grid gap-1 text-xs font-bold text-[#4a4f45]">
            Existing mix image URLs
            <textarea
              name="mixImageUrls"
              defaultValue={entry ? formatMixNotes(entry.mixImageUrls) : ""}
              placeholder={"Original: https://...\nGreen Apple: https://..."}
              disabled={isDisabled}
              className="min-h-20 rounded-[8px] border border-[#d9c8a7] px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-45"
            />
          </label>
        </div>
      ) : (
        <input type="hidden" name="mixImageUrls" value="" />
      )}

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Cold-pressed category
        <select
          name="categorySlug"
          defaultValue={getColdPressedCategory(entry?.categorySlug).slug}
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        >
          {coldPressedCategoryOptions.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Price IDR
        <input
          name="priceIdr"
          type="number"
          min="0"
          defaultValue={entry?.priceIdr ?? selectedSection.priceIdr ?? ""}
          placeholder="35000"
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Accent
        <input
          name="accentColor"
          type="color"
          defaultValue={entry?.accentColor ?? "#1f7a4d"}
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-2 disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Sort order
        <input
          name="sortOrder"
          type="number"
          min="0"
          defaultValue={entry?.sortOrder ?? 999}
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-bold text-[#4a4f45]">
        <input
          name="isAvailable"
          type="checkbox"
          defaultChecked={entry?.isAvailable ?? true}
          disabled={isDisabled}
          className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-45"
        />
        Available
      </label>

      <div className="sm:col-span-2">
        <button
          disabled={isDisabled}
          className="h-11 rounded-[8px] bg-[#173f2a] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {entry ? "Save changes" : "Create item"}
        </button>
      </div>
    </form>
  );
}

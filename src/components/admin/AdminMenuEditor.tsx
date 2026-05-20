"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { deleteMenuEntryAction, signOutAction, toggleMenuEntryAction, upsertMenuEntryAction } from "@/app/admin/actions";
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

export function AdminMenuEditor({ catalog, isPreviewMode }: { catalog: MenuCatalog; isPreviewMode: boolean }) {
  const [activeSlug, setActiveSlug] = useState<MenuSectionSlug>(catalog.sections[0]?.slug ?? "cold-pressed-juice");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

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
    <main className="min-h-screen bg-[#f7f3ea] text-[#1f2f22]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7a5d21]">
              <ShieldCheck size={15} />
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-[#173f2a]">Puriva Live Console</h1>
            <p className="mt-2 text-sm leading-6 text-[#65705e]">Pilih menu di sidebar, lalu search dan edit dari table.</p>

            <nav className="mt-5 grid gap-2">
              {catalog.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => changeSection(section.slug)}
                  className={`flex items-center justify-between rounded-[8px] border px-3 py-3 text-left text-sm font-black transition ${
                    section.slug === activeSlug
                      ? "border-[#173f2a] bg-[#173f2a] text-white"
                      : "border-[#ead8b7] bg-[#fffaf0] text-[#4a4f45]"
                  }`}
                >
                  <span>{getSectionTitle(section)}</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{section.entries.length}</span>
                </button>
              ))}
            </nav>

            {!isPreviewMode ? (
              <form action={signOutAction} className="mt-5">
                <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-[#d9c8a7] bg-white px-4 text-sm font-bold text-[#4a4f45]">
                  <LogOut size={16} />
                  Sign out
                </button>
              </form>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0">
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
        </div>
      </div>
    </main>
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
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
          <div className="h-16 w-20 overflow-hidden rounded-[8px] border border-[#ead8b7] bg-[#fffaf0]">
            {activeSection.slug === "cold-pressed-juice" && Object.values(entry.mixImageUrls)[0] ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${Object.values(entry.mixImageUrls)[0]}")` }}
              />
            ) : entry.imageUrl ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${entry.imageUrl}")` }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase text-[#9a7a35]">
                No image
              </div>
            )}
          </div>
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

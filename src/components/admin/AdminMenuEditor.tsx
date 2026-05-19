import { LogOut, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { deleteMenuEntryAction, signOutAction, toggleMenuEntryAction, upsertMenuEntryAction } from "@/app/admin/actions";
import { formatShortIdr } from "@/domain/menu/format";
import type { MenuCatalog, MenuEntry, MenuSection } from "@/domain/menu/types";

export function AdminMenuEditor({ catalog, isPreviewMode }: { catalog: MenuCatalog; isPreviewMode: boolean }) {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#1f2f22]">
      <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-[#e5d7bd] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7a5d21]">
              <ShieldCheck size={15} />
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#173f2a]">Puriva Live Menu Console</h1>
            <p className="mt-1 text-sm text-[#65705e]">Edit item, ingredient, price, base cold-pressed, dan availability.</p>
          </div>
          {!isPreviewMode ? (
            <form action={signOutAction}>
              <button className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d9c8a7] bg-white px-4 text-sm font-bold text-[#4a4f45]">
                <LogOut size={16} />
                Sign out
              </button>
            </form>
          ) : null}
        </header>

        {isPreviewMode ? (
          <div className="mb-6 rounded-[8px] border border-[#e0c58f] bg-[#fff9ef] p-4 text-sm text-[#72581d]">
            Admin mutation belum aktif karena environment Supabase belum diisi. UI ini tetap menampilkan bentuk data yang akan dipakai.
          </div>
        ) : null}

        <section className="mb-8 rounded-[8px] border border-[#e5d7bd] bg-white p-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#173f2a]">
            <Plus size={19} />
            Add menu item
          </h2>
          <EntryForm sections={catalog.sections} isDisabled={isPreviewMode} />
        </section>

        <div className="space-y-8">
          {catalog.sections.map((section) => (
            <section key={section.id}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-[#173f2a]">{section.title}</h2>
                  <p className="text-sm text-[#65705e]">
                    {section.displayMode}
                    {section.priceIdr ? ` - ${formatShortIdr(section.priceIdr)}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#65705e]">{section.entries.length} items</span>
              </div>

              <div className="grid gap-3">
                {section.entries.map((entry) => (
                  <EntryEditor
                    key={entry.id}
                    entry={entry}
                    section={section}
                    sections={catalog.sections}
                    isDisabled={isPreviewMode}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function EntryEditor({
  entry,
  section,
  sections,
  isDisabled,
}: {
  entry: MenuEntry;
  section: MenuSection;
  sections: MenuSection[];
  isDisabled: boolean;
}) {
  return (
    <details className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: entry.accentColor }} />
              <h3 className="truncate text-base font-black text-[#1f2f22]">{entry.name}</h3>
            </div>
            <p className="mt-1 text-sm text-[#65705e]">
              {section.title}
              {entry.baseName ? ` - base ${entry.baseName}` : ""} - {entry.ingredients.join(", ")}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
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
        </div>
      </summary>

      <div className="mt-4 border-t border-[#eee1ca] pt-4">
        <EntryForm sections={sections} entry={entry} isDisabled={isDisabled} />
      </div>
    </details>
  );
}

function EntryForm({
  sections,
  entry,
  isDisabled,
}: {
  sections: MenuSection[];
  entry?: MenuEntry;
  isDisabled: boolean;
}) {
  return (
    <form action={upsertMenuEntryAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={entry?.id ?? ""} />

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Section
        <select
          name="sectionSlug"
          defaultValue={entry?.sectionSlug ?? "cold-pressed-juice"}
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sections.map((section) => (
            <option key={section.id} value={section.slug}>
              {section.title}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Name
        <input
          name="name"
          defaultValue={entry?.name ?? ""}
          placeholder="Sunkist + Pineapple"
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
          required
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45] sm:col-span-2">
        Ingredients
        <textarea
          name="ingredients"
          defaultValue={entry?.ingredients.join("\n") ?? ""}
          placeholder={"Sunkist\nPineapple"}
          disabled={isDisabled}
          className="min-h-24 rounded-[8px] border border-[#d9c8a7] px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-45"
          required
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Base fruit
        <input
          name="baseName"
          defaultValue={entry?.baseName ?? ""}
          placeholder="Isi untuk cold-pressed, contoh: Sunkist"
          disabled={isDisabled}
          className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
        Price IDR
        <input
          name="priceIdr"
          type="number"
          min="0"
          defaultValue={entry?.priceIdr ?? ""}
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

import { Apple, Droplets, GlassWater, Leaf, ScanLine, Sparkles, Zap } from "lucide-react";

import { formatShortIdr } from "@/domain/menu/format";
import { groupColdPressedByCategory } from "@/domain/menu/group-cold-pressed";
import type { MenuCatalog, MenuSection } from "@/domain/menu/types";

type MenuPageProps = {
  catalog: MenuCatalog;
  isPreviewMode: boolean;
};

const sectionIcons = {
  "cut-fruits": Apple,
  "blended-juice": GlassWater,
  "pre-made-juice": Droplets,
  "cold-pressed-juice": Leaf,
};

export function MenuPage({ catalog, isPreviewMode }: MenuPageProps) {
  const sections = catalog.sections.filter((section) => section.isActive);

  return (
    <main className="min-h-screen bg-[#fff9ef] text-[#233224]">
      <section className="border-b border-[#f0ddbc] bg-[#fffdf7]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8d4ab] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5d21]">
              <ScanLine size={14} />
              QR Live Menu
            </div>
            <h1 className="text-4xl font-black leading-[0.95] text-[#173f2a] sm:text-6xl">
              {catalog.brandName}
              <span className="block text-[#d64e2a]">Cold Pressed Juice Menu</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5f6d58] sm:text-lg">
              100% murni dari buah dan sayur segar. Tanpa air, tanpa gula, tanpa sirup,
              dipress dingin untuk rasa yang clean dan nutrisi yang tetap hidup.
            </p>
          </div>

          <div className="grid min-w-64 grid-cols-3 gap-2 rounded-[8px] border border-[#f0ddbc] bg-[#fff6e5] p-3">
            {["Sunkist", "Pineapple", "Guava", "Melon", "Beet", "Celery"].map((fruit, index) => (
              <div
                key={fruit}
                className="flex aspect-square items-center justify-center rounded-[8px] text-xs font-black uppercase text-white shadow-sm"
                style={{
                  backgroundColor: ["#ea580c", "#d97706", "#db2777", "#65a30d", "#be123c", "#16a34a"][index],
                }}
              >
                {fruit.slice(0, 3)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {isPreviewMode ? (
        <div className="mx-auto w-full max-w-6xl px-5 pt-4 sm:px-8">
          <div className="rounded-[8px] border border-[#f0ddbc] bg-white px-4 py-3 text-sm text-[#7a5d21]">
            Preview mode: isi environment Supabase untuk mengaktifkan data live dan admin editor.
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-8">
          {sections
            .filter((section) => section.displayMode !== "grouped-by-base")
            .map((section) => (
              <MenuSectionBlock key={section.id} section={section} />
            ))}
        </div>

        <div className="space-y-8">
          {sections
            .filter((section) => section.displayMode === "grouped-by-base")
            .map((section) => (
              <ColdPressedSection key={section.id} section={section} />
            ))}
        </div>
      </div>
    </main>
  );
}

function MenuSectionBlock({ section }: { section: MenuSection }) {
  const Icon = sectionIcons[section.slug];

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black uppercase text-[#173f2a]">
            <Icon size={23} />
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-[#687460]">{section.description}</p>
        </div>
        {section.priceIdr ? (
          <div className="shrink-0 text-xl font-black text-[#1687a7]">{formatShortIdr(section.priceIdr)}</div>
        ) : null}
      </div>

      {section.displayMode === "recipe-cards" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {section.entries.map((entry) => (
            <article key={entry.id} className="rounded-[8px] border border-[#f0ddbc] bg-white p-4 shadow-sm">
              <div className="mb-3 h-2 rounded-full" style={{ backgroundColor: entry.accentColor }} />
              <h3 className="text-base font-black uppercase text-[#233224]">{entry.name}</h3>
              <p className="mt-2 text-xs font-semibold uppercase leading-5 tracking-[0.08em] text-[#6b755f]">
                {entry.ingredients.join(", ")}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {section.entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[8px] border border-[#f0ddbc] bg-white px-3 py-3 text-sm font-black uppercase text-[#233224] shadow-sm"
            >
              <span className="mb-2 block h-1.5 rounded-full" style={{ backgroundColor: entry.accentColor }} />
              {entry.name}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ColdPressedSection({ section }: { section: MenuSection }) {
  const categories = groupColdPressedByCategory(section.entries);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-black uppercase text-[#173f2a]">
            <Sparkles size={27} />
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-[#687460]">{section.description}</p>
        </div>
        {section.priceIdr ? (
          <div className="text-2xl font-black text-[#1687a7]">{formatShortIdr(section.priceIdr)}</div>
        ) : null}
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => {
          const Icon = category.icon === "zap" ? Zap : category.icon === "droplets" ? Droplets : Leaf;

          return (
            <article key={category.slug} className="rounded-[8px] border border-[#f0ddbc] bg-white shadow-sm">
              <div className="border-b border-[#f0ddbc] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-white"
                    style={{ backgroundColor: category.accentColor }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7a35]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="text-xl font-black uppercase text-[#173f2a]">{category.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#687460]">{category.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#f3e5cd]">
                {category.groups.map((group) => (
                  <div key={group.baseName} className="px-4 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: group.accentColor }} />
                          <h4 className="text-lg font-black uppercase text-[#233224]">{group.baseName} Base</h4>
                        </div>
                        {group.benefit ? (
                          <p className="mt-1 text-sm font-bold text-[#7a5d21]">{group.benefit}</p>
                        ) : null}
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#1687a7]">Mix pilihan</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.mixes.map((mix) => (
                        <span
                          key={`${group.baseName}-${mix}`}
                          className="rounded-full border border-[#ead8b7] bg-[#fff9ef] px-3 py-1 text-xs font-bold uppercase text-[#4d5a47]"
                        >
                          {mix}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-[8px] border border-[#f0ddbc] bg-[#173f2a] px-5 py-4 text-center text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7d790]">All variants</p>
        <p className="mt-1 text-3xl font-black">{section.priceIdr ? formatShortIdr(section.priceIdr) : "IDR 35K"}</p>
        <p className="mt-1 text-sm font-semibold text-[#d8eadc]">Tambah chia seeds +2K</p>
      </div>
    </section>
  );
}

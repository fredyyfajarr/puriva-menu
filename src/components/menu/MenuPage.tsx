import { Apple, ChevronDown, Droplets, GlassWater, HeartPulse, Leaf, ScanLine, Sparkles, Zap } from "lucide-react";

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

const fruitBenefitNotes = [
  "Sunkist dan guava bantu support vitamin C harian.",
  "Watermelon dan melon cocok untuk pilihan yang lebih hydrating.",
  "Green apple dan pineapple memberi rasa segar sekaligus bantu balance sweetness.",
  "Beet, carrot, celery, dan kale cocok untuk rasa clean dengan karakter sayur lebih kuat.",
];

function getSectionTitle(section: MenuSection) {
  return section.slug === "cold-pressed-juice" ? "Cold-Pressed Juice" : section.title;
}

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
            {getSectionTitle(section)}
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
            <details key={entry.id} className="group rounded-[8px] border border-[#f0ddbc] bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="mb-3 h-2 rounded-full" style={{ backgroundColor: entry.accentColor }} />
                  <h3 className="text-base font-black uppercase text-[#233224]">{entry.name}</h3>
                  {entry.benefit ? <p className="mt-1 text-sm font-semibold text-[#7a5d21]">{entry.benefit}</p> : null}
                </div>
                <ChevronDown className="shrink-0 text-[#7a5d21] transition-transform group-open:rotate-180" size={18} />
              </summary>
              <div className="border-t border-[#f3e5cd] px-4 pb-4 pt-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1687a7]">Ingredients</p>
                <p className="mt-2 text-sm font-semibold uppercase leading-6 text-[#4d5a47]">
                  {entry.ingredients.join(" + ")}
                </p>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <>
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
          {section.slug === "cut-fruits" || section.slug === "blended-juice" ? (
            <details className="group mt-3 rounded-[8px] border border-[#f0ddbc] bg-white px-4 py-3 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-black uppercase text-[#173f2a]">
                  <HeartPulse size={16} />
                  Fruit benefits note
                </span>
                <ChevronDown className="text-[#7a5d21] transition-transform group-open:rotate-180" size={18} />
              </summary>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5f6d58]">
                {fruitBenefitNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
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
            {getSectionTitle(section)}
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
                  <details key={group.baseName} className="group px-4 py-4">
                    <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: group.accentColor }} />
                          <h4 className="text-lg font-black uppercase text-[#233224]">{group.baseName} Base</h4>
                        </div>
                        {group.benefit ? (
                          <p className="mt-1 text-sm font-bold text-[#7a5d21]">{group.benefit}</p>
                        ) : null}
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#1687a7]">
                        Mix pilihan
                        <ChevronDown className="transition-transform group-open:rotate-180" size={17} />
                      </span>
                    </summary>
                    <div className="mt-3 grid gap-2">
                      {group.mixes.map((mix) => (
                        <div
                          key={`${group.baseName}-${mix}`}
                          className="rounded-[8px] border border-[#ead8b7] bg-[#fff9ef] px-3 py-2"
                        >
                          <p className="text-xs font-black uppercase text-[#4d5a47]">+ {mix}</p>
                          {group.mixNotes[mix] ? (
                            <p className="mt-1 text-sm leading-6 text-[#687460]">{group.mixNotes[mix]}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-[8px] border border-[#f0ddbc] bg-[#173f2a] px-5 py-4 text-center text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7d790]">All variants</p>
        <p className="mt-1 text-3xl font-black">{section.priceIdr ? formatShortIdr(section.priceIdr) : "IDR 35K"}</p>
      </div>
    </section>
  );
}

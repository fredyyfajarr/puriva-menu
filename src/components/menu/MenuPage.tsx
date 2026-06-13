"use client";

import { Apple, ChevronDown, Droplets, GlassWater, HeartPulse, Leaf, ScanLine, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { formatShortIdr } from "@/domain/menu/format";
import { groupColdPressedByCategory } from "@/domain/menu/group-cold-pressed";
import type { MenuCatalog, MenuSection } from "@/domain/menu/types";
import { HeroJuiceStage } from "@/components/menu/HeroJuiceStage";

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

function getMixLabel(mix: string) {
  return mix.toLowerCase() === "original" ? "Original" : `+ ${mix}`;
}

export function MenuPage({ catalog, isPreviewMode }: MenuPageProps) {
  const sections = catalog.sections.filter((section) => section.isActive);
  const defaultSlug = sections.find((section) => section.slug === "cold-pressed-juice")?.slug ?? sections[0]?.slug ?? "cold-pressed-juice";
  const [activeSlug, setActiveSlug] = useState(defaultSlug);
  const activeSection = sections.find((section) => section.slug === activeSlug) ?? sections[0];
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-[#fff9ef] text-[#233224]">
      <motion.section
        className="overflow-hidden border-b border-[#f0ddbc] bg-[#fffdf7]"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            className="max-w-3xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8d4ab] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5d21]"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.35, ease: "easeOut" }}
            >
              <ScanLine size={14} />
              Online Menu
            </motion.div>
            <h1 className="text-4xl font-black leading-[0.95] text-[#173f2a] sm:text-6xl">
              {catalog.brandName}
              <span className="block text-[#d64e2a]">Cold Pressed Juice Menu</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5f6d58] sm:text-lg">
              100% murni dari buah dan sayur segar. Tanpa air, tanpa gula, tanpa sirup,
              dipress dingin untuk rasa yang clean dan nutrisi yang tetap hidup. Untuk dine-in self order, scan QR
              di meja supaya pesanan langsung masuk ke kasir.
            </p>
          </motion.div>

          <HeroJuiceStage />
        </div>
      </motion.section>

      {isPreviewMode ? (
        <div className="mx-auto w-full max-w-6xl px-5 pt-4 sm:px-8">
          <div className="rounded-[8px] border border-[#f0ddbc] bg-white px-4 py-3 text-sm text-[#7a5d21]">
            Preview mode: isi environment Supabase untuk mengaktifkan data live dan admin editor.
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = sectionIcons[section.slug];
            const isActive = section.slug === activeSection?.slug;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSlug(section.slug)}
                className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-[8px] border px-4 text-sm font-black uppercase transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                  isActive
                    ? "border-[#173f2a] bg-[#173f2a] text-white"
                    : "border-[#f0ddbc] bg-white text-[#4d5a47]"
                }`}
              >
                <Icon size={17} />
                {getSectionTitle(section)}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection?.slug}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {activeSection?.displayMode === "grouped-by-base" ? (
              <ColdPressedSection section={activeSection} />
            ) : activeSection ? (
              <MenuSectionBlock section={activeSection} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
      <footer className="border-t border-[#f0ddbc] px-5 py-6 text-center text-sm font-bold text-[#65705e]">
        Copyright 2026. Made with love by fredyyfajarr.
      </footer>
    </main>
  );
}

function MenuImageFrame({
  imageUrl,
  name,
  accentColor,
  className = "mb-3",
}: {
  imageUrl: string | null | undefined;
  name: string;
  accentColor: string;
  className?: string;
}) {
  return (
    <div className={`${className} aspect-[4/3] overflow-hidden rounded-[8px] border border-[#f0ddbc] bg-[#fff6e5]`}>
      {imageUrl ? (
        <div
          aria-label={name}
          className="h-full w-full bg-cover bg-center transition duration-300 hover:scale-105"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
          <span className="h-10 w-10 rounded-[12px]" style={{ backgroundColor: accentColor }} />
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7a5d21]">Photo coming soon</p>
        </div>
      )}
    </div>
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
            <details key={entry.id} className="group rounded-[8px] border border-[#f0ddbc] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <summary className="relative cursor-pointer list-none p-4 pr-12">
                <div>
                  <MenuImageFrame imageUrl={entry.imageUrl} name={entry.name} accentColor={entry.accentColor} />
                  <div className="mb-3 h-2 rounded-full" style={{ backgroundColor: entry.accentColor }} />
                  <h3 className="text-base font-black uppercase text-[#233224]">{entry.name}</h3>
                  {entry.benefit ? <p className="mt-1 text-sm font-semibold text-[#7a5d21]">{entry.benefit}</p> : null}
                </div>
                <ChevronDown className="absolute right-4 top-4 shrink-0 text-[#7a5d21] transition-transform group-open:rotate-180" size={18} />
              </summary>
              <div className="animate-menu-panel border-t border-[#f3e5cd] px-4 pb-4 pt-3">
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
                className="rounded-[8px] border border-[#f0ddbc] bg-white p-3 text-sm font-black uppercase text-[#233224] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <MenuImageFrame imageUrl={entry.imageUrl} name={entry.name} accentColor={entry.accentColor} />
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
                          className="grid gap-3 rounded-[8px] border border-[#ead8b7] bg-[#fff9ef] p-3 transition duration-200 hover:-translate-y-0.5 hover:bg-white sm:grid-cols-[112px_minmax(0,1fr)]"
                        >
                          <MenuImageFrame
                            imageUrl={group.mixImageUrls[mix]}
                            name={`${group.baseName} ${mix}`}
                            accentColor={group.accentColor}
                            className="mb-0"
                          />
                          <div className="self-center">
                            <p className="text-xs font-black uppercase text-[#4d5a47]">{getMixLabel(mix)}</p>
                            {group.mixNotes[mix] ? (
                              <p className="mt-1 text-sm leading-6 text-[#687460]">{group.mixNotes[mix]}</p>
                            ) : null}
                          </div>
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

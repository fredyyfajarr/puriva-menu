"use client";

import { Apple, ChevronDown, Droplets, GlassWater, HeartPulse, Leaf, ScanLine, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

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
              QR Live Menu
            </motion.div>
            <h1 className="text-4xl font-black leading-[0.95] text-[#173f2a] sm:text-6xl">
              {catalog.brandName}
              <span className="block text-[#d64e2a]">Cold Pressed Juice Menu</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5f6d58] sm:text-lg">
              100% murni dari buah dan sayur segar. Tanpa air, tanpa gula, tanpa sirup,
              dipress dingin untuk rasa yang clean dan nutrisi yang tetap hidup.
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
    </main>
  );
}

function HeroJuiceStage() {
  const shouldReduceMotion = useReducedMotion();
  const floatAnimation = shouldReduceMotion ? undefined : { y: [0, -8, 0], rotate: [-1, 1, -1] };
  const bubbleAnimation = shouldReduceMotion ? undefined : { y: [0, -26], opacity: [0, 1, 0], scale: [0.7, 1, 0.8] };
  const waveAnimation = shouldReduceMotion ? undefined : { x: [-18, 18, -18] };

  return (
    <motion.div
      className="relative min-h-[360px] w-full max-w-lg overflow-hidden rounded-[8px] border border-[#f0ddbc] bg-[#fff1d5] shadow-xl"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.9),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(249,115,22,0.16),transparent_30%)]" />
      <motion.svg
        viewBox="0 0 560 390"
        role="img"
        aria-label="Animated fruit juice illustration"
        className="absolute inset-0 h-full w-full"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <defs>
          <linearGradient id="heroOrange" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd65a" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="heroGreen" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#b8ee62" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="heroPink" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff7aa8" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#173f2a" floodOpacity="0.16" />
          </filter>
        </defs>

        <motion.g
          animate={shouldReduceMotion ? undefined : { x: [-8, 8, -8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          opacity="0.38"
        >
          <path d="M52 80 C150 42, 210 114, 314 70 S480 50, 524 100" fill="none" stroke="#f7d790" strokeWidth="16" strokeLinecap="round" />
          <path d="M44 308 C138 252, 234 332, 338 286 S478 252, 532 316" fill="none" stroke="#c7e68c" strokeWidth="14" strokeLinecap="round" />
        </motion.g>

        <motion.g animate={floatAnimation} transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }} filter="url(#softShadow)">
          <path d="M190 96 H338 L322 306 C318 334 300 350 264 350 H244 C208 350 190 334 186 306 Z" fill="#ffffff" stroke="#173f2a" strokeWidth="5" />
          <motion.path
            d="M204 190 C230 178 260 202 286 190 C306 182 322 184 330 190 L314 304 C312 318 298 326 270 326 H238 C212 326 204 318 202 304 Z"
            fill="url(#heroOrange)"
            animate={waveAnimation}
            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <path d="M222 137 H310" stroke="#d8f0df" strokeWidth="21" strokeLinecap="round" />
          <circle cx="236" cy="246" r="6" fill="#173f2a" />
          <circle cx="282" cy="246" r="6" fill="#173f2a" />
          <path d="M247 266 C256 276 270 276 279 266" fill="none" stroke="#173f2a" strokeWidth="5" strokeLinecap="round" />
          <path d="M312 86 L348 34" stroke="#173f2a" strokeWidth="8" strokeLinecap="round" />
          <path d="M350 32 L366 48" stroke="#e11d48" strokeWidth="7" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={shouldReduceMotion ? undefined : { y: [0, 10, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          filter="url(#softShadow)"
        >
          <path d="M78 154 H176 L166 300 C164 322 150 334 124 334 H114 C88 334 74 322 72 300 Z" fill="#ffffff" stroke="#173f2a" strokeWidth="4" />
          <path d="M86 222 C108 212 128 230 148 222 C158 218 166 218 172 222 L160 296 C158 306 148 312 130 312 H104 C88 312 82 306 82 296 Z" fill="url(#heroGreen)" />
          <circle cx="106" cy="258" r="4.5" fill="#173f2a" />
          <circle cx="139" cy="258" r="4.5" fill="#173f2a" />
          <path d="M114 276 C122 284 132 284 140 276" fill="none" stroke="#173f2a" strokeWidth="4" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={shouldReduceMotion ? undefined : { y: [0, -12, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 5.3, repeat: Infinity, ease: "easeInOut" }}
          filter="url(#softShadow)"
        >
          <path d="M390 158 H486 L476 302 C474 324 460 336 434 336 H424 C398 336 384 324 382 302 Z" fill="#ffffff" stroke="#173f2a" strokeWidth="4" />
          <path d="M398 220 C418 208 440 232 462 220 C470 216 478 216 482 220 L470 296 C468 306 458 312 440 312 H416 C398 312 390 306 390 296 Z" fill="url(#heroPink)" />
          <circle cx="416" cy="258" r="4.5" fill="#173f2a" />
          <circle cx="449" cy="258" r="4.5" fill="#173f2a" />
          <path d="M423 276 C431 284 441 284 449 276" fill="none" stroke="#173f2a" strokeWidth="4" strokeLinecap="round" />
        </motion.g>

        <motion.g animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "126px 124px" }}>
          <circle cx="126" cy="124" r="29" fill="#f97316" />
          <circle cx="126" cy="124" r="21" fill="#ffd65a" />
          <path d="M126 103 V145 M105 124 H147 M111 109 L141 139 M141 109 L111 139" stroke="#fff7d6" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <motion.g animate={shouldReduceMotion ? undefined : { y: [0, -9, 0], rotate: [-4, 5, -4] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M402 86 C426 48 478 62 492 98 C466 112 428 112 402 86Z" fill="#16a34a" />
          <path d="M448 64 C444 90 436 104 422 114" fill="none" stroke="#0f5132" strokeWidth="4" strokeLinecap="round" />
          <path d="M410 112 L500 112 L455 156Z" fill="#ef4444" stroke="#173f2a" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="446" cy="126" r="3" fill="#173f2a" />
          <circle cx="462" cy="136" r="3" fill="#173f2a" />
        </motion.g>

        {[0, 1, 2, 3, 4, 5].map((bubble) => (
          <motion.circle
            key={bubble}
            cx={210 + bubble * 28}
            cy={116 + (bubble % 2) * 16}
            r={4 + (bubble % 3)}
            fill={bubble % 2 ? "#16a34a" : "#f97316"}
            animate={bubbleAnimation}
            transition={{ duration: 2.8, repeat: Infinity, delay: bubble * 0.28, ease: "easeOut" }}
          />
        ))}
      </motion.svg>
    </motion.div>
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

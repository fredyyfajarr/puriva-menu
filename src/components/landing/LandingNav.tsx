"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type LandingNavProps = {
  grabFoodUrl: string;
  shopeeFoodUrl: string;
  goFoodUrl: string;
  whatsappUrl: string;
};

const navItems = [
  { href: "/menu", label: "Menu" },
  { href: "#quality", label: "Kualitas" },
  { href: "#location", label: "Lokasi" },
];

export function LandingNav({ grabFoodUrl, shopeeFoodUrl, goFoodUrl, whatsappUrl }: LandingNavProps) {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const orderItems = [
    { href: grabFoodUrl, label: "GrabFood" },
    { href: shopeeFoodUrl, label: "ShopeeFood" },
    { href: goFoodUrl, label: "GoFood" },
    { href: whatsappUrl, label: "WhatsApp Bulk" },
  ];

  const closeMenus = () => {
    setIsOrderOpen(false);
    setIsMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#f0ddbc] bg-[#fff9ef]/95 backdrop-blur transition-shadow duration-300">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="text-lg font-black leading-none text-[#173f2a] transition duration-200 hover:text-[#d64e2a]">
          PURIVA
        </Link>

        <div className="hidden items-center gap-1 text-xs font-black uppercase tracking-[0.08em] text-[#65705e] md:flex">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-2 transition duration-200 hover:bg-[#fff1d5] hover:text-[#173f2a]"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-2 transition duration-200 hover:bg-[#fff1d5] hover:text-[#173f2a]"
              >
                {item.label}
              </a>
            ),
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOrderOpen((value) => !value)}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 transition duration-200 hover:bg-[#fff1d5] hover:text-[#173f2a]"
              aria-expanded={isOrderOpen}
            >
              Order
              <ChevronDown className={`transition duration-200 ${isOrderOpen ? "rotate-180" : "rotate-0"}`} size={14} strokeWidth={3} />
            </button>
            {isOrderOpen ? (
              <div className="animate-menu-panel absolute right-0 top-10 w-52 rounded-[8px] border border-[#e5d7bd] bg-white p-2 text-[#173f2a] shadow-xl">
                {orderItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsOrderOpen(false)}
                    className="flex rounded-[8px] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] transition duration-200 hover:bg-[#fff1d5]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((value) => !value)}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#e5d7bd] bg-white text-[#173f2a] transition duration-200 hover:bg-[#fff1d5] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
        >
          <Menu className={`absolute transition duration-200 ${isMobileOpen ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"}`} size={20} />
          <X className={`absolute transition duration-200 ${isMobileOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"}`} size={20} />
        </button>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-[#173f2a]/30 backdrop-blur-sm transition duration-300 md:hidden ${
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenus}
      />
      <aside
        className={`fixed right-0 top-0 z-40 h-dvh w-[82vw] max-w-sm border-l border-[#e5d7bd] bg-[#fff9ef] p-5 pt-20 shadow-2xl transition duration-300 md:hidden ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="grid gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#173f2a]">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link key={item.href} href={item.href} onClick={closeMenus} className="rounded-[8px] border border-[#e5d7bd] bg-white px-4 py-3">
                {item.label}
              </Link>
            ) : (
              <a key={item.href} href={item.href} onClick={closeMenus} className="rounded-[8px] border border-[#e5d7bd] bg-white px-4 py-3">
                {item.label}
              </a>
            ),
          )}
        </div>

        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7a5d21]">Order</p>
          <div className="mt-3 grid gap-2 text-sm font-black uppercase tracking-[0.08em]">
            {orderItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenus}
                className="rounded-[8px] border border-[#e5d7bd] bg-white px-4 py-3 text-[#173f2a]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </header>
  );
}

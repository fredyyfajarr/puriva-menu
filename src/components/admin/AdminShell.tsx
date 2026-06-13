"use client";

import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  FileClock,
  History,
  LogOut,
  Menu,
  Package,
  QrCode,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { signOutAction } from "@/app/admin/actions";
import type { MenuSectionSlug } from "@/domain/menu/types";

export type AdminProductNavItem = {
  slug: MenuSectionSlug;
  title: string;
  count?: number;
};

type AdminShellProps = {
  children: ReactNode;
  productItems: AdminProductNavItem[];
  activeProductSlug?: MenuSectionSlug;
  onProductSelect?: (slug: MenuSectionSlug) => void;
  isPreviewMode?: boolean;
  role?: string | null;
};

function getSectionTitle(item: AdminProductNavItem) {
  return item.slug === "cold-pressed-juice" ? "Cold-Pressed Juice" : item.title;
}

function SidebarGroup({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded-[8px] border border-[#ead8b7] bg-[#fffaf0]" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-black uppercase text-[#173f2a]">
        <span className="inline-flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDown className="text-[#7a5d21] transition-transform group-open:rotate-180" size={16} />
      </summary>
      <div className="grid gap-2 border-t border-[#ead8b7] p-2">{children}</div>
    </details>
  );
}

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span className="relative h-5 w-5" aria-hidden="true">
      <Menu
        size={20}
        className={`absolute inset-0 transition duration-200 ${
          isOpen ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <X
        size={20}
        className={`absolute inset-0 transition duration-200 ${
          isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
    </span>
  );
}

function AdminSidebarContent({
  productItems,
  activeProductSlug,
  onProductSelect,
  pathname,
  close,
  isPreviewMode,
  role,
}: {
  productItems: AdminProductNavItem[];
  activeProductSlug?: MenuSectionSlug;
  onProductSelect?: (slug: MenuSectionSlug) => void;
  pathname: string;
  close: () => void;
  isPreviewMode: boolean;
  role?: string | null;
}) {
  const isStaff = role === "staff";
  const operationItems = [
    { href: "/admin/order-management", label: "Order Management", icon: <ClipboardList size={16} /> },
    { href: "/admin/stock", label: "Stock Control", icon: <Package size={16} /> },
    { href: "/admin/tables", label: "QR Meja", icon: <QrCode size={16} /> },
    { href: "/admin/invoices", label: "Invoice", icon: <History size={16} /> },
    { href: "/admin/dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
    { href: "/admin/audit", label: "Audit Log", icon: <FileClock size={16} /> },
  ].filter((item) =>
    !isStaff || ["/admin/order-management", "/admin/stock", "/admin/invoices"].includes(item.href),
  );

  return (
    <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7a5d21]">
        <ShieldCheck size={15} />
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-black leading-tight text-[#173f2a]">Puriva Live Console</h1>
      <p className="mt-2 text-sm leading-6 text-[#65705e]">Kelola product, order, QR meja, dan payment dari satu panel.</p>

      <nav className="mt-5 grid gap-3">
        {!isStaff ? (
          <SidebarGroup title="Product" icon={<Package size={16} />}>
            {productItems.map((item) => {
              const isActive = pathname === "/admin" && item.slug === activeProductSlug;
              const className = `flex items-center justify-between rounded-[8px] border px-3 py-3 text-left text-sm font-black transition ${
                isActive ? "border-[#173f2a] bg-[#173f2a] text-white" : "border-[#ead8b7] bg-white text-[#4a4f45]"
              }`;

              if (onProductSelect) {
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => {
                      onProductSelect(item.slug);
                      close();
                    }}
                    className={className}
                  >
                    <span>{getSectionTitle(item)}</span>
                    {typeof item.count === "number" ? (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{item.count}</span>
                    ) : null}
                  </button>
                );
              }

              return (
                <Link
                  key={item.slug}
                  href={`/admin?section=${item.slug}`}
                  onClick={close}
                  className={className}
                >
                  <span>{getSectionTitle(item)}</span>
                  {typeof item.count === "number" ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{item.count}</span>
                  ) : null}
                </Link>
              );
            })}
          </SidebarGroup>
        ) : null}

        <SidebarGroup title="Operations" icon={<ClipboardList size={16} />}>
          {operationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center justify-between rounded-[8px] border px-3 py-3 text-left text-sm font-black transition hover:-translate-y-0.5 ${
                  isActive
                    ? "border-[#173f2a] bg-[#173f2a] text-white"
                    : "border-[#ead8b7] bg-white text-[#4a4f45]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </SidebarGroup>
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
  );
}

export function AdminShell({
  children,
  productItems,
  activeProductSlug,
  onProductSelect,
  isPreviewMode = false,
  role = null,
}: AdminShellProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#1f2f22]">
      <div className="sticky top-0 z-40 flex justify-end border-b border-[#e5d7bd] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#d9c8a7] bg-white text-[#173f2a]"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close admin menu" : "Open admin menu"}
        >
          <HamburgerIcon isOpen={isOpen} />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-30 bg-black/35 transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 w-[min(86vw,320px)] overflow-y-auto bg-[#f7f3ea] p-4 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebarContent
          productItems={productItems}
          activeProductSlug={activeProductSlug}
          onProductSelect={onProductSelect}
          pathname={pathname}
          close={close}
          isPreviewMode={isPreviewMode}
          role={role}
        />
      </aside>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <AdminSidebarContent
            productItems={productItems}
            activeProductSlug={activeProductSlug}
            onProductSelect={onProductSelect}
            pathname={pathname}
            close={close}
            isPreviewMode={isPreviewMode}
            role={role}
          />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
      <footer className="px-5 pb-6 text-center text-xs font-bold text-[#65705e]">
        Copyright 2026. Made with love by fredyyfajarr.
      </footer>
    </main>
  );
}

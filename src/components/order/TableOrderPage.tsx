"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { createTableOrderAction } from "@/app/table/actions";
import { formatShortIdr } from "@/domain/menu/format";
import { groupColdPressedByCategory } from "@/domain/menu/group-cold-pressed";
import type { MenuCatalog, MenuEntry, MenuSection } from "@/domain/menu/types";
import type { DiningTable, OrderItemInput, PaymentMethod } from "@/domain/order/types";

type CartItem = OrderItemInput & {
  key: string;
};

type TableOrderPageProps = {
  catalog: MenuCatalog;
  table: DiningTable;
  errorMessage?: string | null;
};

const paymentOptions: Array<{ value: PaymentMethod; label: string; helper: string }> = [
  { value: "cash", label: "Cash", helper: "Bayar tunai saat pesanan dikonfirmasi kasir." },
  { value: "edc_bca", label: "EDC BCA", helper: "Bayar kartu/debit BCA di kasir." },
  { value: "qris_static", label: "QRIS Static", helper: "Scan QRIS toko di kasir, lalu kasir mark paid." },
  { value: "dynamic_qris", label: "Dynamic QRIS", helper: "QRIS nominal otomatis. Status akan update setelah payment settled." },
];

function getSectionTitle(section: MenuSection) {
  return section.slug === "cold-pressed-juice" ? "Cold-Pressed Juice" : section.title;
}

function getPrice(entry: MenuEntry, section: MenuSection) {
  return entry.priceIdr ?? section.priceIdr ?? 0;
}

function makeCartKey(entry: MenuEntry, variantLabel: string | null) {
  return `${entry.id}:${variantLabel ?? "default"}`;
}

function getMenuImage(entry: MenuEntry, variantLabel?: string | null) {
  if (variantLabel && entry.mixImageUrls[variantLabel]) {
    return entry.mixImageUrls[variantLabel];
  }

  return entry.imageUrl ?? Object.values(entry.mixImageUrls)[0] ?? null;
}

function MenuThumb({
  imageUrl,
  accentColor,
  label,
  size = "md",
}: {
  imageUrl: string | null;
  accentColor: string;
  label: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-14 w-14" : "h-16 w-16";

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-[8px] border border-[#ead8b7] bg-[#fffaf0]`}>
      {imageUrl ? (
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${imageUrl}")` }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#fff7e6]">
          <div className="relative h-10 w-7 rounded-b-[12px] rounded-t-[5px] border-2 border-[#173f2a] bg-white">
            <div
              className="absolute bottom-1 left-1 right-1 rounded-b-[9px] rounded-t-[4px]"
              style={{ top: size === "sm" ? "46%" : "42%", backgroundColor: accentColor }}
            />
            <div className="absolute left-1/2 top-1 h-1.5 w-4 -translate-x-1/2 rounded-full bg-[#d9f0df]" />
            <span className="sr-only">{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TableOrderPage({ catalog, table, errorMessage }: TableOrderPageProps) {
  const sections = catalog.sections.filter((section) => section.isActive);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const subtotal = cart.reduce((total, item) => total + item.quantity * item.unitPriceIdr, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const itemsJson = useMemo(
    () =>
      JSON.stringify(
        cart.map((item) => ({
          menuEntryId: item.menuEntryId,
          itemName: item.itemName,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
          unitPriceIdr: item.unitPriceIdr,
          notes: item.notes,
        })),
      ),
    [cart],
  );

  function addItem(entry: MenuEntry, section: MenuSection, variantLabel: string | null = null) {
    const key = makeCartKey(entry, variantLabel);
    const unitPriceIdr = getPrice(entry, section);

    setCart((items) => {
      const existing = items.find((item) => item.key === key);

      if (existing) {
        return items.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...items,
        {
          key,
          menuEntryId: entry.id,
          itemName: entry.name,
          variantLabel,
          quantity: 1,
          unitPriceIdr,
          notes: null,
        },
      ];
    });
  }

  function changeQuantity(key: string, direction: -1 | 1) {
    setCart((items) =>
      items.flatMap((item) => {
        if (item.key !== key) return [item];
        const nextQuantity = item.quantity + direction;
        return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
      }),
    );
  }

  function updateItemNote(key: string, notes: string) {
    setCart((items) =>
      items.map((item) => (item.key === key ? { ...item, notes: notes.trim() ? notes : null } : item)),
    );
  }

  return (
    <main className="min-h-screen bg-[#fff9ef] text-[#233224]">
      <a
        href="#cart-panel"
        className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-[8px] bg-[#173f2a] px-4 text-sm font-black uppercase text-white shadow-lg lg:hidden"
      >
        <ShoppingBag size={18} />
        Cart {cartCount > 0 ? `(${cartCount})` : ""}
      </a>

      <section className="border-b border-[#f0ddbc] bg-[#fffdf7]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 sm:px-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7a35]">
            QR order {table.label}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-none text-[#173f2a]">Puriva Live Order</h1>
              <p className="mt-2 text-sm leading-6 text-[#5f6d58]">
                Pilih menu, submit order, lalu pesanan masuk ke kasir.
              </p>
            </div>
            <div className="rounded-[8px] border border-[#f0ddbc] bg-white px-4 py-3 text-sm font-black text-[#173f2a]">
              {table.code}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {errorMessage ? (
            <div className="rounded-[8px] border border-[#efc5bd] bg-[#fff0ed] p-4 text-sm font-bold text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}
          {sections.map((section) => (
            <section key={section.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black uppercase text-[#173f2a]">{getSectionTitle(section)}</h2>
                  <p className="mt-1 text-sm text-[#687460]">{section.description}</p>
                </div>
                {section.priceIdr ? <p className="shrink-0 text-xl font-black text-[#1687a7]">{formatShortIdr(section.priceIdr)}</p> : null}
              </div>

              {section.slug === "cold-pressed-juice" ? (
                <div className="space-y-3">
                  {groupColdPressedByCategory(section.entries).map((category) => (
                    <div key={category.slug} className="rounded-[8px] border border-[#f0ddbc] bg-white p-4 shadow-sm">
                      <h3 className="text-lg font-black uppercase text-[#173f2a]">{category.title}</h3>
                      <div className="mt-3 grid gap-4 xl:grid-cols-2">
                        {category.groups.map((group) => {
                          const entry = section.entries.find((item) => item.id === group.entryId);
                          if (!entry) return null;

                          return (
                            <div key={group.baseName} className="min-w-0 rounded-[8px] border border-[#f3e5cd] bg-[#fffaf0] p-3">
                              <p className="break-words font-black uppercase text-[#233224]">{group.baseName} Base</p>
                              <p className="mt-1 text-xs font-bold text-[#7a5d21]">{group.benefit}</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                {group.mixes.map((mix) => (
                                  <button
                                    key={mix}
                                    type="button"
                                    onClick={() => addItem(entry, section, mix)}
                                    className="grid min-h-20 min-w-0 grid-cols-[56px_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-[8px] border border-[#d9c8a7] bg-white p-2 text-left text-xs font-black uppercase text-[#173f2a] transition hover:-translate-y-0.5 hover:shadow-sm"
                                  >
                                    <MenuThumb
                                      imageUrl={getMenuImage(entry, mix)}
                                      accentColor={entry.accentColor}
                                      label={mix}
                                      size="sm"
                                    />
                                    <span className="grid min-w-0 gap-1 overflow-hidden">
                                      <span className="flex min-w-0 items-start gap-1 leading-4">
                                        <Plus size={13} className="mt-0.5 shrink-0" />
                                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{mix}</span>
                                      </span>
                                      {entry.mixNotes[mix] ? (
                                        <span className="line-clamp-2 min-w-0 normal-case leading-4 text-[#65705e] [overflow-wrap:anywhere]">
                                          {entry.mixNotes[mix]}
                                        </span>
                                      ) : null}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.entries.map((entry) => (
                    <div key={entry.id} className="rounded-[8px] border border-[#f0ddbc] bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <MenuThumb imageUrl={getMenuImage(entry)} accentColor={entry.accentColor} label={entry.name} />
                          <div className="min-w-0">
                          <p className="font-black uppercase text-[#233224]">{entry.name}</p>
                          {entry.benefit ? <p className="mt-1 text-sm leading-6 text-[#687460]">{entry.benefit}</p> : null}
                          <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#1687a7]">
                            {formatShortIdr(getPrice(entry, section))}
                          </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(entry, section)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#173f2a] text-white transition hover:-translate-y-0.5"
                          aria-label={`Add ${entry.name}`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <aside id="cart-panel" className="scroll-mt-5 lg:sticky lg:top-5 lg:self-start">
          <form action={createTableOrderAction} className="flex flex-col rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm lg:max-h-[calc(100vh-2.5rem)]">
            <input type="hidden" name="tableToken" value={table.qrToken} />
            <input type="hidden" name="itemsJson" value={itemsJson} />
            <div className="shrink-0 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black text-[#173f2a]">
                <ShoppingBag size={20} />
                Cart
              </h2>
              <p className="text-sm font-black text-[#1687a7]">{formatShortIdr(subtotal)}</p>
            </div>

            <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
              <div className="grid gap-2">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.key} className="rounded-[8px] border border-[#f3e5cd] bg-[#fffaf0] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black uppercase text-[#233224]">{item.itemName}</p>
                          {item.variantLabel ? <p className="mt-1 text-xs font-bold text-[#7a5d21]">{item.variantLabel}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCart((items) => items.filter((cartItem) => cartItem.key !== item.key))}
                          className="text-[#b42318]"
                          aria-label={`Remove ${item.itemName}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2">
                          <button type="button" onClick={() => changeQuantity(item.key, -1)} className="h-8 w-8 rounded-[8px] border border-[#d9c8a7]">
                            <Minus className="mx-auto" size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                          <button type="button" onClick={() => changeQuantity(item.key, 1)} className="h-8 w-8 rounded-[8px] border border-[#d9c8a7]">
                            <Plus className="mx-auto" size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-black text-[#1687a7]">{formatShortIdr(item.quantity * item.unitPriceIdr)}</p>
                      </div>
                      <label className="mt-3 grid gap-1 text-xs font-bold text-[#4a4f45]">
                        Note item
                        <input
                          value={item.notes ?? ""}
                          onChange={(event) => updateItemNote(item.key, event.target.value)}
                          className="h-9 rounded-[8px] border border-[#d9c8a7] bg-white px-3 text-sm font-medium"
                          placeholder="Contoh: less ice, tanpa lemon"
                        />
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[8px] border border-dashed border-[#d9c8a7] bg-[#fffaf0] p-4 text-sm text-[#687460]">
                    Cart masih kosong.
                  </div>
                )}
              </div>

              <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
                Nama opsional
                <input
                  name="customerName"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium"
                  placeholder="Nama customer"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
                Catatan order
                <textarea
                  name="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-20 rounded-[8px] border border-[#d9c8a7] px-3 py-2 font-medium"
                  placeholder="Contoh: antar ke meja, less ice"
                />
              </label>

              <fieldset className="grid gap-2">
                <legend className="text-sm font-bold text-[#4a4f45]">Payment method</legend>
                <div className="grid gap-2">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`grid cursor-pointer gap-1 rounded-[8px] border p-3 transition ${
                        paymentMethod === option.value
                          ? "border-[#173f2a] bg-[#eff8f1]"
                          : "border-[#d9c8a7] bg-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={paymentMethod === option.value}
                          onChange={() => setPaymentMethod(option.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-black uppercase text-[#173f2a]">{option.label}</span>
                      </span>
                      <span className="pl-6 text-xs font-semibold leading-5 text-[#65705e]">{option.helper}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <button
              disabled={cart.length === 0}
              className="mt-4 h-12 w-full shrink-0 rounded-[8px] bg-[#173f2a] px-4 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Submit order
            </button>
          </form>
        </aside>
      </div>
      <footer className="border-t border-[#f0ddbc] px-5 py-6 text-center text-xs font-bold text-[#65705e]">
        Copyright 2026. Made with love by fredyyfajarr.
      </footer>
    </main>
  );
}

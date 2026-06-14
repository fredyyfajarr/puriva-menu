"use client";

import { Download, ExternalLink, Plus, Printer, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  regenerateDiningTableQrTokenAction,
  toggleDiningTableAction,
  upsertDiningTableAction,
} from "@/app/admin/tables/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { DiningTable } from "@/domain/order/types";

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export function AdminTableManager({
  tables,
  origin,
  isPreviewMode,
}: {
  tables: DiningTable[];
  origin: string;
  isPreviewMode: boolean;
}) {
  const [query, setQuery] = useState("");
  const filteredTables = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return tables;

    return tables.filter((table) =>
      [table.code, table.label].join(" ").toLowerCase().includes(normalizedQuery),
    );
  }, [query, tables]);

  return (
        <div className="min-w-0 space-y-5">
          <AdminPageHeader
            eyebrow="Operations"
            title="QR Meja"
            description="Tambah meja baru, lalu cetak QR yang mengarah ke halaman order masing-masing meja."
          />
          <section className="rounded-[8px] border border-[#dbe8dd] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2f6b46]">QR Generator</p>
                <h2 className="mt-1 text-2xl font-black text-[#173f2a] sm:text-3xl">Manage meja</h2>
                <p className="mt-1 text-sm leading-6 text-[#65705e]">
                  Kalau meja bertambah dari 4 ke 6, tinggal add T05 dan T06. Link QR pakai token acak supaya meja tidak mudah ditebak.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#2f6b46]" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search meja..."
                    className="h-11 w-full rounded-[8px] border border-[#c9decf] bg-white pl-10 pr-3 text-sm font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#c9decf] bg-white px-4 text-sm font-black uppercase text-[#173f2a]"
                >
                  <Printer size={16} />
                  Print QR
                </button>
              </div>
            </div>

            <form action={upsertDiningTableAction} className="mt-4 grid gap-3 rounded-[8px] border border-[#dbe8dd] bg-[#f6fbf7] p-3 sm:grid-cols-[140px_minmax(0,1fr)_auto_auto] sm:items-end">
              <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
                Code
                <input
                  name="code"
                  placeholder="T05"
                  onBlur={(event) => {
                    event.currentTarget.value = normalizeCode(event.currentTarget.value);
                  }}
                  disabled={isPreviewMode}
                  className="h-11 rounded-[8px] border border-[#c9decf] bg-white px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
                Label
                <input
                  name="label"
                  placeholder="Table 05"
                  disabled={isPreviewMode}
                  className="h-11 rounded-[8px] border border-[#c9decf] bg-white px-3 font-medium disabled:cursor-not-allowed disabled:opacity-45"
                  required
                />
              </label>
              <label className="flex h-11 items-center gap-2 text-sm font-bold text-[#4a4f45]">
                <input name="isActive" type="checkbox" defaultChecked disabled={isPreviewMode} className="h-4 w-4" />
                Active
              </label>
              <button
                disabled={isPreviewMode}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#173f2a] px-4 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Plus size={17} />
                Add table
              </button>
            </form>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTables.map((table) => {
              const tableUrl = `${origin}/table/${encodeURIComponent(table.qrToken)}`;
              const qrUrl = `/admin/tables/${encodeURIComponent(table.qrToken)}/qr.svg`;

              return (
                <article key={table.id} className="min-w-0 rounded-[8px] border border-[#dbe8dd] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2f6b46]">{table.code}</p>
                      <h3 className="mt-1 truncate text-2xl font-black text-[#173f2a]">{table.label}</h3>
                      <p className="mt-1 break-all text-xs font-semibold text-[#65705e]">{tableUrl}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                        table.isActive ? "bg-[#e8f5eb] text-[#16824a]" : "bg-[#fff0ed] text-[#b42318]"
                      }`}
                    >
                      {table.isActive ? "Active" : "Off"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[136px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-[8px] border border-[#dbe8dd] bg-[#ffffff] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl} alt={`QR ${table.label}`} className="aspect-square w-full rounded-[6px]" />
                    </div>
                    <div className="grid content-between gap-2">
                      <div className="grid gap-2">
                        <a
                          href={tableUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#c9decf] bg-white px-3 text-sm font-bold text-[#4a4f45]"
                        >
                          <ExternalLink size={16} />
                          Open order
                        </a>
                        <a
                          href={qrUrl}
                          download={`${table.code}-puriva-qr.svg`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#173f2a] px-3 text-sm font-black text-white"
                        >
                          <Download size={16} />
                          Download QR
                        </a>
                      </div>
                      <form action={regenerateDiningTableQrTokenAction}>
                        <input type="hidden" name="id" value={table.id} />
                        <button
                          disabled={isPreviewMode}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-[#c9decf] bg-white px-3 text-sm font-bold text-[#4a4f45] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <RefreshCw size={16} />
                          Regenerate QR
                        </button>
                      </form>
                      <form action={toggleDiningTableAction}>
                        <input type="hidden" name="id" value={table.id} />
                        <input type="hidden" name="isActive" value={String(table.isActive)} />
                        <button
                          disabled={isPreviewMode}
                          className="h-10 w-full rounded-[8px] border border-[#c9decf] bg-[#f6fbf7] px-3 text-sm font-bold text-[#4a4f45] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {table.isActive ? "Disable QR" : "Enable QR"}
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="qr-print-area" aria-hidden="true">
            {filteredTables.map((table) => {
              const qrUrl = `/admin/tables/${encodeURIComponent(table.qrToken)}/qr.svg`;

              return (
                <article key={table.id} className="qr-print-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="" className="qr-print-image" />
                  <p className="qr-print-code">{table.code}</p>
                  <p className="qr-print-label">{table.label}</p>
                </article>
              );
            })}
          </section>
        </div>
  );
}

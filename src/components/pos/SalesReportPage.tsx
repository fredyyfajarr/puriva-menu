"use client";

import { BarChart3, CalendarDays, Clock3, CreditCard, Percent, ReceiptText, Table2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatShortIdr } from "@/domain/menu/format";
import type { OrderStatus, SalesReport, SalesReportPeriod } from "@/domain/order/types";

const periodTabs: Array<{ period: SalesReportPeriod; label: string }> = [
  { period: "day", label: "Daily" },
  { period: "week", label: "Weekly" },
  { period: "month", label: "Monthly" },
  { period: "year", label: "Yearly" },
];

const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  edc_bca: "EDC BCA",
  qris_static: "QRIS Static",
  dynamic_qris: "Dynamic QRIS",
  cashier: "Cashier",
  unknown: "Unknown",
};

const statusLabels: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  canceled: "Canceled",
};

const chartColors = ["#1687a7", "#173f2a", "#d97706", "#be123c", "#65a30d", "#7a5d21"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00`));
}

function buildPeriodHref(period: SalesReportPeriod, date: string) {
  return `/admin/dashboard?period=${period}&date=${date}`;
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[8px] border border-[#e5d7bd] bg-white px-3 py-2 text-xs shadow-sm">
      {label ? <p className="mb-1 font-black uppercase text-[#173f2a]">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name} className="font-bold text-[#65705e]">
          <span style={{ color: item.color ?? "#1687a7" }}>{item.name}</span>: {formatShortIdr(Number(item.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

function CountTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[8px] border border-[#e5d7bd] bg-white px-3 py-2 text-xs shadow-sm">
      {label ? <p className="mb-1 font-black uppercase text-[#173f2a]">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name} className="font-bold text-[#65705e]">
          <span style={{ color: item.color ?? "#1687a7" }}>{item.name}</span>: {Number(item.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function ChartPanel({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">
            {icon}
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black text-[#173f2a]">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-[8px] bg-[#fffaf0] p-6 text-center text-sm font-semibold text-[#65705e]">
      {label}
    </div>
  );
}

export function SalesReportPage({ report, selectedDate }: { report: SalesReport; selectedDate: string }) {
  const router = useRouter();
  const anchorDate = selectedDate;
  const dailyChart = report.dailySales.map((item) => ({
    date: item.date,
    label: shortDate(item.date),
    paidSalesIdr: item.paidSalesIdr,
    invoiceCount: item.invoiceCount,
  }));
  const hourlyChart = report.hourlySales.map((item) => ({
    hour: item.hour,
    label: formatHour(item.hour),
    paidSalesIdr: item.paidSalesIdr,
    invoiceCount: item.invoiceCount,
  }));
  const paymentChart = report.paymentBreakdown.map((item) => ({
    name: paymentMethodLabels[item.method] ?? item.method,
    value: item.totalIdr,
    count: item.count,
  }));
  const statusChart = report.statusBreakdown.map((item) => ({
    name: statusLabels[item.status],
    count: item.count,
    totalIdr: item.totalIdr,
  }));
  const tableChart = report.tableBreakdown.map((item) => ({
    name: item.tableCode,
    label: item.tableLabel,
    totalIdr: item.totalIdr,
    count: item.count,
  }));
  const topItemChart = report.topItems.slice(0, 8).map((item) => ({
    name: item.name,
    totalIdr: item.totalIdr,
    quantity: item.quantity,
  }));
  const categoryChart = report.categoryBreakdown.slice(0, 8).map((item) => ({
    name: item.category,
    totalIdr: item.totalIdr,
    quantity: item.quantity,
  }));

  return (
    <div className="text-[#1f2f22]">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Analytics Dashboard"
        description={`Periode ${formatDate(report.dateFrom)} sampai ${formatDate(report.dateTo)}.`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {periodTabs.map((tab) => (
          <Link
            key={tab.period}
            href={buildPeriodHref(tab.period, anchorDate)}
            className={`rounded-[8px] border px-4 py-2 text-sm font-black uppercase ${
              report.period === tab.period
                ? "border-[#173f2a] bg-[#173f2a] text-white"
                : "border-[#d9c8a7] bg-white text-[#4a4f45]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form className="mb-5 grid gap-3 rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm sm:grid-cols-[220px_auto] sm:items-end">
        <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
          Tanggal rekap
          <input
            type="date"
            defaultValue={anchorDate}
            className="h-11 rounded-[8px] border border-[#d9c8a7] bg-white px-3 font-medium"
            onChange={(event) => {
              router.push(buildPeriodHref(report.period, event.currentTarget.value));
            }}
          />
        </label>
        <p className="text-sm leading-6 text-[#65705e]">
          Daily merekap tanggal ini. Weekly, monthly, dan yearly memakai tanggal ini sebagai acuan periode.
        </p>
      </form>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">
            <TrendingUp size={15} />
            Paid sales
          </p>
          <p className="mt-2 text-3xl font-black text-[#1687a7]">{formatShortIdr(report.paidSalesIdr)}</p>
        </div>
        <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">Gross completed</p>
          <p className="mt-2 text-3xl font-black text-[#173f2a]">{formatShortIdr(report.grossSalesIdr)}</p>
        </div>
        <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">
            <ReceiptText size={15} />
            Invoice
          </p>
          <p className="mt-2 text-3xl font-black text-[#173f2a]">{report.invoiceCount}</p>
        </div>
        <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">
            <CalendarDays size={15} />
            Avg order
          </p>
          <p className="mt-2 text-3xl font-black text-[#1687a7]">{formatShortIdr(report.averageOrderValueIdr)}</p>
        </div>
      </section>

      <section className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">
            <Percent size={15} />
            Paid rate
          </p>
          <p className="mt-2 text-3xl font-black text-[#173f2a]">{report.paidRate}%</p>
          <p className="mt-1 text-xs font-semibold text-[#65705e]">Persentase invoice yang sudah paid di periode ini.</p>
        </div>
        <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#7a5d21]">
            <Percent size={15} />
            Cancel rate
          </p>
          <p className="mt-2 text-3xl font-black text-[#be123c]">{report.cancelRate}%</p>
          <p className="mt-1 text-xs font-semibold text-[#65705e]">Dipakai buat pantau issue stok, salah order, atau pembayaran gagal.</p>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <ChartPanel eyebrow="Revenue" title="Paid sales trend" icon={<BarChart3 size={15} />}>
          {dailyChart.some((item) => item.paidSalesIdr > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChart} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="paidSalesGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#1687a7" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#1687a7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f0e4cf" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatShortIdr(Number(value))} width={70} />
                  <Tooltip content={<MoneyTooltip />} />
                  <Area type="monotone" dataKey="paidSalesIdr" name="Paid sales" stroke="#1687a7" strokeWidth={3} fill="url(#paidSalesGradient)" activeDot={{ r: 5, fill: "#173f2a" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada paid sales di periode ini." />
          )}
        </ChartPanel>

        <ChartPanel eyebrow="Payment" title="Payment mix" icon={<CreditCard size={15} />}>
          {paymentChart.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={102} paddingAngle={3}>
                    {paymentChart.map((item, index) => (
                      <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<MoneyTooltip />} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada paid payment di periode ini." />
          )}
        </ChartPanel>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartPanel eyebrow="Demand" title="Jam ramai order" icon={<Clock3 size={15} />}>
          {hourlyChart.some((item) => item.invoiceCount > 0) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyChart} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f0e4cf" vertical={false} />
                  <XAxis dataKey="label" interval={2} tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CountTooltip />} />
                  <Bar dataKey="invoiceCount" name="Invoice" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada pola jam ramai di periode ini." />
          )}
        </ChartPanel>

        <ChartPanel eyebrow="Operations" title="Status invoice" icon={<ReceiptText size={15} />}>
          {statusChart.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart} layout="vertical" margin={{ top: 10, right: 18, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#f0e4cf" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={86} tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CountTooltip />} />
                  <Bar dataKey="count" name="Invoice" fill="#173f2a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada status invoice di periode ini." />
          )}
        </ChartPanel>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartPanel eyebrow="Tables" title="Revenue per meja" icon={<Table2 size={15} />}>
          {tableChart.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableChart} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f0e4cf" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatShortIdr(Number(value))} width={70} />
                  <Tooltip content={<MoneyTooltip />} />
                  <Bar dataKey="totalIdr" name="Revenue" fill="#65a30d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada revenue meja di periode ini." />
          )}
        </ChartPanel>

        <ChartPanel eyebrow="Products" title="Menu terlaris" icon={<BarChart3 size={15} />}>
          {topItemChart.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItemChart} layout="vertical" margin={{ top: 10, right: 18, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#f0e4cf" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatShortIdr(Number(value))} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<MoneyTooltip />} />
                  <Bar dataKey="totalIdr" name="Revenue" fill="#be123c" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada item terjual di periode ini." />
          )}
        </ChartPanel>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartPanel eyebrow="BI" title="Kontribusi menu base" icon={<BarChart3 size={15} />}>
          {categoryChart.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} layout="vertical" margin={{ top: 10, right: 18, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#f0e4cf" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatShortIdr(Number(value))} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<MoneyTooltip />} />
                  <Bar dataKey="totalIdr" name="Revenue" fill="#d97706" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada data kontribusi menu di periode ini." />
          )}
        </ChartPanel>

        <ChartPanel eyebrow="BI" title="Quantity menu base" icon={<ReceiptText size={15} />}>
          {categoryChart.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f0e4cf" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#65705e", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CountTooltip />} />
                  <Bar dataKey="quantity" name="Quantity" fill="#1687a7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada quantity menu di periode ini." />
          )}
        </ChartPanel>
      </section>
    </div>
  );
}

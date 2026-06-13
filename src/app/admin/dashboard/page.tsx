import { redirect } from "next/navigation";

import { getAdminMenuCatalog } from "@/application/menu/get-menu-catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { SalesReportPage } from "@/components/pos/SalesReportPage";
import type { SalesReportPeriod } from "@/domain/order/types";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<{
    period?: string;
    date?: string;
  }>;
};

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseAnchorDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getDateRange(period: SalesReportPeriod, anchorDate = new Date()) {
  const start = new Date(anchorDate);
  const end = new Date(anchorDate);

  if (period === "week") {
    const day = anchorDate.getDay() || 7;
    start.setDate(anchorDate.getDate() - day + 1);
    end.setDate(start.getDate() + 6);
  }

  if (period === "month") {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 0);
  }

  if (period === "year") {
    start.setMonth(0, 1);
    end.setMonth(11, 31);
  }

  return {
    dateFrom: toDateString(start),
    dateTo: toDateString(end),
  };
}

function parsePeriod(value?: string): SalesReportPeriod {
  if (value === "week" || value === "month" || value === "year") return value;
  return "day";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const catalog = await getAdminMenuCatalog();
  const productItems = catalog.sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    count: section.entries.length,
  }));
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const period = "day";
    const selectedDate = toDateString(new Date());
    const range = getDateRange(period);
    return (
      <AdminShell productItems={productItems} isPreviewMode>
        <SalesReportPage
          selectedDate={selectedDate}
          report={{
            period,
            ...range,
            grossSalesIdr: 0,
            paidSalesIdr: 0,
            invoiceCount: 0,
            completedCount: 0,
            canceledCount: 0,
            averageOrderValueIdr: 0,
            paymentBreakdown: [],
            statusBreakdown: [],
            tableBreakdown: [],
            hourlySales: Array.from({ length: 24 }, (_, hour) => ({ hour, paidSalesIdr: 0, invoiceCount: 0 })),
            topItems: [],
            categoryBreakdown: [],
            cancelRate: 0,
            paidRate: 0,
            dailySales: [],
          }}
        />
      </AdminShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!["owner", "admin"].includes(profile?.role ?? "")) {
    redirect("/admin");
  }

  const params = await searchParams;
  const period = parsePeriod(params?.period);
  const anchorDate = parseAnchorDate(params?.date);
  const selectedDate = toDateString(anchorDate);
  const range = getDateRange(period, anchorDate);
  const report = await createOrderRepository().getSalesReport({ period, ...range });

  return (
    <AdminShell productItems={productItems}>
      <SalesReportPage report={report} selectedDate={selectedDate} />
    </AdminShell>
  );
}

import { redirect } from "next/navigation";

import { getAdminMenuCatalog } from "@/application/menu/get-menu-catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrderHistoryPage } from "@/components/pos/OrderHistoryPage";
import { getInvoiceFilterValues } from "@/domain/order/invoice-filters";
import type { OrderStatus } from "@/domain/order/types";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

type InvoicesPageProps = {
  searchParams?: Promise<{
    status?: string;
    period?: string;
    date?: string;
    weekFrom?: string;
    weekTo?: string;
    month?: string;
    year?: string;
  }>;
};

function getStatusFilter(status?: string): { activeFilter: string; statuses: OrderStatus[] } {
  if (status === "all") {
    return { activeFilter: "all", statuses: ["completed", "canceled", "ready", "preparing", "new"] };
  }

  if (status === "canceled") {
    return { activeFilter: "canceled", statuses: ["canceled"] };
  }

  return { activeFilter: "completed", statuses: ["completed"] };
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const catalog = await getAdminMenuCatalog();
  const productItems = catalog.sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    count: section.entries.length,
  }));
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const filterValues = getInvoiceFilterValues();

    return (
      <AdminShell productItems={productItems} isPreviewMode>
        <OrderHistoryPage orders={[]} activeFilter="completed" filterValues={filterValues} />
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

  if (!["owner", "admin", "staff"].includes(profile?.role ?? "")) {
    redirect("/admin");
  }

  const params = await searchParams;
  const filter = getStatusFilter(params?.status);
  const filterValues = getInvoiceFilterValues(params);
  const orders = await createOrderRepository().listOrders({
    statuses: filter.statuses,
    limit: 200,
    dateFrom: filterValues.dateFrom,
    dateTo: filterValues.dateTo,
  });

  return (
    <AdminShell productItems={productItems} role={profile?.role}>
      <OrderHistoryPage orders={orders} activeFilter={filter.activeFilter} filterValues={filterValues} />
    </AdminShell>
  );
}

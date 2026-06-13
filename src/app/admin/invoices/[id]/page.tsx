import { notFound, redirect } from "next/navigation";

import { getAdminMenuCatalog } from "@/application/menu/get-menu-catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { InvoiceDetailPage } from "@/components/pos/InvoiceDetailPage";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getAdminMenuCatalog();
  const productItems = catalog.sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    count: section.entries.length,
  }));
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    notFound();
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

  const order = await createOrderRepository().getOrderById(id);
  const payment = await createOrderRepository().getLatestPaymentByOrderId(id);

  if (!order) {
    notFound();
  }

  return (
    <AdminShell productItems={productItems} role={profile?.role}>
      <InvoiceDetailPage order={order} payment={payment} />
    </AdminShell>
  );
}

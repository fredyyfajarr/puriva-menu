import { redirect } from "next/navigation";

import { getAdminMenuCatalog } from "@/application/menu/get-menu-catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { PosBoard } from "@/components/pos/PosBoard";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderManagementPage() {
  const catalog = await getAdminMenuCatalog();
  const productItems = catalog.sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    count: section.entries.length,
  }));
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <AdminShell productItems={productItems} isPreviewMode>
        <PosBoard orders={[]} />
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

  const orders = await createOrderRepository().listActiveOrders();
  return (
    <AdminShell productItems={productItems} role={profile?.role}>
      <PosBoard orders={orders} />
    </AdminShell>
  );
}

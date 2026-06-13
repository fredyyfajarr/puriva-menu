import { redirect } from "next/navigation";

import { getAdminMenuCatalog } from "@/application/menu/get-menu-catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuditLogPage } from "@/components/pos/AuditLogPage";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
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
        <AuditLogPage logs={[]} />
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

  const logs = await createOrderRepository().listAuditLogs(150);

  return (
    <AdminShell productItems={productItems}>
      <AuditLogPage logs={logs} />
    </AdminShell>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminMenuCatalog } from "@/application/menu/get-menu-catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTableManager } from "@/components/admin/AdminTableManager";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminTablesPage() {
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
        <AdminTableManager tables={[]} origin="http://localhost:3000" isPreviewMode />
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

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const tables = await createOrderRepository().listDiningTables();

  return (
    <AdminShell productItems={productItems}>
      <AdminTableManager tables={tables} origin={`${protocol}://${host}`} isPreviewMode={false} />
    </AdminShell>
  );
}

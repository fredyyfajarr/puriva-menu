import { redirect } from "next/navigation";

import { getAdminMenuCatalog } from "@/application/menu/get-menu-catalog";
import { AdminMenuEditor } from "@/components/admin/AdminMenuEditor";
import type { MenuSectionSlug } from "@/domain/menu/types";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    section?: string;
  }>;
};

function parseSectionSlug(value?: string): MenuSectionSlug | undefined {
  if (
    value === "cut-fruits" ||
    value === "blended-juice" ||
    value === "pre-made-juice" ||
    value === "cold-pressed-juice"
  ) {
    return value;
  }

  return undefined;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const initialSectionSlug = parseSectionSlug(params?.section);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const catalog = await getAdminMenuCatalog();
    return <AdminMenuEditor catalog={catalog} initialSectionSlug={initialSectionSlug} isPreviewMode />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role === "staff") {
    redirect("/admin/order-management");
  }

  if (!["owner", "admin"].includes(profile?.role ?? "")) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-5 text-[#1f2f22]">
        <div className="max-w-md rounded-[8px] border border-[#e5d7bd] bg-white p-6">
          <h1 className="text-2xl font-black text-[#173f2a]">No admin access</h1>
          <p className="mt-2 text-sm text-[#65705e]">
            Akun ini sudah login, tapi belum punya role owner/admin di table profiles.
          </p>
        </div>
      </main>
    );
  }

  const catalog = await getAdminMenuCatalog();
  return <AdminMenuEditor catalog={catalog} initialSectionSlug={initialSectionSlug} isPreviewMode={false} />;
}

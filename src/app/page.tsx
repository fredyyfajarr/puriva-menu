import { getPublicMenuCatalog } from "@/application/menu/get-menu-catalog";
import { MenuPage } from "@/components/menu/MenuPage";
import { getSupabaseEnv } from "@/infrastructure/supabase/env";

export default async function Home() {
  const catalog = await getPublicMenuCatalog();
  const { isConfigured } = getSupabaseEnv();

  return <MenuPage catalog={catalog} isPreviewMode={!isConfigured} />;
}

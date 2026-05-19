import { createMenuRepository } from "@/infrastructure/supabase/menu-repository";

export async function getPublicMenuCatalog() {
  const repository = createMenuRepository();
  return repository.getCatalog();
}

export async function getAdminMenuCatalog() {
  const repository = createMenuRepository();
  return repository.getAdminCatalog();
}

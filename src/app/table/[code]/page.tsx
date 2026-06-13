import { notFound } from "next/navigation";

import { getPublicMenuCatalog } from "@/application/menu/get-menu-catalog";
import { TableOrderPage } from "@/components/order/TableOrderPage";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";

export const dynamic = "force-dynamic";

export default async function TablePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { code } = await params;
  const query = await searchParams;
  const table = await createOrderRepository().getTableByToken(code);

  if (!table) {
    notFound();
  }

  const catalog = await getPublicMenuCatalog();
  return (
    <TableOrderPage
      catalog={catalog}
      table={table}
      errorMessage={query?.error === "stock" ? "Beberapa item baru saja sold out. Cart belum masuk ke kasir, silakan pilih menu lain." : null}
    />
  );
}

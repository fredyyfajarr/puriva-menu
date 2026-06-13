import { NextRequest, NextResponse } from "next/server";

import { createOrderRepository } from "@/infrastructure/supabase/order-repository";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tableToken = request.nextUrl.searchParams.get("tableToken");

  if (!tableToken) {
    return NextResponse.json({ ok: false, error: "missing_table_token" }, { status: 400 });
  }

  let status;

  try {
    status = await createOrderRepository({ useServiceRole: true }).getPublicOrderStatus(tableToken, id);
  } catch {
    return NextResponse.json({ ok: false, error: "status_unavailable" }, { status: 200 });
  }

  if (!status) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: status });
}

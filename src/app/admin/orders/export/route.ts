import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = "/admin/invoices/export";

  return NextResponse.redirect(url);
}

import QRCode from "qrcode";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const tableUrl = new URL(`/table/${encodeURIComponent(code)}`, request.nextUrl.origin);
  const svg = await QRCode.toString(tableUrl.toString(), {
    type: "svg",
    margin: 2,
    width: 512,
    color: {
      dark: "#173f2a",
      light: "#ffffff",
    },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

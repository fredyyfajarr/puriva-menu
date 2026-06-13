import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

import { formatShortIdr } from "@/domain/menu/format";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { requireStaffAccess } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function createSingleInvoicePdf(order: NonNullable<Awaited<ReturnType<ReturnType<typeof createOrderRepository>["getOrderById"]>>>) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).fillColor("#173f2a").text("Puriva Live");
    doc.fontSize(14).fillColor("#233224").text(`Invoice #${order.orderNumber}`);
    doc.moveDown(0.4);
    doc.fontSize(10).fillColor("#555555").text(`${order.tableLabel} | ${formatDateTime(order.createdAt)}`);
    doc.text(`Status: ${order.status.toUpperCase()} | Payment: ${order.paymentStatus.toUpperCase()}`);
    if (order.customerName) doc.text(`Customer: ${order.customerName}`);
    if (order.notes) doc.text(`Note: ${order.notes}`);
    doc.moveDown(1);

    for (const item of order.items) {
      doc.fontSize(10).fillColor("#233224").text(`${item.quantity}x ${item.itemName}${item.variantLabel ? ` + ${item.variantLabel}` : ""}`, { continued: true });
      doc.text(formatShortIdr(item.lineTotalIdr), { align: "right" });
      if (item.notes) doc.fontSize(9).fillColor("#777777").text(`Note: ${item.notes}`);
      doc.moveDown(0.35);
    }

    doc.moveDown(0.8);
    doc.fontSize(16).fillColor("#1687a7").text(`Total: ${formatShortIdr(order.subtotalIdr)}`, { align: "right" });
    doc.end();
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaffAccess();
  } catch {
    return Response.redirect(new URL("/admin/login", _request.url));
  }

  const { id } = await params;
  const order = await createOrderRepository().getOrderById(id);

  if (!order) {
    return new Response("Invoice not found", { status: 404 });
  }

  const pdf = await createSingleInvoicePdf(order);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="puriva-invoice-${order.orderNumber}.pdf"`,
    },
  });
}

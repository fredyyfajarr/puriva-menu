import { NextRequest } from "next/server";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

import { formatIdr } from "@/domain/menu/format";
import { getInvoiceFilterValues } from "@/domain/order/invoice-filters";
import type { Order, OrderStatus } from "@/domain/order/types";
import { createOrderRepository } from "@/infrastructure/supabase/order-repository";
import { requireStaffAccess } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_MARGIN = 40;
const CONTENT_WIDTH = 515;
const PAGE_BOTTOM_LIMIT = 760;

function getStatuses(status: string | null): OrderStatus[] {
  if (status === "all") return ["completed", "canceled", "ready", "preparing", "new"];
  if (status === "canceled") return ["canceled"];
  return ["completed"];
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T00:00:00`));
}

function paymentLabel(value: string | null) {
  const labels: Record<string, string> = {
    cash: "Cash",
    edc_bca: "EDC BCA",
    qris_static: "QRIS Static",
    dynamic_qris: "Dynamic QRIS",
    cashier: "Cashier",
  };

  return value ? labels[value] ?? value : "-";
}

function addSectionTitle(doc: PDFKit.PDFDocument, y: number, title: string, subtitle?: string) {
  doc.fontSize(12).fillColor("#173f2a").text(title, PAGE_MARGIN, y, { width: CONTENT_WIDTH });
  if (subtitle) {
    doc.fontSize(8).fillColor("#6b7280").text(subtitle, PAGE_MARGIN, y + 15, { width: CONTENT_WIDTH });
  }

  return y + (subtitle ? 32 : 22);
}

function addKpiCard(doc: PDFKit.PDFDocument, x: number, y: number, width: number, title: string, value: string, caption: string) {
  doc.roundedRect(x, y, width, 66, 8).fillAndStroke("#f6fbf7", "#dbe8dd");
  doc.fontSize(7).fillColor("#2f6b46").text(title.toUpperCase(), x + 12, y + 12, { width: width - 24 });
  doc.fontSize(15).fillColor("#173f2a").text(value, x + 12, y + 27, { width: width - 24 });
  doc.fontSize(7).fillColor("#65705e").text(caption, x + 12, y + 49, { width: width - 24 });
}

function addTableHeader(doc: PDFKit.PDFDocument, y: number) {
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 24, 5).fill("#173f2a");
  doc.fontSize(8).fillColor("#ffffff");
  doc.text("Invoice", 52, y + 8, { width: 62 });
  doc.text("Date", 116, y + 8, { width: 82 });
  doc.text("Table", 200, y + 8, { width: 70 });
  doc.text("Payment", 272, y + 8, { width: 88 });
  doc.text("Status", 362, y + 8, { width: 68 });
  doc.text("Total", 452, y + 8, { width: 90, align: "right" });
}

function addContinuationHeader(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, doc.page.width, 28).fill("#173f2a");
  doc.fontSize(8).fillColor("#bde5c8").text("PURIVA LIVE - INVOICE REPORT", PAGE_MARGIN, 11, {
    characterSpacing: 0.8,
    width: CONTENT_WIDTH,
  });
}

function addReportTotal(doc: PDFKit.PDFDocument, y: number, paidTotal: number) {
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 56, 8).fillAndStroke("#173f2a", "#173f2a");
  doc.fontSize(8).fillColor("#bde5c8").text("REPORT TOTAL", PAGE_MARGIN + 16, y + 14, { width: 180 });
  doc.fontSize(7).fillColor("#d9f0df").text("Paid completed sales in this report period", PAGE_MARGIN + 16, y + 29, {
    width: 220,
  });
  doc.fontSize(18).fillColor("#ffffff").text(formatIdr(paidTotal), PAGE_MARGIN + 280, y + 18, {
    align: "right",
    width: 215,
  });
}

function createInvoicePdf(orders: Order[], range: { dateFrom: string; dateTo: string }, statusLabel: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const paidCompleted = orders.filter((order) => order.status === "completed" && order.paymentStatus === "paid");
    const grossTotal = orders.filter((order) => order.status === "completed").reduce((total, order) => total + order.subtotalIdr, 0);
    const paidTotal = paidCompleted.reduce((total, order) => total + order.subtotalIdr, 0);
    const unpaidCount = orders.filter((order) => order.status !== "canceled" && order.paymentStatus !== "paid").length;
    const avgOrder = paidCompleted.length ? Math.round(paidTotal / paidCompleted.length) : 0;
    const paymentTotals = new Map<string, { total: number; count: number }>();

    for (const order of paidCompleted) {
      const method = paymentLabel(order.paymentMethod);
      const current = paymentTotals.get(method) ?? { total: 0, count: 0 };
      current.total += order.subtotalIdr;
      current.count += 1;
      paymentTotals.set(method, current);
    }

    doc.rect(0, 0, doc.page.width, 112).fill("#173f2a");
    doc.fontSize(9).fillColor("#bde5c8").text("PURIVA LIVE", PAGE_MARGIN, 30, { characterSpacing: 1.5 });
    doc.fontSize(23).fillColor("#ffffff").text("Invoice Report", PAGE_MARGIN, 47);
    doc
      .fontSize(9)
      .fillColor("#d9f0df")
      .text(`${formatDate(range.dateFrom)} - ${formatDate(range.dateTo)} | ${statusLabel}`, PAGE_MARGIN, 78);
    doc.roundedRect(432, 32, 122, 46, 8).fill("#f6fbf7");
    doc.fontSize(8).fillColor("#2f6b46").text("PAID SALES", 446, 42);
    doc.fontSize(15).fillColor("#2f8f5b").text(formatIdr(paidTotal), 446, 56, { width: 94, align: "right" });

    const kpiY = 138;
    addKpiCard(doc, 40, kpiY, 120, "Invoices", String(orders.length), "Total rows");
    addKpiCard(doc, 172, kpiY, 120, "Gross completed", formatIdr(grossTotal), "Before unpaid filter");
    addKpiCard(doc, 304, kpiY, 120, "Avg order", formatIdr(avgOrder), "Paid completed");
    addKpiCard(doc, 436, kpiY, 120, "Unpaid/Pending", String(unpaidCount), "Need follow up");

    let cursorY = kpiY + 92;
    cursorY = addSectionTitle(doc, cursorY, "Payment Breakdown", "Paid completed invoices grouped by payment method.");
    const breakdownStartY = cursorY;
    let breakdownX = 40;
    const breakdown = Array.from(paymentTotals.entries()).sort((a, b) => b[1].total - a[1].total);
    if (breakdown.length === 0) {
      doc.roundedRect(PAGE_MARGIN, breakdownStartY, CONTENT_WIDTH, 36, 6).fillAndStroke("#f6fbf7", "#dbe8dd");
      doc.fontSize(9).fillColor("#65705e").text("No paid payment data for this period.", 54, breakdownStartY + 13);
      cursorY = breakdownStartY + 52;
    } else {
      for (const [method, value] of breakdown.slice(0, 4)) {
        doc.roundedRect(breakdownX, breakdownStartY, 120, 50, 6).fillAndStroke("#ffffff", "#dbe8dd");
        doc.fontSize(7).fillColor("#2f6b46").text(method.toUpperCase(), breakdownX + 10, breakdownStartY + 10, { width: 100 });
        doc.fontSize(11).fillColor("#173f2a").text(formatIdr(value.total), breakdownX + 10, breakdownStartY + 24, { width: 100 });
        doc.fontSize(7).fillColor("#65705e").text(`${value.count} invoice`, breakdownX + 10, breakdownStartY + 38, { width: 100 });
        breakdownX += 132;
      }
      cursorY = breakdownStartY + 70;
    }

    cursorY = addSectionTitle(doc, cursorY, "Invoice Details", "Each invoice includes table, status, payment, item count, and total.");
    addTableHeader(doc, cursorY);
    cursorY += 30;

    for (const order of orders) {
      if (cursorY > 720) {
        doc.addPage();
        addContinuationHeader(doc);
        addTableHeader(doc, 42);
        cursorY = 72;
      }

      const rowY = cursorY;
      const rowHeight = 42;
      doc.roundedRect(PAGE_MARGIN, rowY, CONTENT_WIDTH, rowHeight, 5).fillAndStroke("#ffffff", "#dbe8dd");
      doc.fontSize(8).fillColor("#173f2a").text(`#${order.orderNumber}`, 52, rowY + 9, { width: 62 });
      doc.fontSize(7).fillColor("#65705e").text(`${order.items.reduce((sum, item) => sum + item.quantity, 0)} item`, 52, rowY + 23, { width: 62 });
      doc.fontSize(7).fillColor("#233224").text(formatDateTime(order.createdAt), 116, rowY + 9, { width: 82 });
      doc.fontSize(8).fillColor("#233224").text(order.tableLabel, 200, rowY + 9, { width: 70 });
      if (order.customerName) doc.fontSize(7).fillColor("#65705e").text(order.customerName, 200, rowY + 23, { width: 70 });
      doc.fontSize(8).fillColor("#233224").text(paymentLabel(order.paymentMethod), 272, rowY + 9, { width: 88 });
      doc.fontSize(7).fillColor(order.paymentStatus === "paid" ? "#16824a" : "#9a5b00").text(order.paymentStatus.toUpperCase(), 272, rowY + 23, { width: 88 });
      doc.fontSize(8).fillColor(order.status === "canceled" ? "#b42318" : "#173f2a").text(order.status.toUpperCase(), 362, rowY + 9, { width: 68 });
      doc.fontSize(9).fillColor("#2f8f5b").text(formatIdr(order.subtotalIdr), 452, rowY + 9, { width: 90, align: "right" });
      cursorY = rowY + rowHeight + 6;
    }

    if (orders.length === 0) {
      doc.roundedRect(PAGE_MARGIN, cursorY, CONTENT_WIDTH, 46, 6).fillAndStroke("#f6fbf7", "#dbe8dd");
      doc.fontSize(9).fillColor("#65705e").text("No invoices found for this period.", 54, cursorY + 17);
      cursorY += 58;
    }

    cursorY += 10;
    if (cursorY + 56 > PAGE_BOTTOM_LIMIT) {
      doc.addPage();
      addContinuationHeader(doc);
      cursorY = 54;
    }

    addReportTotal(doc, cursorY, paidTotal);
    doc.end();
  });
}

export async function GET(request: NextRequest) {
  try {
    await requireStaffAccess();
  } catch {
    return Response.redirect(new URL("/admin/login", request.url));
  }

  const range = getInvoiceFilterValues({
    period: request.nextUrl.searchParams.get("period"),
    date: request.nextUrl.searchParams.get("date"),
    weekFrom: request.nextUrl.searchParams.get("weekFrom"),
    weekTo: request.nextUrl.searchParams.get("weekTo"),
    month: request.nextUrl.searchParams.get("month"),
    year: request.nextUrl.searchParams.get("year"),
  });
  const orders = await createOrderRepository().listOrders({
    statuses: getStatuses(request.nextUrl.searchParams.get("status")),
    limit: 1000,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  });
  const status = request.nextUrl.searchParams.get("status") ?? "completed";
  const statusLabel = status === "all" ? "All invoices" : status === "canceled" ? "Canceled invoices" : "Completed invoices";
  const pdf = await createInvoicePdf(orders, range, statusLabel);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="puriva-invoices-${range.dateFrom}-${range.dateTo}.pdf"`,
    },
  });
}

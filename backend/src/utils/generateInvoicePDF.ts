import PDFDocument from "pdfkit";
import { Response } from "express";
import { IOrder } from "../models/Order";

export const streamInvoicePDF = (order: IOrder, customerName: string, res: Response) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.id}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(22).fillColor("#111827").text("INVOICE", { align: "right" });
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor("#6b7280").text("MyShop", { align: "right" });
  doc.moveDown(1.5);

  // Order meta
  doc.fillColor("#111827").fontSize(11);
  doc.text(`Order ID: ${order.id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Payment method: ${order.paymentMethod === "cod" ? "Cash on delivery" : "Card (Stripe)"}`);
  doc.text(`Payment status: ${order.paymentStatus}`);
  doc.moveDown(1);

  // Billing address
  doc.fontSize(12).fillColor("#111827").text("Shipping to:", { underline: true });
  doc.fontSize(10).fillColor("#374151");
  doc.text(order.shippingAddress.fullName);
  doc.text(order.shippingAddress.phone);
  doc.text(`${order.shippingAddress.details}, ${order.shippingAddress.city}, ${order.shippingAddress.governorate}`);
  doc.moveDown(1.5);

  // Items table header
  const tableTop = doc.y;
  doc.fontSize(10).fillColor("#111827");
  doc.text("Item", 50, tableTop, { width: 220 });
  doc.text("Price", 280, tableTop, { width: 80, align: "right" });
  doc.text("Qty", 370, tableTop, { width: 60, align: "right" });
  doc.text("Total", 440, tableTop, { width: 100, align: "right" });
  doc.moveTo(50, tableTop + 16).lineTo(540, tableTop + 16).strokeColor("#e5e7eb").stroke();

  let y = tableTop + 24;
  doc.fontSize(10).fillColor("#374151");
  order.items.forEach((item) => {
    doc.text(item.title, 50, y, { width: 220 });
    doc.text(`$${item.price.toFixed(2)}`, 280, y, { width: 80, align: "right" });
    doc.text(String(item.quantity), 370, y, { width: 60, align: "right" });
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 440, y, { width: 100, align: "right" });
    y += 22;
  });

  doc.moveTo(50, y + 4).lineTo(540, y + 4).strokeColor("#e5e7eb").stroke();
  y += 16;

  const row = (label: string, value: string, bold = false) => {
    doc.fontSize(bold ? 12 : 10).fillColor(bold ? "#111827" : "#6b7280");
    doc.text(label, 350, y, { width: 100, align: "right" });
    doc.text(value, 440, y, { width: 100, align: "right" });
    y += bold ? 22 : 18;
  };

  row("Subtotal", `$${order.subtotal.toFixed(2)}`);
  row("Shipping", `$${order.shippingCost.toFixed(2)}`);
  if (order.discount > 0) row("Discount", `-$${order.discount.toFixed(2)}`);
  row("Total", `$${order.total.toFixed(2)}`, true);

  doc.moveDown(3);
  doc.fontSize(9).fillColor("#9ca3af").text("Thank you for shopping with us!", 50, doc.y, { align: "center" });

  doc.end();
};

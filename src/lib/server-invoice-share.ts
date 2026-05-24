import crypto from "crypto";

import { buildProfessionalInvoicePdfBytes, InvoicePdfShop } from "@/lib/invoice-pdf";
import { currency } from "@/lib/utils";
import { Invoice } from "@/types";

export function buildInvoicePdfBytes(shop: InvoicePdfShop, invoice: Invoice) {
  return buildProfessionalInvoicePdfBytes(shop, invoice);
}

export function buildShareMessage(shopName: string, invoice: Invoice) {
  return [
    `Dear ${invoice.customerName},`,
    "",
    `Greetings from ${shopName}.`,
    `Please find your invoice ${invoice.invoiceNumber} for ${currency(invoice.total)} attached with this message.`,
    "",
    `Payment Method: ${invoice.paymentMethod}`,
    `Payment Status: ${invoice.status}`,
    "",
    "Thank you for your purchase and for choosing our business.",
    "",
    "Regards,",
    shopName,
    "Bill Desk Invoice System"
  ].join("\n");
}

export function normalisePhoneNumber(phone: string) {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function encodeInvoicePayload(shop: InvoicePdfShop, invoice: Invoice) {
  return Buffer.from(JSON.stringify({ shop, invoice })).toString("base64url");
}

export function signInvoicePayload(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyInvoicePayload(payload: string, signature: string, secret: string) {
  const expected = signInvoicePayload(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function decodeInvoicePayload(payload: string) {
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as {
    shop: InvoicePdfShop;
    invoice: Invoice;
  };
}

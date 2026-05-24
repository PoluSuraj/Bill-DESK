import { jsonError } from "@/lib/api-response";
import { buildInvoicePdfBytes, decodeInvoicePayload, verifyInvoicePayload } from "@/lib/server-invoice-share";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = searchParams.get("payload");
  const signature = searchParams.get("sig");
  const secret = process.env.SHARE_SIGNING_SECRET || process.env.JWT_SECRET;

  if (!payload || !signature || !secret) {
    return jsonError("Missing or invalid PDF share credentials.", 400);
  }

  if (!verifyInvoicePayload(payload, signature, secret)) {
    return jsonError("Invalid PDF share signature.", 401);
  }

  const { shop, invoice } = decodeInvoicePayload(payload);
  const pdfBytes = buildInvoicePdfBytes(shop, invoice);

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`
    }
  });
}

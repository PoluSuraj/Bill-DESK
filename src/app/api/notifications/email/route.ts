import { jsonError, jsonSuccess } from "@/lib/api-response";
import { buildInvoicePdfBytes, buildShareMessage } from "@/lib/server-invoice-share";
import { Invoice, ShopProfile } from "@/types";

type Payload = {
  shop: Pick<ShopProfile, "name" | "address" | "gstNumber" | "phone" | "email">;
  invoice: Invoice;
};

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return jsonError("Email provider is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL in your environment.", 501);
  }

  const body = (await request.json()) as Payload;
  if (!body?.invoice?.customerEmail) {
    return jsonError("Customer email is required to send the PDF invoice.", 400);
  }

  const pdfBytes = buildInvoicePdfBytes(body.shop, body.invoice);
  const attachment = Buffer.from(pdfBytes).toString("base64");
  const subject = `Invoice ${body.invoice.invoiceNumber} from ${body.shop.name}`;
  const text = buildShareMessage(body.shop.name, body.invoice);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [body.invoice.customerEmail],
      subject,
      text,
      attachments: [
        {
          filename: `${body.invoice.invoiceNumber}.pdf`,
          content: attachment
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonError(`Email provider rejected the invoice send request: ${errorText}`, 502);
  }

  const data = await response.json();
  return jsonSuccess({ provider: "resend", id: data.id }, "PDF invoice sent by email.");
}

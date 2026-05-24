import { jsonError, jsonSuccess } from "@/lib/api-response";
import {
  buildShareMessage,
  encodeInvoicePayload,
  normalisePhoneNumber,
  signInvoicePayload
} from "@/lib/server-invoice-share";
import { Invoice, ShopProfile } from "@/types";

type Payload = {
  shop: Pick<ShopProfile, "name" | "address" | "gstNumber" | "phone" | "email">;
  invoice: Invoice;
};

export async function POST(request: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.SHARE_SIGNING_SECRET || process.env.JWT_SECRET;

  if (!accountSid || !authToken || !fromNumber || !baseUrl || !secret) {
    return jsonError("WhatsApp provider is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, NEXT_PUBLIC_APP_URL, and SHARE_SIGNING_SECRET.", 501);
  }

  if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
    return jsonError("WhatsApp PDF sending needs a public deployed URL. Localhost cannot be used for media delivery.", 501);
  }

  const body = (await request.json()) as Payload;
  const phone = normalisePhoneNumber(body?.invoice?.customerPhone || "");

  if (!phone) {
    return jsonError("Customer mobile number is required to send the PDF invoice on WhatsApp.", 400);
  }

  const payload = encodeInvoicePayload(body.shop, body.invoice);
  const signature = signInvoicePayload(payload, secret);
  const mediaUrl = `${baseUrl.replace(/\/$/, "")}/api/invoice/shared-pdf?payload=${encodeURIComponent(payload)}&sig=${signature}`;
  const message = buildShareMessage(body.shop.name, body.invoice);

  const form = new URLSearchParams({
    To: `whatsapp:+${phone}`,
    From: `whatsapp:${fromNumber}`,
    Body: message,
    MediaUrl: mediaUrl
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonError(`WhatsApp provider rejected the invoice send request: ${errorText}`, 502);
  }

  const data = await response.json();
  return jsonSuccess({ provider: "twilio", sid: data.sid, mediaUrl }, "PDF invoice sent on WhatsApp.");
}

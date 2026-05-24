import { seedInvoices } from "@/lib/mock-data";
import { jsonSuccess } from "@/lib/api-response";
import { requireApiSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const user = await requireApiSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }

  return jsonSuccess(
    {
      invoices: seedInvoices.map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customerName,
        grandTotal: invoice.total,
        paymentMethod: invoice.paymentMethod,
        status: invoice.status,
        createdAt: invoice.createdAt
      }))
    },
    "Billing records ready"
  );
}

export async function POST() {
  const user = await requireApiSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const invoice = seedInvoices[0];
  return jsonSuccess(
    {
      invoiceId: invoice?.id,
      invoiceNumber: invoice?.invoiceNumber,
      total: invoice?.total || 0,
      thermalPrintable: true,
      downloadable: true,
      shareChannels: ["whatsapp", "email"]
    },
    "Invoice created"
  );
}

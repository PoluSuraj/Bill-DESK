import { seedInvoices } from "@/lib/mock-data";
import { jsonSuccess } from "@/lib/api-response";
import { requireApiSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const user = await requireApiSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const today = new Date().toDateString();
  const todaySales = seedInvoices
    .filter((invoice) => new Date(invoice.createdAt).toDateString() === today)
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const monthSales = seedInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  return jsonSuccess(
    {
      sales: {
        today: todaySales,
        month: monthSales
      },
      invoices: seedInvoices.length,
      exportFormats: ["json", "csv"],
      aiInsightsEnabled: true
    },
    "Reports ready"
  );
}

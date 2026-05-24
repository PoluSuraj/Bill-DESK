import { seedProducts } from "@/lib/mock-data";
import { jsonSuccess } from "@/lib/api-response";
import { requireApiSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const user = await requireApiSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }

  return jsonSuccess(
    {
      products: seedProducts,
      lowStock: seedProducts.filter((product) => product.stock <= product.reorderLevel)
    },
    "Inventory listing scaffolded"
  );
}

import { SOFTWARE_ADMIN_EMAIL, SOFTWARE_ADMIN_NAME } from "@/lib/platform";
import { Customer, Invoice, OfferCampaign, Product, SessionUser, ShopProfile, TenantShop } from "@/types";

export const seedShopProfile: ShopProfile = {
  name: "",
  address: "",
  gstNumber: "",
  email: "",
  phone: "",
  businessType: "",
  language: "English",
  upiId: "",
  invoicePrefix: "INV",
  bankName: "",
  bankBranch: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankAccountHolder: ""
};

export const seedSessionUser: SessionUser = {
  id: "user-admin-1",
  name: SOFTWARE_ADMIN_NAME,
  email: SOFTWARE_ADMIN_EMAIL,
  role: "ADMIN"
};

export const seedTenantShops: TenantShop[] = [];

export const seedOffers: OfferCampaign[] = [];

export const seedProducts: Product[] = [];

export const seedCustomers: Customer[] = [];

export const seedInvoices: Invoice[] = [];

export const seedAiInsights = [
  "Set up your business details to unlock branded invoices and payment-ready billing.",
  "Add your first products and customers to start generating reports and live sales insights.",
  "Billing trends, top products, and payment behavior will appear here after real invoices are created."
];

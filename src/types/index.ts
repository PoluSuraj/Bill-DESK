export type UserRole = "OWNER" | "CASHIER" | "ACCOUNTANT" | "ADMIN";

export type PaymentMethod = "Cash" | "UPI" | "Card" | "Split";
export type InvoiceMode = "GST" | "NON_GST";
export type InvoiceStatus = "Paid" | "Pending" | "Partial";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "PAUSED";

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  accent: "brand" | "accent" | "warn";
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  purchasePrice: number;
  stock: number;
  category: string;
  image?: string;
  barcode: string;
  reorderLevel: number;
  gstRate: number;
  unit: string;
};

export type CartLine = Product & {
  quantity: number;
  discount: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  creditBalance: number;
  notes: string;
  segment: string;
  birthday?: string;
};

export type BillingCustomerDetails = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  items: CartLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  mode: InvoiceMode;
  status: InvoiceStatus;
  createdAt: string;
};

export type ShopProfile = {
  name: string;
  address: string;
  gstNumber: string;
  email: string;
  phone: string;
  businessType: string;
  language: string;
  upiId: string;
  invoicePrefix: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountHolder: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type TenantShop = {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  businessType: string;
  planName: string;
  branchCount: number;
  seatsUsed: number;
  seatsLimit: number;
  status: SubscriptionStatus;
  renewalDate: string;
  isAccessEnabled: boolean;
};

export type OfferCampaign = {
  id: string;
  title: string;
  audience: string;
  channel: "WhatsApp" | "SMS" | "Email" | "In-app";
  status: "Draft" | "Live" | "Paused";
  discountLabel: string;
  scheduledFor: string;
};

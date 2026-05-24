"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveUserName, resolveUserRole } from "@/lib/platform";
import {
  seedAiInsights,
  seedCustomers,
  seedInvoices,
  seedOffers,
  seedProducts,
  seedShopProfile,
  seedTenantShops
} from "@/lib/mock-data";
import {
  BillingCustomerDetails,
  CartLine,
  Customer,
  Invoice,
  InvoiceMode,
  InvoiceStatus,
  OfferCampaign,
  PaymentMethod,
  Product,
  SessionUser,
  ShopProfile,
  SubscriptionStatus,
  TenantShop
} from "@/types";

const defaultCart: CartLine[] = [];

const initialPersistedState = {
  shop: seedShopProfile,
  currentUser: null,
  products: seedProducts,
  customers: seedCustomers,
  invoices: seedInvoices,
  insights: seedAiInsights,
  tenantShops: seedTenantShops,
  offers: seedOffers,
  cartLines: defaultCart,
  cartSearch: "",
  selectedCustomerId: "",
  paymentMethod: "UPI" as PaymentMethod,
  invoiceMode: "GST" as InvoiceMode,
  invoiceStatus: "Paid" as InvoiceStatus
};

const STORE_VERSION = 2;

type ProductInput = Omit<Product, "id"> & { id?: string };
type CustomerInput = Omit<Customer, "id"> & { id?: string };
type OfferInput = Omit<OfferCampaign, "id"> & { id?: string };
type InvoiceCustomerInput = BillingCustomerDetails & { saveToCustomers?: boolean; notes?: string; segment?: string };

type AppState = {
  shop: ShopProfile;
  currentUser: SessionUser | null;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  insights: string[];
  tenantShops: TenantShop[];
  offers: OfferCampaign[];
  cartLines: CartLine[];
  cartSearch: string;
  selectedCustomerId: string;
  paymentMethod: PaymentMethod;
  invoiceMode: InvoiceMode;
  invoiceStatus: InvoiceStatus;
  globalSearch: string;
  lastActionMessage: string;
  login: (email: string, role: SessionUser["role"], name?: string) => void;
  signup: (payload: { name: string; email: string; role: SessionUser["role"] }) => void;
  setCurrentUser: (user: SessionUser | null) => void;
  logout: () => void;
  updateShop: (payload: Partial<ShopProfile>) => void;
  setGlobalSearch: (query: string) => void;
  setCartSearch: (query: string) => void;
  setSelectedCustomerId: (customerId: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setInvoiceMode: (mode: InvoiceMode) => void;
  setInvoiceStatus: (status: InvoiceStatus) => void;
  setActionMessage: (message: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  createInvoice: (customerInput?: InvoiceCustomerInput) => Invoice | null;
  saveProduct: (payload: ProductInput) => void;
  deleteProduct: (productId: string) => void;
  adjustStock: (productId: string, change: number) => void;
  saveCustomer: (payload: CustomerInput) => void;
  deleteCustomer: (customerId: string) => void;
  updateTenantPlan: (tenantId: string, planName: string) => void;
  updateTenantStatus: (tenantId: string, status: SubscriptionStatus) => void;
  toggleTenantAccess: (tenantId: string) => void;
  saveOffer: (payload: OfferInput) => void;
  deleteOffer: (offerId: string) => void;
  clearActionMessage: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialPersistedState,
      globalSearch: "",
      lastActionMessage: "",
      login: (email, role, name) => {
        const resolvedRole = resolveUserRole(email, role);
        const resolvedName = resolveUserName(email, name);
        set({
          currentUser: {
            id: `user-${Date.now()}`,
            name: resolvedName,
            email,
            role: resolvedRole
          },
          lastActionMessage: `Signed in as ${resolvedRole.toLowerCase()}.`
        });
      },
      signup: ({ email, name, role }) => {
        const resolvedRole = resolveUserRole(email, role);
        const resolvedName = resolveUserName(email, name);
        set({
          currentUser: {
            id: `user-${Date.now()}`,
            name: resolvedName,
            email,
            role: resolvedRole
          },
          lastActionMessage: "Workspace created successfully."
        });
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null, lastActionMessage: "Signed out successfully." }),
      updateShop: (payload) =>
        set((state) => ({
          shop: { ...state.shop, ...payload },
          lastActionMessage: "Business settings updated."
        })),
      setGlobalSearch: (globalSearch) => set({ globalSearch }),
      setCartSearch: (cartSearch) => set({ cartSearch }),
      setSelectedCustomerId: (selectedCustomerId) => set({ selectedCustomerId }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setInvoiceMode: (invoiceMode) => set({ invoiceMode }),
      setInvoiceStatus: (invoiceStatus) => set({ invoiceStatus }),
      setActionMessage: (lastActionMessage) => set({ lastActionMessage }),
      addToCart: (productId) =>
        set((state) => {
          const product = state.products.find((item) => item.id === productId);
          if (!product) {
            return state;
          }

          const existing = state.cartLines.find((line) => line.id === productId);
          if (existing) {
            return {
              cartLines: state.cartLines.map((line) =>
                line.id === productId ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) } : line
              ),
              lastActionMessage: `${product.name} quantity updated.`
            };
          }

          return {
            cartLines: [...state.cartLines, { ...product, quantity: 1, discount: 0 }],
            lastActionMessage: `${product.name} added to bill.`
          };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cartLines: state.cartLines.filter((line) => line.id !== productId),
          lastActionMessage: "Item removed from bill."
        })),
      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cartLines: state.cartLines.map((line) =>
            line.id === productId
              ? {
                  ...line,
                  quantity: Math.max(
                    1,
                    Math.min(quantity, state.products.find((product) => product.id === productId)?.stock || quantity)
                  )
                }
              : line
          )
        })),
      updateCartDiscount: (productId, discount) =>
        set((state) => ({
          cartLines: state.cartLines.map((line) =>
            line.id === productId ? { ...line, discount: Math.max(0, discount) } : line
          )
        })),
      clearCart: () => set({ cartLines: [], selectedCustomerId: "", lastActionMessage: "Cart cleared." }),
      createInvoice: (customerInput) => {
        const state = get();
        if (!state.cartLines.length) {
          set({ lastActionMessage: "Add products before generating a bill." });
          return null;
        }

        const subtotal = state.cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
        const discount = state.cartLines.reduce((sum, line) => sum + line.discount, 0);
        const taxable = Math.max(subtotal - discount, 0);
        const tax = state.invoiceMode === "GST" ? taxable * 0.18 : 0;
        const total = taxable + tax;
        const profit = state.cartLines.reduce(
          (sum, line) => sum + (line.price - line.purchasePrice) * line.quantity - line.discount,
          0
        );
        const count = state.invoices.length + 1;
        const dateStamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
        const prefix = state.shop.invoicePrefix?.trim() || "INV";
        const invoiceNumber = `${prefix}-${dateStamp}-${String(count).padStart(3, "0")}`;
        const selectedCustomer = state.customers.find((customer) => customer.id === state.selectedCustomerId);
        const providedName = customerInput?.name?.trim();
        const providedPhone = customerInput?.phone?.trim();
        const providedEmail = customerInput?.email?.trim();
        const providedAddress = customerInput?.address?.trim();
        const customerName = providedName || selectedCustomer?.name || "Walk-in Customer";
        const customerPhone = providedPhone || selectedCustomer?.phone || undefined;
        const customerEmail = providedEmail || selectedCustomer?.email || undefined;
        const customerAddress = providedAddress || selectedCustomer?.address || undefined;
        const invoice: Invoice = {
          id: `invoice-${Date.now()}`,
          invoiceNumber,
          customerId: selectedCustomer?.id,
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
          items: state.cartLines,
          subtotal,
          discount,
          tax,
          total,
          profit,
          paymentMethod: state.paymentMethod,
          mode: state.invoiceMode,
          status: state.invoiceStatus,
          createdAt: new Date().toISOString()
        };

        const shouldCreateCustomer = Boolean(customerInput?.saveToCustomers && providedName && providedPhone && !selectedCustomer);
        const appendedCustomer = shouldCreateCustomer
          ? ({
              id: `C-${Date.now()}`,
              name: providedName,
              phone: providedPhone,
              email: providedEmail || undefined,
              address: providedAddress || undefined,
              loyaltyPoints: Math.floor(total / 20),
              creditBalance: state.invoiceStatus === "Pending" || state.invoiceStatus === "Partial" ? total : 0,
              notes: customerInput?.notes || "Created from billing counter",
              segment: customerInput?.segment || "Counter Customer",
              birthday: undefined
            } as Customer)
          : null;

        set({
          invoices: [invoice, ...state.invoices],
          products: state.products.map((product) => {
            const line = state.cartLines.find((cartItem) => cartItem.id === product.id);
            return line ? { ...product, stock: Math.max(product.stock - line.quantity, 0) } : product;
          }),
          customers: appendedCustomer
            ? [appendedCustomer, ...state.customers]
            : state.customers.map((customer) =>
                customer.id === selectedCustomer?.id
                  ? {
                      ...customer,
                      name: customerName,
                      phone: customerPhone || customer.phone,
                      email: customerEmail || customer.email,
                      address: customerAddress || customer.address,
                      loyaltyPoints: customer.loyaltyPoints + Math.floor(total / 20),
                      creditBalance:
                        state.invoiceStatus === "Pending" || state.invoiceStatus === "Partial"
                          ? customer.creditBalance + total
                          : customer.creditBalance
                    }
                  : customer
              ),
          cartLines: [],
          selectedCustomerId: "",
          invoiceStatus: "Paid",
          lastActionMessage: `${invoice.invoiceNumber} generated successfully.`
        });

        return invoice;
      },
      saveProduct: (payload) =>
        set((state) => {
          if (payload.id && state.products.some((product) => product.id === payload.id)) {
            return {
              products: state.products.map((product) =>
                product.id === payload.id ? ({ ...product, ...payload } as Product) : product
              ),
              lastActionMessage: "Product updated successfully."
            };
          }

          const product: Product = {
            ...payload,
            id: payload.id || `P-${Date.now()}`
          } as Product;

          return {
            products: [product, ...state.products],
            lastActionMessage: "Product added to inventory."
          };
        }),
      deleteProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== productId),
          cartLines: state.cartLines.filter((line) => line.id !== productId),
          lastActionMessage: "Product removed from inventory."
        })),
      adjustStock: (productId, change) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId ? { ...product, stock: Math.max(product.stock + change, 0) } : product
          ),
          lastActionMessage: "Stock updated successfully."
        })),
      saveCustomer: (payload) =>
        set((state) => {
          if (payload.id && state.customers.some((customer) => customer.id === payload.id)) {
            return {
              customers: state.customers.map((customer) =>
                customer.id === payload.id ? ({ ...customer, ...payload } as Customer) : customer
              ),
              lastActionMessage: "Customer updated successfully."
            };
          }

          const customer: Customer = {
            ...payload,
            id: payload.id || `C-${Date.now()}`
          } as Customer;

          return {
            customers: [customer, ...state.customers],
            lastActionMessage: "Customer added successfully."
          };
        }),
      deleteCustomer: (customerId) =>
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== customerId),
          selectedCustomerId: state.selectedCustomerId === customerId ? "" : state.selectedCustomerId,
          lastActionMessage: "Customer removed successfully."
        })),
      updateTenantPlan: (tenantId, planName) =>
        set((state) => ({
          tenantShops: state.tenantShops.map((tenant) =>
            tenant.id === tenantId ? { ...tenant, planName } : tenant
          ),
          lastActionMessage: "Subscription plan updated."
        })),
      updateTenantStatus: (tenantId, status) =>
        set((state) => ({
          tenantShops: state.tenantShops.map((tenant) =>
            tenant.id === tenantId ? { ...tenant, status } : tenant
          ),
          lastActionMessage: "Subscription status updated."
        })),
      toggleTenantAccess: (tenantId) =>
        set((state) => ({
          tenantShops: state.tenantShops.map((tenant) =>
            tenant.id === tenantId ? { ...tenant, isAccessEnabled: !tenant.isAccessEnabled } : tenant
          ),
          lastActionMessage: "Shop access updated."
        })),
      saveOffer: (payload) =>
        set((state) => {
          if (payload.id && state.offers.some((offer) => offer.id === payload.id)) {
            return {
              offers: state.offers.map((offer) =>
                offer.id === payload.id ? ({ ...offer, ...payload } as OfferCampaign) : offer
              ),
              lastActionMessage: "Offer campaign updated."
            };
          }

          const offer: OfferCampaign = {
            ...payload,
            id: payload.id || `offer-${Date.now()}`
          } as OfferCampaign;

          return {
            offers: [offer, ...state.offers],
            lastActionMessage: "Offer campaign created."
          };
        }),
      deleteOffer: (offerId) =>
        set((state) => ({
          offers: state.offers.filter((offer) => offer.id !== offerId),
          lastActionMessage: "Offer campaign removed."
        })),
      clearActionMessage: () => set({ lastActionMessage: "" })
    }),
    {
      name: "bill-desk-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: () => ({ ...initialPersistedState }),
      onRehydrateStorage: () => (state) => {
        if (!state?.currentUser) {
          return;
        }

        const resolvedRole = resolveUserRole(state.currentUser.email, state.currentUser.role);
        const resolvedName = resolveUserName(state.currentUser.email, state.currentUser.name);

        if (state.currentUser.role !== resolvedRole || state.currentUser.name !== resolvedName) {
          useAppStore.setState({
            currentUser: {
              ...state.currentUser,
              role: resolvedRole,
              name: resolvedName
            }
          });
        }
      },
      partialize: (state) => ({
        shop: state.shop,
        currentUser: state.currentUser,
        products: state.products,
        customers: state.customers,
        invoices: state.invoices,
        insights: state.insights,
        tenantShops: state.tenantShops,
        offers: state.offers,
        cartLines: state.cartLines,
        cartSearch: state.cartSearch,
        selectedCustomerId: state.selectedCustomerId,
        paymentMethod: state.paymentMethod,
        invoiceMode: state.invoiceMode,
        invoiceStatus: state.invoiceStatus
      })
    }
  )
);

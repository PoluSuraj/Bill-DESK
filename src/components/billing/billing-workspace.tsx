"use client";

import {
  Download,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  QrCode,
  ScanLine,
  Send,
  ShoppingCart,
  Trash2,
  WandSparkles
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

import { amountToWords, buildProfessionalInvoicePdfBytes, type InvoicePdfShop } from "@/lib/invoice-pdf";
import { currency, downloadTextFile, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { BillingCustomerDetails, CartLine, Invoice } from "@/types";

function buildPdfFile(
  shop: InvoicePdfShop,
  invoice: Invoice
) {
  const bytes = buildProfessionalInvoicePdfBytes(shop, invoice);
  return new File([bytes], `${invoice.invoiceNumber}.pdf`, { type: "application/pdf" });
}

function buildInvoiceText(
  shopName: string,
  invoiceNumber: string,
  lines: Array<{ name: string; quantity: number; price: number; discount: number }>,
  total: number,
  customer: BillingCustomerDetails,
  paymentMethod: string,
  shopAddress: string,
  gstNumber: string
) {
  return [
    shopName,
    shopAddress,
    `GST: ${gstNumber}`,
    `Invoice: ${invoiceNumber}`,
    `Customer: ${customer.name || "Walk-in Customer"}`,
    `Mobile: ${customer.phone || "Not provided"}`,
    `Email: ${customer.email || "Not provided"}`,
    `Address: ${customer.address || "Not provided"}`,
    `Payment: ${paymentMethod}`,
    "",
    ...lines.map((line) => `${line.name} x${line.quantity}  ${currency(line.price * line.quantity - line.discount)}`),
    "",
    `Grand Total: ${currency(total)}`,
    `Generated: ${new Date().toLocaleString("en-IN")}`
  ].join("\n");
}

function normalisePhoneNumber(phone: string) {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

async function copyShareMessage(message: string) {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    return false;
  }
}

function shouldUseNativeShare() {
  if (typeof window === "undefined") {
    return false;
  }

  const isSmallScreen = window.innerWidth < 900;
  const ua = navigator.userAgent.toLowerCase();
  const isMobileDevice = /iphone|ipad|android/.test(ua);
  return isSmallScreen || isMobileDevice;
}

function buildShareMessage(shopName: string, invoice: Invoice) {
  return [
    `Dear ${invoice.customerName},`,
    "",
    `Greetings from ${shopName}.`,
    `Please find your invoice ${invoice.invoiceNumber} for ${currency(invoice.total)} attached with this message.`,
    "",
    `Payment Method: ${invoice.paymentMethod}`,
    `Payment Status: ${invoice.status}`,
    "",
    "In browser draft mode, please attach the downloaded PDF before sending this email.",
    "",
    "Thank you for your purchase and continued trust.",
    "",
    "Regards,",
    `${shopName}`,
    "Bill Desk Invoice System"
  ].join("\n");
}

function getBusinessMark(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "BD";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function buildUpiPayload(upiId: string, payeeName: string, amount: number, invoiceNumber: string) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    tr: invoiceNumber,
    tn: `Invoice ${invoiceNumber}`,
    am: amount.toFixed(2),
    cu: "INR"
  });

  return `upi://pay?${params.toString()}`;
}

function buildPrintableInvoiceHtml(
  shop: InvoicePdfShop,
  invoice: Invoice,
  qrCodeUrl?: string | null
) {
  const cgst = invoice.mode === "GST" ? invoice.tax / 2 : 0;
  const sgst = invoice.mode === "GST" ? invoice.tax / 2 : 0;
  const amountWords = amountToWords(invoice.total);
  const rows = invoice.items
    .map((item, index) => {
      const taxable = item.price * item.quantity - item.discount;
      const gstRate = invoice.mode === "GST" ? item.gstRate || 18 : 0;
      const gstAmount = invoice.mode === "GST" ? taxable * gstRate / 100 : 0;
      const hsn = `${item.barcode || item.sku || item.id}`.replace(/\D/g, "").slice(-4) || item.sku.slice(0, 4).toUpperCase() || "0000";
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${hsn}</td>
          <td>${item.quantity} ${item.unit || "pc"}</td>
          <td>${currency(item.price)}</td>
          <td>${currency(taxable)}</td>
          <td>${gstRate}%</td>
          <td>${currency(gstAmount)}</td>
          <td>${currency(taxable + gstAmount)}</td>
        </tr>`;
    })
    .join("");

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${invoice.invoiceNumber}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 18px; color: #1e293b; }
        .sheet { border: 1px solid #94a3b8; }
        .topline { display:flex; justify-content:space-between; font-size:12px; padding:0 8px 6px; }
        .brand { display:grid; grid-template-columns:86px 1fr; gap:16px; padding:16px; border-bottom:1px solid #94a3b8; }
        .logo { width:60px; height:60px; background:#1170c7; color:#fff; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; border-radius:8px; }
        .brand h1 { margin:0 0 4px; font-size:28px; }
        .brand p { margin:2px 0; }
        .grid { display:grid; grid-template-columns: 61% 39%; }
        .left, .right { border-right:1px solid #94a3b8; }
        .right { border-right:none; }
        .section-title { background:#e4eff8; padding:6px 10px; font-size:13px; border-bottom:1px solid #94a3b8; }
        .section-body { padding:10px; min-height:88px; border-bottom:1px solid #94a3b8; }
        .section-body p { margin:4px 0; }
        .meta { padding:10px 12px; min-height:176px; }
        .meta-group { display:grid; grid-template-columns: 108px 12px minmax(0, 1fr); gap:0; align-items:start; margin:4px 0; font-size:12px; }
        .meta-group .label { color:#475569; }
        .meta-group .colon { text-align:center; color:#475569; }
        .meta-group .value { font-weight:700; word-break:break-word; }
        .meta-row { display:grid; grid-template-columns: 108px 12px minmax(0, 1fr); margin:4px 0; }
        .items { width:100%; border-collapse:collapse; }
        .items th, .items td { border:1px solid #94a3b8; padding:6px 7px; font-size:12px; vertical-align:top; }
        .items thead th { background:#e4eff8; text-align:left; }
        .items td.num, .items th.num { text-align:right; }
        .items tfoot td { background:#eaf2fb; font-weight:700; }
        .items tfoot td.label { text-align:right; }
        .summary-wrap { display:grid; grid-template-columns:48% 52%; }
        .bank, .summary { min-height:138px; }
        .summary { border-left:1px solid #94a3b8; }
        .bank { border-right:1px solid #94a3b8; padding:10px; }
        .bank h3, .summary h3 { margin:0; background:#e4eff8; padding:6px 8px; font-size:13px; margin:-10px -10px 10px; border-bottom:1px solid #94a3b8; }
        .bank p { margin:4px 0; }
        .summary table { width:100%; border-collapse:collapse; }
        .summary td { border-bottom:1px solid #cbd5e1; padding:7px 10px; font-size:12px; }
        .summary td:first-child { width:68%; }
        .summary td:last-child { text-align:right; }
        .summary .total td { background:#e4eff8; font-weight:700; }
        .footer { display:grid; grid-template-columns: 1fr 180px 220px; gap:12px; padding:12px; border-top:1px solid #94a3b8; align-items:end; }
        .footer h4 { margin:0 0 8px; font-size:13px; }
        .footer p { margin:4px 0; font-size:12px; }
        .qr { text-align:center; }
        .qr img { width:92px; height:92px; object-fit:contain; border:1px solid #cbd5e1; padding:6px; }
        .sign { text-align:center; }
        .sign-line { margin-top:48px; border-top:1px solid #64748b; padding-top:6px; font-size:12px; }
        .thanks { text-align:center; padding:8px; font-size:13px; }
      </style>
    </head>
    <body>
      <div class="topline">
        <span>Tax Invoice</span>
        <span>Original / Duplicate Bill</span>
      </div>
      <div class="sheet">
        <div class="brand">
          <div class="logo">${getBusinessMark(shop.name)}</div>
          <div>
            <p>GSTIN : ${shop.gstNumber || "Not Provided"}</p>
            <h1>${shop.name}</h1>
            <p>${shop.businessType || "General Business"}</p>
            <p>${shop.address}</p>
            <p>Contact No. : ${shop.phone} | Email : ${shop.email}</p>
          </div>
        </div>

        <div class="grid">
          <div class="left">
            <div class="section-title">Bill To</div>
            <div class="section-body">
              <p><strong>Name:</strong> ${invoice.customerName}</p>
              <p><strong>Address:</strong> ${invoice.customerAddress || "Address not provided"}</p>
              <p><strong>Mobile:</strong> ${invoice.customerPhone || "Not provided"}</p>
              <p><strong>Email:</strong> ${invoice.customerEmail || "Not provided"}</p>
            </div>
            <div class="section-title">Ship To</div>
            <div class="section-body" style="border-bottom:none;">
              <p><strong>Name:</strong> ${invoice.customerName}</p>
              <p><strong>Address:</strong> ${invoice.customerAddress || "Address not provided"}</p>
              <p><strong>Mobile:</strong> ${invoice.customerPhone || "Not provided"}</p>
              <p><strong>Email:</strong> ${invoice.customerEmail || "Not provided"}</p>
            </div>
          </div>
          <div class="right meta">
            ${[
              ["Invoice No", invoice.invoiceNumber],
              ["Date", new Date(invoice.createdAt).toLocaleDateString("en-IN")],
              ["Payment", invoice.paymentMethod],
              ["Reverse", invoice.mode === "GST" ? "YES" : "NO"],
              ["Order No", invoice.id.slice(-6).toUpperCase()],
              ["Ref No", shop.gstNumber ? shop.gstNumber.slice(-6) : "N/A"],
              ["Delivery", new Date(invoice.createdAt).toLocaleDateString("en-IN")],
              ["Transport", invoice.status === "Paid" ? "Self Pickup" : "Pending"],
              ["Terms", "Standard Delivery"]
            ].map(([label, value]) => `<div class="meta-group"><span class="label">${label}</span><span class="colon">:</span><strong class="value">${value}</strong></div>`).join("")}
          </div>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Goods &amp; Service Description</th>
              <th>HSN</th>
              <th>Quantity</th>
              <th class="num">Rate</th>
              <th class="num">Taxable</th>
              <th class="num">GST %</th>
              <th class="num">GST Amt.</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3"></td>
              <td class="num">${invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td class="label">Sub-Total</td>
              <td class="num">${currency(invoice.subtotal - invoice.discount)}</td>
              <td class="num"></td>
              <td class="num">${currency(invoice.tax)}</td>
              <td class="num">${currency(invoice.total)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="summary-wrap">
          <div class="bank">
            <h3>Our Bank Details</h3>
            <p><strong>Bank Name:</strong> ${shop.bankName || "Add in settings"}</p>
            <p><strong>Branch:</strong> ${shop.bankBranch || "Add in settings"}</p>
            <p><strong>Account No:</strong> ${shop.bankAccountNumber || "Add in settings"}</p>
            <p><strong>IFSC:</strong> ${shop.bankIfsc || "Add in settings"}</p>
            <p><strong>Account Holder:</strong> ${shop.bankAccountHolder || shop.name}</p>
            <p><strong>UPI ID:</strong> ${shop.upiId || "Add in settings"}</p>
            <p><strong>Invoice Total In Word:</strong></p>
            <p>${amountWords}</p>
          </div>
          <div class="summary">
            <h3>Summary</h3>
            <table>
              <tr><td>CGST Amt :</td><td>${currency(cgst)}</td></tr>
              <tr><td>SGST Amt :</td><td>${currency(sgst)}</td></tr>
              <tr><td>IGST Amt :</td><td>${currency(0)}</td></tr>
              <tr><td>Discount :</td><td>${currency(invoice.discount)}</td></tr>
              <tr><td>Payment Status :</td><td>${invoice.status}</td></tr>
              <tr class="total"><td>Total Amount :</td><td>${currency(invoice.total)}</td></tr>
            </table>
          </div>
        </div>

        <div class="footer">
          <div>
            <h4>Declaration</h4>
            <p>1. Subject to local jurisdiction.</p>
            <p>2. Terms & conditions are subject to our trade policy.</p>
            <p>3. Please preserve this invoice for warranty and return support.</p>
            <p><strong>E. &amp; O.E.</strong></p>
          </div>
          <div class="qr">
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="Payment QR" />` : ""}
            <p>${shop.upiId || "Add UPI ID in settings"}</p>
          </div>
          <div class="sign">
            <p><strong>For, ${shop.name.toUpperCase()}</strong></p>
            <div class="sign-line">Authorised Signatory</div>
          </div>
        </div>
      </div>
      <div class="thanks">Thank You For Business With Us!<br />© 2026 PoluSuraj. All rights reserved.</div>
    </body>
  </html>`;
}

const blankCustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: ""
};

const blankQuickProductForm = {
  name: "",
  sku: "",
  barcode: "",
  price: "",
  purchasePrice: "",
  stock: "1",
  reorderLevel: "5",
  gstRate: "18",
  category: "General",
  unit: "piece"
};

const fieldClassName =
  "w-full min-w-0 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white sm:text-base";

export function BillingWorkspace() {
  const products = useAppStore((state) => state.products);
  const customers = useAppStore((state) => state.customers);
  const shop = useAppStore((state) => state.shop);
  const lines = useAppStore((state) => state.cartLines);
  const search = useAppStore((state) => state.cartSearch);
  const selectedCustomerId = useAppStore((state) => state.selectedCustomerId);
  const paymentMethod = useAppStore((state) => state.paymentMethod);
  const invoiceMode = useAppStore((state) => state.invoiceMode);
  const invoiceStatus = useAppStore((state) => state.invoiceStatus);
  const lastActionMessage = useAppStore((state) => state.lastActionMessage);
  const invoices = useAppStore((state) => state.invoices);
  const addToCart = useAppStore((state) => state.addToCart);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const updateCartDiscount = useAppStore((state) => state.updateCartDiscount);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);
  const setPaymentMethod = useAppStore((state) => state.setPaymentMethod);
  const setCartSearch = useAppStore((state) => state.setCartSearch);
  const setSelectedCustomerId = useAppStore((state) => state.setSelectedCustomerId);
  const setInvoiceMode = useAppStore((state) => state.setInvoiceMode);
  const setInvoiceStatus = useAppStore((state) => state.setInvoiceStatus);
  const clearCart = useAppStore((state) => state.clearCart);
  const createInvoice = useAppStore((state) => state.createInvoice);
  const saveProduct = useAppStore((state) => state.saveProduct);
  const setActionMessage = useAppStore((state) => state.setActionMessage);

  const [lastInvoiceId, setLastInvoiceId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [saveCustomerToList, setSaveCustomerToList] = useState(false);
  const [customerForm, setCustomerForm] = useState(blankCustomerForm);
  const [quickProductForm, setQuickProductForm] = useState(blankQuickProductForm);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase();
    return products.filter((product) =>
      [product.name, product.sku, product.barcode, product.category].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [products, search]);

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const discount = lines.reduce((sum, line) => sum + line.discount, 0);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = invoiceMode === "GST" ? taxable * 0.18 : 0;
  const total = taxable + tax;
  const lastInvoice = invoices.find((invoice) => invoice.id === lastInvoiceId);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerForm({
        name: selectedCustomer.name || "",
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || ""
      });
      return;
    }

    setCustomerForm(blankCustomerForm);
  }, [selectedCustomerId, selectedCustomer]);

  const resolvedCustomer = useMemo<BillingCustomerDetails>(() => {
    return {
      name: customerForm.name.trim() || selectedCustomer?.name || "Walk-in Customer",
      phone: customerForm.phone.trim() || selectedCustomer?.phone || "",
      email: customerForm.email.trim() || selectedCustomer?.email || "",
      address: customerForm.address.trim() || selectedCustomer?.address || ""
    };
  }, [customerForm.address, customerForm.email, customerForm.name, customerForm.phone, selectedCustomer]);

  const previewInvoice = useMemo<Invoice | null>(() => {
    if (!lines.length) {
      return lastInvoice || null;
    }

    return {
      id: "preview-invoice",
      invoiceNumber: `${shop.invoicePrefix || "INV"}-PREVIEW`,
      customerId: selectedCustomer?.id,
      customerName: resolvedCustomer.name,
      customerPhone: resolvedCustomer.phone || undefined,
      customerEmail: resolvedCustomer.email || undefined,
      customerAddress: resolvedCustomer.address || undefined,
      items: lines,
      subtotal,
      discount,
      tax,
      total,
      profit: lines.reduce(
        (sum, line) => sum + (line.price - line.purchasePrice) * line.quantity - line.discount,
        0
      ),
      paymentMethod,
      mode: invoiceMode,
      status: invoiceStatus,
      createdAt: new Date().toISOString()
    };
  }, [
    discount,
    invoiceMode,
    invoiceStatus,
    lastInvoice,
    lines,
    paymentMethod,
    resolvedCustomer.address,
    resolvedCustomer.email,
    resolvedCustomer.name,
    resolvedCustomer.phone,
    selectedCustomer?.id,
    shop.invoicePrefix,
    subtotal,
    tax,
    total
  ]);

  const activeInvoice = previewInvoice;

  useEffect(() => {
    async function generateQr() {
      if (!activeInvoice || !shop.upiId || !activeInvoice.total || !["UPI", "Split"].includes(activeInvoice.paymentMethod)) {
        setQrCodeUrl("");
        return;
      }

      try {
        const payload = buildUpiPayload(shop.upiId, shop.name, activeInvoice.total, activeInvoice.invoiceNumber);
        const dataUrl = await QRCode.toDataURL(payload, {
          margin: 1,
          width: 220,
          color: {
            dark: "#0f172a",
            light: "#ffffff"
          }
        });
        setQrCodeUrl(dataUrl);
      } catch {
        setQrCodeUrl("");
      }
    }

    generateQr();
  }, [activeInvoice, shop.name, shop.upiId]);

  async function sendInvoiceThroughBackend(channel: "email" | "whatsapp") {
    if (!activeInvoice) {
      setActionMessage("Generate or preview an invoice before sending a PDF.");
      return false;
    }

    const endpoint = channel === "email" ? "/api/notifications/email" : "/api/notifications/whatsapp";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, invoice: activeInvoice })
    });

    const payload = await response.json().catch(() => null);
    if (response.ok && payload?.success) {
      setActionMessage(payload.message || `PDF invoice sent by ${channel}.`);
      return true;
    }

    return false;
  }

  function getInvoicePdfFile() {
    if (!activeInvoice) {
      return null;
    }
    return buildPdfFile(shop, activeInvoice);
  }

  function downloadPdfFile(file: File) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function sharePdfViaSystem(channel: "whatsapp" | "email") {
    if (!activeInvoice) {
      setActionMessage("Generate or preview an invoice before sending a PDF.");
      return false;
    }

    const file = getInvoicePdfFile();
    if (!file) {
      setActionMessage("PDF invoice could not be created right now.");
      return false;
    }

    const shareText = buildShareMessage(shop.name, activeInvoice);

    if (shouldUseNativeShare() && navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Invoice ${activeInvoice.invoiceNumber}`,
          text: shareText,
          files: [file]
        });
        setActionMessage(`PDF invoice shared using your device share sheet for ${activeInvoice.customerName}.`);
        return true;
      } catch {
        return false;
      }
    }

    downloadPdfFile(file);
    if (channel === "whatsapp") {
      const phone = normalisePhoneNumber(activeInvoice.customerPhone || resolvedCustomer.phone || "");
      const copied = await copyShareMessage(`${shareText}\nPDF downloaded as ${file.name}. Please attach it in WhatsApp.`);
      if (phone) {
        window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
      } else {
        window.open(`https://web.whatsapp.com/`, "_blank", "noopener,noreferrer");
      }
      setActionMessage(copied ? `PDF downloaded. WhatsApp Web opened and invoice text copied. Attach ${file.name} in the chat window.` : `PDF downloaded. WhatsApp Web opened. Attach ${file.name} in the chat window.`);
      return false;
    }

    const email = activeInvoice.customerEmail || resolvedCustomer.email || "";
    const subject = `Invoice ${activeInvoice.invoiceNumber} from ${shop.name}`;
    const copied = await copyShareMessage(`${shareText}\nPDF downloaded as ${file.name}. Please attach it in email.`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    setActionMessage(copied ? `PDF downloaded. Gmail compose opened and invoice text copied. Attach ${file.name} before sending.` : `PDF downloaded. Gmail compose opened. Attach ${file.name} before sending.`);
    return false;
  }

  function handleAiSuggestion() {
    const cartCategories = new Set(lines.map((line) => line.category));
    const suggested =
      products.find(
        (product) => !lines.some((line) => line.id === product.id) && cartCategories.has(product.category)
      ) || products.find((product) => !lines.some((line) => line.id === product.id));

    if (!suggested) {
      setActionMessage("No extra product suggestion is available right now.");
      return;
    }

    addToCart(suggested.id);
    setActionMessage(`${suggested.name} was suggested and added to the current bill.`);
  }

  function handleDownloadInvoice() {
    if (!activeInvoice) {
      setActionMessage("Create or preview an invoice before downloading it.");
      return;
    }

    downloadTextFile(
      `${activeInvoice.invoiceNumber}.txt`,
      buildInvoiceText(
        shop.name,
        activeInvoice.invoiceNumber,
        activeInvoice.items,
        activeInvoice.total,
        {
          name: activeInvoice.customerName,
          phone: activeInvoice.customerPhone || "",
          email: activeInvoice.customerEmail || "",
          address: activeInvoice.customerAddress || ""
        },
        activeInvoice.paymentMethod,
        shop.address,
        shop.gstNumber
      )
    );
    setActionMessage(`Invoice ${activeInvoice.invoiceNumber} downloaded successfully.`);
  }

  function handleDownloadPdfInvoice() {
    const file = getInvoicePdfFile();
    if (!file) {
      setActionMessage("Generate or preview an invoice before downloading the PDF.");
      return;
    }
    downloadPdfFile(file);
    setActionMessage(`PDF invoice ${file.name} downloaded successfully.`);
  }

  function handlePrintInvoice() {
    if (!activeInvoice) {
      setActionMessage("Create or preview an invoice before printing it.");
      return;
    }

    const printable = window.open("", "_blank", "width=900,height=700");
    if (!printable) {
      setActionMessage("Popup blocked. Please allow popups to print invoices.");
      return;
    }

    printable.document.write(buildPrintableInvoiceHtml(shop, activeInvoice, qrCodeUrl || null));
    printable.document.close();
    printable.focus();
    printable.print();
  }

  async function handleSendWhatsApp() {
    const sent = await sendInvoiceThroughBackend("whatsapp");
    if (!sent) {
      await sharePdfViaSystem("whatsapp");
    }
  }

  async function handleSendEmail() {
    const sent = await sendInvoiceThroughBackend("email");
    if (!sent) {
      await sharePdfViaSystem("email");
    }
  }

  function handleQuickAddProduct() {
    if (!quickProductForm.name.trim()) {
      setActionMessage("Enter product name before adding it during billing.");
      return;
    }

    const price = Number(quickProductForm.price);
    const purchasePrice = Number(quickProductForm.purchasePrice);
    const stock = Number(quickProductForm.stock);
    const reorderLevel = Number(quickProductForm.reorderLevel);
    const gstRate = Number(quickProductForm.gstRate);

    if (!Number.isFinite(price) || price <= 0) {
      setActionMessage("Enter a valid selling price for the new billing product.");
      return;
    }

    const createdId = `P-${Date.now()}`;
    saveProduct({
      id: createdId,
      name: quickProductForm.name.trim(),
      sku: quickProductForm.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: quickProductForm.barcode.trim() || `${Date.now()}`,
      price,
      purchasePrice: Number.isFinite(purchasePrice) && purchasePrice > 0 ? purchasePrice : price,
      stock: Number.isFinite(stock) && stock > 0 ? stock : 1,
      category: quickProductForm.category.trim() || "General",
      reorderLevel: Number.isFinite(reorderLevel) && reorderLevel >= 0 ? reorderLevel : 5,
      gstRate: Number.isFinite(gstRate) && gstRate >= 0 ? gstRate : 18,
      unit: quickProductForm.unit.trim() || "piece",
      image: undefined
    });
    addToCart(createdId);
    setQuickProductForm(blankQuickProductForm);
    setCartSearch("");
  }

  function handleQrAction() {
    if (!shop.upiId) {
      setActionMessage("Please add your shop UPI ID in Settings before collecting QR payments.");
      return;
    }
    if (!activeInvoice) {
      setActionMessage("Add items to the bill before generating a payment QR.");
      return;
    }
    if (!["UPI", "Split"].includes(activeInvoice.paymentMethod)) {
      setActionMessage("Choose UPI or Split payment to show a QR code.");
      return;
    }
    setActionMessage(`QR payment is ready for ${currency(activeInvoice.total)} on invoice ${activeInvoice.invoiceNumber}.`);
  }

  function handleFinalBill() {
    if (!lines.length) {
      setActionMessage("Add at least one product before generating the bill.");
      return;
    }

    if (!customerForm.name.trim() && !selectedCustomer) {
      setActionMessage("Enter customer name or choose an existing customer before generating the bill.");
      return;
    }

    const invoice = createInvoice({
      ...resolvedCustomer,
      saveToCustomers: saveCustomerToList,
      notes: "Created from billing counter",
      segment: selectedCustomer ? selectedCustomer.segment : "Counter Customer"
    });

    if (invoice) {
      setLastInvoiceId(invoice.id);
      setSaveCustomerToList(false);
      setCustomerForm(blankCustomerForm);
    }
  }

  const upiPayload = activeInvoice && shop.upiId && ["UPI", "Split"].includes(activeInvoice.paymentMethod)
    ? buildUpiPayload(shop.upiId, shop.name, activeInvoice.total, activeInvoice.invoiceNumber)
    : "";

  return (
    <div className="grid min-w-0 gap-4 2xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-4">
        <div className="glass-panel p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">Smart Billing Counter</h2>
              <p className="section-subtitle">Search products, enter customer details, and generate a real invoice from one screen.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCartSearch("wireless")}
                className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm dark:bg-white/5"
              >
                Voice Search Demo
              </button>
              <button
                type="button"
                onClick={() => setCartSearch("890600945003")}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
              >
                <ScanLine className="h-4 w-4" />
                Barcode Demo
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div>
              <label className="mb-2 block text-sm font-medium">Product Search</label>
              <input
                value={search}
                onChange={(event) => setCartSearch(event.target.value)}
                placeholder="Type product name, SKU, barcode, or category"
                className={fieldClassName}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Existing Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(event) => setSelectedCustomerId(event.target.value)}
                className={fieldClassName}
              >
                <option value="">Select saved customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Bill Type</label>
              <select
                value={invoiceMode}
                onChange={(event) => setInvoiceMode(event.target.value as typeof invoiceMode)}
                className={fieldClassName}
              >
                <option value="GST">GST Bill</option>
                <option value="NON_GST">Non-GST Bill</option>
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/40 p-4 dark:bg-white/5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">Customer Details For This Bill</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Fill customer name and mobile here while making the bill. These details will appear on the invoice.</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saveCustomerToList}
                  onChange={(event) => setSaveCustomerToList(event.target.checked)}
                />
                Save customer in database
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Customer Name</label>
                <input
                  value={customerForm.name}
                  onChange={(event) => setCustomerForm((state) => ({ ...state, name: event.target.value }))}
                  placeholder="Example: Rahul Verma"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Mobile Number</label>
                <input
                  value={customerForm.phone}
                  onChange={(event) => setCustomerForm((state) => ({ ...state, phone: event.target.value }))}
                  placeholder="Example: 9876543210"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email Address</label>
                <input
                  value={customerForm.email}
                  onChange={(event) => setCustomerForm((state) => ({ ...state, email: event.target.value }))}
                  placeholder="Example: customer@example.com"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Customer Address</label>
                <input
                  value={customerForm.address}
                  onChange={(event) => setCustomerForm((state) => ({ ...state, address: event.target.value }))}
                  placeholder="Example: Vijay Nagar, Indore"
                  className={fieldClassName}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/40 p-4 dark:bg-white/5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">Add Product During Billing</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create a missing item right at the counter and add it directly to the current bill.</p>
              </div>
              <button
                type="button"
                onClick={handleQuickAddProduct}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
              >
                Add Product To Bill
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <input value={quickProductForm.name} onChange={(event) => setQuickProductForm((state) => ({ ...state, name: event.target.value }))} placeholder="Product name" className={fieldClassName} />
              <input value={quickProductForm.sku} onChange={(event) => setQuickProductForm((state) => ({ ...state, sku: event.target.value.toUpperCase() }))} placeholder="SKU / item code" className={fieldClassName} />
              <input value={quickProductForm.barcode} onChange={(event) => setQuickProductForm((state) => ({ ...state, barcode: event.target.value }))} placeholder="Barcode number" className={fieldClassName} />
              <input value={quickProductForm.price} onChange={(event) => setQuickProductForm((state) => ({ ...state, price: event.target.value }))} placeholder="Selling price" className={fieldClassName} />
              <input value={quickProductForm.purchasePrice} onChange={(event) => setQuickProductForm((state) => ({ ...state, purchasePrice: event.target.value }))} placeholder="Purchase price" className={fieldClassName} />
              <input value={quickProductForm.stock} onChange={(event) => setQuickProductForm((state) => ({ ...state, stock: event.target.value }))} placeholder="Opening stock" className={fieldClassName} />
              <input value={quickProductForm.reorderLevel} onChange={(event) => setQuickProductForm((state) => ({ ...state, reorderLevel: event.target.value }))} placeholder="Reorder level" className={fieldClassName} />
              <input value={quickProductForm.gstRate} onChange={(event) => setQuickProductForm((state) => ({ ...state, gstRate: event.target.value }))} placeholder="GST %" className={fieldClassName} />
              <input value={quickProductForm.category} onChange={(event) => setQuickProductForm((state) => ({ ...state, category: event.target.value }))} placeholder="Category" className={fieldClassName} />
              <input value={quickProductForm.unit} onChange={(event) => setQuickProductForm((state) => ({ ...state, unit: event.target.value }))} placeholder="Unit" className={fieldClassName} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product.id)}
                className="rounded-3xl border border-white/10 bg-white/60 p-4 text-left transition hover:-translate-y-1 hover:shadow-soft dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {product.category} • {product.sku} • {product.barcode}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs text-brand-700 dark:text-brand-100">
                    Stock {product.stock}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-xl font-semibold">{currency(product.price)}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">GST {product.gstRate}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold">Actual Invoice</h3>
              <p className="section-subtitle">Professional bill layout with customer info, GST totals, QR payment, and print support.</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700 dark:text-emerald-200">
              {activeInvoice?.status || invoiceStatus}
            </span>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/60 p-5 dark:bg-white/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-display text-2xl font-semibold">{shop.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{shop.address}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">GSTIN {shop.gstNumber}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{shop.phone} • {shop.email}</p>
              </div>
              <div className="text-left text-sm text-slate-500 sm:text-right dark:text-slate-400">
                <p className="font-medium text-slate-900 dark:text-white">{activeInvoice?.invoiceNumber || `${shop.invoicePrefix}-PREVIEW`}</p>
                <p>{formatDate(activeInvoice?.createdAt || new Date().toISOString())}</p>
                <p>{activeInvoice?.mode === "GST" ? "GST Invoice" : "Retail Invoice"}</p>
                <p>Payment {activeInvoice?.paymentMethod || paymentMethod}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Bill To</p>
                <p className="mt-2 font-medium">{activeInvoice?.customerName || "Walk-in Customer"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mobile: {activeInvoice?.customerPhone || "Not entered"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Email: {activeInvoice?.customerEmail || "Not entered"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Address: {activeInvoice?.customerAddress || "Not entered"}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Amount Due</p>
                <p className="mt-2 font-display text-2xl font-semibold">{currency(activeInvoice?.total || total)}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Status {activeInvoice?.status || invoiceStatus}</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-[640px] text-left text-sm">
                <thead className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeInvoice?.items || []).map((line: CartLine) => (
                    <tr key={line.id} className="border-t border-white/10 bg-white/50 dark:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="font-medium">{line.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{line.sku}</p>
                      </td>
                      <td className="px-4 py-3">{line.quantity}</td>
                      <td className="px-4 py-3">{currency(line.price)}</td>
                      <td className="px-4 py-3">{currency(line.discount)}</td>
                      <td className="px-4 py-3">{currency(line.price * line.quantity - line.discount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>{currency(activeInvoice?.subtotal || subtotal)}</span></div>
                <div className="mt-2 flex items-center justify-between text-sm"><span>Discount</span><span>{currency(activeInvoice?.discount || discount)}</span></div>
                <div className="mt-2 flex items-center justify-between text-sm"><span>Tax</span><span>{currency(activeInvoice?.tax || tax)}</span></div>
                <div className="mt-3 flex items-center justify-between font-display text-xl font-semibold"><span>Total</span><span>{currency(activeInvoice?.total || total)}</span></div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 text-center">
                {qrCodeUrl ? (
                  <>
                    <img src={qrCodeUrl} alt="UPI Payment QR" className="mx-auto h-40 w-40 sm:h-[180px] sm:w-[180px] rounded-2xl bg-white p-2" />
                    <p className="mt-3 text-sm font-medium">Scan to Pay</p>
                    <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">{shop.upiId}</p>
                  </>
                ) : (
                  <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                    <QrCode className="h-8 w-8" />
                    <p className="mt-3 text-sm">QR will appear for UPI or Split payment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(["Paid", "Pending", "Partial"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setInvoiceStatus(status)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  invoiceStatus === status
                    ? "bg-brand-500 text-white"
                    : "border border-white/10 bg-white/60 dark:bg-white/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {lines.length ? lines.map((line) => (
              <div key={line.id} className="rounded-3xl border border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{line.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {currency(line.price)} each • stock {line.stock}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeFromCart(line.id)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="inline-flex items-center rounded-2xl border border-white/10">
                    <button type="button" onClick={() => updateCartQuantity(line.id, line.quantity - 1)} className="px-3 py-2">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-10 text-center">{line.quantity}</span>
                    <button type="button" onClick={() => updateCartQuantity(line.id, line.quantity + 1)} className="px-3 py-2">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Discount Amount</label>
                    <input
                      type="number"
                      min={0}
                      value={line.discount}
                      onChange={(event) => updateCartDiscount(line.id, Number(event.target.value))}
                      className="w-full rounded-2xl sm:w-36 border border-white/10 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <span className="font-medium sm:ml-auto">{currency(line.price * line.quantity - line.discount)}</span>
                </div>
              </div>
            )) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(["Cash", "UPI", "Card", "Split"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  paymentMethod === method
                    ? "bg-brand-500 text-white"
                    : "border border-white/10 bg-white/60 dark:bg-white/5"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={handleFinalBill}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
            >
              <ShoppingCart className="h-4 w-4" />
              Generate Final Bill
            </button>
            <button
              type="button"
              onClick={handlePrintInvoice}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </button>
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <Send className="h-4 w-4" />
              Download Invoice Text
            </button>
            <button
              type="button"
              onClick={handleDownloadPdfInvoice}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <Download className="h-4 w-4" />
              Download PDF Invoice
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <MessageCircle className="h-4 w-4" />
              Open WhatsApp + PDF
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <Mail className="h-4 w-4" />
              Open Email + PDF
            </button>
            <button
              type="button"
              onClick={handleQrAction}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <QrCode className="h-4 w-4" />
              Show Live QR Payment
            </button>
            <button
              type="button"
              onClick={handleAiSuggestion}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <WandSparkles className="h-4 w-4" />
              AI Bill Suggestion
            </button>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setCustomerForm(blankCustomerForm);
                setSaveCustomerToList(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          </div>

          {upiPayload ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/50 p-4 text-xs break-all text-slate-500 dark:bg-white/5 dark:text-slate-400">
              UPI Link: {upiPayload}
            </div>
          ) : null}

          {lastActionMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
              {lastActionMessage}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

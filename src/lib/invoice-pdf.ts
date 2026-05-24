import QRCode from "qrcode";

import { CartLine, Invoice, ShopProfile } from "@/types";
import { pdfCurrency } from "@/lib/utils";

export type InvoicePdfShop = Pick<
  ShopProfile,
  "name" | "address" | "gstNumber" | "phone" | "email"
> & {
  upiId?: string;
  businessType?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountHolder?: string;
};

type RgbColor = [number, number, number];

type TextOptions = {
  size?: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
  color?: RgbColor;
};

const PAGE_HEIGHT = 842;
const OUTER_X = 30;
const OUTER_Y = 50;
const OUTER_WIDTH = 535;
const OUTER_HEIGHT = 730;
const LIGHT_BLUE: RgbColor = [0.89, 0.94, 0.98];
const BORDER: RgbColor = [0.58, 0.63, 0.69];
const TEXT: RgbColor = [0.12, 0.16, 0.22];
const SUBTLE: RgbColor = [0.39, 0.45, 0.51];
const BRAND: RgbColor = [0.08, 0.43, 0.78];

type QrModuleMatrix = {
  size: number;
  get: (row: number, col: number) => boolean;
};

type QrCodeObject = {
  modules: QrModuleMatrix;
};

const qrCodeLib = QRCode as unknown as {
  create: (text: string, options?: { errorCorrectionLevel?: string; margin?: number }) => QrCodeObject;
};

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

function pdfSafe(value: string) {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function rectY(top: number, height: number) {
  return PAGE_HEIGHT - top - height;
}

function lineY(top: number) {
  return PAGE_HEIGHT - top;
}

function textWidth(text: string, size: number) {
  return text.length * size * 0.48;
}

function formatInvoiceDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(new Date(value));
}

function wrapText(text: string, maxChars: number) {
  const cleaned = text.trim();
  if (!cleaned) {
    return [""];
  }

  if (cleaned.length <= maxChars) {
    return [cleaned];
  }

  const words = cleaned.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function truncate(text: string, maxChars: number) {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

function deriveHsn(item: CartLine) {
  const digits = `${item.barcode || item.sku || item.id}`.replace(/\D/g, "");
  return digits.slice(-4) || item.sku.slice(0, 4).toUpperCase() || "0000";
}

function quantityLabel(item: CartLine) {
  return `${item.quantity} ${item.unit || "pc"}`.trim();
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

function toWordsUnderThousand(value: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (value < 20) {
    return ones[value];
  }

  if (value < 100) {
    return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ""}`.trim();
  }

  const hundred = Math.floor(value / 100);
  const remainder = value % 100;
  return `${ones[hundred]} Hundred${remainder ? ` ${toWordsUnderThousand(remainder)}` : ""}`.trim();
}

export function amountToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0) {
    return paise ? `Zero Rupees and ${toWordsUnderThousand(paise)} Paise Only` : "Zero Rupees Only";
  }

  const parts: string[] = [];
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  if (crore) parts.push(`${toWordsUnderThousand(crore)} Crore`);
  if (lakh) parts.push(`${toWordsUnderThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${toWordsUnderThousand(thousand)} Thousand`);
  if (remainder) parts.push(toWordsUnderThousand(remainder));

  const base = `${parts.join(" ")} Rupees`;
  return paise ? `${base} and ${toWordsUnderThousand(paise)} Paise Only` : `${base} Only`;
}

function makeCommands() {
  const commands: string[] = [];

  const setStroke = (color: RgbColor) => {
    commands.push(`${color[0]} ${color[1]} ${color[2]} RG`);
  };

  const setFill = (color: RgbColor) => {
    commands.push(`${color[0]} ${color[1]} ${color[2]} rg`);
  };

  const drawRect = (x: number, top: number, width: number, height: number, fill?: RgbColor, stroke: RgbColor = BORDER) => {
    if (fill) {
      setFill(fill);
    }
    setStroke(stroke);
    commands.push(`1 w ${x} ${rectY(top, height)} ${width} ${height} re ${fill ? "B" : "S"}`);
  };

  const drawLine = (x1: number, top1: number, x2: number, top2: number, color: RgbColor = BORDER) => {
    setStroke(color);
    commands.push(`1 w ${x1} ${lineY(top1)} m ${x2} ${lineY(top2)} l S`);
  };

  const fillRect = (x: number, top: number, width: number, height: number, color: RgbColor) => {
    setFill(color);
    commands.push(`${x} ${rectY(top, height)} ${width} ${height} re f`);
  };

  const drawText = (x: number, top: number, text: string, options: TextOptions = {}, width = 0) => {
    const size = options.size ?? 10;
    const font = options.bold ? "/F2" : "/F1";
    const color = options.color ?? TEXT;
    let drawX = x;

    if (options.align === "center" && width) {
      drawX = x + Math.max(0, (width - textWidth(text, size)) / 2);
    }
    if (options.align === "right" && width) {
      drawX = x + Math.max(0, width - textWidth(text, size));
    }

    commands.push("BT");
    commands.push(`${font} ${size} Tf`);
    commands.push(`${color[0]} ${color[1]} ${color[2]} rg`);
    commands.push(`1 0 0 1 ${drawX.toFixed(2)} ${(PAGE_HEIGHT - top).toFixed(2)} Tm`);
    commands.push(`(${pdfSafe(text)}) Tj`);
    commands.push("ET");
  };

  return { commands, drawRect, drawLine, drawText, fillRect };
}

export function buildProfessionalInvoicePdfBytes(shop: InvoicePdfShop, invoice: Invoice) {
  const totalQuantity = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const cgst = invoice.mode === "GST" ? invoice.tax / 2 : 0;
  const sgst = invoice.mode === "GST" ? invoice.tax / 2 : 0;
  const igst = 0;
  const roundOff = Math.round(invoice.total) - invoice.total;
  const words = amountToWords(invoice.total);
  const { commands, drawRect, drawLine, drawText, fillRect } = makeCommands();

  const qrPayload = shop.upiId ? buildUpiPayload(shop.upiId, shop.name || "Business", invoice.total, invoice.invoiceNumber) : "";
  const qrCode = qrPayload ? qrCodeLib.create(qrPayload, { errorCorrectionLevel: "M", margin: 0 }) : null;

  const headerBarHeight = 18;
  const companyTop = OUTER_Y;
  const companyHeight = 106;
  const customerTop = companyTop + companyHeight;
  const customerHeight = 150;
  const leftWidth = 335;
  const rightWidth = OUTER_WIDTH - leftWidth;
  const tableTop = customerTop + customerHeight;
  const tableHeaderHeight = 24;
  const itemDisplayRows = Math.max(invoice.items.length, 4);
  const rowHeight = 18;
  const tableRows = itemDisplayRows + 1;
  const tableHeight = tableHeaderHeight + tableRows * rowHeight;
  const summaryTop = tableTop + tableHeight;
  const summaryHeight = 128;
  const footerTop = summaryTop + summaryHeight;
  const footerHeight = OUTER_Y + OUTER_HEIGHT - footerTop;
  const innerLeft = OUTER_X + leftWidth;
  const bankWidth = 270;
  const summaryWidth = OUTER_WIDTH - bankWidth;

  drawText(OUTER_X, 36, "Tax Invoice", { size: 11, align: "center" }, OUTER_WIDTH);
  drawText(OUTER_X + OUTER_WIDTH - 170, 36, "Original / Duplicate Bill", { size: 8, align: "right", color: SUBTLE }, 170);

  drawRect(OUTER_X, OUTER_Y, OUTER_WIDTH, OUTER_HEIGHT);
  drawLine(OUTER_X, customerTop, OUTER_X + OUTER_WIDTH, customerTop);
  drawLine(OUTER_X, tableTop, OUTER_X + OUTER_WIDTH, tableTop);
  drawLine(OUTER_X, summaryTop, OUTER_X + OUTER_WIDTH, summaryTop);
  drawLine(OUTER_X, footerTop, OUTER_X + OUTER_WIDTH, footerTop);
  drawLine(innerLeft, customerTop, innerLeft, tableTop);
  drawLine(OUTER_X + bankWidth, summaryTop, OUTER_X + bankWidth, footerTop);

  const businessMark = getBusinessMark(shop.name || "Bill Desk");

  drawRect(OUTER_X + 14, companyTop + 16, 54, 54, [0.12, 0.48, 0.83], [0.12, 0.48, 0.83]);
  drawText(OUTER_X + 14, companyTop + 46, businessMark, { size: businessMark.length > 2 ? 16 : 20, bold: true, align: "center", color: [1, 1, 1] }, 54);

  drawText(OUTER_X + 78, companyTop + 16, `GSTIN : ${shop.gstNumber || "Not Provided"}`, { size: 8, color: SUBTLE });
  drawText(OUTER_X + 78, companyTop + 34, (shop.name || "Bill Desk Store").toUpperCase(), { size: 15, bold: true });
  drawText(OUTER_X + 78, companyTop + 50, shop.businessType || "General Business", { size: 8 });
  wrapText(shop.address || "Address not provided", 52).slice(0, 2).forEach((line, index) => {
    drawText(OUTER_X + 78, companyTop + 62 + index * 12, line, { size: 8 });
  });
  drawText(OUTER_X + 78, companyTop + 88, `Contact No. : ${shop.phone || "Not Provided"}`, { size: 8 });
  drawText(OUTER_X + 78, companyTop + 100, `Email : ${shop.email || "Not Provided"}`, { size: 8 });

  drawRect(OUTER_X, customerTop, leftWidth, headerBarHeight, LIGHT_BLUE);
  drawRect(innerLeft, customerTop, rightWidth, customerHeight);
  drawText(OUTER_X + 10, customerTop + 12, "Bill To", { size: 8, color: SUBTLE });

  const shipTop = customerTop + 76;
  drawLine(OUTER_X, shipTop, innerLeft, shipTop);
  drawRect(OUTER_X, shipTop, leftWidth, headerBarHeight, LIGHT_BLUE);
  drawText(OUTER_X + 10, shipTop + 12, "Ship To", { size: 8, color: SUBTLE });

  const customerName = invoice.customerName || "Walk-in Customer";
  const customerAddress = invoice.customerAddress || "Address not provided";
  const customerPhone = invoice.customerPhone || "Not provided";
  const customerEmail = invoice.customerEmail || "Not provided";

  const leftBlock = (top: number) => {
    drawText(OUTER_X + 12, top + 24, `Name : ${customerName}`, { size: 8 });
    wrapText(`Address : ${customerAddress}`, 44).slice(0, 2).forEach((line, index) => {
      drawText(OUTER_X + 12, top + 36 + index * 10, line, { size: 8 });
    });
    drawText(OUTER_X + 12, top + 58, `Mobile : ${customerPhone}`, { size: 8 });
    drawText(OUTER_X + 12, top + 70, `Email : ${truncate(customerEmail, 34)}`, { size: 8 });
  };

  leftBlock(customerTop);
  leftBlock(shipTop);

  const metaLabelX = innerLeft + 14;
  const metaLabelWidth = 72;
  const metaColonX = metaLabelX + metaLabelWidth + 4;
  const metaValueX = metaColonX + 8;
  const metaRows = [
    ["Invoice No", invoice.invoiceNumber],
    ["Date", formatInvoiceDate(invoice.createdAt)],
    ["Payment", invoice.paymentMethod],
    ["Reverse", invoice.mode === "GST" ? "YES" : "NO"],
    ["Order No", invoice.id.slice(-6).toUpperCase()],
    ["Ref No", shop.gstNumber ? shop.gstNumber.slice(-6) : "N/A"],
    ["Delivery", formatInvoiceDate(invoice.createdAt)],
    ["Transport", invoice.status === "Paid" ? "Self Pickup" : "Pending"],
    ["Terms", "Standard Delivery"]
  ];

  metaRows.forEach(([label, value], index) => {
    const rowTop = customerTop + 22 + index * 13;
    if (index === 4) {
      drawLine(innerLeft, customerTop + 74, OUTER_X + OUTER_WIDTH, customerTop + 74);
    }
    drawText(metaLabelX, rowTop, String(label), { size: 7.5, color: SUBTLE, align: "right" }, metaLabelWidth);
    drawText(metaColonX, rowTop, ":", { size: 7.5, color: SUBTLE, align: "center" }, 6);
    drawText(metaValueX, rowTop, truncate(String(value), 18), { size: 7.5, bold: index < 4 }, rightWidth - (metaValueX - innerLeft) - 14);
  });

  drawRect(OUTER_X, tableTop, OUTER_WIDTH, tableHeaderHeight, LIGHT_BLUE);
  const columnWidths = [24, 170, 45, 42, 50, 56, 32, 48, 58];
  const columnLabels = ["Sr", "Goods & Service Description", "HSN", "Quantity", "Rate", "Taxable", "%", "Amt.", "Total"];
  const columnX: number[] = [OUTER_X];
  for (let i = 0; i < columnWidths.length; i += 1) {
    columnX.push(columnX[i] + columnWidths[i]);
  }

  columnX.forEach((x, index) => {
    if (index > 0 && index < columnX.length) {
      drawLine(x, tableTop, x, tableTop + tableHeight);
    }
  });

  drawText(columnX[0] + 5, tableTop + 15, columnLabels[0], { size: 8 });
  drawText(columnX[1] + 5, tableTop + 15, columnLabels[1], { size: 8 });
  drawText(columnX[2] + 5, tableTop + 15, columnLabels[2], { size: 8 });
  drawText(columnX[3] + 5, tableTop + 15, columnLabels[3], { size: 8 });
  drawText(columnX[4] + 5, tableTop + 15, columnLabels[4], { size: 8 });
  drawText(columnX[5] + 5, tableTop + 15, columnLabels[5], { size: 8 });
  drawText(columnX[6] + 6, tableTop + 9, "GST", { size: 7, color: SUBTLE });
  drawText(columnX[6] + 7, tableTop + 18, columnLabels[6], { size: 8 });
  drawText(columnX[7] + 7, tableTop + 18, columnLabels[7], { size: 8 });
  drawText(columnX[8] + 7, tableTop + 15, columnLabels[8], { size: 8 });

  drawLine(OUTER_X, tableTop + tableHeaderHeight, OUTER_X + OUTER_WIDTH, tableTop + tableHeaderHeight);

  for (let index = 0; index < itemDisplayRows; index += 1) {
    const rowTop = tableTop + tableHeaderHeight + index * rowHeight;
    drawLine(OUTER_X, rowTop + rowHeight, OUTER_X + OUTER_WIDTH, rowTop + rowHeight, [0.84, 0.87, 0.9]);

    const item = invoice.items[index];
    if (!item) {
      continue;
    }

    const lineTotal = item.price * item.quantity - item.discount;
    const gstRate = invoice.mode === "GST" ? item.gstRate || 18 : 0;
    const gstAmount = invoice.mode === "GST" ? lineTotal * gstRate / 100 : 0;

    drawText(columnX[0] + 6, rowTop + 13, String(index + 1), { size: 8 });
    drawText(columnX[1] + 5, rowTop + 13, truncate(item.name, 34), { size: 8 });
    drawText(columnX[2] + 5, rowTop + 13, deriveHsn(item), { size: 8 });
    drawText(columnX[3] + 5, rowTop + 13, truncate(quantityLabel(item), 7), { size: 8 });
    drawText(columnX[4] + 4, rowTop + 13, pdfCurrency(item.price), { size: 8, align: "right" }, columnWidths[4] - 8);
    drawText(columnX[5] + 4, rowTop + 13, pdfCurrency(lineTotal), { size: 8, align: "right" }, columnWidths[5] - 8);
    drawText(columnX[6] + 4, rowTop + 13, `${gstRate}%`, { size: 8, align: "right" }, columnWidths[6] - 8);
    drawText(columnX[7] + 4, rowTop + 13, pdfCurrency(gstAmount), { size: 8, align: "right" }, columnWidths[7] - 8);
    drawText(columnX[8] + 4, rowTop + 13, pdfCurrency(lineTotal + gstAmount), { size: 8, align: "right" }, columnWidths[8] - 8);
  }

  const subtotalRowTop = tableTop + tableHeaderHeight + itemDisplayRows * rowHeight;
  drawRect(OUTER_X, subtotalRowTop, OUTER_WIDTH, rowHeight, LIGHT_BLUE, BORDER);
  columnX.forEach((x, index) => {
    if (index > 0 && index < columnX.length) {
      drawLine(x, subtotalRowTop, x, subtotalRowTop + rowHeight);
    }
  });
  drawText(columnX[3] + 5, subtotalRowTop + 12, String(totalQuantity), { size: 8 });
  drawText(columnX[4] + 4, subtotalRowTop + 12, "Sub-Total", { size: 7.5, bold: true });
  drawText(columnX[5] + 4, subtotalRowTop + 12, pdfCurrency(invoice.subtotal - invoice.discount), { size: 8, align: "right" }, columnWidths[5] - 8);
  drawText(columnX[7] + 4, subtotalRowTop + 12, pdfCurrency(invoice.tax), { size: 8, align: "right" }, columnWidths[7] - 8);
  drawText(columnX[8] + 4, subtotalRowTop + 12, pdfCurrency(invoice.total), { size: 8, align: "right" }, columnWidths[8] - 8);

  drawRect(OUTER_X, summaryTop, bankWidth, summaryHeight);
  drawRect(OUTER_X + bankWidth, summaryTop, summaryWidth, 16, LIGHT_BLUE);
  drawText(OUTER_X + 10, summaryTop + 14, "Our Bank Details", { size: 8, color: SUBTLE });
  drawText(OUTER_X + bankWidth + 12, summaryTop + 13, "Summary", { size: 8, color: SUBTLE });
  drawText(OUTER_X + OUTER_WIDTH - 78, summaryTop + 13, "Amount", { size: 8, color: SUBTLE });

  const bankRows = [
    ["Bank Name", shop.bankName || "Add in settings"],
    ["Branch", shop.bankBranch || "Add in settings"],
    ["Account No", shop.bankAccountNumber || "Add in settings"],
    ["IFSC", shop.bankIfsc || "Add in settings"],
    ["A/C Holder", shop.bankAccountHolder || shop.name || "Add in settings"],
    ["UPI ID", shop.upiId || "Add in settings"]
  ];
  bankRows.forEach(([label, value], index) => {
    drawText(OUTER_X + 12, summaryTop + 30 + index * 11, `${label} :`, { size: 8, color: SUBTLE });
    drawText(OUTER_X + 92, summaryTop + 30 + index * 11, truncate(String(value), 24), { size: 8 });
  });

  drawLine(OUTER_X + bankWidth, summaryTop + 16, OUTER_X + OUTER_WIDTH, summaryTop + 16);
  const summaryLabelX = OUTER_X + bankWidth + 12;
  const summaryValueX = OUTER_X + OUTER_WIDTH - 88;
  const summaryRows = [
    ["CGST Amt :", pdfCurrency(cgst)],
    ["SGST Amt :", pdfCurrency(sgst)],
    ["IGST Amt :", pdfCurrency(igst)],
    ["Discount :", pdfCurrency(invoice.discount)],
    ["Round Off :", pdfCurrency(roundOff)]
  ];
  summaryRows.forEach(([label, value], index) => {
    const rowTop = summaryTop + 28 + index * 15;
    drawLine(OUTER_X + bankWidth, rowTop + 8, OUTER_X + OUTER_WIDTH, rowTop + 8, [0.84, 0.87, 0.9]);
    drawText(summaryLabelX, rowTop, String(label), { size: 8 }, 120);
    drawText(summaryValueX, rowTop, String(value), { size: 8, align: "right" }, 76);
  });
  drawRect(OUTER_X + bankWidth, summaryTop + 100, summaryWidth, 18, LIGHT_BLUE);
  drawText(summaryLabelX, summaryTop + 113, "Total Amount :", { size: 9, bold: true }, 120);
  drawText(summaryValueX, summaryTop + 113, pdfCurrency(invoice.total), { size: 9, bold: true, align: "right" }, 76);

  drawText(OUTER_X + 10, summaryTop + 97, "Invoice Total In Word", { size: 8, color: SUBTLE });
  wrapText(words, 34).slice(0, 3).forEach((line, index) => {
    drawText(OUTER_X + 10, summaryTop + 108 + index * 10, line, { size: 8 });
  });

  drawText(OUTER_X + 12, footerTop + 16, "Declaration", { size: 8, color: SUBTLE });
  [
    "1. Subject to local jurisdiction.",
    "2. Goods once sold will be exchanged only as per store policy.",
    "3. Please preserve this invoice for warranty and returns."
  ].forEach((line, index) => {
    drawText(OUTER_X + 12, footerTop + 32 + index * 12, line, { size: 8 });
  });
  drawText(OUTER_X + 12, footerTop + footerHeight - 12, "E. & O.E.", { size: 8 });

  const qrBoxX = OUTER_X + 238;
  const qrBoxTop = footerTop + 14;
  const qrBoxSize = 66;
  drawRect(qrBoxX, qrBoxTop, qrBoxSize, qrBoxSize, [1, 1, 1], BORDER);
  if (qrCode) {
    const qrMargin = 5;
    const moduleSize = (qrBoxSize - qrMargin * 2) / qrCode.modules.size;
    for (let row = 0; row < qrCode.modules.size; row += 1) {
      for (let col = 0; col < qrCode.modules.size; col += 1) {
        if (qrCode.modules.get(row, col)) {
          fillRect(qrBoxX + qrMargin + col * moduleSize, qrBoxTop + qrMargin + row * moduleSize, moduleSize, moduleSize, TEXT);
        }
      }
    }
    drawLine(qrBoxX, qrBoxTop + qrBoxSize, qrBoxX + qrBoxSize, qrBoxTop + qrBoxSize, BORDER);
  } else {
    drawText(qrBoxX, qrBoxTop + 32, "QR", { size: 12, bold: true, align: "center", color: BRAND }, qrBoxSize);
  }
  drawText(OUTER_X + 220, footerTop + 90, shop.upiId ? truncate(shop.upiId, 20) : "Add UPI ID in settings", { size: 7, align: "center", color: SUBTLE }, 120);

  drawText(OUTER_X + OUTER_WIDTH - 170, footerTop + 24, `For, ${(shop.name || "Bill Desk Store").toUpperCase()}`, { size: 8, align: "center" }, 150);
  drawLine(OUTER_X + OUTER_WIDTH - 155, footerTop + 84, OUTER_X + OUTER_WIDTH - 20, footerTop + 84, BORDER);
  drawText(OUTER_X + OUTER_WIDTH - 154, footerTop + 96, "Authorised Signatory", { size: 8, align: "center" }, 136);

  drawText(OUTER_X, OUTER_Y + OUTER_HEIGHT + 14, "Thank You For Business With Us!", { size: 8, align: "center" }, OUTER_WIDTH);
  drawText(OUTER_X, OUTER_Y + OUTER_HEIGHT + 25, "© 2026 PoluSuraj. All rights reserved.", { size: 7, align: "center", color: SUBTLE }, OUTER_WIDTH);

  const contentStream = commands.join("\n");
  const contentLength = new TextEncoder().encode(contentStream).length;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj",
    `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj"
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

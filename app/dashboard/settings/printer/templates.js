// Printer template catalog: multiple visual designs per document type, each
// rendered as self-contained thermal-receipt HTML (used for gallery thumbnails,
// the full preview modal, and browser test prints).

export const DOC_TYPES = [
  { key: "receipt", label: "Receipt / Bill" },
  { key: "kot", label: "KOT" },
  { key: "qrOrderSlip", label: "QR Order Slip" },
];

export const TEMPLATE_STYLES = {
  receipt: [
    {
      id: "classic",
      name: "Classic",
      description: "Centered header with dashed separators — standard thermal look.",
    },
    {
      id: "compact",
      name: "Compact",
      description: "Tight rows and small fonts to save paper on 58mm rolls.",
    },
    {
      id: "detailed",
      name: "Detailed",
      description: "Bold section blocks with a highlighted grand total.",
    },
  ],
  kot: [
    {
      id: "classic",
      name: "Classic",
      description: "Simple ticket with order info and item list.",
    },
    {
      id: "bold",
      name: "Big & Bold",
      description: "Extra-large item text for easy reading in the kitchen.",
    },
    {
      id: "sectioned",
      name: "Sectioned",
      description: "Items grouped by kitchen section, notes highlighted.",
    },
  ],
  qrOrderSlip: [
    {
      id: "classic",
      name: "Classic",
      description: "Order confirmation with full item breakdown.",
    },
    {
      id: "token",
      name: "Token",
      description: "Large token number for customer pickup counters.",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Just the essentials — order no, items and total.",
    },
  ],
};

export const SAMPLE_DATA = {
  restaurant: "Spice Garden",
  branch: "MG Road Branch",
  address: "12, MG Road, Bengaluru",
  phone: "+91 98450 12345",
  orderNo: "ORD-1042",
  kotNo: "KOT-218",
  token: "47",
  table: "T-05",
  date: "18/07/2026 1:24 PM",
  cashier: "Ravi",
  payment: "UPI",
  items: [
    { qty: 2, name: "Paneer Butter Masala", price: 260, section: "Kitchen", note: "Less spicy" },
    { qty: 3, name: "Butter Naan", price: 40, section: "Tandoor", note: "" },
    { qty: 1, name: "Veg Biryani", price: 180, section: "Kitchen", note: "No onion" },
    { qty: 2, name: "Sweet Lassi", price: 60, section: "Beverages", note: "" },
  ],
};

const PAPER_WIDTH_PX = { "58mm": 220, "80mm": 302 };

const money = (symbol, value) => `${symbol}${value.toFixed(2)}`;

const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function wrap(body, extraCss, paperWidth) {
  const width = PAPER_WIDTH_PX[paperWidth] || PAPER_WIDTH_PX["80mm"];
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Courier New", ui-monospace, monospace;
    width: ${width}px;
    margin: 0 auto;
    padding: 10px 8px;
    color: #000;
    background: #fff;
    font-size: 12px;
    line-height: 1.45;
  }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  .muted { font-size: 10px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { vertical-align: top; padding: 1px 0; }
  .dashed { border-top: 1px dashed #000; margin: 6px 0; }
  .solid { border-top: 1px solid #000; margin: 6px 0; }
  .double { border-top: 3px double #000; margin: 6px 0; }
  @media print { body { width: 100%; } }
  ${extraCss || ""}
</style>
</head>
<body>${body}</body>
</html>`;
}

// ── Receipt / Bill ──────────────────────────────────────────────────────────

function receiptCalc(d) {
  const subtotal = d.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  return { subtotal, gst, total: subtotal + gst };
}

function receiptHeader(d, s) {
  return `
    <div class="center">
      <div class="bold" style="font-size:15px">${esc(d.restaurant)}</div>
      <div class="muted">${esc(d.branch)}</div>
      <div class="muted">${esc(d.address)} · ${esc(d.phone)}</div>
      ${s.headerText ? `<div class="muted" style="margin-top:2px">${esc(s.headerText)}</div>` : ""}
      ${s.showGSTNumber && s.gstNumber ? `<div class="muted">GSTIN: ${esc(s.gstNumber)}</div>` : ""}
    </div>`;
}

function receiptItemsRows(d, sym) {
  return d.items
    .map(
      (i) => `
      <tr>
        <td>${i.qty} x ${esc(i.name)}</td>
        <td class="right">${money(sym, i.qty * i.price)}</td>
      </tr>`,
    )
    .join("");
}

function receiptFooter(s) {
  return s.footerText
    ? `<div class="center muted" style="margin-top:8px">${esc(s.footerText)}</div>`
    : "";
}

const RECEIPT_RENDERERS = {
  classic(d, s, paperWidth) {
    const sym = s.currencySymbol || "₹";
    const { subtotal, gst, total } = receiptCalc(d);
    return wrap(
      `${receiptHeader(d, s)}
      <div class="dashed"></div>
      <table>
        <tr><td>Bill No: ${esc(d.orderNo)}</td><td class="right">Table: ${esc(d.table)}</td></tr>
        <tr><td>${esc(d.date)}</td><td class="right">By: ${esc(d.cashier)}</td></tr>
      </table>
      <div class="dashed"></div>
      <table>${receiptItemsRows(d, sym)}</table>
      <div class="dashed"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">${money(sym, subtotal)}</td></tr>
        <tr><td>GST (5%)</td><td class="right">${money(sym, gst)}</td></tr>
        <tr class="bold" style="font-size:14px"><td>TOTAL</td><td class="right">${money(sym, total)}</td></tr>
      </table>
      <div class="dashed"></div>
      <div class="center muted">Paid via ${esc(d.payment)}</div>
      ${receiptFooter(s)}`,
      "",
      paperWidth,
    );
  },

  compact(d, s, paperWidth) {
    const sym = s.currencySymbol || "₹";
    const { subtotal, gst, total } = receiptCalc(d);
    return wrap(
      `<div class="center bold" style="font-size:12px">${esc(d.restaurant)} · ${esc(d.branch)}</div>
      ${s.headerText ? `<div class="center muted">${esc(s.headerText)}</div>` : ""}
      ${s.showGSTNumber && s.gstNumber ? `<div class="center muted">GSTIN ${esc(s.gstNumber)}</div>` : ""}
      <div class="muted">${esc(d.orderNo)} · ${esc(d.table)} · ${esc(d.date)}</div>
      <div class="solid"></div>
      <table>${receiptItemsRows(d, sym)}</table>
      <div class="solid"></div>
      <table>
        <tr><td class="muted">Sub ${money(sym, subtotal)} · GST ${money(sym, gst)}</td>
        <td class="right bold">${money(sym, total)}</td></tr>
      </table>
      ${receiptFooter(s)}`,
      "body { font-size: 10px; line-height: 1.3; padding: 6px; }",
      paperWidth,
    );
  },

  detailed(d, s, paperWidth) {
    const sym = s.currencySymbol || "₹";
    const { subtotal, gst, total } = receiptCalc(d);
    return wrap(
      `${receiptHeader(d, s)}
      <div class="double"></div>
      <table>
        <tr><td class="bold">BILL ${esc(d.orderNo)}</td><td class="right bold">TABLE ${esc(d.table)}</td></tr>
        <tr class="muted"><td>${esc(d.date)}</td><td class="right">Cashier: ${esc(d.cashier)}</td></tr>
      </table>
      <div class="double"></div>
      <table>
        <tr class="bold" style="text-transform:uppercase"><td>Item</td><td class="right">Qty</td><td class="right">Amt</td></tr>
        ${d.items
          .map(
            (i) => `<tr><td>${esc(i.name)}</td><td class="right">${i.qty}</td><td class="right">${money(sym, i.qty * i.price)}</td></tr>`,
          )
          .join("")}
      </table>
      <div class="double"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">${money(sym, subtotal)}</td></tr>
        <tr><td>CGST 2.5%</td><td class="right">${money(sym, gst / 2)}</td></tr>
        <tr><td>SGST 2.5%</td><td class="right">${money(sym, gst / 2)}</td></tr>
      </table>
      <div class="totalbar">GRAND TOTAL &nbsp; ${money(sym, total)}</div>
      <div class="center muted" style="margin-top:4px">Paid via ${esc(d.payment)}</div>
      ${receiptFooter(s)}`,
      `.totalbar {
        background: #000; color: #fff; text-align: center;
        font-weight: 700; font-size: 14px; padding: 4px 0; margin-top: 6px;
      }`,
      paperWidth,
    );
  },
};

// ── KOT ─────────────────────────────────────────────────────────────────────

function kotHeader(d, s) {
  return `
    <div class="center">
      <div class="bold" style="font-size:14px">${esc(s.headerText || "KITCHEN ORDER TICKET")}</div>
      <div class="muted">${esc(d.kotNo)} · ${esc(d.date)}</div>
      ${s.showTableName !== false ? `<div class="bold" style="font-size:13px">Table: ${esc(d.table)}</div>` : ""}
    </div>`;
}

const KOT_RENDERERS = {
  classic(d, s, paperWidth) {
    return wrap(
      `${kotHeader(d, s)}
      <div class="dashed"></div>
      <table>
        ${d.items
          .map(
            (i) => `<tr><td class="bold" style="width:28px">${i.qty}x</td><td>${esc(i.name)}${
              i.note ? `<div class="muted">** ${esc(i.note)}</div>` : ""
            }</td></tr>`,
          )
          .join("")}
      </table>
      <div class="dashed"></div>
      <div class="center muted">${d.items.reduce((n, i) => n + i.qty, 0)} items</div>`,
      "",
      paperWidth,
    );
  },

  bold(d, s, paperWidth) {
    return wrap(
      `${kotHeader(d, s)}
      <div class="solid"></div>
      ${d.items
        .map(
          (i) => `<div class="item"><span class="qty">${i.qty}</span> ${esc(i.name)}${
            i.note ? `<div class="note">** ${esc(i.note)} **</div>` : ""
          }</div>`,
        )
        .join("")}
      <div class="solid"></div>`,
      `.item { font-size: 16px; font-weight: 700; margin: 6px 0; }
       .qty { display: inline-block; min-width: 26px; border: 2px solid #000; text-align: center; margin-right: 4px; }
       .note { font-size: 12px; font-weight: 700; text-decoration: underline; margin-left: 32px; }`,
      paperWidth,
    );
  },

  sectioned(d, s, paperWidth) {
    const sections = [...new Set(d.items.map((i) => i.section))];
    return wrap(
      `${kotHeader(d, s)}
      ${sections
        .map(
          (section) => `
          <div class="section">${esc(section).toUpperCase()}</div>
          <table>
            ${d.items
              .filter((i) => i.section === section)
              .map(
                (i) => `<tr><td class="bold" style="width:28px">${i.qty}x</td><td>${esc(i.name)}${
                  i.note ? `<div class="note">${esc(i.note)}</div>` : ""
                }</td></tr>`,
              )
              .join("")}
          </table>`,
        )
        .join("")}`,
      `.section {
        background: #000; color: #fff; font-weight: 700; font-size: 11px;
        padding: 2px 6px; margin: 8px 0 3px;
      }
      .note { font-size: 10px; font-style: italic; border-left: 2px solid #000; padding-left: 4px; }`,
      paperWidth,
    );
  },
};

// ── QR Order Slip ───────────────────────────────────────────────────────────

const QR_RENDERERS = {
  classic(d, s, paperWidth) {
    const sym = "₹";
    const { total } = receiptCalc(d);
    return wrap(
      `<div class="center">
        <div class="bold" style="font-size:14px">${esc(s.headerText || "ORDER CONFIRMATION")}</div>
        <div class="muted">${esc(d.restaurant)} · ${esc(d.branch)}</div>
      </div>
      <div class="dashed"></div>
      <table>
        <tr><td>Order No: ${esc(d.orderNo)}</td><td class="right">Table: ${esc(d.table)}</td></tr>
        <tr class="muted"><td colspan="2">${esc(d.date)}</td></tr>
      </table>
      <div class="dashed"></div>
      <table>${receiptItemsRows(d, sym)}</table>
      <div class="dashed"></div>
      <table><tr class="bold"><td>TOTAL</td><td class="right">${money(sym, total)}</td></tr></table>
      <div class="center muted" style="margin-top:6px">Your order has been placed</div>`,
      "",
      paperWidth,
    );
  },

  token(d, s, paperWidth) {
    return wrap(
      `<div class="center">
        <div class="bold">${esc(s.headerText || "ORDER CONFIRMATION")}</div>
        <div class="muted">${esc(d.restaurant)}</div>
        <div class="tokenbox">
          <div class="muted">TOKEN</div>
          <div class="tokenno">${esc(d.token)}</div>
        </div>
        <div>Order ${esc(d.orderNo)} · ${d.items.reduce((n, i) => n + i.qty, 0)} items</div>
        <div class="muted">${esc(d.date)}</div>
        <div class="muted" style="margin-top:6px">Show this slip at the counter</div>
      </div>`,
      `.tokenbox { border: 3px solid #000; margin: 8px auto; padding: 4px 0; width: 70%; }
       .tokenno { font-size: 44px; font-weight: 700; line-height: 1.1; }`,
      paperWidth,
    );
  },

  minimal(d, s, paperWidth) {
    const sym = "₹";
    const { total } = receiptCalc(d);
    return wrap(
      `<div class="center bold">${esc(s.headerText || "ORDER CONFIRMATION")}</div>
      <div class="center muted">${esc(d.orderNo)} · ${esc(d.date)}</div>
      <div class="solid"></div>
      ${d.items.map((i) => `<div>${i.qty} x ${esc(i.name)}</div>`).join("")}
      <div class="solid"></div>
      <div class="right bold">Total ${money(sym, total)}</div>
      <div class="center muted" style="margin-top:6px">Thank you!</div>`,
      "body { font-size: 11px; padding: 6px; }",
      paperWidth,
    );
  },
};

const RENDERERS = {
  receipt: RECEIPT_RENDERERS,
  kot: KOT_RENDERERS,
  qrOrderSlip: QR_RENDERERS,
};

export function renderTemplateHtml(
  docType,
  styleId,
  settings = {},
  paperWidth = "80mm",
  data = SAMPLE_DATA,
) {
  const group = RENDERERS[docType] || {};
  const render = group[styleId] || group.classic || Object.values(group)[0];
  if (!render) return "";
  return render(data, settings, paperWidth);
}

"use client";

import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  Button,
  ButtonGroup,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import QrCode2Icon from "@mui/icons-material/QrCode2";

export type BillStatus = "Paid" | "Pending" | "Partial" | "Draft" | "Undone";

export type BillItem = {
  name: string;
  qty: number;
  price: number;
  warranty?: string;
  smartphoneId?: string;
  stockItemId?: string;
  imei?: string;
  type?: "Brand New" | "Used";
  brand?: string;
  model?: string;
  storage?: string;
};

export type Bill = {
  id: string;
  firestoreId?: string;
  customer: string;
  phone: string;
  date: string;
  time?: string;
  dueDate?: string;
  itemCount: number;
  status: BillStatus;
  paymentMethod: "Cash" | "Card" | "Bank Transfer" | "Split" | "Installment";
  items: BillItem[];
  subtotal: number;
  tax?: number;
  discount: number;
  total: number;
  amountPaid?: number;
  cashier: string;
  note?: string;
  undoneAt?: string;
  undoReason?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value);

/* ---------- i-Dreams invoice design tokens ---------- */
const NAVY = "#2d3163";
const NAVY_DARK = "#252852";
const PURPLE = "#4b2e8c";
const CHARCOAL = "#3f4247";
const FOOTER_DARK = "#1f2125";
const ROW_ALT = "#efecf7";
const BORDER = "#dcdbe6";
const LABEL_BLUE = "#2d3163";

const MIN_ROWS = 10;

const TERMS = [
  "Item once purchased and taken out from the store premises cannot be returned under any conditions.",
  "Warranty does not cover Physical Damages (Drop damages, Water Damages Etc..) Hardware Damages (No Power, Battery, Display Etc..)",
  "We require the physical invoice and warranty sticker should be available in the warranty approval process.",
  "In mobile phone exchanges, the customer is responsible for any legal issues with the exchanged phone.",
];

interface InvoiceReceiptViewProps {
  bill: Bill;
  onPrint?: (viewMode: "standard" | "thermal") => void;
  onUpdateStatus?: (bill: Bill) => void;
  hideControls?: boolean;
  forcedViewMode?: "standard" | "thermal";
}

/* Small labelled field used in the Bill No / Date / Customer row */
function InfoField({
  label,
  children,
  flex,
}: {
  label: string;
  children?: React.ReactNode;
  flex: number | string;
}) {
  return (
    <Box sx={{ flex, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 800,
          color: LABEL_BLUE,
          textTransform: "uppercase",
          pb: 0.5,
          borderBottom: `1.5px solid ${LABEL_BLUE}`,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ minHeight: 44, pt: 0.75, px: 0.5 }}>{children}</Box>
    </Box>
  );
}

export default function InvoiceReceiptView({
  bill,
  onPrint,
  onUpdateStatus,
  hideControls = false,
  forcedViewMode,
}: InvoiceReceiptViewProps) {
  const [viewMode, setViewMode] = useState<"standard" | "thermal">("standard");

  const effectiveViewMode = forcedViewMode ?? viewMode;

  const handlePrint = () => {
    if (onPrint) {
      onPrint(effectiveViewMode);
    } else if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Always show at least 10 rows, like the printed invoice pad
  const rowCount = Math.max(MIN_ROWS, bill.items.length);
  const rows = Array.from({ length: rowCount }, (_, i) => bill.items[i] ?? null);

  const gridCols = "44px 1fr 70px 130px 130px";

  return (
    <Box>
      {/* Header controls — hidden when hideControls prop or print media */}
      {!hideControls && (
        <Box
          className="print-hidden"
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={effectiveViewMode === "standard" ? "contained" : "outlined"}
              onClick={() => setViewMode("standard")}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem" }}
            >
              A4 Invoice
            </Button>
            <Button
              variant={effectiveViewMode === "thermal" ? "contained" : "outlined"}
              onClick={() => setViewMode("thermal")}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem" }}
            >
              Thermal POS Slip
            </Button>
          </ButtonGroup>

          <Button
            variant="contained"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})`,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1.5,
              "&:hover": { background: `linear-gradient(135deg, ${NAVY_DARK}, #3d2574)` },
            }}
          >
            Print
          </Button>
        </Box>
      )}

      {/* STANDARD A4 INVOICE VIEW — i-Dreams Sales & Service Bill */}
      {effectiveViewMode === "standard" && (
        <Card
          id="printable-invoice"
          sx={{
            maxWidth: 794,
            mx: "auto",
            borderRadius: 0,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            backgroundColor: "#ffffff",
            p: { xs: 1.5, sm: 3 },
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        >
          {/* Brand header */}
          <Box
            sx={{
              background: `linear-gradient(90deg, ${NAVY_DARK} 0%, ${NAVY} 60%, #3b4080 100%)`,
              color: "#ffffff",
              px: 2.5,
              py: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: 1,
                  overflow: "hidden",
                  backgroundColor: "#000000",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Images/idrams-invoice.png"
                  alt="i-Dreams"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.01em" }}>
                  i-Dreams
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#e9c46a", mt: 0.4, letterSpacing: "0.02em" }}>
                  TRUST IN EVERY TOUCH
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 0.5,
                p: 0.4,
                display: "flex",
                flexShrink: 0,
              }}
            >
              <QrCode2Icon sx={{ fontSize: 56, color: "#111827" }} />
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "1.65rem", fontWeight: 900, lineHeight: 1, letterSpacing: "0.01em" }}>
                INVOICE
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.75)", mt: 0.4 }}>
                Sales &amp; Service Bill
              </Typography>
            </Box>
          </Box>

          {/* Address / contact bar */}
          <Box
            sx={{
              mt: 1,
              backgroundColor: CHARCOAL,
              color: "#ffffff",
              px: 2,
              py: 0.6,
              display: "flex",
              flexWrap: "nowrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography sx={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.85)" }}>
              157/A, Anagarika Dharmapala Mawatha, Matara
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800 }}>
              +947 0 430 5200 / +947 1 391 3728
            </Typography>
          </Box>

          {/* Bill no / Date / Customer */}
          <Box
            sx={{
              mt: 1.25,
              p: 1.25,
              border: `1px solid ${BORDER}`,
              display: "flex",
              gap: 2,
              flexWrap: "nowrap",
            }}
          >
            <InfoField label="Bill No" flex="0 0 140px">
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#1f2937", lineHeight: 1.2 }}>
                {bill.id}
              </Typography>
            </InfoField>
            <InfoField label="Date" flex="0 0 130px">
              <Typography sx={{ fontSize: "0.9rem", color: "#1f2937" }}>{bill.date}</Typography>
            </InfoField>
            <InfoField label="Customer Name / Contact" flex={1}>
              <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#1f2937" }}>
                {bill.customer}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#4b5563" }}>{bill.phone}</Typography>
            </InfoField>
          </Box>

          {/* Items table */}
          <Box sx={{ mt: 2.5, border: `1px solid ${BORDER}`, overflow: "visible" }}>
            <Box sx={{ width: "100%" }}>
              {/* Table head */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: gridCols,
                  backgroundColor: NAVY,
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  "& > div": { px: 1.25, py: 0.65 },
                }}
              >
                <Box>#</Box>
                <Box>Description</Box>
                <Box sx={{ textAlign: "center" }}>Qty</Box>
                <Box sx={{ textAlign: "center" }}>Unit Price</Box>
                <Box sx={{ textAlign: "right" }}>Amount</Box>
              </Box>

              {/* Table rows */}
              {rows.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    minHeight: 33,
                    alignItems: "center",
                    backgroundColor: idx % 2 === 1 ? ROW_ALT : "#ffffff",
                    borderBottom: idx < rows.length - 1 ? `1px solid ${BORDER}` : "none",
                    "& > div": { px: 1.25, py: 0.3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" },
                    "& > div:not(:first-of-type)": { borderLeft: `1px solid ${BORDER}` },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: NAVY }}>{idx + 1}</Typography>
                  </Box>
                  <Box>
                    {item && (
                      <>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827", lineHeight: 1.2 }}>
                          {item.name}
                        </Typography>
                        {item.imei && (
                          <Typography sx={{ fontSize: "0.65rem", color: "#6b7280" }}>IMEI: {item.imei}</Typography>
                        )}
                        {item.warranty && (
                          <Typography sx={{ fontSize: "0.65rem", color: "#059669", fontWeight: 600 }}>
                            Warranty: {item.warranty}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                  <Box sx={{ alignItems: "center" }}>
                    {item && <Typography sx={{ fontSize: "0.82rem" }}>{item.qty}</Typography>}
                  </Box>
                  <Box sx={{ alignItems: "center" }}>
                    {item && <Typography sx={{ fontSize: "0.82rem" }}>{formatAmount(item.price)}</Typography>}
                  </Box>
                  <Box sx={{ alignItems: "flex-end" }}>
                    {item && (
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
                        {formatAmount(item.qty * item.price)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Terms & totals */}
          <Box
            sx={{
              mt: 1.25,
              display: "flex",
              gap: 2.5,
              alignItems: "flex-start",
              flexDirection: "row",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#111827", mb: 0.35 }}>
                TERMS &amp; NOTES
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, display: "grid", gap: 0.35 }}>
                {TERMS.map((t) => (
                  <Typography key={t} component="li" sx={{ fontSize: "0.66rem", lineHeight: 1.25, color: "#111827" }}>
                    {t}
                  </Typography>
                ))}
              </Box>
              {bill.note && (
                <Typography sx={{ fontSize: "0.66rem", color: "#374151", mt: 0.75 }}>
                  <strong>Note:</strong> {bill.note}
                </Typography>
              )}
            </Box>

            <Box sx={{ width: 240, border: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <Box sx={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ width: 95, px: 1.25, py: 0.8, fontWeight: 700, fontSize: "0.85rem", borderRight: `1px solid ${BORDER}` }}>
                  Subtotal
                </Typography>
                <Typography sx={{ flex: 1, px: 1.25, py: 0.8, fontSize: "0.82rem", textAlign: "right" }}>
                  Rs. {formatAmount(bill.subtotal)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ width: 95, px: 1.25, py: 0.8, fontWeight: 700, fontSize: "0.85rem", borderRight: `1px solid ${BORDER}` }}>
                  Discount
                </Typography>
                <Typography sx={{ flex: 1, px: 1.25, py: 0.8, fontSize: "0.82rem", textAlign: "right" }}>
                  Rs. {bill.discount > 0 ? formatAmount(bill.discount) : "0"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", backgroundColor: PURPLE, color: "#ffffff" }}>
                <Typography sx={{ width: 95, px: 1.25, py: 1, fontWeight: 800, fontSize: "0.95rem" }}>
                  TOTAL
                </Typography>
                <Typography sx={{ flex: 1, px: 1.25, py: 1, fontWeight: 800, fontSize: "0.9rem", textAlign: "right" }}>
                  Rs. {formatAmount(bill.total)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Signatures */}
          <Box sx={{ mt: 2.25, display: "flex", justifyContent: "space-between", px: 2 }}>
            {["Authorized Signature", "Customer Signature"].map((label) => (
              <Box key={label} sx={{ width: 170, textAlign: "center" }}>
                <Box sx={{ borderTop: "2px dotted #6b7280", mb: 0.4 }} />
                <Typography sx={{ fontSize: "0.68rem", color: "#111827", fontWeight: 600 }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Footer bar */}
          <Box
            sx={{
              mt: 1.5,
              backgroundColor: FOOTER_DARK,
              color: "#ffffff",
              py: 0.85,
              textAlign: "center",
              fontSize: "0.68rem",
            }}
          >
            <Box component="span" sx={{ fontWeight: 700, color: "#e9c46a" }}>i-Dreams</Box>
            <Box component="span" sx={{ mx: 1, opacity: 0.6 }}>|</Box>
            <Box component="span" sx={{ opacity: 0.9 }}>Mobile Sales &amp; Repair Specialists</Box>
            <Box component="span" sx={{ mx: 1, opacity: 0.6 }}>|</Box>
            <Box component="span" sx={{ opacity: 0.9 }}>Matara</Box>
          </Box>
        </Card>
      )}

      {/* THERMAL 80MM RECEIPT VIEW */}
      {effectiveViewMode === "thermal" && (
        <Card
          id="printable-thermal-receipt"
          sx={{
            maxWidth: 360,
            mx: "auto",
            borderRadius: 2,
            border: "1px dashed #94a3b8",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
            backgroundColor: "#fffdfa",
            fontFamily: "monospace",
            p: 2.5,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", letterSpacing: "0.05em", color: "#0f172a" }}>
              iDREAMS MOBILE
            </Typography>
            <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
              Main Branch • Hotline: +94 11 234 5678
            </Typography>
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#334155", mb: 0.5 }}>
            <span>Bill: {bill.id}</span>
            <span>{bill.date}</span>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#334155", mb: 1 }}>
            <span>Customer: {bill.customer}</span>
            <span>Tel: {bill.phone}</span>
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />

          {/* Line items */}
          <Box sx={{ display: "grid", gap: 1, my: 1.5 }}>
            {bill.items.map((item, idx) => (
              <Box key={idx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.qty * item.price)}</span>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b" }}>
                  <span>{item.qty} × {formatCurrency(item.price)}</span>
                  {item.warranty && <span>[{item.warranty}]</span>}
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />

          {/* Total Breakdown */}
          <Box sx={{ display: "grid", gap: 0.75, fontSize: "0.85rem" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
              <span>Subtotal:</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </Box>
            {bill.discount > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}>
                <span>Discount:</span>
                <span>-{formatCurrency(bill.discount)}</span>
              </Box>
            )}
            <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>
              <span>TOTAL (LKR):</span>
              <span>{formatCurrency(bill.total)}</span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#475569" }}>
              <span>Payment ({bill.paymentMethod}):</span>
              <span>{formatCurrency(bill.total)}</span>
            </Box>
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 2 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
              Thank you for shopping with us!
            </Typography>
            <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
              <QrCode2Icon sx={{ fontSize: 32, color: "#334155" }} />
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
}
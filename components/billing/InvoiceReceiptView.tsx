"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Chip,
  ButtonGroup,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import PhoneIcon from "@mui/icons-material/Phone";

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

interface InvoiceReceiptViewProps {
  bill: Bill;
  onPrint?: (viewMode: "standard" | "thermal") => void;
  onUpdateStatus?: (bill: Bill) => void;
  hideControls?: boolean;
  forcedViewMode?: "standard" | "thermal";
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

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case "Paid":
        return { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
      case "Pending":
        return { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" };
      case "Partial":
        return { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" };
      default:
        return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    }
  };

  const statusStyle = getStatusColor(bill.status);

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
            variant={viewMode === "standard" ? "contained" : "outlined"}
            onClick={() => setViewMode("standard")}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem" }}
          >
            A4 Invoice
          </Button>
          <Button
            variant={viewMode === "thermal" ? "contained" : "outlined"}
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
              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1.5,
              "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
          }}
        >
          Print
        </Button>
      </Box>
      )}

      {/* STANDARD A4 INVOICE VIEW */}
      {viewMode === "standard" && (
        <Card
          id="printable-invoice"
          sx={{
            borderRadius: 2.5,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Top Brand Banner */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
              p: 3,
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ letterSpacing: "0.15em", fontWeight: 800, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>
                Official Invoice
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
                iDreams Mobile & Electronics
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", display: "block", mt: 0.25 }}>
                Retail, Smartphones, Accessories & Repairs
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Box
                sx={{
                  display: "inline-block",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                  {bill.id}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "rgba(255,255,255,0.8)" }}>
                Date: {bill.date}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Customer Details - ONLY Name & Contact No */}
            <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Customer Details:
                </Typography>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
                  {bill.customer}
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                  <PhoneIcon sx={{ fontSize: 14, color: "#7c3aed" }} />
                  {bill.phone}
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Status & Method:
                </Typography>
                <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                  <Chip
                    label={bill.status.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      fontWeight: 800,
                      fontSize: "0.72rem",
                    }}
                  />
                  <Chip
                    label={bill.paymentMethod}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: "0.72rem", borderColor: "#cbd5e1" }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.75 }}>
                  Cashier: <strong>{bill.cashier}</strong>
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Line Items Table */}
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
              Purchased Items:
            </Typography>

            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0", overflow: "hidden", mb: 3 }}>
              {bill.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.75,
                    borderBottom: idx < bill.items.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>
                      {item.name}
                    </Typography>
                    {item.warranty && (
                      <Typography variant="caption" sx={{ color: "#059669", fontWeight: 600, display: "block" }}>
                        ✓ Warranty: {item.warranty}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {item.qty} × {formatCurrency(item.price)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "0.95rem" }}>
                    {formatCurrency(item.qty * item.price)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Financial Summary */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: 260 }, display: "grid", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(bill.subtotal)}</Typography>
                </Box>

                {bill.discount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "#ef4444" }}>Discount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#ef4444" }}>- {formatCurrency(bill.discount)}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 0.5 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>Total Amount</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#7c3aed" }}>
                    {formatCurrency(bill.total)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Note Box */}
            {bill.note && (
              <Box sx={{ p: 1.5, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0", mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Note:
                </Typography>
                <Typography variant="body2" sx={{ color: "#334155", mt: 0.25 }}>
                  {bill.note}
                </Typography>
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ pt: 2, borderTop: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem" }}>
                Thank you for shopping at iDreams Mobile!
              </Typography>
              <QrCode2Icon sx={{ fontSize: 36, color: "#7c3aed", opacity: 0.85 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* THERMAL 80MM RECEIPT VIEW */}
      {viewMode === "thermal" && (
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

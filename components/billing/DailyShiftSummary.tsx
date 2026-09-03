"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Divider,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Bill } from "./InvoiceReceiptView";

interface DailyShiftSummaryProps {
  bills: Bill[];
  onPrint?: () => void;
  hidePrintButton?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);

export default function DailyShiftSummary({
  bills,
  onPrint,
  hidePrintButton = false,
}: DailyShiftSummaryProps) {
  const [openingFloat, setOpeningFloat] = useState<number>(25000); // 25,000 LKR default opening cash in register
  const [cashierName] = useState("Sanjeewa (Cashier #01)");

  // Aggregate stats
  const paidBills = bills.filter((b) => b.status === "Paid" || b.status === "Partial");
  const cashSales = paidBills
    .filter((b) => b.paymentMethod === "Cash")
    .reduce((sum, b) => sum + (b.amountPaid || b.total), 0);
  const cardSales = paidBills
    .filter((b) => b.paymentMethod === "Card")
    .reduce((sum, b) => sum + (b.amountPaid || b.total), 0);
  const transferSales = paidBills
    .filter((b) => b.paymentMethod === "Bank Transfer")
    .reduce((sum, b) => sum + (b.amountPaid || b.total), 0);
  const totalSales = cashSales + cardSales + transferSales;
  const expectedCashInDrawer = openingFloat + cashSales;

  const handlePrintReport = () => {
    if (onPrint) {
      onPrint();
    } else if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Box>
      {/* Header Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: 2.5,
          background: "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Chip
            label="Live Shift Session"
            size="small"
            sx={{
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              color: "#34d399",
              fontWeight: 800,
              fontSize: "0.72rem",
              border: "1px solid #059669",
              mb: 1,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            POS Register & Daily Shift Settlement
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", display: "block" }}>
            Cashier: <strong>{cashierName}</strong> • Date: {new Date().toLocaleDateString("en-LK")}
          </Typography>
        </Box>

        {!hidePrintButton && (
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintReport}
            className="print-hidden"
            sx={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              py: 1,
              "&:hover": { backgroundColor: "#f1f5f9" },
            }}
          >
            Print Settlement Report
          </Button>
        )}
      </Paper>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Card 1: Expected Cash In Drawer */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Expected Cash in Drawer
              </Typography>
              <LocalAtmIcon sx={{ color: "#059669" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#059669" }}>
              {formatCurrency(expectedCashInDrawer)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
              Opening float ({formatCurrency(openingFloat)}) + Cash collected
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Cash Sales Collected */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Total Cash Sales
              </Typography>
              <LocalAtmIcon sx={{ color: "#7c3aed" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#7c3aed" }}>
              {formatCurrency(cashSales)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
              {paidBills.filter((b) => b.paymentMethod === "Cash").length} cash transactions
            </Typography>
          </Paper>
        </Grid>

        {/* Card 3: Card Sales Collected */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Card POS Receipts
              </Typography>
              <CreditCardIcon sx={{ color: "#ea580c" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#ea580c" }}>
              {formatCurrency(cardSales)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
              {paidBills.filter((b) => b.paymentMethod === "Card").length} card transactions
            </Typography>
          </Paper>
        </Grid>

        {/* Card 4: Total Shift Revenue */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Total Shift Gross Sales
              </Typography>
              <PointOfSaleIcon sx={{ color: "#0f172a" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
              {formatCurrency(totalSales)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700, mt: 0.5, display: "block" }}>
              {paidBills.length} total paid tickets
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Opening Float & Drawer Controls */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
              Cash Drawer Configuration
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Opening Cash Float (LKR)"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(Math.max(0, Number(e.target.value)))}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  },
                }}
                helperText="Initial cash placed in register at start of shift."
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>Starting Float</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(openingFloat)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>Cash Revenue</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>+ {formatCurrency(cashSales)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>Card / Digital Revenue</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#7c3aed" }}>{formatCurrency(cardSales + transferSales)}</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>Target Physical Cash</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: "1.15rem", color: "#059669" }}>
                  {formatCurrency(expectedCashInDrawer)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
              Today&apos;s Audited Invoices Ledger
            </Typography>

            <TableContainer sx={{ border: "1px solid #f1f5f9", borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Bill ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Method</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Amount (LKR)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: "#7c3aed" }}>{bill.id}</TableCell>
                      <TableCell sx={{ color: "#0f172a", fontWeight: 600 }}>{bill.customer}</TableCell>
                      <TableCell>
                        <Chip label={bill.paymentMethod} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {formatCurrency(bill.total)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={bill.status}
                          size="small"
                          color={bill.status === "Paid" ? "success" : bill.status === "Pending" ? "warning" : "default"}
                          sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

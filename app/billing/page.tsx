"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import UndoIcon from "@mui/icons-material/Undo";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { PersistentCart } from "@/components/cart/persistent-cart";
import InvoiceReceiptView, { Bill } from "@/components/billing/InvoiceReceiptView";
import PosCheckoutTerminal from "@/components/billing/PosCheckoutTerminal";
import PaymentStatusModal from "@/components/billing/PaymentStatusModal";
import { useBills } from "@/hooks/useBills";
import { useSmartphones } from "@/hooks/useSmartphones";
import { useAuth } from "@/context/auth-context";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);

export default function BillingPage() {
  const { isOwner } = useAuth();
  const [activeSection, setActiveSection] = useState<"terminal" | "invoices">("terminal");
  const { bills, loading, addBill, updateBill, deleteBill } = useBills();
  const { smartphones, markStockSold, markStockAvailable } = useSmartphones();
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);

  // PRINT PORTAL state — we render a standalone DOM copy of the invoice outside of
  // any Dialog/position:fixed container so it flows correctly to the print engine.
  const [printingBill, setPrintingBill] = useState<Bill | null>(null);
  const [printingViewMode, setPrintingViewMode] = useState<"standard" | "thermal">("standard");

  // Filters State for Invoices Tab
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Payment Status Edit Modal
  const [editingBillForStatus, setEditingBillForStatus] = useState<Bill | null>(null);

  // Undo Bill state
  const [undoBillTarget, setUndoBillTarget] = useState<Bill | null>(null);
  const [undoReason, setUndoReason] = useState("");
  const [isUndoing, setIsUndoing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const nextInvoiceNumber = `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, "0")}`;

  // Trigger a print via the standalone portal.
  // flow: set state to render portal copy in DOM → wait a tick so React paints → window.print()
  const triggerPrint = (bill: Bill, viewMode: "standard" | "thermal" = "standard") => {
    setPrintingBill(bill);
    setPrintingViewMode(viewMode);
    setViewingBill(null);
    if (typeof window !== "undefined") {
      document.body.classList.add("printing-via-portal");
      if (viewMode === "thermal") {
        document.body.classList.add("printing-thermal");
      } else {
        document.body.classList.remove("printing-thermal");
      }
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 200);
      });
    }
  };

  // Clean up portal DOM copy after print dialog closes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onAfterPrint = () => {
      setPrintingBill(null);
      document.body.classList.remove("printing-via-portal");
      document.body.classList.remove("printing-thermal");
    };
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  // Summary Metrics
  const totals = useMemo(() => {
    const paid = bills.filter((b) => b.status === "Paid").length;
    const pending = bills.filter((b) => b.status === "Pending").length;
    const partial = bills.filter((b) => b.status === "Partial").length;
    const totalRevenue = bills.reduce((sum, b) => sum + (b.amountPaid || b.total), 0);
    return { paid, pending, partial, totalRevenue };
  }, [bills]);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills
      .filter((bill) => {
        const searchLower = searchTerm.toLowerCase();
        const searchMatch =
          !searchTerm ||
          bill.id.toLowerCase().includes(searchLower) ||
          bill.customer.toLowerCase().includes(searchLower) ||
          bill.phone.toLowerCase().includes(searchLower) ||
          bill.items.some((item) => item.name.toLowerCase().includes(searchLower));

        const statusMatch = statusFilter === "all" || bill.status === statusFilter;
        const methodMatch = methodFilter === "all" || bill.paymentMethod === methodFilter;

        return searchMatch && statusMatch && methodMatch;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === "total-high") return b.total - a.total;
        if (sortBy === "total-low") return a.total - b.total;
        return 0;
      });
  }, [bills, searchTerm, statusFilter, methodFilter, sortBy]);

  const handleSaveBill = async (newBill: Bill, autoPrint = false) => {
    try {
      setIsSaving(true);

      // 1. For every line item that carries smartphoneId + stockItemId:
      //    mark the matching physical stock unit Sold in Firestore BEFORE
      //    committing the bill (best-effort — if any fail, we still persist the bill
      //    and surface a warning toast so staff can reconcile manually).
      let stockErrors = 0;
      for (const item of newBill.items) {
        if (!item.smartphoneId || !item.stockItemId) continue;
        try {
          const phone = smartphones.find((p) => p.id === item.smartphoneId);
          const stock = phone?.stocks?.find((s) => s.id === item.stockItemId);
          if (stock && stock.status !== "Sold") {
            await markStockSold(item.smartphoneId, item.stockItemId);
          } else if (!stock) {
            stockErrors += 1;
          }
        } catch (err) {
          console.warn("Failed to mark stock sold:", item.stockItemId, err);
          stockErrors += 1;
        }
      }

      // 2. Save the bill to Firestore
      await addBill(newBill);
      setActiveSection("invoices");

      if (stockErrors > 0) {
        setToast({
          open: true,
          severity: "warning",
          message: `Bill saved. ${stockErrors} stock unit(s) could not be located — please verify inventory manually.`,
        });
      } else {
        setToast({
          open: true,
          severity: "success",
          message: `Bill ${newBill.id} saved successfully. Stock inventory has been updated.`,
        });
      }

      // 3. Auto-print the thermal receipt
      if (autoPrint) {
        // Build a fresh bill object using the same nextInvoiceNumber so preview matches
        triggerPrint(newBill, "thermal");
      }
    } catch (err) {
      console.error("Save bill error:", err);
      setToast({
        open: true,
        severity: "error",
        message: "Failed to save bill. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenUndoBill = (bill: Bill) => {
    if (bill.status === "Undone") return;
    setUndoBillTarget(bill);
    setUndoReason("");
  };

  const handleConfirmUndoBill = async () => {
    const bill = undoBillTarget;
    if (!bill?.firestoreId) return;

    try {
      setIsUndoing(true);

      // 1. Restore stock items: for every smartphone line item that has a stockItemId,
      //    mark its stock unit Available again (increase available stock).
      let stockErrors = 0;
      for (const item of bill.items) {
        if (!item.smartphoneId || !item.stockItemId) continue;
        try {
          const phone = smartphones.find((p) => p.id === item.smartphoneId);
          const stock = phone?.stocks?.find((s) => s.id === item.stockItemId);
          if (stock) {
            await markStockAvailable(item.smartphoneId, item.stockItemId);
          } else {
            stockErrors += 1;
          }
        } catch (err) {
          console.warn("Failed to mark stock available:", item.stockItemId, err);
          stockErrors += 1;
        }
      }

      // 2. Mark bill status as Undone, stamp timestamps & reason
      await updateBill(bill.firestoreId, {
        status: "Undone",
        undoneAt: new Date().toISOString(),
        undoReason: undoReason.trim() || "Undone by cashier",
      });

      if (viewingBill?.id === bill.id || viewingBill?.firestoreId === bill.firestoreId) {
        setViewingBill(null);
      }

      if (stockErrors > 0) {
        setToast({
          open: true,
          severity: "warning",
          message: `Bill ${bill.id} marked Undone. ${stockErrors} stock unit(s) could not be located — please verify inventory manually.`,
        });
      } else {
        setToast({
          open: true,
          severity: "success",
          message: `Bill ${bill.id} has been undone. Stock inventory has been restored.`,
        });
      }
    } catch (err) {
      console.error("Undo bill error:", err);
      setToast({
        open: true,
        severity: "error",
        message: "Failed to undo bill. Please try again.",
      });
    } finally {
      setIsUndoing(false);
      setUndoBillTarget(null);
      setUndoReason("");
    }
  };

  const handleUpdateBillSettlement = async (updatedBill: Bill) => {
    const match = bills.find((b) => b.id === updatedBill.id || b.firestoreId === updatedBill.firestoreId);
    if (match?.firestoreId) {
      await updateBill(match.firestoreId, updatedBill);
    }
    if (viewingBill?.id === updatedBill.id) {
      setViewingBill(updatedBill);
    }
  };

  const handleDeleteBill = async (billIdOrFirestoreId: string) => {
    if (!isOwner) return;
    const match = bills.find((b) => b.id === billIdOrFirestoreId || b.firestoreId === billIdOrFirestoreId);
    if (match?.firestoreId) {
      await deleteBill(match.firestoreId);
    }
    if (viewingBill?.id === billIdOrFirestoreId || viewingBill?.firestoreId === billIdOrFirestoreId) {
      setViewingBill(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
    setSortBy("newest");
  };

  const isFiltersActive =
    searchTerm !== "" || statusFilter !== "all" || methodFilter !== "all" || sortBy !== "newest";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Container maxWidth="xl" sx={{ py: 3.5 }}>
        {/* Navigation Tabs */}
        <Paper
          sx={{
            mb: 3.5,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeSection}
            onChange={(_, val) => setActiveSection(val)}
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "#7c3aed", height: 3.5 },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.92rem",
                color: "#64748b",
                py: 1.8,
              },
              "& .Mui-selected": { color: "#7c3aed" },
            }}
          >
            <Tab
              value="terminal"
              icon={<PointOfSaleIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="POS Checkout Terminal"
            />
            <Tab
              value="invoices"
              icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Invoices & History (${bills.length})`}
            />
          </Tabs>
        </Paper>

        {/* SECTION 1: POS CHECKOUT TERMINAL */}
        {activeSection === "terminal" && (
          <PosCheckoutTerminal
            onSaveBill={handleSaveBill}
            nextInvoiceNumber={nextInvoiceNumber}
          />
        )}

        {/* SECTION 2: FULL WIDTH INVOICES & HISTORY */}
        {activeSection === "invoices" && (
          <Box>
            {/* KPI Cards Row */}
            <Grid container spacing={3} sx={{ mb: 3.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Invoices
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mt: 0.5 }}>
                    {bills.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700, textTransform: "uppercase" }}>
                    Paid in Full
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#059669", mt: 0.5 }}>
                    {totals.paid}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#7c3aed", mt: 0.5 }}>
                    {formatCurrency(totals.totalRevenue)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Filter Section with Add New Bill Button in Header */}
            <Paper
              sx={{
                p: 2.25,
                mb: 2.5,
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  mb: 2.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterAltIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Filter & Search Invoices
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  {isFiltersActive && (
                    <Button
                      size="small"
                      startIcon={<RestartAltIcon />}
                      onClick={handleResetFilters}
                      sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
                    >
                      Reset Filters
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setActiveSection("terminal")}
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2.2,
                      py: 0.8,
                      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
                      "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
                    }}
                  >
                    New POS Bill
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Customer, Contact No or ID"
                    placeholder="e.g., Kasun, 0771234567, INV-2026-001"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Partial">Partial</MenuItem>
                      <MenuItem value="Undone">Undone / Reversed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={methodFilter}
                      label="Payment Method"
                      onChange={(e) => setMethodFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Methods</MenuItem>
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Card">Card</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="newest">Date: Newest First</MenuItem>
                      <MenuItem value="oldest">Date: Oldest First</MenuItem>
                      <MenuItem value="total-high">Amount: High to Low</MenuItem>
                      <MenuItem value="total-low">Amount: Low to High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* FULL-WIDTH SPACIOUS INVOICES TABLE (NO HORIZONTAL SCROLL) */}
            <Paper sx={{ borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", overflow: "hidden" }}>
              <Box sx={{ p: 2, px: 3, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Invoices Ledger ({filteredBills.length})
                </Typography>
                <Chip label="Live Sync" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
              </Box>

              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                  <CircularProgress sx={{ color: "#7c3aed" }} />
                </Box>
              )}

              {!loading && (
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table sx={{ minWidth: "100%", width: "100%" }}>
                  <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "15%", py: 1.75 }}>Invoice Number</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "22%", py: 1.75 }}>Customer Name</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "16%", py: 1.75 }}>Contact Number</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "12%", py: 1.75 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "11%", py: 1.75 }}>Method</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569", width: "14%", py: 1.75 }}>Total Amount</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569", width: "10%", py: 1.75 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569", width: "10%", py: 1.75 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBills.map((bill) => (
                      <TableRow
                        key={bill.id}
                        hover
                        sx={{
                          transition: "all 0.15s ease",
                          "&:hover": { backgroundColor: "#f8fafc" },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "0.88rem", py: 1.5 }}>
                          {bill.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem", py: 1.5 }}>
                          {bill.customer}
                        </TableCell>
                        <TableCell sx={{ color: "#475569", fontWeight: 600, fontSize: "0.85rem", py: 1.5 }}>
                          {bill.phone}
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.85rem", py: 1.5 }}>
                          {bill.date}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={bill.paymentMethod}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderColor: "#cbd5e1" }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: "#7c3aed", fontSize: "0.95rem", py: 1.5 }}>
                          {formatCurrency(bill.total)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Chip
                            label={bill.status}
                            size="small"
                            color={
                              bill.status === "Paid"
                                ? "success"
                                : bill.status === "Pending"
                                ? "warning"
                                : bill.status === "Partial"
                                ? "info"
                                : bill.status === "Undone"
                                ? "error"
                                : "default"
                            }
                            sx={{ height: 24, fontSize: "0.72rem", fontWeight: 800, px: 0.5 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                            <Tooltip title="View & Print Invoice">
                              <IconButton
                                size="small"
                                onClick={() => setViewingBill(bill)}
                                sx={{
                                  color: "#7c3aed",
                                  backgroundColor: "#f5f3ff",
                                  "&:hover": { backgroundColor: "#ede9fe" },
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                bill.status === "Undone"
                                  ? "Bill has already been undone"
                                  : bill.status === "Paid" || bill.status === "Partial" || bill.status === "Pending"
                                  ? `Undo Bill ${bill.id} and restore stock to inventory`
                                  : "Cannot undo Draft bills"
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenUndoBill(bill)}
                                  disabled={bill.status === "Undone" || bill.status === "Draft"}
                                  sx={{
                                    color: bill.status === "Undone" || bill.status === "Draft" ? "#cbd5e1" : "#f59e0b",
                                    backgroundColor: bill.status === "Undone" || bill.status === "Draft" ? "#f8fafc" : "#fffbeb",
                                    "&:hover": {
                                      backgroundColor:
                                        bill.status === "Undone" || bill.status === "Draft" ? "#f8fafc" : "#fef3c7",
                                    },
                                  }}
                                >
                                  <UndoIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {isOwner && (
                            <Tooltip title="Update Status">
                              <IconButton
                                size="small"
                                onClick={() => setEditingBillForStatus(bill)}
                                sx={{
                                  color: "#059669",
                                  backgroundColor: "#ecfdf5",
                                  "&:hover": { backgroundColor: "#d1fae5" },
                                }}
                              >
                                <EditIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            )}
                            {isOwner && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteBill(bill.id)}
                                  sx={{
                                    color: "#ef4444",
                                    backgroundColor: "#fef2f2",
                                    "&:hover": { backgroundColor: "#fee2e2" },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              )}

              {!loading && filteredBills.length === 0 && (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
                    No invoices match your search criteria.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Container>

      {/* Invoice Viewer Modal */}
      <Dialog
        open={Boolean(viewingBill)}
        onClose={() => setViewingBill(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, overflow: "hidden" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            color: "#ffffff",
            py: 1.75,
            px: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ReceiptLongIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Invoice Preview: {viewingBill?.id}
            </Typography>
          </Box>
          <IconButton onClick={() => setViewingBill(null)} sx={{ color: "white" }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          {viewingBill && (
            <InvoiceReceiptView
              bill={viewingBill}
              onPrint={(mode) => triggerPrint(viewingBill!, mode)}
              onUpdateStatus={(b) => setEditingBillForStatus(b)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Status Modal */}
      <PaymentStatusModal
        open={Boolean(editingBillForStatus)}
        bill={editingBillForStatus}
        onClose={() => setEditingBillForStatus(null)}
        onUpdate={handleUpdateBillSettlement}
      />

      {/* UNDO BILL CONFIRMATION DIALOG */}
      <Dialog
        open={Boolean(undoBillTarget)}
        onClose={() => !isUndoing && setUndoBillTarget(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, overflow: "hidden" } },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #f59e0b, #dc2626)",
            color: "#ffffff",
            py: 2,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <WarningAmberIcon />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Undo Invoice {undoBillTarget?.id}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              This action reverses the sale and restores all stock units to inventory.
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 2.25 }}>
          <Box sx={{ mb: 2.5, p: 2, backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: "#9a3412", fontWeight: 600, lineHeight: 1.6 }}>
              Reversing this bill will:
            </Typography>
            <Box component="ul" sx={{ m: 0, mt: 0.75, pl: 2.5 }}>
              <li>
                <Typography variant="body2" sx={{ color: "#7c2d12", fontSize: "0.85rem", fontWeight: 500 }}>
                  Mark the bill status as <strong>Undone</strong> (non-destructive, keeps audit trail)
                </Typography>
              </li>
              <li>
                <Typography variant="body2" sx={{ color: "#7c2d12", fontSize: "0.85rem", fontWeight: 500 }}>
                  Restore every smartphone stock unit (IMEI) in this bill back to <strong>Available</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body2" sx={{ color: "#7c2d12", fontSize: "0.85rem", fontWeight: 500 }}>
                  Record a timestamp and the reason for undoing
                </Typography>
              </li>
            </Box>
          </Box>

          {undoBillTarget && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Bill Summary:
              </Typography>
              <Box sx={{ mt: 0.75, p: 2, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>Customer:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>{undoBillTarget.customer}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>Date:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>{undoBillTarget.date}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>Items:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>{undoBillTarget.itemCount}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>Total:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#7c3aed" }}>{formatCurrency(undoBillTarget.total)}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="Reason for Undoing (recommended)"
            placeholder="e.g., Wrong customer, returned by customer, duplicate bill"
            value={undoReason}
            onChange={(e) => setUndoReason(e.target.value)}
            multiline
            rows={3}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff" },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Button
            onClick={() => setUndoBillTarget(null)}
            disabled={isUndoing}
            sx={{ textTransform: "none", fontWeight: 700, color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmUndoBill}
            disabled={isUndoing}
            startIcon={isUndoing ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <UndoIcon />}
            sx={{
              background: "linear-gradient(135deg, #f59e0b, #dc2626)",
              fontWeight: 800,
              textTransform: "none",
              px: 2.5,
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
              "&:hover": { background: "linear-gradient(135deg, #d97706, #b91c1c)" },
            }}
          >
            {isUndoing ? "Processing Undo..." : "Confirm Undo & Restore Stock"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GLOBAL TOAST NOTIFICATIONS */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{
            width: "100%",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* STANDALONE PRINT PORTAL — rendered via createPortal directly into document.body
          so that in print mode we can display: none everything else in the app without phantom height! */}
      {printingBill && typeof document !== "undefined" && createPortal(
        <div className="billing-print-portal">
          <InvoiceReceiptView
            bill={printingBill}
            hideControls
            forcedViewMode={printingViewMode}
          />
        </div>,
        document.body
      )}

      <PersistentCart />
    </Box>
  );
}
